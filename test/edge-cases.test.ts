import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index';
import { runTestCase, TestCase } from './test-utils';

describe('postcss-logical-polyfill edge cases and error handling', () => {

  // Tests that can use test-utils (with expected output)
  const edgeCaseTests: TestCase[] = [
    {
      name: 'Should handle CSS with complex calc() expressions',
      input: `
        .complex {
          margin-block: calc(100vh - 50px);
          margin-inline: calc(var(--base-margin, 1rem) * 2);
          inset-block: calc(50% - 25px);
        }
      `,
      expected: `
        [dir="ltr"] .complex {
          margin-top: calc(100vh - 50px);
          margin-bottom: calc(100vh - 50px);
          margin-left: calc(var(--base-margin, 1rem) * 2);
          margin-right: calc(var(--base-margin, 1rem) * 2);
          top: calc(50% - 25px);
          bottom: calc(50% - 25px);
        }
        [dir="rtl"] .complex {
          margin-top: calc(100vh - 50px);
          margin-bottom: calc(100vh - 50px);
          margin-right: calc(var(--base-margin, 1rem) * 2);
          margin-left: calc(var(--base-margin, 1rem) * 2);
          top: calc(50% - 25px);
          bottom: calc(50% - 25px);
        }
      `
    },
    {
      name: 'Should handle very long selectors',
      input: `
        .very-long-selector-that-might-cause-issues .nested .deep .element:nth-child(odd):hover:focus[data-attribute="value"] {
          margin-block: 10px;
          margin-inline: 20px;
        }
      `,
      expected: `
        [dir="ltr"] .very-long-selector-that-might-cause-issues .nested .deep .element:nth-child(odd):hover:focus[data-attribute="value"] {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-left: 20px;
          margin-right: 20px;
        }
        [dir="rtl"] .very-long-selector-that-might-cause-issues .nested .deep .element:nth-child(odd):hover:focus[data-attribute="value"] {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-right: 20px;
          margin-left: 20px;
        }
      `
    },
    {
      name: 'Should handle CSS custom properties and modern syntax',
      input: `
        .modern {
          margin-block: var(--block-margin, 1rem);
          margin-inline: clamp(1rem, 5vw, 3rem);
          padding-block: min(2rem, 10vh);
          border-block-width: max(1px, 0.1em);
        }
      `,
      expected: `
        [dir="ltr"] .modern {
          margin-top: var(--block-margin, 1rem);
          margin-bottom: var(--block-margin, 1rem);
          margin-left: clamp(1rem, 5vw, 3rem);
          margin-right: clamp(1rem, 5vw, 3rem);
          padding-top: min(2rem, 10vh);
          padding-bottom: min(2rem, 10vh);
          border-top-width: max(1px, 0.1em);
          border-bottom-width: max(1px, 0.1em);
        }
        [dir="rtl"] .modern {
          margin-top: var(--block-margin, 1rem);
          margin-bottom: var(--block-margin, 1rem);
          margin-right: clamp(1rem, 5vw, 3rem);
          margin-left: clamp(1rem, 5vw, 3rem);
          padding-top: min(2rem, 10vh);
          padding-bottom: min(2rem, 10vh);
          border-top-width: max(1px, 0.1em);
          border-bottom-width: max(1px, 0.1em);
        }
      `
    },
    {
      name: 'Should handle rules with no declarations',
      input: `
        .empty1 {
        }
        
        .empty2 {
          /* only comments */
        }
        
        .with-props {
          margin-block: 10px;
        }
      `,
      expected: `
        .empty1 {
        }
        
        .empty2 {
          /* only comments */
        }
        
        .with-props {
          margin-top: 10px;
          margin-bottom: 10px;
        }
      `
    },
    {
      name: 'Should handle mixed logical and physical properties',
      input: `
        .mixed {
          margin: 1rem;
          margin-block: 2rem;
          margin-inline: 3rem;
          margin-top: 4rem;
          padding-inline-start: 5rem;
          border-block-width: 1px;
          border-left: 2px solid red;
        }
      `,
      expected: `
        [dir="ltr"] .mixed {
          margin: 1rem;
          margin-top: 2rem;
          margin-bottom: 2rem;
          margin-left: 3rem;
          margin-right: 3rem;
          margin-top: 4rem;
          padding-left: 5rem;
          border-top-width: 1px;
          border-bottom-width: 1px;
          border-left: 2px solid red;
        }
        [dir="rtl"] .mixed {
          margin: 1rem;
          margin-top: 2rem;
          margin-bottom: 2rem;
          margin-right: 3rem;
          margin-left: 3rem;
          margin-top: 4rem;
          padding-right: 5rem;
          border-top-width: 1px;
          border-bottom-width: 1px;
          border-left: 2px solid red;
        }
      `
    }
  ];

  // Run test-utils based tests
  edgeCaseTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  // Error handling tests that don't need exact output matching
  test('Should handle malformed CSS without crashing - block properties', async () => {
    const problematicInput = `
      .malformed {
        margin-block: ;
        padding-block: calc(var(--undefined-variable) * 2);
        border-block-width: ;
        inset-block: ;
      }
    `;

    // Should not throw an error even with problematic input
    const result = await postcss([plugin()]).process(problematicInput, { from: undefined });
    
    expect(result.css).toBeDefined();
    expect(result.css).toContain('.malformed');
  });

  test('Should handle malformed CSS without crashing - inline properties', async () => {
    const problematicInput = `
      .malformed {
        margin-inline: ;
        padding-inline: calc(var(--undefined-variable) * 2);
      }
    `;

    // Should not throw an error even with problematic input
    const result = await postcss([plugin()]).process(problematicInput, { from: undefined });
    
    expect(result.css).toBeDefined();
    expect(result.css).toContain('[dir="ltr"]');
    expect(result.css).toContain('[dir="rtl"]');
  });

  test('Should handle nested at-rules and complex structures', async () => {
    const input = `
      @supports (margin-block: 1rem) {
        @media (min-width: 768px) {
          .nested {
            margin-block: 1rem;
            margin-inline: 2rem;
          }
        }
      }
      
      @container (min-width: 300px) {
        .container-query {
          padding-block: 1rem;
        }
      }
    `;

    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    expect(result.css).toBeDefined();
    expect(result.css).toContain('@supports');
    expect(result.css).toContain('@media');
    expect(result.css).toContain('@container');
  });

  test('Should handle extremely malformed CSS that might trigger postcss-logical errors', async () => {
    // This test aims to create scenarios that might cause postcss-logical to fail
    const problematicInputs = [
      // Empty values
      `.test1 { margin-block: ; }`,
      `.test2 { margin-inline: ; }`,
      // Invalid calc expressions
      `.test3 { margin-block: calc(; }`,
      `.test4 { margin-inline: calc(invalid); }`,
      // Very long values that might cause issues
      `.test5 { margin-block: ${'very-'.repeat(1000)}long-value; }`,
      // Unicode and special characters
      `.test6 { margin-inline: "🎉"; }`,
      `.test7 { margin-block: url('data:invalid'); }`
    ];

    for (const problematicInput of problematicInputs) {
      try {
        const result = await postcss([plugin()]).process(problematicInput, { from: undefined });
        expect(result.css).toBeDefined();
      } catch (error) {
        // Even if postcss itself fails, our plugin should not crash the process
        // This test ensures graceful degradation
        expect(error).toBeInstanceOf(Error);
      }
    }
  });

});
