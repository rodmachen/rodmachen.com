#!/usr/bin/env node

/**
 * Convert Substack export to Astro-compatible markdown posts.
 *
 * Usage:
 *   1. Export data from Substack (Settings → Exports)
 *   2. Unzip to scripts/substack-export/
 *   3. Run: node scripts/convert-substack.mjs
 *
 * Expects:
 *   scripts/substack-export/posts.csv   — CSV with columns: post_id, title, subtitle, post_date, ...
 *   scripts/substack-export/posts/       — folder with HTML files named by slug
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, 'substack-export');
const POSTS_DIR = path.join(EXPORT_DIR, 'posts');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'newsletter');

// Parse CSV (simple — handles quoted fields with commas)
function parseCSV(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (const char of text) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || '').trim();
    });
    return obj;
  });
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function slugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Download images from Substack CDN and rewrite src attributes
async function downloadImages(html, postSlug) {
  const imgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/gi;
  let match;
  const downloads = [];

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('substackcdn.com') || url.includes('substack-post-media')) {
      downloads.push(url);
    }
  }

  if (downloads.length === 0) return html;

  const imgDir = path.join(IMAGES_DIR, postSlug);
  fs.mkdirSync(imgDir, { recursive: true });

  let updatedHtml = html;

  for (const url of downloads) {
    const filename = path.basename(new URL(url).pathname);
    const localPath = path.join(imgDir, filename);
    const publicPath = `/images/newsletter/${postSlug}/${filename}`;

    if (!fs.existsSync(localPath)) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
          console.log(`  Downloaded: ${filename}`);
        } else {
          console.warn(`  Failed to download: ${url} (${res.status})`);
          continue;
        }
      } catch (err) {
        console.warn(`  Error downloading ${url}: ${err.message}`);
        continue;
      }
    }

    updatedHtml = updatedHtml.replaceAll(url, publicPath);
  }

  return updatedHtml;
}

// Strip Substack chrome (headers, footers, subscribe buttons, etc.)
function stripSubstackChrome(html) {
  return html
    .replace(/<div class="subscribe-widget"[\s\S]*?<\/div>/gi, '')
    .replace(/<div class="subscription-widget-wrap"[\s\S]*?<\/div>/gi, '')
    .replace(/<a[^>]*class="[^"]*button[^"]*"[^>]*>Subscribe<\/a>/gi, '')
    .replace(/<div class="footer"[\s\S]*?<\/div>/gi, '');
}

async function main() {
  const csvPath = path.join(EXPORT_DIR, 'posts.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}`);
    console.error('Please export from Substack and unzip to scripts/substack-export/');
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvText);

  // Filter to published posts only
  const published = rows.filter(
    (r) => r.is_published === 'true' && r.type === 'newsletter'
  );

  console.log(`Found ${published.length} published newsletter posts`);

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const row of published) {
    const title = row.title || 'Untitled';
    const subtitle = row.subtitle || '';
    const slug = row.post_id
      ? slugFromTitle(title)
      : slugFromTitle(title);

    // Try to find the HTML file
    const htmlFilename = `${row.post_id || slug}.html`;
    const htmlPath = path.join(POSTS_DIR, htmlFilename);

    // Also try slug-based filename
    const slugHtmlPath = path.join(POSTS_DIR, `${slug}.html`);

    let html = '';
    if (fs.existsSync(htmlPath)) {
      html = fs.readFileSync(htmlPath, 'utf-8');
    } else if (fs.existsSync(slugHtmlPath)) {
      html = fs.readFileSync(slugHtmlPath, 'utf-8');
    } else {
      // Try to find by scanning the directory
      const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : [];
      const matchFile = files.find((f) => f.includes(slug));
      if (matchFile) {
        html = fs.readFileSync(path.join(POSTS_DIR, matchFile), 'utf-8');
      } else {
        console.warn(`  No HTML file found for: ${title} (tried ${htmlFilename})`);
        continue;
      }
    }

    console.log(`Processing: ${title}`);

    // Strip Substack chrome
    html = stripSubstackChrome(html);

    // Download images and rewrite URLs
    html = await downloadImages(html, slug);

    // Convert to markdown
    const markdown = turndown.turndown(html);

    // Build frontmatter
    const date = row.post_date
      ? row.post_date.split('T')[0].split(' ')[0]
      : new Date().toISOString().split('T')[0];

    let frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n`;
    if (subtitle) {
      frontmatter += `subTitle: "${subtitle.replace(/"/g, '\\"')}"\n`;
    }
    frontmatter += `category: newsletter\ntags:\n  - newsletter\ndate: ${date}\n---\n\n`;

    const outputFilename = `${date}-${slug}.md`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    fs.writeFileSync(outputPath, frontmatter + markdown, 'utf-8');
    console.log(`  Created: ${outputFilename}`);
  }

  console.log('\nDone! Review the generated posts in src/content/posts/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
