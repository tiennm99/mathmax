---
phase: 3
title: "Đại số factor a²-b² lesson"
status: pending
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 03: Đại số — Hiệu hai bình phương (a² − b² visualizer)

## Overview
Interactive geometric proof of `a² − b² = (a + b)(a − b)`. Two sliders set `a` and `b`; SVG shows the L-shape (square `a²` minus corner square `b²`) being rearranged into a rectangle of `(a+b) × (a−b)`. KaTeX renders the formula with live numeric values.

## Requirements
- Functional:
  - Slider for `a` (range 2-10), slider for `b` (range 1-10, capped at `a`)
  - SVG shows side-by-side: (1) big square with corner cut, (2) rearranged rectangle
  - Numeric panel: `a² = N`, `b² = N`, `a² - b² = N`, `(a+b)(a-b) = N`
  - KaTeX displays: `a^2 - b^2 = (a+b)(a-b)` with current numbers substituted
  - Edge case `b = a` → both sides = 0; show degenerate state without crashing
- Non-functional:
  - No new engine module (algebra is `a*a - b*b`; YAGNI)
  - Aligned to Cánh Diều lớp 7 chương "Hằng đẳng thức đáng nhớ"
- A11y:
  - Sliders have `<label>` + `aria-valuetext` (e.g. "a bằng 5")
  - Numeric panel has `aria-live="polite"`
  - Reduced motion: no transitions when `prefers-reduced-motion: reduce`

## Architecture
- Pure render lesson — no draggable, no engine module needed.
- Math fits inside the lesson page; `a*a - b*b` is too small to extract.
- SVG viewBox sized to fit `a + b ≤ 20` worst case; use `viewBox` units = math units * 20px.
- Two SVG groups side-by-side, both inside one `<svg>`. CSS Grid for layout.

## Related Code Files
- Create: `src/lib/lessons/hieu-hai-binh-phuong/copy.vi.js`
- Create: `src/routes/dai-so/hieu-hai-binh-phuong/+page.svelte`
- Read for pattern: `src/routes/hinh-hoc/tam-giac-bang-nhau/+page.svelte` (existing SVG lesson shape)
- Modify (Phase 04): `src/lib/lessons/registry.js`, root `+page.svelte`

## Implementation Steps

### 3.1 Copy module
```js
export const vi = {
  slug: 'hieu-hai-binh-phuong',
  topic: 'dai-so',
  grade: 'lop-7',
  title: 'Hiệu hai bình phương',
  gradeLabel: 'Lớp 7',
  intro: 'Hằng đẳng thức a² − b² = (a + b)(a − b). Kéo thanh trượt để thấy vì sao hình vuông cạnh a, cắt đi góc b, có cùng diện tích với hình chữ nhật (a+b)(a−b).',
  instruction: 'Kéo hai thanh trượt để chọn a và b (với b ≤ a)',
  identityTitle: 'Hằng đẳng thức',
  identityStatement: 'Với mọi số thực a, b: a² − b² = (a + b)(a − b).',
  exampleTitle: 'Ví dụ',
  exampleBody: 'Tính 7² − 3². Áp dụng hằng đẳng thức: 7² − 3² = (7+3)(7−3) = 10 · 4 = 40. Cũng có thể tính trực tiếp: 49 − 9 = 40.',
  numericTitle: 'Giá trị',
  rearrangeNote: 'Phần hình chữ L (diện tích a² − b²) được cắt và ghép lại thành hình chữ nhật cạnh (a + b) × (a − b).',
  nextTeaser: 'Sắp ra mắt: (a + b)² và (a − b)²',
};
```

### 3.2 Lesson page state
```js
let a = $state(5);
let b = $state(2);
// keep b ≤ a:
$effect(() => { if (b > a) b = a; });

let aSq = $derived(a * a);
let bSq = $derived(b * b);
let diff = $derived(aSq - bSq);
let product = $derived((a + b) * (a - b));  // always === diff; shown for pedagogy
```

### 3.3 SVG layout

Two diagrams in one `<svg>`:

**Left diagram — square minus corner**:
- Big square: `<rect x=0 y=0 width=a*U height=a*U>` where `U = 20px`
- Cut corner: `<rect x=(a-b)*U y=0 width=b*U height=b*U fill="white">`
- Labels: "a" along top + left; "b" on the cut edges

**Right diagram — rearranged rectangle**:
- Two pieces side-by-side: top piece `(a-b) × (a+b)` rotated/translated to form `(a+b) × (a-b)`
- v1 simplification: just draw the result rectangle `(a+b) × (a-b)` with the two regions colored differently to show the L-shape parts. Don't animate the rearrangement (WAAPI deferred per port spec).
- Labels: "a + b" along width; "a − b" along height

Color tokens (extend `tailwind.config.js` if needed):
- L-shape part 1 (top strip): `pair-1`
- L-shape part 2 (right strip): `pair-2`
- Removed corner: white/transparent

### 3.4 KaTeX panel
```svelte
<Tex display math={`${a}^2 - ${b}^2 = (${a}+${b})(${a}-${b}) = ${diff}`} />
```
Plus a static formula card:
```svelte
<Tex display math="a^2 - b^2 = (a+b)(a-b)" />
```

### 3.5 SEO meta
- Same pattern as Phase 02: `<svelte:head>` with title/desc/canonical.

## Success Criteria
- [ ] Lesson renders at `/dai-so/hieu-hai-binh-phuong/`
- [ ] Sliders update both diagrams + numeric panel + KaTeX in real time
- [ ] `b > a` is auto-corrected via `$effect` (not visible to user as glitch)
- [ ] `a = b` degenerate case renders without overlap or NaN
- [ ] Reduced-motion respected (no transitions if user prefers it)
- [ ] svelte-check clean

## Risk Assessment
- **Risk**: SVG rearrangement might be confusing without animation.
  **Mitigation**: Static side-by-side with text annotation `rearrangeNote`. Animation in v2.
- **Risk**: Sliders on touch devices may be too small.
  **Mitigation**: Native `<input type="range">` is fine on mobile; add `accent-color` Tailwind class for theming.
- **Risk**: Slider $effect to clamp `b ≤ a` may cause feedback loop.
  **Mitigation**: `$effect` only writes when `b > a` (guard); Svelte 5 batches; tested manually.
- **Risk**: Page exceeds 200 LOC.
  **Mitigation**: Likely tight; if it grows, extract `<square-cut-svg>` and `<rectangle-svg>` as small components. Defer until needed.

## Notes
- Goal-state for this lesson: implicit (sandbox). User experiments freely. No `goal()` function needed.
- KaTeX `<Tex>` is the only place we render math text. Don't manually compose math with HTML `<sup>`.
- Slider primitive stays raw `<input type="range">` — extracting `<Slider>` is YAGNI at first use.
