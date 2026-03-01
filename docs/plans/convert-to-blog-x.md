# Plan: Restructure as Blog at edition.rodmachen.com

> **STATUS:** COMPLETE — All 9 phases implemented. 32 original posts, 13 newsletter posts (Substack migration), and 353 bylines (218 Cinapse + 135 Chronicle) live on site. AI tags applied to all content. Site configured at edition.rodmachen.com with Vercel redirects.

## Context
The site is becoming a blog-only site at `edition.rodmachen.com`. The current splash homepage will move to a separate project for `rodmachen.com`. This plan also incorporates the Substack migration (13 newsletter posts), adds support for multiple post templates (article, newsletter, review) — like multiple blogs under one URL, distinguished by category — and adds a **bylines** collection for articles published at external outlets (Austin Chronicle, Cinapse, etc.).

## Categories & Templates
- **article** — existing posts (2013–2016), general long-form writing (reduced after removing `published: true` posts — see below)
- **essay** — personal essays and opinion pieces
- **newsletter** — 13 Substack posts (2023–2025), The Hangman Chronicles
- **review** — restaurant/dining reviews (no posts yet, template ready for future use)
- **byline** — articles published at external outlets (Austin Chronicle, Cinapse, etc.), stored as metadata + first-paragraph excerpts that link out to the original

Each category gets its own URL namespace (`/article/slug/`, `/newsletter/slug/`, `/essay/slug/`, `/review/slug/`), visual template, and section on the blog homepage. Bylines don't have their own pages — they appear in listings and link directly to the external URL.

## Post Cleanup: Remove `published: true` Posts

Many of the existing ~65 posts in `src/content/posts/` are copies of pieces that were published at Austin Chronicle or Cinapse. These are marked with `published: true` in their frontmatter (the `published` tag also appears in `tags`). Since these will now be represented as byline entries linking to the original publication, the local copies should be **deleted** during Phase 6 to avoid duplication. Only posts with `published: false` or no `published` field are original/unpublished content and should remain as articles.

---

## Phase 1: Foundation — Shared Utilities & Schema

### 1a. Create `src/utils/posts.ts`
Extract duplicated helpers (`getPostSlug`, `getPostCategory`) from multiple page files into one shared module. Add:
- `CATEGORY_CONFIG` map with label, description, and accent color per category
- `getPostsByCategory()` grouping helper

### 1b. Update `src/content.config.ts`
- Normalize `category` to always return a single string via `.transform()` (existing array-form frontmatter continues to work)
- Add optional `template` field: `z.enum(['article', 'essay', 'newsletter', 'review']).optional()` — allows explicit override, defaults to category value

**Files:** `src/utils/posts.ts` (create), `src/content.config.ts` (modify)

---

## Phase 2: Multi-Template PostLayout

### 2a. Refactor `src/layouts/PostLayout.astro`
- Add `template` prop (defaults to `'article'`)
- Apply wrapper class `post--{template}` for template-specific styling
- Add conditional elements: newsletter badge for newsletter posts, placeholder structure for review metadata
- Template-specific CSS: different accent colors, heading treatments, optional banner area

### 2b. Update `src/pages/[category]/[slug].astro`
- Derive template from `post.data.template || post.data.category`
- Pass `template` prop to PostLayout
- Import helpers from `src/utils/posts.ts` instead of inline functions

**Files:** `src/layouts/PostLayout.astro` (modify), `src/pages/[category]/[slug].astro` (modify)

---

## Phase 3: New Blog Homepage

### 3a. Replace `src/pages/index.astro`
Remove the dark splash page. New homepage using `BaseLayout`:
- Hero section: "Edition" title + tagline
- Category sections: each shows up to 5 recent posts + "View all" link
- Uses `CATEGORY_CONFIG` for section labels/descriptions

### 3b. Redirect `/blog/` to `/`
Convert `src/pages/blog/index.astro` to a simple redirect (or remove and handle via vercel.json) since `/` is now the blog homepage.

### 3c. Update `src/components/Header.astro`
- Site name: "Edition" (or "Edition | Rod Machen")
- Nav: Home, Archive, Categories, About, Contact

**Files:** `src/pages/index.astro` (rewrite), `src/pages/blog/index.astro` (remove or redirect), `src/components/Header.astro` (modify)

---

## Phase 4: Unify Listing Pages

Refactor the dark-themed standalone pages to use `BaseLayout` for visual consistency:
- `src/pages/archive/[...page].astro` — use BaseLayout, import shared helpers
- `src/pages/categories/index.astro` — use BaseLayout
- `src/pages/categories/[tag].astro` — use BaseLayout, import shared helpers

**Files:** 3 page files (modify)

---

## Phase 5: Substack Migration

### 5a. Create `scripts/convert-substack.mjs`
- Reads Substack export (CSV + HTML files from `scripts/substack-export/`)
- Strips Substack chrome
- Downloads images from Substack CDN URLs found in `<img>` tags, saves to `public/images/newsletter/{post-slug}/`
- Rewrites `<img>` src attributes to use local paths (`/images/newsletter/{post-slug}/filename.ext`)
- Converts HTML to Markdown via `turndown`
- **Subtitle extraction:** Substack posts have a `subtitle` field in the CSV export — map to `subTitle` in frontmatter
- Outputs `.md` files to `src/content/posts/` with frontmatter:
  ```yaml
  subTitle: "Subtitle from Substack"
  category: newsletter
  tags: [newsletter]
  ```
- Filename format: `YYYY-MM-DD-{substack-slug}.md`

### 5b. Install dev dependencies
```
npm install -D turndown node-fetch
```

### 5c. Manual steps (user)
- Export data from Substack (Settings → Exports)
- Unzip to `scripts/substack-export/`
- Run conversion script
- Review/clean up each converted post (images are already downloaded and linked)

**Files:** `scripts/convert-substack.mjs` (create), 13 posts in `src/content/posts/` (created by script)

---

## Phase 6: Bylines Collection (External Publications)

### 6a. Add `bylines` collection to `src/content.config.ts`

New collection alongside `posts`:

```ts
const bylines = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bylines' }),
  schema: z.object({
    title: z.string(),
    subTitle: z.string().nullable().optional().transform((val) => val ?? undefined),
    publication: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') return val.trim() ? [val] : [];
      return val;
    }),
  }),
});

export const collections = { posts, bylines };
```

The `subTitle` field matches the existing `posts` schema. Both collections support subtitles consistently.

**Byline body content:** Each byline `.md` file includes the **first paragraph** of the published article as markdown body text (below the frontmatter). This is rendered on listing pages as an excerpt, followed by a "Read at {publication} →" link to the original. Bylines still do not generate their own pages — the excerpt and link appear inline in listings.

### 6b. Create `scripts/fetch-cinapse-bylines.mjs`

Fetch Rod's 218 Cinapse posts via the WordPress REST API (same API used in `cinapse-intelligence` project — see `/Users/rodmachen/code/cinapse-intelligence/cinapse-recs-plan.md`).

- **Endpoint:** `https://cinapse.co/wp-json/wp/v2/posts?author=32&per_page=100&page={n}&_fields=id,date,title,link,content,excerpt`
- Rod's WordPress author ID is **32** (6 categorized + 212 uncategorized = 218 total)
- **Two-pass download** (matching the cinapse-intelligence approach):
  - Pass 1: Categorized posts (default)
  - Pass 2: Uncategorized posts (`&categories=1`) — the REST API hides these by default
  - Deduplicate by post ID
- **Subtitle extraction:** Check for common WordPress subtitle patterns — some themes store subtitles in `excerpt.rendered` or as a leading `<h2>`/`<h3>` in `content.rendered`. Include as `subTitle` in frontmatter if found.
- **First paragraph extraction:** Parse `content.rendered` HTML, extract the first `<p>` tag's text content (strip HTML tags), and write it as the markdown body below the frontmatter.
- For each post, generate a markdown file in `src/content/bylines/`:
  ```yaml
  ---
  title: "Post Title"
  subTitle: "Optional Subtitle"
  publication: Cinapse
  url: https://cinapse.co/post-link/
  date: 2024-03-10
  tags:
    - film
  ---
  First paragraph of the article goes here as plain text.
  ```
- **Tag inference:** Use the WordPress category/tag data from the API response to map to simple tags (film, food, tv, etc.), or default to `film` since the vast majority are film-related
- **Idempotent:** Before writing each file, check if `src/content/bylines/{date}-{slug}.md` already exists — skip if so. Safe to re-run for incremental updates.
- 500ms delay between API requests
- **Dependencies:** `cheerio` for HTML parsing (shared with Chronicle script and Substack script)

### 6c. Create `scripts/fetch-chronicle-bylines.mjs`

Scrape Rod's ~140 Austin Chronicle articles. Two-step process since the author listing page only has titles/dates/links:

**Step 1 — Collect article URLs:** Paginate the author listing page.
- **Base URL:** `https://www.austinchronicle.com/author/rod-machen/page/{n}/` (12 pages, ~13 per page)
- Parse each page's HTML to extract: article title, URL, date, and section (Screens, Food, Arts, etc.)
- Map Chronicle sections to tags: Screens → `film`, Food → `food`, Arts → `art`, etc.
- 1s delay between page requests

**Step 2 — Fetch each article page** for subtitle and first paragraph:
- Visit each article URL and parse the HTML
- **Subtitle extraction:** Look for a subtitle/deck element (often a `<h2>` or `.sub-header` below the headline)
- **First paragraph extraction:** Extract the first `<p>` from the article body
- 1s delay between article fetches (be polite — ~140 requests total)

Generate markdown files in `src/content/bylines/` with subtitle (if found) and first paragraph as body content.

- **Idempotent:** Before writing each file, check if `src/content/bylines/{date}-{slug}.md` already exists — skip if so. Safe to re-run for incremental updates.
- **Dependencies:** `cheerio` for HTML parsing (shared with Cinapse script and Substack script)

### 6d. Remove `published: true` posts

Delete all posts in `src/content/posts/` that have `published: true` in their frontmatter. These are copies of pieces published at external outlets and will now be represented by byline entries instead.

```bash
# Identify which posts to remove (dry run)
grep -rl "published: true" src/content/posts/
```

Review the list before deleting. Posts without the `published` field or with `published: false` remain as articles.

### 6e. Seed initial bylines

Run both scripts to populate `src/content/bylines/` with ~350+ markdown files:
```bash
node scripts/fetch-cinapse-bylines.mjs
node scripts/fetch-chronicle-bylines.mjs
```

Example output file (`src/content/bylines/2025-09-05-the-threesome.md`):
```markdown
---
title: "The Threesome"
subTitle: "A romantic comedy examining relationship complexities"
publication: Austin Chronicle
url: https://www.austinchronicle.com/screens/2025-09-05/the-threesome/
date: 2025-09-05
tags:
  - film
---
Director Olga Chajdas' film follows a young married couple whose relationship is upended when they invite a third person into their lives, exploring the messy territory between desire and commitment.

[Read more at Austin Chronicle →](https://www.austinchronicle.com/screens/2025-09-05/the-threesome/)
```

The "Read more" link is baked into the markdown body by the fetch scripts (using the `url` from frontmatter). This renders naturally when the byline's body content is displayed on listing pages — no special template logic needed.

Review the generated files, spot-check a handful for accuracy, then commit.

### 6f. Integrate bylines into listing pages

Update listing pages to merge bylines into the combined feed:

- **Homepage** (`src/pages/index.astro`) — "Recent" section shows bylines alongside posts; byline category section shows latest external pieces with publication labels
- **Archive** (`src/pages/archive/[...page].astro`) — include bylines in the paginated list
- **Categories** (`src/pages/categories/index.astro` & `[tag].astro`) — count and display byline tags

Byline entries in listings show:
- Date + title (linked to external URL, `target="_blank"`)
- Subtitle (if present, styled the same as post subtitles)
- Publication name as a subtle label (e.g., "· Austin Chronicle")
- First paragraph excerpt (the markdown body content)
- "Read at Austin Chronicle →" / "Read at Cinapse →" link at the end of the excerpt

Bylines do **not** generate individual pages on the site — they link directly out. The excerpt + link gives readers enough context to decide whether to click through.

### 6g. Adding new bylines (ongoing workflow)

When a new article is published at any outlet:
1. Create a new `.md` file in `src/content/bylines/`
2. Fill in frontmatter: title, publication, url, date, tags
3. Commit and deploy

Both fetch scripts are **idempotent by design** — they check for existing files (matching on date + slug) before writing and skip any that already exist. This means they can be safely re-run at any time to pick up new articles without duplicating or overwriting existing bylines.

```bash
# Catch up on new articles published since last run
node scripts/fetch-cinapse-bylines.mjs    # skips existing, fetches only new
node scripts/fetch-chronicle-bylines.mjs  # skips existing, fetches only new
```

New publications beyond Chronicle and Cinapse are supported by simply using a new `publication` value in the frontmatter. No script needed for one-off additions.

**Files:** `src/content.config.ts` (modify), `scripts/fetch-cinapse-bylines.mjs` (create), `scripts/fetch-chronicle-bylines.mjs` (create), `src/content/bylines/*.md` (create ~350+), `src/pages/index.astro` (modify), `src/pages/archive/[...page].astro` (modify), `src/pages/categories/index.astro` (modify), `src/pages/categories/[tag].astro` (modify)

---

## Phase 7: AI Tag Generation

Generate consistent, meaningful tags for all content across the site using Claude. This runs after all content exists (remaining articles, Substack newsletters, and bylines).

### 7a. Create `scripts/generate-tags.mjs`

A script that reads every markdown file across both content directories and uses Claude to assign tags:

- **Inputs:**
  - `src/content/posts/*.md` — reads title, subtitle, and full body
  - `src/content/bylines/*.md` — reads title, subtitle, publication, and first-paragraph excerpt
- **Process:**
  - Send each post's content to Claude (Haiku for cost efficiency) with a prompt like:
    ```
    Given this article title, subtitle, and content, assign 1-4 tags from
    this controlled vocabulary: [film, tv, food, art, music, books, austin,
    sxsw, culture, sports, essay, interview, ...]. Return only the tags
    as a JSON array.
    ```
  - Use a **controlled vocabulary** (predefined tag list) so tags are consistent across all ~400+ posts — no one-off variations like "movies" vs "film" vs "cinema"
  - Batch posts in groups of 10-20, with rate limiting
  - Write the tags back into each file's frontmatter, replacing any existing tags
- **Dry-run mode:** `--dry-run` flag prints proposed tags without modifying files, for review
- **Cost estimate:** ~400 posts × Haiku = well under $1

### 7b. Define the tag vocabulary

Agree on a fixed list of tags before running. Starting point based on existing content:

| Tag | Covers |
|-----|--------|
| `film` | Movie reviews, film festival coverage |
| `tv` | Television reviews and recaps |
| `food` | Restaurant reviews, BBQ, food culture |
| `art` | Visual arts, gallery coverage |
| `music` | Music reviews, concerts |
| `books` | Book reviews, literary coverage |
| `austin` | Austin-specific culture and places |
| `sxsw` | SXSW festival coverage (any discipline) |
| `interview` | Q&A or profile pieces |
| `essay` | Personal essays, opinion |

This list can be expanded before running the script. The controlled vocabulary is defined in the script itself, making it easy to update.

### 7c. Run and review

```bash
node scripts/generate-tags.mjs --dry-run   # review proposed tags
node scripts/generate-tags.mjs             # write tags to files
```

Spot-check a sample of files across each content type. Commit once satisfied.

**Files:** `scripts/generate-tags.mjs` (create), `src/content/posts/*.md` (modify tags), `src/content/bylines/*.md` (modify tags)

---

## Phase 8: Domain & Deploy Config

### 6a. Update `astro.config.mjs`
- Change `site` to `'https://edition.rodmachen.com'`

### 6b. Create `vercel.json`
```json
{
  "redirects": [
    {
      "source": "/p/:slug",
      "destination": "/newsletter/:slug/",
      "permanent": true
    },
    {
      "source": "/blog/",
      "destination": "/",
      "permanent": true
    }
  ]
}
```
- `/p/:slug` catches old Substack URLs → new newsletter URLs
- `/blog/` → `/` for old bookmarks

### 6c. Update `src/pages/rss.xml.ts`
- Title/description to reflect "Edition" branding

### 6d. Update `src/layouts/BaseLayout.astro`
- Default description to reflect "Edition" branding

**Files:** `astro.config.mjs` (modify), `vercel.json` (create), `src/pages/rss.xml.ts` (modify), `src/layouts/BaseLayout.astro` (modify)

---

## Phase 9: Cleanup

- Remove the `published` tag from display if present (it's metadata, not a real tag)
- Update `docs/plans/migrate-substack.md` to mark as incorporated into this plan
- Delete any leftover unused code

---

## Verification

1. `npm run dev` — confirm:
   - Homepage shows category sections (articles populated, newsletter/review empty until Substack migration)
   - Archive paginates correctly
   - Post pages render with correct template class per category
   - `/blog/` redirects to `/`
   - About/Contact pages work
   - RSS feed has updated branding
2. `npm run build` — clean build, no schema errors
3. After Substack migration script runs:
   - 13 newsletter posts appear at `/newsletter/{slug}/`
   - Newsletter posts use the newsletter template
   - Newsletter section appears on homepage
4. After deploy: verify `/p/{old-substack-slug}` redirects to `/newsletter/{slug}/`
5. Bylines appear in Recent section, archive, and category pages
6. Byline links open external URLs in new tabs
7. Adding a new `.md` file to `src/content/bylines/` and restarting dev server shows the new entry

---

## Key Files Summary

| File | Action |
|------|--------|
| `src/utils/posts.ts` | Create — shared helpers + category config |
| `src/content.config.ts` | Modify — normalize category, add template field |
| `src/layouts/PostLayout.astro` | Modify — multi-template support |
| `src/layouts/BaseLayout.astro` | Modify — update branding |
| `src/pages/index.astro` | Rewrite — blog homepage with category sections |
| `src/pages/blog/index.astro` | Remove or redirect |
| `src/pages/[category]/[slug].astro` | Modify — template selection |
| `src/pages/archive/[...page].astro` | Modify — use BaseLayout |
| `src/pages/categories/index.astro` | Modify — use BaseLayout |
| `src/pages/categories/[tag].astro` | Modify — use BaseLayout |
| `src/pages/rss.xml.ts` | Modify — update branding |
| `src/components/Header.astro` | Modify — update nav/branding |
| `astro.config.mjs` | Modify — change site URL |
| `vercel.json` | Create — redirects |
| `scripts/convert-substack.mjs` | Create — Substack conversion script |
| `scripts/fetch-cinapse-bylines.mjs` | Create — fetch 218 posts via WordPress API (author ID 32) |
| `scripts/fetch-chronicle-bylines.mjs` | Create — scrape ~140 articles from Chronicle author page |
| `src/content/bylines/*.md` | Create — ~350+ metadata-only files (generated by scripts) |
| `scripts/generate-tags.mjs` | Create — AI tag generation using Claude Haiku |
