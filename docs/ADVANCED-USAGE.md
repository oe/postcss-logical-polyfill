# Advanced Usage Guide

This guide covers advanced usage patterns, configuration options, and integration strategies for postcss-logical-polyfill.

## Table of Contents

- [Configuration Options](#configuration-options)
- [Working with Direction Selectors](#working-with-direction-selectors)
- [Smart Selector Priority Optimization](#smart-selector-priority-optimization)
- [Output Order Control](#output-order-control)
- [Framework Integration](#framework-integration)
- [Best Practices](#best-practices)

## Configuration Options

### RTL Configuration

Type: `Object`
Default: `{ selector: '[dir="rtl"]' }`

Configuration for RTL processing.

#### `rtl.selector`

Type: `String`
Default: `[dir="rtl"]`

The selector to add for RTL rules. This selector determines how RTL-specific physical properties are scoped in the output CSS.

### LTR Configuration

Type: `Object`
Default: `{ selector: '[dir="ltr"]' }`

Configuration for LTR processing.

#### `ltr.selector`

Type: `String`
Default: `[dir="ltr"]`

The selector to add for LTR rules. This selector determines how LTR-specific physical properties are scoped in the output CSS.

### Output Order Configuration

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

## Working with Direction Selectors

### Understanding Existing Direction Selectors

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

## Smart Selector Priority Optimization

The plugin implements **rightmost priority logic** to ensure predictable CSS behavior when multiple direction selectors exist in a single selector chain. This optimization makes the plugin behavior more intuitive and follows CSS cascade principles.

### How It Works

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

### Examples with Custom Selectors

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

### Benefits

1. **🎯 Predictable Behavior**: No surprises from contradictory direction contexts
2. **🔧 CSS Cascade Compliance**: Follows standard CSS specificity and cascade rules
3. **⚡ Framework Agnostic**: Works with any custom selector pattern
4. **🏗️ Nested Context Safe**: Handles complex nested layouts reliably

### Edge Case Handling

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

## Framework Integration

### Tailwind CSS

Configure for Tailwind CSS's direction classes:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('postcss-logical-polyfill')({
      ltr: { selector: '.ltr' },
      rtl: { selector: '.rtl' }
    })
  ]
}
```

### Other CSS Frameworks

The plugin is framework-agnostic and can be configured to work with any CSS framework that uses direction-based classes or attributes.

## Best Practices

1. **🎯 Start with Logical Properties**: Write your CSS using logical properties, let the plugin handle the polyfill
2. **⚡ Minimize Pre-scoped Rules**: Let the plugin automatically generate direction variants for better maintainability
3. **🔧 Test Both Directions**: Always test your layouts in both LTR and RTL modes
4. **📱 Consider Progressive Enhancement**: Use this plugin to ensure compatibility while keeping logical properties in your source code
5. **🔄 Gradual Migration**: Perfect for teams transitioning from physical to logical properties

### Direction Attribute Requirements

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

## Related Documentation

- [How It Works](./HOW-IT-WORKS.md) - Technical details about the transformation process
- [Supported Properties](./SUPPORTED-PROPERTIES.md) - Complete list of supported logical properties
- [Examples](../examples/README.md) - Real-world usage examples
- [Selector Priority Optimization](../SELECTOR-PRIORITY-OPTIMIZATION.md) - Deep dive into the rightmost priority logic
