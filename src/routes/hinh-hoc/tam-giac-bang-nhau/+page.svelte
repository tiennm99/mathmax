<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/tam-giac-bang-nhau/copy.vi.js';
  import { triangle, sides, congruentSSS } from '$lib/geom-engine/triangle.js';
  import { tickPositions } from '$lib/geom-engine/ticks.js';
  import { draggable } from '$lib/actions/draggable.svelte.js';

  const copy = t();
  const VIEW_W = 400;
  const VIEW_H = 300;
  const PAIR1 = '#D7263D';
  const PAIR2 = '#1B998B';
  const PAIR3 = '#F46036';

  /** @type {SVGSVGElement | undefined} */
  let svgEl = $state();

  let a = $state({ x: 60, y: 80 });
  let b = $state({ x: 180, y: 80 });
  let c = $state({ x: 120, y: 220 });
  let ap = $state({ x: 220, y: 80 });
  let bp = $state({ x: 340, y: 80 });
  let cp = $state({ x: 280, y: 220 });

  const t1 = $derived(triangle(a, b, c));
  const t2 = $derived(triangle(ap, bp, cp));
  const s1 = $derived(sides(t1));
  const s2 = $derived(sides(t2));
  const isCongruent = $derived(congruentSSS(t1, t2));

  const ticksAB = $derived(tickPositions(a, b, 1));
  const ticksBC = $derived(tickPositions(b, c, 2));
  const ticksCA = $derived(tickPositions(c, a, 3));
  const ticksApBp = $derived(tickPositions(ap, bp, 1));
  const ticksBpCp = $derived(tickPositions(bp, cp, 2));
  const ticksCpAp = $derived(tickPositions(cp, ap, 3));

  const getSvg = () => svgEl ?? null;
  /** @param {{x: number, y: number}} point */
  const dragOpts = (point) => ({ point, svg: getSvg, viewBox: { w: VIEW_W, h: VIEW_H } });
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

    <section class="mb-6">
      <div class="flex items-center justify-end mb-2 min-h-[28px]">
        {#if isCongruent}
          <span class="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
            ✓ {m.congruentBadge}
          </span>
        {/if}
      </div>

      <svg
        bind:this={svgEl}
        viewBox="0 0 {VIEW_W} {VIEW_H}"
        preserveAspectRatio="xMidYMid meet"
        class="block w-full bg-white rounded-lg border border-slate-200"
        style="touch-action:none"
        role="img"
        aria-label={m.instruction}
      >
        <!-- Triangle 1 -->
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#444" stroke-width="2" />
        <line x1={b.x} y1={b.y} x2={c.x} y2={c.y} stroke="#444" stroke-width="2" />
        <line x1={c.x} y1={c.y} x2={a.x} y2={a.y} stroke="#444" stroke-width="2" />

        {#each ticksAB as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR1} stroke-width="2.5" stroke-linecap="round" />
        {/each}
        {#each ticksBC as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR2} stroke-width="2.5" stroke-linecap="round" />
        {/each}
        {#each ticksCA as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR3} stroke-width="2.5" stroke-linecap="round" />
        {/each}

        <!-- Triangle 2 -->
        <line x1={ap.x} y1={ap.y} x2={bp.x} y2={bp.y} stroke="#444" stroke-width="2" />
        <line x1={bp.x} y1={bp.y} x2={cp.x} y2={cp.y} stroke="#444" stroke-width="2" />
        <line x1={cp.x} y1={cp.y} x2={ap.x} y2={ap.y} stroke="#444" stroke-width="2" />

        {#each ticksApBp as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR1} stroke-width="2.5" stroke-linecap="round" />
        {/each}
        {#each ticksBpCp as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR2} stroke-width="2.5" stroke-linecap="round" />
        {/each}
        {#each ticksCpAp as t (t.x1 + ',' + t.y1)}
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={PAIR3} stroke-width="2.5" stroke-linecap="round" />
        {/each}

        <!-- Vertices -->
        <circle cx={a.x} cy={a.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh A — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(a)} />
        <text x={a.x - 16} y={a.y - 14} font-size="14" font-weight="700" fill="#1F2937">A</text>
        <circle cx={b.x} cy={b.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh B — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(b)} />
        <text x={b.x + 12} y={b.y - 14} font-size="14" font-weight="700" fill="#1F2937">B</text>
        <circle cx={c.x} cy={c.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh C — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(c)} />
        <text x={c.x - 4} y={c.y + 24} font-size="14" font-weight="700" fill="#1F2937">C</text>

        <circle cx={ap.x} cy={ap.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh A' — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(ap)} />
        <text x={ap.x - 16} y={ap.y - 14} font-size="14" font-weight="700" fill="#1F2937">A′</text>
        <circle cx={bp.x} cy={bp.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh B' — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(bp)} />
        <text x={bp.x + 12} y={bp.y - 14} font-size="14" font-weight="700" fill="#1F2937">B′</text>
        <circle cx={cp.x} cy={cp.y} r="12" fill="#4F46E5" stroke="#fff" stroke-width="2" role="button" tabindex="0" aria-label="Đỉnh C' — kéo hoặc dùng phím mũi tên" style="cursor:grab; outline:none" use:draggable={dragOpts(cp)} />
        <text x={cp.x - 4} y={cp.y + 24} font-size="14" font-weight="700" fill="#1F2937">C′</text>
      </svg>
      <p class="mt-2 text-center text-sm text-slate-500">{m.instruction}</p>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-3">{m.lengthsTitle}</h2>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm tabular-nums" aria-live="polite">
        <div><span style="color:{PAIR1}" class="font-semibold">AB:</span> {s1.ab.toFixed(1)}</div>
        <div><span style="color:{PAIR1}" class="font-semibold">A′B′:</span> {s2.ab.toFixed(1)}</div>
        <div><span style="color:{PAIR2}" class="font-semibold">BC:</span> {s1.bc.toFixed(1)}</div>
        <div><span style="color:{PAIR2}" class="font-semibold">B′C′:</span> {s2.bc.toFixed(1)}</div>
        <div><span style="color:{PAIR3}" class="font-semibold">CA:</span> {s1.ca.toFixed(1)}</div>
        <div><span style="color:{PAIR3}" class="font-semibold">C′A′:</span> {s2.ca.toFixed(1)}</div>
      </div>
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
