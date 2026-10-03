import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Install the actual publishable tarball outside the workspace so local files
// and workspace dependency resolution cannot hide missing package contents.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = mkdtempSync(join(tmpdir(), 'logical-polyfill-consumer-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
try {
  const packed = JSON.parse(execFileSync(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', directory], { cwd: root, encoding: 'utf8' }));
  writeFileSync(join(directory, 'package.json'), '{"private":true}');
  execFileSync(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund', join(directory, packed[0].filename)], { cwd: directory, stdio: 'pipe' });
  const require = createRequire(join(directory, 'package.json'));
  const postcss = require('postcss');
  const entry = require.resolve('postcss-logical-polyfill');
  const manifest = JSON.parse(readFileSync(join(dirname(entry), '..', 'package.json'), 'utf8'));
  const esmEntry = join(dirname(entry), '..', manifest.module);
  const creators = [require('postcss-logical-polyfill'), (await import(pathToFileURL(esmEntry).href)).default];
  for (const creator of creators) {
    assert.equal(typeof creator, 'function');
    assert.equal(creator.postcss, true);
    const result = await postcss([creator({ ltr: { selector: '.ltr' }, rtl: { selector: '.rtl' }, outputOrder: 'rtl-first' })]).process('.box{margin-inline-start:10px;margin-inline-start:var(--gap)}', { from: undefined });
    assert.match(result.root.first.selector, /rtl/);
    const values = [];
    result.root.walkDecls(decl => values.push(decl.value));
    assert.deepEqual(values, ['10px', 'var(--gap)', '10px', 'var(--gap)']);
  }
  const types = join(dirname(entry), '..', manifest.types);
  assert.match(readFileSync(types, 'utf8'), /LogicalPolyfillOptions/);
  writeFileSync(join(directory, 'consumer.ts'), `import plugin, { LogicalPolyfillOptions } from 'postcss-logical-polyfill';\nimport postcss from 'postcss';\nconst options: LogicalPolyfillOptions = { outputOrder: 'rtl-first' };\npostcss([plugin(options)]);\n`);
  const tsc = createRequire(join(root, 'package.json')).resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tsc, '--noEmit', '--strict', '--skipLibCheck', '--module', 'node16', '--moduleResolution', 'node16', '--target', 'es2020', join(directory, 'consumer.ts')], { cwd: directory, stdio: 'pipe' });
  console.log('Packed package: CommonJS, ES module and TypeScript consumers passed.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}
