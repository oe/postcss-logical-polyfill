import postcss from 'postcss';
import plugin from '../src';
import { describe, test, expect } from 'vitest';

describe('Known Limitations - Handling Tests', () => {
  describe('Scroll Properties Limitations', () => {
    test('Should preserve scroll logical properties (currently unsupported)', async () => {
      const input = `
        .element {
          /* These scroll properties are currently unsupported and should be preserved */
          scroll-margin-inline: 10px;
          scroll-margin-inline-start: 15px;
          scroll-margin-inline-end: 20px;
          scroll-margin-block: 5px;
          scroll-margin-block-start: 7px;
          scroll-margin-block-end: 9px;
          
          /* These properties should be transformed normally */
          margin-inline: 1rem;
          padding-block: 1rem;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Scroll properties should remain unchanged
      expect(result.css).toContain('scroll-margin-inline: 10px');
      expect(result.css).toContain('scroll-margin-inline-start: 15px');
      expect(result.css).toContain('scroll-margin-inline-end: 20px');
      expect(result.css).toContain('scroll-margin-block: 5px');
      expect(result.css).toContain('scroll-margin-block-start: 7px');
      expect(result.css).toContain('scroll-margin-block-end: 9px');
      
      // Regular logical properties should be transformed
      expect(result.css).toContain('margin-left: 1rem');
      expect(result.css).toContain('margin-right: 1rem');
      expect(result.css).toContain('padding-top: 1rem');
      expect(result.css).toContain('padding-bottom: 1rem');
    });
    
    test('Should preserve scroll padding logical properties (currently unsupported)', async () => {
      const input = `
        .container {
          scroll-padding-inline: 20px;
          scroll-padding-inline-start: 25px;
          scroll-padding-inline-end: 30px;
          scroll-padding-block: 15px;
          scroll-padding-block-start: 17px;
          scroll-padding-block-end: 19px;
          
          /* Regular properties for comparison */
          padding-inline: 2rem;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Scroll padding properties should remain unchanged
      expect(result.css).toContain('scroll-padding-inline: 20px');
      expect(result.css).toContain('scroll-padding-inline-start: 25px');
      expect(result.css).toContain('scroll-padding-inline-end: 30px');
      expect(result.css).toContain('scroll-padding-block: 15px');
      expect(result.css).toContain('scroll-padding-block-start: 17px');
      expect(result.css).toContain('scroll-padding-block-end: 19px');
      
      // Regular padding should be transformed
      expect(result.css).toContain('padding-left: 2rem');
      expect(result.css).toContain('padding-right: 2rem');
    });
    
    test('Should handle mixture of supported and unsupported properties with direction selectors', async () => {
      const input = `
        [dir="ltr"] .element {
          scroll-margin-inline: 10px; /* Unsupported - should be preserved */
          margin-inline: 1rem; /* Supported - should be transformed */
        }
        
        [dir="rtl"] .element {
          scroll-padding-inline: 15px; /* Unsupported - should be preserved */
          padding-inline: 2rem; /* Supported - should be transformed */
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // LTR rule - unsupported property preserved, supported property transformed
      expect(result.css).toContain('[dir="ltr"] .element');
      expect(result.css).toContain('scroll-margin-inline: 10px');
      expect(result.css).toContain('margin-left: 1rem');
      expect(result.css).toContain('margin-right: 1rem');
      
      // RTL rule - unsupported property preserved, supported property transformed
      expect(result.css).toContain('[dir="rtl"] .element');
      expect(result.css).toContain('scroll-padding-inline: 15px');
      expect(result.css).toContain('padding-left: 2rem');
      expect(result.css).toContain('padding-right: 2rem');
    });
  });
  
  describe('Logical Values Limitations', () => {
    test('Should preserve unsupported logical values for float and clear', async () => {
      const input = `
        .element {
          /* These logical values are not supported and should be preserved */
          float: inline-start;
          clear: inline-end;
          
          /* This logical value is supported and should be transformed */
          text-align: start;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Unsupported logical values should remain unchanged
      expect(result.css).toContain('float: inline-start');
      expect(result.css).toContain('clear: inline-end');
      
      // Supported logical values should be transformed
      expect(result.css).toContain('[dir="ltr"]');
      expect(result.css).toContain('text-align: left');
      expect(result.css).toContain('[dir="rtl"]');
      expect(result.css).toContain('text-align: right');
    });
    
    test('Should preserve resize logical values (currently unsupported)', async () => {
      const input = `
        .element {
          /* Resize logical values are not supported and should be preserved */
          resize: block;
          
          /* For comparison with supported properties */
          margin-block: 1rem;
        }
        
        .another {
          resize: inline;
          padding-inline: 2rem;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Resize logical values should remain unchanged
      expect(result.css).toContain('resize: block');
      expect(result.css).toContain('resize: inline');
      
      // Regular logical properties should be transformed
      expect(result.css).toContain('margin-top: 1rem');
      expect(result.css).toContain('margin-bottom: 1rem');
      expect(result.css).toContain('padding-left: 2rem');
      expect(result.css).toContain('padding-right: 2rem');
    });
    
    test('Should handle text-align logical values correctly', async () => {
      const input = `
        .element {
          /* Text-align logical values are supported */
          text-align: start;
        }
        
        .another {
          text-align: end;
        }
        
        /* With existing direction selectors */
        [dir="ltr"] .ltr-element {
          text-align: start;
        }
        
        [dir="rtl"] .rtl-element {
          text-align: end;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Unscoped text-align logical values should be transformed with direction selectors
      expect(result.css).toContain('[dir="ltr"] .element');
      expect(result.css).toContain('text-align: left');
      expect(result.css).toContain('[dir="rtl"] .element');
      expect(result.css).toContain('text-align: right');
      
      expect(result.css).toContain('[dir="ltr"] .another');
      expect(result.css).toContain('text-align: right');
      expect(result.css).toContain('[dir="rtl"] .another');
      expect(result.css).toContain('text-align: left');
      
      // Scoped text-align logical values should be transformed according to the scope
      expect(result.css).toContain('[dir="ltr"] .ltr-element');
      expect(result.css).toContain('text-align: left');
      
      expect(result.css).toContain('[dir="rtl"] .rtl-element');
      expect(result.css).toContain('text-align: left');
    });
  });
  
  describe('CSS Variables with Logical Property Names', () => {
    test('Should preserve CSS custom properties with logical-sounding names', async () => {
      const input = `
        :root {
          --margin-inline: 1rem;
          --padding-block: 1rem;
          --border-inline-width: 1px;
          --inset-block-start: 0;
        }
        
        .element {
          /* These should NOT be transformed as they are variable declarations */
          --my-margin-inline: 2rem;
          --my-padding-block: 2rem;
          
          /* Usage of custom properties */
          margin-inline: var(--margin-inline);
          padding-block: var(--padding-block);
          
          /* Regular logical properties */
          border-inline: 1px solid;
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Custom properties should be preserved
      expect(result.css).toContain('--margin-inline: 1rem');
      expect(result.css).toContain('--padding-block: 1rem');
      expect(result.css).toContain('--border-inline-width: 1px');
      expect(result.css).toContain('--inset-block-start: 0');
      expect(result.css).toContain('--my-margin-inline: 2rem');
      expect(result.css).toContain('--my-padding-block: 2rem');
      
      // Usage of variables should be transformed
      expect(result.css).toContain('margin-left: var(--margin-inline)');
      expect(result.css).toContain('margin-right: var(--margin-inline)');
      expect(result.css).toContain('padding-top: var(--padding-block)');
      expect(result.css).toContain('padding-bottom: var(--padding-block)');
      
      // Regular logical properties should be transformed
      expect(result.css).toContain('border-left: 1px solid');
      expect(result.css).toContain('border-right: 1px solid');
    });
    
    test('Should handle complex CSS variable usage in logical properties', async () => {
      const input = `
        :root {
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 2rem;
        }
        
        .element {
          margin-inline: calc(var(--space-md) + 10px);
          padding-inline: var(--space-sm) var(--space-lg);
          border-inline-width: clamp(var(--space-sm), 1vw, var(--space-lg));
        }
      `;
      
      const result = await postcss([plugin()]).process(input, { from: undefined });
      
      // Variable declarations should be preserved
      expect(result.css).toContain('--space-sm: 0.5rem');
      expect(result.css).toContain('--space-md: 1rem');
      expect(result.css).toContain('--space-lg: 2rem');
      
      // Complex variable usage should be transformed
      expect(result.css).toContain('margin-left: calc(var(--space-md) + 10px)');
      expect(result.css).toContain('margin-right: calc(var(--space-md) + 10px)');
      expect(result.css).toContain('padding-left: var(--space-sm)');
      expect(result.css).toContain('padding-right: var(--space-lg)');
      expect(result.css).toContain('border-left-width: clamp(var(--space-sm), 1vw, var(--space-lg))');
      expect(result.css).toContain('border-right-width: clamp(var(--space-sm), 1vw, var(--space-lg))');
    });
  });
});
