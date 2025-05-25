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
});
