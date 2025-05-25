import postcss from 'postcss';
import logicalPolyfill from '../../dist/index.js';
import { readFileSync, writeFileSync } from 'fs';

const inputCSS = readFileSync('./input.css', 'utf8');

async function processCSS() {
  console.log('Processing CSS with different outputOrder options...\n');

  // Default (ltr-first)
  const ltrFirstResult = await postcss([
    logicalPolyfill({
      outputOrder: 'ltr-first'
    })
  ]).process(inputCSS, { from: './input.css' });

  // RTL-first
  const rtlFirstResult = await postcss([
    logicalPolyfill({
      outputOrder: 'rtl-first'
    })
  ]).process(inputCSS, { from: './input.css' });

  // Write outputs
  writeFileSync('./output-ltr-first.css', ltrFirstResult.css);
  writeFileSync('./output-rtl-first.css', rtlFirstResult.css);

  console.log('✅ LTR-first output written to: output-ltr-first.css');
  console.log('✅ RTL-first output written to: output-rtl-first.css');
  
  console.log('\n📝 Notice: Only unscoped logical properties are affected by outputOrder.');
  console.log('   Scoped rules (with :dir() or [dir=""]) maintain their original order.');
}

processCSS().catch(console.error);
