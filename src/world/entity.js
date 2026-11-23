import * as THREE from 'three';

export function createShadowPresence(scene, materials) {
  const g = new THREE.Group();
  const coreShadowMat = materials.coreShadowMat || new THREE.MeshBasicMaterial({ color: 0x030305 });
  const mistMat = materials.mistMat || new THREE.MeshBasicMaterial({
    color: 0x05060a,
    transparent: true,
    opacity: 0.42,
    depthWrite: false
  });

  // Pure dark humanoid shadow silhouette (no ghost face, no claws)
  const lowerSilhouette = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 1.18, 16), coreShadowMat);
  lowerSilhouette.position.y = 0.59;
  g.add(lowerSilhouette);

  const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.62, 16), coreShadowMat);
  upperTorso.position.set(0, 1.46, 0.02);
  g.add(upperTorso);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), coreShadowMat);
  shoulders.scale.set(1.18, 0.48, 0.68);
  shoulders.position.set(0, 1.72, 0.02);
  g.add(shoulders);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.16, 12), coreShadowMat);
  neck.position.set(0, 1.85, 0.03);
  g.add(neck);

  // Subtle shadow mist aura around body & floor
  const auraShell = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.48, 1.88, 16), mistMat);
  auraShell.position.y = 0.94;
  g.add(auraShell);

  const floorPool = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), mistMat);
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.y = 0.02;
  g.add(floorPool);

  const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.44, 10);
  const foreArmGeo = new THREE.CylinderGeometry(0.044, 0.03, 0.46, 10);
  function makeShadowArm(side) {
    const ag = new THREE.Group();
    ag.position.set(side * 0.28, 1.7, 0.02);
    const upper = new THREE.Mesh(upperArmGeo, coreShadowMat);
    upper.position.set(0, -0.22, 0.02);
    ag.add(upper);
    const fore = new THREE.Mesh(foreArmGeo, coreShadowMat);
    fore.position.set(0, -0.64, 0.06);
    fore.rotation.x = -0.15;
    ag.add(fore);
    return ag;
  }
  const armL = makeShadowArm(-1), armR = makeShadowArm(1);
  g.add(armL, armR);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.04, 0.04);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 16), coreShadowMat);
  head.scale.set(0.88, 1.12, 0.92);
  headGroup.add(head);
  const eyeMat = materials.eyeMat || new THREE.MeshBasicMaterial({ color: 0xf4f7ff });
  const eyeGeo = new THREE.SphereGeometry(0.016, 10, 10);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.scale.set(1.15, 0.72, 0.6);
  eyeL.position.set(-0.046, 0.022, 0.122);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.scale.set(1.15, 0.72, 0.6);
  eyeR.position.set(0.046, 0.022, 0.122);
  headGroup.add(eyeL, eyeR);
  g.add(headGroup);

  // Subtle cold backlight sprite proxy (replaces PointLight to stay within WebGL light budget)
  const strobeColor = new THREE.Color(0x46586e);
  const strobeMat = new THREE.SpriteMaterial({
    map: materials.glintTex || null,
    color: strobeColor,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const strobeSprite = new THREE.Sprite(strobeMat);
  strobeSprite.position.set(0, 1.65, -0.35);
  strobeSprite.scale.set(1.6, 2.4, 1);
  g.add(strobeSprite);

  let _strobeIntensity = 0.25;
  const strobe = {
    color: strobeColor,
    sprite: strobeSprite,
    get intensity() {
      return _strobeIntensity;
    },
    set intensity(v) {
      _strobeIntensity = Number.isFinite(v) ? Math.max(0, v) : 0;
      strobeSprite.visible = _strobeIntensity > 0.01;
      strobeMat.opacity = Math.min(0.55, _strobeIntensity * 0.95);
    }
  };

  g.visible = false;
  scene.add(g);
  return { group: g, headGroup, strobe, armL, armR };
}
