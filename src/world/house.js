import * as THREE from 'three';
import { createWindowRainSystem, makeTileFloorTex, makeRugTexture, makeContactShadowTex } from './textures.js';

export function createHouse(scene, materials, colliders, interactables, getState) {
  // Shared BoxGeometry cache to avoid duplicate GPU buffer allocations
  const boxGeoCache = new Map();
  function getBoxGeo(w, h, d) {
    const key = `${w}_${h}_${d}`;
    let geo = boxGeoCache.get(key);
    if (!geo) {
      geo = new THREE.BoxGeometry(w, h, d);
      boxGeoCache.set(key, geo);
    }
    return geo;
  }

  function addBox(w, h, d, x, y, z, mat, solid = true, cast = true, receive = true) {
    const mesh = new THREE.Mesh(getBoxGeo(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    if (solid) {
      colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, active: true });
    }
    return mesh;
  }

  // Lightweight additive sprite proxy replacing micro PointLights (zero shader light cost)
  function createGlowProxy(parent, hexColor, pos, baseScale, initialIntensity = 0, maxOpacity = 0.72) {
    const color = new THREE.Color(hexColor);
    const mat = new THREE.SpriteMaterial({
      map: materials.glintTex || null,
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(pos[0], pos[1], pos[2]);
    parent.add(sprite);

    let _intensity = 0;
    const sync = () => {
      const clamped = Math.max(0, _intensity);
      sprite.visible = clamped > 0.01;
      mat.opacity = Math.min(maxOpacity, clamped * 0.45);
      const s = baseScale * (0.75 + Math.min(1.6, clamped * 0.45));
      sprite.scale.set(s, s, 1);
    };

    const proxy = {
      isGlowProxy: true,
      sprite,
      color,
      position: sprite.position,
      get intensity() {
        return _intensity;
      },
      set intensity(v) {
        _intensity = Number.isFinite(v) ? v : 0;
        sync();
      },
      get visible() {
        return sprite.visible;
      },
      set visible(v) {
        sprite.visible = Boolean(v);
      }
    };
    proxy.intensity = initialIntensity;
    return proxy;
  }

  // Subtle midnight blue-black ambient fill so dark rooms show eerie silhouettes
  const nightHemi = new THREE.HemisphereLight(0x1a283d, 0x070608, 0.22);
  scene.add(nightHemi);

  // Soft contact shadow decal helper so furniture feels grounded on the floor
  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: makeContactShadowTex(),
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });
  function addContactShadow(w, d, x, z) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), contactShadowMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.008, z);
    scene.add(m);
  }

  // Ceilings and floors
  addBox(17.6, 0.25, 17, -0.1, -0.125, -3.0, materials.floorMat, false, false, true);
  addBox(17.6, 0.25, 17, -0.1, 3.25, -3.0, materials.ceilingMat, false, false, true);

  // Instanced ceiling beams (6 beams -> 1 draw call)
  {
    const beamZs = [];
    for (let z = 3.2; z >= -9.8; z -= 2.6) beamZs.push(z);
    const beamInst = new THREE.InstancedMesh(getBoxGeo(17.2, 0.16, 0.18), materials.woodDarkMat, beamZs.length);
    beamInst.receiveShadow = true;
    const dummy = new THREE.Object3D();
    beamZs.forEach((z, i) => {
      dummy.position.set(-0.1, 3.08, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      beamInst.setMatrixAt(i, dummy.matrix);
    });
    beamInst.instanceMatrix.needsUpdate = true;
    scene.add(beamInst);
  }

  // Rain on window system
  const { rainWinTex, updateWindowRain } = createWindowRainSystem();
  const slatGeo = getBoxGeo(1.34, 0.035, 0.04);
  const windowGlassMat = new THREE.MeshBasicMaterial({ map: rainWinTex });

  let livingWindowMoon = null;
  function addMoonlitWindow(x, y, z, rotY, isLiving = false) {
    const wg = new THREE.Group();
    wg.position.set(x, y, z);
    wg.rotation.y = rotY;
    wg.add(new THREE.Mesh(getBoxGeo(1.5, 1.5, 0.12), materials.woodDarkMat));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 1.32), windowGlassMat);
    glass.position.z = 0.065;
    wg.add(glass);

    // Instanced blinds/slats per window (9 slats -> 1 draw call)
    const slatYs = [];
    for (let sy = -0.58; sy <= 0.58; sy += 0.14) slatYs.push(sy);
    const slatInst = new THREE.InstancedMesh(slatGeo, materials.woodDarkMat, slatYs.length);
    const dummy = new THREE.Object3D();
    slatYs.forEach((sy, i) => {
      dummy.position.set(0, sy, 0.08);
      dummy.rotation.set(0.35, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      slatInst.setMatrixAt(i, dummy.matrix);
    });
    slatInst.instanceMatrix.needsUpdate = true;
    wg.add(slatInst);

    // Subtle dark drapery curtains flanking each rainy window
    const curtainL = new THREE.Mesh(getBoxGeo(0.24, 1.92, 0.08), materials.blanketMat);
    curtainL.position.set(-0.78, -0.08, 0.10);
    const curtainR = new THREE.Mesh(getBoxGeo(0.24, 1.92, 0.08), materials.blanketMat);
    curtainR.position.set(0.78, -0.08, 0.10);
    const curtainRod = new THREE.Mesh(getBoxGeo(1.92, 0.035, 0.035), materials.metalMat);
    curtainRod.position.set(0, 0.88, 0.12);
    wg.add(curtainL, curtainR, curtainRod);
    scene.add(wg);

    // Only keep 1 real SpotLight (living room window) to stay within WebGL light budget
    if (isLiving) {
      const moon = new THREE.SpotLight(0x638cb8, 1.15, 9.5, Math.PI / 3.2, 0.65, 1.5);
      moon.position.set(x + 0.25, y + 0.1, z);
      moon.target.position.set(x + 3.5, 0.1, z);
      scene.add(moon, moon.target);
      livingWindowMoon = moon;
    } else {
      createGlowProxy(wg, 0x638cb8, [0, 0, 0.22], 1.65, 0.75, 0.28);
    }
  }
  addMoonlitWindow(-3.32, 1.85, 1.6, Math.PI / 2, false);
  addMoonlitWindow(-3.82, 1.85, -6.0, Math.PI / 2, true);

  // Exterior storm lightning flash light (synced with distant thunder)
  const lightningLight = new THREE.PointLight(0xa8ceff, 0, 18, 1.35);
  lightningLight.position.set(-2.9, 2.2, -5.8);
  scene.add(lightningLight);

  // ==========================================
  // 1. BEDROOM
  // ==========================================
  addBox(7.2, 3.3, 0.3, 0, 1.65, 4.5, materials.wallMat);
  addBox(0.3, 3.3, 5.7, -3.5, 1.65, 1.75, materials.wallMat);
  // East wall split for bathroom doorway
  addBox(0.3, 3.3, 0.65, 3.5, 1.65, -0.72, materials.wallMat);
  addBox(0.3, 3.3, 3.35, 3.5, 1.65, 2.92, materials.wallMat);
  addBox(0.3, 0.75, 1.8, 3.5, 2.9, 0.425, materials.wallMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -0.4, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, 1.25, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, 3.5, 2.56, 0.425, materials.woodDarkMat, false);
  // North bedroom wall
  addBox(2.75, 3.3, 0.3, -2.2, 1.65, -1.0, materials.wallMat);
  addBox(2.75, 3.3, 0.3, 2.2, 1.65, -1.0, materials.wallMat);
  addBox(1.8, 0.75, 0.3, 0, 2.9, -1.0, materials.wallMat, false);
  addBox(0.12, 2.58, 0.36, -0.88, 1.29, -1.0, materials.woodDarkMat, false);
  addBox(0.12, 2.58, 0.36, 0.88, 1.29, -1.0, materials.woodDarkMat, false);
  addBox(1.88, 0.12, 0.36, 0, 2.56, -1.0, materials.woodDarkMat, false);

  // Bed & Bed Rug
  const bedRug = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.0),
    new THREE.MeshStandardMaterial({ map: makeRugTexture('#382022', '#73533a'), roughness: 0.96 })
  );
  bedRug.rotation.x = -Math.PI / 2;
  bedRug.position.set(0.3, 0.012, 2.2);
  bedRug.receiveShadow = true;
  scene.add(bedRug);

  addBox(2.1, 0.36, 2.4, -1.7, 0.22, 3.0, materials.woodRichMat);
  [[-2.7, 1.84], [-0.7, 1.84], [-2.7, 4.16], [-0.7, 4.16]].forEach(([px, pz]) => {
    addBox(0.11, pz > 3 ? 1.25 : 0.65, 0.11, px, pz > 3 ? 0.625 : 0.325, pz, materials.woodRichMat, false);
  });
  addBox(2.05, 0.12, 0.08, -1.7, 1.15, 4.16, materials.woodRichMat, false);

  // Instanced headboard slats (7 slats -> 1 draw call)
  {
    const slatXs = [];
    for (let sx = -2.45; sx <= -0.95; sx += 0.25) slatXs.push(sx);
    const headSlats = new THREE.InstancedMesh(getBoxGeo(0.07, 0.68, 0.05), materials.woodRichMat, slatXs.length);
    headSlats.castShadow = true;
    headSlats.receiveShadow = true;
    const dummy = new THREE.Object3D();
    slatXs.forEach((sx, i) => {
      dummy.position.set(sx, 0.78, 4.16);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      headSlats.setMatrixAt(i, dummy.matrix);
    });
    headSlats.instanceMatrix.needsUpdate = true;
    scene.add(headSlats);
  }

  addBox(1.94, 0.22, 2.26, -1.7, 0.49, 3.0, materials.pillowMat, false);
  addBox(1.98, 0.24, 1.62, -1.7, 0.52, 2.66, materials.blanketMat, false);
  addBox(0.76, 0.15, 0.42, -2.14, 0.66, 3.78, materials.pillowMat, false);
  const secondPillowMesh = addBox(0.76, 0.15, 0.42, -1.26, 0.66, 3.78, materials.pillowMat, false);

  // Nightstand & Digital LED Clock
  addBox(0.68, 0.64, 0.58, -0.2, 0.32, 3.9, materials.woodRichMat);
  addBox(0.56, 0.22, 0.04, -0.2, 0.46, 3.6, materials.woodDarkMat, false);
  addBox(0.56, 0.22, 0.04, -0.2, 0.18, 3.6, materials.woodDarkMat, false);
  addBox(0.14, 0.025, 0.04, -0.2, 0.46, 3.57, materials.brassMat, false);
  addBox(0.14, 0.025, 0.04, -0.2, 0.18, 3.57, materials.brassMat, false);

  const clockCanvas = document.createElement('canvas'); clockCanvas.width = 256; clockCanvas.height = 128;
  const clockCtx = clockCanvas.getContext('2d');
  const clockTex = new THREE.CanvasTexture(clockCanvas);
  clockTex.colorSpace = THREE.SRGBColorSpace;
  function drawClockFace(text, color = '#ff4a3d') {
    clockCtx.fillStyle = '#070709'; clockCtx.fillRect(0, 0, 256, 128);
    clockCtx.shadowColor = color; clockCtx.shadowBlur = 14;
    clockCtx.fillStyle = color; clockCtx.font = 'bold 76px monospace';
    clockCtx.textAlign = 'center'; clockCtx.textBaseline = 'middle';
    clockCtx.fillText(text, 128, 66);
    clockTex.needsUpdate = true;
  }
  drawClockFace('02:14');

  const clockMesh = new THREE.Mesh(
    getBoxGeo(0.28, 0.14, 0.12),
    [materials.metalMat, materials.metalMat, materials.metalMat, materials.metalMat, new THREE.MeshBasicMaterial({ map: clockTex }), materials.metalMat]
  );
  clockMesh.position.set(-0.2, 0.71, 3.85);
  clockMesh.rotation.y = -0.35;
  scene.add(clockMesh);

  // Emissive glow proxy instead of PointLight
  const clockGlow = createGlowProxy(scene, 0xff3322, [-0.2, 0.74, 3.72], 0.42, 0.5, 0.42);

  const clockAnomalyObj = {
    type: 'clock_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-0.2, 0.75, 3.85),
    label: () => clockAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra đồng hồ đầu giường bất thường'
  };
  interactables.push(clockAnomalyObj);

  // Bedroom Dresser & Table Lamp
  addBox(1.1, 0.82, 0.6, 1.35, 0.41, 4.05, materials.woodRichMat);
  addBox(0.14, 0.34, 0.14, 1.35, 0.99, 4.05, materials.brassMat, false);
  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, 0.26, 14),
    new THREE.MeshStandardMaterial({ color: 0xebd1a7, emissive: 0xd98f3a, emissiveIntensity: 0.55, roughness: 0.8 })
  );
  lampShade.position.set(1.35, 1.24, 4.05);
  scene.add(lampShade);

  const bedroomLampLight = new THREE.PointLight(0xff9642, 1.15, 6.6, 1.85);
  bedroomLampLight.position.set(1.35, 1.28, 3.95);
  bedroomLampLight.castShadow = true;
  bedroomLampLight.shadow.mapSize.width = 512;
  bedroomLampLight.shadow.mapSize.height = 512;
  bedroomLampLight.shadow.bias = -0.002;
  scene.add(bedroomLampLight);

  // Creepy Interactive Hollow Wardrobe (real open interior with rod, hangers, Alice's coat & back-wall scratches)
  // Hollow outer shell: back, left side, right side, top, bottom + single collider
  addBox(0.08, 2.25, 1.45, 3.30, 1.125, 2.95, materials.woodDarkMat, false); // Back panel
  addBox(0.68, 2.25, 0.08, 3.00, 1.125, 2.26, materials.woodRichMat, false); // North side
  addBox(0.68, 2.25, 0.08, 3.00, 1.125, 3.64, materials.woodRichMat, false); // South side
  addBox(0.68, 0.08, 1.45, 3.00, 2.21, 2.95, materials.woodRichMat, false);  // Top panel
  addBox(0.68, 0.12, 1.45, 3.00, 0.06, 2.95, materials.woodRichMat, false);  // Bottom base
  colliders.push({ minX: 2.66, maxX: 3.34, minZ: 2.22, maxZ: 3.68, active: true });

  // Metal clothes hanging rod & empty hangers inside
  const wRod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.30, 8), materials.chromeMat);
  wRod.rotation.x = Math.PI / 2;
  wRod.position.set(3.00, 1.88, 2.95);
  scene.add(wRod);

  // Alice's thick winter coat hanging inside (visible in Loop 1, vanishes in Loop 2+)
  const aliceCoatGroup = new THREE.Group();
  aliceCoatGroup.position.set(3.00, 1.42, 2.88);
  const coatMat = new THREE.MeshStandardMaterial({ color: 0x4b2429, roughness: 0.90 });
  const coatHanger = new THREE.Mesh(getBoxGeo(0.03, 0.02, 0.42), materials.woodRichMat);
  coatHanger.position.set(0, 0.40, 0);
  const coatBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.19, 0.88, 10), coatMat);
  coatBody.scale.set(0.58, 1.0, 1.35);
  coatBody.position.set(0, -0.05, 0);
  const coatSleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.62, 8), coatMat);
  coatSleeveL.position.set(0, 0.05, -0.22);
  coatSleeveL.rotation.x = 0.08;
  const coatSleeveR = coatSleeveL.clone();
  coatSleeveR.position.z = 0.22;
  coatSleeveR.rotation.x = -0.08;
  aliceCoatGroup.add(coatHanger, coatBody, coatSleeveL, coatSleeveR);
  scene.add(aliceCoatGroup);

  // Secondary dark shirt/jacket hanging beside it
  const spareShirt = new THREE.Mesh(getBoxGeo(0.11, 0.68, 0.34), materials.blanketMat);
  spareShirt.position.set(3.02, 1.48, 3.36);
  scene.add(spareShirt);

  // Scratched date clue inside back wall of wardrobe (revealed in Loops 3-5)
  const wScrawlCanvas = document.createElement('canvas');
  wScrawlCanvas.width = 256; wScrawlCanvas.height = 128;
  const wScrawlCtx = wScrawlCanvas.getContext('2d');
  wScrawlCtx.clearRect(0, 0, 256, 128);
  wScrawlCtx.fillStyle = 'rgba(225, 212, 194, 0.82)';
  wScrawlCtx.font = 'bold 24px monospace';
  wScrawlCtx.textAlign = 'center';
  wScrawlCtx.fillText('ALICE · 14/11', 128, 52);
  wScrawlCtx.fillText('02:14', 128, 92);
  const wScrawlTex = new THREE.CanvasTexture(wScrawlCanvas);
  wScrawlTex.colorSpace = THREE.SRGBColorSpace;
  const wardrobeScrawlMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.92, 0.46),
    new THREE.MeshBasicMaterial({ map: wScrawlTex, transparent: true })
  );
  wardrobeScrawlMesh.position.set(3.25, 1.48, 2.95);
  wardrobeScrawlMesh.rotation.y = -Math.PI / 2;
  wardrobeScrawlMesh.visible = false;
  scene.add(wardrobeScrawlMesh);

  const wardrobeDoorPivot = new THREE.Group();
  wardrobeDoorPivot.position.set(2.65, 0, 2.27);
  scene.add(wardrobeDoorPivot);
  const wDoorMesh = new THREE.Mesh(getBoxGeo(0.05, 2.08, 0.68), materials.woodDarkMat);
  wDoorMesh.position.set(0, 1.12, 0.34);
  wDoorMesh.castShadow = true;
  wardrobeDoorPivot.add(wDoorMesh);
  const wHandle = new THREE.Mesh(getBoxGeo(0.06, 0.14, 0.03), materials.brassMat);
  wHandle.position.set(-0.04, 1.12, 0.62);
  wardrobeDoorPivot.add(wHandle);

  const wardrobeDoorPivot2 = new THREE.Group();
  wardrobeDoorPivot2.position.set(2.65, 0, 3.63);
  scene.add(wardrobeDoorPivot2);
  const wDoorMesh2 = new THREE.Mesh(getBoxGeo(0.05, 2.08, 0.68), materials.woodDarkMat);
  wDoorMesh2.position.set(0, 1.12, -0.34);
  wDoorMesh2.castShadow = true;
  wardrobeDoorPivot2.add(wDoorMesh2);
  const wHandle2 = new THREE.Mesh(getBoxGeo(0.06, 0.14, 0.03), materials.brassMat);
  wHandle2.position.set(-0.04, 1.12, -0.62);
  wardrobeDoorPivot2.add(wHandle2);

  const wardrobeEyes = new THREE.Group();
  const eyeGeo = new THREE.SphereGeometry(0.015, 6, 6);
  const weL = new THREE.Mesh(eyeGeo, materials.weMat);
  weL.position.set(2.74, 1.56, 2.80);
  const weR = new THREE.Mesh(eyeGeo, materials.weMat);
  weR.position.set(2.74, 1.56, 2.93);
  wardrobeEyes.add(weL, weR);
  wardrobeEyes.visible = false;
  scene.add(wardrobeEyes);

  const wardrobeObj = {
    type: 'wardrobe',
    worldPos: new THREE.Vector3(2.6, 1.3, 2.95),
    checkedInLoop: 0,
    targetAngle: 0,
    targetAngle2: 0,
    label: () => wardrobeObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] mở tủ quần áo'
  };
  interactables.push(wardrobeObj);

  // Bedroom Mirror
  addBox(0.08, 1.38, 0.88, -3.32, 1.72, 3.2, materials.woodRichMat, false);
  const mirrorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.24), materials.mirrorMat);
  mirrorMesh.position.set(-3.27, 1.72, 3.2);
  mirrorMesh.rotation.y = Math.PI / 2;
  scene.add(mirrorMesh);
  const mirrorObj = {
    type: 'mirror',
    worldPos: new THREE.Vector3(-3.2, 1.65, 3.2),
    checkedInLoop: 0,
    label: () => mirrorObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] nhìn vào gương'
  };
  interactables.push(mirrorObj);

  // ==========================================
  // 2. LIVING ROOM
  // ==========================================
  addBox(0.3, 3.3, 7.65, -4.0, 1.65, -6.82, materials.wallMat);
  addBox(0.3, 3.3, 0.55, -4.0, 1.65, -1.07, materials.wallMat);
  addBox(0.3, 0.75, 1.8, -4.0, 2.9, -2.175, materials.wallMat, false);
  addBox(0.36, 2.58, 0.12, -4.0, 1.29, -3.0, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, -4.0, 1.29, -1.35, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, -4.0, 2.56, -2.175, materials.woodDarkMat, false);
  addBox(0.3, 3.3, 2.6, 3.5, 1.65, -2.3, materials.wallMat);
  addBox(0.3, 3.3, 5.2, 3.5, 1.65, -7.9, materials.wallMat);
  addBox(0.3, 0.75, 1.8, 3.5, 2.9, -4.45, materials.wallMat, false);
  addBox(3.3, 3.3, 0.3, -2.45, 1.65, -10.5, materials.wallMat);
  addBox(2.8, 3.3, 0.3, 2.2, 1.65, -10.5, materials.wallMat);
  addBox(1.8, 0.75, 0.3, 0, 2.9, -10.5, materials.wallMat, false);
  addBox(0.12, 2.58, 0.36, -0.88, 1.29, -10.5, materials.woodDarkMat, false);
  addBox(0.12, 2.58, 0.36, 0.88, 1.29, -10.5, materials.woodDarkMat, false);
  addBox(1.88, 0.12, 0.36, 0, 2.56, -10.5, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -3.56, materials.woodDarkMat, false);
  addBox(0.36, 2.58, 0.12, 3.5, 1.29, -5.32, materials.woodDarkMat, false);
  addBox(0.36, 0.12, 1.88, 3.5, 2.56, -4.44, materials.woodDarkMat, false);

  const livRug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 4.4),
    new THREE.MeshStandardMaterial({ map: makeRugTexture('#242b2d', '#6e5a44'), roughness: 0.96 })
  );
  livRug.rotation.x = -Math.PI / 2;
  livRug.position.set(-0.3, 0.012, -5.8);
  livRug.receiveShadow = true;
  scene.add(livRug);

  // Sofa
  addBox(0.85, 0.38, 2.2, 2.8, 0.24, -7.8, materials.sofaMat);
  addBox(0.24, 0.78, 2.2, 3.12, 0.58, -7.8, materials.sofaMat, false);
  addBox(0.85, 0.56, 0.2, 2.8, 0.38, -6.75, materials.sofaMat, false);
  addBox(0.85, 0.56, 0.2, 2.8, 0.38, -8.85, materials.sofaMat, false);
  addBox(0.24, 0.26, 0.32, 2.88, 0.56, -7.2, materials.pillowMat, false);
  addBox(0.24, 0.26, 0.32, 2.88, 0.56, -8.4, materials.blanketMat, false);

  // Dining Table + Rotary Phone
  addBox(1.55, 0.08, 1.05, -2.3, 0.76, -5.8, materials.woodRichMat);
  [[-3.0, -6.24], [-1.6, -6.24], [-3.0, -5.36], [-1.6, -5.36]].forEach(([lx, lz]) => {
    addBox(0.08, 0.74, 0.08, lx, 0.37, lz, materials.woodDarkMat, false);
  });

  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(-1.95, 0.84, -5.5);
  const pBase = new THREE.Mesh(getBoxGeo(0.22, 0.09, 0.2), materials.metalMat);
  const pHandset = new THREE.Mesh(getBoxGeo(0.28, 0.05, 0.06), materials.metalMat);
  pHandset.position.set(0, 0.07, 0);
  phoneGroup.add(pBase, pHandset);
  scene.add(phoneGroup);
  // Glow sprite proxy instead of PointLight
  const phoneLed = createGlowProxy(scene, 0xff4433, [-1.95, 0.96, -5.5], 0.36, 0, 0.85);

  const phoneObj = {
    type: 'phone',
    ringing: false,
    answered: false,
    worldPos: new THREE.Vector3(-1.95, 0.9, -5.5),
    label: () => phoneObj.ringing ? 'Nhấn [E] nhấc máy nghe điện thoại' : ''
  };
  interactables.push(phoneObj);

  // Anomalous Chair
  const chairGroup = new THREE.Group();
  const cSeat = new THREE.Mesh(getBoxGeo(0.48, 0.07, 0.48), materials.woodRichMat);
  cSeat.position.y = 0.46; cSeat.castShadow = true;
  const cBack = new THREE.Mesh(getBoxGeo(0.48, 0.54, 0.06), materials.woodRichMat);
  cBack.position.set(0, 0.74, -0.21); cBack.castShadow = true;
  const chairLegGeo = getBoxGeo(0.05, 0.46, 0.05);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(chairLegGeo, materials.woodDarkMat);
    leg.position.set(lx, 0.23, lz); leg.castShadow = true;
    chairGroup.add(leg);
  });
  chairGroup.add(cSeat, cBack);
  chairGroup.position.set(-1.3, 0, -5.8);
  chairGroup.rotation.y = -Math.PI / 2;
  scene.add(chairGroup);

  const chairAnomalyObj = {
    type: 'chair_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-1.3, 0.65, -5.8),
    label: () => chairAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra chiếc ghế bị dịch chuyển'
  };
  interactables.push(chairAnomalyObj);

  // CRT TV
  addBox(1.3, 0.65, 0.55, -3.45, 0.32, -8.3, materials.woodRichMat);
  const tvMesh = addBox(0.76, 0.58, 0.52, -3.45, 0.94, -8.3, materials.metalMat, false);
  const ant1 = addBox(0.02, 0.42, 0.02, -3.45, 1.38, -8.2, materials.metalMat, false); ant1.rotation.x = 0.4;
  const ant2 = addBox(0.02, 0.42, 0.02, -3.45, 1.38, -8.4, materials.metalMat, false); ant2.rotation.x = -0.4;
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), materials.tvScreenMat);
  tvScreen.position.set(-3.18, 0.94, -8.3);
  tvScreen.rotation.y = Math.PI / 2;
  scene.add(tvScreen);

  const tvLight = new THREE.PointLight(0xa5c4e8, 0, 6.5, 2.0);
  tvLight.position.set(-2.8, 0.94, -8.3);
  scene.add(tvLight);

  const tvObj = {
    type: 'tv',
    worldPos: new THREE.Vector3(-3.2, 0.94, -8.3),
    checkedInLoop: 0,
    label: () => {
      const s = getState();
      if (s.loop === 4 && !s.tvTurnedOff) return 'Nhấn [E] tắt màn hình TV nhiễu hạt';
      return (s.loop >= 2 && tvObj.checkedInLoop !== s.loop)
        ? 'Nhấn [E] kiểm tra màn hình TV nhiễu hạt'
        : '';
    }
  };
  interactables.push(tvObj);

  // Family Portrait
  const portraitGroup = new THREE.Group();
  portraitGroup.position.set(-3.82, 1.82, -3.4);
  const pFrameMesh = new THREE.Mesh(getBoxGeo(0.08, 1.06, 0.88), materials.woodRichMat);
  const portraitMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.94), materials.portraitMat);
  portraitMesh.position.set(0.05, 0, 0);
  portraitMesh.rotation.y = Math.PI / 2;
  portraitGroup.add(pFrameMesh, portraitMesh);
  scene.add(portraitGroup);

  const portraitAnomalyObj = {
    type: 'portrait_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-3.75, 1.75, -3.4),
    label: () => portraitAnomalyObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra khung ảnh bất thường'
  };
  interactables.push(portraitAnomalyObj);

  // Bookshelves (all ~80 books merged into 1 THREE.InstancedMesh -> 1 draw call!)
  const bookColors = [0x54231b, 0x1f3629, 0x242838, 0x594627, 0x3d2938];
  const bookInstances = [];
  const shelfFrameGeo = getBoxGeo(1.4, 2.1, 0.36);
  const shelfBoardGeo = getBoxGeo(1.32, 0.04, 0.38);

  function addBookshelf(x, z, rotY) {
    const bg = new THREE.Group();
    bg.position.set(x, 0, z);
    bg.rotation.y = rotY;
    const frame = new THREE.Mesh(shelfFrameGeo, materials.woodRichMat);
    frame.position.y = 1.05; frame.castShadow = true; frame.receiveShadow = true;
    bg.add(frame);

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    for (let sy = 0.42; sy <= 1.7; sy += 0.42) {
      const shelf = new THREE.Mesh(shelfBoardGeo, materials.woodDarkMat);
      shelf.position.set(0, sy, 0.02);
      bg.add(shelf);
      for (let bx = -0.58; bx <= 0.58; bx += 0.12) {
        if (Math.random() > 0.18) {
          const bh = 0.28 + Math.random() * 0.08;
          const lz = 0.02;
          const wx = x + bx * cosY + lz * sinY;
          const wz = z - bx * sinY + lz * cosY;
          bookInstances.push({
            x: wx,
            y: sy + bh / 2,
            z: wz,
            rotY,
            rotZ: (Math.random() - 0.5) * 0.12,
            height: bh,
            colorHex: bookColors[Math.floor(Math.random() * bookColors.length)]
          });
        }
      }
    }
    scene.add(bg);
    colliders.push({ minX: x - 0.72, maxX: x + 0.72, minZ: z - 0.24, maxZ: z + 0.24, active: true });
  }
  addBookshelf(-2.5, -10.1, 0);
  addBookshelf(5.8, -2.88, 0);

  if (bookInstances.length > 0) {
    const bookGeo = new THREE.BoxGeometry(0.08, 1.0, 0.24);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const booksInstanced = new THREE.InstancedMesh(bookGeo, bookMat, bookInstances.length);
    booksInstanced.castShadow = false;
    booksInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();
    bookInstances.forEach((b, idx) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.rotY, b.rotZ);
      dummy.scale.set(1, b.height, 1);
      dummy.updateMatrix();
      booksInstanced.setMatrixAt(idx, dummy.matrix);
      tmpColor.setHex(b.colorHex);
      booksInstanced.setColorAt(idx, tmpColor);
    });
    booksInstanced.instanceMatrix.needsUpdate = true;
    if (booksInstanced.instanceColor) booksInstanced.instanceColor.needsUpdate = true;
    scene.add(booksInstanced);
  }

  // Wall Scrawl
  const wallScrawl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.05), materials.wallScrawlMat);
  wallScrawl.position.set(1.9, 1.65, -0.82);
  wallScrawl.visible = false;
  scene.add(wallScrawl);

  const scrawlAnomalyObj = {
    type: 'scrawl_anomaly',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(1.9, 1.65, -0.85),
    label: () => (!wallScrawl.visible || scrawlAnomalyObj.checkedInLoop === getState().loop)
      ? ''
      : 'Nhấn [E] kiểm tra dòng chữ viết trên tường'
  };
  interactables.push(scrawlAnomalyObj);

  // ==========================================
  // 3. STUDY ROOM
  // ==========================================
  addBox(4.9, 3.3, 0.3, 5.85, 1.65, -2.5, materials.wallMat);
  addBox(4.9, 3.3, 0.3, 5.85, 1.65, -7.5, materials.wallMat);
  addBox(0.3, 3.3, 5.3, 8.2, 1.65, -5.0, materials.wallMat);
  addBox(1.2, 0.08, 1.9, 7.2, 0.78, -5.0, materials.woodRichMat);
  addBox(0.45, 0.74, 0.55, 7.2, 0.37, -4.3, materials.woodDarkMat, false);
  addBox(0.45, 0.74, 0.55, 7.2, 0.37, -5.7, materials.woodDarkMat, false);
  for (let i = 0; i < 4; i++) {
    const pap = addBox(0.24, 0.008, 0.3, 7.1 + (Math.random() - 0.5) * 0.4, 0.83, -5.3 + i * 0.28, materials.pillowMat, false, false, true);
    pap.rotation.y = (Math.random() - 0.5) * 0.6;
  }
  addBox(0.14, 0.28, 0.14, 7.45, 0.96, -4.35, materials.brassMat, false);
  const bankerShade = new THREE.Mesh(
    getBoxGeo(0.18, 0.1, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1e6b47, emissive: 0x165938, emissiveIntensity: 0.6, roughness: 0.35 })
  );
  bankerShade.position.set(7.42, 1.12, -4.35);
  scene.add(bankerShade);
  const studyLampLight = new THREE.PointLight(0x88d4a6, 0.75, 5.0, 1.8);
  studyLampLight.position.set(7.2, 1.05, -4.45);
  scene.add(studyLampLight);

  // ==========================================
  // 4. KITCHEN
  // ==========================================
  addBox(4.6, 3.3, 0.3, -6.2, 1.65, -4.8, materials.wallMat);
  addBox(5.1, 3.3, 0.3, -5.95, 1.65, -1.0, materials.wallMat);
  addBox(0.3, 3.3, 4.1, -8.4, 1.65, -2.9, materials.wallMat);

  const kitchenTileFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.3, 3.65),
    new THREE.MeshStandardMaterial({ map: makeTileFloorTex('#1f2226', '#14161a'), roughness: 0.42, metalness: 0.08 })
  );
  kitchenTileFloor.rotation.x = -Math.PI / 2;
  kitchenTileFloor.position.set(-6.2, 0.012, -2.9);
  kitchenTileFloor.receiveShadow = true;
  scene.add(kitchenTileFloor);

  // Kitchen counter + sink
  addBox(3.2, 0.82, 0.68, -6.4, 0.41, -4.3, materials.woodDarkMat);
  addBox(3.26, 0.06, 0.72, -6.4, 0.85, -4.3, materials.counterTopMat, false);
  addBox(0.68, 0.04, 0.46, -6.7, 0.87, -4.28, materials.metalMat, false);
  addBox(0.04, 0.26, 0.04, -6.7, 1.0, -4.52, materials.chromeMat, false);
  addBox(0.04, 0.04, 0.18, -6.7, 1.12, -4.44, materials.chromeMat, false);
  const kitchenWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.26, 8), materials.waterStreamMat);
  kitchenWaterMesh.position.set(-6.7, 0.99, -4.36);
  kitchenWaterMesh.visible = false;
  scene.add(kitchenWaterMesh);

  const kitchenFaucetObj = {
    type: 'kitchen_faucet',
    running: false,
    dripping: true,
    worldPos: new THREE.Vector3(-6.7, 1.02, -4.35),
    label: () => kitchenFaucetObj.running
      ? 'Nhấn [E] khóa vòi nước bếp đang chảy'
      : (kitchenFaucetObj.dripping ? 'Nhấn [E] vặn chặt vòi nước bếp' : '')
  };
  interactables.push(kitchenFaucetObj);

  const mug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 10), materials.porcelainMat);
  mug1.position.set(-6.15, 0.93, -4.25); scene.add(mug1);
  const mug2 = mug1.clone(); mug2.position.set(-6.02, 0.93, -4.34); scene.add(mug2);

  const kitchenNoteMesh = new THREE.Mesh(
    getBoxGeo(0.2, 0.012, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xe8d9a8, emissive: 0x8f7438, emissiveIntensity: 0.35, roughness: 0.7 })
  );
  kitchenNoteMesh.position.set(-5.35, 0.89, -4.22);
  kitchenNoteMesh.rotation.y = 0.22;
  scene.add(kitchenNoteMesh);

  const kitchenNoteObj = {
    type: 'kitchen_note',
    readInLoop: 0,
    worldPos: new THREE.Vector3(-5.35, 0.92, -4.22),
    label: () => kitchenNoteObj.readInLoop === getState().loop ? '' : 'Nhấn [E] đọc tờ ghi chú trên quầy bếp'
  };
  interactables.push(kitchenNoteObj);

  // Ajar Refrigerator
  addBox(0.76, 1.92, 0.82, -7.88, 0.96, -2.2, materials.fridgeBodyMat);
  const fridgeInterior = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 1.72),
    new THREE.MeshBasicMaterial({ color: 0xdff6ff })
  );
  fridgeInterior.position.set(-7.49, 0.96, -2.2);
  fridgeInterior.rotation.y = Math.PI / 2;
  scene.add(fridgeInterior);

  const fridgeDoorPivot = new THREE.Group();
  fridgeDoorPivot.position.set(-7.48, 0, -1.8);
  scene.add(fridgeDoorPivot);
  const fridgeDoorMesh = new THREE.Mesh(getBoxGeo(0.06, 1.88, 0.8), materials.fridgeBodyMat);
  fridgeDoorMesh.position.set(0, 0.96, -0.4);
  fridgeDoorMesh.castShadow = true;
  fridgeDoorPivot.add(fridgeDoorMesh);
  const fridgeHandle = new THREE.Mesh(getBoxGeo(0.06, 0.32, 0.04), materials.chromeMat);
  fridgeHandle.position.set(0.05, 1.15, -0.72);
  fridgeDoorPivot.add(fridgeHandle);

  const fridgeLight = new THREE.PointLight(0xb8ecff, 1.05, 5.2, 1.8);
  fridgeLight.position.set(-7.22, 1.15, -2.2);
  scene.add(fridgeLight);

  const fridgeObj = {
    type: 'fridge',
    checkedInLoop: 0,
    targetAngle: 0.28,
    worldPos: new THREE.Vector3(-7.45, 1.15, -2.2),
    label: () => fridgeObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra tủ lạnh hở sáng'
  };
  interactables.push(fridgeObj);

  // ==========================================
  // 5. BATHROOM
  // ==========================================
  addBox(4.0, 3.3, 0.3, 5.45, 1.65, -1.0, materials.wallMat);
  addBox(4.0, 3.3, 0.3, 5.45, 1.65, 3.2, materials.wallMat);
  addBox(0.3, 3.3, 4.5, 7.4, 1.65, 1.1, materials.wallMat);

  const bathTileFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 4.05),
    new THREE.MeshStandardMaterial({ map: makeTileFloorTex('#262d34', '#1b2026'), roughness: 0.36, metalness: 0.1 })
  );
  bathTileFloor.rotation.x = -Math.PI / 2;
  bathTileFloor.position.set(5.45, 0.012, 1.1);
  bathTileFloor.receiveShadow = true;
  scene.add(bathTileFloor);

  const bathTubeMesh = new THREE.Mesh(
    getBoxGeo(0.9, 0.05, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xcbe8e2 })
  );
  bathTubeMesh.position.set(5.45, 3.08, 1.1);
  scene.add(bathTubeMesh);

  const bathLight = new THREE.PointLight(0xaad9d0, 0.95, 6.2, 1.7);
  bathLight.position.set(5.45, 2.85, 1.1);
  scene.add(bathLight);

  addBox(2.05, 0.56, 0.85, 5.45, 0.28, -0.4, materials.porcelainMat);
  const bathWaterSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(1.85, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x162228, roughness: 0.12, metalness: 0.55 })
  );
  bathWaterSurface.rotation.x = -Math.PI / 2;
  bathWaterSurface.position.set(5.45, 0.57, -0.4);
  scene.add(bathWaterSurface);

  addBox(0.46, 0.42, 0.52, 6.75, 0.21, 2.55, materials.porcelainMat);
  addBox(0.2, 0.78, 0.44, 7.05, 0.48, 2.55, materials.porcelainMat, false);

  addBox(0.62, 0.8, 1.25, 6.92, 0.4, 1.0, materials.woodDarkMat);
  addBox(0.66, 0.08, 1.3, 6.92, 0.84, 1.0, materials.porcelainMat, false);
  addBox(0.42, 0.04, 0.54, 6.88, 0.87, 1.0, materials.metalMat, false);
  addBox(0.04, 0.22, 0.04, 7.12, 0.98, 1.0, materials.chromeMat, false);
  addBox(0.16, 0.04, 0.04, 7.04, 1.08, 1.0, materials.chromeMat, false);

  const bathWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.015, 0.22, 8), materials.waterStreamMat);
  bathWaterMesh.position.set(6.97, 0.97, 1.0);
  bathWaterMesh.visible = false;
  scene.add(bathWaterMesh);

  const bathFaucetObj = {
    type: 'bath_faucet',
    running: false,
    dripping: true,
    worldPos: new THREE.Vector3(6.92, 1.0, 1.0),
    label: () => bathFaucetObj.running
      ? 'Nhấn [E] khóa vòi nước phòng tắm đang chảy'
      : (bathFaucetObj.dripping ? 'Nhấn [E] vặn chặt vòi nước phòng tắm' : '')
  };
  interactables.push(bathFaucetObj);

  addBox(0.06, 1.08, 0.86, 7.22, 1.66, 1.0, materials.chromeMat, false);
  const bathMirrorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.96), materials.bathMirrorMat);
  bathMirrorMesh.position.set(7.18, 1.66, 1.0);
  bathMirrorMesh.rotation.y = -Math.PI / 2;
  scene.add(bathMirrorMesh);

  const bathMirrorObj = {
    type: 'bath_mirror',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(7.1, 1.62, 1.0),
    label: () => bathMirrorObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] soi gương phòng tắm'
  };
  interactables.push(bathMirrorObj);

  // ==========================================
  // 6. ENVIRONMENTAL STORYTELLING
  // ==========================================
  const envStoryGroup = new THREE.Group();
  scene.add(envStoryGroup);

  const brokenMugGroup = new THREE.Group();
  brokenMugGroup.position.set(-1.1, 0.015, -6.55);
  const spillPuddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 16),
    new THREE.MeshStandardMaterial({ color: 0x17100c, roughness: 0.14, metalness: 0.45 })
  );
  spillPuddle.rotation.x = -Math.PI / 2;
  brokenMugGroup.add(spillPuddle);

  [
    [0.08, 0.02, 0.04, 0.09, 0.04, 0.07, 0.4],
    [-0.12, 0.015, -0.06, 0.07, 0.03, 0.06, -0.8],
    [0.18, 0.012, -0.1, 0.05, 0.02, 0.05, 1.1],
    [-0.04, 0.012, 0.16, 0.06, 0.025, 0.04, 0.2]
  ].forEach(([sx, sy, sz, sw, sh, sd, ry]) => {
    const shMesh = new THREE.Mesh(getBoxGeo(sw, sh, sd), materials.shardMat);
    shMesh.position.set(sx, sy, sz); shMesh.rotation.y = ry;
    brokenMugGroup.add(shMesh);
  });
  envStoryGroup.add(brokenMugGroup);

  const brokenMugObj = {
    type: 'broken_mug',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-1.1, 0.15, -6.55),
    label: () => brokenMugObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] kiểm tra chiếc cốc bị ném vỡ'
  };
  interactables.push(brokenMugObj);

  const doorRainPuddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 22),
    new THREE.MeshStandardMaterial({ color: 0x16222c, roughness: 0.08, metalness: 0.72, transparent: true, opacity: 0.85 })
  );
  doorRainPuddle.rotation.x = -Math.PI / 2;
  doorRainPuddle.scale.set(1.3, 0.65, 1);
  doorRainPuddle.position.set(0.0, 0.014, -9.95);
  doorRainPuddle.visible = false;
  envStoryGroup.add(doorRainPuddle);

  const rainPuddleObj = {
    type: 'rain_puddle',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(0.0, 0.15, -9.95),
    label: () => (!doorRainPuddle.visible || rainPuddleObj.checkedInLoop === getState().loop)
      ? ''
      : 'Nhấn [E] kiểm tra vũng nước mưa dưới khe cửa'
  };
  interactables.push(rainPuddleObj);

  // Smartphone
  const phoneScreenCanvas = document.createElement('canvas');
  phoneScreenCanvas.width = 256; phoneScreenCanvas.height = 440;
  const phoneScreenCtx = phoneScreenCanvas.getContext('2d');
  const phoneScreenTex = new THREE.CanvasTexture(phoneScreenCanvas);
  phoneScreenTex.colorSpace = THREE.SRGBColorSpace;

  function drawSmartphoneScreen(mode) {
    const ctx = phoneScreenCtx;
    ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, 256, 440);
    ctx.fillStyle = '#f2eee6'; ctx.font = 'bold 52px monospace'; ctx.textAlign = 'center';
    ctx.fillText(mode === 'silent' ? '02:14' : mode === 'missed' ? '02:08' : '02:09', 128, 92);
    ctx.fillStyle = '#9aa3b2'; ctx.font = '18px sans-serif';
    ctx.fillText(mode === 'silent' ? 'Không có dịch vụ' : '14 Tháng 11', 128, 126);

    if (mode === 'missed') {
      ctx.fillStyle = 'rgba(212, 77, 66, 0.28)';
      ctx.fillRect(18, 168, 220, 104);
      ctx.strokeStyle = '#ff5a50'; ctx.lineWidth = 3;
      ctx.strokeRect(18, 168, 220, 104);
      ctx.fillStyle = '#ff7b72'; ctx.font = 'bold 23px sans-serif';
      ctx.fillText('4 CUỘC GỌI NHỠ', 128, 204);
      ctx.fillStyle = '#f5e8e6'; ctx.font = '19px sans-serif';
      ctx.fillText('Alice · 02:08 (Im lặng)', 128, 240);
    } else if (mode === 'voicemail') {
      ctx.fillStyle = 'rgba(232, 155, 76, 0.24)';
      ctx.fillRect(18, 168, 220, 108);
      ctx.strokeStyle = '#f7c37c'; ctx.lineWidth = 3;
      ctx.strokeRect(18, 168, 220, 108);
      ctx.fillStyle = '#f7c37c'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TIN NHẮN THOẠI', 128, 204);
      ctx.fillStyle = '#f5efe6'; ctx.font = '19px sans-serif';
      ctx.fillText('Alice · 02:09 (0:34)', 128, 242);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(22, 180, 212, 64);
      ctx.fillStyle = '#b9c0cc'; ctx.font = '18px sans-serif';
      ctx.fillText('Không có thông báo', 128, 218);
    }
    phoneScreenTex.needsUpdate = true;
  }
  drawSmartphoneScreen('silent');

  const smartphoneGroup = new THREE.Group();
  smartphoneGroup.position.set(-2.55, 0.81, -5.55);
  smartphoneGroup.rotation.y = 0.25;
  const smBody = new THREE.Mesh(getBoxGeo(0.11, 0.012, 0.2), materials.metalMat);
  const smScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.175), new THREE.MeshBasicMaterial({ map: phoneScreenTex }));
  smScreen.rotation.x = -Math.PI / 2;
  smScreen.position.y = 0.008;
  // Glow sprite proxy instead of PointLight
  const smLight = createGlowProxy(smartphoneGroup, 0x88b4ff, [0, 0.14, 0], 0.42, 0.35, 0.55);
  smartphoneGroup.add(smBody, smScreen);
  envStoryGroup.add(smartphoneGroup);

  const smartphoneObj = {
    type: 'smartphone',
    checkedInLoop: 0,
    worldPos: new THREE.Vector3(-2.55, 0.85, -5.55),
    label: () => smartphoneObj.checkedInLoop === getState().loop ? '' : 'Nhấn [E] nhìn màn hình điện thoại'
  };
  interactables.push(smartphoneObj);

  // Shared multiplexed dynamic FX PointLight for ambulance siren, emergency red, & dawn glow
  // Collapses 4 mutually-exclusive PointLights into 1 real Three.js PointLight!
  const dynamicFxLight = new THREE.PointLight(0xff2218, 0, 16, 1.4);
  dynamicFxLight.position.set(0, 2.5, -5.5);
  scene.add(dynamicFxLight);

  const fxState = {
    ambRed: 0,
    ambBlue: 0,
    emergency: 0,
    dawn: 0
  };
  function syncDynamicFxLight() {
    if (fxState.dawn > 0.05) {
      dynamicFxLight.color.setHex(0xffd28a);
      dynamicFxLight.position.set(0, 2.2, -12.0);
      dynamicFxLight.distance = 28;
      dynamicFxLight.intensity = fxState.dawn;
    } else if (fxState.emergency > 0.05) {
      dynamicFxLight.color.setHex(0xff2218);
      dynamicFxLight.position.set(0, 2.5, -5.5);
      dynamicFxLight.distance = 16;
      dynamicFxLight.intensity = fxState.emergency;
    } else if (fxState.ambRed > 0.1 || fxState.ambBlue > 0.1) {
      if (fxState.ambRed >= fxState.ambBlue) {
        dynamicFxLight.color.setHex(0xff2620);
        dynamicFxLight.position.set(-3.4, 2.0, -6.0);
        dynamicFxLight.distance = 12;
        dynamicFxLight.intensity = fxState.ambRed;
      } else {
        dynamicFxLight.color.setHex(0x207bff);
        dynamicFxLight.position.set(-3.0, 2.0, 1.6);
        dynamicFxLight.distance = 12;
        dynamicFxLight.intensity = fxState.ambBlue;
      }
    } else {
      dynamicFxLight.intensity = 0;
    }
  }

  function createFxChannelProxy(key, hexColor) {
    const color = new THREE.Color(hexColor);
    return {
      color,
      get intensity() {
        return fxState[key];
      },
      set intensity(v) {
        fxState[key] = Number.isFinite(v) ? Math.max(0, v) : 0;
        syncDynamicFxLight();
      }
    };
  }

  const ambRedLight = createFxChannelProxy('ambRed', 0xff2620);
  const ambBlueLight = createFxChannelProxy('ambBlue', 0x207bff);
  const emergencyRedLight = createFxChannelProxy('emergency', 0xff2218);
  const dawnLight = createFxChannelProxy('dawn', 0xffd28a);

  // White Memorial Flowers (shared geometries)
  const flowersGroup = new THREE.Group();
  flowersGroup.position.set(-3.25, 0.02, -3.4);
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.36, 6);
  const blossomGeo = new THREE.SphereGeometry(0.042, 8, 8);
  const coreGeo = new THREE.SphereGeometry(0.016, 6, 6);
  for (let f = 0; f < 5; f++) {
    const ang = (f - 2) * 0.24;
    const stem = new THREE.Mesh(stemGeo, materials.stemMat);
    stem.position.set(Math.sin(ang) * 0.08, 0.04, Math.cos(ang) * 0.05);
    stem.rotation.z = Math.PI / 2 - 0.15;
    stem.rotation.y = ang;
    flowersGroup.add(stem);
    const blossom = new THREE.Mesh(blossomGeo, materials.petalMat);
    blossom.scale.set(1, 0.55, 1);
    blossom.position.set(0.16 + Math.sin(ang) * 0.09, 0.06 + (f % 2) * 0.02, (f - 2) * 0.065);
    flowersGroup.add(blossom);
    const core = new THREE.Mesh(coreGeo, materials.centerMat);
    core.position.copy(blossom.position); core.position.y += 0.018;
    flowersGroup.add(core);
  }
  flowersGroup.visible = false;
  envStoryGroup.add(flowersGroup);

  // Kitchen breaker guide glow proxy instead of PointLight
  const kitchenGuideLight = createGlowProxy(scene, 0xff3b30, [-4.35, 1.65, -2.2], 0.95, 0, 0.65);

  // Grounding contact shadows under major furniture
  addContactShadow(2.55, 2.85, -1.7, 3.0);   // Bed
  addContactShadow(1.15, 1.85, 2.95, 2.95);  // Wardrobe
  addContactShadow(1.25, 2.55, 2.8, -7.8);   // Sofa
  addContactShadow(1.95, 1.45, -2.3, -5.8);  // Dining table
  addContactShadow(1.15, 1.25, -7.82, -2.2); // Fridge

  // Floating Dust Particles
  const dustCount = 260, dustGeo = new THREE.BufferGeometry(), dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = -8.0 + Math.random() * 15.6;
    dustPos[i * 3 + 1] = 0.2 + Math.random() * 2.8;
    dustPos[i * 3 + 2] = -10.2 + Math.random() * 14.2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustPoints = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xd8cdb8, size: 0.028, transparent: true, opacity: 0.35, depthWrite: false })
  );
  scene.add(dustPoints);

  // ==========================================
  // 7. ALLEYWAY OUTSIDE FRONT DOOR
  // ==========================================
  addBox(6.8, 0.25, 76, 0, -0.14, -48.0, materials.wetAsphaltMat, false, false, true);
  addBox(0.35, 4.8, 74, -2.9, 2.3, -47.5, materials.alleyWallMat);
  addBox(0.35, 4.8, 74, 2.9, 2.3, -47.5, materials.alleyWallMat);

  // Instanced alleyway poles, crossbars, arms, housings, wires, & bulbs (42 meshes -> 6 draw calls!)
  const alleyLights = [];
  const poleZs = [-15.5, -23.5, -31.5, -39.5, -47.5, -55.5];
  const poleCount = poleZs.length;
  const instPole = new THREE.InstancedMesh(getBoxGeo(0.18, 4.9, 0.18), materials.metalMat, poleCount);
  const instCross = new THREE.InstancedMesh(getBoxGeo(0.65, 0.08, 0.08), materials.metalMat, poleCount);
  const instArm = new THREE.InstancedMesh(getBoxGeo(1.05, 0.07, 0.07), materials.metalMat, poleCount);
  const instHead = new THREE.InstancedMesh(getBoxGeo(0.34, 0.08, 0.22), materials.metalMat, poleCount);
  const instWire = new THREE.InstancedMesh(getBoxGeo(5.6, 0.02, 0.02), materials.metalMat, poleCount * 2);
  const instBulb = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.13, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    poleCount
  );

  const alleyDummy = new THREE.Object3D();
  const bulbColor = new THREE.Color();

  poleZs.forEach((az, idx) => {
    const side = idx % 2 === 0 ? -1 : 1;
    const px = side * 2.55;

    alleyDummy.rotation.set(0, 0, 0);
    alleyDummy.scale.set(1, 1, 1);

    alleyDummy.position.set(px, 2.45, az);
    alleyDummy.updateMatrix();
    instPole.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px, 4.65, az);
    alleyDummy.updateMatrix();
    instCross.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px - side * 0.52, 4.35, az);
    alleyDummy.updateMatrix();
    instArm.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(px - side * 0.98, 4.30, az);
    alleyDummy.updateMatrix();
    instHead.setMatrixAt(idx, alleyDummy.matrix);

    alleyDummy.position.set(0, 4.55, az);
    alleyDummy.updateMatrix();
    instWire.setMatrixAt(idx * 2, alleyDummy.matrix);

    alleyDummy.position.set(0, 4.35, az + 0.18);
    alleyDummy.updateMatrix();
    instWire.setMatrixAt(idx * 2 + 1, alleyDummy.matrix);

    const bulbX = px - side * 0.98;
    alleyDummy.position.set(bulbX, 4.20, az);
    alleyDummy.updateMatrix();
    instBulb.setMatrixAt(idx, alleyDummy.matrix);
    bulbColor.setHex(idx >= 3 ? 0xfff3d4 : 0xffc675);
    instBulb.setColorAt(idx, bulbColor);

    // Volumetric-style additive halo sprite instead of 6 PointLights!
    const halo = createGlowProxy(
      scene,
      idx >= 3 ? 0xfff0cc : 0xffb35c,
      [bulbX, 3.95, az],
      3.1 + idx * 0.35,
      1.85 + idx * 0.35,
      0.85
    );
    alleyLights.push(halo);
  });

  [instPole, instCross, instArm, instHead, instWire, instBulb].forEach((im) => {
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    scene.add(im);
  });

  addBox(0.02, 0.02, 42, -2.25, 4.62, -31.5, materials.metalMat, false, false, false);
  addBox(0.02, 0.02, 42, 2.25, 4.62, -31.5, materials.metalMat, false, false, false);
  addBox(0.65, 0.85, 0.65, -2.3, 0.42, -14.2, materials.metalMat);
  addBox(0.75, 0.6, 0.75, 2.3, 0.3, -21.0, materials.woodDarkMat);
  addBox(0.65, 0.9, 0.65, -2.3, 0.45, -29.5, materials.metalMat);

  // Additive bloom beacon instead of extra PointLight
  const exitBeacon = createGlowProxy(scene, 0xfff4d6, [0, 3.4, -58.0], 11.5, 5.5, 0.9);
  const exitGlowWall = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 11.0),
    new THREE.MeshBasicMaterial({ color: 0xfff6e0, transparent: true, opacity: 0.82, depthWrite: false })
  );
  exitGlowWall.position.set(0, 3.0, -66.0);
  scene.add(exitGlowWall);

  return {
    lights: {
      bedroomLampLight,
      livingWindowMoon,
      lightningLight,
      tvLight,
      fridgeLight,
      bathLight,
      studyLampLight,
      kitchenGuideLight,
      clockGlow,
      ambRedLight,
      ambBlueLight,
      emergencyRedLight,
      alleyLights,
      dawnLight,
      exitBeacon,
      smLight
    },
    objects: {
      clockMesh,
      drawClockFace,
      clockAnomalyObj,
      wardrobeDoorPivot,
      wardrobeDoorPivot2,
      wardrobeEyes,
      aliceCoatGroup,
      wardrobeScrawlMesh,
      wardrobeObj,
      secondPillowMesh,
      mirrorMesh,
      mirrorObj,
      portraitGroup,
      portraitMesh,
      portraitAnomalyObj,
      chairGroup,
      chairAnomalyObj,
      phoneGroup,
      phoneLed,
      phoneObj,
      tvMesh,
      tvScreen,
      tvObj,
      wallScrawl,
      scrawlAnomalyObj,
      kitchenWaterMesh,
      kitchenFaucetObj,
      kitchenNoteMesh,
      kitchenNoteObj,
      fridgeGroup: fridgeDoorPivot,
      fridgeDoorPivot,
      fridgeDoorMesh,
      fridgeObj,
      bathWaterMesh,
      bathFaucetObj,
      bathMirrorMesh,
      bathMirrorObj,
      brokenMugGroup,
      brokenMugObj,
      doorRainPuddle,
      rainPuddleObj,
      smartphoneGroup,
      smartphoneObj,
      drawSmartphoneScreen,
      flowersGroup,
      dustPoints
    },
    updateWindowRain
  };
}
