/**
 * Configuración expuesta por WordPress al embeber la app.
 * El tema/plugin debe definir ANTES de cargar mi-app.js:
 *
 *   window.APP_BASE_URL = 'https://tudominio.com/viz/nido/';
 *   window.wpMiApp = {
 *     apiUrl: 'https://tudominio.com/wp-json',
 *     nonce: '...'  // wp_create_nonce('wp_rest') o similar
 *   };
 *
 * APP_BASE_URL: URL absoluta (con barra final) donde viven header.png,
 * scrolly1/, shapes/, etc. Opcional: si falta, withBase usa la carpeta de
 * mi-app.js (import.meta.url) para armar URLs absolutas.
 *
 * Uso en componentes:
 *   import { getWpConfig } from '../wp-config';
 *   const { apiUrl, nonce } = getWpConfig();
 *   const res = await fetch(apiUrl + '/wp/v2/posts', { headers: { 'X-WP-Nonce': nonce } });
 */

/**
 * @returns {{ apiUrl: string, nonce: string } | undefined }
 */
export function getWpConfig() {
  if (typeof window === 'undefined') return undefined;
  const wp = window.wpMiApp;
  if (!wp?.apiUrl) return undefined;
  return {
    apiUrl: wp.apiUrl.replace(/\/$/, ''),
    nonce: wp.nonce ?? '',
  };
}

/**
 * Headers para fetch contra la REST API de WordPress.
 * @returns {HeadersInit}
 */
export function getWpHeaders() {
  const config = getWpConfig();
  if (!config) return {};
  return {
    'Content-Type': 'application/json',
    'X-WP-Nonce': config.nonce,
  };
}
