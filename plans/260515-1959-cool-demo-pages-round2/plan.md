---
title: "Cool Demo Pages Round 2 — Pythagoras + Sàng + Đường thẳng"
status: completed
created: 2026-05-15
priority: P2
blockedBy: []
blocks: []
---

# Cool Demo Pages Round 2

## Context
- Brainstorm: `plans/reports/brainstorm-260515-1959-cool-demo-pages-round2.md`
- Predecessor brainstorms: `plans/reports/brainstorm-260430-2207-improved-port-spec.md`, `plans/reports/brainstorm-260503-1121-curriculum-logic-survey.md`
- Predecessor plan: `plans/260503-1121-lesson-4-5-gcd-factor/` (5-lesson baseline + KaTeX + `numtheory-engine/`)
- Strategy: C (lesson-driven, infra emerges)
- Textbook alignment: Cánh Diều grade 6-7

## Lessons
1. **Định lý Pythagoras động** (hình học, lớp 7) — `/hinh-hoc/dinh-ly-pythagoras/` — drag right-angle vertex; "Chứng minh" button plays 2s dissection-shear animation
2. **Sàng Eratosthenes** (số học, lớp 6) — `/so-hoc/sang-eratosthenes/` — 10×10 grid; click prime → multiples ripple cross-out
3. **Đồ thị y = ax + b** (đại số, lớp 7) — `/dai-so/duong-thang/` — 2 sliders + 2 anchor points, both-ways binding

## New infra (only what these lessons force)
- **`geom-engine/transforms.js`** — `translate`, `rotate`, `shear`, `applyToPolygon`; pure, ~50 LOC, 12 tests
- **`numtheory-engine/sieve.js`** — `sieveUpTo(n)`, `multiplesOf(p, n)`; pure, ~30 LOC, 8 tests
- **`algebra-engine/`** module officially born — first file `linear.js` (`lineFromPoints`, `yAt`); 2nd consumer rule satisfied (alongside `hieu-hai-binh-phuong`)

## Explicit non-goals (YAGNI gate)
- ❌ shared `<Slider>` / `<NumberInput>` (only D needs sliders this round; defer until 3rd consumer)
- ❌ scoring, persistence, hint UI, undo/redo
- ❌ stacked-transforms / animation library — Svelte `tweened` + CSS is enough
- ❌ EN locale, dark mode, sitemap
- ❌ Pascal triangle (off-syllabus), fraction-pizza (arc-math complexity), transformations suite (too big this round)

## Locked defaults (from brainstorm §8)
- Pythagoras choreography: **dissection-shear** (full Euclid-style)
- Sàng grid: **fixed 10×10** (1..100), no slider
- Đường thẳng: **2 anchors + 2 sliders, bidirectional binding**

## Phases

| # | Phase | Status | Owns | Depends |
|---|-------|--------|------|---------|
| 01 | Engine: transforms.js | pending | `geom-engine/transforms.js` + tests | — |
| 02 | Engine: sieve.js | pending | `numtheory-engine/sieve.js` + tests | — |
| 03 | Engine: linear.js | pending | `algebra-engine/linear.js` + `index.js` + tests | — |
| 04 | Lesson: Pythagoras | pending | `/hinh-hoc/dinh-ly-pythagoras/` + copy | 01 |
| 05 | Lesson: Sàng | pending | `/so-hoc/sang-eratosthenes/` + copy | 02 |
| 06 | Lesson: Đường thẳng | pending | `/dai-so/duong-thang/` + copy | 03 |
| 07 | Registry + tiles | pending | `registry.js`, `site.vi.js`, topic landings | 04, 05, 06 |
| 08 | Tests + a11y verify | pending | manual a11y, mobile check, bundle delta | 07 |

**Parallelism:**
- Engines 01, 02, 03 fully independent → run in parallel
- Lessons 04, 05, 06 fully independent after their engine → run in parallel
- Phase 07 must serialize after all 3 lessons land
- Phase 08 is final gate

## Success criteria
- 3 routes added at the URLs above, all prerender via SvelteKit static
- ≥ 26 new unit tests (12 + 8 + 6); all green
- `pnpm check` clean, `pnpm test` green, `pnpm build` clean
- Every lesson: keyboard-only completion possible
- Every lesson: `aria-live` announces state changes
- Every lesson: `prefers-reduced-motion` honored
- Bundle delta < 20KB gzipped (no new deps)
- README updated with new lessons listed

## Dependencies
- 01 blocks 04
- 02 blocks 05
- 03 blocks 06
- 04, 05, 06 all block 07
- 07 blocks 08

## Open questions (resolve during implementation)
- Pythagoras: where does the dissection-shear pivot? (Euclid uses a specific shear axis — pick one, document)
- Sàng: cell color palette — reuse `colors.pair.{1,2,3}` or add `pair.4/5/6/7` for primes 2/3/5/7? (recommend extending palette)
- Đường thẳng: how to gate bidirectional binding loop? (`untrack` in derived OR epsilon-compare before write)
