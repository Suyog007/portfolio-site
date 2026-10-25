/** "12 Nov 2024", the way a library stamp reads (uppercased by the stamp style). */
const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
export const stampDate = (d: Date) => `${d.getUTCDate()} ${month(d)} ${d.getUTCFullYear()}`;

/** "Nov 2024" for the small print under a stop. */
export const monthYear = (d: Date) => `${month(d)} ${d.getUTCFullYear()}`;

export function wordCount(body: string | undefined): number {
  return (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
