<svelte:head>
  <title>MathMax — Toán cho học sinh THCS</title>
  <meta name="description" content="MathMax giúp học sinh THCS lớp 6-9 học toán qua tương tác. Số học, Đại số, Hình học. Sắp ra mắt." />
</svelte:head>

<!-- Header -->
<header class="border-b border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <span class="text-xl font-bold text-indigo-600 tracking-tight">MathMax</span>
    <!-- Nav placeholder — future phases will add topic links -->
    <nav aria-label="Điều hướng chính"></nav>
  </div>
</header>

<!-- Hero -->
<main class="bg-slate-50 min-h-screen">
  <section class="max-w-4xl mx-auto px-4 py-16 text-center">
    <h1 class="text-5xl font-bold text-slate-900 mb-4">MathMax</h1>
    <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
      Toán tương tác cho học sinh THCS — lớp 6 đến lớp 9. Khám phá Số học, Đại số, Hình học qua các hoạt động kéo-thả, thử nghiệm, và minh hoạ trực quan.
    </p>

    <!-- Scope strip -->
    <div class="flex flex-col items-center gap-3">
      <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Phạm vi</span>
      <ul class="flex flex-wrap justify-center gap-2" aria-label="Các lớp học được hỗ trợ">
        <li>
          <span class="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">Lớp 6</span>
        </li>
        <li>
          <span class="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">Lớp 7</span>
        </li>
        <li>
          <span class="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">Lớp 8</span>
        </li>
        <li>
          <span class="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">Lớp 9</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- Topics -->
  <section class="max-w-4xl mx-auto px-4 pb-20">
    <h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">Chủ đề</h2>
    <ul class="grid md:grid-cols-3 gap-6" aria-label="Danh sách chủ đề">

      <!-- Card: Số học -->
      <li
        aria-disabled="true"
        class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 opacity-75 cursor-default select-none"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">Số học</h3>
          <span class="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Sắp ra mắt
          </span>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed flex-1">
          Phép tính, ước-bội, phân số, số nguyên. Trực quan hoá thuật toán và quy luật.
        </p>
      </li>

      <!-- Card: Đại số -->
      <li
        aria-disabled="true"
        class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 opacity-75 cursor-default select-none"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">Đại số</h3>
          <span class="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Sắp ra mắt
          </span>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed flex-1">
          Biểu thức, phương trình, hàm số. Thao tác kéo-thả các đối tượng đại số.
        </p>
      </li>

      <!-- Card: Hình học -->
      <li
        aria-disabled="true"
        class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 opacity-75 cursor-default select-none"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">Hình học</h3>
          <span class="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Sắp ra mắt
          </span>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed flex-1">
          Tam giác, tứ giác, đường tròn. Kéo điểm, định lý sống động.
        </p>
      </li>

    </ul>
  </section>
</main>

<!-- Footer -->
<footer class="border-t border-slate-200 bg-white">
  <div class="max-w-4xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500">
    <span>© {new Date().getFullYear()}</span>
    <a
      href="https://github.com/tiennm99"
      class="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >tiennm99</a>
    <span aria-hidden="true">·</span>
    <a
      href="https://github.com/tiennm99/mathmax/blob/main/LICENSE"
      class="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >Apache-2.0</a>
    <span aria-hidden="true">·</span>
    <a
      href="https://github.com/tiennm99/mathmax"
      class="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >Mã nguồn</a>
  </div>
</footer>
