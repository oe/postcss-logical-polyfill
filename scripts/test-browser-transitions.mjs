import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
const require = createRequire(import.meta.url);
const postcss = require('postcss');
const plugin = require('../dist/index.js');
const cases = [
  'transition-property:margin-inline,opacity;transition-duration:1s,2s;transition-timing-function:linear',
  'transition:opacity 1s ease 100ms,color 2s linear 200ms;transition-property:margin-inline,opacity',
  'transition-duration:1s,2s!important;transition:color 3s;transition-property:margin-inline,opacity',
  'transition-property:margin-inline-start,opacity;transition-duration:1s,2s;transition-delay:100ms,200ms'
].map(decls => `.x{margin-inline-start:0;opacity:1;${decls}}.x.end{margin-inline-start:100px;opacity:0}`);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  async function transitions(css, direction) {
    return page.evaluate(async ({ css, direction }) => {
      document.body.innerHTML = '';
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>${css}</style><div dir="${direction}"><div class="x">x</div></div>`;
      const el = shadow.querySelector('.x');
      getComputedStyle(el).marginLeft;
      el.classList.add('end');
      getComputedStyle(el).marginLeft;
      await new Promise(requestAnimationFrame);
      return el.getAnimations().map(animation => {
        const timing = animation.effect.getTiming();
        return { prop: animation.transitionProperty, duration: timing.duration, delay: timing.delay, easing: timing.easing };
      }).sort((a, b) => a.prop.localeCompare(b.prop));
    }, { css, direction });
  }
  for (const css of cases) {
    const compiled = (await postcss([plugin()]).process(css, { from: undefined })).css;
    for (const direction of ['ltr', 'rtl']) {
      const expected = await transitions(css, direction);
      assert.equal(expected.length, 2, 'Both margin and opacity must actually transition');
      assert.deepEqual(await transitions(compiled, direction), expected, `${direction}: ${css}`);
    }
  }
  console.log(`Browser transitions: ${cases.length * 2} native/compiled timing comparisons passed.`);
} finally { await browser.close(); }
