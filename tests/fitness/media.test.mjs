import test from 'node:test';
import assert from 'node:assert/strict';
import { exercises } from '../../assets/js/fitness/catalog.mjs';
import { demoVideos, approvedDemoVideo } from '../../assets/js/fitness/demo-videos.mjs';
import { demo } from '../../assets/js/fitness/views.mjs';
import { mountDemo } from '../../assets/js/fitness/media.mjs';
import { mountModelDemo } from '../../assets/js/fitness/model-demo.mjs';
import { demoModels, approvedDemoModel } from '../../assets/js/fitness/demo-models.mjs';
import { readFileSync } from 'node:fs';

const candidate = {
  src: 'assets/videos/fitness/squat.mp4', publisher: 'Example creator',
  sourceUrl: 'https://example.org/original',
  license: { id: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/', verifiedOn: '2026-10-19' },
};

function modelFixture() {
  const control = () => Object.assign(new EventTarget(), { disabled: true, setAttribute() {} });
  const error = { hidden: true };
  const pictures = { open: false };
  const play = control();
  const figure = { querySelector: selector => ({
    '[data-demo-model]': {}, '[data-model-play]': play,
    '[data-model-speed]': control(), '[data-model-reset]': control(),
    '[data-media-error]': error, '.fit-picture-guide': pictures,
  })[selector] };
  return { figure, play, error, pictures };
}

test('unavailable 3D libraries expose picture guidance instead of a stuck loading control', async () => {
  const previousCancel = globalThis.cancelAnimationFrame;
  globalThis.cancelAnimationFrame = () => {};
  const fixture = modelFixture();
  try {
    const dispose = mountModelDemo(fixture.figure, () => Promise.reject(new Error('unavailable')));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fixture.error.hidden, false);
    assert.equal(fixture.pictures.open, true);
    assert.equal(fixture.play.disabled, true);
    assert.equal(fixture.play.textContent, 'Animation unavailable');
    dispose();
  } finally { globalThis.cancelAnimationFrame = previousCancel; }
});

test('leaving before 3D libraries load prevents renderer creation', async () => {
  const previousCancel = globalThis.cancelAnimationFrame;
  globalThis.cancelAnimationFrame = () => {};
  const fixture = modelFixture();
  let finish;
  let created = false;
  try {
    const dispose = mountModelDemo(fixture.figure, () => new Promise(resolve => { finish = resolve; }));
    dispose();
    finish([{ WebGLRenderer: class { constructor() { created = true; } } }, {}]);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(created, false);
    assert.equal(fixture.error.hidden, true);
  } finally { globalThis.cancelAnimationFrame = previousCancel; }
});

test('push-up has an open model with continuous baked motion and public controls', () => {
  const model = demoModels['push-up'];
  assert.ok(approvedDemoModel(model));
  assert.equal(approvedDemoModel({ ...model, license: { ...model.license, id: 'Mixamo' } }), null);
  const buffer = readFileSync(new URL(`../../${model.src}`, import.meta.url));
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12)));
  const animation = gltf.animations.find(item => item.name === model.animation);
  assert.ok(animation.channels.length > 100);
  const times = gltf.accessors[animation.samplers[0].input];
  assert.ok(times.count > 20, 'the animation contains continuous motion samples');
  assert.ok(gltf.buffers.every(buffer => !buffer.uri), 'approved models use embedded buffers');
  assert.ok((gltf.images || []).every(image => !image.uri), 'approved models use embedded images');
  const html = demo(exercises.find(item => item.id === 'push-up'));
  assert.match(html, /data-model-play/);
  assert.match(html, /data-model-speed/);
  assert.match(html, /CC0/);
});

test('unverified or non-open media never qualifies for the player', () => {
  assert.equal(approvedDemoVideo(), null);
  assert.equal(approvedDemoVideo({ ...candidate, license: undefined }), null);
  assert.equal(approvedDemoVideo({ ...candidate, license: { ...candidate.license, id: 'Standard YouTube License' } }), null);
  assert.equal(approvedDemoVideo({ ...candidate, license: { ...candidate.license, verifiedOn: '' } }), null);
  assert.equal(approvedDemoVideo({ ...candidate, src: 'https://example.org/movie.mp4' }), null);
  assert.equal(approvedDemoVideo(candidate), candidate);
  for (const exercise of exercises) assert.doesNotMatch(demo(exercise), /youtube|<iframe/i);
  for (const video of Object.values(demoVideos)) assert.ok(approvedDemoVideo(video));
});

test('approved local demos have controls, attribution and no autoplay', () => {
  demoVideos.squat = candidate;
  try {
    const html = demo(exercises.find(item => item.id === 'squat'));
    assert.match(html, /<video[^>]+controls loop muted playsinline preload="none"/);
    assert.match(html, /CC-BY-4.0/);
    assert.match(html, /Example creator/);
    assert.doesNotMatch(html, /autoplay|<iframe/);
  } finally { delete demoVideos.squat; }
});

test('native video pauses when hidden and on disposal; speed controls stay independent', () => {
  const previousDocument = globalThis.document;
  const document = new EventTarget();
  document.hidden = false;
  globalThis.document = document;
  const video = new EventTarget();
  let pauses = 0;
  video.pause = () => { pauses++; };
  const speed = new EventTarget();
  speed.value = '0.5';
  const figure = { querySelectorAll: () => [], querySelector: selector => ({
    '[data-demo-video]': video, '[data-video-speed]': speed,
  })[selector] };
  try {
    const dispose = mountDemo({ querySelector: () => figure });
    speed.dispatchEvent(new Event('change'));
    assert.equal(video.playbackRate, 0.5);
    document.hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(pauses, 1);
    dispose();
    assert.equal(pauses, 2);
    document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(pauses, 2);
  } finally { globalThis.document = previousDocument; }
});
