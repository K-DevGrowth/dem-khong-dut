import * as THREE from 'three';
import {
  makePlasterPBR,
  makeHardwoodPBR,
  makePanelDoorTexture,
  makeFabricTexture,
  makeMirrorTex,
  makePortraitTexture,
  makeBathMirrorTex,
  makeWallScrawl,
  makeAlleyWallTex,
  makeHeldPaperTexture,
  makeGlintTex
} from './textures.js';

export function createMaterials() {
  const plasterPBR = makePlasterPBR();
  const floorPBR = makeHardwoodPBR();

  const wallMat = new THREE.MeshStandardMaterial({
    map: plasterPBR.map,
    bumpMap: plasterPBR.bumpMap,
    bumpScale: 0.025,
    roughness: 0.9
  });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1e1d1b, roughness: 0.96 });
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorPBR.map,
    bumpMap: floorPBR.bumpMap,
    bumpScale: 0.018,
    roughness: 0.58,
    metalness: 0.06
  });
  const doorMat = new THREE.MeshStandardMaterial({ map: makePanelDoorTexture(), roughness: 0.72 });
  const woodRichMat = new THREE.MeshStandardMaterial({ color: 0x382417, roughness: 0.62, metalness: 0.05 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x24170f, roughness: 0.72 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc89e52, roughness: 0.3, metalness: 0.85 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.4, metalness: 0.75 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xaab4be, roughness: 0.2, metalness: 0.88 });
  const blanketMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#3b424d'), roughness: 0.95 });
  const pillowMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#c2bcb0'), roughness: 0.92 });
  const sofaMat = new THREE.MeshStandardMaterial({ map: makeFabricTexture('#302622'), roughness: 0.94 });
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xcbd2d8, roughness: 0.25, metalness: 0.08 });
  const counterTopMat = new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.38, metalness: 0.12 });
  const waterStreamMat = new THREE.MeshBasicMaterial({ color: 0x9fd2e6, transparent: true, opacity: 0.65 });
  const fridgeBodyMat = new THREE.MeshStandardMaterial({ color: 0x8e969e, roughness: 0.35, metalness: 0.25 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xd2ccc2, roughness: 0.35 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x26422a, roughness: 0.85 });
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xf4f2eb, emissive: 0x24221d, roughness: 0.7 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xd9b24c, roughness: 0.6 });
  const breakerLedMat = new THREE.MeshBasicMaterial({ color: 0x38d97c });
  const alleyWallMat = new THREE.MeshStandardMaterial({ map: makeAlleyWallTex(), roughness: 0.94 });
  const wetAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.28, metalness: 0.25 });
  const tvScreenMat = new THREE.MeshBasicMaterial({ color: 0x080a0d });
  const weMat = new THREE.MeshBasicMaterial({ color: 0xeafff9 });

  const mirrorCleanTex = makeMirrorTex(false, false);
  const mirrorGhostTex = makeMirrorTex(true, true);
  const mirrorCrackedTex = makeMirrorTex(true, false);
  const mirrorMat = new THREE.MeshStandardMaterial({ map: mirrorCleanTex, roughness: 0.14, metalness: 0.78 });

  const portraitCleanTex = makePortraitTexture(false);
  const portraitScratchedTex = makePortraitTexture(true);
  const portraitMat = new THREE.MeshStandardMaterial({ map: portraitCleanTex, roughness: 0.65 });

  const bathMirrorCleanTex = makeBathMirrorTex('clean');
  const bathMirrorFogTex = makeBathMirrorTex('fog0214');
  const bathMirrorGhostTex = makeBathMirrorTex('ghost');
  const bathMirrorCrackedTex = makeBathMirrorTex('cracked');
  const bathMirrorMat = new THREE.MeshStandardMaterial({ map: bathMirrorCleanTex, roughness: 0.14, metalness: 0.78 });

  const scrawlTex2 = makeWallScrawl('LẠNH QUÁ...', 'sao anh không mở?');
  const scrawlTex3 = makeWallScrawl('02:08 · IM LẶNG', '4 cuộc gọi không ai nghe');
  const scrawlTex4 = makeWallScrawl('CHỐT KHÓA Ở BÊN TRONG', 'anh đâu có ngủ quên...');
  const scrawlTex5 = makeWallScrawl('14/11 · 02:14', 'mở cửa ra đi, Steve.');
  const wallScrawlMat = new THREE.MeshStandardMaterial({ map: scrawlTex2, transparent: true, roughness: 0.9 });

  const heldPaperMat = new THREE.MeshBasicMaterial({ map: makeHeldPaperTexture('clue', 1), depthTest: false, toneMapped: false });

  const coreShadowMat = new THREE.MeshBasicMaterial({ color: 0x030305 });
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x010204,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf4f7ff });

  const glintTex = makeGlintTex();

  return {
    plasterPBR,
    floorPBR,
    wallMat,
    ceilingMat,
    floorMat,
    doorMat,
    woodRichMat,
    woodDarkMat,
    brassMat,
    metalMat,
    chromeMat,
    blanketMat,
    pillowMat,
    sofaMat,
    porcelainMat,
    counterTopMat,
    waterStreamMat,
    fridgeBodyMat,
    shardMat,
    stemMat,
    petalMat,
    centerMat,
    breakerLedMat,
    alleyWallMat,
    wetAsphaltMat,
    tvScreenMat,
    weMat,
    mirrorCleanTex,
    mirrorGhostTex,
    mirrorCrackedTex,
    mirrorMat,
    portraitCleanTex,
    portraitScratchedTex,
    portraitMat,
    bathMirrorCleanTex,
    bathMirrorFogTex,
    bathMirrorGhostTex,
    bathMirrorCrackedTex,
    bathMirrorMat,
    scrawlTex2,
    scrawlTex3,
    scrawlTex4,
    scrawlTex5,
    wallScrawlMat,
    heldPaperMat,
    coreShadowMat,
    mistMat,
    eyeMat,
    glintTex
  };
}
