# Plan: Migrate Substack (edition.rodmachen.com) to rodmachen.com

> **STATUS:** COMPLETE — Incorporated into `convert-to-blog.md` (Phase 5) and fully implemented. 13 newsletter posts migrated and live at `/newsletter/{slug}/`.

## Context
The Hangman Chronicles newsletter (13 posts, 2023–2025) lives at `edition.rodmachen.com` on Substack. The goal is to migrate all posts to the existing Astro site at `rodmachen.com`, set up redirects so old Substack URLs continue to work, and then shut down the Substack. User has local copies of all images but needs placeholders in the migrated content so they can wire up image paths. Category for all newsletter posts: `article` (consistent with existing posts). New post URLs will be `rodmachen.com/article/{slug}/`.

The site is Astro 5 / static / deployed on Vercel. Posts live in `src/content/posts/` as date-prefixed markdown files.

---

## Step 1: Export from Substack

Go to **Substack → Settings → Exports** (or `edition.rodmachen.com/publish/settings`) and request a data export. You'll receive a ZIP containing:
- `posts/` directory — one HTML file per post
- `posts.csv` — metadata: title, subtitle, slug, published_at, URL

Download and unzip to a local working directory (e.g., `scripts/substack-export/`).

---

## Step 2: Write a Conversion Script

**File to create:** `scripts/convert-substack.mjs`

Install dependencies (dev only):
```
npm install -D turndown
```

Script logic:
1. Read `posts.csv` — extract: `title`, `subtitle`, `slug` (from URL), `published_at`
2. For each post, read the matching HTML file from `posts/`
3. Strip Substack-specific chrome (header, footer, paywall banners) — keep only the `<div class="body">` or equivalent content element
4. Replace every `<img>` tag with an HTML comment placeholder:
   ```
   <!-- IMAGE: [alt text] | src: [original-substack-cdn-url] -->
   ```
5. Convert remaining HTML to Markdown using `turndown`
6. Write a `.md` file to `src/content/posts/` with this front matter:
   ```yaml
   ---
   title: "Post Title"
   subTitle: "Post Subtitle"
   author: Rod Machen
   category: article
   tags:
     - newsletter
   date: YYYY-MM-DD
   ---
   ```
7. Filename format: `YYYY-MM-DD-{substack-slug}.md`
   - Use the exact Substack slug (some are truncated, e.g., `italiano-pianoforte-62-miles-and`) — this is important for redirect matching

The 13 posts and their expected output filenames:
| Date | Substack slug | Output file |
|------|--------------|-------------|
| 2025-05-27 | sunday-brunch-with-franklin-and-friends | 2025-05-27-sunday-brunch-with-franklin-and-friends.md |
| 2024-03-02 | atx-open-2024-danielle-collins | 2024-03-02-atx-open-2024-danielle-collins.md |
| 2024-02-25 | atx-open-2024-opening-weekend | 2024-02-25-atx-open-2024-opening-weekend.md |
| 2023-05-29 | italiano-pianoforte-62-miles-and | 2023-05-29-italiano-pianoforte-62-miles-and.md |
| 2023-03-21 | south-by-and-southwest | 2023-03-21-south-by-and-southwest.md |
| 2023-03-09 | tennis-extra-more-tennis | 2023-03-09-tennis-extra-more-tennis.md |
| 2023-03-07 | tennis-tennis-and-more-tennis | 2023-03-07-tennis-tennis-and-more-tennis.md |
| 2023-02-21 | sxsw-tunes-the-rach-and-more-austin | 2023-02-21-sxsw-tunes-the-rach-and-more-austin.md |
| 2023-02-06 | new-fiction-hot-tv-and-freezing-in | 2023-02-06-new-fiction-hot-tv-and-freezing-in.md |
| 2023-01-23 | hobbits-tennis-and-old-school-cue | 2023-01-23-hobbits-tennis-and-old-school-cue.md |
| 2023-01-16 | french-music-knight-rider-and-arthouse | 2023-01-16-french-music-knight-rider-and-arthouse.md |
| 2023-01-09 | yellowstone-debussy-and-the-love | 2023-01-09-yellowstone-debussy-and-the-love.md |
| 2023-01-?? | barbecue-x-men-and-the-beths | 2023-01-??-barbecue-x-men-and-the-beths.md |

---

## Step 3: Review and Clean Up Converted Posts

After running the script:
- Open each `.md` file and verify the Markdown looks correct (headers, links, lists)
- Replace `<!-- IMAGE: ... -->` comments with actual local image references once you've placed images in `public/images/newsletter/`
  - Reference format: `![alt text](/images/newsletter/filename.jpg)`
- Verify `date` field is correct for all posts (especially `barbecue-x-men-and-the-beths` which had no visible date)

---

## Step 4: Set Up Redirects

**File to create:** `vercel.json` (project root)

When `edition.rodmachen.com` is pointed to Vercel (Step 6), incoming requests like `edition.rodmachen.com/p/slug` need to redirect to `rodmachen.com/article/slug/`. Use a `has` condition to only match requests from the `edition` subdomain:

```json
{
  "redirects": [
    {
      "source": "/p/:slug",
      "destination": "https://rodmachen.com/article/:slug/",
      "permanent": true,
      "has": [{ "type": "host", "value": "edition.rodmachen.com" }]
    },
    {
      "source": "/",
      "destination": "https://rodmachen.com/blog/",
      "permanent": true,
      "has": [{ "type": "host", "value": "edition.rodmachen.com" }]
    }
  ]
}
```

This catches:
- All post URLs: `edition.rodmachen.com/p/{slug}` → `rodmachen.com/article/{slug}/`
- Root: `edition.rodmachen.com/` → `rodmachen.com/blog/`
- Any other path not matched will 404 (acceptable — those were Substack-only pages like `/about`, `/archive`)

---

## Step 5: Build and Verify Locally

```bash
npm run dev
```

Check:
- Each migrated post renders at `localhost:4321/article/{slug}/`
- Title, subtitle, date, and body content are correct
- Image placeholder comments appear in source (or real images if you've added them)
- Archive and categories pages include the new posts
- RSS feed includes new posts

```bash
npm run build
```

Confirm clean build with no schema validation errors.

---

## Step 6: Deploy and Re-point the Subdomain

1. Push changes to GitHub (triggers Vercel auto-deploy)
2. In Vercel dashboard: add `edition.rodmachen.com` as a domain alias on the `rodmachen.com` project
3. Update DNS at your registrar: point the `edition` subdomain CNAME to `cname.vercel-dns.com` (Vercel will provide the exact record)
4. Verify redirects are live: `curl -I https://edition.rodmachen.com/p/sunday-brunch-with-franklin-and-friends` should return `301` to `https://rodmachen.com/article/sunday-brunch-with-franklin-and-friends/`

---

## Step 7: Shut Down Substack

After confirming all redirects work:
- Go to Substack Settings → Publication → scroll to "Delete publication"
- Or: disable the custom domain on Substack first, then cancel/delete

---

## Critical Files

| File | Action |
|------|--------|
| `scripts/convert-substack.mjs` | Create — conversion script |
| `src/content/posts/2023-*.md` (×13) | Create — migrated posts |
| `vercel.json` | Create — redirect rules |
| `src/content.config.ts` | No change needed (schema already handles `newsletter` in tags) |
| `src/pages/[category]/[slug].astro` | No change needed (already handles `article` category) |

---

## Future: Moving Blog to edition.rodmachen.com

If you later want `edition.rodmachen.com` to serve the full blog and `rodmachen.com` to be homepage-only:
- Add `edition.rodmachen.com` as a Vercel domain alias (already done by Step 6)
- Update `src/pages/index.astro` to remove the Blog nav link (or keep it pointing to `/blog/`)
- Both domains would serve the same Astro site — no content duplication needed
- Optionally add a reverse redirect: `rodmachen.com/blog/*` → `edition.rodmachen.com/blog/*`
- The post URLs and all redirects already in place continue to work unchanged
