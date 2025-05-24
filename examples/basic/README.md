# Basic Example

This example demonstrates how to use `postcss-logical-scope` with plain CSS files.

## Files

- `input.css` - The source CSS file with logical properties and direction-specific selectors
- `postcss.config.js` - PostCSS configuration that includes the plugin
- `output.css` - The processed CSS file (generated when you run the example)

## Running the Example

From this directory, run:

```bash
npx postcss input.css -o output.css
```

Or from the project root:

```bash
npm run examples
```

## What to Look For

1. Logical properties like `margin-inline` and `padding-inline-start` are converted to physical properties
2. Direction-specific selectors (`:dir(rtl)` and `[dir="rtl"]`) are handled correctly
3. The RTL-specific rules apply the correct transformations to logical properties
