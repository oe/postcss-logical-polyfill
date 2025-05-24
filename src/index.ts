import postcss, { PluginCreator, Root } from 'postcss';
import logical, { DirectionFlow } from 'postcss-logical';

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
     * Selector to add for LTR rules, defaults to none
     */
    selector?: string;
  };
}

/**
 * PostCSS plugin that extends postcss-logical to support directional contexts
 */
const logicalScope: PluginCreator<LogicalScopeOptions> = (opts = {}) => {
  const rtlSelector = opts.rtl?.selector || '[dir="rtl"]';
  const ltrSelector = opts.ltr?.selector;

  const ltrPlugin = logical({
    inlineDirection: 'left-to-right' as DirectionFlow,
  });
  const rtlPlugin = logical({
    inlineDirection: 'right-to-left' as DirectionFlow
  });

  return {
    postcssPlugin: 'postcss-logical-scope',
    async Once(root, result) {
      // Create separate roots for LTR and RTL processing
      const ltrRoot = root.clone();
      const rtlRoot = root.clone();
      
      // Process RTL-specific rules
      rtlRoot.walkRules(rule => {
        // Keep only RTL-specific rules and remove the directional selectors
        if (!rule.selector.includes(':dir(rtl)') && !rule.selector.includes('[dir="rtl"]')) {
          rule.remove();
        } else {
          // Clean up the selector by removing the directional part
          rule.selector = rule.selector
            .replace(/:dir\(rtl\)/g, '')
            .replace(/\[dir=["']rtl["']\]/g, '')
            .trim();
        }
      });

      // Process LTR rules (default)
      ltrRoot.walkRules(rule => {
        // Remove RTL-specific rules from LTR processing
        if (rule.selector.includes(':dir(rtl)') || rule.selector.includes('[dir="rtl"]')) {
          rule.remove();
        }
      });

      // Skip processing if there are no rules left
      if (rtlRoot.nodes?.length === 0 && ltrRoot.nodes?.length === 0) {
        return;
      }

      // Apply the logical property transformations with separate processors
      const rtlProcessor = postcss([rtlPlugin]);
      const ltrProcessor = postcss([ltrPlugin]);
      
      // Process both directions in parallel
      const [rtlResult, ltrResult] = await Promise.all([
        rtlRoot.nodes?.length > 0 ? rtlProcessor.process(rtlRoot, { from: undefined }) : { root: new Root() },
        ltrRoot.nodes?.length > 0 ? ltrProcessor.process(ltrRoot, { from: undefined }) : { root: new Root() }
      ]);
      
      // Clear the original root and populate with processed CSS
      root.removeAll();
      
      // Add LTR rules first
      if (ltrResult.root?.nodes?.length > 0) {
        if (ltrSelector) {
          // If LTR selector is provided, wrap all LTR rules
          ltrResult.root.walkRules(rule => {
            rule.selectors = rule.selectors.map(sel => `${ltrSelector} ${sel}`);
          });
        }
        ltrResult.root.each(node => {
          root.append(node.clone());
        });
      }
      
      // Then add RTL rules with dir="rtl" selector
      if (rtlResult.root?.nodes?.length > 0) {
        rtlResult.root.walkRules(rule => {
          rule.selectors = rule.selectors.map(sel => `${rtlSelector} ${sel}`);
        });
        rtlResult.root.each(node => {
          root.append(node.clone());
        });
      }
    }
  };
};

logicalScope.postcss = true;
export default logicalScope;
