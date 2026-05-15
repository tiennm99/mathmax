---
phase: 4
title: "Lesson: /hinh-hoc/dinh-ly-pythagoras/"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 04: Lesson — Định lý Pythagoras động

## Overview
Interactive proof of `a² + b² = c²`. User drags the right-angle vertex; three squares on the sides resize live. "Chứng minh" button plays a 2-second dissection-shear animation: the two leg-squares slide-and-shear into the hypotenuse-square.

## Requirements
- **Functional**:
  - Right triangle with one vertex at origin (the right angle), legs along axes
  - Three labeled squares: side `a` (vertical leg), side `b` (horizontal leg), side `c` (hypotenuse)
  - Side lengths + areas update live in KaTeX as the right-angle-vertex moves
  - "Chứng minh" button: tween two leg-squares into the c-square; on completion both leg-areas fill the c-area exactly
  - "Đặt lại" button: reset to initial config
  - `prefers-reduced-motion`: replace tween with instant snap; keep "before/after" labels
- **Non-functional**:
  - Single `+page.svelte` ≤ 200 LOC (split if exceeds)
  - JSDoc strict, no TS
  - Uses existing `<Tex>` component for math
  - Uses `geom-engine/transforms.js` from Phase 01 for the shear

## Architecture

```
SVG viewBox (0 0 400 400)
├── triangle <polygon> — three vertices, one draggable (right-angle vertex)
├── square-a  <polygon> — on side a (left edge), area filled
├── square-b  <polygon> — on side b (bottom edge), area filled
├── square-c  <polygon> — on hypotenuse, area filled (semi-transparent during tween)
├── shear-a   <polygon> — only visible during "Chứng minh" tween; starts at square-a, tweens to half of square-c
├── shear-b   <polygon> — only visible during tween; starts at square-b, tweens to other half of square-c
└── ARIA layer: vertex has aria-label, aria-live region announces a/b/c
```

State (Svelte 5 runes):
- `$state` for `vertex = {x, y}` (the right-angle vertex; other two vertices derive)
- `$state` for `phase: 'idle' | 'animating' | 'proven'`
- `$derived` for a, b, c, areas, KaTeX strings

Animation:
- Use Svelte `tweened` store with `cubicOut` easing, 2000ms
- Compute target transforms via `geom-engine/transforms.js`: each leg-square needs a `compose(translate, rotate, shear)` chain that lands it on the corresponding half of the c-square
- For shear axis: use the classic Euclidean shear — translate leg-square along its base, then shear it to align with the c-square's edge

Reduced-motion:
- Wrap the tween in `prefers-reduced-motion` check
- If reduced: directly set "after" coords; tween duration = 0

## Related Code Files
- Create: `src/routes/hinh-hoc/dinh-ly-pythagoras/+page.svelte`
- Create: `src/lib/lessons/dinh-ly-pythagoras/copy.vi.js`
- Modify: `src/lib/lessons/registry.js` — add `pythagorasCopy` import + entry

## Implementation Steps
1. Create `copy.vi.js` with: `slug`, `topic: 'hinh-hoc'`, `grade: 'lop-7'`, `gradeLabel: 'Lớp 7'`, `title`, `intro`, theorem statement, instructions, dissection-shear narration text
2. Scaffold `+page.svelte` skeleton with `<svelte:head>` (SEO via copy)
3. Lay out SVG: triangle + three squares as derived `$derived` polygons from `vertex`
4. Wire `use:draggable` on the right-angle vertex (keyboard + pointer + ARIA)
5. KaTeX strings: `a = ${a.toFixed(1)}`, `a^2 = ${...}`, full `a^2 + b^2 = c^2`
6. Add "Chứng minh" button + "Đặt lại" button (Tailwind-styled, focus-visible ring)
7. Implement dissection-shear via `tweened` + `transforms.js`:
   - Phase A (0-50%): shear-a slides from square-a position toward c-square's left half via shear matrix
   - Phase B (50-100%): shear-b slides from square-b position toward c-square's right half
   - On completion: hide originals, leave shear-a and shear-b filling c-square
8. Wire `prefers-reduced-motion` check (`window.matchMedia`)
9. Add `aria-live="polite"` region announcing "Cạnh a = …, cạnh b = …, cạnh c = …; a² + b² = c²"
10. Register in `registry.js`

## Success Criteria
- [ ] Route `/hinh-hoc/dinh-ly-pythagoras/` live in `pnpm dev`
- [ ] Drag vertex with mouse + touch + keyboard arrow → squares + KaTeX update
- [ ] Click "Chứng minh" → animation plays smoothly to completion
- [ ] After animation, the two leg-square pieces visibly fill the c-square area
- [ ] Click "Đặt lại" → returns to initial config
- [ ] `prefers-reduced-motion: reduce` set in DevTools → button snaps to final state, no tween
- [ ] Keyboard-only walkthrough completes the lesson
- [ ] `aria-live` announces dimension changes when vertex moves (debounced)
- [ ] `pnpm check` clean, `pnpm test` green
- [ ] File ≤ 200 LOC OR cleanly split into helpers under `src/lib/lessons/dinh-ly-pythagoras/`

## A11y Verify Steps
1. Tab to vertex → focus ring visible
2. Arrow keys move vertex by 1px; Shift+Arrow by 10px
3. `aria-label` announces position
4. Tab to "Chứng minh" button → space/enter triggers
5. Reduced-motion: macOS System Settings → Accessibility → Reduce Motion ON; reload → button snaps
6. Screen reader (VoiceOver / NVDA) reads `aria-live` updates
7. Color-contrast: square fills must hit AA against white background

## Risk Assessment
- **R1 — Animation jank**: cubicOut + 2s should feel right; budget 0.5d of polish time
- **R2 — Dissection geometry off**: leg-area total must exactly equal c-area; verify with `applyToPolygon` math at the destination state — write a console assertion gated by `import.meta.env.DEV`
- **R3 — Mobile touch on vertex**: existing `draggable` handles pointer events; verify on real mobile
- **R4 — Bundle delta**: SVG-only, Svelte `tweened` (already in core); ~1KB delta budget
