import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Carpeta de salida del build (relativa al proyecto).
 * Para WordPress: apuntar al tema, ej. '../mi-tema/assets/mi-app/'
 */
const OUTPUT_DIR = process.env.VITE_OUTPUT_DIR || '../js/mi-app';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, OUTPUT_DIR),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'mi-app.js',
        chunkFileNames: 'mi-app.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'mi-app.css';
          return 'assets/[name]-[hash][extname]';
        },
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    target: 'es2020',
  },
  base: './',
});
