import { describe, expect, it } from 'vitest';
import { vec } from './vec.js';
import { tickPositions } from './ticks.js';

describe('tickPositions', () => {
  it('returns N segments for count=N', () => {
    const out = tickPositions(vec(0, 0), vec(100, 0), 3);
    expect(out).toHaveLength(3);
  });

  it('returns [] for degenerate sides', () => {
    expect(tickPositions(vec(5, 5), vec(5, 5), 2)).toEqual([]);
    expect(tickPositions(vec(5, 5), vec(5.5, 5), 2)).toEqual([]);
  });

  it('places single tick at midpoint, perpendicular', () => {
    const [t] = tickPositions(vec(0, 0), vec(100, 0), 1, { length: 10, spacing: 5 });
    // Midpoint is (50,0); perpendicular is ±y of length 10.
    expect((t.x1 + t.x2) / 2).toBeCloseTo(50);
    expect((t.y1 + t.y2) / 2).toBeCloseTo(0);
    expect(Math.abs(t.y1 - t.y2)).toBeCloseTo(20);
  });

  it('spaces multiple ticks evenly along the side direction', () => {
    const ticks = tickPositions(vec(0, 0), vec(100, 0), 2, { length: 10, spacing: 5 });
    const mids = ticks.map((t) => (t.x1 + t.x2) / 2);
    // Two ticks centered on midpoint 50, spacing 5 → 47.5 and 52.5.
    expect(mids[0]).toBeCloseTo(47.5);
    expect(mids[1]).toBeCloseTo(52.5);
  });
});
