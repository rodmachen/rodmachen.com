import type { CollectionEntry } from 'astro:content';

export type ListItem = {
  type: 'post' | 'byline';
  date: Date;
  title: string;
  subtitle?: string;
  href: string;
  category?: string;
  publication?: string;
  tags?: string[];
  image?: string;
};

export function extractFirstImage(markdown: string | undefined): string | undefined {
  if (!markdown) return undefined;
  const match = markdown.match(/!\[.*?\]\((\/images\/\S+?)(?:\s+"[^"]*")?\)/);
  return match?.[1];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function postToListItem(p: CollectionEntry<'posts'>): ListItem {
  const slug = getPostSlug(p.id);
  const cat = getPostCategory(p.data.category);
  return {
    type: 'post',
    date: p.data.date,
    title: p.data.title || slug,
    subtitle: p.data.subTitle,
    href: `/${cat}/${slug}/`,
    category: cat,
    tags: p.data.tags || [],
    image: extractFirstImage(p.body),
  };
}

const PUBLICATION_LOGOS: Record<string, string> = {
  'Austin Chronicle': '/images/austin-chronicle.png',
  'Cinapse': '/images/cinapse.png',
};

export function bylineToListItem(b: CollectionEntry<'bylines'>): ListItem {
  return {
    type: 'byline',
    date: b.data.date,
    title: b.data.title,
    subtitle: b.data.subTitle,
    href: b.data.url,
    category: 'byline',
    publication: b.data.publication,
    tags: b.data.tags || [],
    image: PUBLICATION_LOGOS[b.data.publication],
  };
}

export const CATEGORY_CONFIG: Record<string, { label: string; description: string; accent: string }> = {
  newsletter: {
    label: 'Newsletter',
    description: 'The Hangman Chronicles',
    accent: '#117a65',
  },
  byline: {
    label: 'Bylines',
    description: 'Published at external outlets',
    accent: '#2e4057',
  },
  article: {
    label: 'Articles',
    description: 'Long-form writing and original pieces',
    accent: '#1a5276',
  },
  essay: {
    label: 'Essays',
    description: 'Personal essays and opinion pieces',
    accent: '#6c3483',
  },
  review: {
    label: 'Reviews',
    description: 'Arts and Food reviews',
    accent: '#b9770e',
  },
};

export function getPostSlug(id: string): string {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function getPostCategory(category: string | string[] | undefined): string {
  if (Array.isArray(category)) return category[0] || 'article';
  return category || 'article';
}

export function getPostsByCategory(posts: CollectionEntry<'posts'>[]): Record<string, CollectionEntry<'posts'>[]> {
  const grouped: Record<string, CollectionEntry<'posts'>[]> = {};
  for (const post of posts) {
    const cat = getPostCategory(post.data.category);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(post);
  }
  return grouped;
}
