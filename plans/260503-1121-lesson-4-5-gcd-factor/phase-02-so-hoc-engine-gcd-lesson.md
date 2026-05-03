---
phase: 2
title: "Số học engine + GCD lesson"
status: pending
priority: P1
effort: "6h"
dependencies: [1]
---

# Phase 02: Số học engine + GCD lesson (Ước chung lớn nhất)

## Overview
Build a pure `numtheory-engine` module (mirrors `geom-engine` shape) and ship the first số học lesson: a step-by-step Euclidean algorithm visualizer for `gcd(a, b)` with `lcm` derived from the result.

## Requirements
- Functional:
  - Two number inputs for `a, b` (1 ≤ a, b ≤ 999)
  - "Step" button advances Euclidean reduction one row at a time
  - "Tự động" button runs full reduction
  - "Khởi động lại" resets to current inputs
  - Final row shows `gcd(a, b) = N` highlighted
  - LCM formula + value displayed once gcd is found: `lcm(a,b) = (a·b)/gcd(a,b)`
- Non-functional:
  - Pure `gcdSteps(a, b)` returns the trace (no DOM coupling)
  - All terminology + example aligned to **Cánh Diều lớp 6 chương "Số tự nhiên"**
  - Vietnamese-first slugs and copy
- A11y:
  - Number inputs labeled (`<label for=>`)
  - Step button keyboard-focusable
  - `aria-live="polite"` on the reduction table
  - Each new row announced

## Architecture
- Engine is pure JS + JSDoc; sibling shape to `geom-engine`.
- `gcdSteps` returns an array of `{ a, b, q, r }` rows so the UI is pure render.
- Lesson page owns `$state` for input values + step index; uses `$derived` for current visible rows + lcm value.
- Goal-state pattern (documented inline): `goal(state) → { reached: state.stepIdx === steps.length, hint: ... }`. Not extracted to shared module — first instance.

## Related Code Files
- Create: `src/lib/numtheory-engine/gcd.js` — `gcd`, `lcm`, `gcdSteps`
- Create: `src/lib/numtheory-engine/gcd.test.js` — Vitest unit tests
- Create: `src/lib/numtheory-engine/index.js` — barrel export
- Create: `src/lib/lessons/uoc-chung-lon-nhat/copy.vi.js` — VN copy
- Create: `src/routes/so-hoc/uoc-chung-lon-nhat/+page.svelte` — lesson page
- Modify (Phase 04): `src/lib/lessons/registry.js`, root `+page.svelte`

## Implementation Steps

### 2.1 Engine
1. `gcd(a, b)`:
   ```js
   /** @param {number} a @param {number} b @returns {number} */
   export function gcd(a, b) {
     a = Math.abs(a); b = Math.abs(b);
     while (b !== 0) { [a, b] = [b, a % b]; }
     return a;
   }
   ```
2. `lcm(a, b)`:
   ```js
   /** Throws if both 0 (lcm undefined). */
   export function lcm(a, b) {
     if (a === 0 && b === 0) throw new Error('lcm(0,0) undefined');
     return Math.abs(a * b) / gcd(a, b);
   }
   ```
3. `gcdSteps(a, b)` returns `Array<{a:number, b:number, q:number, r:number}>`:
   - Each row: current pair before reduction, quotient `q = floor(a/b)`, remainder `r = a % b`
   - Terminates when `r === 0`; final row's `b` is the gcd
4. Tests: cover `gcd(48, 18) === 6`, `gcd(0, 5) === 5`, `gcd(7, 0) === 7`, `gcd(13, 17) === 1` (coprime), `lcm(4, 6) === 12`, `gcdSteps(48, 18)` produces expected 3-row trace.

### 2.2 Copy module
Create `copy.vi.js`:
```js
export const vi = {
  slug: 'uoc-chung-lon-nhat',
  topic: 'so-hoc',
  grade: 'lop-6',
  title: 'Ước chung lớn nhất (Thuật toán Euclid)',
  gradeLabel: 'Lớp 6',
  intro: 'ƯCLN của hai số là số lớn nhất chia hết cả hai. Thuật toán Euclid tìm nó bằng cách thay liên tiếp (a, b) bằng (b, a mod b) cho đến khi b = 0.',
  instruction: 'Nhập hai số rồi nhấn "Bước" để xem từng bước rút gọn',
  resultBadge: (g) => `ƯCLN = ${g}`,
  lcmLabel: 'Bội chung nhỏ nhất',
  theoremTitle: 'Thuật toán Euclid',
  theoremStatement: 'Với mọi a, b ≥ 0 (không cùng bằng 0): gcd(a, b) = gcd(b, a mod b). Khi b = 0, gcd = a.',
  exampleTitle: 'Ví dụ',
  exampleBody: 'Tìm ƯCLN(48, 18). Bước 1: 48 = 2·18 + 12. Bước 2: 18 = 1·12 + 6. Bước 3: 12 = 2·6 + 0. Vậy ƯCLN = 6.',
  nextTeaser: 'Sắp ra mắt: BCNN bằng phân tích thừa số nguyên tố',
};
```

### 2.3 Lesson page
- `+page.svelte` owns:
  - `let a = $state(48); let b = $state(18);`
  - `let stepIdx = $state(0);`
  - `let steps = $derived(gcdSteps(a, b));`
  - `let visibleSteps = $derived(steps.slice(0, stepIdx));`
  - `let g = $derived(stepIdx === steps.length && steps.length > 0 ? steps[steps.length - 1].b : null);`
  - `let l = $derived(g !== null && g !== 0 ? lcm(a, b) : null);`
- UI sections:
  1. Title + grade badge
  2. Intro paragraph
  3. Two number inputs (a, b) + reset button (resets stepIdx to 0)
  4. "Bước" button (disabled when stepIdx === steps.length); "Tự động" button (sets stepIdx = steps.length)
  5. `<table>` rendering `visibleSteps`: columns "a", "b", "q", "r" — header "a = q·b + r"
  6. When `g !== null`: highlighted result + `<Tex math={\`\\gcd(${a}, ${b}) = ${g}\`} display />`
  7. When `l !== null`: `<Tex math={\`\\text{lcm}(${a}, ${b}) = \\frac{${a} \\cdot ${b}}{${g}} = ${l}\`} display />`
  8. Theorem block + example (from copy)
  9. Next teaser

### 2.4 SEO meta
- `<svelte:head>` with `<title>{copy.title} — MathMax</title>`, `<meta name="description" content={copy.intro}>`, canonical URL via `$page.url`.

## Success Criteria
- [ ] `gcd.test.js` covers gcd, lcm, gcdSteps with 6+ assertions; all pass
- [ ] Lesson renders at `/so-hoc/uoc-chung-lon-nhat/` in dev + build
- [ ] Stepping through 48, 18 produces 3 rows ending in gcd=6
- [ ] LCM displays correct value (144 for 48,18) once gcd found
- [ ] Reset button restores stepIdx=0 + clears LCM display
- [ ] Number inputs validate (1-999); invalid input doesn't crash
- [ ] Keyboard nav: Tab through inputs → buttons; Enter triggers Step button
- [ ] svelte-check clean; vitest green

## Risk Assessment
- **Risk**: User enters 0 or negative → `gcdSteps` infinite loop or wrong output.
  **Mitigation**: Input `min=1 max=999`; `gcdSteps` defensive: if `b === 0` initial, return single row immediately.
- **Risk**: Cánh Diều lớp 6 may use specific notation (e.g. `ƯCLN(a,b)` vs `gcd(a,b)`).
  **Mitigation**: Copy uses `ƯCLN` per Vietnamese standard; KaTeX uses `\gcd` LaTeX command (renders as "gcd"). Add a one-line `\text{ƯCLN}` substitution if textbook check shows preference.
- **Risk**: Lesson page exceeds 200 LOC (modularization rule).
  **Mitigation**: If approaching, extract reduction `<table>` into a tiny `gcd-trace-table.svelte` component. Defer until needed.

## Notes
- No drag interaction in this lesson — just inputs + buttons + table. Doesn't touch `draggable.svelte.js`.
- Goal-state in this lesson is implicit: "all rows revealed → gcd shown → lcm shown." No formal `goal()` function v1; just `$derived`.
