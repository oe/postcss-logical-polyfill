import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'postcss-logical-polyfill',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['postcss', 'postcss-logical'],
      output: {
        exports: 'auto'
      }
    },
    sourcemap: true,
    minify: false
  },
  plugins: [
    dts({ include: ['src'] })
  ],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'examples/**',
        'scripts/**',
        '**/*.d.ts',
        '**/*.config.*',
        'test/**',
        '**/node_modules/**'
      ],
      include: ['src/**/*.ts'],
      all: true
    }
  }
});
