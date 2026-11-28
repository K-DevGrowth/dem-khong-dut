import * as THREE from 'three';
import { TOTAL_LOOPS, LOOP_STORY } from '../config/storyData.js';

export function createPuzzlesSystem(scene, materials, interactables, getState) {
  // Lightweight additive sprite proxy replacing micro PointLights
  function createGlowProxy(parent, hexColor, pos, baseScale, initialIntensity = 0, maxOpacity = 0.75) {
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
      mat.opacity = Math.min(maxOpacity, clamped * 0.5);
      const s = baseScale * (0.75 + Math.min(1.5, clamped * 0.4));
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
      }
    };
    proxy.intensity = initialIntensity;
    return proxy;
  }

  // Study key spots
  const STUDY_KEY_SPOTS = [
    { pos: new THREE.Vector3(1.52, 0.85, 3.92), hint: 'trên tủ ngăn kéo phòng ngủ' },
    { pos: new THREE.Vector3(-2.45, 1.29, -9.88), hint: 'trên kệ sách phòng khách' },
    { pos: new THREE.Vector3(-5.85, 0.90, -4.18), hint: 'trên quầy nhà bếp' }
  ];

  const studyKeyGroup = new THREE.Group();
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 8, 16), materials.brassMat);
  keyRing.rotation.x = Math.PI / 2;
  const keyShaft = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, 0.095), materials.brassMat);
  keyShaft.position.set(0, 0, 0.072);
  const keyTooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.012, 0.014), materials.brassMat);
  keyTooth1.position.set(0.012, 0, 0.092);
  const keyTooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.014), materials.brassMat);
  keyTooth2.position.set(0.01, 0, 0.112);
  studyKeyGroup.add(keyRing, keyShaft, keyTooth1, keyTooth2);
  // Glow sprite proxy instead of PointLight
  const studyKeyLight = createGlowProxy(studyKeyGroup, 0xffcf70, [0, 0.14, 0.04], 0.36, 0.48, 0.65);
  studyKeyGroup.position.copy(STUDY_KEY_SPOTS[0].pos);
  scene.add(studyKeyGroup);

  const studyKeyObj = {
    type: 'study_key',
    worldPos: STUDY_KEY_SPOTS[0].pos.clone(),
    label: () => {
      const state = getState();
      return (state.loop === 1 && !state.studyKeyFound) ? 'Nhấn [E] nhặt chìa khóa phòng làm việc' : '';
    }
  };
  interactables.push(studyKeyObj);

  // Breaker Box
  const breakerGroup = new THREE.Group();
  breakerGroup.position.set(-4.55, 1.55, -4.62);
  const breakerBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.12), materials.metalMat);
  breakerGroup.add(breakerBody);

  const breakerLeverPivot = new THREE.Group();
  breakerLeverPivot.position.set(0, -0.02, 0.07);
  const breakerLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.18, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xb8362c, roughness: 0.45 })
  );
  breakerLever.position.set(0, 0.07, 0.02);
  breakerLeverPivot.add(breakerLever);
  breakerGroup.add(breakerLeverPivot);

  const breakerLedMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), materials.breakerLedMat);
  breakerLedMesh.position.set(0.12, 0.18, 0.07);
  breakerGroup.add(breakerLedMesh);

  // Glow sprite proxy instead of PointLight
  const breakerLight = createGlowProxy(breakerGroup, 0xff382e, [0.12, 0.18, 0.16], 0.46, 0, 0.85);
  scene.add(breakerGroup);

  const breakerObj = {
    type: 'breaker',
    worldPos: new THREE.Vector3(-4.55, 1.55, -4.55),
    label: () => {
      const state = getState();
      return (state.loop === 2 && !state.breakerFixed)
        ? 'Nhấn [E] gạt cầu dao điện'
        : '';
    }
  };
  interactables.push(breakerObj);

  // Sliding Drawers
  const hplDrawers = [];
  function createSlidingDrawer(id, name, basePos, slideAxis, maxSlide, width, height, depth, noteText) {
    const grp = new THREE.Group();
    grp.position.copy(basePos);
    const front = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.woodDarkMat);
    front.castShadow = true; front.receiveShadow = true;
    grp.add(front);

    const hMesh = new THREE.Mesh(
      new THREE.BoxGeometry(Math.abs(slideAxis.z) > 0.5 ? 0.16 : 0.03, 0.03, Math.abs(slideAxis.x) > 0.5 ? 0.16 : 0.03),
      materials.brassMat
    );
    hMesh.position.set(slideAxis.x * (width * 0.52), 0, slideAxis.z * (depth * 0.52));
    grp.add(hMesh);

    const innerNote = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xddd2ba, roughness: 0.9 })
    );
    innerNote.rotation.x = -Math.PI / 2;
    innerNote.position.set(0, height * 0.35, 0);
    grp.add(innerNote);
    scene.add(grp);

    const dr = {
      type: 'hpl_drawer',
      id,
      name,
      group: grp,
      basePos: basePos.clone(),
      slideAxis: slideAxis.clone().normalize(),
      maxSlide,
      isOpen: false,
      targetDist: 0,
      openDist: 0,
      vel: 0,
      noteText,
      inspectedInLoop: 0,
      worldPos: basePos.clone().addScaledVector(slideAxis, 0.2),
      label: () => dr.isOpen ? `Nhấn [E] đóng ${name}` : `Nhấn [E] mở ${name}`
    };
    hplDrawers.push(dr);
    return dr;
  }

  createSlidingDrawer('drawer_bedroom', 'ngăn kéo tủ phòng ngủ', new THREE.Vector3(1.35, 0.62, 3.74), new THREE.Vector3(0, 0, -1), 0.36, 0.92, 0.22, 0.42, 'Bên trong ngăn kéo chỉ còn hộp diêm cũ rỗng và chiếc kẹp tóc của Alice.');
  createSlidingDrawer('drawer_study', 'ngăn kéo bàn làm việc', new THREE.Vector3(6.95, 0.62, -4.3), new THREE.Vector3(-1, 0, 0), 0.36, 0.42, 0.18, 0.48, 'Ngăn kéo bàn làm việc chứa vài tờ lịch cũ đã xé nham nhở.');
  createSlidingDrawer('drawer_kitchen', 'ngăn kéo tủ bếp', new THREE.Vector3(-6.15, 0.66, -3.96), new THREE.Vector3(0, 0, 1), 0.34, 0.72, 0.2, 0.42, 'Trong ngăn kéo bếp có đôi đũa gỗ và tờ hóa đơn cũ nhàu nát.');

  // Throwable Props
  const hplProps = [];
  function createThrowableProp(id, name, pos, kind) {
    const grp = new THREE.Group();
    grp.position.copy(pos);
    let radius = 0.11;
    if (kind === 'bottle') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x3b6e56, roughness: 0.22, metalness: 0.15, transparent: true, opacity: 0.85 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.045, 0.18, 10), mat);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.036, 0.09, 10), mat);
      neck.position.y = 0.13;
      grp.add(body, neck);
      radius = 0.09;
    } else if (kind === 'mug') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.45 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.11, 10), mat);
      grp.add(cup);
      radius = 0.08;
    } else if (kind === 'book') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x6b2c26, roughness: 0.82 });
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.24), mat);
      grp.add(bk);
      radius = 0.07;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0x8a9299, roughness: 0.38, metalness: 0.65 });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.13, 10), mat);
      grp.add(can);
      radius = 0.08;
    }
    grp.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    scene.add(grp);

    const prop = {
      type: 'hpl_prop',
      hplKind: 'prop',
      id,
      name,
      kind,
      group: grp,
      homePos: pos.clone(),
      vel: new THREE.Vector3(),
      angVel: new THREE.Vector3(),
      radius,
      isDynamic: false,
      worldPos: pos.clone(),
      label: () => `Giữ [Chuột trái] nhặt ${name} · [Chuột phải]/[G] ném đánh lạc hướng`
    };
    hplProps.push(prop);
    return prop;
  }

  createThrowableProp('prop_bottle', 'chai thủy tinh', new THREE.Vector3(-2.68, 0.89, -6.02), 'bottle');
  createThrowableProp('prop_mug', 'cốc sứ cũ', new THREE.Vector3(1.02, 0.88, 3.92), 'mug');
  createThrowableProp('prop_book', 'cuốn sổ bìa cứng', new THREE.Vector3(6.95, 0.84, -5.58), 'book');
  createThrowableProp('prop_can', 'lon thiếc', new THREE.Vector3(-6.85, 0.94, -4.15), 'can');
  createThrowableProp('prop_vase', 'bình gốm nhỏ', new THREE.Vector3(-3.38, 0.72, -8.72), 'bottle');

  // Candles — share 1 pooled PointLight (automatically snaps to nearest lit candle to player)
  // plus each candle gets its own warm additive flame halo sprite!
  const candlePoolLight = new THREE.PointLight(0xffa048, 0, 6.8, 1.8);
  scene.add(candlePoolLight);

  const candles = [];
  function syncCandlePoolLight() {
    const state = getState ? getState() : null;
    const playerPos = state && state.pos ? state.pos : null;
    let best = null;
    let bestDistSq = Infinity;
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (!c.lit || c._intensity <= 0.01) continue;
      if (!playerPos) {
        best = c;
        break;
      }
      const dSq = playerPos.distanceToSquared(c.worldPos);
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        best = c;
      }
    }
    if (best) {
      candlePoolLight.position.set(best.worldPos.x, best.worldPos.y + 0.16, best.worldPos.z);
      candlePoolLight.intensity = best._intensity;
    } else {
      candlePoolLight.intensity = 0;
    }
  }

  const holderGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.04, 10);
  const waxGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.2, 10);
  const waxMat = new THREE.MeshStandardMaterial({ color: 0xede3cf, roughness: 0.8 });
  const flameGeo = new THREE.SphereGeometry(0.026, 8, 8);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd06e });

  function createCandle(id, x, y, z, initiallyLit) {
    const group = new THREE.Group(); group.position.set(x, y, z); scene.add(group);
    const holder = new THREE.Mesh(holderGeo, materials.brassMat);
    holder.position.y = 0.02; group.add(holder);
    const wax = new THREE.Mesh(waxGeo, waxMat);
    wax.position.y = 0.13; group.add(wax);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.26; flame.scale.set(0.8, 1.5, 0.8); flame.visible = initiallyLit; group.add(flame);

    const halo = createGlowProxy(group, 0xffa048, [0, 0.30, 0], 0.58, initiallyLit ? 1.45 : 0, 0.72);
    const c = {
      type: 'candle',
      id,
      flame,
      _intensity: initiallyLit ? 1.45 : 0,
      worldPos: new THREE.Vector3(x, y + 0.18, z),
      lit: initiallyLit,
      label: () => c.lit ? '' : 'Nhấn [E] thắp nến'
    };
    c.light = {
      color: halo.color,
      get intensity() {
        return c._intensity;
      },
      set intensity(v) {
        c._intensity = Number.isFinite(v) ? Math.max(0, v) : 0;
        halo.intensity = c._intensity;
        syncCandlePoolLight();
      }
    };
    candles.push(c); interactables.push(c);
    syncCandlePoolLight();
    return c;
  }

  createCandle('candle_living', -2.3, 0.8, -5.8, false);
  createCandle('candle_study', 7.1, 0.82, -5.6, false);
  createCandle('candle_kitchen', -7.45, 0.88, -4.2, false);

  // Matchbox pickup
  const MATCHBOX_SPOTS = {
    2: new THREE.Vector3(-6.28, 0.90, -4.18),
    3: new THREE.Vector3(6.72, 0.90, 1.38),
    4: new THREE.Vector3(-6.28, 0.90, -4.18),
    5: new THREE.Vector3(6.72, 0.90, 1.38)
  };
  const matchboxGroup = new THREE.Group();
  const mbOuter = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.032, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x9e3228, roughness: 0.72 })
  );
  const mbLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.085, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe8d5a8, roughness: 0.8 })
  );
  mbLabel.rotation.x = -Math.PI / 2;
  mbLabel.position.y = 0.017;
  matchboxGroup.add(mbOuter, mbLabel);
  matchboxGroup.visible = false;
  scene.add(matchboxGroup);

  const matchboxObj = {
    type: 'matchbox',
    pickedInLoop: 0,
    worldPos: new THREE.Vector3(-6.28, 0.92, -4.18),
    label: () => {
      const state = getState();
      return (state.loop >= 2 && matchboxObj.pickedInLoop !== state.loop)
        ? 'Nhấn [E] nhặt hộp diêm (+3 que)'
        : '';
    }
  };
  interactables.push(matchboxObj);

  // Clue item on study desk
  const clueGroup = new THREE.Group();
  clueGroup.position.set(7.05, 0.88, -4.95);
  scene.add(clueGroup);
  const clueMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.06, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0xf0b566,
      emissive: 0xd98f3a,
      emissiveIntensity: 0.55,
      roughness: 0.4
    })
  );
  clueGroup.add(clueMesh);
  // Glow sprite proxy instead of PointLight
  const clueLight = createGlowProxy(clueGroup, 0xf2b56b, [0, 0.18, 0], 0.52, 0.65, 0.65);

  const clueObj = {
    type: 'clue',
    group: clueGroup,
    mesh: clueMesh,
    worldPos: new THREE.Vector3(7.05, 0.9, -4.95),
    label: () => {
      const state = getState();
      if (state.loopClueFound) return '';
      if (state.anomaliesFound < state.anomaliesRequired) {
        return `Hồ sơ trên bàn (Kiểm tra thêm ${state.anomaliesRequired - state.anomaliesFound} điểm bất thường trước)`;
      }
      if (state.loop === 2 && !state.breakerFixed) return 'Hồ sơ trên bàn (Tối om — cần bật cầu dao trong Nhà bếp)';
      if (state.loop === 2 && !state.fridgeChecked) return 'Hồ sơ trên bàn (Hãy kiểm tra tủ lạnh hở sáng trong Nhà bếp trước)';
      if (state.loop === 3 && !state.phoneCheckedLoop3) return 'Hồ sơ trên bàn (Kiểm tra màn hình điện thoại sáng đỏ ngoài phòng khách trước)';
      if (state.loop === 4 && !state.tvTurnedOff) return 'Hồ sơ trên bàn (Tắt màn hình TV nhiễu hạt ngoài phòng khách trước)';
      if (state.loop === TOTAL_LOOPS && !state.codeUnlocked) return 'Nhấn [E] mở khóa mã 4 số hộp hồ sơ';
      return `Nhấn [E] xem: ${LOOP_STORY[state.loop].clueTitle}`;
    }
  };
  interactables.push(clueObj);

  // Item Glints
  const itemGlints = [];
  function createItemGlint(pos, isActiveFn) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: materials.glintTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sp.position.copy(pos);
    sp.scale.set(0.24, 0.24, 1);
    scene.add(sp);
    const entry = { sprite: sp, basePos: pos.clone(), isActiveFn };
    itemGlints.push(entry);
    return entry;
  }

  const keyGlint = createItemGlint(STUDY_KEY_SPOTS[0].pos.clone().add(new THREE.Vector3(0, 0.09, 0)), () => {
    const s = getState();
    return s.loop === 1 && !s.studyKeyFound;
  });
  const matchboxGlint = createItemGlint(new THREE.Vector3(-6.28, 0.99, -4.18), () => {
    const s = getState();
    return s.loop >= 2 && matchboxObj.pickedInLoop !== s.loop;
  });

  return {
    STUDY_KEY_SPOTS,
    studyKeyGroup,
    studyKeyLight,
    studyKeyObj,
    keyGlint,
    breakerGroup,
    breakerLever,
    breakerLeverPivot,
    breakerLight,
    breakerObj,
    hplDrawers,
    createSlidingDrawer,
    hplProps,
    createThrowableProp,
    candles,
    createCandle,
    MATCHBOX_SPOTS,
    matchboxGroup,
    matchboxObj,
    matchboxGlint,
    clueGroup,
    clueMesh,
    clueLight,
    clueObj,
    itemGlints,
    createItemGlint
  };
}
