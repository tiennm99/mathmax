# Xia Report — Port try-gstack → mathmax

- Source: `/config/workspace/tiennm99/try-gstack` (commit: workdir, v0.0.4.0)
- Target: `/config/workspace/tiennm99/mathmax` (workdir, v0.0.1.0)
- Mode: `--port` (rewrite idiomatically). Stop at report; brainstorm next.
- Date: 2026-04-30

## TL;DR

try-gstack ships 3 working SGK lessons + a tested geom-engine on Astro/TS. mathmax is a SvelteKit/JS scaffold. Stack mismatch is moderate (SSG → SSG, Vite under both). Port the engine 1:1 (pure module), rewrite each lesson as a Svelte component, replace the imperative `setupX(selector)` + `data-*` querying pattern with reactive `$state`/`$effect`. Drop the `astro:before-swap` teardown hook entirely (SvelteKit handles unmount). Several design smells worth fixing before porting — see Challenge.

## 1 · Source manifest

| File | LOC | Role |
| --- | --- | --- |
| `src/geom-engine/vec.ts` | 48 | Pure 2D vector math — Vec2, add/sub/scale/dot/len/dist/normalize, ε constants |
| `src/geom-engine/triangle.ts` | 41 | Triangle + sides + position-strict SSS congruence |
| `src/geom-engine/circle.ts` | 40 | Circle, projectToCircle, pointOnCircle, angleAtVertex |
| `src/geom-engine/*.test.ts` | ~250 | Vitest unit suites for vec/triangle/circle |
| `src/components/congruence-sss.ts` | 213 | Lop-7: 6 draggable vertices, 2 triangles, ticks, congruence badge |
| `src/components/similarity-scale.ts` | 209 | Lop-8: 1 fixed △, 1 scaled △ via `k` slider, ratio readouts |
| `src/components/inscribed-angle.ts` | 92 | Lop-9: M draggable on circle, inscribed vs central angle |
| `src/i18n/vi.ts` | 102 | Single `vi` const with site/hub/grade/moduleN copy |
| `src/i18n/index.ts` | 11 | `t()` returns `locales[defaultLocale]`. No locale switching. |
| `src/pages/index.astro` | 67 | Landing — 3 grade cards |
| `src/pages/lop-{7,8,9}/*.astro` | ~90 each | Lesson pages, inline SVG, `<script>` calls `setupX('#canvas')` |
| `src/layouts/BaseLayout.astro` | 36 | HTML head, OG meta, lang=vi |

Stack: Astro 5 SSG, base `/try-gstack/`, Be Vietnam Pro (woff2 subset, deferred until added), Tailwind 3, Vitest. No KaTeX yet (planned, not shipped). No animation lib yet.

## 2 · Target state

mathmax has: SvelteKit 2 + Svelte 5 (runes), JS only (`jsconfig.json`), Tailwind 3, `adapter-static`, base `/mathmax`. Single landing route with 3 disabled topic cards. No engine, no lessons, no i18n, no math rendering, no test runner.

## 3 · Dependency matrix

| Source piece | Local equivalent | Decision |
| --- | --- | --- |
| `geom-engine/*.ts` | NEW | Port to `src/lib/geom-engine/*.js` + JSDoc types |
| `geom-engine/*.test.ts` | NEW | Add `vitest` + `@testing-library/svelte` (not strictly needed for engine), keep tests near impl |
| `components/*.ts` (imperative DOM) | NEW | **Rewrite** as `*.svelte` reactive components — do not transplant the `data-*` querying pattern |
| `pages/lop-X/*.astro` | NEW | New routes `src/routes/lop-X/<slug>/+page.svelte` |
| `pages/index.astro` | EXISTS | Replace 3 disabled cards with 3 enabled lesson cards (or keep topic→lesson nesting — see Challenge Q5) |
| `layouts/BaseLayout.astro` | EXISTS (`+layout.svelte`) | Extend current `+layout.svelte` with head meta, lang, OG tags |
| `i18n/vi.ts` + `t()` | NEW | Port to `src/lib/i18n/vi.js` (frozen object) + `t()`. Keep schema. |
| `astro:before-swap` teardown | N/A | DELETE — SvelteKit unmount + `$effect` cleanup replaces it |
| Pointer Events + `setPointerCapture` | NEW | Same browser API; move into Svelte action `use:draggable` |
| Be Vietnam Pro fontsource | NEW | Add `@fontsource/be-vietnam-pro` |
| Tailwind 3 config | EXISTS | Extend with font family + Vietnamese-friendly defaults |
| KaTeX | NEW (planned) | Add `katex` only when first formula appears (deferred) |
| Vitest config | NEW | Add `vitest` + `vitest.config.js` (engine-only smoke) |

## 4 · Stack-translation notes

| Astro / TS pattern | SvelteKit / Svelte 5 / JS pattern |
| --- | --- |
| `.astro` file with `---` frontmatter + HTML + `<script>` | `+page.svelte` with `<script>` (runes) + markup |
| `import '~/x'` alias | SvelteKit `$lib/x` (or vite alias if needed) |
| TS `interface` / `type` | JSDoc `@typedef` blocks |
| Imperative `setupX(svgSelector)` querying `data-*` | Svelte component owns the SVG; vertex coords via `$state`; computed via `$derived`; side effects via `$effect` |
| `document.querySelector` for readouts/badges | Bind directly to component state — no DOM lookup |
| `AbortController` + `astro:before-swap` listener teardown | `$effect` returns cleanup fn; SvelteKit handles route changes |
| Astro `import.meta.env.BASE_URL` | SvelteKit `import { base } from '$app/paths'` |
| `<BaseLayout title=… description=…>` | `<svelte:head>` per page; layout owns shell |
| Module-level constants (e.g. `INITIAL`, `VIEW_W`) | Same — keep at top of `<script>` |

## 5 · Source anatomy — design smells

The user flagged "these features are not good." Confirmed: the components carry pre-port debt that we should fix before, not after, porting.

1. **DOM-querying imperative API.** Every component does `document.querySelector('[data-readout-…]')` to find side-table cells the page template authored. The component depends on the page's HTML structure via string selectors. Brittle, hard to reuse, untestable without jsdom + a real page. Svelte fixes this by making the component own its readouts.
2. **Duplicated tick rendering.** `renderTicks` is copy-pasted in `congruence-sss.ts` and `similarity-scale.ts` (lines 60–85 vs 65–89, byte-identical). Should live in the engine or a shared SVG util.
3. **Duplicated `setLine` and `clientToSvg`.** Same story — three copies across components.
4. **Hand-rolled SVG element creation via `createElementNS`.** Imperative DOM building inside what should be declarative geometry.
5. **No labeled-axis abstraction.** Each lesson re-derives label offsets with magic numbers (`offsetX = id === 'b' ? 12 : id === 'c' ? -4 : -16`). Should be data on the vertex, not control flow.
6. **Position-strict SSS only.** `congruentSSS` requires AB↔A'B' correspondence — pedagogy choice, but the hub copy says "kéo các đỉnh để các cặp cạnh có cùng độ dài" without telling the student which pair maps to which. Either add the perm-invariant variant or make the correspondence visually obvious (we already have color ticks — confirm wording matches).
7. **Single-locale i18n with the wrong shape.** `module1/2/3` instead of keying by lesson slug. Adding lesson 4 means renaming everything. Re-key by slug (`'lop-7-tam-giac-bang-nhau'`) before porting.
8. **No KaTeX yet, but page copy already uses Unicode `∠`, `△`, prime marks.** Fine for now, but inconsistent with the locked decision in README. Either commit to KaTeX from lesson #1 or formally drop the decision.
9. **`type Locale = typeof vi`** assumes any future locale will match `vi` exactly — including marketing copy strings. This is rigid; English will likely diverge. Use string keys with a runtime lookup instead.
10. **Three "live" lessons + one landing — no progression scaffolding.** No "next lesson" graph beyond a hard-coded `nextTeaser` string per page. Manageable now; tech debt at 10 lessons.

## 6 · Challenge questions (5+)

### Q1. Should the lesson UI live as a single Svelte component, or stay split across page-template HTML and a "controller" module?

- Source: page authors SVG markup + readout cells; controller module wires `data-*` selectors.
- Local: Svelte 5 lets the component own SVG markup, state, and DOM events together — `$state` for vertex coords, `$derived` for sides/angles, `$effect` for pointer wiring, regular `{#each}` for ticks.
- Risk if wrong: copying the imperative pattern into Svelte gives us all the DOM-fragility downsides without any of the structure benefits.
- **Recommendation:** consolidate. One component per lesson, no `data-*` selectors.

### Q2. Should ticks/setLine/clientToSvg/draggable be utilities or live inline?

- Source: each component re-implements them.
- Local: a single `$lib/geom-engine/svg-utils.js` (or `$lib/components/draggable.svelte.js` for the action) covers all three lessons.
- Risk: if we don't extract, we triple the surface area to fix when KaTeX/animation lib lands.
- **Recommendation:** extract — but keep utilities pure and small (no Svelte deps).

### Q3. Should we keep the `t()` "marketing strings + lesson body" mega-object, or split copy from chrome?

- Source: one nested object, breaks if a key is missing.
- Local options:
  - (a) keep one frozen `vi.js` exported as `t()` — minimum churn
  - (b) per-lesson copy module colocated with each component (`lessons/lop-7/sss/copy.vi.js`)
- Risk of (a): every new lesson grows one global file; rename pain at lesson 5+.
- Risk of (b): mild duplication (status labels, theorem/example header), but bounded.
- **Recommendation:** (b) — colocate. Site-level chrome (header/footer/site title/status) stays global.

### Q4. Should we ship KaTeX in lesson 1, defer to a "first formula" trigger, or stay Unicode-only?

- Source: planned but unshipped. Page copy uses `∠AOB = 120°`, `△ABC = △A′B′C′`, `AB/A′B′`.
- Local: bundle adds ~280KB if SSR-rendered + 60KB CSS. For 3 short lessons with no real LaTeX, that's overkill.
- **Recommendation:** start Unicode-only. Add KaTeX only when first lesson actually needs `\frac`, sums, or radicals. Do not pre-bundle.

### Q5. Should the mathmax landing become a "grade picker" (try-gstack pattern) or keep "topic picker" (current)?

- Source: 3 grade cards, geometry-only.
- Local: 3 topic cards (Số học / Đại số / Hình học), 4 grades (6, 7, 8, 9) — broader scope.
- Risk: porting blindly forces mathmax to mimic try-gstack's narrower IA.
- **Recommendation:** keep mathmax's topic IA. Lessons live at `/<topic>/<grade>/<slug>` (`/hinh-hoc/lop-7/tam-giac-bang-nhau`). Landing keeps the 3 topic cards but enables Hình học (since SSS is shipping).

### Q6. Should `congruentSSS` stay position-strict, or also expose a permutation-invariant check?

- Source: strict only — AB↔A'B', BC↔B'C', CA↔C'A'.
- Local pedagogy: SGK lesson labels vertices, so strict is correct for the badge. But student intuition says "two triangles are equal if their three sides match in any order."
- **Recommendation:** keep strict for the badge (matches the tick coloring); add a `congruentSSSAnyPerm` variant in engine for future quizzes.

### Q7. Vitest now or only when complexity demands it?

- Source: 3 test files for the engine, no component tests.
- Local: engine port = ~20 functions, all pure. Tests are cheap insurance and the source already has them — port them.
- **Recommendation:** add Vitest with engine tests on day 1. Component tests deferred.

### Q8. Animations — Web Animations API as locked, or none for v1?

- Source: locked on WAAPI but unshipped.
- Local: SSS/similarity/inscribed don't *need* animation — drag = animation. Adding a "snap to congruent" tween or a "central-angle wedge fades when M near A or B" is polish, not core.
- **Recommendation:** ship without animation. Wire WAAPI when a lesson needs it (e.g. step-by-step proof animation).

## 7 · Decision matrix

| Decision | Source's way | Recommended for mathmax |
| --- | --- | --- |
| Lesson component shape | imperative `setup()` + `data-*` | self-contained `.svelte` component |
| Shared SVG utils | duplicated inline | `$lib/geom-engine/svg-utils.js` + `$lib/actions/draggable.svelte.js` |
| i18n shape | one big `vi` object | site-level global + per-lesson colocated copy |
| Math rendering | KaTeX (planned) | Unicode for v1; KaTeX deferred |
| URL structure | `/lop-N/<slug>/` | `/<topic>/lop-N/<slug>/` (topic-first) |
| Type system | TS strict | JS + JSDoc (`@typedef`, `@param`) |
| Engine tests | Vitest, near impl | port 1:1 |
| Animation | WAAPI locked | none in v1 |
| Teardown | `astro:before-swap` + AbortController | Svelte `$effect` cleanup |
| Locale type | `typeof vi` | string-keyed lookup with `?? key` fallback |

## 8 · Risk score

- **Engine port:** LOW. Pure functions, ε constants, deterministic tests.
- **Lesson rewrite:** MEDIUM. Different paradigm (declarative vs imperative). Bigger refactor, but each lesson is < 200 LOC after extracting utilities.
- **i18n re-shape:** LOW (decision Q3 chosen, not yet implemented).
- **URL/IA decision:** MEDIUM. Affects landing route and 3 lesson routes simultaneously.
- **KaTeX / WAAPI deferral:** LOW (we're explicitly *not* doing them).

Overall: MEDIUM. Buffer 1.5× for the rewrite vs straight transplant.

## 9 · Files to create / modify (preview, not a plan)

**Create**

- `src/lib/geom-engine/vec.js` (+ JSDoc)
- `src/lib/geom-engine/triangle.js`
- `src/lib/geom-engine/circle.js`
- `src/lib/geom-engine/svg-utils.js` (renderTicks, setLine, clientToSvg)
- `src/lib/geom-engine/{vec,triangle,circle}.test.js`
- `src/lib/actions/draggable.svelte.js`
- `src/lib/i18n/vi.js`, `src/lib/i18n/index.js`
- `src/lib/lessons/<slug>/copy.vi.js` (× 3)
- `src/routes/hinh-hoc/lop-7/tam-giac-bang-nhau/+page.svelte`
- `src/routes/hinh-hoc/lop-8/tam-giac-dong-dang/+page.svelte`
- `src/routes/hinh-hoc/lop-9/goc-noi-tiep/+page.svelte`
- `src/lib/components/CongruenceSSS.svelte`
- `src/lib/components/SimilarityScale.svelte`
- `src/lib/components/InscribedAngle.svelte`
- `vitest.config.js`

**Modify**

- `package.json` (add `@fontsource/be-vietnam-pro`, `vitest`, `@testing-library/svelte` optional)
- `src/routes/+page.svelte` (enable Hình học card, keep others "Sắp ra mắt")
- `src/routes/+layout.svelte` (head/meta/lang, font import)
- `tailwind.config.js` (font family, Vietnamese hyphenation)
- `README.md` (lessons section)

## 10 · Open questions

1. URL slug: keep Vietnamese (`hinh-hoc/lop-7/tam-giac-bang-nhau`) or use ASCII-safe (`geometry/grade-7/sss-congruence`)? README is Vietnamese-first; recommend Vietnamese slugs.
2. Add a "next lesson" graph data structure now (small JSON), or keep hard-coded teaser strings? Defer until lesson 4.
3. Should the engine be a JSDoc'd JS module, or do we go TS for the engine only and JS for components? README says "JavaScript only" — recommend honoring that, all JS + JSDoc.
4. Permutation-invariant SSS — engine API now or wait until a quiz lesson asks for it?
5. Mathmax already has indigo branding; try-gstack uses red/teal/orange tick palette. Reconcile palette before porting visuals.

---

**Status:** DONE
**Summary:** Extraction + adaptation report ready. 3 lessons + engine + i18n are portable; imperative DOM + duplicated utilities + rigid `t()` shape are the things to fix during the port, not after. Decision matrix and 8 challenge questions ready for `/ck:brainstorm`.
**Concerns:** Source has copy-pasted utility code across 3 components; porting 1:1 would propagate the duplication into Svelte. Bake the consolidation into the port.
