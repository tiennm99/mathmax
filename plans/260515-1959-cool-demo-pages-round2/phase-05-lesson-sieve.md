---
phase: 5
title: "Lesson: /so-hoc/sang-eratosthenes/"
status: pending
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 05: Lesson — Sàng Eratosthenes

## Overview
10×10 grid of numbers 1..100. Click any prime → cross-out ripple cascades through its multiples in that prime's color. Stack 2/3/5/7 to reveal all primes ≤ 100 visually.

## Requirements
- **Functional**:
  - Static 10×10 grid (numbers 1..100, row-major)
  - Cell visual states: untouched, marked-as-prime (clicked + colored border), crossed-as-multiple (faded + strike)
  - Clicking a prime triggers a ripple: multiples cross out in sequence with ~30ms stagger
  - Cells that are multiples of multiple primes show stacked indicators (small dots in each color)
  - "Đặt lại" button clears all state
  - Color palette: extend Tailwind `colors.pair.{1,2,3}` to `pair.{1,2,3,4}` (one per small prime 2,3,5,7); see open question
  - `prefers-reduced-motion`: no stagger; cross-outs apply instantly
- **Non-functional**:
  - Single `+page.svelte` ≤ 200 LOC
  - Uses `numtheory-engine/sieve.js` for `multiplesOf`
  - Grid is `role="grid"`, cells are `role="gridcell"`

## Architecture

```
Page
├── Header (KaTeX intro)
├── Grid (10×10 buttons, role="grid")
│   └── Cells: 1..100 — each is <button role="gridcell" aria-label="...">
├── Legend (colors → primes)
├── "Đặt lại" button
└── aria-live region (announces "đã gạch các bội của 7: 14, 21, …")
```

State:
- `$state` `markedPrimes: number[]` — clicked primes in order
- `$state` `crossings: Map<number, number[]>` — cell → list of prime-markers that cross it (renders as stacked dots)
- `$derived` cell visual state from `markedPrimes` + `crossings`
- `$state` `rippling: boolean` — disable clicks during a ripple

Click handler:
1. If cell value `n` is already in `markedPrimes` → no-op
2. If `n` is not prime (already crossed) → optional: shake animation, no state change
3. If `n` is prime: add to `markedPrimes`, fetch `multiplesOf(n, 100)`, schedule cross-outs via `setTimeout(..., i * 30)` (or `await` in async helper); reduced-motion = 0ms stagger
4. Set `rippling=true` during, `false` after last multiple lands

## Related Code Files
- Create: `src/routes/so-hoc/sang-eratosthenes/+page.svelte`
- Create: `src/lib/lessons/sang-eratosthenes/copy.vi.js`
- Modify: `src/lib/lessons/registry.js` — add entry
- Modify: `tailwind.config.js` — extend `colors.pair` if open-question resolves toward "extend palette"

## Implementation Steps
1. Create `copy.vi.js`: slug, topic `so-hoc`, grade `lop-6`, title, intro, instructions, legend labels, "primes" definition tooltip text
2. Scaffold `+page.svelte` with `<svelte:head>`
3. Render 10×10 grid as `<div role="grid">` with rows; each cell is `<button role="gridcell" tabindex="-1 or 0">`
4. Implement keyboard navigation: arrow keys move focus within grid (single tabstop pattern); Home/End to row start/end; Enter/Space to "click" the focused cell
5. Hook click/Enter to ripple helper that uses `multiplesOf(n, 100)`
6. Animate cross-out via Tailwind `transition-` + `opacity-50 line-through` classes
7. Stack-indicator dots: if a cell is in `crossings` for multiple primes, render a row of small color dots
8. Wire `prefers-reduced-motion` → set stagger to 0
9. `aria-live` announces ripple completion: "đã gạch các bội của 7: 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98"
10. Register in `registry.js`

## Success Criteria
- [ ] Route `/so-hoc/sang-eratosthenes/` live in `pnpm dev`
- [ ] Click 2 → all even numbers > 2 cross out in ripple
- [ ] Click 3 → multiples of 3 cross out, color-coded; 6, 12, 18… show both colors
- [ ] Click 4 (not prime, already crossed) → no state change or gentle shake
- [ ] Click 5 then 7 → after all four primes (2,3,5,7), 25 primes remain visually un-crossed
- [ ] "Đặt lại" → all state cleared
- [ ] Reduced-motion: cross-outs apply instantly
- [ ] Keyboard-only: Tab into grid, arrow-navigate, Enter on 2/3/5/7
- [ ] `aria-live` announces each ripple
- [ ] `pnpm check` clean, `pnpm test` green
- [ ] No new deps

## A11y Verify Steps
1. Tab into grid → single cell takes focus (roving tabindex)
2. Arrow keys navigate; visible focus ring on each cell
3. Enter/Space on cell value 7 → ripple triggers, `aria-live` announces multiples
4. Reduced-motion: ripple replaced with instant batch update; `aria-live` still announces
5. Color contrast: each color in legend must hit AA on white
6. Color is NOT the only differentiator: dots also have aria-labels like "đánh dấu bởi 2 và 3"

## Risk Assessment
- **R1 — Roving tabindex bugs**: 100 cells; use a single `currentFocus = $state(0)` and conditionally `tabindex={i === currentFocus ? 0 : -1}`; verify focus is preserved after re-render
- **R2 — Color choices**: must be visually distinct AND contrast-accessible AND aligned with site palette; coordinate with `tailwind.config.js` colors.pair extension
- **R3 — `setTimeout` cancellation on "Đặt lại"**: store timeout IDs in `$state`, clear them all on reset
