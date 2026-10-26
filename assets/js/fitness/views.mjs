import { circuits, exercises, circuitById, exerciseById, circuitHash, resolveCircuitId } from './catalog.mjs';
import { MAX_ROUNDS, MIN_ROUNDS, formatTime, sessionPosition } from './session.mjs';
import { amrapScore } from './amrap-core.mjs';
import { demoVideos, approvedDemoVideo } from './demo-videos.mjs';
import { demoModels, approvedDemoModel } from './demo-models.mjs';

// Every interpolation passes through this helper, including browser-stored values.
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const e = escapeHtml;
const link = (href, text, primary = false) => `<a class="fit-button${primary ? ' fit-primary' : ''}" href="${e(href)}">${e(text)}</a>`;
const roundCount = (store, circuit) => store.rounds[circuit.id] ?? circuit.defaultRounds;

export function demo(exercise) {
  const model = approvedDemoModel(demoModels[exercise.id]);
  const video = model ? null : approvedDemoVideo(demoVideos[exercise.id]);
  const columns = exercise.columns || 2;
  const rows = exercise.rows || 1;
  const steps = exercise.steps || exercise.frames.map((title, frame) => ({ title, frame }));
  const picture = index => `<div class="fit-demo-stage fit-step-image" style="--pose-columns:${columns};--pose-rows:${rows};--pose-x:${-(index % columns) * 100 / columns}%;--pose-y:${-Math.floor(index / columns) * 100 / rows}%;aspect-ratio:${exercise.imageWidth / columns}/${exercise.imageHeight / rows}"><img src="${e(exercise.image)}" width="${exercise.imageWidth}" height="${exercise.imageHeight}" alt="${e(exercise.frames[index])}" decoding="async"></div>`;
  return `<figure class="fit-demo" data-demo>
    ${model ? `<div class="fit-model-shell"><p class="fit-eyebrow">3D movement demo · drag to rotate</p><div class="fit-model-canvas" data-demo-model data-model-src="${e(model.src)}" role="img" aria-label="${e(exercise.name)} 3D demo. Drag or use left and right arrow keys to rotate." tabindex="0"></div><div class="fit-model-controls"><button type="button" data-model-play disabled>Loading animation…</button><label>Speed <select data-model-speed aria-label="3D animation speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option></select></label><button type="button" data-model-reset>Reset view</button></div></div><p class="fit-small fit-muted">${e(model.publisher)} · <a href="${e(model.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a> · <a href="${e(model.license.url)}" target="_blank" rel="noopener noreferrer">CC0</a></p><details class="fit-picture-guide"><summary>Picture guide & numbered steps</summary>` : ''}
    ${video ? `<div class="fit-video-shell"><video data-demo-video controls loop muted playsinline preload="none" aria-label="${e(exercise.name)} demonstration"><source src="${e(video.src)}" type="video/mp4">Your browser cannot play this demo.</video></div><div class="fit-video-source fit-small"><label>Demo speed <select data-video-speed aria-label="Demo playback speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option></select></label><span>Demo by ${e(video.publisher)} · <a href="${e(video.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a> · <a href="${e(video.license.url)}" target="_blank" rel="noopener noreferrer">${e(video.license.id)}</a></span></div>${video.note ? `<p class="fit-small fit-muted">${e(video.note)}</p>` : ''}<details class="fit-picture-guide"><summary>Picture guide & numbered steps</summary>` : ''}
    <ol class="fit-step-board" aria-label="${e(exercise.name)} illustrated steps">${steps.map((step, index) => `<li>${picture(step.frame)}<div class="fit-step-copy"><strong>${index + 1}. ${e(step.title)}</strong>${step.text ? `<p>${e(step.text)}</p>` : ''}</div></li>`).join('')}</ol>
    <p class="fit-small fit-muted">Illustrated positions · AI-generated images</p>
    ${video || model ? '</details>' : ''}
    <p class="fit-media-error" data-media-error role="status" hidden>The demo could not load. Use the written technique cues.</p>
    ${exercise.mediaMode === 'hold' ? '<p class="fit-hold-note"><strong>Hold still.</strong> The pictures show setup or the two sides, not a repeated lifting movement.</p>' : ''}
    ${exercise.sides ? '<p class="fit-small fit-muted">Complete both sides as prescribed.</p>' : ''}
  </figure>`;
}

function exerciseDetails(exercise) {
  return `<div class="fit-exercise-copy"><p class="fit-eyebrow">${e(exercise.type)}</p><h1>${e(exercise.name)}</h1><p class="fit-muted">${e(exercise.muscles)}</p><dl class="fit-instructions">
    <div><dt>Target</dt><dd>${e(exercise.dose)} · ${e(exercise.equipment)}</dd></div>
    ${exercise.repGuide ? `<div class="fit-count-guide"><dt>${exercise.mediaMode === 'hold' ? 'How to count the hold' : 'What counts as one repetition?'}</dt><dd>${e(exercise.repGuide)}</dd></div>` : ''}
    ${exercise.countNote ? `<div><dt>Counting guide</dt><dd>${e(exercise.countNote)}</dd></div>` : ''}
    <div><dt>Technique cues</dt><dd>${e(exercise.cue)}</dd></div>
    <div><dt>Watch for</dt><dd>${e(exercise.mistake)}</dd></div>
    <div><dt>Make it easier</dt><dd>${e(exercise.easy)}</dd></div>
    <div><dt>Progression</dt><dd>${e(exercise.hard)}</dd></div>
  </dl></div>`;
}

export function circuitsView(state) {
  return `${state.activeSession ? `<aside class="fit-resume"><div><strong>You have an unfinished session.</strong><p class="fit-muted">${e(circuitById[state.activeSession.circuitId].name)} · ${state.activeSession.rounds} rounds</p></div>${link('#session', 'Resume session', true)}</aside>` : ''}
    ${state.amrapSession && state.amrapSession.phase !== 'ready' ? `<aside class="fit-resume"><strong>Unfinished 20-minute AMRAP</strong>${link('#amrap', 'Resume AMRAP tracker')}</aside>` : ''}
    <section class="fit-hero"><div><p class="fit-eyebrow">Off the bike. Ready for the ride.</p><h1>Your living room.<br>Your training ground.</h1><p>Full-body circuits inspired by rider preparation. Learn the movements, choose your rounds, and build a routine that fits your day.</p>${link('#circuit/foundation', 'Explore a circuit →', true)}</div><div class="fit-hero-image"><img src="assets/images/fitness/squat.jpg" width="1536" height="1024" alt="Realistic generated instructor showing standing and lowered squat positions" fetchpriority="high"><span>Strength · stability · endurance</span></div></section>
    <div class="fit-section-heading"><h2>Choose your workout</h2><p class="fit-muted">Strength, conditioning or a timed challenge.</p></div>
    <div class="fit-circuit-grid">${circuits.map(circuit => `<article class="fit-card"><span class="fit-letter">${circuit.letter}</span><p class="fit-eyebrow">${e(circuit.mode === 'amrap' ? 'Timed challenge' : circuit.eyebrow)}</p><h3>${e(circuit.name)}</h3><p class="fit-muted">${e(circuit.description)}</p><p class="fit-meta">${circuit.exercises.length} exercises · ${circuit.mode === 'amrap' ? '20-minute time limit' : roundCount(state, circuit) + (roundCount(state, circuit) === 1 ? ' round selected' : ' rounds selected')}</p><p class="fit-small fit-muted">${e(circuit.equipment)}</p>${link(circuitHash(circuit), circuit.mode === 'amrap' ? 'View timed workout ↗' : 'Choose rounds & view circuit ↗')}</article>`).join('')}</div>
    <section class="fit-how"><h2>A simple training rhythm</h2><ol><li><strong>Prepare.</strong> Warm up with easy marching and comfortable joint movements.</li><li><strong>Move with control.</strong> Use easier variations and rest whenever needed.</li><li><strong>Build gradually.</strong> Add a round or adjust repetitions when your current session feels manageable.</li></ol></section>`;
}

export function circuitView(circuit, state) {
  const rounds = roundCount(state, circuit);
  if (circuit.mode === 'amrap') return `${link('#circuits', '← All workouts')}<section class="fit-intro"><p class="fit-eyebrow">Timed challenge / full body</p><h1>20-minute AMRAP</h1><p>Repeat the six exercises below for 20 minutes. Record complete rounds plus any extra repetitions.</p><p class="fit-muted">${e(circuit.equipment)}</p></section>${link('#amrap', 'Open 20-minute tracker →', true)}${stationList(circuit)}<p class="fit-muted">Example score: 5 rounds + 8 push-ups + 10 squats. The tracker records complete exercises and the partial repetitions of the next exercise.</p>`;
  return `${link('#circuits', '← All circuits')}<section class="fit-intro"><p class="fit-eyebrow">Circuit ${circuit.letter}</p><h1>${e(circuit.name)}</h1><p>${e(circuit.description)}</p><p class="fit-muted">${e(circuit.equipment)}</p></section>
    ${circuit.source === 'pdf' ? '<p class="fit-source-note"><strong>Suggested session:</strong> 3–4 rounds, no planned pauses between exercises, and 4 minutes of recovery between rounds. You may choose fewer rounds and take extra rest when needed.</p>' : ''}
    <form class="fit-session-options" data-start-form data-circuit="${circuit.id}"><div><label for="fit-rounds">How many rounds?</label><div class="fit-round-input"><input id="fit-rounds" name="rounds" type="number" min="${MIN_ROUNDS}" max="${MAX_ROUNDS}" step="1" value="${rounds}" required inputmode="numeric" aria-describedby="fit-round-help"><span>rounds</span></div><p id="fit-round-help" class="fit-small fit-muted">${circuit.source === 'pdf' ? 'Suggested: 3–4 rounds. Choose 1–10 to adapt the volume.' : 'Choose 1–10. Start with what you can complete with good technique.'}</p></div><div><p class="fit-session-total" data-session-total>${rounds * circuit.exercises.length} exercise sets in total</p><button class="fit-primary" type="submit">${state.activeSession ? 'Start a new session' : 'Start guided session'} →</button>${state.activeSession ? '<p class="fit-small fit-muted">Your unfinished session will be replaced.</p>' : ''}</div></form>
    <h2>In this circuit</h2>${stationList(circuit)}
    <div class="fit-preparation"><h2>Before, during & after</h2><p><strong>Warm up:</strong> about 5 minutes of easy movement. <strong>Recover:</strong> ${circuit.source === 'pdf' ? 'allow 4 minutes between rounds; take extra rest as needed.' : 'rest as needed between exercises; allow 60–90 seconds or longer between rounds.'} <strong>Cool down:</strong> 3 minutes of easy movement.</p><p class="fit-muted">Timers are optional. They never advance you automatically; technique comes first.</p></div>`;
}

export function stationList(circuit) {
  return `<ol class="fit-exercise-list">${circuit.exercises.map((id, index) => { const station = circuit.stations?.[index]; const exercise = exerciseById[id]; return `<li><a href="#exercise/${id}?from=${circuit.slug || circuit.id}"><span><strong>${e(exercise.name)}</strong><span class="fit-small fit-muted">${e(station?.countNote || exercise.type)}</span></span><span class="fit-dose">${e(station?.dose || exercise.dose)} <span aria-hidden="true">↗</span></span></a></li>`; }).join('')}</ol>`;
}

export function libraryView() {
  return `<section class="fit-intro"><p class="fit-eyebrow">The movement manual</p><h1>Exercise wiki</h1><p>${exercises.length} exercises for strength, stability and conditioning. Open a card for a movement demo, technique cues and variations.</p></section><div class="fit-library-grid">${exercises.map(exercise => `<a class="fit-exercise-card" href="#exercise/${exercise.id}"><div class="fit-thumbnail"><img src="${e(exercise.image)}" width="${exercise.imageWidth}" height="${exercise.imageHeight}" alt="${e(exercise.alt)}" loading="lazy" decoding="async"></div><div><span class="fit-eyebrow">${e(exercise.type)}</span><h2>${e(exercise.name)}</h2><p class="fit-small fit-muted">${e(exercise.equipment)}</p></div></a>`).join('')}</div>`;
}

export function exerciseView(exercise, from) {
  from = resolveCircuitId(from);
  const station = circuitById[from]?.stations?.find(item => item.exerciseId === exercise.id);
  const shown = station ? { ...exercise, ...station } : exercise;
  return `${link(from && circuitById[from] ? circuitHash(circuitById[from]) : '#library', from && circuitById[from] ? '← Back to circuit' : '← Exercise wiki')}<div class="fit-exercise-detail">${demo(shown)}${exerciseDetails(shown)}</div>`;
}

function timerMarkup(seconds, running, label = 'Optional timer') {
  return `<div class="fit-timer"><span class="fit-small fit-muted">${e(label)}</span><output data-timer aria-label="Time remaining">${formatTime(seconds)}</output><div><button type="button" data-timer-toggle${seconds === 0 ? ' disabled' : ''}>${running ? 'Pause timer' : 'Start timer'}</button><button type="button" data-timer-reset>Reset timer</button></div><p class="fit-small fit-muted" data-timer-hint>${seconds === 0 ? 'Continue whenever you are ready.' : 'A guide, not a race. Continue when ready.'}</p><span class="fit-sr" role="status" data-timer-status></span></div>`;
}

export function sessionView(session) {
  if (!session) return `<section class="fit-intro"><h1>No session in progress.</h1><p>Choose a circuit and your number of rounds to get started.</p>${link('#circuits', 'Choose a circuit', true)}</section>`;
  const position = sessionPosition(session);
  const percent = Math.round(session.completedSteps / position.total * 100);
  let content = '';
  if (session.phase === 'exercise') {
    content = `<div class="fit-session-heading"><p class="fit-eyebrow">Round ${position.round} of ${session.rounds}</p><span class="fit-muted">Exercise ${position.index + 1} / ${position.circuit.exercises.length}</span></div><div class="fit-exercise-detail">${demo(position.exercise)}${exerciseDetails(position.exercise)}</div>${position.exercise.seconds ? timerMarkup(session.remaining, session.running, position.exercise.sides ? 'Total hold time · change sides halfway' : 'Optional exercise timer') : ''}${position.exercise.sides ? '<p class="fit-side-reminder">Complete both sides before moving to the next exercise.</p>' : ''}<button type="button" class="fit-primary" data-next>Exercise complete →</button><p class="fit-small fit-muted">Rest as needed before moving on. Watch the demo and use the technique cues at your own pace.</p>`;
  } else {
    const copy = session.phase === 'warmup' ? ['Prepare to move.', 'Warm up with easy marching, shoulder circles and gentle hip movements. Work through a comfortable range.', 'Warm-up done — start round 1 →'] : session.phase === 'rest' ? ['Take a breather.', position.circuit.source === 'pdf' ? 'Allow 4 minutes between rounds. Extend recovery when needed.' : 'Allow 60–90 seconds or longer between rounds. Continue when breathing and technique feel ready.', `Ready for round ${position.round} →`] : ['Bring the pace down.', 'Walk or march gently and let your breathing settle. Add comfortable, gentle mobility if you like.', 'Finish & save session'];
    content = `<section class="fit-phase"><p class="fit-eyebrow">${session.phase === 'warmup' ? 'Warm-up' : session.phase === 'rest' ? 'Between rounds' : 'Cooldown'}</p><h1>${copy[0]}</h1><p>${copy[1]}</p>${timerMarkup(session.remaining, session.running)}<button type="button" class="fit-primary" data-next>${copy[2]}</button></section>`;
  }
  return `<div class="fit-section-heading">${link('#circuits', '← Leave session & keep progress')}<span class="fit-muted">${e(position.circuit.name)} · ${session.rounds} rounds</span></div><div class="fit-progress-track" role="progressbar" aria-label="Exercise sets completed" aria-valuemin="0" aria-valuemax="${position.total}" aria-valuenow="${session.completedSteps}"><span style="width:${percent}%"></span></div><p class="fit-small fit-muted">${session.completedSteps} of ${position.total} exercise sets complete</p>${content}`;
}

export function progressView(state, completed = false, deletePending = false) {
  const records = state.records;
  return `<section class="fit-intro"><p class="fit-eyebrow">Your training journal</p><h1>${completed ? 'Session complete.' : 'My progress'}</h1><p>${completed ? 'Your completed session has been added to your journal.' : 'Completed sessions, kept on this device.'}</p><p class="fit-small fit-muted">Stored only in this browser. Clearing browser data removes this journal. No account or cloud sync.</p></section>${records.length ? `<p class="fit-meta">${records.length} completed session${records.length === 1 ? '' : 's'} · ${records.reduce((sum, record) => sum + record.rounds, 0)} rounds</p><ul class="fit-history">${records.map(record => `<li><div><h2>${e(circuitById[record.circuitId].name)}</h2><p class="fit-muted">${record.mode === 'amrap' ? e(amrapScore(record)) + ' · ' + formatTime(record.workSeconds) + ' / 20:00 worked' : record.rounds + ' round' + (record.rounds === 1 ? '' : 's') + ' · ' + Math.floor(record.durationSeconds / 60) + ' min elapsed, including breaks'}</p></div><time datetime="${new Date(record.completedAt).toISOString()}">${e(new Date(record.completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }))}</time></li>`).join('')}</ul>${deletePending ? '<div class="fit-delete-confirm" role="group" aria-label="Confirm journal deletion"><p>Delete all completed sessions from this browser?</p><button type="button" data-confirm-clear>Yes, delete my journal</button><button type="button" data-cancel-clear>Keep my journal</button></div>' : '<button type="button" data-clear>Clear journal</button>'}` : '<div class="fit-empty"><h2>A clean starting line.</h2><p class="fit-muted">Complete a guided circuit to add your first session. No demonstration data is counted as training.</p></div>'}<div class="fit-actions">${link('#circuits', 'Explore circuits', true)}${state.activeSession ? link('#session', 'Resume unfinished session') : ''}</div>`;
}
