// Install DOM-only test dependencies with: npm ci --prefix tests/wiki
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const html = fs.readFileSync('wiki.html', 'utf8');
const script = fs.readFileSync('assets/js/wiki.js', 'utf8');
function setup() {
    const dom = new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), {url: 'https://romitagl.com/wiki.html#motors', runScripts: 'outside-only'});
    const win = dom.window;
    win.eval(fs.readFileSync('assets/js/lib/marked.min.js', 'utf8'));
    win.eval(script.replace('document.addEventListener("DOMContentLoaded", function () {', 'function unusedStartup() {').replace('        });\n\n        // Shared tab', '        }\n\n        // Shared tab'));
    win.wikiData = {currentTab: 'motors', tags: new Set(), categories: new Set(), activeFilters: {motors: new Set()}, tagCounts: {motors: {}}};
    win.HTMLElement.prototype.scrollIntoView = function() {};
    win.initTagFilter();
    return win;
}
test('preserves introductions and headings inside fences', () => {
    const win = setup();
    const sections = win.parseMarkdownToSections('Intro\n\n## Cars\n\n```md\n## Not a section\n```\n\n#### SAE Engine Oil Classifications\nDetails');
    assert.equal(sections.length, 2);
    assert.equal(sections[0].content, 'Intro');
    assert.match(sections[1].content, /## Not a section/);
    win.close();
});
test('renders SAE, lists, tables and images without rewriting URL fragments as tags', () => {
    const win = setup();
    const result = win.formatContentWithImagesAndTags('#### SAE Engine Oil Classifications\n\n- Before `W`\n  - Nested\n\n![SAE](https://github.com/user-attachments/assets/chart#figure)\n\n[Anchor](https://example.com/#spec) #oil\n\n| Grade | Use |\n| --- | --- |\n| 10W-40 | Engine |');
    const doc = new JSDOM(result).window.document;
    assert.equal(doc.querySelector('h4').textContent, 'SAE Engine Oil Classifications');
    assert.equal(doc.querySelector('img').getAttribute('src'), 'https://github.com/user-attachments/assets/chart#figure');
    assert.equal(doc.querySelector('a').getAttribute('href'), 'https://example.com/#spec');
    assert.equal(doc.querySelectorAll('.content-tag').length, 1);
    assert.ok(doc.querySelector('ul ul li'));
    assert.ok(doc.querySelector('table td'));
    win.close();
});
test('topic navigation opens Cars and all section controls remain operable after rerenders', () => {
    const win = setup();
    const target = win.document.getElementById('motors-content');
    const md = '## Motors\nIntro\n\n## Cars\n#### SAE Engine Oil Classifications\n\nDetails #oil';
    win.processMarkdownContent(md, 'motors', target);
    win.processMarkdownContent(md, 'motors', target);
    [...target.querySelectorAll('[data-topic-section]')].find(button => button.textContent === 'SAE Engine Oil Classifications').click();
    const panel = target.querySelector('#section-motors-1');
    assert.ok(panel.classList.contains('expanded'));
    panel.previousElementSibling.querySelector('button').click();
    assert.ok(!panel.classList.contains('expanded'));
    target.querySelector('[data-expand-all]').click();
    assert.ok([...target.querySelectorAll('.section-content')].every(item => item.classList.contains('expanded')));
    target.querySelector('[data-collapse-all]').click();
    assert.ok([...target.querySelectorAll('.section-content')].every(item => !item.classList.contains('expanded')));
    win.toggleTagFilter('missing');
    assert.ok(win.document.getElementById('no-results-motors'));
    win.clearTagFilters();
    assert.equal(win.document.getElementById('no-results-motors'), null);
    win.close();
});
test('removes executable Wiki HTML and unsafe URLs while retaining calendar embeds', () => {
    const win = setup();
    const rendered = win.formatContentWithImagesAndTags('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n[Calendar](https://calendar.google.com/calendar/embed?src=test)');
    assert.doesNotMatch(rendered, /<script|onerror|javascript:/);
    assert.match(rendered, /<iframe[^>]+title="Calendar"/);
    win.close();
});
test('expanded sections have no fixed height cap', () => {
    const css = fs.readFileSync('css/site-content.css', 'utf8');
    assert.match(css, /\.section-content\.expanded\s*\{\s*max-height: none; overflow: visible;/);
});
