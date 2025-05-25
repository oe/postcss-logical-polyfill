import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Output Order Configuration', () => {
  
  describe('Default behavior (ltr-first)', () => {
    const defaultOrderTests: TestCase[] = [
      {
        name: 'margin-inline - default ltr-first order',
        input: `
          .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
        `
      },
      {
        name: 'padding-inline - default ltr-first order',
        input: `
          .container {
            padding-inline: 10px 20px;
          }
        `,
        expected: `
          [dir="ltr"] .container {
            padding-left: 10px;
            padding-right: 20px;
          }
          [dir="rtl"] .container {
            padding-right: 10px;
            padding-left: 20px;
          }
        `
      },
      {
        name: 'border-inline - default ltr-first order',
        input: `
          .box {
            border-inline-start: 1px solid red;
            border-inline-end: 2px solid blue;
          }
        `,
        expected: `
          [dir="ltr"] .box {
            border-left: 1px solid red;
            border-right: 2px solid blue;
          }
          [dir="rtl"] .box {
            border-right: 1px solid red;
            border-left: 2px solid blue;
          }
        `
      },
      {
        name: 'text-align logical values - default ltr-first order',
        input: `
          .text {
            text-align: start;
          }
        `,
        expected: `
          [dir="ltr"] .text {
            text-align: left;
          }
          [dir="rtl"] .text {
            text-align: right;
          }
        `
      }
    ];

    defaultOrderTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('Explicit ltr-first configuration', () => {
    const ltrFirstTests: TestCase[] = [
      {
        name: 'margin-inline - explicit ltr-first order',
        input: `
          .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
        `,
        options: { outputOrder: 'ltr-first' }
      },
      {
        name: 'inset-inline - explicit ltr-first order',
        input: `
          .positioned {
            inset-inline-start: 10px;
            inset-inline-end: 20px;
          }
        `,
        expected: `
          [dir="ltr"] .positioned {
            left: 10px;
            right: 20px;
          }
          [dir="rtl"] .positioned {
            right: 10px;
            left: 20px;
          }
        `,
        options: { outputOrder: 'ltr-first' }
      }
    ];

    ltrFirstTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('RTL-first configuration', () => {
    const rtlFirstTests: TestCase[] = [
      {
        name: 'margin-inline - rtl-first order',
        input: `
          .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
          [dir="ltr"] .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'padding-inline - rtl-first order',
        input: `
          .container {
            padding-inline: 10px 20px;
          }
        `,
        expected: `
          [dir="rtl"] .container {
            padding-right: 10px;
            padding-left: 20px;
          }
          [dir="ltr"] .container {
            padding-left: 10px;
            padding-right: 20px;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'border-inline - rtl-first order',
        input: `
          .box {
            border-inline-start: 1px solid red;
            border-inline-end: 2px solid blue;
          }
        `,
        expected: `
          [dir="rtl"] .box {
            border-right: 1px solid red;
            border-left: 2px solid blue;
          }
          [dir="ltr"] .box {
            border-left: 1px solid red;
            border-right: 2px solid blue;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'text-align logical values - rtl-first order',
        input: `
          .text {
            text-align: start;
          }
        `,
        expected: `
          [dir="rtl"] .text {
            text-align: right;
          }
          [dir="ltr"] .text {
            text-align: left;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'inset-inline - rtl-first order',
        input: `
          .positioned {
            inset-inline-start: 10px;
            inset-inline-end: 20px;
          }
        `,
        expected: `
          [dir="rtl"] .positioned {
            right: 10px;
            left: 20px;
          }
          [dir="ltr"] .positioned {
            left: 10px;
            right: 20px;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      }
    ];

    rtlFirstTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('Complex scenarios with outputOrder', () => {
    const complexTests: TestCase[] = [
      {
        name: 'Multiple logical properties - ltr-first order',
        input: `
          .complex {
            margin-inline-start: 1rem;
            padding-inline-end: 2rem;
            border-inline-start: 1px solid red;
            text-align: start;
          }
        `,
        expected: `
          [dir="ltr"] .complex {
            margin-left: 1rem;
            padding-right: 2rem;
            border-left: 1px solid red;
            text-align: left;
          }
          [dir="rtl"] .complex {
            margin-right: 1rem;
            padding-left: 2rem;
            border-right: 1px solid red;
            text-align: right;
          }
        `,
        options: { outputOrder: 'ltr-first' }
      },
      {
        name: 'Multiple logical properties - rtl-first order',
        input: `
          .complex {
            margin-inline-start: 1rem;
            padding-inline-end: 2rem;
            border-inline-start: 1px solid red;
            text-align: start;
          }
        `,
        expected: `
          [dir="rtl"] .complex {
            margin-right: 1rem;
            padding-left: 2rem;
            border-right: 1px solid red;
            text-align: right;
          }
          [dir="ltr"] .complex {
            margin-left: 1rem;
            padding-right: 2rem;
            border-left: 1px solid red;
            text-align: left;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'Mixed logical and physical properties - ltr-first order',
        input: `
          .mixed {
            margin-top: 10px;
            margin-inline-start: 1rem;
            padding-bottom: 5px;
            padding-inline-end: 2rem;
            color: blue;
          }
        `,
        expected: `
          .mixed {
            margin-top: 10px;
            padding-bottom: 5px;
            color: blue;
          }
          [dir="ltr"] .mixed {
            margin-left: 1rem;
            padding-right: 2rem;
          }
          [dir="rtl"] .mixed {
            margin-right: 1rem;
            padding-left: 2rem;
          }
        `,
        options: { outputOrder: 'ltr-first' }
      },
      {
        name: 'Mixed logical and physical properties - rtl-first order',
        input: `
          .mixed {
            margin-top: 10px;
            margin-inline-start: 1rem;
            padding-bottom: 5px;
            padding-inline-end: 2rem;
            color: blue;
          }
        `,
        expected: `
          .mixed {
            margin-top: 10px;
            padding-bottom: 5px;
            color: blue;
          }
          [dir="rtl"] .mixed {
            margin-right: 1rem;
            padding-left: 2rem;
          }
          [dir="ltr"] .mixed {
            margin-left: 1rem;
            padding-right: 2rem;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      }
    ];

    complexTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('outputOrder with custom selectors', () => {
    const customSelectorTests: TestCase[] = [
      {
        name: 'Custom selectors - ltr-first order',
        input: `
          .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          .ltr .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
          .rtl .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
        `,
        options: {
          ltr: { selector: '.ltr' },
          rtl: { selector: '.rtl' },
          outputOrder: 'ltr-first'
        }
      },
      {
        name: 'Custom selectors - rtl-first order',
        input: `
          .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          .rtl .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
          .ltr .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
        `,
        options: {
          ltr: { selector: '.ltr' },
          rtl: { selector: '.rtl' },
          outputOrder: 'rtl-first'
        }
      },
      {
        name: 'Dir attribute selectors - rtl-first order',
        input: `
          .box {
            padding-inline: 10px 20px;
          }
        `,
        expected: `
          [dir='rtl'] .box {
            padding-right: 10px;
            padding-left: 20px;
          }
          [dir='ltr'] .box {
            padding-left: 10px;
            padding-right: 20px;
          }
        `,
        options: {
          ltr: { selector: '[dir=\'ltr\']' },
          rtl: { selector: '[dir=\'rtl\']' },
          outputOrder: 'rtl-first'
        }
      }
    ];

    customSelectorTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('outputOrder does not affect scoped rules', () => {
    const scopedTests: TestCase[] = [
      {
        name: 'Scoped LTR rules - order should not change regardless of outputOrder',
        input: `
          [dir="ltr"] .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          [dir="ltr"] .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      },
      {
        name: 'Scoped RTL rules - order should not change regardless of outputOrder',
        input: `
          [dir="rtl"] .element {
            margin-inline-start: 1rem;
            margin-inline-end: 2rem;
          }
        `,
        expected: `
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
        `,
        options: { outputOrder: 'ltr-first' }
      },
      {
        name: 'Mixed scoped and unscoped - outputOrder only affects unscoped',
        input: `
          [dir="ltr"] .scoped {
            margin-inline-start: 1rem;
          }
          .unscoped {
            padding-inline-start: 2rem;
          }
          [dir="rtl"] .scoped-rtl {
            border-inline-start: 1px solid red;
          }
        `,
        expected: `
          [dir="ltr"] .scoped {
            margin-left: 1rem;
          }
          [dir="rtl"] .unscoped {
            padding-right: 2rem;
          }
          [dir="ltr"] .unscoped {
            padding-left: 2rem;
          }
          [dir="rtl"] .scoped-rtl {
            border-right: 1px solid red;
          }
        `,
        options: { outputOrder: 'rtl-first' }
      }
    ];

    scopedTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });
});
