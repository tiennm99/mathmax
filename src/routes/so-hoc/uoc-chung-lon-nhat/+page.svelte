<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/uoc-chung-lon-nhat/copy.vi.js';
  import { gcd, lcm, gcdSteps } from '$lib/numtheory-engine/index.js';
  import Tex from '$lib/components/tex.svelte';

  const copy = t();

  let a = $state(48);
  let b = $state(18);
  let stepIdx = $state(0);

  // Sanitize inputs into the [1, 999] integer range without throwing.
  const aSafe = $derived(Math.max(1, Math.min(999, Math.trunc(Number(a)) || 1)));
  const bSafe = $derived(Math.max(1, Math.min(999, Math.trunc(Number(b)) || 1)));

  const steps = $derived(gcdSteps(aSafe, bSafe));
  const visibleSteps = $derived(steps.slice(0, stepIdx));
  const finished = $derived(stepIdx >= steps.length);
  const result = $derived(finished ? gcd(aSafe, bSafe) : null);
  const lcmValue = $derived(result !== null && result !== 0 ? lcm(aSafe, bSafe) : null);

  // Reset trace whenever inputs change.
  $effect(() => {
    aSafe; bSafe;
    stepIdx = 0;
  });

  const lcmTex = $derived(
    lcmValue !== null && result !== null
      ? `\\text{BCNN}(${aSafe}, ${bSafe}) = \\frac{${aSafe} \\cdot ${bSafe}}{${result}} = ${lcmValue}`
      : ''
  );
  const gcdTex = $derived(
    result !== null ? `\\text{ƯCLN}(${aSafe}, ${bSafe}) = ${result}` : ''
  );

  function stepOnce() { if (stepIdx < steps.length) stepIdx += 1; }
  function autoFinish() { stepIdx = steps.length; }
  function reset() { stepIdx = 0; }
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
      <a href={base + '/so-hoc/'} class="text-indigo-600 hover:underline">{copy.lessonChrome.backToTopic}</a>
    </nav>

    <header class="mb-6">
      <div class="text-sm uppercase tracking-wide text-slate-500">{m.gradeLabel}</div>
      <h1 class="text-3xl font-bold text-slate-900 mt-1 mb-2">{m.title}</h1>
      <p class="text-slate-700 leading-relaxed">{m.intro}</p>
    </header>

    <section class="mb-6 bg-white rounded-lg border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-3">{m.instruction}</p>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">{m.inputALabel}</span>
          <input
            type="number" min="1" max="999" step="1"
            bind:value={a}
            class="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">{m.inputBLabel}</span>
          <input
            type="number" min="1" max="999" step="1"
            bind:value={b}
            class="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          onclick={stepOnce}
          disabled={finished}
          class="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >{m.stepBtn}</button>
        <button
          type="button"
          onclick={autoFinish}
          disabled={finished}
          class="px-4 py-2 rounded-md bg-white border border-indigo-600 text-indigo-700 font-semibold hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >{m.autoBtn}</button>
        <button
          type="button"
          onclick={reset}
          class="px-4 py-2 rounded-md bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >{m.resetBtn}</button>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.rowDescription}</h2>
      <div aria-live="polite">
        <table class="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr class="border-b-2 border-slate-300 text-slate-600">
              <th class="text-left py-2 px-3 font-semibold">#</th>
              <th class="text-right py-2 px-3 font-semibold">{m.tableHeaderA}</th>
              <th class="text-right py-2 px-3 font-semibold">{m.tableHeaderQ} · {m.tableHeaderB}</th>
              <th class="text-right py-2 px-3 font-semibold">+ {m.tableHeaderR}</th>
            </tr>
          </thead>
          <tbody>
            {#each visibleSteps as step, i (i)}
              <tr class="border-b border-slate-200">
                <td class="py-2 px-3 text-slate-500">{i + 1}</td>
                <td class="py-2 px-3 text-right font-semibold text-slate-900">{step.a}</td>
                <td class="py-2 px-3 text-right text-slate-700">= {step.q} · {step.b}</td>
                <td class="py-2 px-3 text-right text-slate-700">+ {step.r}</td>
              </tr>
            {/each}
            {#if visibleSteps.length === 0}
              <tr><td colspan="4" class="py-4 px-3 text-center text-slate-400 italic">Nhấn "{m.stepBtn}" để bắt đầu</td></tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    {#if result !== null}
      <section class="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5" aria-live="polite">
        <div class="text-emerald-800 font-semibold text-lg mb-2">
          ✓ {m.resultLabel}(<span class="tabular-nums">{aSafe}</span>, <span class="tabular-nums">{bSafe}</span>) = <span class="tabular-nums">{result}</span>
        </div>
        <div class="text-slate-800 mb-3">
          <Tex display math={gcdTex} />
        </div>
        {#if lcmValue !== null}
          <div class="text-slate-800">
            <div class="text-sm font-semibold text-slate-600 mb-1">{m.lcmLabel}:</div>
            <Tex display math={lcmTex} />
          </div>
        {/if}
      </section>
    {/if}

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
