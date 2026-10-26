import { circuitById, exerciseById, resolveCircuitId } from './catalog.mjs';
import { createStore } from './storage.mjs';
import { advanceSession, completionRecord, createSession, formatTime, sessionPosition, validRounds, WARMUP_SECONDS, COOLDOWN_SECONDS, REST_SECONDS } from './session.mjs';
import { mountDemo } from './media.mjs';
import { mountAmrap } from './amrap.mjs';
import { circuitView, circuitsView, exerciseView, libraryView, progressView, sessionView } from './views.mjs';

const root = document.querySelector('.fitness-app');
const view = document.getElementById('fitness-view');
const store = createStore();
let active = store.state.activeSession;
let disposeDemo = () => {};
let disposeActivity = () => {};
let timerInterval = null;
let deadline = 0;
let deletePending = false;
let justCompleted = false;

function storageNote() { document.getElementById('fit-storage-note').hidden = store.persistent; }
function update(patch) { store.update(patch); storageNote(); }
function persistSession() { update({ activeSession: active }); }

function stopTimer() {
  if (timerInterval && active) active = { ...active, remaining: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)), running: false };
  clearInterval(timerInterval);
  timerInterval = null;
}

function timerDisplay() {
  const output = root.querySelector('[data-timer]');
  if (!output || !active) return;
  output.textContent = formatTime(active.remaining);
  const button = root.querySelector('[data-timer-toggle]');
  button.disabled = active.remaining <= 0;
  button.textContent = active.running ? 'Pause timer' : 'Start timer';
  const exercise = sessionPosition(active).exercise;
  root.querySelector('[data-timer-hint]').textContent = active.remaining <= 0 ? 'Continue whenever you are ready.'
    : active.phase === 'exercise' && exercise.sides && active.remaining <= exercise.seconds / 2 ? 'Second half — complete the other side when ready.'
    : 'A guide, not a race. Continue when ready.';
}

function startTimer() {
  if (!active || active.remaining <= 0) return;
  active = { ...active, running: true };
  deadline = Date.now() + active.remaining * 1000;
  timerInterval = setInterval(() => {
    const previous = active.remaining;
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    active = { ...active, remaining };
    timerDisplay();
    if (sessionPosition(active).exercise.sides && active.phase === 'exercise' && previous > sessionPosition(active).exercise.seconds / 2 && remaining <= sessionPosition(active).exercise.seconds / 2) {
      root.querySelector('[data-timer-status]').textContent = 'Halfway. Change sides when ready.';
    }
    if (!remaining) {
      stopTimer();
      persistSession();
      root.querySelector('[data-timer-status]').textContent = 'Timer finished. Continue when ready.';
      timerDisplay();
    }
  }, 200);
  persistSession();
  timerDisplay();
}

function route() {
  const raw = location.hash.slice(1) || 'circuits';
  const [path, query = ''] = raw.split('?');
  const [section, id] = path.split('/');
  if (section === 'pdf-plan' || section === 'stability') {
    history.replaceState(null, '', '#circuits');
    return { section: 'circuits', id: undefined, from: null };
  }
  return { section, id: section === 'circuit' ? resolveCircuitId(id) : id, from: new URLSearchParams(query).get('from') };
}

function render({ focus = false } = {}) {
  stopTimer();
  if (active) persistSession();
  disposeDemo();
  disposeActivity();
  disposeActivity = () => {};
  const { section, id, from } = route();
  deletePending = section === 'progress' ? deletePending : false;
  let content;
  let selectedNav = section;
  if (section === 'circuit' && circuitById[id]) { content = circuitView(circuitById[id], store.state); selectedNav = 'circuits'; }
  else if (section === 'exercise' && exerciseById[id]) { content = exerciseView(exerciseById[id], from); selectedNav = 'library'; }
  else if (section === 'library') content = libraryView();
  else if (section === 'amrap') { content = ''; selectedNav = 'circuits'; }
  else if (section === 'progress') { content = progressView(store.state, justCompleted, deletePending); justCompleted = false; }
  else if (section === 'session') { content = sessionView(active); selectedNav = 'circuits'; }
  else if (section === 'circuits') content = circuitsView(store.state);
  else { content = '<section class="fit-intro"><h1>Page not found.</h1><p>That exercise or circuit is not available.</p><a class="fit-button" href="#circuits">Back to circuits</a></section>'; selectedNav = 'circuits'; }
  view.innerHTML = content;
  root.querySelectorAll('[data-fit-nav]').forEach(link => {
    if (link.dataset.fitNav === selectedNav) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (section === 'amrap') {
    disposeDemo = () => {};
    disposeActivity = mountAmrap(view, store.state.amrapSession, {
      onSave: amrapSession => update({ amrapSession }),
      onComplete: record => {
        disposeActivity(); disposeActivity = () => {};
        update({ records: [record, ...store.state.records.filter(item => item.id !== record.id)].slice(0, 200), amrapSession: null });
        justCompleted = true; navigate('#progress');
      },
    });
  } else disposeDemo = mountDemo(view);
  const title = view.querySelector('h1')?.textContent || 'Rider Fit';
  document.title = `${title} | Rider Fit — romitagl.com`;
  if (focus) {
    const heading = view.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    view.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  storageNote();
}

function navigate(hash) {
  if (location.hash === hash) render({ focus: true });
  else location.hash = hash;
}

root.addEventListener('submit', event => {
  const form = event.target.closest('[data-start-form]');
  if (!form) return;
  event.preventDefault();
  const input = form.elements.rounds;
  if (!validRounds(input.value)) { input.reportValidity(); return; }
  stopTimer();
  const rounds = Number(input.value);
  active = createSession(form.dataset.circuit, rounds);
  update({ rounds: { ...store.state.rounds, [form.dataset.circuit]: rounds }, activeSession: active });
  navigate('#session');
});

root.addEventListener('input', event => {
  if (event.target.id !== 'fit-rounds') return;
  const input = event.target;
  if (!validRounds(input.value)) return;
  const id = input.closest('form').dataset.circuit;
  update({ rounds: { ...store.state.rounds, [id]: Number(input.value) } });
  root.querySelector('[data-session-total]').textContent = `${Number(input.value) * circuitById[id].exercises.length} exercise sets in total`;
});

root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-next') && active) {
    stopTimer();
    active = advanceSession(active);
    if (active.phase === 'complete') {
      const record = completionRecord(active);
      update({ records: [record, ...store.state.records.filter(item => item.id !== record.id)].slice(0, 200), activeSession: null });
      active = null;
      justCompleted = true;
      navigate('#progress');
    } else { persistSession(); render({ focus: true }); }
  } else if (button.hasAttribute('data-timer-toggle')) {
    if (timerInterval) { stopTimer(); persistSession(); timerDisplay(); }
    else startTimer();
  } else if (button.hasAttribute('data-timer-reset') && active) {
    stopTimer();
    active.remaining = active.phase === 'warmup' ? WARMUP_SECONDS : active.phase === 'cooldown' ? COOLDOWN_SECONDS : active.phase === 'rest' ? (sessionPosition(active).circuit.restSeconds ?? REST_SECONDS) : sessionPosition(active).exercise.seconds;
    persistSession();
    timerDisplay();
  } else if (button.hasAttribute('data-clear')) { deletePending = true; render(); root.querySelector('[data-confirm-clear]')?.focus(); }
  else if (button.hasAttribute('data-confirm-clear')) { update({ records: [] }); deletePending = false; render(); }
  else if (button.hasAttribute('data-cancel-clear')) { deletePending = false; render(); root.querySelector('[data-clear]')?.focus(); }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopTimer(); if (active) persistSession(); timerDisplay(); }
});
window.addEventListener('pagehide', () => { stopTimer(); if (active) persistSession(); disposeDemo(); disposeActivity(); disposeActivity = () => {}; });
window.addEventListener('pageshow', event => { if (event.persisted) render(); });
window.addEventListener('hashchange', () => render({ focus: true }));
document.querySelector('.fitness-skip').addEventListener('click', event => {
  event.preventDefault(); view.setAttribute('tabindex', '-1'); view.focus();
});
render();
