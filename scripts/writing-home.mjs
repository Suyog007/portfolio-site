// Post-build step for the writing subdomain (build with WRITING_HOME=1).
// The writing site is built from src-writing/, so it has no portfolio pages and no archive.
// Old links go where the content now lives: the portfolio pages to the main domain, the old
// writing list and tag pages to the shelf (the home page).
import { writeFileSync } from 'node:fs';

const main = 'https://suyogadhikari.tech';

writeFileSync(
  'dist/_redirects',
  [
    `/projects ${main}/projects 301`,
    `/about ${main}/about 301`,
    `/resume ${main}/resume 301`,
    `/resume/* ${main}/resume/:splat 301`,
    '/writing / 301!',
    '/writing/tags/* / 301!',
    '/shelf / 301!',
    '',
  ].join('\n'),
);
