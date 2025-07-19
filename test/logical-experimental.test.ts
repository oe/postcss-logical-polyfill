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

  describe('Radial Gradient Logical Directions', () => {
    const radialGradientTests: TestCase[] = [
      {
        name: 'radial-gradient with inline-start position',
        input: `
          .test {
            background: radial-gradient(circle at inline-start, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .test {
            background: radial-gradient(circle at left, red, blue);
          }
          [dir="rtl"] .test {
            background: radial-gradient(circle at right, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient with inline-end position',
        input: `
          .test {
            background: radial-gradient(ellipse at inline-end, green, yellow);
          }
        `,
        expected: `
          [dir="ltr"] .test {
            background: radial-gradient(ellipse at right, green, yellow);
          }
          [dir="rtl"] .test {
            background: radial-gradient(ellipse at left, green, yellow);
          }
        `
      },
      {
        name: 'radial-gradient with block directions',
        input: `
          .test {
            background: radial-gradient(circle at block-start, red, blue);
            background-image: radial-gradient(ellipse at block-end, green, yellow);
          }
        `,
        expected: `
          .test {
            background: radial-gradient(circle at top, red, blue);
            background-image: radial-gradient(ellipse at bottom, green, yellow);
          }
        `
      },
      {
        name: 'radial-gradient with compound directions',
        input: `
          .complex {
            background: radial-gradient(circle at inline-start block-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .complex {
            background: radial-gradient(circle at left bottom, red, blue);
          }
          [dir="rtl"] .complex {
            background: radial-gradient(circle at right bottom, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient with mixed logical and physical positions',
        input: `
          .mixed {
            background: radial-gradient(circle at inline-start top, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .mixed {
            background: radial-gradient(circle at left top, red, blue);
          }
          [dir="rtl"] .mixed {
            background: radial-gradient(circle at right top, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient with physical then logical position',
        input: `
          .physical-logical {
            background: radial-gradient(ellipse at top inline-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .physical-logical {
            background: radial-gradient(ellipse at top right, red, blue);
          }
          [dir="rtl"] .physical-logical {
            background: radial-gradient(ellipse at top left, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient with percentage and logical position',
        input: `
          .percentage-logical {
            background: radial-gradient(circle at 50% block-start, red, blue);
          }
        `,
        expected: `
          .percentage-logical {
            background: radial-gradient(circle at 50% top, red, blue);
          }
        `
      },
      {
        name: 'complex radial-gradient with multiple logical keywords',
        input: `
          .complex {
            background: radial-gradient(ellipse 50px 100px at inline-start block-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .complex {
            background: radial-gradient(ellipse 50px 100px at left bottom, red, blue);
          }
          [dir="rtl"] .complex {
            background: radial-gradient(ellipse 50px 100px at right bottom, red, blue);
          }
        `
      }
    ];

    test.each(radialGradientTests)('$name', runTestCase);
  });

  describe('Enhanced Linear Gradient Support', () => {
    const enhancedLinearTests: TestCase[] = [
      {
        name: 'linear-gradient with complex logical directions',
        input: `
          .complex-linear {
            background: linear-gradient(45deg, to inline-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .complex-linear {
            background: linear-gradient(45deg, to right, red, blue);
          }
          [dir="rtl"] .complex-linear {
            background: linear-gradient(45deg, to left, red, blue);
          }
        `
      }
    ];

    test.each(enhancedLinearTests)('$name', runTestCase);
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

  describe('Mixed Logical and Physical Gradient Positions', () => {
    const mixedPositionTests: TestCase[] = [
      {
        name: 'radial-gradient(circle at inline-start top, red, blue)',
        input: `
          .test {
            background: radial-gradient(circle at inline-start top, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .test {
            background: radial-gradient(circle at left top, red, blue);
          }
          [dir="rtl"] .test {
            background: radial-gradient(circle at right top, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient(ellipse at bottom inline-end, red, blue)',
        input: `
          .test {
            background: radial-gradient(ellipse at bottom inline-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .test {
            background: radial-gradient(ellipse at bottom right, red, blue);
          }
          [dir="rtl"] .test {
            background: radial-gradient(ellipse at bottom left, red, blue);
          }
        `
      },
      {
        name: 'linear-gradient(45deg, to inline-end, red, blue)',
        input: `
          .test {
            background: linear-gradient(45deg, to inline-end, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .test {
            background: linear-gradient(45deg, to right, red, blue);
          }
          [dir="rtl"] .test {
            background: linear-gradient(45deg, to left, red, blue);
          }
        `
      },
      {
        name: 'radial-gradient with percentage and logical position',
        input: `
          .percentage {
            background: radial-gradient(circle at 50% inline-start, red, blue);
          }
        `,
        expected: `
          [dir="ltr"] .percentage {
            background: radial-gradient(circle at 50% left, red, blue);
          }
          [dir="rtl"] .percentage {
            background: radial-gradient(circle at 50% right, red, blue);
          }
        `
      },
      {
        name: 'multiple gradients with mixed logical positions',
        input: `
          .multiple {
            background: radial-gradient(circle at inline-start center, red, blue),
                        linear-gradient(to block-end, yellow, green),
                        radial-gradient(ellipse at center inline-end, purple, orange);
          }
        `,
        expected: `
          [dir="ltr"] .multiple {
            background: radial-gradient(circle at left center, red, blue),
                        linear-gradient(to bottom, yellow, green),
                        radial-gradient(ellipse at center right, purple, orange);
          }
          [dir="rtl"] .multiple {
            background: radial-gradient(circle at right center, red, blue),
                        linear-gradient(to bottom, yellow, green),
                        radial-gradient(ellipse at center left, purple, orange);
          }
        `
      }
    ];

    test.each(mixedPositionTests)('$name', runTestCase);
  });
});
