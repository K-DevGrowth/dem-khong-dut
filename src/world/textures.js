import * as THREE from 'three';
import { getHeldPaperContent, wrapCanvasText } from '../config/heldPaperContent.js';

export function makePlasterPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#2a2824'); grad.addColorStop(0.68, '#38342d'); grad.addColorStop(0.7, '#1d1915'); grad.addColorStop(1, '#1a1511');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080'; bctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 512, y = Math.random() * 360, sz = 3 + Math.random() * 14, v = 36 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgba(${v},${v - 2},${v - 6},0.16)`; ctx.fillRect(x, y, sz, sz);
    const bv = 110 + Math.floor(Math.random() * 35); bctx.fillStyle = `rgba(${bv},${bv},${bv},0.25)`; bctx.fillRect(x, y, sz, sz);
  }
  ctx.fillStyle = '#2b2017'; ctx.fillRect(0, 352, 512, 14);
  bctx.fillStyle = '#d0d0d0'; bctx.fillRect(0, 352, 512, 14);
  for (let x = 16; x < 512; x += 128) {
    ctx.strokeStyle = '#120d09'; ctx.lineWidth = 4; ctx.strokeRect(x, 382, 96, 98);
    bctx.strokeStyle = '#303030'; bctx.lineWidth = 5; bctx.strokeRect(x, 382, 96, 98);
  }
  // Ceiling & lower-wall dampness / grime vignette for lived-in eerie depth
  const topGrime = ctx.createLinearGradient(0, 0, 0, 96);
  topGrime.addColorStop(0, 'rgba(6, 5, 4, 0.58)');
  topGrime.addColorStop(1, 'rgba(6, 5, 4, 0)');
  ctx.fillStyle = topGrime;
  ctx.fillRect(0, 0, 512, 96);
  for (let s = 0; s < 14; s++) {
    const sx = Math.random() * 512;
    const sw = 10 + Math.random() * 26;
    const sh = 60 + Math.random() * 140;
    const sg = ctx.createLinearGradient(0, 0, 0, sh);
    sg.addColorStop(0, 'rgba(10, 12, 10, 0.24)');
    sg.addColorStop(1, 'rgba(10, 12, 10, 0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx, 0, sw, sh);
  }
  ctx.fillStyle = '#140e09'; ctx.fillRect(0, 490, 512, 22);
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.5, 1); });
  return { map, bumpMap };
}

export function makeHardwoodPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');
  ctx.fillStyle = '#1d140e'; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#707070'; bctx.fillRect(0, 0, 512, 512);
  const plankW = 64;
  for (let x = 0; x < 512; x += plankW) {
    const baseR = 46 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${baseR},${Math.floor(baseR * 0.68)},${Math.floor(baseR * 0.44)})`;
    ctx.fillRect(x + 2, 0, plankW - 4, 512);
    for (let g = 0; g < 18; g++) {
      ctx.fillStyle = `rgba(18,10,6,${0.08 + Math.random() * 0.14})`;
      ctx.fillRect(x + 4 + Math.random() * (plankW - 8), 0, 1.5, 512);
    }
    ctx.fillStyle = '#0c0704'; ctx.fillRect(x, 0, 2, 512);
    bctx.fillStyle = '#181818'; bctx.fillRect(x, 0, 3, 512);
    const jy = ((x / plankW) % 2) * 256 + 128;
    ctx.fillStyle = '#0c0704'; ctx.fillRect(x, jy, plankW, 2);
    bctx.fillStyle = '#181818'; bctx.fillRect(x, jy, plankW, 3);
  }
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4.5, 6); });
  return { map, bumpMap };
}

export function makeTileFloorTex(c1, c2) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const step = 64;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      ctx.fillStyle = ((x / step + y / step) % 2 === 0) ? c1 : c2;
      ctx.fillRect(x, y, step, step);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, step - 2, step - 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function makeBathMirrorTex(mode) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 320);
  g.addColorStop(0, '#33424c'); g.addColorStop(0.5, '#1e2830'); g.addColorStop(1, '#12181e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 320);

  const fogAlpha = mode === 'clean' ? 0.14 : 0.34;
  const fog = ctx.createRadialGradient(128, 160, 20, 128, 160, 165);
  fog.addColorStop(0, `rgba(210, 226, 232, ${fogAlpha})`);
  fog.addColorStop(1, 'rgba(180, 200, 210, 0.05)');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, 256, 320);

  if (mode === 'ghost') {
    ctx.fillStyle = 'rgba(220, 238, 236, 0.72)';
    ctx.beginPath(); ctx.ellipse(128, 145, 38, 52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#05070a';
    ctx.beginPath(); ctx.arc(112, 136, 8, 0, Math.PI * 2); ctx.arc(144, 136, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 174, 12, 20, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (mode === 'fog0214' || mode === 'ghost') {
    ctx.fillStyle = 'rgba(18, 28, 34, 0.85)';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('02:14', 128, 245);
    ctx.strokeStyle = 'rgba(18, 28, 34, 0.55)';
    ctx.lineWidth = 3;
    [82, 114, 152, 176].forEach((dx) => {
      ctx.beginPath(); ctx.moveTo(dx, 252); ctx.lineTo(dx, 285 + Math.random() * 20); ctx.stroke();
    });
  }
  if (mode === 'cracked') {
    ctx.fillStyle = 'rgba(18, 26, 32, 0.86)';
    ctx.font = 'bold 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ĐÂY KHÔNG PHẢI NHÀ ANH', 128, 212);
    ctx.font = 'bold 26px "Be Vietnam Pro", sans-serif';
    ctx.fillText('ANH LÀ AI?', 128, 246);
    ctx.strokeStyle = 'rgba(235, 246, 255, 0.86)';
    ctx.lineWidth = 2;
    [[128, 120, 18, 36], [128, 120, 244, 72], [128, 120, 48, 305], [128, 120, 215, 290], [128, 120, 128, 8]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + 10, (y1 + y2) / 2 - 6); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeRugTexture(primary, accent) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = primary; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = accent; ctx.lineWidth = 14; ctx.strokeRect(26, 26, 460, 460);
  ctx.lineWidth = 4; ctx.strokeRect(52, 52, 408, 408);
  ctx.beginPath(); ctx.moveTo(256, 120); ctx.lineTo(370, 256); ctx.lineTo(256, 392); ctx.lineTo(142, 256); ctx.closePath();
  ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.stroke();
  for (let y = 0; y < 512; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, y, 512, 1); }
  return new THREE.CanvasTexture(c);
}

export function makeFabricTexture(baseHex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d'); ctx.fillStyle = baseHex; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 4) {
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(0, i, 256, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(i, 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
  return tex;
}

export function makePanelDoorTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#3a2619'; ctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = 'rgba(18,10,5,0.12)'; ctx.fillRect(Math.random() * 256, 0, 2, 512); }
  [[28, 36, 86, 185], [142, 36, 86, 185], [28, 260, 86, 210], [142, 260, 86, 210]].forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#2d1c12'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#180e08'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,215,175,0.08)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  });
  return new THREE.CanvasTexture(c);
}

export function makeClockTexture(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#070709'; ctx.fillRect(0, 0, 256, 128);
  ctx.shadowColor = '#ff3b30'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff4a3d'; ctx.font = 'bold 76px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 66);
  return new THREE.CanvasTexture(c);
}

export function makePortraitTexture(scratched) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const bg = ctx.createRadialGradient(128, 130, 20, 128, 160, 180);
  bg.addColorStop(0, '#3a322a'); bg.addColorStop(1, '#12100e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = '#5c4e41';
  ctx.beginPath(); ctx.arc(96, 118, 28, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(60, 152, 72, 140);
  ctx.beginPath(); ctx.arc(162, 130, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(130, 160, 64, 132);
  if (scratched) {
    ctx.strokeStyle = '#0d0505'; ctx.lineWidth = 7;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath(); ctx.moveTo(46 + Math.random() * 160, 82 + Math.random() * 76);
      ctx.lineTo(46 + Math.random() * 160, 82 + Math.random() * 76); ctx.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

export function makeMirrorTex(cracked, ghostly) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 384);
  g.addColorStop(0, '#2a333c'); g.addColorStop(0.5, '#192028'); g.addColorStop(1, '#10141a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 384);
  if (ghostly) {
    ctx.fillStyle = 'rgba(215, 232, 226, 0.72)';
    ctx.beginPath(); ctx.ellipse(128, 155, 42, 58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#050608';
    ctx.beginPath(); ctx.arc(110, 145, 9, 0, Math.PI * 2); ctx.arc(146, 145, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 185, 14, 24, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (cracked) {
    ctx.strokeStyle = 'rgba(235, 245, 255, 0.85)'; ctx.lineWidth = 2;
    [[128, 160, 20, 40], [128, 160, 240, 85], [128, 160, 45, 350], [128, 160, 225, 310], [128, 160, 128, 10]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + 12, (y1 + y2) / 2 - 8); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }
  return new THREE.CanvasTexture(c);
}

export function makeWallScrawl(line1, line2) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = 'rgba(182, 34, 26, 0.88)'; ctx.font = 'bold 38px "Times New Roman", serif'; ctx.fillText(line1, 24, 118);
  ctx.fillStyle = 'rgba(162, 32, 24, 0.8)'; ctx.font = 'italic 28px "Times New Roman", serif'; ctx.fillText(line2, 24, 172);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeAlleyWallTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#1e2022'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const v = 22 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgba(${v},${v + 2},${v + 1},0.35)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 14, 14);
  }
  for (let x = 12; x < 256; x += 48) {
    ctx.fillStyle = 'rgba(14, 22, 16, 0.45)';
    ctx.fillRect(x, 0, 10 + Math.random() * 14, 256);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1.5);
  return t;
}

export function makeFlameSpriteTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 256);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.bezierCurveTo(106, 98, 114, 178, 64, 232);
  ctx.bezierCurveTo(14, 178, 22, 98, 64, 18);
  ctx.closePath();
  const gOuter = ctx.createRadialGradient(64, 178, 8, 64, 148, 102);
  gOuter.addColorStop(0.0, 'rgba(255, 248, 200, 0.98)');
  gOuter.addColorStop(0.32, 'rgba(255, 195, 65, 0.92)');
  gOuter.addColorStop(0.68, 'rgba(255, 92, 16, 0.65)');
  gOuter.addColorStop(1.0, 'rgba(210, 30, 0, 0.0)');
  ctx.fillStyle = gOuter;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(64, 92);
  ctx.bezierCurveTo(86, 146, 88, 194, 64, 218);
  ctx.bezierCurveTo(40, 194, 42, 146, 64, 92);
  ctx.closePath();
  const gInner = ctx.createRadialGradient(64, 182, 4, 64, 170, 52);
  gInner.addColorStop(0.0, 'rgba(255, 255, 245, 1.0)');
  gInner.addColorStop(0.55, 'rgba(255, 225, 120, 0.85)');
  gInner.addColorStop(1.0, 'rgba(255, 140, 30, 0.0)');
  ctx.fillStyle = gInner;
  ctx.fill();
  ctx.restore();

  const gBlue = ctx.createRadialGradient(64, 218, 2, 64, 218, 24);
  gBlue.addColorStop(0.0, 'rgba(110, 175, 255, 0.72)');
  gBlue.addColorStop(1.0, 'rgba(70, 130, 255, 0.0)');
  ctx.fillStyle = gBlue;
  ctx.beginPath();
  ctx.arc(64, 218, 24, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(c);
}

export function makeGlowHaloTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0.0, 'rgba(255, 170, 70, 0.55)');
  g.addColorStop(0.45, 'rgba(255, 95, 20, 0.22)');
  g.addColorStop(1.0, 'rgba(255, 60, 0, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function makeGlintTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0.0, 'rgba(255, 246, 210, 0.95)');
  g.addColorStop(0.35, 'rgba(247, 195, 124, 0.45)');
  g.addColorStop(1.0, 'rgba(247, 195, 124, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function makeHeldPaperTexture(kind, loopNum) {
  const info = getHeldPaperContent(kind, loopNum);
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1280;
  const ctx = c.getContext('2d');
  ctx.scale(1024 / 768, 1280 / 960);

  const grad = ctx.createLinearGradient(0, 0, 768, 960);
  if (info.theme === 'sticky') {
    grad.addColorStop(0, '#efe1a8'); grad.addColorStop(1, '#d9c57f');
  } else if (info.theme === 'wet') {
    grad.addColorStop(0, '#d2d4ce'); grad.addColorStop(1, '#b1b7b0');
  } else if (info.theme === 'frost') {
    grad.addColorStop(0, '#d7e8f0'); grad.addColorStop(1, '#aac6d4');
  } else if (info.theme === 'scrawl') {
    grad.addColorStop(0, '#c7bfb2'); grad.addColorStop(1, '#a3998b');
  } else if (info.theme === 'calendar') {
    grad.addColorStop(0, '#ddd2ba'); grad.addColorStop(1, '#c8ba9d');
  } else if (info.theme === 'report') {
    grad.addColorStop(0, '#cfc7b6'); grad.addColorStop(1, '#b6ac98');
  } else {
    grad.addColorStop(0, '#c8c3b8'); grad.addColorStop(1, '#aaa497');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 960);

  for (let i = 0; i < 800; i++) {
    const v = 90 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${v},${v - 8},${v - 16},0.06)`;
    ctx.fillRect(Math.random() * 768, Math.random() * 960, 4 + Math.random() * 14, 4 + Math.random() * 14);
  }

  const vig = ctx.createRadialGradient(384, 480, 220, 384, 480, 560);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(38,28,18,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 768, 960);

  if (info.theme === 'calendar' || info.theme === 'sticky') {
    ctx.strokeStyle = 'rgba(110, 92, 70, 0.2)';
    ctx.lineWidth = 2;
    for (let y = 210; y <= 840; y += 54) {
      ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(704, y); ctx.stroke();
    }
    ctx.fillStyle = info.theme === 'sticky' ? '#7a5a1c' : '#8b2b24';
    ctx.fillRect(64, 84, 640, 6);
    ctx.font = 'bold 32px "Be Vietnam Pro", sans-serif';
    ctx.fillText(info.header, 64, 146);
  } else if (info.theme === 'report' || info.theme === 'wet') {
    ctx.fillStyle = 'rgba(42, 52, 62, 0.14)';
    ctx.beginPath(); ctx.arc(570, 680, 98, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(60, 50, 42, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 56, 672, 848);
    ctx.fillStyle = '#25201b';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(info.header, 80, 134);
    ctx.fillRect(80, 156, 608, 3);
  } else if (info.theme === 'certificate') {
    ctx.strokeStyle = 'rgba(40, 36, 32, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 52, 680, 856);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(54, 62, 660, 836);
    ctx.fillStyle = '#1e1a17';
    ctx.font = 'bold 36px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(info.header, 384, 136);
    ctx.font = '23px monospace';
    ctx.fillText(info.subHeader, 384, 180);
    ctx.textAlign = 'left';
    ctx.fillRect(84, 206, 600, 2);
  } else {
    ctx.strokeStyle = 'rgba(48, 56, 64, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 60, 664, 840);
    ctx.fillStyle = info.theme === 'frost' ? '#1c3b4d' : '#4a1b17';
    ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
    ctx.fillText(info.header, 80, 138);
    ctx.fillRect(80, 160, 608, 3);
  }

  ctx.fillStyle = info.theme === 'scrawl' ? '#5e1410' : '#221c16';
  ctx.font = info.theme === 'report'
    ? '31px "Lora", Georgia, serif'
    : 'italic 35px "Lora", Georgia, serif';
  const nextY = wrapCanvasText(ctx, info.body, 80, 250, 608, 54);

  if (info.note) {
    const divY = Math.max(nextY + 34, 540);
    ctx.strokeStyle = 'rgba(70, 58, 46, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, divY); ctx.lineTo(688, divY); ctx.stroke();

    ctx.fillStyle = 'rgba(65, 52, 42, 0.88)';
    ctx.font = 'italic 27px "Lora", Georgia, serif';
    wrapCanvasText(ctx, info.note, 80, divY + 52, 608, 44);
  }

  ctx.fillStyle = 'rgba(55, 45, 36, 0.7)';
  ctx.font = '20px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('[ Nhấn E hoặc Esc để hạ giấy xuống ]', 384, 926);
  ctx.textAlign = 'left';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// Reusable TV static texture system
const tvCanvas = document.createElement('canvas'); tvCanvas.width = 128; tvCanvas.height = 96;
const tvCtx = tvCanvas.getContext('2d');
const tvImgData = tvCtx.createImageData(128, 96);
export const tvStaticTex = new THREE.CanvasTexture(tvCanvas);

export function updateTVStatic() {
  const d = tvImgData.data;
  for (let y = 0; y < 96; y++) {
    const scanDim = (y % 3 === 0) ? 0.68 : 1.0;
    const rowOff = y * 128 * 4;
    for (let x = 0; x < 128; x++) {
      const idx = rowOff + x * 4;
      const v = (Math.random() * 210 + 30) * scanDim;
      d[idx] = v * 0.78;
      d[idx + 1] = v * 0.92;
      d[idx + 2] = v;
      d[idx + 3] = 255;
    }
  }
  tvCtx.putImageData(tvImgData, 0, 0);
  tvStaticTex.needsUpdate = true;
}

// Window rain streaks system
export function createWindowRainSystem() {
  const rainWinCanvas = document.createElement('canvas');
  rainWinCanvas.width = 128; rainWinCanvas.height = 128;
  const rainWinCtx = rainWinCanvas.getContext('2d');
  const rainWinTex = new THREE.CanvasTexture(rainWinCanvas);
  const rainDrops = Array.from({ length: 34 }, () => ({
    x: Math.random() * 128,
    y: Math.random() * 128,
    len: 7 + Math.random() * 14,
    spd: 0.9 + Math.random() * 1.9,
    alpha: 0.25 + Math.random() * 0.45
  }));

  function updateWindowRain(dt, isDawn = false) {
    const ctx = rainWinCtx;
    ctx.fillStyle = isDawn ? '#7e6d56' : '#263a52';
    ctx.fillRect(0, 0, 128, 128);

    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, isDawn ? 'rgba(255, 214, 150, 0.48)' : 'rgba(92, 134, 178, 0.28)');
    g.addColorStop(1, 'rgba(12, 18, 28, 0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);

    ctx.lineWidth = 1.4;
    for (let i = 0; i < rainDrops.length; i++) {
      const d = rainDrops[i];
      d.y += d.spd * dt * 52;
      d.x -= d.spd * dt * 7;
      if (d.y > 134) { d.y = -12; d.x = Math.random() * 136; }
      if (d.x < -8) d.x = 132;
      ctx.strokeStyle = isDawn
        ? `rgba(255, 240, 210, ${d.alpha * 0.7})`
        : `rgba(182, 218, 248, ${d.alpha})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2.2, d.y + d.len);
      ctx.stroke();
      ctx.fillStyle = isDawn ? 'rgba(255,246,225,0.55)' : 'rgba(205,234,255,0.6)';
      ctx.fillRect(d.x - 2.6, d.y + d.len, 1.8, 2.2);
    }
    rainWinTex.needsUpdate = true;
  }

  updateWindowRain(0.016, false);
  return { rainWinTex, updateWindowRain };
}

export function makeContactShadowTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 14, 64, 64, 62);
  g.addColorStop(0.0, 'rgba(0, 0, 0, 0.72)');
  g.addColorStop(0.55, 'rgba(0, 0, 0, 0.36)');
  g.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function makeLoop5WallOrderTex(colorOrder) {
  const c = document.createElement('canvas');
  c.width = 768; c.height = 384;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 768, 384);

  ctx.fillStyle = 'rgba(218, 210, 198, 0.88)';
  ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THỨ TỰ MỞ KHÓA HỘP HỒ SƠ', 384, 72);

  const startX = 120;
  const gap = 176;
  colorOrder.forEach((item, idx) => {
    const cx = startX + idx * gap;
    const cy = 186;
    ctx.fillStyle = item.hex;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 234, 224, 0.65)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'rgba(235, 228, 218, 0.92)';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(String(idx + 1), cx, cy + 8);

    ctx.font = 'bold 21px "Be Vietnam Pro", sans-serif';
    ctx.fillText(item.name.toUpperCase(), cx, cy + 72);

    if (idx < colorOrder.length - 1) {
      ctx.fillStyle = 'rgba(218, 210, 198, 0.72)';
      ctx.font = 'bold 34px monospace';
      ctx.fillText('→', cx + gap * 0.5, cy + 12);
    }
  });

  ctx.fillStyle = 'rgba(182, 34, 26, 0.85)';
  ctx.font = 'italic 22px "Lora", serif';
  ctx.fillText('Tìm 4 số màu: mặt sau giấy bếp · tủ lạnh · tủ áo · gương tắm', 384, 336);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeLoop5BathMirrorTex(clue) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 320);
  g.addColorStop(0, '#33424c'); g.addColorStop(0.5, '#1e2830'); g.addColorStop(1, '#12181e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 320);

  ctx.strokeStyle = 'rgba(235, 246, 255, 0.72)';
  ctx.lineWidth = 2;
  [[128, 110, 18, 36], [128, 110, 244, 72], [128, 110, 48, 305], [128, 110, 215, 290]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + 10, (y1 + y2) / 2 - 6); ctx.lineTo(x2, y2); ctx.stroke();
  });

  ctx.fillStyle = clue.hex;
  ctx.beginPath();
  ctx.arc(128, 140, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#f5f2eb';
  ctx.font = 'bold 54px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(clue.digit), 128, 159);

  ctx.fillStyle = 'rgba(230, 238, 242, 0.9)';
  ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`MÀU ${clue.name.toUpperCase()}`, 128, 232);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


// Silent Hill Otherworld Rusted & Peeling Industrial Wall Texture (Loops 4-5)
export function makeOtherworldPlasterPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#1e100c');
  grad.addColorStop(0.55, '#341913');
  grad.addColorStop(0.72, '#1c0e0a');
  grad.addColorStop(1, '#120907');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#757575'; bctx.fillRect(0, 0, 512, 512);

  // Heavy rust blotches, peeling paint & dried grime
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, sz = 4 + Math.random() * 20;
    const isRust = Math.random() < 0.55;
    ctx.fillStyle = isRust
      ? `rgba(${68 + Math.floor(Math.random() * 44)}, ${24 + Math.floor(Math.random() * 18)}, ${14 + Math.floor(Math.random() * 12)}, 0.24)`
      : `rgba(14, 10, 9, 0.28)`;
    ctx.fillRect(x, y, sz, sz);
    const bv = isRust ? 160 : 50;
    bctx.fillStyle = `rgba(${bv},${bv},${bv},0.3)`;
    bctx.fillRect(x, y, sz, sz);
  }
  // Vertical rust/damp drips from ceiling
  for (let s = 0; s < 26; s++) {
    const sx = Math.random() * 512, sw = 4 + Math.random() * 16, sh = 90 + Math.random() * 260;
    const sg = ctx.createLinearGradient(0, 0, 0, sh);
    sg.addColorStop(0, 'rgba(38, 10, 6, 0.65)');
    sg.addColorStop(1, 'rgba(38, 10, 6, 0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx, 0, sw, sh);
  }
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.5, 1); });
  return { map, bumpMap };
}

export function makeOtherworldFloorPBR() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const b = document.createElement('canvas'); b.width = 512; b.height = 512;
  const bctx = b.getContext('2d');
  ctx.fillStyle = '#140c0a'; ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#606060'; bctx.fillRect(0, 0, 512, 512);

  // Grating / rusted iron planks feel
  for (let y = 0; y < 512; y += 32) {
    ctx.fillStyle = 'rgba(8, 5, 4, 0.72)'; ctx.fillRect(0, y, 512, 4);
    bctx.fillStyle = '#181818'; bctx.fillRect(0, y, 512, 5);
  }
  for (let x = 0; x < 512; x += 64) {
    ctx.fillStyle = 'rgba(8, 5, 4, 0.72)'; ctx.fillRect(x, 0, 4, 512);
    bctx.fillStyle = '#181818'; bctx.fillRect(x, 0, 5, 512);
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${56 + Math.floor(Math.random() * 34)}, 22, 14, 0.22)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 8 + Math.random() * 18, 8 + Math.random() * 18);
  }
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(b);
  [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4.5, 6); });
  return { map, bumpMap };
}
