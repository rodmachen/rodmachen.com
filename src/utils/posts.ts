import type { CollectionEntry } from 'astro:content';

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
