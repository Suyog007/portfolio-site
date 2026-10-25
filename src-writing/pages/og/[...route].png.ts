import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOgImage } from '../../../src/lib/og';
import { getPosts } from '../../../src/lib/posts';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  const date = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return [
    { params: { route: 'default' }, props: { title: "Suyog's Writing", kicker: 'Essays on building software, Web3 and cryptography' } },
    ...posts.map((post) => ({
      params: { route: `writing/${post.id}` },
      props: { title: post.data.title, kicker: date(post.data.date) },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as { title: string; kicker?: string });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
