/** @format */

import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('CSS Logical Values Tests', () => {
  describe('Text Alignment Values (Supported)', () => {
    const textAlignTests: TestCase[] = [
      {
        name: 'text-align: start - unscoped',
        input: `
          .element {
            text-align: start;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            text-align: left;
          }
          [dir="rtl"] .element {
            text-align: right;
          }
        `
      },
      {
        name: 'text-align: end - unscoped',
        input: `
          .element {
            text-align: end;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            text-align: right;
          }
          [dir="rtl"] .element {
            text-align: left;
          }
        `
      },
      {
        name: 'text-align logical values in scoped rules',
        input: `
          [dir="ltr"] .element {
            text-align: start;
          }
          [dir="rtl"] .element {
            text-align: end;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            text-align: left;
          }
          [dir="rtl"] .element {
            text-align: left;
          }
        `
      },
      {
        name: 'Mixed logical and physical text-align values',
        input: `
          .header {
            text-align: start;
          }
          .footer {
            text-align: center;
          }
          .sidebar {
            text-align: end;
          }
        `,
        expected: `
          [dir="ltr"] .header {
            text-align: left;
          }
          [dir="rtl"] .header {
            text-align: right;
          }
          
          .footer {
            text-align: center;
          }
          
          [dir="ltr"] .sidebar {
            text-align: right;
          }
          [dir="rtl"] .sidebar {
            text-align: left;
          }
        `
      }
    ];

    test.each(textAlignTests)('$name', runTestCase);
  });

  describe('Float Values (Not Supported - Skipped)', () => {
    const floatTests: TestCase[] = [
      {
        name: 'float: inline-start - should be converted',
        input: `
          .element {
            float: inline-start;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            float: left;
          }
          [dir="rtl"] .element {
            float: right;
          }
        `
      },
      {
        name: 'float: inline-end - should be converted',
        input: `
          .element {
            float: inline-end;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            float: right;
          }
          [dir="rtl"] .element {
            float: left;
          }
        `
      },
      {
        name: 'Mixed float values',
        input: `
          .left-float {
            float: inline-start;
          }
          .right-float {
            float: inline-end;
          }
          .normal-float {
            float: left;
          }
        `,
        expected: `
          [dir="ltr"] .left-float {
            float: left;
          }
          [dir="rtl"] .left-float {
            float: right;
          }
          
          [dir="ltr"] .right-float {
            float: right;
          }
          [dir="rtl"] .right-float {
            float: left;
          }
          
          .normal-float {
            float: left;
          }
        `
      }
    ];

    // Skip float logical values tests as they are not yet supported by postcss-logical
    // TODO: Enable these tests when float logical values support is added
    test.skip.each(floatTests)('$name', runTestCase);
  });

  describe('Clear Values (Not Supported - Skipped)', () => {
    const clearTests: TestCase[] = [
      {
        name: 'clear: inline-start - should be converted',
        input: `
          .element {
            clear: inline-start;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            clear: left;
          }
          [dir="rtl"] .element {
            clear: right;
          }
        `
      },
      {
        name: 'clear: inline-end - should be converted',
        input: `
          .element {
            clear: inline-end;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            clear: right;
          }
          [dir="rtl"] .element {
            clear: left;
          }
        `
      },
      {
        name: 'Mixed clear values',
        input: `
          .clear-start {
            clear: inline-start;
          }
          .clear-end {
            clear: inline-end;
          }
          .clear-both {
            clear: both;
          }
        `,
        expected: `
          [dir="ltr"] .clear-start {
            clear: left;
          }
          [dir="rtl"] .clear-start {
            clear: right;
          }
          
          [dir="ltr"] .clear-end {
            clear: right;
          }
          [dir="rtl"] .clear-end {
            clear: left;
          }
          
          .clear-both {
            clear: both;
          }
        `
      }
    ];

    // Skip clear logical values tests as they are not yet supported by postcss-logical
    // TODO: Enable these tests when clear logical values support is added
    test.skip.each(clearTests)('$name', runTestCase);
  });

  describe('Resize Values (Not Supported - Skipped)', () => {
    const resizeTests: TestCase[] = [
      {
        name: 'resize: block - should be converted',
        input: `
          .element {
            resize: block;
          }
        `,
        expected: `
          .element {
            resize: vertical;
          }
        `
      },
      {
        name: 'resize: inline - should be converted',
        input: `
          .element {
            resize: inline;
          }
        `,
        expected: `
          .element {
            resize: horizontal;
          }
        `
      },
      {
        name: 'Mixed resize values',
        input: `
          .resize-block {
            resize: block;
          }
          .resize-inline {
            resize: inline;
          }
          .resize-both {
            resize: both;
          }
        `,
        expected: `
          .resize-block {
            resize: vertical;
          }
          
          .resize-inline {
            resize: horizontal;
          }
          
          .resize-both {
            resize: both;
          }
        `
      }
    ];

    // Skip resize logical values tests as they are not yet supported by postcss-logical
    // TODO: Enable these tests when resize logical values support is added
    test.skip.each(resizeTests)('$name', runTestCase);
  });

  describe('Complex Scenarios with Logical Values', () => {
    const complexTests: TestCase[] = [
      {
        name: 'Logical values with logical properties (supported)',
        input: `
          .card {
            margin-inline: 1rem;
            text-align: start;
            padding-block: 1rem;
          }
        `,
        expected: `
          .card {
            margin-left: 1rem;
            margin-right: 1rem;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          [dir="ltr"] .card {
            text-align: left;
          }
          [dir="rtl"] .card {
            text-align: right;
          }
        `
      },
      {
        name: 'Media queries with logical values',
        input: `
          .responsive {
            text-align: start;
          }
          
          @media (min-width: 768px) {
            .responsive {
              text-align: end;
              margin-inline: 2rem;
            }
          }
        `,
        expected: `
          [dir="ltr"] .responsive {
            text-align: left;
          }
          [dir="rtl"] .responsive {
            text-align: right;
          }
          @media (min-width: 768px) {
            .responsive {
              margin-left: 2rem;
              margin-right: 2rem;
            }
            [dir="ltr"] .responsive {
              text-align: right;
            }
            [dir="rtl"] .responsive {
              text-align: left;
            }

          }

        `
      }
    ];

    test.each(complexTests)('$name', runTestCase);
  });

  describe('Logical Values in Scoped Rules', () => {
    const scopedTests: TestCase[] = [
      {
        name: 'Logical values in LTR scoped rules',
        input: `
          [dir="ltr"] .element {
            text-align: start;
            margin-inline: 1rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            text-align: left;
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Logical values in RTL scoped rules',
        input: `
          [dir="rtl"] .element {
            text-align: end;
            padding-inline-start: 2rem;
          }
        `,
        expected: `
          [dir="rtl"] .element {
            text-align: left;
            padding-right: 2rem;
          }
        `
      },
      {
        name: 'Mixed scoped rules with logical values',
        input: `
          [dir="ltr"] .nav {
            text-align: start;
            float: left;
          }
          [dir="rtl"] .nav {
            text-align: start;
            float: right;
          }
        `,
        expected: `
          [dir="ltr"] .nav {
            text-align: left;
            float: left;
          }
          [dir="rtl"] .nav {
            text-align: right;
            float: right;
          }
        `
      }
    ];

    test.each(scopedTests)('$name', runTestCase);
  });
});
