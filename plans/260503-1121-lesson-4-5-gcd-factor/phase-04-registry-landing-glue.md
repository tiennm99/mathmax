---
phase: 4
title: "Registry + landing glue"
status: pending
priority: P2
effort: "2h"
dependencies: [2, 3]
---

# Phase 04: Registry + landing glue

## Overview
Wire the two new lessons into the lesson registry, enable the Số học and Đại số tiles on the root landing, and create topic landing pages at `/so-hoc/` and `/dai-so/`.

## Requirements
- Functional:
  - `lessons` registry includes both new lessons (slug, topic, grade, copy)
  - Root `/` page: Số học + Đại số tiles linked + clickable (no longer "Sắp ra mắt")
  - `/so-hoc/` lists Ước chung lớn nhất; placeholder text for upcoming lessons
  - `/dai-so/` lists Hiệu hai bình phương; placeholder text for upcoming lessons
  - Hình học landing already exists; check it still works
- Non-functional:
  - Topic landing pages reuse the same component structure as `/hinh-hoc/`
  - SEO meta on every new page

## Architecture
- Registry stays a single `lessons` array with helper `lessonsByTopic`. No restructuring.
- Topic landing pages are nearly identical except for the topic filter; copy lives in `src/lib/i18n/site.vi.js` (extend if needed).
- Root tile state derived from `lessonsByTopic('so-hoc').length > 0` etc. — auto-enables when first lesson per topic ships.

## Related Code Files
- Modify: `src/lib/lessons/registry.js` — import + push two new copies
- Modify: `src/routes/+page.svelte` — root landing tile state
- Modify: `src/lib/i18n/site.vi.js` — topic page chrome strings (if not already present)
- Create: `src/routes/so-hoc/+page.svelte` — số học topic landing
- Create: `src/routes/dai-so/+page.svelte` — đại số topic landing
- Read for pattern: `src/routes/hinh-hoc/+page.svelte`

## Implementation Steps

### 4.1 Registry update
```js
// src/lib/lessons/registry.js
import { vi as sssCopy } from './tam-giac-bang-nhau/copy.vi.js';
import { vi as similarityCopy } from './tam-giac-dong-dang/copy.vi.js';
import { vi as inscribedCopy } from './goc-noi-tiep/copy.vi.js';
import { vi as gcdCopy } from './uoc-chung-lon-nhat/copy.vi.js';
import { vi as diffSquaresCopy } from './hieu-hai-binh-phuong/copy.vi.js';

export const lessons = [
  gcdCopy,           // số học
  diffSquaresCopy,   // đại số
  sssCopy,           // hình học
  similarityCopy,
  inscribedCopy,
];
```
Order: by topic → grade ascending. Nav order will follow the array.

### 4.2 Root landing
- Read current `src/routes/+page.svelte` first (likely uses hard-coded "Sắp ra mắt" labels)
- Replace per-topic disabled state with derived check:
  ```js
  let hasSoHoc = $derived(lessonsByTopic('so-hoc').length > 0);
  let hasDaiSo = $derived(lessonsByTopic('dai-so').length > 0);
  let hasHinhHoc = $derived(lessonsByTopic('hinh-hoc').length > 0);
  ```
- Tile component:
  - Enabled → `<a href="/so-hoc/">…</a>` with lesson count badge
  - Disabled → `<div>` with "Sắp ra mắt" overlay (kept for future-empty topics, none currently)

### 4.3 Topic landing pages
Pattern for both `/so-hoc/+page.svelte` and `/dai-so/+page.svelte`:
- Import `lessonsByTopic` from registry
- Render a list of lesson cards (title, grade badge, intro snippet, link)
- Order: by grade ascending, then by registry position
- One placeholder card "Sắp ra mắt" for future lessons (optional; or omit)
- `<svelte:head>` with topic-level SEO

### 4.4 i18n site chrome
- Check `src/lib/i18n/site.vi.js` for existing topic strings
- Add if missing:
  ```js
  topics: {
    'so-hoc': { title: 'Số học', tagline: '...' },
    'dai-so': { title: 'Đại số', tagline: '...' },
    'hinh-hoc': { title: 'Hình học', tagline: '...' },
  }
  ```

## Success Criteria
- [ ] Root page tiles for Số học + Đại số are clickable (linked to topic pages)
- [ ] `/so-hoc/` shows Ước chung lớn nhất card → links to lesson
- [ ] `/dai-so/` shows Hiệu hai bình phương card → links to lesson
- [ ] `/hinh-hoc/` still shows all 3 existing lessons (regression check)
- [ ] All routes prerender at build (no SSR/CSR mismatch)
- [ ] svelte-check clean

## Risk Assessment
- **Risk**: Existing hinh-hoc landing pattern may not directly generalize.
  **Mitigation**: Read it first; refactor to `lessonsByTopic(topic)` pattern if it isn't already.
- **Risk**: Lesson order in registry affects nav consistency.
  **Mitigation**: Document ordering rule in registry.js comment.

## Notes
- next/prev lesson navigation footer is **deferred** (port spec §13 Q4) — revisit at lesson 6+.
- Grade-filter UI on topic pages also deferred (Sub-project §3.4).
