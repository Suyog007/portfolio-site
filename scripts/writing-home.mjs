// Post-build step for the writing subdomain (build with WRITING_HOME=1).
// Makes the writing list the home page and sends the rest of the site back to the main domain.
import { copyFileSync, writeFileSync } from 'node:fs';

const main = 'https://suyogadhikari.tech';

copyFileSync('dist/writing.html', 'dist/index.html');
writeFileSync(
  'dist/_redirects',
  [`/projects ${main}/projects 301`, `/about ${main}/about 301`, `/resume ${main}/resume 301`, `/resume/* ${main}/resume/:splat 301`, ''].join('\n'),
);
