/**
 * Test for important flag bug
 * 
 * This test reproduces the issue where when one property declaration has !important,
 * all property declarations in the generated rule also get !important.
 */
import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from '../src/index';

describe('Important Flag Bug', () => {
  test('should not add important to all properties when only some have important', async () => {
    const input = `
      .test {
        margin-inline-start: 10px !important;
        padding-inline-start: 20px;
        color: red;
      }
    `;
    
    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    // The bug: currently all properties get !important
    // Expected behavior: only margin-left/margin-right should have !important
    // padding-left/padding-right and color should NOT have !important
    
    // Check LTR rule
    expect(result.css).toMatch(/margin-left:\s*10px\s*!important/);
    expect(result.css).toMatch(/padding-left:\s*20px(?!\s*!important)/); // Should NOT have !important
    expect(result.css).toMatch(/color:\s*red(?!\s*!important)/); // Should NOT have !important
    
    // Check RTL rule  
    expect(result.css).toMatch(/margin-right:\s*10px\s*!important/);
    expect(result.css).toMatch(/padding-right:\s*20px(?!\s*!important)/); // Should NOT have !important
  });

  test('should handle mixed important flags correctly', async () => {
    const input = `
      .test {
        margin-inline: 10px !important;
        padding-inline: 20px;
        border-inline-start: 1px solid blue !important;
        border-inline-end: 2px solid red;
        color: green;
      }
    `;
    
    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    // margin-left, margin-right should have !important
    expect(result.css).toMatch(/margin-left:\s*10px\s*!important/);
    expect(result.css).toMatch(/margin-right:\s*10px\s*!important/);
    
    // padding-left, padding-right should NOT have !important
    expect(result.css).toMatch(/padding-left:\s*20px(?!\s*!important)/);
    expect(result.css).toMatch(/padding-right:\s*20px(?!\s*!important)/);
    
    // border-left should have !important (from border-inline-start)
    expect(result.css).toMatch(/border-left:\s*1px solid blue\s*!important/);
    
    // border-right should NOT have !important (from border-inline-end)
    expect(result.css).toMatch(/border-right:\s*2px solid red(?!\s*!important)/);
    
    // color should NOT have !important
    expect(result.css).toMatch(/color:\s*green(?!\s*!important)/);
  });

  test('should preserve important flags for block-direction properties', async () => {
    const input = `
      .test {
        margin-block: 10px !important;
        padding-block-start: 5px;
        margin-inline: 15px;
      }
    `;
    
    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    // Block-direction properties should preserve importance
    expect(result.css).toMatch(/margin-top:\s*10px\s*!important/);
    expect(result.css).toMatch(/margin-bottom:\s*10px\s*!important/);
    
    // Non-important properties should not get important
    expect(result.css).toMatch(/padding-top:\s*5px(?!\s*!important)/);
    expect(result.css).toMatch(/margin-left:\s*15px(?!\s*!important)/);
    expect(result.css).toMatch(/margin-right:\s*15px(?!\s*!important)/);
  });

  test('should handle cases where all properties have important', async () => {
    const input = `
      .test {
        margin-inline: 10px !important;
        padding-inline: 20px !important;
        border-inline: 1px solid red !important;
      }
    `;
    
    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    // All generated properties should have !important
    expect(result.css).toMatch(/margin-left:\s*10px\s*!important/);
    expect(result.css).toMatch(/margin-right:\s*10px\s*!important/);
    expect(result.css).toMatch(/padding-left:\s*20px\s*!important/);
    expect(result.css).toMatch(/padding-right:\s*20px\s*!important/);
    expect(result.css).toMatch(/border-left:\s*1px solid red\s*!important/);
    expect(result.css).toMatch(/border-right:\s*1px solid red\s*!important/);
  });

  test('should handle different important formats correctly', async () => {
    const input = `
      .test {
        margin-inline-start: 10px!important;
        margin-inline-end: 15px !IMPORTANT;
        padding-inline: 20px;
      }
    `;
    
    const result = await postcss([plugin()]).process(input, { from: undefined });
    
    // Both important formats should be preserved (though PostCSS may normalize to lowercase)
    expect(result.css).toMatch(/margin-left:\s*10px\s*!important/i);
    expect(result.css).toMatch(/margin-right:\s*15px\s*!important/i);
    
    // Non-important should remain non-important
    expect(result.css).toMatch(/padding-left:\s*20px(?!\s*!important)/i);
    expect(result.css).toMatch(/padding-right:\s*20px(?!\s*!important)/i);
  });
});
