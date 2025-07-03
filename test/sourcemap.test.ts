import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import logicalPolyfill from '../src/index';
import { SourceMapConsumer } from 'source-map'; // Remove RawSourceMap import

describe('sourcemap support', () => {
  test('should preserve source map info for transformed declarations', async () => {
    const input = `/* test.css */\n.example {\n  margin-inline-start: 1rem;\n  padding-block-end: 2px;\n}`;
    const result = await postcss([logicalPolyfill()]).process(input, {
      from: 'test.css',
      map: { inline: false, annotation: false }
    });

    expect(result.map).toBeTruthy();
    const map = result.map!.toJSON();
    const mappings =
      map.sourcesContent &&
      map.sourcesContent[0].includes('margin-inline-start');
    expect(map.sources[0]).toBe('test.css');
    expect(mappings).toBe(true);

    // 关键修正：直接用 SourceMapConsumer 构造
    const consumer = await new SourceMapConsumer(map as any); // Use 'any' to avoid type errors
    const css = result.css;
    const marginLeftLine =
      css.split('\n').findIndex((line) => line.includes('margin-left')) + 1;
    const paddingBottomLine =
      css.split('\n').findIndex((line) => line.includes('padding-bottom')) + 1;
    const marginLeftPos = consumer.originalPositionFor({
      line: marginLeftLine,
      column: 2
    });
    const paddingBottomPos = consumer.originalPositionFor({
      line: paddingBottomLine,
      column: 2
    });
    expect(marginLeftPos.source).toBe('test.css');
    expect(paddingBottomPos.source).toBe('test.css');
    consumer.destroy && consumer.destroy();
  });
});
