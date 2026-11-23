import * as THREE from 'three';
import { LOOP_STORY } from '../config/storyData.js';
import { ALLEY_VOICES, VOICEMAIL_LINE } from './endings.js';

export const PEEK_SPOTS = [
  new THREE.Vector3(-4.45, 0, -2.2),  // Khe cửa Nhà bếp
  new THREE.Vector3(3.95, 0, 0.45),   // Khe cửa Phòng tắm
  new THREE.Vector3(0.15, 0, -8.8),   // Cuối phòng khách gần cửa chính
  new THREE.Vector3(3.9, 0, -4.45)    // Khung cửa Phòng làm việc
];

const _tmpVec = new THREE.Vector3();
const _camDir = new THREE.Vector3();

export function computeStereoPan(worldTargetPos, playerPos, playerRight) {
  _tmpVec.subVectors(worldTargetPos, playerPos);
  _tmpVec.y = 0;
  const len = _tmpVec.length();
  if (len < 0.001) return 0;
  _tmpVec.divideScalar(len);
  return Math.max(-0.92, Math.min(0.92, _tmpVec.dot(playerRight)));
}

export function createShadowEventState() {
  return {
    mode: 'hidden',
    timer: 0,
    triggeredBehind: false,
    echoStepTimer: 0,
    windowPassed: false,
    chaseStepAccum: 0,
    portraitFell: false,
    atticTimer: 9.0,
    foxTimer: 16.0,
    alleyFoxCried: false,
    alleyVoiceStep: 0,
    dogBark1: false,
    dogBark2: false,
    whiteoutDone: false,
    melodyStarted: false,
    shadowStopped: false,
    voicemailHold: false,
    voicemailAdvanced: false,
    peekCooldown: 12.0,
    peekVanishTimer: 0,
    peekActive: false,
    doorCreakCooldown: 16.0,
    blowOutCooldown: 18.0,
    blowOutsInLoop: 0,
    spatialWhisperCooldown: 14.0,
    distractTimer: 0,
    distractPos: new THREE.Vector3()
  };
}

export function updateShadowEvents(dt, tSec, isMoving, ctx) {
  const {
    state,
    camera,
    shadow,
    shadowEvent,
    audio,
    doors,
    portraitGroup,
    portraitAnomalyObj,
    livingWindowMoon,
    emergencyRedLight,
    alleyLights,
    dangerPulse,
    chaseBanner,
    lightWhiteout,
    objectiveText,
    hudCache,
    showSubtitle,
    triggerTrueEnding,
    playerRight
  } = ctx;

  camera.getWorldDirection(_camDir);
  let tension = 0;

  // Loop 2: Family portrait crashes off wall
  if (state.loop === 2 && !shadowEvent.portraitFell && state.pos.z < -4.2) {
    shadowEvent.portraitFell = true;
    portraitGroup.position.set(-3.45, 0.08, -3.4);
    portraitGroup.rotation.set(0, 0.25, -Math.PI / 2);
    portraitAnomalyObj.worldPos.set(-3.45, 0.35, -3.4);
    audio.triggerDeadSilence(1400);
    audio.playPortraitFall();
    state.shakeTime = 0.35;
    showSubtitle(LOOP_STORY.portraitFall.speaker, LOOP_STORY.portraitFall.text, 4800);
  }

  // Loop 2 & 3: Attic footsteps + distant fox cry
  if (state.loop >= 2 && shadowEvent.mode !== 'loop3_chase') {
    shadowEvent.atticTimer -= dt;
    if (shadowEvent.atticTimer <= 0) {
      shadowEvent.atticTimer = 14 + Math.random() * 8;
      audio.playFootstep(0.32, true);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => audio.playFootstep(0.28, true), 520);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => audio.playFootstep(0.22, true), 1080);
      showSubtitle(LOOP_STORY.atticStep.speaker, LOOP_STORY.atticStep.text, 4200, false, true);
    }

    shadowEvent.foxTimer -= dt;
    if (shadowEvent.foxTimer <= 0) {
      shadowEvent.foxTimer = 22 + Math.random() * 12;
      audio.playFoxCry(true);
      showSubtitle(LOOP_STORY.foxOutside.speaker, LOOP_STORY.foxOutside.text, 4600, false, true);
    }
  }

  // Loop 1 Window Silhouette Pass
  if (state.loop === 1 && !shadowEvent.windowPassed && state.pos.z < -3.0 && livingWindowMoon) {
    shadowEvent.windowPassed = true;
    livingWindowMoon.intensity = 0.05;
    audio.playHeavyBreath(0.2);
    audio.playFoxCry(true);
    showSubtitle(LOOP_STORY.windowPass.speaker, LOOP_STORY.windowPass.text, 5200);
    (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => { if (livingWindowMoon) livingWindowMoon.intensity = 1.15; }, 850);
  }

  if (shadowEvent.mode === 'loop2_doorway') {
    shadow.group.lookAt(state.pos.x, 0, state.pos.z);
    shadow.headGroup.rotation.z = 0.34 + Math.sin(tSec * 18) * 0.14;
    shadow.strobe.intensity = 0.25;
    _tmpVec.subVectors(shadow.group.position, state.pos).normalize();
    tension = 0.85;
    if (_camDir.dot(_tmpVec) > 0.55 && !shadowEvent.triggeredBehind) {
      shadowEvent.triggeredBehind = true;
      audio.playScareChord();
      state.shakeTime = 0.5;
      state.fear = Math.min(94, state.fear + 35);
      shadowEvent.timer = 0.95;
    }
    if (shadowEvent.triggeredBehind) {
      shadow.group.position.x += dt * 1.45;
      shadowEvent.timer -= dt;
      if (shadowEvent.timer <= 0) {
        audio.playBreakerSnap();
        shadowEvent.mode = 'hidden';
        shadow.group.visible = false;
      }
    }
  } else if (shadowEvent.mode === 'loop3_front') {
    shadow.group.lookAt(state.pos.x, 0, state.pos.z);
    shadow.headGroup.rotation.z = Math.sin(tSec * 2.2) * 0.22;
    const dist = shadow.group.position.distanceTo(state.pos);
    tension = Math.max(0, Math.min(0.82, 1 - (dist - 2) / 9));
    if (state.wasMoving && !isMoving && state.pos.z < -1.0) shadowEvent.echoStepTimer = 0.45;
    if (shadowEvent.echoStepTimer > 0) {
      shadowEvent.echoStepTimer -= dt;
      if (shadowEvent.echoStepTimer <= 0) {
        audio.playFootstep(0.45, true);
        if (!shadowEvent.triggeredBehind && state.pos.z < -3.0) {
          shadowEvent.triggeredBehind = true;
          audio.playHeavyBreath(0.28);
          showSubtitle(LOOP_STORY.loop3Echo.speaker, LOOP_STORY.loop3Echo.text, 5600, true);
        }
      }
    }
  } else if (shadowEvent.mode === 'loop3_chase') {
    emergencyRedLight.intensity = Math.sin(tSec * 14) > 0 ? 2.2 : 0.25;
    shadow.strobe.intensity = 0.35;
    _tmpVec.subVectors(state.pos, shadow.group.position);
    _tmpVec.y = 0;
    const dist = _tmpVec.length();

    if (shadowEvent.distractTimer > 0) {
      shadowEvent.distractTimer = Math.max(0, shadowEvent.distractTimer - dt);
      _tmpVec.subVectors(shadowEvent.distractPos, shadow.group.position);
      _tmpVec.y = 0;
      const dDist = _tmpVec.length();
      if (dDist > 0.45) {
        _tmpVec.divideScalar(dDist).multiplyScalar(2.45 * dt);
        shadow.group.position.add(_tmpVec);
        shadow.group.lookAt(shadowEvent.distractPos.x, 0, shadowEvent.distractPos.z);
      }
    } else if (dist > 0.2 && !shadowEvent.shadowStopped) {
      const c4 = state.choices.find(c => c.loop === 4);
      const chaseSpd = c4 && c4.kind === 'confront' ? 2.28 : (c4 && c4.kind === 'avoid' ? 2.72 : 2.52);
      _tmpVec.divideScalar(dist).multiplyScalar(chaseSpd * dt);
      shadow.group.position.add(_tmpVec);
      shadow.group.lookAt(state.pos.x, 0, state.pos.z);
      shadow.armL.rotation.x = -0.5 + Math.sin(tSec * 12) * 0.4;
      shadow.armR.rotation.x = -0.5 - Math.sin(tSec * 12) * 0.4;
      shadowEvent.chaseStepAccum += chaseSpd * dt;
      if (shadowEvent.chaseStepAccum > 0.95) {
        shadowEvent.chaseStepAccum = 0;
        audio.playFootstep(0.5, true);
      }
    }
    tension = 0.95;

    const lightProg = Math.max(0, Math.min(1, (-14.0 - state.pos.z) / 43.0));
    alleyLights.forEach((al, idx) => {
      const baseI = 1.9 + idx * 0.4 + lightProg * 2.4;
      al.intensity = idx < 2 && lightProg < 0.25
        ? (Math.sin(tSec * (18 + idx * 7)) > -0.6 ? baseI : 0.65)
        : baseI;
    });
    shadow.headGroup.rotation.z = 0.35 + Math.sin(tSec * 24) * 0.2;

    // Crossing front door (z < -11.8): Shadow stops at the house threshold, alleyway finale begins
    if (state.pos.z < -11.8) {
      if (!shadowEvent.shadowStopped) {
        shadowEvent.shadowStopped = true;
        shadow.group.visible = false;
        chaseBanner.classList.remove('visible');
        emergencyRedLight.intensity = 0;
        dangerPulse.style.opacity = '0';
        hudCache.dangerOp = '0.00';
        audio.playSoftRain();
        if (objectiveText) {
          objectiveText.textContent = 'Đi thẳng cuối con hẻm hướng về ánh sáng bình minh';
        }
      }

      // Clamp player before exitGlowWall
      if (state.pos.z < -56.0) state.pos.z = -56.0;

      // Ambient alley cues
      if (state.pos.z < -14.5 && !shadowEvent.dogBark1) {
        shadowEvent.dogBark1 = true;
        audio.playDogBark(true);
      }
      if (state.pos.z < -31.0 && !shadowEvent.dogBark2) {
        shadowEvent.dogBark2 = true;
        audio.playDogBark(false);
      }

      // Progressive memory lines along the 76m alleyway
      if (shadowEvent.alleyVoiceStep < ALLEY_VOICES.length) {
        const nextLine = ALLEY_VOICES[shadowEvent.alleyVoiceStep];
        if (state.pos.z <= nextLine.z) {
          shadowEvent.alleyVoiceStep += 1;
          showSubtitle(nextLine.speaker, nextLine.text, 6400, false, false, true);
        }
      }

      // Gentle dawn whiteout build-up approaching the end of the alley
      if (!shadowEvent.voicemailHold && !shadowEvent.whiteoutDone && lightWhiteout) {
        const glow = Math.max(0, Math.min(0.45, (-36.0 - state.pos.z) / 22.0));
        lightWhiteout.style.opacity = glow.toFixed(2);
      }

      // Voicemail climax at z <= -46.5
      if (state.pos.z <= -46.5 && !shadowEvent.voicemailHold && !shadowEvent.whiteoutDone) {
        shadowEvent.voicemailHold = true;
        state.velX = 0;
        state.velZ = 0;
        audio.playMemoryChime(true);
        showSubtitle('Tin nhắn thoại · Alice (02:09)', VOICEMAIL_LINE, 0, 'warm', false, true);
      }

      return 0;
    }

    if (!shadowEvent.shadowStopped && dist < 1.18) {
      audio.playScareChord();
      state.shakeTime = 0.65;
      state.chaseCaughtCount += 1;
      if (state.chaseCaughtCount >= 2) {
        shadowEvent.shadowStopped = true;
        shadow.group.visible = false;
        chaseBanner.classList.remove('visible');
        emergencyRedLight.intensity = 0;
        dangerPulse.style.opacity = '0';
        hudCache.dangerOp = '0.00';
        triggerTrueEnding('bad');
        return 0;
      }
      state.pos.set(4.4, 1.65, -4.5);
      state.velX = 0; state.velZ = 0;
      shadow.group.position.set(0.2, 0, -1.8);
      showSubtitle('Steve', 'Đừng quay lại nữa! Chỉ còn một cơ hội — giữ [Shift] chạy thẳng qua Cửa chính!', 3800, true);
    }
  }

  // Look-away gaslighting & ambient scares
  if (shadowEvent.mode !== 'loop3_chase' && shadowEvent.mode !== 'loop2_doorway' && !state.holdingPaper) {
    if (state.loop >= 2) {
      shadowEvent.spatialWhisperCooldown -= dt;
      if (shadowEvent.spatialWhisperCooldown <= 0) {
        shadowEvent.spatialWhisperCooldown = 17 + Math.random() * 12;
        const side = Math.random() < 0.5 ? -0.88 : 0.88;
        if (Math.random() < 0.58) audio.playSpatialWhisper(side);
        else audio.playSpatialKnock(side);
      }

      shadowEvent.doorCreakCooldown -= dt;
      if (shadowEvent.doorCreakCooldown <= 0) {
        shadowEvent.doorCreakCooldown = 20 + Math.random() * 14;
        for (let i = 0; i < doors.length; i++) {
          const d = doors[i];
          if (d.isFrontDoor) continue;
          if (d.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) continue;
          _tmpVec.subVectors(d.worldPos, state.pos);
          const dist = _tmpVec.length();
          if (dist > 2.2 && dist < 8.5) {
            _tmpVec.divideScalar(dist);
            if (_camDir.dot(_tmpVec) < -0.25) {
              d.isOpen = !d.isOpen;
              d.targetOffset = d.isOpen ? -Math.PI * 0.28 : 0;
              d.collider.active = !d.isOpen;
              const pan = computeStereoPan(d.worldPos, state.pos, playerRight);
              audio.playDoorCreak(!d.isOpen);
              audio.playSpatialWhisper(pan);
              break;
            }
          }
        }
      }
    }

    if ((state.loop === 3 || state.loop === 4) && shadowEvent.mode === 'hidden') {
      shadowEvent.peekCooldown -= dt;
      if (shadowEvent.peekCooldown <= 0) {
        let chosen = null;
        for (let k = 0; k < PEEK_SPOTS.length; k++) {
          const sp = PEEK_SPOTS[(k + Math.floor(Math.random() * PEEK_SPOTS.length)) % PEEK_SPOTS.length];
          _tmpVec.subVectors(sp, state.pos);
          const dist = _tmpVec.length();
          if (dist > 3.6 && dist < 9.5) {
            _tmpVec.divideScalar(dist);
            const dot = _camDir.dot(_tmpVec);
            if (dot > -0.2 && dot < 0.68) { chosen = sp; break; }
          }
        }
        if (chosen) {
          shadowEvent.mode = 'peripheral_peek';
          shadowEvent.peekActive = true;
          shadowEvent.peekVanishTimer = 0;
          shadow.group.position.copy(chosen);
          shadow.group.visible = true;
          audio.triggerDeadSilence(1400);
        } else {
          shadowEvent.peekCooldown = 6.0;
        }
      }
    } else if (shadowEvent.mode === 'peripheral_peek') {
      shadow.group.lookAt(state.pos.x, 0, state.pos.z);
      shadow.headGroup.rotation.z = Math.sin(tSec * 4.5) * 0.16;
      _tmpVec.subVectors(shadow.group.position, state.pos);
      const dist = _tmpVec.length();
      _tmpVec.divideScalar(dist || 1);
      const dot = _camDir.dot(_tmpVec);
      tension = Math.max(tension, 0.55);

      if ((dot > 0.84 || dist < 2.6) && shadowEvent.peekVanishTimer === 0) {
        shadowEvent.peekVanishTimer = 0.28;
        const pan = computeStereoPan(shadow.group.position, state.pos, playerRight);
        audio.playSpatialWhisper(pan);
        state.fear = Math.min(100, state.fear + 12);
        state.shakeTime = 0.22;
      }
      if (shadowEvent.peekVanishTimer > 0) {
        shadowEvent.peekVanishTimer -= dt;
        if (shadowEvent.peekVanishTimer <= 0) {
          shadow.group.visible = false;
          shadowEvent.mode = 'hidden';
          shadowEvent.peekActive = false;
          shadowEvent.peekCooldown = 22 + Math.random() * 14;
        }
      }
    }

    // Match blow-out by cold breath
    if (state.loop >= 3 && state.matchTimer > 4.5 && shadowEvent.blowOutsInLoop < 2) {
      shadowEvent.blowOutCooldown -= dt;
      if (shadowEvent.blowOutCooldown <= 0) {
        shadowEvent.blowOutsInLoop += 1;
        shadowEvent.blowOutCooldown = 28 + Math.random() * 15;
        const earPan = Math.random() < 0.5 ? -0.85 : 0.85;
        audio.triggerDeadSilence(1300);
        (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
          if (!state.running || state.paused || state.ended || state.matchTimer <= 0) return;
          audio.playMatchBlowOut(earPan);
          state.matchTimer = 0;
          ctx.matchGroup.visible = false;
          ctx.matchLight.intensity = 0;
          state.shakeTime = 0.28;
          state.fear = Math.min(100, state.fear + 14);
          ctx.updateHUD();
          showSubtitle('Hơi thở lạnh sát gáy!', 'Có luồng gió lạnh vừa thổi tắt phụt que diêm ngay trên tay...', 4200, true, true);
        }, 850);
      }
    }
  }

  const dOp = (tension * 0.78).toFixed(2);
  if (hudCache.dangerOp !== dOp) {
    hudCache.dangerOp = dOp;
    dangerPulse.style.opacity = dOp;
  }
  return tension;
}

export function updateFearAndLighting(dt, tSec, ctx) {
  const {
    state,
    camera,
    candles,
    lights,
    panicOverlay,
    blinkOverlay,
    blinkClock,
    blinkSub,
    audio,
    showSubtitle,
    clearKeys
  } = ctx;

  let inLight = state.matchTimer > 0
    || (lights.bedroomLampLight.intensity > 0.2 && state.pos.z > 0.2 && state.pos.x < 3.5)
    || (lights.bathLight.intensity > 0.35 && state.pos.x > 3.5 && state.pos.z > -1.0)
    || (lights.fridgeLight.intensity > 0.4 && state.pos.x < -4.0);

  if (!inLight) {
    for (const c of candles) {
      if (c.lit && state.pos.distanceTo(c.worldPos) < 4.5) {
        inLight = true;
        break;
      }
    }
  }

  if (state.panicCooldown > 0) state.panicCooldown = Math.max(0, state.panicCooldown - dt);
  if (state.panicTimer > 0) {
    state.panicTimer = Math.max(0, state.panicTimer - dt * (inLight ? 2.2 : 1.0));
    if (state.panicTimer === 0) {
      panicOverlay.classList.remove('active');
      document.body.classList.remove('in-panic');
    }
  }

  if (inLight) state.fear = Math.max(0, state.fear - dt * 8.2);
  else state.fear = Math.min(100, state.fear + dt * 4.8);

  // Fear 100% Panic Attack
  if (state.fear >= 100 && state.panicCooldown <= 0 && !state.holdingPaper) {
    state.panicTimer = 3.6;
    state.panicCooldown = 9.0;
    state.panicCountInLoop += 1;
    state.shakeTime = 1.45;
    panicOverlay.classList.add('active');
    document.body.classList.add('in-panic');
    audio.playScareChord();
    audio.playHeavyBreath(0.85);

    if (state.panicCountInLoop >= 2 && ctx.shadowEvent.mode !== 'loop3_chase') {
      state.fear = 55;
      clearKeys();
      blinkClock.textContent = '02:14';
      blinkSub.textContent = 'Nghẹt thở trong bóng tối...';
      blinkOverlay.style.opacity = '1'; blinkClock.style.opacity = '1'; blinkSub.style.opacity = '1';
      showSubtitle('Hoảng loạn cực độ!', 'Tầm nhìn tối sầm lại... Bóng tối vừa kéo giật mình quay về phòng ngủ! Hãy giữ lửa diêm [F] hoặc thắp nến!', 5600, true);
      (ctx.timers ? ctx.timers.setTimeout : setTimeout)(() => {
        if (state.ended) return;
        state.pos.set(0.35, 1.65, 2.35);
        state.velX = 0; state.velZ = 0;
        blinkClock.style.opacity = '0'; blinkSub.style.opacity = '0'; blinkOverlay.style.opacity = '0';
      }, 950);
    } else {
      state.fear = 72;
      showSubtitle('Cơn hoảng loạn · Áp lực 100%!', 'Tim đập loạn nhịp, chân nặng trĩu... Quẹt diêm [F] hoặc tìm ánh sáng ngay trước khi ngất đi!', 5200, true);
    }
  }

  // Tunnel Vision FOV
  const targetFov = state.panicTimer > 0
    ? 56 + Math.sin(tSec * 16) * 1.4
    : (state.fear > 75 ? 66 - ((state.fear - 75) / 25) * 4.5 : 66);
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-7 * dt));
    camera.updateProjectionMatrix();
  }
}
