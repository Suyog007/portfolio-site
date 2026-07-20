// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Canonical URLs, the sitemap and RSS all need the public address of the site.
// Set SITE_URL once you have a domain; on Vercel the production URL is used until then.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      wrap: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      weights: [400],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: [400, 500, 600],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
