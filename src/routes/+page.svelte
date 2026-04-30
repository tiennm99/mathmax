<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';

  const copy = t();
  /** @type {Array<keyof typeof copy.topics>} */
  const topicOrder = ['so-hoc', 'dai-so', 'hinh-hoc'];
  const topics = topicOrder.map((key) => ({ key, ...copy.topics[key] }));
</script>

<svelte:head>
  <title>MathMax — Toán cho học sinh THCS</title>
  <meta name="description" content={copy.site.description} />
</svelte:head>

<header class="border-b border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <span class="text-xl font-bold text-indigo-600 tracking-tight">MathMax</span>
    <nav aria-label="Điều hướng chính"></nav>
  </div>
</header>

<main class="bg-slate-50 min-h-screen">
  <section class="max-w-4xl mx-auto px-4 py-16 text-center">
    <h1 class="text-5xl font-bold text-slate-900 mb-4">{copy.site.title}</h1>
    <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
      {copy.site.description}
    </p>

    <div class="flex flex-col items-center gap-3">
      <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">{copy.hub.scopeLabel}</span>
      <ul class="flex flex-wrap justify-center gap-2" aria-label="Các lớp học được hỗ trợ">
        {#each Object.values(copy.grades) as label}
          <li><span class="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">{label}</span></li>
        {/each}
      </ul>
    </div>
  </section>

  <section class="max-w-4xl mx-auto px-4 pb-20">
    <h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">{copy.hub.topicsTitle}</h2>
    <ul class="grid md:grid-cols-3 gap-6" aria-label="Danh sách chủ đề">
      {#each topics as topic (topic.key)}
        {@const isLive = topic.status === 'live' && topic.href}
        <li>
          {#if isLive}
            <a
              href={base + topic.href}
              class="block bg-white rounded-2xl border border-slate-200 p-6 transition hover:border-indigo-400 hover:shadow-sm h-full"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-slate-900">{topic.title}</h3>
                <span class="text-xs font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  {copy.status[/** @type {keyof typeof copy.status} */ (topic.status)]}
                </span>
              </div>
              <p class="text-sm text-slate-500 leading-relaxed">{topic.blurb}</p>
            </a>
          {:else}
            <div
              aria-disabled="true"
              class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 opacity-75 cursor-default select-none h-full"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-slate-900">{topic.title}</h3>
                <span class="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  {copy.status[/** @type {keyof typeof copy.status} */ (topic.status)]}
                </span>
              </div>
              <p class="text-sm text-slate-500 leading-relaxed flex-1">{topic.blurb}</p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </section>
</main>

<footer class="border-t border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500">
    <span>© {new Date().getFullYear()}</span>
    <a href="https://github.com/tiennm99" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">tiennm99</a>
    <span aria-hidden="true">·</span>
    <a href="https://github.com/tiennm99/mathmax/blob/main/LICENSE" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Apache-2.0</a>
    <span aria-hidden="true">·</span>
    <a href="https://github.com/tiennm99/mathmax" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Mã nguồn</a>
  </div>
</footer>
