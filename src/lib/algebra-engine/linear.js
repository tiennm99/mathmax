import { EPSILON_LEN } from '../geom-engine/vec.js';

/**
 * @typedef {Readonly<{a: number, b: number}>} Line  // y = a·x + b
 * @typedef {import('../geom-engine/vec.js').Vec2} Vec2
 */

/**
 * Slope-intercept line through two points. Returns `null` when the points
 * share an x-coordinate (vertical line — not representable as y = ax + b).
 * @param {Vec2} p1 @param {Vec2} p2 @returns {Line | null}
 */
export function lineFromPoints(p1, p2) {
  if (Math.abs(p2.x - p1.x) < EPSILON_LEN) return null;
  const a = (p2.y - p1.y) / (p2.x - p1.x);
  const b = p1.y - a * p1.x;
  return { a, b };
}

/**
 * Construct a line from slope `a` and intercept `b`.
 * @param {number} a @param {number} b @returns {Line}
 */
export function lineFromSlope(a, b) {
  return { a, b };
}

/**
 * Evaluate the line at `x`.
 * @param {Line} line @param {number} x @returns {number}
 */
export function yAt(line, x) {
  return line.a * x + line.b;
}

/**
 * Return the two endpoints of the line clipped to the x-range [xMin, xMax].
 * @param {Line} line @param {number} xMin @param {number} xMax
 * @returns {[Vec2, Vec2]}
 */
export function linePoints(line, xMin, xMax) {
  return [
    { x: xMin, y: yAt(line, xMin) },
    { x: xMax, y: yAt(line, xMax) },
  ];
}
