# MathMax

Toán tương tác cho học sinh THCS Việt Nam (lớp 6-9). Số học, Đại số, Hình học qua kéo-thả và minh hoạ trực quan.

## Status

3 bài hình học đầu tiên đã ra mắt. Số học và Đại số vẫn "Sắp ra mắt".

- Lớp 7 — Tam giác bằng nhau (SSS): `/hinh-hoc/tam-giac-bang-nhau/`
- Lớp 8 — Tam giác đồng dạng: `/hinh-hoc/tam-giac-dong-dang/`
- Lớp 9 — Góc nội tiếp: `/hinh-hoc/goc-noi-tiep/`

## Develop

Yêu cầu: Node 24+, npm 11+.

```sh
npm install
npm run dev          # http://localhost:5173/mathmax/
npm run test         # Vitest (geom-engine unit tests)
npm run check        # svelte-check + JSDoc strict
npm run build        # Static output → build/
npm run preview      # Serve build/
```

## Deploy

Auto-deploy lên GitHub Pages từ `main` qua `actions/deploy-pages@v4`. Xem `RUNBOOK.md` để rollback / chuyển domain.

Live URL: https://tiennm99.github.io/mathmax/

## Architecture

- **Static**: SvelteKit + `@sveltejs/adapter-static`, `paths.base = '/mathmax'`, output `build/`.
- **Styling**: Tailwind 3 (PostCSS) + Be Vietnam Pro (woff2 qua `@fontsource`). Tick palette `colors.pair.{1,2,3}` được khai báo trong `tailwind.config.js`.
- **Language**: JavaScript only (Svelte 5, JSDoc qua `jsconfig.json` với `checkJs: true`).
- **Math engine**: `src/lib/geom-engine/` — module thuần (không phụ thuộc DOM): `vec`, `triangle`, `circle`, `ticks`. Vitest unit tests đi kèm.
- **Lessons**: mỗi bài là một `+page.svelte`; copy tiếng Việt colocate trong `src/lib/lessons/<slug>/copy.vi.js`.
- **Drag**: Svelte action `use:draggable` (`src/lib/actions/draggable.svelte.js`) — Pointer Events + bàn phím mũi tên cho a11y.
- **i18n**: Hiện chỉ có tiếng Việt. Site chrome ở `src/lib/i18n/site.vi.js`. English thêm sau bằng cách tạo `*.en.js` song song.

## License

Apache-2.0. Xem `LICENSE`.
