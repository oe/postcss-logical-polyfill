import postcss, { Declaration, Plugin, Result, Rule } from 'postcss';
import valueParser from 'postcss-value-parser';

const defaults: Record<string, string> = {
  'transition-property': 'all', 'transition-duration': '0s',
  'transition-delay': '0s', 'transition-timing-function': 'ease',
  'transition-behavior': 'normal'
};
const mappingCache = new WeakMap<Plugin, Map<string, string[]>>();
const globalValues = /^(initial|inherit|unset|revert|revert-layer)$/i;
const identifier = /^(?:--|-?(?:[_a-z]|[^\x00-\x7f]|\\[^\n\r\f]))(?:[_a-z0-9-]|[^\x00-\x7f]|\\[^\n\r\f])*$/i;

// null is invalid CSS; undefined means its component lists cannot be resolved safely.
function shorthand(value: string): Record<string, string> | null | undefined {
  const lists: Record<string, string[]> = Object.fromEntries(Object.keys(defaults).map(prop => [prop, []]));
  const items = postcss.list.comma(value);
  for (const item of items) {
    if (!item.trim()) return null;
    const values = { ...defaults };
    const assigned = new Set<string>();
    for (const node of valueParser(item).nodes) {
      if (node.type === 'space' || node.type === 'comment') continue;
      const token = valueParser.stringify(node);
      if (node.type === 'word' && /^[-+]?(?:\d*\.?\d+|\d+\.)(?:e[-+]?\d+)?(?:ms|s)$/i.test(token)) {
        const slot = !assigned.has('duration') && parseFloat(token) >= 0 ? 'duration' : 'delay';
        if (assigned.has(slot)) return null;
        assigned.add(slot);
        values[`transition-${slot}`] = token;
      } else if (node.type === 'function') {
        // Math and timing functions may depend on runtime values or be invalid.
        // Keep the original property list rather than guessing their reset behavior.
        return undefined;
      } else if (/^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/i.test(token) && !assigned.has('easing')) {
        assigned.add('easing');
        values['transition-timing-function'] = token;
      } else if (/^(normal|allow-discrete)$/i.test(token) && !assigned.has('behavior')) {
        assigned.add('behavior');
        values['transition-behavior'] = token;
      } else if (node.type === 'word' && identifier.test(token) && !globalValues.test(token) && !/^default$/i.test(token)) {
        if (assigned.has('property')) return null;
        assigned.add('property');
        values['transition-property'] = token;
      } else return null;
    }
    if (items.length > 1 && values['transition-property'].toLowerCase() === 'none') return null;
    for (const prop of Object.keys(defaults)) lists[prop].push(values[prop]);
  }
  return Object.fromEntries(Object.entries(lists).map(([prop, values]) => [prop, values.join(', ')]));
}

/** Expand the effective property list and keep its companion timing lists aligned. */
export async function transformTransitionProperties(rule: Rule, processor: Plugin, result?: Result, warningNode = rule): Promise<void> {
  type State = { value: string; important: boolean; source?: Declaration; opaque?: boolean };
  const state = new Map<string, State>(Object.entries(defaults).map(([prop, value]) => [prop, { value, important: false }]));
  rule.walkDecls(decl => {
    if (decl.parent !== rule) return;
    const prop = decl.prop.toLowerCase();
    const values = prop === 'transition' ? shorthand(decl.value) : null;
    if (prop === 'transition' && values === null && !globalValues.test(decl.value) && !/\b(?:var|env)\(/i.test(decl.value)) return;
    const entries = prop === 'transition' ? Object.keys(defaults).map(key => [key, values?.[key] ?? decl.value]) : [[prop, decl.value]];
    for (const [key, value] of entries) {
      const previous = state.get(key);
      if (previous && (!previous.important || decl.important)) state.set(key, { value, important: !!decl.important, source: decl, opaque: prop === 'transition' && values === undefined });
    }
  });
  const property = state.get('transition-property')!;
  if (property.source?.prop.toLowerCase() !== 'transition-property') return;
  const names = postcss.list.comma(property.value);
  if (names.some(name => !/^(?:--)?[-\w]+$/.test(name))) return;
  const mappings: string[][] = [];
  for (const name of names) {
    const cache = mappingCache.get(processor) ?? new Map<string, string[]>();
    mappingCache.set(processor, cache);
    if (cache.has(name)) { mappings.push(cache.get(name)!); continue; }
    if (!Object.prototype.hasOwnProperty.call(processor.Declaration, name.toLowerCase())) { mappings.push([name]); continue; }
    const transformed = await postcss([processor]).process(`.x{${name.toLowerCase()}:initial}`, { from: undefined });
    const first = transformed.root.first as Rule;
    const mapped = first.nodes.filter(node => node.type === 'decl').map(decl => decl.prop);
    cache.set(name, mapped);
    mappings.push(mapped);
  }
  if (mappings.every((mapped, index) => mapped.length === 1 && mapped[0] === names[index])) return;
  const warn = () => {
    const text = 'Cannot safely align transition-property with unresolved or inherited timing lists; this declaration was left unchanged.';
    if (result && !result.warnings().some(w => w.node === warningNode && w.text === text)) result.warn(text, { node: warningNode });
  };
  const companions = [...state].filter(([prop]) => prop !== 'transition-property');
  if (mappings.some(mapped => mapped.length > 1) && companions.some(([, item]) => item.opaque || globalValues.test(item.value) || /\b(?:var|env)\(/i.test(item.value))) { warn(); return; }
  const expanded = mappings.flat();
  if (expanded.length > 10000) { warn(); return; }
  property.source.value = expanded.join(', ');
  for (const [prop, item] of companions) {
    const values = postcss.list.comma(item.value);
    // A single repeated value remains aligned without adding a declaration.
    if (values.length === 1) continue;
    const aligned = mappings.flatMap((mapped, index) => mapped.map(() => values[index % values.length]));
    if (aligned.join(', ') === values.join(', ')) continue;
    rule.append(item.source!.clone({ prop, value: aligned.join(', '), important: item.important }));
  }
}
