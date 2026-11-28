import * as THREE from 'three';

export const keys = {};

export function clearKeys() {
  for (const k in keys) keys[k] = false;
}

export function collides(x, z, colliders, r = 0.3) {
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (c.active !== false && x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ) {
      return true;
    }
  }
  return false;
}

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

export function updatePlayerMovement(dt, tSec, state, camera, colliders, audio, settings, shadowEvent) {
  // Smooth camera pitch/yaw interpolation
  if (settings.camSmooth) {
    const camLerp = 1 - Math.exp(-22 * dt);
    state.yaw += (state.targetYaw - state.yaw) * camLerp;
    state.pitch += (state.targetPitch - state.pitch) * camLerp;
  } else {
    state.yaw = state.targetYaw;
    state.pitch = state.targetPitch;
  }

  _forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
  _right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
  _move.set(0, 0, 0);
  if (keys['KeyW'] || keys['ArrowUp']) _move.add(_forward);
  if (keys['KeyS'] || keys['ArrowDown']) _move.sub(_forward);
  if (keys['KeyD'] || keys['ArrowRight']) _move.add(_right);
  if (keys['KeyA'] || keys['ArrowLeft']) _move.sub(_right);

  const canMove = !state.holdingPaper && !shadowEvent.voicemailHold && !shadowEvent.whiteoutDone;
  const hasInput = canMove && _move.lengthSq() > 0;
  const sprinting = !!(keys['ShiftLeft'] || keys['ShiftRight']);
  let maxSpeed = sprinting ? 4.05 : 2.38;
  if (state.panicTimer > 0) {
    maxSpeed *= 0.54;
  }
  if (shadowEvent.mode === 'loop3_chase' && state.pos.z < -15.0) {
    const calmEase = Math.max(0, Math.min(1, (-15.0 - state.pos.z) / 36.0));
    maxSpeed = Math.min(maxSpeed, 3.0) * (1 - calmEase * 0.46);
  }

  let targetVelX = 0, targetVelZ = 0;
  if (hasInput) {
    _move.normalize();
    targetVelX = _move.x * maxSpeed;
    targetVelZ = _move.z * maxSpeed;
  }

  const accelRate = hasInput ? 13.0 : 11.0;
  const velLerp = 1 - Math.exp(-accelRate * dt);
  state.velX += (targetVelX - state.velX) * velLerp;
  state.velZ += (targetVelZ - state.velZ) * velLerp;

  const curSpeed = Math.hypot(state.velX, state.velZ);
  const isMoving = canMove && curSpeed > 0.12;

  if (canMove && curSpeed > 0.01) {
    const stepX = state.velX * dt;
    const stepZ = state.velZ * dt;
    if (!collides(state.pos.x + stepX, state.pos.z, colliders)) state.pos.x += stepX;
    else state.velX = 0;
    if (!collides(state.pos.x, state.pos.z + stepZ, colliders)) state.pos.z += stepZ;
    else state.velZ = 0;
  } else if (!canMove) {
    state.velX = 0;
    state.velZ = 0;
  }

  if (isMoving) {
    state.stepAccum += curSpeed * dt;
    if (state.stepAccum > 1.15) {
      state.stepAccum = 0;
      const surface = state.pos.z < -10.5
        ? 'wet'
        : (state.pos.x < -4.0 || (state.pos.x > 3.5 && state.pos.z > -1.0))
          ? 'tile'
          : 'wood';
      audio.playFootstep(sprinting ? 0.36 : 0.24, false, surface);
    }
  }

  const bobBlendTarget = isMoving ? Math.min(1, curSpeed / 2.3) : 0;
  state.bobBlend += (bobBlendTarget - state.bobBlend) * (1 - Math.exp(-10 * dt));
  if (state.bobBlend > 0.01) {
    state.bobPhase += dt * (sprinting ? 11.2 : 7.2);
  }

  return { isMoving, sprinting, curSpeed, forward: _forward, right: _right };
}
