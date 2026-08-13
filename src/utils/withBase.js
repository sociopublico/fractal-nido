/**
 * Resuelve rutas a assets estáticos (public/ → carpeta del build).
 *
 * En WordPress (u otra página anidada), definir ANTES de mi-app.js:
 *   window.APP_BASE_URL = 'https://tudominio.com/ruta/a/nido/';
 *
 * Prioridad:
 * 1. window.APP_BASE_URL (embed WP)
 * 2. En dev: BASE_URL de Vite (public/ en la raíz del server)
 * 3. En build: carpeta de mi-app.js (import.meta.url) → URLs absolutas
 *    que no dependen de la URL de la página WP
 */
function getAssetBase() {
  if (typeof window !== 'undefined' && window.APP_BASE_URL) {
    const configured = String(window.APP_BASE_URL);
    return configured.endsWith('/') ? configured : `${configured}/`;
  }

  // Dev: public/ se sirve desde la raíz del servidor Vite.
  if (import.meta.env.DEV) {
    const base = import.meta.env.BASE_URL ?? '/';
    return base.endsWith('/') ? base : `${base}/`;
  }

  // Build embebido: carpeta del bundle, no la URL del documento.
  try {
    return new URL(/* @vite-ignore */ '.', import.meta.url).href;
  } catch {
    return import.meta.env.BASE_URL ?? './';
  }
}

export function withBase(assetPath = '') {
  const base = getAssetBase();
  const normalizedPath = String(assetPath).replace(/^\/+/, '');

  if (!normalizedPath) return base;

  try {
    // Bases relativas (./ o /) hay que absolutizarlas contra la página.
    const absoluteBase = /^https?:\/\//i.test(base)
      ? base
      : new URL(base, typeof window !== 'undefined' ? window.location.href : 'http://localhost/').href;
    return new URL(normalizedPath, absoluteBase).href;
  } catch {
    if (base.endsWith('/')) return `${base}${normalizedPath}`;
    return `${base}/${normalizedPath}`;
  }
}

/** Alias por compatibilidad con guías externas */
export const assetUrl = withBase;
