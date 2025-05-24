# postcss-logical-scope

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]
[![License][license-img]][license-url]

A PostCSS plugin that enables scoped directional logical CSS properties by enhancing `postcss-logical` with direction-specific selectors.

## Why?

The [CSS Logical Properties specification](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) provides direction-independent layout controls. However, the `postcss-logical` plugin currently doesn't properly handle direction-specific selectors like `:dir(rtl)` or `[dir="rtl"]`.

This plugin wraps `postcss-logical` to add support for direction scoping, making it work properly in both LTR and RTL contexts.

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
      selector: '[dir="ltr"]'  // Optional, default is none
    }
  })
])
```

### Input

```css
.button {
  padding-inline-start: 1rem;
}

:dir(rtl) .button {
  margin-inline-end: 2rem;
}
```

### Output

```css
.button {
  padding-left: 1rem;
}

[dir="rtl"] .button {
  margin-left: 2rem;
}
```

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
Default: `{}`

Configuration for LTR processing.

#### `ltr.selector`

Type: `String`
Default: `undefined`

The selector to add for LTR rules. By default, no additional selector is added.

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
