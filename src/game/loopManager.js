import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_ANOMALY_REQ, LOOP_STORY, MORAL_CHOICES } from '../config/storyData.js';
import { makeLoop5WallOrderTex, makeLoop5BathMirrorTex } from '../world/textures.js';
import { saveRunProgress } from './saveManager.js';

export function setupLoopEnvironment(loopNum, ctx) {
  const {
    state,
    audio,
    scene,
    camera,
    doors,
    candles,
    hplDrawers,
    hplProps,
    objects,
    lights,
    puzzles,
    materials,
    shadow,
    shadowEvent,
    hudCache,
    eyelidTop,
    eyelidBottom,
    eyeHaze,
    panicOverlay,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    subtitleBox,
    endingPhone,
    keypadScreen,
    objectiveText,
    clearInteractUI,
    updateHUD
  } = ctx;

  if (ctx.timers) ctx.timers.clearAll();
  clearInteractUI();
  state.loop = loopNum;
  state.loopClueFound = false;
  // Loop 3 wakes standing in the steamy bathroom facing the foggy mirror;
  // Loop 4 wakes disoriented in the living room facing the blaring static TV!
  const wakeInBed = (loopNum === 1 || loopNum === 2 || loopNum === 5);
  state.wakingDuration = wakeInBed ? (loopNum === 1 ? 4.6 : 2.9) : 1.1;
  state.wakingTimer = state.wakingDuration;
  state.wakeStepPlayed = !wakeInBed;

  eyelidTop.style.transform = 'translateY(0%)';
  eyelidBottom.style.transform = 'translateY(0%)';
  eyeHaze.style.opacity = '0.92';

  if (loopNum === 3) {
    // Wake up inside the Bathroom facing the foggy 02:14 mirror & running sink
    state.pos.set(5.75, 1.65, 1.0);
    state.yaw = -Math.PI / 2;
    state.pitch = -0.04;
    state.targetYaw = -Math.PI / 2;
    state.targetPitch = -0.04;
  } else if (loopNum === 4) {
    // Wake up in the Living Room facing the blaring CRT static TV
    state.pos.set(-1.35, 1.65, -7.85);
    state.yaw = Math.PI * 0.42;
    state.pitch = -0.06;
    state.targetYaw = Math.PI * 0.42;
    state.targetPitch = -0.06;
  } else {
    state.pos.set(0.35, 1.65, 2.35);
    state.yaw = 0.25; state.pitch = 0.05;
    state.targetYaw = 0.25; state.targetPitch = 0.05;
  }
  state.velX = 0; state.velZ = 0; state.bobBlend = 0;
  state.fear = loopNum >= 4 ? 22 : 0;
  state.matchTimer = 0;
  state.anomaliesFound = 0;
  state.anomaliesRequired = LOOP_ANOMALY_REQ[loopNum] || 2;
  state.chaseCaughtCount = 0;
  state.panicTimer = 0;
  state.panicCooldown = 0;
  state.panicCountInLoop = 0;

  panicOverlay.classList.remove('active');
  document.body.classList.remove('in-panic');
  camera.fov = 66; camera.updateProjectionMatrix();

  state.holdingPaper = false;
  state.holdingPaperSource = null;
  state.paperAnim = 0;
  if (ctx.heldPaperGroup) ctx.heldPaperGroup.visible = false;
  if (ctx.paperOverlay) ctx.paperOverlay.classList.add('hidden');
  ctx.crosshair.style.opacity = '';

  ctx.matchGroup.visible = false;
  ctx.matchLight.intensity = 0;
  dangerPulse.style.opacity = '0';
  hudCache.dangerOp = '0.00';
  chaseBanner.classList.remove('visible');
  lights.emergencyRedLight.intensity = 0;

  shadowEvent.mode = 'hidden';
  shadowEvent.triggeredBehind = false;
  shadowEvent.windowPassed = false;
  shadowEvent.portraitFell = false;
  shadowEvent.atticTimer = 7.5;
  shadowEvent.foxTimer = 15.0 + Math.random() * 7;
  shadowEvent.alleyFoxCried = false;
  shadowEvent.alleyVoiceStep = 0;
  shadowEvent.dogBark1 = false;
  shadowEvent.dogBark2 = false;
  shadowEvent.whiteoutDone = false;
  shadowEvent.melodyStarted = false;
  shadowEvent.shadowStopped = false;
  shadowEvent.voicemailHold = false;
  shadowEvent.voicemailAdvanced = false;
  shadowEvent.peekCooldown = loopNum >= 3 ? 9.0 : 999;
  shadowEvent.peekVanishTimer = 0;
  shadowEvent.peekActive = false;
  shadowEvent.doorCreakCooldown = loopNum >= 2 ? 12.0 : 20.0;
  shadowEvent.blowOutCooldown = loopNum >= 3 ? 16.0 : 999;
  shadowEvent.blowOutsInLoop = 0;
  shadowEvent.spatialWhisperCooldown = loopNum >= 2 ? 11.0 : 999;

  if (endingPhone) endingPhone.classList.remove('show');
  subtitleBox.classList.remove('voicemail-hold');
  lightWhiteout.style.opacity = '0';
  subtitleBox.classList.remove('warm-voice');
  shadow.group.visible = false;

  objects.wardrobeObj.checkedInLoop = 0;
  objects.mirrorObj.checkedInLoop = 0;
  objects.bathMirrorObj.checkedInLoop = 0;
  objects.fridgeObj.checkedInLoop = 0;
  objects.kitchenNoteObj.readInLoop = 0;
  objects.clockAnomalyObj.checkedInLoop = 0;
  objects.chairAnomalyObj.checkedInLoop = 0;
  objects.portraitAnomalyObj.checkedInLoop = 0;
  objects.scrawlAnomalyObj.checkedInLoop = 0;
  objects.smartphoneObj.checkedInLoop = 0;
  objects.brokenMugObj.checkedInLoop = 0;
  objects.rainPuddleObj.checkedInLoop = 0;
  puzzles.matchboxObj.pickedInLoop = 0;

  if (loopNum >= 2 && state.matchesLeft < 3) {
    state.matchesLeft = 3;
  }

  const mbSpot = puzzles.MATCHBOX_SPOTS[loopNum];
  if (mbSpot) {
    puzzles.matchboxGroup.position.copy(mbSpot);
    puzzles.matchboxObj.worldPos.copy(mbSpot);
    puzzles.matchboxGroup.visible = true;
    if (ctx.matchboxGlint) {
      ctx.matchboxGlint.basePos.copy(mbSpot).add(new THREE.Vector3(0, 0.09, 0));
      ctx.matchboxGlint.sprite.position.copy(ctx.matchboxGlint.basePos);
    }
  } else {
    puzzles.matchboxGroup.visible = false;
  }

  objects.brokenMugGroup.visible = true;
  objects.doorRainPuddle.visible = loopNum >= 2;
  objects.flowersGroup.visible = loopNum >= 5;
  objects.secondPillowMesh.visible = loopNum <= 3;
  lights.ambRedLight.intensity = 0;
  lights.ambBlueLight.intensity = 0;
  lights.kitchenGuideLight.intensity = loopNum === 2 ? 0.95 : 0;

  if (loopNum <= 2) {
    objects.drawSmartphoneScreen('silent');
    lights.smLight.color.setHex(0x88b4ff); lights.smLight.intensity = 0.28;
  } else if (loopNum === 3) {
    objects.drawSmartphoneScreen('missed');
    lights.smLight.color.setHex(0xff5a50); lights.smLight.intensity = 0.72;
  } else {
    objects.drawSmartphoneScreen('voicemail');
    lights.smLight.color.setHex(0xf7c37c); lights.smLight.intensity = 0.72;
  }

  objects.kitchenFaucetObj.running = loopNum >= 2;
  objects.kitchenFaucetObj.dripping = loopNum === 1;
  objects.kitchenWaterMesh.visible = objects.kitchenFaucetObj.running;
  objects.bathFaucetObj.running = loopNum >= 2;
  objects.bathFaucetObj.dripping = loopNum === 1;
  objects.bathWaterMesh.visible = objects.bathFaucetObj.running;

  objects.fridgeObj.targetAngle = loopNum === 1 ? 0.26 : loopNum === 2 ? 0.55 : 1.15;
  objects.fridgeDoorPivot.rotation.y = objects.fridgeObj.targetAngle;
  lights.fridgeLight.intensity = loopNum === 3 ? 0.75 : 1.05;
  lights.bathLight.intensity = loopNum === 1 ? 0.95 : loopNum === 2 ? 0.62 : 0.22;

  materials.bathMirrorMat.map = loopNum === 1 ? materials.bathMirrorCleanTex : loopNum <= 3 ? materials.bathMirrorFogTex : materials.bathMirrorCrackedTex;
  materials.bathMirrorMat.needsUpdate = true;
  materials.mirrorMat.map = loopNum >= 4 ? materials.mirrorCrackedTex : materials.mirrorCleanTex;
  materials.mirrorMat.needsUpdate = true;

  objects.portraitGroup.position.set(-3.82, 1.82, -3.4);
  objects.portraitGroup.rotation.set(0, 0, 0);
  objects.phoneObj.ringing = false;
  objects.phoneObj.answered = false;
  objects.phoneLed.intensity = 0;

  doors.forEach((d) => {
    d.isOpen = false; d.targetOffset = 0; d.currentOffset = 0; d.angVel = 0; d.rattleTime = 0;
    d.pivot.rotation.y = d.baseRotY; d.collider.active = true;
  });

  hplDrawers.forEach((dr) => {
    dr.isOpen = false; dr.targetDist = 0; dr.openDist = 0; dr.vel = 0; dr.inspectedInLoop = 0;
    dr.group.position.copy(dr.basePos);
    dr.worldPos.copy(dr.basePos).addScaledVector(dr.slideAxis, 0.2);
  });

  hplProps.forEach((p) => {
    p.isDynamic = false;
    p.vel.set(0, 0, 0);
    p.angVel.set(0, 0, 0);
    p.group.position.copy(p.homePos);
    p.group.rotation.set(0, 0, 0);
    p.worldPos.copy(p.homePos);
  });
  shadowEvent.distractTimer = 0;

  puzzles.clueGroup.visible = true;
  objectiveText.textContent = LOOP_STORY[loopNum].objective;

  state.studyKeyFound = loopNum !== 1;
  state.breakerFixed = loopNum !== 2;
  state.fridgeChecked = loopNum !== 2;
  state.bathEscaped = loopNum !== 3;
  state.phoneCheckedLoop3 = loopNum !== 3;
  state.tvTurnedOff = loopNum !== 4;
  state.codeUnlocked = loopNum !== TOTAL_LOOPS;
  keypadScreen.classList.add('hidden');

  if (loopNum === 1) {
    const spot = puzzles.STUDY_KEY_SPOTS[Math.floor(Math.random() * puzzles.STUDY_KEY_SPOTS.length)];
    puzzles.studyKeyGroup.position.copy(spot.pos);
    puzzles.studyKeyObj.worldPos.copy(spot.pos);
    if (ctx.keyGlint) {
      ctx.keyGlint.basePos.copy(spot.pos).add(new THREE.Vector3(0, 0.09, 0));
      ctx.keyGlint.sprite.position.copy(ctx.keyGlint.basePos);
    }
    puzzles.studyKeyGroup.visible = true;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0;
    lights.studyLampLight.intensity = 0.75;
  } else if (loopNum === 2) {
    puzzles.studyKeyGroup.visible = false;
    puzzles.breakerLeverPivot.rotation.x = -0.55;
    materials.breakerLedMat.color.setHex(0xff382e);
    puzzles.breakerLight.color.setHex(0xff382e);
    puzzles.breakerLight.intensity = 1.1;
    lights.studyLampLight.intensity = 0;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playBreakerSnap(); }, 1200);
  } else {
    puzzles.studyKeyGroup.visible = false;
    puzzles.breakerLeverPivot.rotation.x = 0.35;
    materials.breakerLedMat.color.setHex(0x38d97c);
    puzzles.breakerLight.intensity = 0;
    lights.studyLampLight.intensity = 0.75;
  }

  if (objects.aliceCoatGroup) objects.aliceCoatGroup.visible = (loopNum === 1);
  if (objects.wardrobeScrawlMesh) objects.wardrobeScrawlMesh.visible = (loopNum >= 3);
  if (loopNum !== 5 && objects.drawWardrobeClue) objects.drawWardrobeClue(null);

  if (loopNum === 1) {
    lights.bedroomLampLight.intensity = 1.15;
    objects.wardrobeDoorPivot.rotation.y = 0; objects.wardrobeDoorPivot2.rotation.y = 0; objects.wardrobeObj.targetAngle = 0; objects.wardrobeObj.targetAngle2 = 0; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitCleanTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(0.24, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    objects.wallScrawl.visible = false; lights.tvLight.intensity = 0;
    materials.tvScreenMat.map = null; materials.tvScreenMat.color.setHex(0x080a0d); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-0.65, 0, -4.1); objects.chairGroup.rotation.set(0, -0.7, 0);
    objects.chairAnomalyObj.worldPos.set(-0.65, 0.65, -4.1);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    if (lights.livingWindowMoon) { lights.livingWindowMoon.color.setHex(0x638cb8); lights.livingWindowMoon.intensity = 1.15; }
  } else if (loopNum === 2) {
    lights.bedroomLampLight.intensity = 0;
    lights.bathLight.intensity = 0.08;
    objects.wardrobeDoorPivot.rotation.y = -0.22; objects.wardrobeObj.targetAngle = -0.68;
    objects.wardrobeDoorPivot2.rotation.y = 0.15; objects.wardrobeObj.targetAngle2 = 0.45; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(0.38, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex2; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.25;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-0.2, 0, -2.5); objects.chairGroup.rotation.set(0, 0, 0);
    objects.chairAnomalyObj.worldPos.set(-0.2, 0.65, -2.5);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.2;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playThreeKnocks(); }, 950);
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (state.loop === 2 && !state.ended) audio.playWardrobeCreak(true); }, 2100);
  } else if (loopNum === 3) {
    lights.bedroomLampLight.intensity = 0.72;
    objects.wardrobeDoorPivot.rotation.y = -0.55; objects.wardrobeObj.targetAngle = -0.95;
    objects.wardrobeDoorPivot2.rotation.y = 0.35; objects.wardrobeObj.targetAngle2 = 0.72; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.82, 1.82, -3.4); objects.portraitGroup.rotation.set(Math.PI, 0, 0);
    objects.portraitAnomalyObj.worldPos.set(-3.75, 1.75, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex3; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.35;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(-2.35, 0, -8.1); objects.chairGroup.rotation.set(0, -Math.PI / 2, 0);
    objects.chairAnomalyObj.worldPos.set(-2.35, 0.65, -8.1);
    objects.drawClockFace('02:13');
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.3;
    lights.dawnLight.intensity = 0;
  } else if (loopNum === 4) {
    lights.bedroomLampLight.intensity = 0.45;
    objects.wardrobeDoorPivot.rotation.y = -1.15; objects.wardrobeObj.targetAngle = -1.15;
    objects.wardrobeDoorPivot2.rotation.y = 0.95; objects.wardrobeObj.targetAngle2 = 0.95; objects.wardrobeEyes.visible = false;
    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.45, 0.08, -3.4); objects.portraitGroup.rotation.set(0, 0.25, -Math.PI / 2);
    objects.portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);
    materials.wallScrawlMat.map = materials.scrawlTex4; materials.wallScrawlMat.needsUpdate = true; objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.25;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(0.0, 0, -9.2); objects.chairGroup.rotation.set(0, Math.PI, 0);
    objects.chairAnomalyObj.worldPos.set(0.0, 0.65, -9.2);
    objects.drawClockFace('ERR!');
    objects.phoneObj.ringing = true; objects.phoneLed.intensity = 1.3;
    lights.dawnLight.intensity = 0;
  } else if (loopNum === 5) {
    const palette = [
      { id: 'red', name: 'Đỏ', hex: '#b8322a' },
      { id: 'blue', name: 'Xanh dương', hex: '#2f6a96' },
      { id: 'yellow', name: 'Vàng', hex: '#a88424' },
      { id: 'green', name: 'Xanh lá', hex: '#3e7350' },
    ];
    for (let i = palette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [palette[i], palette[j]] = [palette[j], palette[i]];
    }
    const digitPool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digitPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digitPool[i], digitPool[j]] = [digitPool[j], digitPool[i]];
    }
    const ordered = palette.map((c, idx) => ({ ...c, digit: digitPool[idx] }));
    state.puzzleColorOrder = ordered;
    state.puzzleCode = ordered.map((c) => String(c.digit)).join('');

    const locPool = ordered.slice();
    for (let i = locPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [locPool[i], locPool[j]] = [locPool[j], locPool[i]];
    }
    state.puzzleClues = {
      kitchen: locPool[0],
      fridge: locPool[1],
      wardrobe: locPool[2],
      bath: locPool[3],
    };

    lights.bedroomLampLight.intensity = 0;
    objects.wardrobeDoorPivot.rotation.y = -1.45; objects.wardrobeObj.targetAngle = -1.45;
    objects.wardrobeDoorPivot2.rotation.y = 1.35; objects.wardrobeObj.targetAngle2 = 1.35; objects.wardrobeEyes.visible = false;
    if (objects.drawWardrobeClue) objects.drawWardrobeClue(state.puzzleClues.wardrobe);

    materials.bathMirrorMat.map = makeLoop5BathMirrorTex(state.puzzleClues.bath);
    materials.bathMirrorMat.needsUpdate = true;

    materials.portraitMat.map = materials.portraitScratchedTex; materials.portraitMat.needsUpdate = true;
    objects.portraitGroup.position.set(-3.45, 0.08, -3.4); objects.portraitGroup.rotation.set(0, 0.35, -Math.PI / 2);
    objects.portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);

    materials.wallScrawlMat.map = makeLoop5WallOrderTex(state.puzzleColorOrder);
    materials.wallScrawlMat.needsUpdate = true;
    objects.wallScrawl.visible = true;
    lights.tvLight.intensity = 1.1;
    materials.tvScreenMat.map = ctx.tvStaticTex; materials.tvScreenMat.color.setHex(0xffffff); materials.tvScreenMat.needsUpdate = true;
    objects.chairGroup.position.set(0.25, 0.24, -4.6); objects.chairGroup.rotation.set(0.15, 0.4, Math.PI / 2);
    objects.chairAnomalyObj.worldPos.set(0.25, 0.45, -4.6);
    objects.drawClockFace('02:14');
    lights.dawnLight.intensity = 0;
    shadowEvent.mode = 'loop3_front';
    shadow.group.position.set(0, 0, -9.2);
    shadow.group.visible = true;
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
      if (state.loop === TOTAL_LOOPS && !state.ended) {
        audio.playWoodScratch(5);
        state.shakeTime = 0.55;
      }
    }, 2100);
  }

  // Branching room shifts based on previous choices
  const c1 = state.choices.find(c => c.loop === 1);
  const c2 = state.choices.find(c => c.loop === 2);
  const c3 = state.choices.find(c => c.loop === 3);

  if (loopNum === 2 && c1) {
    if (c1.kind === 'avoid') {
      state.fear = 16;
      objects.chairGroup.position.set(0.0, 0, -9.15);
      objects.chairGroup.rotation.set(0, Math.PI, 0);
      objects.chairAnomalyObj.worldPos.set(0.0, 0.65, -9.15);
    } else {
      objects.doorRainPuddle.scale.set(1.65, 0.9, 1);
    }
  }
  if (loopNum === 3 && c2) {
    if (c2.kind === 'avoid') {
      scene.fog.density = 0.142;
      shadowEvent.peekCooldown = 5.5;
      state.fear = 18;
    } else {
      scene.fog.density = 0.118;
      const livingCandle = candles.find(c => c.id === 'candle_living');
      if (livingCandle) {
        livingCandle.lit = true;
        livingCandle.flame.visible = true;
        livingCandle.light.intensity = 1.45;
      }
    }
  }
  if (loopNum === 4 && c3) {
    if (c3.kind === 'avoid') {
      lights.bedroomLampLight.intensity = 0.12;
      state.fear = 32;
    } else {
      lights.bedroomLampLight.intensity = 0.72;
      state.fear = 10;
    }
  }
  if (loopNum === 5) {
    scene.fog.density = 0.115 + state.denialScore * 0.009;
    state.fear = Math.min(48, 12 + state.denialScore * 9);
  }

  updateHUD();
  saveRunProgress(state);
}

export function recordAnomalyFound(ctx) {
  const { state, audio, objectiveText, updateHUD } = ctx;
  if (state.anomaliesFound >= state.anomaliesRequired) return;
  state.anomaliesFound += 1;
  updateHUD();
  if (state.anomaliesFound === state.anomaliesRequired) {
    audio.playMemoryChime(false);
    if (state.loop === 1 && !state.studyKeyFound) {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Tìm chìa khóa phòng làm việc → kiểm tra bàn';
    } else if (state.loop === 2 && !state.breakerFixed) {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Vào Nhà bếp bật Cầu dao điện → kiểm tra bàn';
    } else if (state.loop === TOTAL_LOOPS) {
      objectiveText.textContent = 'Đã đủ 3 điểm bất thường! Vào phòng làm việc giải khóa mã 4 số';
    } else {
      objectiveText.textContent = 'Đã đủ điểm bất thường! Vào phòng làm việc kiểm tra manh mối trên bàn';
    }
  }
}

export function openChoiceModal(loopNum, ctx) {
  const {
    state,
    choiceScreen,
    choiceKicker,
    choiceTitle,
    choicePrompt,
    choiceALabel,
    choiceASub,
    choiceBLabel,
    choiceBSub,
    clearKeys,
    clearInteractUI,
    transitionToLoop
  } = ctx;

  const cfg = MORAL_CHOICES[loopNum];
  if (!cfg) {
    transitionToLoop(loopNum + 1, ctx);
    return;
  }
  state.pendingChoiceLoop = loopNum;
  state.paused = true;
  clearKeys();
  clearInteractUI();
  if (document.pointerLockElement) document.exitPointerLock();

  // Alternate option order on Loops 2 & 4 so players read carefully rather than always clicking button 1
  const swapped = (loopNum === 2 || loopNum === 4);
  state.choiceSwapped = swapped;
  const topOpt = swapped ? cfg.b : cfg.a;
  const botOpt = swapped ? cfg.a : cfg.b;

  choiceKicker.textContent = cfg.kicker;
  choiceTitle.textContent = cfg.title;
  choicePrompt.textContent = cfg.prompt;
  choiceALabel.textContent = topOpt.label;
  choiceASub.textContent = topOpt.sub;
  choiceBLabel.textContent = botOpt.label;
  choiceBSub.textContent = botOpt.sub;
  choiceScreen.classList.remove('hidden');
}

export function resolveMoralChoice(kind, ctx) {
  const {
    state,
    audio,
    choiceScreen,
    renderJournal,
    updateHUD,
    showSubtitle,
    transitionToLoop
  } = ctx;

  const loopNum = state.pendingChoiceLoop;
  const cfg = MORAL_CHOICES[loopNum];
  choiceScreen.classList.add('hidden');
  state.pendingChoiceLoop = 0;
  if (!cfg) return;

  const picked = kind === 'confront' ? cfg.a : cfg.b;
  state.choices = state.choices.filter(c => c.loop !== loopNum);
  state.choices.push({ loop: loopNum, kind, id: picked.id, chip: picked.chip });
  state.courageScore = state.choices.filter(c => c.kind === 'confront').length;
  state.denialScore = state.choices.filter(c => c.kind === 'avoid').length;

  state.journalNotes.push({
    title: `Quyết định Vòng ${loopNum} — ${picked.chip}`,
    text: picked.journal
  });
  renderJournal();

  if (kind === 'confront') {
    audio.playMemoryChime(false);
  } else {
    audio.playDoorSlam();
    if (loopNum === 2 && state.matchesLeft > 1) {
      state.matchesLeft -= 1;
      updateHUD();
    }
  }

  saveRunProgress(state);
  showSubtitle(picked.reactSpeaker, picked.reactText, 3200, kind === 'avoid');
  (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
    if (state.ended) return;
    transitionToLoop(loopNum + 1, ctx);
  }, 1500);
}

export function transitionToLoop(nextLoop, ctx) {
  const {
    state,
    audio,
    blinkClock,
    blinkSub,
    blinkOverlay,
    clearInteractUI,
    showSubtitle,
    narrator
  } = ctx;

  clearInteractUI();
  if (narrator && narrator.stop) narrator.stop();
  state.paused = true;
  audio.playLoopReset();

  blinkClock.textContent = '02:14';
  blinkSub.textContent = LOOP_STORY[nextLoop].clockSub;
  blinkOverlay.style.opacity = '1';
  blinkClock.style.opacity = '1';
  blinkSub.style.opacity = '1';

  (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
    setupLoopEnvironment(nextLoop, ctx);
    state.paused = false;
    blinkClock.style.opacity = '0';
    blinkSub.style.opacity = '0';
    blinkOverlay.style.opacity = '0';
    showSubtitle(LOOP_STORY[nextLoop].wakeSpeaker, LOOP_STORY[nextLoop].wakeText, 7200);
  }, 1700);
}
