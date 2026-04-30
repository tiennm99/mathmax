# MathMax

Toán tương tác cho học sinh THCS Việt Nam (lớp 6-9). Số học, Đại số, Hình học qua kéo-thả và minh hoạ trực quan.

## Status

Scaffold only (v0.0.1.0). Landing page liệt kê 3 chủ đề với "Sắp ra mắt". Modules tương tác sẽ ra mắt từng phần.

## Develop

Yêu cầu: Node 24+, npm 11+.

```sh
npm install
npm run dev          # http://localhost:5173/mathmax/
npm run build        # Static output → build/
npm run preview      # Serve build/
```

## Deploy

Auto-deploy lên GitHub Pages từ `main` qua `actions/deploy-pages@v4`. Xem `RUNBOOK.md` để rollback / chuyển domain.

Live URL: https://tiennm99.github.io/mathmax/

## Architecture

- **Static**: SvelteKit + `@sveltejs/adapter-static`, `paths.base = '/mathmax'`, output `build/`.
- **Styling**: Tailwind 3 (PostCSS), system font stack (Be Vietnam Pro sẽ thêm khi có module đầu tiên).
- **Language**: JavaScript only (Svelte 5, JSDoc qua `jsconfig.json`).
- **i18n**: Hiện chỉ có tiếng Việt. English thêm khi cần.

## License

Apache-2.0. Xem `LICENSE`.
