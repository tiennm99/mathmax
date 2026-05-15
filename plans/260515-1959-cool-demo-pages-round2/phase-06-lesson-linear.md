---
phase: 6
title: "Lesson: /dai-so/duong-thang/"
status: pending
priority: P1
effort: "1.5d"
dependencies: [3]
---

# Phase 06: Lesson — Đồ thị y = ax + b

## Overview
Cartesian plane with grid -10..10. Two sliders (a, b) AND two draggable anchor points on the line. Both control surfaces bind bidirectionally to the same `Line` state. Optional rise/run triangle overlay.

## Requirements
- **Functional**:
  - SVG Cartesian plane with grid lines every 1 unit, axes labeled
  - Line `y = ax + b` rendered as `<line>` from `x = -10` to `x = 10`
  - Two anchor points (small circles) at `x = -5` and `x = 5` on the line; both draggable via `use:draggable`
  - Two range sliders: `a ∈ [-5, 5]` step 0.1; `b ∈ [-10, 10]` step 0.1
  - Sliders update `a`, `b` → line + anchors reposition
  - Dragging an anchor updates `a`, `b` → other anchor + sliders reposition
  - KaTeX displays live `y = ax + b` with current values (e.g. `y = 2.0x + 1.0`)
  - Toggle "Hiện tam giác đo độ dốc" — overlays rise/run triangle between the two anchors with labeled `Δx` and `Δy`
  - "Đặt lại" → initial `a=1, b=0`
- **Non-functional**:
  - Single `+page.svelte` ≤ 200 LOC (split if helper grows)
  - Uses `algebra-engine/linear.js` from Phase 03
  - Bidirectional binding gated to prevent loops

## Architecture

```
State (single source of truth):
  a: $state(1)
  b: $state(0)

Derived (from a, b):
  line = { a, b }
  anchor1Y = yAt(line, -5)   // x fixed at -5
  anchor2Y = yAt(line, 5)    // x fixed at 5
  texMath  = `y = ${a.toFixed(1)}x + ${b.toFixed(1)}`

Anchor drag handler (uses use:draggable):
  - X coord of anchor is FIXED (-5 or 5); only Y is mutated by drag
  - On drag: compute new line via lineFromPoints({-5, anchor1.y}, {5, anchor2.y})
  - If null (impossible here since x's differ): no-op
  - Otherwise: a, b = newLine.a, newLine.b  → triggers re-derive
  - Loop-gate: if abs(newA - a) < EPSILON && abs(newB - b) < EPSILON, skip the write

Slider:
  - Native <input type="range" bind:value={a}> + same for b
  - Driven directly; no loop concern (sliders don't read derived state)
```

The bidirectional loop gate uses epsilon-compare (option chosen from plan.md open question §C).

## Related Code Files
- Create: `src/routes/dai-so/duong-thang/+page.svelte`
- Create: `src/lib/lessons/duong-thang/copy.vi.js`
- Modify: `src/lib/lessons/registry.js` — add entry
- Possibly create: `src/lib/lessons/duong-thang/grid-svg.svelte.js` if grid helper exceeds 30 LOC

## Implementation Steps
1. Create `copy.vi.js`: slug, topic `dai-so`, grade `lop-7`, title, intro, slope-intercept theorem text, instructions for both control modes
2. Scaffold `+page.svelte` with `<svelte:head>`
3. Implement SVG Cartesian grid: 21×21 light lines, axes thicker, integer labels every 2 units
4. Render line via `<line>` using `linePoints(line, -10, 10)` from `algebra-engine`
5. Render anchor1 + anchor2 as `<circle>` with `use:draggable` constrained to fixed x via `projector` parameter (existing `draggable` API supports projector)
6. Wire anchor drag → recompute `(a, b)` via `lineFromPoints`, with epsilon gate
7. Add two range sliders (Tailwind-styled, bigger thumb for touch)
8. KaTeX `<Tex math={texMath}/>` below the plot
9. Add checkbox "Hiện tam giác đo độ dốc" → conditionally render rise/run triangle (a right-angle indicator at intersection)
10. "Đặt lại" button
11. `aria-live` announces equation + anchor positions when sliders or anchors change (debounced 300ms to avoid screen-reader spam)
12. Register in `registry.js`

## Success Criteria
- [ ] Route `/dai-so/duong-thang/` live in `pnpm dev`
- [ ] Slider `a = 2` → line steepens, both anchors move
- [ ] Drag anchor1 up → `a`, `b`, slider positions update; anchor2 moves to stay on line
- [ ] No oscillation when dragging at slow speeds (epsilon gate works)
- [ ] Keyboard: anchors arrow-navigable, sliders also keyboard-controllable natively
- [ ] Rise/run triangle toggles cleanly; reads `Δx = 10, Δy = ${(a*10).toFixed(1)}`
- [ ] `aria-live` announces equation
- [ ] Reduced-motion: no animations needed in this lesson (it's all live binding); confirm no CSS transitions impose motion
- [ ] `pnpm check` clean, `pnpm test` green

## A11y Verify Steps
1. Tab order: slider-a → slider-b → anchor1 → anchor2 → toggle → reset
2. Both sliders keyboard-controllable (native)
3. Anchors arrow-key move (vertical only via projector constraint); aria-label updates
4. `aria-live` debounced — screen reader announces final state, not every micro-step
5. Equation Tex output: KaTeX renders MathML for SR-friendly reading

## Risk Assessment
- **R1 — Bidirectional binding loop**: gated via epsilon-compare; add `import.meta.env.DEV` assertion that counts re-derives per tick
- **R2 — Floating-point in slider step 0.1**: use `Math.round(x * 10) / 10` when assigning from anchor drag → keeps sliders snapped
- **R3 — Grid SVG bloat**: 21×21 = 441 lines is fine but tempting to add minor ticks; resist (KISS)
- **R4 — Anchor projector**: ensure `projector` in `draggable` clamps x but allows full y range; existing API supports this
