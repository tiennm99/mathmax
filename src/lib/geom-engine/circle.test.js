import { describe, expect, it } from 'vitest';
import { vec } from './vec.js';
import { angleAtVertex, circle, pointOnCircle, projectToCircle } from './circle.js';

describe('pointOnCircle', () => {
  it('places 0° at +x', () => {
    const p = pointOnCircle(circle(0, 0, 10), 0);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(0);
  });

  it('places 90° at +y', () => {
    const p = pointOnCircle(circle(0, 0, 10), 90);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(10);
  });
});

describe('projectToCircle', () => {
  it('keeps direction, sets magnitude to radius', () => {
    const c = circle(0, 0, 5);
    const p = projectToCircle(vec(3, 4), c);
    expect(p.x).toBeCloseTo(3);
    expect(p.y).toBeCloseTo(4);
  });

  it('falls back to +x when point is at center', () => {
    const c = circle(0, 0, 5);
    expect(projectToCircle(vec(0, 0), c)).toEqual(vec(5, 0));
  });

  it('projects far points back to the circle', () => {
    const c = circle(0, 0, 5);
    const p = projectToCircle(vec(100, 0), c);
    expect(p).toEqual(vec(5, 0));
  });
});

describe('angleAtVertex', () => {
  it('right angle is 90°', () => {
    expect(angleAtVertex(vec(1, 0), vec(0, 0), vec(0, 1))).toBeCloseTo(90);
  });

  it('straight angle is 180°', () => {
    expect(angleAtVertex(vec(-1, 0), vec(0, 0), vec(1, 0))).toBeCloseTo(180);
  });

  it('returns 0 when vertex coincides with one ray endpoint', () => {
    expect(angleAtVertex(vec(0, 0), vec(0, 0), vec(1, 1))).toBe(0);
  });

  it('inscribed angle theorem — half the central angle', () => {
    const c = circle(0, 0, 10);
    const a = pointOnCircle(c, 0);
    const b = pointOnCircle(c, 120);
    const m = pointOnCircle(c, 250); // any point on the major arc
    const central = angleAtVertex(a, c.center, b);
    const inscribed = angleAtVertex(a, m, b);
    expect(inscribed).toBeCloseTo(central / 2, 1);
  });
});
