# Known Limitations

## ~~Scroll Properties Not Supported~~ ✅ Now Supported via Shim System

⭐ **As of v0.4.0**, the `postcss-logical-scope` plugin now includes a built-in shim system that provides full support for scroll-related logical properties. While the underlying [`postcss-logical`](https://github.com/csstools/postcss-logical) plugin doesn't support these properties yet, our shim seamlessly handles them.

### ✅ Supported Properties

The following logical properties are **now fully supported** and will be transformed:

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
[dir="ltr"] .element {
  scroll-margin-left: 10px;
  scroll-margin-right: 10px;
  scroll-padding-top: 5px;
  scroll-padding-bottom: 5px;
}
[dir="rtl"] .element {
  scroll-margin-right: 10px;
  scroll-margin-left: 10px;
  scroll-padding-top: 5px;
  scroll-padding-bottom: 5px;
}
```

### How It Works

The shim system automatically detects logical properties that aren't supported by `postcss-logical` and transforms them using the same direction-aware approach. This ensures consistent behavior across all logical properties.

## ~~Logical Values Not Fully Supported~~ ✅ Enhanced Support via Shim System

⭐ **As of v0.4.0**, the `postcss-logical-scope` plugin includes an enhanced shim system that extends logical value support beyond what's available in the base [`postcss-logical`](https://github.com/csstools/postcss-logical) plugin.

### ✅ Supported Logical Values

The following logical values are **fully supported** and will be transformed:

**Text Alignment (Base Support):**
- `text-align: start` → `text-align: left` (LTR) / `text-align: right` (RTL)
- `text-align: end` → `text-align: right` (LTR) / `text-align: left` (RTL)

**Float & Clear (⭐ NEW - Shim Enhanced):**
- `float: inline-start` → `float: left` (LTR) / `float: right` (RTL)
- `float: inline-end` → `float: right` (LTR) / `float: left` (RTL)
- `clear: inline-start` → `clear: left` (LTR) / `clear: right` (RTL)
- `clear: inline-end` → `clear: right` (LTR) / `clear: left` (RTL)

**Resize (⭐ NEW - Shim Enhanced):**
- `resize: block` → `resize: vertical`
- `resize: inline` → `resize: horizontal`

### Example

**Input:**
```css
.element {
  text-align: start;
  float: inline-start;
  clear: inline-end;
  resize: block;
}
```

**Output:**
```css
[dir="ltr"] .element {
  text-align: left;
  float: left;
  clear: right;
  resize: vertical;
}
[dir="rtl"] .element {
  text-align: right;
  float: right;
  clear: left;
  resize: vertical;
}
```

### How It Works

The shim system automatically detects logical values that aren't supported by the base `postcss-logical` plugin and transforms them using the same direction-aware approach. This ensures comprehensive logical property support across all CSS features.

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
