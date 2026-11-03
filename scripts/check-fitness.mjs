import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const name of readdirSync(new URL('../assets/js/fitness/', import.meta.url))) {
  if (name.endsWith('.mjs')) execFileSync(process.execPath, ['--check', `${root}assets/js/fitness/${name}`]);
}
const read = file => readFileSync(`${root}${file}`, 'utf8');
// The Wiki tab controller is inline; include it in syntax checks as well.
for (const [, attributes, source] of read('wiki.html').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(attributes)) new Script(source, { filename: 'wiki.html' });
}
assert.match(read('fitness.html'), /<link rel="canonical" href="https:\/\/romitagl.com\/fitness.html">/);
// Validate the rendered shared links; navigation is generated from a directory.
const placeholders = ['navigation', 'footer'].map(component => ({ dataset: { component }, innerHTML: '' }));
new Script(read('components.js')).runInNewContext({
  location: { pathname: '/index.html', hash: '', hostname: 'localhost' },
  document: {
    addEventListener: (event, callback) => { if (event === 'DOMContentLoaded') callback(); },
    querySelectorAll: () => placeholders,
    querySelector: () => null,
  },
});
for (const placeholder of placeholders) {
  assert.match(placeholder.innerHTML, /href="fitness.html"/);
  assert.match(placeholder.innerHTML, /href="fitness.html#library"/);
  assert.doesNotMatch(placeholder.innerHTML, /wiki.html#fitness/);
}
assert.match(read('index.html'), /id="fitness" aria-labelledby="fitness-title"/);
assert.match(read('index.html'), /href="fitness.html"/);
assert.doesNotMatch(read('wiki.html'), /role="tab" data-tab="fitness"/);
assert.match(read('fitness.html'), /href="index.html#fitness"/);
assert.doesNotMatch(read('fitness.html'), /wiki.html#fitness/);
// Exercise the real legacy redirect on initial load and later hash changes.
const callbacks = [];
const redirects = [];
const context = {
  window: { location: { hash: '#fitness', replace: target => redirects.push(target) } },
  document: { addEventListener: (event, callback) => callbacks.push(callback) },
};
for (const [, attributes, source] of read('wiki.html').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(attributes)) new Script(source).runInNewContext(context);
}
callbacks[0]();
assert.deepEqual(redirects, ['fitness.html']);
redirects.length = 0;
context.loadActiveTab();
assert.deepEqual(redirects, ['fitness.html']);
assert.match(read('public/sitemap.xml'), /https:\/\/romitagl.com\/fitness.html/);
assert.ok(!read('fitness.html').includes('codex-preview'));
console.log('Fitness modules and website integration checks passed.');
