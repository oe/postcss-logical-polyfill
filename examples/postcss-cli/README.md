# PostCSS CLI Example

This example demonstrates how to use `postcss-logical-polyfill` with the PostCSS CLI and a `postcss.config.js` configuration file.

## Files

- `input.css` - Source CSS file with logical properties
- `postcss.config.js` - PostCSS configuration file that loads the plugin
- `output.css` - Generated CSS after processing (created when you run the example)

## Running the Example

This example uses the shared `postcss-cli` dependency from the project root. Make sure you've installed dependencies from the root directory first:

```bash
# From the project root directory
npm install
```

Then run the example:

### Method 1: Using PostCSS CLI directly

```bash
# From this example directory
npx tsx process.ts
```

### Method 2: From project root

```bash
# From the project root directory
pnpm run examples
```

## What to Look For

1. **Automatic LTR/RTL Generation**: Unscoped logical properties generate both `[dir="ltr"]` and `[dir="rtl"]` versions
2. **Direction-Aware Processing**: Existing direction selectors (`:dir(rtl)`, `[dir="ltr"]`) are processed correctly
3. **Physical Property Conversion**: All logical properties are converted to their physical equivalents
4. **Configuration Usage**: The plugin respects the RTL/LTR selector configuration from `postcss.config.js`

## Expected Output

The plugin will transform logical properties like:
- `margin-inline: 2rem` → `margin-left: 2rem; margin-right: 2rem` (for LTR) and `margin-right: 2rem; margin-left: 2rem` (for RTL)
- `padding-inline-start: 1rem` → `padding-left: 1rem` (for LTR) and `padding-right: 1rem` (for RTL)
- `inset-inline-start: 0` → `left: 0` (for LTR) and `right: 0` (for RTL)
