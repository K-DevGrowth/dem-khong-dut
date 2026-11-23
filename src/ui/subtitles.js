export function createNarrator(voiceSelect, audio) {
  const narrator = {
    enabled: false,
    userPicked: false,
    voices: [],
    voice: null,
    loadVoice() {
      if (!('speechSynthesis' in window)) {
        if (voiceSelect) voiceSelect.style.display = 'none';
        return;
      }
      const all = window.speechSynthesis.getVoices() || [];
      const vi = all.filter(v => /vi/i.test(v.lang) || /viet|namminh|hoaimy/i.test(v.name));
      this.voices = vi.length > 0 ? vi : all.slice(0, 6);
      if (!voiceSelect) return;
      voiceSelect.innerHTML = '';
      if (this.voices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'Mặc định';
        voiceSelect.appendChild(opt);
        return;
      }
      let defaultIdx = this.voices.findIndex(v => /nam\s*minh/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = this.voices.findIndex(v => /hoai\s*my|google/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = this.voices.findIndex(v => !/\ban\b/i.test(v.name));
      if (defaultIdx < 0) defaultIdx = 0;

      const currentName = this.userPicked && this.voice ? this.voice.name : null;
      let selectedIdx = currentName ? this.voices.findIndex(v => v.name === currentName) : defaultIdx;
      if (selectedIdx < 0) selectedIdx = defaultIdx;

      this.voices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = v.name.replace(/Microsoft |Google |Online \(Natural\) - Vietnamese \(Vietnam\)/g, '').trim().slice(0, 20) || v.name.slice(0, 20);
        if (idx === selectedIdx) opt.selected = true;
        voiceSelect.appendChild(opt);
      });
      this.voice = this.voices[selectedIdx] || null;
    },
    speak(text, eerie = false) {
      if (!this.enabled || audio.muted || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        if (!this.voice) this.loadVoice();
        const clean = text.replace(/[“”]/g, '').replace(/\[F\]/g, 'phím F').replace(/\[E\]/g, 'phím E').replace(/\[Shift\]/g, 'phím Shift');
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = 'vi-VN';
        if (eerie === 'warm') {
          const fem = this.voices.find(v => /hoai\s*my|linh|nu|female|google/i.test(v.name));
          u.voice = fem || this.voice;
          u.rate = 0.92; u.pitch = 1.08; u.volume = 0.95;
        } else if (eerie === 'cold' || eerie === true) {
          if (this.voice) u.voice = this.voice;
          u.rate = 0.84; u.pitch = 0.76; u.volume = 0.95;
        } else {
          if (this.voice) u.voice = this.voice;
          u.rate = 0.98; u.pitch = 0.96; u.volume = 0.95;
        }
        window.speechSynthesis.speak(u);
      } catch (_) {}
    },
    stop() {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    }
  };

  if (voiceSelect) {
    voiceSelect.addEventListener('change', () => {
      const idx = parseInt(voiceSelect.value, 10);
      if (!isNaN(idx) && narrator.voices[idx]) {
        narrator.userPicked = true;
        narrator.voice = narrator.voices[idx];
        if (narrator.enabled) narrator.speak('Thử giọng kể chuyện trong đêm mười bốn tháng mười một, lúc hai giờ mười bốn phút.');
      }
    });
  }

  if ('speechSynthesis' in window) {
    narrator.loadVoice();
    window.speechSynthesis.onvoiceschanged = () => narrator.loadVoice();
    setTimeout(() => narrator.loadVoice(), 600);
  }

  return narrator;
}

export function createSubtitleSystem(elsOrBox, narratorOrSpeaker, stateOrText, optNarrator, optAudio, optState) {
  let storySubtitleUntil = 0;

  const isObj = elsOrBox && elsOrBox.subtitleBox;
  const box = isObj ? elsOrBox.subtitleBox : elsOrBox;
  const speakerEl = isObj ? elsOrBox.subtitleSpeaker : narratorOrSpeaker;
  const textEl = isObj ? elsOrBox.subtitleText : stateOrText;
  const activeNarrator = isObj ? narratorOrSpeaker : optNarrator;
  const activeState = isObj ? stateOrText : optState;

  function showSubtitle(speaker, text, durationMs = 6600, eerieVoice = false, isMinor = false, warmVoice = false) {
    const now = performance.now();
    if (isMinor && now < storySubtitleUntil) return;
    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
    if (box) {
      box.classList.toggle('warm-voice', warmVoice);
      box.classList.add('visible');
    }
    if (!isMinor && activeNarrator) {
      storySubtitleUntil = now + durationMs;
      activeNarrator.speak(text, eerieVoice);
    }
    if (box) {
      box.classList.toggle('voicemail-hold', durationMs === 0);
    }
    if (activeState && activeState.subtitleTimeout) clearTimeout(activeState.subtitleTimeout);
    if (durationMs > 0) {
      const timeoutId = setTimeout(() => {
        if (box) box.classList.remove('visible');
        storySubtitleUntil = 0;
      }, durationMs);
      if (activeState) activeState.subtitleTimeout = timeoutId;
    }
  }

  return { showSubtitle };
}
