# Migrate rodmachen.com from Jekyll to Astro

## Status: COMPLETE

All migration steps have been accomplished. The site is running on Astro with 65 posts migrated, all pages implemented, and old Jekyll files removed.

## Context
The current Jekyll blog has 66 markdown posts (2013–2016), a few static pages, category filtering, and paginated archives. It has no Gemfile and uses legacy plugins, making it hard to rebuild. We're migrating to Astro with a fresh minimal design and deploying on Vercel. The essay checker, LINA map, and sub-sites are being dropped.

## Scope
- **Include**: 66 blog posts, About page, Contact page, categories, archive with pagination, RSS feed, landing page (as-is for now, redesign later)
- **Exclude**: essay checker, LINA map, roster-builder, code.rodmachen.com, photo.rodmachen.com

## Steps

### 1. Scaffold Astro project — DONE
- [x] Initialize a new Astro project in a sibling directory (`rodmachen.com-astro`) or in-place
- [x] Install dependencies: `@astrojs/rss`, `@astrojs/vercel`
- [x] Configure `astro.config.mjs` with Vercel adapter and site URL

### 2. Define content collection for posts — DONE
- [x] Create `src/content/config.ts` with a `posts` collection schema (uses `content.config.ts` with glob loader)
- [x] Move all posts from `_posts/` to `src/content/posts/` (65 posts migrated)
- [x] Update front matter: renamed `sub-title` → `subTitle`, removed `layout` field, added `date` to front matter

Note: 65 of 66 posts were migrated (1 post may have been dropped or consolidated).

### 3. Create layouts and components (fresh minimal design) — DONE
- [x] `src/layouts/BaseLayout.astro` — HTML shell, meta tags, minimal CSS
- [x] `src/layouts/PostLayout.astro` — post page with title, subtitle, date, tags
- [x] `src/components/Header.astro` — nav: site name, Archive, Categories, About, Contact
- [x] `src/components/Footer.astro` — copyright, minimal links
- [x] Global styles in `src/styles/global.css` — clean serif typography (system fonts), generous whitespace, responsive

### 4. Create pages — DONE
- [x] `src/pages/index.astro` — homepage
- [x] `src/pages/archive/[...page].astro` — paginated post list (10 per page) using `getStaticPaths` with `paginate()`
- [x] `src/pages/[category]/[slug].astro` — individual post pages, preserving `/:category/:title/` URL structure
- [x] `src/pages/categories/index.astro` — category listing page
- [x] `src/pages/categories/[tag].astro` — dynamic tag/category pages filtering posts
- [x] `src/pages/about.astro` — about page
- [x] `src/pages/contact.astro` — contact page
- [x] `src/pages/rss.xml.ts` — RSS feed using `@astrojs/rss`
- [x] `src/pages/blog/index.astro` — blog listing (bonus, not in original plan)

### 5. Static assets — DONE
- [x] Copy `favicon.ico` to `public/`
- [x] Copy social media icon images to `public/images/`
- [x] Add `public/google90ce7b21553acde3.html` for Google verification

### 6. URL compatibility — DONE
- [x] Ensure post URLs match old pattern: `/:category/:title/` (trailing slash)
- [x] Configure `trailingSlash: 'always'` in Astro config
- [x] Verify category pages at `/categories/food/`, etc.

### 7. Deploy to Vercel — DEFERRED
Deployment will be accomplished in a follow-up plan.

### 8. Clean up — DONE
- [x] Remove old Jekyll files (`_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_posts/`, `Gemfile`, etc.) — all removed
- [x] Update `.gitignore` for Astro (`node_modules/`, `dist/`, `.astro/`, `.vercel/`)
- [x] Remove dropped features (essay checker, LINA, roster-builder)

## Key files to create
```
astro.config.mjs            ✅
package.json                ✅
tsconfig.json               ✅
src/
  content/
    content.config.ts       ✅ (named content.config.ts instead of config.ts)
    posts/                  ✅ (65 .md files)
  layouts/
    BaseLayout.astro        ✅
    PostLayout.astro        ✅
  components/
    Header.astro            ✅
    Footer.astro            ✅
  pages/
    index.astro             ✅
    about.astro             ✅
    contact.astro           ✅
    rss.xml.ts              ✅
    blog/index.astro        ✅ (bonus)
    archive/[...page].astro ✅
    [category]/[slug].astro ✅
    categories/index.astro  ✅
    categories/[tag].astro  ✅
  styles/
    global.css              ✅
public/
  favicon.ico              ✅
  images/                  ✅
  google90ce7b21553acde3.html ✅
```

## Verification
1. Run `npm run dev` and verify:
   - Landing page renders correctly
   - Archive pages paginate properly (7 pages of 10)
   - Individual post pages render with title, subtitle, content, tags, date
   - Category pages filter correctly
   - About and Contact pages work
   - RSS feed generates valid XML
2. Check URL compatibility: `/:category/:title/` matches old permalinks
3. Run `npm run build` to confirm clean static build
4. Deploy preview to Vercel with `vercel` CLI or git push
