# postcss-logical-polyfill Examples

This directory contains examples demonstrating how to use the `postcss-logical-polyfill` plugin in various scenarios.

## Available Examples

- [Basic](./basic) - Simple example with plain CSS
- [LESS](./less) - Integration with LESS preprocessor
- [SASS](./sass) - Integration with SASS preprocessor
- [Output Order](./output-order) - Demonstrates `outputOrder` configuration for controlling LTR/RTL rule generation order
- [Selector Priority](./selector-priority) - **NEW!** Demonstrates smart rightmost priority optimization for predictable CSS behavior
- [PostCSS CLI](./postcss-cli) - Integration with PostCSS CLI tool and configuration
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

1. **Basic**: How to configure the plugin for your build system
2. **LESS**: How logical properties are transformed in LESS preprocessor workflows
3. **SASS**: How logical properties are transformed in SASS preprocessor workflows
4. **Output Order**: How to control the generation order of LTR and RTL rules using the `outputOrder` configuration
5. **Selector Priority**: How rightmost priority optimization makes CSS behavior predictable with complex direction selectors
6. **PostCSS CLI**: How to use the plugin with PostCSS CLI and configuration files
7. **Webpack**: How direction-specific selectors are handled in Webpack build systems

## Key Concepts Illustrated

- Using logical properties (`margin-inline`, `padding-block`, etc.)
- Direction-specific styling with `:dir(rtl)` pseudo-class
- Direction-specific styling with `[dir="rtl"]` attribute selector
- Controlling output order with `outputOrder` configuration (`ltr-first` vs `rtl-first`)
- **Smart selector priority**: Rightmost direction selector precedence for predictable behavior
- Custom direction selectors with framework integration (Tailwind-style classes)
- Complex nested selector chains with multiple direction contexts
- Impact of output order on CSS specificity and rule precedence
- Nested selectors with logical properties
- Complex scenarios with both RTL and LTR rules
- Difference between scoped and unscoped logical properties
