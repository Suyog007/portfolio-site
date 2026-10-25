// The Metro Map's layout. Edit this file to change the map; posts are placed automatically.
//
// - Each line is a topic: a colour (a spine token from the design system), a letter, the tags
//   that put a post on it, and a route drawn on the 40px grid. Coordinates are grid units: x
//   grows to the right, y downwards. Routes turn only at 90° or 45° (a segment is horizontal,
//   vertical, or moves equally in x and y).
// - A post's lines come from its frontmatter tags, in the order the tags are written; the first
//   matching line is its main topic. A post on two or more lines is an interchange and is placed
//   where those lines cross, so make sure the routes of lines that share posts cross at a grid
//   point.
// - Stops are ordered by date along their line, oldest at the start of the route.
// - `stations` overrides a single post (by its file name without .md): `at` forces the grid
//   position, `label` forces the label side
//   (above, below, left, right, or a corner: ne, nw, se, sw).

export type Side = 'above' | 'below' | 'left' | 'right' | 'ne' | 'nw' | 'se' | 'sw';
export type Point = [number, number];

export interface LineConfig {
  id: string;
  name: string;
  letter: string;
  color: 'navy' | 'oxblood' | 'forest' | 'plum' | 'clay' | 'mustard' | 'bone';
  tags: string[];
  route: Point[];
}

export interface StationOverride {
  at?: Point;
  label?: Side;
}

export interface MetroConfig {
  lines: LineConfig[];
  /** Line for posts whose tags match no line. */
  fallback: string;
  stations: Record<string, StationOverride>;
}

export const metro: MetroConfig = {
  fallback: 'notes',
  lines: [
    {
      id: 'chains',
      name: 'Contracts & chains',
      letter: 'C',
      color: 'navy',
      tags: ['Web3', 'Solidity', 'Move', 'Sui'],
      route: [
        [1, 3],
        [10, 3],
        [13, 6],
        [22, 6],
      ],
    },
    {
      id: 'systems',
      name: 'Backend & systems',
      letter: 'B',
      color: 'forest',
      tags: ['Backend', 'TypeScript', 'Debugging', 'Engineering'],
      route: [
        [7, 1],
        [7, 8],
        [10, 11],
        [21, 11],
      ],
    },
    {
      id: 'security',
      name: 'Security',
      letter: 'S',
      color: 'oxblood',
      tags: ['Cryptography'],
      route: [
        [15, 1],
        [15, 9],
      ],
    },
    {
      id: 'ai',
      name: 'AI & agents',
      letter: 'A',
      color: 'plum',
      tags: ['AI', 'MCP', 'Workflow'],
      route: [
        [2, 9],
        [12, 9],
      ],
    },
    {
      id: 'notes',
      name: 'Notes',
      letter: 'N',
      color: 'clay',
      tags: ['Meta', 'Frontend'],
      route: [
        [18, 2],
        [22, 2],
      ],
    },
  ],
  stations: {},
};
