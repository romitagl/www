import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { exercises } from '../../assets/js/fitness/catalog.mjs';
import { demoGifs } from '../../assets/js/fitness/demo-gifs.mjs';
import { demo } from '../../assets/js/fitness/views.mjs';
import { mountGifDemo } from '../../assets/js/fitness/gif-demo.mjs';

function fixture({ loop = true } = {}) {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const button = Object.assign(new EventTarget(), { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } });
  const image = Object.assign(new EventTarget(), {
    src: 'start.jpg', alt: 'Start pose',
    dataset: { gifSrc: 'sample.gif', gifPoster: 'start.jpg', gifEndPoster: 'end.jpg', gifLoop: String(loop), gifDuration: '4800', gifAlt: 'Pose sequence', gifPosterAlt: 'Start pose', gifEndAlt: 'Hold pose' },
  });
  const status = { textContent: '' };
  const pictures = { open: false };
  const figure = { querySelector: selector => ({ '[data-gif-image]': image, '[data-gif-play]': button, '[data-gif-status]': status, '.fit-picture-guide': pictures })[selector] };
  return { document, figure, button, image, status, pictures };
}
function withDocument(fixture, work) {
  const previous = globalThis.document;
  globalThis.document = fixture.document;
  try { work(); } finally { globalThis.document = previous; }
}

test('every exercise has a local, source-matched GIF, posters, and opt-in controls', () => {
  assert.deepEqual(Object.keys(demoGifs).sort(), exercises.map(exercise => exercise.id).sort());
  const manifest = JSON.parse(readFileSync(new URL('../../assets/images/fitness/animated/manifest.json', import.meta.url)));
  for (const exercise of exercises) {
    const gif = demoGifs[exercise.id];
    const file = new URL(`../../${gif.src}`, import.meta.url);
    const buffer = readFileSync(file);
    assert.equal(buffer.toString('ascii', 0, 6), 'GIF89a');
    assert.equal(buffer.readUInt16LE(6), 480);
    assert.equal(buffer.readUInt16LE(8), gif.height);
    assert.ok(statSync(file).size < 3 * 1024 * 1024);
    assert.equal(createHash('sha256').update(buffer).digest('hex'), manifest[exercise.id].sha256);
    const source = readFileSync(new URL(`../../${exercise.image}`, import.meta.url));
    assert.equal(createHash('sha256').update(source).digest('hex'), manifest[exercise.id].sourceSha256);
    for (const poster of [gif.poster, gif.endPoster]) assert.ok(statSync(new URL(`../../${poster}`, import.meta.url)).size > 0);
    const html = demo(exercise);
    assert.match(html, /data-gif-play aria-pressed="false"/);
    assert.match(html, new RegExp(`src="${gif.poster.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.match(html, /Picture guide & numbered steps/);
    assert.match(html, /Pose-by-pose guide/);
  }
});

test('isometric guides play once while movement guides loop', () => {
  const holds = ['side-plank', 'suitcase-hold', 'forearm-plank', 'squat-hold', 'single-leg-balance', 'single-leg-squat-hold'];
  for (const id of holds) assert.equal(demoGifs[id].loop, false, id);
  assert.equal(demoGifs.squat.loop, true);
  assert.equal(demoGifs['bird-dog'].frames, 4);
});

test('GIF playback is explicit, stops when hidden, and has no listeners after disposal', () => {
  const f = fixture();
  withDocument(f, () => {
    const dispose = mountGifDemo(f.figure);
    assert.equal(f.image.src, 'start.jpg');
    f.button.dispatchEvent(new Event('click'));
    assert.equal(f.image.src, 'sample.gif');
    assert.equal(f.button.attributes['aria-pressed'], 'true');
    f.document.hidden = true;
    f.document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(f.image.src, 'start.jpg');
    assert.equal(f.button.attributes['aria-pressed'], 'false');
    f.document.hidden = false;
    f.button.dispatchEvent(new Event('click'));
    dispose();
    assert.equal(f.image.src, 'start.jpg');
    f.button.dispatchEvent(new Event('click'));
    assert.equal(f.image.src, 'start.jpg');
  });
});

test('a hold finishes on a still after the loaded sequence, without changing a workout timer', () => {
  const f = fixture({ loop: false });
  const previousSet = globalThis.setTimeout, previousClear = globalThis.clearTimeout;
  let finish, delay, cancelled = 0;
  globalThis.setTimeout = (callback, milliseconds) => { finish = callback; delay = milliseconds; return 1; };
  globalThis.clearTimeout = () => { cancelled++; };
  try {
    withDocument(f, () => {
      const dispose = mountGifDemo(f.figure);
      f.button.dispatchEvent(new Event('click'));
      assert.equal(finish, undefined, 'network wait must not consume the sequence duration');
      f.image.dispatchEvent(new Event('load'));
      assert.equal(delay, 4800);
      finish();
      assert.equal(f.image.src, 'end.jpg');
      assert.equal(f.image.alt, 'Hold pose');
      assert.equal(f.button.textContent, 'Replay setup guide');
      assert.match(f.status.textContent, /Stay still/);
      dispose();
      assert.ok(cancelled > 0);
    });
  } finally { globalThis.setTimeout = previousSet; globalThis.clearTimeout = previousClear; }
});

test('failed animations restore still guidance and expose the original picture steps', () => {
  const f = fixture();
  withDocument(f, () => {
    const dispose = mountGifDemo(f.figure);
    f.button.dispatchEvent(new Event('click'));
    f.image.dispatchEvent(new Event('error'));
    assert.equal(f.image.src, 'start.jpg');
    assert.equal(f.button.disabled, true);
    assert.equal(f.pictures.open, true);
    assert.match(f.status.textContent, /could not load/);
    dispose();
  });
});

test('single-leg squat hold covers setup, shallow lowering, reset and both sides in eight poses', () => {
  const exercise = exercises.find(item => item.id === 'single-leg-squat-hold');
  const gif = demoGifs[exercise.id];
  assert.equal(exercise.frames.length, 8);
  assert.equal(gif.framePosters.length, 8);
  assert.equal(gif.loop, false);
  assert.ok(gif.durationMs > 20000, 'give the detailed cues time to be read');
  assert.match(exercise.steps[4].text, /both feet/);
  assert.match(exercise.steps[2].text, /shallow/);
  assert.match(exercise.steps[6].text, /heel down/);
  for (const src of gif.framePosters) assert.ok(statSync(new URL(`../../${src}`, import.meta.url)).size > 0);
  assert.match(demo(exercise), /data-gif-previous/);
  assert.match(demo(exercise), /data-gif-next/);
});

test('manual pose controls show detailed stills, respect boundaries, and stop handling input after disposal', () => {
  const f = fixture({ loop: false });
  const previous = new EventTarget();
  const next = new EventTarget();
  const note = {};
  const query = f.figure.querySelector;
  f.figure.querySelector = selector => ({ '[data-gif-previous]': previous, '[data-gif-next]': next, '[data-gif-step-note]': note })[selector] || query(selector);
  f.image.dataset.gifStills = JSON.stringify([
    { src: 'one.jpg', alt: 'First pose', text: 'Stand tall with both feet down.' },
    { src: 'two.jpg', alt: 'Second pose', text: 'Keep your standing heel grounded.' },
  ]);
  withDocument(f, () => {
    const dispose = mountGifDemo(f.figure);
    assert.equal(previous.disabled, true);
    next.dispatchEvent(new Event('click'));
    assert.equal(f.image.src, 'two.jpg');
    assert.equal(f.image.alt, 'Second pose');
    assert.match(note.textContent, /heel grounded/);
    assert.equal(next.disabled, true);
    previous.dispatchEvent(new Event('click'));
    assert.equal(f.image.src, 'one.jpg');
    f.button.dispatchEvent(new Event('click'));
    assert.equal(previous.disabled, true);
    assert.equal(next.disabled, true);
    assert.equal(note.hidden, true);
    f.button.dispatchEvent(new Event('click'));
    assert.equal(note.hidden, false);
    dispose();
    next.dispatchEvent(new Event('click'));
    assert.equal(f.image.src, 'start.jpg');
  });
});
