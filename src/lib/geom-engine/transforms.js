import { EPSILON_LEN } from './vec.js';

/**
 * Row-major 3x3 affine-transform matrix stored as a length-9 array:
 *   [a b c | d e f | 0 0 1]   applied to homogeneous (x, y, 1).
 * @typedef {readonly number[]} Mat3
 * @typedef {import('./vec.js').Vec2} Vec2
 */

/** @type {Mat3} */
const IDENTITY = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);

/**
 * Translate by (dx, dy).
 * @param {number} dx @param {number} dy @returns {Mat3}
 */
export function translate(dx, dy) {
  return [1, 0, dx, 0, 1, dy, 0, 0, 1];
}

/**
 * Rotate by `theta` radians, optionally around `center` (defaults to origin).
 * @param {number} theta @param {Vec2} [center] @returns {Mat3}
 */
export function rotate(theta, center) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  if (!center) return [c, -s, 0, s, c, 0, 0, 0, 1];
  // Apply order: translate(-c) → rotate-origin → translate(+c).
  return compose(translate(-center.x, -center.y), [c, -s, 0, s, c, 0, 0, 0, 1], translate(center.x, center.y));
}

/**
 * Shear: x' = x + kx·y, y' = y + ky·x.
 * @param {number} kx @param {number} ky @returns {Mat3}
 */
export function shear(kx, ky) {
  return [1, kx, 0, ky, 1, 0, 0, 0, 1];
}

/**
 * Left-to-right composition: compose(A, B, C) applies A then B then C
 * (i.e. returns C · B · A in matrix multiply notation, so applying it
 * to a point p means C(B(A(p)))).
 * Zero args returns identity.
 * @param {...Mat3} matrices @returns {Mat3}
 */
export function compose(...matrices) {
  if (matrices.length === 0) return IDENTITY.slice();
  return matrices.reduce((acc, m) => multiply(m, acc));
}

/**
 * Apply transform `m` to point `p`.
 * @param {Mat3} m @param {Vec2} p @returns {Vec2}
 */
export function applyToPoint(m, p) {
  return {
    x: m[0] * p.x + m[1] * p.y + m[2],
    y: m[3] * p.x + m[4] * p.y + m[5],
  };
}

/**
 * Apply transform `m` to every point in `points`. Returns a new array.
 * @param {Mat3} m @param {readonly Vec2[]} points @returns {Vec2[]}
 */
export function applyToPolygon(m, points) {
  return points.map((p) => applyToPoint(m, p));
}

/**
 * Approximate matrix equality (per-element, within EPSILON_LEN by default).
 * @param {Mat3} a @param {Mat3} b @param {number} [eps]
 */
export function approxEqualMat(a, b, eps = EPSILON_LEN) {
  for (let i = 0; i < 9; i++) {
    if (Math.abs(a[i] - b[i]) > eps) return false;
  }
  return true;
}

/**
 * 3x3 matrix multiply: returns A · B.
 * @param {Mat3} a @param {Mat3} b @returns {Mat3}
 */
function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}
