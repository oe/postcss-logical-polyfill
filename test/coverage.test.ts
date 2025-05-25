import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('postcss-logical-polyfill coverage tests', () => {
  // Test cases to improve code coverage
  const coverageTestCases: TestCase[] = [
    {
      name: 'Rules without logical properties or direction selectors should remain unchanged',
      input: `
        .regular {
          color: blue;
          font-size: 16px;
          background: white;
        }
      `,
      expected: `
        .regular {
          color: blue;
          font-size: 16px;
          background: white;
        }
      `
    },

    {
      name: 'Direction-specific selectors without logical properties',
      input: `
        :dir(ltr) .ltr-only {
          text-align: left;
          font-family: Arial;
        }

        [dir="rtl"] .rtl-only {
          text-align: right;
          font-family: "Arabic UI";
        }
      `,
      expected: `
        [dir="ltr"] .ltr-only {
          text-align: left;
          font-family: Arial;
        }

        [dir="rtl"] .rtl-only {
          text-align: right;
          font-family: "Arabic UI";
        }
      `
    },

    {
      name: 'Mixed content - some rules with logical properties, some without',
      input: `
        .regular {
          color: blue;
          font-size: 16px;
        }

        .logical {
          margin-inline: 1rem;
        }

        :dir(rtl) .direction-only {
          text-align: right;
        }
      `,
      expected: `
        .regular {
          color: blue;
          font-size: 16px;
        }

        [dir="ltr"] .logical {
          margin-left: 1rem;
          margin-right: 1rem;
        }
        [dir="rtl"] .logical {
          margin-right: 1rem;
          margin-left: 1rem;
        }

        [dir="rtl"] .direction-only {
          text-align: right;
        }
      `
    },

    {
      name: 'Only LTR direction selector without logical properties',
      input: `
        :dir(ltr) .ltr-specific {
          font-family: "Segoe UI";
          text-decoration: underline;
        }

        [dir="ltr"] .another-ltr {
          border: 1px solid;
        }
      `,
      expected: `
        [dir="ltr"] .ltr-specific {
          font-family: "Segoe UI";
          text-decoration: underline;
        }

        [dir="ltr"] .another-ltr {
          border: 1px solid;
        }
      `
    },

    {
      name: 'Only RTL direction selector without logical properties',
      input: `
        :dir(rtl) .rtl-specific {
          font-family: "Arabic UI";
          text-decoration: underline;
        }

        [dir="rtl"] .another-rtl {
          border: 1px solid;
        }
      `,
      expected: `
        [dir="rtl"] .rtl-specific {
          font-family: "Arabic UI";
          text-decoration: underline;
        }

        [dir="rtl"] .another-rtl {
          border: 1px solid;
        }
      `
    },

    {
      name: 'Complex selectors with direction but no logical properties',
      input: `
        .container :dir(ltr) .nested {
          background: linear-gradient(to right, red, blue);
        }

        .header [dir="rtl"] .title {
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
      `,
      expected: `
        [dir="ltr"] .container .nested {
          background: linear-gradient(to right, red, blue);
        }

        [dir="rtl"] .header .title {
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
      `
    },

    {
      name: 'Empty rules and edge cases',
      input: `
        .empty-logical {
          margin-inline: 0;
        }

        :dir(ltr) .empty-direction {
        }

        .normal {
          display: block;
        }
      `,
      expected: `
        .normal {
          display: block;
        }

        [dir="ltr"] .empty-logical {
          margin-left: 0;
          margin-right: 0;
        }
        [dir="rtl"] .empty-logical {
          margin-right: 0;
          margin-left: 0;
        }

        [dir="ltr"] .empty-direction {
        }
      `
    },

    {
      name: 'Multiple direction selectors of same type',
      input: `
        :dir(ltr) .first {
          color: blue;
        }

        :dir(ltr) .second {
          color: red;
        }

        [dir="rtl"] .third {
          color: green;
        }

        [dir="rtl"] .fourth {
          color: yellow;
        }
      `,
      expected: `
        [dir="ltr"] .first {
          color: blue;
        }

        [dir="ltr"] .second {
          color: red;
        }

        [dir="rtl"] .third {
          color: green;
        }

        [dir="rtl"] .fourth {
          color: yellow;
        }
      `
    }
  ];

  // Run all coverage test cases
  coverageTestCases.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });
});