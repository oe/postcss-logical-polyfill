import { describe, expect, it } from 'vitest';
import postcss, { Rule } from 'postcss';
import plugin from '../src';
const process = (css: string) => postcss([plugin()]).process(css, { from: undefined });
const values = (rule: Rule) => Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(decl => [decl.prop, decl.value]));

describe('transition-property', () => {
  it('maps both directions and retains unrelated property names', async () => {
    const result = await process('.x{transition-property:margin-inline-start,opacity,--Custom}');
    expect((result.root.nodes as Rule[]).map(values)).toEqual([
      { 'transition-property': 'margin-left, opacity, --Custom' },
      { 'transition-property': 'margin-right, opacity, --Custom' }
    ]);
  });
  it('maps additional shim properties as well as upstream properties', async () => {
    const result = await process('.x{transition-property:scroll-margin-inline-start,overflow-inline,contain-intrinsic-inline-size}');
    expect((result.root.nodes as Rule[]).map(values)).toEqual([
      { 'transition-property': 'scroll-margin-left, overflow-x, contain-intrinsic-width' },
      { 'transition-property': 'scroll-margin-right, overflow-x, contain-intrinsic-width' }
    ]);
  });
  it('keeps property expansion aligned with independent timing lists', async () => {
    const result = await process('.x{transition-property:margin-inline,opacity;transition-duration:1s,2s;transition-delay:100ms,200ms;transition-timing-function:steps(2, end),linear;transition-behavior:normal,allow-discrete}');
    for (const rule of (result.root.nodes as Rule[]).filter(r => r.selector.includes('dir='))) {
      expect({ ...values(result.root.first as Rule), ...values(rule) }).toMatchObject({
        'transition-duration': '1s, 1s, 2s', 'transition-delay': '100ms, 100ms, 200ms',
        'transition-timing-function': 'steps(2, end), steps(2, end), linear',
        'transition-behavior': 'normal, normal, allow-discrete'
      });
    }
  });
  it('uses the effective companion values from an earlier shorthand', async () => {
    const result = await process('.x{transition:opacity 1s ease 100ms, color 2s linear 200ms;transition-property:margin-inline,opacity}');
    for (const rule of (result.root.nodes as Rule[]).filter(r => r.selector.includes('dir='))) {
      expect(values(rule)['transition-duration']).toBe('1s, 1s, 2s');
      expect(values(rule)['transition-delay']).toBe('100ms, 100ms, 200ms');
    }
  });
  it('aligns scientific-notation times from a shorthand', async () => {
    const result = await process('.x{transition:opacity 1e3ms, color 2e3ms;transition-property:margin-inline,opacity}');
    for (const rule of (result.root.nodes as Rule[]).filter(r => r.selector.includes('dir='))) {
      expect(values(rule)['transition-duration']).toBe('1e3ms, 1e3ms, 2e3ms');
    }
  });
  it('preserves important companion declarations', async () => {
    const result = await process('.x{transition-duration:1s,2s!important;transition:color 3s;transition-property:margin-inline,opacity}');
    const rules = (result.root.nodes as Rule[]).filter(r => r.selector.includes('dir='));
    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      const decl = rule.nodes.find(n => n.type === 'decl' && n.prop === 'transition-duration');
      expect(decl?.type === 'decl' && decl.important).toBe(true);
      expect(values(rule)['transition-duration']).toBe('1s, 1s, 2s');
    }
  });
  it('retains a later shorthand reset', async () => {
    const result = await process('.x{transition-property:margin-inline-start;transition:none}');
    expect(result.root.nodes).toHaveLength(1);
    expect(values(result.root.first as Rule).transition).toBe('none');
  });
  it('keeps dynamic lists intact and warns once when alignment is unknown', async () => {
    const result = await process('.x{transition-property:margin-inline,opacity;transition-duration:var(--durations)}');
    expect(values(result.root.first as Rule)['transition-property']).toBe('margin-inline,opacity');
    expect(result.warnings()).toHaveLength(1);
  });
  it('maps one-to-one properties without interpreting dynamic timing values', async () => {
    const result = await process('.x{transition-property:margin-inline-start,opacity;transition-duration:var(--durations)}');
    expect((result.root.nodes as Rule[]).some(r => values(r)['transition-property'] === 'margin-left, opacity')).toBe(true);
    expect(result.warnings()).toHaveLength(0);
  });
  it('does not modify ordinary or dynamic property lists', async () => {
    for (const css of ['.x{transition-property:opacity,color}', '.x{transition-property:var(--properties)}']) expect((await process(css)).css).toBe(css);
  });
});
