import { describe, it, expect } from 'vitest';
import { lineFromPoints, lineFromSlope, yAt, linePoints } from './linear.js';

describe('lineFromPoints', () => {
  it('two distinct-x points yield slope+intercept', () => {
    expect(lineFromPoints({ x: 0, y: 1 }, { x: 1, y: 3 })).toEqual({ a: 2, b: 1 });
  });

  it('vertical (same x) returns null', () => {
    expect(lineFromPoints({ x: 2, y: 5 }, { x: 2, y: 7 })).toBeNull();
  });

  it('round-trip: yAt recovers original y at p1.x and p2.x', () => {
    const p1 = { x: -3, y: 4 };
    const p2 = { x: 5, y: -2 };
    const line = lineFromPoints(p1, p2);
    if (!line) throw new Error('unexpected null');
    expect(yAt(line, p1.x)).toBeCloseTo(p1.y);
    expect(yAt(line, p2.x)).toBeCloseTo(p2.y);
  });
});

describe('yAt', () => {
  it('evaluates y = 2x + 1 at x = 3 → 7', () => {
    expect(yAt({ a: 2, b: 1 }, 3)).toBe(7);
  });
});

describe('linePoints', () => {
  it('y = x clipped to [-5, 5] yields the two diagonal endpoints', () => {
    expect(linePoints({ a: 1, b: 0 }, -5, 5)).toEqual([
      { x: -5, y: -5 },
      { x: 5, y: 5 },
    ]);
  });
});

describe('lineFromSlope', () => {
  it('horizontal line y = 4', () => {
    expect(lineFromSlope(0, 4)).toEqual({ a: 0, b: 4 });
  });
});
