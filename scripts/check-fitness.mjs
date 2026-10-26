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
assert.match(read('components.js'), /href="wiki.html#fitness"/);
assert.doesNotMatch(read('components.js'), /<a href="fitness.html"/);
assert.match(read('index.html'), /href="wiki.html#fitness"/);
assert.match(read('wiki.html'), /role="tab" data-tab="fitness"/);
assert.match(read('wiki.html'), /href="fitness.html#circuits"/);
assert.match(read('wiki.html'), /href="fitness.html#library"/);
assert.match(read('fitness.html'), /href="wiki.html#fitness"/);
assert.match(read('public/sitemap.xml'), /https:\/\/romitagl.com\/fitness.html/);
assert.ok(!read('fitness.html').includes('codex-preview'));
console.log('Fitness modules and website integration checks passed.');
