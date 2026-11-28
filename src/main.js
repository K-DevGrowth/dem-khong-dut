import * as THREE from "three";
import "./style.css";
import { HouseAudio } from "./audio.js";

// Configuration modules
import {
  DEFAULT_SETTINGS,
  GFX_PRESETS,
  loadSettings,
  saveSettings,
} from "./config/settings.js";
import { TOTAL_LOOPS, LOOP_STORY, MORAL_CHOICES } from "./config/storyData.js";
import { getHeldPaperContent } from "./config/heldPaperContent.js";

// World modules
import {
  makeHeldPaperTexture,
  updateTVStatic,
  tvStaticTex,
} from "./world/textures.js";
import { createMaterials } from "./world/materials.js";
import { createHouse } from "./world/house.js";
import { createDoorsSystem } from "./world/doors.js";
import { createPuzzlesSystem } from "./world/puzzles.js";
import { createShadowPresence } from "./world/entity.js";

// Game logic & director modules
import { createGameState } from "./game/state.js";
import { createTimerManager } from "./game/timerManager.js";
import { loadSavedRun, clearSavedRun } from "./game/saveManager.js";
import {
  computeStereoPan,
  createShadowEventState,
  updateShadowEvents,
  updateFearAndLighting,
} from "./game/horrorDirector.js";
import {
  setupLoopEnvironment,
  recordAnomalyFound,
  openChoiceModal,
  resolveMoralChoice,
  transitionToLoop,
} from "./game/loopManager.js";
import {
  showEndingScreen,
  triggerTrueEnding,
  beginLoop1AfterIntro,
  startNewGame,
  retryCurrentLoop,
  startQuickEndingTest,
  advanceVoicemailSequence,
  clearIntroTimers,
  clearFinaleTimers,
} from "./game/endings.js";

// Player equipment & physics modules
import {
  createMatchSystem,
  toggleOrStrikeMatch,
  updateMatch,
} from "./player/match.js";
import { createHeldPaperSystem, updateHeldPaper } from "./player/heldPaper.js";
import {
  keys,
  clearKeys,
  collides,
  updatePlayerMovement,
} from "./player/controls.js";

// UI modules
import { createHudCache, updateHUD, clearInteractUI } from "./ui/hud.js";
import { createNarrator, createSubtitleSystem } from "./ui/subtitles.js";
import { renderJournal, toggleJournal } from "./ui/journal.js";
import { createKeypadController } from "./ui/keypad.js";
import { createSettingsController } from "./ui/settingsMenu.js";

function showWebGLErrorModal() {
  const startScreen = document.getElementById("start-screen");
  if (startScreen) startScreen.classList.add("hidden");

  let modal = document.getElementById("webgl-error-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "webgl-error-modal";
    modal.innerHTML = `
      <div class="webgl-error-card">
        <div class="webgl-error-badge">LỖI ĐỒ HỌA WEBGL</div>
        <h2 class="webgl-error-heading">Không thể khởi tạo đồ họa 3D (WebGL)</h2>
        <p class="webgl-error-msg">
          Trình duyệt của bạn đang tắt tính năng <strong>Tăng tốc phần cứng (Hardware Acceleration)</strong> hoặc GPU bị chặn (<code>GL_VENDOR = Disabled</code>).
        </p>

        <div class="webgl-steps-box">
          <div class="webgl-steps-title">⚡ Hướng dẫn bật lại trong 10 giây:</div>
          <div class="webgl-step-item">
            <strong>Bước 1:</strong> Mở Cài đặt trình duyệt (Chrome/Edge/Cốc Cốc), vào mục <strong>Hệ thống (System)</strong> hoặc truy cập:
            <div class="webgl-code-copy">chrome://settings/system</div>
          </div>
          <div class="webgl-step-item">
            <strong>Bước 2:</strong> Bật tùy chọn <strong>"Sử dụng tính năng tăng tốc đồ họa khi khả dụng"</strong> (Use graphics acceleration when available).
          </div>
          <div class="webgl-step-item">
            <strong>Bước 3:</strong> Bấm nút <strong>Khởi động lại (Relaunch)</strong> trình duyệt.
          </div>
          <div class="webgl-step-item">
            <em>Nếu vẫn chưa được:</em> Truy cập <code>chrome://flags/#ignore-gpu-blocklist</code> &rarr; chọn <strong>Enabled</strong> &rarr; Relaunch.
          </div>
        </div>

        <div class="webgl-btn-row">
          <button class="wake-btn" onclick="window.location.reload()">Tải lại trang (F5)</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function createSafeWebGLRenderer(initialPreset, initWidth, initHeight) {
  const configs = [
    // 1. Ưu tiên GPU rời hiệu năng cao trước (tắt antialias khi preset thấp)
    {
      antialias: initialPreset.shadows,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    },
    // 2. Default power preference (cho phép integrated GPU hoặc SwiftShader fallback)
    {
      antialias: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    },
    // 3. Low power
    {
      antialias: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    },
    // 4. Default minimal Three.js parameters
    {
      antialias: false,
      precision: "mediump",
      failIfMajorPerformanceCaveat: false,
    },
    {},
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      const r = new THREE.WebGLRenderer(configs[i]);
      if (r && r.getContext()) {
        return r;
      }
    } catch (e) {
      console.warn(`[WebGL] Init attempt ${i + 1} failed:`, e?.message || e);
    }
  }

  // 5. Thử tạo WebGL context thủ công qua canvas
  const canvas = document.createElement("canvas");
  canvas.width = initWidth;
  canvas.height = initHeight;
  const contextTypes = ["webgl2", "webgl", "experimental-webgl"];
  const contextAttrs = [
    { powerPreference: "default", failIfMajorPerformanceCaveat: false },
    { failIfMajorPerformanceCaveat: false },
    {},
  ];

  for (const type of contextTypes) {
    for (const attrs of contextAttrs) {
      try {
        const gl = canvas.getContext(type, attrs);
        if (gl) {
          const r = new THREE.WebGLRenderer({
            canvas,
            context: gl,
            antialias: false,
          });
          if (r && r.getContext()) {
            return r;
          }
        }
      } catch (e) {
        console.warn(`[WebGL] Manual ${type} failed:`, e?.message || e);
      }
    }
  }

  return null;
}

function initGame() {
  const isDevBuild = Boolean(import.meta.env && import.meta.env.DEV);

  // =========================================================
  // 0. DEMO ACCESS GATE (Uses Vercel env VITE_DEMO_PASSWORD, default: testdemo)
  // =========================================================
  const DEMO_PASS = String((import.meta.env && import.meta.env.VITE_DEMO_PASSWORD) || "testdemo").trim();
  const AUTH_SESSION_KEY = "dem_khong_dut_demo_auth_v1";
  const authGate = document.getElementById("auth-gate");
  const authForm = document.getElementById("auth-form");
  const authInput = document.getElementById("auth-input");
  const authError = document.getElementById("auth-error");

  function unlockDemoGate() {
    document.body.classList.remove("auth-locked");
    if (authGate) authGate.classList.add("hidden");
  }

  try {
    if (sessionStorage.getItem(AUTH_SESSION_KEY) === DEMO_PASS) {
      unlockDemoGate();
    }
  } catch (_) {}

  if (authForm && authInput) {
    authForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const val = authInput.value.trim();
      if (val === DEMO_PASS) {
        try {
          sessionStorage.setItem(AUTH_SESSION_KEY, DEMO_PASS);
        } catch (_) {}
        if (authError) authError.textContent = "";
        authInput.classList.remove("error");
        unlockDemoGate();
      } else {
        authInput.classList.remove("error");
        void authInput.offsetWidth;
        authInput.classList.add("error");
        if (authError) authError.textContent = "Mật khẩu không đúng. Vui lòng thử lại.";
        authInput.value = "";
        authInput.focus();
      }
    });
  }
  if (!isDevBuild) {
    document.querySelectorAll('[data-dev-only="true"]').forEach((el) => {
      el.style.display = "none";
    });
  }

  // =========================================================
  // 1. DOM REFERENCES
  // =========================================================
  const container = document.getElementById("canvas-container");
  const loopLabel = document.getElementById("loop-label");
  const fpsBadge = document.getElementById("fps-badge");
  const anomalyPill = document.getElementById("anomaly-pill");
  const anomalyLabel = document.getElementById("anomaly-label");
  const objectiveText = document.getElementById("objective-text");
  const objectiveToast = document.getElementById("objective-toast");
  let objectiveFadeTimer = null;
  function flashObjectiveToast(durationMs = 5200) {
    if (!objectiveToast) return;
    objectiveToast.classList.add("visible");
    if (objectiveFadeTimer) clearTimeout(objectiveFadeTimer);
    objectiveFadeTimer = setTimeout(() => {
      objectiveToast.classList.remove("visible");
    }, durationMs);
  }
  if (objectiveText && typeof MutationObserver !== "undefined") {
    const objObserver = new MutationObserver(() => {
      if (objectiveText.textContent && objectiveText.textContent.trim()) {
        flashObjectiveToast(5200);
      }
    });
    objObserver.observe(objectiveText, { childList: true, characterData: true, subtree: true });
  }
  const fearBar = document.getElementById("fear-bar");
  const fearPct = document.getElementById("fear-pct");
  const matchCountEl = document.getElementById("match-count");
  const matchBar = document.getElementById("match-bar");
  const fearVignette = document.getElementById("fear-vignette");
  const dangerPulse = document.getElementById("danger-pulse");
  const panicOverlay = document.getElementById("panic-overlay");
  const lightWhiteout = document.getElementById("light-whiteout");
  const chaseBanner = document.getElementById("chase-banner");
  const blinkOverlay = document.getElementById("blink-overlay");
  const blinkClock = document.getElementById("blink-clock");
  const blinkSub = document.getElementById("blink-sub");
  const crosshair = document.getElementById("crosshair");
  const interactPrompt = document.getElementById("interact-prompt");
  const paperOverlay = document.getElementById("paper-overlay");
  const paperSheet = document.getElementById("paper-sheet");
  const paperHeader = document.getElementById("paper-header");
  const paperSubHeader = document.getElementById("paper-subheader");
  const paperBody = document.getElementById("paper-body");
  const paperNoteWrap = document.getElementById("paper-note-wrap");
  const paperNote = document.getElementById("paper-note");
  const paperTiltWrap = document.getElementById("paper-tilt-wrap");
  const paperCard3d = document.getElementById("paper-card-3d");
  const paperSheetBack = document.getElementById("paper-sheet-back");
  const paperBackHeader = document.getElementById("paper-back-header");
  const paperBackClue = document.getElementById("paper-back-clue");
  const paperBackSwatch = document.getElementById("paper-back-swatch");
  const paperBackDigit = document.getElementById("paper-back-digit");
  const paperBackBody = document.getElementById("paper-back-body");
  const btnFlipPaper = document.getElementById("btn-flip-paper");
  const btnFlipPaperBack = document.getElementById("btn-flip-paper-back");
  const btnClosePaper = document.getElementById("btn-close-paper");
  const btnClosePaperBack = document.getElementById("btn-close-paper-back");
  const subtitleBox = document.getElementById("subtitle-box");
  const subtitleSpeaker = document.getElementById("subtitle-speaker");
  const subtitleText = document.getElementById("subtitle-text");
  const startScreen = document.getElementById("start-screen");
  const introScreen = document.getElementById("intro-screen");
  const introLine1 = document.getElementById("intro-line-1");
  const introLine2 = document.getElementById("intro-line-2");
  const introLine3 = document.getElementById("intro-line-3");
  const introSkipBtn = document.getElementById("intro-skip");
  const eyelidTop = document.getElementById("eyelid-top");
  const eyelidBottom = document.getElementById("eyelid-bottom");
  const eyeHaze = document.getElementById("eye-haze");
  const journalScreen = document.getElementById("journal-screen");
  const journalList = document.getElementById("journal-list");
  const journalTimeline = document.getElementById("journal-timeline");
  const journalChoices = document.getElementById("journal-choices");
  const choiceScreen = document.getElementById("choice-screen");
  const choiceKicker = document.getElementById("choice-kicker");
  const choiceTitle = document.getElementById("choice-title");
  const choicePrompt = document.getElementById("choice-prompt");
  const btnChoiceA = document.getElementById("btn-choice-a");
  const btnChoiceB = document.getElementById("btn-choice-b");
  const choiceALabel = document.getElementById("choice-a-label");
  const choiceASub = document.getElementById("choice-a-sub");
  const choiceBLabel = document.getElementById("choice-b-label");
  const choiceBSub = document.getElementById("choice-b-sub");
  const endingChoicesSummary = document.getElementById(
    "ending-choices-summary",
  );
  const endingScreen = document.getElementById("ending-screen");
  const endingKicker = document.getElementById("ending-kicker");
  const endingTitle = document.getElementById("ending-title");
  const endingBody = document.getElementById("ending-body");
  const endingBadge = document.getElementById("ending-badge");
  const endingPhone = document.getElementById("ending-phone");
  const endingPhoneTime = document.getElementById("ending-phone-time");
  const endingPhoneDate = document.getElementById("ending-phone-date");
  const endingPhoneIcon = document.getElementById("ending-phone-icon");
  const endingPhoneTitle = document.getElementById("ending-phone-title");
  const endingPhoneBar = document.getElementById("ending-phone-bar");
  const btnRetryLoop = document.getElementById("btn-retry-loop");
  const voiceSelect = document.getElementById("voice-select");
  const foleyPanel = document.getElementById("foley-panel");
  const btnFoley = document.getElementById("btn-foley");
  const settingsScreen = document.getElementById("settings-screen");
  const gfxDescEl = document.getElementById("gfx-desc");
  const toggleShowFps = document.getElementById("toggle-show-fps");
  const toggleFilmGrain = document.getElementById("toggle-film-grain");
  const toggleSubtitles = document.getElementById("toggle-subtitles");
  const toggleInvertY = document.getElementById("toggle-invert-y");
  const toggleHeadBob = document.getElementById("toggle-head-bob");
  const toggleCamSmooth = document.getElementById("toggle-cam-smooth");
  const sliderGamma = document.getElementById("slider-gamma");
  const gammaDisplay = document.getElementById("gamma-display");
  const sliderFov = document.getElementById("slider-fov");
  const fovDisplay = document.getElementById("fov-display");
  const sliderMasterVol = document.getElementById("slider-master-vol");
  const masterVolDisplay = document.getElementById("master-vol-display");
  const sliderAmbienceVol = document.getElementById("slider-ambience-vol");
  const ambienceVolDisplay = document.getElementById("ambience-vol-display");
  const sliderSfxVol = document.getElementById("slider-sfx-vol");
  const sfxVolDisplay = document.getElementById("sfx-vol-display");
  const sliderSens = document.getElementById("slider-sens");
  const sensDisplay = document.getElementById("sens-display");
  const keypadScreen = document.getElementById("keypad-screen");
  const keypadDisplay = document.getElementById("keypad-display");
  const keypadMsg = document.getElementById("keypad-msg");
  const warningScreen = document.getElementById("warning-screen");
  const btnWarningAccept = document.getElementById("btn-warning-accept");
  const btnWarningBack = document.getElementById("btn-warning-back");
  const licensesScreen = document.getElementById("licenses-screen");
  const btnOpenLicenses = document.getElementById("btn-open-licenses");
  const btnCloseLicenses = document.getElementById("btn-close-licenses");

  // =========================================================
  // 2. THREE.JS SCENE, CAMERA, RENDERER & AUDIO INITIALIZATION
  // =========================================================
  const settings = loadSettings();
  const audio = new HouseAudio();
  const timers = createTimerManager();
  const pauseOverlay = document.getElementById("pause-overlay");
  const btnContinue = document.getElementById("btn-continue");
  const btnStart = document.getElementById("btn-start");
  const btnTitleSettings = document.getElementById("btn-title-settings");
  const btnTitleExit = document.getElementById("btn-title-exit");
  const btnResume = document.getElementById("btn-resume");
  const btnPauseSettings = document.getElementById("btn-pause-settings");
  const btnPauseTitle = document.getElementById("btn-pause-title");
  const state = createGameState();
  const hudCache = createHudCache();
  const shadowEvent = createShadowEventState();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04060a, 0.125);

  const initWidth = Math.max(
    1,
    container.clientWidth || window.innerWidth || 1280,
  );
  const initHeight = Math.max(
    1,
    container.clientHeight || window.innerHeight || 720,
  );
  const camera = new THREE.PerspectiveCamera(
    66,
    initWidth / initHeight,
    0.08,
    65,
  );
  scene.add(camera);

  const initialPreset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;
  const renderer = createSafeWebGLRenderer(initialPreset, initWidth, initHeight);
  if (!renderer) {
    showWebGLErrorModal();
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = initialPreset.exposure;
  renderer.shadowMap.enabled = initialPreset.shadows;
  renderer.shadowMap.type = initialPreset.shadowType;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, initialPreset.maxDpr),
  );
  renderer.setSize(initWidth, initHeight, false);
  container.appendChild(renderer.domElement);

  // =========================================================
  // 3. WORLD BUILDING & SYSTEMS
  // =========================================================
  const materials = createMaterials();
  const colliders = [];
  const interactables = [];

  const house = createHouse(
    scene,
    materials,
    colliders,
    interactables,
    () => state,
  );
  const doorsSystem = createDoorsSystem(
    scene,
    materials,
    colliders,
    interactables,
    () => state,
  );
  const doors = doorsSystem.doors;
  const puzzles = createPuzzlesSystem(
    scene,
    materials,
    interactables,
    () => state,
  );
  const shadow = createShadowPresence(scene, materials);

  // Player systems attached to camera
  const matchSystem = createMatchSystem(scene, camera);
  const heldPaperSystem = createHeldPaperSystem(camera, materials.heldPaperMat);

  // Narrator & subtitles
  const narrator = createNarrator(voiceSelect, audio);
  const subtitleSystem = createSubtitleSystem(
    { subtitleBox, subtitleSpeaker, subtitleText },
    narrator,
    state,
  );
  const showSubtitle = subtitleSystem.showSubtitle;

  // Keypad & Settings UI controllers
  let keypadController;
  let settingsController;

  // Complete execution context for modules
  const _playerRight = new THREE.Vector3();
  const ctx = {
    state,
    audio,
    timers,
    scene,
    camera,
    renderer,
    settings,
    colliders,
    interactables,
    doors,
    candles: puzzles.candles,
    hplDrawers: puzzles.hplDrawers,
    hplProps: puzzles.hplProps,
    objects: house.objects,
    lights: house.lights,
    puzzles,
    keyGlint: puzzles.keyGlint,
    matchboxGlint: puzzles.matchboxGlint,
    materials,
    tvStaticTex,
    shadow,
    shadowEvent,
    hudCache,
    matchGroup: matchSystem.matchGroup,
    matchLight: matchSystem.matchLight,
    flameMesh: matchSystem.flameMesh,
    flameSprite: matchSystem.flameSprite,
    glowHalo: matchSystem.glowHalo,
    heldPaperGroup: heldPaperSystem.heldPaperGroup,
    heldPaperMesh: heldPaperSystem.heldPaperMesh,
    eyelidTop,
    eyelidBottom,
    eyeHaze,
    panicOverlay,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    blinkOverlay,
    blinkClock,
    blinkSub,
    crosshair,
    interactPrompt,
    paperOverlay,
    subtitleBox,
    subtitleSpeaker,
    subtitleText,
    startScreen,
    introScreen,
    introLine1,
    introLine2,
    introLine3,
    introSkipBtn,
    journalScreen,
    journalList,
    journalTimeline,
    journalChoices,
    choiceScreen,
    choiceKicker,
    choiceTitle,
    choicePrompt,
    btnChoiceA,
    btnChoiceB,
    choiceALabel,
    choiceASub,
    choiceBLabel,
    choiceBSub,
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
    foleyPanel,
    btnFoley,
    keypadScreen,
    keypadDisplay,
    keypadMsg,
    settingsScreen,
    fpsBadge,
    container,
    portraitGroup: house.objects.portraitGroup,
    portraitAnomalyObj: house.objects.portraitAnomalyObj,
    livingWindowMoon: house.lights.livingWindowMoon,
    emergencyRedLight: house.lights.emergencyRedLight,
    alleyLights: house.lights.alleyLights,
    objectiveText,
    anomalyPill,
    anomalyLabel,
    playerRight: _playerRight,
    showSubtitle,
    narrator,
    clearKeys: () => clearKeys(),
    clearInteractUI: () =>
      clearInteractUI(hudCache, { crosshair, interactPrompt }),
    updateHUD: () =>
      updateHUD(state, hudCache, {
        loopLabel,
        fearPct,
        fearBar,
        fearVignette,
        matchCountEl,
        matchBar,
        anomalyPill,
        anomalyLabel,
      }),
    renderJournal: () =>
      renderJournal(state, { journalList, journalTimeline, journalChoices }),
    toggleJournal: () =>
      toggleJournal(
        state,
        { journalScreen, settingsScreen, pauseOverlay },
        () =>
          renderJournal(state, {
            journalList,
            journalTimeline,
            journalChoices,
          }),
        clearKeys,
      ),
    triggerTrueEnding: (type = null) => triggerTrueEnding(type, ctx),
    setupLoopEnvironment: (loopNum) => {
      flashObjectiveToast(5500);
      if (house.objects.tvObj) house.objects.tvObj.checkedInLoop = 0;
      return setupLoopEnvironment(loopNum, ctx);
    },
    advanceVoicemailSequence: () => advanceVoicemailSequence(ctx),
    recordAnomalyFound: () => recordAnomalyFound(ctx),
    openChoiceModal: (loopNum) => openChoiceModal(loopNum, ctx),
    resolveMoralChoice: (kind) => resolveMoralChoice(kind, ctx),
    transitionToLoop: (nextLoop) => transitionToLoop(nextLoop, ctx),
    openHeldPaper: (kind, loopNum) => openHeldPaperUI(kind, loopNum),
    lowerHeldPaper: () => lowerHeldPaperUI(),
  };

  // Wire Keypad Controller
  keypadController = createKeypadController(
    { keypadScreen, keypadDisplay, keypadMsg, settingsScreen, journalScreen },
    state,
    audio,
    {
      clearKeys,
      onCodeSuccess: () => {
        puzzles.clueGroup.visible = false;
        audio.playMemoryChime(true);
        state.journalNotes.push({
          title: `Vòng 5 — ${LOOP_STORY[5].clueTitle}`,
          text: LOOP_STORY[5].journal,
        });
        renderJournal(state, { journalList, journalTimeline, journalChoices });
        openHeldPaperUI("clue", 5);
      },
    },
  );

  // Wire Settings Controller (v1.9.0 3-tab horror settings)
  settingsController = createSettingsController(
    {
      container,
      settingsScreen,
      journalScreen,
      fpsBadge,
      gfxDescEl,
      toggleFilmGrain,
      toggleShowFps,
      toggleSubtitles,
      toggleInvertY,
      toggleHeadBob,
      toggleCamSmooth,
      sliderGamma,
      gammaDisplay,
      sliderFov,
      fovDisplay,
      sliderMasterVol,
      masterVolDisplay,
      sliderAmbienceVol,
      ambienceVolDisplay,
      sliderSfxVol,
      sfxVolDisplay,
      sliderSens,
      sensDisplay,
    },
    settings,
    GFX_PRESETS,
    renderer,
    scene,
    camera,
    audio,
    {
      nightHemi: house.lights.nightHemi,
      matchLight: matchSystem.matchLight,
      bedroomLampLight: house.lights.bedroomLampLight,
    },
    house.objects.dustPoints,
    materials,
    () => saveSettings(settings),
    state,
    {
      clearKeys,
      onClearSave: () => {
        clearSavedRun();
        refreshContinueButton();
      },
      onReset: () => {
        Object.assign(settings, DEFAULT_SETTINGS);
        saveSettings(settings);
      },
    },
  );

  settingsController.applyAllSettings();

  // =========================================================
  // 4. HELD PAPER & CLUE INSPECTION (CRISP 2D DOM READER)
  // =========================================================
  function flipHeldPaper() {
    if (!state.holdingPaper || !paperCard3d) return;
    state.paperFlipped = !state.paperFlipped;
    paperCard3d.classList.toggle("is-flipped", state.paperFlipped);
    audio.playFloorCreak();
  }

  function openHeldPaperUI(kind, loopNum) {
    const content = getHeldPaperContent(kind, loopNum, state);
    if (materials.heldPaperMat.map) materials.heldPaperMat.map.dispose();
    materials.heldPaperMat.map = makeHeldPaperTexture(kind, loopNum);
    materials.heldPaperMat.needsUpdate = true;

    state.holdingPaper = true;
    state.holdingPaperSource = kind;
    state.paperFlipped = false;
    state.paperTiltX = 0;
    state.paperTiltY = 0;
    state.paperAnim = 0;
    heldPaperSystem.heldPaperGroup.visible = false;
    matchSystem.matchGroup.visible = false;
    crosshair.style.opacity = "0";
    subtitleBox.classList.remove("visible");
    clearInteractUI(hudCache, { crosshair, interactPrompt });
    clearKeys();

    if (paperCard3d) paperCard3d.classList.remove("is-flipped");
    if (paperTiltWrap) paperTiltWrap.style.transform = "rotateX(0deg) rotateY(0deg)";

    if (paperOverlay && paperSheet && content) {
      const themeCls = `theme-${content.theme || "calendar"}`;
      paperSheet.className = `paper-sheet paper-face paper-face-front ${themeCls}`;
      if (paperSheetBack) {
        paperSheetBack.className = `paper-sheet paper-face paper-face-back ${themeCls}`;
      }
      if (paperHeader) paperHeader.textContent = content.header || "";
      if (paperSubHeader) {
        if (content.subHeader) {
          paperSubHeader.textContent = content.subHeader;
          paperSubHeader.classList.remove("hidden");
        } else {
          paperSubHeader.textContent = "";
          paperSubHeader.classList.add("hidden");
        }
      }
      if (paperBody) paperBody.textContent = content.body || "";
      if (paperNoteWrap && paperNote) {
        if (content.note) {
          paperNote.textContent = content.note;
          paperNoteWrap.classList.remove("hidden");
        } else {
          paperNote.textContent = "";
          paperNoteWrap.classList.add("hidden");
        }
      }

      if (paperBackHeader) paperBackHeader.textContent = content.backHeader || "MẶT SAU TỜ GIẤY";
      if (paperBackBody) {
        paperBackBody.textContent = content.backBody || "Mặt sau tờ giấy chỉ có vài vết ố ẩm cũ kỹ.";
      }
      if (paperBackClue && paperBackSwatch && paperBackDigit) {
        if (content.backClue) {
          paperBackSwatch.style.background = content.backClue.hex;
          paperBackDigit.textContent = String(content.backClue.digit);
          paperBackDigit.style.color = content.backClue.hex;
          paperBackClue.classList.remove("hidden");
          const clueTitle = `Vòng 5 · Mã màu ${content.backClue.name}`;
          if (!state.journalNotes.some((n) => n.title === clueTitle)) {
            state.journalNotes.push({
              title: clueTitle,
              text: `Tìm thấy ở mặt sau giấy (${kind === "fridge_note" ? "Tủ lạnh" : "Quầy bếp"}): Màu ${content.backClue.name} = số ${content.backClue.digit}.`,
            });
            renderJournal(state, { journalList, journalTimeline, journalChoices });
          }
        } else {
          paperBackClue.classList.add("hidden");
        }
      }

      paperOverlay.classList.remove("hidden");
    }

    if (content && content.voice) {
      narrator.speak(content.voice, kind === "fridge_note");
    }
  }

  function lowerHeldPaperUI() {
    if (!state.holdingPaper) return;
    const src = state.holdingPaperSource;
    state.holdingPaper = false;
    state.holdingPaperSource = null;
    if (paperOverlay) paperOverlay.classList.add("hidden");
    crosshair.style.opacity = "";
    if (state.matchTimer > 0) matchSystem.matchGroup.visible = true;
    interactPrompt.classList.remove("visible");
    narrator.stop();

    if (src !== "clue") return;

    if (state.loop === 1) {
      objectiveText.textContent = "Ra mở cửa chính đón cô ấy";
    } else if (state.loop === 2) {
      objectiveText.textContent = "Ra mở cửa chính cuối phòng khách";
      timers.setTimeout(() => {
        if (state.loop !== 2 || state.ended) return;
        audio.playBreakerSnap();
        house.lights.bedroomLampLight.intensity = 0;
        house.lights.studyLampLight.intensity = 0;
        state.matchTimer = 0;
        matchSystem.matchGroup.visible = false;
        matchSystem.matchLight.intensity = 0;
        puzzles.candles.forEach((c) => {
          c.lit = false;
          c.flame.visible = false;
          c.light.intensity = 0;
        });
        shadowEvent.mode = "loop2_doorway";
        shadowEvent.timer = 0;
        shadow.group.position.set(3.8, 0, -4.5);
        shadow.group.visible = true;
        audio.playHeavyBreath(0.32);
      }, 900);
    } else if (state.loop === 3 || state.loop === 4) {
      objectiveText.textContent = "Ra mở cửa chính để bước sang vòng tiếp theo";
      if (state.loop === 4) {
        shadowEvent.mode = "loop3_front";
        shadow.group.position.set(0, 0, -8.5);
        shadow.group.visible = true;
        audio.playHeavyBreath(0.3);
      }
    } else if (state.loop === TOTAL_LOOPS) {
      objectiveText.textContent = "Giữ [Shift] chạy thẳng ra Cửa chính!";
      chaseBanner.classList.add("visible");
      audio.triggerDeadSilence(1500);
      audio.playScareChord();
      audio.playDoorSlam();
      const frontDoor = doors.find((d) => d.id === "door_front");
      if (frontDoor) {
        frontDoor.isOpen = true;
        frontDoor.targetOffset = -Math.PI * 0.55;
        frontDoor.collider.active = false;
      }
      house.lights.dawnLight.intensity = 6.2;
      if (house.lights.livingWindowMoon) {
        house.lights.livingWindowMoon.color.setHex(0xffd28a);
        house.lights.livingWindowMoon.intensity = 2.4;
      }
      shadowEvent.mode = "loop3_chase";
      shadow.group.position.set(0.2, 0, -1.6);
      shadow.group.visible = true;
      state.shakeTime = 0.6;
      showSubtitle(
        LOOP_STORY.loop3Chase.speaker,
        LOOP_STORY.loop3Chase.text,
        7400,
        false,
      );
    }
  }

  function completeBreakerFix() {
    if (state.breakerFixed) return;
    state.breakerFixed = true;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0.35;
    puzzles.breakerLight.color.setHex(0x38d97c);
    house.lights.kitchenGuideLight.intensity = 0;
    audio.playBreakerSnap();
    house.lights.bedroomLampLight.intensity = 0.95;
    house.lights.studyLampLight.intensity = 0.75;
    house.lights.bathLight.intensity = 0.62;
    objectiveText.textContent = house.objects.phoneObj.answered
      ? "Điện đã có lại → vào phòng làm việc xem hồ sơ"
      : "Điện đã có lại → nghe điện thoại bàn rồi vào phòng làm việc";
    showSubtitle(
      "Cầu dao điện",
      "Cần cầu dao bật lên rồi — đèn trong nhà đã sáng lại. Giờ có thể vào phòng làm việc xem hồ sơ.",
      5200,
    );
  }

  // =========================================================
  // 5. RAYCAST INTERACTION CHECK & EXECUTION
  // =========================================================
  const _camDir = new THREE.Vector3();
  const _toItem = new THREE.Vector3();
  let currentTarget = null;

  function findInteractable() {
    camera.getWorldDirection(_camDir);
    let best = null;
    let bestDist = 3.0;

    for (let i = 0; i < interactables.length; i++) {
      const item = interactables[i];
      if (item.type === "clue" && state.loopClueFound) continue;
      if (item.type === "candle" && item.lit) continue;
      if (item.type === "phone" && !item.ringing) continue;
      if (item.type === "wardrobe" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "mirror" && item.checkedInLoop === state.loop) continue;
      if (item.type === "bath_mirror" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "fridge" && item.checkedInLoop === state.loop) continue;
      if (item.type === "kitchen_note" && item.readInLoop === state.loop)
        continue;
      if (item.type === "kitchen_faucet" && !item.running && !item.dripping)
        continue;
      if (item.type === "bath_faucet" && !item.running && !item.dripping)
        continue;
      if (
        item.type === "study_key" &&
        (state.loop !== 1 || state.studyKeyFound)
      )
        continue;
      if (item.type === "breaker" && (state.loop !== 2 || state.breakerFixed))
        continue;
      if (item.type === "clock_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "chair_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "portrait_anomaly" && item.checkedInLoop === state.loop)
        continue;
      if (
        item.type === "scrawl_anomaly" &&
        (!house.objects.wallScrawl.visible || item.checkedInLoop === state.loop)
      )
        continue;
      if (item.type === "smartphone" && item.checkedInLoop === state.loop)
        continue;
      if (item.type === "broken_mug" && item.checkedInLoop === state.loop)
        continue;
      if (
        item.type === "rain_puddle" &&
        (!house.objects.doorRainPuddle.visible ||
          item.checkedInLoop === state.loop)
      )
        continue;
      if (
        item.type === "matchbox" &&
        (state.loop < 2 || item.pickedInLoop === state.loop)
      )
        continue;
      if (
        item.type === "tv" &&
        (state.loop < 2 || item.checkedInLoop === state.loop)
      )
        continue;

      _toItem.subVectors(item.worldPos, state.pos);
      const dist = _toItem.length();
      if (dist > bestDist) continue;
      _toItem.divideScalar(dist || 1);
      if (_camDir.dot(_toItem) > 0.68) {
        best = item;
        bestDist = dist;
      }
    }
    return best;
  }

  function triggerInteract() {
    if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
      return;
    audio.init();
    if (shadowEvent.voicemailHold) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (state.holdingPaper) {
      lowerHeldPaperUI();
      return;
    }
    if (!currentTarget) return;

    if (
      currentTarget.type === "matchbox" &&
      state.loop >= 2 &&
      currentTarget.pickedInLoop !== state.loop
    ) {
      currentTarget.pickedInLoop = state.loop;
      puzzles.matchboxGroup.visible = false;
      state.matchesLeft = Math.min(12, state.matchesLeft + 3);
      audio.playMatchStrike();
      showSubtitle(
        "Hộp diêm",
        `Nhặt thêm 3 que diêm (hiện có ${state.matchesLeft} que).`,
        3600,
        false,
        true,
      );
      ctx.updateHUD();
    } else if (currentTarget.type === "tv") {
      currentTarget.checkedInLoop = state.loop;
      if (state.loop === 4 && !state.tvTurnedOff) {
        state.tvTurnedOff = true;
        house.lights.tvLight.intensity = 0;
        materials.tvScreenMat.map = null;
        materials.tvScreenMat.color.setHex(0x050608);
        materials.tvScreenMat.needsUpdate = true;
        audio.triggerDeadSilence(1600);
        audio.playTvStaticOff();
        state.shakeTime = 0.35;
        // Brief uncanny apparition appearance near study doorway when TV snaps off
        shadow.group.position.set(2.4, 0, -4.45);
        shadow.group.visible = true;
        timers.setTimeout(() => {
          if (state.loop === 4 && !state.ended && shadowEvent.mode === "hidden") {
            shadow.group.visible = false;
          }
        }, 780);
        objectiveText.textContent = house.objects.phoneObj.answered
          ? "TV đã tắt — cửa phòng làm việc mở rồi! Vào xem bản chép tin nhắn thoại"
          : "TV đã tắt — hãy nghe điện thoại bàn đang réo rồi vào phòng làm việc";
        showSubtitle(
          "Màn hình TV tắt phụt",
          "Tiếng nhiễu tắt ngấm... Cả căn phòng đột ngột im bặt. Hình như vừa có bóng người lướt qua cửa phòng làm việc!",
          5800,
          true,
        );
        ctx.recordAnomalyFound();
      } else {
        audio.playBreakerSnap();
        audio.playHeavyBreath(0.22);
        const tvLines = {
          2: {
            speaker: "Màn hình TV nhiễu hạt",
            text: "TV tự bật lúc mất điện... Giữa màn nhiễu trắng lờ mờ hiện bóng một con hẻm mưa lúc 02:14.",
          },
          3: {
            speaker: "Màn hình TV nhiễu hạt",
            text: "Bản tin thời tiết từ ngày 14/11 cứ phát lặp lại không ngừng — chiếc TV này đã kẹt ở đêm đó suốt nhiều tuần.",
          },
          5: {
            speaker: "Màn hình TV nhiễu hạt",
            text: "Màn hình chớp tắt theo nhịp đèn xe cấp cứu ngoài cửa sổ. Mọi thứ trong căn nhà này đều dừng lại lúc 02:14.",
          },
        };
        const info = tvLines[state.loop] || tvLines[2];
        showSubtitle(info.speaker, info.text, 5600, state.loop >= 4);
        ctx.recordAnomalyFound();
      }
    } else if (currentTarget.type === "broken_mug") {
      currentTarget.checkedInLoop = state.loop;
      audio.playFloorCreak();
      const info =
        state.loop === 1 ? LOOP_STORY.brokenMug[1] : LOOP_STORY.brokenMug[2];
      showSubtitle(info.speaker, info.text, 5400);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "rain_puddle") {
      currentTarget.checkedInLoop = state.loop;
      audio.playWaterDrip();
      const info =
        state.loop <= 2 ? LOOP_STORY.rainPuddle[2] : LOOP_STORY.rainPuddle[3];
      showSubtitle(info.speaker, info.text, 5400);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "smartphone") {
      currentTarget.checkedInLoop = state.loop;
      audio.playClockTick();
      if (state.loop === 1) {
        showSubtitle(
          "Điện thoại trên bàn",
          "Màn hình tối om, đồng hồ đứng ở 02:14 và báo Không có dịch vụ. Lạ thật, sao Alice không nhắn gì cả?",
          5600,
        );
      } else if (state.loop === 2) {
        showSubtitle(
          "Điện thoại trên bàn",
          "Vẫn là 02:14 không thông báo... nhưng góc máy có biểu tượng chuông gạch chéo. Mình bật Im lặng từ lúc nào?",
          5600,
        );
      } else if (state.loop === 3) {
        state.phoneCheckedLoop3 = true;
        if (state.anomaliesFound + 1 >= state.anomaliesRequired) {
          objectiveText.textContent = "Đã xem nhật ký cuộc gọi → vào phòng làm việc kiểm tra tờ lịch";
        }
        showSubtitle(
          "Màn hình sáng đỏ · 02:08",
          "4 cuộc gọi nhỡ từ Alice lúc 02:08 ngày 14/11 — khi máy đang bật Im lặng! Khoan đã... hôm nay thật sự là ngày mấy?",
          6000,
          true,
        );
      } else {
        showSubtitle(
          "Tin nhắn thoại · 02:09",
          "Màn hình hiện 1 tin nhắn thoại dài 34 giây từ Alice gửi lúc 02:09, ngay sau khi cô ấy gõ cửa mà không ai mở.",
          6000,
        );
      }
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "clock_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playClockTick();
      const info =
        LOOP_STORY.anomalyClock[state.loop] || LOOP_STORY.anomalyClock[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "chair_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playFloorCreak();
      const info =
        LOOP_STORY.anomalyChair[state.loop] || LOOP_STORY.anomalyChair[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "portrait_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playHeavyBreath(0.2);
      const info =
        LOOP_STORY.anomalyPortrait[state.loop] || LOOP_STORY.anomalyPortrait[1];
      showSubtitle(info.speaker, info.text, 5200);
      ctx.recordAnomalyFound();
    } else if (currentTarget.type === "scrawl_anomaly") {
      currentTarget.checkedInLoop = state.loop;
      audio.playWoodScratch(3);
      if (state.loop === 5 && state.puzzleColorOrder.length === 4) {
        const seqStr = state.puzzleColorOrder.map((c) => c.name).join(" → ");
        showSubtitle(
          "Thứ tự 4 màu trên tường",
          `Thứ tự nhập mật mã hộp hồ sơ: ${seqStr}. Hãy tìm 4 chữ số màu ở mặt sau giấy bếp, tủ lạnh, tủ quần áo và gương phòng tắm!`,
          7000,
          false,
        );
        const t = "Vòng 5 · Thứ tự màu mật mã";
        if (!state.journalNotes.some((n) => n.title === t)) {
          state.journalNotes.push({ title: t, text: `Thứ tự màu trên tường phòng khách: ${seqStr}.` });
          renderJournal(state, { journalList, journalTimeline, journalChoices });
        }
      } else {
        const info =
          LOOP_STORY.anomalyScrawl[state.loop] || LOOP_STORY.anomalyScrawl[2];
        showSubtitle(info.speaker, info.text, 5400, true);
      }
      ctx.recordAnomalyFound();
    } else if (
      currentTarget.type === "study_key" &&
      state.loop === 1 &&
      !state.studyKeyFound
    ) {
      state.studyKeyFound = true;
      puzzles.studyKeyGroup.visible = false;
      audio.playMemoryChime(false);
      objectiveText.textContent =
        "Đã có chìa khóa → mở cửa phòng làm việc bên phải";
      showSubtitle(
        "Chìa khóa đồng",
        "Tìm thấy chìa khóa phòng làm việc rồi. Ra mở cửa bên phải phòng khách xem thử.",
        4800,
      );
    } else if (
      currentTarget.type === "breaker" &&
      state.loop === 2 &&
      !state.breakerFixed
    ) {
      completeBreakerFix();
    } else if (currentTarget.type === "bath_mirror") {
      currentTarget.checkedInLoop = state.loop;
      if (state.loop === 3 && !state.bathEscaped) {
        state.bathEscaped = true;
        audio.playDoorCreak(false);
        objectiveText.textContent = "Cửa phòng tắm mở chốt rồi → kiểm tra điện thoại sáng đỏ ngoài phòng khách";
      }
      ctx.recordAnomalyFound();
      if (state.loop === 1) {
        audio.playHeavyBreath(0.18);
        showSubtitle(
          LOOP_STORY.bathMirror1.speaker,
          LOOP_STORY.bathMirror1.text,
          5600,
        );
      } else if (state.loop === 2) {
        audio.playGlassCrack();
        audio.playScareChord();
        materials.bathMirrorMat.map = materials.bathMirrorGhostTex;
        materials.bathMirrorMat.needsUpdate = true;
        state.shakeTime = 0.45;
        state.fear = Math.min(95, state.fear + 26);
        showSubtitle(
          LOOP_STORY.bathMirror2.speaker,
          LOOP_STORY.bathMirror2.text,
          6000,
          true,
        );
        timers.setTimeout(() => {
          materials.bathMirrorMat.map = materials.bathMirrorFogTex;
          materials.bathMirrorMat.needsUpdate = true;
        }, 650);
      } else if (state.loop === 5 && state.puzzleClues && state.puzzleClues.bath) {
        const bc = state.puzzleClues.bath;
        audio.playHeavyBreath(0.24);
        showSubtitle(
          "Gương phòng tắm · Mảnh mã màu",
          `Trên mặt gương nứt hiện vòng tròn màu ${bc.name} với chữ số ${bc.digit}.`,
          6000,
        );
        const t = `Vòng 5 · Mã màu ${bc.name}`;
        if (!state.journalNotes.some((n) => n.title === t)) {
          state.journalNotes.push({ title: t, text: `Tìm thấy trên gương phòng tắm: Màu ${bc.name} = số ${bc.digit}.` });
          renderJournal(state, { journalList, journalTimeline, journalChoices });
        }
      } else {
        audio.playHeavyBreath(0.24);
        showSubtitle(
          LOOP_STORY.bathMirror3.speaker,
          LOOP_STORY.bathMirror3.text,
          6000,
        );
      }
    } else if (currentTarget.type === "bath_faucet") {
      const wasRunning = currentTarget.running;
      currentTarget.running = false;
      currentTarget.dripping = false;
      house.objects.bathWaterMesh.visible = false;
      audio.playFaucetToggle(true);
      if (state.loop === 3 && !state.bathEscaped) {
        state.bathEscaped = true;
        objectiveText.textContent = "Cửa phòng tắm hết kẹt rồi → soi gương hoặc ra kiểm tra điện thoại sáng đỏ";
      }
      const info = wasRunning ? LOOP_STORY.bathFaucet2 : LOOP_STORY.bathFaucet1;
      showSubtitle(info.speaker, info.text, 5400, wasRunning);
    } else if (currentTarget.type === "kitchen_faucet") {
      const wasRunning = currentTarget.running;
      currentTarget.running = false;
      currentTarget.dripping = false;
      house.objects.kitchenWaterMesh.visible = false;
      audio.playFaucetToggle(true);
      const info = wasRunning
        ? LOOP_STORY.kitchenFaucet2
        : LOOP_STORY.kitchenFaucet1;
      showSubtitle(info.speaker, info.text, 5400, wasRunning);
    } else if (currentTarget.type === "fridge") {
      currentTarget.checkedInLoop = state.loop;
      state.fridgeChecked = true;
      ctx.recordAnomalyFound();
      audio.playDoorCreak(false);
      if (state.loop === 1) {
        house.objects.fridgeObj.targetAngle = 0.85;
        showSubtitle(LOOP_STORY.fridge1.speaker, LOOP_STORY.fridge1.text, 5800);
      } else if (state.loop === 2) {
        house.objects.fridgeObj.targetAngle = 0.08;
        house.lights.fridgeLight.intensity = 0.05;
        state.fear = Math.min(95, state.fear + 18);
        audio.playBreakerSnap();
        showSubtitle(
          LOOP_STORY.fridge2.speaker,
          LOOP_STORY.fridge2.text,
          5800,
          true,
        );
        timers.setTimeout(() => {
          if (state.loop === 2) house.lights.fridgeLight.intensity = 0.85;
        }, 1100);
      } else {
        house.objects.fridgeObj.targetAngle = 1.35;
        audio.playHeavyBreath(0.25);
        openHeldPaperUI("fridge_note", state.loop);
      }
    } else if (currentTarget.type === "kitchen_note") {
      currentTarget.readInLoop = state.loop;
      ctx.recordAnomalyFound();
      audio.playMemoryChime(false);
      const key =
        state.loop === 1
          ? "kitchenNote1"
          : state.loop <= 3
            ? "kitchenNote2"
            : "kitchenNote3";
      const info = LOOP_STORY[key];
      state.journalNotes.push({ title: info.title, text: info.journal });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      openHeldPaperUI("kitchen_note", state.loop);
    } else if (currentTarget.type === "mirror") {
      currentTarget.checkedInLoop = state.loop;
      ctx.recordAnomalyFound();
      if (state.loop === 1) {
        audio.playHeavyBreath(0.2);
        showSubtitle(LOOP_STORY.mirror1.speaker, LOOP_STORY.mirror1.text, 5600);
      } else {
        audio.playGlassCrack();
        audio.playScareChord();
        materials.mirrorMat.map = materials.mirrorGhostTex;
        materials.mirrorMat.needsUpdate = true;
        state.shakeTime = 0.5;
        state.fear = Math.min(95, state.fear + 30);
        showSubtitle(
          LOOP_STORY.mirror2.speaker,
          LOOP_STORY.mirror2.text,
          5800,
          true,
        );
        timers.setTimeout(() => {
          materials.mirrorMat.map = materials.mirrorCrackedTex;
          materials.mirrorMat.needsUpdate = true;
        }, 650);
      }
    } else if (currentTarget.type === "wardrobe") {
      currentTarget.checkedInLoop = state.loop;
      ctx.recordAnomalyFound();
      if (state.loop === 1) {
        audio.playWardrobeCreak(false);
        house.objects.wardrobeObj.targetAngle = -1.35;
        house.objects.wardrobeObj.targetAngle2 = 1.15;
        showSubtitle(
          LOOP_STORY.wardrobe1.speaker,
          LOOP_STORY.wardrobe1.text,
          5600,
        );
      } else if (state.loop === 2) {
        audio.playScareChord();
        audio.playWardrobeSlam();
        house.objects.wardrobeObj.targetAngle = 0;
        house.objects.wardrobeObj.targetAngle2 = 0;
        house.objects.wardrobeDoorPivot.rotation.y = 0;
        house.objects.wardrobeDoorPivot2.rotation.y = 0;
        house.objects.wardrobeEyes.visible = false;
        state.shakeTime = 0.45;
        state.fear = Math.min(95, state.fear + 28);
        showSubtitle(
          LOOP_STORY.wardrobe2.speaker,
          LOOP_STORY.wardrobe2.text,
          5800,
          true,
        );
      } else if (state.loop === 5 && state.puzzleClues && state.puzzleClues.wardrobe) {
        const wc = state.puzzleClues.wardrobe;
        audio.playWoodScratch(4);
        house.objects.wardrobeObj.targetAngle = -1.45;
        house.objects.wardrobeObj.targetAngle2 = 1.35;
        showSubtitle(
          "Vách sau tủ quần áo · Mảnh mã màu",
          `Bên trong vách gỗ khắc vòng tròn màu ${wc.name} với chữ số ${wc.digit}.`,
          6000,
        );
        const t = `Vòng 5 · Mã màu ${wc.name}`;
        if (!state.journalNotes.some((n) => n.title === t)) {
          state.journalNotes.push({ title: t, text: `Tìm thấy trong tủ quần áo: Màu ${wc.name} = số ${wc.digit}.` });
          renderJournal(state, { journalList, journalTimeline, journalChoices });
        }
      } else {
        audio.playWoodScratch(4);
        audio.playHeavyBreath(0.32);
        house.objects.wardrobeObj.targetAngle = -1.45;
        house.objects.wardrobeObj.targetAngle2 = 1.35;
        showSubtitle(
          LOOP_STORY.wardrobe3.speaker,
          LOOP_STORY.wardrobe3.text,
          5800,
          true,
        );
      }
    } else if (currentTarget.type === "phone" && currentTarget.ringing) {
      currentTarget.ringing = false;
      currentTarget.answered = true;
      house.objects.phoneLed.intensity = 0;
      audio.playBreakerSnap();
      audio.playHeavyBreath(0.28);
      showSubtitle(
        LOOP_STORY.phoneCall.speaker,
        LOOP_STORY.phoneCall.text,
        7000,
        true,
      );
      state.journalNotes.push({
        title: `Vòng ${state.loop} — Cuộc gọi từ điện thoại bàn`,
        text:
          state.loop === 2
            ? "Điện thoại bàn tự đổ chuông dù dây đã rút. Đầu dây bên kia là giọng Alice giữa tiếng mưa lớn ở đầu hẻm lúc 02:14..."
            : "Vòng 4: Điện thoại lại réo vang giữa đêm. Giọng Alice đứt quãng giữa tiếng nhiễu rè, trách mình vì sao khóa cửa không nghe máy.",
      });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      ctx.recordAnomalyFound();
      if (state.loop === 2 && !state.breakerFixed) {
        objectiveText.textContent =
          "Vào Nhà bếp bật Hộp cầu dao điện rồi kiểm tra bàn làm việc";
      } else if (state.anomaliesFound >= state.anomaliesRequired) {
        objectiveText.textContent =
          "Vào phòng làm việc bên phải xem manh mối trên bàn";
      }
    } else if (currentTarget.type === "candle" && !currentTarget.lit) {
      if (state.matchTimer <= 0) {
        if (state.matchesLeft > 0)
          toggleOrStrikeMatch(
            state,
            matchSystem.matchGroup,
            matchSystem.matchLight,
            audio,
            ctx.updateHUD,
            showSubtitle,
          );
        else {
          showSubtitle(
            "Không có lửa",
            "Phải quẹt diêm trước đã, rồi mới thắp được nến.",
            3000,
            false,
            true,
          );
          return;
        }
      }
      currentTarget.lit = true;
      currentTarget.flame.visible = true;
      currentTarget.light.intensity = 1.55;
      audio.playMatchStrike();
    } else if (currentTarget.type === "clue" && !state.loopClueFound) {
      if (state.anomaliesFound < state.anomaliesRequired) {
        const left = state.anomaliesRequired - state.anomaliesFound;
        audio.playDoorSlam();
        showSubtitle(
          "Chưa đủ điểm bất thường",
          `Căn nhà này vẫn còn ${left} điểm bất thường bạn chưa kiểm tra (đồng hồ, ghế ăn, khung ảnh, chữ tường, gương hoặc tủ lạnh).`,
          5400,
        );
        return;
      }
      if (state.loop === 2 && !state.breakerFixed) {
        audio.playDoorSlam();
        showSubtitle(
          "Mất điện tối om",
          "Đèn bàn làm việc tắt ngấm không nhìn rõ chữ... Cần vào Nhà bếp (bên trái phòng khách) bật lại Hộp cầu dao điện trước.",
          5200,
        );
        return;
      }
      if (state.loop === 2 && !state.fridgeChecked) {
        audio.playDoorSlam();
        showSubtitle(
          "Chưa kiểm tra tủ lạnh",
          "Tủ lạnh trong Nhà bếp vẫn đang hở sáng bất thường... Hãy kiểm tra bên trong trước khi xem hóa đơn.",
          5000,
        );
        return;
      }
      if (state.loop === 3 && !state.phoneCheckedLoop3) {
        audio.playDoorSlam();
        showSubtitle(
          "Điện thoại ngoài phòng khách",
          "Chiếc điện thoại trên bàn phòng khách đang sáng đỏ bất thường... Hãy kiểm tra nó trước.",
          5000,
        );
        return;
      }
      if (state.loop === 4 && !state.tvTurnedOff) {
        audio.playDoorSlam();
        showSubtitle(
          "Tiếng nhiễu quá ồn",
          "Màn hình TV nhiễu hạt ngoài phòng khách đang kêu chói tai khiến đầu óc quay cuồng... Hãy ra tắt TV trước.",
          5000,
        );
        return;
      }
      if (state.loop === TOTAL_LOOPS && !state.codeUnlocked) {
        keypadController.openKeypad();
        return;
      }
      state.loopClueFound = true;
      puzzles.clueGroup.visible = false;
      const info = LOOP_STORY[state.loop];
      audio.playMemoryChime(state.loop === TOTAL_LOOPS);
      state.journalNotes.push({
        title: `Vòng ${state.loop} — ${info.clueTitle}`,
        text: info.journal,
      });
      renderJournal(state, { journalList, journalTimeline, journalChoices });
      openHeldPaperUI("clue", state.loop);
    } else if (currentTarget.type === "hpl_drawer") {
      const dr = currentTarget;
      dr.isOpen = !dr.isOpen;
      dr.targetDist = dr.isOpen ? dr.maxSlide : 0;
      audio.playDoorCreak(!dr.isOpen);
      if (dr.isOpen && dr.inspectedInLoop !== state.loop) {
        dr.inspectedInLoop = state.loop;
        showSubtitle("Ý nghĩ", dr.noteText, 4600);
      }
    } else if (currentTarget.type === "door") {
      if (currentTarget.isFrontDoor) {
        if (!state.loopClueFound) {
          audio.playDoorSlam();
          showSubtitle(
            "Cửa chính khóa chặt",
            LOOP_STORY[state.loop].doorLockedText,
            4800,
          );
          return;
        }
        if (state.loop < TOTAL_LOOPS) {
          if (state.loop === 1 || state.loop === 4) audio.playThreeKnocks();
          else audio.playDoorCreak(false);
          openChoiceModal(state.loop, ctx);
        } else {
          audio.playDoorCreak(false);
          currentTarget.isOpen = true;
          currentTarget.targetOffset = -Math.PI * 0.55;
          currentTarget.collider.active = false;
        }
        return;
      }
      if (
        currentTarget.id === "door_study" &&
        state.loop === 1 &&
        !state.studyKeyFound
      ) {
        audio.playDoorSlam();
        showSubtitle(
          "Cửa phòng làm việc đang khóa",
          "Mình đã khóa cửa phòng làm việc rồi... Thử tìm chiếc chìa khóa đồng quanh tủ ngăn kéo phòng ngủ, kệ sách phòng khách hoặc trong nhà bếp.",
          5400,
        );
        return;
      }
      if (
        currentTarget.id === "door_bathroom" &&
        state.loop === 3 &&
        !state.bathEscaped
      ) {
        audio.playDoorSlam();
        currentTarget.rattleTime = 0.28;
        showSubtitle(
          "Cửa phòng tắm bị kẹt!",
          "Tay nắm kẹt cứng trong hơi nước... Hãy khóa vòi nước hoặc nhìn lên mặt gương phía sau trước đã.",
          4800,
        );
        return;
      }
      if (
        currentTarget.id === "door_study" &&
        state.loop === 4 &&
        !state.tvTurnedOff
      ) {
        audio.playDoorSlam();
        currentTarget.rattleTime = 0.28;
        showSubtitle(
          "Cửa phòng làm việc kẹt chặt",
          "Tiếng nhiễu TV ngoài phòng khách đang dội thẳng vào tai... Hãy tắt chiếc TV nhiễu hạt trước.",
          4800,
        );
        return;
      }
      const willClose = currentTarget.isOpen;
      currentTarget.isOpen = !currentTarget.isOpen;
      currentTarget.targetOffset = currentTarget.isOpen ? -Math.PI * 0.48 : 0;
      currentTarget.collider.active = !currentTarget.isOpen;
      audio.playDoorCreak(willClose);
    }
    ctx.updateHUD();
  }

  // =========================================================
  // 6. INPUT EVENT LISTENERS (KEYBOARD, MOUSE, TOUCH)
  // =========================================================
  window.addEventListener("keydown", (e) => {
    if (document.body.classList.contains("auth-locked")) return;
    if (licensesScreen && !licensesScreen.classList.contains("hidden")) {
      if (e.code === "Escape") licensesScreen.classList.add("hidden");
      return;
    }
    if (warningScreen && !warningScreen.classList.contains("hidden")) {
      if (e.code === "Escape") {
        warningScreen.classList.add("hidden");
      } else if (e.code === "Enter" || e.code === "Space" || e.code === "KeyE") {
        audio.init();
        warningScreen.classList.add("hidden");
        startNewGame(true, ctx);
      }
      return;
    }
    if (state.inIntro) {
      beginLoop1AfterIntro(ctx);
      return;
    }
    keys[e.code] = true;

    if (!choiceScreen.classList.contains("hidden")) {
      if (e.key === "1") {
        audio.init();
        resolveMoralChoice(state.choiceSwapped ? "avoid" : "confront", ctx);
        return;
      }
      if (e.key === "2") {
        audio.init();
        resolveMoralChoice(state.choiceSwapped ? "confront" : "avoid", ctx);
        return;
      }
      return;
    }

    if (!keypadScreen.classList.contains("hidden")) {
      if (e.code === "Escape") {
        keypadController.closeKeypad();
        return;
      }
      if (e.code === "Backspace") {
        keypadController.pushKeypadDigit("backspace");
        return;
      }
      if (e.code === "Enter") {
        keypadController.submitKeypad();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        keypadController.pushKeypadDigit(e.key);
        return;
      }
      return;
    }

    if (e.code === "Escape") {
      if (!settingsScreen.classList.contains("hidden")) {
        settingsController.closeSettings();
        return;
      }
      if (!journalScreen.classList.contains("hidden")) {
        toggleJournal(
          state,
          { journalScreen, settingsScreen, pauseOverlay },
          () =>
            renderJournal(state, {
              journalList,
              journalTimeline,
              journalChoices,
            }),
          clearKeys,
        );
        return;
      }
      if (state.holdingPaper) {
        lowerHeldPaperUI();
        return;
      }
      if (pauseOverlay && !pauseOverlay.classList.contains("hidden")) {
        resumeFromPause();
        return;
      }
      if (state.running && !state.ended && !state.inIntro && !isAnyModalOpen()) {
        openPauseOverlay();
        return;
      }
    }

    if (e.code === "KeyO" && !state.ended) {
      settingsController.toggleSettings();
      return;
    }

    if (!state.running || state.ended) return;
    if (e.code === "KeyF")
      toggleOrStrikeMatch(
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        audio,
        ctx.updateHUD,
        showSubtitle,
      );
    if (
      shadowEvent.voicemailHold &&
      (e.code === "KeyE" || e.code === "Space" || e.code === "Enter")
    ) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (state.holdingPaper && (e.code === "KeyR" || e.code === "Space")) {
      e.preventDefault();
      flipHeldPaper();
      return;
    }
    if (e.code === "KeyE") triggerInteract();
    if (e.code === "KeyJ")
      toggleJournal(
        state,
        { journalScreen, settingsScreen, pauseOverlay },
        () =>
          renderJournal(state, {
            journalList,
            journalTimeline,
            journalChoices,
          }),
        clearKeys,
      );
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  window.addEventListener("blur", clearKeys);

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  subtitleBox.addEventListener("click", () => {
    if (shadowEvent.voicemailHold) advanceVoicemailSequence(ctx);
  });

  container.addEventListener("contextmenu", (e) => e.preventDefault());

  container.addEventListener("mousedown", (e) => {
    if (shadowEvent.voicemailHold) {
      advanceVoicemailSequence(ctx);
      return;
    }
    if (!state.running || state.paused || state.ended || state.holdingPaper)
      return;
    audio.init();

    if (e.button === 2) return;

    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;

    // First click while unlocked acquires Pointer Lock only (avoids accidental HPL grab/throw)
    if (
      e.button === 0 &&
      container.requestPointerLock &&
      document.pointerLockElement !== container
    ) {
      try {
        container.requestPointerLock();
      } catch (_) {}
      return;
    }

    // All doors, drawers & breaker use crisp [E] interaction
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      isDragging = false;
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (state.holdingPaper && paperTiltWrap) {
      if (document.pointerLockElement === container) {
        state.paperTiltY = Math.max(-22, Math.min(22, state.paperTiltY + e.movementX * 0.08));
        state.paperTiltX = Math.max(-16, Math.min(16, state.paperTiltX - e.movementY * 0.08));
      } else {
        const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
        state.paperTiltY = nx * 16;
        state.paperTiltX = -ny * 12;
      }
      paperTiltWrap.style.transform = `rotateX(${state.paperTiltX.toFixed(1)}deg) rotateY(${state.paperTiltY.toFixed(1)}deg)`;
      return;
    }
    if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
      return;
    const sens = settings.sensitivity;
    let dx = 0;
    let dy = 0;

    if (document.pointerLockElement === container) {
      dx = e.movementX;
      dy = e.movementY;
    } else if (isDragging) {
      dx = e.clientX - lastX;
      dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    } else {
      return;
    }

    const mult = document.pointerLockElement === container ? 0.0022 : 0.0045;
    const ySign = settings.invertY ? -1 : 1;
    state.targetYaw -= dx * mult * sens;
    state.targetPitch = Math.max(
      -1.15,
      Math.min(1.15, state.targetPitch - dy * mult * sens * ySign),
    );
    if (!settings.camSmooth) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
    }
  });

  // Touch Support
  let touchLookId = null;
  container.addEventListener(
    "touchstart",
    (e) => {
      if (!state.running || state.paused || state.ended) return;
      audio.init();
      if (touchLookId === null && e.changedTouches.length > 0) {
        touchLookId = e.changedTouches[0].identifier;
        lastX = e.changedTouches[0].clientX;
        lastY = e.changedTouches[0].clientY;
      }
    },
    { passive: true },
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (
        !state.running ||
        state.paused ||
        state.ended ||
        state.wakingTimer > 0
      )
        return;
      const sens = settings.sensitivity;
      for (const t of e.changedTouches) {
        if (t.identifier === touchLookId) {
          const dx = t.clientX - lastX;
          const dy = t.clientY - lastY;
          lastX = t.clientX;
          lastY = t.clientY;
          state.targetYaw -= dx * 0.0055 * sens;
          state.targetPitch = Math.max(
            -1.15,
            Math.min(1.15, state.targetPitch - dy * 0.0055 * sens),
          );
          if (!settings.camSmooth) {
            state.yaw = state.targetYaw;
            state.pitch = state.targetPitch;
          }
        }
      }
    },
    { passive: true },
  );

  container.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchLookId) touchLookId = null;
    }
  });

  document.querySelectorAll(".pad-btn").forEach((btn) => {
    const code = btn.getAttribute("data-key");
    const down = (ev) => {
      ev.preventDefault();
      audio.init();
      keys[code] = true;
    };
    const up = (ev) => {
      ev.preventDefault();
      keys[code] = false;
    };
    btn.addEventListener("mousedown", down);
    btn.addEventListener("mouseup", up);
    btn.addEventListener("mouseleave", up);
    btn.addEventListener("touchstart", down, { passive: false });
    btn.addEventListener("touchend", up, { passive: false });
  });

  // Auto-save Continue Button & Auto-Pause Overlay helpers
  function isAnyModalOpen() {
    return (
      !startScreen.classList.contains("hidden") ||
      introScreen.classList.contains("active") ||
      !settingsScreen.classList.contains("hidden") ||
      !journalScreen.classList.contains("hidden") ||
      !keypadScreen.classList.contains("hidden") ||
      !choiceScreen.classList.contains("hidden") ||
      !endingScreen.classList.contains("hidden") ||
      (paperOverlay && !paperOverlay.classList.contains("hidden")) ||
      (warningScreen && !warningScreen.classList.contains("hidden")) ||
      (licensesScreen && !licensesScreen.classList.contains("hidden"))
    );
  }

  function refreshContinueButton() {
    if (!btnContinue || !btnStart) return;
    const saved = loadSavedRun();
    if (saved) {
      btnContinue.textContent = `Tiếp tục · Vòng ${saved.loop}/${TOTAL_LOOPS}`;
      btnContinue.classList.remove("hidden");
      btnStart.textContent = "Chơi mới";
    } else {
      btnContinue.classList.add("hidden");
      btnStart.textContent = "Chơi mới";
    }
  }

  function openPauseOverlay() {
    if (!pauseOverlay || !state.running || state.ended || state.inIntro) return;
    state.paused = true;
    clearKeys();
    isDragging = false;
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (_) {}
    }
    pauseOverlay.classList.remove("hidden");
  }

  function resumeFromPause() {
    if (!pauseOverlay) return;
    pauseOverlay.classList.add("hidden");
    state.paused = false;
    audio.init();
    if (container.requestPointerLock) {
      try {
        container.requestPointerLock();
      } catch (_) {}
    }
  }

  function returnToTitleScreen() {
    timers.clearAll();
    clearIntroTimers();
    clearFinaleTimers();
    clearKeys();
    isDragging = false;
    if (paperOverlay) paperOverlay.classList.add("hidden");
    state.holdingPaper = false;
    state.holdingPaperSource = null;
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (_) {}
    }
    audio.stopEndingMelody();
    state.running = false;
    state.paused = false;
    state.inIntro = false;
    state.ended = false;
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    journalScreen.classList.add("hidden");
    keypadScreen.classList.add("hidden");
    choiceScreen.classList.add("hidden");
    endingScreen.classList.add("hidden");
    introScreen.classList.remove("active");
    document.body.classList.add("pre-start");
    refreshContinueButton();
    startScreen.classList.remove("hidden");
  }

  let wasPointerLocked = false;
  document.addEventListener("pointerlockchange", () => {
    const locked = document.pointerLockElement === container;
    if (
      wasPointerLocked &&
      !locked &&
      state.running &&
      !state.paused &&
      !state.ended &&
      !state.inIntro &&
      !shadowEvent.voicemailHold &&
      !isAnyModalOpen()
    ) {
      openPauseOverlay();
    }
    wasPointerLocked = locked;
  });

  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      state.running &&
      !state.paused &&
      !state.ended &&
      !state.inIntro &&
      !isAnyModalOpen()
    ) {
      openPauseOverlay();
    }
  });

  if (btnResume) btnResume.addEventListener("click", resumeFromPause);
  if (btnPauseSettings) {
    btnPauseSettings.addEventListener("click", () => {
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      settingsController.toggleSettings();
    });
  }
  if (btnPauseTitle) btnPauseTitle.addEventListener("click", returnToTitleScreen);

  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      const saved = loadSavedRun();
      if (!saved) {
        refreshContinueButton();
        return;
      }
      audio.init();
      audio.stopEndingMelody();
      timers.clearAll();
      clearIntroTimers();
      clearFinaleTimers();
      state.choices = saved.choices.slice();
      state.journalNotes = saved.journalNotes.slice();
      state.courageScore = saved.courageScore;
      state.denialScore = saved.denialScore;
      state.matchesLeft = saved.matchesLeft;
      state.ended = false;
      state.paused = false;
      state.inIntro = false;
      state.running = true;
      document.body.classList.remove("pre-start");
      startScreen.classList.add("hidden");
      if (pauseOverlay) pauseOverlay.classList.add("hidden");
      ctx.renderJournal();
      ctx.setupLoopEnvironment(saved.loop);
      const story = LOOP_STORY[saved.loop] || LOOP_STORY[1];
      showSubtitle(story.wakeSpeaker, story.wakeText, 7200);
    });
  }

  refreshContinueButton();

  // Title Screen Vertical Menu Bindings + Subtle Hover/Click Feedback + Keyboard ↑/↓ Navigation
  const titleMenuBtns = Array.from(document.querySelectorAll("#start-screen .menu-btn"));
  let titleSelectedIdx = 0;

  function getVisibleTitleBtns() {
    return titleMenuBtns.filter((b) => !b.classList.contains("hidden"));
  }

  function setTitleFocus(idx) {
    const vis = getVisibleTitleBtns();
    if (vis.length === 0) return;
    titleSelectedIdx = (idx + vis.length) % vis.length;
    vis.forEach((b, i) => b.classList.toggle("is-selected", i === titleSelectedIdx));
  }

  titleMenuBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      const vis = getVisibleTitleBtns();
      const idx = vis.indexOf(btn);
      if (idx >= 0 && idx !== titleSelectedIdx) {
        setTitleFocus(idx);
        if (audio.started) audio.playClockTick();
      }
    });
    btn.addEventListener("click", () => {
      audio.init();
      audio.playClockTick();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (
      document.body.classList.contains("auth-locked") ||
      startScreen.classList.contains("hidden") ||
      (warningScreen && !warningScreen.classList.contains("hidden")) ||
      (licensesScreen && !licensesScreen.classList.contains("hidden")) ||
      !settingsScreen.classList.contains("hidden")
    ) {
      return;
    }
    const vis = getVisibleTitleBtns();
    if (vis.length === 0) return;
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      e.preventDefault();
      audio.init();
      setTitleFocus(titleSelectedIdx + 1);
      audio.playClockTick();
    } else if (e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      audio.init();
      setTitleFocus(titleSelectedIdx - 1);
      audio.playClockTick();
    } else if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      vis[titleSelectedIdx]?.click();
    }
  });

  setTitleFocus(0);

  if (btnTitleSettings) {
    btnTitleSettings.addEventListener("click", () => {
      settingsController.openSettings();
    });
  }

  if (btnTitleExit) {
    btnTitleExit.addEventListener("click", () => {
      try {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } catch (_) {}
      document.body.classList.add("auth-locked");
      if (authGate) authGate.classList.remove("hidden");
      if (authInput) {
        authInput.value = "";
        authInput.focus();
      }
      if (authError) {
        authError.textContent = "Đã thoát phiên thử nghiệm. Bạn có thể đóng tab trình duyệt hoặc đăng nhập lại.";
      }
      try { window.close(); } catch (_) {}
    });
  }

  // UI Button Bindings (Start opens Horror & Photosensitivity Warning first)
  document.getElementById("btn-start").addEventListener("click", () => {
    audio.init();
    if (warningScreen) {
      warningScreen.classList.remove("hidden");
    } else {
      startNewGame(true, ctx);
    }
  });
  if (btnWarningAccept) {
    btnWarningAccept.addEventListener("click", () => {
      audio.init();
      if (warningScreen) warningScreen.classList.add("hidden");
      startNewGame(true, ctx);
    });
  }
  if (btnWarningBack) {
    btnWarningBack.addEventListener("click", () => {
      if (warningScreen) warningScreen.classList.add("hidden");
    });
  }
  if (btnOpenLicenses && licensesScreen) {
    btnOpenLicenses.addEventListener("click", () => {
      if (state.running && !state.ended) {
        state.paused = true;
        clearKeys();
        if (document.pointerLockElement) {
          try { document.exitPointerLock(); } catch (_) {}
        }
      }
      licensesScreen.classList.remove("hidden");
    });
  }
  if (btnCloseLicenses && licensesScreen) {
    btnCloseLicenses.addEventListener("click", () => {
      licensesScreen.classList.add("hidden");
      if (state.running && !state.ended && !isAnyModalOpen() && (!pauseOverlay || pauseOverlay.classList.contains("hidden"))) {
        state.paused = false;
      }
    });
  }
  const btnTestEnding = document.getElementById("btn-test-ending");
  if (btnTestEnding && isDevBuild) {
    btnTestEnding.addEventListener("click", () => startQuickEndingTest(ctx));
  }
  document.getElementById("btn-restart").addEventListener("click", () => {
    audio.init();
    startNewGame(false, ctx);
  });
  if (btnRetryLoop)
    btnRetryLoop.addEventListener("click", () => retryCurrentLoop(ctx));
  introScreen.addEventListener("click", () => {
    if (state.inIntro) beginLoop1AfterIntro(ctx);
  });
  introSkipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.inIntro) beginLoop1AfterIntro(ctx);
  });
  document.getElementById("btn-journal").addEventListener("click", () =>
    toggleJournal(
      state,
      { journalScreen, settingsScreen, pauseOverlay },
      () =>
        renderJournal(state, {
          journalList,
          journalTimeline,
          journalChoices,
        }),
      clearKeys,
    ),
  );
  document.getElementById("btn-close-journal").addEventListener("click", () =>
    toggleJournal(
      state,
      { journalScreen, settingsScreen, pauseOverlay },
      () =>
        renderJournal(state, {
          journalList,
          journalTimeline,
          journalChoices,
        }),
      clearKeys,
    ),
  );
  document
    .getElementById("btn-match")
    .addEventListener("click", () =>
      toggleOrStrikeMatch(
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        audio,
        ctx.updateHUD,
        showSubtitle,
      ),
    );
  document
    .getElementById("btn-interact")
    .addEventListener("click", triggerInteract);
  if (btnFlipPaper) {
    btnFlipPaper.addEventListener("click", () => flipHeldPaper());
  }
  if (btnFlipPaperBack) {
    btnFlipPaperBack.addEventListener("click", () => flipHeldPaper());
  }
  if (btnClosePaper) {
    btnClosePaper.addEventListener("click", () => lowerHeldPaperUI());
  }
  if (btnClosePaperBack) {
    btnClosePaperBack.addEventListener("click", () => lowerHeldPaperUI());
  }
  if (paperOverlay) {
    paperOverlay.addEventListener("click", (ev) => {
      if (ev.target === paperOverlay) lowerHeldPaperUI();
    });
  }

  // Choice Dialog Buttons (respects per-loop choice order)
  if (btnChoiceA)
    btnChoiceA.addEventListener("click", () => {
      audio.init();
      resolveMoralChoice(state.choiceSwapped ? "avoid" : "confront", ctx);
    });
  if (btnChoiceB)
    btnChoiceB.addEventListener("click", () => {
      audio.init();
      resolveMoralChoice(state.choiceSwapped ? "confront" : "avoid", ctx);
    });

  // Ending Switcher Buttons
  document.querySelectorAll(".ending-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.init();
      showEndingScreen(btn.getAttribute("data-ending"), ctx);
    });
  });

  // Foley Preview Panel
  btnFoley.addEventListener("click", () => {
    audio.init();
    const open = foleyPanel.classList.toggle("hidden") === false;
    btnFoley.classList.toggle("active", open);
    if (open && document.pointerLockElement) document.exitPointerLock();
  });
  document.getElementById("btn-close-foley").addEventListener("click", () => {
    foleyPanel.classList.add("hidden");
    btnFoley.classList.remove("active");
  });
  document.querySelectorAll(".foley-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.init();
      const sfx = btn.getAttribute("data-sfx");
      if (sfx === "door_open") audio.playDoorCreak(false);
      else if (sfx === "door_close") audio.playDoorCreak(true);
      else if (sfx === "wardrobe_open") audio.playWardrobeCreak(false);
      else if (sfx === "wardrobe_slam") audio.playWardrobeSlam();
      else if (sfx === "portrait_fall") audio.playPortraitFall();
      else if (sfx === "wood_scratch") audio.playWoodScratch(5);
      else if (sfx === "fox_cry") audio.playFoxCry(false);
      else if (sfx === "door_knock") audio.playThreeKnocks();
      else if (sfx === "scare_sting") audio.playScareChord();
      else if (sfx === "floor_creak") audio.playFloorCreak();
    });
  });

  // Audio / Voice Toggle
  const btnVoice = document.getElementById("btn-voice");
  btnVoice.addEventListener("click", () => {
    narrator.enabled = !narrator.enabled;
    if (!narrator.enabled) narrator.stop();
    btnVoice.textContent = narrator.enabled ? "Giọng kể: Bật" : "Giọng kể: Tắt";
  });

  const btnMute = document.getElementById("btn-mute");
  btnMute.addEventListener("click", () => {
    audio.init();
    audio.setMuted(!audio.muted);
    if (audio.muted) narrator.stop();
    btnMute.textContent = audio.muted ? "Âm thanh: Tắt" : "Âm thanh: Bật";
  });

  const touchPad = document.getElementById("touch-pad");
  document
    .getElementById("btn-pad-toggle")
    .addEventListener("click", () => touchPad.classList.toggle("show"));

  // Window Resize
  window.addEventListener("resize", () => {
    const w = Math.max(1, container.clientWidth || window.innerWidth || 1280);
    const h = Math.max(1, container.clientHeight || window.innerHeight || 720);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (document.hidden) return;
    if (state.running && (state.paused || state.ended)) return;

    const preset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, preset.maxDpr),
    );
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
  });

  // =========================================================
  // 7. ANIMATION & RENDER LOOP
  // =========================================================
  let lastFrameTime = performance.now();
  let lastRenderTime = lastFrameTime;
  let animFrameId = null;
  let tvFrameSkip = 0;
  let fpsFrameCount = 0;
  let fpsLastSample = lastFrameTime;
  let dripTimer = 2.4;
  let clockTickTimer = 0;
  let clockMinutesBack = 14;
  let rainFrameSkip = 0;
  let lightningCooldown = 14.0 + Math.random() * 10.0;
  let lightningTimer = 0;

  const _tvPos = new THREE.Vector3(-3.85, 0.9, -6.6);

  function animate(now) {
    animFrameId = requestAnimationFrame(animate);

    // Frame Pacing
    if (settings.fpsLimit > 0) {
      const frameInterval = 1000 / settings.fpsLimit;
      const elapsed = now - lastRenderTime;
      if (elapsed < frameInterval - 0.5) return;
      lastRenderTime = now - (elapsed % frameInterval);
    } else {
      lastRenderTime = now;
    }

    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;
    const tSec = now / 1000;

    // Real-time FPS Meter
    fpsFrameCount++;
    if (now - fpsLastSample >= 400) {
      const fps = Math.round((fpsFrameCount * 1000) / (now - fpsLastSample));
      fpsFrameCount = 0;
      fpsLastSample = now;
      if (settings.showFps) {
        fpsBadge.textContent = `FPS: ${fps}`;
        fpsBadge.classList.toggle("fps-low", fps < 30);
        fpsBadge.classList.toggle("fps-mid", fps >= 30 && fps < 50);
      }
    }

    const preset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;

    // Dust particles drift
    if (house.objects.dustPoints && house.objects.dustPoints.visible) {
      house.objects.dustPoints.position.y = Math.sin(tSec * 0.4) * 0.08;
      house.objects.dustPoints.rotation.y = tSec * 0.012;
    }

    // Clue & key rotation
    if (!state.loopClueFound && puzzles.clueMesh) {
      puzzles.clueMesh.rotation.y += dt * 0.8;
      puzzles.clueMesh.position.y = Math.sin(tSec * 2.2) * 0.03;
    }
    if (puzzles.studyKeyGroup && puzzles.studyKeyGroup.visible) {
      puzzles.studyKeyGroup.rotation.y += dt * 1.4;
      puzzles.studyKeyLight.intensity = 0.42 + Math.sin(tSec * 5) * 0.14;
    }

    // Breaker guide light flicker in loop 2
    if (state.loop === 2 && !state.breakerFixed) {
      puzzles.breakerLight.intensity = Math.sin(tSec * 9) > 0 ? 1.25 : 0.15;
      house.lights.kitchenGuideLight.intensity =
        Math.sin(tSec * 9) > 0 ? 1.0 : 0.2;
    }

    // Siren red/blue in loop 5
    if (state.loop === 5) {
      const flash = Math.sin(tSec * 11.5);
      house.lights.ambRedLight.intensity = flash > 0.2 ? 2.4 : 0.05;
      house.lights.ambBlueLight.intensity = flash < -0.2 ? 2.2 : 0.05;
    } else if (
      house.lights.ambRedLight.intensity > 0 ||
      house.lights.ambBlueLight.intensity > 0
    ) {
      house.lights.ambRedLight.intensity = 0;
      house.lights.ambBlueLight.intensity = 0;
    }

    // Smartphone screen glow
    if (state.loop >= 2) {
      house.lights.smLight.intensity = 0.45 + Math.sin(tSec * 4.5) * 0.25;
    }

    // Alarm Clock ticking
    clockTickTimer += dt;
    if (clockTickTimer >= 1.0) {
      clockTickTimer = 0;
      if (state.loop === 1) {
        house.objects.drawClockFace(
          Math.floor(tSec) % 4 === 0 ? "02:13" : "02:14",
        );
      } else if (state.loop === 3 || state.loop === 5) {
        clockMinutesBack = clockMinutesBack <= 0 ? 14 : clockMinutesBack - 1;
        house.objects.drawClockFace(
          `02:${String(clockMinutesBack).padStart(2, "0")}`,
        );
      } else if (state.loop === 4) {
        house.objects.drawClockFace(
          Math.floor(tSec) % 2 === 0 ? "ERR!" : "02:14",
        );
      }
    }

    // Candles flicker
    for (let i = 0; i < puzzles.candles.length; i++) {
      const c = puzzles.candles[i];
      if (c.lit) c.light.intensity = 1.45 + Math.sin(tSec * 12 + i * 3) * 0.14;
    }

    // Rain on windows (throttled canvas upload)
    const rainMod = Math.max(4, preset.tvSkip);
    rainFrameSkip = (rainFrameSkip + 1) % rainMod;
    if (rainFrameSkip === 0) {
      house.updateWindowRain(
        dt * rainMod,
        shadowEvent.mode === "loop3_chase",
      );
    }

    // TV static noise (only upload texture when near living room and TV is still on)
    if (state.loop >= 2 && !(state.loop === 4 && state.tvTurnedOff)) {
      house.lights.tvLight.intensity =
        1.05 + Math.sin(tSec * 29) * 0.25 + Math.cos(tSec * 43) * 0.15;
      tvFrameSkip = (tvFrameSkip + 1) % preset.tvSkip;
      if (tvFrameSkip === 0 && state.pos.distanceToSquared(_tvPos) < 85) {
        updateTVStatic();
      }
    }

    // Item glints
    for (let i = 0; i < puzzles.itemGlints.length; i++) {
      const gl = puzzles.itemGlints[i];
      if (!gl.isActiveFn()) {
        gl.sprite.visible = false;
        continue;
      }
      const d = state.pos.distanceTo(gl.basePos);
      if (d < 4.8) {
        gl.sprite.visible = true;
        const prox = 1 - d / 4.8;
        const boost = state.matchTimer > 0 ? 1.0 : 0.55;
        gl.sprite.material.opacity =
          prox * boost * (0.42 + Math.sin(tSec * 4.5 + i * 1.7) * 0.26);
        const sc = 0.17 + Math.sin(tSec * 4.5 + i) * 0.04;
        gl.sprite.scale.set(sc, sc, 1);
      } else {
        gl.sprite.visible = false;
      }
    }

    // Phone vibration & LED
    if (house.objects.phoneObj.ringing) {
      house.objects.phoneLed.intensity = Math.sin(tSec * 18) > 0 ? 1.5 : 0.1;
      house.objects.phoneGroup.rotation.z = Math.sin(tSec * 45) * 0.04;
    } else if (house.objects.phoneGroup.rotation.z !== 0) {
      house.objects.phoneGroup.rotation.z = 0;
    }

    // Smooth door swing/rattle & drawer slide (triggered via [E])
    const doorLerp = 1 - Math.exp(-5.5 * dt);
    for (let i = 0; i < doors.length; i++) {
      const d = doors[i];
      d.currentOffset += (d.targetOffset - d.currentOffset) * doorLerp;
      let rattle = 0;
      if (d.rattleTime > 0) {
        d.rattleTime = Math.max(0, d.rattleTime - dt);
        rattle = Math.sin(tSec * 65) * 0.032 * (d.rattleTime / 0.28);
      }
      d.pivot.rotation.y = d.baseRotY + d.currentOffset + rattle;
    }
    const drawerLerp = 1 - Math.exp(-8.5 * dt);
    for (let i = 0; i < puzzles.hplDrawers.length; i++) {
      const dr = puzzles.hplDrawers[i];
      const target = dr.targetDist || 0;
      if (Math.abs(dr.openDist - target) > 0.001) {
        dr.openDist += (target - dr.openDist) * drawerLerp;
        dr.group.position.copy(dr.basePos).addScaledVector(dr.slideAxis, dr.openDist);
        dr.worldPos.copy(dr.group.position).addScaledVector(dr.slideAxis, 0.2);
      }
    }

    // Wardrobe (both doors) & Fridge smooth door opening lerp
    house.objects.wardrobeDoorPivot.rotation.y +=
      (house.objects.wardrobeObj.targetAngle -
        house.objects.wardrobeDoorPivot.rotation.y) *
      (1 - Math.exp(-3.8 * dt));
    house.objects.wardrobeDoorPivot2.rotation.y +=
      ((house.objects.wardrobeObj.targetAngle2 || 0) -
        house.objects.wardrobeDoorPivot2.rotation.y) *
      (1 - Math.exp(-3.8 * dt));
    house.objects.fridgeDoorPivot.rotation.y +=
      (house.objects.fridgeObj.targetAngle -
        house.objects.fridgeDoorPivot.rotation.y) *
      (1 - Math.exp(-4.0 * dt));

    // Water ripple scaling
    if (house.objects.kitchenWaterMesh.visible) {
      const ws = 0.85 + Math.sin(tSec * 28) * 0.15;
      house.objects.kitchenWaterMesh.scale.set(ws, 1, ws);
    }
    if (house.objects.bathWaterMesh.visible) {
      const ws = 0.85 + Math.cos(tSec * 26) * 0.15;
      house.objects.bathWaterMesh.scale.set(ws, 1, ws);
    }

    // Bathroom light flicker
    if (
      state.loop >= 2 &&
      (state.loop !== 2 || state.breakerFixed) &&
      house.lights.bathLight.intensity > 0.01
    ) {
      const baseBath = state.loop === 2 ? 0.62 : 0.22;
      house.lights.bathLight.intensity =
        Math.sin(tSec * 31) > -0.78 ? baseBath : baseBath * 0.18;
    }
    if (state.loop >= 2 && house.lights.fridgeLight.intensity > 0.1) {
      house.lights.fridgeLight.intensity = 0.85 + Math.sin(tSec * 24) * 0.15;
    }

    if (state.running && !state.paused && !state.ended) {
      // 1. Waking up from bed sequence
      if (state.wakingTimer > 0) {
        state.wakingTimer = Math.max(0, state.wakingTimer - dt);
        const p = 1 - state.wakingTimer / state.wakingDuration;
        const smooth = (t) => {
          const c = Math.max(0, Math.min(1, t));
          return c * c * (3 - 2 * c);
        };

        let eyeOpen = 1;
        if (p < 0.16) eyeOpen = smooth(p / 0.16) * 0.48;
        else if (p < 0.24) eyeOpen = 0.48 - smooth((p - 0.16) / 0.08) * 0.36;
        else if (p < 0.34) eyeOpen = 0.12 + smooth((p - 0.24) / 0.1) * 0.56;
        else if (p < 0.4) eyeOpen = 0.68 - smooth((p - 0.34) / 0.06) * 0.28;
        else if (p < 0.52) eyeOpen = 0.4 + smooth((p - 0.4) / 0.12) * 0.6;
        else eyeOpen = 1;

        const lidPct = (1 - eyeOpen) * 100;
        eyelidTop.style.transform = `translateY(-${100 - lidPct}%)`;
        eyelidBottom.style.transform = `translateY(${100 - lidPct}%)`;
        eyeHaze.style.opacity = ((1 - eyeOpen) * 0.72).toFixed(2);

        let cx, cy, cz, ry, rx, rz;
        if (state.loop === 3 || state.loop === 4) {
          // Disoriented standing wake-up (Bathroom in Loop 3, Living Room TV in Loop 4)
          const tOpen = smooth(p);
          cx = state.pos.x;
          cy = state.pos.y - (1 - tOpen) * 0.08;
          cz = state.pos.z;
          ry = state.yaw;
          rx = state.pitch - (1 - tOpen) * 0.14;
          rz = Math.sin((1 - tOpen) * Math.PI) * 0.06;
        } else if (p < 0.42) {
          const t1 = smooth(p / 0.42);
          cx = -1.62;
          cy = 0.8 + t1 * 0.04;
          cz = 3.65;
          ry = -0.72 + t1 * 0.18;
          rx = 0.38 - t1 * 0.14;
          rz = 0.24 - t1 * 0.06;
        } else if (p < 0.72) {
          const t2 = smooth((p - 0.42) / 0.3);
          cx = -1.62 + (-1.05 - -1.62) * t2;
          cy = 0.84 + (1.34 - 0.84) * t2;
          cz = 3.65 + (3.05 - 3.65) * t2;
          ry = -0.54 + (-0.08 - -0.54) * t2;
          rx = 0.24 + (-0.04 - 0.24) * t2;
          rz = 0.18 * (1 - t2);
        } else {
          const t3 = smooth((p - 0.72) / 0.28);
          if (!state.wakeStepPlayed && t3 > 0.38) {
            state.wakeStepPlayed = true;
            audio.playFootstep(0.24, false);
          }
          const stepDip = Math.sin(t3 * Math.PI) * -0.09;
          cx = -1.05 + (state.pos.x - -1.05) * t3;
          cy = 1.34 + (state.pos.y - 1.34) * t3 + stepDip;
          cz = 3.05 + (state.pos.z - 3.05) * t3;
          ry = -0.08 + (state.yaw - -0.08) * t3;
          rx = -0.04 + (state.pitch - -0.04) * t3;
          rz = Math.sin(t3 * Math.PI) * -0.035;
        }

        camera.position.set(cx, cy, cz);
        camera.rotation.order = "YXZ";
        camera.rotation.y = ry;
        camera.rotation.x = rx;
        camera.rotation.z = rz;

        if (state.wakingTimer === 0) {
          eyelidTop.style.transform = "translateY(-100%)";
          eyelidBottom.style.transform = "translateY(100%)";
          eyeHaze.style.opacity = "0";
        }
        renderer.render(scene, camera);
        return;
      }

      // 2. Player movement
      const { isMoving, sprinting } = updatePlayerMovement(
        dt,
        tSec,
        state,
        camera,
        colliders,
        audio,
        settings,
        shadowEvent,
      );

      // 3. Held document inspection animation
      updateHeldPaper(dt, tSec, state, heldPaperSystem.heldPaperGroup);

      // 4. Match burning
      updateMatch(
        dt,
        tSec,
        state,
        matchSystem.matchGroup,
        matchSystem.matchLight,
        matchSystem.flameMesh,
        matchSystem.flameSprite,
        matchSystem.glowHalo,
        isMoving,
        sprinting,
      );

      // 5. Water faucet drip audio (spatial stereo panned)
      dripTimer -= dt;
      if (dripTimer <= 0) {
        dripTimer = 2.2 + Math.random() * 1.8;
        if (
          house.objects.kitchenFaucetObj.dripping &&
          state.pos.distanceTo(house.objects.kitchenFaucetObj.worldPos) < 6.5
        ) {
          const pan = computeStereoPan(house.objects.kitchenFaucetObj.worldPos, state.pos, _playerRight);
          audio.playWaterDrip(pan);
        } else if (
          house.objects.bathFaucetObj.dripping &&
          state.pos.distanceTo(house.objects.bathFaucetObj.worldPos) < 6.0
        ) {
          const pan = computeStereoPan(house.objects.bathFaucetObj.worldPos, state.pos, _playerRight);
          audio.playWaterDrip(pan);
        }
      }

      // 5b. Storm lightning flashes outside rainy windows + distant thunder
      if (shadowEvent.mode !== "loop3_chase" && !state.holdingPaper) {
        if (lightningTimer > 0) {
          lightningTimer = Math.max(0, lightningTimer - dt);
          const p = lightningTimer / 0.55;
          const pulse = (p > 0.72 || (p > 0.25 && p < 0.48)) ? 3.2 : 0.0;
          house.lights.lightningLight.intensity = pulse;
          if (house.lights.livingWindowMoon && state.loop !== 5) {
            house.lights.livingWindowMoon.intensity = pulse > 0 ? 2.85 : 1.15;
          }
        } else {
          if (house.lights.lightningLight.intensity > 0) {
            house.lights.lightningLight.intensity = 0;
            if (house.lights.livingWindowMoon && state.loop !== 5) {
              house.lights.livingWindowMoon.intensity = 1.15;
            }
          }
          lightningCooldown -= dt;
          if (lightningCooldown <= 0) {
            lightningCooldown = 19.0 + Math.random() * 15.0;
            lightningTimer = 0.55;
            const thunderDelay = 650 + Math.floor(Math.random() * 750);
            timers.setTimeout(() => {
              if (!state.running || state.paused || state.ended) return;
              audio.playThunder(true, -0.38);
            }, thunderDelay);
          }
        }
      } else if (house.lights.lightningLight.intensity > 0) {
        house.lights.lightningLight.intensity = 0;
      }

      // 6. Horror events & tension
      _playerRight.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      const shadowTension = updateShadowEvents(dt, tSec, isMoving, ctx);

      // 7. Fear level & Lighting
      updateFearAndLighting(dt, tSec, ctx);

      // 8. Dynamic audio drone & indoor rain proximity update
      const tvDist = state.pos.distanceTo(_tvPos);
      const tvProx = state.loop >= 2 ? Math.max(0, 1 - tvDist / 7.5) : 0;
      const winProx = Math.max(0, 1 - Math.abs(state.pos.x + 3.6) / 5.5);
      const doorProx = Math.max(0, 1 - Math.abs(state.pos.z + 10.2) / 5.5);
      const rainProx = Math.min(1, Math.max(winProx, doorProx));
      const phonePan = house.objects.phoneObj.ringing
        ? computeStereoPan(house.objects.phoneObj.worldPos, state.pos, _playerRight)
        : 0;
      if (!shadowEvent.melodyStarted && !shadowEvent.shadowStopped) {
        audio.update(
          Math.max(state.fear / 100, shadowTension),
          tvProx,
          house.objects.phoneObj.ringing,
          tSec,
          rainProx,
          phonePan,
        );
      }
      state.wasMoving = isMoving;

      // 9. Camera positioning, head bob & trauma shake (respects anti-motion-sickness headBob setting)
      const motionMult = settings.headBob ? 1.0 : 0.0;
      let shakeX = 0;
      let shakeY = 0;
      if (state.shakeTime > 0) {
        state.shakeTime = Math.max(0, state.shakeTime - dt);
        const shakeAmp = (state.panicTimer > 0 ? 0.12 : 0.08) * (settings.headBob ? 1.0 : 0.2);
        shakeX = (Math.random() - 0.5) * shakeAmp;
        shakeY = (Math.random() - 0.5) * shakeAmp;
      }

      const bob = Math.sin(state.bobPhase) * 0.032 * state.bobBlend * motionMult;
      const panicRoll = state.panicTimer > 0 ? Math.sin(tSec * 9.5) * 0.055 * motionMult : 0;
      const sway =
        (Math.max(state.fear / 100, shadowTension) *
          Math.sin(tSec * 2.6) *
          0.032 +
          panicRoll) *
        motionMult;
      camera.position.set(
        state.pos.x + shakeX,
        state.pos.y + bob + shakeY,
        state.pos.z,
      );
      camera.rotation.order = "YXZ";
      camera.rotation.y = state.yaw;
      camera.rotation.x = state.pitch;
      camera.rotation.z = sway;

      // 10. Interactable targeting & crosshair update
      if (state.holdingPaper) {
        clearInteractUI(hudCache, { crosshair, interactPrompt });
        crosshair.style.opacity = "0";
      } else {
        currentTarget = findInteractable();
        const promptLabel = currentTarget ? currentTarget.label() : "";
        const shouldShow = Boolean(promptLabel);
        crosshair.classList.remove("grab");

        if (shouldShow !== hudCache.interactActive) {
          hudCache.interactActive = shouldShow;
          crosshair.classList.toggle("active", shouldShow);
          interactPrompt.classList.toggle("visible", shouldShow);
        }
        if (shouldShow && hudCache.interactText !== promptLabel) {
          hudCache.interactText = promptLabel;
          interactPrompt.textContent = promptLabel;
        }
      }

      ctx.updateHUD();
    } else if (!state.running) {
      camera.position.set(-1.3, 1.15, 3.2);
      camera.lookAt(0.4, 1.15, -1.0);
    }

    renderer.render(scene, camera);
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animate(performance.now());
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initGame();
} else {
  window.addEventListener("DOMContentLoaded", initGame);
}
