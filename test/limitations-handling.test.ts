import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Extended Support - Shim Enhanced Features', () => {
  describe('Scroll Properties Support (Enhanced via Shim)', () => {
    const scrollTests: TestCase[] = [
      {
        name: 'scroll-margin logical properties now supported',
        input: `
          .element {
            scroll-margin-inline: 10px;
            scroll-margin-inline-start: 15px;
            scroll-margin-inline-end: 20px;
            scroll-margin-block: 5px;
            scroll-margin-block-start: 7px;
            scroll-margin-block-end: 9px;
          }
        `,
        expected: `
          .element {
            scroll-margin-top: 7px;
            scroll-margin-bottom: 9px;
          }
          [dir="ltr"] .element {
            scroll-margin-left: 15px;
            scroll-margin-right: 20px;
          }
          [dir="rtl"] .element {
            scroll-margin-right: 15px;
            scroll-margin-left: 20px;
          }
        `
      },
      {
        name: 'scroll-padding logical properties now supported',
        input: `
          .container {
            scroll-padding-inline: 20px;
            scroll-padding-inline-start: 25px;
            scroll-padding-inline-end: 30px;
            scroll-padding-block: 15px;
            scroll-padding-block-start: 17px;
            scroll-padding-block-end: 19px;
          }
        `,
        expected: `
          .container {
            scroll-padding-top: 17px;
            scroll-padding-bottom: 19px;
          }
          [dir="ltr"] .container {
            scroll-padding-left: 25px;
            scroll-padding-right: 30px;
          }
          [dir="rtl"] .container {
            scroll-padding-right: 25px;
            scroll-padding-left: 30px;
          }
        `
      },
      {
        name: 'mixed scroll properties with regular logical properties',
        input: `
          .element {
            scroll-margin-inline-start: 10px;
            margin-inline: 1rem;
            scroll-padding-block: 15px;
            padding-inline: 2rem;
          }
        `,
        expected: `
          .element {
            margin-left: 1rem;
            margin-right: 1rem;
            scroll-padding-top: 15px;
            scroll-padding-bottom: 15px;
            padding-left: 2rem;
            padding-right: 2rem;
          }
          [dir="ltr"] .element {
            scroll-margin-left: 10px;
          }
          [dir="rtl"] .element {
            scroll-margin-right: 10px;
          }
        `
      }
    ];

    test.each(scrollTests)('$name', runTestCase);
  });
  
  describe('Float/Clear Logical Values Support (Enhanced via Shim)', () => {
    const floatClearTests: TestCase[] = [
      {
        name: 'float logical values now supported',
        input: `
          .element {
            float: inline-start;
            clear: inline-end;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            float: left;
            clear: right;
          }
          [dir="rtl"] .element {
            float: right;
            clear: left;
          }
        `
      },
      {
        name: 'mixed float/clear with text-align logical values',
        input: `
          .element {
            float: inline-start;
            clear: inline-end;
            text-align: start;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            float: left;
            clear: right;
            text-align: left;
          }
          [dir="rtl"] .element {
            float: right;
            clear: left;
            text-align: right;
          }
        `
      }
    ];

    test.each(floatClearTests)('$name', runTestCase);
  });
  
  describe('Resize Logical Values Support (Enhanced via Shim)', () => {
    const resizeTests: TestCase[] = [
      {
        name: 'resize logical values now supported',
        input: `
          .element {
            resize: block;
            margin-block: 1rem;
          }
          .another {
            resize: inline;
            padding-inline: 2rem;
          }
        `,
        expected: `
          .element {
            resize: vertical;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          .another {
            resize: horizontal;
            padding-left: 2rem;
            padding-right: 2rem;
          }
        `
      }
    ];

    test.each(resizeTests)('$name', runTestCase);
  });

  describe('Combined Shim Features', () => {
    const combinedTests: TestCase[] = [
      {
        name: 'all shim features working together',
        input: `
          .element {
            scroll-margin-inline-start: 10px;
            scroll-padding-block: 5px;
            float: inline-start;
            clear: inline-end;
            resize: block;
            margin-inline: 1rem;
          }
        `,
        expected: `
          .element {
            scroll-padding-top: 5px;
            scroll-padding-bottom: 5px;
            resize: vertical;
            margin-left: 1rem;
            margin-right: 1rem;
          }
          [dir="ltr"] .element {
            scroll-margin-left: 10px;
            float: left;
            clear: right;
          }
          [dir="rtl"] .element {
            scroll-margin-right: 10px;
            float: right;
            clear: left;
          }
        `
      }
    ];

    test.each(combinedTests)('$name', runTestCase);
  });
  
  describe('CSS Variables with Logical Property Names', () => {
    const cssVariablesTests: TestCase[] = [
      {
        name: 'Should preserve CSS custom properties with logical-sounding names',
        input: `
          :root {
            --margin-inline: 1rem;
            --padding-block: 1rem;
            --border-inline-width: 1px;
            --inset-block-start: 0;
          }
          
          .element {
            /* These should NOT be transformed as they are variable declarations */
            --my-margin-inline: 2rem;
            --my-padding-block: 2rem;
            
            /* Usage of custom properties */
            margin-inline: var(--margin-inline);
            padding-block: var(--padding-block);
            
            /* Regular logical properties */
            border-inline: 1px solid;
          }
        `,
        expected: `
          :root {
            --margin-inline: 1rem;
            --padding-block: 1rem;
            --border-inline-width: 1px;
            --inset-block-start: 0;
          }
          
          .element {
            /* These should NOT be transformed as they are variable declarations */
            --my-margin-inline: 2rem;
            --my-padding-block: 2rem;
            
            /* Usage of custom properties */
            margin-left: var(--margin-inline);
            margin-right: var(--margin-inline);
            padding-top: var(--padding-block);
            padding-bottom: var(--padding-block);
            border-left: 1px solid;
            border-right: 1px solid;
          }
        `
      },
      {
        name: 'Should handle complex CSS variable usage in logical properties',
        input: `
          :root {
            --space-sm: 0.5rem;
            --space-md: 1rem;
            --space-lg: 2rem;
          }
          
          .element {
            margin-inline: calc(var(--space-md) + 10px);
            padding-inline: var(--space-sm) var(--space-lg);
            border-inline-width: clamp(var(--space-sm), 1vw, var(--space-lg));
          }
        `,
        expected: `
          :root {
            --space-sm: 0.5rem;
            --space-md: 1rem;
            --space-lg: 2rem;
          }
          
          .element {
            margin-left: calc(var(--space-md) + 10px);
            margin-right: calc(var(--space-md) + 10px);
            border-left-width: clamp(var(--space-sm), 1vw, var(--space-lg));
            border-right-width: clamp(var(--space-sm), 1vw, var(--space-lg));
          }
          [dir="ltr"] .element {
            padding-left: var(--space-sm);
            padding-right: var(--space-lg);
          }
          [dir="rtl"] .element {
            padding-right: var(--space-sm);
            padding-left: var(--space-lg);
          }
        `
      }
    ];

    test.each(cssVariablesTests)('$name', runTestCase);
  });
});
