# suyog-portfolio

Personal site and blog for Suyog Adhikari. Static site built with [Astro](https://astro.build), with posts written in Markdown.

## Run it locally

Needs Node.js 22.12 or newer.

```sh
npm install
npm run dev        # http://localhost:4321, live reload, drafts visible
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm run check      # type-check .astro and .ts files
```

## Writing and publishing a post

1. Create a draft:

   ```sh
   npm run new "My post title"
   ```

   This creates `src/content/posts/my-post-title.md` with `draft: true` and today's date.

2. Fill in the frontmatter and write the post:

   ```md
   ---
   title: My post title
   description: One or two sentences shown in the post list, search results and link previews.
   date: 2026-10-13
   updated: 2026-11-02 # optional, shown as "Updated …"
   tags: [Web3, Rust]
   draft: true
   ---

   Markdown goes here. Fenced code blocks get syntax highlighting.
   ```

3. Preview with `npm run dev`. Drafts show up locally with a "Draft" label.
4. When it's ready, set `draft: false`, commit and push. Vercel rebuilds and the post goes live in about a minute.

**How it works**

- **Drafts stay private.** They are never part of a production build, so they can't appear in pages, tag pages, RSS or the sitemap. They still exist in the Git repository, though, so keep the repo private if a draft is sensitive.
- **URLs stay stable.** A post's URL is its file name: `/writing/my-post-title`. Renaming the file changes the URL. To rename a file but keep the old URL, add `slug: old-file-name` to the frontmatter.
- **Images:** put them next to the post or in `public/`, then reference them with standard Markdown image syntax.
- **MDX:** use `.mdx` instead of `.md` if a post needs a component.
- **Share images:** every post gets an automatically generated 1200×630 image at `/og/writing/<slug>.png`.

## Editing everything else

| What | Where |
| --- | --- |
| Name, email, links, nav, resume blurbs | `src/site.config.ts` |
| Projects (one file each, ordered by `order`) | `src/content/projects/*.md` |
| Home intro | `src/pages/index.astro` |
| About text, path and toolbox | `src/pages/about.astro` |
| Resume PDFs | `public/resume/` |
| Colours, spacing, type | `src/styles/global.css` (tokens at the top) |
| Article typography and code blocks | `src/styles/prose.css` |
| The robot's behaviour | `src/components/Robot.astro` |
| The robot's pixel art (20×20 text grids) | `src/lib/robot-sprite.ts` |

Project frontmatter: `title`, `summary`, `area` (Full-stack, Web3, Cryptography, AI, Data, Desktop), `stack`, `github`, `demo`, `featured` (shown on home), `order`.

## Deploying (Vercel)

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repo. It detects Astro automatically, and no adapter is needed because the site is static.
3. Optional, once you have a domain:
   - Add the domain under **Settings → Domains**.
   - Add an environment variable `SITE_URL=https://your-domain.com`.
   - Redeploy.

   Until `SITE_URL` is set, canonical links, RSS and the sitemap use Vercel's production URL.

`vercel.json` serves clean URLs (`/about`, not `/about.html` or `/about/`) and caches hashed assets for a long time.

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Recommended | Public origin used for canonical links, RSS, the sitemap and share images |

No secrets are needed: there is no backend, database or login.

## What's in here

- `src/pages/`:
  - `/`, `/writing`, `/writing/<slug>`, `/writing/tags/<tag>`, `/projects`, `/about`, `/resume`, `/404`
  - `rss.xml`, `robots.txt`, `og/*.png`
  - The sitemap comes from `@astrojs/sitemap`.
- `src/content.config.ts`: the schemas for posts and projects. The build fails if frontmatter is missing or invalid.
- `src/lib/`: post helpers (sorting, drafts, reading time, tags), path cleanup and the share-image renderer.
- `design/companions.html`: the standalone prototype used to pick the robot. It isn't part of the site.

### Dependencies

- `astro`, plus its `mdx`, `sitemap` and `rss` packages.
- `satori` and `sharp`, which only run at build time to draw share images.
- Fonts (Instrument Serif and Inter) are self-hosted through Astro's font support, so there are no requests to Google at runtime.
- `npm audit` reports a moderate issue in `fflate`, a dependency of `satori`. It only affects unzipping untrusted ZIP files, which this build never does.

## The writing site (writing.suyogadhikari.tech)

The writing subdomain is a second build of this repo with its own design (the "Suyog's Writing" design system: the Metro Map home, reading pages, shelf and archive). It reads the same posts in `src/content/posts/`.

- `src-writing/` holds its pages, components, layout and styles. It is used instead of `src/` when `WRITING_HOME` is set (see `astro.config.mjs`), so the portfolio build is unaffected.
- Commands: `npm run dev:writing`, `npm run build:writing`, `npm run check:writing`. After switching between the two sites, run `npx astro sync` once before `npm run check`.
- Netlify: the writing project sets `WRITING_HOME=1` and `SITE_URL`; the build command in `netlify.toml` is shared.
- Fonts (Fraunces, Source Serif 4, Caveat, Courier Prime) are self-hosted through Astro's font support, like the portfolio's.
- Tokens are in `src-writing/styles/tokens.css` (generated from the design system's `tokens.json`) and the component styles in `bundle.css`. Keep the values exact; change the design system first.

### The Metro Map (`/map`)

Each topic is a line, each post a station, and a post on two or more lines is an interchange. The map is generated at build time from post tags.

- `src-writing/metro.config.ts` sets each line's name, letter, colour, the tags that put a post on it, and its route on the 40px grid (90° and 45° turns only).
- Stops are placed along their line in date order. Interchanges sit where their lines cross, so give lines that share posts routes that cross at a grid point. A warning is printed at build time if two lines should share a post but never cross.
- New posts are placed automatically. To override one, add `stations: { 'post-file-name': { at: [x, y], label: 'ne' } }` to the config.
- A post whose tags match no line goes on the `fallback` line.
- Frontmatter extras: `short: "Short title"` for the map label (otherwise the title before a colon is used) and `featured: true` to show a post face-out on the shelf.
- Under 640px wide the map is replaced by one line strip per topic. Each essay appears once, under its main line, with badges for the lines it connects to.

### The shelf (home page)

Every essay is a book: height from word count, width from reading time, colour from its main line. The whole title is printed on the spine, so a long title on a short essay makes the book a little taller and wider than its length alone would. `/writing`, `/writing/tags/*` and `/shelf` redirect to `/`.

### Margin notes

Margin notes work in `.mdx` posts (rename the file from `.md`). Import the component and wrap the paragraph:

```mdx
import Annotated from '../../../src-writing/components/Annotated.astro';

<Annotated note="still true, a year later">
  I used to think writing was about having something to say. Now I think it is about <mark>noticing what you already said</mark>.
</Annotated>
```

Wrap the phrase you are answering in `<mark>` for the wavy underline. Keep notes under eight words and use one every few paragraphs. The notes are styled on the writing site; the portfolio's own `/writing` pages show them as plain text.

## Maintenance

- `npx @astrojs/upgrade` upgrades Astro and its integrations together; then run `npm run check && npm run build`.
- The robot respects `prefers-reduced-motion` and touch devices: there it stays home and only turns to face the pointer. To redraw it, edit the grids in `src/lib/robot-sprite.ts`. Every row must be exactly 20 characters, and the build fails with a clear error if one isn't.
