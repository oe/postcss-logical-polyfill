import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import plugin from '../src';
import { rulesAreIdentical } from '../src/logical-properties';

describe('Repeated declaration priority', () => {
  it.each([
    ['10px; margin-inline-start: 20px', '20px', false],
    ['10px !important; margin-inline-start: 20px', '10px', true],
    ['10px; margin-inline-start: 20px !important', '20px', true],
    ['10px !important; margin-inline-start: 20px !important', '20px', true],
  ] as const)('resolves %s without duplicate properties', async (value, expected, important) => {
    const result = await postcss([plugin()]).process(`.box{margin-inline-start:${value}}`, { from: undefined });
    const rules = result.root.nodes.filter(node => node.type === 'rule');
    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      const declarations = rule.nodes.filter(node => node.type === 'decl');
      expect(declarations.map(d => [d.prop, d.value, Boolean(d.important)])).toEqual([
        [rule.selector.includes('ltr') ? 'margin-left' : 'margin-right', expected, important]
      ]);
    }
  });

  it('uses importance when comparing and splitting common properties', async () => {
    const first = postcss.parse('.x{margin-left:10px!important;margin-left:20px}').first as postcss.Rule;
    const second = postcss.parse('.x{margin-left:10px!important}').first as postcss.Rule;
    expect(rulesAreIdentical(first, second)).toBe(true);
    const result = await postcss([plugin()]).process('.x{color:red!important;color:blue;margin-inline-start:10px}', { from: undefined });
    const common = result.root.first as postcss.Rule;
    expect(common.selector).toBe('.x');
    expect(common.nodes.filter(node => node.type === 'decl').map(d => [d.prop, d.value, d.important])).toEqual([['color', 'red', true]]);
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
