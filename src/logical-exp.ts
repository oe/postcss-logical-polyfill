/**
 * Experimental Logical Properties Support
 *
 * This module adds support for experimental/draft-stage logical properties
 * and values that are not yet standardized or widely supported.
 *
 * Supported experimental features:
 * - Linear gradient logical directions (to inline-start, to inline-end, to block-start, to block-end)
 *
 * @format
 */

import { Declaration } from 'postcss';

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
  const value = decl.value;
  
  // Check if the value contains linear-gradient with logical directions
  if (value.includes('linear-gradient') && hasLogicalGradientDirection(value)) {
    const transformedValue = transformLogicalGradient(value, inlineDirection);
    if (transformedValue !== value) {
      decl.cloneBefore({ prop: decl.prop, value: transformedValue });
      decl.remove();
    }
  }
}

/**
 * Check if a gradient value contains logical directions
 */
function hasLogicalGradientDirection(value: string): boolean {
  const logicalDirections = [
    'to inline-start',
    'to inline-end', 
    'to block-start',
    'to block-end',
    'inline-start',
    'inline-end',
    'block-start', 
    'block-end'
  ];
  
  return logicalDirections.some(direction => 
    value.includes(direction)
  );
}

/**
 * Transform logical gradient directions to physical directions
 */
function transformLogicalGradient(
  value: string,
  inlineDirection: 'left-to-right' | 'right-to-left'
): string {
  let transformedValue = value;
  
  // Transform inline directions based on writing mode
  if (inlineDirection === 'left-to-right') {
    transformedValue = transformedValue
      .replace(/to inline-start/g, 'to left')
      .replace(/to inline-end/g, 'to right')
      .replace(/\binline-start\b/g, 'left')
      .replace(/\binline-end\b/g, 'right');
  } else {
    transformedValue = transformedValue
      .replace(/to inline-start/g, 'to right')
      .replace(/to inline-end/g, 'to left')
      .replace(/\binline-start\b/g, 'right')
      .replace(/\binline-end\b/g, 'left');
  }
  
  // Transform block directions (these are the same regardless of writing mode)
  transformedValue = transformedValue
    .replace(/to block-start/g, 'to top')
    .replace(/to block-end/g, 'to bottom')
    .replace(/\bblock-start\b/g, 'top')
    .replace(/\bblock-end\b/g, 'bottom');
  
  return transformedValue;
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
