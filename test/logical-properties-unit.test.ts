import { describe, test, expect, vi } from 'vitest';
import postcss, { Rule } from 'postcss';
import {
  hasLogicalProperties,
  applyLogicalTransformation,
  rulesAreIdentical,
  analyzePropertyDifferences
} from '../src/logical-properties';

/**
 * Clean unit tests for logical-properties.ts module
 * These tests focus on the public API functions only
 */

describe('logical-properties module - Public API Tests', () => {
  
  describe('hasLogicalProperties', () => {
    test('should detect logical properties in a rule', () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; }');
      const rule = root.first as Rule;
      
      expect(hasLogicalProperties(rule)).toBe(true);
    });

    test('should return false for rules without logical properties', () => {
      const root = postcss.parse('.test { margin-left: 10px; padding-top: 20px; }');
      const rule = root.first as Rule;
      
      expect(hasLogicalProperties(rule)).toBe(false);
    });

    test('should return false for empty rules', () => {
      const root = postcss.parse('.test { }');
      const rule = root.first as Rule;
      
      expect(hasLogicalProperties(rule)).toBe(false);
    });
  });

  describe('applyLogicalTransformation', () => {
    test('should transform logical properties to LTR physical properties', async () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; margin-inline-end: 20px; }');
      const rule = root.first as Rule;
      
      const transformed = await applyLogicalTransformation(rule, 'ltr');
      
      expect(transformed).not.toBeNull();
      if (transformed) {
        const css = transformed.toString();
        expect(css).toContain('margin-left: 10px');
        expect(css).toContain('margin-right: 20px');
      }
    });

    test('should transform logical properties to RTL physical properties', async () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; margin-inline-end: 20px; }');
      const rule = root.first as Rule;
      
      const transformed = await applyLogicalTransformation(rule, 'rtl');
      
      expect(transformed).not.toBeNull();
      if (transformed) {
        const css = transformed.toString();
        expect(css).toContain('margin-right: 10px');  // start becomes right in RTL
        expect(css).toContain('margin-left: 20px');   // end becomes left in RTL
      }
    });

    test('should preserve non-logical properties', async () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; color: red; }');
      const rule = root.first as Rule;
      
      const transformed = await applyLogicalTransformation(rule, 'ltr');
      
      expect(transformed).not.toBeNull();
      if (transformed) {
        const css = transformed.toString();
        expect(css).toContain('margin-left: 10px');
        expect(css).toContain('color: red');
      }
    });

    test('should handle PostCSS processing errors gracefully', async () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; }');
      const rule = root.first as Rule;
      
      // Mock console.warn to capture the warning message
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Create a malformed rule that might cause postcss-logical to fail
      // by creating a rule with invalid CSS structure
      const malformedRule = {
        ...rule,
        clone: () => {
          const cloned = rule.clone();
          // Inject something that might cause processing to fail
          cloned.append({ prop: 'margin-inline-start', value: 'invalid(() {' });
          return cloned;
        }
      } as Rule;
      
      try {
        const result = await applyLogicalTransformation(malformedRule, 'ltr');
        
        // The function should handle the error gracefully
        // It might still return a result or return null depending on the error
        // The important thing is that it doesn't crash
        expect(typeof result).toBe('object'); // either Rule or null
        
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('rulesAreIdentical', () => {
    test('should return true for identical rules', () => {
      const root1 = postcss.parse('.test1 { color: red; margin: 10px; }');
      const root2 = postcss.parse('.test2 { color: red; margin: 10px; }');
      const rule1 = root1.first as Rule;
      const rule2 = root2.first as Rule;
      
      expect(rulesAreIdentical(rule1, rule2)).toBe(true);
    });

    test('should return false for rules with different properties', () => {
      const root1 = postcss.parse('.test1 { color: red; margin: 10px; }');
      const root2 = postcss.parse('.test2 { color: blue; margin: 10px; }');
      const rule1 = root1.first as Rule;
      const rule2 = root2.first as Rule;
      
      expect(rulesAreIdentical(rule1, rule2)).toBe(false);
    });

    test('should handle important flags correctly', () => {
      const root1 = postcss.parse('.test1 { color: red !important; margin: 10px; }');
      const root2 = postcss.parse('.test2 { color: red !important; margin: 10px; }');
      const rule1 = root1.first as Rule;
      const rule2 = root2.first as Rule;
      
      expect(rulesAreIdentical(rule1, rule2)).toBe(true);
    });
  });

  describe('analyzePropertyDifferences', () => {
    test('should identify common and different properties', () => {
      const root1 = postcss.parse('.test1 { color: red; margin: 10px; font-size: 16px; }');
      const root2 = postcss.parse('.test2 { color: red; padding: 5px; font-size: 16px; }');
      const rule1 = root1.first as Rule;
      const rule2 = root2.first as Rule;
      
      const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(rule1, rule2);
      
      expect(commonProps.size).toBe(2);
      expect(commonProps.get('color')?.value).toBe('red');
      expect(commonProps.get('color')?.important).toBe(false);
      expect(commonProps.get('font-size')?.value).toBe('16px');
      expect(commonProps.get('font-size')?.important).toBe(false);
      
      expect(ltrOnlyProps.size).toBe(1);
      expect(ltrOnlyProps.get('margin')?.value).toBe('10px');
      expect(ltrOnlyProps.get('margin')?.important).toBe(false);
      
      expect(rtlOnlyProps.size).toBe(1);
      expect(rtlOnlyProps.get('padding')?.value).toBe('5px');
      expect(rtlOnlyProps.get('padding')?.important).toBe(false);
    });

    test('should handle identical rules', () => {
      const root1 = postcss.parse('.test1 { color: red; margin: 10px; }');
      const root2 = postcss.parse('.test2 { color: red; margin: 10px; }');
      const rule1 = root1.first as Rule;
      const rule2 = root2.first as Rule;
      
      const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(rule1, rule2);
      
      expect(commonProps.size).toBe(2);
      expect(ltrOnlyProps.size).toBe(0);
      expect(rtlOnlyProps.size).toBe(0);
    });
  });

  describe('Integration tests', () => {
    test('should work together for LTR/RTL transformation analysis', async () => {
      const root = postcss.parse('.test { margin-inline-start: 10px; margin-inline-end: 20px; color: red; }');
      const rule = root.first as Rule;
      
      // Check detection
      expect(hasLogicalProperties(rule)).toBe(true);
      
      // Transform to both directions
      const ltrRule = await applyLogicalTransformation(rule, 'ltr');
      const rtlRule = await applyLogicalTransformation(rule, 'rtl');
      
      expect(ltrRule).not.toBeNull();
      expect(rtlRule).not.toBeNull();
      
      if (ltrRule && rtlRule) {
        // Rules should not be identical
        expect(rulesAreIdentical(ltrRule, rtlRule)).toBe(false);
        
        // Analyze differences
        const { commonProps, ltrOnlyProps, rtlOnlyProps } = analyzePropertyDifferences(ltrRule, rtlRule);
        
        expect(commonProps.get('color')?.value).toBe('red');
        expect(commonProps.get('color')?.important).toBe(false);
        expect(ltrOnlyProps.size).toBeGreaterThan(0);
        expect(rtlOnlyProps.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Shim Features - Extended Logical Support', () => {
    describe('Float logical values', () => {
      test('should transform float: inline-start correctly', async () => {
        const root = postcss.parse('.test { float: inline-start; }');
        const rule = root.first as Rule;
        
        const ltrRule = await applyLogicalTransformation(rule, 'ltr');
        const rtlRule = await applyLogicalTransformation(rule, 'rtl');
        
        expect(ltrRule).not.toBeNull();
        expect(rtlRule).not.toBeNull();
        
        if (ltrRule && rtlRule) {
          const ltrCss = ltrRule.toString();
          const rtlCss = rtlRule.toString();
          
          expect(ltrCss).toContain('float: left');
          expect(rtlCss).toContain('float: right');
        }
      });

      test('should transform float: inline-end correctly', async () => {
        const root = postcss.parse('.test { float: inline-end; }');
        const rule = root.first as Rule;
        
        const ltrRule = await applyLogicalTransformation(rule, 'ltr');
        const rtlRule = await applyLogicalTransformation(rule, 'rtl');
        
        expect(ltrRule).not.toBeNull();
        expect(rtlRule).not.toBeNull();
        
        if (ltrRule && rtlRule) {
          const ltrCss = ltrRule.toString();
          const rtlCss = rtlRule.toString();
          
          expect(ltrCss).toContain('float: right');
          expect(rtlCss).toContain('float: left');
        }
      });
    });

    describe('Clear logical values', () => {
      test('should transform clear: inline-start correctly', async () => {
        const root = postcss.parse('.test { clear: inline-start; }');
        const rule = root.first as Rule;
        
        const ltrRule = await applyLogicalTransformation(rule, 'ltr');
        const rtlRule = await applyLogicalTransformation(rule, 'rtl');
        
        expect(ltrRule).not.toBeNull();
        expect(rtlRule).not.toBeNull();
        
        if (ltrRule && rtlRule) {
          const ltrCss = ltrRule.toString();
          const rtlCss = rtlRule.toString();
          
          expect(ltrCss).toContain('clear: left');
          expect(rtlCss).toContain('clear: right');
        }
      });

      test('should transform clear: inline-end correctly', async () => {
        const root = postcss.parse('.test { clear: inline-end; }');
        const rule = root.first as Rule;
        
        const ltrRule = await applyLogicalTransformation(rule, 'ltr');
        const rtlRule = await applyLogicalTransformation(rule, 'rtl');
        
        expect(ltrRule).not.toBeNull();
        expect(rtlRule).not.toBeNull();
        
        if (ltrRule && rtlRule) {
          const ltrCss = ltrRule.toString();
          const rtlCss = rtlRule.toString();
          
          expect(ltrCss).toContain('clear: right');
          expect(rtlCss).toContain('clear: left');
        }
      });
    });

    describe('Resize logical values', () => {
      test('should transform resize: block correctly', async () => {
        const root = postcss.parse('.test { resize: block; }');
        const rule = root.first as Rule;
        
        const transformedRule = await applyLogicalTransformation(rule, 'ltr');
        
        expect(transformedRule).not.toBeNull();
        
        if (transformedRule) {
          const css = transformedRule.toString();
          expect(css).toContain('resize: vertical');
        }
      });

      test('should transform resize: inline correctly', async () => {
        const root = postcss.parse('.test { resize: inline; }');
        const rule = root.first as Rule;
        
        const transformedRule = await applyLogicalTransformation(rule, 'ltr');
        
        expect(transformedRule).not.toBeNull();
        
        if (transformedRule) {
          const css = transformedRule.toString();
          expect(css).toContain('resize: horizontal');
        }
      });
    });

    describe('Scroll logical properties', () => {
      test('should transform scroll-margin-inline-start correctly', async () => {
        const root = postcss.parse('.test { scroll-margin-inline-start: 10px; }');
        const rule = root.first as Rule;
        
        const ltrRule = await applyLogicalTransformation(rule, 'ltr');
        const rtlRule = await applyLogicalTransformation(rule, 'rtl');
        
        expect(ltrRule).not.toBeNull();
        expect(rtlRule).not.toBeNull();
        
        if (ltrRule && rtlRule) {
          const ltrCss = ltrRule.toString();
          const rtlCss = rtlRule.toString();
          
          expect(ltrCss).toContain('scroll-margin-left: 10px');
          expect(rtlCss).toContain('scroll-margin-right: 10px');
        }
      });

      test('should transform scroll-padding-block correctly', async () => {
        const root = postcss.parse('.test { scroll-padding-block: 5px; }');
        const rule = root.first as Rule;
        
        const transformedRule = await applyLogicalTransformation(rule, 'ltr');
        
        expect(transformedRule).not.toBeNull();
        
        if (transformedRule) {
          const css = transformedRule.toString();
          expect(css).toContain('scroll-padding-top: 5px');
          expect(css).toContain('scroll-padding-bottom: 5px');
        }
      });

      test('should detect scroll properties as logical', () => {
        const root1 = postcss.parse('.test { scroll-margin-inline-start: 10px; }');
        const root2 = postcss.parse('.test { scroll-padding-block: 5px; }');
        const rule1 = root1.first as Rule;
        const rule2 = root2.first as Rule;
        
        expect(hasLogicalProperties(rule1)).toBe(true);
        expect(hasLogicalProperties(rule2)).toBe(true);
      });
    });
  });
});
