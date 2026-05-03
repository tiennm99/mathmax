---
phase: 5
title: "Test + a11y verify"
status: pending
priority: P2
effort: "3h"
dependencies: [4]
---

# Phase 05: Test + a11y verify

## Overview
Run full quality gate before declaring lessons 4 + 5 shippable: Vitest, svelte-check, build, and manual keyboard/screen-reader pass on both new lessons.

## Requirements
- Functional: build passes; all tests green; routes prerender to static HTML
- Non-functional: bundle size delta logged; KaTeX impact documented
- A11y: keyboard nav verified; ARIA-live announcements work; reduced-motion respected

## Architecture
N/A — verification phase.

## Related Code Files
- Modify (if issues found): any lesson files, draggable action, Tex component
- Modify: `README.md` — add new lessons to status section
- Possibly modify: `RUNBOOK.md` — note KaTeX bundle impact

## Implementation Steps

### 5.1 Automated checks
1. `npm run check` — must be 0 errors, 0 warnings
2. `npm run test` — must be all green; verify new `gcd.test.js` runs
3. `npm run build` — must succeed; check `build/` for:
   - `/so-hoc/uoc-chung-lon-nhat/index.html` exists, contains rendered KaTeX HTML
   - `/dai-so/hieu-hai-binh-phuong/index.html` exists, contains rendered KaTeX HTML
   - `/so-hoc/index.html`, `/dai-so/index.html`, root `index.html` present
4. `npm run preview` — smoke-test all routes manually

### 5.2 Bundle size delta
- Note `build/_app/` total size before this plan vs after
- Specifically: KaTeX JS chunk + CSS + fonts
- Expected: ~300KB gzipped delta
- Document in `plan.md` Success Criteria

### 5.3 Manual a11y pass — GCD lesson
1. Tab through page: number a → number b → reset → bước → tự động
2. Enter on bước advances one row; aria-live announces new row
3. Screen reader (use VoiceOver or NVDA) announces final gcd correctly
4. Increase browser font size 200% — layout doesn't break

### 5.4 Manual a11y pass — Diff-of-squares lesson
1. Tab to slider a → arrow keys change value → aria-valuetext announces "a bằng N"
2. Tab to slider b → same
3. Numeric panel updates announced (aria-live)
4. Enable `prefers-reduced-motion: reduce` (DevTools rendering tab) → no transitions visible
5. SVG has `aria-label="Sơ đồ hiệu hai bình phương"` (or similar)

### 5.5 Mobile / touch check
1. Open dev URL on phone or DevTools mobile emulation (iPhone 12)
2. GCD lesson: tap number inputs, native keypad shows; buttons big enough to tap
3. Factor lesson: drag sliders with finger; numbers update smoothly
4. No horizontal scroll on either page

### 5.6 Sandbox cleanup
- Decide: delete `/__sandbox/katex/` route OR guard with `import { dev } from '$app/environment'; if (!dev) error(404)`
- Recommend: delete; it served Phase 01 purpose

### 5.7 README update
Update `README.md` Status section:
```md
## Status

3 bài hình học + 2 bài đầu tiên cho số học và đại số đã ra mắt.

- Lớp 6 — Ước chung lớn nhất (Euclid): `/so-hoc/uoc-chung-lon-nhat/`
- Lớp 7 — Hiệu hai bình phương: `/dai-so/hieu-hai-binh-phuong/`
- Lớp 7 — Tam giác bằng nhau (SSS): `/hinh-hoc/tam-giac-bang-nhau/`
- Lớp 8 — Tam giác đồng dạng: `/hinh-hoc/tam-giac-dong-dang/`
- Lớp 9 — Góc nội tiếp: `/hinh-hoc/goc-noi-tiep/`
```

### 5.8 RUNBOOK note
Add KaTeX bundle impact note to `RUNBOOK.md` under a "Bundle" or "Performance" section (create if absent).

## Success Criteria
- [ ] All automated checks green (check, test, build, preview)
- [ ] Bundle delta logged with actual KB number
- [ ] Manual a11y pass complete on both new lessons (no findings, or findings filed in next plan)
- [ ] Mobile/touch smoke test passes
- [ ] Sandbox route removed or dev-guarded
- [ ] README + RUNBOOK updated
- [ ] No regressions in 3 existing geometry lessons (open each, verify drag still works)

## Risk Assessment
- **Risk**: KaTeX SSR may produce hydration warnings.
  **Mitigation**: Captured in Phase 01; if it surfaces here, escalate.
- **Risk**: Bundle delta exceeds 400KB gzipped (KaTeX is heavier than estimated).
  **Mitigation**: Acceptable for math site; note in RUNBOOK; consider per-route lazy load in a future plan if Lighthouse perf drops below 90.
- **Risk**: Manual a11y findings = blockers.
  **Mitigation**: If found, fix in this phase; don't punt to next plan.

## Notes
- This phase is pure verify — no new features. Stay disciplined.
- Don't add tests "for completeness" beyond gcd-engine. Lesson page integration tests are deferred (port spec §5: `@testing-library/svelte` is dropped).
