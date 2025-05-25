import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import logicalPolyfill from '../src/index';

describe('postcss-logical-polyfill debug', () => {
  test('simple debug test', async () => {
    const input = `
      .container {
        margin-inline: 1rem 2rem;
      }
    `;

    const result = await postcss([logicalPolyfill()])
      .process(input, { from: undefined });

    console.log('Generated CSS:');
    console.log(result.css);
    
    expect(result.css).toBeTruthy();
  });
});
