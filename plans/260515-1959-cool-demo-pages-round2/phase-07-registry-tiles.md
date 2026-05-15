---
phase: 7
title: "Registry + landing tiles + README"
status: pending
priority: P2
effort: "2h"
dependencies: [4, 5, 6]
---

# Phase 07: Registry + landing tiles + README

## Overview
Wire the three new lessons into the registry, topic landing pages, root hub, and update README. No behavior changes — just glue.

## Requirements
- All three copy modules registered in `src/lib/lessons/registry.js`
- All three lessons appear on their topic landing (`/so-hoc/`, `/dai-so/`, `/hinh-hoc/`)
- Root landing tile counts and "latest" hints reflect 8 total lessons
- README updated with new lessons listed under Status

## Architecture
`registry.js` exports `lessons` array; topic landings filter via `lessonsByTopic`. No schema change required — existing fields (`slug`, `topic`, `grade`, `title`, etc.) suffice.

Ordering rule from existing code: by topic (số học → đại số → hình học), then grade ascending. New ordering after merge:

```
1. uoc-chung-lon-nhat        (so-hoc, lop-6)
2. sang-eratosthenes         (so-hoc, lop-6)  ← NEW
3. hieu-hai-binh-phuong      (dai-so, lop-7)
4. duong-thang               (dai-so, lop-7)  ← NEW
5. dinh-ly-pythagoras        (hinh-hoc, lop-7) ← NEW
6. tam-giac-bang-nhau        (hinh-hoc, lop-7)
7. tam-giac-dong-dang        (hinh-hoc, lop-8)
8. goc-noi-tiep              (hinh-hoc, lop-9)
```

(Within same grade+topic, lessons sort by `slug` alphabetically — confirm during impl.)

## Related Code Files
- Modify: `src/lib/lessons/registry.js` — import three new copy modules, append to array
- Modify: `src/routes/so-hoc/+page.svelte` — no change needed if it iterates `lessonsByTopic('so-hoc')` (verify during phase)
- Modify: `src/routes/dai-so/+page.svelte` — same
- Modify: `src/routes/hinh-hoc/+page.svelte` — same
- Modify: `README.md` — bump count "5 bài đã ra mắt" → "8 bài đã ra mắt"; add three new URL bullets

## Implementation Steps
1. Open `registry.js`, add three imports + three array entries
2. Run `pnpm dev` and visually verify each topic landing now lists the new lesson
3. If topic landing uses hard-coded array instead of `lessonsByTopic`, refactor to use `lessonsByTopic` (consult phase-04-registry-landing-glue.md from predecessor plan for the pattern)
4. Update root `+page.svelte` if it shows a count or "latest 3" hint (read first to confirm)
5. Update README.md status section + URL list
6. Run `pnpm check` + `pnpm build` to confirm prerender succeeds for new routes

## Success Criteria
- [ ] `/so-hoc/` lists 2 lessons (gcd, sàng)
- [ ] `/dai-so/` lists 2 lessons (hiệu hai bình phương, đường thẳng)
- [ ] `/hinh-hoc/` lists 4 lessons (Pythagoras, SSS, đồng dạng, góc nội tiếp)
- [ ] Root landing tile labels remain `live` for all 3 topics
- [ ] README count + URLs updated
- [ ] `pnpm build` clean (all 9 routes prerender: root + 3 topic + 8 lessons)
- [ ] No regressions on existing 5 lessons

## Risk Assessment
- **R1 — Topic landing hard-codes lessons**: predecessor plan introduced glue; verify current `/so-hoc/+page.svelte` etc. iterate the registry, not hard-code. If hard-coded, this phase grows by ~1 hour
- **R2 — Ordering ambiguity within same topic+grade**: confirm slug-alphabetical OR add explicit `order` field (defer — survey §3.4 marks this `[later]`)
