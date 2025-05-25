# postcss-logical-polyfill

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]
[![License][license-img]][license-url]

A PostCSS plugin that provides physical property polyfills for CSS logical properties, enabling backward compatibility for older browsers and environments that don't support logical properties natively.

## Why?

While most modern tools help you **upgrade** from physical properties to logical properties, this plugin does the **opposite** - it transforms logical properties back to physical properties for maximum browser compatibility.

The [CSS Logical Properties specification](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) provides elegant direction-independent layout controls, but older browsers don't support them. This plugin acts as a polyfill, converting your modern logical properties to physical properties with appropriate direction selectors.

**Key Differences from Other Tools:**
- 🔄 **Reverse Direction**: Converts logical properties → physical properties (not the other way around)
- 🎯 **Smart Scoping**: Automatically generates LTR and RTL versions for unscoped logical properties
- 📐 **Direction-Aware**: Respects existing direction selectors and converts accordingly

## Features

- **📱 Logical Property Polyfill**: Converts modern CSS logical properties to physical properties for browser compatibility
- **🎯 Intelligent Direction Handling**: 
  - Unscoped logical properties → Generate both `[dir="ltr"]` and `[dir="rtl"]` versions
  - Scoped logical properties → Convert according to existing direction selectors
- **📐 Direction-Aware Processing**: Respects existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, `:dir(ltr)`, `[dir="ltr"]`)
- **⚙️ Customizable Selectors**: Configure custom RTL and LTR selectors to match your project needs
- **🏗️ Nested Rule Support**: Works seamlessly with media queries, at-rules, and nested selectors
- **🔧 Rule Optimization**: Intelligently merges duplicate rules and handles property overrides
- **⚡ Error Resilient**: Graceful fallbacks when transformations encounter issues
- **🔄 Reverse Transformation**: Unlike other tools that upgrade to logical properties, this downgrades for compatibility

## Installation

```bash
# Using npm
npm install postcss-logical-polyfill --save-dev

# Using pnpm
pnpm add -D postcss-logical-polyfill

# Using yarn
yarn add -D postcss-logical-polyfill
```

## Usage

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')()
  ]
}
```

```js
// With options
const logicalPolyfill = require('postcss-logical-polyfill');

postcss([
  logicalPolyfill({
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
/* Unscoped logical properties - will generate both LTR and RTL versions */
.container {
  margin-inline: 1rem;
  padding-inline-start: 1rem;
}

/* Scoped logical properties - will convert according to existing scope */
:dir(rtl) .header {
  margin-inline-end: 2rem;
}

[dir="ltr"] .sidebar {
  padding-inline: 1.5rem 1rem;
}
```

### Output

```css
/* Generated LTR physical properties */
[dir="ltr"] .container {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-left: 1rem;
}

/* Generated RTL physical properties */
[dir="rtl"] .container {
  margin-right: 1rem;
  margin-left: 1rem;
  padding-right: 1rem;
}

/* Scoped styles converted to physical properties */
[dir="rtl"] .header {
  margin-left: 2rem;
}

[dir="ltr"] .sidebar {
  padding-left: 1.5rem;
  padding-right: 1rem;
}
```

## How It Works

This polyfill plugin intelligently processes your CSS through several steps:

1. **🔍 Detection Phase**: Scans all CSS rules (including nested ones) to identify:
   - Rules containing logical properties (`margin-inline`, `padding-block`, `inset-*`, etc.)
   - Rules with existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, etc.)

2. **🔄 Polyfill Transformation Phase**: For each qualifying rule:
   - **Unscoped Logical Properties**: Creates separate LTR and RTL physical property versions
   - **Scoped Direction Rules**: Converts logical properties according to the existing direction scope
   - **Mixed Rules**: Handles complex scenarios with both logical properties and direction selectors

3. **🎯 Selector Application**: Adds appropriate direction selectors:
   - `[dir="ltr"]` for left-to-right physical properties
   - `[dir="rtl"]` for right-to-left physical properties  
   - Cleans existing direction selectors to avoid duplication

4. **🔧 Optimization Phase**: 
   - Merges duplicate rules with identical selectors
   - Handles property overrides correctly (later properties override earlier ones)
   - Removes redundant CSS declarations

5. **✨ Output Generation**: Produces clean, optimized CSS with physical properties for maximum browser compatibility

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

The selector to add for RTL rules. This selector determines how RTL-specific physical properties are scoped in the output CSS.

### `ltr`

Type: `Object`
Default: `{ selector: '[dir="ltr"]' }`

Configuration for LTR processing.

#### `ltr.selector`

Type: `String`
Default: `[dir="ltr"]`

The selector to add for LTR rules. This selector determines how LTR-specific physical properties are scoped in the output CSS.

## ⚠️ Important Usage Notes

### 1. **Direction Attribute Required in HTML**

When using the default selectors (`[dir="rtl"]` and `[dir="ltr"]`), you **MUST** set the `dir` attribute on your HTML elements, even for LTR layouts:

```html
<!-- ✅ CORRECT: Always specify dir attribute -->
<html dir="ltr">  <!-- For left-to-right layouts -->
<html dir="rtl">  <!-- For right-to-left layouts -->

<!-- ❌ INCORRECT: Missing dir attribute will cause styles not to apply -->
<html>
```

**Why this matters:**
- The plugin generates CSS rules with attribute selectors like `[dir="ltr"]` and `[dir="rtl"]`
- Without the `dir` attribute in your HTML, these selectors won't match and your styles won't apply
- This applies to **both** LTR and RTL layouts - you can't omit `dir="ltr"` for LTR layouts

**Benefits of setting the `dir` attribute:**
- 🎯 **Explicit Direction Declaration**: Makes the text direction intention clear for both browsers and developers
- 🌐 **Accessibility Enhancement**: Screen readers and assistive technologies use `dir` to properly announce content direction
- 🔧 **CSS Selector Targeting**: Enables precise CSS targeting with `[dir="ltr"]` and `[dir="rtl"]` attribute selectors
- 📱 **Framework Compatibility**: Many CSS frameworks and libraries expect and utilize the `dir` attribute
- 🚀 **Future-Proof**: Prepares your HTML for native CSS logical property support when you eventually migrate
- 🔄 **Dynamic Direction Switching**: Allows JavaScript to easily toggle between LTR and RTL by changing a single attribute
- 🌍 **Internationalization Ready**: Essential foundation for proper RTL language support (Arabic, Hebrew, etc.)
- 🐛 **Debugging Made Easy**: Visual indication in DevTools of which direction mode is active

### 2. **Understanding Selector Configuration**

The `selector` options control how the plugin scopes the generated physical properties:

```js
// Default configuration
logicalPolyfill({
  rtl: { selector: '[dir="rtl"]' },  // Targets elements with dir="rtl"
  ltr: { selector: '[dir="ltr"]' }   // Targets elements with dir="ltr"
})

// Custom configuration example
logicalPolyfill({
  rtl: { selector: '.rtl-layout' },  // Targets elements with class="rtl-layout"
  ltr: { selector: '.ltr-layout' }   // Targets elements with class="ltr-layout"
})
```

When you customize selectors, make sure your HTML matches:

```html
<!-- For custom class-based selectors -->
<html class="ltr-layout">  <!-- Matches .ltr-layout selector -->
<html class="rtl-layout">  <!-- Matches .rtl-layout selector -->
```

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
  logicalPolyfill({
    ltr: { selector: '.ltr' },      // For frameworks like Tailwind
    rtl: { selector: '.rtl' }       // Custom RTL class
  })
])
```

### Best Practices

1. **🎯 Start with Logical Properties**: Write your CSS using logical properties, let the plugin handle the polyfill
2. **⚡ Minimize Pre-scoped Rules**: Let the plugin automatically generate direction variants for better maintainability
3. **🔧 Test Both Directions**: Always test your layouts in both LTR and RTL modes
4. **📱 Consider Progressive Enhancement**: Use this plugin to ensure compatibility while keeping logical properties in your source code
5. **🔄 Gradual Migration**: Perfect for teams transitioning from physical to logical properties

## Examples

This package includes several examples showing how to integrate with different build systems and preprocessors:

### Basic Usage

A simple example with plain CSS and PostCSS.

```bash
# Run the basic example
cd examples/basic
npx tsx process.ts
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
pnpm run examples
```

## Requirements

- Node.js 14.0.0 or later
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
[size-url]: https://packagephobia.com/result?p=postcss-logical-polyfill
[size-img]: https://packagephobia.com/badge?p=postcss-logical-polyfill
[types-url]: https://www.npmjs.com/package/postcss-logical-polyfill
[types-img]: https://img.shields.io/npm/types/postcss-logical-polyfill
[license-url]: LICENSE
[license-img]: https://img.shields.io/npm/l/postcss-logical-polyfill
