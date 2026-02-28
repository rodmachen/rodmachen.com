import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://edition.rodmachen.com',
  trailingSlash: 'always',
  adapter: vercel(),
  output: 'static',
});
