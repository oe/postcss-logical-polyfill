/**
 * Logical Properties Shim
 *
 * This module extends postcss-logical by adding support for additional
 * logical properties and values that are not yet supported by the main plugin.
 *
 * Supported extensions:
 * - Scroll-related logical properties (scroll-margin-*, scroll-padding-*)
 * - Overscroll behavior logical properties (overscroll-behavior-block, overscroll-behavior-inline)
 * - Overflow logical properties (overflow-block, overflow-inline)
 * - CSS Containment logical properties (contain-intrinsic-block-size, contain-intrinsic-inline-size)
 * - Float/Clear logical values (inline-start, inline-end)
 * - Resize logical values (block, inline)
 *
 * @format
 */

import { Declaration } from 'postcss';

/**
 * Extended Declaration functions for scroll-related logical properties
 * These follow the same pattern as postcss-logical's Declaration functions
 */
export const SHIM_DECLARATIONS: Record<
  string,
  (
    decl: Declaration,
    { inlineDirection }: { inlineDirection: 'left-to-right' | 'right-to-left' }
  ) => void
> = {
  // Scroll margin logical properties
  'scroll-margin-inline-start': (decl, { inlineDirection }) => {
    const prop =
      inlineDirection === 'left-to-right'
        ? 'scroll-margin-left'
        : 'scroll-margin-right';
    decl.cloneBefore({ prop });
    decl.remove();
  },

  'scroll-margin-inline-end': (decl, { inlineDirection }) => {
    const prop =
      inlineDirection === 'left-to-right'
        ? 'scroll-margin-right'
        : 'scroll-margin-left';
    decl.cloneBefore({ prop });
    decl.remove();
  },

  'scroll-margin-inline': (decl, { inlineDirection }) => {
    const values = decl.value.trim().split(/\s+/);
    const startValue = values[0];
    const endValue = values[1] || startValue;

    if (inlineDirection === 'left-to-right') {
      decl.cloneBefore({ prop: 'scroll-margin-left', value: startValue });
      decl.cloneBefore({ prop: 'scroll-margin-right', value: endValue });
    } else {
      decl.cloneBefore({ prop: 'scroll-margin-right', value: startValue });
      decl.cloneBefore({ prop: 'scroll-margin-left', value: endValue });
    }
    decl.remove();
  },

  'scroll-margin-block-start': (decl) => {
    decl.cloneBefore({ prop: 'scroll-margin-top' });
    decl.remove();
  },

  'scroll-margin-block-end': (decl) => {
    decl.cloneBefore({ prop: 'scroll-margin-bottom' });
    decl.remove();
  },

  'scroll-margin-block': (decl) => {
    const values = decl.value.trim().split(/\s+/);
    const startValue = values[0];
    const endValue = values[1] || startValue;

    decl.cloneBefore({ prop: 'scroll-margin-top', value: startValue });
    decl.cloneBefore({ prop: 'scroll-margin-bottom', value: endValue });
    decl.remove();
  },

  // Scroll padding logical properties
  'scroll-padding-inline-start': (decl, { inlineDirection }) => {
    const prop =
      inlineDirection === 'left-to-right'
        ? 'scroll-padding-left'
        : 'scroll-padding-right';
    decl.cloneBefore({ prop });
    decl.remove();
  },

  'scroll-padding-inline-end': (decl, { inlineDirection }) => {
    const prop =
      inlineDirection === 'left-to-right'
        ? 'scroll-padding-right'
        : 'scroll-padding-left';
    decl.cloneBefore({ prop });
    decl.remove();
  },

  'scroll-padding-inline': (decl, { inlineDirection }) => {
    const values = decl.value.trim().split(/\s+/);
    const startValue = values[0];
    const endValue = values[1] || startValue;

    if (inlineDirection === 'left-to-right') {
      decl.cloneBefore({ prop: 'scroll-padding-left', value: startValue });
      decl.cloneBefore({ prop: 'scroll-padding-right', value: endValue });
    } else {
      decl.cloneBefore({ prop: 'scroll-padding-right', value: startValue });
      decl.cloneBefore({ prop: 'scroll-padding-left', value: endValue });
    }
    decl.remove();
  },

  'scroll-padding-block-start': (decl) => {
    decl.cloneBefore({ prop: 'scroll-padding-top' });
    decl.remove();
  },

  'scroll-padding-block-end': (decl) => {
    decl.cloneBefore({ prop: 'scroll-padding-bottom' });
    decl.remove();
  },

  'scroll-padding-block': (decl) => {
    const values = decl.value.trim().split(/\s+/);
    const startValue = values[0];
    const endValue = values[1] || startValue;

    decl.cloneBefore({ prop: 'scroll-padding-top', value: startValue });
    decl.cloneBefore({ prop: 'scroll-padding-bottom', value: endValue });
    decl.remove();
  },

  // Logical values for existing properties
  float: (decl, { inlineDirection }) => {
    if (decl.value === 'inline-start') {
      const value = inlineDirection === 'left-to-right' ? 'left' : 'right';
      decl.cloneBefore({ prop: 'float', value });
      decl.remove();
    } else if (decl.value === 'inline-end') {
      const value = inlineDirection === 'left-to-right' ? 'right' : 'left';
      decl.cloneBefore({ prop: 'float', value });
      decl.remove();
    }
  },

  clear: (decl, { inlineDirection }) => {
    if (decl.value === 'inline-start') {
      const value = inlineDirection === 'left-to-right' ? 'left' : 'right';
      decl.cloneBefore({ prop: 'clear', value });
      decl.remove();
    } else if (decl.value === 'inline-end') {
      const value = inlineDirection === 'left-to-right' ? 'right' : 'left';
      decl.cloneBefore({ prop: 'clear', value });
      decl.remove();
    }
  },

  resize: (decl) => {
    if (decl.value === 'block') {
      decl.cloneBefore({ prop: 'resize', value: 'vertical' });
      decl.remove();
    } else if (decl.value === 'inline') {
      decl.cloneBefore({ prop: 'resize', value: 'horizontal' });
      decl.remove();
    }
  },

  // Overscroll behavior logical properties
  'overscroll-behavior-block': (decl) => {
    decl.cloneBefore({ prop: 'overscroll-behavior-y' });
    decl.remove();
  },

  'overscroll-behavior-inline': (decl, { inlineDirection }) => {
    // overscroll-behavior-inline maps to overscroll-behavior-x
    // regardless of inline direction
    decl.cloneBefore({ prop: 'overscroll-behavior-x' });
    decl.remove();
  },

  // Overflow logical properties
  'overflow-block': (decl) => {
    decl.cloneBefore({ prop: 'overflow-y' });
    decl.remove();
  },

  'overflow-inline': (decl) => {
    decl.cloneBefore({ prop: 'overflow-x' });
    decl.remove();
  },

  // CSS Containment logical properties
  'contain-intrinsic-block-size': (decl) => {
    decl.cloneBefore({ prop: 'contain-intrinsic-height' });
    decl.remove();
  },

  'contain-intrinsic-inline-size': (decl) => {
    decl.cloneBefore({ prop: 'contain-intrinsic-width' });
    decl.remove();
  }
};

/**
 * Extend postcss-logical processors with our shim declarations
 */
export function extendProcessors(processors: any) {
  // Add our shim declarations to both LTR and RTL processors
  Object.entries(SHIM_DECLARATIONS).forEach(([prop, handler]) => {
    processors.ltr.Declaration[prop] = (decl: Declaration) =>
      handler(decl, { inlineDirection: 'left-to-right' });
    processors.rtl.Declaration[prop] = (decl: Declaration) =>
      handler(decl, { inlineDirection: 'right-to-left' });
  });
}
