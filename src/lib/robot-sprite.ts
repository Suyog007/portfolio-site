/**
 * Pixel-art frames for the robot, drawn on a 20×20 grid.
 *
 *   #  outline (ink)    o  body (paper)    s  screen
 *   g  glow (eyes)      a  accent light    z  sleep "z"
 *   (space) transparent
 *
 * Frames are rendered to inline SVG at build time (see Robot.astro), so they stay crisp at any zoom and
 * pick up the light/dark theme colours.
 */

export const GRID = 20;

const FILL: Record<string, string> = {
  '#': 'var(--ink)',
  o: 'var(--paper)',
  s: 'var(--screen)',
  g: 'var(--glow)',
  a: 'var(--accent)',
  z: 'var(--muted)',
};

type Rows = string[];

const r = (n: number, c = ' ') => c.repeat(n);

// ---- front (facing the viewer) ----
const front: Rows = [
  r(9) + 'aa' + r(9),
  r(9) + 'aa' + r(9),
  r(9) + '##' + r(9),
  r(4) + r(12, '#') + r(4),
  r(3) + '#' + r(12, 'o') + '#' + r(3),
  r(3) + '#o' + r(10, 's') + 'o#' + r(3),
  ' ###o' + 's' + 'gg' + 'ssss' + 'gg' + 's' + 'o### ',
  ' ###o' + 's' + 'gg' + 'ssss' + 'gg' + 's' + 'o### ',
  ' ###o' + r(10, 's') + 'o### ',
  r(3) + '#o' + 'sss' + 'gggg' + 'sss' + 'o#' + r(3),
  r(3) + '#o' + r(10, 's') + 'o#' + r(3),
  r(3) + '#' + r(12, 'o') + '#' + r(3),
  r(4) + r(12, '#') + r(4),
  r(8) + '####' + r(8),
  r(5) + r(10, '#') + r(5),
  r(5) + '#ooo' + 'aa' + 'ooo#' + r(5),
  r(5) + '#' + r(8, 'o') + '#' + r(5),
  r(5) + r(10, '#') + r(5),
];

const feetFront = {
  stand: [r(5) + '###' + r(4) + '###' + r(5), r(5) + '###' + r(4) + '###' + r(5)],
  stepL: [r(5) + '###' + r(4) + '###' + r(5), r(12) + '###' + r(5)],
  stepR: [r(5) + '###' + r(4) + '###' + r(5), r(5) + '###' + r(12)],
};

// ---- back (walking away) ----
const back: Rows = front.map((row, i) => {
  if (i === 5 || i === 10) return r(3) + '#' + r(12, 'o') + '#' + r(3);
  if (i === 6 || i === 8) return ' ###' + r(12, 'o') + '### ';
  if (i === 7) return ' ###oo' + r(8, '#') + 'oo### ';
  if (i === 9) return r(3) + '#oo' + r(8, '#') + 'oo#' + r(3);
  if (i === 15) return r(5) + '#' + r(8, 'o') + '#' + r(5);
  return row;
});

// ---- side (facing right) ----
const side: Rows = [
  r(9) + 'aa' + r(9),
  r(9) + 'aa' + r(9),
  r(9) + '##' + r(9),
  r(5) + r(10, '#') + r(5),
  r(4) + '#' + r(10, 'o') + '#' + r(4),
  r(4) + '#' + r(6, 'o') + 'ssss' + '#' + r(4),
  '  ###' + r(6, 'o') + 'sggs' + '#' + r(4),
  '  ###' + r(6, 'o') + 'sggs' + '#' + r(4),
  '  ###' + r(6, 'o') + 'ssss' + '#' + r(4),
  r(4) + '#' + r(6, 'o') + 'ssgs' + '#' + r(4),
  r(4) + '#' + r(6, 'o') + 'ssss' + '#' + r(4),
  r(4) + '#' + r(10, 'o') + '#' + r(4),
  r(5) + r(10, '#') + r(5),
  r(8) + '###' + r(9),
  r(6) + r(9, '#') + r(5),
  r(6) + '#' + r(5, 'o') + 'a' + 'o' + '#' + r(5),
  r(6) + '#' + r(7, 'o') + '#' + r(5),
  r(6) + r(9, '#') + r(5),
];

const feetSide = {
  stride: [r(5) + '##' + r(6) + '###' + r(4), r(4) + '##' + r(8) + '###' + r(3)],
  pass: [r(7) + '###' + ' ' + '###' + r(6), r(7) + '###' + ' ' + '###' + r(6)],
};

// ---- expressions (front view variants) ----
const withRows = (base: Rows, changes: Record<number, string>): Rows => base.map((row, i) => changes[i] ?? row);

const happy = withRows(front, {
  9: r(3) + '#o' + 'ss' + 'g' + 'ssss' + 'g' + 'ss' + 'o#' + r(3),
  10: r(3) + '#o' + 'sss' + 'gggg' + 'sss' + 'o#' + r(3),
});

const alert = withRows(front, {
  0: r(9) + 'gg' + r(9),
  1: r(9) + 'gg' + r(9),
  8: ' ###o' + 's' + 'gg' + 'ssss' + 'gg' + 's' + 'o### ',
  9: r(3) + '#o' + 'ssss' + 'gg' + 'ssss' + 'o#' + r(3),
});

const asleep = withRows(front, {
  6: ' ###o' + r(10, 's') + 'o### ',
  7: ' ###o' + r(10, 's') + 'o### ',
  8: ' ###o' + 's' + 'gg' + 'ssss' + 'gg' + 's' + 'o### ',
  9: r(3) + '#o' + 'ssss' + 'gg' + 'ssss' + 'o#' + r(3),
});

const zzz = withRows(asleep, {
  0: r(9) + 'aa' + r(5) + 'zzzz',
  1: r(9) + 'aa' + r(7) + 'z' + r(1),
  2: r(9) + '##' + r(6) + 'z' + r(2),
  3: r(4) + r(12, '#') + 'zzzz',
});

const mirror = (rows: Rows): Rows => rows.map((row) => [...row].reverse().join(''));

// ---- charging dock: shown in the header while the robot is out walking ----
export const DOCK: Rows = [
  ...Array.from({ length: 8 }, () => r(GRID)),
  r(6) + r(8, '#') + r(6),
  r(6) + '#' + 'sssggs' + '#' + r(6),
  r(6) + '#' + 'ssggss' + '#' + r(6),
  r(6) + '#' + 'sggggs' + '#' + r(6),
  r(6) + '#' + 'ssggss' + '#' + r(6),
  r(6) + '#' + 'sggsss' + '#' + r(6),
  r(6) + r(8, '#') + r(6),
  r(9) + '##' + r(9),
  r(9) + '##' + r(9),
  r(3) + r(14, '#') + r(3),
  r(3) + '#' + r(12, 'o') + '#' + r(3),
  r(3) + r(14, '#') + r(3),
];

export const FRAMES: Record<string, Rows> = {
  idle: [...front, ...feetFront.stand],
  S1: [...front, ...feetFront.stepL],
  S2: [...front, ...feetFront.stepR],
  N0: [...back, ...feetFront.stand],
  N1: [...back, ...feetFront.stepL],
  N2: [...back, ...feetFront.stepR],
  E0: [...side, ...feetSide.pass],
  E1: [...side, ...feetSide.stride],
  E2: [...side, ...feetSide.pass],
  W0: mirror([...side, ...feetSide.pass]),
  W1: mirror([...side, ...feetSide.stride]),
  W2: mirror([...side, ...feetSide.pass]),
  happy: [...happy, ...feetFront.stand],
  alert: [...alert, ...feetFront.stand],
  sleep1: [...zzz, ...feetFront.stand],
  sleep2: [...asleep, ...feetFront.stand],
};

/** One <path> per colour, built from horizontal runs of pixels. */
export function framePaths(rows: Rows): { fill: string; d: string }[] {
  if (rows.length !== GRID || rows.some((row) => row.length !== GRID)) {
    throw new Error(`robot sprite rows must be ${GRID}×${GRID}: ${rows.map((row) => row.length).join(',')}`);
  }
  const paths = new Map<string, string>();
  rows.forEach((row, y) => {
    let x = 0;
    while (x < GRID) {
      const c = row[x];
      let end = x + 1;
      while (end < GRID && row[end] === c) end++;
      if (c !== ' ') {
        if (!FILL[c]) throw new Error(`unknown sprite colour "${c}"`);
        paths.set(c, (paths.get(c) ?? '') + `M${x} ${y}h${end - x}v1h${x - end}z`);
      }
      x = end;
    }
  });
  return [...paths].map(([c, d]) => ({ fill: FILL[c], d }));
}
