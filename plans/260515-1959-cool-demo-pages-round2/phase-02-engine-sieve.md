---
phase: 2
title: "Engine: numtheory-engine/sieve.js"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 02: Engine — `numtheory-engine/sieve.js`

## Overview
Add Sieve of Eratosthenes + multiples helper to `numtheory-engine/`. Powers the Sàng Eratosthenes lesson (Phase 05).

## Requirements
- **Functional**:
  - `sieveUpTo(n)` → `{ primes: number[], composite: Set<number> }` for 2..n
  - `multiplesOf(p, n)` → `number[]` of multiples of `p` in `[2p, n]` (excludes p itself; useful for the "cross out multiples" interaction)
  - `isPrime(k, n?)` → boolean (convenience; can reuse sieve if `n ≥ k`)
- **Non-functional**:
  - Pure, deterministic, no DOM
  - JSDoc strict
  - `sieveUpTo(100)` must run in < 1ms (trivially true; documented as perf budget)

## Architecture
Classic O(n log log n) sieve over a `Uint8Array` of size `n+1` (0 = prime, 1 = composite). Convert to outputs at the end. No state outside the function.

## Related Code Files
- Create: `src/lib/numtheory-engine/sieve.js` (~50 LOC)
- Create: `src/lib/numtheory-engine/sieve.test.js` (~80 LOC, 8 tests)
- Modify: `src/lib/numtheory-engine/index.js` — re-export

## Implementation Steps
1. `sieveUpTo(n)`:
   - Guard `n < 2` → return `{primes: [], composite: new Set()}`
   - Allocate `Uint8Array(n+1)`, mark 0 and 1
   - Outer loop `i = 2; i*i ≤ n` — if not marked, mark all multiples `i*i, i*i+i, ...`
   - Collect primes (`marks[k] === 0` for `k ≥ 2`) and composites into outputs
2. `multiplesOf(p, n)`:
   - Guard `p < 2 || n < 2*p` → return `[]`
   - Loop `2p, 3p, ...` up to `n`; collect
3. `isPrime(k)`:
   - For `k < 2` → false; for `k = 2` → true; even → false; trial-divide odd up to `√k`
   - (Avoid building a sieve here; this is the cheap path)
4. Re-export from `numtheory-engine/index.js`
5. Write 8 tests:
   - `sieveUpTo(1)` → empty
   - `sieveUpTo(2)` → `[2]`
   - `sieveUpTo(10)` → `[2, 3, 5, 7]`
   - `sieveUpTo(100)` → length 25, contains 97, excludes 91 (= 7·13)
   - `multiplesOf(2, 10)` → `[4, 6, 8, 10]` (excludes 2 itself)
   - `multiplesOf(7, 100)` → starts at 14, ends at 98
   - `isPrime(1) === false`, `isPrime(2) === true`, `isPrime(91) === false`
   - `sieveUpTo(0)` and `sieveUpTo(-5)` → empty (guard test)

## Success Criteria
- [ ] `pnpm test src/lib/numtheory-engine/sieve.test.js` → 8/8 pass
- [ ] `pnpm check` clean
- [ ] No new dependencies
- [ ] `numtheory-engine/index.js` re-exports public surface

## Risk Assessment
- **R1**: Off-by-one at `i*i > n` boundary → covered by `sieveUpTo(100)` test (97 is the largest prime; 11² = 121 > 100 so loop stops)
- **R2**: `multiplesOf` returning `p` itself when caller doesn't want it → spec'd "exclude p"; documented in JSDoc
