---
phase: 3
title: "Engine: algebra-engine/linear.js"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 03: Engine — `algebra-engine/linear.js`

## Overview
**Officially open the `algebra-engine/` module** (2nd algebra consumer triggers it, per curriculum survey §3.1). First file: linear-function helpers powering Phase 06 (Đồ thị y=ax+b).

## Requirements
- **Functional**:
  - `lineFromPoints(p1, p2)` → `{a, b} | null` (null when `p1.x === p2.x`, i.e. vertical line)
  - `yAt(line, x)` → number
  - `linePoints(line, xMin, xMax)` → `[{x:xMin, y:y(xMin)}, {x:xMax, y:y(xMax)}]` (convenience for SVG `<line>`)
  - `lineFromSlope(a, b)` → `{a, b}` (trivial; included for API symmetry)
- **Non-functional**:
  - Pure JS, JSDoc strict
  - Mirrors `numtheory-engine/`/`geom-engine/` module shape
  - No DOM

## Architecture
`Line = { a: number, b: number }` represents `y = a·x + b`. Vertical lines are out-of-scope (Đồ thị lesson constrains x-domain such that any two anchors with distinct x produce a defined line). `lineFromPoints` returns `null` for the degenerate case so the lesson UI can clamp.

New module directory mirrors existing engines exactly.

## Related Code Files
- Create: `src/lib/algebra-engine/linear.js` (~30 LOC)
- Create: `src/lib/algebra-engine/linear.test.js` (~60 LOC, 6 tests)
- Create: `src/lib/algebra-engine/index.js` (barrel)

## Implementation Steps
1. Define `Line` type in JSDoc (`@typedef`)
2. `lineFromPoints(p1, p2)`:
   - If `Math.abs(p2.x - p1.x) < EPSILON_LEN` → return `null`
   - `a = (p2.y - p1.y) / (p2.x - p1.x)`
   - `b = p1.y - a * p1.x`
3. `yAt(line, x)` → `line.a * x + line.b`
4. `linePoints(line, xMin, xMax)` → `[{x: xMin, y: yAt(line, xMin)}, {x: xMax, y: yAt(line, xMax)}]`
5. `lineFromSlope(a, b)` → `{a, b}`
6. `algebra-engine/index.js` re-exports all
7. Write 6 tests:
   - `lineFromPoints({0,1}, {1,3})` → `{a:2, b:1}`
   - `lineFromPoints({2,5}, {2,7})` → `null` (vertical)
   - `yAt({a:2, b:1}, 3)` → 7
   - `linePoints({a:1, b:0}, -5, 5)` → `[{-5,-5}, {5,5}]`
   - `lineFromSlope(0, 4)` → `{a:0, b:4}` (horizontal)
   - Round-trip: `lineFromPoints(p1, p2)` then `yAt` at `p1.x`/`p2.x` recovers `p1.y`/`p2.y`

## Success Criteria
- [ ] `pnpm test src/lib/algebra-engine/linear.test.js` → 6/6 pass
- [ ] `pnpm check` clean
- [ ] `src/lib/algebra-engine/index.js` barrel exports all public functions
- [ ] No new dependencies

## Risk Assessment
- **R1**: `EPSILON_LEN` import from `geom-engine` creates cross-engine dep → acceptable; both engines are siblings under `lib/`. Documented in JSDoc.
- **R2**: API too small to be a "module"? → fine. Survey §3.1 has 5+ more algebra files queued (`polynomial`, `factor`, `linear-eq-solver`, …); this is foundation.
