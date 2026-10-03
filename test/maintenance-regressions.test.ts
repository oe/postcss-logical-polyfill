import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import plugin from '../src';
import { rulesAreIdentical } from '../src/logical-properties';

describe('CSS declaration preservation', () => {
  it.each(['ltr-first', 'rtl-first'] as const)('preserves fallbacks and importance (%s)', async outputOrder => {
    const result = await postcss([plugin({ outputOrder })]).process(
      '.box { margin-inline-start: 10px !important; margin-inline-start: var(--gap); color: red; color: var(--color) }',
      { from: undefined }
    );
    const allRules = result.root.nodes.filter(node => node.type === 'rule');
    expect(allRules[0].selector).toBe('.box');
    expect(allRules[0].nodes.filter(node => node.type === 'decl').map(d => d.value)).toEqual(['red', 'var(--color)']);
    const rules = allRules.slice(1);
    expect(rules).toHaveLength(2);
    expect(rules[0].selector).toContain(outputOrder === 'ltr-first' ? 'ltr' : 'rtl');
    for (const rule of rules) {
      const side = rule.selector.includes('ltr') ? 'left' : 'right';
      expect(rule.nodes.filter(node => node.type === 'decl').map(d => [d.prop, d.value, Boolean(d.important)])).toEqual([
        [`margin-${side}`, '10px', true], [`margin-${side}`, 'var(--gap)', false],
        ['color', 'red', false], ['color', 'var(--color)', false]
      ]);
    }
  });

  it('compares declaration order and repeated values', () => {
    const rule = (css: string) => postcss.parse(css).first as postcss.Rule;
    expect(rulesAreIdentical(rule('.x{color:red;color:blue}'), rule('.x{color:green;color:blue}'))).toBe(false);
    expect(rulesAreIdentical(rule('.x{margin:0;margin-left:1px}'), rule('.x{margin-left:1px;margin:0}'))).toBe(false);
  });
});

describe('scroll shorthand function values', () => {
  for (const family of ['scroll-margin', 'scroll-padding']) {
    for (const axis of ['inline', 'block']) {
      it('repeats a single function value on both sides', async () => {
        const value = 'calc(1px + var(--gap, 2px))';
        const result = await postcss([plugin()]).process(`.box{${family}-${axis}:${value}}`, { from: undefined });
        const declarations: string[] = [];
        result.root.walkDecls(decl => { declarations.push(decl.value); });
        expect(declarations).toEqual([value, value]);
      });
      it.each(['calc(1px + 2px)', 'var(--gap, 1px)', 'clamp(1px, calc(2px + 3px), 10px)'])(`${family}-${axis} preserves %s`, async value => {
        const result = await postcss([plugin()]).process(`.box{${family}-${axis}:${value} 20px !important}`, { from: undefined });
        result.root.walkRules(rule => {
          const sides = axis === 'block' ? ['top', 'bottom'] : rule.selector.includes('rtl') ? ['right', 'left'] : ['left', 'right'];
          expect(rule.nodes.filter(node => node.type === 'decl').map(d => [d.prop, d.value, d.important])).toEqual([
            [`${family}-${sides[0]}`, value, true], [`${family}-${sides[1]}`, '20px', true]
          ]);
        });
        expect(result.root.nodes.length).toBe(axis === 'block' ? 1 : 2);
      });
    }
  }
});
