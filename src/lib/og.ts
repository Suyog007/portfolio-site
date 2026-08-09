import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../site.config';

// Build-time social images (1200×630). Satori lays out the card as SVG, sharp turns it into a PNG.

// Resolved from the project root: builds always run there, and bundling would break a relative URL.
const serif = readFile(resolve('src/assets/fonts/InstrumentSerif-Regular.ttf'));

const robot = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 132">
  <g fill="#faf7f2" stroke="#22201c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="53" y="84" width="14" height="11" rx="3"/>
    <rect x="34" y="93" width="52" height="34" rx="12"/>
    <line x1="60" y1="22" x2="60" y2="10"/>
    <circle cx="60" cy="8" r="5.5" fill="#b5492f"/>
    <rect x="11" y="43" width="11" height="22" rx="4"/>
    <rect x="98" y="43" width="11" height="22" rx="4"/>
    <rect x="20" y="22" width="80" height="64" rx="19"/>
  </g>
  <circle cx="60" cy="110" r="5" fill="#b5492f"/>
  <rect x="30" y="32" width="60" height="44" rx="11" fill="#1d2320"/>
  <rect x="44" y="43" width="11" height="17" rx="5.5" fill="#8fe3b0"/>
  <rect x="73" y="43" width="11" height="17" rx="5.5" fill="#8fe3b0"/>
  <path d="M52 66 q8 7 16 0" fill="none" stroke="#8fe3b0" stroke-width="4" stroke-linecap="round"/>
</svg>`)}`;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export async function renderOgImage({ title, kicker }: { title: string; kicker?: string }): Promise<Buffer> {
  const size = title.length > 60 ? 64 : title.length > 32 ? 76 : 92;

  const card = h(
    'div',
    {
      // satori adds padding on top of width/height, so size the content box: 1200×630 overall
      width: 1200 - 160,
      height: 630 - 144,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: '#faf7f2',
      color: '#22201c',
      fontFamily: 'Instrument Serif',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        h('img', { width: 64, height: 70 }, undefined, { src: robot, width: 64, height: 70 }),
        h('div', { fontSize: 36 }, SITE.name),
      ]),
      h('div', { display: 'flex', fontSize: size, lineHeight: 1.05, letterSpacing: '-0.01em', maxWidth: 1000 }, title),
      h(
        'div',
        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 30, color: '#6b655c', borderTop: '2px solid #e4dccf', paddingTop: 24 },
        [h('div', {}, kicker ?? SITE.tagline), h('div', { width: 14, height: 14, marginTop: 12, borderRadius: 7, background: '#b5492f' })],
      ),
    ],
  );

  const svg = await satori(card as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Instrument Serif', data: await serif, weight: 400, style: 'normal' }],
  });

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
