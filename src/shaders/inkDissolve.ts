import { NOISE_CHUNK } from './noise'

export const INK_DISSOLVE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * Ink dissolve.
 *
 * The effect that makes this read as pigment rather than as a cross-fade is the
 * RIM: when a wet front advances through paper and the solvent evaporates at
 * the boundary, pigment is carried outward and left behind in a dark ring. So
 * the shader does not just threshold a noise field — it also lights a narrow
 * band centred on the advancing threshold and darkens it. Remove the rim and
 * the same shader instantly looks like a 1998 dissolve transition.
 *
 * Four more details carry the illusion:
 *   - the sampling coordinate is advected by a divergence-free curl field, so
 *     the front swirls the way ink does in water instead of creeping uniformly;
 *   - a paper-fibre map is mixed into the threshold field, so the front frays
 *     at fibre scale and catches on the grain;
 *   - flying white (飛白) — high-frequency noise punches dry-brush voids near
 *     the leading edge, where the brush is running out of ink;
 *   - granulation varies the tone behind the front, so the filled area is never
 *     a flat wash.
 */
export const INK_DISSOLVE_FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uMap;          // artwork; alpha channel is ink coverage
uniform sampler2D uFibre;        // paper fibre / grain, red channel
uniform float uHasMap;
uniform float uUseMapColor;      // 0 = tint with uInk, 1 = keep the artwork's own colour

uniform float uProgress;         // 0 = bare paper, 1 = fully inked
uniform float uTime;
uniform float uSeed;
uniform float uAspect;

uniform vec3  uInk;
uniform vec3  uRimColor;
uniform vec3  uPaper;
uniform float uOpaque;           // 1 = composite over uPaper, 0 = output straight alpha

uniform float uNoiseScale;
uniform float uFibreScale;
uniform float uFibreInfluence;
uniform float uEdgeSoftness;
uniform float uTurbulence;
uniform float uFlowSpeed;
uniform float uCurlScale;

uniform float uRimWidth;
uniform float uRimStrength;
uniform float uFlyingWhite;
uniform float uGranulation;
uniform float uCoverageBias;
uniform float uOpacity;

uniform vec2  uMapScale;         // artwork size in plane units (1,1 = fill frame)
uniform vec2  uMapOffset;        // artwork centre, in aspect-corrected plane space

uniform vec2  uPointer;          // -1..1 in aspect-corrected plane space
uniform float uPointerRadius;
uniform float uPointerInfluence;  // how far ahead the brush pulls the front

${NOISE_CHUNK}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);

  // Divergence-free advection. Small amplitude: this displaces where we SAMPLE
  // the threshold field, it does not move the artwork.
  vec2 flow = curl2(p * uCurlScale, uTime * uFlowSpeed + uSeed, 0.35) * uTurbulence;

  // Artwork lookup happens in composed space, so the glyph can sit where the
  // composition wants it while the ink physics still runs across the whole frame.
  vec2 mapUv = (p - uMapOffset) / max(uMapScale, vec2(1e-4)) + 0.5;
  mapUv += flow * 0.012;
  bool inMap = all(greaterThanEqual(mapUv, vec2(0.0))) && all(lessThanEqual(mapUv, vec2(1.0)));
  vec4 src = uHasMap > 0.5 ? (inMap ? texture2D(uMap, mapUv) : vec4(0.0)) : vec4(uInk, 1.0);
  float coverage = uHasMap > 0.5 ? src.a : 1.0;

  float fibre = texture2D(uFibre, uv * uFibreScale + flow * 0.01).r;

  // Threshold field. Low values ink first.
  float field = fbm(vec3(p * uNoiseScale + flow * 0.6, uTime * 0.02 + uSeed), 5, 2.0, 0.5);
  field = field * 0.5 + 0.5;
  field = mix(field, fibre, uFibreInfluence);

  // Heavily loaded strokes bleed before thin ones.
  field = clamp(field + (1.0 - coverage) * uCoverageBias, 0.0, 1.0);

  // The pointer is a loaded brush hovering over the sheet: it does not paint,
  // it wets. Paper near it accepts ink sooner, so the front bulges toward the
  // cursor and relaxes when it leaves. Falloff is smoothstep, not a hard disc,
  // or the bulge reads as a spotlight.
  float pointerD = distance(p, uPointer);
  float wet = uPointerInfluence * (1.0 - smoothstep(0.0, uPointerRadius, pointerD));

  // Overshoot both ends so progress 0 and 1 are genuinely empty and genuinely full.
  float front = mix(-0.25, 1.25, clamp(uProgress, 0.0, 1.0)) + wet;
  float w = max(uEdgeSoftness, 1e-4);

  float inked = 1.0 - smoothstep(front - w, front + w, field);
  float d = field - front;                       // >0 dry, <0 wet

  // --- the rim -------------------------------------------------------------
  // Sits just behind the front, inside the wet region, and fades out at the
  // extremes of progress so the effect starts and ends clean.
  float rimBand = exp(-pow((d + uRimWidth * 0.4) / max(uRimWidth, 1e-4), 2.0));
  // Not smoothstep(1.0, 0.88, x): GLSL leaves smoothstep undefined when
  // edge0 >= edge1, and it does genuinely differ between drivers.
  float rimLife = smoothstep(0.0, 0.08, uProgress) * (1.0 - smoothstep(0.88, 1.0, uProgress));
  float rim = rimBand * rimLife;

  // --- flying white --------------------------------------------------------
  float dry = fbm(vec3(p * uNoiseScale * 5.5, uSeed + 11.0), 3, 2.2, 0.55) * 0.5 + 0.5;
  float atEdge = 1.0 - smoothstep(0.0, uRimWidth * 3.0, abs(d));
  inked *= 1.0 - uFlyingWhite * smoothstep(0.52, 0.96, dry) * atEdge;

  // --- granulation ---------------------------------------------------------
  float gran = fbm(vec3(p * uNoiseScale * 2.6, uSeed + 31.0), 3, 2.0, 0.5) * 0.5 + 0.5;
  float tone = mix(1.0 - uGranulation * 0.4, 1.0 + uGranulation * 0.1, gran);

  vec3 base = mix(uInk, src.rgb, uUseMapColor);
  vec3 col = base * tone;
  col = mix(col, uRimColor, clamp(rim * uRimStrength, 0.0, 1.0));

  float alpha = clamp(inked, 0.0, 1.0) * coverage * uOpacity;

  if (uOpaque > 0.5) {
    gl_FragColor = vec4(mix(uPaper, col, alpha), 1.0);
  } else {
    gl_FragColor = vec4(col, alpha);
  }

  #include <colorspace_fragment>
}
`

export type InkDissolveUniformValues = {
  uProgress: number
  uTime: number
  uSeed: number
  uAspect: number
  uInk: string
  uRimColor: string
  uPaper: string
  uOpaque: number
  uNoiseScale: number
  uFibreScale: number
  uFibreInfluence: number
  uEdgeSoftness: number
  uTurbulence: number
  uFlowSpeed: number
  uCurlScale: number
  uRimWidth: number
  uRimStrength: number
  uFlyingWhite: number
  uGranulation: number
  uCoverageBias: number
  uOpacity: number
  uHasMap: number
  uUseMapColor: number
  uPointer: [number, number]
  uPointerRadius: number
  uPointerInfluence: number
  uMapScale: [number, number]
  uMapOffset: [number, number]
}

/** Tuned defaults. Every one of these was chosen by eye, not by theory. */
export const INK_DISSOLVE_DEFAULTS: InkDissolveUniformValues = {
  uHasMap: 0,
  uUseMapColor: 0,
  uProgress: 0,
  uTime: 0,
  uSeed: 0,
  uAspect: 1,
  // sRGB hex, converted to the linear working space by THREE.Color at upload.
  // Writing pre-linearised floats here is the classic way to get ink that
  // renders as a washed-out grey-green: the fragment shader's
  // colorspace_fragment pass converts linear -> sRGB on the way out, so a value
  // that was already sRGB gets gamma applied twice.
  uInk: '#1B2321',       // 濃墨
  uRimColor: '#0B0F0E',  // the tide line is the darkest ink on the sheet
  uPaper: '#F4F0E6',     // 留白
  uOpaque: 0,
  uNoiseScale: 2.1,
  uFibreScale: 3.0,
  uFibreInfluence: 0.22,
  uEdgeSoftness: 0.055,
  uTurbulence: 0.55,
  uFlowSpeed: 0.06,
  uCurlScale: 1.6,
  uRimWidth: 0.07,
  uRimStrength: 0.85,
  uFlyingWhite: 0.35,
  uGranulation: 0.3,
  uCoverageBias: 0.22,
  uOpacity: 1,
  uPointer: [-99, -99],
  uPointerRadius: 0.34,
  uPointerInfluence: 0.14,
  uMapScale: [1, 1],
  uMapOffset: [0, 0],
}
