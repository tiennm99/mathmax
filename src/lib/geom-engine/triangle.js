import { dist, EPSILON_LEN } from './vec.js';

/**
 * @typedef {import('./vec.js').Vec2} Vec2
 * @typedef {Readonly<{a: Vec2, b: Vec2, c: Vec2}>} Triangle
 * @typedef {Readonly<{ab: number, bc: number, ca: number}>} SideLengths
 */

/** @param {Vec2} a @param {Vec2} b @param {Vec2} c @returns {Triangle} */
export function triangle(a, b, c) {
  return { a, b, c };
}

/** @param {Triangle} t @returns {SideLengths} */
export function sides(t) {
  return {
    ab: dist(t.a, t.b),
    bc: dist(t.b, t.c),
    ca: dist(t.c, t.a),
  };
}

/**
 * Position-strict SSS: corresponding sides must match (AB↔A'B', BC↔B'C',
 * CA↔C'A'). Matches the colored-tick correspondence shown to the student.
 * @param {Triangle} t1 @param {Triangle} t2 @param {number} [eps]
 */
export function congruentSSS(t1, t2, eps = EPSILON_LEN) {
  const s1 = sides(t1);
  const s2 = sides(t2);
  return (
    Math.abs(s1.ab - s2.ab) < eps &&
    Math.abs(s1.bc - s2.bc) < eps &&
    Math.abs(s1.ca - s2.ca) < eps
  );
}
