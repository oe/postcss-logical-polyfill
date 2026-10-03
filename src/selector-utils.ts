/** Parse selector tokens so attributes, negation and query arguments stay intact. */
import selectorParser, { Node, Selector } from 'postcss-selector-parser';

export interface DirectionConfig {
  ltr?: string;
  rtl?: string;
}

type Direction = 'ltr' | 'rtl';
type Match = { direction: Direction; position: number; nodes: Node[] };
type Pattern = { direction: Direction; nodes: Node[] };

function patterns(config: DirectionConfig): Pattern[] {
  const result: Pattern[] = [];
  for (const direction of ['ltr', 'rtl'] as const) {
    const custom = config[direction];
    if (!custom?.trim()) continue;
    for (const selector of selectorParser().astSync(custom).nodes) {
      result.push({ direction, nodes: selector.nodes });
    }
  }
  return result;
}

function sameToken(a: Node, b: Node): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'attribute' && b.type === 'attribute') {
    return a.attribute === b.attribute && a.operator === b.operator && a.value === b.value &&
      a.namespace === b.namespace && Boolean(a.insensitive) === Boolean(b.insensitive);
  }
  if ((a.type === 'class' && b.type === 'class') || (a.type === 'id' && b.type === 'id')) return a.value === b.value;
  if (a.type === 'combinator' && b.type === 'combinator') return a.value.trim() === b.value.trim();
  return a.toString().trim() === b.toString().trim();
}

function matches(selector: Selector, custom: Pattern[]): Match[] {
  const result: Match[] = [];
  selector.nodes.forEach((node, index) => {
    let direction: Direction | undefined;
    if (node.type === 'attribute' && node.attribute === 'dir' && !node.namespace && node.operator === '=' &&
        (node.value === 'ltr' || node.value === 'rtl')) direction = node.value;
    if (node.type === 'pseudo' && node.value === ':dir') {
      const value = node.nodes?.length === 1 ? node.nodes[0].toString().trim() : '';
      if (value === 'ltr' || value === 'rtl') direction = value;
    }
    // Only infer a positive functional condition when every branch agrees.
    // :not(), :has() and nth-child query arguments do not scope this subject.
    if (node.type === 'pseudo' && [':is', ':where'].includes(node.value) && node.nodes?.length) {
      const branches = node.nodes.map(branch => directionOf(branch, custom));
      if (branches[0] !== 'none' && branches.every(branch => branch === branches[0])) direction = branches[0];
    }
    if (direction) result.push({ direction, position: node.sourceIndex ?? index, nodes: [node] });
    for (const pattern of custom) {
      const candidates = selector.nodes.slice(index, index + pattern.nodes.length);
      if (candidates.length === pattern.nodes.length && candidates.every((candidate, offset) => sameToken(candidate, pattern.nodes[offset]))) {
        result.push({ direction: pattern.direction, position: candidates[candidates.length - 1].sourceIndex ?? index, nodes: candidates });
      }
    }
  });
  return result;
}

function directionOf(selector: Selector, custom: Pattern[]): Direction | 'none' {
  const found = matches(selector, custom);
  found.sort((a, b) => b.position - a.position);
  return found[0]?.direction ?? 'none';
}

export function detectDirection(selector: string, config: DirectionConfig = {}): Direction | 'none' {
  try {
    const root = selectorParser().astSync(selector);
    const custom = patterns(config);
    const directions = root.nodes.map(branch => directionOf(branch, custom));
    return directions.length && directions.every(direction => direction === directions[0]) ? directions[0] : 'none';
  } catch {
    return 'none';
  }
}

function cleanDirectionSelectors(selector: string, config: DirectionConfig): string {
  const root = selectorParser().astSync(selector);
  const custom = patterns(config);
  root.nodes.forEach(branch => {
    const nodes = new Set(matches(branch, custom).flatMap(match => match.nodes));
    nodes.forEach(node => node.remove());
    // Removing a direction-only compound can leave consecutive/edge combinators.
    branch.nodes.slice().forEach(node => {
      if (node.type !== 'combinator') return;
      const before = node.prev();
      const after = node.next();
      if (!before || !after || (node.value.trim() === '' && (before.type === 'combinator' || after.type === 'combinator'))) node.remove();
    });
  });
  return root.toString().trim();
}

export function generateSelector(selector: string, direction: Direction, config: DirectionConfig = {}): string {
  const current = detectDirection(selector, config);
  if (current === direction) return selector;
  let cleaned = selector.trim();
  if (current !== 'none') {
    try { cleaned = cleanDirectionSelectors(selector, config); } catch { /* Keep malformed input intact. */ }
  }
  const scoped = config[direction]?.trim() || `[dir="${direction}"]`;
  // A configured selector list must scope the subject on every branch.
  return selectorParser().astSync(scoped).nodes.map(branch =>
    cleaned ? `${branch.toString().trim()} ${cleaned}` : branch.toString().trim()
  ).join(', ');
}
