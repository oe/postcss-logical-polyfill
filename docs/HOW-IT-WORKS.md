# How It Works

This document provides technical details about how postcss-logical-polyfill transforms CSS logical properties into physical properties with appropriate direction selectors.

## Table of Contents

- [Overview](#overview)
- [Processing Pipeline](#processing-pipeline)
- [Property Classification System](#property-classification-system)
- [Transformation Logic](#transformation-logic)
- [Selector Management](#selector-management)
- [Optimization Strategies](#optimization-strategies)
- [Shim System Architecture](#shim-system-architecture)

## Overview

postcss-logical-polyfill intelligently processes CSS through several optimized phases to convert modern logical properties into physical properties with appropriate direction selectors for maximum browser compatibility.

The plugin acts as a polyfill, transforming logical properties back to physical properties (the opposite of most modern tools) while maintaining the intent and functionality of the original logical properties.

## Processing Pipeline

The plugin processes your CSS through the following optimized steps:

### 1. 🔍 Detection Phase

Scans all CSS rules (including nested ones) to identify:
- Rules containing logical properties (`margin-inline`, `padding-block`, `inset-*`, etc.)
- Rules with existing direction selectors (`:dir(rtl)`, `[dir="rtl"]`, etc.)
- **NEW**: Distinguishes between block-direction and inline-direction properties

### 2. 🎯 Smart Property Classification

**Block-Direction Properties**: `margin-block`, `padding-block-start`, `inset-block`, etc.
- Generate single rules without direction selectors (same in LTR and RTL)
- Reduces CSS output size and eliminates duplicate rules

**Inline-Direction Properties**: `margin-inline`, `padding-inline-start`, `inset-inline`, etc.
- Generate separate LTR and RTL rules (different values per direction)

**Mixed Properties**: `inset` (affects all four directions)
- Generate LTR and RTL rules like inline properties

### 3. 🔄 Polyfill Transformation Phase

For each qualifying rule:
- **Block-Only Rules**: Convert directly to physical properties without direction selectors
- **Inline/Mixed Rules**: Create separate LTR and RTL physical property versions
- **Scoped Direction Rules**: Convert logical properties according to the existing direction scope
- **Complex Rules**: Handle scenarios with both block and inline properties intelligently

### 4. 🎯 Selector Application

Adds appropriate direction selectors when needed:
- No selectors for block-only properties (optimization)
- `[dir="ltr"]` for left-to-right physical properties
- `[dir="rtl"]` for right-to-left physical properties  
- Cleans existing direction selectors to avoid duplication

### 5. 🔧 Optimization Phase

- Merges duplicate rules with identical selectors
- Handles property overrides correctly (later properties override earlier ones)
- Removes redundant CSS declarations
- **NEW**: Eliminates unnecessary direction-specific rules for block properties

### 6. 🎯 Smart Selector Priority

**NEW!** Advanced rightmost priority optimization for predictable CSS behavior:
- When multiple direction selectors exist in a selector chain, the rightmost (most specific) takes precedence
- Prevents unexpected behavior from contradictory direction contexts
- Follows CSS cascade principles for intuitive and predictable results
- Works seamlessly with both built-in and custom direction selectors

### 7. ✨ Output Generation

Produces clean, optimized CSS with physical properties for maximum browser compatibility.

## Property Classification System

The plugin uses intelligent rule-based logic to classify logical properties:

### Block-Direction Detection
Properties are classified as block-direction if they:
- Contain the word "block" (e.g., `margin-block`, `padding-block-start`)
- Are block-specific sizing properties (`block-size`, `min-block-size`, `max-block-size`)
- Are block-specific positioning properties (`inset-block`, `inset-block-start`)

### Inline-Direction Detection
Properties are classified as inline-direction if they:
- Contain the word "inline" (e.g., `margin-inline`, `padding-inline-start`)
- Are inline-specific sizing properties (`inline-size`, `min-inline-size`, `max-inline-size`)
- Are inline-specific positioning properties (`inset-inline`, `inset-inline-start`)
- Are border radius logical properties (`border-start-start-radius`, etc.)

### Mixed-Direction Detection
Properties are classified as mixed-direction if they:
- Affect all four directions (e.g., `inset`)
- Cannot be categorized as purely block or inline

### Shim-Extended Properties
Additional properties supported via the integrated shim system:
- Scroll properties (`scroll-margin-*`, `scroll-padding-*`)
- Logical values (`float: inline-start/end`, `clear: inline-start/end`, `resize: block/inline`)

## Transformation Logic

### Block-Direction Transformation
```css
/* Input */
.element {
  margin-block: 1rem;
  padding-block-start: 2rem;
}

/* Processing */
// Detected as block-only properties
// No direction selectors needed
// Direct transformation to physical properties

/* Output */
.element {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-top: 2rem;
}
```

### Inline-Direction Transformation
```css
/* Input */
.element {
  margin-inline: 1rem;
  padding-inline-start: 2rem;
}

/* Processing */
// Detected as inline properties
// Requires direction-specific rules
// LTR: start=left, end=right
// RTL: start=right, end=left

/* Output */
.element {
  margin-left: 1rem;
  margin-right: 1rem;
}
[dir="ltr"] .element {
  padding-left: 2rem;
}
[dir="rtl"] .element {
  padding-right: 2rem;
}
```

### Mixed Property Transformation
```css
/* Input */
.element {
  inset: 10px;
}

/* Processing */
// Affects all four directions
// Requires LTR/RTL variants
// Order matters in LTR vs RTL

/* Output */
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

## Selector Management

### Direction Selector Detection
The plugin recognizes various direction selector patterns:
- `:dir(rtl)`, `:dir(ltr)` - CSS4 pseudo-classes
- `[dir="rtl"]`, `[dir="ltr"]` - Attribute selectors
- Custom selectors (configurable)

### Rightmost Priority Logic
When multiple direction selectors exist in a selector chain:

```css
/* Input */
.app[dir="ltr"] .section:dir(rtl) .content {
  margin-inline-start: 1rem;
}

/* Analysis */
// Multiple direction contexts: [dir="ltr"] and :dir(rtl)
// Rightmost selector: :dir(rtl)
// Applied direction: RTL

/* Output */
.app[dir="ltr"] .section:dir(rtl) .content {
  margin-right: 1rem;  /* RTL direction applied */
}
```

### Selector Normalization
The plugin normalizes different selector formats:
- `:dir(rtl)` → `[dir="rtl"]` (configurable)
- `:dir(ltr)` → `[dir="ltr"]` (configurable)
- Maintains original selector structure while adding direction context

## Optimization Strategies

### Rule Consolidation
The plugin intelligently consolidates rules to minimize CSS output:

```css
/* Before optimization */
[dir="ltr"] .element {
  margin-left: 1rem;
}
[dir="ltr"] .element {
  padding-left: 2rem;
}

/* After optimization */
[dir="ltr"] .element {
  margin-left: 1rem;
  padding-left: 2rem;
}
```

### Block-Direction Optimization
Block-direction properties don't require direction selectors:

```css
/* Unoptimized approach */
[dir="ltr"] .element {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
[dir="rtl"] .element {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

/* Optimized output */
.element {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
```

### Property Override Handling
Later properties correctly override earlier ones within the same rule:

```css
/* Input */
.element {
  margin-inline: 1rem;
  margin-inline-start: 2rem; /* Override */
}

/* Output */
.element {
  margin-left: 1rem;
  margin-right: 1rem;
}
[dir="ltr"] .element {
  margin-left: 2rem; /* Overrides previous margin-left */
}
[dir="rtl"] .element {
  margin-right: 2rem; /* Overrides previous margin-right */
}
```

## Shim System Architecture

The plugin includes an integrated shim system that extends support for logical properties not originally handled by postcss-logical.

### Shim Integration
- **Minimal Impact**: Extends existing functionality without replacing core logic
- **Type Safe**: Full TypeScript support with proper type definitions
- **Extensible**: Easy to add new logical property support
- **Zero Configuration**: Works automatically alongside core logical properties

### Shim Processors
The shim system includes specialized processors for:

1. **Scroll Margin Properties**: `scroll-margin-inline-*`, `scroll-margin-block-*`
2. **Scroll Padding Properties**: `scroll-padding-inline-*`, `scroll-padding-block-*`
3. **Float Logical Values**: `float: inline-start/end`
4. **Clear Logical Values**: `clear: inline-start/end`
5. **Resize Logical Values**: `resize: block/inline`

### Shim Transformation Examples

**Scroll Properties:**
```css
/* Input */
.scroll-area {
  scroll-margin-inline: 10px;
  scroll-padding-block-start: 5px;
}

/* Output */
.scroll-area {
  scroll-margin-left: 10px;
  scroll-margin-right: 10px;
  scroll-padding-top: 5px;
}
```

**Logical Values:**
```css
/* Input */
.floating {
  float: inline-start;
  clear: inline-end;
  resize: block;
}

/* Output */
.floating {
  resize: vertical;
}
[dir="ltr"] .floating {
  float: left;
  clear: right;
}
[dir="rtl"] .floating {
  float: right;
  clear: left;
}
```

## Error Handling

The plugin includes robust error handling:

### Graceful Degradation
- If postcss-logical transformation fails, properties are preserved as-is
- Malformed CSS is handled gracefully without breaking the build
- Unknown logical properties are left unchanged

### Validation
- Property values are validated before transformation
- Invalid selector patterns are detected and reported
- Configuration errors provide helpful error messages

## Performance Considerations

### Efficient Processing
- Rule-based property detection (no hardcoded lists)
- Single-pass processing where possible
- Optimized rule consolidation algorithms

### Memory Management
- Minimal memory footprint during processing
- Efficient data structures for rule tracking
- Clean garbage collection of temporary objects

### Output Optimization
- Eliminates duplicate rules automatically
- Minimizes selector repetition
- Reduces CSS file size through intelligent property grouping

## Integration with PostCSS

The plugin integrates seamlessly with the PostCSS ecosystem:

### Plugin Architecture
- Standard PostCSS plugin interface
- Compatible with other PostCSS plugins
- Proper AST manipulation without side effects

### Build Tool Support
- Works with all PostCSS-compatible build tools
- Webpack, Vite, Parcel, Rollup, etc.
- CLI tools and Node.js APIs

## Related Documentation

- [Advanced Usage Guide](./ADVANCED-USAGE.md) - Configuration and advanced patterns
- [Supported Properties](./SUPPORTED-PROPERTIES.md) - Complete property reference
- [Selector Priority Optimization](../SELECTOR-PRIORITY-OPTIMIZATION.md) - Deep dive into rightmost priority logic
