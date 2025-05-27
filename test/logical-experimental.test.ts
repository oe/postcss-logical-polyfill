/**
 * Tests for experimental logical properties support
 */
import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Experimental Logical Properties', () => {
  describe('Linear Gradient Logical Directions', () => {
    const gradientTests: TestCase[] = [
      {
        name: 'linear-gradient with to inline-start',
        input: `
          .element {
            background: linear-gradient(to inline-start, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: linear-gradient(to left, red, blue);
          }
          [dir="rtl"] .element {
            background: linear-gradient(to right, red, blue);
          }
        `
      },
      {
        name: 'linear-gradient with to inline-end',
        input: `
          .element {
            background: linear-gradient(to inline-end, #333, #666);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: linear-gradient(to right, #333, #666);
          }
          [dir="rtl"] .element {
            background: linear-gradient(to left, #333, #666);
          }
        `
      },
      {
        name: 'linear-gradient with to block-start',
        input: `
          .element {
            background: linear-gradient(to block-start, red, blue);
          }
        `,
        expected: `
          .element {
            background: linear-gradient(to top, red, blue);
          }
        `
      },
      {
        name: 'linear-gradient with to block-end',
        input: `
          .element {
            background: linear-gradient(to block-end, red, blue);
          }
        `,
        expected: `
          .element {
            background: linear-gradient(to bottom, red, blue);
          }
        `
      },
      {
        name: 'background-image with linear-gradient logical directions',
        input: `
          .hero {
            background-image: linear-gradient(to inline-end, rgba(0,0,0,0), rgba(0,0,0,0.5));
          }
        `,
        expected: `
          [dir="ltr"] .hero {
            background-image: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.5));
          }
          [dir="rtl"] .hero {
            background-image: linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,0.5));
          }
        `
      },
      {
        name: 'complex gradient with multiple logical directions',
        input: `
          .complex {
            background: linear-gradient(to inline-start, red 0%, blue 50%, green 100%),
                        linear-gradient(to block-end, yellow, orange);
          }
        `,
        expected: `
          [dir="ltr"] .complex {
            background: linear-gradient(to left, red 0%, blue 50%, green 100%),
                        linear-gradient(to bottom, yellow, orange);
          }
          [dir="rtl"] .complex {
            background: linear-gradient(to right, red 0%, blue 50%, green 100%),
                        linear-gradient(to bottom, yellow, orange);
          }
        `
      }
    ];

    test.each(gradientTests)('$name', runTestCase);
  });

  describe('Scoped Experimental Properties', () => {
    const scopedTests: TestCase[] = [
      {
        name: 'LTR scoped gradient with logical direction',
        input: `
          [dir="ltr"] .element {
            background: linear-gradient(to inline-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: linear-gradient(to right, red, blue);
          }
        `
      },
      {
        name: 'RTL scoped gradient with logical direction',
        input: `
          [dir="rtl"] .element {
            background: linear-gradient(to inline-start, #333, #666);
          }
        `,
        expected: `
          [dir="rtl"] .element {
            background: linear-gradient(to right, #333, #666);
          }
        `
      },
      {
        name: ':dir() pseudo-class with experimental properties',
        input: `
          :dir(ltr) .element {
            background: linear-gradient(to inline-end, red, blue);
          }
          :dir(rtl) .element {
            background: linear-gradient(to inline-start, #333, #666);
          }
        `,
        expected: `
          :dir(ltr) .element {
            background: linear-gradient(to right, red, blue);
          }
          :dir(rtl) .element {
            background: linear-gradient(to right, #333, #666);
          }
        `
      }
    ];

    test.each(scopedTests)('$name', runTestCase);
  });

  describe('Mixed Standard and Experimental Properties', () => {
    const mixedTests: TestCase[] = [
      {
        name: 'element with both standard logical properties and experimental gradients',
        input: `
          .card {
            margin-inline: 1rem;
            padding-inline-start: 2rem;
            background: linear-gradient(to inline-end, #f0f0f0, #e0e0e0);
          }
        `,
        expected: `
          .card {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          [dir="ltr"] .card {
            padding-left: 2rem;
            background: linear-gradient(to right, #f0f0f0, #e0e0e0);
          }
          [dir="rtl"] .card {
            padding-right: 2rem;
            background: linear-gradient(to left, #f0f0f0, #e0e0e0);
          }
        `
      },
      {
        name: 'element with logical properties and experimental gradients',
        input: `
          .button {
            border-inline-start: 2px solid blue;
            background: linear-gradient(to inline-end, #f0f0f0, #e0e0e0);
          }
        `,
        expected: `
          [dir="ltr"] .button {
            border-left: 2px solid blue;
            background: linear-gradient(to right, #f0f0f0, #e0e0e0);
          }
          [dir="rtl"] .button {
            border-right: 2px solid blue;
            background: linear-gradient(to left, #f0f0f0, #e0e0e0);
          }
        `
      }
    ];

    test.each(mixedTests)('$name', runTestCase);
  });
});
