/**
 * The audio engine.
 *
 * Three decisions worth stating.
 *
 * 1. Beds are decoded into AudioBuffers and looped with AudioBufferSourceNode,
 *    not streamed through <audio>. A MediaElementSource cannot loop gaplessly —
 *    there is always a few-millisecond seam at the wrap, and on a three-minute
 *    ambient bed a reader hears that seam every three minutes for forty
 *    minutes. The cost is holding the decoded buffer in memory, which is why
 *    only a handful of stems are ever resident: a three-minute stereo bed
 *    decodes to sixty megabytes of PCM, and thirteen chapters' worth of them
 *    left in memory is what makes a phone reload the tab at chapter nine.
 *
 * 2. Transition hits are SYNTHESISED, not sampled. A sub-bass impact is a sine
 *    sweep and an envelope; shipping it as a file would cost 40KB to say
 *    something the oscillator says exactly. It also means the hit can be tuned
 *    against the bed at runtime instead of at bounce time.
 *
 * 3. Nothing starts without a gesture. The enter gate exists partly for this.
 *    An engine that tries to autoplay and gets refused leaves a silent site
 *    with no way to recover, so `unlock()` is explicit and idempotent.
 */

export type StemId = string

type Layer = {
  gain: GainNode
  source: AudioBufferSourceNode | null
  id: StemId | null
}

const FADE = { bed: 3.2, texture: 2.4, narration: 0.35 }

/** Decoded stems kept in memory beyond the ones currently playing. */
const MAX_RESIDENT = 4

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private duck: GainNode | null = null
  /** Insertion order is recency: a stem is re-inserted whenever it is used. */
  private buffers = new Map<StemId, AudioBuffer>()
  private pending = new Map<StemId, Promise<AudioBuffer | null>>()
  /** Encoded bytes fetched ahead of a context existing, consumed by `load`. */
  private bytes = new Map<StemId, Promise<ArrayBuffer | null>>()
  private layers: Record<'bed' | 'texture', Layer> = {
    bed: { gain: null as unknown as GainNode, source: null, id: null },
    texture: { gain: null as unknown as GainNode, source: null, id: null },
  }
  private narrationGain: GainNode | null = null
  private currentNarration: AudioBufferSourceNode | null = null
  private narrationId: StemId | null = null
  private format: '.ogg' | '.m4a' | null = null

  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running'
  }

  /** Must be called from inside a user gesture handler. Safe to call repeatedly. */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()

      this.master = this.ctx.createGain()
      this.master.gain.value = 0.7
      this.master.connect(this.ctx.destination)

      // Everything except narration passes through the duck, so a line of
      // narration lowers the world rather than fighting it.
      this.duck = this.ctx.createGain()
      this.duck.gain.value = 1
      this.duck.connect(this.master)

      for (const key of ['bed', 'texture'] as const) {
        const g = this.ctx.createGain()
        g.gain.value = 0
        g.connect(this.duck)
        this.layers[key] = { gain: g, source: null, id: null }
      }

      this.narrationGain = this.ctx.createGain()
      this.narrationGain.gain.value = 1
      this.narrationGain.connect(this.master)
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  private get ext(): '.ogg' | '.m4a' {
    if (!this.format) {
      const probe = document.createElement('audio')
      // Safari reports "maybe" for opus-in-ogg in some versions but cannot decode
      // it, so require a definite yes before choosing it.
      this.format = probe.canPlayType('audio/ogg; codecs=opus') === 'probably' ? '.ogg' : '.m4a'
    }
    return this.format
  }

  private fetchBytes(id: StemId): Promise<ArrayBuffer | null> {
    return fetch(`/assets/generated/audio/${id}${this.ext}`)
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null)
  }

  /**
   * Fetches a stem's bytes without needing a context, so the download can start
   * before the gesture that unlocks audio. Decoding still waits for the gesture.
   */
  prefetch(ids: StemId[]): void {
    for (const id of ids) {
      if (this.buffers.has(id) || this.pending.has(id) || this.bytes.has(id)) continue
      this.bytes.set(id, this.fetchBytes(id))
    }
  }

  /** Marks a stem as recently used, so it survives the next trim. */
  private touch(id: StemId): void {
    const buffer = this.buffers.get(id)
    if (!buffer) return
    this.buffers.delete(id)
    this.buffers.set(id, buffer)
  }

  /** Releases decoded stems that are neither playing nor recently used. */
  private trim(): void {
    const inUse = new Set<StemId | null>([this.layers.bed.id, this.layers.texture.id, this.narrationId])
    for (const id of this.buffers.keys()) {
      if (this.buffers.size <= MAX_RESIDENT) return
      if (!inUse.has(id)) this.buffers.delete(id)
    }
  }

  setVolume(v: number): void {
    if (!this.ctx || !this.master) return
    this.master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx.currentTime, 0.05)
  }

  async load(id: StemId): Promise<AudioBuffer | null> {
    if (!this.ctx) return null
    const cached = this.buffers.get(id)
    if (cached) {
      this.touch(id)
      return cached
    }
    const inFlight = this.pending.get(id)
    if (inFlight) return inFlight

    const task = (async () => {
      try {
        const bytes = await (this.bytes.get(id) ?? this.fetchBytes(id))
        this.bytes.delete(id)
        if (!bytes) throw new Error('unavailable')
        const buffer = await this.ctx!.decodeAudioData(bytes)
        this.buffers.set(id, buffer)
        this.trim()
        return buffer
      } catch {
        // A missing or undecodable stem must never take the page down. The
        // site is designed to be readable in silence.
        return null
      } finally {
        this.pending.delete(id)
      }
    })()
    this.pending.set(id, task)
    return task
  }

  /** Crossfades a looping layer to a new stem. Passing null fades the layer out. */
  async play(layerKey: 'bed' | 'texture', id: StemId | null, targetGain = 0.6): Promise<void> {
    if (!this.ctx) return
    const layer = this.layers[layerKey]
    if (layer.id === id) return

    const fade = FADE[layerKey]
    const now = this.ctx.currentTime

    const old = layer.source
    if (old) {
      const oldGain = layer.gain
      // Ramp the shared layer gain down, then start the new source on a fresh
      // node. Two sources briefly overlap; the old one stops itself.
      oldGain.gain.cancelScheduledValues(now)
      oldGain.gain.setValueAtTime(oldGain.gain.value, now)
      oldGain.gain.linearRampToValueAtTime(0, now + fade)
      old.stop(now + fade + 0.1)
      layer.source = null
    }

    layer.id = id
    if (!id) return

    const buffer = await this.load(id)
    if (!buffer || !this.ctx || layer.id !== id) return

    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    src.connect(layer.gain)
    const start = this.ctx.currentTime + (old ? fade * 0.55 : 0)
    src.start(start)
    layer.source = src

    layer.gain.gain.cancelScheduledValues(start)
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, start)
    layer.gain.gain.linearRampToValueAtTime(targetGain, start + fade)
  }

  /** Plays a one-shot narration line, ducking everything else beneath it. */
  async say(id: StemId, { duckTo = 0.28 } = {}): Promise<void> {
    if (!this.ctx || !this.narrationGain || !this.duck) return
    const buffer = await this.load(id)
    if (!buffer || !this.ctx) return

    this.currentNarration?.stop()
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    src.connect(this.narrationGain)
    const now = this.ctx.currentTime
    src.start(now)
    this.currentNarration = src
    this.narrationId = id

    const d = this.duck.gain
    d.cancelScheduledValues(now)
    d.setValueAtTime(d.value, now)
    d.linearRampToValueAtTime(duckTo, now + FADE.narration)
    d.setValueAtTime(duckTo, now + buffer.duration - 0.2)
    d.linearRampToValueAtTime(1, now + buffer.duration + 0.8)

    src.onended = () => {
      if (this.currentNarration === src) {
        this.currentNarration = null
        this.narrationId = null
      }
    }
  }

  /**
   * The chapter-transition impact. A sine falling from 62Hz to 26Hz over 1.4s
   * under a fast noise transient — the transient gives the ear an attack to
   * latch onto, the sine gives the chest the weight. Without the transient a
   * pure sub is inaudible on a laptop speaker; without the sub it is a click.
   */
  hit({ gain = 0.9, pitch = 62 } = {}): void {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const now = ctx.currentTime

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(pitch, now)
    sub.frequency.exponentialRampToValueAtTime(26, now + 1.4)

    const subGain = ctx.createGain()
    subGain.gain.setValueAtTime(0.0001, now)
    subGain.gain.exponentialRampToValueAtTime(gain, now + 0.012)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9)

    sub.connect(subGain).connect(this.master)
    sub.start(now)
    sub.stop(now + 2)

    // Skin transient: a short burst of noise through a bandpass, which is what
    // a large drumhead actually contributes above the fundamental.
    const noise = ctx.createBufferSource()
    const len = Math.floor(ctx.sampleRate * 0.22)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let seed = 1337
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      data[i] = (seed / 0x3fffffff - 1) * (1 - i / len) ** 3
    }
    noise.buffer = buf

    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 190
    band.Q.value = 0.8

    const noiseGain = ctx.createGain()
    noiseGain.gain.value = gain * 0.5

    noise.connect(band).connect(noiseGain).connect(this.master)
    noise.start(now)
  }

  /**
   * The seal press. The single most important UI sound in the project: a dry,
   * short, final wooden knock with no tail. Anything with reverb reads as a
   * notification.
   */
  seal({ gain = 0.5 } = {}): void {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const now = ctx.currentTime

    const body = ctx.createOscillator()
    body.type = 'triangle'
    body.frequency.setValueAtTime(320, now)
    body.frequency.exponentialRampToValueAtTime(120, now + 0.09)

    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1400

    body.connect(lp).connect(g).connect(this.master)
    body.start(now)
    body.stop(now + 0.2)
  }

  suspend(): void {
    void this.ctx?.suspend()
  }
  resume(): void {
    void this.ctx?.resume()
  }

  dispose(): void {
    for (const key of ['bed', 'texture'] as const) this.layers[key].source?.stop()
    this.currentNarration?.stop()
    void this.ctx?.close()
    this.ctx = null
    this.buffers.clear()
    this.bytes.clear()
  }
}

let engine: AudioEngine | null = null
export function getAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine()
  return engine
}
