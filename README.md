# MathMax

Toán tương tác cho học sinh THCS Việt Nam (lớp 6-9). Số học, Đại số, Hình học qua kéo-thả và minh hoạ trực quan.

## Status

8 bài đã ra mắt — số học, đại số, hình học đều có ít nhất hai bài.

- Lớp 6 — Ước chung lớn nhất (Euclid): `/so-hoc/uoc-chung-lon-nhat/`
- Lớp 6 — Sàng Eratosthenes: `/so-hoc/sang-eratosthenes/`
- Lớp 7 — Hiệu hai bình phương: `/dai-so/hieu-hai-binh-phuong/`
- Lớp 7 — Đồ thị y = ax + b: `/dai-so/duong-thang/`
- Lớp 7 — Định lý Pythagoras: `/hinh-hoc/dinh-ly-pythagoras/`
- Lớp 7 — Tam giác bằng nhau (SSS): `/hinh-hoc/tam-giac-bang-nhau/`
- Lớp 8 — Tam giác đồng dạng: `/hinh-hoc/tam-giac-dong-dang/`
- Lớp 9 — Góc nội tiếp: `/hinh-hoc/goc-noi-tiep/`

## Develop

Yêu cầu: Node 24+, pnpm 11+.

```sh
pnpm install
pnpm dev          # http://localhost:5173/mathmax/
pnpm test         # Vitest (geom-engine unit tests)
pnpm check        # svelte-check + JSDoc strict
pnpm build        # Static output → build/
pnpm preview      # Serve build/
```

## Deploy

Auto-deploy lên GitHub Pages từ `main` qua `actions/deploy-pages@v4`. Xem `RUNBOOK.md` để rollback / chuyển domain.

Live URL: https://tiennm99.github.io/mathmax/

## Architecture

- **Static**: SvelteKit + `@sveltejs/adapter-static`, `paths.base = '/mathmax'`, output `build/`.
- **Styling**: Tailwind 3 (PostCSS) + Be Vietnam Pro (woff2 qua `@fontsource`). Tick palette `colors.pair.{1,2,3,4}` được khai báo trong `tailwind.config.js`.
- **Language**: JavaScript only (Svelte 5, JSDoc qua `jsconfig.json` với `checkJs: true`).
- **Math engines**: `src/lib/geom-engine/` (vec, triangle, circle, ticks, transforms), `src/lib/numtheory-engine/` (gcd, lcm, gcdSteps, sieve), `src/lib/algebra-engine/` (linear). Module thuần, không phụ thuộc DOM. Vitest unit tests đi kèm.
- **Math typography**: `src/lib/components/tex.svelte` — wrapper KaTeX duy nhất. SSR qua `renderToString`, không cần JS phía client để hiển thị.
- **Lessons**: mỗi bài là một `+page.svelte`; copy tiếng Việt colocate trong `src/lib/lessons/<slug>/copy.vi.js`.
- **Drag**: Svelte action `use:draggable` (`src/lib/actions/draggable.svelte.js`) — Pointer Events + bàn phím mũi tên cho a11y.
- **i18n**: Hiện chỉ có tiếng Việt. Site chrome ở `src/lib/i18n/site.vi.js`. English thêm sau bằng cách tạo `*.en.js` song song.

## License

Apache-2.0. Xem `LICENSE`.
