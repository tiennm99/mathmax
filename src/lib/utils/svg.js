import { vec } from '$lib/geom-engine/vec.js';

/**
 * Convert client (mouse/touch) coordinates to the SVG's viewBox space.
 * @param {SVGSVGElement} svg
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} viewW
 * @param {number} viewH
 * @returns {import('$lib/geom-engine/vec.js').Vec2}
 */
export function clientToSvg(svg, clientX, clientY, viewW, viewH) {
  const r = svg.getBoundingClientRect();
  return vec(((clientX - r.left) / r.width) * viewW, ((clientY - r.top) / r.height) * viewH);
}

/**
 * Clamp a point inside the viewBox with optional padding from edges.
 * @param {import('$lib/geom-engine/vec.js').Vec2} v
 * @param {number} viewW @param {number} viewH @param {number} [pad]
 * @returns {import('$lib/geom-engine/vec.js').Vec2}
 */
export function clampToViewBox(v, viewW, viewH, pad = 16) {
  return vec(
    Math.max(pad, Math.min(viewW - pad, v.x)),
    Math.max(pad, Math.min(viewH - pad, v.y)),
  );
}
