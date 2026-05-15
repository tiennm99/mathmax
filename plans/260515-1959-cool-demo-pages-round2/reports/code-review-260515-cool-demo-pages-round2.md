---
type: code-review
slug: cool-demo-pages-round2
created: 2026-05-15
reviewer: code-reviewer (Staff)
---

# Code Review — Cool Demo Pages Round 2

## Verdict
**APPROVE_WITH_CONCERNS**

Ship as-is is defensible (no security/data risk; correctness solid on the math; tests + check + build all green). One real UX bug at slider extremes in the line lesson should be fixed in a follow-up commit before declaring the round "done". Two mild API footguns (cross-engine epsilon, unbounded sieve `n`) deserve docstring tightening but are not landing-blockers.

## Summary
The three lessons land cleanly. Engines are pure, well-typed, well-tested (29 new tests, 75/75 green). Pythagoras dissection math is geometrically correct — area parity AND tiling. Sàng grid handles concurrency safely (timeout cleanup on reset, ripple gate). Đường thẳng bidirectional binding terminates after one tick due to the rounding-step + epsilon combo, but the explicit `writingFromSlider`/`writingFromDrag` flags are dead code (synchronous toggles don't bridge async `$effect` runs). One UX-breaking bug: at b≥6 or a≥2 slider settings, anchors fly off-screen because Effect 1 writes pixel positions without clamping. YAGNI gates honored. Bundle delta 13.1 KB gz, well under 20 KB.

---

## Critical Issues
None blocking merge. The "off-screen anchor" bug is the closest call.

## High-Priority Concerns (fix in follow-up before round-2 retro)

### H1. Anchors fly off-screen in duong-thang when sliders push line outside ±10 y-band
**File:** `src/routes/dai-so/duong-thang/+page.svelte:45-51`

```js
$effect(() => {
  if (writingFromDrag) return;
  writingFromSlider = true;
  p1.y = my(yAt({ a, b }, ANCHOR1_X));   // no clamp
  p2.y = my(yAt({ a, b }, ANCHOR2_X));   // no clamp
  writingFromSlider = false;
});
```

**Repro:** Set slider `a=1, b=10` → anchor 2 (x=5) needs math-y=15 → SVG-y=`my(15)=30+(10-15)*18=−60`, off the top of the SVG viewBox. Set `a=5, b=10` → anchor 1 (x=-5) lands at math-y=-15 → SVG-y=480, off the bottom. The line still renders (it's drawn from xMin=-10 to xMax=10 and the visible portion crosses the box) but the **draggable anchors disappear**, breaking the second control mode the lesson advertises.

**Fix:** Either clamp the pixel write in Effect 1 to the SVG box, or — better — clamp the math y first so the user sees the anchor stuck to the visible boundary while the line continues out:

```js
const cy1 = Math.max(my(CLAMP_Y), Math.min(my(-CLAMP_Y), my(yAt({a,b}, ANCHOR1_X))));
p1.y = cy1;
// ditto for p2
```

Note this introduces an asymmetry the bidirectional gate must absorb: clamped pixel-y reverse-derives a different math-y, which round-trips to a DIFFERENT (a,b) than the slider, and Effect 2 will fight back. So the clamp logic needs to ALSO check "is the line going off-domain? then don't reverse-derive". Cleanest split: distinguish "slider drives" from "drag drives" as the source of truth and skip Effect 2's writes when the line is currently driven by sliders out of anchor range. Several reasonable shapes; pick one, write a test.

**Why this isn't a "critical" block:** The lesson is usable for the common-case slider settings (a ∈ [-2,2], b ∈ [-5,5]). And the bug doesn't crash — it just hides the anchors. But it's prod-visible the first time a user explores slider extremes, which is exactly the kind of "wow factor" use this lesson advertises.

### H2. Bidirectional-binding re-entrancy flags are dead code (misleading)
**File:** `src/routes/dai-so/duong-thang/+page.svelte:41-71`

```js
let writingFromSlider = false;
let writingFromDrag = false;

$effect(() => {
  if (writingFromDrag) return;          // ← always false when this effect runs
  writingFromSlider = true;
  p1.y = my(...); p2.y = my(...);
  writingFromSlider = false;            // ← reset BEFORE other effect runs
});

$effect(() => {
  // ...
  if (writingFromSlider) return;        // ← always false when this effect runs
  // ...
  writingFromDrag = true;
  a = newA; b = newB;
  writingFromDrag = false;
});
```

Svelte 5 `$effect`s run **asynchronously / batched**. The synchronous `flag = true; ...; flag = false;` pattern inside one effect cannot gate a sibling effect, because by the time the sibling effect's microtask runs, the flag is already back to `false`. **The actual gate is the `Math.round(*10)/10` + `EPSILON < 0.01` epsilon-compare in Effect 2** — that's the load-bearing termination check.

This isn't a bug today (the rounding gate works), but the dead flags are misleading future-maintainer-confusion fuel. Remove the flags entirely, lean on the rounding + epsilon, and write a comment that explains the convergence argument:
- Slider writes (a,b) → pixel y₁,y₂.
- Effect 2 reverse-derives (a',b') = round((line via 2 points) * 10)/10.
- Pixel-to-math conversion is exact at quantized grid positions, so a'==a, b'==b → epsilon check returns. Loop terminates in 1 tick.

### H3. Drag-overshoot grace: dragging an anchor at sub-pixel speed updates the visual anchor without updating the line
**File:** Same as H2.

When the user drags by a few pixels but the rounded slope hasn't moved by 0.1, Effect 2 returns without writing a/b, so Effect 1 doesn't fire, so `p1.y` stays at the dragged pixel position while the rendered line keeps using the old (a,b). The anchor visually detaches from the line briefly, then snaps when the drag crosses the next 0.1 threshold. Likely intended ("anchor snaps to slider grid") — but it looks like a glitch unless documented. **Add a one-line comment** explaining the design choice, or remove the rounding and let the slider's `step=0.1` constrain the slider while the line is continuous (this would let drag drive the line smoothly).

---

## Medium-Priority Concerns

### M1. `linear.js` `EPSILON_LEN` is pixel-space, mis-applied to math-space coordinates
**File:** `src/lib/algebra-engine/linear.js:14`

```js
if (Math.abs(p2.x - p1.x) < EPSILON_LEN) return null;  // EPSILON_LEN = 0.5
```

`EPSILON_LEN = 0.5` is documented in `geom-engine/vec.js` as a half-pixel SVG tolerance. Using it on math-space x-coordinates means "two points are 'vertical' if their x differ by less than 0.5 math units." For a Cartesian plane that goes -10..10, two math points at x=2.4 and x=2.7 would be considered the same line. Today's lesson uses fixed x = -5 and 5 (diff 10), so this doesn't bite. But the API is exported as a public engine function and the next consumer almost certainly won't use the same scale.

**Fix:** Inline a dimensionless math-space epsilon for this module (e.g. `const EPS_X = 1e-9`) or accept it as a parameter. Don't reuse `EPSILON_LEN` — its semantic is wrong here. The plan's R1 risk acknowledged the dependency but waved away the magnitude question.

### M2. `sieveUpTo(n)` has no upper-bound guard — DoS footgun for future callers
**File:** `src/lib/numtheory-engine/sieve.js:8-28`

```js
export function sieveUpTo(n) {
  const upper = Math.trunc(n);
  if (upper < 2) return { primes: [], composite: new Set() };
  const marks = new Uint8Array(upper + 1);   // ← `n = 1e9` allocates 1 GB
  ...
}
```

Today, the only consumer (`grid-interaction.svelte.js`) hard-codes 100. But the function is public on the engine barrel. If a future lesson takes user input or a URL param, an unbounded `n` allocates `n+1` bytes and walks the sieve — easy memory exhaustion. Also, `sieveUpTo(NaN)` / `sieveUpTo(Infinity)` silently return empty results (no error), which is forgiving but hides bugs.

**Fix options (pick one):**
- Document the budget: add `@param {number} n - integer in [0, 10_000_000]` and throw above it.
- Or cap silently: `const upper = Math.min(10_000_000, Math.trunc(n));`
- At minimum: add `if (!Number.isFinite(n)) return { primes: [], composite: new Set() };` so NaN/Infinity are explicit.

### M3. `duong-thang/+page.svelte` is 238 LOC — over the 200 LOC soft limit
**File:** `src/routes/dai-so/duong-thang/+page.svelte`

The CLAUDE.md modularization rule is a soft 200 LOC suggestion. The SVG markup is already extracted to `cartesian-plane.svelte` (130 LOC). The script section (~125 LOC) plus the template chrome (header + sliders + toggles + theorem prose) puts the top page at 238. Most of the residual is presentational markup; not refactor-critical. **Consider** extracting the sliders section into a small helper component if it grows, or accept the overrun and note that the rule was bent due to markup density (not logic complexity).

### M4. `shakeIndex` setTimeout is not tracked in `pendingTimeouts`
**File:** `src/lib/lessons/sang-eratosthenes/grid-interaction.svelte.js:47`

```js
if (!isPrime(n)) {
  shakeIndex = n - 1;
  setTimeout(() => { shakeIndex = null; }, 400);  // ← not in pendingTimeouts
  return;
}
```

If the user clicks a non-prime → starts a shake → clicks reset within 400 ms → `shakeIndex` becomes 0 (via `focusIndex = 0` path? no, reset sets `focusIndex` but not `shakeIndex`). Then 400 ms later, `shakeIndex = null` from the orphan timeout. Minor: in the corner case the wrong cell may animate briefly post-reset. Track the shake timeout the same way you track ripple timeouts.

### M5. Cell "1" `aria-disabled` but click handler still active
**File:** `src/routes/so-hoc/sang-eratosthenes/+page.svelte:87`, `grid-interaction.svelte.js:44-49`

`aria-disabled="true"` on cell 1 announces "disabled" to screen readers, but the click handler still fires `handleCellActivate(1)` → `isPrime(1) === false` → shake. Inconsistent: SR users hear "disabled, can't activate"; sighted users see a shake. Either (a) wire a true disable in the click handler (early return when `n === 1`), or (b) drop the `aria-disabled` and let the shake be the universal "not a prime" feedback. Pick one path.

---

## Low-Priority / Nits

- `transforms.js:30` — In `rotate(theta, center)`, `compose(translate(-c.x,-c.y), rotateMat, translate(c.x,c.y))` reads as "translate to origin, rotate, translate back" — correct per compose's left-to-right semantic. Worth a one-line comment so the reader doesn't have to walk through the compose convention.

- `transforms.js:48-51` — `compose(...)` JSDoc says "applying it to a point p means C(B(A(p)))" — that's correct given the implementation `reduce((acc, m) => multiply(m, acc))` which computes `M_n · ... · M_2 · M_1`. The wording is precise; reader-friendly bonus would be to ALSO say "i.e. the matrix you get can be passed once to `applyToPoint` and it yields the same result as applying A, B, C in sequence."

- `transforms.js:11` — `Object.freeze` on the IDENTITY array is good defensively, but it's then `.slice()`d on every `compose()` zero-arg call. Tiny perf nit; could just `[1,0,0,0,1,0,0,0,1].slice()` inline OR return the frozen array directly and rely on callers not mutating. Either is fine; the current code is correct.

- `sieve.js:14` — Loop bound `i * i <= upper` is correct; covers up to √upper inclusive. Good.

- `geom-helpers.js:48-51` — `nx = a, ny = -b` (without dividing by c, then scaled by c) is mathematically equivalent to `(a/c, -b/c) * c` but the variable names suggest "normal x/y" when they're actually "normal-scaled-by-c". The comment in the helper clarifies but a one-liner explaining "we skip the /c and the *c cancellation" would help.

- `dinh-ly-pythagoras/+page.svelte:81-86` — The DEV-mode area-mismatch assertion checks `|a² + b² - c²|` which is always 0 by construction (since `c = Math.hypot(a, b)`). It's not actually validating the dissection geometry. If the goal is to validate the SHEAR target areas, compare against `applyToPolygon` outputs or compute polygon areas directly. As written, the assertion fires on `1e-15` float fuzz at best and is otherwise dead.

- `grid-interaction.svelte.js:36` — `cellRefs = $state(new Array(100).fill(null))` — typed as `HTMLButtonElement[]` but starts as `null[]`. JSDoc lying mildly. Not failure-mode-causing because the page uses `cellRefs[next]?.focus()` with optional chaining, but future grep "this can't be null" misreads. Tighten the type or `?? null`.

- `+page.svelte` aria-live regions are placed AFTER `<main>` in two of three lessons (Sàng, Đường thẳng) but INSIDE the article in Pythagoras. Cosmetic inconsistency; both placements work. Pick one.

- README architecture line still references `gcd, lcm, gcdSteps` for `numtheory-engine` AND lists `sieve` — consistent. ✓

---

## Test Coverage Assessment

**29 new tests added (target ≥ 26).** Breakdown matches plan:
- `transforms.test.js`: 13 tests covering translate, rotate (origin + custom center + round-trip), shear (both axes), compose (zero-args + order), applyToPolygon (count + non-mutation), approxEqualMat (tolerance + rejection). ✓ Solid.
- `sieve.test.js`: 10 tests covering `sieveUpTo` (n<2, n=2, n=10, n=100 with 91/97 oracle), `multiplesOf` (basic + boundaries + guards), `isPrime` (negative + 0/1/2 + composite 91). ✓ Solid.
- `linear.test.js`: 6 tests, matches plan exactly. ✓

**Gaps:**
- No test for `compose` with 1 argument (returns that matrix). Currently `compose(m)` would `reduce` with no initial — wait, `[m].reduce((acc, x) => multiply(x, acc))` reduces a single-element array to that element, no `multiply` calls. Returns `m` as-is. Correct, but untested.
- No test for `applyToPolygon([])` (empty polygon). Returns `[]`. Correct, untested.
- No test verifies that `Mat3` from `compose(rotate, translate, etc.)` matches an independently-computed expected matrix element-wise. Equal "after applying to a point" is tested; the matrix-form itself isn't.
- `multiplesOf` doesn't cover floats: `multiplesOf(2.5, 100)` — truncates to 2 — undocumented but reasonable. Worth a comment.
- `lineFromPoints` cross-engine epsilon issue (M1) has no test catching the wrong-magnitude semantic.

None of these gaps changes the verdict; they're "add when you next touch the file" items.

---

## A11y Assessment

| Lesson | Keyboard | aria-live | reduced-motion | Color-not-sole | Verdict |
|---|---|---|---|---|---|
| Pythagoras | ✅ vertex `role=button tabindex=0` + arrow via `draggable.keyStep:1`/`keyShiftStep:10` + `aria-label` | ✅ debounced 300 ms | ✅ tween duration → 0 when `prefers-reduced-motion: reduce` | N/A (geometry, not categorical color) | **GOOD** |
| Sàng | ✅ roving tabindex on 100-cell grid, Arrow/Home/End, Enter triggers via native `<button>` | ✅ ripple announces multiples | ✅ batch update with 0 stagger | ⚠️ Dots are `aria-hidden` but the cell `aria-label` does spell out "bội của 2 và 3" — text fallback present | **GOOD** with minor inconsistency (M5 above) |
| Đường thẳng | ✅ native `<input type="range">` sliders + anchor `role=button tabindex=0` with arrow via `keyStep: U` (= 0.1 slider step exactly) | ✅ texMath debounced 300 ms | N/A (no animations; CSS only has `transition-colors` on buttons — color, not motion) | N/A | **GOOD** but see H1 (off-screen anchors) |

The roving-tabindex on the 100-cell grid is correct: a single cell holds `tabindex=0`, all others are `-1`, focus moves via arrow keys with `e.preventDefault()` to suppress page scroll. Home/End restricted to row (per ARIA grid pattern). Page-up/down NOT implemented; acceptable for this lesson size.

`prefers-reduced-motion` is checked at module-load time via `window.matchMedia(...).matches`. This is a **snapshot** — if the user toggles the OS setting after page load, behavior won't update. Acceptable for the round; a future improvement is to listen to the `MediaQueryList.change` event.

aria-label for cells correctly includes Vietnamese diacritics and reads sensibly: "14 — bội của 2 và 7". ✓

---

## YAGNI Compliance Assessment

| Gate | Status |
|---|---|
| No shared `<Slider>` / `<NumberInput>` | ✅ Đường thẳng uses native `<input type="range">` only |
| No scoring / persistence / hint UI | ✅ Verified — no localStorage, no score state, no hint button |
| No animation library | ✅ Only Svelte built-in `tweened` + `cubicOut` (already in core) |
| No new npm dependencies | ✅ `package.json` + `pnpm-lock.yaml` untouched (verified via `git diff`) |
| No EN locale / dark mode / sitemap | ✅ |
| No stacked-transforms / generic transformation lib | ✅ `transforms.js` exposes exactly translate/rotate/shear/compose; no more |

`algebra-engine/` is born this round per the "2nd-consumer rule" trigger. Module shape mirrors the other engines cleanly (single `index.js` barrel, single file `linear.js`, single test file). Five JSDoc-typed functions; no premature abstraction. ✓

---

## Bundle / Perf Notes

Bundle sizes (gzipped, from `pnpm build`):
- `pythagoras/_page.svelte.js`: 5.70 KB gz
- `sang-eratosthenes/_page.svelte.js`: 3.63 KB gz
- `duong-thang/_page.svelte.js`: 3.80 KB gz
- **Total delta: ~13.1 KB gzipped — well under 20 KB target** ✓

No tree-shaking issues observed; engine barrels re-export individually so per-page imports stay minimal.

Perf observations:
- Pythagoras tween at 2000 ms / cubicOut feels appropriate; tween writes to `tp` which derives via `$derived` to polygon vertices (Svelte's batched effect runner keeps this at one repaint per frame).
- Sàng ripple uses `setTimeout` per cell at 30 ms stagger; max ripple is `multiplesOf(2, 100) = 49` cells → ~1.5 s. Each tick creates a new Map (`new Map(crossings)`) — O(n) on n already-marked cells. For 49 multiples × ~25 prior cells worst case = ~1225 ops. Fine.
- Đường thẳng grid renders 21 vertical + 21 horizontal grid lines × 2 `<line>` per (per gridLines loop pattern) = 42 lines. Plus 11 axis labels × 2 = 22 `<text>`. Tiny.

---

## Engine Correctness Sanity Checks (extra)

I worked through the Pythagoras dissection by hand because the plan flagged it as the most likely failure point. **The math is right:**

- `altitudeFoot(A, H, a, c)` computes F = A + (a²/c²)·(H−A). With H−A = (b, a) (since legs are axis-aligned and A above-R, H right-of-R), the parametric coefficient `t = a²/c²` follows from dropping perpendicular from R to AH; verified.
- `squareC` outward-normal direction: AH direction is (b/c, a/c); perpendicular CW (away from R, since R is on the CCW side of AH given a,b>0) is (a/c, −b/c). Helper stores it pre-scaled-by-c as (a, −b). Net offset of length c. ✓
- `shearATarget` parallelogram area: base |AF| = (a²/c²)·|H−A| = (a²/c²)·c = a²/c; height = |(a,−b)| = c; area = a²/c · c = **a²**. ✓
- `shearBTarget` area: base |FH| = (1 − a²/c²)·c = (c² − a²)/c = b²/c; height c; area = **b²**. ✓
- Combined: a² + b² = c² = area(squareC); they tile squareC because they share edge AF→A+(a,−b)→F+(a,−b)→FH along the altitude line extended into the square. ✓

Vertex correspondence in `lerpPoly` between `squareA → shearATarget` keeps A pinned (index 0). The other 3 vertices slide along reasonable paths. The animation will read as "leg-square pivots around A and shears into the rectangle". ✓

The DEV-only `import.meta.env.DEV` assertion at `+page.svelte:81-86` checks `|a² + b² − c²| > 0.01` — but `c = Math.hypot(a, b)` so this difference is always 0 modulo float fuzz (~1e-15). The assertion validates nothing meaningful. **Nit:** swap it for an area-of-shearA + area-of-shearB ≈ area-of-squareC check that uses an actual polygon area routine.

---

## Unresolved Questions

1. **H1 fix shape** — when sliders push line outside the anchor-y clamp range, should:
   - (a) anchors clamp to box edges (visible but no longer on the line), or
   - (b) anchors hide (current de-facto behavior, but off-screen rather than `display:none`), or
   - (c) the lesson constrain slider ranges to never produce out-of-band anchor positions (e.g., couple `b`'s range to `a`)?
   
   Pick before next round.

2. **H3 design choice** — should anchor drag snap to slider 0.1 grid (current; with visible "snap" feel) or drive the line continuously (smoother feel but slider thumb drifts off-grid)?

3. **M2 sieve cap** — what's the largest `n` the engine should support? `n=1000` for a future "primes up to 1000" lesson is fine. `n=1e6` is questionable. Pick a documented cap.

4. The README still says "5 bài đã ra mắt" → updated to "8 bài". ✓ (Confirmed in diff.)

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Three lessons land cleanly, math is correct, tests + check + build all green, no security/YAGNI violations. One real UX bug (anchors off-screen at slider extremes in duong-thang) and three API/code-hygiene concerns (dead re-entrancy flags, wrong-domain epsilon in linear.js, unbounded sieve n) should be patched soon but don't block landing.
