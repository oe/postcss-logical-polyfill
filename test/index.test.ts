import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('postcss-logical-polyfill', () => {
  // Array of test cases
  const testCases: TestCase[] = [
    {
      name: 'Basic logical properties transformation',
      input: `
        .button {
          padding-inline-start: 1rem;
          margin-inline: 1rem 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .button {
          padding-left: 1rem;
          margin-left: 1rem;
          margin-right: 2rem;
        }
        [dir="rtl"] .button {
          padding-right: 1rem;
          margin-right: 1rem;
          margin-left: 2rem;
        }
      `
    },

    {
      name: 'Direction-specific selectors: :dir(rtl)',
      input: `
        .button {
          padding-inline-start: 1rem;
        }

        :dir(rtl) .button {
          margin-inline-end: 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .button {
          padding-left: 1rem;
        }
        [dir="rtl"] .button {
          padding-right: 1rem;
          margin-left: 2rem;
        }
      `
    },

    {
      name: 'Direction-specific selectors: [dir="rtl"]',
      input: `
        .button {
          padding-inline-start: 1rem;
        }

        [dir="rtl"] .button {
          margin-inline-end: 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .button {
          padding-left: 1rem;
        }
        [dir="rtl"] .button {
          padding-right: 1rem;
          margin-left: 2rem;
        }
      `
    },

    {
      name: 'Direction-specific selectors: :dir(ltr)',
      input: `
        .button {
          padding-inline-start: 1rem;
        }

        :dir(ltr) .button {
          margin-inline-end: 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .button {
          padding-left: 1rem;
          margin-right: 2rem;
        }
        [dir="rtl"] .button {
          padding-right: 1rem;
        }
      `
    },

    {
      name: 'Complex rules and properties',
      input: `
        .container {
          margin-inline: 1rem 2rem;
          padding-inline: 1rem 2rem;
        }

        :dir(rtl) .container {
          margin-inline: 2rem 1rem;
          border-inline: 1px solid;
        }

        .sidebar {
          inset-inline-start: 0;
        }

        [dir="rtl"] .sidebar {
          border-inline-start: 2px solid;
        }
      `,
      expected: `
        [dir="ltr"] .container {
          margin-left: 1rem;
          margin-right: 2rem;
          padding-left: 1rem;
          padding-right: 2rem;
        }
        [dir="rtl"] .container {
          margin-right: 2rem;
          margin-left: 1rem;
          padding-right: 1rem;
          padding-left: 2rem;
          border-right: 1px solid;
          border-left: 1px solid;
        }
        [dir="ltr"] .sidebar {
          left: 0;
        }
        [dir="rtl"] .sidebar {
          right: 0;
          border-right: 2px solid;
        }
      `
    },

    {
      name: 'Custom direction selectors',
      input: `
        .element {
          padding-inline-end: 1rem;
        }

        :dir(rtl) .element {
          margin-inline-start: 2rem;
        }
      `,
      expected: `
        .ltr .element {
          padding-right: 1rem;
        }
        .rtl .element {
          padding-left: 1rem;
          margin-right: 2rem;
        }
      `,
      options: {
        ltr: { selector: '.ltr' },
        rtl: { selector: '.rtl' }
      }
    },

    {
      name: 'Multiple nested selectors',
      input: `
        .header nav ul li {
          border-inline-end: 1px solid;
        }

        :dir(rtl) .header .menu {
          margin-inline-start: auto;
        }

        .footer {
          padding-inline: 1rem 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .header nav ul li {
          border-right: 1px solid;
        }
        [dir="rtl"] .header nav ul li {
          border-left: 1px solid;
        }
        [dir="rtl"] .header .menu {
          margin-right: auto;
        }
        [dir="ltr"] .footer {
          padding-left: 1rem;
          padding-right: 2rem;
        }
        [dir="rtl"] .footer {
          padding-right: 1rem;
          padding-left: 2rem;
        }
      `
    },

    {
      name: 'Media queries support',
      input: `
        @media (min-width: 768px) {
          .container {
            margin-inline: 2rem;
          }
          
          :dir(rtl) .container {
            padding-inline-end: 1rem;
          }
        }
      `,
      expected: `
        @media (min-width: 768px) {
          [dir="ltr"] .container {
            margin-left: 2rem;
            margin-right: 2rem;
          }
          [dir="rtl"] .container {
            margin-right: 2rem;
            margin-left: 2rem;
            padding-left: 1rem;
          }
        }
      `
    },

    {
      name: 'Logical block properties',
      input: `
        .element {
          margin-block: 1rem 2rem;
          padding-block-start: 1rem;
          padding-block-end: 2rem;
        }
      `,
      expected: `
        [dir="ltr"] .element {
          margin-top: 1rem;
          margin-bottom: 2rem;
          padding-top: 1rem;
          padding-bottom: 2rem;
        }
        [dir="rtl"] .element {
          margin-top: 1rem;
          margin-bottom: 2rem;
          padding-top: 1rem;
          padding-bottom: 2rem;
        }
      `
    },

    {
      name: 'No direction selector for rules without logical properties',
      input: `
        .regular {
          color: blue;
          font-size: 16px;
        }

        .logical {
          margin-inline: 1rem;
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
      `
    }
  ];

  // Generate a test for each test case
  testCases.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  // Output Order Configuration test cases
  const outputOrderTestCases: TestCase[] = [
    {
      name: 'Default ltr-first order',
      input: `
        .container {
          margin-inline: 1rem;
        }
      `,
      expected: `
        [dir="ltr"] .container {
          margin-left: 1rem;
          margin-right: 1rem;
        }
        [dir="rtl"] .container {
          margin-right: 1rem;
          margin-left: 1rem;
        }
      `
    },

    {
      name: 'RTL-first order configuration',
      input: `
        .container {
          margin-inline: 1rem;
        }
      `,
      expected: `
        [dir="rtl"] .container {
          margin-right: 1rem;
          margin-left: 1rem;
        }
        [dir="ltr"] .container {
          margin-left: 1rem;
          margin-right: 1rem;
        }
      `,
      options: {
        outputOrder: 'rtl-first'
      }
    },

    {
      name: 'RTL-first with complex logical properties',
      input: `
        .container {
          margin-inline-start: 1rem;
          margin-inline-end: 2rem;
          padding-inline: 0.5rem;
        }
      `,
      expected: `
        [dir="rtl"] .container {
          margin-right: 1rem;
          margin-left: 2rem;
          padding-right: 0.5rem;
          padding-left: 0.5rem;
        }
        [dir="ltr"] .container {
          margin-left: 1rem;
          margin-right: 2rem;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
      `,
      options: {
        outputOrder: 'rtl-first'
      }
    },

    {
      name: 'Output order only affects unscoped logical properties',
      input: `
        .container {
          margin-inline: 1rem;
        }
        
        [dir="ltr"] .specific {
          padding-inline: 2rem;
        }
        
        [dir="rtl"] .specific {
          padding-inline: 3rem;
        }
      `,
      expected: `
        [dir="rtl"] .container {
          margin-right: 1rem;
          margin-left: 1rem;
        }
        [dir="ltr"] .container {
          margin-left: 1rem;
          margin-right: 1rem;
        }
        [dir="ltr"] .specific {
          padding-left: 2rem;
          padding-right: 2rem;
        }
        [dir="rtl"] .specific {
          padding-right: 3rem;
          padding-left: 3rem;
        }
      `,
      options: {
        outputOrder: 'rtl-first'
      }
    }
  ];

  // Generate tests for output order test cases
  describe('Output Order Configuration', () => {
    outputOrderTestCases.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });
});
