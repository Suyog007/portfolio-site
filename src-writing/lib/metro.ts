import type { Post } from '../../src/lib/posts';
import { readingTime } from '../../src/lib/posts';
import { metro, type LineConfig, type Point, type Side } from '../metro.config';

/** Grid size in px (the design system's `metro-grid`). */
export const GRID = 40;
const PAD_X = 110;
const PAD_Y = 76;

export type StationKind = 'stop' | 'interchange' | 'terminus';

export interface LabelBox {
  anchor: 'start' | 'middle' | 'end';
  /** x for every text line, y of the first baseline */
  x: number;
  y: number;
  lines: string[];
}

export interface Station {
  post: Post;
  id: string;
  title: string;
  url: string;
  lines: LineConfig[];
  main: LineConfig;
  kind: StationKind;
  /** The line this station is the terminus of, when kind is 'terminus'. */
  terminusOf?: LineConfig;
  at: Point;
  x: number;
  y: number;
  minutes: number;
  isNew: boolean;
  label: LabelBox;
  newTag?: { x: number; y: number };
}

export interface MetroLine {
  config: LineConfig;
  stations: Station[]; // oldest first
  points: string;
  start: { x: number; y: number; station?: Station };
  end: { x: number; y: number; station?: Station };
}

export interface MetroMapData {
  width: number;
  height: number;
  lines: MetroLine[];
  stations: Station[];
  lineById: Map<string, MetroLine>;
}

type Slot = { pt: Point; s: number };
const key = (p: Point) => `${p[0]},${p[1]}`;
const sameDir = (dx: number, dy: number) => dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);

/** Every grid point along a route, with its distance from the start. */
function slotsOf(line: LineConfig): Slot[] {
  const out: Slot[] = [];
  let s = 0;
  for (let i = 0; i < line.route.length - 1; i++) {
    const [x0, y0] = line.route[i];
    const [x1, y1] = line.route[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    if (!sameDir(dx, dy) || (dx === 0 && dy === 0)) {
      throw new Error(`metro.config: line "${line.id}" has a segment that is not 90° or 45°: ${x0},${y0} → ${x1},${y1}`);
    }
    const n = Math.max(Math.abs(dx), Math.abs(dy));
    const stepLen = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      out.push({ pt: [x0 + Math.sign(dx) * k, y0 + Math.sign(dy) * k], s: s + k * stepLen });
    }
    s += n * stepLen;
  }
  return out;
}

function wrap(text: string, max = 26, maxLines = 2): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(/\s+/)) {
    if (cur && (cur + ' ' + word).length > max) {
      lines.push(cur);
      cur = word;
    } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:]*$/, '') + '…';
    return kept;
  }
  return lines;
}

const labelText = (post: Post) => {
  const { title, short } = post.data;
  return short ?? (title.includes(':') ? title.split(':')[0].trim() : title);
};

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function segmentHitsRect(p: [number, number], q: [number, number], r: Rect, pad: number): boolean {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const steps = Math.max(1, Math.ceil(len / 3));
  for (let i = 0; i <= steps; i++) {
    const x = p[0] + ((q[0] - p[0]) * i) / steps;
    const y = p[1] + ((q[1] - p[1]) * i) / steps;
    if (x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad) return true;
  }
  return false;
}

export function buildMetro(posts: Post[]): MetroMapData {
  const lineById = new Map(metro.lines.map((l) => [l.id, l]));
  const fallback = lineById.get(metro.fallback);
  if (!fallback) throw new Error(`metro.config: fallback line "${metro.fallback}" does not exist`);

  const asc = [...posts].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  const newestId = asc.at(-1)?.id;

  // 1. Which lines is each post on?
  const linesOf = new Map<string, LineConfig[]>();
  for (const post of asc) {
    const found: LineConfig[] = [];
    for (const tag of post.data.tags) {
      const line = metro.lines.find((l) => l.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
      if (line && !found.includes(line)) found.push(line);
    }
    linesOf.set(post.id, found.length ? found : [fallback]);
  }

  const activeLines = metro.lines.filter((l) => asc.some((p) => linesOf.get(p.id)!.includes(l)));
  const slots = new Map(activeLines.map((l) => [l.id, slotsOf(l)]));
  const slotIndex = new Map(activeLines.map((l) => [l.id, new Map(slots.get(l.id)!.map((s, i) => [key(s.pt), i]))]));
  const postsOn = new Map(activeLines.map((l) => [l.id, asc.filter((p) => linesOf.get(p.id)!.includes(l))]));

  const target = (line: LineConfig, post: Post) => {
    const list = postsOn.get(line.id)!;
    const sl = slots.get(line.id)!;
    const total = sl.at(-1)!.s;
    return list.length > 1 ? (list.indexOf(post) / (list.length - 1)) * total : 0;
  };

  // 2. Interchanges sit where their lines cross.
  const position = new Map<string, Point>(); // post id → grid point
  const taken = new Map(activeLines.map((l) => [l.id, new Set<number>()]));
  const usedCrossings = new Set<string>();
  const pin = (post: Post, pt: Point) => {
    position.set(post.id, pt);
    for (const line of linesOf.get(post.id)!) {
      const i = slotIndex.get(line.id)?.get(key(pt));
      if (i !== undefined) taken.get(line.id)!.add(i);
    }
  };

  for (const post of asc) {
    const override = metro.stations[post.id]?.at;
    if (override) {
      pin(post, override);
      continue;
    }
    const lines = linesOf.get(post.id)!;
    if (lines.length < 2) continue;
    const common = (ls: LineConfig[]) =>
      [...slotIndex.get(ls[0].id)!.keys()].filter((k) => ls.every((l) => slotIndex.get(l.id)!.has(k)) && !usedCrossings.has(k));
    let candidates = common(lines);
    if (!candidates.length) candidates = common(lines.slice(0, 2));
    if (!candidates.length) {
      console.warn(`[metro] "${post.id}" is on lines ${lines.map((l) => l.id).join(' + ')} but their routes share no free crossing; placing it on ${lines[0].id}.`);
      continue; // falls through to ordinary placement on its main line
    }
    const cost = (k: string) =>
      lines.reduce((sum, l) => {
        const i = slotIndex.get(l.id)!.get(k);
        return sum + (i === undefined ? 0 : Math.abs(slots.get(l.id)![i].s - target(l, post)));
      }, 0);
    const best = candidates.reduce((a, b) => (cost(b) < cost(a) ? b : a));
    usedCrossings.add(best);
    pin(post, best.split(',').map(Number) as Point);
  }

  // 3. Everything else is spread along its main line, oldest first, termini at the ends.
  const mainOf = (post: Post) => linesOf.get(post.id)![0];
  for (const line of activeLines) {
    const sl = slots.get(line.id)!;
    const idx = slotIndex.get(line.id)!;
    const used = taken.get(line.id)!;
    const members = postsOn.get(line.id)!;
    const where = new Map<string, number>(); // post id → slot index on this line
    for (const p of members) {
      const pt = position.get(p.id);
      const i = pt ? idx.get(key(pt)) : undefined;
      if (i !== undefined) where.set(p.id, i);
    }
    const free = members.filter((p) => !position.has(p.id) && mainOf(p) === line);
    const place = (p: Post, want: number) => {
      let best = -1;
      for (let i = 0; i < sl.length; i++) {
        if (used.has(i)) continue;
        if (best < 0 || Math.abs(i - want) < Math.abs(best - want)) best = i;
      }
      if (best < 0) {
        console.warn(`[metro] line "${line.id}" has more posts than grid points; "${p.id}" was dropped from the map.`);
        return;
      }
      used.add(best);
      where.set(p.id, best);
      position.set(p.id, sl[best].pt);
    };
    // The oldest free post takes the start of the line, the newest the end, unless a pinned
    // interchange is in the way (older than the first, or newer than the last).
    const pinned = members.filter((p) => where.has(p.id));
    const first = free[0];
    const last = free.at(-1);
    const startOk = first && pinned.every((p) => p.data.date.valueOf() > first.data.date.valueOf());
    const endOk = last && pinned.every((p) => p.data.date.valueOf() < last.data.date.valueOf());
    if (first === last) {
      if (startOk) place(first, 0);
      else if (endOk) place(last!, sl.length - 1);
    } else {
      if (startOk) place(first, 0);
      if (endOk) place(last!, sl.length - 1);
    }

    // runs of still-unplaced posts between placed neighbours
    const order = members.filter((p) => where.has(p.id) || free.includes(p));
    let i = 0;
    while (i < order.length) {
      if (where.has(order[i].id)) {
        i++;
        continue;
      }
      let j = i;
      while (j < order.length && !where.has(order[j].id)) j++;
      const a = i > 0 ? where.get(order[i - 1].id)! : 0;
      const b = j < order.length ? where.get(order[j].id)! : sl.length - 1;
      const run = order.slice(i, j);
      run.forEach((p, k) => {
        const want = a < b ? a + ((k + 1) * (b - a)) / (run.length + 1) : ((k + 1) * (sl.length - 1)) / (run.length + 1);
        place(p, Math.round(want));
      });
      i = j;
    }
  }

  // 4. Pixel space.
  const all = activeLines.flatMap((l) => l.route);
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const px = (p: Point): [number, number] => [(p[0] - minX) * GRID + PAD_X, (p[1] - minY) * GRID + PAD_Y];
  const width = (maxX - minX) * GRID + PAD_X * 2;
  const height = (maxY - minY) * GRID + PAD_Y * 2;

  const segments: [[number, number], [number, number]][] = [];
  for (const line of activeLines) {
    for (let i = 0; i < line.route.length - 1; i++) segments.push([px(line.route[i]), px(line.route[i + 1])]);
  }

  // 5. Stations, then labels that avoid lines, stations and each other.
  const stations: Station[] = [];
  for (const post of asc) {
    const at = position.get(post.id);
    if (!at) continue;
    const lines = linesOf.get(post.id)!;
    const main = lines[0];
    const sl = slots.get(main.id)!;
    const i = slotIndex.get(main.id)!.get(key(at));
    const isEnd = i === 0 || i === sl.length - 1;
    const interchange = lines.length > 1;
    const [x, y] = px(at);
    stations.push({
      post,
      id: post.id,
      title: post.data.title,
      url: `/writing/${post.id}`,
      lines,
      main,
      kind: interchange ? 'interchange' : isEnd ? 'terminus' : 'stop',
      terminusOf: !interchange && isEnd ? main : undefined,
      at,
      x,
      y,
      minutes: readingTime(post.body),
      isNew: post.id === newestId,
      label: { anchor: 'start', x, y, lines: [] },
    });
  }

  const radius = (s: Station) => (s.kind === 'terminus' ? 13 : s.kind === 'interchange' ? 11 : 6);
  const placed: Rect[] = [];
  const bounds: Rect = { x: 4, y: 4, w: width - 8, h: height - 8 };
  const markers: Rect[] = stations.map((s) => ({ x: s.x - radius(s) - 3, y: s.y - radius(s) - 3, w: radius(s) * 2 + 6, h: radius(s) * 2 + 6 }));
  for (const line of activeLines) {
    for (const end of [line.route[0], line.route.at(-1)!]) {
      const [x, y] = px(end);
      markers.push({ x: x - 16, y: y - 16, w: 32, h: 32 });
    }
  }

  const collisions = (r: Rect, own: Rect) =>
    (r.x < bounds.x || r.y < bounds.y || r.x + r.w > bounds.x + bounds.w || r.y + r.h > bounds.y + bounds.h ? 3 : 0) +
    segments.filter(([p, q]) => segmentHitsRect(p, q, r, 6)).length * 2 +
    markers.filter((m) => m !== own && overlaps(r, m)).length * 2 +
    placed.filter((m) => overlaps(r, m)).length * 2;

  const sideOrder = (s: Station): Side[] => {
    const sl = slots.get(s.main.id)!;
    const i = slotIndex.get(s.main.id)!.get(key(s.at))!;
    const a = sl[Math.max(0, i - 1)].pt;
    const b = sl[Math.min(sl.length - 1, i + 1)].pt;
    const horizontal = Math.abs(b[0] - a[0]) > 0 && b[1] === a[1];
    if (s.kind === 'interchange') return ['ne', 'se', 'nw', 'sw', 'above', 'below', 'right', 'left'];
    return horizontal ? ['above', 'below', 'right', 'left', 'ne', 'se', 'nw', 'sw'] : ['right', 'left', 'above', 'below', 'ne', 'se', 'nw', 'sw'];
  };

  const order = [...stations].sort((a, b) => (a.kind === 'stop' ? 1 : 0) - (b.kind === 'stop' ? 1 : 0));
  for (const s of order) {
    const lines = wrap(labelText(s.post));
    const w = Math.max(...lines.map((l) => l.length)) * 6.7 + 2;
    const h = lines.length * 16 + 2;
    const r = radius(s);
    const forced = metro.stations[s.id]?.label;
    const sides: Side[] = forced ? [forced] : sideOrder(s);
    const gap = r + 5;
    const boxes = sides.map((side) => {
      const rect: Rect =
        side === 'right'
          ? { x: s.x + r + 8, y: s.y - h / 2, w, h }
          : side === 'left'
            ? { x: s.x - r - 8 - w, y: s.y - h / 2, w, h }
            : side === 'above'
              ? { x: s.x - w / 2, y: s.y - r - 8 - h, w, h }
              : side === 'below'
                ? { x: s.x - w / 2, y: s.y + r + 8, w, h }
                : {
                    x: side === 'ne' || side === 'se' ? s.x + gap : s.x - gap - w,
                    y: side === 'ne' || side === 'nw' ? s.y - gap - h : s.y + gap,
                    w,
                    h,
                  };
      return { side, rect };
    });
    const own = markers[stations.indexOf(s)];
    const best = boxes.reduce((a, b) => (collisions(b.rect, own) < collisions(a.rect, own) ? b : a));
    placed.push(best.rect);
    const { rect, side } = best;
    s.label = {
      anchor: side === 'right' || side === 'ne' || side === 'se' ? 'start' : side === 'left' || side === 'nw' || side === 'sw' ? 'end' : 'middle',
      x: side === 'right' || side === 'ne' || side === 'se' ? rect.x : side === 'left' || side === 'nw' || side === 'sw' ? rect.x + rect.w : rect.x + rect.w / 2,
      y: rect.y + 13,
      lines,
    };
  }

  const newest = stations.find((s) => s.isNew);
  if (newest) {
    const r = radius(newest);
    const options = [
      [r + 6, -r - 8],
      [-r - 36, -r - 8],
      [r + 6, r + 18],
      [-r - 36, r + 18],
    ];
    const rects = options.map(([dx, dy]) => ({ dx, dy, rect: { x: newest.x + dx, y: newest.y + dy - 11, w: 32, h: 14 } }));
    const own = markers[stations.indexOf(newest)];
    const best = rects.reduce((a, b) => (collisions(b.rect, own) < collisions(a.rect, own) ? b : a));
    newest.newTag = { x: newest.x + best.dx, y: newest.y + best.dy };
  }

  // 6. Lines.
  const lines: MetroLine[] = activeLines.map((config) => {
    const sl = slots.get(config.id)!;
    const [sx, sy] = px(sl[0].pt);
    const [ex, ey] = px(sl.at(-1)!.pt);
    const mine = stations.filter((s) => s.lines.includes(config));
    return {
      config,
      stations: mine,
      points: config.route.map((p) => px(p).join(',')).join(' '),
      start: { x: sx, y: sy, station: mine.find((s) => s.terminusOf === config && key(s.at) === key(sl[0].pt)) },
      end: { x: ex, y: ey, station: mine.find((s) => s.terminusOf === config && key(s.at) === key(sl.at(-1)!.pt)) },
    };
  });

  return { width, height, lines, stations, lineById: new Map(lines.map((l) => [l.config.id, l])) };
}

/** Previous and next stop (by date) on every line a post is on, main line first. */
export function journeysFor(map: MetroMapData, post: Post) {
  const station = map.stations.find((s) => s.id === post.id);
  if (!station) return [];
  return station.lines.map((config) => {
    const line = map.lineById.get(config.id)!;
    const list = [...line.stations].sort((a, b) => a.post.data.date.valueOf() - b.post.data.date.valueOf());
    const i = list.findIndex((s) => s.id === post.id);
    return { line, prev: list[i - 1], next: list[i + 1] };
  });
}
