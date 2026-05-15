# Brainstorm — Cool Demo Pages Round 2

- Date: 2026-05-15
- Mode: brutal-honesty advisory. No code in this round.
- Scope: pick the next 3 "cool demo" lessons after the 5-lesson baseline.
- Predecessors:
  - `plans/reports/brainstorm-260430-2207-improved-port-spec.md` (port spec, shipped)
  - `plans/reports/brainstorm-260503-1121-curriculum-logic-survey.md` (curriculum catalog, source-of-truth for `[next]/[later]/[YAGNI]` tags)
- Strategy inherited: C (lesson-driven, infra emerges)
- Autonomous mode — no clarifying questions asked, defaults applied (see §8).

## TL;DR

Ship three demos in one sub-project: **Pythagoras động (C)**, **Sàng Eratosthenes (A)**, **Đồ thị y=ax+b (D)**. They span 3 grades × 3 topics, force exactly 2 small new engine modules (`geom-engine/transforms.js`, `algebra-engine/linear.js`) and one tiny addition (`numtheory-engine/sieve.js`). Total ≈ 4-6 dev days. Defer transformations-suite (E), Pascal (F), fraction-pizza (B).

---

## 1 · Constraints inherited

| # | Constraint | Source |
|---|---|---|
| C1 | Vietnamese-first slugs; copy in `copy.vi.js` | port spec |
| C2 | Pure math engines under `src/lib/<topic>-engine/`, no DOM | port spec |
| C3 | Every draggable has keyboard + ARIA path | port spec |
| C4 | YAGNI: no scoring/persistence/quiz; no `algebra-engine` until 2nd consumer | survey §3 |
| C5 | Static-only deploy (GitHub Pages) — no server, no auth | survey §1.4 |
| C6 | Existing engine APIs stable — extend, don't fork | scout |
| C7 | No shared `<Slider>`/`<NumberInput>` until 2nd consumer surfaces | survey §3.1 |

---

## 2 · Candidate catalog

### A · Sàng Eratosthenes — `[6]` Số học
- URL: `/so-hoc/sang-eratosthenes/`
- Hook: 10×10 grid 1..100. Click prime → ripple cross-out of multiples. Stack 2,3,5,7 → primes pop out.
- Engine: `numtheory-engine/sieve.js` — `sieveUpTo(n)`, `multiplesOf(p,n)`. ~30 LOC, 8 tests.
- KaTeX: `\sqrt{n}` only.
- A11y: `role="grid"`, `gridcell` w/ aria-label, arrow-keys, `aria-live` announce.
- Effort: **S** · Wow: 🔥🔥🔥🔥 · Pedagogy: ⭐⭐⭐⭐ · Risk: LOW

### B · Phép cộng phân số — `[6]` Số học · DEFERRED
- Pizzas re-slice live to LCM denominator. Sum auto-aligns.
- Engine: `numtheory-engine/fraction.js`.
- Killed: SVG pie-arc math is sharp-edge land; ship a flatter visualization (bar-model only) in a later round.

### C · Định lý Pythagoras động — `[7]` Hình học
- URL: `/hinh-hoc/dinh-ly-pythagoras/`
- Hook: right triangle w/ three squares on sides. Drag right-angle vertex → squares + KaTeX update live. **"Chứng minh" button** plays 2s dissection-shear: two leg-squares slide-and-shear into the hypotenuse-square.
- Engine: `geom-engine/transforms.js` — `translate`, `rotate`, `shear`, `applyToPolygon`. ~50 LOC, 12 tests.
- KaTeX: `a^2 + b^2 = c^2`, side labels.
- A11y: vertex draggable + keyboard. Button respects `prefers-reduced-motion` (snap to final). `aria-live` announces a/b/c numerically.
- Effort: **M** · Wow: 🔥🔥🔥🔥🔥 · Pedagogy: ⭐⭐⭐⭐⭐ · Risk: MED (tween polish)

### D · Đồ thị y=ax+b — `[7]` Đại số
- URL: `/dai-so/duong-thang/`
- Hook: 2 sliders (a, b) + 2 anchor points draggable on the line — both directions bind. Optional "rise/run" triangle.
- Engine: `algebra-engine/linear.js` — `lineFromPoints`, `yAt`. ~20 LOC, 6 tests. **Trigger to officially open `algebra-engine/` module** (2nd consumer after `hieu-hai-binh-phuong`).
- KaTeX: `y = ax + b`, equation morphs live.
- A11y: sliders native; anchors keyboard-draggable; `aria-live` announces equation + 2 sample points.
- Effort: **M** · Wow: 🔥🔥🔥 · Pedagogy: ⭐⭐⭐⭐⭐ · Risk: LOW (bidirectional binding loop — gate via `untrack` or epsilon)

### E · Phép biến hình — `[8]` Hình học · DEFERRED
- Translate/rotate/reflect a polygon w/ stacked transforms + undo.
- Killed: too big for one shot (3 modes × a11y = L effort); ship `transforms.js` via C first, then promote E when the engine is battle-tested.

### F · Tam giác Pascal — `[8]` Đại số · DEFERRED
- Pascal triangle + binomial expansion.
- Killed: off-syllabus shape (VN grade 8 doesn't formalize `\binom{}{}`); combinatorics is `[9][YAGNI]` in survey.

---

## 3 · Trade-off matrix

| # | Wow | Pedagogy | Effort | Risk | Curriculum | Engine delta |
|---|-----|----------|--------|------|------------|--------------|
| A | 🔥🔥🔥🔥 | ⭐⭐⭐⭐ | S | LOW | ✅ `[6][next]` | `sieve.js` small |
| B | 🔥🔥🔥 | ⭐⭐⭐⭐⭐ | M | MED | ✅ `[6][next]` | `fraction.js` med |
| C | 🔥🔥🔥🔥🔥 | ⭐⭐⭐⭐⭐ | M | MED | ✅ `[7]→promote` | `transforms.js` med |
| D | 🔥🔥🔥 | ⭐⭐⭐⭐⭐ | M | LOW | ✅ `[7]→promote` | `algebra-engine/linear.js` small |
| E | 🔥🔥🔥🔥 | ⭐⭐⭐⭐ | L | HIGH | ✅ `[8][later]` | `transforms.js` med-large |
| F | 🔥🔥🔥🔥 | ⭐⭐⭐ | S-M | MED | ⚠️ off-syllabus | `binomial.js` small |

---

## 4 · Final recommendation (ranked)

| Rank | Pick | Rationale |
|---|---|---|
| 🥇 1 | **C — Pythagoras động** | Max wow × pedagogy. Dissection-shear is *the* canonical visceral proof. `transforms.js` pays dividends for future E. |
| 🥈 2 | **A — Sàng Eratosthenes** | Cheapest big-visual win. Zero engine churn. New click-grid interaction emerges naturally. Ships in 1 day. |
| 🥉 3 | **D — Đồ thị y=ax+b** | Triggers `algebra-engine/` officially. Bidirectional binding = real interactivity, not "another lesson". Foundational slope intuition. |

**Deferred**: B (arc-math complexity), E (too big this round), F (off-syllabus).

---

## 5 · Implementation considerations & risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | C's tween looks janky w/o easing tuning | Use Svelte `tweened` + cubic-out; reduced-motion = snap |
| R2 | D's bidirectional state binding loops | Gate with epsilon check before writing back; or `untrack` in derived |
| R3 | A's grid keyboard nav UX | Mirror gridcell pattern from WAI-ARIA APG; arrow + Home/End |
| R4 | `transforms.js` API drift when E lands | Keep it pure + stateless this round; add `compose` only when E forces it |
| R5 | KaTeX bundle already at ~280KB — no growth budget | These three don't add KaTeX features beyond what `<Tex>` exposes |
| R6 | Three lessons in parallel = 3× state surface | Each lesson independent; share nothing but engines |

---

## 6 · Success metrics

- 3 routes added: `/so-hoc/sang-eratosthenes/`, `/hinh-hoc/dinh-ly-pythagoras/`, `/dai-so/duong-thang/`
- 2 engine modules created (`geom-engine/transforms.js`, `algebra-engine/linear.js`) + 1 file added (`numtheory-engine/sieve.js`)
- ≥ 26 new unit tests (12 transforms + 8 sieve + 6 linear)
- `pnpm check` clean (svelte-check + JSDoc strict)
- `pnpm test` green (all existing + new tests)
- Each lesson: keyboard-only completion possible, `aria-live` announces state changes, `prefers-reduced-motion` honored
- Bundle delta < 20KB gzipped (no new deps)

---

## 7 · Suggested phase plan (input to /ck:plan)

```
Phase 01: engine — geom-engine/transforms.js              [blocks C]
Phase 02: engine — numtheory-engine/sieve.js              [blocks A]  (parallel w/ 01)
Phase 03: engine — algebra-engine/linear.js               [blocks D]  (parallel w/ 01,02)
Phase 04: lesson — /hinh-hoc/dinh-ly-pythagoras/          [needs 01]
Phase 05: lesson — /so-hoc/sang-eratosthenes/             [needs 02]
Phase 06: lesson — /dai-so/duong-thang/                   [needs 03]
Phase 07: registry + landing tiles                        [needs 04,05,06]
Phase 08: tests + a11y manual verify                      [needs 07]
```

Engine phases parallel. Lesson phases parallel after their engine. Total ≈ 4-6 dev days.

---

## 8 · Autonomous-mode defaults applied

| Q | Default chosen |
|---|---|
| C choreography | Dissection-shear (full visceral version) — Euclid-style. Reduced-motion = snap. |
| A grid size | 100 cells (10×10), no slider — ship-faster. Slider deferred. |
| D anchors | 2 anchors + 2 sliders, both-ways binding (max wow). |

User can override any default before /ck:plan starts.

---

## 9 · Open questions (carry forward)

1. Confirm Cánh Diều grade-7 textbook ordering for Pythagoras (typically chapter 2 or 3)? Affects sequencing once landing-page ordering matters (Sub-project §3.4).
2. After `transforms.js` lands, do we promote E (transformations suite) to "next batch", or keep `[later]`? Answer drives whether `compose` enters the engine.
3. `algebra-engine/` is now officially "born" — what's the 3rd consumer that justifies adding a `polynomial.js`? Survey suggests `[7][next]` poly add/sub/scale.

---

**Status:** DONE
**Summary:** Six candidates surveyed, three deferred (B/E/F) with explicit reasons, top-3 (C, A, D) ranked and justified, phase plan + risks + success metrics scoped. Ready for `/ck:plan`.
**Concerns:** R1 (animation polish) is the only one that can derail timeline; bake in 0.5 day of polish buffer for Phase 04.
