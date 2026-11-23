import { TIMELINE_STEPS } from '../config/storyData.js';

export function renderJournal(state, els) {
  if (els.journalTimeline) {
    els.journalTimeline.replaceChildren();
    TIMELINE_STEPS.forEach((step) => {
      const unlocked = state.loop > step.loop || (state.loop === step.loop && state.loopClueFound);
      const node = document.createElement('div');
      node.className = 'timeline-node' + (unlocked ? ' unlocked' : '');

      const timeEl = document.createElement('div');
      timeEl.className = 'timeline-time';
      timeEl.textContent = `${unlocked ? '✓ ' : ''}${step.time}`;

      const tagEl = document.createElement('div');
      tagEl.className = 'timeline-tag';
      tagEl.textContent = unlocked ? step.short : '???';

      node.append(timeEl, tagEl);
      els.journalTimeline.appendChild(node);
    });
  }

  if (els.journalChoices) {
    els.journalChoices.replaceChildren();
    state.choices.forEach((c) => {
      const span = document.createElement('span');
      span.className = 'choice-chip';
      span.textContent = c.chip;
      els.journalChoices.appendChild(span);
    });
  }

  if (!els.journalList) return;
  els.journalList.replaceChildren();

  if (state.journalNotes.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.textContent = 'Chưa có mảnh ghi chép nào được mở khóa.';
    els.journalList.appendChild(emptyP);
    return;
  }

  state.journalNotes.forEach((n) => {
    const div = document.createElement('div');
    div.className = 'journal-entry';

    const h3 = document.createElement('h3');
    h3.textContent = n.title;

    const p = document.createElement('p');
    p.textContent = n.text;

    div.append(h3, p);
    els.journalList.appendChild(div);
  });
}

export function toggleJournal(state, els, renderJournalFn, clearKeysFn) {
  if (!state.running || state.ended) return;
  if (els.settingsScreen && !els.settingsScreen.classList.contains('hidden')) {
    els.settingsScreen.classList.add('hidden');
  }
  if (els.pauseOverlay && !els.pauseOverlay.classList.contains('hidden')) {
    els.pauseOverlay.classList.add('hidden');
  }
  const opening = els.journalScreen.classList.contains('hidden');
  state.paused = opening;
  if (opening) {
    if (document.pointerLockElement) document.exitPointerLock();
    clearKeysFn();
    renderJournalFn();
    els.journalScreen.classList.remove('hidden');
  } else {
    els.journalScreen.classList.add('hidden');
  }
}
