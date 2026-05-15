import { describe, it, expect } from 'vitest';
import { sieveUpTo, multiplesOf, isPrime } from './sieve.js';

describe('sieveUpTo', () => {
  it('returns empty for n < 2', () => {
    expect(sieveUpTo(1)).toEqual({ primes: [], composite: new Set() });
    expect(sieveUpTo(0)).toEqual({ primes: [], composite: new Set() });
    expect(sieveUpTo(-5)).toEqual({ primes: [], composite: new Set() });
  });

  it('returns [2] for n = 2', () => {
    const { primes } = sieveUpTo(2);
    expect(primes).toEqual([2]);
  });

  it('returns [2,3,5,7] for n = 10', () => {
    const { primes, composite } = sieveUpTo(10);
    expect(primes).toEqual([2, 3, 5, 7]);
    expect(composite.has(4)).toBe(true);
    expect(composite.has(9)).toBe(true);
  });

  it('returns 25 primes for n = 100 — includes 97, excludes 91', () => {
    const { primes, composite } = sieveUpTo(100);
    expect(primes).toHaveLength(25);
    expect(primes.at(-1)).toBe(97);
    expect(composite.has(91)).toBe(true); // 7 · 13
    expect(composite.has(97)).toBe(false);
  });
});

describe('multiplesOf', () => {
  it('multiplesOf(2, 10) excludes 2 itself', () => {
    expect(multiplesOf(2, 10)).toEqual([4, 6, 8, 10]);
  });

  it('multiplesOf(7, 100) starts at 14, ends at 98', () => {
    const m = multiplesOf(7, 100);
    expect(m[0]).toBe(14);
    expect(m.at(-1)).toBe(98);
  });

  it('returns [] for p < 2 or n < 2*p', () => {
    expect(multiplesOf(1, 100)).toEqual([]);
    expect(multiplesOf(50, 99)).toEqual([]);
  });
});

describe('isPrime', () => {
  it('false for k < 2', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-7)).toBe(false);
  });

  it('true for 2', () => {
    expect(isPrime(2)).toBe(true);
  });

  it('rejects 91 (= 7·13)', () => {
    expect(isPrime(91)).toBe(false);
  });
});
