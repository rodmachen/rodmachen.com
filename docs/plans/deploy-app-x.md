# Deploy to Vercel ✅ COMPLETED

## Context

The site is fully built and configured for Vercel (`@astrojs/vercel` adapter, `vercel.json` redirects, `site: 'https://edition.rodmachen.com'`) but has never been deployed. All code changes are complete — this is a manual deployment checklist.

## Prerequisites Already in Place

- `astro.config.mjs` — site URL set to `https://edition.rodmachen.com`, Vercel adapter configured, static output
- `vercel.json` — redirects for `/p/:slug`, `/blog/`, `/categories/`
- `npm run build` — passes cleanly (73 pages)

## Steps

### 1. Set Cloudinary cloud name in `.env` ✅
Set `PUBLIC_CLOUDINARY_CLOUD_NAME=dke4phurv` in `.env`.

### 2. Link the project to Vercel ✅
Linked as `edition-rodmachen-com`. Also created new GitHub repo `rodmachen/edition-rodmachen-com` and pushed full history.

### 3. Set environment variable in Vercel ✅
Set `PUBLIC_CLOUDINARY_CLOUD_NAME` for production environment.

### 4. Deploy ✅
Deployed via `vercel deploy --prod`. Live at https://edition.rodmachen.com.

### 5. Add custom domain ✅
Added `edition.rodmachen.com` via `vercel domains add`. DNS configured with A record `76.76.21.21` in Route 53.

### 6. Verify ✅
- Homepage loads with category grid
- OG meta tags present on post pages
- `/p/barbecue` → `/newsletter/barbecue/` ✅
- `/blog/` → `/` ✅
- `/categories/film/` → `/topics/film/` ✅ (fixed by adding trailing-slash redirect rule in `vercel.json`)
