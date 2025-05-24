import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'postcss-logical-scope',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['postcss', 'postcss-logical'],
      output: {
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: false
  },
  plugins: [
    dts({ include: ['src'] })
  ]
});
