import { describe, expect, it } from 'vitest';
import postcss, { Rule } from 'postcss';
import plugin from '../src';

const process = (css: string) => postcss([plugin()]).process(css, { from: 'input.css' });

describe('postcss-logical v9 integration', () => {
  it('maps a logical transition property in both directions', async () => {
    const result = await process('.x{margin-inline-start:2px;transition:margin-inline-start 1s}');
    const rules = result.root.nodes as Rule[];
    expect(rules.map(rule => rule.selector)).toEqual(['[dir="ltr"] .x', '[dir="rtl"] .x']);
    expect(rules.map(rule => rule.nodes.map(node => node.type === 'decl' ? [node.prop, node.value] : null))).toEqual([
      [['margin-left', '2px'], ['transition', 'margin-left 1s']],
      [['margin-right', '2px'], ['transition', 'margin-right 1s']]
    ]);
    expect(result.warnings()).toHaveLength(0);
  });

  it('expands a logical shorthand in transition', async () => {
    const result = await process('.x{transition:margin-inline 1s}');
    const values: string[] = [];
    result.root.walkDecls('transition', decl => { values.push(decl.value); });
    expect(values).toEqual(['margin-left 1s, margin-right 1s', 'margin-right 1s, margin-left 1s']);
  });

  it('preserves an oversized transition and forwards its upstream warning once', async () => {
    const value = Array.from({ length: 10000 }, () => 'margin-inline 1s').join(',');
    const css = `.x{transition:${value}}`;
    const result = await process(css);
    expect(result.css).toBe(css);
    const warnings = result.warnings();
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toContain('Too many combinations');
    expect(warnings[0].node?.source?.input.file).toMatch(/input\.css$/);
  });
});
