import { AMRAP_LIMIT, createAmrap, validAmrap, amrapPosition, advanceAmrap, amrapRecord } from './amrap-core.mjs';
import { formatTime } from './session.mjs';
import { demo, escapeHtml as e } from './views.mjs';
import { mountDemo } from './media.mjs';

/** Independent time-based session; round-based sessions retain their original engine. */
export function mountAmrap(container, saved, { onSave, onComplete }) {
  let state = validAmrap(saved) ? { ...saved, running: false } : createAmrap();
  if (state.phase === 'work' && state.remaining === 0) state.phase = 'score';
  let interval = null;
  let deadline = 0;
  let disposeDemo = () => {};

  const persist = () => onSave({ ...state, running: false });
  function sync() {
    if (interval) state.remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  }
  function stop() {
    sync(); clearInterval(interval); interval = null; state.running = false;
    if (state.phase === 'work' && state.remaining === 0) state.phase = 'score';
  }
  function start() {
    if (state.phase !== 'work' || !state.remaining) return;
    deadline = Date.now() + state.remaining * 1000;
    state.running = true;
    interval = setInterval(() => {
      sync();
      const output = container.querySelector('[data-amrap-time]');
      if (output) output.textContent = formatTime(state.remaining);
      if (!state.remaining) { stop(); state.phase = 'score'; persist(); render(); }
    }, 200);
    persist();
  }

  function render() {
    disposeDemo();
    const position = amrapPosition(state);
    container.innerHTML = `<a class="fit-button" href="#circuit/amrap-20">← Workout & exercise list</a><section class="fit-intro"><p class="fit-eyebrow">Timed challenge / full body</p><h1>20-minute AMRAP</h1><p>Complete as many controlled rounds as you can. Log each exercise when finished, then record any partial repetitions at the end.</p></section>
      ${state.phase === 'ready' ? `<div class="fit-phase"><h2>Warm up before starting the clock</h2><p>Use about 5 minutes of easy movement. Check that your chair is sturdy and secured against a wall.</p><p>The work clock counts down from 20:00. Recovery while you remain in the tracker is part of those 20 minutes.</p><button type="button" class="fit-primary" data-amrap-start>Start the 20-minute clock</button></div>` : ''}
      ${state.phase === 'work' ? `<div class="fit-timer"><span class="fit-small fit-muted">Time remaining</span><output data-amrap-time>${formatTime(state.remaining)}</output><button type="button" data-amrap-pause>${state.running ? 'Pause clock' : 'Resume clock'}</button><p class="fit-small fit-muted">Clock pauses if you leave this tracker or hide the tab. Paused time is excluded from the work clock.</p></div><p class="fit-meta">${position.rounds} full rounds complete · exercise ${position.index + 1} of 6</p><article class="fit-amrap-current"><p class="fit-eyebrow">Current exercise</p><h2>${e(position.exercise.name)}</h2><p><strong>${e(position.station.dose)}</strong></p><p>${e(position.exercise.cue)}</p>${position.station.countNote ? `<p class="fit-small fit-muted">${e(position.station.countNote)}</p>` : ''}<button type="button" class="fit-primary" data-amrap-next>Exercise complete →</button>${position.station.sides ? '<p class="fit-small">Complete both leading sides before pressing Exercise complete.</p>' : ''}</article>${demo(position.exercise)}<div class="fit-actions"><button type="button" data-amrap-end>End early & record score</button></div>` : ''}
      ${state.phase === 'score' ? `<section class="fit-phase"><h2>${state.remaining ? 'Workout stopped early' : '20 minutes complete'}</h2><p role="status">Time worked: ${formatTime(AMRAP_LIMIT - state.remaining)} · ${position.rounds} full rounds, plus ${position.index} completed exercises.</p><form class="fit-score-form" data-amrap-score><label for="fit-partial">Extra repetitions of ${e(position.exercise.name.toLowerCase())}</label><input id="fit-partial" name="partial" type="number" min="0" max="${position.station.reps - 1}" step="1" value="0" required><p class="fit-small fit-muted">Enter 0 if you had not started this exercise. A full exercise should be logged as complete.</p><button type="button" data-amrap-correct>Count this full exercise instead</button><div class="fit-actions"><button class="fit-primary" type="submit">Save AMRAP result</button></div></form><p class="fit-muted">After recording your score, cool down with a few minutes of easy movement.</p></section>` : ''}`;
    if (state.phase !== 'ready') container.insertAdjacentHTML('beforeend', '<details class="fit-preparation"><summary>Start over</summary><p>Discard the timer and unsaved score for this attempt. Completed journal entries stay saved.</p><button type="button" data-amrap-discard>Discard this attempt & reset</button></details>');
    disposeDemo = mountDemo(container);
  }

  function click(event) {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-amrap-start')) {
      state = { ...createAmrap(), phase: 'work' }; start(); render();
    } else if (button.hasAttribute('data-amrap-pause')) {
      if (interval) stop(); else start(); persist(); render();
    } else if (button.hasAttribute('data-amrap-next')) {
      sync();
      if (!state.remaining) { stop(); state.phase = 'score'; }
      else state = advanceAmrap(state);
      persist(); render();
    } else if (button.hasAttribute('data-amrap-end')) {
      stop(); state.phase = 'score'; persist(); render();
    } else if (button.hasAttribute('data-amrap-correct')) {
      state.completedSteps++; persist(); render();
    } else if (button.hasAttribute('data-amrap-discard')) {
      stop(); state = createAmrap(); persist(); render();
    }
  }
  function submit(event) {
    const form = event.target.closest('[data-amrap-score]');
    if (!form) return;
    event.preventDefault();
    const field = form.elements.partial;
    if (!field.checkValidity()) { field.reportValidity(); return; }
    const record = amrapRecord(state, field.value);
    stop(); onComplete(record);
  }
  function hidden() {
    if (document.hidden) { stop(); persist(); if (state.phase === 'work') render(); }
  }
  container.addEventListener('click', click);
  container.addEventListener('submit', submit);
  document.addEventListener('visibilitychange', hidden);
  render();
  return () => {
    stop(); persist(); disposeDemo();
    container.removeEventListener('click', click);
    container.removeEventListener('submit', submit);
    document.removeEventListener('visibilitychange', hidden);
  };
}
