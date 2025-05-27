# Integration Guide

This guide covers how to integrate postcss-logical-polyfill with various build tools, frameworks, and development environments.

## Table of Contents

- [Build Tool Integration](#build-tool-integration)
- [CSS Preprocessor Integration](#css-preprocessor-integration)
- [Framework Integration](#framework-integration)
- [CLI Usage](#cli-usage)
- [Programmatic Usage](#programmatic-usage)
- [Configuration Examples](#configuration-examples)

## Build Tool Integration

### Webpack

#### Basic Setup

```js
// webpack.config.js
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-logical-polyfill')()
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### With Custom Configuration

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-logical-polyfill')({
                    rtl: { selector: '[dir="rtl"]' },
                    ltr: { selector: '[dir="ltr"]' },
                    outputOrder: 'ltr-first'
                  })
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

### Vite

#### Basic Setup

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-logical-polyfill')()
      ]
    }
  }
});
```

#### With Configuration

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-logical-polyfill')({
          outputOrder: 'rtl-first',
          rtl: { selector: '.rtl' },
          ltr: { selector: '.ltr' }
        })
      ]
    }
  }
});
```

### Parcel

Create a `.postcssrc` file in your project root:

```json
{
  "plugins": {
    "postcss-logical-polyfill": {}
  }
}
```

Or with configuration:

```json
{
  "plugins": {
    "postcss-logical-polyfill": {
      "outputOrder": "ltr-first",
      "rtl": { "selector": "[dir=\"rtl\"]" },
      "ltr": { "selector": "[dir=\"ltr\"]" }
    }
  }
}
```

### Rollup

```js
// rollup.config.js
import postcss from 'rollup-plugin-postcss';

export default {
  plugins: [
    postcss({
      plugins: [
        require('postcss-logical-polyfill')()
      ]
    })
  ]
};
```

### Next.js

#### Using PostCSS Config

```js
// postcss.config.js
module.exports = {
  plugins: [
    'postcss-logical-polyfill'
  ]
};
```

#### With Custom Configuration

```js
// postcss.config.js
module.exports = {
  plugins: [
    [
      'postcss-logical-polyfill',
      {
        rtl: { selector: '[dir="rtl"]' },
        ltr: { selector: '[dir="ltr"]' },
        outputOrder: 'ltr-first'
      }
    ]
  ]
};
```

#### Using next.config.js

```js
// next.config.js
module.exports = {
  experimental: {
    // Enable if using CSS-in-JS libraries
    esmExternals: true
  },
  webpack: (config) => {
    // Find the CSS rule
    const cssRule = config.module.rules.find(
      rule => rule.test && rule.test.toString().includes('css')
    );
    
    if (cssRule) {
      // Add postcss-logical-polyfill to PostCSS plugins
      cssRule.use.forEach(use => {
        if (use.loader && use.loader.includes('postcss-loader')) {
          use.options.postcssOptions.plugins.push(
            require('postcss-logical-polyfill')()
          );
        }
      });
    }
    
    return config;
  }
};
```

## CSS Preprocessor Integration

### Sass/SCSS

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
};
```

Example Sass workflow:
```scss
// styles.scss
.component {
  margin-inline: 1rem;
  padding-block: 2rem;
  
  &.variant {
    border-inline-start: 2px solid blue;
  }
}
```

### Less

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
};
```

Example Less workflow:
```less
// styles.less
.component {
  margin-inline: 1rem;
  padding-block: 2rem;
  
  &.variant {
    border-inline-start: 2px solid blue;
  }
}
```

### Stylus

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
};
```

## Framework Integration

### Tailwind CSS

#### Setup for Custom Direction Classes

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-logical-polyfill')({
      ltr: { selector: '.ltr' },
      rtl: { selector: '.rtl' }
    }),
    require('autoprefixer')
  ]
};
```

HTML setup:
```html
<!-- LTR layout -->
<html class="ltr">
  <!-- content -->
</html>

<!-- RTL layout -->
<html class="rtl">
  <!-- content -->
</html>
```

### Bootstrap

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      rtl: { selector: '[dir="rtl"]' },
      ltr: { selector: '[dir="ltr"]' }
    })
  ]
};
```

### Material-UI / MUI

```js
// postcss.config.js (if using CSS files)
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
};
```

For CSS-in-JS with MUI, you might need to process styles at build time or use a different approach.

### Ant Design

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      rtl: { selector: '[dir="rtl"]' },
      ltr: { selector: '[dir="ltr"]' }
    })
  ]
};
```

## CLI Usage

### PostCSS CLI

Install dependencies:
```bash
npm install --save-dev postcss postcss-cli postcss-logical-polyfill
```

Create PostCSS config:
```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
};
```

Run via CLI:
```bash
npx postcss src/styles.css -o dist/styles.css
```

### Package.json Scripts

```json
{
  "scripts": {
    "build:css": "postcss src/**/*.css --dir dist/",
    "watch:css": "postcss src/**/*.css --dir dist/ --watch",
    "build:css:prod": "postcss src/**/*.css --dir dist/ --env production"
  }
}
```

## Programmatic Usage

### Basic Node.js Usage

```js
const postcss = require('postcss');
const logicalPolyfill = require('postcss-logical-polyfill');
const fs = require('fs');

const css = fs.readFileSync('input.css', 'utf8');

postcss([logicalPolyfill()])
  .process(css, { from: 'input.css', to: 'output.css' })
  .then(result => {
    fs.writeFileSync('output.css', result.css);
    if (result.map) {
      fs.writeFileSync('output.css.map', result.map.toString());
    }
  });
```

### With Configuration

```js
const postcss = require('postcss');
const logicalPolyfill = require('postcss-logical-polyfill');

const processor = postcss([
  logicalPolyfill({
    rtl: { selector: '[dir="rtl"]' },
    ltr: { selector: '[dir="ltr"]' },
    outputOrder: 'rtl-first'
  })
]);

// Process CSS
processor.process(cssString, options)
  .then(result => {
    console.log(result.css);
  });
```

### Async/Await

```js
async function processCSS() {
  const result = await postcss([
    logicalPolyfill({
      outputOrder: 'ltr-first'
    })
  ]).process(css, { from: undefined });
  
  return result.css;
}
```

## Configuration Examples

### RTL-Primary Website

```js
// For websites primarily serving RTL languages
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      outputOrder: 'rtl-first',
      rtl: { selector: '[dir="rtl"]' },
      ltr: { selector: '[dir="ltr"]' }
    })
  ]
};
```

### Framework-Specific Selectors

```js
// For custom CSS frameworks
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      rtl: { selector: '.dir-rtl' },
      ltr: { selector: '.dir-ltr' },
      outputOrder: 'ltr-first'
    })
  ]
};
```

### Development vs Production

```js
// postcss.config.js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      outputOrder: isProduction ? 'ltr-first' : 'rtl-first'
    })
  ]
};
```

## Troubleshooting

### Common Issues

1. **Styles not applying**: Ensure your HTML has the correct `dir` attribute
2. **Build errors**: Check that PostCSS is properly configured in your build tool
3. **Conflicting plugins**: Place postcss-logical-polyfill after CSS preprocessors but before optimizers

### Debug Configuration

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      // Add verbose logging in development
      ...(process.env.NODE_ENV === 'development' && { debug: true })
    })
  ]
};
```

### Validation

Test your configuration with a simple CSS file:

```css
/* test.css */
.test {
  margin-inline: 1rem;
  padding-block: 2rem;
}
```

Expected output:
```css
.test {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
```

## Related Documentation

- [Advanced Usage Guide](./ADVANCED-USAGE.md) - Configuration and advanced patterns
- [Examples](../examples/README.md) - Real-world integration examples
- [Supported Properties](./SUPPORTED-PROPERTIES.md) - Complete property reference
