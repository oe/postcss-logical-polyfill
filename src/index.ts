import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

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
  return rule.some(decl => 
    decl.type === 'decl' && (
      decl.prop.includes('inline') || 
      decl.prop.includes('block') ||
      decl.prop.includes('inset') ||
      // Border radius logical properties
      decl.prop.includes('border-start-') ||
      decl.prop.includes('border-end-')
    )
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
            // Fallback: add the rule without transformation
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
            // Fallback: add the rule without transformation
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
      // Collect all rules that need processing (including those nested in at-rules)
      const rulesToProcess: { rule: Rule; parent: Root | AtRule }[] = [];
      
      // Use walkRules to traverse all rules regardless of nesting level
      root.walkRules(rule => {
        const hasLogical = hasLogicalProperties(rule);
        const hasLtr = rule.selectors.some(isLtrSelector);
        const hasRtl = rule.selectors.some(isRtlSelector);
        
        if (hasLogical || hasLtr || hasRtl) {
          rulesToProcess.push({ rule, parent: rule.parent as Root | AtRule });
        }
      });
      
      // Process all rules
      for (const { rule, parent } of rulesToProcess) {
        const processedRules = await processRule(rule, ltrSelector, rtlSelector, outputOrder);
        
        // Remove original rule
        rule.remove();
        
        // Insert new rules
        processedRules.forEach(newRule => {
          parent.append(newRule);
        });
      }
      
      // Improved rule merging - correctly handle property overrides
      const ruleMap = new Map<string, Rule>();
      root.walkRules(rule => {
        const key = rule.selector;
        const existing = ruleMap.get(key);
        
        if (existing) {
          // Merge declarations, later properties override earlier ones
          rule.each(decl => {
            if (decl.type === 'decl') {
              // Check if property already exists
              let found = false;
              existing.each(existingDecl => {
                if (existingDecl.type === 'decl' && existingDecl.prop === decl.prop) {
                  // Override existing value
                  existingDecl.value = decl.value;
                  found = true;
                  return false; // Stop iteration
                }
              });
              
              // If property not found, add new one
              if (!found) {
                existing.append(decl.clone());
              }
            }
          });
          rule.remove();
        } else {
          ruleMap.set(key, rule);
        }
      });
    }
  };
};

logicalPolyfill.postcss = true;

export default logicalPolyfill;
