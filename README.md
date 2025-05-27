# postcss-logical-polyfill

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Coverage Status][coverage-img]][coverage-url]
[![NPM Downloads][downloads-img]][downloads-url]
[![Types][types-img]][types-url]
[![Package Size][size-img]][size-url]

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
- **⚡ Block-Direction Optimization**: Smart property classification for optimal output
  - Block-only properties → Generate single rule without direction selectors
  - Inline properties → Generate separate LTR/RTL rules as needed
  - Significantly reduces CSS output size and eliminates duplicate rules
- **🔗 Extended Logical Property Support**: ⭐ **NEW!** Integrated shim system for comprehensive logical property coverage
  - **Scroll properties**: `scroll-margin-*`, `scroll-padding-*` (all variants)
  - **Logical values**: `float: inline-start/end`, `clear: inline-start/end`, `resize: block/inline`
  - **Seamless integration**: Works alongside core logical properties with zero configuration
  - **Future-proof**: Extensible architecture for adding more logical property support
- **🔄 Output Order Control**: Configure the generation order of LTR and RTL rules
  - `outputOrder: 'ltr-first'` (default) for standard layouts
  - `outputOrder: 'rtl-first'` for RTL-primary sites and specificity control
  - Crucial for CSS cascade behavior and framework integration
- **📐 Direction-Aware Processing**: Respects existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, `:dir(ltr)`, `[dir="ltr"]`)
- **⚙️ Customizable Selectors**: Configure custom RTL and LTR selectors to match your project needs
- **🎯 Smart Selector Priority**: **NEW!** Advanced rightmost priority optimization for predictable CSS behavior
  - When multiple direction selectors exist in a selector chain, the rightmost (most specific) takes precedence
  - Prevents unexpected behavior from contradictory direction contexts
  - Follows CSS cascade principles for intuitive and predictable results
  - Works seamlessly with both built-in and custom direction selectors
- **🏗️ Nested Rule Support**: Works seamlessly with media queries, at-rules, and nested selectors
- **🔧 Rule Optimization**: Intelligently merges duplicate rules and handles property overrides
- **⚡ Error Resilient**: Graceful fallbacks when transformations encounter issues with enhanced test coverage
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

## Processing Scope

This plugin processes **CSS Logical Properties** and transforms them into physical properties with appropriate direction selectors. Here's exactly what it handles:

### ✅ Supported Logical Properties

The plugin processes all standard [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) and intelligently categorizes them. **⭐ NEW**: Extended support via integrated shim system for previously unsupported features.

**Block-Direction Properties** (generate single rule without direction selectors):
- Properties containing `block` (e.g., `margin-block`, `padding-block-start`, `border-block-width`)
- Block sizing properties (`block-size`, `min-block-size`, `max-block-size`)
- Block scroll properties (`scroll-margin-block`, `scroll-padding-block`) ⭐ **NEW via shim**

**Inline-Direction Properties** (generate separate LTR and RTL rules):
- Properties containing `inline` (e.g., `margin-inline`, `padding-inline-start`, `border-inline-color`)
- Inline sizing properties (`inline-size`, `min-inline-size`, `max-inline-size`)
- Inline scroll properties (`scroll-margin-inline`, `scroll-padding-inline`) ⭐ **NEW via shim**
- Border radius logical properties (`border-start-start-radius`, `border-end-start-radius`, etc.)

**Mixed-Direction Properties** (affect both dimensions, generate LTR/RTL rules):
- `inset` (shorthand affecting all four directions)

**Logical Values Support** ⭐ **NEW via shim**:
- `float: inline-start/end` → direction-aware `left`/`right`
- `clear: inline-start/end` → direction-aware `left`/`right`
- `resize: block/inline` → `vertical`/`horizontal`

### ⚠️ What This Plugin Does NOT Handle

- **Physical Properties**: Regular CSS properties like `margin-left`, `padding-top`, `border-right` are left unchanged
- **Writing Mode Properties**: `writing-mode`, `direction`, `text-orientation` are not processed
- **Some Text Direction Properties**: `unicode-bidi` are not modified (though `text-align: start/end` logical values are supported)
- **Grid/Flexbox Logical Properties**: Grid and flexbox logical properties may be handled by postcss-logical but are not the primary focus
- **Custom Properties**: CSS custom properties (variables) are preserved as-is
- **Non-CSS Content**: JavaScript, HTML, or other file types

**⭐ Previously Unsupported but Now Supported via Shim**:
- ~~Scroll logical properties~~ → **Now fully supported** (`scroll-margin-*`, `scroll-padding-*`)
- ~~Float/clear logical values~~ → **Now fully supported** (`float: inline-start/end`, `clear: inline-start/end`)
- ~~Resize logical values~~ → **Now fully supported** (`resize: block/inline`)

### 🎯 Processing Behavior

**Unscoped Logical Properties** → Generate both LTR and RTL versions:
```css
/* Input */
.element { margin-inline: 1rem; padding-inline: 1em 2em; }

/* Output */
.element { margin-left: 1rem; margin-right: 1rem; }
[dir="ltr"] .element { padding-left: 1rem; padding-right: 2rem; }
[dir="rtl"] .element { padding-right: 2rem; padding-left: 1rem; }
```

**Block-Only Properties** → Generate single rule (⭐ NEW optimization):
```css
/* Input */
.element { margin-block: 1rem; }

/* Output */
.element { margin-top: 1rem; margin-bottom: 1rem; }
```

**Scoped Logical Properties** → Convert according to existing scope:
```css
/* Input */
[dir="rtl"] .element { margin-inline-start: 1rem; }

/* Output */
[dir="rtl"] .element { margin-right: 1rem; }
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

/* Block-direction properties - Generate single optimized rule */
.content {
  margin-block: 2rem;
  padding-block-start: 1rem;
}

/* ⭐ NEW: Extended logical properties via shim system */
.scroll-area {
  scroll-margin-inline: 10px;
  scroll-padding-block: 5px;
}

.floating-element {
  float: inline-start;
  clear: inline-end;
  resize: block;
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
.container {
  margin-left: 1rem;
  margin-right: 1rem;
}
/* Generated LTR physical properties */
[dir="ltr"] .container {
  padding-left: 1rem;
}

/* Generated RTL physical properties */
[dir="rtl"] .container {
  padding-right: 1rem;
}

/* Block-direction properties - Single optimized rule without direction selectors */
.content {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

/* ⭐ NEW: Extended logical properties transformed via shim system */
.scroll-area {
  scroll-margin-left: 10px;
  scroll-margin-right: 10px;
  scroll-padding-top: 5px;
  scroll-padding-bottom: 5px;
}

.floating-element {
  resize: vertical;
}
[dir="ltr"] .floating-element {
  float: left;
  clear: right;
}
[dir="rtl"] .floating-element {
  float: right;
  clear: left;
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

This polyfill plugin intelligently processes your CSS through several optimized steps:

1. **🔍 Detection Phase**: Scans all CSS rules (including nested ones) to identify:
   - Rules containing logical properties (`margin-inline`, `padding-block`, `inset-*`, etc.)
   - Rules with existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, etc.)
   - **NEW**: Distinguishes between block-direction and inline-direction properties

2. **🎯 Smart Property Classification** (⭐ NEW optimization):
   - **Block-Direction Properties**: `margin-block`, `padding-block-start`, `inset-block`, etc.
     - Generate single rules without direction selectors (same in LTR and RTL)
     - Reduces CSS output size and eliminates duplicate rules
   - **Inline-Direction Properties**: `margin-inline`, `padding-inline-start`, `inset-inline`, etc.
     - Generate separate LTR and RTL rules (different values per direction)
   - **Mixed Properties**: `inset` (affects all four directions)
     - Generate LTR and RTL rules like inline properties

3. **🔄 Polyfill Transformation Phase**: For each qualifying rule:
   - **Block-Only Rules**: Convert directly to physical properties without direction selectors
   - **Inline/Mixed Rules**: Create separate LTR and RTL physical property versions
   - **Scoped Direction Rules**: Convert logical properties according to the existing direction scope
   - **Complex Rules**: Handle scenarios with both block and inline properties intelligently

4. **🎯 Selector Application**: Adds appropriate direction selectors when needed:
   - No selectors for block-only properties (optimization)
   - `[dir="ltr"]` for left-to-right physical properties
   - `[dir="rtl"]` for right-to-left physical properties  
   - Cleans existing direction selectors to avoid duplication

5. **🔧 Optimization Phase**: 
   - Merges duplicate rules with identical selectors
   - Handles property overrides correctly (later properties override earlier ones)
   - Removes redundant CSS declarations
   - **NEW**: Eliminates unnecessary direction-specific rules for block properties

6. **🎯 Smart Selector Priority**: **NEW!** Advanced rightmost priority optimization for predictable CSS behavior
   - When multiple direction selectors exist in a selector chain, the rightmost (most specific) takes precedence
   - Prevents unexpected behavior from contradictory direction contexts
   - Follows CSS cascade principles for intuitive and predictable results
   - Works seamlessly with both built-in and custom direction selectors

7. **✨ Output Generation**: Produces clean, optimized CSS with physical properties for maximum browser compatibility

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

### `outputOrder`

Type: `'ltr-first' | 'rtl-first'`
Default: `'ltr-first'`

Controls the output order of generated rules for unscoped logical properties. This only affects rules that don't already have direction selectors (`:dir()` or `[dir=""]`).

- **`'ltr-first'` (default)**: Outputs LTR rules first, then RTL rules
- **`'rtl-first'`**: Outputs RTL rules first, then LTR rules

**Usage example:**

```js
// Default behavior - LTR rules come first
logicalPolyfill({
  outputOrder: 'ltr-first'  // Default
})

// RTL-first output - useful for RTL-primary sites
logicalPolyfill({
  outputOrder: 'rtl-first'
})
```

**Input:**
```css
.button {
  margin-inline: 1rem 2em;
}
```

**Output with `outputOrder: 'ltr-first'` (default):**
```css
[dir="ltr"] .button {
  margin-left: 1rem;
  margin-right: 2rem;
}
[dir="rtl"] .button {
  margin-right: 1rem;
  margin-left: 2rem;
}
```

**Output with `outputOrder: 'rtl-first'`:**
```css
[dir="rtl"] .button {
  margin-right: 1rem;
  margin-left: 2rem;
}
[dir="ltr"] .button {
  margin-left: 1rem;
  margin-right: 2rem;
}
```

**When to use `rtl-first`:**
- 🌍 **RTL-primary websites**: Sites primarily serving RTL languages (Arabic, Hebrew, etc.)
- 🎯 **CSS specificity needs**: When you need RTL rules to have lower specificity for easier LTR overrides
- 📱 **Framework integration**: When your CSS framework expects RTL rules to come first

**Important note:** This option only affects unscoped logical properties. Rules that already have direction selectors (like `:dir(rtl) .element` or `[dir="ltr"] .element`) maintain their original order and are not affected by this setting.

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

### Smart Selector Priority Optimization

The plugin implements **rightmost priority logic** to ensure predictable CSS behavior when multiple direction selectors exist in a single selector chain. This optimization makes the plugin behavior more intuitive and follows CSS cascade principles.

#### How It Works

When the plugin encounters selectors with multiple direction indicators, it prioritizes the **rightmost** (most specific) direction selector:

```css
/* Input: Complex selector with multiple direction contexts */
.app[dir="ltr"] .section:dir(rtl) .content {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
}

/* Output: Rightmost :dir(rtl) takes precedence */
.app[dir="ltr"] .section:dir(rtl) .content {
  margin-right: 1rem;    /* RTL direction applied */
  padding-left: 2rem;    /* RTL direction applied */
}
```

#### Examples with Custom Selectors

The optimization works seamlessly with custom direction selectors:

```js
// Configuration
logicalPolyfill({
  ltr: { selector: '.theme-ltr' },
  rtl: { selector: '.theme-rtl' }
})
```

```css
/* Input: Mixed built-in and custom selectors */
:dir(rtl) .container .theme-ltr .component {
  border-inline-start: 2px solid;
}

/* Output: Rightmost .theme-ltr takes precedence */
:dir(rtl) .container .theme-ltr .component {
  border-left: 2px solid;    /* LTR direction applied */
}
```

#### Benefits

1. **🎯 Predictable Behavior**: No surprises from contradictory direction contexts
2. **🔧 CSS Cascade Compliance**: Follows standard CSS specificity and cascade rules
3. **⚡ Framework Agnostic**: Works with any custom selector pattern
4. **🏗️ Nested Context Safe**: Handles complex nested layouts reliably

#### Edge Case Handling

The plugin gracefully handles edge cases while maintaining predictable behavior:

```css
/* Multiple same-direction selectors */
.theme[dir="ltr"] .section[dir="ltr"] .item {
  margin-inline: 1rem;  /* LTR applied consistently */
}

/* Contradictory selectors - rightmost wins */
[dir="ltr"] .parent [dir="rtl"] .child [dir="ltr"] .final {
  padding-inline-start: 2rem;  /* Final [dir="ltr"] determines direction */
}
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

### Output Order Configuration

Example demonstrating the `outputOrder` configuration option for controlling LTR/RTL rule generation order.

```bash
# Run the output order example
cd examples/output-order
npx tsx process.ts
```

This example shows:
- How `outputOrder: 'ltr-first'` (default) generates LTR rules before RTL rules
- How `outputOrder: 'rtl-first'` generates RTL rules before LTR rules
- That only unscoped logical properties are affected by this setting
- Side-by-side comparison of both output styles

### Smart Selector Priority Optimization

Example demonstrating the **rightmost priority logic** that makes CSS behavior more predictable with complex direction selectors.

```bash
# Run the selector priority example
cd examples/selector-priority
npx tsx process.ts
```

This example shows:
- How rightmost direction selectors take precedence in selector chains
- Mixed built-in (`:dir()`, `[dir]`) and custom selector handling
- Complex nested scenarios with predictable results
- Edge case management for contradictory direction contexts
- Framework-agnostic custom selector pattern support

### PostCSS CLI Integration

Example showing how to use with PostCSS CLI tool.

```bash
# Run the PostCSS CLI example
cd examples/postcss-cli
npx tsx process.ts
```

This example demonstrates:
- Setting up PostCSS configuration with the plugin
- Using PostCSS CLI to process CSS files
- Integration with package.json scripts
- Command-line usage patterns

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

- Node.js 16.0.0 or later
- PostCSS 8.0.0 or later

## Contributing

Contributions are welcome! Please see our [contributing guidelines](./CONTRIBUTING.md) for details.

For information about the coverage badge setup, see [coverage badge documentation](./docs/coverage-badge-setup.md).

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
