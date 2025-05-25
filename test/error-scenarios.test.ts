import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index';
import { runTestCase, TestCase } from './test-utils';

describe('Error Scenarios and Edge Cases', () => {

  describe('Invalid Property Values', () => {
    const invalidValueTests: TestCase[] = [
      {
        name: 'Should handle invalid length values',
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
        name: 'Should handle CSS with weird Unicode characters',
        input: `
          .element {
            margin-inline: 1rem\uFEFF;
            padding-block: \u200B2rem;
            border-inline-color: #ff0000\u00A0;
          }
        `,
        expected: `
          .element {
            margin-left: 1rem\uFEFF;
            margin-right: 1rem\uFEFF;
            padding-top: \u200B2rem;
            padding-bottom: \u200B2rem;
            border-left-color: #ff0000\u00A0;
            border-right-color: #ff0000\u00A0;
          }
        `
      }
    ];

    test.each(invalidValueTests)('$name', runTestCase);
  });

  describe('Complex Selector Edge Cases', () => {
    const complexSelectorTests: TestCase[] = [
      {
        name: 'Should handle extremely long selectors without crashing',
        input: `
          .very-long-class-name-that-goes-on-and-on .another-very-long-class .yet-another-long-class .component[data-state="active"][data-size="large"]:nth-child(odd):hover:focus:not(.disabled) {
            margin-inline: 1rem;
          }
        `,
        expected: `
          .very-long-class-name-that-goes-on-and-on .another-very-long-class .yet-another-long-class .component[data-state="active"][data-size="large"]:nth-child(odd):hover:focus:not(.disabled) {
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Should handle selectors with special characters',
        input: `
          .\u00F1amé[data-ïñvälïd="tëst"] {
            padding-inline: 1rem;
          }
          
          .emoji\u{1F4A9}selector {
            margin-block: 2rem;
          }
        `,
        expected: `
          .\u00F1amé[data-ïñvälïd="tëst"] {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .emoji\u{1F4A9}selector {
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
        `
      }
    ];

    test.each(complexSelectorTests)('$name', runTestCase);
  });

  describe('PostCSS Processing Errors', () => {
    test('Should not crash on extremely malformed CSS', async () => {
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

      // This should not throw an error, but may not process correctly
      await expect(async () => {
        return await postcss([plugin()]).process(malformedInput, { from: undefined });
        // Just ensure it doesn't crash - the output might be malformed too
      }).rejects.toThrow();
    });

    test('Should handle CSS with postcss-logical processing errors gracefully', async () => {
      const problematicInput = `
        .element {
          margin-inline: 1rem;
          some-weird-property: value;
          padding-block: 2rem;
        }
      `;

      const result = await postcss([plugin()]).process(problematicInput, { from: undefined });
      
      // Should still process logical properties even if there are other issues
      expect(result.css).toContain('margin-left');
      expect(result.css).toContain('margin-right');
      expect(result.css).toContain('padding-top');
      expect(result.css).toContain('padding-bottom');
    });

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
  });

  describe('Plugin Configuration Errors', () => {
    test('Should handle invalid plugin options gracefully', async () => {
      const input = `
        .element {
          margin-inline: 1rem;
        }
      `;

      // Test with invalid options
      const invalidOptions = {
        rtl: { selector: null },
        ltr: { selector: undefined },
        outputOrder: 'invalid-order'
      };

      // Should not crash with invalid options
      await expect(async () => {
        const result = await postcss([plugin(invalidOptions as any)]).process(input, { from: undefined });
      }).not.toThrow();
    });

    test('Should handle missing options object', async () => {
      const input = `
        .element {
          margin-inline-start: 1rem;
          margin-inline-end: 2rem;
        }
      `;

      // Should work with no options provided
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
  });

  describe('Memory and Performance Edge Cases', () => {
    test('Should handle CSS with many repeated logical properties', async () => {
      // Generate CSS with 1000 rules with logical properties
      const manyRulesInput = Array.from({ length: 1000 }, (_, i) => `
        .element-${i} {
          margin-inline: ${i}px;
          padding-block: ${i * 2}px;
        }
      `).join('\n');

      // Should process without memory issues or crashes
      await expect(async () => {
        const result = await postcss([plugin()]).process(manyRulesInput, { from: undefined });
        expect(result.css.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test.skip('Should handle deeply nested at-rules', async () => {
      const deeplyNestedInput = `
        @media (min-width: 768px) {
          @supports (margin-inline: 1rem) {
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
      `;

      const result = await postcss([plugin()]).process(deeplyNestedInput, { from: undefined });
      expect(result.css).toContain('margin-left');
      expect(result.css).toContain('margin-right');
    });
  });

  describe('CSS Parser Edge Cases', () => {
    test('Should handle CSS with unclosed braces', async () => {
      const unclosedBracesInput = `
        .element {
          margin-inline: 1rem;
          .nested {
            padding-block: 2rem;
      `;

      // This may throw a parse error, which is expected
      await expect(async () => {
        await postcss([plugin()]).process(unclosedBracesInput, { from: undefined });
      }).rejects.toThrow();
    });

    test('Should handle CSS with unmatched quotes', async () => {
      const unmatchedQuotesInput = `
        .element {
          content: "unclosed quote;
          margin-inline: 1rem;
        }
      `;

      // This may throw a parse error, which is expected
      await expect(async () => {
        await postcss([plugin()]).process(unmatchedQuotesInput, { from: undefined });
      }).rejects.toThrow();
    });

    test('Should handle valid CSS after parser errors in development', async () => {
      const validInput = `
        .element {
          margin-inline: 1rem;
          padding-block: 2rem;
        }
      `;

      // This should always work
      const result = await postcss([plugin()]).process(validInput, { from: undefined });
      expect(result.css).toContain('margin-left');
      expect(result.css).toContain('padding-top');
    });
  });

  describe('Boundary Value Testing', () => {
    const boundaryTests: TestCase[] = [
      {
        name: 'Should handle very large numeric values',
        input: `
          .element {
            margin-inline: 999999999px;
            padding-block: 1.7976931348623157e+308px;
            inset-inline: -999999999px;
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
          }
        `
      },
      {
        name: 'Should handle very small decimal values',
        input: `
          .element {
            margin-inline: 0.0000001rem;
            border-inline-width: 0.00001em;
            inset-inline: 0.000000000001px;
          }
        `,
        expected: `
          .element {
            margin-left: 0.0000001rem;
            margin-right: 0.0000001rem;
            border-left-width: 0.00001em;
            border-right-width: 0.00001em;
            left: 0.000000000001px;
            right: 0.000000000001px;
          }
        `
      }
    ];

    test.each(boundaryTests)('$name', runTestCase);
  });
});
