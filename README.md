# postcss-logical-scope

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]
[![License][license-img]][license-url]

A PostCSS plugin that transforms CSS logical properties to physical properties for both LTR and RTL contexts with intelligent direction-specific selector handling.

## Why?

The [CSS Logical Properties specification](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) provides direction-independent layout controls. While these properties are increasingly supported in modern browsers, you might need to provide fallbacks for older browsers or generate separate stylesheets for different reading directions.

This plugin helps by transforming logical properties to their physical counterparts with appropriate direction selectors, making it easier to support both LTR and RTL layouts.

## Features

- **🔄 Bidirectional Transformation**: Converts logical properties to physical properties for both LTR and RTL contexts
- **🎯 Smart Selector Handling**: Automatically adds `[dir="ltr"]` and `[dir="rtl"]` selectors to styles containing logical properties
- **📐 Direction-Aware Processing**: Respects and processes existing direction-specific selectors (`:dir(rtl)`, `[dir="rtl"]`, `:dir(ltr)`, `[dir="ltr"]`)
- **⚙️ Customizable Selectors**: Configure custom RTL and LTR selectors to match your project needs
- **🏗️ Nested Rule Support**: Works seamlessly with media queries, at-rules, and nested selectors
- **🔧 Rule Optimization**: Intelligently merges duplicate rules and handles property overrides
- **⚡ Error Resilient**: Graceful fallbacks when transformations encounter issues

## Installation

```bash
# Using npm
npm install postcss-logical-scope --save-dev

# Using pnpm
pnpm add -D postcss-logical-scope

# Using yarn
yarn add -D postcss-logical-scope
```

## Usage

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-scope')()
  ]
}
```

```js
// With options
const logicalScope = require('postcss-logical-scope');

postcss([
  logicalScope({
    rtl: {
      selector: '[dir="rtl"]'  // Default
    },
    ltr: {
      selector: '[dir="ltr"]'  // Default
    }
  })
])
```

### Input

```css
/* Regular styles with logical properties */
.container {
  margin-inline: 1rem;
  padding-inline-start: 1rem;
}

/* Direction-specific styles */
:dir(rtl) .header {
  margin-inline-end: 2rem;
}

[dir="ltr"] .sidebar {
  padding-inline: 1.5rem 1rem;
}
```

### Output

```css
/* LTR physical properties */
[dir="ltr"] .container {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-left: 1rem;
}

/* RTL physical properties */
[dir="rtl"] .container {
  margin-right: 1rem;
  margin-left: 1rem;
  padding-right: 1rem;
}

/* Direction-specific styles converted */
[dir="rtl"] .header {
  margin-left: 2rem;
}

[dir="ltr"] .sidebar {
  padding-left: 1.5rem;
  padding-right: 1rem;
}
```

## How It Works

This plugin intelligently processes your CSS through several steps:

1. **🔍 Detection Phase**: Scans all CSS rules (including nested ones) to identify:
   - Rules containing logical properties (`margin-inline`, `padding-block`, `inset-*`, etc.)
   - Rules with existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, etc.)

2. **🔄 Transformation Phase**: For each qualifying rule:
   - **Logical Properties**: Creates separate LTR and RTL versions using the postcss-logical transformation engine
   - **Direction-Specific Rules**: Processes existing direction selectors and converts their logical properties appropriately
   - **Mixed Rules**: Handles rules that have both logical properties and direction selectors

3. **🎯 Selector Application**: Adds appropriate direction selectors:
   - `[dir="ltr"]` for left-to-right transformations
   - `[dir="rtl"]` for right-to-left transformations  
   - Cleans existing direction selectors to avoid duplication

4. **🔧 Optimization Phase**: 
   - Merges duplicate rules with identical selectors
   - Handles property overrides correctly (later properties override earlier ones)
   - Removes redundant CSS declarations

5. **✨ Output Generation**: Produces clean, optimized CSS with proper direction support

## More Examples

Check out the [examples directory](./examples) for more complex usage examples.

## Options

### `rtl`

Type: `Object`
Default: `{ selector: '[dir="rtl"]' }`

Configuration for RTL processing.

#### `rtl.selector`

Type: `String`
Default: `[dir="rtl"]`

The selector to add for RTL rules.

### `ltr`

Type: `Object`
Default: `{ selector: '[dir="ltr"]' }`

Configuration for LTR processing.

#### `ltr.selector`

Type: `String`
Default: `[dir="ltr"]`

The selector to add for LTR rules.

## Advanced Usage

### Working with Existing Direction Selectors

The plugin intelligently handles existing direction-specific selectors:

```css
/* Input: Mixed logical properties with direction selectors */
.component {
  margin-inline: 1rem; /* Will generate both LTR and RTL versions */
}

:dir(rtl) .component {
  padding-inline-start: 2rem; /* Will only generate RTL version */
}

[dir="ltr"] .component {
  border-inline-end: 1px solid; /* Will only generate LTR version */
}
```

### Custom Direction Selectors

Configure custom selectors for specific frameworks or design systems:

```js
postcss([
  logicalScope({
    ltr: { selector: '.ltr' },      // For frameworks like Tailwind
    rtl: { selector: '.rtl' }       // Custom RTL class
  })
])
```

### Best Practices

1. **🎯 Use Logical Properties Consistently**: Prefer logical properties over physical ones for better internationalization
2. **⚡ Minimize Direction-Specific Rules**: Let the plugin handle most transformations automatically
3. **🔧 Test Both Directions**: Always test your layouts in both LTR and RTL modes
4. **📱 Consider Mobile**: Logical properties work especially well for responsive designs

## Examples

This package includes several examples showing how to integrate with different build systems and preprocessors:

### Basic Usage

A simple example with plain CSS and PostCSS.

```bash
# Run the basic example
cd examples/basic
npx postcss input.css -o output.css
```

### LESS Integration

Example showing how to use with LESS preprocessor.

```bash
# Run the LESS example
cd examples/less
npx tsx process.ts
```

### SASS Integration

Example showing how to use with SASS preprocessor.

```bash
# Run the SASS example
cd examples/sass
npx tsx process.ts
```

### Webpack Integration

Example showing how to integrate with Webpack.

```bash
# Run the Webpack example
cd examples/webpack
npx tsx process.ts
```

### Running All Examples

You can run all examples at once using:

```bash
# Run all examples
npm run examples
```

## Requirements

- Node.js 14.0.0 or later
- PostCSS 8.0.0 or later

## Contributing

Contributions are welcome! Please see our [contributing guidelines](./CONTRIBUTING.md) for details.

## Credits

This plugin wraps and extends [postcss-logical](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical).

## License

[MIT](./LICENSE)

[npm-url]: https://www.npmjs.com/package/postcss-logical-scope
[npm-img]: https://img.shields.io/npm/v/postcss-logical-scope
[build-url]: https://github.com/oe/postcss-logical-scope/actions/workflows/ci.yml
[build-img]: https://github.com/oe/postcss-logical-scope/actions/workflows/ci.yml/badge.svg
[size-url]: https://packagephobia.com/result?p=postcss-logical-scope
[size-img]: https://packagephobia.com/badge?p=postcss-logical-scope
[types-url]: https://www.npmjs.com/package/postcss-logical-scope
[types-img]: https://img.shields.io/npm/types/postcss-logical-scope
[license-url]: LICENSE
[license-img]: https://img.shields.io/npm/l/postcss-logical-scope
