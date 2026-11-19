/**
 * Base path the site is served under (e.g. "/bun-patty" on GitHub Pages, "" locally).
 * Set at build time via PAGES_BASE_PATH in next.config.ts.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix an absolute public-asset path ("/images/...") with the base path. */
export function asset(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  if (BASE_PATH && path.startsWith(BASE_PATH + '/')) return path;
  return BASE_PATH + path;
}
