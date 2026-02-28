#!/usr/bin/env node

/**
 * Generate consistent tags for all content using Claude Haiku.
 *
 * Usage:
 *   node scripts/generate-tags.mjs --dry-run   # preview proposed tags
 *   node scripts/generate-tags.mjs             # write tags to files
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const BYLINES_DIR = path.join(__dirname, '..', 'src', 'content', 'bylines');

const DRY_RUN = process.argv.includes('--dry-run');

const TAG_VOCABULARY = [
  'film',
  'tv',
  'food',
  'art',
  'music',
  'books',
  'austin',
  'sxsw',
  'culture',
  'sports',
  'essay',
  'interview',
];

const DELAY_MS = 1300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { raw: match[1], body: match[2] };
}

function extractField(frontmatter, field) {
  const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

async function generateTags(title, subtitle, body, publication) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const contentDesc = publication
    ? `Title: ${title}\nSubtitle: ${subtitle || 'N/A'}\nPublication: ${publication}\nExcerpt: ${body.slice(0, 500)}`
    : `Title: ${title}\nSubtitle: ${subtitle || 'N/A'}\nContent: ${body.slice(0, 1500)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Given this article, assign 1-4 tags from this controlled vocabulary: ${TAG_VOCABULARY.join(', ')}. Return ONLY a JSON array of tag strings, nothing else.\n\n${contentDesc}`,
        },
      ],
    }),
  });

  if (res.status === 429 || res.status === 529) {
    const retryAfter = res.headers.get('retry-after');
    const waitSec = retryAfter ? parseInt(retryAfter, 10) : 30;
    const reason = res.status === 429 ? 'Rate limited' : 'Overloaded';
    console.warn(`    ${reason} — waiting ${waitSec}s...`);
    await sleep(waitSec * 1000);
    return generateTags(title, subtitle, body, publication);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  let text = (data.content[0]?.text || '[]').trim();

  // Strip markdown code fences if present (e.g. ```json\n[...]\n```)
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    const tags = JSON.parse(text);
    return tags.filter((t) => TAG_VOCABULARY.includes(t));
  } catch {
    console.warn(`  Failed to parse tags: ${text}`);
    return [];
  }
}

function replaceTags(content, newTags) {
  const parsed = parseFrontmatter(content);
  if (!parsed) return content;

  // Remove existing tags block (including tag lines that may or may not end with newline)
  let fm = parsed.raw.replace(/^tags:\n(  - .+\n?)*/gm, '');
  fm = fm.replace(/^tags:\s*\[.*\]$/gm, '');
  fm = fm.replace(/^tags:\s*$/gm, '');
  fm = fm.replace(/\n{3,}/g, '\n');

  // Add new tags
  const tagsYaml = newTags.length > 0
    ? `tags:\n${newTags.map((t) => `  - ${t}`).join('\n')}`
    : '';

  if (tagsYaml) {
    fm = fm.trimEnd() + '\n' + tagsYaml;
  }

  return `---\n${fm}\n---\n${parsed.body}`;
}

async function processDirectory(dir, isByline = false) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  console.log(`\nProcessing ${files.length} files in ${path.basename(dir)}/`);

  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(dir, files[i]);
    if (!fs.existsSync(filepath)) {
      console.log(`  [${i + 1}/${files.length}] Skipping ${files[i]} (file not found)`);
      continue;
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;

    // Skip files that already have tags
    if (/^tags:\n  - /m.test(parsed.raw)) {
      console.log(`  [${i + 1}/${files.length}] Skipping (already tagged)`);
      continue;
    }

    const title = extractField(parsed.raw, 'title');
    const subtitle = extractField(parsed.raw, 'subTitle');
    const publication = isByline ? extractField(parsed.raw, 'publication') : '';

    console.log(`  [${i + 1}/${files.length}] ${title || files[i]}`);

    const tags = await generateTags(title, subtitle, parsed.body, publication);

    if (DRY_RUN) {
      console.log(`    Tags: ${tags.join(', ')}`);
    } else {
      const updated = replaceTags(content, tags);
      fs.writeFileSync(filepath, updated, 'utf-8');
      console.log(`    Tags: ${tags.join(', ')} (written)`);
    }

    await sleep(DELAY_MS);
  }
}

async function main() {
  if (DRY_RUN) {
    console.log('DRY RUN — no files will be modified\n');
  }

  await processDirectory(POSTS_DIR, false);
  await processDirectory(BYLINES_DIR, true);

  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
