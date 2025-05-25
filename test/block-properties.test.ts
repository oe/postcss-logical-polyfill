import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Block-Direction Properties Specialized Tests', () => {
  
  describe('Block-Only Property Detection', () => {
    const blockDetectionTests: TestCase[] = [
      {
        name: 'Block properties should not generate direction selectors',
        input: `
          .element {
            margin-block: 1rem;
            padding-block-start: 2rem;
            border-block-end: 1px solid;
            inset-block: 10px;
            block-size: 100px;
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
            padding-top: 2rem;
            border-bottom: 1px solid;
            top: 10px;
            bottom: 10px;
            height: 100px;
          }
        `
      },
      {
        name: 'Mixed block and inline properties generate appropriate rules',
        input: `
          .mixed {
            margin-block: 1rem;
            margin-inline: 2rem;
            padding-block-start: 3rem;
            padding-inline-end: 4rem;
          }
        `,
        expected: `
          .mixed {
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: 2rem;
            margin-right: 2rem;
            padding-top: 3rem;
          }
          [dir="ltr"] .mixed {
            padding-right: 4rem;
          }
          [dir="rtl"] .mixed {
            padding-left: 4rem;
          }
        `
      },
      {
        name: 'Block properties in scoped rules maintain scope',
        input: `
          [dir="ltr"] .scoped {
            margin-block: 1rem;
            padding-block-start: 2rem;
          }
          [dir="rtl"] .scoped {
            margin-block: 3rem;
            padding-block-end: 4rem;
          }
        `,
        expected: `
          [dir="ltr"] .scoped {
            margin-top: 1rem;
            margin-bottom: 1rem;
            padding-top: 2rem;
          }
          [dir="rtl"] .scoped {
            margin-top: 3rem;
            margin-bottom: 3rem;
            padding-bottom: 4rem;
          }
        `
      }
    ];

    test.each(blockDetectionTests)('$name', runTestCase);
  });

  describe('Margin Block Properties', () => {
    const marginBlockTests: TestCase[] = [
      {
        name: 'margin-block shorthand',
        input: `
          .element {
            margin-block: 1rem;
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
        `
      },
      {
        name: 'margin-block with two values',
        input: `
          .element {
            margin-block: 1rem 2rem;
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 2rem;
          }
        `
      },
      {
        name: 'margin-block-start and margin-block-end',
        input: `
          .element {
            margin-block-start: 1rem;
            margin-block-end: 2rem;
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 2rem;
          }
        `
      },
      {
        name: 'margin-block with CSS functions',
        input: `
          .element {
            margin-block: calc(1rem + 10px);
            margin-block-start: var(--spacing, 1rem);
            margin-block-end: clamp(0.5rem, 2vw, 2rem);
          }
        `,
        expected: `
          .element {
            margin-top: calc(1rem + 10px);
            margin-bottom: calc(1rem + 10px);
            margin-top: var(--spacing, 1rem);
            margin-bottom: clamp(0.5rem, 2vw, 2rem);
          }
        `
      }
    ];

    test.each(marginBlockTests)('$name', runTestCase);
  });

  describe('Padding Block Properties', () => {
    const paddingBlockTests: TestCase[] = [
      {
        name: 'padding-block shorthand',
        input: `
          .element {
            padding-block: 1rem;
          }
        `,
        expected: `
          .element {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
        `
      },
      {
        name: 'padding-block with two values',
        input: `
          .element {
            padding-block: 1rem 2rem;
          }
        `,
        expected: `
          .element {
            padding-top: 1rem;
            padding-bottom: 2rem;
          }
        `
      },
      {
        name: 'padding-block-start and padding-block-end',
        input: `
          .element {
            padding-block-start: 1rem;
            padding-block-end: 2rem;
          }
        `,
        expected: `
          .element {
            padding-top: 1rem;
            padding-bottom: 2rem;
          }
        `
      },
      {
        name: 'padding-block with zero values',
        input: `
          .element {
            padding-block: 0;
            padding-block-start: 0;
            padding-block-end: 0;
          }
        `,
        expected: `
          .element {
            padding-top: 0;
            padding-bottom: 0;
            padding-block-start: 0;
            padding-block-end: 0;
          }
        `
      }
    ];

    test.each(paddingBlockTests)('$name', runTestCase);
  });

  describe('Border Block Properties', () => {
    const borderBlockTests: TestCase[] = [
      {
        name: 'border-block shorthand',
        input: `
          .element {
            border-block: 1px solid red;
          }
        `,
        expected: `
          .element {
            border-top: 1px solid red;
            border-bottom: 1px solid red;
          }
        `
      },
      {
        name: 'border-block-start and border-block-end',
        input: `
          .element {
            border-block-start: 2px dashed blue;
            border-block-end: 3px dotted green;
          }
        `,
        expected: `
          .element {
            border-top: 2px dashed blue;
            border-bottom: 3px dotted green;
          }
        `
      },
      {
        name: 'border-block sub-properties',
        input: `
          .element {
            border-block-width: 2px;
            border-block-style: solid;
            border-block-color: blue;
            border-block-start-width: 3px;
            border-block-end-style: dashed;
          }
        `,
        expected: `
          .element {
            border-top-width: 2px;
            border-bottom-width: 2px;
            border-top-style: solid;
            border-bottom-style: solid;
            border-top-color: blue;
            border-bottom-color: blue;
            border-top-width: 3px;
            border-bottom-style: dashed;
          }
        `
      },
      {
        name: 'border-block with complex values',
        input: `
          .element {
            border-block: var(--border-width, 1px) solid var(--border-color, #ccc);
            border-block-start: calc(2px + 1px) dashed rgba(255, 0, 0, 0.5);
          }
        `,
        expected: `
          .element {
            border-top: var(--border-width, 1px) solid var(--border-color, #ccc);
            border-bottom: var(--border-width, 1px) solid var(--border-color, #ccc);
            border-top: calc(2px + 1px) dashed rgba(255, 0, 0, 0.5);
          }
        `
      }
    ];

    test.each(borderBlockTests)('$name', runTestCase);
  });

  describe('Inset Block Properties', () => {
    const insetBlockTests: TestCase[] = [
      {
        name: 'inset-block shorthand',
        input: `
          .element {
            inset-block: 10px;
          }
        `,
        expected: `
          .element {
            top: 10px;
            bottom: 10px;
          }
        `
      },
      {
        name: 'inset-block with two values',
        input: `
          .element {
            inset-block: 10px 20px;
          }
        `,
        expected: `
          .element {
            top: 10px;
            bottom: 20px;
          }
        `
      },
      {
        name: 'inset-block-start and inset-block-end',
        input: `
          .element {
            inset-block-start: 15px;
            inset-block-end: 25px;
          }
        `,
        expected: `
          .element {
            top: 15px;
            bottom: 25px;
          }
        `
      },
      {
        name: 'inset-block with percentage and auto values',
        input: `
          .element {
            inset-block: 50%;
            inset-block-start: auto;
            inset-block-end: 0;
          }
        `,
        expected: `
          .element {
            top: 50%;
            bottom: 50%;
            top: auto;
            bottom: 0;
          }
        `
      }
    ];

    test.each(insetBlockTests)('$name', runTestCase);
  });

  describe('Block Size Properties', () => {
    const blockSizeTests: TestCase[] = [
      {
        name: 'block-size property',
        input: `
          .element {
            block-size: 100px;
          }
        `,
        expected: `
          .element {
            height: 100px;
          }
        `
      },
      {
        name: 'min-block-size and max-block-size',
        input: `
          .element {
            min-block-size: 50px;
            max-block-size: 200px;
          }
        `,
        expected: `
          .element {
            min-height: 50px;
            max-height: 200px;
          }
        `
      },
      {
        name: 'block-size with CSS functions',
        input: `
          .element {
            block-size: calc(100vh - 60px);
            min-block-size: max(200px, 30vh);
            max-block-size: min(800px, 90vh);
          }
        `,
        expected: `
          .element {
            height: calc(100vh - 60px);
            min-height: max(200px, 30vh);
            max-height: min(800px, 90vh);
          }
        `
      },
      {
        name: 'block-size with percentage and auto',
        input: `
          .element {
            block-size: 100%;
            min-block-size: auto;
            max-block-size: none;
          }
        `,
        expected: `
          .element {
            height: 100%;
            min-height: auto;
            max-height: none;
          }
        `
      }
    ];

    test.each(blockSizeTests)('$name', runTestCase);
  });

  describe('Scroll Block Properties', () => {
    const scrollBlockTests: TestCase[] = [
      {
        name: 'scroll-margin-block properties',
        input: `
          .element {
            scroll-margin-block: 10px;
            scroll-margin-block-start: 15px;
            scroll-margin-block-end: 20px;
          }
        `,
        expected: `
          .element {
            scroll-margin-top: 10px;
            scroll-margin-bottom: 10px;
            scroll-margin-top: 15px;
            scroll-margin-bottom: 20px;
          }
        `
      },
      {
        name: 'scroll-padding-block properties',
        input: `
          .element {
            scroll-padding-block: 5px;
            scroll-padding-block-start: 8px;
            scroll-padding-block-end: 12px;
          }
        `,
        expected: `
          .element {
            scroll-padding-top: 5px;
            scroll-padding-bottom: 5px;
            scroll-padding-top: 8px;
            scroll-padding-bottom: 12px;
          }
        `
      },
      {
        name: 'scroll-block with multiple values',
        input: `
          .element {
            scroll-margin-block: 10px 20px;
            scroll-padding-block: 5px 15px;
          }
        `,
        expected: `
          .element {
            scroll-margin-top: 10px;
            scroll-margin-bottom: 20px;
            scroll-padding-top: 5px;
            scroll-padding-bottom: 15px;
          }
        `
      }
    ];

    // Skip scroll properties tests as they are not yet supported by postcss-logical
    // TODO: Enable these tests when scroll properties support is added
    test.skip.each(scrollBlockTests)('$name', runTestCase);
  });

  describe('Block Properties in Media Queries and Complex Selectors', () => {
    const complexBlockTests: TestCase[] = [
      {
        name: 'Block properties in media queries',
        input: `
          .element {
            margin-block: 1rem;
          }
          
          @media (min-width: 768px) {
            .element {
              margin-block: 2rem;
              padding-block-start: 1rem;
            }
          }
        `,
        expected: `
          .element {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          @media (min-width: 768px) {
            .element {
              margin-top: 2rem;
              margin-bottom: 2rem;
              padding-top: 1rem;
            }
          }
        `
      },
      {
        name: 'Block properties with complex selectors',
        input: `
          .parent .child:nth-child(odd) {
            padding-block: 1rem;
          }
          
          .component[data-state="active"]:hover {
            margin-block-end: 2rem;
            border-block-start: 2px solid blue;
          }
        `,
        expected: `
          .parent .child:nth-child(odd) {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          
          .component[data-state="active"]:hover {
            margin-bottom: 2rem;
            border-top: 2px solid blue;
          }
        `
      },
      {
        name: 'Block properties with CSS Grid and Flexbox',
        input: `
          .grid-container {
            display: grid;
            gap: 1rem;
            padding-block: 2rem;
          }
          
          .flex-item {
            flex: 1;
            margin-block-start: auto;
            margin-block-end: auto;
          }
        `,
        expected: `
          .grid-container {
            display: grid;
            gap: 1rem;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
          
          .flex-item {
            flex: 1;
            margin-top: auto;
            margin-bottom: auto;
          }
        `
      }
    ];

    test.each(complexBlockTests)('$name', runTestCase);
  });
});
