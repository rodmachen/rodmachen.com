#!/usr/bin/env node

/**
 * Fix bylines with missing, "by Rod Machen", or short caption body text.
 * Re-fetches each article page to extract a proper first paragraph and subtitle.
 *
 * Usage: node scripts/fix-byline-bodies.mjs
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

// Files known to have bad body text
const TARGET_FILES = [
  // "by Rod Machen" only (13)
  '2016-03-16-sxsw-2016-another-evil-is-scary-quirky-fun.md',
  '2016-03-22-sxsw-2016-the-wires-andre-royo-stars-in-hunter-gatherer-a-universal-urban-tale.md',
  '2016-08-08-hell-or-high-water-premiere-a-texans-take-on-a-texas-tale.md',
  '2016-08-18-sit-back-and-enjoy-the-experience-that-is-mulholland-drive.md',
  '2016-09-13-austin-stories-reunion-features-laughs-learning-love.md',
  '2016-09-13-my-bodyguard-a-light-hearted-look-at-a-high-school-nightmare.md',
  '2016-09-16-starving-the-beast-finds-universities-hungry-for-funds.md',
  '2016-09-21-dwarvenaut-dungeons-and-dragons-all-grown-up.md',
  '2016-10-07-the-birth-of-a-nation-a-powerful-mixture-of-tragedy-history.md',
  '2016-10-10-voyage-of-time-on-imax-takes-big-screen-beauty-to-a-new-level.md',
  '2016-10-19-austin-film-festival-2016-whos-the-funniest.md',
  '2016-10-21-austin-film-festival-2016-are-you-a-progamer.md',
  '2016-10-26-austin-film-festival-2016-brave-new-jersey-brings-back-hope.md',
  // Short captions (4)
  '2019-10-04-watch-out-austin-only-in-october.md',
  '2020-07-01-enjoy-summer-vod-style.md',
  '2020-08-12-virtual-cinema-for-the-august-heat.md',
  '2021-11-16-austin-film-festival-2021-buck-alamo.md',
  // Missing body entirely (11)
  '2000-01-01-american-fiction-12946899.md',
  '2000-01-01-mad-men-series-finale-this-weekend-12094570.md',
  '2000-01-01-off-the-bookshelf-11702264.md',
  '2000-01-01-off-the-bookshelf-11702710.md',
  '2000-01-01-off-the-bookshelf-11703310.md',
  '2000-01-01-soft-and-quiet-12833361.md',
  '2000-01-01-the-biggest-news-in-austin-food-in-2023-12945130.md',
  '2000-01-01-the-burial-12946849.md',
  '2021-03-17-now-streaming-celebrate-sxsw-with-these-picks.md',
  '2021-05-10-afs-cinema-to-world-well-be-back.md',
];

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return { raw: match[1], body: match[2] };
}

function extractField(frontmatter, field) {
  const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

async function fetchArticleContent(url, publication) {
  try {
    const res = await fetch(url);
    if (!res.ok) return { subtitle: '', firstPara: '' };
    const html = await res.text();
    const $ = cheerio.load(html);

    let subtitle = '';
    let firstPara = '';

    if (publication === 'Cinapse') {
      // Cinapse uses WordPress — try common patterns
      // Skip "by Rod Machen" paragraphs
      $('article p, .entry-content p, .post-content p, p').each((_, el) => {
        const text = $(el).text().trim();
        if (!firstPara && text.length > 50 && !text.startsWith('by ') && !text.startsWith('By ')) {
          firstPara = text;
        }
      });

      // Subtitle from h2/h3 near top
      const subEl = $('article h2, .entry-content h2, article h3').first();
      if (subEl.length) {
        const subText = subEl.text().trim();
        if (subText.length < 200 && subText.length > 5) {
          subtitle = subText;
        }
      }
    } else {
      // Austin Chronicle
      subtitle = (
        $('.sub-header').first().text() ||
        $('h2.subtitle').first().text() ||
        $('h2.deck').first().text() ||
        ''
      ).trim();

      $('.article-body p, .story-body p, article p, .entry-content p').each((_, el) => {
        const text = $(el).text().trim();
        if (!firstPara && text.length > 50) {
          firstPara = text;
        }
      });
    }

    return { subtitle, firstPara };
  } catch (err) {
    console.warn(`    Error fetching: ${err.message}`);
    return { subtitle: '', firstPara: '' };
  }
}

function rebuildFile(frontmatterRaw, subtitle, firstPara, url, publication) {
  let fm = frontmatterRaw;

  // Add or update subTitle
  if (subtitle) {
    if (fm.match(/^subTitle:/m)) {
      fm = fm.replace(/^subTitle:.*$/m, `subTitle: "${subtitle.replace(/"/g, '\\"')}"`);
    } else {
      // Insert after title line
      fm = fm.replace(/^(title:.*)$/m, `$1\nsubTitle: "${subtitle.replace(/"/g, '\\"')}"`);
    }
  }

  let body = '';
  if (firstPara) {
    body = `\n${firstPara}\n\n[Read more at ${publication} →](${url})\n`;
  }

  return `---\n${fm}\n---\n${body}`;
}

async function main() {
  console.log(`Fixing ${TARGET_FILES.length} bylines with bad/missing body text\n`);

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < TARGET_FILES.length; i++) {
    const filename = TARGET_FILES[i];
    const filepath = path.join(BYLINES_DIR, filename);

    if (!fs.existsSync(filepath)) {
      // File may have been renamed by date fix script
      const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const found = fs.readdirSync(BYLINES_DIR).find((f) => f.endsWith(slug));
      if (found) {
        TARGET_FILES[i] = found;
        console.log(`  [${i + 1}/${TARGET_FILES.length}] Found renamed: ${found}`);
      } else {
        console.log(`  [${i + 1}/${TARGET_FILES.length}] SKIP (not found): ${filename}`);
        failed++;
        continue;
      }
    }

    const actualPath = path.join(BYLINES_DIR, TARGET_FILES[i]);
    const content = fs.readFileSync(actualPath, 'utf-8');
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.log(`  [${i + 1}/${TARGET_FILES.length}] SKIP (no frontmatter): ${TARGET_FILES[i]}`);
      failed++;
      continue;
    }

    const url = extractField(parsed.raw, 'url');
    const publication = extractField(parsed.raw, 'publication');
    const title = extractField(parsed.raw, 'title');

    console.log(`  [${i + 1}/${TARGET_FILES.length}] ${title || TARGET_FILES[i]}`);

    const { subtitle, firstPara } = await fetchArticleContent(url, publication);

    if (firstPara) {
      const updated = rebuildFile(parsed.raw, subtitle, firstPara, url, publication);
      fs.writeFileSync(actualPath, updated, 'utf-8');
      console.log(`    Body: ${firstPara.slice(0, 80)}...`);
      if (subtitle) console.log(`    Subtitle: ${subtitle}`);
      fixed++;
    } else {
      console.log(`    Could not extract body text`);
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
