# postcss-logical-polyfill Examples

This directory contains examples demonstrating how to use the `postcss-logical-polyfill` plugin in various scenarios.

## Available Examples

- [Basic](./basic) - Simple example with plain CSS
- [LESS](./less) - Integration with LESS preprocessor
- [SASS](./sass) - Integration with SASS preprocessor
- [Webpack](./webpack) - Integration with Webpack build system

## Common Example CSS

The [default.css](./default.css) file contains a comprehensive set of examples showing various ways to use logical properties with direction-specific selectors. You can use this as a reference for different usage patterns.

## Running the Examples

You can run all examples at once from the project root:

```bash
npm run examples:all
```

Or run individual examples by navigating to their directories and following the instructions in their respective README files.

## What Each Example Demonstrates

1. How to configure the plugin for your build system
2. How logical properties are transformed based on direction
3. How direction-specific selectors are handled
4. The interaction between logical properties and direction-specific selectors

## Key Concepts Illustrated

- Using logical properties (`margin-inline`, `padding-block`, etc.)
- Direction-specific styling with `:dir(rtl)` pseudo-class
- Direction-specific styling with `[dir="rtl"]` attribute selector
- Nested selectors with logical properties
- Complex scenarios with both RTL and LTR rules
