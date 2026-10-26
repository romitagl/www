import test from 'node:test';
import assert from 'node:assert/strict';
import { circuits, exercises } from '../../assets/js/fitness/catalog.mjs';
import { advanceSession, completionRecord, createSession, isValidSession, sessionPosition, validRounds } from '../../assets/js/fitness/session.mjs';
import { createStore, sanitizeState } from '../../assets/js/fitness/storage.mjs';
import { escapeHtml, circuitView, sessionView } from '../../assets/js/fitness/views.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

for (const circuit of circuits.filter(circuit => circuit.mode !== 'amrap')) {
  for (const rounds of [1, 3, 10]) {
    test(`${circuit.id}: ${rounds} rounds complete exactly the selected number of sets`, () => {
      let session = createSession(circuit.id, rounds, 1000);
      assert.equal(session.phase, 'warmup');
      session = advanceSession(session);
      let exercisesCompleted = 0;
      let breaks = 0;
      while (session.phase !== 'cooldown') {
        assert.ok(isValidSession(session));
        if (session.phase === 'exercise') {
          assert.ok(sessionPosition(session).exercise);
          assert.ok(sessionPosition(session).round <= rounds);
          exercisesCompleted++;
        } else if (session.phase === 'rest') breaks++;
        session = advanceSession(session);
      }
      assert.equal(exercisesCompleted, rounds * circuit.exercises.length);
      assert.equal(breaks, rounds - 1);
      assert.throws(() => completionRecord(session));
      session = advanceSession(session);
      assert.equal(session.phase, 'complete');
      assert.ok(isValidSession(session));
      assert.equal(completionRecord(session, 61000).rounds, rounds);
    });
  }
}

test('round boundaries reject blanks, fractions, negative and excessive input', () => {
  for (const value of ['', ' ', true, false, [1], {}, 0, -1, 1.5, 11, Infinity, NaN, 'three']) {
    assert.equal(validRounds(value), false);
    assert.throws(() => createSession('foundation', value));
  }
  assert.equal(validRounds('4'), true);
  assert.throws(() => createSession('missing', 2));
});

test('hostile storage keys and impossible timers cannot become active sessions', () => {
  const session = createSession('foundation', 2, 1000);
  for (const circuitId of ['__proto__', 'constructor', 'toString', ['foundation']]) {
    assert.equal(isValidSession({ ...session, circuitId }), false);
    const state = sanitizeState({ version: 1, activeSession: { ...session, circuitId }, records: [{
      id: 'fitness-1', circuitId, rounds: 1, completedAt: 1000, durationSeconds: 1,
    }] });
    assert.equal(state.activeSession, null);
    assert.deepEqual(state.records, []);
  }
  const exercise = advanceSession(session);
  assert.equal(isValidSession({ ...exercise, remaining: 300 }), false);
  assert.equal(isValidSession({ ...session, startedAt: 9e15 }), false);
  const restored = sanitizeState({ version: 1, activeSession: { ...session, rounds: '2', extra: '<script>', running: true } }).activeSession;
  assert.equal(restored.rounds, 2);
  assert.equal(restored.running, false);
  assert.equal(restored.extra, undefined);
});

test('stored state rejects unknown exercises, impossible phases and malicious values', () => {
  const valid = createSession('foundation', 3, 1000);
  const state = sanitizeState({ version: 1, rounds: { foundation: 9, endurance: -1 }, records: [{ id: '<script>' }], activeSession: { ...valid, running: true } });
  assert.equal(state.activeSession.running, false);
  assert.equal(state.rounds.foundation, 9);
  assert.equal(state.rounds.endurance, undefined);
  assert.deepEqual(state.records, []);
  assert.equal(isValidSession({ ...valid, completedSteps: 99 }), false);
  assert.equal(isValidSession({ ...valid, phase: 'rest', completedSteps: 0 }), false);
  assert.equal(sanitizeState({ version: 99, activeSession: valid }).activeSession, null);
});

test('storage denial and corrupt JSON do not prevent training', () => {
  const blocked = createStore(() => { throw new Error('blocked'); });
  assert.equal(blocked.persistent, false);
  blocked.update({ activeSession: createSession('foundation', 2, 1000) });
  assert.equal(blocked.state.activeSession.rounds, 2);
  const corrupt = createStore(() => ({ getItem: () => '{broken', setItem() {} }));
  assert.deepEqual(corrupt.state.records, []);
});

test('saved round choice controls the form, set total and session view', () => {
  const html = circuitView(circuits[0], { rounds: { foundation: 5 }, activeSession: null });
  assert.match(html, /value="5"/);
  assert.match(html, /30 exercise sets in total/);
  const session = advanceSession(createSession('foundation', 5));
  assert.match(sessionView(session), /Round 1 of 5/);
  assert.equal(escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
});

test('all exercise images are local, nonempty, and referenced by the library', () => {
  const ids = new Set();
  for (const exercise of exercises) {
    assert.ok(!ids.has(exercise.id)); ids.add(exercise.id);
    const path = fileURLToPath(new URL(`../../${exercise.image}`, import.meta.url));
    assert.ok(existsSync(path), path);
    assert.ok(readFileSync(path).length > 10000);
    assert.ok([2, 4].includes(exercise.frames.length));
    assert.equal((exercise.columns || 2) * (exercise.rows || 1), exercise.frames.length);
    assert.ok(exercise.imageWidth > 0 && exercise.imageHeight > 0);
  }
  for (const circuit of circuits) for (const id of circuit.exercises) assert.ok(ids.has(id));
});
