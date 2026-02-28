#!/usr/bin/env node

/**
 * Scrape Rod's Austin Chronicle articles and generate byline markdown files.
 *
 * Two-step process:
 *   Step 1: Paginate author listing page to collect article URLs, titles, dates, sections
 *   Step 2: Fetch each article page for subtitle and first paragraph
 *
 * Usage: node scripts/fetch-chronicle-bylines.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'bylines');
const BASE_URL = 'https://www.austinchronicle.com/author/rod-machen/';
const DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromUrl(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'untitled';
}

// Map Chronicle sections to tags
function sectionToTag(section) {
  const map = {
    screens: 'film',
    food: 'food',
    arts: 'art',
    music: 'music',
    books: 'books',
    'daily/movies': 'film',
    'daily/arts': 'art',
    events: 'culture',
    columns: 'culture',
    news: 'culture',
  };
  const lower = (section || '').toLowerCase();
  return map[lower] || 'culture';
}

async function fetchPage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

async function collectArticleUrls() {
  const articles = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;
    console.log(`Fetching listing page ${page}...`);

    const html = await fetchPage(url);
    if (!html) {
      hasMore = false;
      break;
    }

    const $ = cheerio.load(html);
    const links = $('article a, .result a, .story a, h3 a, h2 a, .article-title a');

    if (links.length === 0) {
      // Try broader selector for Chronicle layout
      const allLinks = $('a[href*="/screens/"], a[href*="/food/"], a[href*="/arts/"], a[href*="/music/"], a[href*="/books/"], a[href*="/daily/"]');
      allLinks.each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title && href.includes('austinchronicle.com')) {
          // Extract section from URL
          const urlPath = new URL(href).pathname;
          const section = urlPath.split('/')[1] || '';
          articles.push({ url: href, title, section, date: '' });
        }
      });

      if (allLinks.length === 0) {
        hasMore = false;
      }
    } else {
      links.each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title) {
          const fullUrl = href.startsWith('http') ? href : `https://www.austinchronicle.com${href}`;
          const urlPath = new URL(fullUrl).pathname;
          const section = urlPath.split('/')[1] || '';
          // Try to extract date from URL pattern: /section/YYYY-MM-DD/slug/
          const dateMatch = urlPath.match(/\/(\d{4}-\d{2}-\d{2})\//);
          const date = dateMatch ? dateMatch[1] : '';
          articles.push({ url: fullUrl, title, section, date });
        }
      });
    }

    page++;
    if (page > 15) hasMore = false; // Safety limit
    await sleep(DELAY_MS);
  }

  // Deduplicate by URL
  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

async function fetchArticleDetails(article) {
  const html = await fetchPage(article.url);
  if (!html) return { subtitle: '', firstPara: '' };

  const $ = cheerio.load(html);

  // Try to find subtitle/deck
  const subtitle = ($('.sub-header').first().text() ||
    $('h2.subtitle').first().text() ||
    $('h2.deck').first().text() ||
    '').trim();

  // Find first paragraph in article body
  const firstPara = ($('.article-body p, .story-body p, article p, .entry-content p').first().text() || '').trim();

  // Try to extract date from the page if not in URL
  if (!article.date) {
    const dateEl = $('time, .date, .pub-date').first();
    const dateText = dateEl.attr('datetime') || dateEl.text();
    if (dateText) {
      const parsed = new Date(dateText);
      if (!isNaN(parsed.getTime())) {
        article.date = parsed.toISOString().split('T')[0];
      }
    }
  }

  return { subtitle, firstPara };
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Step 1: Collecting article URLs...');
  const articles = await collectArticleUrls();
  console.log(`Found ${articles.length} articles`);

  console.log('\nStep 2: Fetching article details...');
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const slug = slugFromUrl(article.url);
    const date = article.date || '2000-01-01'; // Fallback date
    const filename = `${date}-${slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Idempotent: skip if exists
    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }

    console.log(`  [${i + 1}/${articles.length}] ${article.title}`);

    const { subtitle, firstPara } = await fetchArticleDetails(article);
    const tag = sectionToTag(article.section);

    let frontmatter = `---\ntitle: "${article.title.replace(/"/g, '\\"')}"\n`;
    if (subtitle) {
      frontmatter += `subTitle: "${subtitle.replace(/"/g, '\\"')}"\n`;
    }
    frontmatter += `publication: Austin Chronicle\nurl: ${article.url}\ndate: ${date}\ntags:\n  - ${tag}\n---\n`;

    let body = '';
    if (firstPara) {
      body = `\n${firstPara}\n\n[Read more at Austin Chronicle →](${article.url})\n`;
    }

    fs.writeFileSync(filepath, frontmatter + body, 'utf-8');
    created++;

    await sleep(DELAY_MS);
  }

  console.log(`\nCreated: ${created}, Skipped (existing): ${skipped}`);
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
