<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/duong-thang/copy.vi.js';
  import Tex from '$lib/components/tex.svelte';
  import { yAt, lineFromPoints, linePoints } from '$lib/algebra-engine/linear.js';
  import CartesianPlane from '$lib/lessons/duong-thang/cartesian-plane.svelte';

  const copy = t();

  // SVG layout constants
  const VIEW = 420;
  const PAD = 30;
  const U = (VIEW - PAD * 2) / 20; // px per math unit; 20 units span -10..10

  /** Convert math x → SVG x */
  const mx = (/** @type {number} */ x) => PAD + (x + 10) * U;
  /** Convert math y → SVG y (Y-axis flipped in SVG) */
  const my = (/** @type {number} */ y) => PAD + (10 - y) * U;
  /** Convert SVG y → math y */
  const svgYtoMath = (/** @type {number} */ sy) => 10 - (sy - PAD) / U;

  const CLAMP_Y = 10;  // math-space clamp for anchor y
  const EPSILON = 0.01;
  const ANCHOR1_X = -5; // fixed math x for anchor 1
  const ANCHOR2_X = 5;  // fixed math x for anchor 2

  // Locked defaults: a=1, b=0 (used for both init and reset)
  const INIT_A = 1;
  const INIT_B = 0;

  // ── Single source of truth ──────────────────────────────────────────────────
  let a = $state(INIT_A);
  let b = $state(INIT_B);

  // Clamp a pixel y to the viewport's vertical range (math y ∈ [-CLAMP_Y, CLAMP_Y]).
  const clampPx = (/** @type {number} */ py) =>
    Math.max(my(CLAMP_Y), Math.min(my(-CLAMP_Y), py));

  // Anchor pixel state — mutated either by Direction 1 (sliders) or by the
  // draggable action. Always clamped to viewport so anchors never leave the box.
  let p1 = $state({ x: mx(ANCHOR1_X), y: clampPx(my(INIT_A * ANCHOR1_X + INIT_B)) });
  let p2 = $state({ x: mx(ANCHOR2_X), y: clampPx(my(INIT_A * ANCHOR2_X + INIT_B)) });

  // Direction 1: (a, b) → anchor pixel positions. Clamped so extreme slider
  // values still leave anchors visible at the viewport edge.
  $effect(() => {
    p1.y = clampPx(my(yAt({ a, b }, ANCHOR1_X)));
    p2.y = clampPx(my(yAt({ a, b }, ANCHOR2_X)));
  });

  // Direction 2: anchor drag → (a, b). Fired by the draggable action's
  // onChange hook (NOT a state-watching effect) so slider writes don't bounce
  // back into a/b. Rounded to slider step (0.1) and epsilon-gated.
  function handleDragChange() {
    const newLine = lineFromPoints(
      { x: ANCHOR1_X, y: svgYtoMath(p1.y) },
      { x: ANCHOR2_X, y: svgYtoMath(p2.y) }
    );
    if (!newLine) return;
    const newA = Math.round(newLine.a * 10) / 10;
    const newB = Math.round(newLine.b * 10) / 10;
    if (Math.abs(newA - a) < EPSILON && Math.abs(newB - b) < EPSILON) return;
    a = Math.max(-5, Math.min(5, newA));
    b = Math.max(-10, Math.min(10, newB));
  }

  /** @type {SVGSVGElement | undefined} */
  let svgEl = $state();

  // Projectors: lock x to fixed SVG column, clamp y within math bounds
  const proj1 = (/** @type {{x:number,y:number}} */ p) => ({
    x: mx(ANCHOR1_X),
    y: clampPx(p.y),
  });
  const proj2 = (/** @type {{x:number,y:number}} */ p) => ({
    x: mx(ANCHOR2_X),
    y: clampPx(p.y),
  });

  const drag1Opts = $derived({
    point: p1,
    svg: () => svgEl ?? null,
    viewBox: { w: VIEW, h: VIEW },
    projector: proj1,
    pad: 0,
    keyStep: U,
    onChange: handleDragChange,
  });
  const drag2Opts = $derived({
    point: p2,
    svg: () => svgEl ?? null,
    viewBox: { w: VIEW, h: VIEW },
    projector: proj2,
    pad: 0,
    keyStep: U,
    onChange: handleDragChange,
  });

  const line = $derived({ a, b });
  const pts = $derived(linePoints(line, -10, 10));
  const texMath = $derived(`y = ${a.toFixed(1)}x + ${b.toFixed(1)}`);
  const anchor1MathY = $derived(yAt(line, ANCHOR1_X));
  const anchor2MathY = $derived(yAt(line, ANCHOR2_X));
  const deltaY = $derived(anchor2MathY - anchor1MathY);

  let showTriangle = $state(false);

  // Debounced aria-live announcement (300 ms) to avoid spamming screen readers during drag
  let ariaAnnounce = $state('');
  let announceTimer = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);
  $effect(() => {
    const msg = texMath;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { ariaAnnounce = msg; }, 300);
  });

  function reset() { a = INIT_A; b = INIT_B; }

  const gridLines = Array.from({ length: 21 }, (_, i) => i - 10); // -10..10
</script>

<svelte:head>
  <title>{m.title} — {copy.site.title}</title>
  <meta name="description" content={m.intro} />
</svelte:head>

<header class="border-b border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href={base + '/'} class="text-xl font-bold text-indigo-600 tracking-tight">MathMax</a>
  </div>
</header>

<main class="bg-slate-50 min-h-screen">
  <article class="max-w-3xl mx-auto px-4 py-8">
    <nav class="mb-4 text-sm">
      <a href={base + '/dai-so/'} class="text-indigo-600 hover:underline">{copy.lessonChrome.backToTopic}</a>
    </nav>

    <header class="mb-6">
      <div class="text-sm uppercase tracking-wide text-slate-500">{m.gradeLabel}</div>
      <h1 class="text-3xl font-bold text-slate-900 mt-1 mb-2">{m.title}</h1>
      <p class="text-slate-700 leading-relaxed">{m.intro}</p>
    </header>

    <!-- Sliders -->
    <section class="mb-4 bg-white rounded-lg border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-3">{m.instructionSlider}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">
            {m.sliderALabel}: <span class="tabular-nums text-indigo-700">{a.toFixed(1)}</span>
          </span>
          <input
            type="range" min="-5" max="5" step="0.1"
            bind:value={a}
            aria-label="{m.sliderALabel} — hiện tại {a.toFixed(1)}"
            class="mt-1 w-full accent-indigo-600"
          />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">
            {m.sliderBLabel}: <span class="tabular-nums text-indigo-700">{b.toFixed(1)}</span>
          </span>
          <input
            type="range" min="-10" max="10" step="0.1"
            bind:value={b}
            aria-label="{m.sliderBLabel} — hiện tại {b.toFixed(1)}"
            class="mt-1 w-full accent-indigo-600"
          />
        </label>
      </div>
    </section>

    <!-- SVG Cartesian plane (grid, axes, line, anchors, triangle) -->
    <section class="mb-4">
      <p class="text-sm text-slate-500 mb-2">{m.instructionAnchor}</p>
      <CartesianPlane
        bind:svgEl
        view={VIEW}
        pad={PAD}
        u={U}
        {mx} {my}
        {gridLines}
        {pts}
        {p1} {p2}
        {anchor1MathY} {anchor2MathY}
        {drag1Opts} {drag2Opts}
        {showTriangle}
        anchor1X={ANCHOR1_X}
        anchor2X={ANCHOR2_X}
        {deltaY}
        {texMath}
        anchor1Label={m.anchor1Label}
        anchor2Label={m.anchor2Label}
      />
    </section>

    <!-- KaTeX live equation -->
    <section class="mb-4 text-center">
      <Tex display math={texMath} ariaLabel="Phương trình đường thẳng: {texMath}" />
    </section>

    <!-- aria-live (visually hidden): announces equation after drag/slider settles -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">{ariaAnnounce}</div>

    <!-- Triangle toggle + reset -->
    <section class="mb-6 flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
        <input type="checkbox" bind:checked={showTriangle} class="accent-indigo-600 w-4 h-4" />
        {m.showTriangleLabel}
      </label>
      <button
        onclick={reset}
        class="ml-auto px-4 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        {m.resetLabel}
      </button>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.theoremTitle}</h2>
      <p class="rounded-lg bg-slate-100 p-4 text-slate-800">{m.theoremStatement}</p>
    </section>

    <section class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.exampleTitle}</h2>
      <p class="text-slate-700 leading-relaxed">{m.exampleBody}</p>
    </section>

    <footer class="border-t border-slate-200 pt-4 text-sm text-slate-500">
      {m.nextTeaser}
    </footer>
  </article>
</main>
