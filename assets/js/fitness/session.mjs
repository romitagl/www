import { circuitById, exerciseById } from './catalog.mjs';

export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 10;
export const WARMUP_SECONDS = 300;
export const REST_SECONDS = 90;
export const COOLDOWN_SECONDS = 180;

export function validRounds(value) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) return false;
  const count = Number(value);
  return Number.isInteger(count) && count >= MIN_ROUNDS && count <= MAX_ROUNDS;
}

export function createSession(circuitId, rounds, now = Date.now()) {
  if (!circuitById[circuitId] || circuitById[circuitId].mode === 'amrap' || !validRounds(rounds)) throw new RangeError('Choose a round-based circuit and 1–10 whole rounds.');
  return {
    id: `fitness-${now}`, circuitId, rounds: Number(rounds), completedSteps: 0,
    phase: 'warmup', startedAt: now, remaining: WARMUP_SECONDS, running: false,
  };
}

export function sessionPosition(session) {
  const circuit = circuitById[session.circuitId];
  const index = session.completedSteps % circuit.exercises.length;
  return {
    circuit, index, round: Math.floor(session.completedSteps / circuit.exercises.length) + 1,
    total: session.rounds * circuit.exercises.length,
    exercise: { ...exerciseById[circuit.exercises[index]], ...circuit.stations?.[index] },
  };
}

/** Explicit advances only: finishing a timer never silently skips an exercise or a side. */
export function advanceSession(session) {
  const next = { ...session, running: false };
  const { circuit, total } = sessionPosition(session);
  if (session.phase === 'warmup' || session.phase === 'rest') {
    next.phase = 'exercise';
    next.remaining = sessionPosition(session).exercise.seconds;
  } else if (session.phase === 'exercise') {
    next.completedSteps++;
    if (next.completedSteps === total) {
      next.phase = 'cooldown';
      next.remaining = COOLDOWN_SECONDS;
    } else if (next.completedSteps % circuit.exercises.length === 0) {
      next.phase = 'rest';
      next.remaining = circuit.restSeconds ?? REST_SECONDS;
    } else {
      next.remaining = sessionPosition(next).exercise.seconds;
    }
  } else if (session.phase === 'cooldown') {
    next.phase = 'complete';
    next.remaining = 0;
  }
  return next;
}

export function isValidSession(value) {
  if (!value || typeof value !== 'object' || typeof value.circuitId !== 'string' || !circuitById[value.circuitId] || !validRounds(value.rounds)) return false;
  if (circuitById[value.circuitId].mode === 'amrap') return false;
  const total = value.rounds * circuitById[value.circuitId].exercises.length;
  if (!Number.isInteger(value.completedSteps) || value.completedSteps < 0 || value.completedSteps > total) return false;
  if (typeof value.id !== 'string' || !/^fitness-\d+$/.test(value.id)) return false;
  if (!Number.isFinite(value.startedAt) || value.startedAt <= 0 || value.startedAt > 8.64e15) return false;
  if (!Number.isInteger(value.remaining) || value.remaining < 0 || value.remaining > WARMUP_SECONDS) return false;
  const phase = value.phase;
  const maximum = phase === 'warmup' ? WARMUP_SECONDS : phase === 'rest' ? (circuitById[value.circuitId].restSeconds ?? REST_SECONDS)
    : phase === 'cooldown' ? COOLDOWN_SECONDS : phase === 'complete' ? 0 : sessionPosition(value).exercise.seconds;
  if (value.remaining > maximum) return false;
  if (phase === 'warmup') return value.completedSteps === 0;
  if (phase === 'exercise') return value.completedSteps < total;
  if (phase === 'rest') return value.completedSteps > 0 && value.completedSteps < total && value.completedSteps % circuitById[value.circuitId].exercises.length === 0;
  return (phase === 'cooldown' || phase === 'complete') && value.completedSteps === total;
}

export function completionRecord(session, now = Date.now()) {
  if (!isValidSession(session) || session.phase !== 'complete') throw new Error('Finish the session before saving.');
  return {
    id: session.id, circuitId: session.circuitId, rounds: session.rounds,
    completedAt: now, durationSeconds: Math.max(0, Math.floor((now - session.startedAt) / 1000)),
  };
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
