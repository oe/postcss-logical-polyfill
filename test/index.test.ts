import { describe, test } from 'vitest';
import { runTestCase } from './test-utils';

describe('postcss-logical-scope', () => {
  // Array of test cases
  const testCases = [
    {
      name: 'Basic logical properties transformation',
      input: `
.button {
  padding-inline-start: 1rem;
  margin-inline: 1rem 2rem;
}`,
      expected: {
        contains: [
          // LTR transformations
          '[dir="ltr"] .button',
          'padding-left: 1rem',
          'margin-left: 1rem',
          'margin-right: 2rem',
          
          // RTL transformations
          '[dir="rtl"] .button',
          'padding-right: 1rem',
          'margin-right: 1rem',
          'margin-left: 2rem'
        ]
      }
    },
    
    {
      name: 'Direction-specific selectors: :dir(rtl)',
      input: `
.button {
  padding-inline-start: 1rem;
}

:dir(rtl) .button {
  margin-inline-end: 2rem;
}`,
      expected: {
        contains: [
          // Default LTR transformation
          '[dir="ltr"] .button',
          'padding-left: 1rem',
          
          // RTL specific rule
          '[dir="rtl"] .button',
          'padding-right: 1rem',
          'margin-left: 2rem'
        ],
        notContains: [
          // Shouldn't appear in output
          ':dir(rtl)'
        ]
      }
    },
    
    {
      name: 'Direction-specific selectors: [dir="rtl"]',
      input: `
.button {
  padding-inline-start: 1rem;
}

[dir="rtl"] .button {
  margin-inline-end: 2rem;
}`,
      expected: {
        contains: [
          // Default LTR transformation
          '[dir="ltr"] .button',
          'padding-left: 1rem',
          
          // RTL specific rule
          '[dir="rtl"] .button',
          'padding-right: 1rem',
          'margin-left: 2rem'
        ],
        notContains: [
          // Shouldn't duplicate dir selectors
          '[dir="rtl"] [dir="rtl"]'
        ]
      }
    },
    
    {
      name: 'Direction-specific selectors: :dir(ltr)',
      input: `
.button {
  padding-inline-start: 1rem;
}

:dir(ltr) .button {
  margin-inline-end: 2rem;
}`,
      expected: {
        contains: [
          // LTR specific rule
          '[dir="ltr"] .button',
          'padding-left: 1rem',
          'margin-right: 2rem',
          
          // Default RTL transformation
          '[dir="rtl"] .button',
          'padding-right: 1rem'
        ],
        notContains: [
          // Shouldn't appear in output
          ':dir(ltr)'
        ]
      }
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
          '[dir="ltr"] .container',
          'margin-left: 1rem',
          'margin-right: 2rem',
          'padding-left: 1rem',
          'padding-right: 2rem',
          '[dir="ltr"] .sidebar',
          'left: 0',
          
          // RTL rules
          '[dir="rtl"] .container',
          'margin-right: 2rem',
          'margin-left: 1rem',
          'border-right: 1px solid',
          'border-left: 1px solid',
          '[dir="rtl"] .sidebar',
          'right: 0',
          'border-right: 2px solid'
        ]
      }
    },
    
    {
      name: 'Custom direction selectors',
      input: `
.element {
  padding-inline-end: 1rem;
}

:dir(rtl) .element {
  margin-inline-start: 2rem;
}`,
      expected: {
        contains: [
          // Custom LTR selector
          '.ltr .element',
          'padding-right: 1rem',
          
          // Custom RTL selector
          '.rtl .element',
          'padding-left: 1rem',
          'margin-right: 2rem'
        ]
      },
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
}`,
      expected: {
        contains: [
          // LTR transformations
          '[dir="ltr"] .header nav ul li',
          'border-right: 1px solid',
          '[dir="ltr"] .footer',
          'padding-left: 1rem',
          'padding-right: 2rem',
          
          // RTL transformations
          '[dir="rtl"] .header nav ul li',
          'border-left: 1px solid',
          '[dir="rtl"] .header .menu',
          'margin-right: auto',
          '[dir="rtl"] .footer',
          'padding-right: 1rem',
          'padding-left: 2rem'
        ]
      }
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
}`,
      expected: {
        contains: [
          // LTR media query
          '@media (min-width: 768px) {',
          '[dir="ltr"] .container',
          'margin-left: 2rem',
          'margin-right: 2rem',
          
          // RTL media query
          '[dir="rtl"] .container',
          'margin-right: 2rem',
          'margin-left: 2rem',
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
}`,
      expected: {
        contains: [
          // Block properties are the same in both directions
          '[dir="ltr"] .element',
          'margin-top: 1rem',
          'margin-bottom: 2rem',
          'padding-top: 1rem',
          'padding-bottom: 2rem',
          
          '[dir="rtl"] .element',
          'margin-top: 1rem',
          'margin-bottom: 2rem',
          'padding-top: 1rem',
          'padding-bottom: 2rem'
        ]
      }
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
}`,
      expected: {
        contains: [
          // Regular CSS passes through unchanged
          '.regular',
          'color: blue',
          'font-size: 16px',
          
          // Logical properties get direction selectors
          '[dir="ltr"] .logical',
          '[dir="rtl"] .logical',
          'margin-left: 1rem',
          'margin-right: 1rem'
        ],
        notContains: [
          // No direction selectors for regular CSS
          '[dir="ltr"] .regular',
          '[dir="rtl"] .regular'
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
