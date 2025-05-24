import { describe, test } from 'vitest';
import postcss from 'postcss';
import logicalScope from '../src/index';

describe('postcss-logical-scope debug', () => {
  test('debug output', async () => {
    const input = `
.container {
  margin-inline: 1rem 2rem;
}

:dir(rtl) .container {
  margin-inline: 2rem 1rem;
}
`;
    // Set environment variable to enable debug output
    process.env.DEBUG = 'true';
    
    const result = await postcss([logicalScope()]).process(input, { from: undefined });
    console.log('Generated CSS:', result.css);
    
    // Clear environment variable
    process.env.DEBUG = '';
  });
});
