import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

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

// Check if selector has RTL direction specificity
function isRtlSelector(selector: string): boolean {
  return selector.includes(':dir(rtl)') || selector.includes('[dir="rtl"]') || selector.includes("[dir='rtl']");
}

// Check if selector has LTR direction specificity  
function isLtrSelector(selector: string): boolean {
  return selector.includes(':dir(ltr)') || selector.includes('[dir="ltr"]') || selector.includes("[dir='ltr']");
}

// Determine the effective direction of a selector based on CSS specificity
function getEffectiveDirection(selector: string): 'ltr' | 'rtl' | 'none' {
  // More flexible regex patterns to handle various formatting
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
  
  // Find LTR matches
  ltrPatterns.forEach(pattern => {
    const matches = selector.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of matches) {
      if (match.index !== undefined) {
        directionMatches.push({ direction: 'ltr', position: match.index });
      }
    }
  });
  
  // Find RTL matches
  rtlPatterns.forEach(pattern => {
    const matches = selector.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of matches) {
      if (match.index !== undefined) {
        directionMatches.push({ direction: 'rtl', position: match.index });
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

// Remove direction selectors from a selector string
function cleanDirectionSelectors(selector: string): string {
  return selector
    .replace(/:dir\(\s*rtl\s*\)/g, '')
    .replace(/:dir\(\s*ltr\s*\)/g, '')
    .replace(/\[\s*dir\s*=\s*["']?rtl["']?\s*\]/g, '')
    .replace(/\[\s*dir\s*=\s*["']?ltr["']?\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if a selector already contains direction information
function hasDirectionSelectors(selector: string): boolean {
  return /:dir\(\s*(ltr|rtl)\s*\)/.test(selector) || 
         /\[\s*dir\s*=\s*["']?(ltr|rtl)["']?\s*\]/.test(selector);
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
  // Analyze each selector to determine its effective direction
  const selectorDirections = rule.selectors.map(selector => ({
    selector,
    direction: getEffectiveDirection(selector)
  }));

  const ltrSelectors = selectorDirections.filter(s => s.direction === 'ltr');
  const rtlSelectors = selectorDirections.filter(s => s.direction === 'rtl');
  const noscopeSelectors = selectorDirections.filter(s => s.direction === 'none');

  const results: Rule[] = [];

  // Process unscoped selectors (need both LTR and RTL)
  if (noscopeSelectors.length > 0) {
    const unscopedRule = rule.clone();
    unscopedRule.selectors = noscopeSelectors.map(s => s.selector);

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

      // 添加方向特定属性
      const ltrRule = ltrOnlyProps.size > 0 ? createRuleWithProperties(unscopedRule, ltrOnlyProps, sel => `${ltrSelector} ${sel}`) : null;
      const rtlRule = rtlOnlyProps.size > 0 ? createRuleWithProperties(unscopedRule, rtlOnlyProps, sel => `${rtlSelector} ${sel}`) : null;

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
    ltrRule.selectors = ltrSelectors.map(s => s.selector);
    
    const ltrTransformed = await applyLogicalTransformation(ltrRule, ltrProcessor);
    if (ltrTransformed) {
      // Only add direction selector prefix if the original doesn't already have direction info
      ltrTransformed.selectors = ltrTransformed.selectors.map(sel => {
        const originalSelector = ltrSelectors.find(s => 
          cleanDirectionSelectors(s.selector) === cleanDirectionSelectors(sel)
        )?.selector || sel;
        
        return hasDirectionSelectors(originalSelector) 
          ? originalSelector 
          : `${ltrSelector} ${cleanDirectionSelectors(originalSelector)}`;
      });
      results.push(ltrTransformed);
    }
  }

  // Process RTL-scoped selectors
  if (rtlSelectors.length > 0) {
    const rtlRule = rule.clone();
    rtlRule.selectors = rtlSelectors.map(s => s.selector);
    
    const rtlTransformed = await applyLogicalTransformation(rtlRule, rtlProcessor);
    if (rtlTransformed) {
      // Only add direction selector prefix if the original doesn't already have direction info
      rtlTransformed.selectors = rtlTransformed.selectors.map(sel => {
        const originalSelector = rtlSelectors.find(s => 
          cleanDirectionSelectors(s.selector) === cleanDirectionSelectors(sel)
        )?.selector || sel;
        
        return hasDirectionSelectors(originalSelector) 
          ? originalSelector 
          : `${rtlSelector} ${cleanDirectionSelectors(originalSelector)}`;
      });
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
