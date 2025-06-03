# Known Limitations

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
