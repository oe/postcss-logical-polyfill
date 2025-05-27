# postcss-logical-polyfill

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Coverage Status][coverage-img]][coverage-url]
[![NPM Downloads][downloads-img]][downloads-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]

A PostCSS plugin that transforms CSS logical properties into physical properties with appropriate direction selectors, enabling backward compatibility for older browsers.

## Quick Start

### Installation

```bash
npm install postcss-logical-polyfill --save-dev
```

### Basic Usage

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
}
```

### Example Transformation

**Input CSS:**
```css
.container {
  margin-inline: 1rem;
  padding-block: 2rem;
  border-inline-start: 2px solid blue;
}
```

**Output CSS:**
```css
.container {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
[dir="ltr"] .container {
  border-left: 2px solid blue;
}
[dir="rtl"] .container {
  border-right: 2px solid blue;
}
```

## Key Features

- **🔄 Polyfill Direction**: Transforms logical properties → physical properties (reverse of most tools)
- **🎯 Smart Generation**: Creates both LTR and RTL versions automatically
- **⚡ Optimized Output**: Block-direction properties generate single rules (no duplication)
- **🔗 Extended Support**: Includes scroll properties and logical values via integrated shim
- **🎛️ Configurable**: Custom selectors and output order control
- **🏗️ Framework Ready**: Works with any build tool or CSS framework

## Why Use This Plugin?

While modern browsers support CSS logical properties, older browsers don't. This plugin acts as a polyfill, converting your modern logical properties to physical properties that work everywhere, while preserving the directional behavior for international layouts.

**Perfect for:**
- ✅ Supporting older browsers while using modern CSS
- ✅ Gradual migration from physical to logical properties  
- ✅ RTL/LTR internationalization
- ✅ Framework integration with directional layouts

## Installation

```bash
# Using npm
npm install postcss-logical-polyfill --save-dev

# Using pnpm
pnpm add -D postcss-logical-polyfill

# Using yarn
yarn add -D postcss-logical-polyfill
```

## What It Does

This plugin transforms **CSS Logical Properties** into physical properties with appropriate direction selectors for browser compatibility. It intelligently processes:

- **All standard logical properties** (margin, padding, border, inset, sizing, etc.)
- **Logical values** (float: inline-start, clear: inline-end, resize: block)
- **Scroll properties** (scroll-margin, scroll-padding)
- **Both scoped and unscoped** logical properties

**➡️ [Complete supported properties list](./docs/SUPPORTED-PROPERTIES.md)**

## Configuration

### Basic Options

```js
const logicalPolyfill = require('postcss-logical-polyfill');

postcss([
  logicalPolyfill({
    // Direction selectors (default shown)
    rtl: { selector: '[dir="rtl"]' },
    ltr: { selector: '[dir="ltr"]' },
    
    // Output order for unscoped properties
    outputOrder: 'ltr-first'  // or 'rtl-first'
  })
])
```

**➡️ [Complete configuration guide](./docs/ADVANCED-USAGE.md)**

## Example Transformation

**Input CSS:**
```css
/* Unscoped logical properties - will generate both LTR and RTL versions */
.container {
  margin-inline: 1rem;
  padding-inline-start: 1rem;
}

/* Block-direction properties - Generate single optimized rule */
.content {
  margin-block: 2rem;
  padding-block-start: 1rem;
}

/* Extended logical properties via shim system */
.scroll-area {
  scroll-margin-inline: 10px;
  float: inline-start;
}
```

**Output CSS:**
```css
.container {
  margin-left: 1rem;
  margin-right: 1rem;
}
[dir="ltr"] .container {
  padding-left: 1rem;
}
[dir="rtl"] .container {
  padding-right: 1rem;
}

/* Block-direction properties - Single optimized rule */
.content {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

/* Extended logical properties transformed */
.scroll-area {
  scroll-margin-left: 10px;
  scroll-margin-right: 10px;
}
[dir="ltr"] .scroll-area {
  float: left;
}
[dir="rtl"] .scroll-area {
  float: right;
}
```

## How It Works

This plugin intelligently processes CSS through a 7-phase optimization pipeline:

1. **🔍 Detection**: Identifies logical properties and existing direction selectors
2. **🎯 Classification**: Separates block-direction, inline-direction, and mixed properties
3. **🔄 Transformation**: Converts logical to physical properties based on direction context
4. **🎯 Selector Application**: Adds appropriate direction selectors when needed
5. **🔧 Optimization**: Merges rules and eliminates redundant declarations
6. **🎯 Smart Priority**: Implements rightmost selector precedence for predictable behavior
7. **✨ Output**: Generates clean, optimized CSS for maximum compatibility

**➡️ [Detailed technical explanation](./docs/HOW-IT-WORKS.md)**

## Getting Started

### Installation

```bash
npm install postcss-logical-polyfill --save-dev
```

### Basic Setup

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
}
```

### Build Tool Integration

**➡️ [Integration guides for Webpack, Vite, Next.js, and more](./docs/INTEGRATION-GUIDE.md)**

## Important Notes

### HTML Direction Attribute Required

You **must** set the `dir` attribute on your HTML for the generated CSS to work:

```html
<html dir="ltr">  <!-- For left-to-right layouts -->
<html dir="rtl">  <!-- For right-to-left layouts -->
```

Without the `dir` attribute, the generated `[dir="ltr"]` and `[dir="rtl"]` selectors won't match.

### Custom Selectors

You can configure custom direction selectors for your framework:

```js
logicalPolyfill({
  ltr: { selector: '.ltr' },
  rtl: { selector: '.rtl' }
})
```

**➡️ [Complete usage guide and best practices](./docs/ADVANCED-USAGE.md)**

## Examples

This package includes ready-to-run examples for different build systems and use cases.

```bash
# View all available examples
ls examples/

# Run specific examples
cd examples/basic && npx tsx process.ts
cd examples/webpack && npx tsx process.ts
cd examples/sass && npx tsx process.ts

# Run all examples at once
pnpm run examples
```

**Available examples:**
- **Basic**: Plain CSS with PostCSS
- **Build Tools**: Webpack integration  
- **Preprocessors**: SASS and LESS integration
- **Configuration**: Output order and selector priority
- **CLI**: PostCSS command-line usage

**➡️ [View all examples](./examples/README.md)**

## Troubleshooting

Having issues? Check our troubleshooting guide for common problems and solutions.

**➡️ [Complete troubleshooting guide](./docs/TROUBLESHOOTING.md)**

## Documentation

- **[Advanced Usage Guide](./docs/ADVANCED-USAGE.md)** - Configuration options, best practices, and advanced features
- **[Supported Properties](./docs/SUPPORTED-PROPERTIES.md)** - Complete reference of all supported logical properties  
- **[How It Works](./docs/HOW-IT-WORKS.md)** - Technical details about the processing pipeline
- **[Integration Guide](./docs/INTEGRATION-GUIDE.md)** - Setup instructions for popular build tools
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Requirements

- Node.js 16.0.0 or later
- PostCSS 8.0.0 or later

## Contributing

Contributions are welcome! Please see our [contributing guidelines](./CONTRIBUTING.md) for details.

## Credits

This plugin wraps and extends [postcss-logical](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical) to provide polyfill functionality.

## License

[MIT](./LICENSE)

[npm-url]: https://www.npmjs.com/package/postcss-logical-polyfill
[npm-img]: https://img.shields.io/npm/v/postcss-logical-polyfill
[build-url]: https://github.com/oe/postcss-logical-polyfill/actions/workflows/ci.yml
[build-img]: https://github.com/oe/postcss-logical-polyfill/actions/workflows/ci.yml/badge.svg
[coverage-url]: https://codecov.io/gh/oe/postcss-logical-polyfill
[coverage-img]: https://codecov.io/gh/oe/postcss-logical-polyfill/branch/main/graph/badge.svg
[downloads-url]: https://www.npmjs.com/package/postcss-logical-polyfill
[downloads-img]: https://img.shields.io/npm/dm/postcss-logical-polyfill
[size-url]: https://packagephobia.com/result?p=postcss-logical-polyfill
[size-img]: https://packagephobia.com/badge?p=postcss-logical-polyfill
[types-url]: https://www.npmjs.com/package/postcss-logical-polyfill
[types-img]: https://img.shields.io/npm/types/postcss-logical-polyfill
