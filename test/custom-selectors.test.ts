import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Custom Direction Selectors with Complex Nesting', () => {
  
  describe('Custom LTR/RTL Selectors vs Built-in Direction Selectors', () => {
    const customVsBuiltinTests: TestCase[] = [
      {
        name: 'Should handle custom selectors with existing [dir] attributes',
        input: `
          .unscoped {
            margin-inline: 1rem;
          }
          
          [dir="ltr"] .has-builtin {
            padding-inline: 2rem;
          }
          
          [dir="rtl"] .has-builtin-rtl {
            border-inline: 1px solid;
          }
        `,
        options: {
          ltr: { selector: '.ltr-custom' },
          rtl: { selector: '.rtl-custom' }
        },
        expected: `
          .unscoped {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          
          [dir="ltr"] .has-builtin {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          
          [dir="rtl"] .has-builtin-rtl {
            border-right: 1px solid;
            border-left: 1px solid;
          }
        `
      },
      {
        name: 'Should handle custom selectors with :dir() pseudo-classes',
        input: `
          .element {
            margin-inline-start: 1rem;
          }
          
          :dir(ltr) .pseudo-ltr {
            padding-inline-end: 2rem;
          }
          
          :dir(rtl) .pseudo-rtl {
            border-inline-start: 3px solid;
          }
        `,
        options: {
          ltr: { selector: '[data-dir="ltr"]' },
          rtl: { selector: '[data-dir="rtl"]' }
        },
        expected: `
          [data-dir="ltr"] .element {
            margin-left: 1rem;
          }
          [data-dir="rtl"] .element {
            margin-right: 1rem;
          }
          
          :dir(ltr) .pseudo-ltr {
            padding-right: 2rem;
          }
          
          :dir(rtl) .pseudo-rtl {
            border-right: 3px solid;
          }
        `
      },
      {
        name: 'Should preserve complex nested direction selectors with custom generation',
        input: `
          .unscoped {
            inset-inline: 0 auto;
          }
          
          [dir="ltr"] :dir(rtl) .nested {
            margin-inline-start: 1rem;
          }
          
          .container[dir="rtl"] .child:dir(ltr) {
            padding-inline-end: 2rem;
          }
        `,
        options: {
          ltr: { selector: '.theme-ltr' },
          rtl: { selector: '.theme-rtl' }
        },
        expected: `
          .theme-ltr .unscoped {
            left: 0;
            right: auto;
          }
          .theme-rtl .unscoped {
            right: 0;
            left: auto;
          }
          
          [dir="ltr"] :dir(rtl) .nested {
            margin-right: 1rem;
          }
          
          .container[dir="rtl"] .child:dir(ltr) {
            padding-right: 2rem;
          }
        `
      }
    ];

    test.each(customVsBuiltinTests)('$name', runTestCase);
  });

  describe('Complex Custom Selector Scenarios', () => {
    const complexCustomTests: TestCase[] = [
      {
        name: 'Should handle class-based custom direction selectors',
        input: `
          .component {
            margin-inline: 1rem;
            padding-block: 2rem;
          }
          
          .existing-ltr .content {
            border-inline-width: 1px;
          }
          
          .existing-rtl .content {
            inset-inline: 0;
          }
        `,
        options: {
          ltr: { selector: '.ltr' },
          rtl: { selector: '.rtl' }
        },
        expected: `
          .component {
            margin-left: 1rem;
            margin-right: 1rem;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
          
          .existing-ltr .content {
            border-left-width: 1px;
            border-right-width: 1px;
          }
          
          .existing-rtl .content {
            left: 0;
            right: 0;
          }
        `
      },
      {
        name: 'Should handle attribute-based custom direction selectors',
        input: `
          .widget {
            padding-inline: 10px 20px;
          }
          
          [lang="ar"] .arabic {
            margin-inline-start: 5px;
          }
          
          [data-theme="dark"][dir="ltr"] .themed {
            border-inline-end: 2px solid;
          }
        `,
        options: {
          ltr: { selector: '[data-direction="left-to-right"]' },
          rtl: { selector: '[data-direction="right-to-left"]' }
        },
        expected: `
          [data-direction="left-to-right"] .widget {
            padding-left: 10px;
            padding-right: 20px;
          }
          [data-direction="right-to-left"] .widget {
            padding-right: 10px;
            padding-left: 20px;
          }
          
          [data-direction="left-to-right"] [lang="ar"] .arabic {
            margin-left: 5px;
          }
          [data-direction="right-to-left"] [lang="ar"] .arabic {
            margin-right: 5px;
          }
          
          [data-theme="dark"][dir="ltr"] .themed {
            border-right: 2px solid;
          }
        `
      },
      {
        name: 'Should handle pseudo-class based custom direction selectors',
        input: `
          .menu {
            margin-inline: auto;
          }
          
          :dir(ltr) .existing {
            padding-inline-start: 1rem;
          }
          
          [dir="rtl"]:hover .interactive {
            inset-inline-end: 10px;
          }
        `,
        options: {
          ltr: { selector: ':is(.ltr, [dir="ltr"])' },
          rtl: { selector: ':is(.rtl, [dir="rtl"])' }
        },
        expected: `
          .menu {
            margin-left: auto;
            margin-right: auto;
          }
          
          :dir(ltr) .existing {
            padding-left: 1rem;
          }
          
          [dir="rtl"]:hover .interactive {
            left: 10px;
          }
        `
      }
    ];

    test.each(complexCustomTests)('$name', runTestCase);
  });

  describe('Custom Selectors with Contradictory Direction Information', () => {
    const contradictoryTests: TestCase[] = [
      {
        name: 'Should preserve user intent when custom and built-in selectors conflict',
        input: `
          .base {
            margin-inline: 1rem;
          }
          
          /* This selector has both custom LTR class and built-in RTL attribute */
          .ltr-theme[dir="rtl"] .conflicted {
            padding-inline-start: 2rem;
          }
          
          /* This has built-in LTR but custom RTL context */
          .rtl-theme [dir="ltr"] .nested {
            border-inline-end: 1px solid;
          }
        `,
        options: {
          ltr: { selector: '.ltr-theme' },
          rtl: { selector: '.rtl-theme' }
        },
        expected: `
          .base {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          
          .ltr-theme[dir="rtl"] .conflicted {
            padding-right: 2rem;
          }
          
          .rtl-theme [dir="ltr"] .nested {
            border-right: 1px solid;
          }
        `
      },
      {
        name: 'Should handle multiple levels of direction nesting with custom selectors',
        input: `
          .app {
            inset-inline: 0 10px;
          }
          
          .custom-ltr .section .custom-rtl .item {
            margin-inline-start: 5px;
          }
          
          .custom-rtl [dir="ltr"] .mixed {
            padding-inline-end: 8px;
          }
          
          :dir(rtl) .custom-ltr .complex {
            border-inline-width: 2px;
          }
        `,
        options: {
          ltr: { selector: '.custom-ltr' },
          rtl: { selector: '.custom-rtl' }
        },
        expected: `
          .custom-ltr .app {
            left: 0;
            right: 10px;
          }
          .custom-rtl .app {
            right: 0;
            left: 10px;
          }
          
          .custom-ltr .section .custom-rtl .item {
            margin-right: 5px;
          }
          
          .custom-rtl [dir="ltr"] .mixed {
            padding-right: 8px;
          }
          
          :dir(rtl) .custom-ltr .complex {
            border-left-width: 2px;
            border-right-width: 2px;
          }
        `
      }
    ];

    test.each(contradictoryTests)('$name', runTestCase);
  });

  describe('Custom Selectors Edge Cases', () => {
    const edgeCaseTests: TestCase[] = [
      {
        name: 'Should handle identical custom and built-in selectors',
        input: `
          .element {
            margin-inline: 1rem;
          }
          
          [dir="ltr"] .scoped {
            padding-inline: 2rem;
          }
        `,
        options: {
          ltr: { selector: '[dir="ltr"]' }, // Same as default
          rtl: { selector: '[dir="rtl"]' } // Same as default
        },
        expected: `
          .element {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          
          [dir="ltr"] .scoped {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        `
      },
      {
        name: 'Should handle very complex custom selectors',
        input: `
          .widget {
            border-inline-start: 1px solid;
          }
          
          .existing:dir(ltr) .content {
            inset-inline-end: 0;
          }
        `,
        options: {
          ltr: { selector: 'html[data-theme="light"][data-dir="ltr"] body' },
          rtl: { selector: 'html[data-theme="light"][data-dir="rtl"] body' }
        },
        expected: `
          html[data-theme="light"][data-dir="ltr"] body .widget {
            border-left: 1px solid;
          }
          html[data-theme="light"][data-dir="rtl"] body .widget {
            border-right: 1px solid;
          }
          
          .existing:dir(ltr) .content {
            right: 0;
          }
        `
      },
      {
        name: 'Should handle custom selectors with CSS combinators',
        input: `
          .item {
            margin-inline: 10px;
          }
          
          .parent > [dir="ltr"] + .child {
            padding-inline-start: 5px;
          }
        `,
        options: {
          ltr: { selector: '.layout > .ltr-container' },
          rtl: { selector: '.layout > .rtl-container' }
        },
        expected: `
          .item {
            margin-left: 10px;
            margin-right: 10px;
          }
          
          .parent > [dir="ltr"] + .child {
            padding-left: 5px;
          }
        `
      },
      {
        name: 'Should handle empty or single-direction custom selectors',
        input: `
          .element {
            margin-inline: 1rem 2rem;
          }
          
          [dir="rtl"] .rtl-only {
            padding-inline: 2rem;
          }
        `,
        options: {
          ltr: { selector: '.custom-ltr' }
          // RTL selector not specified - should use default
        },
        expected: `
          .custom-ltr .element {
            margin-left: 1rem;
            margin-right: 2rem;
          }
          [dir="rtl"] .element {
            margin-right: 1rem;
            margin-left: 2rem;
          }
          
          [dir="rtl"] .rtl-only {
            padding-right: 2rem;
            padding-left: 2rem;
          }
        `
      }
    ];

    test.each(edgeCaseTests)('$name', runTestCase);
  });

  describe('Real-world Custom Selector Scenarios', () => {
    const realWorldTests: TestCase[] = [
      {
        name: 'Should handle Tailwind CSS-style direction classes',
        input: `
          .card {
            margin-inline: 1rem;
            padding-block: 2rem;
          }
          
          .ltr .specific-ltr {
            border-inline-start: 1px solid;
          }
          
          .rtl .specific-rtl {
            border-inline-end: 2px dashed;
          }
          
          /* Mixed with standard dir attributes */
          [dir="ltr"] .mixed {
            inset-inline: 0 auto;
          }
        `,
        options: {
          ltr: { selector: '.ltr' },
          rtl: { selector: '.rtl' }
        },
        expected: `
          .card {
            margin-left: 1rem;
            margin-right: 1rem;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
          .ltr .specific-ltr {
            border-left: 1px solid;
          }
          
          .rtl .specific-rtl {
            border-left: 2px dashed;
          }
          
          [dir="ltr"] .mixed {
            left: 0;
            right: auto;
          }
        `
      },
      {
        name: 'Should handle framework-agnostic data attributes',
        input: `
          .component {
            padding-inline: 1em;
          }
          
          [data-dir="ltr"] .framework-specific {
            margin-inline-start: 0.5em;
          }
          
          [data-dir="rtl"] .framework-specific {
            margin-inline-start: 1em;
          }
          
          /* Standard dir for comparison */
          :dir(ltr) .standard {
            border-inline: 1px solid;
          }
        `,
        options: {
          ltr: { selector: '[data-dir="ltr"]' },
          rtl: { selector: '[data-dir="rtl"]' }
        },
        expected: `
          .component {
            padding-left: 1em;
            padding-right: 1em;
          }
          [data-dir="ltr"] .framework-specific {
            margin-left: 0.5em;
          }
          
          [data-dir="rtl"] .framework-specific {
            margin-right: 1em;
          }
          
          :dir(ltr) .standard {
            border-left: 1px solid;
            border-right: 1px solid;
          }
        `
      },
      {
        name: 'Should handle theming with direction context',
        input: `
          .widget {
            margin-inline: var(--spacing);
          }
          
          .theme-dark.theme-ltr .dark-ltr {
            padding-inline-end: 10px;
          }
          
          .theme-light [dir="rtl"] .mixed-theme {
            border-inline-start: var(--border-width) solid;
          }
        `,
        options: {
          ltr: { selector: '.theme-ltr' },
          rtl: { selector: '.theme-rtl' }
        },
        expected: `
          .widget {
            margin-left: var(--spacing);
            margin-right: var(--spacing);
          }
          
          .theme-dark.theme-ltr .dark-ltr {
            padding-right: 10px;
          }
          
          .theme-light [dir="rtl"] .mixed-theme {
            border-right: var(--border-width) solid;
          }
        `
      }
    ];

    test.each(realWorldTests)('$name', runTestCase);
  });
});
