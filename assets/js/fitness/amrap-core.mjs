import { circuitById, exerciseById } from './catalog.mjs';

export const AMRAP_LIMIT = 20 * 60;
const plan = circuitById['pdf-c'];

export function createAmrap(now = Date.now()) {
  return { id: `fitness-${now}`, phase: 'ready', startedAt: now, remaining: AMRAP_LIMIT, completedSteps: 0, running: false };
}

export function amrapPosition(state) {
  const index = state.completedSteps % plan.stations.length;
  const station = plan.stations[index];
  return { index, rounds: Math.floor(state.completedSteps / plan.stations.length), station, exercise: { ...exerciseById[station.exerciseId], ...station } };
}

export function validAmrap(state) {
  return Boolean(state && typeof state.id === 'string' && /^fitness-\d+$/.test(state.id) && ['ready', 'work', 'score'].includes(state.phase)
    && Number.isFinite(state.startedAt) && state.startedAt > 0 && state.startedAt <= 8.64e15
    && Number.isInteger(state.remaining) && state.remaining >= 0 && state.remaining <= AMRAP_LIMIT
    && Number.isInteger(state.completedSteps) && state.completedSteps >= 0 && state.completedSteps <= 10000
    && (state.phase !== 'ready' || (state.completedSteps === 0 && state.remaining === AMRAP_LIMIT)));
}

export function advanceAmrap(state) {
  if (!validAmrap(state) || state.phase !== 'work' || state.remaining <= 0) return state;
  return { ...state, completedSteps: Math.min(10000, state.completedSteps + 1) };
}

export function amrapRecord(state, partialReps, now = Date.now()) {
  const partial = Number(partialReps);
  if (!validAmrap(state) || state.phase !== 'score') throw new Error('End the timed work before saving.');
  if (!Number.isInteger(partial) || partial < 0 || partial >= amrapPosition(state).station.reps) throw new RangeError('Enter only unfinished repetitions; mark a full exercise complete first.');
  return {
    id: state.id, circuitId: plan.id, mode: 'amrap', completedAt: now,
    durationSeconds: Math.max(0, Math.floor((now - state.startedAt) / 1000)),
    rounds: amrapPosition(state).rounds, completedSteps: state.completedSteps, partialReps: partial,
    workSeconds: AMRAP_LIMIT - state.remaining,
  };
}

export function amrapScore(record) {
  const position = amrapPosition(record);
  const extra = plan.stations.slice(0, position.index).map(station => `${station.dose} ${exerciseById[station.exerciseId].name.toLowerCase()}`);
  if (record.partialReps) extra.push(`${record.partialReps} ${position.exercise.name.toLowerCase()}`);
  return `${position.rounds} full round${position.rounds === 1 ? '' : 's'}${extra.length ? ' + ' + extra.join(' + ') : ''}`;
}
