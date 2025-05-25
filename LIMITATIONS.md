# Known Limitations

## Scroll Properties Not Supported

The `postcss-logical-scope` plugin relies on the [`postcss-logical`](https://github.com/csstools/postcss-logical) plugin for transforming logical properties to physical properties. Currently, `postcss-logical` does not support scroll-related logical properties.

### Unsupported Properties

The following logical properties are **not** transformed and will remain unchanged in the output:

- `scroll-margin-inline`
- `scroll-margin-inline-start` 
- `scroll-margin-inline-end`
- `scroll-margin-block`
- `scroll-margin-block-start`
- `scroll-margin-block-end`
- `scroll-padding-inline`
- `scroll-padding-inline-start`
- `scroll-padding-inline-end`
- `scroll-padding-block`
- `scroll-padding-block-start`
- `scroll-padding-block-end`

### Example

**Input:**
```css
.element {
  scroll-margin-inline: 10px;
  scroll-padding-block: 5px;
}
```

**Output:**
```css
/* These properties remain unchanged */
.element {
  scroll-margin-inline: 10px;
  scroll-padding-block: 5px;
}
```

### Workaround

If you need scroll property support, you can:

1. Use physical properties directly:
   ```css
   .element {
     scroll-margin-left: 10px;
     scroll-margin-right: 10px;
   }
   ```

2. Wait for `postcss-logical` to add support for these properties
3. Contribute scroll property support to the `postcss-logical` project

## Logical Values Not Fully Supported

The `postcss-logical` plugin has partial support for logical values. Some logical values are supported while others are not yet implemented.

### Supported Logical Values

The following logical values are **supported** and will be transformed:

- `text-align: start` → `text-align: left` (LTR) / `text-align: right` (RTL)
- `text-align: end` → `text-align: right` (LTR) / `text-align: left` (RTL)

### Unsupported Logical Values

The following logical values are **not** supported and will remain unchanged in the output:

- `float: inline-start` (should become `float: left` in LTR, `float: right` in RTL)
- `float: inline-end` (should become `float: right` in LTR, `float: left` in RTL)
- `clear: inline-start` (should become `clear: left` in LTR, `clear: right` in RTL)
- `clear: inline-end` (should become `clear: right` in LTR, `clear: left` in RTL)
- `resize: block` (should become `resize: vertical`)
- `resize: inline` (should become `resize: horizontal`)

### Example

**Input:**
```css
.element {
  text-align: start;  /* This works */
  float: inline-start;  /* This doesn't work */
  clear: inline-end;   /* This doesn't work */
  resize: block;       /* This doesn't work */
}
```

**Output:**
```css
/* Supported: text-align is transformed */
[dir="ltr"] .element {
  text-align: left;
  float: inline-start;  /* Unchanged - not supported */
  clear: inline-end;    /* Unchanged - not supported */
  resize: block;        /* Unchanged - not supported */
}
[dir="rtl"] .element {
  text-align: right;
  float: inline-start;  /* Unchanged - not supported */
  clear: inline-end;    /* Unchanged - not supported */
  resize: block;        /* Unchanged - not supported */
}
```

### Workaround

For unsupported logical values, you can:

1. Use physical values directly with direction-specific rules:
   ```css
   [dir="ltr"] .element {
     float: left;
     clear: right;
     resize: vertical;
   }
   [dir="rtl"] .element {
     float: right;
     clear: left;
     resize: vertical;
   }
   ```

2. Wait for `postcss-logical` to add support for these logical values
3. Contribute logical value support to the `postcss-logical` project

## CSS Rule Ordering

When processing mixed CSS (rules with and without logical properties), the plugin may reorder rules slightly. This is due to the asynchronous processing nature and should not affect the final styling in most cases. The semantic meaning and specificity of the CSS is preserved.

### Mitigation

If rule order is critical for your use case, consider:
- Grouping logical property rules together
- Using more specific selectors instead of relying on source order
- Testing the final output in your target browsers

## Special At-Rules Handling

For compatibility and to follow industry best practices, the following at-rules are intentionally skipped during processing:

### @keyframes

Logical properties inside `@keyframes` rules are **not** transformed. This is by design because:

1. Logical properties in animations often need to behave differently based on the document direction
2. Transforming them could break animations that should respond to direction changes
3. Most browsers correctly interpret logical properties within keyframes based on the current document direction

**Example:**
```css
@keyframes slide-in {
  from {
    margin-inline-start: -100%;  /* Stays as logical property */
  }
  to {
    margin-inline-start: 0;      /* Stays as logical property */
  }
}

.element {
  animation: slide-in 1s;
  margin-inline: 1rem;  /* This gets transformed outside keyframes */
}
```

### Other Special At-Rules

The following at-rules are also skipped:
- `@font-face`
- `@counter-style`
- `@page`

This ensures compatibility with CSS specifications that require specific property names in these contexts.

### Workaround

If you need different animation behaviors for LTR and RTL:
- Create separate keyframe animations with direction-specific names
- Apply them conditionally based on the document direction
```css
@keyframes slide-in-ltr {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-rtl {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

[dir="ltr"] .element { animation-name: slide-in-ltr; }
[dir="rtl"] .element { animation-name: slide-in-rtl; }
```
