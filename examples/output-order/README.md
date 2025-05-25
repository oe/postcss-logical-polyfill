# Output Order Example

This example demonstrates the `outputOrder` configuration option for postcss-logical-polyfill.

## Overview

The `outputOrder` option controls the order in which LTR and RTL rules are generated for **unscoped logical properties** (properties without existing direction selectors).

## Files

- `input.css` - Sample CSS with logical properties
- `process.ts` - Processing script that generates both output variations
- `output-ltr-first.css` - Result with default `outputOrder: 'ltr-first'`
- `output-rtl-first.css` - Result with `outputOrder: 'rtl-first'`

## Key Differences

### Unscoped Properties (Affected by outputOrder)
```css
/* Input */
.container {
  margin-inline: 1rem;
}

/* ltr-first output */
[dir="ltr"] .container { margin-left: 1rem; margin-right: 1rem; }
[dir="rtl"] .container { margin-right: 1rem; margin-left: 1rem; }

/* rtl-first output */
[dir="rtl"] .container { margin-right: 1rem; margin-left: 1rem; }
[dir="ltr"] .container { margin-left: 1rem; margin-right: 1rem; }
```

### Scoped Properties (NOT affected by outputOrder)
```css
/* Input */
:dir(rtl) .header {
  padding-inline-end: 1rem;
}

/* Both outputs (same order) */
[dir="rtl"] .header {
  padding-left: 1rem;
}
```

## When to Use RTL-First

- **RTL-primary websites**: Sites serving primarily RTL languages
- **CSS specificity control**: When you need RTL rules to have lower specificity
- **Framework integration**: When your framework expects RTL-first ordering

## Running the Example

```bash
npm run build
cd examples/output-order
npx tsx process.ts
```

This will generate both output files so you can compare the differences.
