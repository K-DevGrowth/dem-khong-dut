import * as THREE from 'three';
import {
  makeStoneWallPBR,
  makeStoneFloorPBR,
  makeRustedIronTex,
  makeFlameSpriteTex,
  makeGlowHaloTex
} from './textures.js';

export function createCatacombs(scene, colliders, interactables, getState) {
  const wallPBR = makeStoneWallPBR();
  const floorPBR = makeStoneFloorPBR();
  const ironTex = makeRustedIronTex();
  const flameTex = makeFlameSpriteTex();
  const haloTex = makeGlowHaloTex();

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallPBR.map, bumpMap: wallPBR.bumpMap, bumpScale: 0.04, roughness: 0.92
  });
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorPBR.map, bumpMap: floorPBR.bumpMap, bumpScale: 0.03, roughness: 0.78
  });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x100f0e, roughness: 0.98 });
  const ironMat = new THREE.MeshStandardMaterial({ map: ironTex, roughness: 0.55, metalness: 0.72 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x312015, roughness: 0.82 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xa88240, roughness: 0.35, metalness: 0.85 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x091318, roughness: 0.12, metalness: 0.65, transparent: true, opacity: 0.86
  });

  // Extremely dim subterranean base fill (lifted smoothly by Gamma slider)
  const hemiLight = new THREE.HemisphereLight(0x233245, 0x0b0a0a, 0.34);
  scene.add(hemiLight);

  function addBox(w, h, d, x, y, z, mat, solid = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    m.castShadow = solid && h < 3.6;
    scene.add(m);
    if (solid) {
      colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, active: true });
    }
    return m;
  }

  // Master Floor & Ceiling across all 4 zones (Z: +4 to -62)
  addBox(16, 0.3, 68, 0, -0.15, -29, floorMat, false);
  addBox(16, 0.3, 68, 0, 3.65, -29, ceilMat, false);

  // =========================================================================
  // ZONE 1: COLLAPSED SHAFT & ENTRY CORRIDOR (Z: +3 to -14, X: -2.8 to +2.8 + right alcove)
  // =========================================================================
  addBox(6.2, 3.8, 0.4, 0, 1.8, 3.2, wallMat); // Collapsed back wall
  // Faint cold skylight shaft behind player
  const startShaftLight = new THREE.SpotLight(0x52759c, 1.45, 9, Math.PI / 4, 0.7, 1.5);
  startShaftLight.position.set(0, 3.4, 1.8);
  startShaftLight.target.position.set(0, 0, 1.2);
  scene.add(startShaftLight, startShaftLight.target);

  // Left wall Zone 1
  addBox(0.4, 3.8, 17.4, -2.8, 1.8, -5.5, wallMat);
  // Right wall Zone 1 with side alcove (Z: -5.5 to -9.5, X: +2.8 to +6.4)
  addBox(0.4, 3.8, 8.7, 2.8, 1.8, -1.15, wallMat);
  addBox(0.4, 3.8, 4.7, 2.8, 1.8, -11.85, wallMat);
  addBox(3.8, 3.8, 0.4, 4.7, 1.8, -5.5, wallMat);
  addBox(3.8, 3.8, 0.4, 4.7, 1.8, -9.5, wallMat);
  addBox(0.4, 3.8, 4.4, 6.5, 1.8, -7.5, wallMat);

  // Wooden supply crate with Antique Oil Lantern & Matchbox
  addBox(0.95, 0.75, 0.95, -1.8, 0.375, -1.4, woodMat);
  const lanternPickupGroup = new THREE.Group();
  lanternPickupGroup.position.set(-1.72, 0.88, -1.35);
  const lpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.08, 10), brassMat);
  const lpGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0xffd084, emissive: 0xd98a32, emissiveIntensity: 0.78 })
  );
  lpGlass.position.y = 0.12;
  const lpHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  lpHalo.scale.set(0.45, 0.45, 1); lpHalo.position.y = 0.16;
  lanternPickupGroup.add(lpBase, lpGlass, lpHalo);
  scene.add(lanternPickupGroup);

  interactables.push({
    type: 'lantern_pickup',
    group: lanternPickupGroup,
    picked: false,
    worldPos: new THREE.Vector3(-1.72, 0.95, -1.35),
    label: () => getState().hasLantern ? '' : 'Nhấn [E] nhặt Đèn dầu cổ'
  });

  // Gate 1 Partition (Z = -14) with Heavy Iron Gate
  addBox(2.2, 3.8, 0.4, -1.9, 1.8, -14.0, wallMat);
  addBox(2.2, 3.8, 0.4, 1.9, 1.8, -14.0, wallMat);
  const gate1 = createIronGate(0, -14.0, 'gate1');

  // Gate 1 Lever Box (next to Gate 1, needs Iron Lever Handle from right alcove)
  addBox(0.28, 0.42, 0.22, 1.25, 1.35, -13.7, ironMat, false);
  const leverHandleOnWall = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.38, 8), brassMat);
  leverHandleOnWall.position.set(1.25, 1.42, -13.52);
  leverHandleOnWall.rotation.x = 0.6;
  leverHandleOnWall.visible = false;
  scene.add(leverHandleOnWall);

  const leverPickupMesh = new THREE.Group();
  const lvBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.46, 8), brassMat);
  lvBar.rotation.z = Math.PI / 2;
  const lvHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  lvHalo.scale.set(0.42, 0.42, 1); lvHalo.position.y = 0.08;
  leverPickupMesh.add(lvBar, lvHalo);
  leverPickupMesh.position.set(5.8, 0.84, -7.5);
  scene.add(leverPickupMesh);
  addBox(0.9, 0.78, 1.1, 5.8, 0.39, -7.5, woodMat);

  const leverItemObj = {
    type: 'lever_pickup',
    mesh: leverPickupMesh,
    worldPos: new THREE.Vector3(5.8, 0.85, -7.5),
    label: () => getState().hasLever1 ? '' : 'Nhấn [E] nhặt Tay gạt sắt'
  };
  interactables.push(leverItemObj);

  interactables.push({
    type: 'gate1_switch',
    leverMesh: leverHandleOnWall,
    gate: gate1,
    worldPos: new THREE.Vector3(1.25, 1.35, -13.6),
    label: () => {
      const s = getState();
      if (s.gate1Open) return '';
      return s.hasLever1 ? 'Nhấn [E] lắp tay gạt & mở Cổng sắt' : 'Hộp cần gạt bị gãy (Thiếu Tay gạt sắt)';
    }
  });

  // =========================================================================
  // ZONE 2: VAULTED CISTERN HALL (Z: -14 to -34, X: -7.2 to +7.2) — GHOUL PATROL
  // =========================================================================
  addBox(4.8, 3.8, 0.4, -5.0, 1.8, -14.0, wallMat);
  addBox(4.8, 3.8, 0.4, 5.0, 1.8, -14.0, wallMat);
  addBox(0.4, 3.8, 20.4, -7.2, 1.8, -24.0, wallMat);
  addBox(0.4, 3.8, 20.4, 7.2, 1.8, -24.0, wallMat);
  addBox(6.4, 3.8, 0.4, -4.0, 1.8, -34.0, wallMat);
  addBox(6.4, 3.8, 0.4, 4.0, 1.8, -34.0, wallMat);

  // 6 Massive Stone Pillars creating stealth sightlines & loops around the Ghoul
  const pillarCoords = [
    [-3.4, -19.0], [3.4, -19.0],
    [-3.4, -24.5], [3.4, -24.5],
    [-3.4, -29.8], [3.4, -29.8]
  ];
  pillarCoords.forEach(([px, pz]) => addBox(1.15, 3.8, 1.15, px, 1.8, pz, wallMat));

  // 3 Hideable Closets / Lockers with Mouse-Drag or [E] Doors!
  const doors = [];
  function createHidingLocker(x, z, rotY, id) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    scene.add(g);

    const wL = 1.15, hL = 2.35, dL = 0.95;
    const back = new THREE.Mesh(new THREE.BoxGeometry(wL, hL, 0.08), woodMat);
    back.position.set(0, hL / 2, -dL / 2);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, hL, dL), woodMat);
    sideL.position.set(-wL / 2, hL / 2, 0);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, hL, dL), woodMat);
    sideR.position.set(wL / 2, hL / 2, 0);
    const top = new THREE.Mesh(new THREE.BoxGeometry(wL, 0.08, dL), woodMat);
    top.position.set(0, hL, 0);
    g.add(back, sideL, sideR, top);

    // Hinged slatted door (player can peek through gaps!)
    const pivot = new THREE.Group();
    pivot.position.set(-wL / 2 + 0.05, 0, dL / 2);
    g.add(pivot);
    const dUpper = new THREE.Mesh(new THREE.BoxGeometry(wL - 0.1, 1.25, 0.06), woodMat);
    dUpper.position.set((wL - 0.1) / 2, 0.65, 0);
    const dTopBar = new THREE.Mesh(new THREE.BoxGeometry(wL - 0.1, 0.42, 0.06), woodMat);
    dTopBar.position.set((wL - 0.1) / 2, 2.08, 0);
    const slat1 = new THREE.Mesh(new THREE.BoxGeometry(wL - 0.1, 0.07, 0.05), ironMat);
    slat1.position.set((wL - 0.1) / 2, 1.44, 0);
    const slat2 = new THREE.Mesh(new THREE.BoxGeometry(wL - 0.1, 0.07, 0.05), ironMat);
    slat2.position.set((wL - 0.1) / 2, 1.68, 0);
    pivot.add(dUpper, dTopBar, slat1, slat2);

    const doorCenter = new THREE.Vector3(0, 1.2, dL / 2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(new THREE.Vector3(x, 0, z));
    const doorObj = {
      type: 'tactile_door',
      id,
      pivot,
      isOpen: false,
      angle: 0,
      targetAngle: 0,
      maxAngle: Math.PI * 0.62,
      worldPos: doorCenter,
      label: () => doorObj.angle > 0.35 ? 'Giữ [Chuột trái] kéo đóng cửa tủ / [E]' : 'Giữ [Chuột trái] kéo hé cửa tủ / [E]'
    };
    doors.push(doorObj);
    interactables.push(doorObj);
  }

  createHidingLocker(-6.35, -18.5, Math.PI / 2, 'locker_1');
  createHidingLocker(6.35, -24.5, -Math.PI / 2, 'locker_2');
  createHidingLocker(-6.35, -30.5, Math.PI / 2, 'locker_3');

  // 2 Ancient Iron Cogwheels in opposite dark corners of Zone 2
  const cogs = [];
  function createCogPickup(x, z, id) {
    const grp = new THREE.Group();
    grp.position.set(x, 0.84, z);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16), brassMat);
    rim.rotation.x = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), ironMat);
    const cogHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, opacity: 0.52, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    cogHalo.scale.set(0.50, 0.50, 1); cogHalo.position.y = 0.12;
    grp.add(rim, hub, cogHalo);
    scene.add(grp);
    addBox(0.85, 0.78, 0.85, x, 0.39, z, woodMat);
    const obj = {
      type: 'cog_pickup',
      id,
      group: grp,
      picked: false,
      worldPos: new THREE.Vector3(x, 0.9, z),
      label: () => obj.picked ? '' : 'Nhấn [E] nhặt Bánh răng cổ'
    };
    cogs.push(obj);
    interactables.push(obj);
  }
  createCogPickup(-6.1, -24.5, 'cog_west');
  createCogPickup(6.1, -18.2, 'cog_east');

  // Gate 2 (Heavy Spiked Portcullis at Z = -34) + Loud Crank Wheel
  const gate2 = createIronGate(0, -34.0, 'gate2');
  const crankGroup = new THREE.Group();
  crankGroup.position.set(1.55, 1.25, -33.55);
  const crankWheel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 8, 16), ironMat);
  const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), ironMat);
  const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), ironMat);
  crankGroup.add(crankWheel, spoke1, spoke2);
  scene.add(crankGroup);

  const gate2CrankObj = {
    type: 'gate2_crank',
    wheel: crankGroup,
    gate: gate2,
    progress: 0, // 0..1 (hold [E] to crank open!)
    worldPos: new THREE.Vector3(1.55, 1.25, -33.5),
    label: () => {
      const s = getState();
      if (s.gate2Open) return '';
      if (s.cogsFound < 2) return `Trục quay cổng (Cần lắp đủ ${s.cogsFound}/2 Bánh răng cổ)`;
      return 'Giữ [E] quay trục mở Cổng sắt (Sẽ tạo tiếng ồn lớn!)';
    }
  };
  interactables.push(gate2CrankObj);

  // =========================================================================
  // ZONE 3: FLOODED SLUICE TUNNEL (Z: -34 to -50, X: -2.4 to +2.4) — CHASE
  // =========================================================================
  addBox(0.4, 3.8, 16.4, -2.5, 1.8, -42.0, wallMat);
  addBox(0.4, 3.8, 16.4, 2.5, 1.8, -42.0, wallMat);

  // Ankle-deep reflective dark water
  const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 16.2), waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, 0.06, -42.0);
  scene.add(waterMesh);

  // Fallen masonry obstacles to weave around during the chase
  addBox(1.3, 1.1, 0.85, -1.45, 0.55, -39.2, wallMat);
  addBox(1.3, 1.1, 0.85, 1.45, 0.55, -44.2, wallMat);

  // Heavy Iron Blast Door at Z = -50 (player runs past & slams it shut!)
  addBox(1.8, 3.8, 0.4, -1.7, 1.8, -50.0, wallMat);
  addBox(1.8, 3.8, 0.4, 1.7, 1.8, -50.0, wallMat);
  const blastGate = createIronGate(0, -50.0, 'gate3');
  // Blast gate starts OPEN so player can sprint through, then slam shut behind them!
  blastGate.open = true;
  blastGate.mesh.position.y = 3.95;
  blastGate.collider.active = false;

  interactables.push({
    type: 'blast_door_lever',
    gate: blastGate,
    worldPos: new THREE.Vector3(1.15, 1.35, -50.55),
    label: () => getState().blastClosed ? '' : 'Nhấn [E] SẬP CỬA SẮT CHẶN QUÁI VẬT!'
  });
  addBox(0.22, 0.36, 0.16, 1.15, 1.35, -50.32, ironMat, false);

  // =========================================================================
  // ZONE 4: STORM EXIT WELL (Z: -50 to -60)
  // =========================================================================
  addBox(0.4, 3.8, 10.4, -3.2, 1.8, -55.0, wallMat);
  addBox(0.4, 3.8, 10.4, 3.2, 1.8, -55.0, wallMat);
  addBox(6.8, 3.8, 0.4, 0, 1.8, -60.0, wallMat);

  const exitLight = new THREE.SpotLight(0x7ca6d4, 2.8, 14, Math.PI / 3.2, 0.65, 1.2);
  exitLight.position.set(0, 3.5, -56.5);
  exitLight.target.position.set(0, 0, -57.5);
  scene.add(exitLight, exitLight.target);

  // Heavy Exit Ladder / Hatch
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0, 0, -59.65);
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.06), ironMat); railL.position.set(-0.28, 1.7, 0);
  const railR = railL.clone(); railR.position.x = 0.28;
  ladderGroup.add(railL, railR);
  for (let ry = 0.35; ry <= 3.15; ry += 0.35) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.04), ironMat);
    rung.position.set(0, ry, 0);
    ladderGroup.add(rung);
  }
  scene.add(ladderGroup);

  interactables.push({
    type: 'exit_ladder',
    worldPos: new THREE.Vector3(0, 1.5, -59.5),
    label: () => 'Nhấn [E] leo thang sắt thoát lên mặt đất'
  });

  // =========================================================================
  // WALL OIL SCONCES (Light with burning Match [E] for safe light pockets!)
  // =========================================================================
  const sconces = [];
  const sconcePoolLight = new THREE.PointLight(0xffa44e, 0, 11.5, 1.45);
  scene.add(sconcePoolLight);

  function addWallSconce(x, z, wallNormalX) {
    const g = new THREE.Group();
    g.position.set(x, 1.68, z);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.14, 8), ironMat);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), ironMat);
    arm.position.x = -wallNormalX * 0.09;
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flameTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    fl.scale.set(0.14, 0.24, 1); fl.position.y = 0.14; fl.visible = false;
    const hl = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    hl.scale.set(0.65, 0.65, 1); hl.position.y = 0.14; hl.visible = false;
    g.add(cup, arm, fl, hl);
    scene.add(g);

    const sc = {
      type: 'sconce',
      lit: false,
      flame: fl,
      halo: hl,
      worldPos: new THREE.Vector3(x, 1.72, z),
      label: () => sc.lit ? '' : 'Nhấn [E] thắp đuốc tường (Cần diêm đang cháy)'
    };
    sconces.push(sc);
    interactables.push(sc);
  }

  addWallSconce(-2.48, -5.2, 1);
  addWallSconce(2.48, -12.2, -1);
  addWallSconce(-6.88, -16.5, 1);
  addWallSconce(6.88, -28.0, -1);
  addWallSconce(-2.18, -36.0, 1);

  // =========================================================================
  // SCATTERED RESOURCES: MATCHBOXES & OIL CANISTERS
  // =========================================================================
  const pickups = [];
  function addResource(kind, x, y, z, amount) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (kind === 'matches') {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.04, 0.20),
        new THREE.MeshStandardMaterial({ color: 0xb83e32, emissive: 0x3b120e, emissiveIntensity: 0.45, roughness: 0.7 })
      );
      g.add(m);
    } else {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.07, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0x967234, emissive: 0x382810, emissiveIntensity: 0.45, roughness: 0.45, metalness: 0.65 })
      );
      g.add(m);
    }
    const rHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    rHalo.scale.set(0.32, 0.32, 1); rHalo.position.y = 0.12;
    g.add(rHalo);
    scene.add(g);
    const item = {
      type: 'resource',
      kind,
      amount,
      group: g,
      picked: false,
      worldPos: new THREE.Vector3(x, y + 0.05, z),
      label: () => item.picked ? '' : (kind === 'matches' ? `Nhấn [E] nhặt hộp diêm (+${amount})` : `Nhấn [E] nhặt bình dầu (+${amount}%)`)
    };
    pickups.push(item);
    interactables.push(item);
  }

  addResource('matches', -1.85, 0.79, -1.52, 4);
  addResource('oil', 4.8, 0.12, -8.8, 45);
  addResource('matches', -5.8, 0.12, -15.5, 4);
  addResource('oil', -5.9, 0.12, -29.2, 50);
  addResource('oil', 5.8, 0.12, -29.8, 45);
  addResource('matches', 5.8, 0.12, -22.0, 3);

  function createIronGate(x, z, id) {
    const grp = new THREE.Group();
    grp.position.set(x, 1.55, z);
    for (let bx = -0.72; bx <= 0.72; bx += 0.24) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 3.1, 8), ironMat);
      bar.position.x = bx;
      grp.add(bar);
    }
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 0.09), ironMat);
    cross1.position.y = 0.85;
    const cross2 = cross1.clone(); cross2.position.y = -0.85;
    grp.add(cross1, cross2);
    scene.add(grp);

    const collider = { minX: x - 0.95, maxX: x + 0.95, minZ: z - 0.22, maxZ: z + 0.22, active: true };
    colliders.push(collider);
    return { id, mesh: grp, collider, open: false, targetY: 1.55 };
  }

  function updateWorld(dt, tSec, playerPos) {
    // Animate gates
    [gate1, gate2, blastGate].forEach((gt) => {
      const ty = gt.open ? 4.05 : 1.55;
      gt.mesh.position.y += (ty - gt.mesh.position.y) * (1 - Math.exp(-3.6 * dt));
      gt.collider.active = gt.mesh.position.y < 3.1;
    });

    // Animate tactile locker doors
    const dLerp = 1 - Math.exp(-7.5 * dt);
    doors.forEach((d) => {
      d.angle += (d.targetAngle - d.angle) * dLerp;
      d.pivot.rotation.y = -d.angle;
    });

    // Pool sconce PointLight onto nearest lit wall sconce
    let nearest = null, bestD2 = Infinity;
    for (let i = 0; i < sconces.length; i++) {
      const s = sconces[i];
      if (!s.lit) continue;
      const d2 = playerPos.distanceToSquared(s.worldPos);
      if (d2 < bestD2) { bestD2 = d2; nearest = s; }
    }
    if (nearest) {
      sconcePoolLight.position.copy(nearest.worldPos);
      sconcePoolLight.intensity = 2.0 + Math.sin(tSec * 14) * 0.18;
    } else {
      sconcePoolLight.intensity = 0;
    }
  }

  function resetWorld() {
    gate1.open = false; gate1.mesh.position.y = 1.55; gate1.collider.active = true;
    gate2.open = false; gate2.mesh.position.y = 1.55; gate2.collider.active = true;
    gate2CrankObj.progress = 0;
    blastGate.open = true; blastGate.mesh.position.y = 4.05; blastGate.collider.active = false;
    lanternPickupGroup.visible = true;
    leverPickupMesh.visible = true;
    leverHandleOnWall.visible = false;
    cogs.forEach((c) => { c.picked = false; c.group.visible = true; });
    pickups.forEach((p) => { p.picked = false; p.group.visible = true; });
    sconces.forEach((s) => { s.lit = false; s.flame.visible = false; s.halo.visible = false; });
    doors.forEach((d) => { d.isOpen = false; d.angle = 0; d.targetAngle = 0; d.pivot.rotation.y = 0; });
  }

  return {
    hemiLight,
    gate1,
    gate2,
    gate2CrankObj,
    blastGate,
    sconces,
    doors,
    lanternPickupGroup,
    leverPickupMesh,
    leverHandleOnWall,
    updateWorld,
    resetWorld
  };
}
