<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/dinh-ly-pythagoras/copy.vi.js';
  import Tex from '$lib/components/tex.svelte';
  import { draggable } from '$lib/actions/draggable.svelte.js';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import {
    squareA, squareB, squareC, altitudeFoot,
    shearATarget, shearBTarget, lerpPoly, polyPoints,
  } from '$lib/lessons/dinh-ly-pythagoras/geom-helpers.js';

  const copy = t();
  const VIEW = 400;
  // Layout: apex fixed at y=100, foot fixed at x=320; right-angle vertex R is draggable.
  // Min leg 40px prevents degenerate triangles and keeps squares visible.
  const APEX_Y = 100, FOOT_X = 320;
  const INIT = { x: 160, y: 280 };

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** @type {SVGSVGElement | undefined} */ let svgEl = $state();
  let R = $state({ ...INIT });
  /** @type {'idle'|'animating'|'proven'} */ let phase = $state('idle');
  let announcement = $state('');
  /** @type {ReturnType<typeof setTimeout>|null} */ let debounceId = null;

  const tp = tweened(0, { duration: reducedMotion ? 0 : 2000, easing: cubicOut });

  // ── Derived geometry ──────────────────────────────────────────────────────
  const A = $derived({ x: R.x, y: APEX_Y });
  const H = $derived({ x: FOOT_X, y: R.y });
  const a = $derived(R.y - APEX_Y);
  const b = $derived(FOOT_X - R.x);
  const c = $derived(Math.hypot(a, b));
  const sqA = $derived(squareA(A, R));
  const sqB = $derived(squareB(R, H));
  const sqC = $derived(squareC(A, H, a, b, c));
  const F   = $derived(altitudeFoot(A, H, a, c));
  const tgtA = $derived(shearATarget(A, F, a, b, c));
  const tgtB = $derived(shearBTarget(F, H, a, b, c));
  // Phase A: shear-a moves in first half of tween; phase B: shear-b in second half
  const tA = $derived(Math.min(1, $tp * 2));
  const tB = $derived(Math.max(0, $tp * 2 - 1));
  const shearA = $derived(lerpPoly(sqA, tgtA, tA));
  const shearB = $derived(lerpPoly(sqB, tgtB, tB));
  const texSides = $derived(`a=${a.toFixed(1)},\\;b=${b.toFixed(1)},\\;c=${c.toFixed(1)}`);
  const texNums  = $derived(`${(a*a).toFixed(1)}+${(b*b).toFixed(1)}=${(c*c).toFixed(1)}`);

  /** @param {{ x: number; y: number }} p */
  const clampR = (p) => ({
    x: Math.max(60, Math.min(FOOT_X - 40, p.x)),
    y: Math.max(APEX_Y + 40, Math.min(VIEW - 60, p.y)),
  });
  const dragOpts = $derived({
    point: R, svg: () => svgEl ?? null,
    viewBox: { w: VIEW, h: VIEW }, projector: clampR, pad: 0,
    keyStep: 1, keyShiftStep: 10,
    onChange: () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        announcement = `Cạnh a=${a.toFixed(1)}, b=${b.toFixed(1)}, huyền c=${c.toFixed(1)}`;
      }, 300);
    },
  });

  async function prove() {
    if (phase === 'animating') return;
    phase = 'animating';
    tp.set(0, { duration: 0 });
    await tp.set(1);
    phase = 'proven';
  }
  function reset() {
    phase = 'idle'; tp.set(0, { duration: 0 });
    R = { ...INIT }; announcement = '';
  }

  if (import.meta.env.DEV) {
    $effect(() => {
      if (phase === 'proven' && Math.abs(a*a + b*b - c*c) > 0.01)
        console.error(`[pythagoras] area mismatch: a²+b²=${a*a+b*b} c²=${c*c}`);
    });
  }
</script>

<svelte:head>
  <title>{m.title} — {copy.site.title}</title>
  <meta name="description" content={m.intro} />
</svelte:head>

<header class="border-b border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-4">
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

    <!-- aria-live: announces a/b/c when vertex moves (debounced 300ms) -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">{announcement}</div>

    <section class="mb-6">
      <svg bind:this={svgEl} viewBox="0 0 {VIEW} {VIEW}" preserveAspectRatio="xMidYMid meet"
        class="block w-full max-w-md mx-auto bg-white rounded-lg border border-slate-200"
        style="touch-action:none; aspect-ratio:1/1" role="img" aria-label={m.instruction}>

        <!-- Square-c (orange/hypotenuse) behind everything -->
        <polygon points={polyPoints(sqC)} fill="#F46036"
          fill-opacity={phase === 'proven' ? '0.15' : '0.35'} stroke="#F46036" stroke-width="1.5" />

        {#if phase === 'idle'}
          <polygon points={polyPoints(sqA)} fill="#D7263D" fill-opacity="0.45" stroke="#D7263D" stroke-width="1.5" />
          <polygon points={polyPoints(sqB)} fill="#1B998B" fill-opacity="0.45" stroke="#1B998B" stroke-width="1.5" />
        {:else}
          <!-- Shear-a morphs from square-a into the a²-sub-rectangle of square-c -->
          <polygon points={polyPoints(shearA)} fill="#D7263D" fill-opacity="0.65" stroke="#D7263D" stroke-width="1.5" />
          <!-- Shear-b morphs from square-b into the b²-sub-rectangle of square-c -->
          <polygon points={polyPoints(shearB)} fill="#1B998B" fill-opacity="0.65" stroke="#1B998B" stroke-width="1.5" />
        {/if}

        <!-- Triangle -->
        <polygon points="{A.x},{A.y} {R.x},{R.y} {H.x},{H.y}"
          fill="#e2e8f0" fill-opacity="0.7" stroke="#475569" stroke-width="2" />
        <!-- Right-angle box at R -->
        <rect x={R.x} y={R.y - 12} width="12" height="12" fill="none" stroke="#475569" stroke-width="1.5" />

        <!-- Labels -->
        <text x={R.x - 18} y={(APEX_Y + R.y) / 2} font-size="14" font-weight="700" fill="#D7263D">a</text>
        <text x={(R.x + FOOT_X) / 2} y={R.y + 18} font-size="14" font-weight="700" fill="#1B998B">b</text>
        <text x={(R.x + FOOT_X) / 2 + 6} y={(APEX_Y + R.y) / 2 - 10} font-size="14" font-weight="700" fill="#F46036">c</text>
        <text x={A.x + 6} y={A.y - 6} font-size="13" fill="#475569">A</text>
        <text x={H.x + 6} y={H.y + 4} font-size="13" fill="#475569">H</text>

        <!-- Draggable right-angle vertex -->
        <circle cx={R.x} cy={R.y} r="14" fill="#D7263D" stroke="#fff" stroke-width="2"
          role="button" tabindex="0"
          aria-label="Đỉnh góc vuông R — kéo hoặc dùng phím mũi tên để thay đổi tam giác"
          style="cursor:grab; outline:none" use:draggable={dragOpts} />
        <text x={R.x - 5} y={R.y + 5} font-size="13" font-weight="700" fill="#fff" pointer-events="none">R</text>
      </svg>
      <p class="mt-2 text-center text-sm text-slate-500">{m.instruction}</p>
    </section>

    <!-- Live KaTeX panel -->
    <section class="mb-6 rounded-lg border border-slate-200 bg-white p-5">
      <div class="mb-2 text-sm text-slate-700">
        <Tex math={texSides} ariaLabel="a={a.toFixed(1)}, b={b.toFixed(1)}, c={c.toFixed(1)}" />
      </div>
      <Tex display math="a^2 + b^2 = c^2" />
      <div class="mt-1 text-sm text-slate-600 tabular-nums">
        <Tex math={texNums} ariaLabel="{(a*a).toFixed(1)} + {(b*b).toFixed(1)} = {(c*c).toFixed(1)}" />
      </div>
    </section>

    <!-- Action buttons -->
    <section class="mb-6 flex gap-3 flex-wrap">
      <button onclick={prove} disabled={phase === 'animating'}
        class="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm
               hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2
               focus-visible:outline-offset-2 focus-visible:outline-indigo-600
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >{m.buttonProve}</button>
      <button onclick={reset}
        class="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700
               font-semibold text-sm hover:bg-slate-50 focus-visible:outline
               focus-visible:outline-2 focus-visible:outline-offset-2
               focus-visible:outline-indigo-600 transition-colors"
      >{m.buttonReset}</button>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.theoremTitle}</h2>
      <p class="rounded-lg bg-slate-100 p-4 text-slate-800">{m.theoremStatement}</p>
    </section>
    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.proofTitle}</h2>
      <p class="text-slate-700 leading-relaxed">{m.proofBody}</p>
    </section>
    <section class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.exampleTitle}</h2>
      <p class="text-slate-700 leading-relaxed">{m.exampleBody}</p>
    </section>
    <footer class="border-t border-slate-200 pt-4 text-sm text-slate-500">{m.nextTeaser}</footer>
  </article>
</main>
