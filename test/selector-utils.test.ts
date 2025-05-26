import { describe, test, expect } from 'vitest';
import { detectDirection, generateSelector, DirectionConfig } from '../src/selector-utils';

describe('Selector Utils', () => {
  describe('detectDirection', () => {
    describe('Built-in direction selectors', () => {
      test('should detect :dir() pseudo-class selectors', () => {
        expect(detectDirection(':dir(ltr) .button')).toBe('ltr');
        expect(detectDirection(':dir(rtl) .button')).toBe('rtl');
        expect(detectDirection('.parent :dir(ltr) .child')).toBe('ltr');
        expect(detectDirection('.parent :dir(rtl) .child')).toBe('rtl');
      });

      test('should detect [dir] attribute selectors', () => {
        expect(detectDirection('[dir="ltr"] .button')).toBe('ltr');
        expect(detectDirection('[dir="rtl"] .button')).toBe('rtl');
        expect(detectDirection('[dir=ltr] .button')).toBe('ltr');
        expect(detectDirection('[dir=rtl] .button')).toBe('rtl');
        expect(detectDirection(`[dir='ltr'] .button`)).toBe('ltr');
        expect(detectDirection(`[dir='rtl'] .button`)).toBe('rtl');
      });

      test('should handle whitespace in built-in selectors', () => {
        expect(detectDirection(':dir( ltr ) .button')).toBe('ltr');
        expect(detectDirection(':dir( rtl ) .button')).toBe('rtl');
        expect(detectDirection('[ dir = "ltr" ] .button')).toBe('ltr');
        expect(detectDirection('[ dir = "rtl" ] .button')).toBe('rtl');
      });

      test('should return "none" for selectors without direction', () => {
        expect(detectDirection('.button')).toBe('none');
        expect(detectDirection('#header .nav')).toBe('none');
        expect(detectDirection('div > p')).toBe('none');
        expect(detectDirection('.class1.class2')).toBe('none');
      });
    });

    describe('Custom direction selectors', () => {
      const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };

      test('should detect custom class selectors', () => {
        expect(detectDirection('.ltr .button', config)).toBe('ltr');
        expect(detectDirection('.rtl .button', config)).toBe('rtl');
        expect(detectDirection('.container .ltr .item', config)).toBe('ltr');
        expect(detectDirection('.container .rtl .item', config)).toBe('rtl');
      });

      test('should detect chained custom selectors', () => {
        expect(detectDirection('.theme.ltr .button', config)).toBe('ltr');
        expect(detectDirection('.theme.rtl .button', config)).toBe('rtl');
        expect(detectDirection('.a.b.ltr.c .button', config)).toBe('ltr');
      });

      test('should not match partial class names', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(detectDirection('.theme-ltr .button', config)).toBe('none');
        expect(detectDirection('.rtl-theme .button', config)).toBe('none');
        expect(detectDirection('.my-ltr-class .button', config)).toBe('none');
      });

      test('should handle custom attribute selectors', () => {
        const config: DirectionConfig = { 
          ltr: '[data-dir="ltr"]', 
          rtl: '[data-dir="rtl"]' 
        };
        expect(detectDirection('[data-dir="ltr"] .button', config)).toBe('ltr');
        expect(detectDirection('[data-dir="rtl"] .button', config)).toBe('rtl');
      });

      test('should handle custom pseudo-class selectors', () => {
        const config: DirectionConfig = { 
          ltr: ':lang(en)', 
          rtl: ':lang(ar)' 
        };
        expect(detectDirection(':lang(en) .button', config)).toBe('ltr');
        expect(detectDirection(':lang(ar) .button', config)).toBe('rtl');
      });
    });

    describe('Priority and specificity', () => {
      test('should prioritize rightmost direction selector', () => {
        expect(detectDirection(':dir(ltr) .container :dir(rtl) .button')).toBe('rtl');
        expect(detectDirection(':dir(rtl) .container :dir(ltr) .button')).toBe('ltr');
        expect(detectDirection('[dir="ltr"] .container [dir="rtl"] .button')).toBe('rtl');
      });

      test('should handle mixed built-in and custom selectors with rightmost priority', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(detectDirection(':dir(rtl) .container .ltr .button', config)).toBe('ltr');
        expect(detectDirection('.rtl .container :dir(ltr) .button', config)).toBe('ltr');
        expect(detectDirection(':dir(ltr) .rtl .button', config)).toBe('rtl');
      });

      test('should handle multiple instances of same direction', () => {
        expect(detectDirection(':dir(ltr) .container :dir(ltr) .button')).toBe('ltr');
        expect(detectDirection('[dir="rtl"] .container [dir="rtl"] .button')).toBe('rtl');
        
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(detectDirection('.ltr .container .ltr .button', config)).toBe('ltr');
      });
    });

    describe('Complex selector scenarios', () => {
      test('should handle selectors with pseudo-classes and pseudo-elements', () => {
        expect(detectDirection(':dir(ltr) .button:hover')).toBe('ltr');
        expect(detectDirection(':dir(rtl) .button::before')).toBe('rtl');
        expect(detectDirection('.button:dir(ltr):focus')).toBe('ltr');
      });

      test('should handle multi-selector rules', () => {
        // Note: detectDirection works on individual selectors, not comma-separated lists
        expect(detectDirection(':dir(ltr) .button')).toBe('ltr');
        expect(detectDirection(':dir(rtl) .link')).toBe('rtl');
      });

      test('should handle complex descendant and sibling selectors', () => {
        expect(detectDirection(':dir(ltr) .parent > .child')).toBe('ltr');
        expect(detectDirection(':dir(rtl) .sibling + .next')).toBe('rtl');
        expect(detectDirection('[dir="ltr"] .parent ~ .sibling')).toBe('ltr');
      });
    });

    describe('Edge cases', () => {
      test('should handle empty or invalid selectors', () => {
        expect(detectDirection('')).toBe('none');
        expect(detectDirection('   ')).toBe('none');
        expect(detectDirection('.', { ltr: '.ltr' })).toBe('none');
      });

      test('should handle malformed direction selectors', () => {
        expect(detectDirection(':dir()')).toBe('none');
        expect(detectDirection(':dir(invalid)')).toBe('none');
        expect(detectDirection('[dir]')).toBe('none');
        expect(detectDirection('[dir=""]')).toBe('none');
      });

      test('should be case sensitive', () => {
        expect(detectDirection(':dir(LTR)')).toBe('none');
        expect(detectDirection(':dir(RTL)')).toBe('none');
        expect(detectDirection('[dir="LTR"]')).toBe('none');
        
        const config: DirectionConfig = { ltr: '.LTR', rtl: '.RTL' };
        expect(detectDirection('.ltr .button', config)).toBe('none');
        expect(detectDirection('.LTR .button', config)).toBe('ltr');
      });
    });
  });

  describe('generateSelector', () => {
    describe('Basic functionality', () => {
      test('should add default direction selectors to neutral selectors', () => {
        expect(generateSelector('.button', 'ltr')).toBe('[dir="ltr"] .button');
        expect(generateSelector('.button', 'rtl')).toBe('[dir="rtl"] .button');
        expect(generateSelector('#header .nav', 'ltr')).toBe('[dir="ltr"] #header .nav');
      });

      test('should use custom direction selectors when provided', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('.button', 'ltr', config)).toBe('.ltr .button');
        expect(generateSelector('.button', 'rtl', config)).toBe('.rtl .button');
      });

      test('should return selector unchanged if it already has target direction', () => {
        expect(generateSelector(':dir(ltr) .button', 'ltr')).toBe(':dir(ltr) .button');
        expect(generateSelector('[dir="rtl"] .button', 'rtl')).toBe('[dir="rtl"] .button');
        
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('.ltr .button', 'ltr', config)).toBe('.ltr .button');
        expect(generateSelector('.rtl .button', 'rtl', config)).toBe('.rtl .button');
      });
    });

    describe('Direction transformation', () => {
      test('should transform between built-in direction selectors', () => {
        expect(generateSelector(':dir(ltr) .button', 'rtl')).toBe('[dir="rtl"] .button');
        expect(generateSelector('[dir="rtl"] .button', 'ltr')).toBe('[dir="ltr"] .button');
        expect(generateSelector(':dir(rtl) .button', 'ltr')).toBe('[dir="ltr"] .button');
      });

      test('should transform between custom direction selectors', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('.ltr .button', 'rtl', config)).toBe('.rtl .button');
        expect(generateSelector('.rtl .button', 'ltr', config)).toBe('.ltr .button');
      });

      test('should transform between built-in and custom selectors', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector(':dir(ltr) .button', 'rtl', config)).toBe('.rtl .button');
        expect(generateSelector('.rtl .button', 'ltr', config)).toBe('.ltr .button');
        expect(generateSelector('[dir="rtl"] .button', 'ltr', config)).toBe('.ltr .button');
      });

      test('should clean multiple direction selectors', () => {
        
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('.ltr :dir(rtl) .button', 'rtl', config)).toBe(
          '.ltr :dir(rtl) .button'
        );
      });
    });

    describe('Complex selector handling', () => {
      test('should preserve selector structure while cleaning direction', () => {
        expect(generateSelector(':dir(ltr) .parent > .child', 'rtl'))
          .toBe('[dir="rtl"] .parent > .child');
        expect(generateSelector('[dir="rtl"] .sibling + .next', 'ltr'))
          .toBe('[dir="ltr"] .sibling + .next');
      });

      test('should handle pseudo-classes and pseudo-elements', () => {
        expect(generateSelector(':dir(ltr) .button:hover', 'rtl'))
          .toBe('[dir="rtl"] .button:hover');
        expect(generateSelector('[dir="rtl"] .button::before', 'ltr'))
          .toBe('[dir="ltr"] .button::before');
      });

      test('should handle attribute selectors', () => {
        const config: DirectionConfig = { 
          ltr: '[data-dir="ltr"]', 
          rtl: '[data-dir="rtl"]' 
        };
        expect(generateSelector('[data-dir="ltr"] .button', 'rtl', config))
          .toBe('[data-dir="rtl"] .button');
        expect(generateSelector('[data-dir="rtl"] .input[type="text"]', 'ltr', config))
          .toBe('[data-dir="ltr"] .input[type="text"]');
      });
    });

    describe('Edge cases', () => {
      test('should handle empty selectors', () => {
        expect(generateSelector('', 'ltr')).toBe('[dir="ltr"]');
        expect(generateSelector('   ', 'rtl')).toBe('[dir="rtl"]');
        
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('', 'ltr', config)).toBe('.ltr');
      });

      test('should handle selectors that become empty after cleaning', () => {
        expect(generateSelector(':dir(ltr)', 'rtl')).toBe('[dir="rtl"]');
        expect(generateSelector('[dir="rtl"]', 'ltr')).toBe('[dir="ltr"]');
        
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        expect(generateSelector('.ltr', 'rtl', config)).toBe('.rtl');
        expect(generateSelector('.rtl', 'ltr', config)).toBe('.ltr');
      });

      test('should handle complex custom selectors', () => {
        const config: DirectionConfig = { 
          ltr: '.theme[data-dir="ltr"]', 
          rtl: '.theme[data-dir="rtl"]' 
        };
        expect(generateSelector('.button', 'ltr', config))
          .toBe('.theme[data-dir="ltr"] .button');
        expect(generateSelector('.theme[data-dir="rtl"] .button', 'ltr', config))
          .toBe('.theme[data-dir="ltr"] .button');
      });

      test('should handle mixed direction contexts', () => {
        const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
        // When there are conflicting directions, the rightmost should be considered
        expect(generateSelector(':dir(rtl) .container .ltr .button', 'rtl', config))
          .toBe('.rtl .container .button');
      });
    });

    describe('Configuration edge cases', () => {
      test('should handle missing config gracefully', () => {
        expect(generateSelector('.button', 'ltr', {})).toBe('[dir="ltr"] .button');
        expect(generateSelector('.button', 'rtl', {})).toBe('[dir="rtl"] .button');
      });

      test('should handle partial config', () => {
        const ltrOnlyConfig: DirectionConfig = { ltr: '.ltr' };
        expect(generateSelector('.button', 'ltr', ltrOnlyConfig)).toBe('.ltr .button');
        expect(generateSelector('.button', 'rtl', ltrOnlyConfig)).toBe('[dir="rtl"] .button');
        
        const rtlOnlyConfig: DirectionConfig = { rtl: '.rtl' };
        expect(generateSelector('.button', 'rtl', rtlOnlyConfig)).toBe('.rtl .button');
        expect(generateSelector('.button', 'ltr', rtlOnlyConfig)).toBe('[dir="ltr"] .button');
      });

      test('should handle empty string configs', () => {
        const config: DirectionConfig = { ltr: '', rtl: '' };
        expect(generateSelector('.button', 'ltr', config)).toBe('[dir="ltr"] .button');
        expect(generateSelector('.button', 'rtl', config)).toBe('[dir="rtl"] .button');
      });
    });
  });

  describe('Integration tests', () => {
    test('should maintain consistency between detectDirection and generateSelector', () => {
      const testCases = [
        { selector: '.button', direction: 'ltr' as const },
        { selector: '.button', direction: 'rtl' as const },
        { selector: ':dir(ltr) .button', direction: 'rtl' as const },
        { selector: '[dir="rtl"] .button', direction: 'ltr' as const },
      ];

      testCases.forEach(({ selector, direction }) => {
        const generated = generateSelector(selector, direction);
        const detected = detectDirection(generated);
        expect(detected).toBe(direction);
      });
    });

    test('should work with custom configurations consistently', () => {
      const config: DirectionConfig = { ltr: '.ltr-theme', rtl: '.rtl-theme' };
      
      const testCases = [
        { selector: '.button', direction: 'ltr' as const },
        { selector: '.button', direction: 'rtl' as const },
        { selector: '.ltr-theme .button', direction: 'rtl' as const },
        { selector: '.rtl-theme .button', direction: 'ltr' as const },
      ];

      testCases.forEach(({ selector, direction }) => {
        const generated = generateSelector(selector, direction, config);
        const detected = detectDirection(generated, config);
        expect(detected).toBe(direction);
      });
    });

    test('should handle round-trip transformations', () => {
      const config: DirectionConfig = { ltr: '.ltr', rtl: '.rtl' };
      
      const originalSelector = '.button';
      const ltrSelector = generateSelector(originalSelector, 'ltr', config);
      const rtlSelector = generateSelector(ltrSelector, 'rtl', config);
      const backToLtr = generateSelector(rtlSelector, 'ltr', config);
      
      expect(ltrSelector).toBe('.ltr .button');
      expect(rtlSelector).toBe('.rtl .button');
      expect(backToLtr).toBe('.ltr .button');
      
      // Verify directions are detected correctly at each step
      expect(detectDirection(ltrSelector, config)).toBe('ltr');
      expect(detectDirection(rtlSelector, config)).toBe('rtl');
      expect(detectDirection(backToLtr, config)).toBe('ltr');
    });
  });
});
