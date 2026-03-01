import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tagTransform = z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
  if (typeof val === 'string') return val.trim() ? [val] : [];
  return val;
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().nullable().default('').transform((val) => val ?? ''),
    subTitle: z.string().nullable().optional().transform((val) => val ?? undefined),
    author: z.string().optional(),
    category: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
      if (Array.isArray(val)) return val[0] || 'article';
      return val || 'article';
    }),
    template: z.enum(['article', 'essay', 'newsletter', 'review']).optional(),
    tags: tagTransform,
    date: z.coerce.date(),
    published: z.boolean().optional(),
  }),
});

const bylines = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bylines' }),
  schema: z.object({
    title: z.string(),
    subTitle: z.string().nullable().optional().transform((val) => val ?? undefined),
    publication: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    tags: tagTransform,
  }),
});

export const collections = { posts, bylines };
