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

// The writing subdomain is built from src-writing/ (its own pages and design); the portfolio from src/.
const writing = Boolean(process.env.WRITING_HOME);

export default defineConfig({
  site,
  srcDir: writing ? './src-writing' : './src',
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
  // Two different font sets, so the tuple type Astro infers for one branch does not fit the other.
  fonts: /** @type {any} */ (
    writing
    ? [
        {
          provider: fontProviders.google(),
          name: 'Fraunces',
          cssVariable: '--font-sw-display',
          weights: [400, 500, 600],
          styles: ['normal'],
          fallbacks: ['Libre Caslon Text', 'Georgia', 'serif'],
        },
        {
          provider: fontProviders.google(),
          name: 'Source Serif 4',
          cssVariable: '--font-sw-serif',
          weights: [400],
          styles: ['normal', 'italic'],
          fallbacks: ['Georgia', 'serif'],
        },
        {
          provider: fontProviders.google(),
          name: 'Caveat',
          cssVariable: '--font-sw-hand',
          weights: [500, 600],
          styles: ['normal'],
          fallbacks: ['Segoe Print', 'cursive'],
        },
        {
          provider: fontProviders.google(),
          name: 'Courier Prime',
          cssVariable: '--font-sw-mono',
          weights: [400, 700],
          styles: ['normal'],
          fallbacks: ['Courier New', 'monospace'],
        },
      ]
    : [
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
      ]
  ),
});
