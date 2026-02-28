#!/usr/bin/env node

/**
 * Fix byline files that have 2000-01-01 placeholder dates.
 * Fetches each article's URL to extract the real publication date,
 * updates the frontmatter, and renames the file.
 *
 * Usage: node scripts/fix-byline-dates.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BYLINES_DIR = path.join(__dirname, '..', 'src', 'content', 'bylines');
const DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractDate(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try <time> element
    const timeEl = $('time[datetime]').first();
    if (timeEl.length) {
      const dt = timeEl.attr('datetime');
      const parsed = new Date(dt);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }

    // Try meta tags
    const metaDate = $('meta[property="article:published_time"]').attr('content')
      || $('meta[name="date"]').attr('content')
      || $('meta[name="pub_date"]').attr('content');
    if (metaDate) {
      const parsed = new Date(metaDate);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }

    // Try date in URL path: /section/YYYY-MM-DD/slug/
    const urlMatch = url.match(/\/(\d{4}-\d{2}-\d{2})\//);
    if (urlMatch) return urlMatch[1];

    // Try visible date text
    const dateEl = $('.date, .pub-date, .article-date, .post-date').first();
    if (dateEl.length) {
      const parsed = new Date(dateEl.text().trim());
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }

    return null;
  } catch {
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(BYLINES_DIR)
    .filter((f) => f.startsWith('2000-01-01-') && f.endsWith('.md'));

  console.log(`Found ${files.length} bylines with placeholder dates\n`);

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(BYLINES_DIR, files[i]);
    const content = fs.readFileSync(filepath, 'utf-8');

    // Extract URL from frontmatter
    const urlMatch = content.match(/^url:\s*(.+)$/m);
    if (!urlMatch) {
      console.log(`  [${i + 1}/${files.length}] SKIP (no URL): ${files[i]}`);
      failed++;
      continue;
    }

    const url = urlMatch[1].trim();
    console.log(`  [${i + 1}/${files.length}] Fetching: ${files[i]}`);

    const realDate = await extractDate(url);

    if (realDate && realDate !== '2000-01-01') {
      // Update frontmatter
      const updated = content.replace(/^date:\s*2000-01-01$/m, `date: ${realDate}`);

      // Rename file
      const newFilename = files[i].replace('2000-01-01-', `${realDate}-`);
      const newFilepath = path.join(BYLINES_DIR, newFilename);

      // Avoid overwriting existing file
      if (fs.existsSync(newFilepath)) {
        console.log(`    CONFLICT: ${newFilename} already exists, updating in place`);
        fs.writeFileSync(filepath, updated, 'utf-8');
      } else {
        fs.writeFileSync(newFilepath, updated, 'utf-8');
        fs.unlinkSync(filepath);
      }

      console.log(`    Fixed: ${realDate}`);
      fixed++;
    } else {
      console.log(`    Could not extract date`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone! Fixed: ${fixed}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
