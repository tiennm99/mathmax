---
phase: 1
title: "Engine: geom-engine/transforms.js"
status: pending
priority: P1
effort: "4h"
dependencies: []
---

# Phase 01: Engine — `geom-engine/transforms.js`

## Overview
Add a pure 2D affine-transform module to `geom-engine/`. Required by Phase 04 (Pythagoras dissection-shear) and re-usable for a future `[8][later]` transformations-suite lesson.

## Requirements
- **Functional**:
  - `translate(dx, dy)` → returns a 3×3 matrix
  - `rotate(thetaRad, center?)` → matrix; `center` defaults to origin
  - `shear(kx, ky)` → matrix
  - `compose(...matrices)` → matrix product
  - `applyToPoint(m, p)` → `Vec2`
  - `applyToPolygon(m, points)` → `Vec2[]`
- **Non-functional**:
  - Pure JS, no DOM, no Svelte
  - JSDoc strict (validated via `pnpm check`)
  - Stateless: every function returns new data
  - Use 3×3 matrices stored as length-9 `Array<number>` (row-major), to interop with future CSS matrix exports

## Architecture
Affine 2D transforms via homogeneous coordinates. Matrix is `[a b c | d e f | 0 0 1]`. Apply to `Vec2 = {x, y}` by treating it as `(x, y, 1)`.

Exports added to `geom-engine/index.js` barrel.

## Related Code Files
- Create: `src/lib/geom-engine/transforms.js` (~80 LOC including JSDoc)
- Create: `src/lib/geom-engine/transforms.test.js` (~12 tests, ~120 LOC)
- Modify: `src/lib/geom-engine/index.js` — add re-exports

## Implementation Steps
1. Define matrix type via JSDoc: `Mat3 = number[]` (length 9, row-major)
2. Implement `translate(dx, dy)` — identity with `c=dx, f=dy`
3. Implement `rotate(theta, center = {x:0, y:0})` — compose translate(-c) → rotate-origin → translate(+c)
4. Implement `shear(kx, ky)` — `[1 kx 0 | ky 1 0 | 0 0 1]`
5. Implement `compose(...ms)` — left-to-right reduce via 3×3 multiply helper (private)
6. Implement `applyToPoint(m, p)` — return `{x: m[0]*p.x + m[1]*p.y + m[2], y: m[3]*p.x + m[4]*p.y + m[5]}`
7. Implement `applyToPolygon(m, pts)` — `pts.map(p => applyToPoint(m, p))`
8. Re-export from `geom-engine/index.js`
9. Write 12 unit tests (Vitest):
   - identity translate (0,0)
   - translate accumulates
   - rotate 90° around origin: (1,0) → (0,1)
   - rotate 90° around custom center
   - shear unit (1,0): (0,1) → (1,1)
   - compose order: translate(2,0) ∘ rotate(90°) at origin → applied to (1,0) → (2,1)
   - applyToPolygon preserves count
   - applyToPolygon doesn't mutate input
   - identity round-trip (rotate θ + rotate -θ)
   - matrix length = 9 invariant
   - EPSILON_LEN tolerance reused for float comparisons
   - degenerate compose() with zero args returns identity

## Success Criteria
- [ ] `pnpm test src/lib/geom-engine/transforms.test.js` → 12/12 pass
- [ ] `pnpm check` clean (no JSDoc errors)
- [ ] No new dependencies in `package.json`
- [ ] `geom-engine/index.js` re-exports all public functions

## Risk Assessment
- **R1**: Float drift in compose chains → use `EPSILON_LEN` from `vec.js` for tests; document precision limit in JSDoc
- **R2**: Row-major vs column-major confusion when later exporting to CSS `matrix()` → JSDoc the layout explicitly; add one test that verifies CSS-format string output is row-major
- **R3**: Rotate-around-center bug (signs flip) → test with both (0,0) and (5,5) centers
