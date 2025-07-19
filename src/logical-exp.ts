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
  
  // Check if the value contains gradients with logical directions
  if ((value.includes('linear-gradient') || value.includes('radial-gradient')) && hasLogicalGradientDirection(value)) {
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
  const logicalKeywords = [
    'inline-start',
    'inline-end', 
    'block-start',
    'block-end'
  ];
  
  return logicalKeywords.some(keyword => 
    new RegExp(`\\b${keyword}\\b`).test(value)
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
  
  // Define logical to physical mappings
  const inlineMapping = inlineDirection === 'left-to-right' 
    ? { 'inline-start': 'left', 'inline-end': 'right' }
    : { 'inline-start': 'right', 'inline-end': 'left' };
  
  const blockMapping = {
    'block-start': 'top',
    'block-end': 'bottom'
  };
  
  // First pass: Transform inline directions
  for (const [logical, physical] of Object.entries(inlineMapping)) {
    // Handle "to" syntax for linear gradients
    transformedValue = transformedValue.replace(
      new RegExp(`\\bto\\s+${logical}\\b`, 'g'),
      `to ${physical}`
    );
    
    // Handle "at" syntax for radial gradients - more flexible matching
    transformedValue = transformedValue.replace(
      new RegExp(`\\bat\\s+([^,)]*\\s+)?${logical}(\\s+[^,)]*)?`, 'g'),
      (match, before = '', after = '') => {
        return `at ${before}${physical}${after}`;
      }
    );
    
    // Handle standalone logical keywords with word boundaries
    transformedValue = transformedValue.replace(
      new RegExp(`\\b${logical}\\b`, 'g'),
      physical
    );
  }
  
  // Second pass: Transform block directions
  for (const [logical, physical] of Object.entries(blockMapping)) {
    // Handle "to" syntax for linear gradients
    transformedValue = transformedValue.replace(
      new RegExp(`\\bto\\s+${logical}\\b`, 'g'),
      `to ${physical}`
    );
    
    // Handle "at" syntax for radial gradients - more flexible matching
    transformedValue = transformedValue.replace(
      new RegExp(`\\bat\\s+([^,)]*\\s+)?${logical}(\\s+[^,)]*)?`, 'g'),
      (match, before = '', after = '') => {
        return `at ${before}${physical}${after}`;
      }
    );
    
    // Handle standalone logical keywords with word boundaries
    transformedValue = transformedValue.replace(
      new RegExp(`\\b${logical}\\b`, 'g'),
      physical
    );
  }
  
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
