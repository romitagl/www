import test from 'node:test';
import assert from 'node:assert/strict';
import { circuits, circuitById, exerciseById, circuitHash, resolveCircuitId } from '../../assets/js/fitness/catalog.mjs';
import { createSession, advanceSession, sessionPosition } from '../../assets/js/fitness/session.mjs';
import { createAmrap, advanceAmrap, amrapRecord, amrapScore, validAmrap, AMRAP_LIMIT } from '../../assets/js/fitness/amrap-core.mjs';
import { sanitizeState } from '../../assets/js/fitness/storage.mjs';
import { demo, circuitsView, circuitView, exerciseView, libraryView } from '../../assets/js/fitness/views.mjs';

test('PDF A and B preserve source order, repetitions, timed holds and recovery', () => {
  assert.deepEqual(circuitById['pdf-a'].stations.map(item => item.dose), ['12 reps', '8 reps', '12 reps', '6 reps', '30 seconds', '10 reps', '20 seconds', '15 seconds']);
  assert.deepEqual(circuitById['pdf-b'].stations.map(item => item.dose), ['8 reps', '20 reps', '20 reps', '30 seconds', '12 reps', '12 reps', '30 seconds per leg', '6 × 4 m', '30 seconds per side', '20 reps']);
  for (const id of ['pdf-a', 'pdf-b']) {
    let state = advanceSession(createSession(id, 3));
    assert.equal(sessionPosition(state).exercise.dose, circuitById[id].stations[0].dose);
    for (let i = 0; i < circuitById[id].exercises.length; i++) state = advanceSession(state);
    assert.equal(state.phase, 'rest'); assert.equal(state.remaining, 240);
    state = advanceSession(state);
    assert.equal(sessionPosition(state).round, 2);
  }
  const station = { ...advanceSession(createSession('pdf-b', 3)), completedSteps: 8 };
  assert.equal(sessionPosition(station).exercise.seconds, 60);
  assert.equal(sessionPosition(station).exercise.dose, '30 seconds per side');
});

test('PDF Circuit C is timed, not forced to a selected number of rounds', () => {
  const html = circuitView(circuitById['pdf-c'], { rounds: {}, activeSession: null });
  assert.match(html, /20-minute AMRAP/); assert.doesNotMatch(html, /id="fit-rounds"/);
  assert.equal(circuitById['pdf-c'].timeLimit, 1200);
  assert.deepEqual(circuitById['pdf-c'].stations.map(item => item.reps), [8, 20, 10, 12, 8, 8]);
  assert.throws(() => createSession('pdf-c', 2));
});

test('AMRAP records the exact PDF sample score and survives persistence', () => {
  let state = { ...createAmrap(1000), phase: 'work' };
  for (let i = 0; i < 31; i++) state = advanceAmrap(state);
  state = { ...state, phase: 'score', remaining: 0 };
  const record = amrapRecord(state, 10, 1201000);
  assert.equal(record.rounds, 5);
  assert.equal(record.workSeconds, 1200);
  assert.equal(amrapScore(record), '5 full rounds + 8 reps push-up + 10 bodyweight squat');
  const saved = sanitizeState({ version: 1, rounds: {}, records: [record], amrapSession: { ...state, running: true } });
  assert.deepEqual(saved.records[0], record);
  assert.equal(saved.amrapSession.running, false);
});

test('AMRAP supports a partial first round, rejects impossible partial counts and stops at zero', () => {
  const state = { ...createAmrap(1000), phase: 'score', remaining: AMRAP_LIMIT - 45 };
  const record = amrapRecord(state, 7, 46000);
  assert.equal(record.rounds, 0); assert.equal(record.workSeconds, 45);
  assert.equal(sanitizeState({ version: 1, records: [record] }).records.length, 1);
  assert.throws(() => amrapRecord(state, 8)); assert.throws(() => amrapRecord(state, -1));
  const expired = { ...state, phase: 'work', remaining: 0 };
  assert.equal(advanceAmrap(expired).completedSteps, 0);
  assert.equal(validAmrap({ ...state, remaining: -1 }), false);
});

test('four unclear exercises have explicit instructions; suitcase guide preserves hold guidance', () => {
  for (const id of ['suitcase-hold', 'reverse-lunge', 'bird-dog', 'step-jacks']) {
    assert.ok(exerciseById[id].steps.length >= 2);
    assert.ok(exerciseById[id].repGuide);
    assert.match(exerciseView(exerciseById[id]), id === 'suitcase-hold' ? /How to count the hold/ : /What counts as one repetition/);
  }
  assert.doesNotMatch(demo(exerciseById['suitcase-hold']), /<iframe/);
  assert.match(demo(exerciseById['suitcase-hold']), /Hold still/);
  assert.match(exerciseView(exerciseById['step-jacks']), /Step; do not jump/);
  assert.match(exerciseView(exerciseById['bird-dog']), /right arm forward and left leg backward/);
});

test('all six workouts are ordinary public options without PDF or ball references', () => {
  const state = { rounds: {}, records: [], activeSession: null };
  const html = circuitsView(state);
  for (const circuit of circuits) {
    assert.ok(html.includes(circuitHash(circuit)));
    assert.equal(resolveCircuitId(circuit.slug || circuit.id), circuit.id);
    assert.doesNotMatch(circuitView(circuit, state).replace(/<[^>]+>/g, ''), /PDF|supplied|source|original plan|exercise.ball/i);
  }
  assert.doesNotMatch(html, /PDF|#stability|#pdf-plan/);
  assert.doesNotMatch(libraryView(), /PDF|exercise.ball/i);
  assert.equal(resolveCircuitId(undefined), undefined);
  assert.match(exerciseView(exerciseById['bird-dog']), /← Exercise wiki/);
});
