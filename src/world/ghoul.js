import * as THREE from 'three';
import { makeGhoulFaceTex } from './textures.js';

const PATROL_WAYPOINTS = [
  new THREE.Vector3(-4.8, 0, -16.8),
  new THREE.Vector3( 4.8, 0, -16.8),
  new THREE.Vector3( 5.0, 0, -24.5),
  new THREE.Vector3( 4.8, 0, -31.8),
  new THREE.Vector3(-4.8, 0, -31.8),
  new THREE.Vector3(-5.0, 0, -24.5)
];

export function createGhoul(scene) {
  const g = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x8f857b, roughness: 0.48, metalness: 0.08,
    emissive: 0x1a1412, emissiveIntensity: 0.45
  });
  const faceTex = makeGhoulFaceTex();
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex, roughness: 0.42, emissive: 0x221614, emissiveMap: faceTex, emissiveIntensity: 0.55
  });
  const ragMat = new THREE.MeshStandardMaterial({ color: 0x171412, roughness: 0.92 });

  // Gaunt hunched legs
  const legGeo = new THREE.CylinderGeometry(0.065, 0.042, 0.95, 8);
  const legL = new THREE.Mesh(legGeo, skinMat); legL.position.set(-0.16, 0.48, 0);
  const legR = new THREE.Mesh(legGeo, skinMat); legR.position.set(0.16, 0.48, 0);
  g.add(legL, legR);

  // Emaciated hunched torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.96, 0);
  torsoGroup.rotation.x = 0.34;
  g.add(torsoGroup);

  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.11, 0.82, 10), skinMat);
  spine.scale.set(1.05, 1, 0.65); spine.position.y = 0.4;
  const rag = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.48, 10), ragMat);
  rag.position.y = 0.1;
  torsoGroup.add(spine, rag);

  // Twitching elongated neck + scarred unhinged head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.94, 0.16);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.22, 8), skinMat);
  neck.position.set(0, -0.08, -0.04);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 16), faceMat);
  head.scale.set(0.84, 1.28, 0.96);
  head.rotation.y = -Math.PI / 2;
  headGroup.add(neck, head);
  torsoGroup.add(headGroup);

  // Spindly long clawed arms
  const armGeo = new THREE.CylinderGeometry(0.042, 0.025, 0.95, 8);
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(-0.26, 0.44, 0.16); armL.rotation.x = -0.55; armL.rotation.z = 0.12;
  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(0.26, 0.44, 0.16); armR.rotation.x = -0.55; armR.rotation.z = -0.12;
  torsoGroup.add(armL, armR);

  g.visible = false;
  scene.add(g);

  const ai = {
    active: false,
    mode: 'PATROL', // PATROL | INVESTIGATE | CHASE | SEARCH | TUNNEL_CHASE
    wpIndex: 0,
    targetPos: new THREE.Vector3(),
    searchTimer: 0,
    stepAccum: 0,
    breathTimer: 1.5,
    stunTimer: 0
  };

  const _dir = new THREE.Vector3();

  function alertNoise(pos, loud = false) {
    if (!ai.active || ai.mode === 'TUNNEL_CHASE') return;
    const dist = g.position.distanceTo(pos);
    if (dist < (loud ? 13.5 : 6.5)) {
      if (ai.mode !== 'CHASE') {
        ai.mode = 'INVESTIGATE';
        ai.targetPos.set(pos.x, 0, pos.z);
        ai.searchTimer = 5.5;
      }
    }
  }

  function spawnZone2() {
    ai.active = true;
    ai.mode = 'PATROL';
    ai.wpIndex = 2;
    g.position.set(5.2, 0, -31.5);
    g.visible = true;
    ai.stunTimer = 0;
  }

  function startTunnelChase() {
    ai.active = true;
    ai.mode = 'TUNNEL_CHASE';
    g.position.set(0, 0, -34.6);
    g.visible = true;
    ai.stunTimer = 0;
  }

  function reset() {
    ai.active = false;
    ai.mode = 'PATROL';
    ai.stunTimer = 0;
    g.visible = false;
  }

  function update(dt, tSec, playerPos, playerRight, state, audio, colliders, collidesFn, onCatch) {
    if (!ai.active || !g.visible) return 0;

    if (ai.stunTimer > 0) {
      ai.stunTimer -= dt;
      return 0.25;
    }

    // Distance & stereo pan to player
    const toPlayer = _dir.subVectors(playerPos, g.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();
    const prox01 = Math.max(0, Math.min(1, 1 - (dist - 1.5) / 14.0));
    const pan = dist > 0.01 ? Math.max(-0.92, Math.min(0.92, _dir.clone().normalize().dot(playerRight))) : 0;

    // Uncanny animation
    const twitch = Math.sin(tSec * 3.1) * Math.sin(tSec * 8.9) > 0.84 ? 0.42 : 0;
    headGroup.rotation.z = 0.22 + twitch + Math.sin(tSec * 15) * (ai.mode === 'CHASE' || ai.mode === 'TUNNEL_CHASE' ? 0.14 : 0.03);

    // Guttural breathing
    ai.breathTimer -= dt;
    if (ai.breathTimer <= 0 && dist < 16) {
      ai.breathTimer = ai.mode === 'CHASE' || ai.mode === 'TUNNEL_CHASE' ? 1.1 : 2.6 + Math.random() * 1.4;
      audio.playGhoulBreath(pan, prox01);
    }

    // Detection logic (Zone 2 stealth)
    if (ai.mode !== 'TUNNEL_CHASE') {
      const hasLight = state.lanternOn || state.matchTimer > 0;
      let detectRange = hasLight ? 6.8 : 2.8;
      if (state.crouching && !hasLight) detectRange = 1.45;
      if (state.holdingBreath && state.crouching && !hasLight) detectRange = 0.95;
      if (playerPos.z > -13.6 || playerPos.z < -34.2) detectRange = 0; // Safe outside Zone 2

      if (dist < detectRange) {
        if (ai.mode !== 'CHASE') {
          audio.playGhoulScreech(pan);
          state.shakeTime = 0.45;
        }
        ai.mode = 'CHASE';
        ai.targetPos.set(playerPos.x, 0, playerPos.z);
        ai.searchTimer = 4.2;
      } else if (ai.mode === 'CHASE') {
        ai.searchTimer -= dt;
        if (ai.searchTimer <= 0) {
          ai.mode = 'SEARCH';
          ai.searchTimer = 4.5;
        }
      }
    } else {
      // Tunnel chase stops if player slammed blast door!
      if (state.blastClosed) {
        ai.active = false;
        g.visible = false;
        return 0;
      }
      ai.targetPos.set(playerPos.x, 0, playerPos.z);
    }

    // Select movement target & speed
    let speed = 1.18;
    if (ai.mode === 'PATROL') {
      ai.targetPos.copy(PATROL_WAYPOINTS[ai.wpIndex]);
      if (g.position.distanceTo(ai.targetPos) < 0.9) {
        ai.wpIndex = (ai.wpIndex + 1) % PATROL_WAYPOINTS.length;
      }
    } else if (ai.mode === 'INVESTIGATE') {
      speed = 1.65;
      if (g.position.distanceTo(ai.targetPos) < 1.1) {
        ai.mode = 'SEARCH';
        ai.searchTimer = 3.4;
      }
    } else if (ai.mode === 'SEARCH') {
      speed = 0.65;
      ai.searchTimer -= dt;
      if (ai.searchTimer <= 0) ai.mode = 'PATROL';
    } else if (ai.mode === 'CHASE') {
      speed = 2.45;
    } else if (ai.mode === 'TUNNEL_CHASE') {
      speed = 2.75;
    }

    // Move toward targetPos with simple wall slide
    _dir.subVectors(ai.targetPos, g.position);
    _dir.y = 0;
    const tDist = _dir.length();
    if (tDist > 0.15) {
      _dir.divideScalar(tDist);
      const nx = g.position.x + _dir.x * speed * dt;
      const nz = g.position.z + _dir.z * speed * dt;
      if (!collidesFn(nx, g.position.z, colliders, 0.36)) g.position.x = nx;
      if (!collidesFn(g.position.x, nz, colliders, 0.36)) g.position.z = nz;
      g.lookAt(ai.targetPos.x, 0, ai.targetPos.z);

      const swing = Math.sin(tSec * speed * 3.8);
      legL.rotation.x = swing * 0.45;
      legR.rotation.x = -swing * 0.45;
      armL.rotation.x = -0.55 - swing * 0.35;
      armR.rotation.x = -0.55 + swing * 0.35;

      ai.stepAccum += speed * dt;
      if (ai.stepAccum > 1.05) {
        ai.stepAccum = 0;
        const inWater = g.position.z < -34.0 && g.position.z > -50.0;
        if (dist < 18) {
          audio.playFootstep(Math.max(0.08, prox01 * 0.45), inWater, true, pan);
        }
      }
    }

    // Catch check
    if (dist < 1.15 && Math.abs(playerPos.z - g.position.z) < 1.2) {
      ai.stunTimer = 6.5;
      if (ai.mode !== 'TUNNEL_CHASE') {
        ai.mode = 'PATROL';
        g.position.set(4.8, 0, -24.5);
      } else {
        g.position.set(0, 0, -34.2);
      }
      onCatch();
    }

    return prox01;
  }

  return { group: g, ai, alertNoise, spawnZone2, startTunnelChase, reset, update };
}
