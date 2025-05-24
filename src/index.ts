import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

interface LogicalScopeOptions {
  rtl?: {
    selector?: string;
  };
  ltr?: {
    selector?: string;
  };
}

/**
 * Check if a rule has logical properties
 */
function hasLogicalProperties(rule: Rule): boolean {
  return rule.some(decl => 
    decl.type === 'decl' && (
      decl.prop.includes('inline') || 
      decl.prop.includes('block') ||
      decl.prop.includes('inset')
    )
  );
}

/**
 * Check if selector is RTL specific
 */
function isRtlSelector(selector: string): boolean {
  return selector.includes(':dir(rtl)') || selector.includes('[dir="rtl"]') || selector.includes("[dir='rtl']");
}

/**
 * Check if selector is LTR specific
 */
function isLtrSelector(selector: string): boolean {
  return selector.includes(':dir(ltr)') || selector.includes('[dir="ltr"]') || selector.includes("[dir='ltr']");
}

/**
 * Clean direction selectors from a selector string
 */
function cleanDirectionSelectors(selector: string): string {
  return selector
    .replace(/:dir\(rtl\)/g, '')
    .replace(/:dir\(ltr\)/g, '')
    .replace(/\[dir=["']?rtl["']?\]/g, '')
    .replace(/\[dir=["']?ltr["']?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const logicalScope: PluginCreator<LogicalScopeOptions> = (opts = {}) => {
  const rtlSelector = opts.rtl?.selector || '[dir="rtl"]';
  const ltrSelector = opts.ltr?.selector || '[dir="ltr"]';

  return {
    postcssPlugin: 'postcss-logical-scope',
    
    async Once(root) {
      // Store processed nodes in order
      const processedNodes: postcss.Node[] = [];

      // Process each node in order
      for (const node of root.nodes || []) {
        if (node.type === 'rule') {
          const rule = node as Rule;
          const hasLtr = rule.selectors.some(isLtrSelector);
          const hasRtl = rule.selectors.some(isRtlSelector);
          const hasLogical = hasLogicalProperties(rule);

          if (hasLogical || hasLtr || hasRtl) {
            // Process rule for both directions
            const processedRules = await processRuleWithDirections(rule, hasLtr, hasRtl, hasLogical, ltrSelector, rtlSelector);
            processedNodes.push(...processedRules);
          } else {
            // Keep rule as-is
            processedNodes.push(node.clone());
          }
        } else if (node.type === 'atrule') {
          const atRule = node as AtRule;
          
          // Check if any rule inside needs processing
          let needsProcessing = false;
          atRule.walkRules(rule => {
            if (rule.selectors.some(isLtrSelector) || 
                rule.selectors.some(isRtlSelector) || 
                hasLogicalProperties(rule)) {
              needsProcessing = true;
              return false; // Stop walking
            }
          });

          if (needsProcessing) {
            const processedAtRule = await processAtRuleWithDirections(atRule, ltrSelector, rtlSelector);
            if (processedAtRule) {
              processedNodes.push(processedAtRule);
            }
          } else {
            processedNodes.push(node.clone());
          }
        } else {
          processedNodes.push(node.clone());
        }
      }

      // Rebuild root
      root.removeAll();
      processedNodes.forEach(node => root.append(node));

      // Merge rules with same selectors
      mergeRules(root);
    }
  };
};

/**
 * Process a rule for both LTR and RTL directions
 */
async function processRuleWithDirections(
  rule: Rule, 
  hasLtr: boolean, 
  hasRtl: boolean, 
  hasLogical: boolean,
  ltrSelector: string,
  rtlSelector: string
): Promise<Rule[]> {
  const results: Rule[] = [];

  // Process LTR
  if (hasLtr || (hasLogical && !hasRtl)) {
    const ltrRule = rule.clone();
    
    if (hasLtr) {
      ltrRule.selectors = rule.selectors
        .filter(sel => isLtrSelector(sel))
        .map(sel => cleanDirectionSelectors(sel));
    }
    
    if (ltrRule.selectors.length > 0) {
      // Apply logical transformation
      const ltrRoot = postcss.root();
      ltrRoot.append(ltrRule);
      
      const ltrTransformed = await postcss([
        logical({ inlineDirection: 'left-to-right' as any })
      ]).process(ltrRoot, { from: undefined });
      
      ltrTransformed.root.walkRules(transformedRule => {
        transformedRule.selectors = transformedRule.selectors.map(sel => `${ltrSelector} ${sel}`);
        results.push(transformedRule);
      });
    }
  }

  // Process RTL
  if (hasRtl || (hasLogical && !hasLtr)) {
    const rtlRule = rule.clone();
    
    if (hasRtl) {
      rtlRule.selectors = rule.selectors
        .filter(sel => isRtlSelector(sel))
        .map(sel => cleanDirectionSelectors(sel));
    }
    
    if (rtlRule.selectors.length > 0) {
      // Apply logical transformation
      const rtlRoot = postcss.root();
      rtlRoot.append(rtlRule);
      
      const rtlTransformed = await postcss([
        logical({ inlineDirection: 'right-to-left' as any })
      ]).process(rtlRoot, { from: undefined });
      
      rtlTransformed.root.walkRules(transformedRule => {
        transformedRule.selectors = transformedRule.selectors.map(sel => `${rtlSelector} ${sel}`);
        results.push(transformedRule);
      });
    }
  }

  return results;
}

/**
 * Process an at-rule for both LTR and RTL directions, merging them into a single at-rule
 */
async function processAtRuleWithDirections(
  atRule: AtRule, 
  ltrSelector: string, 
  rtlSelector: string
): Promise<AtRule | null> {
  const resultAtRule = atRule.clone();
  resultAtRule.removeAll();

  // Process each rule inside the at-rule
  for (const childNode of atRule.nodes || []) {
    if (childNode.type === 'rule') {
      const rule = childNode as Rule;
      const hasLtr = rule.selectors.some(isLtrSelector);
      const hasRtl = rule.selectors.some(isRtlSelector);
      const hasLogical = hasLogicalProperties(rule);

      if (!hasLogical && !hasLtr && !hasRtl) {
        resultAtRule.append(rule.clone());
      } else {
        const processedRules = await processRuleWithDirections(rule, hasLtr, hasRtl, hasLogical, ltrSelector, rtlSelector);
        processedRules.forEach(processedRule => {
          resultAtRule.append(processedRule);
        });
      }
    } else {
      resultAtRule.append(childNode.clone());
    }
  }

  return resultAtRule.nodes && resultAtRule.nodes.length > 0 ? resultAtRule : null;
}

/**
 * Merge rules with the same selector
 */
function mergeRules(root: Root) {
  function mergeRulesInContainer(container: Root | AtRule) {
    const ruleMap = new Map<string, Rule>();
    
    container.each(node => {
      if (node.type === 'rule') {
        const rule = node as Rule;
        const existingRule = ruleMap.get(rule.selector);
        
        if (existingRule) {
          // Merge declarations while preserving order
          rule.each(decl => {
            if (decl.type === 'decl') {
              // Check if property already exists
              let found = false;
              existingRule.each(existingDecl => {
                if (existingDecl.type === 'decl' && existingDecl.prop === decl.prop) {
                  // Update existing declaration value
                  existingDecl.value = decl.value;
                  found = true;
                }
              });
              // Add new declaration if not found
              if (!found) {
                existingRule.append(decl.clone());
              }
            }
          });
          rule.remove();
        } else {
          ruleMap.set(rule.selector, rule);
        }
      }
    });
  }
  
  mergeRulesInContainer(root);
  root.walkAtRules(atRule => mergeRulesInContainer(atRule));
}

logicalScope.postcss = true;

export default logicalScope;