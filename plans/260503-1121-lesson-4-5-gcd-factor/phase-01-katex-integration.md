---
phase: 1
title: "KaTeX integration"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 01: KaTeX integration

## Overview
Add KaTeX to the project, wrap it in a single `<Tex>` Svelte component, and verify rendering in a sandbox route. This is the only place KaTeX is touched directly — every lesson uses `<Tex math="..." />`.

## Requirements
- Functional: render inline + display math from a string prop; SSR-safe (KaTeX renders to static HTML, no client JS needed for display)
- Non-functional: no FOUC; CSS loaded once at app level; no per-component CSS imports
- A11y: KaTeX outputs MathML alongside HTML — keep it; `aria-label` fallback prop for screen readers when math expression is non-trivial

## Architecture
- KaTeX has two APIs: `katex.render(string, element, options)` (mutates DOM) and `katex.renderToString(string, options)` (returns HTML string).
- Use `renderToString` — pure function, SSR-friendly, plugs into `{@html}`. No `$effect` needed.
- CSS imported once in `+layout.svelte` so it's in the global bundle.
- KaTeX fonts are auto-fetched via CSS `@font-face` from the package's `dist/fonts/` — Vite's static asset handling picks them up.

## Related Code Files
- Create: `src/lib/components/tex.svelte` — `<Tex>` component
- Create: `src/routes/__sandbox/katex/+page.svelte` — smoke test route (delete in Phase 05 or leave guarded by `dev` mode)
- Modify: `src/routes/+layout.svelte` — add `import 'katex/dist/katex.min.css'`
- Modify: `package.json` — add `katex` dep + `@types/katex` is unnecessary (we use JSDoc)

## Implementation Steps
1. `npm install katex@^0.16.x` — pin minor; KaTeX is mature, breaking changes rare.
2. Create `src/lib/components/tex.svelte`:
   ```svelte
   <script>
     import katex from 'katex';
     /** @type {{ math: string, display?: boolean, ariaLabel?: string }} */
     let { math, display = false, ariaLabel } = $props();
     const html = katex.renderToString(math, {
       displayMode: display,
       throwOnError: false,
       output: 'htmlAndMathml',
     });
   </script>
   {#if ariaLabel}
     <span aria-label={ariaLabel}>{@html html}</span>
   {:else}
     {@html html}
   {/if}
   ```
3. Add `import 'katex/dist/katex.min.css';` at top of `<script>` block in `src/routes/+layout.svelte`.
4. Create sandbox route `src/routes/__sandbox/katex/+page.svelte` rendering 4-5 expressions covering: inline (`a^2 - b^2`), display (`\frac{a \cdot b}{\gcd(a,b)}`), Vietnamese mixed text, Greek letters, fractions with sqrt.
5. `npm run dev` — visit `/__sandbox/katex/` — verify rendering; check no FOUC; confirm fonts load (Network tab).
6. `npm run build` — verify static prerender includes KaTeX HTML inline (view-source on built file).
7. `npm run check` — must stay green.

## Success Criteria
- [ ] `<Tex math="..." />` renders inline math
- [ ] `<Tex math="..." display />` renders display math (centered, larger)
- [ ] No console errors / warnings on dev or build
- [ ] Built static HTML contains rendered math (not just `<Tex>` placeholder)
- [ ] Bundle size delta logged in plan.md "Success criteria" section
- [ ] svelte-check clean

## Risk Assessment
- **Risk**: KaTeX bundle size (~300KB gzip with fonts) inflates Lighthouse perf score.
  **Mitigation**: Acceptable trade for math site; document in `RUNBOOK.md`. If we need to shed weight later, we can lazy-load KaTeX per-route.
- **Risk**: Font loading flash.
  **Mitigation**: KaTeX CSS uses `font-display: swap`; system fallback is acceptable for the ~50ms gap.
- **Risk**: SSR mismatch warnings (Svelte hydration).
  **Mitigation**: `renderToString` is deterministic — no mismatch expected. Verify in dev console.

## Notes
- Sandbox route name uses `__sandbox/` prefix so it's obvious it's not user-facing. Decide in Phase 05 whether to delete or keep behind `if (dev)` guard.
- Do NOT add `mhchem` / `copy-tex` extensions — YAGNI.
