/**
 * PostCSS Logical Scope Plugin
 * 
 * This plugin transforms CSS logical properties to physical properties with appropriate
 * direction-specific selectors for better browser compatibility.
 * 
 * Selector-related logic has been modularized into ./selector-utils for better maintainability.
 */
import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';
import {
  detectDirection,
  generateSelector,
  DirectionConfig,
} from './selector-utils';

// Skip processing of @keyframes and other special at-rules that shouldn't be transformed
const SKIP_AT_RULES = ['keyframes', 'font-face', 'counter-style', 'page'];

const ltrProcessor = logical({ inlineDirection: 'left-to-right' as any });
const rtlProcessor = logical({ inlineDirection: 'right-to-left' as any });

const supportedLogicalProperties = Object.keys(
  // @ts-expect-error ignore missing types for postcss-logical
  ltrProcessor.Declaration
) as string[];

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

// Check if rule contains logical properties
function hasLogicalProperties(rule: Rule): boolean {
  return rule.some(
    (decl) =>
      decl.type === 'decl' && supportedLogicalProperties.includes(decl.prop)
  );
}

// Helper function to compare if two rules have identical declarations
function rulesAreIdentical(rule1: Rule, rule2: Rule): boolean {
  const decls1 = new Map<string, string>();
  const decls2 = new Map<string, string>();
  
  rule1.each(node => {
    if (node.type === 'decl') {
      decls1.set(node.prop, node.value);
    }
  });
  
  rule2.each(node => {
    if (node.type === 'decl') {
      decls2.set(node.prop, node.value);
    }
  });
  
  if (decls1.size !== decls2.size) return false;
  
  for (const [prop, value] of decls1) {
    if (decls2.get(prop) !== value) return false;
  }
  
  return true;
}

// Apply logical property transformation to a rule
async function applyLogicalTransformation(rule: Rule, processor: any): Promise<Rule | null> {
  const tempRoot = postcss.root();
  tempRoot.append(rule.clone());
  
  try {
    const transformed = await postcss([processor]).process(tempRoot, { from: undefined });
    let transformedRule: Rule | null = null;
    transformed.root.walkRules(r => {
      transformedRule = r;
    });
    return transformedRule;
  } catch (error) {
    console.warn('Failed to process logical properties:', error);
    return null;
  }
}

// Extract declarations from a rule into a Map
function extractDeclarations(rule: Rule): Map<string, string> {
  const declarations = new Map<string, string>();
  rule.each(node => {
    if (node.type === 'decl') {
      declarations.set(node.prop, node.value);
    }
  });
  return declarations;
}

// Analyze property differences between LTR and RTL rules
function analyzePropertyDifferences(ltrRule: Rule, rtlRule: Rule) {
  const ltrProps = extractDeclarations(ltrRule);
  const rtlProps = extractDeclarations(rtlRule);
  
  const commonProps = new Map<string, string>();
  const ltrOnlyProps = new Map<string, string>();
  const rtlOnlyProps = new Map<string, string>();

  // Find common and LTR-only properties
  for (const [prop, value] of ltrProps) {
    if (rtlProps.has(prop) && rtlProps.get(prop) === value) {
      commonProps.set(prop, value);
    } else {
      ltrOnlyProps.set(prop, value);
    }
  }

  // Find RTL-only properties
  for (const [prop, value] of rtlProps) {
    if (!commonProps.has(prop)) {
      rtlOnlyProps.set(prop, value);
    }
  }

  return { commonProps, ltrOnlyProps, rtlOnlyProps };
}

// Create a rule with specific properties
function createRuleWithProperties(baseRule: Rule, properties: Map<string, string>, selectorTransform?: (sel: string) => string): Rule {
  const newRule = baseRule.clone();
  newRule.removeAll();
  
  if (selectorTransform) {
    newRule.selectors = newRule.selectors.map(selectorTransform);
  }
  
  for (const [prop, value] of properties) {
    newRule.append({ prop, value });
  }
  
  return newRule;
}

// Unified rule processing function - processes a single rule and returns transformed rules
async function processRule(
  rule: Rule,
  ltrSelector: string,
  rtlSelector: string,
  outputOrder: 'ltr-first' | 'rtl-first' = 'ltr-first'
): Promise<Rule[]> {
  const config: DirectionConfig = { ltr: ltrSelector, rtl: rtlSelector };
  const results: Rule[] = [];

  // Categorize selectors by direction
  const ltrSelectors: string[] = [];
  const rtlSelectors: string[] = [];
  const noscopeSelectors: string[] = [];

  rule.selectors.forEach(selector => {
    const direction = detectDirection(selector, config);
    switch (direction) {
      case 'ltr':
        ltrSelectors.push(selector);
        break;
      case 'rtl':
        rtlSelectors.push(selector);
        break;
      case 'none':
        noscopeSelectors.push(selector);
        break;
    }
  });

  // Process unscoped selectors (need both LTR and RTL)
  if (noscopeSelectors.length > 0) {
    const unscopedRule = rule.clone();
    unscopedRule.selectors = noscopeSelectors;

    const ltrTransformed = await applyLogicalTransformation(unscopedRule, ltrProcessor);
    const rtlTransformed = await applyLogicalTransformation(unscopedRule, rtlProcessor);

    if (!ltrTransformed || !rtlTransformed) {
      // 转换失败的回退处理
      return [];
    }

    // 优化：如果 LTR 和 RTL 转换结果相同（如 block-only 属性），返回单个规则
    if (rulesAreIdentical(ltrTransformed, rtlTransformed)) {
      results.push(ltrTransformed);
    } else {
      // 分析属性差异并创建优化的规则
      const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(ltrTransformed, rtlTransformed);

      // 添加通用属性（无方向特异性）
      if (commonProps.size > 0) {
        results.push(createRuleWithProperties(unscopedRule, commonProps));
      }

      // 添加方向特定属性，使用新的 generateSelector API
      const ltrRule = ltrOnlyProps.size > 0 ? createRuleWithProperties(
        unscopedRule, 
        ltrOnlyProps, 
        sel => generateSelector(sel, 'ltr', config)
      ) : null;
      
      const rtlRule = rtlOnlyProps.size > 0 ? createRuleWithProperties(
        unscopedRule, 
        rtlOnlyProps, 
        sel => generateSelector(sel, 'rtl', config)
      ) : null;

      // 按指定顺序添加方向规则
      if (outputOrder === 'ltr-first') {
        if (ltrRule) results.push(ltrRule);
        if (rtlRule) results.push(rtlRule);
      } else {
        if (rtlRule) results.push(rtlRule);
        if (ltrRule) results.push(ltrRule);
      }
    }
  }

  // Process LTR-scoped selectors
  if (ltrSelectors.length > 0) {
    const ltrRule = rule.clone();
    ltrRule.selectors = ltrSelectors;
    
    const ltrTransformed = await applyLogicalTransformation(ltrRule, ltrProcessor);
    if (ltrTransformed) {
      // For selectors that already have direction context, keep them as-is
      // The detectDirection function already confirmed these are LTR selectors
      results.push(ltrTransformed);
    }
  }

  // Process RTL-scoped selectors
  if (rtlSelectors.length > 0) {
    const rtlRule = rule.clone();
    rtlRule.selectors = rtlSelectors;
    
    const rtlTransformed = await applyLogicalTransformation(rtlRule, rtlProcessor);
    if (rtlTransformed) {
      // For selectors that already have direction context, keep them as-is
      // The detectDirection function already confirmed these are RTL selectors
      results.push(rtlTransformed);
    }
  }

  return results;
}

const logicalPolyfill: PluginCreator<LogicalPolyfillOptions> = (opts = {}) => {
  const rtlSelector = opts.rtl?.selector || '[dir="rtl"]';
  const ltrSelector = opts.ltr?.selector || '[dir="ltr"]';
  const outputOrder = opts.outputOrder || 'ltr-first';

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
