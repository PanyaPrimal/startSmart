// Normalize an href/src against Astro's BASE_URL so the site works on GitHub Pages
// at a subpath like /startSmart/. External URLs, mailto:, tel:, and pure fragments
// are passed through unchanged.
export function url(path: string | undefined): string {
  if (!path) return path ?? '';
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) return path;

  const base = import.meta.env.BASE_URL; // e.g. '/startSmart/'
  const baseNoTrail = base.endsWith('/') ? base.slice(0, -1) : base;

  // Split off hash/query so we only touch the path portion
  const hashIdx = path.indexOf('#');
  const queryIdx = path.indexOf('?');
  const splitIdx = [hashIdx, queryIdx].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
  const pathPart = splitIdx >= 0 ? path.slice(0, splitIdx) : path;
  const rest = splitIdx >= 0 ? path.slice(splitIdx) : '';

  const normalized = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  // Special case: bare "/" should resolve to base itself
  if (normalized === '/') return base + rest.replace(/^\//, '');
  return baseNoTrail + normalized + rest;
}
