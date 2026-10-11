// Static SEO checks, with no third-party dependencies.
import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const sitemap = await read('public/sitemap.xml');
const robots = await read('public/robots.txt');
assert.match(robots, /Allow: \/\s/);
assert.match(robots, /Sitemap: https:\/\/romitagl.com\/sitemap.xml/);
for (const [locale, file] of [['en', 'fiat500l-wiki.html'], ['it', 'fiat500l-wiki-it.html']]) {
  const html = await read(file);
  assert.match(html, new RegExp(`lang="${locale}"`));
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one descriptive h1`);
  assert.ok(html.includes(`href="https://romitagl.com/${file}" rel="canonical"`));
  assert.ok(sitemap.includes(`<loc>https://romitagl.com/${file}</loc>`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
  const cards = [...html.matchAll(/<details\b[^>]*class="guide-card"[^>]*id="([^"]+)"/g)].map(m => m[1]);
  assert.ok(cards.length >= 114, `${file}: complete procedures`);
  const directory = html.split('<!-- GUIDE_PROCEDURE_INDEX_START -->')[1]?.split('<!-- GUIDE_PROCEDURE_INDEX_END -->')[0];
  assert.ok(directory, `${file}: procedure directory`);
  for (const id of cards) assert.ok(directory.includes(`href="#${id}"`), `${file}: directory links to ${id}`);
  for (const other of ['fiat500l-wiki.html', 'fiat500l-wiki-it.html']) {
    assert.ok(html.includes(`href="https://romitagl.com/${other}" hreflang=`), `${file}: reciprocal language links`);
  }
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    const [path, fragment] = href.split('#');
    if (path) await access(new URL(path.split('?')[0], root));
    else if (fragment) assert.ok(ids.includes(fragment), `${file}: missing anchor ${fragment}`);
  }
  assert.doesNotMatch(html, /fiat500l-guide-it\.html/);
  console.log(`PASS: ${file}: ${cards.length} static sections, directory, metadata, language links and local assets.`);
}
