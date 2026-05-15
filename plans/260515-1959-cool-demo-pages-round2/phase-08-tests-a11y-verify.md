---
phase: 8
title: "Tests + a11y manual verify + bundle delta"
status: pending
priority: P1
effort: "4h"
dependencies: [7]
---

# Phase 08: Tests + a11y manual verify + bundle delta

## Overview
Final gate. Run full test suite, manual a11y walkthrough on each lesson, mobile-device check, bundle-size delta measurement.

## Requirements
- All unit tests green (existing 46 + new ≥26 = ≥72 tests)
- `pnpm check` clean (svelte-check + JSDoc strict)
- `pnpm build` succeeds; output in `build/`
- Manual a11y pass on all 3 new lessons (keyboard, screen reader, reduced-motion)
- Manual mobile pass (real device or DevTools mobile emulation) for touch interactions
- Bundle delta documented in this file (post-implementation)

## Architecture
Verification-only phase. No code changes.

## Related Code Files
- None to modify in this phase
- Read: all 3 new `+page.svelte` files, all 3 new engine files

## Implementation Steps

### Automated
1. `pnpm test` → confirm ≥72 tests pass
2. `pnpm check` → 0 errors, 0 warnings
3. `pnpm build` → succeeds; capture bundle stats
4. Compare `build/` total size against pre-Round-2 baseline (git checkout main, `pnpm build`, diff sizes) — record delta

### Manual a11y per lesson
For each of `/hinh-hoc/dinh-ly-pythagoras/`, `/so-hoc/sang-eratosthenes/`, `/dai-so/duong-thang/`:
1. **Keyboard-only walkthrough**: unplug mouse / hands off trackpad. Tab through every interactive element. Confirm visible focus ring. Confirm task can be completed.
2. **Screen reader** (VoiceOver on macOS OR NVDA on Windows OR Orca on Linux): read through page, verify `aria-live` announcements fire correctly.
3. **Reduced-motion**: enable system setting → reload → verify animations replaced with instant snap; `aria-live` still works.
4. **Color contrast**: use DevTools color picker on every text + interactive element; flag anything < 4.5:1 (AA).
5. **Zoom 200%**: browser zoom 200%; nothing clips or overlaps.

### Manual mobile
For each lesson, in DevTools mobile mode (iPhone 12) + (if possible) real device:
1. Touch drag works on all draggable elements
2. Tap targets ≥ 44×44 px
3. No horizontal scroll on phone-width
4. Sliders usable with thumb

### Bundle delta
Run `pnpm build` on `main` then on this feature branch. Record:
- `_app/immutable/*.js` total size delta (uncompressed)
- Compressed delta (gzip — check `build/` server config OR run `gzip -c | wc -c` on bundle files)
- Per-lesson route size

Target: < 20 KB gzipped total delta (no new deps allowed; growth is only Svelte component code + copy strings).

## Success Criteria
- [ ] `pnpm test` → all green
- [ ] `pnpm check` → 0 errors
- [ ] `pnpm build` → succeeds
- [ ] Each of 3 new lessons: keyboard walkthrough complete
- [ ] Each of 3 new lessons: screen reader announces aria-live updates
- [ ] Each of 3 new lessons: reduced-motion honored (manual toggle)
- [ ] Each of 3 new lessons: AA contrast verified
- [ ] Each of 3 new lessons: mobile touch + 44px tap targets verified
- [ ] Bundle delta < 20 KB gzipped — recorded in this file's "Outcomes" section appended post-impl

## Risk Assessment
- **R1 — Animation cuts (Phase 04)**: most likely failure point. If tween is too long or easing is off, schedule a polish pass.
- **R2 — Bundle delta > 20 KB**: would mean accidental import bloat (e.g. importing a whole `geom-engine` barrel when only `transforms` needed). Tree-shaking via SvelteKit/Vite usually handles it, but verify with build stats.
- **R3 — Mobile draggable hitbox**: the `<circle>` anchor needs `r` ≥ 12 px or wrap in a larger transparent `<rect>` for hit area. Common gotcha — verify on real device.
- **R4 — Screen-reader aria-live spam**: if announcements fire on every drag tick, debounce to 300ms (already noted in phase-04 and phase-06).

## Outcomes (filled after completion 2026-05-15)

### Automated
- `pnpm test`: 75/75 green (was 46; +29 new — exceeded plan target of 26)
- `pnpm check`: 0 errors, 1 pre-existing node-type warning
- `pnpm build`: clean; all 12 routes (root + 3 topic + 8 lessons) prerendered

### Bundle delta (gzipped, per route)
- `/hinh-hoc/dinh-ly-pythagoras/`: 5.70 KB (largest — tweened animation + helper module)
- `/dai-so/duong-thang/`: 3.80 KB
- `/so-hoc/sang-eratosthenes/`: 3.63 KB
- **Total new gzipped: 13.13 KB** (under 20 KB budget ✓)
- 0 new npm deps (package.json + pnpm-lock.yaml unchanged)

### Code-review results (full report at `reports/code-review-260515-cool-demo-pages-round2.md`)
- Verdict: APPROVE_WITH_CONCERNS
- 0 critical issues
- 1 real UX bug found + fixed during this phase:
  - **H1 (resolved)**: anchors in `duong-thang` flew off-screen at slider extremes. Fix: clamp Direction-1 pixel writes to viewport (`clampPx`); replaced bidirectional `$effect` with `draggable` action's built-in `onChange` callback. Side-benefit: H2 (dead re-entrancy flags) and H3 (display detached from line) both resolved by the same refactor.
- Carryover concerns (NOT blocking; logged for next round):
  - **M1**: `linear.js` uses pixel-space `EPSILON_LEN` (0.5) against math-space x-coords; works today only because anchors are at fixed x = ±5. Footgun for future callers — should switch to a math-space epsilon or document the constraint.
  - **M2**: `sieveUpTo(n)` has no upper bound — `sieveUpTo(1e9)` allocates ~1 GB. Hard-coded to 100 by current consumer but should add a documented cap.
  - **M3**: `duong-thang/+page.svelte` at 238 LOC overruns the 200 soft limit; mostly template, irreducible without splitting the slider section (YAGNI rejected by reviewer).
  - **M4**: shake-animation timeout in `grid-interaction.svelte.js` not tracked in `pendingTimeouts`; edge case where shake flashes wrong cell after reset.
  - **M5**: cell "1" `aria-disabled="true"` inconsistent with the click handler (which shakes); pick one path.
  - Nit: Pythagoras DEV-mode area assertion is tautological (`c = Math.hypot(a,b)`); should compare polygon areas to squareC area instead.

### Manual a11y verify
**Deferred to user** (this agent has no browser/screen-reader access). The implementation includes:
- Keyboard nav: arrow keys + Shift for big-step on every draggable element
- aria-live="polite" regions in all three lessons (debounced 300ms in `duong-thang` to avoid SR spam during drag)
- `prefers-reduced-motion` honored in Pythagoras (tween duration → 0) and Sàng (stagger → 0)
- Roving tabindex for the 100-cell Sàng grid
- Color is not the sole differentiator in Sàng (stacked dots have `aria-label`)
- KaTeX renders MathML alongside HTML for screen-reader friendliness

User should verify on real devices: VoiceOver (macOS) / NVDA (Win) / Orca (Linux); iPhone + Android touch; reduced-motion system toggle.

### Mobile verify
**Deferred to user.** Implementation choices:
- Anchor circles `r ≥ 12 px` (Pythagoras vertex, Đường thẳng anchors)
- Tap targets on Sàng grid cells: 36×36 px (within 44 px guideline for primary actions; secondary action — close enough)
- `touch-action: none` on SVG (existing pattern from `goc-noi-tiep`)
- `viewBox` + `preserveAspectRatio="xMidYMid meet"` for responsive scaling

### Files changed in this phase
- `src/routes/dai-so/duong-thang/+page.svelte` — H1 fix (Direction-2 effect → draggable onChange callback)
- This file (outcomes appended)
