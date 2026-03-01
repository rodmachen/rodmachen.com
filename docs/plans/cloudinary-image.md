# Cloudinary Image System

## Context

The site currently has no image optimization, no OG tags, and stores images either locally in `/public/images/` or references external S3 URLs. Posts are plain Markdown. This plan adds Cloudinary as the image CDN with size control, card thumbnails, and auto-generated OG images — all while keeping the authoring experience as simple as standard Markdown.

## Key Decisions

### Markdown + Remark Plugin (not MDX)
Stay with plain `.md` files. A remark plugin parses size hints from the image title field (`"size:medium"`). This avoids renaming 30+ files, learning JSX syntax, or adding the MDX integration.

### Upload via Cloudinary VS Code Extension
Use the [Cloudinary VS Code extension](https://marketplace.visualstudio.com/items?itemName=Cloudinary.cloudinary) as the primary way to manage images. Install from the VS Code marketplace and connect your Cloudinary account. The extension provides:
- **Upload**: Drag-and-drop or right-click to upload files directly from VS Code
- **Browse**: View your Cloudinary Media Library in the sidebar without leaving the editor
- **Copy URL**: Right-click any asset to copy its optimized delivery URL (includes `f_auto,q_auto`)
- **Folder organization**: Create and manage folders (e.g., `posts/`, `newsletter/`) from the sidebar
- **Preview**: See images with Cloudinary transformations applied before using them

This keeps the entire workflow — write post, upload image, paste URL — inside VS Code.

### Use `astro-cloudinary` package
Use the official [`astro-cloudinary`](https://astro.cloudinary.dev/) package for:
- **`getCldImageUrl()`** — inside the remark plugin to build optimized Cloudinary URLs (instead of manual URL construction)
- **`getCldOgImageUrl()`** — in layouts to generate text-overlay social card images
- **`<CldImage>`** — in the PostCardList component for card thumbnails

Note: `<CldImage>` is an Astro component, so it only works in `.astro` files. For images inside Markdown post content, the remark plugin transforms image nodes to raw HTML with Cloudinary URLs built via `getCldImageUrl()`.

---

## Implementation Steps

### 1. Install dependencies
```
npm install astro-cloudinary unist-util-visit
```

### 2. Configure environment and Astro
**File:** `astro.config.mjs`

- Add noop image service so Astro doesn't process Cloudinary images
- Register the remark plugin
- Set up `astro-cloudinary` env: add `PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env`

```js
image: {
  service: { entrypoint: 'astro/assets/services/noop' },
},
markdown: {
  remarkPlugins: [remarkCloudinaryImages],
},
```

**New file:** `.env`
```
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 3. Create remark plugin for image sizing
**New file:** `src/plugins/remark-cloudinary-images.ts`

Parses image nodes in the Markdown AST. If the title field starts with `size:small|medium|large|full`, the plugin:
1. Wraps the image in a `<figure>` with the corresponding CSS class
2. Uses `getCldImageUrl()` from `astro-cloudinary/helpers` to build optimized URLs with width transformation and `f_auto,q_auto`
3. Adds `srcset` with 1x/2x for retina displays
4. Optionally renders remaining title text as a `<figcaption>`
5. Cloudinary images with no explicit size default to `large`
6. Non-Cloudinary images without a `size:` directive are left untouched

Size presets: `small` (300px), `medium` (600px), `large` (800px), `full` (1100px)

### 4. Add image size CSS
**File:** `src/styles/global.css`

```css
figure.img-small   { max-width: 300px; margin: 1.5rem auto; }
figure.img-medium  { max-width: 600px; margin: 1.5rem auto; }
figure.img-large   { max-width: 800px; margin: 1.5rem 0; }
figure.img-full    { max-width: 100%; margin: 1.5rem 0; }
figure img         { width: 100%; height: auto; display: block; border-radius: 4px; }
figcaption         { font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-text-light); text-align: center; margin-top: 0.5rem; }
```

### 5. Add `thumbnail` to content schema
**File:** `src/content.config.ts`

Add `thumbnail: z.string().optional()` to the posts schema. Accepts a Cloudinary public ID or full URL.

### 6. Update thumbnail logic
**File:** `src/utils/posts.ts`

In `postToListItem()`: prefer `p.data.thumbnail` (use `getCldImageUrl()` to build a square-cropped thumbnail URL), fall back to `extractFirstImage()`. Also widen the `extractFirstImage` regex to match Cloudinary URLs in addition to local `/images/` paths.

### 7. Update PostCardList to use CldImage for thumbnails
**File:** `src/components/PostCardList.astro`

When `item.image` is a Cloudinary URL/public ID (from the `thumbnail` frontmatter), use `<CldImage>` component for optimized delivery. Fall back to plain `<img>` for non-Cloudinary images and the colored placeholder for no image.

### 8. Add OG meta tags with Cloudinary social cards
**File:** `src/layouts/BaseLayout.astro`

Add `ogImage?: string` prop. Add `og:title`, `og:description`, `og:image`, `og:url`, plus Twitter Card meta tags to `<head>`.

### 9. Pass OG image from post pages
**Files:** `src/layouts/PostLayout.astro`, `src/pages/[category]/[slug].astro`

Thread `ogImage` prop through PostLayout to BaseLayout. In the slug page, use `getCldOgImageUrl()` to generate the social card:
- If `thumbnail` is set: use it as the base image with title text overlay
- Otherwise: use a branded template image (`og-template`) with title text overlay

```ts
import { getCldOgImageUrl } from 'astro-cloudinary/helpers';

const ogImage = getCldOgImageUrl({
  src: post.data.thumbnail || 'og-template',
  overlays: [{
    text: {
      fontFamily: 'Source Sans Pro',
      fontSize: 120,
      fontWeight: 'bold',
      text: post.data.title,
    }
  }]
});
```

### 10. Cloudinary one-time setup (manual)

**VS Code extension setup:**
1. Install the [Cloudinary VS Code extension](https://marketplace.visualstudio.com/items?itemName=Cloudinary.cloudinary) from the marketplace
2. Open the Cloudinary panel in the VS Code sidebar
3. Connect your Cloudinary account (you'll need your cloud name, API key, and API secret from the Cloudinary dashboard → Settings → API Keys)
4. The extension will show your Media Library in the sidebar — you can browse, upload, and copy URLs from here

**Project setup:**
- Set `PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env` (get your cloud name from the Cloudinary dashboard)
- Create folders in Cloudinary for organization: `posts/`, `newsletter/`, `og/`
- Upload a 1200x630 OG template image with public ID `og-template` — this is the base image for auto-generated social cards (should have site branding and a dark area where title text will be overlaid)

---

## Author Workflow

### Uploading images
Use the **Cloudinary VS Code extension** — browse, upload, and copy optimized URLs without leaving the editor. Right-click an asset to copy its delivery URL (already includes `f_auto,q_auto`). Organize images into folders like `posts/`, `newsletter/`, etc.

### Writing posts with images
```markdown
---
title: "My Great Post"
date: 2026-02-28
category: article
thumbnail: posts/my-great-post/hero
---

Opening paragraph.

![Restaurant interior](https://res.cloudinary.com/CLOUD/image/upload/posts/interior.jpg "size:large")

More text.

![Dessert](https://res.cloudinary.com/CLOUD/image/upload/posts/dessert.jpg "size:small A beautifully plated crème brûlée")
```

- Upload via VS Code extension, copy URL, paste into standard `![alt](url "size:medium")` syntax
- Size options: `small`, `medium`, `large`, `full` (default: `large` for Cloudinary images)
- Caption text goes after the size: `"size:medium My caption here"`
- Set `thumbnail` in frontmatter as Cloudinary public ID for card images; omit to auto-extract first image

## Backward Compatibility

- Existing posts with `/images/` paths or S3 URLs continue to work — the plugin ignores them unless they have a `size:` directive
- Existing image title text (e.g., `"The Sweet Hereafter | Kanopy"`) is unaffected since it doesn't start with `size:`
- `extractFirstImage` fallback still works for posts without `thumbnail`

## Files Modified/Created

| File | Action |
|------|--------|
| `astro.config.mjs` | Modify — noop image service, register remark plugin |
| `.env` | **Create** — Cloudinary cloud name |
| `src/plugins/remark-cloudinary-images.ts` | **Create** — remark plugin using `getCldImageUrl()` |
| `src/content.config.ts` | Modify — add `thumbnail` field |
| `src/utils/posts.ts` | Modify — use thumbnail with `getCldImageUrl()`, widen regex |
| `src/components/PostCardList.astro` | Modify — use `<CldImage>` for Cloudinary thumbnails |
| `src/styles/global.css` | Modify — add figure/size CSS |
| `src/layouts/BaseLayout.astro` | Modify — add OG meta tags |
| `src/layouts/PostLayout.astro` | Modify — thread `ogImage` prop |
| `src/pages/[category]/[slug].astro` | Modify — generate OG image via `getCldOgImageUrl()` |

## Implementation Status

Steps 1–9 are **complete** — all code changes are in place and `npm run build` succeeds (73 pages, no errors).

Step 10 (manual setup) is **pending** — see checklist below.

---

## Manual Steps (TODO)

These must be done before Cloudinary images will work in production:

### 1. Set your Cloudinary cloud name
- Log in to the [Cloudinary dashboard](https://console.cloudinary.com/)
- Copy your **Cloud Name** from Dashboard → Settings → API Keys
- Edit `.env` and replace `your-cloud-name` with the real value:
  ```
  PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
  ```

### 2. Install the Cloudinary VS Code extension
- Open VS Code → Extensions → search "Cloudinary"
- Install [Cloudinary](https://marketplace.visualstudio.com/items?itemName=Cloudinary.cloudinary)
- Open the Cloudinary panel in the sidebar and connect your account (cloud name, API key, API secret from dashboard)

### 3. Create Cloudinary folders
- In the Cloudinary Media Library (via dashboard or VS Code extension), create folders for organization:
  - `posts/`
  - `newsletter/`
  - `og/`

### 4. Upload the OG template image
- Create or source a 1200×630 image with site branding and a dark area where title text will be overlaid
- Upload it to Cloudinary with the public ID `og-template`
- This is the base image used for auto-generated social cards on every post page

### 5. Set environment variable in Vercel
- In the Vercel dashboard: Project Settings → Environment Variables
- Add `PUBLIC_CLOUDINARY_CLOUD_NAME` with the same value as `.env`
- Or via CLI: `vercel env add PUBLIC_CLOUDINARY_CLOUD_NAME`
- Without this, the production build will generate broken Cloudinary URLs

### 6. Verify in production
1. `npm run build` — confirm no errors (already passing)
2. `npm run dev` — test with a sample post containing Cloudinary images at different sizes
3. Inspect rendered HTML to confirm `<figure>` wrapping, correct CSS classes, and Cloudinary URL transformations
4. Check card listing to verify `<CldImage>` renders thumbnails from frontmatter
5. View page source on a post to confirm OG meta tags with Cloudinary image URL
6. Test an OG image URL directly in browser to confirm text overlay renders
