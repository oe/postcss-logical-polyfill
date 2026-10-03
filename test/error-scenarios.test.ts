import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index';
import { runTestCase, TestCase } from './test-utils';

describe('Error Scenarios and Edge Cases', () => {

  describe('Invalid Property Values', () => {
    const invalidValueTests: TestCase[] = [
      {
        name: 'Should handle invalid length values gracefully',
        input: `
          .element {
            margin-inline: invalid-value;
            padding-block: auto;
            border-inline-width: not-a-number;
            inset-inline: 50% invalid 25px;
          }
        `,
        expected: `
          .element {
            margin-left: invalid-value;
            margin-right: invalid-value;
            padding-top: auto;
            padding-bottom: auto;
            border-left-width: not-a-number;
            border-right-width: not-a-number;
            inset-inline: 50% invalid 25px;
          }
        `
      },
      {
        name: 'Should handle negative values and calc expressions',
        input: `
          .element {
            margin-inline: -1rem;
            padding-inline: calc(100% / 3);
            border-inline-width: max(1px, 0.1rem);
            inset-inline: min(0px, env(safe-area-inset-left));
          }
        `,
        expected: `
          .element {
            margin-left: -1rem;
            margin-right: -1rem;
            padding-left: calc(100% / 3);
            padding-right: calc(100% / 3);
            border-left-width: max(1px, 0.1rem);
            border-right-width: max(1px, 0.1rem);
            left: min(0px, env(safe-area-inset-left));
            right: min(0px, env(safe-area-inset-left));
          }
        `
      },
      {
        name: 'Should handle boundary numeric values',
        input: `
          .element {
            margin-inline: 999999999px;
            padding-block: 1.7976931348623157e+308px;
            inset-inline: -999999999px;
            border-inline-width: 0.000001px;
          }
        `,
        expected: `
          .element {
            margin-left: 999999999px;
            margin-right: 999999999px;
            padding-top: 1.7976931348623157e+308px;
            padding-bottom: 1.7976931348623157e+308px;
            left: -999999999px;
            right: -999999999px;
            border-left-width: 0.000001px;
            border-right-width: 0.000001px;
          }
        `
      }
    ];

    test.each(invalidValueTests)('$name', runTestCase);
  });

  describe('Complex Selector Edge Cases', () => {
    const complexSelectorTests: TestCase[] = [
      {
        name: 'Should handle pseudo-elements with logical properties',
        input: `
          .element::before {
            margin-inline: 1rem;
            content: "";
          }
          
          [dir="ltr"] .element::after {
            padding-inline-start: 2rem;
          }
          
          [dir="rtl"] .element:hover::before {
            border-inline-end: 1px solid;
          }
        `,
        expected: `
          .element::before {
            margin-left: 1rem;
            margin-right: 1rem;
            content: "";
          }
          [dir="ltr"] .element::after {
            padding-left: 2rem;
          }
          [dir="rtl"] .element:hover::before {
            border-left: 1px solid;
          }
        `
      },
      {
        name: 'Should handle complex combinators and multiple pseudo-classes',
        input: `
          .parent > .child + .sibling:hover {
            margin-inline: 1rem;
          }
          
          .element:not(.excluded):focus-within {
            padding-inline: 2rem;
          }
          
          .container:has(.nested) .target {
            border-inline-start: 1px solid;
          }
        `,
        expected: `
          .parent > .child + .sibling:hover {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .element:not(.excluded):focus-within {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          [dir="ltr"] .container:has(.nested) .target {
            border-left: 1px solid;
          }
          [dir="rtl"] .container:has(.nested) .target {
            border-right: 1px solid;
          }
        `
      },
      {
        name: 'Should handle attribute selectors with values',
        input: `
          .element[data-type="primary"] {
            margin-inline: 1rem;
          }
          
          .element[class*="btn-"]:not([disabled]) {
            padding-inline: 2rem;
          }
          
          input[type="text"]::placeholder {
            text-align: start;
            margin-inline-start: 0.5rem;
          }
        `,
        expected: `
          .element[data-type="primary"] {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .element[class*="btn-"]:not([disabled]) {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          [dir="ltr"] input[type="text"]::placeholder {
            text-align: left;
            margin-left: 0.5rem;
          }
          [dir="rtl"] input[type="text"]::placeholder {
            text-align: right;
            margin-right: 0.5rem;
          }
        `
      }
    ];

    test.each(complexSelectorTests)('$name', runTestCase);
  });

  describe('Nested At-Rules with Logical Properties', () => {
    const nestedAtRuleTests: TestCase[] = [
      {
        name: 'Should handle deeply nested conditional at-rules',
        input: `
          @media (min-width: 768px) {
            @supports (display: grid) {
              @container (min-width: 300px) {
                @layer base {
                  .element {
                    margin-inline: 1rem;
                    padding-block: 2rem;
                  }
                }
              }
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            @supports (display: grid) {
              @container (min-width: 300px) {
                @layer base {
                  .element {
                    margin-left: 1rem;
                    margin-right: 1rem;
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                  }
                }
              }
            }
          }
        `
      },
      {
        name: 'Should handle multiple @supports queries',
        input: `
          @supports (display: grid) {
            .grid-element {
              margin-inline: 1rem;
            }
          }

          @supports not (display: grid) {
            .fallback {
              padding-inline: 1rem;
            }
          }

          @supports (margin-inline: 1rem) {
            .modern {
              border-inline: 1px solid;
            }
          }
        `,
        expected: `
          @supports (display: grid) {
            .grid-element {
              margin-left: 1rem;
              margin-right: 1rem;
            }
          }
          @supports not (display: grid) {
            .fallback {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
          @supports (margin-inline: 1rem) {
            .modern {
              border-left: 1px solid;
              border-right: 1px solid;
            }
          }
        `
      }
    ];

    test.each(nestedAtRuleTests)('$name', runTestCase);
  });

  describe('CSS Variables with Logical Properties', () => {
    const cssVariableTests: TestCase[] = [
      {
        name: 'Should handle CSS variables in logical property values',
        input: `
          :root {
            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 2rem;
            --border-style: 1px solid blue;
          }
          
          .element {
            margin-inline: var(--spacing-md);
            padding-inline: var(--spacing-sm) var(--spacing-lg);
            border-inline: var(--border-style);
          }
        `,
        expected: `
          :root {
            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 2rem;
            --border-style: 1px solid blue;
          }
          .element {
            margin-left: var(--spacing-md);
            margin-right: var(--spacing-md);
            border-left: var(--border-style);
            border-right: var(--border-style);
          }
          [dir="ltr"] .element {
            padding-left: var(--spacing-sm);
            padding-right: var(--spacing-lg);
          }
          [dir="rtl"] .element {
            padding-right: var(--spacing-sm);
            padding-left: var(--spacing-lg);
          }
        `
      },
      {
        name: 'Should handle complex variable expressions',
        input: `
          .element {
            margin-inline: calc(var(--spacing-md) + 10px);
            padding-inline: clamp(var(--spacing-sm), 5vw, var(--spacing-lg));
          }
        `,
        expected: `
          .element {
            margin-left: calc(var(--spacing-md) + 10px);
            margin-right: calc(var(--spacing-md) + 10px);
            padding-left: clamp(var(--spacing-sm), 5vw, var(--spacing-lg));
            padding-right: clamp(var(--spacing-sm), 5vw, var(--spacing-lg));
          }
        `
      }
    ];

    test.each(cssVariableTests)('$name', runTestCase);
  });

  describe('Mixed Physical and Logical Properties', () => {
    const mixedPropertyTests: TestCase[] = [
      {
        name: 'Should preserve physical properties while transforming logical ones',
        input: `
          .element {
            margin-left: 10px;
            margin-inline-end: 20px;
            padding-top: 5px;
            padding-inline: 15px;
            border-bottom: 1px solid;
            border-inline-start: 2px dashed;
          }
        `,
        expected: `
          .element {
            padding-top: 5px;
            padding-left: 15px;
            padding-right: 15px;
            border-bottom: 1px solid;
          }
          [dir="ltr"] .element {
            margin-left: 10px;
            margin-right: 20px;
            border-left: 2px dashed;
          }
          [dir="rtl"] .element {
            margin-left: 20px;
            border-right: 2px dashed;
          }
        `
      },
      {
        name: 'Should handle conflicting physical and logical properties',
        input: `
          .element {
            margin-left: 10px;
            margin-inline-start: 20px;
            padding-right: 5px;
            padding-inline-end: 15px;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-left: 20px;
            padding-right: 15px;
          }
          [dir="rtl"] .element {
            margin-left: 10px;
            margin-right: 20px;
            padding-right: 5px;
            padding-left: 15px;
          }
        `
      }
    ];

    test.each(mixedPropertyTests)('$name', runTestCase);
  });

  describe('Empty and Edge Case Rules', () => {
    const edgeCaseTests: TestCase[] = [
      {
        name: 'Should handle empty rules gracefully',
        input: `
          .empty-rule {
          }
          
          .rule-with-logical {
            margin-inline: 1rem;
          }
          
          .another-empty {
          }
        `,
        expected: `
          .empty-rule {}
          .rule-with-logical {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .another-empty {}
        `
      },
      {
        name: 'Should handle rules with only comments',
        input: `
          .with-comments {
            /* This is a comment */
            margin-inline: 1rem;
            /* Another comment */
            padding-block: 2rem;
          }
        `,
        expected: `
          .with-comments {
            margin-left: 1rem;
            margin-right: 1rem;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
        `
      }
    ];

    test.each(edgeCaseTests)('$name', runTestCase);
  });

  // Tests that need special handling (non-TestCase array format)
  describe('PostCSS Processing Errors', () => {
    test('Should handle empty CSS input', async () => {
      const emptyInput = '';
      const result = await postcss([plugin()]).process(emptyInput, { from: undefined });
      expect(result.css).toBe('');
    });

    test('Should handle CSS with only comments', async () => {
      const commentOnlyInput = `
        /* This is a comment */
        /* Another comment */
      `;

      const result = await postcss([plugin()]).process(commentOnlyInput, { from: undefined });
      expect(result.css.trim()).toBe('/* This is a comment */\n        /* Another comment */');
    });

    test('Should handle CSS with only whitespace', async () => {
      const whitespaceInput = '   \n\n   \t   \r\n   ';
      const result = await postcss([plugin()]).process(whitespaceInput, { from: undefined });
      expect(result.css.trim()).toBe('');
    });

    test('Should not crash on malformed CSS', async () => {
      const malformedInput = `
        .element {
          margin-inline: 1rem;
          invalid-syntax here
          padding-block: 2rem;
        }
        
        broken rule without selector {
          border-inline: 1px solid;
        }
        
        .another { margin-inline: }
      `;

      await expect(async () => {
        return await postcss([plugin()]).process(malformedInput, { from: undefined });
      }).rejects.toThrow();
    });

    test('Should handle CSS with unmatched quotes', async () => {
      const unmatchedQuotesInput = `
        .element {
          content: "unclosed quote;
          margin-inline: 1rem;
        }
      `;

      await expect(async () => {
        await postcss([plugin()]).process(unmatchedQuotesInput, { from: undefined });
      }).rejects.toThrow();
    });

    test('Should handle CSS with unclosed braces', async () => {
      const unclosedBracesInput = `
        .element {
          margin-inline: 1rem;
          .nested {
            padding-block: 2rem;
      `;

      await expect(async () => {
        await postcss([plugin()]).process(unclosedBracesInput, { from: undefined });
      }).rejects.toThrow();
    });
  });

  describe('Plugin Configuration Edge Cases', () => {
    test('Should handle missing options object', async () => {
      const input = `
        .element {
          margin-inline-start: 1rem;
          margin-inline-end: 2rem;
        }
      `;

      const result = await postcss([plugin()]).process(input, { from: undefined });
      expect(result.css).toContain('[dir="ltr"]');
      expect(result.css).toContain('[dir="rtl"]');
    });

    test('Should handle custom selectors with special characters', async () => {
      const input = `
        .element {
          margin-inline-start: 1rem;
          margin-inline-end: 2rem;
        }
      `;

      const specialOptions = {
        rtl: { selector: '.rtl[data-dir="right-to-left"]' },
        ltr: { selector: '.ltr[data-dir="left-to-right"]' }
      };

      const result = await postcss([plugin(specialOptions)]).process(input, { from: undefined });
      expect(result.css).toContain('.rtl[data-dir="right-to-left"]');
      expect(result.css).toContain('.ltr[data-dir="left-to-right"]');
    });

    test('Should handle invalid plugin options gracefully', async () => {
      const input = `
        .element {
          margin-inline: 1rem;
        }
      `;

      const invalidOptions = {
        rtl: { selector: null },
        ltr: { selector: undefined },
        outputOrder: 'invalid-order'
      };

      await expect(async () => {
        const result = await postcss([plugin(invalidOptions as any)]).process(input, { from: undefined });
      }).not.toThrow();
    });
  });

  describe('Performance and Memory Edge Cases', () => {
    test('Should handle CSS with many repeated logical properties', async () => {
      const manyRulesInput = Array.from({ length: 1000 }, (_, i) => `
        .element-${i} {
          margin-inline: ${i}px;
          padding-block: ${i * 2}px;
        }
      `).join('\n');

      await expect(async () => {
        const result = await postcss([plugin()]).process(manyRulesInput, { from: undefined });
        expect(result.css.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test('Should handle processing without crashing on complex functions', async () => {
      const complexInput = `
        .complex {
          margin-inline: calc(var(--dynamic) * 1rem);
          padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
          inset-inline: max(0px, min(100%, 5vw));
        }
      `;
      
      await expect(async () => {
        const result = await postcss([plugin()]).process(complexInput, { from: undefined });
      }).not.toThrow();
    });
  });
});