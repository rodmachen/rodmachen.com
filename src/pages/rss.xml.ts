import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getPostSlug, getPostCategory } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Edition | Rod Machen',
    description: 'Writing on food, film, arts, and Austin culture.',
    site: context.site!,
    items: sorted.map((post) => {
      const slug = getPostSlug(post.id, post.data);
      const category = getPostCategory(post.data.category);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        link: `/${category}/${slug}/`,
      };
    }),
  });
}
