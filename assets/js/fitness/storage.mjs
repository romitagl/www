import { circuitById } from './catalog.mjs';
import { isValidSession, validRounds } from './session.mjs';
import { validAmrap, amrapPosition, AMRAP_LIMIT } from './amrap-core.mjs';

const KEY = 'romitagl.fitness.v1';
const fresh = () => ({ version: 1, rounds: {}, records: [], activeSession: null, amrapSession: null });

function validRecord(record) {
  if (!record || typeof record.id !== 'string' || !/^fitness-\d+$/.test(record.id) || typeof record.circuitId !== 'string' || !circuitById[record.circuitId]
    || !Number.isFinite(record.completedAt) || record.completedAt <= 0 || record.completedAt > 8.64e15
    || !Number.isInteger(record.durationSeconds) || record.durationSeconds < 0) return false;
  if (record.mode === 'amrap') {
    return record.circuitId === 'pdf-c' && Number.isInteger(record.completedSteps) && record.completedSteps >= 0 && record.completedSteps <= 10000
      && record.rounds === amrapPosition(record).rounds && Number.isInteger(record.partialReps) && record.partialReps >= 0
      && record.partialReps < amrapPosition(record).station.reps && Number.isInteger(record.workSeconds) && record.workSeconds >= 0 && record.workSeconds <= AMRAP_LIMIT;
  }
  return circuitById[record.circuitId].mode !== 'amrap' && validRounds(record.rounds);
}

export function sanitizeState(input) {
  const result = fresh();
  if (!input || input.version !== 1) return result;
  for (const id of Object.keys(circuitById)) {
    if (validRounds(input.rounds?.[id])) result.rounds[id] = Number(input.rounds[id]);
  }
  const seen = new Set();
  result.records = (Array.isArray(input.records) ? input.records : []).filter(record => {
    if (!validRecord(record) || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  }).slice(0, 200).map(({ id, circuitId, rounds, completedAt, durationSeconds, mode, completedSteps, partialReps, workSeconds }) => ({ id, circuitId, rounds: Number(rounds), completedAt, durationSeconds, ...(mode === 'amrap' ? { mode, completedSteps, partialReps, workSeconds } : {}) }));
  if (isValidSession(input.activeSession) && input.activeSession.phase !== 'complete') {
    const { id, circuitId, rounds, completedSteps, phase, startedAt, remaining } = input.activeSession;
    result.activeSession = { id, circuitId, rounds: Number(rounds), completedSteps, phase, startedAt, remaining, running: false };
  }
  if (validAmrap(input.amrapSession)) {
    const { id, phase, startedAt, remaining, completedSteps } = input.amrapSession;
    result.amrapSession = { id, phase, startedAt, remaining, completedSteps, running: false };
  }
  return result;
}

/** Storage is optional. Restricted/private browsers retain a working in-memory session. */
export function createStore(storageProvider = () => window.localStorage) {
  let state = fresh();
  let persistent = true;
  try {
    const storage = storageProvider();
    const raw = storage.getItem(KEY);
    if (raw) {
      try { state = sanitizeState(JSON.parse(raw)); }
      catch { state = fresh(); }
    }
    storage.setItem(KEY, JSON.stringify(state));
  } catch { persistent = false; }
  return {
    get state() { return state; },
    get persistent() { return persistent; },
    update(patch) {
      state = { ...state, ...patch };
      try { storageProvider().setItem(KEY, JSON.stringify(state)); }
      catch { persistent = false; }
      return state;
    },
  };
}
