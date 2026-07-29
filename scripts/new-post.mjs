// Usage: npm run new "My post title"
// Creates src/content/posts/<slug>.md as a draft with today's date.
import { existsSync, writeFileSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new "My post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');
const file = `src/content/posts/${slug}.md`;

if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${today}
tags: []
draft: true
---

Start writing here.
`,
);

console.log(`Created ${file}`);
console.log(`Preview it with "npm run dev" at http://localhost:4321/writing/${slug}`);
console.log('Set draft: false and push to publish.');
