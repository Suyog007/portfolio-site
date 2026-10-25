// Post-build step for the writing subdomain (build with WRITING_HOME=1).
// The writing site is built from src-writing/, so there are no portfolio pages to serve.
// Old links to them (from before the sites were split) go back to the main domain.
import { writeFileSync } from 'node:fs';

const main = 'https://suyogadhikari.tech';

writeFileSync(
  'dist/_redirects',
  [`/projects ${main}/projects 301`, `/about ${main}/about 301`, `/resume ${main}/resume 301`, `/resume/* ${main}/resume/:splat 301`, ''].join('\n'),
);
