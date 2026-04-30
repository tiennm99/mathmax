<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/goc-noi-tiep/copy.vi.js';
  import { circle, pointOnCircle, projectToCircle, angleAtVertex } from '$lib/geom-engine/circle.js';
  import { draggable } from '$lib/actions/draggable.svelte.js';

  const copy = t();
  const VIEW = 400;
  const C = circle(VIEW / 2, VIEW / 2, 150);
  const A = pointOnCircle(C, 150);
  const B = pointOnCircle(C, 30);

  /** @type {SVGSVGElement | undefined} */
  let svgEl = $state();
  let M = $state(pointOnCircle(C, 270));

  const inscribed = $derived(angleAtVertex(A, M, B));
  const central = $derived(angleAtVertex(A, C.center, B));

  /** @param {{x: number, y: number}} p */
  const projector = (p) => projectToCircle(p, C);
  const dragOpts = $derived({
    point: M,
    svg: () => svgEl ?? null,
    viewBox: { w: VIEW, h: VIEW },
    projector,
    pad: 0,
  });
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
      <a href={base + '/hinh-hoc/'} class="text-indigo-600 hover:underline">{copy.lessonChrome.backToTopic}</a>
    </nav>

    <header class="mb-6">
      <div class="text-sm uppercase tracking-wide text-slate-500">{m.gradeLabel}</div>
      <h1 class="text-3xl font-bold text-slate-900 mt-1 mb-2">{m.title}</h1>
      <p class="text-slate-700 leading-relaxed">{m.intro}</p>
    </header>

    <section class="mb-2 flex items-baseline justify-between gap-3 text-sm tabular-nums" aria-live="polite">
      <span><strong style="color:#D7263D">{m.inscribedLabel}:</strong> {inscribed.toFixed(1)}°</span>
      <span><strong style="color:#1B998B">{m.centralLabel}:</strong> {central.toFixed(1)}°</span>
    </section>

    <section class="mb-6">
      <svg
        bind:this={svgEl}
        viewBox="0 0 {VIEW} {VIEW}"
        preserveAspectRatio="xMidYMid meet"
        class="block w-full max-w-md mx-auto bg-white rounded-lg border border-slate-200"
        style="touch-action:none; aspect-ratio:1/1"
        role="img"
        aria-label={m.instruction}
      >
        <circle cx={C.center.x} cy={C.center.y} r={C.radius} fill="none" stroke="#999" stroke-width="2" />

        <line x1={C.center.x} y1={C.center.y} x2={A.x} y2={A.y} stroke="#D0D0D0" stroke-width="1" stroke-dasharray="4 4" />
        <line x1={C.center.x} y1={C.center.y} x2={B.x} y2={B.y} stroke="#D0D0D0" stroke-width="1" stroke-dasharray="4 4" />

        <line x1={A.x} y1={A.y} x2={M.x} y2={M.y} stroke="#444" stroke-width="2" />
        <line x1={B.x} y1={B.y} x2={M.x} y2={M.y} stroke="#444" stroke-width="2" />

        <circle cx={C.center.x} cy={C.center.y} r="3" fill="#888" />
        <text x={C.center.x + 8} y={C.center.y - 2} font-size="14" fill="#888">O</text>

        <circle cx={A.x} cy={A.y} r="6" fill="#1B998B" />
        <text x={A.x - 18} y={A.y + 18} font-size="14" font-weight="700" fill="#1B998B">A</text>

        <circle cx={B.x} cy={B.y} r="6" fill="#1B998B" />
        <text x={B.x + 10} y={B.y + 18} font-size="14" font-weight="700" fill="#1B998B">B</text>

        <circle
          cx={M.x}
          cy={M.y}
          r="14"
          fill="#D7263D"
          stroke="#fff"
          stroke-width="2"
          role="button"
          tabindex="0"
          aria-label="Điểm M trên đường tròn — kéo hoặc dùng phím mũi tên"
          style="cursor:grab; outline:none"
          use:draggable={dragOpts}
        />
        <text x={M.x + 12} y={M.y - 8} font-size="14" font-weight="700" fill="#D7263D">M</text>
      </svg>
      <p class="mt-2 text-center text-sm text-slate-500">{m.instruction}</p>
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
