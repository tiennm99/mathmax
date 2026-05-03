---
title: "Lesson 4 + 5: GCD Euclidean game + factor a²-b² visualizer"
status: in-progress
created: 2026-05-03
priority: P2
---

# Lesson 4 + 5 — GCD Euclidean + Factor a²-b²

## Context
- Brainstorm survey: `plans/reports/brainstorm-260503-1121-curriculum-logic-survey.md` §3.1
- Port spec (conventions): `plans/reports/brainstorm-260430-2207-improved-port-spec.md`
- Strategy: C (lesson-driven, infra emerges)
- Textbook alignment: **Cánh Diều** (lớp 6 + lớp 7)

## Lessons
1. **Ước chung lớn nhất** (số học, lớp 6) — Euclidean algorithm visualizer at `/so-hoc/uoc-chung-lon-nhat/`
2. **Hiệu hai bình phương** (đại số, lớp 7) — `a²-b² = (a+b)(a-b)` interactive at `/dai-so/hieu-hai-binh-phuong/`

## New infra (only what these lessons force)
- **KaTeX** — Tex.svelte component (algebra needs `\frac{a \cdot b}{\gcd(a,b)}` and `a^2-b^2`)
- **`numtheory-engine/`** — pure module: `gcd`, `lcm`, `gcdSteps` (mirrors geom-engine shape)
- **Goal-state pattern** — per-lesson `goal(state) → { reached, hint? }` (documented, not abstracted)

## Explicit non-goals (YAGNI gate)
- ❌ algebra-engine module (`a*a - b*b` is too small; defer until 2nd algebra lesson)
- ❌ shared NumberInput / Slider components (use raw inputs)
- ❌ shared GoalState type or quiz primitives (Sub-project §3.2 territory)
- ❌ scoring, persistence, hint-cost, undo/redo (Sub-projects §3.2/§3.3)
- ❌ EN locale (Sub-project §3.5)

## Phases

| # | Phase | Status | Owns |
|---|-------|--------|------|
| 01 | KaTeX integration | completed | `tex.svelte`, deps, smoke test (sandbox removed) |
| 02 | Số học engine + GCD lesson | completed | `numtheory-engine/` (12 tests), `/so-hoc/uoc-chung-lon-nhat/` |
| 03 | Đại số factor a²-b² lesson | completed | `/dai-so/hieu-hai-binh-phuong/` |
| 04 | Registry + landing glue | completed | `registry.js`, `site.vi.js`, topic landings, root tiles |
| 05 | Test + a11y verify | partial | check ✓, test 46/46 ✓, build ✓ — **manual a11y/mobile pending user verify** |

## Outcomes
- 5 routes added: `/so-hoc/`, `/so-hoc/uoc-chung-lon-nhat/`, `/dai-so/`, `/dai-so/hieu-hai-binh-phuong/` (and reuses `/hinh-hoc/`)
- 12 new unit tests (numtheory-engine), all green; total 46/46 passing
- KaTeX integrated SSR-style via `<Tex>` component; ~280KB CSS+fonts bundle delta
- All three topic tiles on landing now live
- README + RUNBOOK updated

## Dependencies
- Phase 01 blocks Phase 03 (algebra lesson needs `<Tex>`)
- Phase 01 blocks Phase 02 (LCM formula uses `<Tex>`)
- Phase 04 blocks Phase 05 (need glue done before final verify)
- Phases 02 + 03 can run in parallel after 01

## Success criteria
- Both new lessons live at correct URLs, rendered server-side via SvelteKit prerender
- KaTeX renders inline + display math with no FOUC
- `npm run check` clean (svelte-check + JSDoc strict)
- `npm run test` green (existing tests + new numtheory-engine tests)
- Keyboard nav + ARIA work for all new interactive elements
- Bundle size delta documented (KaTeX is ~300KB gzipped; expected)

## Open questions (resolve during implementation)
- Cánh Diều lớp 6 GCD example numbers — use canonical (48, 18) → 6 default?
- Đại số lesson: slider range for `a` and `b` — recommend `1 ≤ b ≤ a ≤ 10` to keep visual clean
- KaTeX font subset — load full or VN-friendly subset?
