import * as THREE from 'three';

export const SETTINGS_KEY = 'vong_lap_settings_v3';

export const DEFAULT_SETTINGS = {
  graphics: 'low',    // 'low' | 'medium' | 'high'
  fpsLimit: 60,       // 30 | 60 | 120 | 0 (unlimited)
  showFps: false,
  camSmooth: true,
  sensitivity: 1.0
};

export const GFX_PRESETS = {
  low: {
    label: 'Thấp',
    desc: 'Tắt đổ bóng, tắt hạt bụi & nhiễu phim, tối ưu độ phân giải (0.85x) và giảm cập nhật texture phụ — mượt tối đa trên máy yếu/iGPU.',
    maxDpr: 0.85,
    shadows: false,
    shadowType: THREE.BasicShadowMap,
    shadowSize: 256,
    dust: false,
    wallBump: 0,
    floorBump: 0,
    tvSkip: 10,
    exposure: 1.36
  },
  medium: {
    label: 'Trung bình',
    desc: 'Bật đổ bóng tĩnh nhẹ (256px), hiệu ứng bụi, vân tường/sàn và độ phân giải 1:1 (1.0x) cân bằng mượt mà.',
    maxDpr: 1.0,
    shadows: true,
    shadowType: THREE.PCFShadowMap,
    shadowSize: 256,
    dust: true,
    wallBump: 0.022,
    floorBump: 0.015,
    tvSkip: 6,
    exposure: 1.30
  },
  high: {
    label: 'Cao',
    desc: 'Đổ bóng mềm (512px PCFSoft), độ phân giải sắc nét (tối đa 1.5x), nổi khối sâu và ánh sáng giàu chi tiết.',
    maxDpr: 1.5,
    shadows: true,
    shadowType: THREE.PCFSoftShadowMap,
    shadowSize: 512,
    dust: true,
    wallBump: 0.030,
    floorBump: 0.020,
    tvSkip: 3,
    exposure: 1.24
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
