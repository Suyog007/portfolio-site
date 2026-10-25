import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts: one Markdown/MDX file per post in src/content/posts.
// The file name becomes the URL (/writing/<file-name>) unless `slug` is set in frontmatter.
const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional extras used by the writing subdomain's design.
    short: z.string().max(40).optional(), // shorter title for the metro map label
    featured: z.boolean().default(false), // shown face-out on the shelf
  }),
});

// Projects: one Markdown file per project in src/content/projects. The body holds the longer write-up.
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    area: z.array(z.enum(['Full-stack', 'Web3', 'Cryptography', 'AI', 'Data', 'Desktop'])),
    stack: z.array(z.string()).default([]),
    github: z.url().optional(),
    demo: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

export const collections = { posts, projects };
