<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { vi as m } from '$lib/lessons/sang-eratosthenes/copy.vi.js';
  import { createGridState } from '$lib/lessons/sang-eratosthenes/grid-interaction.svelte.js';

  const copy = t();

  /** One color per small prime — Map avoids numeric-literal indexing issues. */
  const PRIME_COLORS = new Map([
    [2, '#D7263D'],
    [3, '#1B998B'],
    [5, '#F46036'],
    [7, '#5E60CE'],
  ]);

  const TARGET_PRIMES = [2, 3, 5, 7];

  const grid = createGridState(m.announceRipple);

  /** @param {number} n */
  function cellColor(n) {
    return grid.markedPrimes.includes(n) ? PRIME_COLORS.get(n) : null;
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
      <a href={base + '/so-hoc/'} class="text-indigo-600 hover:underline">{copy.lessonChrome.backToTopic}</a>
    </nav>

    <header class="mb-6">
      <div class="text-sm uppercase tracking-wide text-slate-500">{m.gradeLabel}</div>
      <h1 class="text-3xl font-bold text-slate-900 mt-1 mb-2">{m.title}</h1>
      <p class="text-slate-700 leading-relaxed">{m.intro}</p>
    </header>

    <section class="mb-4">
      <p class="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-3">{m.instruction}</p>
    </section>

    <!-- Legend -->
    <section class="mb-4" aria-label={m.legendTitle}>
      <div class="flex flex-wrap gap-3">
        {#each TARGET_PRIMES as p (p)}
          <span class="inline-flex items-center gap-1.5 text-sm">
            <span class="inline-block w-3.5 h-3.5 rounded-sm flex-shrink-0" style="background:{PRIME_COLORS.get(p)}" aria-hidden="true"></span>
            <span style="color:{PRIME_COLORS.get(p)}" class="font-medium">{m.legendLabels[/** @type {keyof typeof m.legendLabels} */ (p)]}</span>
          </span>
        {/each}
      </div>
    </section>

    <!-- Grid -->
    <section class="mb-6">
      <div
        role="grid"
        aria-label="Lưới số 1 đến 100"
        aria-readonly={grid.rippling ? 'true' : 'false'}
        class="inline-grid grid-cols-10 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden w-full max-w-lg mx-auto select-none"
      >
        {#each { length: 100 } as _, idx}
          {@const n = idx + 1}
          {@const dotPrimes = grid.crossings.get(n) ?? []}
          {@const isCrossed = dotPrimes.length > 0}
          {@const color = cellColor(n)}
          <div role="row">
            <button
              role="gridcell"
              tabindex={idx === grid.focusIndex ? 0 : -1}
              bind:this={grid.cellRefs[idx]}
              onclick={() => grid.handleCellActivate(n)}
              onkeydown={(e) => grid.handleKeydown(e, idx)}
              aria-label="{n}{isCrossed ? ` — bội của ${dotPrimes.join(' và ')}` : ''}${color ? ' — số nguyên tố đã chọn' : ''}"
              aria-disabled={n === 1 ? 'true' : undefined}
              class="relative flex flex-col items-center justify-center bg-white w-full aspect-square text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500
                {n === 1 ? 'text-slate-300 cursor-default' : ''}
                {isCrossed ? 'opacity-50' : ''}
                {grid.shakeIndex === idx ? 'animate-[shake_0.35s_ease]' : ''}"
              style="{color ? `box-shadow:inset 0 0 0 2px ${color};` : ''}{isCrossed ? 'text-decoration:line-through;' : ''}"
            >
              <span>{n}</span>
              {#if dotPrimes.length > 0}
                <span class="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5" aria-hidden="true">
                  {#each dotPrimes as dp (dp)}
                    <span class="w-1 h-1 rounded-full flex-shrink-0" style="background:{PRIME_COLORS.get(dp)}"></span>
                  {/each}
                </span>
              {/if}
            </button>
          </div>
        {/each}
      </div>
    </section>

    <!-- Reset -->
    <section class="mb-8 flex justify-center">
      <button
        onclick={grid.handleReset}
        class="px-5 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
      >{m.resetLabel}</button>
    </section>

    <section class="mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.theoremTitle}</h2>
      <p class="rounded-lg bg-slate-100 p-4 text-slate-800 leading-relaxed">{m.theoremStatement}</p>
    </section>

    <section class="mb-10">
      <h2 class="text-lg font-bold text-slate-900 mb-2">{m.exampleTitle}</h2>
      <p class="text-slate-700 leading-relaxed">{m.exampleBody}</p>
    </section>

    <footer class="border-t border-slate-200 pt-4 text-sm text-slate-500">{m.nextTeaser}</footer>
  </article>
</main>

<div aria-live="polite" aria-atomic="true" class="sr-only">{grid.announcement}</div>

<style>
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-3px); }
    40%,80%  { transform: translateX(3px); }
  }
</style>
