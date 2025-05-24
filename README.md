# postcss-logical-scope

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]
[![License][license-img]][license-url]

A PostCSS plugin that transforms CSS logical properties to physical properties for both LTR and RTL contexts.

## Why?

The [CSS Logical Properties specification](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) provides direction-independent layout controls. While these properties are increasingly supported in modern browsers, you might need to provide fallbacks for older browsers or generate separate stylesheets for different reading directions.

This plugin helps by transforming logical properties to their physical counterparts with appropriate direction selectors, making it easier to support both LTR and RTL layouts.

## Features

- Transforms logical properties to physical properties for both LTR and RTL contexts
- Automatically adds `[dir="ltr"]` and `[dir="rtl"]` selectors to styles containing logical properties
- Respects existing direction-specific selectors (`:dir(rtl)`, `[dir="rtl"]`, etc.)
- Customizable selectors for RTL and LTR transformations

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

This plugin:

1. Finds logical properties in your CSS
2. Creates two versions of each rule - one for LTR and one for RTL
3. Converts logical properties to their physical equivalents based on direction
4. Adds the appropriate direction selectors (`[dir="ltr"]` or `[dir="rtl"]`)
5. Preserves existing direction-specific rules and converts them correctly

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
