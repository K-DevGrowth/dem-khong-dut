import * as THREE from 'three';

export const SETTINGS_KEY = 'vong_lap_settings_v5';

export const DEFAULT_SETTINGS = {
  // Đồ họa & Hiển thị
  graphics: 'medium', // 'low' | 'medium' | 'high'
  fpsLimit: 60,       // 30 | 60 | 120 | 0 (unlimited)
  gamma: 1.0,         // 0.50 - 2.20 (real-time exposure + ambient shadow lift)
  fov: 66,            // 55 - 85 degrees
  filmGrain: true,
  showFps: false,

  // Âm thanh & Phụ đề
  masterVol: 0.88,    // 0.0 - 1.0
  ambienceVol: 0.85,  // 0.0 - 1.0
  sfxVol: 0.90,       // 0.0 - 1.0
  subtitles: true,

  // Điều khiển & Chống say 3D
  sensitivity: 1.0,   // 0.5 - 2.0
  invertY: false,
  camSmooth: true,
  headBob: true
};

export const GFX_PRESETS = {
  low: {
    label: 'Thấp',
    desc: 'Tắt đổ bóng & hạt bụi, giữ vân tường nhẹ và tối ưu độ phân giải (0.9x) — mượt tối đa trên máy yếu/iGPU.',
    maxDpr: 0.9,
    shadows: false,
    shadowType: THREE.BasicShadowMap,
    shadowSize: 256,
    dust: false,
    wallBump: 0.014,
    floorBump: 0.010,
    tvSkip: 10,
    exposure: 1.14
  },
  medium: {
    label: 'Trung bình',
    desc: 'Đổ bóng tĩnh (512px), hạt bụi, vân tường/sàn ẩm mốc và tương phản bóng tối kinh dị cân bằng (1.0x).',
    maxDpr: 1.0,
    shadows: true,
    shadowType: THREE.PCFShadowMap,
    shadowSize: 512,
    dust: true,
    wallBump: 0.026,
    floorBump: 0.018,
    tvSkip: 6,
    exposure: 1.08
  },
  high: {
    label: 'Cao',
    desc: 'Đổ bóng mềm (1024px PCFSoft), độ phân giải sắc nét (tối đa 1.5x), nổi khối sâu và ánh sáng tương phản đậm.',
    maxDpr: 1.5,
    shadows: true,
    shadowType: THREE.PCFSoftShadowMap,
    shadowSize: 1024,
    dust: true,
    wallBump: 0.034,
    floorBump: 0.024,
    tvSkip: 3,
    exposure: 1.04
  }
};

function clamp(v, lo, hi, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const p = JSON.parse(raw);
    return {
      graphics: GFX_PRESETS[p.graphics] ? p.graphics : DEFAULT_SETTINGS.graphics,
      fpsLimit: [0, 30, 60, 120].includes(Number(p.fpsLimit)) ? Number(p.fpsLimit) : DEFAULT_SETTINGS.fpsLimit,
      gamma: clamp(p.gamma, 0.5, 2.2, DEFAULT_SETTINGS.gamma),
      fov: Math.round(clamp(p.fov, 55, 85, DEFAULT_SETTINGS.fov)),
      filmGrain: p.filmGrain !== undefined ? Boolean(p.filmGrain) : DEFAULT_SETTINGS.filmGrain,
      showFps: Boolean(p.showFps),
      masterVol: clamp(p.masterVol, 0, 1, DEFAULT_SETTINGS.masterVol),
      ambienceVol: clamp(p.ambienceVol, 0, 1, DEFAULT_SETTINGS.ambienceVol),
      sfxVol: clamp(p.sfxVol, 0, 1, DEFAULT_SETTINGS.sfxVol),
      subtitles: p.subtitles !== undefined ? Boolean(p.subtitles) : DEFAULT_SETTINGS.subtitles,
      sensitivity: clamp(p.sensitivity, 0.5, 2.0, DEFAULT_SETTINGS.sensitivity),
      invertY: Boolean(p.invertY),
      camSmooth: p.camSmooth !== undefined ? Boolean(p.camSmooth) : DEFAULT_SETTINGS.camSmooth,
      headBob: p.headBob !== undefined ? Boolean(p.headBob) : DEFAULT_SETTINGS.headBob
    };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}
