# Plan: Add Bylines Collection & Unified Writing Hub

## Context

Rod has published articles at Austin Chronicle and Cinapse (and potentially other outlets). These should be represented on rodmachen.com without copying content — just metadata linking out to the originals. The existing "Blog" section (local posts from 2013-2016) will be renamed "Writing" and expanded to include these external bylines alongside the existing posts.

## Approach

### 1. New `bylines` content collection

Add a `bylines` collection in `src/content.config.ts` alongside the existing `posts` collection.

**Schema fields:**
- `title` (string, required)
- `publication` (string, required) — e.g. "Austin Chronicle", "Cinapse"
- `url` (string, required) — link to the original article
- `date` (coerced date, required)
- `tags` (string or array, optional) — e.g. "film", "food", "sxsw"

**File location:** `src/content/bylines/`
**Naming convention:** `YYYY-MM-DD-slug.md` (matching existing posts pattern)
**File contents:** Frontmatter only, no body content needed.

Example file (`src/content/bylines/2025-09-05-the-threesome.md`):
```yaml
---
title: "The Threesome"
publication: Austin Chronicle
url: https://www.austinchronicle.com/screens/2025-09-05/the-threesome/
date: 2025-09-05
tags:
  - film
---
```

### 2. Rename Blog → Writing

**Files to modify:**

- **`src/pages/index.astro`** — Change nav link from `/blog/` "Blog" to `/writing/` "Writing"
- **`src/pages/blog/index.astro`** → Move to **`src/pages/writing/index.astro`**
  - Rename title from "Blog" to "Writing"
  - Fetch both `posts` and `bylines` collections
  - Merge and sort by date (newest first)
  - Show recent 10 items from the combined list
  - Byline entries link externally (with a publication label); blog posts link internally as before
  - Visual indicator for external links (publication name shown inline, e.g. "The Threesome · Austin Chronicle →")

### 3. Writing listing page design

Each item in the combined list shows:
- **Date** (left, as now)
- **Title** (linked — internal for posts, external with `target="_blank"` for bylines)
- **Publication label** for bylines only (subtle, after the title)

### 4. Archive and categories updates

- **`src/pages/archive/[...page].astro`** — Include bylines in the paginated archive alongside posts. Bylines link externally.
- **`src/pages/categories/index.astro`** — Count tags from both collections.
- **`src/pages/categories/[tag].astro`** — Show posts and bylines matching the tag.

### 5. Navigation updates

- **`src/components/Header.astro`** — Change "Archive" to link text if needed; no structural changes required since nav already exists.
- **Homepage nav** — `/blog/` → `/writing/`

### 6. Seed initial byline files

Create markdown files for the articles from both publications. Each file is ~5 lines of frontmatter. Approximately 20-25 files based on what's visible on the author pages.

### 7. Adding new bylines (ongoing workflow)

When a new article is published:
1. Create a new file in `src/content/bylines/` following the naming convention
2. Add frontmatter with title, publication, url, date, and optional tags
3. Deploy

No scripts, no build tools, no external dependencies — just a new markdown file.

## Files to create
- `src/content/bylines/*.md` — One per external article (~20-25 initial files)

## Files to modify
- `src/content.config.ts` — Add `bylines` collection definition
- `src/pages/index.astro` — Blog → Writing nav link
- `src/pages/blog/index.astro` → rename/move to `src/pages/writing/index.astro` — Merge both collections
- `src/pages/archive/[...page].astro` — Include bylines
- `src/pages/categories/index.astro` — Count byline tags
- `src/pages/categories/[tag].astro` — Include bylines in tag listings

## Verification
- `npm run dev` and check `/writing/` shows both local posts and external bylines
- Confirm byline links open in new tab to the correct external URL
- Confirm `/archive/` includes bylines
- Confirm `/categories/` reflects tags from both collections
- Confirm homepage link goes to `/writing/`
- Add a test byline file and confirm it appears correctly
