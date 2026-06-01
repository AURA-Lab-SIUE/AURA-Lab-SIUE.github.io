import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://aura-lab-siue.github.io',
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap(), react()],
});