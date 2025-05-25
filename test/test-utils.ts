import { expect } from 'vitest';
import postcss from 'postcss';
import logicalPolyfill from '../src';

// Test case type definition
export interface TestCase {
  name: string;
  input: string;
  expected: string;
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
  const result = await postcss([logicalPolyfill(options)]).process(testCase.input, { from: undefined });
  
  // Print CSS output for debugging
  if (process.env.DEBUG) {
    console.log(`[${testCase.name}] CSS Output:`, result.css);
  }
  
  // Normalize both the actual and expected CSS for comparison
  const normalizedActual = normalizeCSS(result.css);
  const normalizedExpected = normalizeCSS(testCase.expected);
  
  // Simple string comparison
  expect(normalizedActual).toBe(normalizedExpected);
  
  return result;
}
