import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';

const _camDir = new THREE.Vector3();

export function createHplPhysicsState() {
  return {
    active: false,
    target: null,
    creakCooldown: 0,
    holdPos: new THREE.Vector3(),
    leverAngle: -0.55
  };
}

export function isHplGrabbable(item, state) {
  if (!item) return false;
  if (item.type === 'door') return true;
  if (item.type === 'hpl_drawer' || item.type === 'hpl_prop') return true;
  if (item.type === 'breaker' && state.loop === 2 && !state.breakerFixed) return true;
  return false;
}

export function startHplGrab(item, hplGrab, state, audio, showSubtitle, crosshair) {
  if (!isHplGrabbable(item, state)) return false;
  if (item.type === 'door') {
    if (item.isFrontDoor && !state.loopClueFound) {
      item.rattleTime = 0.28;
      audio.playDoorSlam();
      showSubtitle('Cửa chính chốt chặt', LOOP_STORY[state.loop].doorLockedText, 4400);
      return false;
    }
    if (item.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) {
      item.rattleTime = 0.28;
      audio.playDoorSlam();
      showSubtitle('Cửa phòng làm việc đang khóa', 'Tay nắm cửa kẹt cứng... Cần tìm chiếc chìa khóa đồng trước.', 4400);
      return false;
    }
  }
  hplGrab.active = true;
  hplGrab.target = item;
  hplGrab.creakCooldown = 0;
  if (item.type === 'breaker') {
    hplGrab.leverAngle = item.leverPivot ? item.leverPivot.rotation.x : -0.55;
  } else if (item.type === 'hpl_prop') {
    item.isDynamic = false;
    item.vel.set(0, 0, 0);
    audio.playFloorCreak();
  }
  if (crosshair) crosshair.classList.add('holding');
  return true;
}

export function releaseHplGrab(hplGrab, throwProp, camera, audio, crosshair, hplHint, breakerLeverPivot, state) {
  if (!hplGrab.active) return;
  const item = hplGrab.target;
  hplGrab.active = false;
  hplGrab.target = null;
  if (crosshair) crosshair.classList.remove('holding');
  if (hplHint) hplHint.classList.remove('visible');
  if (!item) return;

  if (item.type === 'hpl_prop') {
    item.isDynamic = true;
    camera.getWorldDirection(_camDir);
    if (throwProp) {
      item.vel.copy(_camDir).multiplyScalar(8.4);
      item.vel.y += 1.65;
      item.angVel.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
      audio.playMatchStrike();
    } else {
      item.vel.copy(_camDir).multiplyScalar(0.8);
      item.angVel.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    }
  } else if (item.type === 'door') {
    item.targetOffset = item.currentOffset;
    item.isOpen = Math.abs(item.currentOffset) > 0.52;
    item.collider.active = !item.isOpen;
  } else if (item.type === 'breaker' && breakerLeverPivot && !state.breakerFixed) {
    breakerLeverPivot.rotation.x = -0.55;
  }
}

export function applyHplMouseDrag(dx, dy, hplGrab, settings, state, audio, breakerLeverPivot, onBreakerComplete, onMoralChoiceTrigger, showSubtitle) {
  const item = hplGrab.target;
  if (!item) return;
  if (item.type === 'door') {
    const pull = (dx * 0.0042 - dy * 0.0032) * settings.sensitivity;
    const prev = item.currentOffset;
    item.currentOffset = Math.max(-Math.PI * 0.62, Math.min(0, item.currentOffset - pull));
    item.targetOffset = item.currentOffset;
    item.angVel = (item.currentOffset - prev) * 18;
    item.isOpen = Math.abs(item.currentOffset) > 0.52;
    item.collider.active = !item.isOpen;
    if (Math.abs(pull) > 0.012 && hplGrab.creakCooldown <= 0) {
      audio.playDoorCreak(pull < 0);
      hplGrab.creakCooldown = 0.55;
    }
    if (prev < -0.15 && item.currentOffset >= -0.01 && Math.abs(item.angVel) > 0.6) {
      audio.playDoorSlam();
    }
    if (item.isFrontDoor && state.loopClueFound && state.loop < TOTAL_LOOPS && Math.abs(item.currentOffset) > 0.36) {
      if (onMoralChoiceTrigger) onMoralChoiceTrigger(state.loop);
    }
  } else if (item.type === 'hpl_drawer') {
    const slide = (dy * 0.0022 - dx * 0.0008) * settings.sensitivity;
    const prev = item.openDist;
    item.openDist = Math.max(0, Math.min(item.maxSlide, item.openDist + slide));
    item.vel = (item.openDist - prev) * 12;
    if (Math.abs(slide) > 0.01 && hplGrab.creakCooldown <= 0) {
      audio.playFloorCreak();
      hplGrab.creakCooldown = 0.45;
    }
    if (item.openDist > item.maxSlide * 0.72 && item.inspectedInLoop !== state.loop) {
      item.inspectedInLoop = state.loop;
      showSubtitle(item.name.charAt(0).toUpperCase() + item.name.slice(1), item.noteText, 4600, false, true);
    }
  } else if (item.type === 'breaker' && state.loop === 2 && !state.breakerFixed && breakerLeverPivot) {
    hplGrab.leverAngle = Math.max(-0.55, Math.min(0.35, hplGrab.leverAngle - dy * 0.0055 * settings.sensitivity));
    breakerLeverPivot.rotation.x = hplGrab.leverAngle;
    if (hplGrab.leverAngle >= 0.2) {
      if (onBreakerComplete) onBreakerComplete();
    }
  }
}

export function updateHplPhysics(dt, tSec, state, camera, colliders, hplGrab, hplDrawers, hplProps, doors, shadow, shadowEvent, audio, showSubtitle, collidesFn) {
  if (hplGrab.creakCooldown > 0) hplGrab.creakCooldown = Math.max(0, hplGrab.creakCooldown - dt);
  const doorLerp = 1 - Math.exp(-6.5 * dt);

  // Doors
  for (let i = 0; i < doors.length; i++) {
    const d = doors[i];
    if (hplGrab.active && hplGrab.target === d) {
      d.pivot.rotation.y = d.baseRotY + d.currentOffset;
    } else {
      if (Math.abs(d.angVel) > 0.005) {
        d.currentOffset = Math.max(-Math.PI * 0.62, Math.min(0, d.currentOffset + d.angVel * dt));
        d.targetOffset = d.currentOffset;
        d.angVel *= Math.exp(-6.2 * dt);
        d.isOpen = Math.abs(d.currentOffset) > 0.52;
        d.collider.active = !d.isOpen;
      } else {
        d.currentOffset += (d.targetOffset - d.currentOffset) * doorLerp;
      }
      let rattle = 0;
      if (d.rattleTime > 0) {
        d.rattleTime = Math.max(0, d.rattleTime - dt);
        rattle = Math.sin(tSec * 65) * 0.032 * (d.rattleTime / 0.28);
      }
      d.pivot.rotation.y = d.baseRotY + d.currentOffset + rattle;
    }
  }

  // Drawers
  for (let i = 0; i < hplDrawers.length; i++) {
    const dr = hplDrawers[i];
    if (!(hplGrab.active && hplGrab.target === dr) && Math.abs(dr.vel) > 0.002) {
      dr.openDist = Math.max(0, Math.min(dr.maxSlide, dr.openDist + dr.vel * dt));
      dr.vel *= Math.exp(-8.5 * dt);
    }
    dr.group.position.copy(dr.basePos).addScaledVector(dr.slideAxis, dr.openDist);
    dr.worldPos.copy(dr.group.position).addScaledVector(dr.slideAxis, 0.2);
  }

  // Props
  for (let i = 0; i < hplProps.length; i++) {
    const p = hplProps[i];
    if (hplGrab.active && hplGrab.target === p) {
      camera.getWorldDirection(_camDir);
      hplGrab.holdPos.copy(camera.position).addScaledVector(_camDir, 0.92);
      hplGrab.holdPos.y -= 0.14;
      p.group.position.lerp(hplGrab.holdPos, 1 - Math.exp(-16 * dt));
      p.group.rotation.y += dt * 0.6;
      p.worldPos.copy(p.group.position);
    } else if (p.isDynamic) {
      p.vel.y -= 14.5 * dt;
      const nx = p.group.position.x + p.vel.x * dt;
      const nz = p.group.position.z + p.vel.z * dt;
      if (collidesFn(nx, p.group.position.z, colliders)) { p.vel.x *= -0.45; }
      else { p.group.position.x = nx; }
      if (collidesFn(p.group.position.x, nz, colliders)) { p.vel.z *= -0.45; }
      else { p.group.position.z = nz; }
      p.group.position.y += p.vel.y * dt;
      p.group.rotation.x += p.angVel.x * dt;
      p.group.rotation.y += p.angVel.y * dt;
      p.group.rotation.z += p.angVel.z * dt;

      if (p.group.position.y <= p.radius) {
        p.group.position.y = p.radius;
        const impactSpeed = Math.abs(p.vel.y) + Math.hypot(p.vel.x, p.vel.z) * 0.35;
        if (impactSpeed > 2.4) {
          if (p.kind === 'bottle' || p.kind === 'mug') audio.playPortraitFall();
          else audio.playDoorSlam();
          if (shadow.group.visible && (shadowEvent.mode === 'loop3_chase' || shadowEvent.mode === 'peripheral_peek' || shadowEvent.mode === 'loop3_front')) {
            shadowEvent.distractPos.copy(p.group.position);
            shadowEvent.distractTimer = 3.8;
            showSubtitle('Tiếng động đánh lạc hướng!', 'Bóng Đen vừa quay về phía đồ vật rơi — tận dụng lúc này di chuyển!', 3200, false, true);
          }
        }
        p.vel.y *= -0.34;
        p.vel.x *= 0.68;
        p.vel.z *= 0.68;
        p.angVel.multiplyScalar(0.55);
        if (Math.abs(p.vel.y) < 0.25 && Math.hypot(p.vel.x, p.vel.z) < 0.18) {
          p.vel.set(0, 0, 0);
          p.angVel.set(0, 0, 0);
          p.isDynamic = false;
        }
      }
      p.worldPos.copy(p.group.position);
    }
  }
}
