#!/usr/bin/env node

/**
 * Fetch Rod's Cinapse posts via WordPress REST API and generate byline markdown files.
 *
 * Rod's WordPress author ID is 32.
 * Two-pass download: categorized posts (default) + uncategorized posts (category=1).
 * Deduplicates by post ID.
 *
 * Usage: node scripts/fetch-cinapse-bylines.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'bylines');
const AUTHOR_ID = 32;
const BASE_URL = 'https://cinapse.co/wp-json/wp/v2/posts';
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromUrl(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'untitled';
}

function extractFirstParagraph(html) {
  const $ = cheerio.load(html);
  const firstP = $('p').first().text().trim();
  return firstP || '';
}

function extractSubtitle(content, excerpt) {
  // Check for subtitle as leading h2/h3 in content
  const $ = cheerio.load(content);
  const firstHeading = $('h2, h3').first();
  if (firstHeading.length && firstHeading.prevAll().length === 0) {
    return firstHeading.text().trim();
  }
  return '';
}

async function fetchPosts(extraParams = '') {
  const posts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BASE_URL}?author=${AUTHOR_ID}&per_page=100&page=${page}&_fields=id,date,title,link,content,excerpt${extraParams}`;
    console.log(`Fetching page ${page}...`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 400) {
          // No more pages
          hasMore = false;
          break;
        }
        console.warn(`HTTP ${res.status} on page ${page}`);
        hasMore = false;
        break;
      }

      const data = await res.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        posts.push(...data);
        page++;
        await sleep(DELAY_MS);
      }
    } catch (err) {
      console.error(`Error fetching page ${page}: ${err.message}`);
      hasMore = false;
    }
  }

  return posts;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Pass 1: Fetching categorized posts...');
  const categorized = await fetchPosts('');

  console.log('Pass 2: Fetching uncategorized posts...');
  const uncategorized = await fetchPosts('&categories=1');

  // Deduplicate by post ID
  const seen = new Set();
  const allPosts = [];
  for (const post of [...categorized, ...uncategorized]) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      allPosts.push(post);
    }
  }

  console.log(`Total unique posts: ${allPosts.length}`);

  let created = 0;
  let skipped = 0;

  for (const post of allPosts) {
    const title = post.title?.rendered?.replace(/<[^>]*>/g, '') || 'Untitled';
    const date = post.date?.split('T')[0] || new Date().toISOString().split('T')[0];
    const url = post.link;
    const slug = slugFromUrl(url);
    const filename = `${date}-${slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Idempotent: skip if file already exists
    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }

    const content = post.content?.rendered || '';
    const excerpt = post.excerpt?.rendered || '';
    const subtitle = extractSubtitle(content, excerpt);
    const firstPara = extractFirstParagraph(content);

    let frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n`;
    if (subtitle) {
      frontmatter += `subTitle: "${subtitle.replace(/"/g, '\\"')}"\n`;
    }
    frontmatter += `publication: Cinapse\nurl: ${url}\ndate: ${date}\ntags:\n  - film\n---\n`;

    let body = '';
    if (firstPara) {
      body = `\n${firstPara}\n\n[Read more at Cinapse →](${url})\n`;
    }

    fs.writeFileSync(filepath, frontmatter + body, 'utf-8');
    created++;
  }

  console.log(`Created: ${created}, Skipped (existing): ${skipped}`);
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
