# Deploy to Vercel

## Context

The site is fully built and configured for Vercel (`@astrojs/vercel` adapter, `vercel.json` redirects, `site: 'https://edition.rodmachen.com'`) but has never been deployed. All code changes are complete — this is a manual deployment checklist.

## Prerequisites Already in Place

- `astro.config.mjs` — site URL set to `https://edition.rodmachen.com`, Vercel adapter configured, static output
- `vercel.json` — redirects for `/p/:slug`, `/blog/`, `/categories/`
- `npm run build` — passes cleanly (73 pages)

## Steps

### 1. Set Cloudinary cloud name in `.env`
Replace the placeholder in `.env`:
```
PUBLIC_CLOUDINARY_CLOUD_NAME=<your-actual-cloud-name>
```
Get this from: Cloudinary Dashboard → Settings → API Keys

### 2. Link the project to Vercel
```bash
vercel link
```
This creates `.vercel/project.json` (already gitignored). Follow the prompts to create a new project or link to an existing one.

### 3. Set environment variable in Vercel
```bash
vercel env add PUBLIC_CLOUDINARY_CLOUD_NAME
```
Enter the same cloud name value. Select all environments (Production, Preview, Development).

Or set it in the Vercel dashboard: **Project Settings → Environment Variables**.

### 4. Deploy
```bash
vercel deploy --prod
```
Or connect the GitHub repo in the Vercel dashboard for automatic deploys on push.

### 5. Add custom domain
In the Vercel dashboard: **Project Settings → Domains → Add `edition.rodmachen.com`**

Vercel will show the DNS record to add at your registrar — typically a CNAME pointing to `cname.vercel-dns.com`.

### 6. Verify
- Visit `https://edition.rodmachen.com` — homepage loads with category grid
- Check a post page — OG meta tags present in page source
- Test redirect: `/p/barbecue` → `/newsletter/barbecue/`
- Test redirect: `/blog/` → `/`
- Test redirect: `/categories/film/` → `/topics/film/`
