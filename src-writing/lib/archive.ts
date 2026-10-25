import type { Station, MetroMapData } from './metro';

/** Catalog numbers run oldest to newest; "see also" is up to two other essays on the same lines. */
export function catalog(map: MetroMapData) {
  const asc = [...map.stations].sort((a, b) => a.post.data.date.valueOf() - b.post.data.date.valueOf());
  const number = new Map(asc.map((s, i) => [s.id, i + 1]));
  const seeAlso = (s: Station) =>
    asc
      .filter((o) => o.id !== s.id && o.lines.some((l) => s.lines.includes(l)))
      .sort((a, b) => Math.abs(a.post.data.date.valueOf() - s.post.data.date.valueOf()) - Math.abs(b.post.data.date.valueOf() - s.post.data.date.valueOf()))
      .slice(0, 2);
  return { number: (s: Station) => number.get(s.id)!, seeAlso };
}
