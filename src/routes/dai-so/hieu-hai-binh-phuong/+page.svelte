<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/hieu-hai-binh-phuong/copy.vi.js';
  import Tex from '$lib/components/tex.svelte';

  const copy = t();
  const U = 18; // px per math unit
  const PAD = 24;
  const PAIR1 = '#D7263D';
  const PAIR2 = '#1B998B';

  let a = $state(5);
  let b = $state(2);

  // Clamp b ≤ a — guard prevents feedback loops.
  $effect(() => {
    if (b > a) b = a;
  });

  const aSafe = $derived(Math.max(2, Math.min(10, Math.trunc(Number(a)) || 2)));
  const bSafe = $derived(Math.max(1, Math.min(aSafe, Math.trunc(Number(b)) || 1)));

  const aSq = $derived(aSafe * aSafe);
  const bSq = $derived(bSafe * bSafe);
  const diff = $derived(aSq - bSq);
  const product = $derived((aSafe + bSafe) * (aSafe - bSafe));

  // Square diagram dimensions.
  const sqViewW = $derived(10 * U + PAD * 2);
  const sqViewH = $derived(10 * U + PAD * 2);
  const sqSize = $derived(aSafe * U);
  const cutSize = $derived(bSafe * U);
  const stripH = $derived(bSafe * U); // top-strip height
  const stripW = $derived((aSafe - bSafe) * U); // top-strip width

  // Rectangle diagram dimensions (a+b) × (a-b).
  const rectViewW = $derived(20 * U + PAD * 2);
  const rectViewH = $derived(10 * U + PAD * 2);
  const rectW = $derived((aSafe + bSafe) * U);
  const rectH = $derived((aSafe - bSafe) * U);
  const rectLeftW = $derived(aSafe * U);
  const rectRightW = $derived(bSafe * U);

  const liveTex = $derived(
    `${aSafe}^2 - ${bSafe}^2 = (${aSafe} + ${bSafe})(${aSafe} - ${bSafe}) = ${diff}`
  );
  const identityTex = 'a^2 - b^2 = (a + b)(a - b)';
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

    <section class="mb-6 bg-white rounded-lg border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-3">{m.instruction}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">{m.sliderALabel}: <span class="tabular-nums text-indigo-700">{aSafe}</span></span>
          <input
            type="range" min="2" max="10" step="1"
            bind:value={a}
            aria-valuetext={`a bằng ${aSafe}`}
            class="mt-1 w-full accent-indigo-600"
          />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">{m.sliderBLabel}: <span class="tabular-nums text-indigo-700">{bSafe}</span></span>
          <input
            type="range" min="1" max={aSafe} step="1"
            bind:value={b}
            aria-valuetext={`b bằng ${bSafe}`}
            class="mt-1 w-full accent-indigo-600"
          />
        </label>
      </div>
    </section>

    <section class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-lg border border-slate-200 p-3">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 text-center">{m.diagramSquareLabel}</h3>
        <svg
          viewBox="0 0 {sqViewW} {sqViewH}"
          class="block w-full"
          role="img"
          aria-label={m.diagramSquareLabel}
        >
          <!-- L-shape pieces -->
          {#if stripW > 0}
            <rect x={PAD} y={PAD} width={stripW} height={stripH} fill={PAIR1} fill-opacity="0.55" stroke={PAIR1} stroke-width="1" />
          {/if}
          {#if rectH > 0}
            <rect x={PAD} y={PAD + stripH} width={sqSize} height={sqSize - stripH} fill={PAIR2} fill-opacity="0.55" stroke={PAIR2} stroke-width="1" />
          {/if}
          <!-- Cut corner outline (white square, dashed) -->
          <rect x={PAD + stripW} y={PAD} width={cutSize} height={cutSize} fill="white" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3" />
          <!-- Outer square outline -->
          <rect x={PAD} y={PAD} width={sqSize} height={sqSize} fill="none" stroke="#1f2937" stroke-width="1.5" />
          <!-- Labels -->
          <text x={PAD + sqSize / 2} y={PAD - 8} text-anchor="middle" font-size="13" fill="#1f2937" font-weight="600">a = {aSafe}</text>
          <text x={PAD - 8} y={PAD + sqSize / 2} text-anchor="end" dominant-baseline="middle" font-size="13" fill="#1f2937" font-weight="600">a</text>
          {#if cutSize > 0}
            <text x={PAD + stripW + cutSize / 2} y={PAD - 4} text-anchor="middle" font-size="11" fill="#64748b">b = {bSafe}</text>
            <text x={PAD + sqSize + 4} y={PAD + cutSize / 2} text-anchor="start" dominant-baseline="middle" font-size="11" fill="#64748b">b</text>
          {/if}
        </svg>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 p-3">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 text-center">{m.diagramRectLabel}</h3>
        <svg
          viewBox="0 0 {rectViewW} {rectViewH}"
          class="block w-full"
          role="img"
          aria-label={m.diagramRectLabel}
        >
          {#if rectH > 0}
            <!-- Left part: a × (a-b), originated from L bottom -->
            <rect x={PAD} y={PAD} width={rectLeftW} height={rectH} fill={PAIR2} fill-opacity="0.55" stroke={PAIR2} stroke-width="1" />
            <!-- Right part: b × (a-b), originated from L top strip rotated 90° -->
            <rect x={PAD + rectLeftW} y={PAD} width={rectRightW} height={rectH} fill={PAIR1} fill-opacity="0.55" stroke={PAIR1} stroke-width="1" />
            <!-- Outer outline -->
            <rect x={PAD} y={PAD} width={rectW} height={rectH} fill="none" stroke="#1f2937" stroke-width="1.5" />
          {:else}
            <!-- Degenerate a = b: zero-height rectangle. Show a flat line w/ note. -->
            <line x1={PAD} y1={PAD + 5} x2={PAD + rectW} y2={PAD + 5} stroke="#1f2937" stroke-width="1.5" />
            <text x={PAD + rectW / 2} y={PAD + 30} text-anchor="middle" font-size="12" fill="#64748b" font-style="italic">a = b → a − b = 0 → diện tích = 0</text>
          {/if}
          <!-- Labels -->
          <text x={PAD + rectW / 2} y={PAD - 8} text-anchor="middle" font-size="13" fill="#1f2937" font-weight="600">a + b = {aSafe + bSafe}</text>
          {#if rectH > 0}
            <text x={PAD - 8} y={PAD + rectH / 2} text-anchor="end" dominant-baseline="middle" font-size="13" fill="#1f2937" font-weight="600">a − b = {aSafe - bSafe}</text>
          {/if}
        </svg>
      </div>
    </section>

    <p class="mb-6 text-sm text-slate-600 italic">{m.rearrangeNote}</p>

    <section class="mb-6 rounded-lg border border-slate-200 bg-white p-5">
      <h2 class="text-lg font-bold text-slate-900 mb-3">{m.numericTitle}</h2>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm tabular-nums mb-4" aria-live="polite">
        <div><span class="font-semibold">a²:</span> {aSq}</div>
        <div><span class="font-semibold">b²:</span> {bSq}</div>
        <div><span class="font-semibold" style="color:{PAIR1}">a² − b²:</span> {diff}</div>
        <div><span class="font-semibold" style="color:{PAIR2}">(a + b)(a − b):</span> {product}</div>
      </div>
      <div class="text-slate-800">
        <Tex display math={liveTex} />
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.identityTitle}</h2>
      <p class="rounded-lg bg-slate-100 p-4 text-slate-800 mb-3">{m.identityStatement}</p>
      <Tex display math={identityTex} />
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
