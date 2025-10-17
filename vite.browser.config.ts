import { defineConfig } from 'vite';
import path from 'path';

// Browser-friendly UMD bundle built from the browser-specific entry point
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/browser/index.ts'),
      name: 'HtmlAssetsLocalizer',
      formats: ['umd'],
      fileName: () => 'index.umd.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    sourcemap: true,
  },
});
