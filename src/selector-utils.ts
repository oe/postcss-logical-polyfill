/**
 * Core selector utility functions for handling direction-specific CSS selectors
 * 
 * This module provides two main functions:
 * - detectDirection: Determine the direction context of a CSS selector
 * - generateSelector: Generate a new selector for a specific direction context
 */

/**
 * Configuration for direction selector detection and generation
 */
export interface DirectionConfig {
  ltr?: string;
  rtl?: string;
}

/**
 * Helper function to escape selector for regex use
 */
function escapeSelector(selector: string): string {
  return selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a selector contains a custom direction selector
 * Handles various selector patterns including chained classes
 */
function containsCustomSelector(selector: string, customSelector: string): boolean {
  const trimmedCustom = customSelector.trim();
  const trimmedSelector = selector.trim();
  
  // For simple selectors (class, id, attribute), check if they appear as separate tokens
  if (trimmedCustom.match(/^[.#\[]/) || trimmedCustom.startsWith(':')) {
    const escapedCustom = escapeSelector(trimmedCustom);
    
    // Handle different selector contexts:
    // - At the beginning: ".ltr .something" or ".ltr:hover"
    // - In the middle: ".parent .ltr .child" 
    // - At the end: ".parent .ltr"
    // - With pseudo-classes/elements: ".ltr:hover" or ".ltr::before"
    // - Chained with other classes: ".theme.ltr" but NOT ".theme-ltr"
    // 
    // We need to ensure .ltr appears as a complete CSS class, not as part of another class name
    // This means it should be preceded by start of string, whitespace, or a dot (for chaining)
    // and followed by appropriate CSS selector boundaries
    
    if (trimmedCustom.startsWith('.')) {
      // For class selectors like '.ltr', we need to be more careful
      // We want to match:
      // - ".ltr" at start: ".ltr .button"
      // - ".ltr" after space: ".parent .ltr .child"  
      // - ".ltr" after dot: ".theme.ltr" (chained classes)
      // But NOT:
      // - ".ltr" as part of class name: ".theme-ltr"
      
      const className = trimmedCustom.substring(1); // Remove the leading dot
      const escapedClassName = escapeSelector(className);
      
      // Match the class name when it appears as a complete token
      // We want to match .ltr when it appears as:
      // - At start: ".ltr .button"
      // - After space: ".parent .ltr .child"  
      // - After dot: ".theme.ltr" (chained classes)
      // But NOT as part of a class name like ".theme-ltr"
      const regex = new RegExp(
        `${escapedCustom}(?=\\s|$|[:.\\[#>+~,])`, 
        'g'
      );
      
      return regex.test(trimmedSelector);
    } else {
      // For other selectors (attributes, pseudo-classes, etc.), use simpler matching
      const escapedCustom = escapeSelector(trimmedCustom);
      const regex = new RegExp(
        `(?:^|\\s)${escapedCustom}(?=\\s|$|[:.\\[#>+~,])`, 
        'g'
      );
      
      return regex.test(trimmedSelector);
    }
  }
  
  // For complex selectors, check if the custom selector is contained
  return trimmedSelector.includes(trimmedCustom);
}

/**
 * Remove direction selectors from a selector string
 * Cleans both built-in and custom direction selectors
 */
function cleanDirectionSelectors(
  selector: string, 
  config: DirectionConfig = {}
): string {
  let cleaned = selector
    .replace(/:dir\(\s*rtl\s*\)/g, '')
    .replace(/:dir\(\s*ltr\s*\)/g, '')
    .replace(/\[\s*dir\s*=\s*["']?rtl["']?\s*\]/g, '')
    .replace(/\[\s*dir\s*=\s*["']?ltr["']?\s*\]/g, '');
  
  // Remove custom direction selectors if provided
  if (config.ltr) {
    const escapedLtr = escapeSelector(config.ltr);
    const ltrRegex = new RegExp(`(^|\\s)${escapedLtr}(?=\\s|$|[:.\\[#>+~,])`, 'g');
    cleaned = cleaned.replace(ltrRegex, '$1');
  }
  
  if (config.rtl) {
    const escapedRtl = escapeSelector(config.rtl);
    const rtlRegex = new RegExp(`(^|\\s)${escapedRtl}(?=\\s|$|[:.\\[#>+~,])`, 'g');
    cleaned = cleaned.replace(rtlRegex, '$1');
  }
  
  return cleaned
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect the direction context of a CSS selector
 * 
 * @param selector - The CSS selector to analyze
 * @param config - Configuration containing custom direction selectors
 * @returns The detected direction: 'ltr', 'rtl', or 'none'
 * 
 * @example
 * detectDirection('.button', { ltr: '.ltr', rtl: '.rtl' }) // 'none'
 * detectDirection('.ltr .button', { ltr: '.ltr', rtl: '.rtl' }) // 'ltr'
 * detectDirection('[dir="rtl"] .button') // 'rtl'
 * detectDirection('.theme.rtl .button', { rtl: '.rtl' }) // 'rtl'
 */
export function detectDirection(
  selector: string, 
  config: DirectionConfig = {}
): 'ltr' | 'rtl' | 'none' {
  // Built-in direction patterns
  const ltrPatterns = [
    /:dir\(\s*ltr\s*\)/,
    /\[\s*dir\s*=\s*["']?ltr["']?\s*\]/
  ];
  
  const rtlPatterns = [
    /:dir\(\s*rtl\s*\)/,
    /\[\s*dir\s*=\s*["']?rtl["']?\s*\]/
  ];
  
  // Find all direction indicators in the selector and their positions
  const directionMatches: Array<{ direction: 'ltr' | 'rtl'; position: number }> = [];
  
  // Find LTR matches (built-in)
  ltrPatterns.forEach(pattern => {
    const matches = selector.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of matches) {
      if (match.index !== undefined) {
        directionMatches.push({ direction: 'ltr', position: match.index });
      }
    }
  });
  
  // Find RTL matches (built-in)
  rtlPatterns.forEach(pattern => {
    const matches = selector.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of matches) {
      if (match.index !== undefined) {
        directionMatches.push({ direction: 'rtl', position: match.index });
      }
    }
  });
  
  // Check for custom LTR selector
  if (config.ltr && containsCustomSelector(selector, config.ltr)) {
    const match = selector.indexOf(config.ltr);
    if (match !== -1) {
      directionMatches.push({ direction: 'ltr', position: match });
    }
  }
  
  // Check for custom RTL selector
  if (config.rtl && containsCustomSelector(selector, config.rtl)) {
    const match = selector.indexOf(config.rtl);
    if (match !== -1) {
      directionMatches.push({ direction: 'rtl', position: match });
    }
  }
  
  // If no direction indicators found, return 'none'
  if (directionMatches.length === 0) {
    return 'none';
  }
  
  // Sort by position (rightmost/last is most specific)
  directionMatches.sort((a, b) => b.position - a.position);
  
  // Return the rightmost (most specific) direction
  return directionMatches[0].direction;
}

/**
 * Generate a new selector for a specific direction context
 * 
 * @param selector - The original CSS selector
 * @param direction - The target direction: 'ltr' or 'rtl'
 * @param config - Configuration containing custom direction selectors
 * @returns The generated selector with appropriate direction context
 * 
 * @example
 * generateSelector('.button', 'ltr', { ltr: '.ltr' }) // '.ltr .button'
 * generateSelector('.ltr .button', 'rtl', { ltr: '.ltr', rtl: '.rtl' }) // '.rtl .button'
 * generateSelector('[dir="ltr"] .button', 'rtl') // '[dir="rtl"] .button'
 */
export function generateSelector(
  selector: string,
  direction: 'ltr' | 'rtl',
  config: DirectionConfig = {}
): string {
  const currentDirection = detectDirection(selector, config);
  
  // If selector already has the target direction, return as-is
  if (currentDirection === direction) {
    return selector;
  }
  
  // Clean the selector of any existing direction selectors
  const cleanedSelector = cleanDirectionSelectors(selector, config);
  
  // Determine the direction selector to use
  let directionSelector: string;
  
  if (direction === 'ltr') {
    directionSelector = config.ltr || '[dir="ltr"]';
  } else {
    directionSelector = config.rtl || '[dir="rtl"]';
  }
  
  // If the cleaned selector is empty, return just the direction selector
  if (!cleanedSelector) {
    return directionSelector;
  }
  
  // Combine direction selector with cleaned selector
  return `${directionSelector} ${cleanedSelector}`;
}
