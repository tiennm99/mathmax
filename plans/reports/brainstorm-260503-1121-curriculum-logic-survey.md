# Brainstorm — Curriculum Logic Survey

- Date: 2026-05-03
- Mode: brutal-honesty advisory. No code.
- Scope: all logics applicable across MathMax (lớp 6-9, số học + đại số + hình học × 4 dimensions).
- Predecessor: `plans/reports/brainstorm-260430-2207-improved-port-spec.md` (port spec, already shipped).
- Conventions: tag = `[grade] [now|next|later|YAGNI]`. `now` = something a current lesson needs. `next` = next 1-2 lessons likely need. `later` = real but not soon. `YAGNI` = stop, don't build.

## TL;DR

1. Pick **Strategy C** (lesson-driven, infra emerges). Stop catalog-shopping; ship lessons.
2. Next concrete sub-project: **one số học lesson + one đại số lesson** (you pick which). Brainstorm each separately.
3. Don't build quiz/scoring/persistence/i18n-en until 2+ lessons demand them. Hard rule.
4. Three things you almost-certainly need before lesson 4: KaTeX (algebra needs `\frac`/`\sqrt`), an "expression input" interaction primitive, and goal-state detection (sandbox-only stops working when you have homework-shaped lessons).
5. Three things to **never** build: spaced-repetition, accounts/auth, custom analytics.

---

## 1 · Catalog

### 1.1 Math content logic (pure modules; sibling of `geom-engine/`)

**Số học (lớp 6-7)**
- `[6][next]` divisibility tests (2/3/5/9/10/11) — pure predicates
- `[6][next]` GCD/LCM via Euclidean — pure
- `[6][next]` prime check + sieve up to N — pure
- `[6][next]` prime factorization — pure
- `[6][later]` modular arithmetic (mod, congruence) — pure
- `[6][next]` fraction normalize / simplify / common-denominator — pure
- `[6][next]` mixed ↔ improper fraction — pure
- `[6][later]` decimal ↔ fraction (terminating + repeating) — pure
- `[6][later]` percent / ratio / proportion — pure
- `[6][next]` integer ops (negatives, abs, sign rules) — pure

**Đại số (lớp 7-9)**
- `[7][next]` polynomial: add/subtract/scale (1 var) — pure
- `[7][next]` polynomial multiply (foil + general) — pure
- `[8][next]` factoring: common factor, grouping, identities (a²-b², a²±2ab+b², a³±b³) — pure
- `[8][later]` factoring: AC method for trinomials — pure
- `[7][next]` linear equation 1 var: solve + step trace — pure
- `[8][later]` linear system 2 var: substitution + elimination + step trace — pure
- `[8][later]` inequality 1 var (with sign-flip on negative mult) — pure
- `[9][later]` quadratic: discriminant, roots, Viète — pure
- `[9][later]` rational expression: simplify, restrict domain — pure
- `[9][later]` square root: simplify √n, conjugate denom — pure
- `[7][later]` linear function: y = ax + b, plot, slope/intercept — pure + render
- `[9][later]` quadratic function: y = ax² + bx + c, vertex, axis — pure + render

**Hình học (lớp 6-9, beyond current 3 lessons)**
- `[6][next]` polygon area/perimeter (rect, tri, parallelogram, trapezoid) — pure
- `[7][later]` Pythagoras + converse — pure (already in vec via `len`/`dist`)
- `[7][later]` triangle inequality predicate — pure
- `[8][later]` transformations: translate, rotate, reflect, dilate (2D matrix or pointwise) — pure
- `[8][later]` similarity: SAS/SSS/AA — pure (mathmax has SSS-position-strict; permutation-invariant variants are real lessons later)
- `[9][later]` circle: chord/secant/tangent, arc length, inscribed quadrilateral — pure (extend `circle.js`)
- `[9][later]` trig ratios (sin/cos/tan in right triangle) — pure
- `[9][YAGNI]` 3D solids (cube/cylinder/cone/sphere V+SA) — pure but render layer is heavy; defer
- `[8][later]` coordinate geometry: distance, midpoint, slope between points — pure
- `[7][YAGNI]` compass+straightedge construction primitives — interaction layer is its own project; defer

**Thống kê & Xác suất (lớp 7-9)**
- `[7][later]` mean/median/mode/range — pure
- `[7][later]` frequency table + bin — pure
- `[8][later]` variance / std dev — pure
- `[9][later]` basic probability (favorable/total, independent events) — pure
- `[9][YAGNI]` combinatorics (nCr, nPr) for advanced lessons — defer

### 1.2 Lesson interaction logic

- `[now]` drag w/ pointer + keyboard + ARIA — exists (`use:draggable`)
- `[now]` projector (snap to circle, line) — exists (used by inscribed angle)
- `[next]` slider (one-knob parameter, e.g. similarity ratio k) — trivial; native `<input type="range">` w/ Tailwind
- `[next]` snap-to-grid (integer or fraction lattice) — extend draggable action w/ `snap` opt
- `[next]` snap-to-angle (15°/30°/45° increments) — variant of projector
- `[next]` toggle/checkbox to show/hide auxiliary lines — Svelte `$state` only
- `[next]` multi-choice tap (1-correct, multi-correct) — interaction primitive
- `[next]` drag-bin categorize (sort items into buckets) — interaction primitive
- `[next]` drag-reorder (sequence proof steps, sort numbers) — interaction primitive
- `[next]` number input + validation — bare `<input type="number">` w/ derived feedback
- `[later]` expression input (e.g. `2x+3`) + parser — needs grammar; large; only when first algebra lesson lands
- `[later]` fraction input (numerator/denominator pair) — small variant of number input
- `[later]` step-state machine (assertion → justification → next step) — for proof lessons
- `[later]` undo/redo stack — generic over `$state` snapshots
- `[later]` restart/reset to initial config — trivial; per-lesson save initial `$state`
- `[later]` progressive hint reveal — `$state` index + `<details>` or button-driven
- `[later]` animation playback (apply transformation step-by-step) — WAAPI or Svelte transitions
- `[later]` plot point on coordinate plane (click to place) — needs canvas grid render
- `[later]` draw line/ray (drag two points, render) — extension of draggable
- `[YAGNI]` freehand sketch — overkill; pedagogy doesn't need it

### 1.3 Pedagogy / scoring logic

- `[now]` sandbox mode — current lessons are pure exploration; no goal
- `[next]` goal-state detection (predicate: "is this a right triangle?", "did you simplify fully?") — emerges from lesson; pure
- `[next]` correct/wrong feedback (visual + ARIA-live announcement) — primitive
- `[next]` partial credit / "almost" feedback — judgment call per lesson
- `[later]` exercise variants (seeded random problem generator per lesson) — pure
- `[later]` mastery flag (3-correct-in-a-row) — localStorage key per lesson
- `[later]` hint reveal w/ optional cost (star deduction) — needs scoring vocabulary
- `[later]` streak counter — localStorage per user
- `[later]` worked-example fading (fully-shown → partial → solo) — pedagogical pattern; high effort
- `[later]` self-check button vs auto-grade — per-lesson UX choice
- `[later]` quiz primitive: MC, free-response, drag-match, ordering — composes interaction primitives
- `[YAGNI]` spaced repetition (SM-2 etc) — wrong tool for middle-school topic mastery
- `[YAGNI]` adaptive difficulty (next-problem easier/harder by perf) — overkill; static pacing is fine
- `[YAGNI]` leaderboards / social — out of scope for self-paced learning

### 1.4 App-level logic

- `[now]` lesson registry + per-lesson copy module — exists
- `[next]` registry: add `prerequisites: []`, `tags: []`, `estimatedMinutes` fields — schema bump
- `[next]` next/prev lesson nav (registry-driven, ordered by topic+grade) — only after lesson 4
- `[next]` per-lesson `<svelte:head>` SEO (title, desc, canonical, OG) — pulled from copy module
- `[next]` topic landing page enhancements (group by grade, show progress) — extends `/hinh-hoc/`
- `[later]` grade-filter UI on topic landing — tabs or chips
- `[later]` search/filter by tag, slug — client-side over registry (no server)
- `[later]` localStorage persistence: completed lessons, last-state per lesson, prefs — pure JS module
- `[later]` deep-link state: encode lesson config in URL hash (e.g. `#a=60,80&b=180,80`) — for sharing problems
- `[later]` sitemap.xml generated at build — SvelteKit `+server.js` or static
- `[later]` robots.txt — trivial static
- `[later]` OG images per lesson — needs render pipeline (satori/playwright); defer to lesson 6+
- `[later]` i18n: add EN parallel to copy.vi.js — only when EN audience signal exists
- `[later]` dark mode — Tailwind `dark:` + prefers-color-scheme; cheap but needs design pass
- `[later]` reduced motion — already gated in port spec; honor when animations land
- `[later]` print stylesheet (worksheet export) — `@media print` rules
- `[later]` PDF export of lesson — needs render pipeline; defer
- `[later]` privacy-respecting analytics (Plausible / Umami) — one snippet; cheap; pick later
- `[YAGNI]` user accounts / auth — static-site killer; don't add
- `[YAGNI]` server-side anything (Postgres, API) — kills GitHub Pages deploy
- `[YAGNI]` PWA / service worker / offline — premature optimization
- `[YAGNI]` Sentry / error reporting — overkill for static educational site
- `[YAGNI]` content CMS (Sanity/Contentful) — copy modules are the CMS

---

## 2 · Strategy comparison

| Strategy | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Topic-first** (finish hình học → số học → đại số) | Deep math-engine reuse per topic; topic-coherent UX | App-level features lag; users see uneven progress across topics | Reject — uneven curriculum hurts perceived completeness |
| **B. Infra-first** (build scoring + persistence + i18n + registry v2 before lessons) | Each new lesson cheap once infra exists | YAGNI violation; infra built without consumers always rots; 3 lessons doesn't justify it | Reject — recipe for over-engineering |
| **C. Lesson-driven, infra emerges** *(recommended)* | Pure YAGNI; every line has a consumer; matches how the geom-engine actually evolved | Some rework when 3rd consumer reveals shared shape | **Adopt** — proven by the port itself |

**Why C wins**: the existing geom-engine (vec / triangle / circle / ticks) emerged exactly this way — it's pure and small because every function has 1+ caller. Doing infra-first now would invert that virtue.

---

## 3 · Decomposition into sub-projects

Each sub-project = its own brainstorm → plan → implement cycle. Order is **suggested**, not enforced; pick what unblocks the most lessons.

### 3.1 Sub-project: "Lesson 4 + 5" (number theory + algebra debut)
- Pick 1 số học lesson (recommend: **GCD/LCM via Euclidean game** — drag two numbers; watch ladder reduce; goal: hit (gcd, 0))
- Pick 1 đại số lesson (recommend: **factor a² - b² visualizer** — drag two square sides; show area = (a+b)(a-b))
- Triggers: KaTeX (almost certainly), goal-state detection primitive, possibly slider primitive
- Don't build: scoring system, persistence, hint UI, undo
- Risk: LOW (both lessons are bounded, single-screen, single-goal)

### 3.2 Sub-project: "Quiz primitives" (only after 2+ lessons need it)
- MC component, free-response w/ check, drag-match
- Reuses the same `goal-state` predicate shape from §3.1
- Schema for quiz items in copy modules (questions, choices, correct, explain)
- Triggers: per-lesson "Bài tập" tab vs sandbox-only
- Don't build: scoring back-end, attempt history (defer to §3.3)
- Risk: LOW-MEDIUM (component design needs 2 real lessons to validate)

### 3.3 Sub-project: "Local progress" (localStorage)
- Schema: `mathmax/v1/progress` → `{ [lessonSlug]: { completed: bool, lastVisited: ISOString, attempts: number } }`
- Pure module + Svelte store wrapper
- Migration story: version key in storage; if missing, treat as fresh
- Triggers: first lesson w/ "completion" state; landing page shows ✓ on completed lessons
- Don't build: cross-device sync, accounts, server persistence
- Risk: LOW (pure browser API)

### 3.4 Sub-project: "Registry v2 + nav" (after 6+ lessons)
- Add `prerequisites`, `tags`, `estimatedMinutes`, `order` to registry entries
- Generate prev/next links at build time
- Topic landing page groups lessons by grade with progress badges
- Triggers: lesson list becomes too long to scan; users ask "what's next"
- Don't build: complex search; tags-cloud UI
- Risk: LOW (just data shape; no new behavior)

### 3.5 Sub-project: "EN locale" (only with audience signal)
- Parallel `copy.en.js` per lesson + `site.en.js`
- Locale switcher in header (defaults to `vi`; remembers in localStorage)
- URL strategy: `?lang=en` query param OR `/en/...` prefix — decide later
- Triggers: external request, partner school, analytics showing non-VN traffic
- Don't build: third locale, automatic translation, RTL
- Risk: LOW once triggered; HIGH effort otherwise (translation cost is the actual blocker)

### 3.6 Sub-project: "Polish" (after 6+ lessons)
- Sitemap.xml + robots.txt
- OG images (per-lesson; consider Satori @ build)
- Dark mode (design pass)
- Print stylesheet for paper worksheets
- Analytics (Plausible — privacy-respecting)
- Triggers: lesson count past 6; SEO becomes worth caring about
- Risk: LOW (mostly mechanical)

---

## 4 · Cross-cutting recommendations

### Math expression rendering (KaTeX trigger)
First algebra lesson needs `\frac{a}{b}`, `\sqrt{x}`, `x^2`. Add KaTeX **then**, not before. Pin one place to render: a tiny `<Tex math="..." />` Svelte component wrapping `katex.render`.

### Goal-state detection pattern
Don't build a "scoring engine." Each lesson exports a `goal(state) → { reached: bool, hint?: string }` pure function. Page renders feedback. Three lessons later, harvest the shape into a shared interface. Don't pre-design.

### Pure-module discipline
Every math content logic above goes under `src/lib/<topic>-engine/` (e.g. `numtheory-engine/`, `algebra-engine/`). Same shape as `geom-engine/`: pure JS, JSDoc, Vitest, no DOM. Lessons import. Period.

### "Sắp ra mắt" guard
Don't enable Số học / Đại số landing tiles until **at least one lesson per topic ships**. Empty topics are worse than missing ones.

### Vietnamese-first slugs
Every new lesson: VN slug (`uoc-chung-lon-nhat`, not `gcd-game`). Confirmed in port spec.

### A11y by default
Every new interactive primitive: keyboard equivalent + ARIA from day one. The draggable action set the bar; don't regress.

---

## 5 · Open questions

1. **Which two lessons next?** §3.1 recommends GCD-Euclidean and factor-a²-b² but you may have stronger pedagogy preferences (textbook alignment, school partnerships, etc.).
2. **KaTeX bundle size** — KaTeX is ~300KB gzipped w/ fonts. Acceptable for a math site? (Recommend yes; alternative `MathJax` is bigger.)
3. **Analytics provider** — Plausible (paid hosted), Umami (self-host), or none? Defer until §3.6.
4. **Lesson "completion" definition** — does sandbox-only count as complete on first visit, or do we require a goal? Affects §3.3 schema.
5. **EN locale priority** — do you have any concrete audience signal (collaborators, partner schools, GitHub stars from EN-speakers), or is it purely speculative? If speculative, drop to "never" until signal arrives.
6. **Worksheet/print export demand** — is this asked-for by teachers, or my speculation? If speculation, drop.
7. **Curriculum source-of-truth** — are lessons aligned to a specific Vietnamese textbook (Cánh Diều, Kết nối tri thức, Chân trời sáng tạo)? If yes, that constrains lesson selection and ordering.

---

**Status:** DONE
**Summary:** Survey of all 4-dimension logics (math content × interaction × pedagogy × app), with grade + risk tags. Recommended Strategy C (lesson-driven). Six concrete sub-projects scoped, ordered, and gated on real triggers. Hard YAGNI rules: no SR, no auth, no PWA, no analytics until lesson 6+.
**Concerns:** Q7 (textbook alignment) is the biggest unknown — may rewrite §3.1 lesson picks. Q1 needs your call before any next planning step.
