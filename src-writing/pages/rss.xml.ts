import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../../src/lib/posts';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((post) => !post.data.draft);
  return rss({
    title: "Suyog's Writing",
    description: 'Notes on building software, Web3 and applied cryptography.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/writing/${post.id}`,
    })),
    customData: `<language>en</language>`,
  });
}
