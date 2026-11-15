const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

function page(filename) {
  const dom = new JSDOM(fs.readFileSync(filename, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), {
    url: `https://romitagl.com/${filename}`, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const win = dom.window;
  win.matchMedia = () => ({ addEventListener() {}, removeEventListener() {}, matches: false });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  return win;
}
function components(win) {
  const add = win.document.addEventListener.bind(win.document);
  win.document.addEventListener = (event, callback, ...args) => event === 'DOMContentLoaded' ? callback() : add(event, callback, ...args);
  win.eval(fs.readFileSync('components.js', 'utf8'));
  win.document.addEventListener = add;
}
test('all site pages share a working sidebar and mobile disclosure, with active page links', () => {
  for (const filename of ['index.html', 'about.html', 'privacy.html', 'wiki.html', 'fitness.html', 'fiat500l-wiki.html', 'fiat500l-wiki-it.html', 'programming.html']) {
    const win = page(filename);
    components(win);
    const nav = win.document.querySelector('.site-nav');
    assert.ok(nav, filename);
    assert.equal(win.document.querySelectorAll('.site-nav').length, 1);
    if (filename !== 'programming.html') assert.ok(nav.querySelector('[aria-current="page"]'), `${filename} active page`);
    const menu = nav.querySelector('.mobile-menu-btn');
    menu.click();
    assert.equal(menu.getAttribute('aria-expanded'), 'true');
    win.document.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    assert.equal(nav.querySelector('.nav-links').classList.contains('active'), false);
    win.close();
  }
});
test('home uses the approved headline and spotlight; search and categories work together', () => {
  const win = page('index.html');
  win.eval(fs.readFileSync('assets/js/home.js', 'utf8'));
  const visible = () => [...win.document.querySelectorAll('.tool')].filter(item => !item.hidden);
  assert.equal(visible().length, 9);
  assert.equal(win.document.querySelectorAll('h1').length, 1);
  assert.match(win.document.querySelector('h1').textContent, /Useful tools/);
  assert.ok(win.document.querySelector('.spotlight'));
  win.document.querySelector('[data-filter="Documents"]').click();
  assert.equal(visible().length, 2);
  const search = win.document.getElementById('tool-search');
  search.value = 'gif'; search.dispatchEvent(new win.Event('input'));
  assert.equal(visible().length, 0);
  assert.equal(win.document.getElementById('empty').hidden, false);
  win.document.querySelector('[data-filter="All"]').click();
  assert.equal(visible().length, 1);
  search.value = ''; search.dispatchEvent(new win.Event('input'));
  assert.equal(visible().length, 9);
  win.close();
});
test('both guide URLs preserve 114 sections, search, bilingual controls, and sidebar translations', () => {
  for (const filename of ['fiat500l-wiki.html', 'fiat500l-wiki-it.html']) {
    const win = page(filename);
    components(win);
    win.eval(fs.readFileSync('assets/js/fiat500l-guide.js', 'utf8'));
    const cards = [...win.document.querySelectorAll('.guide-card')];
    assert.equal(cards.length, 114);
    const search = win.document.getElementById('guide-search');
    search.value = 'thisdoesnotexist'; search.dispatchEvent(new win.Event('input'));
    assert.equal(cards.filter(card => !card.hidden).length, 0);
    win.document.getElementById('clear-search').click();
    assert.equal(cards.filter(card => !card.hidden).length, 114);
    win.document.querySelector('[data-language-choice="it"]').click();
    assert.equal(win.document.documentElement.lang, 'it');
    assert.ok([...win.document.querySelectorAll('.site-nav [data-ui-language="it"]')].every(item => !item.hidden));
    win.document.getElementById('expand-all').click();
    assert.ok(cards.every(card => card.open));
    win.document.getElementById('collapse-all').click();
    assert.ok(cards.every(card => !card.open));
    win.close();
  }
});
test('protected FIAT experience remains byte-for-byte original and independent of the shared theme', () => {
  const { createHash } = require('node:crypto');
  const bytes = fs.readFileSync('fiat500L.html');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '9091a32fbe1acae0a4d023d6e479d14a49104318e8c0d7f708b89dc1736b2cd4');
  assert.doesNotMatch(bytes.toString(), /css\/studio\.css|src="components\.js"/);
});
