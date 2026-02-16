import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Rod Machen',
    description: "Rod Machen's writings.",
    site: context.site!,
    items: sorted.map((post) => {
      const slug = post.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const category = Array.isArray(post.data.category)
        ? post.data.category[0] || 'article'
        : post.data.category || 'article';
      return {
        title: post.data.title,
        pubDate: post.data.date,
        link: `/${category}/${slug}/`,
      };
    }),
  });
}
