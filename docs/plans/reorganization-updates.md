# Plan: Homepage Grid, Topics Page, Header & Archive Updates

## Context
The site needs several refinements after the initial blog conversion: the header branding should read "EDITION - ROD MACHEN", the homepage should replace the Recent section with a 3x2 category grid emphasizing each content type as a mini-site, the Categories page should be renamed to Topics (showing tags like film, food, art — not content types), and the archive should show category/tag metadata per entry. TV content also needs proper tagging via a re-run of the AI tag generation script.

---

## 1. Header Update — DONE

**File:** `src/components/Header.astro`

- ~~Change site name from "Edition" to "EDITION - ROD MACHEN"~~
- ~~Update nav: Home, Archive, Topics, About, Contact~~

---

## 2. Homepage: Replace Recent with 3x2 Category Grid — DONE

**Files:** `src/pages/index.astro`, `src/utils/posts.ts`

### Update CATEGORY_CONFIG — DONE
- ~~Add `byline` to CATEGORY_CONFIG in `src/utils/posts.ts`~~
- Archive added as a 6th pseudo-card in the homepage (not in CATEGORY_CONFIG)

### Homepage layout — DONE
- ~~Remove the "Recent" merged post/byline section~~
- ~~Replace with 3x2 responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)~~
- ~~Each card: accent-colored label, description, post count, 5 latest titles~~
- ~~Empty categories (essay, review) show "Coming soon"~~
- ~~Bottom nav links to Archive and Topics~~

### Category landing pages — DONE
- ~~Create `src/pages/[category]/index.astro` for article, essay, newsletter, review~~
- ~~Create `src/pages/byline/index.astro` for byline listing~~

---

## 3. Rename Categories to Topics — DONE

- ~~Move `src/pages/categories/` to `src/pages/topics/`~~
- ~~Update page titles to "Topics"~~
- ~~Update all internal links: Header, homepage, archive, PostLayout tag footer~~

---

## 4. Archive: Add Category & Tag Metadata — DONE

**File:** `src/pages/archive/[...page].astro`

- ~~Category badge (colored, from CATEGORY_CONFIG) per entry~~
- ~~Tags linked to `/topics/{tag}/`~~
- ~~Page size increased to 20~~

---

## 5. Re-run AI Tag Generation with `tv` Tag — PENDING (manual step)

**File:** `scripts/generate-tags.mjs`

- `tv` already exists in `TAG_VOCABULARY`
- User needs to re-run: `node scripts/generate-tags.mjs --dry-run` then `node scripts/generate-tags.mjs`
- This will properly separate TV content from film

---

## 6. Add Redirect for Old `/categories/` URLs — DONE

**File:** `vercel.json`

- ~~Added `/categories/:path*` → `/topics/:path*` permanent redirect~~

---

## 7. Uncategorized Posts — PENDING (manual step)

7 posts have no category assigned (default to "article"). User will sort manually:

1. Neutral Milk Hotel — music?
2. SXSW is over. — essay?
3. SXSW 2014 (learned) — essay?
4. SXSW 2014 (heard) — essay?
5. The Grand Budapest Hotel — article (film review)
6. Game of Thrones — article (TV recap)
7. Mad Men — article (TV recap)

---

## Verification

1. ~~`npm run build` — clean build, no errors (68 pages)~~
2. ~~Homepage shows 3x2 grid with all 6 cards~~
3. ~~Empty categories (essay, review) show "Coming soon"~~
4. ~~Grid cards link to category landing pages~~
5. ~~`/topics/` shows tag-based listing~~
6. `/categories/film/` redirects to `/topics/film/` (verify after deploy)
7. ~~Archive entries show category badges and tags~~
8. ~~Header reads "EDITION - ROD MACHEN"~~
9. TV content properly tagged with `tv` (after re-running tag script)
