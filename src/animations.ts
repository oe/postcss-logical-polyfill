import { AnyNode, AtRule, Declaration, Result, Root, Rule } from 'postcss';
import valueParser, { Node } from 'postcss-value-parser';
import { applyLogicalTransformation, hasLogicalProperties } from './logical-properties';

type Direction = 'ltr' | 'rtl';
export type AnimationContext = Map<string, Record<Direction, string>>;
const globals = /^(initial|inherit|unset|revert|revert-layer)$/i;
const identifier = /^(?:--|-?(?:[_a-z]|[^\x00-\x7f]|\\[^\n\r\f]))(?:[_a-z0-9-]|[^\x00-\x7f]|\\[^\n\r\f])*$/i;
const keyframes = /^(?:-[a-z]+-)?keyframes$/i;

// value-parser does not consume whitespace terminating a hexadecimal CSS escape.
function normalizedEscapes(value: string): string {
  return value.replace(/\\([\da-f]{1,6})(?:\r\n|[ \n\r\t\f])?/gi, (_, hex: string) => `\\${hex.padStart(6, '0')}`);
}
function decoded(value: string): string {
  return value.replace(/\\(?:([\da-f]{1,6})(?:\r\n|[ \n\r\t\f])?|(\r\n|[\n\r\f])|([\s\S]))/gi, (_, hex: string, newline: string, char: string) => {
    if (!hex) return newline ? '' : char;
    const point = parseInt(hex, 16);
    return String.fromCodePoint(!point || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff) ? 0xfffd : point);
  });
}
function definitionName(atRule: AtRule): string | undefined {
  const nodes = valueParser(normalizedEscapes(atRule.params)).nodes.filter(node => !['space', 'comment'].includes(node.type));
  if (nodes.length !== 1 || !['word', 'string'].includes(nodes[0].type)) return;
  if (nodes[0].type === 'word' && (!identifier.test(nodes[0].value) || globals.test(decoded(nodes[0].value)) || decoded(nodes[0].value).toLowerCase() === 'none')) return;
  return decoded(nodes[0].value);
}

function referenceNodes(decl: Declaration): { parsed: ReturnType<typeof valueParser>; names: Node[]; dynamic: boolean } {
  const parsed = valueParser(normalizedEscapes(decl.value));
  const names: Node[] = [];
  let dynamic = false;
  parsed.walk(node => { if (node.type === 'function' && /^(var|env)$/i.test(node.value)) dynamic = true; });
  if (dynamic) return { parsed, names, dynamic };
  const groups: Node[][] = [[]];
  for (const node of parsed.nodes) {
    if (node.type === 'div' && node.value === ',') groups.push([]);
    else if (!['space', 'comment'].includes(node.type)) groups[groups.length - 1].push(node);
  }
  for (const nodes of groups) {
    if (decl.prop.toLowerCase().endsWith('animation-name')) {
      if (nodes.length !== 1 || !['string', 'word'].includes(nodes[0].type)) continue;
      const node = nodes[0];
      if (node.type === 'string' || (identifier.test(node.value) && !globals.test(decoded(node.value)) && decoded(node.value).toLowerCase() !== 'none')) names.push(node);
      continue;
    }
    const occupied = new Set<string>();
    let name: Node | undefined;
    let valid = true;
    for (const node of nodes) {
      const token = decoded(node.value).toLowerCase();
      let slot: string | undefined;
      if (node.type === 'function') {
        if (/^(steps|cubic-bezier|linear)$/i.test(token) && !occupied.has('easing')) slot = 'easing';
        else { valid = false; break; }
      } else if (node.type === 'word') {
        if (globals.test(token)) { valid = false; break; }
        if (/^[-+]?(?:\d*\.)?\d+(ms|s)$/.test(token)) {
          slot = occupied.has('duration') ? 'delay' : 'duration';
          if (occupied.has(slot) || (slot === 'duration' && token.startsWith('-'))) { valid = false; break; }
        } else if (/^(ease|linear|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(token) && !occupied.has('easing')) slot = 'easing';
        else if ((token === 'infinite' || /^(?:\d*\.)?\d+$/.test(token)) && !occupied.has('iterations')) slot = 'iterations';
        else if (/^(normal|reverse|alternate|alternate-reverse)$/.test(token) && !occupied.has('direction')) slot = 'direction';
        else if (/^(none|forwards|backwards|both)$/.test(token) && !occupied.has('fill')) slot = 'fill';
        else if (/^(running|paused)$/.test(token) && !occupied.has('play')) slot = 'play';
        else if (token === 'none') { valid = false; break; }
      } else if (node.type !== 'string') { valid = false; break; }
      if (slot) occupied.add(slot);
      else if (node.type === 'word' && !identifier.test(node.value)) { valid = false; break; }
      else if (!name) name = node;
      else { valid = false; break; }
    }
    if (valid && name) names.push(name);
  }
  return { parsed, names, dynamic };
}
function animationDeclaration(decl: Declaration): boolean {
  return /^(?:-[a-z]+-)?animation(?:-name)?$/i.test(decl.prop);
}
function flatRule(rule: Rule): boolean {
  if (rule.nodes.some(node => node.type === 'rule' || node.type === 'atrule')) return false;
  let supported = true;
  for (let node: AnyNode | undefined = rule.parent as AnyNode; node; node = node.parent as AnyNode | undefined) {
    if (node.type === 'rule' || (node.type === 'atrule' && (keyframes.test(node.name) || /^(page|font-face|counter-style)$/i.test(node.name)))) supported = false;
  }
  return supported;
}

/** Keep original definitions for native/dynamic references; clone every same-name definition in its original context. */
export async function prepareAnimations(root: Root, result: Result, order: 'ltr-first' | 'rtl-first'): Promise<AnimationContext> {
  const definitions = new Map<string, AtRule[]>();
  const logical = new Set<string>();
  root.walkAtRules(atRule => {
    if (!keyframes.test(atRule.name)) return;
    let nested = false;
    for (let node: AnyNode | undefined = atRule.parent as AnyNode; node; node = node.parent as AnyNode | undefined) { if (node.type === 'rule') nested = true; }
    if (nested) return;
    const name = definitionName(atRule);
    if (name === undefined) return;
    definitions.set(name, [...(definitions.get(name) ?? []), atRule]);
    if (atRule.nodes?.some(node => node.type === 'rule' && hasLogicalProperties(node))) logical.add(name);
  });
  const needed = new Set<string>();
  const used = new Set(definitions.keys());
  root.walkRules(rule => {
    if (!flatRule(rule)) {
      if (rule.nodes.some(node => node.type === 'rule' || node.type === 'atrule') && rule.nodes.some(node => node.type === 'decl' && animationDeclaration(node) && referenceNodes(node).names.some(name => logical.has(decoded(name.value))))) {
        result.warn('Expand CSS nesting before compiling logical animations; this nested rule was left unchanged.', { node: rule });
      }
      return;
    }
    rule.walkDecls(decl => {
      if (!animationDeclaration(decl)) return;
      const refs = referenceNodes(decl);
      if (refs.dynamic && logical.size) result.warn('Cannot resolve dynamic animation names; the animation declaration and original keyframes were preserved. Inline imports before this plugin for cross-file references.', { node: decl });
      for (const node of refs.names) {
        const name = decoded(node.value);
        used.add(name);
        if (logical.has(name)) needed.add(name);
      }
    });
  });
  const context: AnimationContext = new Map();
  const directions: Direction[] = order === 'ltr-first' ? ['ltr', 'rtl'] : ['rtl', 'ltr'];
  for (const name of needed) {
    const generated = {} as Record<Direction, string>;
    for (const direction of ['ltr', 'rtl'] as const) {
      const base = `lp-${name.replace(/[^\w-]/g, '-').slice(0, 48) || 'animation'}-${direction}`;
      let unique = base;
      for (let suffix = 2; used.has(unique); suffix++) unique = `${base}-${suffix}`;
      used.add(unique);
      generated[direction] = unique;
    }
    const pending: Array<{ original: AtRule; clones: AtRule[] }> = [];
    let failed = false;
    for (const original of definitions.get(name)!) {
      const clones: AtRule[] = [];
      for (const direction of directions) {
        const clone = original.clone({ params: generated[direction] });
        for (const frame of clone.nodes ?? []) {
          if (frame.type !== 'rule') continue;
          if (frame.nodes.some(node => node.type === 'rule' || node.type === 'atrule')) { failed = true; break; }
          if (!hasLogicalProperties(frame)) continue;
          const transformed = await applyLogicalTransformation(frame, direction, result);
          if (!transformed) { failed = true; break; }
          frame.replaceWith(transformed);
        }
        clones.push(clone);
      }
      pending.push({ original, clones });
    }
    if (failed) { result.warn(`Could not transform keyframes for ${name}; definitions and references were left unchanged.`, { node: definitions.get(name)![0] }); continue; }
    for (const { original, clones } of pending) {
      let previous: AtRule = original;
      for (const clone of clones) { previous.after(clone); previous = clone; }
    }
    context.set(name, generated);
  }
  return context;
}

export function hasAnimationReferences(rule: Rule, context: AnimationContext): boolean {
  if (!context.size) return false;
  return rule.nodes.some(node => node.type === 'decl' && animationDeclaration(node) && referenceNodes(node).names.some(name => context.has(decoded(name.value))));
}
export function transformAnimationReferences(rule: Rule, context: AnimationContext, direction: Direction): void {
  if (!context.size) return;
  rule.walkDecls(decl => {
    if (!animationDeclaration(decl)) return;
    const refs = referenceNodes(decl);
    let changed = false;
    for (const node of refs.names) {
      const mapped = context.get(decoded(node.value));
      if (!mapped) continue;
      node.value = mapped[direction];
      changed = true;
    }
    if (changed) decl.value = refs.parsed.toString();
  });
}
