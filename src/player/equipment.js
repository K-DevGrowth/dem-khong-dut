import * as THREE from 'three';
import { makeFlameSpriteTex, makeGlowHaloTex } from '../world/textures.js';

export function createEquipment(camera) {
  const flameTex = makeFlameSpriteTex();
  const haloTex = makeGlowHaloTex();

  // --- RIGHT HAND: MATCHSTICK ---
  const matchLight = new THREE.PointLight(0xff9c48, 0, 10.5, 1.45);
  matchLight.position.set(0.20, -0.05, -0.34);
  camera.add(matchLight);

  const matchGroup = new THREE.Group();
  const stick = new THREE.Mesh(
    new THREE.BoxGeometry(0.007, 0.14, 0.007),
    new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.85 })
  );
  stick.rotation.set(0.2, 0, 0.14);
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.004, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a100c, emissive: 0xa8320e, emissiveIntensity: 0.9 })
  );
  tip.position.set(-0.01, 0.072, 0.015);
  const matchFlame = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flameTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  matchFlame.scale.set(0.055, 0.095, 1);
  matchFlame.position.set(-0.012, 0.11, 0.018);

  const matchHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  matchHalo.scale.set(0.16, 0.16, 1);
  matchHalo.position.copy(matchFlame.position);

  matchGroup.add(stick, tip, matchFlame, matchHalo);
  matchGroup.position.set(0.27, -0.24, -0.45);
  matchGroup.visible = false;
  camera.add(matchGroup);

  // --- LEFT HAND: ANTIQUE OIL LANTERN (Amnesia: Rebirth style) ---
  const lanternLight = new THREE.PointLight(0xffbc68, 0, 16.5, 1.32);
  lanternLight.position.set(-0.24, -0.08, -0.42);
  camera.add(lanternLight);

  const lanternGroup = new THREE.Group();
  const brassMat = new THREE.MeshStandardMaterial({ color: 0x6b532e, roughness: 0.42, metalness: 0.78 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffd79a, emissive: 0xd9842b, emissiveIntensity: 0.45,
    transparent: true, opacity: 0.72, roughness: 0.2
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 0.055, 12), brassMat);
  base.position.y = -0.085;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.125, 12), glassMat);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.05, 12), brassMat);
  cap.position.y = 0.088;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 8, 14), brassMat);
  ring.position.y = 0.125;

  const lFlame = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flameTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  lFlame.scale.set(0.042, 0.072, 1);
  lFlame.position.set(0, 0.0, 0);

  lanternGroup.add(base, glass, cap, ring, lFlame);
  lanternGroup.position.set(-0.30, -0.26, -0.48);
  lanternGroup.visible = false;
  camera.add(lanternGroup);

  function update(dt, tSec, state, isMoving, sprinting) {
    // Match burn
    if (state.matchTimer > 0) {
      state.matchTimer = Math.max(0, state.matchTimer - dt * (sprinting ? 1.25 : 1.0));
      const fade = Math.min(1, state.matchTimer / 2.5);
      matchLight.intensity = (2.55 + Math.sin(tSec * 19) * 0.22 + Math.cos(tSec * 31) * 0.10) * fade;
      matchFlame.scale.set(0.055 * fade, (0.095 + Math.sin(tSec * 19) * 0.012) * fade, 1);
      matchGroup.position.x = 0.27 + (isMoving ? Math.sin(tSec * 7.5) * 0.012 : 0);
      matchGroup.position.y = -0.24 + (isMoving ? Math.abs(Math.cos(tSec * 7.5)) * 0.014 : Math.sin(tSec * 2) * 0.004);
      if (state.matchTimer <= 0) {
        matchGroup.visible = false;
        matchLight.intensity = 0;
      }
    }

    // Oil Lantern burn
    if (state.lanternOn && state.hasLantern) {
      if (state.oil > 0) {
        state.oil = Math.max(0, state.oil - dt * 0.72); // ~138s per full tank
        const low = state.oil < 15 ? (0.45 + Math.sin(tSec * 26) * 0.35) : 1.0;
        lanternLight.intensity = (3.15 + Math.sin(tSec * 11) * 0.14) * low;
        glassMat.emissiveIntensity = 0.55 * low;
        lFlame.visible = true;
        lanternGroup.visible = true;
        lanternGroup.position.x = -0.30 + (isMoving ? Math.sin(tSec * 7.5 + 1.2) * 0.015 : 0);
        lanternGroup.position.y = -0.26 + (isMoving ? Math.abs(Math.cos(tSec * 7.5)) * 0.016 : Math.sin(tSec * 1.8) * 0.005);
        lanternGroup.rotation.z = isMoving ? Math.sin(tSec * 7.5) * 0.07 : Math.sin(tSec * 1.5) * 0.02;
      } else {
        state.lanternOn = false;
        lanternLight.intensity = 0;
        glassMat.emissiveIntensity = 0;
        lFlame.visible = false;
        lanternGroup.visible = false;
      }
    } else {
      lanternLight.intensity = 0;
      lanternGroup.visible = false;
    }
  }

  return { matchGroup, matchLight, lanternGroup, lanternLight, update };
}
