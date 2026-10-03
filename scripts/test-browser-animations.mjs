import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
const require = createRequire(import.meta.url);
const postcss = require('postcss');
const plugin = require('../dist/index.js');
const frames = '@keyframes slide{from{margin-inline-start:0}to{margin-inline-start:100px}}';
const cases = [
  frames + '.x{animation:slide 1s linear both}',
  frames + '.x{animation-name:slide;animation-duration:1s;animation-timing-function:linear;animation-fill-mode:both}',
  frames + '@keyframes fade{from{opacity:0}to{opacity:1}}.x{animation:slide 1s linear both,fade 2s linear both}',
  frames + '@media(min-width:1px){@keyframes slide{from{margin-left:0}to{margin-left:20px}}}.x{animation:slide 1s linear both}',
  frames.replace(/slide/g, 'linear') + '.x{animation:1s linear "linear" both}',
  frames + '@keyframes lp-slide-ltr{from{opacity:0}to{opacity:1}}.x{animation:slide 1s linear both}',
  frames + '.x{animation-name:slide!important;animation:none;animation-duration:1s;animation-timing-function:linear}',
  frames.replace('@keyframes', '@-webkit-keyframes') + '.x{-webkit-animation:slide 1s linear both}',
  frames + '.x{--motion:slide 1s linear both;animation:var(--motion)}'
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  async function sample(css, direction) {
    return page.evaluate(async ({ css, direction }) => {
      document.body.innerHTML = '';
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>${css}</style><div dir="${direction}"><div class="x">x</div></div>`;
      const el = shadow.querySelector('.x');
      getComputedStyle(el).marginLeft;
      const animations = el.getAnimations();
      for (const animation of animations) { animation.pause(); animation.currentTime = 500; }
      await new Promise(requestAnimationFrame);
      const styles = getComputedStyle(el);
      return { animations: animations.length, left: styles.marginLeft, right: styles.marginRight, opacity: styles.opacity };
    }, { css, direction });
  }
  for (const css of cases) {
    const compiled = (await postcss([plugin({ animations: true })]).process(css, { from: undefined })).css;
    for (const direction of ['ltr', 'rtl']) {
      const expected = await sample(css, direction);
      assert.ok(expected.animations > 0, 'Native fixture must actually animate');
      assert.deepEqual(await sample(compiled, direction), expected, `${direction}: ${css}`);
    }
  }
  console.log(`Browser animations: ${cases.length * 2} native/compiled intermediate-frame comparisons passed.`);
} finally { await browser.close(); }
