import { TOTAL_LOOPS } from '../config/storyData.js';

export function createHudCache() {
  return {
    loop: -1,
    fearPct: -1,
    fearBg: '',
    vignetteOp: '',
    matchCount: -1,
    matchBarW: '',
    interactActive: false,
    interactText: '',
    dangerOp: '',
    anomalyStr: ''
  };
}

export function updateHUD(state, hudCache, els) {
  if (hudCache.loop !== state.loop) {
    hudCache.loop = state.loop;
    els.loopLabel.textContent = state.loop >= 3
      ? `Vòng ${state.loop}/${TOTAL_LOOPS} · 14/11 · 02:14`
      : `Vòng ${state.loop}/${TOTAL_LOOPS} · 02:14`;
  }
  const f = Math.round(state.fear);
  if (hudCache.fearPct !== f) {
    hudCache.fearPct = f;
    els.fearPct.textContent = `${f}%`;
    els.fearBar.style.width = `${f}%`;
    const bg = f > 70 ? '#d44d42' : f > 40 ? '#e89b4c' : '#7eb0ad';
    if (hudCache.fearBg !== bg) {
      hudCache.fearBg = bg;
      els.fearBar.style.background = bg;
    }
    const vigOp = (0.55 + (f / 100) * 0.42).toFixed(2);
    if (hudCache.vignetteOp !== vigOp) {
      hudCache.vignetteOp = vigOp;
      els.fearVignette.style.opacity = vigOp;
    }
  }
  if (hudCache.matchCount !== state.matchesLeft) {
    hudCache.matchCount = state.matchesLeft;
    els.matchCountEl.textContent = String(state.matchesLeft);
  }
  const mbW = `${Math.round((state.matchTimer / state.matchMax) * 100)}%`;
  if (hudCache.matchBarW !== mbW) {
    hudCache.matchBarW = mbW;
    els.matchBar.style.width = mbW;
  }
  const aStr = `Dấu vết: ${Math.min(state.anomaliesFound, state.anomaliesRequired)}/${state.anomaliesRequired}`;
  if (hudCache.anomalyStr !== aStr) {
    hudCache.anomalyStr = aStr;
    els.anomalyLabel.textContent = aStr;
    els.anomalyPill.classList.toggle('done', state.anomaliesFound >= state.anomaliesRequired);
  }
}

export function clearInteractUI(hudCache, els) {
  if (hudCache.interactActive) {
    hudCache.interactActive = false;
    hudCache.interactText = '';
    els.crosshair.classList.remove('active');
    els.interactPrompt.classList.remove('visible');
  }
}
