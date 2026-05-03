import { describe, it, expect } from 'vitest';
import { gcd, lcm, gcdSteps } from './gcd.js';

describe('gcd', () => {
  it('computes basic gcd', () => {
    expect(gcd(48, 18)).toBe(6);
    expect(gcd(18, 48)).toBe(6); // symmetric
    expect(gcd(100, 75)).toBe(25);
  });

  it('handles coprime', () => {
    expect(gcd(13, 17)).toBe(1);
    expect(gcd(7, 5)).toBe(1);
  });

  it('handles zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
    expect(gcd(0, 0)).toBe(0);
  });

  it('handles negatives via absolute value', () => {
    expect(gcd(-48, 18)).toBe(6);
    expect(gcd(48, -18)).toBe(6);
    expect(gcd(-12, -8)).toBe(4);
  });

  it('truncates non-integer inputs', () => {
    expect(gcd(48.7, 18.2)).toBe(6);
  });
});

describe('lcm', () => {
  it('computes basic lcm', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(48, 18)).toBe(144);
  });

  it('handles one zero as 0', () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
  });

  it('throws on lcm(0, 0)', () => {
    expect(() => lcm(0, 0)).toThrow();
  });
});

describe('gcdSteps', () => {
  it('produces canonical (48, 18) trace', () => {
    const steps = gcdSteps(48, 18);
    expect(steps).toEqual([
      { a: 48, b: 18, q: 2, r: 12 },
      { a: 18, b: 12, q: 1, r: 6 },
      { a: 12, b: 6, q: 2, r: 0 },
    ]);
  });

  it('last row b equals gcd', () => {
    const steps = gcdSteps(100, 75);
    expect(steps[steps.length - 1].b).toBe(gcd(100, 75));
  });

  it('handles b=0 initial', () => {
    expect(gcdSteps(7, 0)).toEqual([{ a: 7, b: 0, q: 0, r: 0 }]);
  });

  it('handles a < b (first row swaps via quotient=0)', () => {
    const steps = gcdSteps(18, 48);
    expect(steps[0]).toEqual({ a: 18, b: 48, q: 0, r: 18 });
    expect(steps[steps.length - 1].b).toBe(6);
  });
});
