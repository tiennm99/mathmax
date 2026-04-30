<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { lessonsByTopic } from '$lib/lessons/registry.js';

  const copy = t();
  const topic = copy.topics['hinh-hoc'];
  const lessons = lessonsByTopic('hinh-hoc');
</script>

<svelte:head>
  <title>{topic.title} — {copy.site.title}</title>
  <meta name="description" content={topic.blurb} />
</svelte:head>

<header class="border-b border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href={base + '/'} class="text-xl font-bold text-indigo-600 tracking-tight">MathMax</a>
    <nav aria-label="Điều hướng chính"></nav>
  </div>
</header>

<main class="bg-slate-50 min-h-screen">
  <section class="max-w-4xl mx-auto px-4 py-12">
    <nav class="mb-6 text-sm">
      <a href={base + '/'} class="text-indigo-600 hover:underline">{copy.lessonChrome.backToHub}</a>
    </nav>

    <header class="mb-8">
      <h1 class="text-4xl font-bold text-slate-900 mb-2">{topic.title}</h1>
      <p class="text-lg text-slate-600">{topic.blurb}</p>
    </header>

    <ul class="grid md:grid-cols-2 gap-4" aria-label="Danh sách bài học hình học">
      {#each lessons as lesson (lesson.slug)}
        <li>
          <a
            href={base + `/hinh-hoc/${lesson.slug}/`}
            class="block bg-white rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-400 hover:shadow-sm"
          >
            <div class="flex items-baseline justify-between gap-3 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{lesson.gradeLabel}</span>
              <span class="text-xs text-emerald-700">{copy.status.live}</span>
            </div>
            <h2 class="text-lg font-bold text-slate-900 mb-1">{lesson.title}</h2>
            <p class="text-sm text-slate-600 leading-relaxed">{lesson.intro}</p>
          </a>
        </li>
      {/each}
    </ul>
  </section>
</main>

<footer class="border-t border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
    © {new Date().getFullYear()} ·
    <a href="https://github.com/tiennm99/mathmax" class="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Mã nguồn</a>
  </div>
</footer>
