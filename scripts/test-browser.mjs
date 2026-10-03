import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

// Compare native logical CSS with compiled CSS using actual browser cascade.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const plugin = require(join(root, 'dist/index.js'));
const postcss = require('postcss');
const cases = [
  '.x{margin-inline-start:10px;margin:0}',
  '.x{margin:0;margin-inline-start:10px}',
  '.x{margin-left:1px;margin:0;margin-inline-start:10px}',
  '.x{margin-left:1px;margin:0;margin-left:10px;padding-inline-start:5px}',
  '.x{margin-inline-start:10px!important;margin:0;margin-top:5px}',
  '.x{margin-inline-start:10px;margin:0!important}',
  '.x{padding-inline-start:10px;padding:0}',
  '.x{scroll-margin-inline-start:10px;scroll-margin:0}',
  '.x{scroll-padding-inline-start:10px;scroll-padding:0}',
  '.x{border-inline-start:2px solid red;border-left-color:blue}',
  '.x{border-inline:1px solid red;border-inline-start:2px dashed blue;border-inline-end:3px dotted green;border-inline-width:4px;border-inline-style:solid;border-inline-color:purple}',
  '.x{border-start-start-radius:10px;border-radius:0}',
  '.x{overflow-inline:hidden;overflow:visible}',
  '.x{margin-inline-start:10px;all:initial}',
  '.x:not([dir="rtl"]){margin-inline-start:10px}',
  '.x{margin-inline-start:10px!important;margin-inline-start:20px}',
  '.x{margin-inline-start:10px!important;margin-inline-start:20px!important}',
];
// Cover both inline sides, importance combinations and source orders.
for (const family of ['margin', 'padding', 'scroll-margin', 'scroll-padding']) {
  for (const side of ['start', 'end']) {
    for (const logicalImportant of ['', '!important']) {
      for (const physicalImportant of ['', '!important']) {
        const logical = `${family}-inline-${side}:10px${logicalImportant}`;
        const physical = `${family}:2px${physicalImportant}`;
        cases.push(`.x{${logical};${physical}}`, `.x{${physical};${logical}}`);
      }
    }
  }
}
const properties = [
  'margin-left', 'margin-right', 'margin-top', 'padding-left', 'padding-right',
  'scroll-margin-left', 'scroll-margin-right', 'scroll-padding-left', 'scroll-padding-right',
  'border-left-width', 'border-left-style', 'border-left-color', 'border-right-width', 'border-right-style', 'border-right-color',
  'border-top-left-radius', 'border-top-right-radius', 'overflow-x', 'overflow-y',
];
const fixtures = [];
for (const css of cases) {
  const compiled = (await postcss([plugin()]).process(css, { from: undefined })).css;
  for (const direction of ['ltr', 'rtl']) fixtures.push({ css, compiled, direction });
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  timeout: 30000
});
try {
  const html = `<!doctype html><pre id="results"></pre><script>
const fixtures = ${JSON.stringify(fixtures).replace(/</g, '\\u003c')};
const properties = ${JSON.stringify(properties)};
function computed(css, direction) {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = '<style>'+css+'</style><div dir="'+direction+'"><div class="x">test</div></div>';
  const styles = getComputedStyle(shadow.querySelector('.x'));
  const result = Object.fromEntries(properties.map(prop => [prop, styles.getPropertyValue(prop)]));
  host.remove();
  return result;
}
document.querySelector('#results').textContent = JSON.stringify(fixtures.map(f => ({css:f.css,direction:f.direction,expected:computed(f.css,f.direction),actual:computed(f.compiled,f.direction)})));
</script>`;
  const page = await browser.newPage();
  await page.setContent(html, { timeout: 30000 });
  const results = JSON.parse(await page.locator('#results').textContent());
  assert.equal(results.length, fixtures.length);
  for (const result of results) assert.deepEqual(result.actual, result.expected, `${result.direction}: ${result.css}`);
  console.log(`Browser cascade: ${results.length} native/compiled comparisons passed.`);
} finally {
  await browser.close();
}
