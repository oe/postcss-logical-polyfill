# LESS Example

This example demonstrates how to use `postcss-logical-scope` with LESS preprocessor.

## Files

- `input.less` - The source LESS file with logical properties and direction-specific selectors
- `process.ts` - Script to compile LESS and process with postcss-logical-scope
- `tsconfig.json` - TypeScript configuration for the process script
- `output.css` - The processed CSS file (generated when you run the example)

## Running the Example

From this directory, run:

```bash
npx tsx process.ts
```

Or from the project root:

```bash
npm run examples
```

## What to Look For

1. LESS features like nesting and variables work with logical properties
2. Logical properties are converted to physical properties with the correct direction
3. Direction-specific selectors (`:dir(rtl)` and `[dir="rtl"]`) are handled correctly
4. The RTL-specific rules apply the correct transformations to logical properties
