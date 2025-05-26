import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('All Logical Properties - Comprehensive Coverage', () => {
  
  describe('Inline-Direction Properties (generate LTR/RTL rules)', () => {
    const inlinePropertyTests: TestCase[] = [
      {
        name: 'margin-inline properties - unscoped',
        input: `
          .element {
            margin-inline: 1rem;
            margin-inline-start: 2rem;
            margin-inline-end: 3rem;
          }
        `,
        expected: `

          [dir="ltr"] .element {
            margin-left: 2rem;
            margin-right: 3rem;
          }
          [dir="rtl"] .element {
            margin-right: 2rem;
            margin-left: 3rem;
          }
        `
      },
      {
        name: 'padding-inline properties - unscoped',
        input: `
          .element {
            padding-inline: 10px 20px;
            padding-inline-start: 15px;
            padding-inline-end: 25px;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            padding-left: 15px;
            padding-right: 25px;
          }
          [dir="rtl"] .element {
            padding-right: 15px;
            padding-left: 25px;
          }
        `
      },
      {
        name: 'border-inline properties - unscoped',
        input: `
          .element {
            border-inline: 1px solid red;
            border-inline-start: 2px dashed blue;
            border-inline-end: 3px dotted green;
            border-inline-width: 4px;
            border-inline-style: solid;
            border-inline-color: purple;
          }
        `,
        expected: `
          .element {
            border-left-width: 4px;
            border-right-width: 4px;
            border-left-style: solid;
            border-right-style: solid;
            border-left-color: purple;
            border-right-color: purple;
          }
          [dir="ltr"] .element {
            border-left: 2px dashed blue;
            border-right: 3px dotted green;
          }
          [dir="rtl"] .element {
            border-right: 2px dashed blue;
            border-left: 3px dotted green;
          }
        `
      },
      {
        name: 'inset-inline properties - unscoped',
        input: `
          .element {
            inset-inline: 10px;
            inset-inline-start: 20px;
            inset-inline-end: 30px;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            left: 20px;
            right: 30px;
          }
          [dir="rtl"] .element {
            right: 20px;
            left: 30px;
          }
        `
      },
      {
        name: 'inline-size properties - unscoped',
        input: `
          .element {
            inline-size: 100px;
            min-inline-size: 50px;
            max-inline-size: 200px;
          }
        `,
        expected: `
          .element {
            width: 100px;
            min-width: 50px;
            max-width: 200px;
          }
        `
      },
      {
        name: 'border-radius logical properties - unscoped',
        input: `
          .element {
            border-start-start-radius: 5px;
            border-start-end-radius: 10px;
            border-end-start-radius: 15px;
            border-end-end-radius: 20px;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            border-top-left-radius: 5px;
            border-top-right-radius: 10px;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 20px;
          }
          [dir="rtl"] .element {
            border-top-right-radius: 5px;
            border-top-left-radius: 10px;
            border-bottom-right-radius: 15px;
            border-bottom-left-radius: 20px;
          }
        `
      }
    ];

    test.each(inlinePropertyTests)('$name', runTestCase);
    
    // Scroll inline properties - skipped as not supported by postcss-logical
    const scrollInlineTests: TestCase[] = [
      {
        name: 'scroll-inline properties - unscoped',
        input: `
          .element {
            scroll-margin-inline: 5px;
            scroll-margin-inline-start: 10px;
            scroll-margin-inline-end: 15px;
            scroll-padding-inline: 8px;
            scroll-padding-inline-start: 12px;
            scroll-padding-inline-end: 16px;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            scroll-margin-left: 5px;
            scroll-margin-right: 5px;
            scroll-margin-left: 10px;
            scroll-margin-right: 15px;
            scroll-padding-left: 8px;
            scroll-padding-right: 8px;
            scroll-padding-left: 12px;
            scroll-padding-right: 16px;
          }
          [dir="rtl"] .element {
            scroll-margin-right: 5px;
            scroll-margin-left: 5px;
            scroll-margin-right: 10px;
            scroll-margin-left: 15px;
            scroll-padding-right: 8px;
            scroll-padding-left: 8px;
            scroll-padding-right: 12px;
            scroll-padding-left: 16px;
          }
        `
      }
    ];

    // Skip scroll inline properties tests as they are not yet supported by postcss-logical
    // TODO: Enable these tests when scroll properties support is added
    test.skip.each(scrollInlineTests)('$name', runTestCase);
  });

  describe('Block-Direction Properties (generate single rule)', () => {
    const blockPropertyTests: TestCase[] = [
      {
        name: 'margin-block properties',
        input: `
          .element {
            margin-block: 1rem;
            margin-block-start: 2rem;
            margin-block-end: 3rem;
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-top: 2rem;
            margin-bottom: 3rem;
          }
        `
      },
      {
        name: 'padding-block properties',
        input: `
          .element {
            padding-block: 10px 20px;
            padding-block-start: 15px;
            padding-block-end: 25px;
          }
        `,
        expected: `
          .element {
            padding-top: 10px;
            padding-bottom: 20px;
            padding-top: 15px;
            padding-bottom: 25px;
          }
        `
      },
      {
        name: 'border-block properties',
        input: `
          .element {
            border-block: 1px solid red;
            border-block-start: 2px dashed blue;
            border-block-end: 3px dotted green;
            border-block-width: 4px;
            border-block-style: solid;
            border-block-color: purple;
          }
        `,
        expected: `
          .element {
            border-top: 1px solid red;
            border-bottom: 1px solid red;
            border-top: 2px dashed blue;
            border-bottom: 3px dotted green;
            border-top-width: 4px;
            border-bottom-width: 4px;
            border-top-style: solid;
            border-bottom-style: solid;
            border-top-color: purple;
            border-bottom-color: purple;
          }
        `
      },
      {
        name: 'inset-block properties',
        input: `
          .element {
            inset-block: 10px;
            inset-block-start: 20px;
            inset-block-end: 30px;
          }
        `,
        expected: `
          .element {
            top: 10px;
            bottom: 10px;
            top: 20px;
            bottom: 30px;
          }
        `
      },
      {
        name: 'block-size properties',
        input: `
          .element {
            block-size: 100px;
            min-block-size: 50px;
            max-block-size: 200px;
          }
        `,
        expected: `
          .element {
            height: 100px;
            min-height: 50px;
            max-height: 200px;
          }
        `
      },
      {
        name: 'scroll-block properties',
        input: `
          .element {
            scroll-margin-block: 5px;
            scroll-margin-block-start: 10px;
            scroll-margin-block-end: 15px;
            scroll-padding-block: 8px;
            scroll-padding-block-start: 12px;
            scroll-padding-block-end: 16px;
          }
        `,
        expected: `
          .element {
            scroll-margin-block: 5px;
            scroll-margin-block-start: 10px;
            scroll-margin-block-end: 15px;
            scroll-padding-block: 8px;
            scroll-padding-block-start: 12px;
            scroll-padding-block-end: 16px;
          }
        `
      }
    ];

    test.each(blockPropertyTests)('$name', runTestCase);
  });

  describe('Mixed-Direction Properties', () => {
    const mixedPropertyTests: TestCase[] = [
      {
        name: 'inset shorthand - affects all four directions',
        input: `
          .element {
            inset: 10px;
          }
        `,
        expected: `
          .element {
            top: 10px;
            right: 10px;
            bottom: 10px;
            left: 10px;
          }
        `
      },
      {
        name: 'inset with multiple values',
        input: `
          .element {
            inset: 10px 20px;
          }
        `,
        expected: `
          .element {
            top: 10px;
            right: 20px;
            bottom: 10px;
            left: 20px;
          }
        `
      }
    ];

    test.each(mixedPropertyTests)('$name', runTestCase);
  });

  describe('Scoped Logical Properties', () => {
    const scopedPropertyTests: TestCase[] = [
      {
        name: 'LTR scoped inline properties',
        input: `
          [dir="ltr"] .element {
            margin-inline: 1rem;
            padding-inline-start: 2rem;
            border-inline-end: 1px solid;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-left: 1rem;
            margin-right: 1rem;
            padding-left: 2rem;
            border-right: 1px solid;
          }
        `
      },
      {
        name: 'RTL scoped inline properties',
        input: `
          [dir="rtl"] .element {
            margin-inline: 1rem;
            padding-inline-start: 2rem;
            border-inline-end: 1px solid;
          }
        `,
        expected: `
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 1rem;
            padding-right: 2rem;
            border-left: 1px solid;
          }
        `
      },
      {
        name: ':dir() pseudo-class scoped properties',
        input: `
          :dir(ltr) .element {
            margin-inline-start: 1rem;
          }
          :dir(rtl) .element {
            margin-inline-start: 2rem;
          }
        `,
        expected: `
          :dir(ltr) .element {
            margin-left: 1rem;
          }
          :dir(rtl) .element {
            margin-right: 2rem;
          }
        `
      },
      {
        name: 'Block properties with direction selectors',
        input: `
          [dir="ltr"] .element {
            margin-block: 1rem;
            padding-block-start: 2rem;
          }
          [dir="rtl"] .element {
            margin-block: 3rem;
            padding-block-end: 4rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
            padding-top: 2rem;
          }
          [dir="rtl"] .element {
            margin-top: 3rem;
            margin-bottom: 3rem;
            padding-bottom: 4rem;
          }
        `
      },
      {
        name: 'Mixed block and inline properties with scoping',
        input: `
          [dir="ltr"] .element {
            margin-block: 1rem;
            margin-inline: 2rem;
            padding-block-start: 3rem;
            padding-inline-end: 4rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: 2rem;
            margin-right: 2rem;
            padding-top: 3rem;
            padding-right: 4rem;
          }
        `
      }
    ];

    test.each(scopedPropertyTests)('$name', runTestCase);
  });
});
