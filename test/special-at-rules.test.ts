import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Special At-Rules - Detailed Tests', () => {
  describe('@keyframes Special Handling', () => {
    const keyframesTests: TestCase[] = [
      {
        name: 'Should preserve logical properties inside keyframes',
        input: `
          @keyframes slide-in {
            from {
              margin-inline-start: -100%;
              padding-inline-start: 0;
            }
            to {
              margin-inline-start: 0;
              padding-inline-start: 20px;
            }
          }
          
          .element {
            animation: slide-in 1s ease forwards;
            margin-inline: 1rem;
          }
        `,
        expected: `
          @keyframes slide-in {
            from {
              margin-inline-start: -100%;
              padding-inline-start: 0;
            }
            to {
              margin-inline-start: 0;
              padding-inline-start: 20px;
            }
          }
          
          .element {
            animation: slide-in 1s ease forwards;
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Should handle multiple keyframes with logical properties',
        input: `
          @keyframes slide-in {
            from { margin-inline-start: -100%; }
            to { margin-inline-start: 0; }
          }
          
          @keyframes fade-in {
            from { opacity: 0; padding-inline: 0; }
            to { opacity: 1; padding-inline: 20px; }
          }
          
          .slide { animation: slide-in 1s; }
          .fade { animation: fade-in 0.5s; }
        `,
        expected: `
          @keyframes slide-in {
            from { margin-inline-start: -100%; }
            to { margin-inline-start: 0; }
          }
          
          @keyframes fade-in {
            from { opacity: 0; padding-inline: 0; }
            to { opacity: 1; padding-inline: 20px; }
          }
          
          .slide { animation: slide-in 1s; }
          .fade { animation: fade-in 0.5s; }
        `
      },
      {
        name: 'Should handle nested keyframes inside media queries',
        input: `
          @media (min-width: 768px) {
            @keyframes slide-in-large {
              from { margin-inline-start: -200%; }
              to { margin-inline-start: 0; }
            }
            
            .element {
              animation: slide-in-large 1.5s;
              padding-inline: 2rem;
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            @keyframes slide-in-large {
              from { margin-inline-start: -200%; }
              to { margin-inline-start: 0; }
            }
            
            .element {
              animation: slide-in-large 1.5s;
              padding-left: 2rem;
              padding-right: 2rem;
            }
          }
        `
      }
    ];

    keyframesTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });
  
  describe('@font-face Special Handling', () => {
    const fontFaceTests: TestCase[] = [
      {
        name: 'Should preserve logical properties inside font-face (even though they rarely occur there)',
        input: `
          @font-face {
            font-family: 'MyFont';
            src: url('myfont.woff2') format('woff2');
            /* This is unusual but should be preserved */
            margin-inline: 0;
          }
          
          .text {
            font-family: 'MyFont';
            margin-inline: 1rem;
          }
        `,
        expected: `
          @font-face {
            font-family: 'MyFont';
            src: url('myfont.woff2') format('woff2');
            /* This is unusual but should be preserved */
            margin-inline: 0;
          }
          
          .text {
            font-family: 'MyFont';
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Should handle multiple font-face rules with surrounding content',
        input: `
          .before { margin-inline: 1rem; }
          
          @font-face {
            font-family: 'Font1';
            src: url('font1.woff2');
            padding-inline: 0; /* Unusual but should be preserved */
          }
          
          @font-face {
            font-family: 'Font2';
            src: url('font2.woff2');
            margin-block: 0; /* Unusual but should be preserved */
          }
          
          .after { padding-inline: 2rem; }
        `,
        expected: `
          .before { margin-left: 1rem; margin-right: 1rem; }
          
          @font-face {
            font-family: 'Font1';
            src: url('font1.woff2');
            padding-inline: 0; /* Unusual but should be preserved */
          }
          
          @font-face {
            font-family: 'Font2';
            src: url('font2.woff2');
            margin-block: 0; /* Unusual but should be preserved */
          }
          
          .after { padding-left: 2rem; padding-right: 2rem; }
        `
      }
    ];

    fontFaceTests.forEach(testCase => {
      test(testCase.name, async () => {
        await runTestCase(testCase);
      });
    });
  });
  
  describe('@counter-style and @page Special Handling', () => {
    const specialAtRuleTests: TestCase[] = [
      {
        name: 'Should preserve logical properties inside counter-style',
        input: `
          @counter-style custom {
            system: cyclic;
            symbols: "➀" "➁" "➂";
            /* Unusual but should be preserved */
            margin-inline: 0;
          }
          
          .list {
            list-style: custom;
            margin-inline: 1rem;
          }
        `,
        expected: `
          @counter-style custom {
            system: cyclic;
            symbols: "➀" "➁" "➂";
            /* Unusual but should be preserved */
            margin-inline: 0;
          }
          
          .list {
            list-style: custom;
            margin-left: 1rem;
            margin-right: 1rem;
          }
        `
      },
      {
        name: 'Should preserve logical properties inside page at-rule',
        input: `
          @page {
            margin-inline: 2cm;
            padding-block: 1cm;
          }
          
          .content {
            margin-inline: 1rem;
          }
        `,
        expected: `
          @page {
            margin-inline: 2cm;
            padding-block: 1cm;
          }
          
          .content {
            margin-left: 1rem;
            margin-right: 1rem;
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
  
  describe('@media and Responsive Support', () => {
    const mediaTests: TestCase[] = [
      {
        name: 'logical properties inside @media queries',
        input: `
          @media (min-width: 768px) {
            .responsive {
              margin-inline-start: 20px;
              padding-block: 10px;
            }
          }
        `,
        expected: `
          @media (min-width: 768px) {
            .responsive {
              padding-top: 10px;
              padding-bottom: 10px;
            }
            [dir="ltr"] .responsive {
              margin-left: 20px;
            }
            [dir="rtl"] .responsive {
              margin-right: 20px;
            }
          }
        `
      },
      {
        name: 'nested @media queries within @supports',
        input: `
          @supports (margin-inline-start: 0) {
            @media (min-width: 768px) {
              .nested {
                margin-inline-start: 15px;
              }
            }
          }
        `,
        expected: `
          @supports (margin-inline-start: 0) {
            @media (min-width: 768px) {
              [dir="ltr"] .nested {
                margin-left: 15px;
              }
              [dir="rtl"] .nested {
                margin-right: 15px;
              }
            }
          }
        `
      },
      {
        name: 'multiple @media queries with different logical properties',
        input: `
          @media (max-width: 767px) {
            .mobile {
              margin-inline: 10px;
            }
          }
          
          @media (min-width: 768px) {
            .desktop {
              padding-inline-start: 20px;
            }
          }
        `,
        expected: `
          @media (max-width: 767px) {
            .mobile {
              margin-left: 10px;
              margin-right: 10px;
            }
          }
          
          @media (min-width: 768px) {
            [dir="ltr"] .desktop {
              padding-left: 20px;
            }
            [dir="rtl"] .desktop {
              padding-right: 20px;
            }
          }
        `
      }
    ];

    test.each(mediaTests)('$name', runTestCase);
  });

  describe('@container and Modern At-Rules', () => {
    const containerTests: TestCase[] = [
      {
        name: '@container queries with logical properties',
        input: `
          @container (min-width: 300px) {
            .container-element {
              padding-inline: 1rem;
            }
          }
        `,
        expected: `
          @container (min-width: 300px) {
            .container-element {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
        `
      },
      {
        name: '@layer with logical properties',
        input: `
          @layer utilities {
            .utility {
              margin-inline-start: 10px;
            }
          }
        `,
        expected: `
          @layer utilities {
            [dir="ltr"] .utility {
              margin-left: 10px;
            }
            [dir="rtl"] .utility {
              margin-right: 10px;
            }
          }
        `
      },
      {
        name: 'complex nested at-rules',
        input: `
          @layer base {
            @supports (margin-inline-start: 0) {
              @media (min-width: 768px) {
                .complex-nested {
                  margin-inline-start: 20px;
                  padding-block-start: 10px;
                }
              }
            }
          }
        `,
        expected: `
          @layer base {
            @supports (margin-inline-start: 0) {
              @media (min-width: 768px) {
                .complex-nested {
                  padding-top: 10px;
                }
                [dir="ltr"] .complex-nested {
                  margin-left: 20px;
                }
                [dir="rtl"] .complex-nested {
                  margin-right: 20px;
                }
              }
            }
          }
        `
      }
    ];

    test.each(containerTests)('$name', runTestCase);
  });
});
