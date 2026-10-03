/**
 * Experimental Logical Properties Support
 *
 * This module adds support for experimental/draft-stage logical properties
 * and values that are not yet standardized or widely supported.
 *
 * Supported experimental features:
 * - Linear gradient logical directions (to inline-start, to inline-end, to block-start, to block-end)
 * - Radial gradient logical directions (at inline-start, at inline-end, at block-start, at block-end)
 *
 * @format
 */

import { Declaration } from 'postcss';
import valueParser from 'postcss-value-parser';

/**
 * Experimental Declaration functions for draft-stage logical properties
 * These follow the same pattern as postcss-logical's Declaration functions
 */
export const EXPERIMENTAL_DECLARATIONS: Record<
  string,
  (
    decl: Declaration,
    { inlineDirection }: { inlineDirection: 'left-to-right' | 'right-to-left' }
  ) => void
> = {
  // Handle background and background-image properties with linear-gradient logical directions
  'background': handleGradientProperty,
  'background-image': handleGradientProperty,
};

/**
 * Handle gradient properties (background, background-image) with logical directions
 */
function handleGradientProperty(
  decl: Declaration,
  { inlineDirection }: { inlineDirection: 'left-to-right' | 'right-to-left' }
): void {
  const mappings: Record<string, string> = {
    'inline-start': inlineDirection === 'left-to-right' ? 'left' : 'right',
    'inline-end': inlineDirection === 'left-to-right' ? 'right' : 'left',
    'block-start': 'top',
    'block-end': 'bottom'
  };
  let changed = false;
  const parsed = gradientDirectionWords(decl.value, word => {
    word.value = mappings[word.value.toLowerCase()];
    changed = true;
  });
  if (changed) {
    decl.cloneBefore({ value: parsed.toString() });
    decl.remove();
  }
}

function gradientDirectionWords(value: string, callback: (word: { value: string }) => void) {
  const parsed = valueParser(value);
  parsed.walk(node => {
    if (node.type !== 'function') return;
    const name = node.value.toLowerCase();
    if (!['linear-gradient', 'repeating-linear-gradient', 'radial-gradient', 'repeating-radial-gradient'].includes(name)) return;
    const marker = name.includes('linear') ? 'to' : 'at';
    let position = false;
    for (const child of node.nodes) {
      if (child.type === 'div' && child.value === ',') position = false;
      if (child.type !== 'word') continue;
      if (child.value.toLowerCase() === marker) {
        position = true;
        continue;
      }
      if (position && ['inline-start', 'inline-end', 'block-start', 'block-end'].includes(child.value.toLowerCase())) callback(child);
    }
  });
  return parsed;
}

export function hasLogicalGradientDirection(value: string): boolean {
  let found = false;
  gradientDirectionWords(value, () => { found = true; });
  return found;
}

/**
 * Extend postcss-logical processors with our experimental declarations
 */
export function extendProcessorsWithExperimental(processors: any) {
  // Add our experimental declarations to both LTR and RTL processors
  Object.entries(EXPERIMENTAL_DECLARATIONS).forEach(([prop, handler]) => {
    // Store existing handler if it exists
    const existingHandler = processors.ltr.Declaration[prop];
    const existingRtlHandler = processors.rtl.Declaration[prop];
    
    processors.ltr.Declaration[prop] = (decl: Declaration) => {
      // First try our experimental handler
      handler(decl, { inlineDirection: 'left-to-right' });
      
      // If the declaration still exists and there was an existing handler, call it
      if (decl.parent && existingHandler) {
        existingHandler(decl);
      }
    };
    
    processors.rtl.Declaration[prop] = (decl: Declaration) => {
      // First try our experimental handler
      handler(decl, { inlineDirection: 'right-to-left' });
      
      // If the declaration still exists and there was an existing handler, call it
      if (decl.parent && existingRtlHandler) {
        existingRtlHandler(decl);
      }
    };
  });
}
