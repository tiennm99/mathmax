import { describe, it, expect } from 'vitest';
import {
  translate,
  rotate,
  shear,
  compose,
  applyToPoint,
  applyToPolygon,
  approxEqualMat,
} from './transforms.js';
import { EPSILON_LEN } from './vec.js';

const HALF_PI = Math.PI / 2;

describe('translate', () => {
  it('identity translate (0,0) leaves point unchanged', () => {
    const m = translate(0, 0);
    expect(applyToPoint(m, { x: 3, y: 4 })).toEqual({ x: 3, y: 4 });
  });

  it('translates a point', () => {
    const m = translate(2, -1);
    expect(applyToPoint(m, { x: 1, y: 1 })).toEqual({ x: 3, y: 0 });
  });
});

describe('rotate', () => {
  it('rotates 90° around origin: (1,0) → (0,1)', () => {
    const m = rotate(HALF_PI);
    const p = applyToPoint(m, { x: 1, y: 0 });
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });

  it('rotates 90° around custom center (5,5): (6,5) → (5,6)', () => {
    const m = rotate(HALF_PI, { x: 5, y: 5 });
    const p = applyToPoint(m, { x: 6, y: 5 });
    expect(p.x).toBeCloseTo(5);
    expect(p.y).toBeCloseTo(6);
  });

  it('rotate θ then rotate -θ is identity', () => {
    const m = compose(rotate(0.7), rotate(-0.7));
    expect(applyToPoint(m, { x: 3, y: 4 }).x).toBeCloseTo(3);
    expect(applyToPoint(m, { x: 3, y: 4 }).y).toBeCloseTo(4);
  });
});

describe('shear', () => {
  it('horizontal shear (1,0): (0,1) → (1,1)', () => {
    const m = shear(1, 0);
    expect(applyToPoint(m, { x: 0, y: 1 })).toEqual({ x: 1, y: 1 });
  });

  it('vertical shear (0,1): (1,0) → (1,1)', () => {
    const m = shear(0, 1);
    expect(applyToPoint(m, { x: 1, y: 0 })).toEqual({ x: 1, y: 1 });
  });
});

describe('compose', () => {
  it('zero args returns identity (length 9)', () => {
    const m = compose();
    expect(m).toHaveLength(9);
    expect(applyToPoint(m, { x: 7, y: -3 })).toEqual({ x: 7, y: -3 });
  });

  it('order is left-to-right: translate then rotate', () => {
    // Apply translate(2,0) first, then rotate 90° around origin.
    // (1,0) → translate → (3,0) → rotate 90° → (0,3)
    const m = compose(translate(2, 0), rotate(HALF_PI));
    const p = applyToPoint(m, { x: 1, y: 0 });
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(3);
  });
});

describe('applyToPolygon', () => {
  it('preserves point count', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
    expect(applyToPolygon(translate(5, 5), pts)).toHaveLength(3);
  });

  it('does not mutate input array', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const snapshot = JSON.stringify(pts);
    applyToPolygon(translate(10, 10), pts);
    expect(JSON.stringify(pts)).toBe(snapshot);
  });
});

describe('approxEqualMat', () => {
  it('matches within EPSILON_LEN tolerance', () => {
    const a = translate(1, 1);
    const b = translate(1 + EPSILON_LEN / 2, 1);
    expect(approxEqualMat(a, b)).toBe(true);
  });

  it('rejects beyond tolerance', () => {
    expect(approxEqualMat(translate(0, 0), translate(2, 0))).toBe(false);
  });
});
