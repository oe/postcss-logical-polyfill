import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

interface LogicalScopeOptions {
  /**
   * Additional configuration for RTL processing
   */
  rtl?: {
    /**
     * Selector to add for RTL rules, defaults to '[dir="rtl"]'
     */
    selector?: string;
  };
  /**
   * Additional configuration for LTR processing
   */
  ltr?: {
    /**
     * Selector to add for LTR rules, defaults to '[dir="ltr"]'
     */
    selector?: string;
  };
}

/**
 * Check if a rule has logical properties that need to be transformed
 */
function hasLogicalProperties(rule: Rule): boolean {
  let found = false;
  rule.walkDecls(decl => {
    if (
      decl.prop.includes('inline') || 
      decl.prop.includes('block') ||
      decl.prop.includes('inset')
    ) {
      found = true;
      return false; // stop walking
    }
  });
  return found;
}

/**
 * Check if a selector already has a direction indicator
 */
function hasDirectionSelector(selector: string, dirSelector: string): boolean {
  return selector.includes(dirSelector) || 
         selector.includes(':dir(') || 
         selector.includes('[dir=');
}

/**
 * Determines if a selector is RTL specific
 */
function isRtlSelector(selector: string): boolean {
  return selector.includes(':dir(rtl)') || 
         /\[dir=["']rtl["']\]/.test(selector) ||
         /\[dir=rtl\]/.test(selector);
}

/**
 * Determines if a selector is LTR specific
 */
function isLtrSelector(selector: string): boolean {
  return selector.includes(':dir(ltr)') || 
         /\[dir=["']ltr["']\]/.test(selector) ||
         /\[dir=ltr\]/.test(selector);
}

/**
 * Processes a given CSS root to transform logical properties to physical properties with direction support
 */
const processRoot = (root: Root, direction: 'ltr' | 'rtl', dirSelector: string) => {
  // Create a clone to avoid modifying the input
  const processedRoot = root.clone();
  
  // Process rules to replace :dir() and [dir] selectors
  processedRoot.walkRules(rule => {
    const newSelectors: string[] = [];
    
    rule.selectors.forEach(selector => {
      // Determine if this selector is direction-specific
      const isSpecificToRtl = isRtlSelector(selector);
      const isSpecificToLtr = isLtrSelector(selector);
      
      // Skip selectors for the wrong direction
      if ((direction === 'ltr' && isSpecificToRtl) || 
          (direction === 'rtl' && isSpecificToLtr)) {
        return;
      }
      
      // Remove direction pseudo-classes and attributes
      let newSelector = selector
        .replace(/:dir\(rtl\)/g, '')
        .replace(/:dir\(ltr\)/g, '')
        .replace(/\[dir=["']rtl["']\]/g, '')
        .replace(/\[dir=["']ltr["']\]/g, '')
        .replace(/\[dir=rtl\]/g, '')
        .replace(/\[dir=ltr\]/g, '');
      
      // Clean up the selector
      newSelector = newSelector.trim();
      if (!newSelector) {
        newSelector = '*';
      }
      
      // Add direction selector if needed
      const hasLogical = hasLogicalProperties(rule);
      if (hasLogical) {
        const isDirectionSpecific = isSpecificToRtl || isSpecificToLtr;
        const needsDirectionSelector = !hasDirectionSelector(newSelector, dirSelector);
        
        if (isDirectionSpecific || needsDirectionSelector) {
          newSelector = `${dirSelector} ${newSelector}`;
        }
      }
      
      // Clean up any potential double spaces
      newSelector = newSelector.replace(/\s+/g, ' ').trim();
      
      // Add to new selectors
      if (newSelector && newSelector !== '') {
        newSelectors.push(newSelector);
      }
    });
    
    // Update selectors or remove rule if no selectors remain
    if (newSelectors.length > 0) {
      rule.selectors = newSelectors;
    } else {
      rule.remove();
    }
  });
  
  return processedRoot;
};

/**
 * PostCSS plugin that transforms logical properties to physical properties
 * for both LTR and RTL contexts.
 */
const logicalScope: PluginCreator<LogicalScopeOptions> = (opts = {}) => {
  // Get custom selectors or use defaults
  const rtlSelector = opts.rtl?.selector || '[dir="rtl"]';
  const ltrSelector = opts.ltr?.selector || '[dir="ltr"]';

  return {
    postcssPlugin: 'postcss-logical-scope',
    
    async Once(root) {
      // Create a copy for rules without logical properties
      const nonLogicalRoot = postcss.root();
      
      // First, separate rules with and without logical properties
      root.each(node => {
        if (node.type === 'rule') {
          if (!hasLogicalProperties(node)) {
            nonLogicalRoot.append(node.clone());
          }
        } else if (node.type === 'atrule') {
          let hasLogical = false;
          
          node.walkRules(rule => {
            if (hasLogicalProperties(rule)) {
              hasLogical = true;
              return false; // stop walking
            }
          });
          
          if (!hasLogical) {
            nonLogicalRoot.append(node.clone());
          }
        }
      });
      
      // Process for LTR
      const ltrRoot = processRoot(root, 'ltr', ltrSelector);
      const ltrResult = await postcss([
        logical({ inlineDirection: 'left-to-right' as any })
      ]).process(ltrRoot, { from: undefined });
      
      // Process for RTL
      const rtlRoot = processRoot(root, 'rtl', rtlSelector);
      const rtlResult = await postcss([
        logical({ inlineDirection: 'right-to-left' as any })
      ]).process(rtlRoot, { from: undefined });
      
      // Combine results
      root.removeAll();
      
      // Add non-logical rules first
      nonLogicalRoot.nodes.forEach(node => {
        root.append(node.clone());
      });
      
      // Add LTR rules
      ltrResult.root.nodes.forEach(node => {
        root.append(node.clone());
      });
      
      // Add RTL rules
      rtlResult.root.nodes.forEach(node => {
        root.append(node.clone());
      });
    }
  };
};

logicalScope.postcss = true;

export default logicalScope;