export function createSettingsController(els, settings, GFX_PRESETS, renderer, scene, lights, dustPoints, materials, saveSettingsFn, state, callbacks) {
  function applyGraphicsQuality(level) {
    const preset = GFX_PRESETS[level] || GFX_PRESETS.medium;
    const dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr);
    renderer.setPixelRatio(dpr);
    const container = els.container;
    renderer.setSize(Math.max(1, container.clientWidth || window.innerWidth || 1280), Math.max(1, container.clientHeight || window.innerHeight || 720), false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.toneMappingExposure = preset.exposure;

    document.body.classList.toggle('gfx-low', level === 'low');

    const shadowChanged = renderer.shadowMap.enabled !== preset.shadows || renderer.shadowMap.type !== preset.shadowType;
    renderer.shadowMap.enabled = preset.shadows;
    renderer.shadowMap.type = preset.shadowType;
    // Static shadow map caching: avoids re-rendering 6 shadow passes every single frame
    renderer.shadowMap.autoUpdate = false;

    // Never enable 6-pass PointLight shadow cubemap on handheld matchLight
    if (lights.matchLight) {
      lights.matchLight.castShadow = false;
    }

    if (lights.bedroomLampLight) {
      const lt = lights.bedroomLampLight;
      lt.castShadow = preset.shadows;
      if (lt.shadow) {
        if (lt.shadow.mapSize.width !== preset.shadowSize || shadowChanged) {
          lt.shadow.mapSize.width = preset.shadowSize;
          lt.shadow.mapSize.height = preset.shadowSize;
          if (lt.shadow.map) {
            lt.shadow.map.dispose();
            lt.shadow.map = null;
          }
        }
      }
    }

    materials.wallMat.bumpScale = preset.wallBump;
    materials.floorMat.bumpScale = preset.floorBump;
    if (shadowChanged) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => { m.needsUpdate = true; });
          else obj.material.needsUpdate = true;
        }
      });
    }

    if (dustPoints) dustPoints.visible = preset.dust;
    renderer.shadowMap.needsUpdate = true;
  }

  function applyAllSettings() {
    applyGraphicsQuality(settings.graphics);
    els.fpsBadge.classList.toggle('hidden', !settings.showFps);

    document.querySelectorAll('#gfx-preset-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-gfx') === settings.graphics);
    });
    if (els.gfxDescEl) els.gfxDescEl.textContent = GFX_PRESETS[settings.graphics].desc;

    document.querySelectorAll('#fps-limit-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-fps')) === settings.fpsLimit);
    });

    els.toggleShowFps.classList.toggle('on', settings.showFps);
    els.toggleCamSmooth.classList.toggle('on', settings.camSmooth);
    els.sliderSens.value = String(settings.sensitivity);
    els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
  }

  document.querySelectorAll('#gfx-preset-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.graphics = btn.getAttribute('data-gfx');
      saveSettingsFn(settings);
      applyAllSettings();
    });
  });

  document.querySelectorAll('#fps-limit-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.fpsLimit = Number(btn.getAttribute('data-fps'));
      saveSettingsFn(settings);
      applyAllSettings();
    });
  });

  els.toggleShowFps.addEventListener('click', () => {
    settings.showFps = !settings.showFps;
    saveSettingsFn(settings);
    applyAllSettings();
  });

  els.toggleCamSmooth.addEventListener('click', () => {
    settings.camSmooth = !settings.camSmooth;
    if (!settings.camSmooth) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
    }
    saveSettingsFn(settings);
    applyAllSettings();
  });

  els.sliderSens.addEventListener('input', () => {
    settings.sensitivity = parseFloat(els.sliderSens.value) || 1.0;
    els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
    saveSettingsFn(settings);
  });

  const btnReset = document.getElementById('btn-reset-settings');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (callbacks.onReset) callbacks.onReset();
      applyAllSettings();
    });
  }

  function openSettings() {
    if (els.journalScreen && !els.journalScreen.classList.contains('hidden')) els.journalScreen.classList.add('hidden');
    if (state.running && !state.ended) {
      state.paused = true;
      if (document.pointerLockElement) document.exitPointerLock();
    }
    applyAllSettings();
    if (callbacks.clearKeys) callbacks.clearKeys();
    els.settingsScreen.classList.remove('hidden');
  }

  function closeSettings() {
    els.settingsScreen.classList.add('hidden');
    if (state.running && !state.ended && (!els.journalScreen || els.journalScreen.classList.contains('hidden'))) {
      state.paused = false;
    }
  }

  function toggleSettings() {
    if (els.settingsScreen.classList.contains('hidden')) openSettings();
    else closeSettings();
  }

  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) btnSettings.addEventListener('click', toggleSettings);
  const btnCloseSettings = document.getElementById('btn-close-settings');
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);

  applyAllSettings();

  return {
    applyAllSettings,
    applyGraphicsQuality,
    openSettings,
    closeSettings,
    toggleSettings
  };
}
