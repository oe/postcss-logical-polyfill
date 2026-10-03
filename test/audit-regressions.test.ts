import postcss, { Rule } from 'postcss';
import { describe, expect, it } from 'vitest';
import { SourceMapConsumer } from 'source-map';
import plugin from '../src';
import { detectDirection, generateSelector } from '../src/selector-utils';

const process = (css: string, options = {}) => postcss([plugin(options)]).process(css, { from: undefined });
const declarations = (rule: Rule) => rule.nodes.filter(node => node.type === 'decl').map(d => [d.prop, d.value, Boolean(d.important)]);

describe('Cascade across common and direction rules', () => {
  it.each(['margin', 'padding', 'scroll-margin', 'scroll-padding'])('preserves a later %s shorthand reset', async family => {
    const result = await process(`.x{${family}-inline-start:10px;${family}:0;color:red}`);
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[0])).toEqual([[family, '0', false], ['color', 'red', false]]);
    expect(declarations(rules[1])).toEqual([[`${family}-left`, '10px', false], [family, '0', false]]);
    expect(declarations(rules[2])).toEqual([[`${family}-right`, '10px', false], [family, '0', false]]);
  });
  it('keeps a later physical border longhand after its logical shorthand', async () => {
    const result = await process('.x{border-inline-start:2px solid red;border-left-color:blue}');
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[1])).toEqual([['border-left', '2px solid red', false], ['border-left-color', 'blue', false]]);
    expect(declarations(rules[2])).toEqual([['border-right', '2px solid red', false]]);
  });
  it('keeps winner positions when an overwritten property crosses a shorthand', async () => {
    const result = await process('.x{margin-left:1px;margin:0;margin-inline-start:10px}');
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[1])).toEqual([['margin', '0', false], ['margin-left', '10px', false]]);
    expect(declarations(rules[2])).toEqual([['margin-left', '1px', false], ['margin', '0', false], ['margin-right', '10px', false]]);
  });
  it('keeps overwritten common winners in order around their shorthand', async () => {
    const result = await process('.x{margin-left:1px;margin:0;margin-left:10px;padding-inline-start:5px}');
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[0])).toEqual([['margin', '0', false], ['margin-left', '10px', false]]);
    expect(declarations(rules[1])).toEqual([['padding-left', '5px', false]]);
    expect(declarations(rules[2])).toEqual([['padding-right', '5px', false]]);
  });
  it('retains transitive shorthand dependencies and importance', async () => {
    const result = await process('.x{margin-inline-start:10px!important;margin:0;margin-top:5px}');
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[1])).toEqual([['margin-left', '10px', true], ['margin', '0', false], ['margin-top', '5px', false]]);
    expect(declarations(rules[2])).toEqual([['margin-right', '10px', true], ['margin', '0', false], ['margin-top', '5px', false]]);
  });
  it('preserves background shorthand/image order', async () => {
    const result = await process('.x{background-image:linear-gradient(to inline-start,red,blue);background:none}');
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[1])).toEqual([['background-image', 'linear-gradient(to left,red,blue)', false], ['background', 'none', false]]);
    expect(declarations(rules[2])).toEqual([['background-image', 'linear-gradient(to right,red,blue)', false], ['background', 'none', false]]);
  });
});

describe('Direction selector syntax', () => {
  const config = { ltr: '.ltr', rtl: '.rtl' };
  it.each(['.x:not([dir="rtl"])', '.x:has([dir="rtl"])', '[data-text="[dir=rtl]"]', '.x:not(.rtl)', '[data-class=".rtl"]', '[foreign|dir="rtl"]'])('does not infer direction from %s', selector => {
    expect(detectDirection(selector, config)).toBe('none');
    expect(generateSelector(selector, 'ltr', config)).toBe(`.ltr ${selector}`);
  });
  it.each(['.ltr .rtl .ltr .x', '.rtl .ltr .rtl .ltr .x'])('uses the last matching custom selector in %s', selector => {
    expect(detectDirection(selector, config)).toBe('ltr');
  });
  it.each(['.x[data-dir="rtl"]', '.x#rtl'])('recognizes chained custom attributes and IDs in %s', selector => {
    expect(detectDirection(selector, { rtl: selector.includes('#') ? '#rtl' : '[data-dir="rtl"]' })).toBe('rtl');
  });
  it.each(['.rtl + .x', '[dir="rtl"] ~ .x', '.rtl + .wrapper .x'])('preserves explicit sibling direction context in %s', selector => {
    expect(detectDirection(selector, config)).toBe('rtl');
  });
  it('keeps direction inherited through a sibling of an ancestor', () => {
    expect(detectDirection('.rtl .sibling + .wrapper .x', config)).toBe('rtl');
  });
  it('uses the subject end of a compound custom direction selector', () => {
    expect(detectDirection('.root .rtl .ltr .x', { ltr: '.root .rtl .ltr', rtl: '.rtl' })).toBe('ltr');
  });
  it('matches escaped custom class names by token identity', () => {
    expect(detectDirection(String.raw`.r\74l .x`, config)).toBe('rtl');
  });
  it('falls back from whitespace-only custom selectors', async () => {
    const result = await process('.x{margin-inline-start:10px}', { ltr: { selector: '   ' }, rtl: { selector: '  ' } });
    expect((result.root.nodes as Rule[]).map(rule => rule.selector)).toEqual(['[dir="ltr"] .x', '[dir="rtl"] .x']);
  });
  it('preserves negated direction conditions during plugin processing', async () => {
    const result = await process('.x:not([dir="rtl"]){margin-inline-start:10px}');
    const rules = result.root.nodes as Rule[];
    expect(rules.map(r => r.selector)).toEqual(['[dir="ltr"] .x:not([dir="rtl"])', '[dir="rtl"] .x:not([dir="rtl"])']);
  });
  it('applies each configured selector-list branch to the subject', async () => {
    const result = await process('.x,.y{margin-inline-start:10px}', { ltr: { selector: '.ltr, .left' }, rtl: { selector: '.rtl, .right' } });
    const rules = result.root.nodes as Rule[];
    expect(rules[0].selectors).toEqual(['.ltr .x', '.left .x', '.ltr .y', '.left .y']);
    expect(rules[1].selectors).toEqual(['.rtl .x', '.right .x', '.rtl .y', '.right .y']);
  });
  it('cleans complete chained custom tokens and leading combinators', () => {
    expect(generateSelector('.theme.rtl > .x', 'ltr', config)).toBe('.ltr .theme > .x');
    expect(generateSelector('[dir="rtl"] > .x', 'ltr')).toBe('[dir="ltr"] .x');
  });
  it('treats mixed functional selector branches as unscoped', () => {
    expect(detectDirection(':is([dir="rtl"], [dir="ltr"]) .x')).toBe('none');
    expect(detectDirection(':where(:dir(rtl), [dir="rtl"]) .x')).toBe('rtl');
  });
});

describe('Value and structure boundaries', () => {
  it.each(['linear-gradient(to inline-start,var(--inline-start),red)', 'radial-gradient(circle at inline-start,var(--inline-end),red)', 'repeating-linear-gradient(to inline-start,var(--block-start),red)'])('transforms only gradient position tokens in %s', async gradient => {
    const result = await process(`.x{background-image:${gradient},url("inline-start.png")}`);
    const rules = result.root.nodes as Rule[];
    expect(declarations(rules[1] ?? rules[0])[0][1]).toContain('url("inline-start.png")');
    for (const rule of rules) {
      expect(String(declarations(rule)[0][1])).toMatch(/var\(--(?:inline-start|inline-end|block-start)\)/);
    }
    expect(rules[0].selector).toContain('ltr');
    expect(String(declarations(rules[0])[0][1])).toContain('left');
    expect(String(declarations(rules[1])[0][1])).toContain('right');
  });
  it('leaves non-position logical words and URL strings unchanged', async () => {
    const css = '.x{background:linear-gradient(red,var(--inline-start)),url("to inline-end.png")}';
    expect((await process(css)).css).toBe(css);
  });
  it.each(['scroll-margin-inline', 'scroll-margin-block', 'scroll-padding-inline', 'scroll-padding-block'])('keeps invalid %s shorthand values intact', async prop => {
    const css = `.x{${prop}:1px 2px 3px}`;
    expect((await process(css)).css).toBe(css);
  });
  it.each(['scroll-margin-inline', 'scroll-margin-block', 'scroll-padding-inline', 'scroll-padding-block'])('ignores comments as separators in %s', async prop => {
    const result = await process(`.x{${prop}:10px /* note */ 20px}`);
    for (const rule of result.root.nodes as Rule[]) expect(declarations(rule).map(d => d[1])).toEqual(['10px', '20px']);
  });
  it('recognizes case-insensitive CSS property names', async () => {
    const result = await process('.x{MARGIN-INLINE-START:10px}');
    expect((result.root.nodes as Rule[]).map(declarations)).toEqual([[['margin-left', '10px', false]], [['margin-right', '10px', false]]]);
  });
  it.each(['float', 'clear'])('recognizes case-insensitive logical %s values', async prop => {
    const result = await process(`.x{${prop}:INLINE-START}`);
    expect((result.root.nodes as Rule[]).map(declarations)).toEqual([[[prop, 'left', false]], [[prop, 'right', false]]]);
  });
  it('recognizes case-insensitive resize values', async () => {
    expect(declarations((await process('.x{resize:BLOCK}')).root.first as Rule)).toEqual([['resize', 'vertical', false]]);
  });
  it('leaves rules with no logical properties untouched', async () => {
    const css = '.x{--Label:rtl;--label:ltr; color:red; /* keep */ color:blue}';
    expect((await process(css)).css).toBe(css);
  });
  it('does not duplicate direction scopes when processing twice', async () => {
    const first = await process('.x{margin-inline-start:10px; padding-block-end:2px}');
    expect((await process(first.css)).css).toBe(first.css);
  });
  it.each(['keyframes', '-webkit-keyframes', '-moz-keyframes'])('does not scope %s frame selectors', async name => {
    const css = `@${name} slide{from{margin-inline-start:0}to{margin-inline-start:10px}}`;
    expect((await process(css)).css).toBe(css);
  });
  it.each(['& .child{color:blue}', '@media (width>10px){color:blue}', '& .child{padding-inline-start:2px}'])('keeps unexpanded nesting intact: %s', async child => {
    const css = `.x{color:red;margin-inline-start:10px;${child}}`;
    const result = await process(css);
    expect(result.css).toBe(css);
    expect(result.warnings().some(w => /nest/i.test(w.text))).toBe(true);
  });
  it('isolates concurrent processor directions and custom options', async () => {
    const inputs = Array.from({ length: 12 }, (_, index) => ({ index, rtl: index % 2 === 0 }));
    const results = await Promise.all(inputs.map(async ({ index, rtl }) => {
      const result = await process(`.x{margin-inline-start:${index}px}`, { ltr: { selector: `.left-${index}` }, rtl: { selector: `.right-${index}` }, outputOrder: rtl ? 'rtl-first' : 'ltr-first' });
      return { result, index, rtl };
    }));
    for (const { result, index, rtl } of results) {
      const rule = result.root.first as Rule;
      expect(rule.selector).toBe(`.${rtl ? 'right' : 'left'}-${index} .x`);
      expect(declarations(rule)).toEqual([[rtl ? 'margin-right' : 'margin-left', `${index}px`, false]]);
    }
  });
  it.each(['background:red', 'background-image:linear-gradient(to left,red,var(--inline-start))', 'float:left;resize:both'])('does not warn or alter non-logical nested CSS: %s', declarations => {
    return process(`.x{${declarations}; & .child{color:blue}}`).then(result => {
      expect(result.css).toBe(`.x{${declarations}; & .child{color:blue}}`);
      expect(result.warnings()).toHaveLength(0);
    });
  });
  it('preserves rule comments and their positions around generated declarations', async () => {
    const result = await process('.x{/* license */color:red;/* off */margin-inline-start:10px;/* on */padding-block-end:2px}');
    const rules = result.root.nodes as Rule[];
    const nodes = (rule: Rule) => rule.nodes.map(node => node.type === 'comment' ? node.text : node.type === 'decl' ? node.prop : node.type);
    expect(nodes(rules[0])).toEqual(['license', 'color', 'off', 'on', 'padding-bottom']);
    expect(nodes(rules[1])).toEqual(['license', 'off', 'margin-left', 'on']);
    expect(nodes(rules[2])).toEqual(['license', 'off', 'margin-right', 'on']);
  });
  it('maps each generated declaration to its own original source line', async () => {
    const result = await postcss([plugin()]).process('.x {\n color: red;\n margin-inline-start: 10px;\n padding-block-end: 2px;\n}', { from: 'input.css', map: { inline: false, annotation: false } });
    const consumer = await new SourceMapConsumer(result.map!.toJSON() as any);
    try {
      for (const [prop, originalLine] of [['color', 2], ['margin-left', 3], ['margin-right', 3], ['padding-bottom', 4]] as const) {
        const lines = result.css.split('\n');
        const line = lines.findIndex(text => text.includes(`${prop}:`));
        const position = consumer.originalPositionFor({ line: line + 1, column: lines[line].indexOf(prop) });
        expect(position.line, prop).toBe(originalLine);
      }
    } finally { consumer.destroy(); }
  });
});
