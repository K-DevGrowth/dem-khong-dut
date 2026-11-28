import * as THREE from 'three';

export const SETTINGS_KEY = 'vong_lap_settings_v4';

export const DEFAULT_SETTINGS = {
  graphics: 'medium', // 'low' | 'medium' | 'high'
  fpsLimit: 60,       // 30 | 60 | 120 | 0 (unlimited)
  showFps: false,
  camSmooth: true,
  sensitivity: 1.0
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

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      graphics: GFX_PRESETS[parsed.graphics] ? parsed.graphics : DEFAULT_SETTINGS.graphics,
      fpsLimit: [0, 30, 60, 120].includes(Number(parsed.fpsLimit)) ? Number(parsed.fpsLimit) : DEFAULT_SETTINGS.fpsLimit,
      showFps: Boolean(parsed.showFps),
      camSmooth: parsed.camSmooth !== undefined ? Boolean(parsed.camSmooth) : DEFAULT_SETTINGS.camSmooth,
      sensitivity: Math.max(0.5, Math.min(2.0, Number(parsed.sensitivity) || 1.0))
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
