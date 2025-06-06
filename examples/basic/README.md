# Basic Example

This example demonstrates how to use `postcss-logical-polyfill` with plain CSS files.

## Files

- `input.css` - The source CSS file with logical properties and direction-specific selectors
- `postcss.config.js` - PostCSS configuration that includes the plugin
- `output.css` - The processed CSS file (generated when you run the example)

## Running the Example

From this directory, run:

```bash
npx tsx process.ts
```

Or from the project root:

```bash
pnpm run examples
```

## What to Look For

1. **Standard logical properties** like `margin-inline` and `padding-inline-start` are converted to physical properties
2. **Direction-specific selectors** (`:dir(rtl)` and `[dir="rtl"]`) are handled correctly
3. **RTL-specific rules** apply the correct transformations to logical properties
4. **New logical properties** including:
   - `overflow-block` → `overflow-y`
   - `overflow-inline` → `overflow-x`
   - `contain-intrinsic-block-size` → `contain-intrinsic-height`
   - `contain-intrinsic-inline-size` → `contain-intrinsic-width`
