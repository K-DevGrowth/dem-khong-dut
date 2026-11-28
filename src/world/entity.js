import * as THREE from 'three';

/**
 * Procedural high-contrast pale corpse-grey face texture (P.T. / Lisa inspired):
 * Desaturated cold skin with sunken hollow dark eye sockets, subtle tear/rain streaks,
 * gaunt cheekbones, and a dark parted mouth — reacts dynamically to matchlight & lightning!
 */
function makePaleApparitionFaceTex() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Cold pale ash-grey base skin (visible under matchlight/moonlight in dark rooms)
  const base = ctx.createRadialGradient(256, 235, 30, 256, 256, 250);
  base.addColorStop(0.0, '#c8d0d4');
  base.addColorStop(0.55, '#9ea8ae');
  base.addColorStop(0.85, '#606970');
  base.addColorStop(1.0, '#1d2126');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle mottled cold skin & damp grime
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 4 + Math.random() * 18;
    const v = 90 + Math.floor(Math.random() * 65);
    ctx.fillStyle = `rgba(${v},${v + 4},${v + 8},0.08)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gaunt sunken cheek hollows
  const cheekL = ctx.createRadialGradient(188, 300, 8, 188, 300, 58);
  cheekL.addColorStop(0, 'rgba(20, 24, 30, 0.62)');
  cheekL.addColorStop(1, 'rgba(20, 24, 30, 0)');
  ctx.fillStyle = cheekL;
  ctx.fillRect(110, 230, 140, 140);

  const cheekR = ctx.createRadialGradient(324, 300, 8, 324, 300, 58);
  cheekR.addColorStop(0, 'rgba(20, 24, 30, 0.62)');
  cheekR.addColorStop(1, 'rgba(20, 24, 30, 0)');
  ctx.fillStyle = cheekR;
  ctx.fillRect(262, 230, 140, 140);

  // Deep hollow dark eye sockets (no glowing dots — true uncanny sunken shadows)
  function drawHollowSocket(cx, cy, tilt) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    const outer = ctx.createRadialGradient(0, 0, 10, 0, 0, 44);
    outer.addColorStop(0.0, 'rgba(4, 5, 8, 0.98)');
    outer.addColorStop(0.55, 'rgba(12, 15, 20, 0.85)');
    outer.addColorStop(1.0, 'rgba(22, 26, 32, 0.0)');
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner void eye hollow
    ctx.fillStyle = '#030406';
    ctx.beginPath();
    ctx.ellipse(0, 2, 21, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Faint wet specular pinpoint deep inside the dark socket (catches matchlight eerily)
    ctx.fillStyle = 'rgba(195, 215, 228, 0.32)';
    ctx.beginPath();
    ctx.arc(-4, -1, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawHollowSocket(208, 226, 0.08);
  drawHollowSocket(304, 224, -0.10);

  // Dark rain / mascara tear streaks running down pale cheeks
  ctx.strokeStyle = 'rgba(14, 18, 24, 0.48)';
  ctx.lineWidth = 4;
  [
    [198, 244, 192, 336],
    [214, 246, 210, 312],
    [298, 244, 302, 342],
    [312, 242, 318, 305],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 - 4, (y1 + y2) / 2, x2, y2);
    ctx.stroke();
  });

  // Subtle nose bridge shadow
  ctx.fillStyle = 'rgba(24, 28, 34, 0.45)';
  ctx.beginPath();
  ctx.ellipse(256, 276, 10, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Slightly parted, gaunt dark mouth (uncanny frozen gasp/whisper)
  const mouthGrad = ctx.createRadialGradient(256, 336, 4, 256, 336, 34);
  mouthGrad.addColorStop(0.0, '#040305');
  mouthGrad.addColorStop(0.65, 'rgba(26, 18, 22, 0.82)');
  mouthGrad.addColorStop(1.0, 'rgba(36, 28, 30, 0.0)');
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(256, 336, 26, 16, 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Wet dark hair strands framing top & sides of face
  ctx.fillStyle = '#090b0f';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillRect(0, 0, 122, 512);
  ctx.fillRect(390, 0, 512, 512);
  for (let s = 0; s < 26; s++) {
    const sx = 115 + Math.random() * 282;
    const len = 70 + Math.random() * 140;
    ctx.strokeStyle = 'rgba(8, 10, 14, 0.85)';
    ctx.lineWidth = 3 + Math.random() * 6;
    ctx.beginPath();
    ctx.moveTo(sx, 85);
    ctx.quadraticCurveTo(sx + (Math.random() - 0.5) * 30, 85 + len * 0.5, sx + (Math.random() - 0.5) * 42, 85 + len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * P.T. (Lisa)-inspired Rain-Drenched Pale Apparition:
 * Pops eerily out of dark rooms via pale corpse-grey face & elongated hands
 * contrasting against a soaked dark coat, with sunken hollow eyes & wet hair.
 */
export function createShadowPresence(scene, materials) {
  const g = new THREE.Group();

  // Wet drenched dark raincoat / dress fabric (catches faint cold wet sheen in dark!)
  const wetCoatMat = new THREE.MeshStandardMaterial({
    color: 0x101318,
    roughness: 0.32,
    metalness: 0.14,
    emissive: 0x05070b,
    emissiveIntensity: 0.45
  });

  // Pale corpse-grey skin for face, neck & gaunt fingers (pops dramatically in matchlight & dark rooms!)
  const paleSkinMat = new THREE.MeshStandardMaterial({
    color: 0xbac4ca,
    roughness: 0.62,
    metalness: 0.04,
    emissive: 0x262e36,
    emissiveIntensity: 0.52
  });

  const faceTex = makePaleApparitionFaceTex();
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.55,
    metalness: 0.04,
    emissive: 0x2a333c,
    emissiveMap: faceTex,
    emissiveIntensity: 0.42
  });

  const wetHairMat = new THREE.MeshStandardMaterial({
    color: 0x080a0d,
    roughness: 0.28,
    metalness: 0.12
  });

  const tendrilMat = new THREE.MeshStandardMaterial({
    color: 0x0c0f14,
    roughness: 0.42,
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  });

  // Wet puddle shadow under feet
  const floorPool = new THREE.Mesh(
    new THREE.CircleGeometry(0.76, 24),
    new THREE.MeshStandardMaterial({ color: 0x090d12, roughness: 0.08, metalness: 0.68, transparent: true, opacity: 0.72, depthWrite: false })
  );
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.y = 0.016;
  g.add(floorPool);

  // Soaked tattered long coat / dress hem trailing down to floor
  const lowerGroup = new THREE.Group();
  const coatSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.27, 1.18, 14), wetCoatMat);
  coatSkirt.position.set(0, 0.64, 0.0);
  lowerGroup.add(coatSkirt);

  const tendrilSpecs = [
    { x: -0.14, z:  0.05, h: 1.16, rTop: 0.08, rBot: 0.015, rx:  0.05, rz:  0.08 },
    { x:  0.14, z: -0.04, h: 1.18, rTop: 0.08, rBot: 0.015, rx: -0.04, rz: -0.08 },
    { x: -0.19, z: -0.06, h: 1.04, rTop: 0.06, rBot: 0.012, rx: -0.07, rz:  0.12 },
    { x:  0.19, z:  0.06, h: 1.08, rTop: 0.06, rBot: 0.012, rx:  0.06, rz: -0.11 },
    { x:  0.00, z: -0.12, h: 1.12, rTop: 0.07, rBot: 0.015, rx: -0.09, rz:  0.02 },
  ];
  const tendrils = [];
  tendrilSpecs.forEach((s) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(s.rTop, s.rBot, s.h, 8), tendrilMat);
    mesh.position.set(s.x, s.h * 0.5 + 0.04, s.z);
    mesh.rotation.set(s.rx, 0, s.rz);
    lowerGroup.add(mesh);
    tendrils.push({ mesh, baseRx: s.rx, baseRz: s.rz });
  });
  g.add(lowerGroup);

  // Tall, gaunt hunched upper body (~2.16m tall — uncannily tall female apparition)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.16, 0.0);
  torsoGroup.rotation.x = 0.18;
  g.add(torsoGroup);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.13, 0.72, 14), wetCoatMat);
  torso.scale.set(1.02, 1.0, 0.62);
  torso.position.set(0, 0.36, 0.02);
  torsoGroup.add(torso);

  // Sloped wet coat shoulders (subtle asymmetric slump)
  const mantle = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 12), wetCoatMat);
  mantle.scale.set(1.08, 0.54, 0.64);
  mantle.position.set(-0.01, 0.68, 0.02);
  mantle.rotation.z = 0.11;
  torsoGroup.add(mantle);

  // Pale exposed collarbone / gaunt elongated neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.056, 0.24, 10), paleSkinMat);
  neck.position.set(0, 0.84, 0.08);
  neck.rotation.x = 0.26;
  torsoGroup.add(neck);

  // Pale ghostly head with sunken hollow eyes & wet dark hair clinging to one side
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.00, 0.14);
  headGroup.rotation.z = 0.28;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.132, 20, 18), faceMat);
  head.scale.set(0.80, 1.24, 0.90);
  head.rotation.y = -Math.PI / 2; // Align UV center (u=0.5) directly forward (+Z)
  headGroup.add(head);

  // Wet dark hair cap & clinging strands draped down neck and tilted cheek
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.138, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), wetHairMat);
  hairCap.scale.set(0.84, 1.24, 0.96);
  hairCap.position.set(0, 0.02, -0.02);
  headGroup.add(hairCap);

  const strandGeo = new THREE.CylinderGeometry(0.028, 0.005, 0.48, 6);
  [
    [-0.085, -0.18,  0.03, -0.18, 0.06],
    [-0.105, -0.22, -0.02, -0.24, 0.04],
    [ 0.095, -0.19, -0.02,  0.16, 0.05],
    [ 0.000, -0.22, -0.10,  0.02, 0.16],
    [-0.050, -0.24, -0.09, -0.08, 0.14],
    [ 0.055, -0.24, -0.09,  0.09, 0.14],
  ].forEach(([hx, hy, hz, hrz, hrx]) => {
    const st = new THREE.Mesh(strandGeo, wetHairMat);
    st.position.set(hx, hy, hz);
    st.rotation.set(hrx, 0, hrz);
    headGroup.add(st);
  });

  torsoGroup.add(headGroup);

  // Long wet coat sleeves ending in stark pale gaunt hands & 5 spindly fingers
  const upperArmGeo = new THREE.CylinderGeometry(0.046, 0.034, 0.50, 8);
  const foreArmGeo = new THREE.CylinderGeometry(0.032, 0.022, 0.46, 8);
  const wristGeo = new THREE.CylinderGeometry(0.020, 0.017, 0.09, 8);
  const fingerGeo = new THREE.CylinderGeometry(0.0065, 0.0022, 0.16, 5);

  function makeApparitionArm(side) {
    const ag = new THREE.Group();
    ag.position.set(side * 0.21, side < 0 ? 0.68 : 0.63, 0.03);
    ag.rotation.z = side * 0.07;

    const upper = new THREE.Mesh(upperArmGeo, wetCoatMat);
    upper.position.set(0, -0.25, 0.02);
    upper.rotation.x = -0.10;
    ag.add(upper);

    const foreGroup = new THREE.Group();
    foreGroup.position.set(0, -0.49, 0.05);
    foreGroup.rotation.x = side < 0 ? -0.26 : -0.38;

    const sleeve = new THREE.Mesh(foreArmGeo, wetCoatMat);
    sleeve.position.set(0, -0.23, 0.0);
    foreGroup.add(sleeve);

    // Pale bony wrist & 5 clutching fingers protruding from dark wet sleeve
    const wrist = new THREE.Mesh(wristGeo, paleSkinMat);
    wrist.position.set(0, -0.48, 0.01);
    foreGroup.add(wrist);

    const hand = new THREE.Group();
    hand.position.set(0, -0.52, 0.01);
    for (let f = -2; f <= 2; f++) {
      const fing = new THREE.Mesh(fingerGeo, paleSkinMat);
      fing.position.set(f * 0.013, -0.075, 0.014 + Math.abs(f) * 0.005);
      fing.rotation.z = f * 0.13;
      fing.rotation.x = -0.28 - Math.abs(f) * 0.06;
      hand.add(fing);
    }
    foreGroup.add(hand);
    ag.add(foreGroup);
    return ag;
  }

  const armL = makeApparitionArm(-1);
  const armR = makeApparitionArm(1);
  torsoGroup.add(armL, armR);

  // Subtle cold eerie moonlight rim proxy around pale apparition
  const strobeColor = new THREE.Color(0x526b88);
  const strobeMat = new THREE.SpriteMaterial({
    map: materials.glintTex || null,
    color: strobeColor,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const strobeSprite = new THREE.Sprite(strobeMat);
  strobeSprite.position.set(0, 1.72, -0.34);
  strobeSprite.scale.set(1.5, 2.3, 1);
  g.add(strobeSprite);

  let _strobeIntensity = 0.22;
  const strobe = {
    color: strobeColor,
    sprite: strobeSprite,
    get intensity() {
      return _strobeIntensity;
    },
    set intensity(v) {
      _strobeIntensity = Number.isFinite(v) ? Math.max(0, v) : 0;
      strobeSprite.visible = _strobeIntensity > 0.01;
      strobeMat.opacity = Math.min(0.48, _strobeIntensity * 0.88);
    }
  };

  g.visible = false;
  scene.add(g);
  return { group: g, headGroup, torsoGroup, tendrils, strobe, armL, armR };
}
