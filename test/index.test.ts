import { describe, test } from 'vitest';
import { runTestCase } from './test-utils';

describe('postcss-logical-scope', () => {
  // Array of test cases
  const testCases = [
    {
      name: 'Basic transformation: :dir(rtl) selector',
      input: `
.button {
  padding-inline-start: 1rem;
}

:dir(rtl) .button {
  margin-inline-end: 2rem;
}`,
      expected: `
.button {
  padding-left: 1rem;
}

[dir="rtl"] .button {
  margin-left: 2rem;
}`
    },
    
    {
      name: 'Basic transformation: [dir="rtl"] selector',
      input: `
.button {
  padding-inline-start: 1rem;
}

[dir="rtl"] .button {
  margin-inline-end: 2rem;
}`,
      expected: `
.button {
  padding-left: 1rem;
}

[dir="rtl"] .button {
  margin-left: 2rem;
}`
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
}`,
      expected: {
        contains: [
          // LTR rules
          'margin-left: 1rem',
          'margin-right: 2rem',
          'padding-left: 1rem',
          'padding-right: 2rem',
          'left: 0',
          
          // RTL rules
          '[dir="rtl"] .container',
          '[dir="rtl"] .sidebar',
          'border-right: 1px solid',
          'border-left: 1px solid',
          'border-right: 2px solid'
        ]
      }
    },
    
    {
      name: 'Custom RTL selector',
      input: `
.element {
  padding-inline-end: 1rem;
}

:dir(rtl) .element {
  margin-inline-start: 2rem;
}`,
      expected: `
.element {
  padding-right: 1rem;
}

.rtl .element {
  margin-right: 2rem;
}`,
      options: {
        rtl: { selector: '.rtl' }
      }
    },
    
    {
      name: 'Using both LTR and RTL selectors',
      input: `
.box {
  margin-inline: 1rem 2rem;
}

:dir(rtl) .box {
  margin-inline: 2rem 1rem;
}`,
      expected: {
        contains: [
          'html[dir="ltr"] .box',
          'margin-left: 1rem',
          'margin-right: 2rem',
          'html[dir="rtl"] .box',
          'margin-right: 2rem',
          'margin-left: 1rem'
        ]
      },
      options: {
        ltr: { selector: 'html[dir="ltr"]' },
        rtl: { selector: 'html[dir="rtl"]' }
      }
    },
    
    {
      name: 'Handling multiple nested selectors',
      input: `
.header nav ul li {
  border-inline-end: 1px solid;
}

:dir(rtl) .header .menu {
  margin-inline-start: auto;
}

.footer {
  padding-inline: 1rem 2rem;
}`,
      expected: {
        contains: [
          'border-right: 1px solid',
          '[dir="rtl"] .header .menu',
          'margin-right: auto',
          'padding-left: 1rem',
          'padding-right: 2rem'
        ]
      }
    },

    {
      name: 'Empty RTL rules should be handled gracefully',
      input: `
.button {
  padding-inline-start: 1rem;
}

/* No RTL specific styles */`,
      expected: `
.button {
  padding-left: 1rem;
}`
    },

    {
      name: 'Multiple RTL selectors in one rule',
      input: `
.button {
  padding-inline-start: 1rem;
}

:dir(rtl) .button, [dir="rtl"] .button {
  margin-inline-end: 2rem;
}`,
      expected: {
        contains: [
          'padding-left: 1rem',
          '[dir="rtl"] .button',
          'margin-left: 2rem'
        ],
        notContains: [
          // These shouldn't appear in output
          ':dir(rtl)',
          '[dir="rtl"] [dir="rtl"]'
        ]
      }
    },
    
    {
      name: 'Complex media queries',
      input: `
@media (min-width: 768px) {
  .container {
    margin-inline: 2rem;
  }
  
  :dir(rtl) .container {
    padding-inline-end: 1rem;
  }
}`,
      expected: {
        contains: [
          '@media (min-width: 768px)',
          'margin-left: 2rem',
          'margin-right: 2rem',
          '[dir="rtl"] .container',
          'padding-left: 1rem'
        ]
      }
    },
    
    {
      name: 'Logical block properties',
      input: `
.element {
  margin-block: 1rem 2rem;
  padding-block-start: 1rem;
  padding-block-end: 2rem;
}

:dir(rtl) .element {
  border-block-start: 1px solid;
}`,
      expected: {
        contains: [
          'margin-top: 1rem',
          'margin-bottom: 2rem',
          'padding-top: 1rem',
          'padding-bottom: 2rem',
          '[dir="rtl"] .element',
          'border-top: 1px solid'
        ]
      }
    },
    
    {
      name: 'Pseudo-elements with logical properties',
      input: `
.element::before {
  content: "";
  inset-inline-end: 0;
}

:dir(rtl) .element::after {
  content: "";
  inset-inline-start: 0;
}`,
      expected: {
        contains: [
          '.element::before',
          'content: ""',
          'right: 0',
          '[dir="rtl"] .element::after',
          'right: 0'
        ]
      }
    }
  ];

  // Generate a test for each test case
  testCases.forEach(testCase => {
    test(testCase.name, async () => {
      await runTestCase(testCase);
    });
  });
});
