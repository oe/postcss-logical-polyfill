import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Nested Rules Processing', () => {
  
  describe('Nested at-rules', () => {
    const nestedAtRuleTests: TestCase[] = [
      {
        name: 'Media queries with logical properties',
        input: `
          @media (min-width: 768px) {
            .element {
              margin-inline: 1rem;
              padding-block: 2rem;
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            .element {
              margin-left: 1rem;
              margin-right: 1rem;
              padding-top: 2rem;
              padding-bottom: 2rem;
            }
          }
        `
      },
      {
        name: 'Deeply nested at-rules (media, supports, container, layer)',
        input: `
          @media (min-width: 768px) {
            @supports (margin-inline: 1rem) {
              @container (min-width: 300px) {
                @layer base {
                  .element {
                    margin-inline: 1rem;
                    padding-block: 2rem;
                  }
                }
              }
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            @supports (margin-inline: 1rem) {
              @container (min-width: 300px) {
                @layer base {
                  .element {
                    margin-left: 1rem;
                    margin-right: 1rem;
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                  }
                }
              }
            }
          }
        `
      },
      {
        name: 'Multiple nested rules with different levels',
        input: `
          @media (min-width: 768px) {
            .first {
              margin-inline: 1rem;
            }
            
            @supports (display: grid) {
              .second {
                padding-inline: 2rem;
              }
              
              @media (prefers-color-scheme: dark) {
                .third {
                  border-inline: 1px solid white;
                }
              }
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            .first {
              margin-left: 1rem;
              margin-right: 1rem;
            }
            
            @supports (display: grid) {
              .second {
                padding-left: 2rem;
                padding-right: 2rem;
              }
              
              @media (prefers-color-scheme: dark) {
                .third {
                  border-left: 1px solid white;
                  border-right: 1px solid white;
                }
              }
            }
          }
        `
      },
      {
        name: 'Mixed nested rules with and without logical properties',
        input: `
          @media (min-width: 768px) {
            .no-logical {
              color: blue;
              background: white;
            }
            
            .with-logical {
              margin-inline: 1rem;
              color: red;
            }
            
            @supports (display: grid) {
              .mixed {
                margin-top: 10px;
                padding-inline: 1rem;
                color: green;
              }
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            .no-logical {
              color: blue;
              background: white;
            }
            
            .with-logical {
              margin-left: 1rem;
              margin-right: 1rem;
              color: red;
            }
            
            @supports (display: grid) {
              .mixed {
                margin-top: 10px;
                padding-left: 1rem;
                padding-right: 1rem;
                color: green;
              }
            }
          }
        `
      },
      {
        name: 'Nested rules with directional selectors',
        input: `
          @media (min-width: 768px) {
            [dir="ltr"] .element {
              margin-inline: 1rem;
            }
            
            [dir="rtl"] .element {
              padding-inline: 2rem;
            }
            
            .both {
              border-inline: 1px solid;
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            [dir="ltr"] .element {
              margin-left: 1rem;
              margin-right: 1rem;
            }
            
            [dir="rtl"] .element {
              padding-right: 2rem;
              padding-left: 2rem;
            }
            
            .both {
              border-left: 1px solid;
              border-right: 1px solid;
            }
          }
        `
      },
      {
        name: 'Nested at-rules with RTL-first configuration',
        input: `
          @media (min-width: 768px) {
            .element {
              margin-inline: 1rem;
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            .element {
              margin-left: 1rem;
              margin-right: 1rem;
            }
          }
        `,
        options: { outputOrder: 'rtl-first' }
      }
    ];

    nestedAtRuleTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('Keyframes and other special at-rules', () => {
    const specialAtRuleTests: TestCase[] = [
      {
        name: 'Keyframes should be processed specially',
        input: `
          @keyframes slide-in {
            from {
              margin-inline-start: -100%;
            }
            to {
              margin-inline-start: 0;
            }
          }
          
          .element {
            animation: slide-in 1s;
            margin-inline: 1rem;
          }
        `,
        expected: `
          @keyframes slide-in {
            from {
              margin-inline-start: -100%;
            }
            to {
              margin-inline-start: 0;
            }
          }
          
          .element {
            animation: slide-in 1s;
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Font-face rules with surrounding logical properties',
        input: `
          .before {
            margin-inline: 1rem;
          }
          
          @font-face {
            font-family: 'Example';
            src: url('example.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          
          .after {
            padding-inline: 2rem;
          }
        `,
        expected: `
          .before {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          
          @font-face {
            font-family: 'Example';
            src: url('example.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          
          .after {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        `
      }
    ];

    specialAtRuleTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });
});
