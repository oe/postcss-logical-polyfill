import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

const ltrProcessor = logical({ inlineDirection: 'left-to-right' as any });
const rtlProcessor = logical({ inlineDirection: 'right-to-left' as any });

const supportedLogicalProperties = Object.keys(
  // @ts-expect-error ignore missing types for postcss-logical
  ltrProcessor.Declaration
) as string[];

export interface LogicalPolyfillOptions {
  rtl?: { selector?: string };
  ltr?: { selector?: string };
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

// Remove direction selectors from a selector string
function cleanDirectionSelectors(selector: string): string {
  return selector
    .replace(/:dir\(rtl\)/g, '')
    .replace(/:dir\(ltr\)/g, '')
    .replace(/\[dir=["']?rtl["']?\]/g, '')
    .replace(/\[dir=["']?ltr["']?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

// Process directional rule (LTR or RTL)
async function processDirectionalRule(
  rule: Rule,
  directionSelector: string,
  processor: any,
  filterFn: (selector: string) => boolean,
  hasDirection: boolean,
  hasNoScope: boolean
): Promise<Rule[]> {
  if (!hasDirection && !hasNoScope) {
    return [];
  }

  let selectors = rule.selectors;
  
  if (hasDirection) {
    // Filter and clean direction-specific selectors
    selectors = rule.selectors.filter(filterFn).map(cleanDirectionSelectors);
  }
  
  if (selectors.length === 0) {
    return [];
  }

  const ruleToProcess = rule.clone();
  ruleToProcess.selectors = selectors;
  
  // Apply logical property transformation
  const transformedRule = await applyLogicalTransformation(ruleToProcess, processor);
  if (transformedRule) {
    transformedRule.selectors = transformedRule.selectors.map(sel => `${directionSelector} ${sel}`);
    return [transformedRule];
  } else {
    // Fallback: just add direction selector without transformation
    ruleToProcess.selectors = ruleToProcess.selectors.map(sel => `${directionSelector} ${sel}`);
    return [ruleToProcess];
  }
}

// Try to optimize unscoped logical properties by separating common vs directional properties
async function tryOptimizeUnscopedLogicalProperties(
  rule: Rule,
  ltrSelector: string,
  rtlSelector: string,
  outputOrder: 'ltr-first' | 'rtl-first' = 'ltr-first'
): Promise<Rule[] | null> {
  try {
    // Generate both LTR and RTL versions
    const ltrTransformed = await applyLogicalTransformation(rule, ltrProcessor);
    const rtlTransformed = await applyLogicalTransformation(rule, rtlProcessor);

    if (!ltrTransformed || !rtlTransformed) {
      return null;
    }

    // If results are identical, return single rule
    if (rulesAreIdentical(ltrTransformed, rtlTransformed)) {
      return [ltrTransformed];
    }

    // Analyze differences and create optimized rules
    const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(ltrTransformed, rtlTransformed);
    const results: Rule[] = [];

    // Add common properties rule (no direction specificity)
    if (commonProps.size > 0) {
      results.push(createRuleWithProperties(rule, commonProps));
    }

    // Add directional properties according to outputOrder
    const ltrDirectionalRule = ltrOnlyProps.size > 0 ? createRuleWithProperties(rule, ltrOnlyProps, sel => `${ltrSelector} ${sel}`) : null;
    const rtlDirectionalRule = rtlOnlyProps.size > 0 ? createRuleWithProperties(rule, rtlOnlyProps, sel => `${rtlSelector} ${sel}`) : null;

    if (outputOrder === 'ltr-first') {
      if (ltrDirectionalRule) results.push(ltrDirectionalRule);
      if (rtlDirectionalRule) results.push(rtlDirectionalRule);
    } else {
      if (rtlDirectionalRule) results.push(rtlDirectionalRule);
      if (ltrDirectionalRule) results.push(ltrDirectionalRule);
    }

    return results;
  } catch (error) {
    console.warn('Failed to optimize unscoped logical properties:', error);
    return null;
  }
}

// Unified rule processing function - processes a single rule and returns transformed rules
async function processRule(
  rule: Rule,
  ltrSelector: string,
  rtlSelector: string,
  outputOrder: 'ltr-first' | 'rtl-first' = 'ltr-first'
): Promise<Rule[]> {
  const hasLogical = hasLogicalProperties(rule);
  if (!hasLogical) return [rule];

  const hasLtr = rule.selectors.some(isLtrSelector);
  const hasRtl = rule.selectors.some(isRtlSelector);
  const hasNoScope = !hasLtr && !hasRtl;

  // For unscoped logical properties, try to optimize
  if (hasNoScope) {
    const optimizedRules = await tryOptimizeUnscopedLogicalProperties(rule, ltrSelector, rtlSelector, outputOrder);
    if (optimizedRules) {
      return optimizedRules;
    }
    // If optimization failed, fall back to normal processing
  }

  // Process scoped rules or fallback for unscoped
  const results: Rule[] = [];
  
  const processInOrder = async () => {
    const ltrRules = await processDirectionalRule(rule, ltrSelector, ltrProcessor, isLtrSelector, hasLtr, hasNoScope);
    const rtlRules = await processDirectionalRule(rule, rtlSelector, rtlProcessor, isRtlSelector, hasRtl, hasNoScope);
    
    if (outputOrder === 'ltr-first') {
      results.push(...ltrRules, ...rtlRules);
    } else {
      results.push(...rtlRules, ...ltrRules);
    }
  };

  await processInOrder();
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
  container.each(node => {
    if (node.type === 'rule') {
      const hasLogical = hasLogicalProperties(node);
      const hasLtr = node.selectors.some(isLtrSelector);
      const hasRtl = node.selectors.some(isRtlSelector);
      
      if (hasLogical || hasLtr || hasRtl) {
        rulesToProcess.push(node);
      }
    } else if (node.type === 'atrule') {
      // Recursively process at-rules like media queries
      processAllRules(node, ltrSelector, rtlSelector, outputOrder);
    }
  });
  
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
