/**
 * Logical properties processing utilities
 * 
 * This module handles the detection, transformation, and analysis of CSS logical properties.
 * It provides core functionality for converting logical properties to physical properties
 * and analyzing the differences between LTR and RTL transformations.
 * 
 * Enhanced with shim support for additional logical properties and values.
 */
import postcss, { Declaration, Rule } from 'postcss';
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
  const decls1 = rule1.nodes.filter(node => node.type === 'decl');
  const decls2 = rule2.nodes.filter(node => node.type === 'decl');
  return decls1.length === decls2.length && decls1.every((decl, index) => {
    const other = decls2[index];
    return decl.prop === other.prop && decl.value === other.value &&
      Boolean(decl.important) === Boolean(other.important);
  });
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


/** Repeated declarations must retain their order, fallback values and importance. */
export function hasRepeatedDeclarations(rule: Rule): boolean {
  const seen = new Set<string>();
  return rule.nodes.some(node => {
    if (node.type !== 'decl') return false;
    if (seen.has(node.prop)) return true;
    seen.add(node.prop);
    return false;
  });
}

/** Keep invariant declarations available outside a direction selector as well. */
export function commonDeclarations(ltr: Rule, rtl: Rule): Declaration[] {
  const declarations = (rule: Rule) => rule.nodes.filter(node => node.type === 'decl');
  const ltrDecls = declarations(ltr);
  const rtlDecls = declarations(rtl);
  const common = new Set<string>();
  for (const prop of new Set(ltrDecls.map(decl => decl.prop))) {
    const left = ltrDecls.filter(decl => decl.prop === prop);
    const right = rtlDecls.filter(decl => decl.prop === prop);
    if (left.length === right.length && left.every((decl, index) =>
      decl.value === right[index].value && Boolean(decl.important) === Boolean(right[index].important)
    )) common.add(prop);
  }
  return ltrDecls.filter(decl => common.has(decl.prop));
}
