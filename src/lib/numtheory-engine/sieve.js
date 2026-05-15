/**
 * Sieve of Eratosthenes for integers in [2, n].
 * Returns the list of primes and a set of composite values for fast lookup.
 * For `n < 2`, returns empty results.
 * @param {number} n
 * @returns {{ primes: number[], composite: Set<number> }}
 */
export function sieveUpTo(n) {
  const upper = Math.trunc(n);
  if (upper < 2) return { primes: [], composite: new Set() };
  const marks = new Uint8Array(upper + 1); // 0 = prime, 1 = composite
  marks[0] = 1;
  marks[1] = 1;
  for (let i = 2; i * i <= upper; i++) {
    if (marks[i] === 0) {
      for (let k = i * i; k <= upper; k += i) marks[k] = 1;
    }
  }
  /** @type {number[]} */
  const primes = [];
  /** @type {Set<number>} */
  const composite = new Set();
  for (let k = 2; k <= upper; k++) {
    if (marks[k] === 0) primes.push(k);
    else composite.add(k);
  }
  return { primes, composite };
}

/**
 * Multiples of `p` in `[2*p, n]`, excluding `p` itself.
 * Useful for the "cross out multiples of this prime" interaction.
 * @param {number} p @param {number} n @returns {number[]}
 */
export function multiplesOf(p, n) {
  const prime = Math.trunc(p);
  const upper = Math.trunc(n);
  if (prime < 2 || upper < 2 * prime) return [];
  /** @type {number[]} */
  const out = [];
  for (let k = 2 * prime; k <= upper; k += prime) out.push(k);
  return out;
}

/**
 * Primality check via trial division up to √k.
 * @param {number} k @returns {boolean}
 */
export function isPrime(k) {
  const n = Math.trunc(k);
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(n));
  for (let d = 3; d <= limit; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}
