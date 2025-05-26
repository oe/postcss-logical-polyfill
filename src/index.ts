/**
 * PostCSS Logical Scope Plugin
 * 
 * This plugin transforms CSS logical properties to physical properties with appropriate
 * direction-specific selectors for better browser compatibility.
 * 
 * Logical property processing has been modularized into ./logical-properties
 * Selector-related logic has been modularized into ./selector-utils for better maintainability.
 */
import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import {
  detectDirection,
  generateSelector,
  DirectionConfig,
} from './selector-utils';
import {
  hasLogicalProperties,
  applyLogicalTransformation,
  rulesAreIdentical,
  analyzePropertyDifferences,
} from './logical-properties';

// Skip processing of @keyframes and other special at-rules that shouldn't be transformed
const SKIP_AT_RULES = ['keyframes', 'font-face', 'counter-style', 'page'];

// Default configuration
const DEFAULT_CONFIG = {
  rtlSelector: '[dir="rtl"]',
  ltrSelector: '[dir="ltr"]',
  outputOrder: 'ltr-first' as const
} as const;

/**
 * Configuration options for the PostCSS Logical Scope plugin
 */
export interface LogicalPolyfillOptions {
  /**
   * RTL (Right-to-Left) direction configuration
   */
  rtl?: {
    /**
     * CSS selector used to target RTL content
     * @default '[dir="rtl"]'
     * @example ':dir(rtl)', '[dir="rtl"]', '.rtl'
     */
    selector?: string;
  };
  
  /**
   * LTR (Left-to-Right) direction configuration
   */
  ltr?: {
    /**
     * CSS selector used to target LTR content
     * @default '[dir="ltr"]'
     * @example ':dir(ltr)', '[dir="ltr"]', '.ltr'
     */
    selector?: string;
  };
  
  /**
   * Controls the order in which LTR and RTL rules are output in the generated CSS
   * - 'ltr-first': LTR rules appear before RTL rules (default)
   * - 'rtl-first': RTL rules appear before LTR rules
   * 
   * This can be useful for CSS specificity control or debugging purposes
   * @default 'ltr-first'
   */
  outputOrder?: 'ltr-first' | 'rtl-first';
}

// Categorize selectors by their direction context
function categorizeSelectors(selectors: string[], config: DirectionConfig) {
  const categories = { ltr: [], rtl: [], none: [] } as Record<string, string[]>;
  
  selectors.forEach(selector => {
    const direction = detectDirection(selector, config);
    categories[direction].push(selector);
  });

  return {
    ltrSelectors: categories.ltr,
    rtlSelectors: categories.rtl,
    noscopeSelectors: categories.none
  };
}

// Helper function to create a rule with specific properties and selectors
function createRuleWithPropertiesAndSelectors(
  baseRule: Rule, 
  selectors: string[], 
  properties: Map<string, string>
): Rule {
  const newRule = baseRule.clone();
  newRule.selectors = selectors;
  newRule.removeAll();
  properties.forEach((value, prop) => newRule.append({ prop, value }));
  return newRule;
}

// Helper function to clone a rule with new selectors
function cloneRuleWithSelectors(baseRule: Rule, selectors: string[]): Rule {
  const newRule = baseRule.clone();
  newRule.selectors = selectors;
  return newRule;
}

// Helper function to add rules in the specified output order
function addDirectionRules(
  results: Rule[], 
  rules: [Rule | null, Rule | null], 
  outputOrder: 'ltr-first' | 'rtl-first'
): void {
  const [ltrRule, rtlRule] = outputOrder === 'ltr-first' ? rules : [rules[1], rules[0]];
  if (ltrRule) results.push(ltrRule);
  if (rtlRule) results.push(rtlRule);
}

// Helper function to create direction-specific rules if properties exist
function createDirectionRule(
  baseRule: Rule,
  selectors: string[],
  properties: Map<string, string>,
  direction: 'ltr' | 'rtl',
  config: DirectionConfig
): Rule | null {
  if (properties.size === 0) return null;
  
  const scopedSelectors = selectors.map(sel => generateSelector(sel, direction, config));
  return createRuleWithPropertiesAndSelectors(baseRule, scopedSelectors, properties);
}

// Helper function to process direction-specific rules from property analysis
function processDirectionSpecificRules(
  rule: Rule,
  selectors: string[],
  ltrProps: Map<string, string>,
  rtlProps: Map<string, string>,
  config: DirectionConfig,
  outputOrder: 'ltr-first' | 'rtl-first'
): Rule[] {
  const directionRules: [Rule | null, Rule | null] = [
    createDirectionRule(rule, selectors, ltrProps, 'ltr', config),
    createDirectionRule(rule, selectors, rtlProps, 'rtl', config)
  ];

  const results: Rule[] = [];
  addDirectionRules(results, directionRules, outputOrder);
  return results;
}

// Optimized rule processing function - processes properties once, then generates rules by selector type
async function processRule(
  rule: Rule,
  ltrSelector: string,
  rtlSelector: string,
  outputOrder: 'ltr-first' | 'rtl-first' = 'ltr-first'
): Promise<Rule[]> {
  const config: DirectionConfig = { ltr: ltrSelector, rtl: rtlSelector };
  const results: Rule[] = [];

  // Categorize selectors by direction
  const { ltrSelectors, rtlSelectors, noscopeSelectors } = categorizeSelectors(rule.selectors, config);

  // Transform properties once for the entire rule
  const ltrTransformed = await applyLogicalTransformation(rule, 'ltr');
  const rtlTransformed = await applyLogicalTransformation(rule, 'rtl');

  if (!ltrTransformed || !rtlTransformed) {
    return []; // Transformation failure
  }

  // Process unscoped selectors
  if (noscopeSelectors.length > 0) {
    if (rulesAreIdentical(ltrTransformed, rtlTransformed)) {
      // Identical transformations - single rule needed
      results.push(cloneRuleWithSelectors(ltrTransformed, noscopeSelectors));
    } else {
      // Different transformations - analyze and create optimized rules
      const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(ltrTransformed, rtlTransformed);

      // Common properties rule
      if (commonProps.size > 0) {
        results.push(createRuleWithPropertiesAndSelectors(rule, noscopeSelectors, commonProps));
      }

      // Direction-specific rules
      results.push(...processDirectionSpecificRules(rule, noscopeSelectors, ltrOnlyProps, rtlOnlyProps, config, outputOrder));
    }
  }

  // Process already-scoped selectors
  const scopedRules = [
    { selectors: ltrSelectors, transformedRule: ltrTransformed },
    { selectors: rtlSelectors, transformedRule: rtlTransformed }
  ];

  scopedRules.forEach(({ selectors, transformedRule }) => {
    if (selectors.length > 0) {
      results.push(cloneRuleWithSelectors(transformedRule, selectors));
    }
  });

  return results;
}

const logicalPolyfill: PluginCreator<LogicalPolyfillOptions> = (opts = {}) => {
  const rtlSelector = opts.rtl?.selector || DEFAULT_CONFIG.rtlSelector;
  const ltrSelector = opts.ltr?.selector || DEFAULT_CONFIG.ltrSelector;
  const outputOrder = opts.outputOrder || DEFAULT_CONFIG.outputOrder;

  return {
    postcssPlugin: 'postcss-logical-polyfill',
    
    async Once(root) {
      // Simple approach: process rules and replace them in place
      await processAllRules(root, ltrSelector, rtlSelector, outputOrder);
    }
  };
};

// Process all rules recursively, maintaining structure
async function processAllRules(container: Root | AtRule, ltrSelector: string, rtlSelector: string, outputOrder: 'ltr-first' | 'rtl-first') {
  const rulesToProcess: Rule[] = [];
  
  // First pass: collect rules that need processing
  const promises: Promise<void>[] = [];

  container.each(node => {
    if (node.type === 'rule') {
      const hasLogical = hasLogicalProperties(node);
      if (hasLogical) rulesToProcess.push(node);
    } else if (node.type === 'atrule') {
      // Don't process these at-rules, keep them as is
      if (SKIP_AT_RULES.includes((node as AtRule).name)) return;
      
      // Recursively process regular at-rules like media queries
      // Store the promise for later awaiting
      promises.push(processAllRules(node, ltrSelector, rtlSelector, outputOrder));
    }
  });
  
  // Wait for all nested at-rules to be processed
  await Promise.all(promises);
  
  // Second pass: process rules
  for (const rule of rulesToProcess) {
    const processedRules = await processRule(rule, ltrSelector, rtlSelector, outputOrder);
    
    // Replace the original rule with processed rules
    if (processedRules.length > 0) {
      // Insert all new rules before the original rule
      processedRules.forEach(newRule => {
        container.insertBefore(rule, newRule);
      });
      
      // Remove the original rule
      rule.remove();
    }
  }
}

logicalPolyfill.postcss = true;

export default logicalPolyfill;
