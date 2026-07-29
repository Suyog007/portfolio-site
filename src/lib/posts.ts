import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Posts visible on the site. Drafts show up while running `npm run dev` so they can be previewed,
 * but are never included in a production build, so they cannot leak through pages, RSS or the sitemap.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ') // code is skimmed, not read word by word
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getTags(posts: Post[]): { name: string; slug: string; count: number }[] {
  const tags = new Map<string, { name: string; slug: string; count: number }>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      const tag = tags.get(slug) ?? { name, slug, count: 0 };
      tag.count += 1;
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.date.getUTCFullYear();
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()];
}
