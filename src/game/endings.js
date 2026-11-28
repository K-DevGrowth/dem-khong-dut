import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';
import { clearSavedRun } from './saveManager.js';

const UNLOCKED_ENDINGS_KEY = 'dem_khong_dut_unlocked_endings_v1';

export function loadUnlockedEndings() {
  try {
    const raw = localStorage.getItem(UNLOCKED_ENDINGS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((t) => ['true', 'normal', 'bad'].includes(t)) : [];
  } catch (_) {
    return [];
  }
}

export function unlockEnding(type) {
  if (!['true', 'normal', 'bad'].includes(type)) return loadUnlockedEndings();
  const list = loadUnlockedEndings();
  if (!list.includes(type)) {
    list.push(type);
    try {
      localStorage.setItem(UNLOCKED_ENDINGS_KEY, JSON.stringify(list));
    } catch (_) {}
  }
  return list;
}

export const ALLEY_VOICES = [
  { z: -16.5, speaker: '02:08', text: 'Cửa sau đêm đó... không khóa.' },
  { z: -26.5, speaker: 'Số 14', text: '“D. Tran”. Không phải tên mình.' },
  { z: -36.5, speaker: '02:14', text: 'Ba nhịp gõ. Đèn xanh–đỏ ngoài kính.' }
];

export const VOICEMAIL_LINE = '[113 · 02:08:15] “...số 14... cửa sau mở rồi... hắn không ở ngoài nữa... hắn trong—” [NGẮT TÍN HIỆU · 02:08:42]';
export const FINALE_LINE_5 = 'Chốt cửa trượt xuống.';
export const FINALE_LINE_6 = '02:14.';

export const ENDINGS_DATA = {
  true: {
    cls: '',
    badge: 'Kết thúc Thật · 1/3',
    title: 'Số 14',
    kicker: '15/11 · 05:48',
    body: '“Cửa chính mở. Mưa tạt vào mặt. Ngoài bậc thềm chỉ có ánh đèn xanh–đỏ xoay đều trong sương.”',
    phoneTime: '05:48',
    phoneDate: '15/11',
    phoneIcon: '✓',
    phoneTitle: 'Hồ sơ #0214 · Số 14',
    phoneBar: '100%'
  },
  normal: {
    cls: 'ending-normal',
    badge: 'Kết thúc Thường · 2/3',
    title: 'Chìa Khóa Lạ',
    kicker: '15/11 · 05:12',
    body: '“Trời hửng sáng. Tôi bước ra khỏi hẻm. Trong túi áo vẫn còn một chùm chìa khóa — không có chìa nào vừa ổ cửa số 14.”',
    phoneTime: '05:12',
    phoneDate: '15/11',
    phoneIcon: '●',
    phoneTitle: 'Băng 113 (02:08) · 00:31',
    phoneBar: '42%'
  },
  bad: {
    cls: 'ending-bad',
    badge: 'Kết thúc Xấu · 3/3',
    title: 'Gạt Chốt',
    kicker: '14/11 · 02:14',
    body: '“Mưa vẫn gõ ngoài kính. Đồng hồ đỏ 02:14. Sau cửa chính vang lên ba nhịp gõ trầm — tôi đứng dậy, gạt chặt chốt trên.”',
    phoneTime: '02:14',
    phoneDate: '14/11',
    phoneIcon: '✕',
    phoneTitle: 'Cuộc gọi đi: 113 · 02:08',
    phoneBar: '0%'
  }
};

let finaleTimers = [];
export function clearFinaleTimers() {
  finaleTimers.forEach((id) => clearTimeout(id));
  finaleTimers = [];
}

let introTimers = [];
export function clearIntroTimers() {
  introTimers.forEach((id) => clearTimeout(id));
  introTimers = [];
}

export function advanceVoicemailSequence(ctx) {
  const { shadowEvent, subtitleBox, audio, showSubtitle, lightWhiteout, triggerTrueEnding } = ctx;
  if (!shadowEvent.voicemailHold || shadowEvent.voicemailAdvanced) return;
  shadowEvent.voicemailHold = false;
  shadowEvent.voicemailAdvanced = true;
  shadowEvent.whiteoutDone = true;
  subtitleBox.classList.remove('voicemail-hold');

  shadowEvent.melodyStarted = true;
  audio.playEndingMelody();

  showSubtitle('Ý nghĩ', FINALE_LINE_5, 6400, false, false, true);
  lightWhiteout.style.transition = 'opacity 6.2s ease';
  lightWhiteout.style.opacity = '0.88';

  finaleTimers.push(setTimeout(() => {
    if (ctx.state.ended) return;
    showSubtitle('Ý nghĩ', FINALE_LINE_6, 6800, false, false, true);
    lightWhiteout.style.transition = 'opacity 5.0s ease';
    lightWhiteout.style.opacity = '1';
  }, 6600));

  finaleTimers.push(setTimeout(() => {
    audio.stopSoftRain();
    triggerTrueEnding();
  }, 13600));
}

export function showEndingScreen(endingType = 'true', ctx) {
  const {
    state,
    audio,
    camera,
    panicOverlay,
    chaseBanner,
    subtitleBox,
    endingScreen,
    endingBadge,
    endingTitle,
    endingKicker,
    endingBody,
    endingPhone,
    endingPhoneTime,
    endingPhoneDate,
    endingPhoneIcon,
    endingPhoneTitle,
    endingPhoneBar,
    endingChoicesSummary,
    btnRetryLoop,
    clearKeys,
    clearInteractUI
  } = ctx;

  const data = ENDINGS_DATA[endingType] || ENDINGS_DATA.true;
  clearFinaleTimers();
  state.ended = true;
  clearKeys();

  panicOverlay.classList.remove('active');
  document.body.classList.remove('in-panic');
  camera.fov = 66; camera.updateProjectionMatrix();

  chaseBanner.classList.remove('visible');
  subtitleBox.classList.remove('visible');
  subtitleBox.classList.remove('voicemail-hold');
  clearInteractUI();
  if (document.pointerLockElement) document.exitPointerLock();

  endingScreen.classList.remove('ending-normal', 'ending-bad');
  if (data.cls) endingScreen.classList.add(data.cls);

  if (endingBadge) endingBadge.textContent = data.badge;
  if (endingTitle) endingTitle.textContent = data.title;
  if (endingKicker) endingKicker.textContent = data.kicker;
  if (endingBody) endingBody.textContent = data.body;
  if (endingPhoneTime) endingPhoneTime.textContent = data.phoneTime;
  if (endingPhoneDate) endingPhoneDate.textContent = data.phoneDate;
  if (endingPhoneIcon) endingPhoneIcon.textContent = data.phoneIcon;
  if (endingPhoneTitle) endingPhoneTitle.textContent = data.phoneTitle;
  if (endingPhoneBar) endingPhoneBar.style.width = data.phoneBar;

  if (endingChoicesSummary) {
    endingChoicesSummary.innerHTML = '';
    if (state.choices.length > 0) {
      state.choices.forEach((c) => {
        const span = document.createElement('span');
        span.className = 'choice-chip';
        span.textContent = c.chip;
        endingChoicesSummary.appendChild(span);
      });
    }
  }

  const unlocked = unlockEnding(endingType);
  const isDev = Boolean(import.meta.env && import.meta.env.DEV);
  const switchRow = document.querySelector('.ending-switch-row');
  if (switchRow) {
    switchRow.style.display = isDev || unlocked.length > 1 ? '' : 'none';
  }
  document.querySelectorAll('.ending-switch-btn').forEach((btn) => {
    const btnType = btn.getAttribute('data-ending');
    const visible = isDev || unlocked.includes(btnType);
    btn.style.display = visible ? '' : 'none';
    btn.classList.toggle('active', btnType === endingType);
  });

  if (btnRetryLoop) {
    const targetLoop = Math.max(1, Math.min(TOTAL_LOOPS, state.loop || TOTAL_LOOPS));
    btnRetryLoop.textContent = `Chơi lại ngay Vòng ${targetLoop}`;
    btnRetryLoop.classList.toggle('hidden', endingType !== 'bad');
  }

  if (endingType === 'bad') {
    audio.stopEndingMelody();
    audio.playLoopReset();
  } else {
    audio.playEndingMelody();
  }

  if (endingPhone) endingPhone.classList.remove('show');
  endingScreen.classList.remove('hidden');
  finaleTimers.push(setTimeout(() => {
    if (state.ended && endingPhone) endingPhone.classList.add('show');
  }, 750));
}

export function triggerTrueEnding(forceType = null, ctx) {
  const { state } = ctx;
  if (state.ended && !forceType) return;
  let type = forceType;
  if (!type) {
    if (state.courageScore >= 3) type = 'true';
    else if (state.courageScore >= 1) type = 'normal';
    else type = 'bad';
  }
  showEndingScreen(type, ctx);
}

export function beginLoop1AfterIntro(ctx) {
  const { state, introScreen, introLine1, introLine2, introLine3, setupLoopEnvironment, showSubtitle } = ctx;
  if (!state.inIntro) return;
  clearIntroTimers();
  state.inIntro = false;
  introScreen.classList.remove('active');
  introLine1.classList.remove('show');
  introLine2.classList.remove('show');
  introLine3.classList.remove('show');
  state.running = true;
  document.body.classList.remove('pre-start');
  setupLoopEnvironment(1, ctx);
  (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
    if (state.running && state.loop === 1 && !state.ended) {
      showSubtitle(LOOP_STORY[1].wakeSpeaker, LOOP_STORY[1].wakeText, 7200);
    }
  }, 3200);
}

export function startNewGame(withIntro = true, ctx) {
  const {
    state,
    audio,
    candles,
    scene,
    lightWhiteout,
    startScreen,
    endingScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    introScreen,
    introLine1,
    introLine2,
    introLine3,
    renderJournal,
    setupLoopEnvironment,
    showSubtitle
  } = ctx;

  clearIntroTimers();
  clearFinaleTimers();
  if (ctx.timers) ctx.timers.clearAll();
  clearSavedRun();
  lightWhiteout.style.transition = 'opacity 0.12s linear';
  audio.stopEndingMelody();

  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.matchesLeft = 10;
  state.journalNotes = [];
  state.choices = [];
  state.courageScore = 0;
  state.denialScore = 0;
  state.pendingChoiceLoop = 0;
  scene.fog.density = 0.105;

  candles.forEach(c => { c.lit = false; c.flame.visible = false; c.light.intensity = 0; });
  renderJournal();

  startScreen.classList.add('hidden');
  endingScreen.classList.add('hidden');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');

  if (!withIntro) {
    state.running = true;
    document.body.classList.remove('pre-start');
    setupLoopEnvironment(1, ctx);
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
      if (state.running && state.loop === 1 && !state.ended) {
        showSubtitle(LOOP_STORY[1].wakeSpeaker, LOOP_STORY[1].wakeText, 7200);
      }
    }, 2800);
    return;
  }

  state.running = false;
  state.inIntro = true;
  document.body.classList.add('pre-start');
  introLine1.classList.remove('show');
  introLine2.classList.remove('show');
  introLine3.classList.remove('show');
  introScreen.classList.add('active');

  introTimers.push(setTimeout(() => introLine1.classList.add('show'), 450));
  introTimers.push(setTimeout(() => introLine2.classList.add('show'), 2200));
  introTimers.push(setTimeout(() => introLine3.classList.add('show'), 4300));
  introTimers.push(setTimeout(() => beginLoop1AfterIntro(ctx), 6800));
}

export function retryCurrentLoop(ctx) {
  const {
    state,
    audio,
    lightWhiteout,
    startScreen,
    endingScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    renderJournal,
    setupLoopEnvironment,
    showSubtitle
  } = ctx;

  const targetLoop = Math.max(1, Math.min(TOTAL_LOOPS, state.loop || TOTAL_LOOPS));
  clearIntroTimers();
  clearFinaleTimers();
  if (ctx.timers) ctx.timers.clearAll();
  audio.init();
  audio.stopEndingMelody();
  lightWhiteout.style.transition = 'opacity 0.12s linear';
  lightWhiteout.style.opacity = '0';
  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.running = true;
  state.matchesLeft = Math.max(state.matchesLeft, 4);

  const prefix = `Vòng ${targetLoop} —`;
  state.journalNotes = state.journalNotes.filter((n) => !n.title.startsWith(prefix));
  renderJournal();

  document.body.classList.remove('pre-start');
  startScreen.classList.add('hidden');
  endingScreen.classList.add('hidden');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');

  setupLoopEnvironment(targetLoop, ctx);
  showSubtitle(LOOP_STORY[targetLoop].wakeSpeaker, LOOP_STORY[targetLoop].wakeText, 6800);
}

export function startQuickEndingTest(ctx) {
  const {
    state,
    audio,
    startScreen,
    introScreen,
    journalScreen,
    settingsScreen,
    keypadScreen,
    choiceScreen,
    foleyPanel,
    btnFoley,
    shadow,
    lights,
    dangerPulse,
    hudCache
  } = ctx;

  clearIntroTimers();
  clearFinaleTimers();
  if (ctx.timers) ctx.timers.clearAll();
  audio.init();
  audio.stopEndingMelody();
  state.ended = false;
  state.paused = false;
  state.inIntro = false;
  state.running = true;

  document.body.classList.remove('pre-start');
  startScreen.classList.add('hidden');
  introScreen.classList.remove('active');
  journalScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  keypadScreen.classList.add('hidden');
  choiceScreen.classList.add('hidden');
  foleyPanel.classList.add('hidden');
  btnFoley.classList.remove('active');
  shadow.group.visible = false;
  lights.emergencyRedLight.intensity = 0;
  dangerPulse.style.opacity = '0';
  hudCache.dangerOp = '0.00';

  triggerTrueEnding('true', ctx);
}
