import { Rule } from 'postcss';
import { winningDeclarations } from './logical-properties';

type Properties = Map<string, { value: string; important: boolean }>;

// Only relationships that can overlap properties handled by this plugin.
const sides = ['top', 'right', 'bottom', 'left'];
const borderParts = ['width', 'style', 'color'];
const borderImage = ['source', 'slice', 'width', 'outset', 'repeat'].map(part => `border-image-${part}`);
const shorthands = new Map<string, string[]>();
for (const family of ['margin', 'padding', 'scroll-margin', 'scroll-padding']) {
  shorthands.set(family, sides.map(side => `${family}-${side}`));
}
shorthands.set('transition', ['property', 'duration', 'timing-function', 'delay', 'behavior'].map(part => `transition-${part}`));
shorthands.set('inset', sides);
shorthands.set('border', sides.flatMap(side => borderParts.map(part => `border-${side}-${part}`)).concat(borderImage));
for (const side of sides) shorthands.set(`border-${side}`, borderParts.map(part => `border-${side}-${part}`));
for (const part of borderParts) shorthands.set(`border-${part}`, sides.map(side => `border-${side}-${part}`));
shorthands.set('border-image', borderImage);
shorthands.set('border-radius', ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(corner => `border-${corner}-radius`));
shorthands.set('background', ['background-image', 'background-position-x', 'background-position-y', 'background-size', 'background-repeat-x', 'background-repeat-y', 'background-origin', 'background-clip', 'background-attachment', 'background-color']);
shorthands.set('background-position', ['background-position-x', 'background-position-y']);
shorthands.set('background-repeat', ['background-repeat-x', 'background-repeat-y']);
shorthands.set('overflow', ['overflow-x', 'overflow-y']);
shorthands.set('overscroll-behavior', ['overscroll-behavior-x', 'overscroll-behavior-y']);
shorthands.set('contain-intrinsic-size', ['contain-intrinsic-width', 'contain-intrinsic-height']);

function overlaps(a: string, b: string): boolean {
  if (a === 'all' || b === 'all') {
    const other = a === 'all' ? b : a;
    return !other.startsWith('--') && !['direction', 'unicode-bidi'].includes(other);
  }
  const left = shorthands.get(a) ?? [a];
  const right = shorthands.get(b) ?? [b];
  return left.some(prop => right.includes(prop));
}

/** Keep shorthand/longhand cascade order when common rules are split out. */
export function retainCascadeDependencies(rule: Rule, directional: Properties, common: Properties): Properties {
  const properties = new Map(directional);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [prop, declaration] of common) {
      if (!properties.has(prop) && [...properties.keys()].some(other => overlaps(prop, other))) {
        properties.set(prop, declaration);
        changed = true;
      }
    }
  }
  if (properties.size === directional.size) return directional;
  // A repeated property's winning declaration can occur after a shorthand.
  const ordered: Properties = new Map();
  for (const prop of winningDeclarations(rule, true).keys()) {
    const declaration = properties.get(prop);
    if (declaration) ordered.set(prop, declaration);
  }
  return ordered;
}

/** A winner must retain its position relative to overlapping shorthands. */
export function orderCascadeProperties(rule: Rule, properties: Properties): Properties {
  const keys = [...properties.keys()];
  if (!keys.some((prop, index) => keys.slice(index + 1).some(other => overlaps(prop, other)))) return properties;
  return new Map([...winningDeclarations(rule, true).keys()].filter(prop => properties.has(prop)).map(prop => [prop, properties.get(prop)!]));
}
