import { describe, expect, it } from 'vitest';
import { vec } from './vec.js';
import { congruentSSS, sides, triangle } from './triangle.js';

describe('sides', () => {
  it('measures all three side lengths', () => {
    const t = triangle(vec(0, 0), vec(3, 0), vec(0, 4));
    const s = sides(t);
    expect(s.ab).toBe(3);
    expect(s.bc).toBe(5);
    expect(s.ca).toBe(4);
  });
});

describe('congruentSSS', () => {
  it('detects identical triangles', () => {
    const t = triangle(vec(0, 0), vec(3, 0), vec(0, 4));
    expect(congruentSSS(t, t)).toBe(true);
  });

  it('detects translated triangles as congruent', () => {
    const t1 = triangle(vec(0, 0), vec(3, 0), vec(0, 4));
    const t2 = triangle(vec(10, 10), vec(13, 10), vec(10, 14));
    expect(congruentSSS(t1, t2)).toBe(true);
  });

  it('rejects scaled triangles', () => {
    const t1 = triangle(vec(0, 0), vec(3, 0), vec(0, 4));
    const t2 = triangle(vec(0, 0), vec(6, 0), vec(0, 8));
    expect(congruentSSS(t1, t2)).toBe(false);
  });

  it('is position-strict (different vertex correspondence fails)', () => {
    const t1 = triangle(vec(0, 0), vec(3, 0), vec(0, 4));
    // Same shape, but vertex labels rotated.
    const t2 = triangle(vec(3, 0), vec(0, 4), vec(0, 0));
    expect(congruentSSS(t1, t2)).toBe(false);
  });
});
