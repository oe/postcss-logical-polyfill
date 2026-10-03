import { describe, expect, it } from 'vitest';
import postcss, { AtRule, Rule, Declaration } from 'postcss';
import plugin from '../src';
const frames = '@keyframes slide{from{margin-inline-start:0}to{margin-inline-start:100px}}';
const process = (css: string, options = {}) => postcss([plugin({ animations: true, ...options })]).process(css, { from: undefined });
const refs = (root: postcss.Root, prop = 'animation-name') => {
  const found: Array<[string, string]> = [];
  root.walkDecls(prop, decl => { if (decl.parent?.type === 'rule') found.push([(decl.parent as Rule).selector, decl.value]); });
  return found;
};

describe('opt-in logical animations', () => {
  it('keeps the default behavior unchanged', async () => {
    const css = frames + '.x{animation-name:slide}';
    expect((await postcss([plugin()]).process(css, { from: undefined })).css).toBe(css);
  });
  it('uses a separate keyframe name and correct sides for each direction', async () => {
    const result = await process(frames + '.x{animation-name:slide}');
    expect(refs(result.root)).toEqual([
      ['[dir="ltr"] .x', 'lp-slide-ltr'], ['[dir="rtl"] .x', 'lp-slide-rtl']
    ]);
    const definitions = result.root.nodes.filter(node => node.type === 'atrule') as AtRule[];
    expect(definitions.map(def => def.params)).toEqual(['slide', 'lp-slide-ltr', 'lp-slide-rtl']);
    expect(((definitions[1].first as Rule).first as Declaration).prop).toBe('margin-left');
    expect(((definitions[2].first as Rule).first as Declaration).prop).toBe('margin-right');
  });
  it.each(['slide -200ms 1s linear', 'slide -1s 2s', 'slide 1e3ms linear', 'slide +1s +2', 'slide -0s both', 'slide 1s linear', '1s ease-in 200ms 2 alternate both paused slide', 'slide 1s steps(2, end)'])('rewrites shorthand %s', async value => {
    const result = await process(frames + `.x{animation:${value}}`);
    expect(refs(result.root, 'animation').map(([, value]) => value)).toEqual([value.replace('slide', 'lp-slide-ltr'), value.replace('slide', 'lp-slide-rtl')]);
  });
  it('preserves ordinary names and multiple animations', async () => {
    const result = await process(frames + '.x{animation:slide 1s linear, other 2s ease;animation-name:slide,other}');
    expect(refs(result.root).map(([, value]) => value)).toEqual(['lp-slide-ltr,other', 'lp-slide-rtl,other']);
    expect(refs(result.root, 'animation').map(([, value]) => value)).toEqual(['lp-slide-ltr 1s linear, other 2s ease', 'lp-slide-rtl 1s linear, other 2s ease']);
  });
  it('handles keyword names according to shorthand grammar', async () => {
    const css = frames.replace(/slide/g, 'linear') + '.a{animation:linear 1s}.b{animation:linear 1s linear}.c{animation:"linear" 1s}';
    const result = await process(css);
    expect(refs(result.root, 'animation')).toContainEqual(['.a', 'linear 1s']);
    expect(refs(result.root, 'animation')).toContainEqual(['[dir="rtl"] .b', 'linear 1s lp-linear-rtl']);
    expect(refs(result.root, 'animation')).toContainEqual(['[dir="rtl"] .c', '"lp-linear-rtl" 1s']);
  });
  it('resolves quoted and escaped names', async () => {
    const result = await process(String.raw`@keyframes s\6c ide{from{margin-inline-start:0}to{margin-inline-start:10px}}.a{animation:s\6c ide 1s}.b{animation-name:"s\6c ide"}`);
    expect(refs(result.root, 'animation')).toContainEqual(['[dir="rtl"] .a', 'lp-slide-rtl 1s']);
    expect(refs(result.root)).toContainEqual(['[dir="rtl"] .b', '"lp-slide-rtl"']);
  });
  it('keeps dynamic names and original keyframes with warnings', async () => {
    const css = frames + '.a{animation:var(--animation)}.b{animation-name:var(--name)}';
    const result = await process(css);
    expect(result.css).toBe(css);
    expect(result.warnings()).toHaveLength(2);
  });
  it('avoids collisions with existing or externally referenced animation names', async () => {
    const result = await process(frames + '@keyframes lp-slide-ltr{from{opacity:0}to{opacity:1}}.a{animation-name:slide}.b{animation-name:lp-slide-rtl}');
    expect(refs(result.root)).toContainEqual(['[dir="ltr"] .a', 'lp-slide-ltr-2']);
    expect(refs(result.root)).toContainEqual(['[dir="rtl"] .a', 'lp-slide-rtl-2']);
    expect(refs(result.root)).toContainEqual(['.b', 'lp-slide-rtl']);
  });
  it('is idempotent after serialization, including generated-name collisions', async () => {
    const input = frames + '@keyframes lp-slide-ltr{from{opacity:0}to{opacity:1}}.x{animation:slide 1s}';
    const first = await process(input);
    expect((await process(first.css)).css).toBe(first.css);
  });
  it('clones all same-name definitions in their conditional contexts', async () => {
    const result = await process(frames + '@media(min-width:1px){@keyframes slide{from{margin-left:0}to{margin-left:20px}}}.x{animation-name:slide}');
    const conditional: string[] = [];
    result.root.walkAtRules('keyframes', def => { if (def.parent?.type === 'atrule') conditional.push(def.params); });
    expect(conditional).toEqual(['slide', 'lp-slide-ltr', 'lp-slide-rtl']);
  });
  it('supports prefixed definitions and declarations', async () => {
    const result = await process(frames.replace('@keyframes', '@-webkit-keyframes') + '.x{-webkit-animation:slide 1s}');
    expect(refs(result.root, '-webkit-animation')).toContainEqual(['[dir="rtl"] .x', 'lp-slide-rtl 1s']);
    expect(result.css).toContain('@-webkit-keyframes lp-slide-rtl');
  });
  it('uses existing direction scopes, custom markers and configured order', async () => {
    const result = await process(frames + '.rtl .x{animation-name:slide}.y{animation-name:slide}', { rtl: { selector: '.rtl' }, ltr: { selector: '.ltr' }, outputOrder: 'rtl-first' });
    expect(refs(result.root)).toEqual([['.rtl .x', 'lp-slide-rtl'], ['.rtl .y', 'lp-slide-rtl'], ['.ltr .y', 'lp-slide-ltr']]);
  });
  it('keeps resets and importance when shorthand and name overlap', async () => {
    const result = await process(frames + '.x{animation-name:slide!important;animation:none}');
    for (const direction of ['ltr', 'rtl']) {
      const rule = result.root.nodes.find(node => node.type === 'rule' && node.selector.includes(`[dir="${direction}"]`)) as Rule;
      expect(rule.nodes.filter(node => node.type === 'decl').map(decl => [decl.prop, decl.value, !!decl.important])).toEqual([
        ['animation-name', `lp-slide-${direction}`, true], ['animation', 'none', false]
      ]);
    }
  });
  it('does not scope frame selectors or modify unused logical definitions', async () => {
    expect((await process(frames)).css).toBe(frames);
    const result = await process(frames + '.x{animation-name:slide}');
    result.root.walkAtRules('keyframes', def => { def.walkRules(rule => { expect(rule.selector).not.toContain('dir='); }); });
  });
  it('does not turn invalid numeric names or excess times into valid animations', async () => {
    for (const css of [frames + '.x{animation:slide 1s 2s 3s}', '@keyframes "2"{from{margin-inline-start:0}to{margin-inline-start:1px}}.x{animation:2 1s 2}', '@keyframes 2{from{margin-inline-start:0}to{margin-inline-start:1px}}.x{animation-name:"2"}']) {
      expect((await process(css)).css).toBe(css);
    }
  });
  it('keeps unexpanded nesting intact', async () => {
    const css = frames + '.x{animation-name:slide;& .child{color:red}}';
    const result = await process(css);
    expect(result.css).toBe(css);
    expect(result.warnings()).toHaveLength(1);
  });
});
