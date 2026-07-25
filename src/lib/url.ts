/** Pages are built as `about.html` but served as `/about`; this gives the public path. */
export function cleanPath(pathname: string): string {
  const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');
  return path || '/';
}
