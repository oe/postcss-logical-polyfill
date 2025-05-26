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
    
    // Create regex pattern based on selector type
    let pattern: string;
    if (trimmedCustom.startsWith('.')) {
      // Class selectors: match complete class names (avoid partial matches like .theme-ltr)
      pattern = `${escapedCustom}(?=\\s|$|[:.\\[#>+~,])`;
    } else {
      // Other selectors: ensure word boundaries
      pattern = `(?:^|\\s)${escapedCustom}(?=\\s|$|[:.\\[#>+~,])`;
    }
    
    return new RegExp(pattern, 'g').test(trimmedSelector);
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
  // Built-in direction patterns to remove
  const builtinPatterns = [
    /:dir\(\s*rtl\s*\)/g,
    /:dir\(\s*ltr\s*\)/g,
    /\[\s*dir\s*=\s*["']?rtl["']?\s*\]/g,
    /\[\s*dir\s*=\s*["']?ltr["']?\s*\]/g
  ];
  
  let cleaned = selector;
  
  // Remove built-in patterns
  builtinPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove custom direction selectors if provided
  [config.ltr, config.rtl].forEach(customSelector => {
    if (customSelector) {
      const escapedCustom = escapeSelector(customSelector);
      const customRegex = new RegExp(`(^|\\s)${escapedCustom}(?=\\s|$|[:.\\[#>+~,])`, 'g');
      cleaned = cleaned.replace(customRegex, '$1');
    }
  });
  
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
  const builtinPatterns = [
    { patterns: [/:dir\(\s*ltr\s*\)/, /\[\s*dir\s*=\s*["']?ltr["']?\s*\]/], direction: 'ltr' as const },
    { patterns: [/:dir\(\s*rtl\s*\)/, /\[\s*dir\s*=\s*["']?rtl["']?\s*\]/], direction: 'rtl' as const }
  ];
  
  const directionMatches: Array<{ direction: 'ltr' | 'rtl'; position: number }> = [];
  
  // Find built-in direction matches
  builtinPatterns.forEach(({ patterns, direction }) => {
    patterns.forEach(pattern => {
      const matches = selector.matchAll(new RegExp(pattern.source, 'g'));
      for (const match of matches) {
        if (match.index !== undefined) {
          directionMatches.push({ direction, position: match.index });
        }
      }
    });
  });
  
  // Check for custom direction selectors
  const customSelectors = [
    { selector: config.ltr, direction: 'ltr' as const },
    { selector: config.rtl, direction: 'rtl' as const }
  ];
  
  customSelectors.forEach(({ selector: customSelector, direction }) => {
    if (customSelector && containsCustomSelector(selector, customSelector)) {
      const match = selector.indexOf(customSelector);
      if (match !== -1) {
        directionMatches.push({ direction, position: match });
      }
    }
  });
  
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
