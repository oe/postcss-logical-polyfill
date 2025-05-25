# Webpack Example

This example demonstrates how to use `postcss-logical-polyfill` with Webpack.

## Files

- `src/styles.css` - The source CSS file with logical properties and direction-specific selectors
- `src/index.html` - HTML template with direction toggling functionality
- `src/index.js` - Entry point JavaScript file
- `webpack.config.js` - Webpack configuration with PostCSS and our plugin
- `process.ts` - Script to run webpack build and copy the output
- `tsconfig.json` - TypeScript configuration for the process script

## Running the Example

From this directory, run:

```bash
# Run the webpack build
npx tsx process.ts
```

Or from the project root:

```bash
pnpm run examples
```

## What to Look For

1. Integration with Webpack's build process
2. Logical properties are converted to physical properties with the correct direction
3. Direction-specific selectors (`:dir(rtl)` and `[dir="rtl"]`) are handled correctly
4. The built HTML page allows toggling between LTR and RTL to see the changes in action
