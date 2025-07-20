/** @format */

import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Repeating Gradient Logical Properties', () => {
  describe('repeating-linear-gradient', () => {
    const linearGradientTests: TestCase[] = [
      {
        name: 'repeating-linear-gradient: to inline-start',
        input: `
          .element {
            background: repeating-linear-gradient(to inline-start, red 0%, blue 10%);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-linear-gradient(to left, red 0%, blue 10%);
          }
          [dir="rtl"] .element {
            background: repeating-linear-gradient(to right, red 0%, blue 10%);
          }
        `
      },
      {
        name: 'repeating-linear-gradient: to inline-end',
        input: `
          .element {
            background: repeating-linear-gradient(to inline-end, red 0%, blue 10%);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-linear-gradient(to right, red 0%, blue 10%);
          }
          [dir="rtl"] .element {
            background: repeating-linear-gradient(to left, red 0%, blue 10%);
          }
        `
      },
      {
        name: 'repeating-linear-gradient: to block-start (no direction rules)',
        input: `
          .element {
            background: repeating-linear-gradient(to block-start, red 0%, blue 10%);
          }
        `,
        expected: `
          .element {
            background: repeating-linear-gradient(to top, red 0%, blue 10%);
          }
        `
      },
      {
        name: 'repeating-linear-gradient: to block-end (no direction rules)',
        input: `
          .element {
            background: repeating-linear-gradient(to block-end, red 0%, blue 10%);
          }
        `,
        expected: `
          .element {
            background: repeating-linear-gradient(to bottom, red 0%, blue 10%);
          }
        `
      },
      {
        name: 'repeating-linear-gradient with complex color stops',
        input: `
          .element {
            background: repeating-linear-gradient(to inline-end, rgba(255, 0, 0, 0.5) 0%, rgba(0, 255, 0, 0.3) 50px, transparent 100px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-linear-gradient(to right, rgba(255, 0, 0, 0.5) 0%, rgba(0, 255, 0, 0.3) 50px, transparent 100px);
          }
          [dir="rtl"] .element {
            background: repeating-linear-gradient(to left, rgba(255, 0, 0, 0.5) 0%, rgba(0, 255, 0, 0.3) 50px, transparent 100px);
          }
        `
      }
    ];

    test.each(linearGradientTests)('$name', runTestCase);
  });

  describe('repeating-radial-gradient', () => {
    const radialGradientTests: TestCase[] = [
      {
        name: 'repeating-radial-gradient: at inline-start',
        input: `
          .element {
            background: repeating-radial-gradient(circle at inline-start, red 0%, blue 20px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(circle at left, red 0%, blue 20px);
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(circle at right, red 0%, blue 20px);
          }
        `
      },
      {
        name: 'repeating-radial-gradient: at inline-end',
        input: `
          .element {
            background: repeating-radial-gradient(ellipse at inline-end, red 0%, blue 20px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(ellipse at right, red 0%, blue 20px);
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(ellipse at left, red 0%, blue 20px);
          }
        `
      },
      {
        name: 'repeating-radial-gradient with mixed positioning',
        input: `
          .element {
            background: repeating-radial-gradient(circle at inline-start top, red 0%, blue 30px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(circle at left top, red 0%, blue 30px);
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(circle at right top, red 0%, blue 30px);
          }
        `
      },
      {
        name: 'repeating-radial-gradient with percentage and inline directions',
        input: `
          .element {
            background: repeating-radial-gradient(ellipse at 25% inline-end, red 0%, blue 40px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(ellipse at 25% right, red 0%, blue 40px);
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(ellipse at 25% left, red 0%, blue 40px);
          }
        `
      },
      {
        name: 'repeating-radial-gradient with compound directions',
        input: `
          .element {
            background: repeating-radial-gradient(at inline-start block-end, red 0%, blue 25px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(at left bottom, red 0%, blue 25px);
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(at right bottom, red 0%, blue 25px);
          }
        `
      },
      {
        name: 'repeating-radial-gradient: at block-start (no direction rules)',
        input: `
          .element {
            background: repeating-radial-gradient(circle at block-start, red 0%, blue 20px);
          }
        `,
        expected: `
          .element {
            background: repeating-radial-gradient(circle at top, red 0%, blue 20px);
          }
        `
      }
    ];

    test.each(radialGradientTests)('$name', runTestCase);
  });

  describe('background-image property', () => {
    const backgroundImageTests: TestCase[] = [
      {
        name: 'repeating-linear-gradient in background-image',
        input: `
          .element {
            background-image: repeating-linear-gradient(to inline-start, red 0%, blue 10%);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background-image: repeating-linear-gradient(to left, red 0%, blue 10%);
          }
          [dir="rtl"] .element {
            background-image: repeating-linear-gradient(to right, red 0%, blue 10%);
          }
        `
      },
      {
        name: 'repeating-radial-gradient in background-image',
        input: `
          .element {
            background-image: repeating-radial-gradient(circle at inline-end, yellow 0%, green 15px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background-image: repeating-radial-gradient(circle at right, yellow 0%, green 15px);
          }
          [dir="rtl"] .element {
            background-image: repeating-radial-gradient(circle at left, yellow 0%, green 15px);
          }
        `
      }
    ];

    test.each(backgroundImageTests)('$name', runTestCase);
  });

  describe('mixed gradients', () => {
    const mixedGradientTests: TestCase[] = [
      {
        name: 'multiple repeating gradients with different logical directions',
        input: `
          .element {
            background: 
              repeating-linear-gradient(to inline-end, red 0%, transparent 10px),
              repeating-radial-gradient(circle at inline-start, blue 0%, transparent 20px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: 
              repeating-linear-gradient(to right, red 0%, transparent 10px),
              repeating-radial-gradient(circle at left, blue 0%, transparent 20px);
          }
          [dir="rtl"] .element {
            background: 
              repeating-linear-gradient(to left, red 0%, transparent 10px),
              repeating-radial-gradient(circle at right, blue 0%, transparent 20px);
          }
        `
      },
      {
        name: 'mix of regular and repeating gradients',
        input: `
          .element {
            background: 
              linear-gradient(to inline-end, red, blue),
              repeating-radial-gradient(circle at inline-start, yellow 0%, transparent 15px);
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: 
              linear-gradient(to right, red, blue),
              repeating-radial-gradient(circle at left, yellow 0%, transparent 15px);
          }
          [dir="rtl"] .element {
            background: 
              linear-gradient(to left, red, blue),
              repeating-radial-gradient(circle at right, yellow 0%, transparent 15px);
          }
        `
      }
    ];

    test.each(mixedGradientTests)('$name', runTestCase);
  });

  describe('important flags', () => {
    const importantTests: TestCase[] = [
      {
        name: 'repeating-linear-gradient with !important',
        input: `
          .element {
            background: repeating-linear-gradient(to inline-end, red, blue) !important;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-linear-gradient(to right, red, blue) !important;
          }
          [dir="rtl"] .element {
            background: repeating-linear-gradient(to left, red, blue) !important;
          }
        `
      },
      {
        name: 'repeating-radial-gradient with !important',
        input: `
          .element {
            background: repeating-radial-gradient(circle at inline-start, red 0%, blue 20px) !important;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            background: repeating-radial-gradient(circle at left, red 0%, blue 20px) !important;
          }
          [dir="rtl"] .element {
            background: repeating-radial-gradient(circle at right, red 0%, blue 20px) !important;
          }
        `
      }
    ];

    test.each(importantTests)('$name', runTestCase);
  });
});
