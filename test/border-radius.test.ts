import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Border radius logical properties', () => {
  const borderRadiusTests: TestCase[] = [
    {
      name: 'border-start-start-radius should generate LTR/RTL rules (not block-only)',
      input: `
        .rounded {
          border-start-start-radius: 10px;
        }
      `,
      expected: `
        [dir="ltr"] .rounded {
          border-top-left-radius: 10px;
        }
        [dir="rtl"] .rounded {
          border-top-right-radius: 10px;
        }
      `
    },
    {
      name: 'border-start-end-radius should generate LTR/RTL rules (not block-only)', 
      input: `
        .rounded {
          border-start-end-radius: 10px;
        }
      `,
      expected: `
        [dir="ltr"] .rounded {
          border-top-right-radius: 10px;
        }
        [dir="rtl"] .rounded {
          border-top-left-radius: 10px;
        }
      `
    },
    {
      name: 'border-end-start-radius should generate LTR/RTL rules (not block-only)',
      input: `
        .rounded {
          border-end-start-radius: 10px;
        }
      `,
      expected: `
        [dir="ltr"] .rounded {
          border-bottom-left-radius: 10px;
        }
        [dir="rtl"] .rounded {
          border-bottom-right-radius: 10px;
        }
      `
    },
    {
      name: 'border-end-end-radius should generate LTR/RTL rules (not block-only)',
      input: `
        .rounded {
          border-end-end-radius: 10px;
        }
      `,
      expected: `
        [dir="ltr"] .rounded {
          border-bottom-right-radius: 10px;
        }
        [dir="rtl"] .rounded {
          border-bottom-left-radius: 10px;
        }
      `
    },
    {
      name: 'Multiple border radius properties together',
      input: `
        .rounded-card {
          border-start-start-radius: 12px;
          border-start-end-radius: 8px;
          border-end-start-radius: 4px;
          border-end-end-radius: 16px;
        }
      `,
      expected: `
        [dir="ltr"] .rounded-card {
          border-top-left-radius: 12px;
          border-top-right-radius: 8px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 16px;
        }
        [dir="rtl"] .rounded-card {
          border-top-right-radius: 12px;
          border-top-left-radius: 8px;
          border-bottom-right-radius: 4px;
          border-bottom-left-radius: 16px;
        }
      `
    },
    {
      name: 'Border radius with existing direction selectors',
      input: `
        .base {
          border-start-start-radius: 8px;
        }
        
        :dir(rtl) .rtl-only {
          border-start-end-radius: 12px;
        }
        
        [dir="ltr"] .ltr-only {
          border-end-start-radius: 6px;
        }
      `,
      expected: `
        [dir="ltr"] .base {
          border-top-left-radius: 8px;
        }
        [dir="rtl"] .base {
          border-top-right-radius: 8px;
        }
        [dir="rtl"] .rtl-only {
          border-top-left-radius: 12px;
        }
        [dir="ltr"] .ltr-only {
          border-bottom-left-radius: 6px;
        }
      `
    },
    {
      name: 'Mixed border radius and true block properties',
      input: `
        .mixed {
          margin-block: 10px;
          border-start-start-radius: 8px;
          padding-block-start: 20px;
        }
      `,
      expected: `
        [dir="ltr"] .mixed {
          margin-top: 10px;
          margin-bottom: 10px;
          border-top-left-radius: 8px;
          padding-top: 20px;
        }
        [dir="rtl"] .mixed {
          margin-top: 10px;
          margin-bottom: 10px;
          border-top-right-radius: 8px;
          padding-top: 20px;
        }
      `
    }
  ];

  borderRadiusTests.forEach(({ name, input, expected, options }) => {
    test(name, async () => {
      await runTestCase({ name, input, expected, options });
    });
  });
});
