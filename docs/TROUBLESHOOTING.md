# Troubleshooting Guide

This guide helps you diagnose and resolve common issues when using postcss-logical-polyfill.

## Table of Contents

- [Common Issues](#common-issues)
- [Configuration Problems](#configuration-problems)
- [Build Tool Issues](#build-tool-issues)
- [Output Problems](#output-problems)
- [Performance Issues](#performance-issues)
- [Debug Techniques](#debug-techniques)

## Common Issues

### Styles Not Applying

**Problem**: CSS rules with logical properties aren't being applied to elements.

**Symptoms**:
- Elements don't show expected spacing/positioning
- Styles work in some directions but not others
- No visual changes when toggling between LTR and RTL

**Solutions**:

1. **Check HTML `dir` attribute**:
   ```html
   <!-- ✅ CORRECT -->
   <html dir="ltr">
   <html dir="rtl">
   
   <!-- ❌ INCORRECT - Missing dir attribute -->
   <html>
   ```

2. **Verify selector configuration**:
   ```js
   // Make sure your selectors match your HTML
   logicalPolyfill({
     rtl: { selector: '[dir="rtl"]' },  // Matches dir="rtl"
     ltr: { selector: '[dir="ltr"]' }   // Matches dir="ltr"
   })
   ```

3. **Check CSS specificity**:
   ```css
   /* Higher specificity rule might override */
   .component.specific { margin-left: 0 !important; }
   
   /* Your generated rule (lower specificity) */
   [dir="ltr"] .component { margin-left: 1rem; }
   ```

### Properties Not Being Transformed

**Problem**: Logical properties remain unchanged in the output.

**Symptoms**:
- Input CSS contains `margin-inline`, output still has `margin-inline`
- No direction-specific rules generated
- Plugin appears to not be running

**Solutions**:

1. **Verify plugin is installed and configured**:
   ```js
   // postcss.config.js
   module.exports = {
     plugins: [
       require('postcss-logical-polyfill')() // Make sure this is included
     ]
   };
   ```

2. **Check property support**:
   ```css
   /* ✅ Supported */
   .element { margin-inline: 1rem; }
   
   /* ❌ Not a logical property */
   .element { margin-left: 1rem; }
   ```

3. **Verify PostCSS processing**:
   ```bash
   # Test with PostCSS CLI
   npx postcss input.css -o output.css
   ```

### Direction Switching Not Working

**Problem**: Layout doesn't change when switching between LTR and RTL.

**Symptoms**:
- Same layout in both directions
- Properties seem to be applied but no visual difference
- JavaScript direction switching has no effect

**Solutions**:

1. **Use direction-dependent properties**:
   ```css
   /* ✅ Will create LTR/RTL variants */
   .element { margin-inline-start: 1rem; }
   
   /* ❌ Same in both directions */
   .element { margin-block: 1rem; }
   ```

2. **Check JavaScript direction switching**:
   ```js
   // Correct way to toggle direction
   document.documentElement.setAttribute('dir', 'rtl');
   document.documentElement.setAttribute('dir', 'ltr');
   ```

3. **Verify CSS output contains both variants**:
   ```css
   /* Expected output */
   [dir="ltr"] .element { margin-left: 1rem; }
   [dir="rtl"] .element { margin-right: 1rem; }
   ```

## Configuration Problems

### Invalid Selector Configuration

**Problem**: Custom selectors not working as expected.

**Symptoms**:
- Generated CSS has wrong selectors
- Build errors or warnings
- Selectors don't match HTML elements

**Solutions**:

1. **Use valid CSS selectors**:
   ```js
   // ✅ Valid selectors
   logicalPolyfill({
     rtl: { selector: '[dir="rtl"]' },
     ltr: { selector: '.ltr-mode' }
   })
   
   // ❌ Invalid selectors
   logicalPolyfill({
     rtl: { selector: 'dir=rtl' }, // Missing brackets
     ltr: { selector: '.ltr mode' } // Space not allowed
   })
   ```

2. **Match HTML structure**:
   ```html
   <!-- For selector: '.ltr-mode' -->
   <html class="ltr-mode">
   
   <!-- For selector: '[data-dir="rtl"]' -->
   <html data-dir="rtl">
   ```

### Output Order Issues

**Problem**: Generated CSS rules appear in unexpected order.

**Symptoms**:
- RTL rules override LTR rules unexpectedly
- CSS specificity conflicts
- Framework integration issues

**Solutions**:

1. **Configure output order**:
   ```js
   // For RTL-primary sites
   logicalPolyfill({
     outputOrder: 'rtl-first'
   })
   
   // For LTR-primary sites (default)
   logicalPolyfill({
     outputOrder: 'ltr-first'
   })
   ```

2. **Check CSS cascade**:
   ```css
   /* With outputOrder: 'ltr-first' */
   [dir="ltr"] .element { margin-left: 1rem; }
   [dir="rtl"] .element { margin-right: 1rem; } /* Later, higher specificity */
   ```

## Build Tool Issues

### Webpack Configuration

**Problem**: Plugin not working with Webpack.

**Solutions**:

1. **Check PostCSS loader configuration**:
   ```js
   // webpack.config.js
   module.exports = {
     module: {
       rules: [
         {
           test: /\.css$/,
           use: [
             'style-loader',
             'css-loader',
             {
               loader: 'postcss-loader',
               options: {
                 postcssOptions: {
                   plugins: [
                     require('postcss-logical-polyfill')()
                   ]
                 }
               }
             }
           ]
         }
       ]
     }
   };
   ```

2. **Verify plugin order**:
   ```js
   // Correct order
   postcssOptions: {
     plugins: [
       require('autoprefixer'),
       require('postcss-logical-polyfill')(), // After autoprefixer
       require('cssnano')() // Minification last
     ]
   }
   ```

### Vite Configuration

**Problem**: Not working with Vite.

**Solutions**:

1. **Use proper Vite config**:
   ```js
   // vite.config.js
   import { defineConfig } from 'vite';
   
   export default defineConfig({
     css: {
       postcss: {
         plugins: [
           require('postcss-logical-polyfill')()
         ]
       }
     }
   });
   ```

2. **Check for ESM/CommonJS issues**:
   ```js
   // If using ES modules
   import logicalPolyfill from 'postcss-logical-polyfill';
   
   export default defineConfig({
     css: {
       postcss: {
         plugins: [logicalPolyfill()]
       }
     }
   });
   ```

### Next.js Issues

**Problem**: Plugin not working with Next.js.

**Solutions**:

1. **Use postcss.config.js**:
   ```js
   // postcss.config.js (in project root)
   module.exports = {
     plugins: {
       'postcss-logical-polyfill': {}
     }
   };
   ```

2. **Check for CSS modules conflict**:
   ```js
   // next.config.js
   module.exports = {
     experimental: {
       // May help with CSS processing
       esmExternals: true
     }
   };
   ```

## Output Problems

### Unexpected CSS Output

**Problem**: Generated CSS doesn't match expectations.

**Symptoms**:
- Too many duplicate rules
- Missing expected transformations
- Incorrect property values

**Solutions**:

1. **Check input CSS syntax**:
   ```css
   /* ✅ Correct logical property syntax */
   .element { margin-inline: 1rem 2rem; }
   
   /* ❌ Invalid syntax */
   .element { margin-inline: 1rem, 2rem; }
   ```

2. **Verify property names**:
   ```css
   /* ✅ Supported logical properties */
   margin-inline-start
   padding-block-end
   border-inline-width
   
   /* ❌ Not logical properties */
   margin-start
   padding-vertical
   border-horizontal
   ```

3. **Check for property conflicts**:
   ```css
   /* Input */
   .element {
     margin-inline: 1rem;
     margin-left: 2rem; /* Will override logical property */
   }
   ```

### Performance Issues

**Problem**: Build times are slow or memory usage is high.

**Solutions**:

1. **Optimize CSS input**:
   ```css
   /* ✅ Efficient - group related properties */
   .component {
     margin-inline: 1rem;
     padding-inline: 2rem;
   }
   
   /* ❌ Inefficient - scattered properties */
   .component { margin-inline: 1rem; }
   .component { padding-inline: 2rem; }
   ```

2. **Use appropriate plugin order**:
   ```js
   // Process logical properties before heavy optimizations
   plugins: [
     require('postcss-logical-polyfill'),
     require('cssnano') // Heavy optimization last
   ]
   ```

3. **Consider build tool settings**:
   ```js
   // webpack.config.js
   module.exports = {
     optimization: {
       // Enable CSS optimization only in production
       minimize: process.env.NODE_ENV === 'production'
     }
   };
   ```

## Debug Techniques

### Enabling Debug Output

```js
// Add debug logging (if available)
logicalPolyfill({
  // Plugin doesn't currently support debug mode,
  // but you can add console.log in development
})
```

### Testing CSS Transformation

1. **Create a test file**:
   ```css
   /* test-input.css */
   .test {
     margin-inline: 1rem;
     padding-block: 2rem;
     border-inline-start: 1px solid red;
   }
   ```

2. **Process with CLI**:
   ```bash
   npx postcss test-input.css -o test-output.css
   ```

3. **Check expected output**:
   ```css
   /* test-output.css - Expected */
   .test {
     margin-left: 1rem;
     margin-right: 1rem;
     padding-top: 2rem;
     padding-bottom: 2rem;
   }
   [dir="ltr"] .test {
     border-left: 1px solid red;
   }
   [dir="rtl"] .test {
     border-right: 1px solid red;
   }
   ```

### Browser DevTools

1. **Check computed styles**:
   - Open DevTools → Elements
   - Select element with logical properties
   - Check Computed tab for actual applied values

2. **Test direction switching**:
   ```js
   // In browser console
   document.documentElement.setAttribute('dir', 'rtl');
   document.documentElement.setAttribute('dir', 'ltr');
   ```

3. **Verify CSS rules**:
   - Check Sources/Network tab for processed CSS
   - Look for generated `[dir="ltr"]` and `[dir="rtl"]` rules

### Minimal Reproduction

Create a minimal test case:

```html
<!DOCTYPE html>
<html dir="ltr">
<head>
  <style>
    .test { margin-inline-start: 2rem; }
  </style>
</head>
<body>
  <div class="test">Test content</div>
  <button onclick="toggleDir()">Toggle Direction</button>
  <script>
    function toggleDir() {
      const dir = document.documentElement.getAttribute('dir');
      document.documentElement.setAttribute('dir', dir === 'ltr' ? 'rtl' : 'ltr');
    }
  </script>
</body>
</html>
```

## Getting Help

### Check Examples

Look at the [examples directory](../examples/README.md) for working configurations with various build tools.

### Common Solutions Summary

| Problem | Solution |
|---------|----------|
| Styles not applying | Add `dir` attribute to HTML |
| Properties not transformed | Check plugin configuration |
| Direction switching fails | Use inline-direction properties |
| Build tool issues | Verify PostCSS loader setup |
| Wrong output order | Configure `outputOrder` option |
| Performance issues | Optimize CSS structure and plugin order |

### Report Issues

If you encounter issues not covered in this guide:

1. Create a minimal reproduction case
2. Check existing issues in the [GitHub repository](https://github.com/oe/postcss-logical-polyfill/issues)
3. Include your configuration and input/output CSS
4. Specify your build tool and version

## Related Documentation

- [Advanced Usage Guide](./ADVANCED-USAGE.md) - Configuration and advanced patterns
- [Integration Guide](./INTEGRATION-GUIDE.md) - Build tool setup
- [Examples](../examples/README.md) - Working examples for different scenarios
