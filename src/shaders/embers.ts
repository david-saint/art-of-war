import { NOISE_CHUNK } from './noise'

/**
 * Ember field.
 *
 * The entire simulation lives in the vertex shader. Each particle carries its
 * birth offset, lifetime, spawn position and a random seed as static
 * attributes, and its position at time t is a closed-form function of those —
 * so nothing is written back to the attribute buffer after upload and the CPU
 * cost per frame is a handful of uniforms. That is what makes tens of thousands
 * of embers affordable; a CPU-updated Float32Array of the same size would spend
 * the whole frame in memory bandwidth.
 *
 * Life is wrapped with fract(), so particles respawn forever without a pool, a
 * free list, or a single branch.
 *
 * Colour follows a cooling curve — white-hot core, gold, then cinnabar, then
 * out. The palette is doctrinal, not decorative: fire is the one place in this
 * project where vermilion means neither the seal nor blood but the bill that
 * comes with a tactic, and it is allowed to be beautiful for exactly as long as
 * it takes to burn out.
 */

export const EMBER_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uRise;          // buoyant velocity, world units per second
uniform vec3  uWind;          // constant advection
uniform float uTurbulence;
uniform float uSpread;
uniform float uIntensity;     // 0 = fire is out, 1 = full burn

attribute vec3  aOrigin;
attribute float aBirth;       // 0..1 phase offset into the shared cycle
attribute float aLife;        // seconds
attribute float aSeed;
attribute float aScale;

varying float vAge;           // 0..1
varying float vSeed;
varying float vAlpha;

${NOISE_CHUNK}

void main() {
  // Shared cycle, per-particle phase. fract() gives free respawn.
  float age = fract(uTime / aLife + aBirth);
  float t = age * aLife;

  vec3 p = aOrigin;

  // Buoyancy accelerates: hot gas gains speed as it rises and entrains air.
  p.y += uRise * t * (0.55 + 0.75 * age);

  // Horizontal spread widens with height — a plume, not a column.
  p.xz += vec2(
    snoise(vec3(aSeed * 13.1, t * 0.35, 0.0)),
    snoise(vec3(0.0, t * 0.31, aSeed * 7.7))
  ) * uSpread * age;

  // Turbulence from the curl field, so embers eddy instead of jittering.
  vec2 c = curl2(p.xz * 0.35 + aSeed, uTime * 0.2, 0.4);
  p.xz += c * uTurbulence * age;

  p += uWind * t;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Embers shrink as they cool and are consumed. The ceiling is deliberately
  // low: a spark is a POINT. The moment one grows past a dozen pixels it stops
  // being fire and becomes bokeh, which is the single failure mode that makes
  // every additive particle system look like a stock video overlay.
  float shrink = 1.0 - smoothstep(0.25, 1.0, age);
  gl_PointSize = clamp(uSize * aScale * shrink * (70.0 / max(-mv.z, 0.001)), 0.0, 13.0);

  // Fade in instantly, out early. Most of a spark's life is spent dim.
  vAlpha = smoothstep(0.0, 0.02, age) * (1.0 - smoothstep(0.28, 0.85, age)) * uIntensity * 0.7;
  vAge = age;
  vSeed = aSeed;
}
`

export const EMBER_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uSprite;
uniform vec3 uHot;      // core, just short of white
uniform vec3 uWarm;     // gold
uniform vec3 uCool;     // cinnabar
uniform vec3 uDead;     // the last visible red before it is only carbon
uniform float uTime;

varying float vAge;
varying float vSeed;
varying float vAlpha;

void main() {
  float mask = texture2D(uSprite, gl_PointCoord).r;
  if (mask < 0.01) discard;

  // Cooling curve, three ramps. A single mix from white to red passes through
  // pink, which is wrong for carbon. The white-hot band is deliberately narrow
  // — in a real fire only the newest sparks are near white, and widening it is
  // what turns a burn into a field of gold bokeh.
  vec3 col = mix(uHot, uWarm, smoothstep(0.0, 0.09, vAge));
  col = mix(col, uCool, smoothstep(0.08, 0.34, vAge));
  col = mix(col, uDead, smoothstep(0.3, 0.8, vAge));

  // Flicker: two incommensurable frequencies per particle, so no two embers
  // pulse together and the field never develops a visible beat.
  float flicker = 0.72
    + 0.20 * sin(uTime * 11.0 + vSeed * 42.0)
    + 0.12 * sin(uTime * 27.3 + vSeed * 19.0);

  gl_FragColor = vec4(col * flicker, mask * vAlpha);
}
`

export const SMOKE_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uRise;
uniform vec3  uWind;
uniform float uSpread;
uniform float uIntensity;

attribute vec3  aOrigin;
attribute float aBirth;
attribute float aLife;
attribute float aSeed;
attribute float aScale;

varying float vAge;
varying float vAlpha;
varying float vSeed;

${NOISE_CHUNK}

void main() {
  float age = fract(uTime / aLife + aBirth);
  float t = age * aLife;

  vec3 p = aOrigin;
  // Smoke decelerates as it cools and mixes — the inverse of the ember curve.
  p.y += uRise * t * (1.0 - 0.4 * age);
  vec2 c = curl2(p.xz * 0.22 + aSeed * 3.0, uTime * 0.08, 0.5);
  p.xz += c * uSpread * (0.3 + age);
  p += uWind * t * 1.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  // Smoke expands without limit; that expansion is most of the read.
  gl_PointSize = clamp(uSize * aScale * (0.4 + age * 2.6) * (90.0 / max(-mv.z, 0.001)), 0.0, 300.0);

  vAlpha = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.3, 1.0, age)) * uIntensity;
  vAge = age;
  vSeed = aSeed;
}
`

export const SMOKE_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uSprite;
uniform vec3 uSmoke;

varying float vAge;
varying float vAlpha;
varying float vSeed;

void main() {
  // The sprite is an ink wash bloom: dark pigment on white paper. As a DENSITY
  // map that is inverted — white paper means "no smoke here" — so it has to be
  // flipped. Sampling it straight is what turns every puff into an opaque
  // square and the plume into a visible grid.
  float mask = 1.0 - texture2D(uSprite, gl_PointCoord).r;

  // Trim the last of the paper tone, which would otherwise leave a faint
  // rectangular haze around every sprite.
  mask = smoothstep(0.06, 0.85, mask);
  if (mask < 0.004) discard;

  // Smoke thins as it disperses; fresh soot is the only place it is dense.
  float density = mix(0.9, 0.06, vAge);
  gl_FragColor = vec4(uSmoke, mask * vAlpha * density * 0.42);
}
`
