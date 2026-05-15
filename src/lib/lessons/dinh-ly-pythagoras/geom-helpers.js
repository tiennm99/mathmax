/**
 * Geometry helpers for the Pythagoras dissection-shear lesson.
 * All coordinates are in SVG viewBox units (0 0 400 400).
 *
 * Triangle layout (legs axis-aligned):
 *   A  — top apex,    x = R.x,  y = fixed top
 *   R  — right-angle vertex, draggable
 *   H  — horizontal foot, y = R.y, x = fixed right
 *
 * @typedef {{ x: number; y: number }} Pt
 * @typedef {Pt[]} Poly
 */

/**
 * Build square-a polygon (on vertical leg AR, extends LEFT from the leg).
 * Vertices in order: A, R, bottom-left, top-left.
 * @param {Pt} A @param {Pt} R @returns {Poly}
 */
export function squareA(A, R) {
  const a = R.y - A.y; // leg length
  return [A, R, { x: R.x - a, y: R.y }, { x: R.x - a, y: A.y }];
}

/**
 * Build square-b polygon (on horizontal leg RH, extends DOWN from the leg).
 * Vertices: R, H, bottom-right, bottom-left.
 * @param {Pt} R @param {Pt} H @returns {Poly}
 */
export function squareB(R, H) {
  const b = H.x - R.x; // leg length
  return [R, H, { x: H.x, y: R.y + b }, { x: R.x, y: R.y + b }];
}

/**
 * Build square-c polygon (on hypotenuse AH, extends AWAY from triangle).
 * The outward normal direction from AH (away from R) is (a/c, -b/c) scaled by c.
 * Vertices: A, H, H+normal, A+normal.
 * @param {Pt} A @param {Pt} H @param {number} a @param {number} b @param {number} c
 * @returns {Poly}
 */
export function squareC(A, H, a, b, c) {
  // Outward normal unit vector (rotated 90° clockwise from AH direction):
  // AH direction = (b/c, a/c)  →  normal = (a/c, -b/c)
  const nx = a; // not yet divided by c; we scale by c below so net offset = (a, -b)
  const ny = -b;
  return [
    A,
    H,
    { x: H.x + nx, y: H.y + ny },
    { x: A.x + nx, y: A.y + ny },
  ];
}

/**
 * Compute the foot of the altitude from R onto hypotenuse AH.
 * F = A + t*(H-A)  where t = dot(R-A, H-A) / |H-A|²
 * For axis-aligned legs (a vertical, b horizontal):
 *   t = a² / c²
 * @param {Pt} A @param {Pt} H @param {number} a @param {number} c @returns {Pt}
 */
export function altitudeFoot(A, H, a, c) {
  const t = (a * a) / (c * c);
  return { x: A.x + t * (H.x - A.x), y: A.y + t * (H.y - A.y) };
}

/**
 * Target polygon for shear-a animation: the "a-rectangle" portion of square-c.
 * This is the rectangle bounded by A, F (altitude foot), and the corresponding
 * two points on the far edge of square-c. Area = a² = a-side × AF.
 * @param {Pt} A @param {Pt} F @param {number} a @param {number} b @param {number} c
 * @returns {Poly}
 */
export function shearATarget(A, F, a, b, c) {
  const nx = a;
  const ny = -b;
  return [
    A,
    F,
    { x: F.x + nx, y: F.y + ny },
    { x: A.x + nx, y: A.y + ny },
  ];
}

/**
 * Target polygon for shear-b animation: the "b-rectangle" portion of square-c.
 * Bounded by F, H, and the far edge of square-c. Area = b².
 * @param {Pt} F @param {Pt} H @param {number} a @param {number} b @param {number} c
 * @returns {Poly}
 */
export function shearBTarget(F, H, a, b, c) {
  const nx = a;
  const ny = -b;
  return [
    F,
    H,
    { x: H.x + nx, y: H.y + ny },
    { x: F.x + nx, y: F.y + ny },
  ];
}

/**
 * Linearly interpolate between two polygons of equal length.
 * Returns a new polygon with each vertex lerped.
 * @param {Poly} from @param {Poly} to @param {number} t — 0..1
 * @returns {Poly}
 */
export function lerpPoly(from, to, t) {
  return from.map((p, i) => ({
    x: p.x + (to[i].x - p.x) * t,
    y: p.y + (to[i].y - p.y) * t,
  }));
}

/**
 * Convert a Poly to an SVG points attribute string.
 * @param {Poly} pts @returns {string}
 */
export function polyPoints(pts) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}
