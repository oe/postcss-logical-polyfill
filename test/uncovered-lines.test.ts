import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('postcss-logical-polyfill uncovered lines tests', () => {

  // Test specifically to cover inset-block property detection (lines 20-21)
  const insetTests: TestCase[] = [
    {
      name: 'Should detect inset-block as block-only property',
      input: `
        .inset-block-test {
          inset-block: 10px;
        }
      `,
      expected: `
        .inset-block-test {
          top: 10px;
          bottom: 10px;
        }
      `
    },
    {
      name: 'Should detect inset-block-start as block-only property',
      input: `
        .inset-block-start-test {
          inset-block-start: 15px;
        }
      `,
      expected: `
        .inset-block-start-test {
          top: 15px;
        }
      `
    },
    {
      name: 'Should detect inset-block-end as block-only property', 
      input: `
        .inset-block-end-test {
          inset-block-end: 20px;
        }
      `,
      expected: `
        .inset-block-end-test {
          bottom: 20px;
        }
      `
    },
    {
      name: 'Should handle property names that contain block but are not block-only',
      input: `
        .not-block-only {
          /* This would test any edge case properties that might exist */
          display: block;
          unicode-bidi: isolate;
        }
      `,
      expected: `
        .not-block-only {
          display: block;
          unicode-bidi: isolate;
        }
      `
    }
  ];

  // Run tests
  insetTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

});
