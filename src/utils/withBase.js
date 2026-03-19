export function withBase(assetPath = '') {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedPath = String(assetPath).replace(/^\/+/, '');

  if (!normalizedPath) return base;
  if (base.endsWith('/')) return `${base}${normalizedPath}`;
  return `${base}/${normalizedPath}`;
}
