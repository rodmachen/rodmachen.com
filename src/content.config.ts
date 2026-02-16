import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().nullable().default('').transform((val) => val ?? ''),
    subTitle: z.string().nullable().optional().transform((val) => val ?? undefined),
    author: z.string().optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') return val.trim() ? [val] : [];
      return val;
    }),
    date: z.coerce.date(),
    published: z.boolean().optional(),
  }),
});

export const collections = { posts };
