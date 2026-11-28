export function createSettingsController(els, settings, GFX_PRESETS, renderer, scene, camera, audio, lights, dustPoints, materials, saveSettingsFn, state, callbacks) {
  function applyGraphicsQuality(level) {
    const preset = GFX_PRESETS[level] || GFX_PRESETS.medium;
    const dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr);
    renderer.setPixelRatio(dpr);
    const container = els.container;
    renderer.setSize(
      Math.max(1, container.clientWidth || window.innerWidth || 1280),
      Math.max(1, container.clientHeight || window.innerHeight || 720),
      false
    );
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.toneMappingExposure = preset.exposure * (settings.gamma || 1.0);

    document.body.classList.toggle('gfx-low', level === 'low');
    document.body.classList.toggle('no-film-grain', !settings.filmGrain);
    document.body.classList.toggle('subtitles-off', !settings.subtitles);

    if (camera && state.panicTimer <= 0) {
      camera.fov = settings.fov || 66;
      camera.updateProjectionMatrix();
    }

    const shadowChanged = renderer.shadowMap.enabled !== preset.shadows || renderer.shadowMap.type !== preset.shadowType;
    renderer.shadowMap.enabled = preset.shadows;
    renderer.shadowMap.type = preset.shadowType;
    renderer.shadowMap.autoUpdate = false;

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

  function applyAudioSettings() {
    if (audio && typeof audio.setVolumes === 'function') {
      audio.setVolumes(settings.masterVol, settings.ambienceVol, settings.sfxVol);
    }
  }

  function applyAllSettings() {
    applyGraphicsQuality(settings.graphics);
    applyAudioSettings();

    if (els.fpsBadge) els.fpsBadge.classList.toggle('hidden', !settings.showFps);

    document.querySelectorAll('#gfx-preset-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-gfx') === settings.graphics);
    });
    if (els.gfxDescEl) els.gfxDescEl.textContent = GFX_PRESETS[settings.graphics].desc;

    document.querySelectorAll('#fps-limit-group .seg-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-fps')) === settings.fpsLimit);
    });

    if (els.sliderGamma) els.sliderGamma.value = String(settings.gamma);
    if (els.gammaDisplay) els.gammaDisplay.textContent = `${Math.round(settings.gamma * 100)}%`;

    if (els.sliderFov) els.sliderFov.value = String(settings.fov);
    if (els.fovDisplay) els.fovDisplay.textContent = `${settings.fov}°`;

    if (els.sliderMasterVol) els.sliderMasterVol.value = String(Math.round(settings.masterVol * 100));
    if (els.masterVolDisplay) els.masterVolDisplay.textContent = `${Math.round(settings.masterVol * 100)}%`;

    if (els.sliderAmbienceVol) els.sliderAmbienceVol.value = String(Math.round(settings.ambienceVol * 100));
    if (els.ambienceVolDisplay) els.ambienceVolDisplay.textContent = `${Math.round(settings.ambienceVol * 100)}%`;

    if (els.sliderSfxVol) els.sliderSfxVol.value = String(Math.round(settings.sfxVol * 100));
    if (els.sfxVolDisplay) els.sfxVolDisplay.textContent = `${Math.round(settings.sfxVol * 100)}%`;

    if (els.toggleFilmGrain) els.toggleFilmGrain.classList.toggle('on', settings.filmGrain);
    if (els.toggleShowFps) els.toggleShowFps.classList.toggle('on', settings.showFps);
    if (els.toggleSubtitles) els.toggleSubtitles.classList.toggle('on', settings.subtitles);
    if (els.toggleInvertY) els.toggleInvertY.classList.toggle('on', settings.invertY);
    if (els.toggleHeadBob) els.toggleHeadBob.classList.toggle('on', settings.headBob);
    if (els.toggleCamSmooth) els.toggleCamSmooth.classList.toggle('on', settings.camSmooth);

    if (els.sliderSens) els.sliderSens.value = String(settings.sensitivity);
    if (els.sensDisplay) els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
  }

  // Tab switching
  document.querySelectorAll('#settings-screen .settings-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('#settings-screen .settings-tab').forEach((t) => {
        t.classList.toggle('active', t === tab);
      });
      document.querySelectorAll('#settings-screen .settings-tab-panel').forEach((p) => {
        p.classList.toggle('hidden', p.getAttribute('data-panel') !== target);
      });
    });
  });

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

  if (els.sliderGamma) {
    els.sliderGamma.addEventListener('input', () => {
      settings.gamma = parseFloat(els.sliderGamma.value) || 1.0;
      if (els.gammaDisplay) els.gammaDisplay.textContent = `${Math.round(settings.gamma * 100)}%`;
      const preset = GFX_PRESETS[settings.graphics] || GFX_PRESETS.medium;
      renderer.toneMappingExposure = preset.exposure * settings.gamma;
      saveSettingsFn(settings);
    });
  }

  if (els.sliderFov) {
    els.sliderFov.addEventListener('input', () => {
      settings.fov = parseInt(els.sliderFov.value, 10) || 66;
      if (els.fovDisplay) els.fovDisplay.textContent = `${settings.fov}°`;
      if (camera) {
        camera.fov = settings.fov;
        camera.updateProjectionMatrix();
      }
      saveSettingsFn(settings);
    });
  }

  if (els.sliderMasterVol) {
    els.sliderMasterVol.addEventListener('input', () => {
      settings.masterVol = (parseInt(els.sliderMasterVol.value, 10) || 0) / 100;
      if (els.masterVolDisplay) els.masterVolDisplay.textContent = `${Math.round(settings.masterVol * 100)}%`;
      applyAudioSettings();
      saveSettingsFn(settings);
    });
  }

  if (els.sliderAmbienceVol) {
    els.sliderAmbienceVol.addEventListener('input', () => {
      settings.ambienceVol = (parseInt(els.sliderAmbienceVol.value, 10) || 0) / 100;
      if (els.ambienceVolDisplay) els.ambienceVolDisplay.textContent = `${Math.round(settings.ambienceVol * 100)}%`;
      applyAudioSettings();
      saveSettingsFn(settings);
    });
  }

  if (els.sliderSfxVol) {
    els.sliderSfxVol.addEventListener('input', () => {
      settings.sfxVol = (parseInt(els.sliderSfxVol.value, 10) || 0) / 100;
      if (els.sfxVolDisplay) els.sfxVolDisplay.textContent = `${Math.round(settings.sfxVol * 100)}%`;
      applyAudioSettings();
      saveSettingsFn(settings);
    });
  }

  function bindToggle(el, key, extraFn = null) {
    if (!el) return;
    el.addEventListener('click', () => {
      settings[key] = !settings[key];
      if (extraFn) extraFn();
      saveSettingsFn(settings);
      applyAllSettings();
    });
  }

  bindToggle(els.toggleFilmGrain, 'filmGrain');
  bindToggle(els.toggleShowFps, 'showFps');
  bindToggle(els.toggleSubtitles, 'subtitles');
  bindToggle(els.toggleInvertY, 'invertY');
  bindToggle(els.toggleHeadBob, 'headBob');
  bindToggle(els.toggleCamSmooth, 'camSmooth', () => {
    if (!settings.camSmooth) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
    }
  });

  if (els.sliderSens) {
    els.sliderSens.addEventListener('input', () => {
      settings.sensitivity = parseFloat(els.sliderSens.value) || 1.0;
      if (els.sensDisplay) els.sensDisplay.textContent = `${settings.sensitivity.toFixed(1)}x`;
      saveSettingsFn(settings);
    });
  }

  const btnClearSave = document.getElementById('btn-clear-save');
  if (btnClearSave) {
    btnClearSave.addEventListener('click', () => {
      if (callbacks.onClearSave) callbacks.onClearSave();
      btnClearSave.textContent = 'Đã xóa tiến độ ✓';
      setTimeout(() => { btnClearSave.textContent = 'Xóa tiến độ đã lưu'; }, 1800);
    });
  }

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
