# postcss-logical-polyfill

[![NPM Version][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Coverage Status][coverage-img]][coverage-url]

Write CSS logical properties and compile one stylesheet with LTR and RTL physical-property rules for older browsers and WebViews.

Use this plugin when your internationalized application needs both directions in the same CSS file and your target browsers lack the logical properties you use. Direction-independent declarations stay in a common rule; directional declarations use configurable selectors.

[Documentation](https://app.evecalm.com/postcss-logical-polyfill/) · [Playground](https://app.evecalm.com/postcss-logical-polyfill/playground/) · [Examples](https://github.com/oe/postcss-logical-polyfill/tree/main/examples)

## Is this the right tool?

| Your requirement | Consider |
| --- | --- |
| Your target browsers support the logical properties you use | Native CSS; no transformation is needed |
| Compile logical properties for one configured direction or writing mode | [postcss-logical](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical), also available through [postcss-preset-env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env) |
| Mirror existing physical LTR styles into RTL styles | [RTLCSS](https://github.com/MohammadYounes/rtlcss) or [postcss-rtlcss](https://github.com/elchininet/postcss-rtlcss) |
| Compile logical properties into one stylesheet with horizontal LTR/RTL scopes, including existing direction selectors and opt-in logical animations | **postcss-logical-polyfill** |
| Need logical-property transformations for vertical writing modes | Evaluate [postcss-logical-properties-polyfill](https://github.com/erickskrauch/postcss-logical-properties-polyfill), whose documentation lists these features |

Other tools also generate combined LTR/RTL styles. This plugin focuses on logical-property input, existing direction scopes, common declarations and additional logical values. Check the [supported properties](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/references/supported-properties.mdx) and limitations below against your application.

## Quick start

Requires Node.js **20.19.0 or later** and PostCSS **8.4.0 or later within version 8**.

```bash
npm install --save-dev postcss postcss-logical-polyfill
# or: pnpm add -D postcss postcss-logical-polyfill
# or: yarn add -D postcss postcss-logical-polyfill
```

For an ESM project, including Vite projects that load a PostCSS configuration:

```js
// postcss.config.mjs
import logicalPolyfill from 'postcss-logical-polyfill';

export default {
  plugins: [logicalPolyfill()]
};
```

For CommonJS:

```js
// postcss.config.cjs
module.exports = {
  plugins: [require('postcss-logical-polyfill')()]
};
```

**Set an explicit direction marker on an ancestor of your styled elements:**

```html
<html dir="ltr">
  <body>
    <div class="card">Card content</div>
  </body>
</html>
```

Use `dir="rtl"` for RTL. The browser's default LTR direction does not add a `dir` attribute, so it does not match the default `[dir="ltr"]` selector. Changing `document.documentElement.dir` switches between the generated rules without another CSS build.

Input:

```css
.card {
  padding-block: 1rem;
  margin-inline-start: 2rem;
}
```

Output:

```css
.card {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
[dir="ltr"] .card {
  margin-left: 2rem;
}
[dir="rtl"] .card {
  margin-right: 2rem;
}
```

## Existing direction scopes and logical values

Recognized direction-scoped rules are transformed for their existing context:

```css
/* Input */
[dir="rtl"] .notice {
  margin-inline-start: 1rem;
}

/* Output */
[dir="rtl"] .notice {
  margin-right: 1rem;
}
```

Additional transformations include scroll margin/padding, logical overflow and containment sizes, and logical values such as `float: inline-start`, `clear: inline-end` and `resize: block`. Experimental logical gradient directions are also supported; they are an extension, not a guarantee of native browser support.

```css
/* Input */
.notice {
  float: inline-start;
}

/* Output */
[dir="ltr"] .notice {
  float: left;
}
[dir="rtl"] .notice {
  float: right;
}
```

## Configuration

The default options are:

```js
import logicalPolyfill from 'postcss-logical-polyfill';

export default {
  plugins: [logicalPolyfill({
    ltr: { selector: '[dir="ltr"]' },
    rtl: { selector: '[dir="rtl"]' },
    outputOrder: 'ltr-first' // or 'rtl-first'
  })]
};
```

Custom direction classes are supported:

```js
logicalPolyfill({
  ltr: { selector: '.ltr' },
  rtl: { selector: '.rtl' }
});
```

These classes must match ancestors of the styled elements. They scope the generated CSS; also set the HTML `dir` attribute for text direction and other browser behavior.

See the [configuration guide](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/guides/configuration.mdx) for selector lists and integration options.

## Logical keyframes (opt-in)

```js
logicalPolyfill({ animations: true });
```

The plugin keeps original keyframes and creates LTR/RTL physical-property copies for referenced logical animations. Both `animation-name` and `animation` shorthand references are rewritten. Ordinary animations are unchanged. Generated names avoid existing definitions and static references; same-name definitions retain their original media/supports/layer contexts.

```css
/* Input */
@keyframes slide {
  from { margin-inline-start: 0; }
  to { margin-inline-start: 100px; }
}
.card { animation: slide 1s linear; }
```

This generates direction-specific `lp-slide-ltr` and `lp-slide-rtl` keyframes and matching animation rules. Generated names may gain a numeric suffix when needed to avoid collisions.

Try the [runnable animation example](https://github.com/oe/postcss-logical-polyfill/tree/main/examples/logical-animations).

Run `postcss-import` before this plugin when definitions and references are in separate files. Runtime names inside `var()` or `env()` cannot be resolved reliably: they remain unchanged with a PostCSS warning, and original definitions remain available for browsers with native logical-property support. They do not gain a physical-property animation fallback. Expand CSS nesting before the plugin.

## Compatibility and limitations

- Transformations assume horizontal writing modes. Vertical writing modes are not inferred.
- Keyframes are left untouched by default. Enable `animations: true` to transform referenced logical keyframes and static animation names. Logical property names in `transition` and `transition-property` are transformed independently of this option.
- Expand CSS nesting before this plugin, using a tool such as `postcss-nested` or `postcss-nesting`. Unexpanded nested rules are left intact with a PostCSS warning.
- Direction prefixes add selector specificity. Overrides in separate rules should use matching direction scopes. For subtrees with conflicting direction ancestors, write explicit direction-scoped selectors so the plugin can use the rightmost context.
- Repeated physical properties within an optimized rule are resolved by `!important` priority, then source order. Overlapping common shorthands are retained in direction rules where needed to preserve their ordering relative to directional longhands.
- Browser compatibility depends on the physical properties and values in the output. Transforming a logical name does not polyfill unrelated CSS features such as custom properties, scroll behavior or containment.

When `transition-property` expands a shorthand such as `margin-inline`, static companion timing lists are expanded to keep their original correspondence. Dynamic or inherited lists, and component lists extracted from function-valued `transition` shorthands, are preserved with a PostCSS warning when they cannot be aligned safely. Explicit timing longhands with static functions can be aligned.

See [how it works](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/guides/how-it-works.mdx) and [troubleshooting](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/guides/troubleshooting.mdx).

## Examples and documentation

The repository includes examples for plain PostCSS, Vite, Webpack, Sass, Less, the PostCSS CLI, custom selectors and output order. After cloning the repository and installing dependencies:

```bash
pnpm build
pnpm examples
```

- [Example instructions](https://github.com/oe/postcss-logical-polyfill/blob/main/examples/README.md)
- [Installation](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/getting-started/installation.mdx)
- [Build tool integration](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/guides/integration.mdx)
- [Supported properties](https://github.com/oe/postcss-logical-polyfill/blob/main/docs/src/content/docs/references/supported-properties.mdx)
- [CSS Logical Properties and Values on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)

## Contributing

[Contributions](https://github.com/oe/postcss-logical-polyfill/blob/main/CONTRIBUTING.md) and reports of real-world compatibility issues are welcome. Include your input CSS, generated CSS, direction markers and target browser when reporting an issue.

## Credits and license

This plugin wraps and extends [postcss-logical](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical). Licensed under [MIT](https://github.com/oe/postcss-logical-polyfill/blob/main/LICENSE).

[npm-url]: https://www.npmjs.com/package/postcss-logical-polyfill
[npm-img]: https://img.shields.io/npm/v/postcss-logical-polyfill
[build-url]: https://github.com/oe/postcss-logical-polyfill/actions/workflows/ci.yml
[build-img]: https://github.com/oe/postcss-logical-polyfill/actions/workflows/ci.yml/badge.svg
[coverage-url]: https://codecov.io/gh/oe/postcss-logical-polyfill
[coverage-img]: https://codecov.io/gh/oe/postcss-logical-polyfill/branch/main/graph/badge.svg
