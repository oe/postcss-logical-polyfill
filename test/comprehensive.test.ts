import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('postcss-logical-polyfill comprehensive tests', () => {
  
  // Edge case tests for mixed vs block-only properties
  const edgeCaseTests: TestCase[] = [
    {
      name: 'Edge case: inset properties - mixed vs block-only',
      input: `
        .mixed {
          inset: 10px;
        }
        .block-only {
          inset-block: 20px;
          inset-block-start: 30px;
          inset-block-end: 40px;
        }
      `,
      expected: `
        [dir="ltr"] .mixed {
          top: 10px;
          right: 10px;
          bottom: 10px;
          left: 10px;
        }
        [dir="rtl"] .mixed {
          top: 10px;
          right: 10px;
          bottom: 10px;
          left: 10px;
        }
        .block-only {
          top: 20px;
          bottom: 20px;
          top: 30px;
          bottom: 40px;
        }
      `
    },
    {
      name: 'Mixed scenarios: block and inline properties in same rule',
      input: `
        .mixed-rule {
          margin-block: 10px;
          margin-inline: 20px;
          padding-block-start: 30px;
          padding-inline-end: 40px;
        }
      `,
      expected: `
        [dir="ltr"] .mixed-rule {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-left: 20px;
          margin-right: 20px;
          padding-top: 30px;
          padding-right: 40px;
        }
        [dir="rtl"] .mixed-rule {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-right: 20px;
          margin-left: 20px;
          padding-top: 30px;
          padding-left: 40px;
        }
      `
    },
    {
      name: 'Rules with existing direction selectors and block properties',
      input: `
        [dir="ltr"] .existing-ltr {
          margin-block: 10px;
          padding-block-start: 20px;
        }
        [dir="rtl"] .existing-rtl {
          margin-block: 30px;
          padding-block-end: 40px;
        }
      `,
      expected: `
        [dir="ltr"] .existing-ltr {
          margin-top: 10px;
          margin-bottom: 10px;
          padding-top: 20px;
        }
        [dir="rtl"] .existing-rtl {
          margin-top: 30px;
          margin-bottom: 30px;
          padding-bottom: 40px;
        }
      `
    },
    {
      name: 'Rules with no logical properties should pass through unchanged',
      input: `
        .regular {
          margin: 10px;
          padding: 20px;
          color: red;
        }
      `,
      expected: `
        .regular {
          margin: 10px;
          padding: 20px;
          color: red;
        }
      `
    }
  ];

  // Comprehensive block properties test
  const blockPropertiesTests: TestCase[] = [
    {
      name: 'Comprehensive block direction properties',
      input: `
        .all-block-props {
          margin-block: 1px;
          margin-block-start: 2px;
          margin-block-end: 3px;
          padding-block: 4px;
          padding-block-start: 5px;
          padding-block-end: 6px;
          border-block-width: 7px;
          border-block-start-width: 8px;
          border-block-end-width: 9px;
          inset-block: 14px;
          inset-block-start: 15px;
          inset-block-end: 16px;
          block-size: 100px;
          min-block-size: 50px;
          max-block-size: 200px;
        }
      `,
      expected: `
        .all-block-props {
          margin-top: 1px;
          margin-bottom: 1px;
          margin-top: 2px;
          margin-bottom: 3px;
          padding-top: 4px;
          padding-bottom: 4px;
          padding-top: 5px;
          padding-bottom: 6px;
          border-top-width: 7px;
          border-bottom-width: 7px;
          border-top-width: 8px;
          border-bottom-width: 9px;
          top: 14px;
          bottom: 14px;
          top: 15px;
          bottom: 16px;
          height: 100px;
          min-height: 50px;
          max-height: 200px;
        }
      `
    }
  ];

  // Complex scenarios tests
  const complexScenarioTests: TestCase[] = [
    {
      name: 'Mixed rule with both logical and non-logical properties',
      input: `
        .mixed-props {
          margin-block: 10px;
          color: red;
          margin-inline: 20px;
          display: flex;
        }
      `,
      expected: `
        [dir="ltr"] .mixed-props {
          margin-top: 10px;
          margin-bottom: 10px;
          color: red;
          margin-left: 20px;
          margin-right: 20px;
          display: flex;
        }
        [dir="rtl"] .mixed-props {
          margin-top: 10px;
          margin-bottom: 10px;
          color: red;
          margin-right: 20px;
          margin-left: 20px;
          display: flex;
        }
      `
    },
    {
      name: 'Complex selectors with logical properties',
      input: `
        .parent > .child:hover,
        .another-selector[attr="value"] {
          margin-block: 10px;
          margin-inline: 20px;
        }
      `,
      expected: `
        [dir="ltr"] .parent > .child:hover,
        [dir="ltr"] .another-selector[attr="value"] {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-left: 20px;
          margin-right: 20px;
        }
        [dir="rtl"] .parent > .child:hover,
        [dir="rtl"] .another-selector[attr="value"] {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-right: 20px;
          margin-left: 20px;
        }
      `
    },
    {
      name: 'Nested selectors with block-only properties',
      input: `
        .container .nested {
          padding-block: 15px;
          margin-block-start: 25px;
        }
      `,
      expected: `
        .container .nested {
          padding-top: 15px;
          padding-bottom: 15px;
          margin-top: 25px;
        }
      `
    },
    {
      name: 'Empty rules and whitespace handling',
      input: `
        .empty {
        }
        
        .whitespace {
          
          margin-block: 10px;
          
        }
      `,
      expected: `
        .empty {
        }
        
        .whitespace {
          margin-top: 10px;
          margin-bottom: 10px;
        }
      `
    }
  ];

  // Plugin options tests
  const optionsTests: TestCase[] = [
    {
      name: 'Plugin options: custom selectors',
      input: `
        .test {
          margin-inline: 10px;
        }
      `,
      expected: `
        .ltr .test {
          margin-left: 10px;
          margin-right: 10px;
        }
        .rtl .test {
          margin-right: 10px;
          margin-left: 10px;
        }
      `,
      options: {
        ltr: { selector: '.ltr' },
        rtl: { selector: '.rtl' }
      }
    }
  ];

  // Error handling tests (these need special handling as they may not match exact output)
  const errorHandlingTests: TestCase[] = [
    {
      name: 'Malformed CSS with block properties should not crash',
      input: `
        .malformed {
          margin-block: 10px;
          invalid-syntax: ;
        }
      `,
      expected: `
        .malformed {
          margin-top: 10px;
          margin-bottom: 10px;
          invalid-syntax: ;
        }
      `
    },
    {
      name: 'Malformed CSS with inline properties should not crash',
      input: `
        .malformed-inline {
          margin-inline: 10px;
          invalid-syntax: ;
        }
      `,
      expected: `
        [dir="ltr"] .malformed-inline {
          margin-left: 10px;
          margin-right: 10px;
          invalid-syntax: ;
        }
        [dir="rtl"] .malformed-inline {
          margin-right: 10px;
          margin-left: 10px;
          invalid-syntax: ;
        }
      `
    }
  ];

  // Run all test suites
  edgeCaseTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  blockPropertiesTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  complexScenarioTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  optionsTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

  errorHandlingTests.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });

});
