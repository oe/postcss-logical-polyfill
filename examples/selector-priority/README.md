# Smart Selector Priority Optimization Example

This example demonstrates the **rightmost priority logic** optimization that makes CSS behavior more predictable when multiple direction selectors exist in a single selector chain.

## How to Run

```bash
npx tsx process.ts
```

## Key Features Demonstrated

### 1. Rightmost Priority Logic
When multiple direction selectors exist, the rightmost (most specific) takes precedence.

### 2. Mixed Built-in and Custom Selectors
The optimization works seamlessly with both `:dir()`, `[dir]`, and custom selectors.

### 3. Complex Nested Scenarios
Handles real-world complex selector chains predictably.

### 4. Edge Case Handling
Gracefully manages contradictory and repetitive direction contexts.

## Input CSS

See `input.css` for the source logical properties with complex direction selector chains.

## Output CSS

See `output.css` for the generated physical properties showing how rightmost priority is applied.

## Configuration

The example uses custom direction selectors to demonstrate the optimization:

```js
{
  ltr: { selector: '.theme-ltr' },
  rtl: { selector: '.theme-rtl' }
}
```

This shows how the plugin maintains predictable behavior regardless of the selector complexity or custom configuration used.
