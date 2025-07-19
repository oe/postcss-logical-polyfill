/**
 * Logical properties processing utilities
 * 
 * This module handles the detection, transformation, and analysis of CSS logical properties.
 * It provides core functionality for converting logical properties to physical properties
 * and analyzing the differences between LTR and RTL transformations.
 * 
 * Enhanced with shim support for additional logical properties and values.
 */
import postcss, { Rule } from 'postcss';
import logical from 'postcss-logical';
import { extendProcessors } from './logical-shim';
import { extendProcessorsWithExperimental } from './logical-exp';

// Logical processors for LTR and RTL transformations
const PROCESSORS = {
  ltr: logical({ inlineDirection: 'left-to-right' as any }),
  rtl: logical({ inlineDirection: 'right-to-left' as any })
} as const;

// Extend processors with our shim declarations
extendProcessors(PROCESSORS);

// Extend processors with experimental features
extendProcessorsWithExperimental(PROCESSORS);

// Get supported logical properties from the processor (including shim properties)
const supportedLogicalPropertiesSet = new Set(
  Object.keys((PROCESSORS.ltr as any).Declaration || {})
);

/**
 * Check if a rule contains logical properties
 */
export function hasLogicalProperties(rule: Rule): boolean {
  return rule.some(
    (decl) => {
      if (decl.type !== 'decl') return false;
      
      // Check for logical properties (including experimental ones via extended processors)
      return supportedLogicalPropertiesSet.has(decl.prop);
    }
  );
}

/**
 * Apply logical property transformation to a rule
 */
export async function applyLogicalTransformation(rule: Rule, direction: 'ltr' | 'rtl'): Promise<Rule | null> {
  const processor = PROCESSORS[direction];
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

/**
 * Extract declarations from a rule into a Map
 * @internal - Used internally by rulesAreIdentical and analyzePropertyDifferences
 */
function extractDeclarations(rule: Rule): Map<string, { value: string; important: boolean }> {
  const declarations = new Map<string, { value: string; important: boolean }>();
  rule.each(node => {
    if (node.type === 'decl') {
      declarations.set(node.prop, {
        value: node.value,
        important: Boolean(node.important)
      });
    }
  });
  return declarations;
}

/**
 * Helper function to compare if two rules have identical declarations
 */
export function rulesAreIdentical(rule1: Rule, rule2: Rule): boolean {
  const decls1 = extractDeclarations(rule1);
  const decls2 = extractDeclarations(rule2);
  
  if (decls1.size !== decls2.size) return false;
  
  for (const [prop, decl1] of decls1) {
    const decl2 = decls2.get(prop);
    if (!decl2 || decl2.value !== decl1.value || decl2.important !== decl1.important) {
      return false;
    }
  }
  
  return true;
}

/**
 * Analyze property differences between LTR and RTL rules
 */
export function analyzePropertyDifferences(ltrRule: Rule, rtlRule: Rule) {
  const ltrProps = extractDeclarations(ltrRule);
  const rtlProps = extractDeclarations(rtlRule);
  
  const commonProps = new Map<string, { value: string; important: boolean }>();
  const ltrOnlyProps = new Map<string, { value: string; important: boolean }>();
  const rtlOnlyProps = new Map<string, { value: string; important: boolean }>();

  // Categorize LTR properties
  ltrProps.forEach((decl, prop) => {
    const rtlDecl = rtlProps.get(prop);
    if (rtlDecl && rtlDecl.value === decl.value && rtlDecl.important === decl.important) {
      commonProps.set(prop, decl);
    } else {
      ltrOnlyProps.set(prop, decl);
    }
  });

  // Find RTL-only properties (those not already categorized as common)
  rtlProps.forEach((decl, prop) => {
    if (!commonProps.has(prop)) {
      rtlOnlyProps.set(prop, decl);
    }
  });

  return { commonProps, ltrOnlyProps, rtlOnlyProps };
}


