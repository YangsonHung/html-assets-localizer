import { defineConfig } from 'vite';
import path from 'path';

// Build configuration for generating CJS and ESM bundles for Node usage
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'HtmlAssetsLocalizer',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.esm.js';
          case 'cjs':
            return 'index.cjs.js';
          default:
            return `index.${format}.js`;
        }
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      external: [
        'fs',
        'path',
        'http',
        'https',
        'crypto',
        'os',
        'stream',
        'process',
        'express',
        'open',
        'archiver',
        'jszip',
      ],
      output: {
        globals: {
          fs: 'fs',
          path: 'path',
          http: 'http',
          https: 'https',
          crypto: 'crypto',
          os: 'os',
          stream: 'stream',
          process: 'process',
          express: 'express',
          open: 'open',
          archiver: 'archiver',
          jszip: 'JSZip',
        },
        exports: 'named',
      },
    },
  },
});
