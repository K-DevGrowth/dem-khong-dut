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
  { z: -16.5, speaker: 'Ký ức', text: '“Đoạn hẻm này tối quá… đi một mình em hơi sợ.” — “Vậy lần sau cứ gọi anh. Anh ra đón em.”' },
  { z: -26.5, speaker: 'Ý nghĩ', text: 'Cô ấy đã gọi, đúng như mình từng nói. Vậy mà mình không bắt máy. Rồi tự giam mình trong đêm đó suốt bao lâu nay.' },
  { z: -36.5, speaker: 'Ý nghĩ', text: 'Nhưng dù mình có kẹt lại trong đêm này mãi, cô ấy cũng không quay về được.' }
];

export const VOICEMAIL_LINE = '“...anh bảo cứ gọi mà... sao anh không nghe máy... (cười khẽ) Em đùa thôi. Chắc anh ngủ say rồi hả. Không sao đâu, lần này em tự đi được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.”';
export const FINALE_LINE_5 = 'Mình đã tệ với cô ấy, điều đó không đổi. Nhưng cô ấy vẫn gọi. Lần này, mình nghe hết rồi.';
export const FINALE_LINE_6 = 'Anh sẽ không quên em đâu. Kể cả những lỗi của anh. Chỉ là… từ hôm nay, anh sẽ sống tiếp.';

export const ENDINGS_DATA = {
  true: {
    cls: '',
    badge: 'Kết thúc Thật · 1/3',
    title: 'Bình Minh 15/11',
    kicker: '15 tháng 11 · 05:48',
    body: '“Không có kẻ lạ nào ngoài cửa cả — chỉ có em đứng dưới mưa và nỗi sợ của chính anh. Hôm nay, anh mở chốt khóa và bước ra khỏi đêm 14/11.”',
    phoneTime: '05:48',
    phoneDate: '15/11',
    phoneIcon: '✓',
    phoneTitle: 'Tin nhắn thoại của Alice · 02:09 · Đã nghe & lưu',
    phoneBar: '100%'
  },
  normal: {
    cls: 'ending-normal',
    badge: 'Kết thúc Thường · 2/3',
    title: 'Sáng Sớm Lạnh Lẽo',
    kicker: '15 tháng 11 · 05:12',
    body: '“Tôi bước ra khỏi căn nhà khi trời vừa tảng sáng. Tôi biết người gõ cửa đêm đó là Alice, nhưng trong lòng vẫn còn những mảnh ký ức chưa đủ can đảm đối diện.”',
    phoneTime: '05:12',
    phoneDate: '15/11',
    phoneIcon: '●',
    phoneTitle: '1 tin nhắn thoại nghe dở · Alice (02:09)',
    phoneBar: '36%'
  },
  bad: {
    cls: 'ending-bad',
    badge: 'Kết thúc Xấu · 3/3',
    title: '02:14',
    kicker: '14 tháng 11 · 02:14',
    body: '“Tôi lại mở mắt trên giường giữa tiếng mưa. Tôi vẫn tự nhủ ngoài cửa là kẻ lạ — và bàn tay tôi lại gạt chặt chốt khóa thêm một lần nữa.”',
    phoneTime: '02:14',
    phoneDate: '14/11',
    phoneIcon: '✕',
    phoneTitle: '4 cuộc gọi nhỡ · Alice · Chế độ Im lặng',
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
  setTimeout(() => {
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
    setTimeout(() => {
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
