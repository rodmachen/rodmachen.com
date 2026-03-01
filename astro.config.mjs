import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import remarkCloudinaryImages from './src/plugins/remark-cloudinary-images.js';

export default defineConfig({
  site: 'https://edition.rodmachen.com',
  trailingSlash: 'always',
  adapter: vercel(),
  output: 'static',
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  markdown: {
    remarkPlugins: [remarkCloudinaryImages],
  },
});
