# Brainstorm — Improved port spec

- Pressure-tests: `plans/reports/xia-260430-2207-port-try-gstack.md`
- Mode: brutal-honesty advisory. No code.
- Date: 2026-04-30

## TL;DR — what xia got wrong

1. **URL/IA**: xia recommended `/<topic>/lop-N/<slug>/`. Wrong — premature 3-level depth for 3 lessons. Use `/<topic>/<slug>/` with grade as metadata.
2. **"svg-utils.js" lump**: xia merged pure math + DOM mutation + Svelte action into one util. They have different lifetimes/dependencies. Split into 3.
3. **`renderTicks` / `setLine` ported as imperative**: xia kept the imperative DOM-mutation shape. In Svelte you compute positions (pure) and render via `{#each}` — never `createElementNS`.
4. **`congruentSSSAnyPerm` "for future quizzes"**: YAGNI violation. Don't add until a consumer exists.
5. **Component split (`*.svelte` + `+page.svelte`)**: premature abstraction at 3 lessons. Inline logic in the route file until a second consumer appears.
6. **`@testing-library/svelte` "optional"**: drop entirely. Engine tests are pure; component tests deferred.
7. **A11y silent**: arrow-key vertex movement and `prefers-reduced-motion` are real gaps the source already has — don't carry them over.
8. **Palette underbaked**: didn't propose a Tailwind theme extension to name the tick colors as data.

xia got these *right*: engine port 1:1, drop `data-*` querying, drop `astro:before-swap`, defer KaTeX/WAAPI, keep JSDoc, ship Vitest, port engine tests, keep position-strict SSS for the badge.

## 1 · Component shape

**Decision**: lesson route owns state. Pointer wiring via `use:draggable` action. No sub-components for sides/ticks.

**Rejected — heavy decomposition** (`<DraggableVertex>`, `<TickMark>`, `<Side>`): premature for 3 lessons. `<line>` + attrs is shorter than wrapping it in a component.

**Rejected — separate `*.svelte` component imported by route**: xia suggested this. At 3 lessons with no second consumer, the route file IS the component. Move out only when something else needs to embed it.

**Adopted — flat route file**:
- `src/routes/<topic>/<slug>/+page.svelte` owns:
  - SVG markup
  - `$state` for vertices (one per draggable point)
  - `$derived` for sides, lengths, angles, congruence/similarity flags
  - `use:draggable={vertex}` on each draggable `<circle>`
  - Tick rendering via `{#each tickPositions(p1, p2, n) as t}<line .../>` 

**State granularity**:
```js
// per draggable point
let a = $state({ x: 60, y: 80 });
let b = $state({ x: 180, y: 80 });
// sides derived
let sides = $derived({
  ab: dist(a, b), bc: dist(b, c), ca: dist(c, a)
});
// flag derived
let congruent = $derived(congruentSSS(t1, t2));
```
Mutate vertex via `a.x = newX; a.y = newY`. No `$state.raw` (we want fine-grained reactivity on x/y).

**Action API**:
```js
// $lib/actions/draggable.svelte.js
// use:draggable={{ point, viewBox: {w,h}, projector?, padding? }}
// point: $state-bound {x,y}; mutated in place on pointer events
// projector: optional (raw)=>projected — used by inscribed-angle to snap to circle
// padding: clamp distance from viewBox edge (default 16; 0 disables)
```

The action handles `pointerdown/move/up/cancel`, `setPointerCapture`, `clientToSvg` math, optional projection, optional clamping. Returns Svelte action `{ destroy }` — no `AbortController` needed; Svelte cleans up.

## 2 · Shared utilities — three layers, not one

xia's "svg-utils.js" is wrong because it mixes concerns with different test surfaces and dependencies.

| Concern | Location | Pure? | Tested? |
| --- | --- | --- | --- |
| Tick positions math | `$lib/geom-engine/ticks.js` | yes | unit |
| Client→SVG coord conversion | `$lib/utils/svg.js` | needs DOMRect | not (trivial) |
| Pointer wiring + capture | `$lib/actions/draggable.svelte.js` | side-effectful | manual |

**Pure math shape**:
```js
// $lib/geom-engine/ticks.js
// tickPositions(p1, p2, count, opts?) → Array<{x1,y1,x2,y2}>
// Replaces source's `renderTicks`. Pure. Easy to test.
```
**Drop entirely**: `setLine` (replaced by template binding `<line x1={p1.x} y1={p1.y} ...>`), `createElementNS` (replaced by `{#each}`).

**Reject** `<TickMark>` Svelte component — pure overkill for one `<line>`.

## 3 · i18n shape — hybrid

**Adopted**: site chrome global, lesson copy colocated, central index re-exports.

```
src/lib/i18n/
  site.vi.js         // {site: {title, tagline, description}, hub: {...}, status: {...}}
  index.js           // exports t() — merges site + per-lesson via lesson registry

src/lib/lessons/
  registry.js        // { 'tam-giac-bang-nhau': { topic, grade, copy, component } }
  tam-giac-bang-nhau/
    copy.vi.js       // { vi: { title, intro, instruction, ... } }
  tam-giac-dong-dang/
    copy.vi.js
  goc-noi-tiep/
    copy.vi.js
```

**Rejected — single mega-`vi`**: xia tolerated this; brutal: it works at 3 lessons, dies at 10+. Translator pain (one giant file) is a hypothetical we'll never hit before adding a second locale.

**Rejected — separate i18n folder for every lesson**: too far. Each lesson exports its own copy module; central `t()` reads from registry. One indirection.

**Drop**: `type Locale = typeof vi`. Use plain object with string keys. When `en.js` exists, parallel-shape it manually (a missing key falls back to the slug, not a type error).

## 4 · URL / IA — `/<topic>/<slug>/`

**Adopted**:
- `/` — landing with 3 topic cards (current mathmax IA, just enable Hình học)
- `/hinh-hoc/` — topic page listing all geometry lessons, sortable/filterable by grade (UI tab, not URL)
- `/hinh-hoc/<slug>/` — lesson page (e.g. `/hinh-hoc/tam-giac-bang-nhau/`)
- Grade lives in the lesson's `copy.vi.js` and registry metadata; rendered as a badge on cards/headers.

**Rejected — `/<topic>/lop-N/<slug>/` (xia's pick)**: 3-level depth, premature. Twelve possible intermediate pages, only 3 lessons. URLs longer with no SEO benefit.

**Rejected — flat `/lop-N/<topic>-<slug>/`**: ugly compound slug. Mixes axes.

**Rejected — pure topic-only** without grade visible: students DO think "I'm in lớp 7." Surface grade as a card badge + filter; just don't put it in the URL.

**Vietnamese slugs**: keep them. `tam-giac-bang-nhau` is more readable than `sss-congruence` for the audience. Slugs are stable.

## 5 · KaTeX, WAAPI, Vitest

| Tool | v1 decision | Trigger to add |
| --- | --- | --- |
| Vitest | **include** | engine has tests already; mechanical port |
| KaTeX | **defer** | first lesson needing `\frac`, `\sqrt`, `\sum`, or matrix |
| WAAPI | **defer** | first multi-step animated proof or transitional state |
| `@fontsource/be-vietnam-pro` | **include** | mathmax already plans Vietnamese typography |
| `@testing-library/svelte` | **drop** | engine tests are DOM-free |
| `prettier-plugin-svelte` | **already in mathmax** | keep |
| `eslint` | **drop** | mathmax doesn't have it; YAGNI |
| `fast-check` (property tests) | **defer** | try-gstack noted "to be added with first canvas module" — same here, defer |

Add `npm test` script wiring Vitest. CI integration: out of scope for the port; the existing GitHub Pages action stays unchanged.

## 6 · Engine API — port-as-is, nothing more

**Adopted — exact 1:1 port** of:
- `vec.js`: vec, add, sub, scale, dot, len, dist, normalize, approxEqualLen, EPSILON_LEN, EPSILON_ANGLE_DEG
- `triangle.js`: triangle, sides, congruentSSS (position-strict)
- `circle.js`: circle, projectToCircle, pointOnCircle, angleAtVertex
- `ticks.js`: NEW — tickPositions (extracted from `renderTicks` mutation, returns positions)

**Rejected — `congruentSSSAnyPerm`** (xia suggested): YAGNI. No consumer in v1. Position-strict matches the colored-tick correspondence visible to the student.

**Rejected — `similarSAS`/`similarSSS`**: similarity v1 is a fixed scaler `k` slider; no comparison API needed. Add when free-drag similarity lesson lands.

**Rejected — adding `Triangle.area`, `centroid`, `circumcenter` etc.** for "completeness": YAGNI.

JSDoc `@typedef` for `Vec2`, `Triangle`, `Circle`, `SideLengths`. Use `@param`/`@returns` everywhere. `// @ts-check` not needed if `jsconfig.json` has `checkJs` (SvelteKit default true).

## 7 · JSDoc vs TS — JSDoc

**Adopted — JS + JSDoc throughout**. README declares "JS only"; honor it. svelte-check + JSDoc covers types in editor and CI. No `tsconfig.json`. No `.ts` files.

**Rejected — TS for engine only**: language inconsistency for marginal benefit. The engine is 130 LOC; JSDoc carries it.

## 8 · Palette — codify ticks as Tailwind theme

**Adopted**:
```js
// tailwind.config.js — extend
theme: {
  extend: {
    colors: {
      pair: {
        1: '#D7263D',  // Side AB ↔ A'B' — red
        2: '#1B998B',  // Side BC ↔ B'C' — teal
        3: '#F46036',  // Side CA ↔ C'A' — orange
      },
      brand: {
        DEFAULT: 'theme(colors.indigo.600)',  // chrome links/accents
      },
      success: 'theme(colors.emerald.600)',   // congruence badge
    },
  },
}
```

Lesson SVGs reference `class="stroke-pair-1"` / `text-pair-2`. Self-documenting. Brand chrome stays `text-indigo-600`. Badge uses `bg-emerald-50 text-emerald-700`.

## 9 · Additional gaps xia missed

### Accessibility

- **Arrow-key vertex movement**: source has `tabindex="0"` on M but no key handler. Add `keydown` handler in `draggable` action: arrow keys move ±2 px/step (or grid-snapped); shift+arrow = ±10. Each lesson page has a one-line instruction "Dùng phím mũi tên hoặc kéo điểm" beside the canvas.
- **ARIA**: each `<circle>` draggable point needs `role="slider"`, `aria-label="Đỉnh A — kéo hoặc dùng phím mũi tên"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` for the canvas viewBox. Readouts (lengths, angles) need `aria-live="polite"` so screen readers announce updates.
- **Reduced motion**: any future fade/transition gated on `@media (prefers-reduced-motion: no-preference)`.
- **Focus ring**: `focus-visible` outline on draggable circles.

### Mobile

- `touch-action: none` on the SVG (source has it; preserve).
- Pointer Events unify mouse/touch/pen (already chosen).
- Min vertex hit target: 14px radius (source uses 6 — too small for touch). Bump to 12-14 for v1.

### SEO/meta

- Per-lesson `<svelte:head>` with `<title>`, `<meta name="description">`, OG tags — extracted from copy module.
- `og:image` deferred (no image generator yet).
- Canonical URL via `$page.url`.

## 10 · Improved decision matrix (replaces xia §7)

| Decision | xia recommended | **Improved** | Why |
| --- | --- | --- | --- |
| Component shape | `*.svelte` + route | inline in route file | YAGNI; no second consumer |
| Shared utils | one `svg-utils.js` | 3-way split (engine/utils/action) | different concerns, lifetimes |
| `renderTicks` shape | port as imperative | rewrite as `tickPositions` (pure) + `{#each}` | no `createElementNS` in Svelte |
| i18n shape | colocate per-lesson | hybrid: site global + lesson colocated + registry | translator + encapsulation balance |
| URL | `/<topic>/lop-N/<slug>/` | `/<topic>/<slug>/` | premature depth |
| Grade in URL | yes | no — metadata + filter | not a navigation axis |
| Slug language | Vietnamese | Vietnamese | audience-readable |
| Engine API | strict + add perm-invariant | strict only | YAGNI |
| Type system | JSDoc | JSDoc | honor README |
| Vitest | include | include | tests exist |
| `@testing-library/svelte` | optional | drop | DOM-free engine |
| KaTeX/WAAPI | defer | defer | no v1 trigger |
| Palette | "reconcile" (vague) | Tailwind theme extension `pair-{1,2,3}` | semantic naming |
| A11y (arrow keys, ARIA) | not mentioned | required for v1 | source gap; we can fix it during port |
| Mobile hit target | 6px (source) | 12-14px | touch ergonomics |
| Animation | none v1 | none v1, gate future on `prefers-reduced-motion` | KISS + a11y |

## 11 · Final file plan (replaces xia §9)

**Create — engine**

```
src/lib/geom-engine/
  vec.js
  vec.test.js
  triangle.js
  triangle.test.js
  circle.js
  circle.test.js
  ticks.js
  ticks.test.js
  index.js                      # barrel
```

**Create — actions, utils, i18n**

```
src/lib/actions/draggable.svelte.js
src/lib/utils/svg.js            # clientToSvg
src/lib/i18n/site.vi.js
src/lib/i18n/index.js
```

**Create — lessons (each colocated)**

```
src/lib/lessons/
  registry.js
  tam-giac-bang-nhau/copy.vi.js
  tam-giac-dong-dang/copy.vi.js
  goc-noi-tiep/copy.vi.js
```

**Create — routes**

```
src/routes/hinh-hoc/+page.svelte                  # topic page (lesson list)
src/routes/hinh-hoc/tam-giac-bang-nhau/+page.svelte
src/routes/hinh-hoc/tam-giac-dong-dang/+page.svelte
src/routes/hinh-hoc/goc-noi-tiep/+page.svelte
```

**Create — config**

```
vitest.config.js
```

**Modify**

- `package.json` — add `@fontsource/be-vietnam-pro`, `vitest`. Scripts: `test`, `test:watch`.
- `src/routes/+page.svelte` — Hình học card → enabled, links to `/hinh-hoc/`. Số học / Đại số stay "Sắp ra mắt".
- `src/routes/+layout.svelte` — add `<svelte:head>` with default meta + lang, font import.
- `src/app.css` — Be Vietnam Pro family, body class.
- `tailwind.config.js` — pair colors, brand alias, success token, font family.
- `README.md` — lessons section + run `npm test`.

## 12 · Risk score (revised)

| Risk | xia | Improved spec |
| --- | --- | --- |
| Engine port | LOW | LOW |
| Lesson rewrite | MEDIUM | LOW-MEDIUM (less abstraction = less to break) |
| i18n re-shape | LOW | LOW |
| URL/IA | MEDIUM | LOW (simpler IA, less reshuffling later) |
| Decisions deferred (KaTeX/WAAPI) | LOW | LOW |
| A11y additions (NEW) | — | LOW (action handles it once, lessons inherit) |
| Mobile hit-target adjustment | — | LOW |

Overall: **LOW-MEDIUM**, down from MEDIUM.

## 13 · Open questions (for /ck:plan)

1. Topic page `/hinh-hoc/`: ship with grade-filter tabs in v1, or just a sorted list? Recommend list-only v1.
2. Be Vietnam Pro weights: source uses 400/500/700. Confirm same for mathmax to match design intent?
3. Landing card for "Số học" / "Đại số" stays disabled with "Sắp ra mắt"? (assumed yes)
4. Do we want `next/prev lesson` navigation footer, or bare? Source has hard-coded teaser strings; recommend deferring to a registry-driven nav after lesson 4.
5. Apache-2.0 LICENSE on mathmax vs unlicensed try-gstack — confirm we're keeping Apache-2.0 (per memory, that's the default).

---

**Status:** DONE
**Summary:** Improved spec ready for `/ck:plan`. 8 deviations from xia: simpler URL, 3-way utility split, pure tick math (not imperative), no premature engine extras, no `@testing-library/svelte`, route-inline lesson logic, palette as Tailwind theme, a11y baked in.
**Concerns:** Open question #4 (next/prev navigation) is a small UX call but affects each lesson's footer. Default to bare; revisit at lesson 4.
