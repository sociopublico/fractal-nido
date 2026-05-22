/**
 * Resuelve rutas a assets estáticos (public/ → carpeta del build).
 *
 * En WordPress (u otra página anidada), definir ANTES de mi-app.js:
 *   window.APP_BASE_URL = 'https://tudominio.com/ruta/a/nido/';
 *
 * Si no está definido, usa import.meta.env.BASE_URL (./ en build WP).
 */
function getAssetBase() {
  if (typeof window !== 'undefined' && window.APP_BASE_URL) {
    return window.APP_BASE_URL;
  }
  return import.meta.env.BASE_URL ?? './';
}

export function withBase(assetPath = '') {
  const base = getAssetBase();
  const normalizedPath = String(assetPath).replace(/^\/+/, '');

  if (!normalizedPath) return base;
  if (base.endsWith('/')) return `${base}${normalizedPath}`;
  return `${base}/${normalizedPath}`;
}

/** Alias por compatibilidad con guías externas */
export const assetUrl = withBase;
