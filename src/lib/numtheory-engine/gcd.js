/**
 * @typedef {Readonly<{a: number, b: number, q: number, r: number}>} GcdStep
 */

/**
 * Greatest common divisor via Euclidean algorithm.
 * Negative inputs are taken as absolute values; gcd(0, 0) returns 0.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Least common multiple. Throws if both inputs are 0.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function lcm(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  if (a === 0 && b === 0) throw new Error('lcm(0, 0) is undefined');
  if (a === 0 || b === 0) return 0;
  return (a * b) / gcd(a, b);
}

/**
 * Trace of the Euclidean reduction for visualization.
 * Each row captures the pair before reduction plus quotient and remainder
 * such that `a = q*b + r`. Last row's `b` is the gcd.
 * For `b = 0` initial input, returns a single trivial row `{a, b:0, q:0, r:0}`.
 * @param {number} a
 * @param {number} b
 * @returns {GcdStep[]}
 */
export function gcdSteps(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  /** @type {GcdStep[]} */
  const steps = [];
  if (y === 0) {
    return [{ a: x, b: 0, q: 0, r: 0 }];
  }
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x - q * y;
    steps.push({ a: x, b: y, q, r });
    x = y;
    y = r;
  }
  return steps;
}
