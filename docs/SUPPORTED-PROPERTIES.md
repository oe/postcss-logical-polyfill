# Supported Properties Reference

This document provides a comprehensive reference of all CSS logical properties supported by postcss-logical-polyfill, including how they are transformed and categorized.

## Table of Contents

- [Property Categories](#property-categories)
- [Block-Direction Properties](#block-direction-properties)
- [Inline-Direction Properties](#inline-direction-properties)
- [Mixed-Direction Properties](#mixed-direction-properties)
- [Logical Values Support](#logical-values-support)
- [Extended Properties (Shim System)](#extended-properties-shim-system)
- [Experimental Features](#experimental-features)
- [Unsupported Properties](#unsupported-properties)

## Property Categories

The plugin intelligently categorizes logical properties into three main types:

1. **Block-Direction Properties**: Generate single rule without direction selectors
2. **Inline-Direction Properties**: Generate separate LTR and RTL rules
3. **Mixed-Direction Properties**: Affect both dimensions, generate LTR/RTL rules

## Block-Direction Properties

These properties only affect the block dimension (vertical in most writing modes) and generate a single rule without direction selectors, optimizing CSS output size.

### Margin Properties
- `margin-block` → `margin-top` + `margin-bottom`
- `margin-block-start` → `margin-top`
- `margin-block-end` → `margin-bottom`

### Padding Properties
- `padding-block` → `padding-top` + `padding-bottom`
- `padding-block-start` → `padding-top`
- `padding-block-end` → `padding-bottom`

### Border Properties
- `border-block` → `border-top` + `border-bottom`
- `border-block-start` → `border-top`
- `border-block-end` → `border-bottom`
- `border-block-width` → `border-top-width` + `border-bottom-width`
- `border-block-style` → `border-top-style` + `border-bottom-style`
- `border-block-color` → `border-top-color` + `border-bottom-color`
- `border-block-start-width` → `border-top-width`
- `border-block-start-style` → `border-top-style`
- `border-block-start-color` → `border-top-color`
- `border-block-end-width` → `border-bottom-width`
- `border-block-end-style` → `border-bottom-style`
- `border-block-end-color` → `border-bottom-color`

### Inset Properties
- `inset-block` → `top` + `bottom`
- `inset-block-start` → `top`
- `inset-block-end` → `bottom`

### Size Properties
- `block-size` → `height`
- `min-block-size` → `min-height`
- `max-block-size` → `max-height`

### Scroll Properties (⭐ NEW via shim)
- `scroll-margin-block` → `scroll-margin-top` + `scroll-margin-bottom`
- `scroll-margin-block-start` → `scroll-margin-top`
- `scroll-margin-block-end` → `scroll-margin-bottom`
- `scroll-padding-block` → `scroll-padding-top` + `scroll-padding-bottom`
- `scroll-padding-block-start` → `scroll-padding-top`
- `scroll-padding-block-end` → `scroll-padding-bottom`
- `overscroll-behavior-block` → `overscroll-behavior-y`
- `overscroll-behavior-inline` → `overscroll-behavior-x`

## Inline-Direction Properties

These properties affect the inline dimension (horizontal in most writing modes) and generate separate LTR and RTL rules with appropriate direction selectors.

### Margin Properties
- `margin-inline` → LTR: `margin-left` + `margin-right`, RTL: `margin-right` + `margin-left`
- `margin-inline-start` → LTR: `margin-left`, RTL: `margin-right`
- `margin-inline-end` → LTR: `margin-right`, RTL: `margin-left`

### Padding Properties
- `padding-inline` → LTR: `padding-left` + `padding-right`, RTL: `padding-right` + `padding-left`
- `padding-inline-start` → LTR: `padding-left`, RTL: `padding-right`
- `padding-inline-end` → LTR: `padding-right`, RTL: `padding-left`

### Border Properties
- `border-inline` → LTR: `border-left` + `border-right`, RTL: `border-right` + `border-left`
- `border-inline-start` → LTR: `border-left`, RTL: `border-right`
- `border-inline-end` → LTR: `border-right`, RTL: `border-left`
- `border-inline-width` → LTR: `border-left-width` + `border-right-width`, RTL: `border-right-width` + `border-left-width`
- `border-inline-style` → LTR: `border-left-style` + `border-right-style`, RTL: `border-right-style` + `border-left-style`
- `border-inline-color` → LTR: `border-left-color` + `border-right-color`, RTL: `border-right-color` + `border-left-color`
- `border-inline-start-width` → LTR: `border-left-width`, RTL: `border-right-width`
- `border-inline-start-style` → LTR: `border-left-style`, RTL: `border-right-style`
- `border-inline-start-color` → LTR: `border-left-color`, RTL: `border-right-color`
- `border-inline-end-width` → LTR: `border-right-width`, RTL: `border-left-width`
- `border-inline-end-style` → LTR: `border-right-style`, RTL: `border-left-style`
- `border-inline-end-color` → LTR: `border-right-color`, RTL: `border-left-color`

### Inset Properties
- `inset-inline` → LTR: `left` + `right`, RTL: `right` + `left`
- `inset-inline-start` → LTR: `left`, RTL: `right`
- `inset-inline-end` → LTR: `right`, RTL: `left`

### Size Properties
- `inline-size` → `width`
- `min-inline-size` → `min-width`
- `max-inline-size` → `max-width`

### Border Radius Properties
- `border-start-start-radius` → LTR: `border-top-left-radius`, RTL: `border-top-right-radius`
- `border-start-end-radius` → LTR: `border-top-right-radius`, RTL: `border-top-left-radius`
- `border-end-start-radius` → LTR: `border-bottom-left-radius`, RTL: `border-bottom-right-radius`
- `border-end-end-radius` → LTR: `border-bottom-right-radius`, RTL: `border-bottom-left-radius`

### Scroll Properties (⭐ NEW via shim)
- `scroll-margin-inline` → LTR: `scroll-margin-left` + `scroll-margin-right`, RTL: `scroll-margin-right` + `scroll-margin-left`
- `scroll-margin-inline-start` → LTR: `scroll-margin-left`, RTL: `scroll-margin-right`
- `scroll-margin-inline-end` → LTR: `scroll-margin-right`, RTL: `scroll-margin-left`
- `scroll-padding-inline` → LTR: `scroll-padding-left` + `scroll-padding-right`, RTL: `scroll-padding-right` + `scroll-padding-left`
- `scroll-padding-inline-start` → LTR: `scroll-padding-left`, RTL: `scroll-padding-right`
- `scroll-padding-inline-end` → LTR: `scroll-padding-right`, RTL: `scroll-padding-left`

## Mixed-Direction Properties

These properties affect both block and inline dimensions and generate separate LTR and RTL rules.

### Inset Properties
- `inset` → LTR: `top` + `right` + `bottom` + `left`, RTL: `top` + `left` + `bottom` + `right`

## Logical Values Support

The plugin also supports logical values for certain CSS properties (⭐ NEW via shim):

### Float Property
```css
/* Input */
.element { float: inline-start; }

/* LTR Output */
[dir="ltr"] .element { float: left; }

/* RTL Output */
[dir="rtl"] .element { float: right; }
```

```css
/* Input */
.element { float: inline-end; }

/* LTR Output */
[dir="ltr"] .element { float: right; }

/* RTL Output */
[dir="rtl"] .element { float: left; }
```

### Clear Property
```css
/* Input */
.element { clear: inline-start; }

/* LTR Output */
[dir="ltr"] .element { clear: left; }

/* RTL Output */
[dir="rtl"] .element { clear: right; }
```

```css
/* Input */
.element { clear: inline-end; }

/* LTR Output */
[dir="ltr"] .element { clear: right; }

/* RTL Output */
[dir="rtl"] .element { clear: left; }
```

### Resize Property
```css
/* Input */
.element { resize: block; }

/* Output (direction-independent) */
.element { resize: vertical; }
```

```css
/* Input */
.element { resize: inline; }

/* Output (direction-independent) */
.element { resize: horizontal; }
```

### Text Align (Future Support)
Note: `text-align: start/end` logical values are mentioned in the documentation but may require additional configuration.

## Extended Properties (Shim System)

The plugin includes an integrated shim system that extends support for logical properties that weren't originally supported by the core postcss-logical package.

### Scroll Properties

All scroll-related logical properties are now fully supported:

**Block-Direction Scroll Properties:**
- `scroll-margin-block`, `scroll-margin-block-start`, `scroll-margin-block-end`
- `scroll-padding-block`, `scroll-padding-block-start`, `scroll-padding-block-end`

**Inline-Direction Scroll Properties:**
- `scroll-margin-inline`, `scroll-margin-inline-start`, `scroll-margin-inline-end`
- `scroll-padding-inline`, `scroll-padding-inline-start`, `scroll-padding-inline-end`

### Logical Values

Support for logical values in existing CSS properties:
- `float: inline-start/end` → direction-aware `left`/`right`
- `clear: inline-start/end` → direction-aware `left`/`right`
- `resize: block/inline` → `vertical`/`horizontal`

## Experimental Features

The plugin includes experimental support for draft-stage CSS logical properties and features that are not yet widely supported by browsers but are part of the CSS specifications.

### Linear Gradient Logical Directions

Experimental support for logical directions in background(or background-image)  `linear-gradient()` functions:

```css
/* Input */
.element {
  background: linear-gradient(to inline-start, red, blue);
}

/* LTR Output */
[dir="ltr"] .element {
  background: linear-gradient(to left, red, blue);
}

/* RTL Output */
[dir="rtl"] .element {
  background: linear-gradient(to right, red, blue);
}
```

**Supported logical directions:**
- `to inline-start` → direction-aware `to left`/`to right`
- `to inline-end` → direction-aware `to right`/`to left`
- `to block-start` → `to top` (direction-independent)
- `to block-end` → `to bottom` (direction-independent)

```css
/* More examples */
.gradient-examples {
  /* Block directions (direction-independent) */
  background: linear-gradient(to block-start, #fff, #000);
  /* → linear-gradient(to top, #fff, #000) */
  
  /* Inline directions (direction-aware) */
  background: linear-gradient(to inline-end, #fff, #000);
  /* LTR: → linear-gradient(to right, #fff, #000) */
  /* RTL: → linear-gradient(to left, #fff, #000) */
}
```

**Note:** This is an experimental feature. The CSS specification for logical directions in gradients is still in draft stage. Use with caution in production environments.

## Unsupported Properties

The following properties are **NOT** handled by this plugin:

### Physical Properties
- `margin-left`, `margin-right`, `margin-top`, `margin-bottom`
- `padding-left`, `padding-right`, `padding-top`, `padding-bottom`
- `border-left`, `border-right`, `border-top`, `border-bottom`
- All other existing physical CSS properties

### Writing Mode Properties
- `writing-mode`
- `direction`
- `text-orientation`

### Text Direction Properties
- `unicode-bidi` (not modified, though `text-align: start/end` logical values may be supported)

### Grid/Flexbox Logical Properties
Grid and flexbox logical properties may be handled by postcss-logical but are not the primary focus of this plugin.

### Custom Properties
CSS custom properties (variables) are preserved as-is and not transformed.

### Non-CSS Content
JavaScript, HTML, or other file types are not processed.

## Processing Examples

### Block-Only Example
```css
/* Input */
.content {
  margin-block: 2rem;
  padding-block-start: 1rem;
}

/* Output - Single rule without direction selectors */
.content {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 1rem;
}
```

### Inline-Only Example
```css
/* Input */
.container {
  margin-inline: 1rem;
  padding-inline-start: 1rem;
}

/* Output - Separate LTR and RTL rules */
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
```

### Mixed Properties Example
```css
/* Input */
.element {
  inset: 10px;
}

/* Output - LTR and RTL rules for mixed properties */
[dir="ltr"] .element {
  top: 10px;
  right: 10px;
  bottom: 10px;
  left: 10px;
}
[dir="rtl"] .element {
  top: 10px;
  left: 10px;
  bottom: 10px;
  right: 10px;
}
```

## Related Documentation

- [Advanced Usage Guide](./ADVANCED-USAGE.md) - Configuration and advanced patterns
- [How It Works](./HOW-IT-WORKS.md) - Technical details about the transformation process
- [Experimental Features](./EXPERIMENTAL-FEATURES.md) - Draft CSS features and future roadmap
- [Examples](../examples/README.md) - Real-world usage examples
