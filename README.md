# Mi App – React para WordPress

SPA en React 18 + Vite + Tailwind para embeber en una página de WordPress. Sin router; una sola URL.

## Requisitos

- Node 18+

## Desarrollo

```bash
npm install
npm run dev
```

Abre el navegador en la URL que indique Vite. El punto de montaje es `#mi-app-root`.

## Build

```bash
npm run build
```

Genera en la carpeta configurada:

- `mi-app.js` – bundle de la aplicación
- `mi-app.css` – estilos (Tailwind)
- `index.html` – solo para desarrollo local; en WordPress no hace falta copiarlo

La carpeta de salida por defecto es `../js/mi-app`. Para cambiarla:

```bash
VITE_OUTPUT_DIR=../ruta/al/tema/assets/mi-app npm run build
```

O define `.env` con:

```
VITE_OUTPUT_DIR=../ruta/al/tema/assets/mi-app
```

Copia el contenido de esa carpeta al tema de WordPress (o al directorio desde el que encolas los assets).

## GitHub Pages

El repo está configurado para publicar en **GitHub Pages** con **GitHub Actions**:

1. En el repo: **Settings → Pages → Build and deployment**: fuente **GitHub Actions**.
2. Cada push a `main` o `master` (o ejecución manual del workflow) hace un build y despliega en:
   - `https://<usuario>.github.io/<repo>/` (sitio de proyecto).

El workflow (`.github/workflows/deploy.yml`) usa Node 20, hace `npm ci` y `npm run build` con `VITE_BASE=/<repo>/` y `VITE_OUTPUT_DIR=dist`, y sube el resultado a Pages.

Para probar el build de Pages en local:

```bash
VITE_BASE=/fractal-nido/ VITE_OUTPUT_DIR=dist npm run build
npm run preview
```

(Reemplazá `fractal-nido` por el nombre del repo si es distinto.)

## Integración en WordPress

1. Copia `mi-app.js` y `mi-app.css` al tema (por ejemplo `assets/mi-app/`).

2. En la página donde quieras la app, incluye un contenedor y encola los scripts **después** de definir `wpMiApp`:

```php
<div id="mi-app-root"></div>

<script>
window.wpMiApp = {
  apiUrl: '<?php echo esc_url( rest_url() ); ?>',
  nonce: '<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>'
};
</script>
<?php
wp_enqueue_script(
  'mi-app',
  get_template_directory_uri() . '/assets/mi-app/mi-app.js',
  array(),
  filemtime( get_template_directory() . '/assets/mi-app/mi-app.js' ),
  true
);
wp_enqueue_style(
  'mi-app',
  get_template_directory_uri() . '/assets/mi-app/mi-app.css',
  array(),
  filemtime( get_template_directory() . '/assets/mi-app/mi-app.css' )
);
?>
```

3. En tu JavaScript/React usa `window.wpMiApp` (o el helper `getWpConfig()` en `src/wp-config.js`) para llamar a la REST API con `apiUrl` y `nonce`.

## Estructura

```
src/
  components/   # Componentes React
  styles/       # CSS (Tailwind en main.css)
  App.jsx
  main.jsx      # Entry, monta en #mi-app-root
  wp-config.js  # Helpers para window.wpMiApp
```

## Alcance de estilos

Los estilos están bajo la clase `.mi-app` para reducir conflictos con el resto del sitio WordPress.
