import { expect } from 'vitest';
import postcss from 'postcss';
import logicalScope from '../src/index';

// Test case type definition
interface TestCase {
  name: string;
  input: string;
  expected: string | {
    contains?: string[];
    notContains?: string[];
    matches?: Array<{ pattern: RegExp; message?: string }>;
  };
  options?: any;
}

/**
 * Normalizes CSS by removing comments and normalizing whitespace
 */
function normalizeCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .replace(/{ /g, '{')              // Remove space after {
    .replace(/ }/g, '}')              // Remove space before }
    .replace(/; /g, ';')              // Remove space after ;
    .replace(/: /g, ':')              // Remove space after :
    .trim();                          // Trim
}

/**
 * Test helper function that handles common test logic
 */
export async function runTestCase(testCase: TestCase) {
  // Process CSS with the given options or default options
  const options = testCase.options || {};
  const result = await postcss([logicalScope(options)]).process(testCase.input, { from: undefined });
  
  // Print CSS output for debugging
  if (process.env.DEBUG) {
    console.log(`[${testCase.name}] CSS Output:`, result.css);
  }
  
  // If expected is a string, do a normalized comparison
  if (typeof testCase.expected === 'string') {
    const normalizedOutput = normalizeCSS(result.css);
    const normalizedExpected = normalizeCSS(testCase.expected);
    
    expect(normalizedOutput).toBe(normalizedExpected);
    return result;
  }
  
  // Check for strings that should be included
  if (testCase.expected.contains) {
    testCase.expected.contains.forEach(str => {
      expect(result.css).toContain(str);
    });
  }
  
  // Check for strings that should not be included
  if (testCase.expected.notContains) {
    testCase.expected.notContains.forEach(str => {
      expect(result.css).not.toContain(str);
    });
  }
  
  // Check for regex patterns that should match
  if (testCase.expected.matches) {
    testCase.expected.matches.forEach(({ pattern, message }) => {
      expect(result.css).toMatch(pattern);
    });
  }
  
  return result;
}
