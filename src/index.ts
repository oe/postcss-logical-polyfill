import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

// @ts-expect-error ignore missing types for postcss-logical
const supportedLogicalProperties = Object.keys(logical().Declaration) as string[];

export interface LogicalPolyfillOptions {
  rtl?: { selector?: string };
  ltr?: { selector?: string };
  outputOrder?: 'ltr-first' | 'rtl-first';
}

// Check if a property is a block-direction logical property (not affected by LTR/RTL)
function isBlockDirectionProperty(prop: string): boolean {
  // Block-direction properties use 'block' keyword and don't vary by text direction
  // These properties affect the vertical axis regardless of LTR/RTL
  if (prop.includes('block')) {
    return true;
  }
  
  // Specific inset properties that are block-direction only
  if (prop === 'inset-block' || prop === 'inset-block-start' || prop === 'inset-block-end') {
    return true;
  }
  
  // The plain 'inset' property affects all four directions, so it's not block-only
  // inset-inline* properties are inline-direction
  
  return false;
}

// Check if rule contains logical properties
function hasLogicalProperties(rule: Rule): boolean {
  return rule.some(
    (decl) =>
      decl.type === 'decl' && supportedLogicalProperties.includes(decl.prop)
  );
}

// Check if rule contains only block-direction logical properties
function hasOnlyBlockDirectionProperties(rule: Rule): boolean {
  const logicalDecls: any[] = [];
  rule.each(node => {
    if (node.type === 'decl' && (
      node.prop.includes('inline') || 
      node.prop.includes('block') ||
      node.prop.includes('inset') ||
      // Border radius logical properties
      node.prop.includes('border-start-') ||
      node.prop.includes('border-end-')
    )) {
      logicalDecls.push(node);
    }
  });
  
  if (logicalDecls.length === 0) return false;
  
  return logicalDecls.every(decl => 
    decl.type === 'decl' && isBlockDirectionProperty(decl.prop)
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

// Unified rule processing function - processes a single rule and returns transformed rules
async function processRule(rule: Rule, ltrSelector: string, rtlSelector: string, outputOrder: 'ltr-first' | 'rtl-first' = 'ltr-first'): Promise<Rule[]> {
  const hasLogical = hasLogicalProperties(rule);
  const hasLtr = rule.selectors.some(isLtrSelector);
  const hasRtl = rule.selectors.some(isRtlSelector);
  const hasOnlyBlockProps = hasOnlyBlockDirectionProperties(rule);
  
  // If rule has no logical properties and no direction selectors, return original rule unchanged
  if (!hasLogical && !hasLtr && !hasRtl) {
    return [rule.clone()];
  }
  
  const results: Rule[] = [];
  
  // If rule has only block-direction properties and no existing direction selectors,
  // generate a single rule without direction specificity
  if (hasOnlyBlockProps && !hasLtr && !hasRtl) {
    const blockRule = rule.clone();
    
    // Apply logical property transformation (using LTR as it doesn't matter for block properties)
    const tempRoot = postcss.root();
    tempRoot.append(blockRule);
    try {
      const transformed = await postcss([logical({ inlineDirection: 'left-to-right' as any })])
        .process(tempRoot, { from: undefined });
      
      transformed.root.walkRules(transformedRule => {
        results.push(transformedRule);
      });
    } catch (error) {
      console.warn('Failed to process block logical properties:', error);
      // Fallback: return the rule without transformation
      results.push(blockRule);
    }
    
    return results;
  }
  
  // For unscoped logical properties, try to optimize by separating common vs directional properties
  if (hasLogical && !hasLtr && !hasRtl) {
    // Generate both LTR and RTL versions to compare
    let ltrRule: Rule | null = null;
    let rtlRule: Rule | null = null;
    
    try {
      // Generate LTR version
      const ltrTestRule = rule.clone();
      const ltrTempRoot = postcss.root();
      ltrTempRoot.append(ltrTestRule);
      const ltrTransformed = await postcss([logical({ inlineDirection: 'left-to-right' as any })])
        .process(ltrTempRoot, { from: undefined });
      ltrTransformed.root.walkRules(transformedRule => {
        ltrRule = transformedRule;
      });
      
      // Generate RTL version
      const rtlTestRule = rule.clone();
      const rtlTempRoot = postcss.root();
      rtlTempRoot.append(rtlTestRule);
      const rtlTransformed = await postcss([logical({ inlineDirection: 'right-to-left' as any })])
        .process(rtlTempRoot, { from: undefined });
      rtlTransformed.root.walkRules(transformedRule => {
        rtlRule = transformedRule;
      });
      
      // If results are completely identical, return single rule
      if (ltrRule && rtlRule && rulesAreIdentical(ltrRule, rtlRule)) {
        results.push(ltrRule);
        return results;
      }
      
      // If results are different, try to optimize by separating common properties
      if (ltrRule && rtlRule) {
        const commonProps = new Map<string, string>();
        const ltrOnlyProps = new Map<string, string>();
        const rtlOnlyProps = new Map<string, string>();
        
        // Collect LTR properties
        const ltrProps = new Map<string, string>();
        (ltrRule as Rule).each((node: any) => {
          if (node.type === 'decl') {
            ltrProps.set(node.prop, node.value);
          }
        });
        
        // Collect RTL properties
        const rtlProps = new Map<string, string>();
        (rtlRule as Rule).each((node: any) => {
          if (node.type === 'decl') {
            rtlProps.set(node.prop, node.value);
          }
        });
        
        // Find common properties
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
        
        // Create rules based on what we found
        // 1. Common properties rule (no direction specificity)
        if (commonProps.size > 0) {
          const commonRule = rule.clone();
          commonRule.removeAll(); // Clear all declarations
          
          for (const [prop, value] of commonProps) {
            commonRule.append({ prop, value });
          }
          results.push(commonRule);
        }
        
        // 2. LTR-specific properties
        if (ltrOnlyProps.size > 0) {
          const ltrSpecificRule = rule.clone();
          ltrSpecificRule.removeAll();
          ltrSpecificRule.selectors = ltrSpecificRule.selectors.map(sel => `${ltrSelector} ${sel}`);
          
          for (const [prop, value] of ltrOnlyProps) {
            ltrSpecificRule.append({ prop, value });
          }
          results.push(ltrSpecificRule);
        }
        
        // 3. RTL-specific properties
        if (rtlOnlyProps.size > 0) {
          const rtlSpecificRule = rule.clone();
          rtlSpecificRule.removeAll();
          rtlSpecificRule.selectors = rtlSpecificRule.selectors.map(sel => `${rtlSelector} ${sel}`);
          
          for (const [prop, value] of rtlOnlyProps) {
            rtlSpecificRule.append({ prop, value });
          }
          results.push(rtlSpecificRule);
        }
        
        return results;
      }
    } catch (error) {
      console.warn('Failed to compare LTR/RTL logical properties:', error);
    }
    
    // If comparison failed, fall back to normal processing
  }
  
  // Helper function to process LTR rules
  const processLtrRules = async () => {
    if (hasLtr || (hasLogical && !hasLtr && !hasRtl)) {
      let selectors = rule.selectors;
      
      if (hasLtr) {
        // Filter LTR selectors and clean them
        selectors = rule.selectors.filter(isLtrSelector).map(cleanDirectionSelectors);
      }
      // else: if only logical properties, use original selectors
      
      if (selectors.length > 0) {
        const ltrRule = rule.clone();
        ltrRule.selectors = selectors;
        
        if (hasLogical) {
          // Apply logical property transformation
          const tempRoot = postcss.root();
          tempRoot.append(ltrRule);
          try {
            const transformed = await postcss([logical({ inlineDirection: 'left-to-right' as any })])
              .process(tempRoot, { from: undefined });
            
            transformed.root.walkRules(transformedRule => {
              transformedRule.selectors = transformedRule.selectors.map(sel => `${ltrSelector} ${sel}`);
              results.push(transformedRule);
            });
          } catch (error) {
            console.warn('Failed to process LTR logical properties:', error);
            ltrRule.selectors = ltrRule.selectors.map(sel => `${ltrSelector} ${sel}`);
            results.push(ltrRule);
          }
        } else {
          ltrRule.selectors = ltrRule.selectors.map(sel => `${ltrSelector} ${sel}`);
          results.push(ltrRule);
        }
      }
    }
  };

  // Helper function to process RTL rules
  const processRtlRules = async () => {
    if (hasRtl || (hasLogical && !hasLtr && !hasRtl)) {
      let selectors = rule.selectors;
      
      if (hasRtl) {
        // Filter RTL selectors and clean them
        selectors = rule.selectors.filter(isRtlSelector).map(cleanDirectionSelectors);
      }
      // else: if only logical properties, use original selectors
      
      if (selectors.length > 0) {
        const rtlRule = rule.clone();
        rtlRule.selectors = selectors;
        
        if (hasLogical) {
          // Apply logical property transformation
          const tempRoot = postcss.root();
          tempRoot.append(rtlRule);
          try {
            const transformed = await postcss([logical({ inlineDirection: 'right-to-left' as any })])
              .process(tempRoot, { from: undefined });
            
            transformed.root.walkRules(transformedRule => {
              transformedRule.selectors = transformedRule.selectors.map(sel => `${rtlSelector} ${sel}`);
              results.push(transformedRule);
            });
          } catch (error) {
            console.warn('Failed to process RTL logical properties:', error);
            rtlRule.selectors = rtlRule.selectors.map(sel => `${rtlSelector} ${sel}`);
            results.push(rtlRule);
          }
        } else {
          rtlRule.selectors = rtlRule.selectors.map(sel => `${rtlSelector} ${sel}`);
          results.push(rtlRule);
        }
      }
    }
  };

  // Process rules in the specified order
  if (outputOrder === 'ltr-first') {
    await processLtrRules();
    await processRtlRules();
  } else {
    await processRtlRules();
    await processLtrRules();
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
