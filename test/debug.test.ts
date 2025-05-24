import { describe, test, expect } from 'vitest';
import postcss from 'postcss';
import logicalScope from '../src/index';

describe('postcss-logical-scope debug', () => {
  test('simple debug test', async () => {
    const input = `
      .container {
        margin-inline: 1rem 2rem;
      }
    `;

    const result = await postcss([logicalScope()])
      .process(input, { from: undefined });

    console.log('Generated CSS:');
    console.log(result.css);
    
    expect(result.css).toBeTruthy();
  });
});
