import { TOTAL_LOOPS } from '../config/storyData.js';

const SAVE_STORAGE_KEY = 'dem_khong_dut_save_v1';

export function loadSavedRun() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const loop = Number(data.loop);
    if (!Number.isInteger(loop) || loop < 1 || loop > TOTAL_LOOPS) return null;
    const choices = Array.isArray(data.choices) ? data.choices : [];
    const journalNotes = Array.isArray(data.journalNotes) ? data.journalNotes : [];
    // Only offer Continue if player has progressed past Loop 1 or recorded notes/choices
    if (loop === 1 && choices.length === 0 && journalNotes.length === 0) return null;
    return {
      loop,
      matchesLeft: Number.isFinite(Number(data.matchesLeft)) ? Math.max(2, Number(data.matchesLeft)) : 6,
      choices,
      journalNotes,
      courageScore: Number.isFinite(Number(data.courageScore)) ? Number(data.courageScore) : choices.filter((c) => c.kind === 'confront').length,
      denialScore: Number.isFinite(Number(data.denialScore)) ? Number(data.denialScore) : choices.filter((c) => c.kind === 'avoid').length,
      updatedAt: Number(data.updatedAt) || Date.now()
    };
  } catch (_) {
    return null;
  }
}

export function saveRunProgress(state) {
  if (!state || state.ended) return;
  try {
    const payload = {
      version: 1,
      loop: Math.max(1, Math.min(TOTAL_LOOPS, Number(state.loop) || 1)),
      matchesLeft: Math.max(0, Number(state.matchesLeft) || 0),
      choices: Array.isArray(state.choices) ? state.choices : [],
      journalNotes: Array.isArray(state.journalNotes) ? state.journalNotes : [],
      courageScore: Number(state.courageScore) || 0,
      denialScore: Number(state.denialScore) || 0,
      updatedAt: Date.now()
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {
    // Ignore storage quota or private mode restrictions
  }
}

export function clearSavedRun() {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (_) {}
}
