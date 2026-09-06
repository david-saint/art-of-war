/**
 * Ink-flow simulation for 虛實 — emptiness and fullness.
 *
 * Chapter 6 is the water chapter. Sun Tzu's argument is that an army should
 * have no more constant shape than water does: it runs away from height, it
 * runs toward the low ground, and it wins by arriving where the enemy is not.
 * So the chapter is not illustrated with water — it IS a fluid, and the reader
 * is shown the enemy's dispositions as a field the ink is about to find the
 * holes in.
 *
 * The simulation is a ping-pong pair of render targets running a shallow-water-
 * ish flux step:
 *
 *   D  density of ink at this cell        (R channel)
 *   V  a running record of peak flow      (G channel — the tide line)
 *   H  terrain height, sampled from a map
 *   S  sizing: the enemy's fullness, where ink cannot go
 *
 * Each step moves ink from a cell to each of its four neighbours in proportion
 * to the head difference (D + H), which is what makes it run downhill and pool
 * in basins rather than diffusing isotropically like a blur. Sizing gates the
 * outflow, so a fortified cell is not drawn differently — it is simply a place
 * the ink never reaches, which is exactly the perceptual exercise the chapter
 * is about. You cannot see 實 directly. You infer it from where the ink stops.
 */

export const FLOW_SIM_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uPrev;     // R = density, G = peak flow (tide line)
uniform sampler2D uHeight;   // terrain, R channel, 0 = valley floor
uniform sampler2D uSizing;   // resistance, R channel, 1 = ink cannot enter
uniform vec2  uTexel;
uniform float uDt;
uniform float uFlow;         // global conductivity
uniform float uEvap;
uniform vec4  uSource;       // xy position, z radius, w rate
uniform vec2  uPointer;      // second source, follows the reader's cursor
uniform float uPointerRate;
uniform float uHeightScale;

varying vec2 vUv;

float depth(vec2 uv) { return texture2D(uPrev, uv).r; }
float ground(vec2 uv) { return texture2D(uHeight, uv).r * uHeightScale; }
float head(vec2 uv) { return depth(uv) + ground(uv); }

/**
 * Signed transfer between this cell and one neighbour.
 *
 * The scheme has to be SYMMETRIC — whatever this cell computes as leaving
 * toward N, cell N must compute as arriving from here, bit for bit — or the
 * field silently destroys or manufactures ink. The first version of this
 * shader clamped each of the four outflows independently against the cell's
 * own depth, which lets a cell send up to 4x what it holds; ink evaporated
 * faster than the source could pour and the field rendered empty.
 *
 * Symmetry comes from choosing the limiting depth by which side is UPSTREAM,
 * a quantity both cells agree on because it depends only on the sign of the
 * head difference.
 */
float transfer(vec2 uvN, float hC, float dC) {
  float hN = head(uvN);
  float dh = hC - hN;
  float upstream = dh > 0.0 ? dC : depth(uvN);
  // The limiter is scaled before clamping. Using the raw depth makes the
  // transfer quadratic in density, so a thin leading edge barely moves and the
  // front creeps a texel a second — correct, and far too slow to read as
  // water. Scaling makes it effectively linear above a shallow threshold while
  // still going to zero on dry ground, which is what keeps it stable.
  return dh * min(upstream * 5.0, 1.0);
}

void main() {
  vec4 prev = texture2D(uPrev, vUv);
  float d = prev.r;
  float peak = prev.g;

  float s = texture2D(uSizing, vUv).r;
  float open = 1.0 - clamp(s, 0.0, 1.0);

  float hC = head(vUv);
  vec2 o = uTexel;

  float outward =
      transfer(vUv - vec2(o.x, 0.0), hC, d)
    + transfer(vUv + vec2(o.x, 0.0), hC, d)
    + transfer(vUv - vec2(0.0, o.y), hC, d)
    + transfer(vUv + vec2(0.0, o.y), hC, d);

  // Courant-style cap: a cell may never move more than a quarter of what it
  // holds in one step, whatever the head gradient says. Without it a steep
  // slope makes the field oscillate and then blow up.
  float rate = clamp(uFlow * uDt, 0.0, 0.18) * open;
  // No asymmetric clamp here. Clipping delta against this cell's own depth
  // breaks the symmetry the transfer function was built for, and the mass error
  // it introduces shows up as a two-cell checkerboard across the wet region —
  // the classic odd-even decoupling of an explicit scheme. Let the value go
  // slightly negative and floor it once, at the end.
  float next = max(0.0, d - outward * rate);

  // Sources.
  float dist = distance(vUv, uSource.xy);
  next += (1.0 - smoothstep(0.0, max(uSource.z, 1e-4), dist)) * uSource.w * uDt;

  if (uPointerRate > 0.0 && uPointer.x > -1.0) {
    next += (1.0 - smoothstep(0.0, 0.06, distance(vUv, uPointer))) * uPointerRate * uDt;
  }

  next = max(0.0, next - uEvap * uDt);
  next = clamp(next, 0.0, 4.0);

  // Ink Law: density only increases where it has ever been. The peak channel
  // holds that record and is what the tide lines are drawn from — a campaign
  // map is the archaeology of its stalled fronts.
  peak = max(peak, next);

  gl_FragColor = vec4(next, peak, 0.0, 1.0);
}
`

export const FLOW_RENDER_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uField;    // R = live density, G = peak
uniform sampler2D uHeight;
uniform sampler2D uSizing;
uniform sampler2D uPaper;
uniform vec2  uTexel;
uniform vec3  uInk;
uniform vec3  uTide;
uniform vec3  uPaperTint;
uniform vec3  uJade;
uniform float uReveal;       // 0..1 — how much of the enemy's fullness is shown
uniform float uTime;
uniform float uDebug;        // ?field=1 — raw channels, for tuning the sim

varying vec2 vUv;

void main() {
  vec2 field = texture2D(uField, vUv).rg;
  float d = field.x;
  float peak = field.y;

  float paper = texture2D(uPaper, vUv * 2.3).r;
  vec3 base = uPaperTint * mix(0.94, 1.03, paper);

  // Terrain, drawn as the faintest possible dry ink so the ground reads without
  // competing with the water.
  float h = texture2D(uHeight, vUv).r;
  float slope = length(vec2(
    texture2D(uHeight, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uHeight, vUv - vec2(uTexel.x, 0.0)).r,
    texture2D(uHeight, vUv + vec2(0.0, uTexel.y)).r - texture2D(uHeight, vUv - vec2(0.0, uTexel.y)).r
  ));
  base = mix(base, base * 0.86, smoothstep(0.0, 0.06, slope) * 0.55);

  // Wet ink.
  float wet = smoothstep(0.0025, 0.09, d);
  vec3 col = mix(base, uInk, wet * 0.92);

  // Tide line: where ink once reached and no longer is. This is the mark the
  // page keeps, and it is drawn brighter and harder than the wet ink because a
  // dried perimeter is the sharpest thing on a real sheet.
  float dried = smoothstep(0.004, 0.05, peak) * (1.0 - smoothstep(0.0, 0.02, d));
  col = mix(col, uTide, dried * 0.62);

  // The enemy's fullness. Only shown as the ink FAILS to enter it, plus a jade
  // hairline once the reader has earned the reveal — jade is cognition, so it
  // is the only colour allowed to describe something known rather than something
  // present.
  float s = texture2D(uSizing, vUv).r;
  float edge = length(vec2(
    texture2D(uSizing, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uSizing, vUv - vec2(uTexel.x, 0.0)).r,
    texture2D(uSizing, vUv + vec2(0.0, uTexel.y)).r - texture2D(uSizing, vUv - vec2(0.0, uTexel.y)).r
  ));
  col = mix(col, uJade, smoothstep(0.02, 0.25, edge) * uReveal * 0.7);

  if (uDebug > 0.5) {
    // R live density, G peak, B the fullness map. Turned on with ?field=1.
    gl_FragColor = vec4(clamp(d * 6.0, 0.0, 1.0), clamp(peak * 6.0, 0.0, 1.0), s * 0.5, 1.0);
    return;
  }

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`
