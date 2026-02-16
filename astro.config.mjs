import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://rodmachen.com',
  trailingSlash: 'always',
  adapter: vercel(),
  output: 'static',
});
