import { defineConfig } from 'vite';
import logicalPolyfill from '../../src/index';
import postcssPresetEnv from 'postcss-preset-env';

export default defineConfig({
  // root: __dirname,
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        logicalPolyfill(),
        postcssPresetEnv({ stage: 0 })
      ],
      map: { inline: true, annotation: true }
    }
  },
  server: {
    open: true,
    port: 5173
  }
});
