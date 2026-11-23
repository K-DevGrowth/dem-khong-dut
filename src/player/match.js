import * as THREE from "three";
import { makeFlameSpriteTex, makeGlowHaloTex } from "../world/textures.js";

export function createMatchSystem(scene, camera) {
  // Brighter, wider warm flame with softer falloff (decay 1.25) and NO expensive 6-pass PointLight shadow cubemap
  const matchLight = new THREE.PointLight(0xff9942, 0, 10.5, 1.45);
  matchLight.position.set(0.18, -0.06, -0.34);
  matchLight.castShadow = false;
  camera.add(matchLight);

  const matchGroup = new THREE.Group();
  const stickPivot = new THREE.Group();
  stickPivot.rotation.set(0.22, 0, 0.14);
  const stickMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.0075, 0.145, 0.0075),
    new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.85 }),
  );
  stickPivot.add(stickMesh);
  const charTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0042, 0.022, 8),
    new THREE.MeshStandardMaterial({
      color: 0x1a110e,
      emissive: 0x99300c,
      emissiveIntensity: 0.9,
      roughness: 0.95,
    }),
  );
  charTip.position.set(0, 0.078, 0);
  stickPivot.add(charTip);
  matchGroup.add(stickPivot);

  const flameMesh = new THREE.Group();
  const flameSpriteMat = new THREE.SpriteMaterial({
    map: makeFlameSpriteTex(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flameSprite = new THREE.Sprite(flameSpriteMat);
  flameSprite.scale.set(0.052, 0.095, 1);
  flameSprite.position.set(0, 0.034, 0);
  flameMesh.add(flameSprite);

  const glowHaloMat = new THREE.SpriteMaterial({
    map: makeGlowHaloTex(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowHalo = new THREE.Sprite(glowHaloMat);
  glowHalo.scale.set(0.15, 0.15, 1);
  glowHaloMat.opacity = 0.65;
  glowHalo.position.set(0, 0.030, 0);
  flameMesh.add(glowHalo);

  flameMesh.position.set(-0.012, 0.084, 0.019);
  matchGroup.add(flameMesh);
  matchGroup.position.set(0.26, -0.25, -0.45);
  matchGroup.visible = false;
  camera.add(matchGroup);

  return { matchGroup, matchLight, flameMesh, flameSprite, glowHalo };
}

export function toggleOrStrikeMatch(
  state,
  matchGroup,
  matchLight,
  audio,
  updateHUD,
  showSubtitle,
) {
  if (!state.running || state.paused || state.ended || state.wakingTimer > 0)
    return;
  if (state.matchTimer > 0) {
    state.matchTimer = 0;
    matchGroup.visible = false;
    matchLight.intensity = 0;
    audio.playMatchBlowOut();
    updateHUD();
    return;
  }
  if (state.matchesLeft <= 0) {
    showSubtitle(
      "Hết diêm",
      "Bạn đã dùng hết que diêm rồi... Hãy dựa vào ánh sáng nến và đèn trong nhà.",
      3500,
    );
    return;
  }
  state.matchesLeft--;
  state.matchTimer = state.matchMax;
  matchGroup.visible = true;
  matchLight.intensity = 1.95;
  audio.playMatchStrike();
  updateHUD();
}

export function updateMatch(
  dt,
  tSec,
  state,
  matchGroup,
  matchLight,
  flameMesh,
  flameSprite,
  glowHalo,
  isMoving,
  sprinting,
) {
  if (state.matchTimer > 0 && !state.holdingPaper) {
    state.matchTimer = Math.max(
      0,
      state.matchTimer - dt * (sprinting ? 1.4 : 1.0),
    );
    const fade = Math.min(1, state.matchTimer / 3.2);
    matchLight.intensity = (1.95 + Math.sin(tSec * 19) * 0.18) * fade;
    const flk = 1 + Math.sin(tSec * 23) * 0.09 + Math.cos(tSec * 37) * 0.06;
    const stretch = 1 + Math.sin(tSec * 17) * 0.13;
    flameMesh.scale.set(flk * fade, stretch * fade, flk * fade);
    flameSprite.material.rotation =
      Math.sin(tSec * 14) * 0.09 + (isMoving ? -0.14 : 0);
    glowHalo.scale.set(0.15 * flk, 0.15 * flk, 1);
    if (state.matchTimer === 0) {
      matchGroup.visible = false;
      matchLight.intensity = 0;
    }
  }
}