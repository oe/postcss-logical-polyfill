import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import plugin from '../../src';

(async () => {
  const input = path.join(__dirname, 'input.css');
  const output = path.join(__dirname, 'output.css');
  const result = await postcss([plugin({ animations: true })]).process(fs.readFileSync(input, 'utf8'), { from: input, to: output });
  fs.writeFileSync(output, result.css);
  for (const warning of result.warnings()) console.warn(warning.toString());
  console.log('Generated output.css. Open index.html and switch direction.');
})().catch(error => { console.error(error); process.exitCode = 1; });
