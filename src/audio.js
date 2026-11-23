// =========================================================
// SELF-HOSTED WEB AUDIO BUFFER + PROCEDURAL HORROR ENGINE
// Loads local pre-decoded AudioBuffers from public/audio/
// (zero external CDN hotlinks) with full Web Audio procedural
// synthesis fallback when local studio files are absent.
// =========================================================

const AUDIO_BASE = `${(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './'}audio/`;

export const SFX_ASSETS = {
  doorOpen: `${AUDIO_BASE}door-open.mp3`,
  doorClose: `${AUDIO_BASE}door-close.mp3`,
  doorKnock: `${AUDIO_BASE}door-knock.mp3`,
  glassHit: `${AUDIO_BASE}glass-hit.mp3`,
  glassDebris: `${AUDIO_BASE}glass-debris.mp3`,
  horrorAmbience: `${AUDIO_BASE}horror-ambience.mp3`,
  tombAmbience: `${AUDIO_BASE}tomb-ambience.mp3`,
  scaryWoods: `${AUDIO_BASE}scary-woods.mp3`,
  scaryWind: `${AUDIO_BASE}scary-wind.mp3`,
  terrorSweep: `${AUDIO_BASE}terror-sweep.mp3`,
  horrorSweep: `${AUDIO_BASE}horror-sweep.mp3`,
  foxCry: `${AUDIO_BASE}fox-cry.ogg`
};

export class HouseAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.started = false;
    this.masterGain = null;
    this.reverbSend = null;
    this.droneGain = null;
    this.staticGain = null;
    this.whiteBuf = null;
    this.brownBuf = null;
    this.lastBeat = 0;
    this.lastTick = 0;
    this.lastRing = 0;

    // Pre-decoded Web Audio buffers & looping ambience bus
    this.bufferCache = {};
    this.bgAmbienceSrc = null;
    this.bgAmbienceGain = null;
    this.bgWindSrc = null;
    this.bgWindGain = null;
    this.ambienceMutedBySequence = false;
    this.assetsLoadedCount = 0;
    this.onAssetStatus = null;
    this.endingPlaying = false;
    this.endingLoopTimer = null;
    this.endingBus = null;
    this.rainSrc = null;
    this.rainGain = null;
    this.deadSilenceUntil = 0;
  }

  init() {
    if (this.started) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this._ensureAmbiencePlaying();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.started = true;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.88;
    this.masterGain.connect(this.ctx.destination);

    // Pre-generate shared noise buffers
    const sr = this.ctx.sampleRate;
    const nLen = sr * 3;
    this.whiteBuf = this.ctx.createBuffer(1, nLen, sr);
    const wd = this.whiteBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) wd[i] = Math.random() * 2 - 1;

    this.brownBuf = this.ctx.createBuffer(1, nLen, sr);
    const bd = this.brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nLen; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.04 * w) / 1.04;
      bd[i] = Math.max(-1, Math.min(1, last * 3.2));
    }

    // Room convolution reverb
    const irLen = Math.floor(sr * 1.35);
    const irBuf = this.ctx.createBuffer(2, irLen, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = irBuf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < irLen; i++) {
        const decay = Math.pow(1 - i / irLen, 2.7);
        const raw = (Math.random() * 2 - 1) * decay;
        lp = lp * 0.72 + raw * 0.28;
        data[i] = lp;
      }
    }
    const convolver = this.ctx.createConvolver();
    convolver.buffer = irBuf;
    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.34;
    this.reverbSend.connect(convolver);
    convolver.connect(this.masterGain);

    // Subtle sub-bass floor drone
    const osc1 = this.ctx.createOscillator();
    const flt = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.value = 39;
    flt.type = 'lowpass'; flt.frequency.value = 95;
    this.droneGain.gain.value = 0.08;
    osc1.connect(flt); flt.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    osc1.start();

    // TV static layer
    const src = this.ctx.createBufferSource();
    src.buffer = this.whiteBuf; src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 880; bp.Q.value = 2.4;
    this.staticGain = this.ctx.createGain();
    this.staticGain.gain.value = 0.003;
    src.connect(bp); bp.connect(this.staticGain);
    this.staticGain.connect(this.masterGain);
    src.start();

    // Ambience gain buses (routed cleanly through masterGain)
    this.bgAmbienceGain = this.ctx.createGain();
    this.bgAmbienceGain.gain.value = 0.24;
    this.bgAmbienceGain.connect(this.masterGain);

    this.bgWindGain = this.ctx.createGain();
    this.bgWindGain.gain.value = 0.10;
    this.bgWindGain.connect(this.masterGain);

    // Start procedural wind bed immediately so ambience works even without external files
    this._startProceduralWindBed();
    this._preloadAssets();
  }

  _startProceduralWindBed() {
    if (!this.ctx || !this.bgWindGain || this.bgWindSrc) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.brownBuf;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 260;
    bp.Q.value = 1.8;
    src.connect(bp);
    bp.connect(this.bgWindGain);
    src.start();
    this.bgWindSrc = src;
  }

  _startBufferLoop(key, targetGain, currentSrcProp) {
    const buf = this.bufferCache[key];
    if (!this.ctx || !buf || !targetGain) return;
    if (this[currentSrcProp]) {
      try { this[currentSrcProp].stop(); } catch (_) {}
      this[currentSrcProp] = null;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(targetGain);
    src.start();
    this[currentSrcProp] = src;
  }

  async _preloadAssets() {
    if (!this.ctx || typeof fetch !== 'function') return;
    const entries = Object.entries(SFX_ASSETS);
    const total = entries.length;

    await Promise.all(entries.map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        // Guard against Vite dev server returning index.html on missing public/audio/* files
        if (ct.includes('text/html')) return;
        const arrBuf = await res.arrayBuffer();
        if (!arrBuf || arrBuf.byteLength < 128) return;
        const decoded = await this.ctx.decodeAudioData(arrBuf.slice(0));
        this.bufferCache[key] = decoded;
        this.assetsLoadedCount += 1;
        if (this.onAssetStatus) this.onAssetStatus(this.assetsLoadedCount, total);

        if (key === 'horrorAmbience' && !this.ambienceMutedBySequence) {
          this._startBufferLoop('horrorAmbience', this.bgAmbienceGain, 'bgAmbienceSrc');
        } else if (key === 'scaryWind' && !this.ambienceMutedBySequence) {
          this._startBufferLoop('scaryWind', this.bgWindGain, 'bgWindSrc');
        }
      } catch (_) {
        // Local studio file not present or unreadable; procedural fallback handles playback seamlessly
      }
    }));
  }

  _ensureAmbiencePlaying() {
    if (!this.ctx || this.muted) return;
    this.ambienceMutedBySequence = false;
    const t = this.ctx.currentTime;
    if (this.bgAmbienceGain) {
      this.bgAmbienceGain.gain.setTargetAtTime(0.24, t, 0.25);
    }
    if (this.bgWindGain) {
      this.bgWindGain.gain.setTargetAtTime(0.10, t, 0.25);
    }
    if (this.bufferCache.horrorAmbience && !this.bgAmbienceSrc) {
      this._startBufferLoop('horrorAmbience', this.bgAmbienceGain, 'bgAmbienceSrc');
    }
    if (this.bufferCache.scaryWind && !this.bgWindSrc) {
      this._startBufferLoop('scaryWind', this.bgWindGain, 'bgWindSrc');
    } else if (!this.bgWindSrc) {
      this._startProceduralWindBed();
    }
  }

  // Play a pre-decoded AudioBuffer with pitch/trim/fade; falls back to procedural Web Audio
  _playAsset(key, opts = {}, fallbackFn = null) {
    if (this.muted || !this.ctx) return;
    const buf = this.bufferCache[key];
    if (!buf) {
      if (fallbackFn) fallbackFn();
      return;
    }
    try {
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const rate = opts.rate || 1.0;
      src.playbackRate.value = rate;

      const gain = this.ctx.createGain();
      const vol = Math.max(0.001, Math.min(1, opts.volume ?? 0.85));
      gain.gain.setValueAtTime(vol, t);

      const startSec = Math.max(0, Math.min(buf.duration - 0.05, opts.startSec || 0));
      const maxDurSec = opts.maxDurationMs ? opts.maxDurationMs / 1000 : null;

      src.connect(gain);
      this._connectOut(gain, opts.wet ?? 0.22);

      if (maxDurSec && maxDurSec > 0.1) {
        const fadeStart = Math.max(t + 0.02, t + maxDurSec - 0.18);
        gain.gain.setValueAtTime(vol, fadeStart);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + maxDurSec);
        src.start(t, startSec, (maxDurSec + 0.05) * rate);
      } else {
        src.start(t, startSec);
      }
    } catch (_) {
      if (fallbackFn) fallbackFn();
    }
  }

  _connectOut(node, wetAmount = 0.35) {
    node.connect(this.masterGain);
    if (this.reverbSend && wetAmount > 0) {
      const wg = this.ctx.createGain();
      wg.gain.value = wetAmount;
      node.connect(wg);
      wg.connect(this.reverbSend);
    }
  }

  _noise(buffer, startTime, duration, offset = null) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const off = offset !== null ? offset : Math.random() * 1.5;
    src.start(startTime, off, duration);
    return src;
  }

  setMuted(m) {
    this.muted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 0.88, this.ctx.currentTime, 0.05);
    }
  }

  update(fear01, tvProx01, phoneRinging, nowSec) {
    if (!this.started || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (performance.now() < this.deadSilenceUntil) {
      this.droneGain.gain.setTargetAtTime(0.001, t, 0.06);
      this.staticGain.gain.setTargetAtTime(0.0005, t, 0.06);
      if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.001, t, 0.06);
      if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0005, t, 0.06);
      return;
    }

    if (!this.ambienceMutedBySequence) {
      this.droneGain.gain.setTargetAtTime(0.06 + fear01 * 0.16, t, 0.2);
      this.staticGain.gain.setTargetAtTime(0.003 + tvProx01 * 0.065 + fear01 * 0.04, t, 0.2);
      if (this.bgAmbienceGain) {
        this.bgAmbienceGain.gain.setTargetAtTime(Math.min(0.62, 0.24 + fear01 * 0.36), t, 0.2);
      }
      if (this.bgWindGain) {
        this.bgWindGain.gain.setTargetAtTime(Math.min(0.28, 0.08 + fear01 * 0.16), t, 0.2);
      }
    }

    if (nowSec - this.lastTick > 1.0) { this.lastTick = nowSec; this.playClockTick(); }
    if (phoneRinging && nowSec - this.lastRing > 2.8) {
      this.lastRing = nowSec;
      this.playPhoneRing();
    }
    if (fear01 > 0.24) {
      const interval = Math.max(0.34, 1.25 - fear01 * 0.88);
      if (nowSec - this.lastBeat > interval) {
        this.lastBeat = nowSec;
        this.playHeartbeat(0.16 + fear01 * 0.38);
      }
    }
  }

  // 1. CREAKY DOOR
  playDoorCreak(isClosing = false) {
    this.init();
    this._playAsset(
      isClosing ? 'doorClose' : 'doorOpen',
      { volume: 0.92, rate: isClosing ? 0.95 : 0.92 },
      () => this._synthDoorCreakFallback(isClosing)
    );
  }

  // 2. WARDROBE CREAK (Deep pitched creak + cloth rustle layer)
  playWardrobeCreak(slowEerie = false) {
    this.init();
    this._playAsset(
      'doorOpen',
      { volume: 0.88, rate: slowEerie ? 0.62 : 0.72 },
      () => this._synthDoorCreakFallback(false)
    );
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const clothSrc = this._noise(this.whiteBuf, t + 0.18, 0.75);
      const clothFlt = this.ctx.createBiquadFilter();
      clothFlt.type = 'bandpass'; clothFlt.frequency.value = 2150; clothFlt.Q.value = 1.9;
      const clothG = this.ctx.createGain();
      clothG.gain.setValueAtTime(0.001, t + 0.18);
      clothG.gain.linearRampToValueAtTime(0.055, t + 0.42);
      clothG.gain.exponentialRampToValueAtTime(0.001, t + 0.92);
      clothSrc.connect(clothFlt); clothFlt.connect(clothG);
      this._connectOut(clothG, 0.3);
    }
  }

  // Heavy wardrobe slam
  playWardrobeSlam() {
    this.init();
    this._playAsset('doorClose', { volume: 0.95, rate: 1.35 }, () => this._synthDoorCreakFallback(true));
    this._playAsset('terrorSweep', { volume: 0.55, maxDurationMs: 1400 }, () => this._synthSweepFallback(0.42));
    this.playDoorSlam();
  }

  // 3. PICTURE FRAME FALL & GLASS SHATTER
  playPortraitFall() {
    this.init();
    this._playAsset('glassHit', { volume: 0.95, maxDurationMs: 2200 }, () => this._synthGlassFallback(true));
    setTimeout(() => {
      this._playAsset('glassDebris', { volume: 0.72, rate: 1.15, maxDurationMs: 1600 }, () => this._synthGlassFallback(false));
    }, 180);
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const thump = this.ctx.createOscillator();
      const thG = this.ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(98, t);
      thump.frequency.exponentialRampToValueAtTime(24, t + 0.26);
      thG.gain.setValueAtTime(0.6, t);
      thG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      thump.connect(thG); this._connectOut(thG, 0.55);
      thump.start(t); thump.stop(t + 0.3);
    }
  }

  // 4A. WOOD-GRAIN CLAW SCRATCHING
  playWoodScratch(strokes = 5) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    let cursor = 0;

    for (let i = 0; i < strokes; i++) {
      const st = t + cursor;
      const dur = 0.16 + Math.random() * 0.09;
      cursor += dur + 0.05 + Math.random() * 0.08;

      const src = this._noise(this.whiteBuf, st, dur);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      const fStart = 1800 + Math.random() * 550;
      bp.frequency.setValueAtTime(fStart, st);
      bp.frequency.linearRampToValueAtTime(fStart + 950, st + dur * 0.65);
      bp.frequency.linearRampToValueAtTime(fStart - 250, st + dur);
      bp.Q.value = 4.6;

      const woodRes = this.ctx.createBiquadFilter();
      woodRes.type = 'bandpass'; woodRes.frequency.value = 420 + Math.random() * 140; woodRes.Q.value = 5.5;

      const grainLfo = this.ctx.createOscillator();
      const grainG = this.ctx.createGain();
      grainLfo.frequency.value = 58 + Math.random() * 28;
      grainG.gain.value = 0.16;

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.001, st);
      env.gain.linearRampToValueAtTime(0.42, st + 0.025);
      env.gain.setValueAtTime(0.32, st + dur * 0.7);
      env.gain.exponentialRampToValueAtTime(0.001, st + dur);
      grainLfo.connect(grainG); grainG.connect(env.gain);

      src.connect(bp); src.connect(woodRes);
      bp.connect(env); woodRes.connect(env);
      this._connectOut(env, 0.45);
      grainLfo.start(st); grainLfo.stop(st + dur + 0.02);
    }
  }

  // 4B. RED FOX CRY AT NIGHT
  playFoxCry(distant = true) {
    this.init();
    this._playAsset(
      'foxCry',
      { volume: distant ? 0.52 : 0.85, startSec: 1.0, maxDurationMs: 4200 },
      () => this._synthFoxFallback(distant)
    );
  }

  // 5. SUBTLE FLOORBOARD CREAK
  playFloorCreak() {
    this.init();
    this._playAsset(
      'doorClose',
      { volume: 0.28, rate: 1.45, maxDurationMs: 420 },
      () => this._synthFloorCreakFallback()
    );
  }

  // 6. HEAVY WOOD KNOCKS
  playThreeKnocks() {
    this.init();
    this._playAsset('doorKnock', { volume: 0.95, rate: 0.85 }, () => this._synthKnocksFallback());
  }

  // 7. PSYCHOLOGICAL TENSION STING
  playScareChord() {
    this.init();
    this._playAsset('terrorSweep', { volume: 0.72, maxDurationMs: 2400 }, () => this._synthSweepFallback(0.55));
    if (this.ctx && !this.muted) {
      const t = this.ctx.currentTime;
      const sub = this.ctx.createOscillator(), sg = this.ctx.createGain();
      sub.type = 'sine'; sub.frequency.setValueAtTime(88, t); sub.frequency.exponentialRampToValueAtTime(22, t + 0.8);
      sg.gain.setValueAtTime(0.7, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      sub.connect(sg); this._connectOut(sg, 0.55); sub.start(t); sub.stop(t + 0.9);
    }
  }

  // 8. SUBTLE LOW-PRESSURE ROOM SIGH
  playHeavyBreath(vol = 0.5) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 0.9);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 180;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(Math.min(0.16, vol * 0.22), t + 0.28);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    src.connect(lp); lp.connect(g); this._connectOut(g, 0.5);
  }

  playLoopReset() {
    this.init();
    this._playAsset('horrorSweep', { volume: 0.85, maxDurationMs: 2800 }, () => this._synthSweepFallback(0.65));
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(160, t); osc.frequency.exponentialRampToValueAtTime(26, t + 1.1);
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
    osc.connect(g); this._connectOut(g, 0.5); osc.start(t); osc.stop(t + 1.2);
  }

  playPhoneRing() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.45].forEach((off) => {
      const osc1 = this.ctx.createOscillator(), osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc1.type = 'sine'; osc1.frequency.value = 780;
      osc2.type = 'sine'; osc2.frequency.value = 812;
      g.gain.setValueAtTime(0.001, t + off);
      g.gain.linearRampToValueAtTime(0.11, t + off + 0.03);
      g.gain.setValueAtTime(0.11, t + off + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.36);
      osc1.connect(g); osc2.connect(g); this._connectOut(g, 0.45);
      osc1.start(t + off); osc2.start(t + off);
      osc1.stop(t + off + 0.38); osc2.stop(t + off + 0.38);
    });
  }

  playClockTick() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(1050, t);
    g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.025);
    osc.connect(g); g.connect(this.masterGain); osc.start(t); osc.stop(t + 0.03);
  }

  playHeartbeat(vol) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.15].forEach((off, idx) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 64 : 48, t + off);
      osc.frequency.exponentialRampToValueAtTime(22, t + off + 0.15);
      g.gain.setValueAtTime(0.001, t + off);
      g.gain.linearRampToValueAtTime(vol * (idx === 0 ? 1 : 0.72), t + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.2);
      osc.connect(g); g.connect(this.masterGain); osc.start(t + off); osc.stop(t + off + 0.22);
    });
  }

  playBreakerSnap() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(280, t); osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); this._connectOut(g, 0.35); osc.start(t); osc.stop(t + 0.1);
  }

  playDoorSlam() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(98, t); osc.frequency.exponentialRampToValueAtTime(20, t + 0.36);
    g.gain.setValueAtTime(0.62, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g); this._connectOut(g, 0.65); osc.start(t); osc.stop(t + 0.42);
  }

  playGlassCrack() {
    this.init();
    this._playAsset('glassHit', { volume: 0.9, maxDurationMs: 1800 }, () => this._synthGlassFallback(true));
  }

  playScratchBurst() {
    this.playWoodScratch(5);
  }

  playMatchStrike() {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.whiteBuf, t, 0.26);
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    src.connect(hp); hp.connect(g); this._connectOut(g, 0.2);
  }

  playMemoryChime(warm = false) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const notes = warm ? [261.63, 329.63, 392.0, 523.25] : [293.66, 349.23, 440.0, 523.25];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.001, t + i * 0.16); g.gain.linearRampToValueAtTime(0.1, t + i * 0.16 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + 2.4);
      osc.connect(g); this._connectOut(g, 0.55); osc.start(t + i * 0.16); osc.stop(t + i * 0.16 + 2.5);
    });
  }

  playFootstep(vol = 0.28, heavy = false) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(heavy ? 75 : (115 + Math.random() * 25), t);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 24 : 36, t + (heavy ? 0.16 : 0.1));
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.18 : 0.11));
    osc.connect(g); this._connectOut(g, heavy ? 0.5 : 0.28); osc.start(t); osc.stop(t + (heavy ? 0.19 : 0.12));

    const src = this._noise(this.brownBuf, t, 0.065);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = heavy ? 420 : (750 + Math.random() * 200); bp.Q.value = 1.6;
    const ng = this.ctx.createGain(); ng.gain.setValueAtTime(vol * 0.85, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
    src.connect(bp); bp.connect(ng); this._connectOut(ng, 0.25);

    if (!heavy && Math.random() < 0.18) {
      setTimeout(() => this.playFloorCreak(), 40);
    }
  }

  // 9. DISTANT DOG BARKS IN THE ALLEY
  playDogBark(distant = true) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const offsets = [0, 0.34, 0.78];
    offsets.forEach((off, idx) => {
      const st = t + off;
      const dur = idx === 2 ? 0.24 : 0.17;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      const baseF = 165 + (idx === 1 ? 25 : 0);
      osc.frequency.setValueAtTime(baseF * 1.45, st);
      osc.frequency.exponentialRampToValueAtTime(baseF * 0.72, st + dur);
      osc2.frequency.setValueAtTime(baseF * 2.1, st);
      osc2.frequency.exponentialRampToValueAtTime(baseF * 0.95, st + dur);

      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(distant ? 540 : 720, st);
      bp.frequency.exponentialRampToValueAtTime(320, st + dur);
      bp.Q.value = 2.6;

      const peak = distant ? 0.22 : 0.36;
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(peak, st + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur);

      osc.connect(bp); osc2.connect(bp);
      bp.connect(g);
      this._connectOut(g, 0.75);
      osc.start(st); osc2.start(st);
      osc.stop(st + dur + 0.03); osc2.stop(st + dur + 0.03);

      const nSrc = this._noise(this.brownBuf, st, dur);
      const nBp = this.ctx.createBiquadFilter();
      nBp.type = 'bandpass'; nBp.frequency.value = 620; nBp.Q.value = 1.8;
      const nG = this.ctx.createGain();
      nG.gain.setValueAtTime(0.001, st);
      nG.gain.linearRampToValueAtTime(peak * 0.7, st + 0.02);
      nG.gain.exponentialRampToValueAtTime(0.001, st + dur);
      nSrc.connect(nBp); nBp.connect(nG); this._connectOut(nG, 0.65);
    });
  }

  // 10. SOFT RAIN & GENTLE LOOPING ENDING MUSIC
  playSoftRain() {
    this.init();
    if (!this.ctx || this.muted) return;
    if (this.rainSrc) return;
    const t0 = this.ctx.currentTime;
    this.ambienceMutedBySequence = true;
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.0001, t0, 0.7);
    if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0001, t0, 0.5);
    if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.0001, t0, 0.7);
    if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0001, t0, 0.7);

    const src = this.ctx.createBufferSource();
    src.buffer = this.whiteBuf;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 0.65;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2400;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.055, t0 + 1.6);
    src.connect(bp); bp.connect(lp); lp.connect(g);
    this._connectOut(g, 0.45);
    src.start(t0);
    this.rainSrc = src;
    this.rainGain = g;
  }

  stopSoftRain() {
    if (this.rainGain && this.ctx) {
      const t = this.ctx.currentTime;
      try {
        this.rainGain.gain.cancelScheduledValues(t);
        this.rainGain.gain.setTargetAtTime(0.0001, t, 0.35);
      } catch (_) {}
    }
    if (this.rainSrc) {
      const oldSrc = this.rainSrc;
      this.rainSrc = null;
      this.rainGain = null;
      setTimeout(() => { try { oldSrc.stop(); } catch (_) {} }, 900);
    }
  }

  stopEndingMelody() {
    this.stopSoftRain();
    this.endingPlaying = false;
    if (this.endingLoopTimer) {
      clearTimeout(this.endingLoopTimer);
      this.endingLoopTimer = null;
    }
    if (this.endingBus && this.ctx) {
      const t = this.ctx.currentTime;
      try {
        this.endingBus.gain.cancelScheduledValues(t);
        this.endingBus.gain.setTargetAtTime(0.0001, t, 0.25);
      } catch (_) {}
    }
    this._ensureAmbiencePlaying();
  }

  playEndingMelody() {
    this.init();
    if (!this.ctx) return;
    if (this.endingPlaying) return;
    this.endingPlaying = true;
    this.ambienceMutedBySequence = true;

    const tStart = this.ctx.currentTime;
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.0001, tStart, 0.8);
    if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0001, tStart, 0.6);
    if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.0001, tStart, 0.8);
    if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0001, tStart, 0.8);

    if (!this.endingBus) {
      this.endingBus = this.ctx.createGain();
      this.endingBus.gain.value = 1.0;
      this._connectOut(this.endingBus, 0.82);
    } else {
      this.endingBus.gain.cancelScheduledValues(tStart);
      this.endingBus.gain.setValueAtTime(0.001, tStart);
      this.endingBus.gain.linearRampToValueAtTime(1.0, tStart + 0.8);
    }

    const schedulePhrase = () => {
      if (!this.endingPlaying || !this.ctx) return;
      const t0 = this.ctx.currentTime + 0.06;

      const piano = (freq, off, dur = 4.6, vol = 0.085) => {
        const st = t0 + off;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        o1.type = 'sine'; o1.frequency.value = freq;
        o2.type = 'triangle'; o2.frequency.value = freq * 2;
        g2.gain.value = 0.11;
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1250, st);
        lp.frequency.exponentialRampToValueAtTime(480, st + dur);

        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(vol, st + 0.055);
        g.gain.exponentialRampToValueAtTime(vol * 0.45, st + 0.9);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);

        o1.connect(lp); o2.connect(g2); g2.connect(lp);
        lp.connect(g); g.connect(this.endingBus);
        o1.start(st); o2.start(st);
        o1.stop(st + dur + 0.08); o2.stop(st + dur + 0.08);
      };

      const cello = (freq, off, dur = 4.4, vol = 0.062) => {
        const st = t0 + off;
        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const subG = this.ctx.createGain();
        const vib = this.ctx.createOscillator();
        const vibG = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth'; osc.frequency.value = freq;
        sub.type = 'sine'; sub.frequency.value = freq * 0.5;
        subG.gain.value = 0.28;

        vib.type = 'sine'; vib.frequency.value = 5.1;
        vibG.gain.setValueAtTime(0.0, st);
        vibG.gain.linearRampToValueAtTime(freq * 0.0065, st + Math.min(1.4, dur * 0.45));
        vib.connect(vibG); vibG.connect(osc.frequency);

        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(620, st);
        lp.frequency.linearRampToValueAtTime(980, st + dur * 0.42);
        lp.frequency.linearRampToValueAtTime(520, st + dur);
        lp.Q.value = 1.4;

        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(vol, st + Math.min(1.15, dur * 0.35));
        g.gain.setValueAtTime(vol * 0.88, st + dur * 0.72);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);

        osc.connect(lp); sub.connect(subG); subG.connect(lp);
        lp.connect(g); g.connect(this.endingBus);
        osc.start(st); sub.start(st); vib.start(st);
        osc.stop(st + dur + 0.08); sub.stop(st + dur + 0.08); vib.stop(st + dur + 0.08);
      };

      const pad = (freqs, off, dur = 6.2, vol = 0.024) => {
        const st = t0 + off;
        freqs.forEach((f) => {
          const o = this.ctx.createOscillator();
          const lp = this.ctx.createBiquadFilter();
          const g = this.ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          lp.type = 'lowpass'; lp.frequency.value = 720;
          g.gain.setValueAtTime(0.0001, st);
          g.gain.linearRampToValueAtTime(vol, st + 1.5);
          g.gain.setValueAtTime(vol * 0.85, st + dur - 1.6);
          g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
          o.connect(lp); lp.connect(g); g.connect(this.endingBus);
          o.start(st); o.stop(st + dur + 0.1);
        });
      };

      // Bar 1: Dm9 (0.0s - 6.0s)
      pad([73.42, 146.83, 220.00, 261.63], 0.0, 6.2, 0.024);
      piano(146.83, 0.00, 5.2, 0.082);
      piano(220.00, 0.85, 4.4, 0.072);
      piano(293.66, 1.70, 4.4, 0.078);
      piano(329.63, 2.55, 4.6, 0.088);
      piano(349.23, 3.55, 4.2, 0.082);
      piano(329.63, 4.65, 3.6, 0.070);
      cello(329.63, 1.60, 4.2, 0.056);

      // Bar 2: Bbmaj7 (6.0s - 12.0s)
      pad([116.54, 174.61, 220.00, 293.66], 6.0, 6.2, 0.024);
      piano(116.54, 6.00, 5.2, 0.082);
      piano(174.61, 6.85, 4.4, 0.072);
      piano(293.66, 7.70, 4.4, 0.078);
      piano(440.00, 8.60, 4.8, 0.090);
      piano(392.00, 9.75, 4.0, 0.078);
      piano(349.23, 10.80, 3.8, 0.072);
      cello(440.00, 7.20, 4.6, 0.062);

      // Bar 3: Gm9 (12.0s - 18.0s)
      pad([98.00, 146.83, 233.08, 293.66], 12.0, 6.2, 0.024);
      piano(98.00,  12.00, 5.2, 0.082);
      piano(196.00, 12.85, 4.4, 0.072);
      piano(233.08, 13.70, 4.4, 0.076);
      piano(349.23, 14.55, 4.6, 0.086);
      piano(329.63, 15.65, 4.2, 0.080);
      piano(293.66, 16.75, 4.0, 0.074);
      cello(349.23, 13.10, 2.7, 0.056);
      cello(329.63, 15.55, 2.8, 0.054);

      // Bar 4: Asus4 -> A7 -> gentle return to Dm9 (18.0s - 25.0s)
      pad([110.00, 164.81, 220.00, 293.66], 18.0, 6.8, 0.025);
      piano(110.00, 18.00, 5.6, 0.084);
      piano(164.81, 18.90, 4.6, 0.072);
      piano(293.66, 19.80, 4.6, 0.084);
      piano(277.18, 21.15, 4.8, 0.080);
      piano(220.00, 22.55, 4.4, 0.072);
      piano(261.63, 23.80, 3.8, 0.068);
      cello(293.66, 18.80, 3.2, 0.056);
      cello(277.18, 21.60, 3.4, 0.050);

      this.endingLoopTimer = setTimeout(schedulePhrase, 24800);
    };

    schedulePhrase();
  }

  // Water drip & faucet toggle SFX for Kitchen / Bathroom
  playWaterDrip() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920 + Math.random() * 180, t);
    osc.frequency.exponentialRampToValueAtTime(1680 + Math.random() * 240, t + 0.055);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g);
    this._connectOut(g, 0.55);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playFaucetToggle(turningOff = true) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(turningOff ? 520 : 340, t);
    osc.frequency.exponentialRampToValueAtTime(turningOff ? 260 : 620, t + 0.14);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(g);
    this._connectOut(g, 0.35);
    osc.start(t);
    osc.stop(t + 0.17);

    const dur = turningOff ? 0.25 : 0.75;
    const src = this._noise(this.whiteBuf, t + 0.04, dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1850;
    bp.Q.value = 1.4;
    const wg = this.ctx.createGain();
    wg.gain.setValueAtTime(turningOff ? 0.14 : 0.001, t + 0.04);
    if (!turningOff) wg.gain.linearRampToValueAtTime(0.16, t + 0.22);
    wg.gain.exponentialRampToValueAtTime(0.001, t + 0.04 + dur);
    src.connect(bp);
    bp.connect(wg);
    this._connectOut(wg, 0.45);
  }

  // Khoảng lặng chết (Dead Silence) trước biến cố lớn
  triggerDeadSilence(durationMs = 1700) {
    this.deadSilenceUntil = Math.max(this.deadSilenceUntil, performance.now() + durationMs);
    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.001, t, 0.05);
      if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.0005, t, 0.05);
      if (this.bgAmbienceGain) this.bgAmbienceGain.gain.setTargetAtTime(0.001, t, 0.05);
      if (this.bgWindGain) this.bgWindGain.gain.setTargetAtTime(0.0005, t, 0.05);
    }
  }

  _connectPanned(node, pan = 0, wetAmount = 0.38) {
    const clampedPan = Math.max(-0.95, Math.min(0.95, pan));
    if (this.ctx && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = clampedPan;
      node.connect(panner);
      this._connectOut(panner, wetAmount);
    } else {
      this._connectOut(node, wetAmount);
    }
  }

  playSpatialWhisper(pan = 0.8) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const dur = 1.15;
    const src = this._noise(this.whiteBuf, t, dur);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1650, t);
    bp.frequency.exponentialRampToValueAtTime(920, t + 0.55);
    bp.frequency.exponentialRampToValueAtTime(2150, t + dur);
    bp.Q.value = 5.2;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.24, t + 0.18);
    g.gain.setValueAtTime(0.16, t + 0.65);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g);
    this._connectPanned(g, pan, 0.5);
  }

  playMatchBlowOut(pan = -0.65) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 0.65);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(780, t);
    bp.frequency.exponentialRampToValueAtTime(240, t + 0.6);
    bp.Q.value = 1.8;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.46, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
    src.connect(bp); bp.connect(g);
    this._connectPanned(g, pan, 0.32);

    const fizz = this._noise(this.whiteBuf, t + 0.09, 0.24);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3200;
    const fg = this.ctx.createGain();
    fg.gain.setValueAtTime(0.14, t + 0.09);
    fg.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    fizz.connect(hp); hp.connect(fg);
    this._connectPanned(fg, pan * 0.5, 0.18);
  }

  playSpatialKnock(pan = 0) {
    this.init();
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.34, 0.72].forEach((off) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 18, t + off);
      osc.frequency.exponentialRampToValueAtTime(34, t + off + 0.14);
      g.gain.setValueAtTime(0.44, t + off);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.17);
      osc.connect(g);
      this._connectPanned(g, pan, 0.52);
      osc.start(t + off);
      osc.stop(t + off + 0.19);
    });
  }

  // --- PROCEDURAL WEB AUDIO FALLBACKS (ZERO EXTERNAL DEPENDENCY) ---
  _synthDoorCreakFallback(isClosing) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isClosing ? 920 : 680, t);
    osc.frequency.exponentialRampToValueAtTime(isClosing ? 620 : 1180, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.72);
    f.type = 'bandpass'; f.frequency.value = 1650; f.Q.value = 12;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.45);
    osc.start(t); osc.stop(t + 0.8);
  }

  _synthFloorCreakFallback() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520 + Math.random() * 160, t);
    osc.frequency.exponentialRampToValueAtTime(310, t + 0.24);
    f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 9;
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.3);
    osc.start(t); osc.stop(t + 0.28);
  }

  _synthGlassFallback(heavy = true) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const shards = heavy ? 6 : 4;
    for (let i = 0; i < shards; i++) {
      const st = t + i * (heavy ? 0.025 : 0.055) + Math.random() * 0.02;
      const dur = 0.09 + Math.random() * 0.14;
      const src = this._noise(this.whiteBuf, st, dur);
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 2800 + Math.random() * 3400;
      hp.Q.value = 6.5;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(heavy ? 0.26 : 0.14, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur);
      src.connect(hp); hp.connect(g);
      this._connectOut(g, 0.45);
    }
  }

  _synthSweepFallback(vol = 0.5) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this._noise(this.brownBuf, t, 1.45);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(140, t);
    bp.frequency.exponentialRampToValueAtTime(1280, t + 0.55);
    bp.frequency.exponentialRampToValueAtTime(95, t + 1.4);
    bp.Q.value = 2.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol * 0.42, t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.42);
    src.connect(bp); bp.connect(g);
    this._connectOut(g, 0.65);
  }

  _synthFoxFallback(distant) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1220, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.7);
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 4;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(distant ? 0.2 : 0.32, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.72);
    osc.connect(f); f.connect(g); this._connectOut(g, 0.6);
    osc.start(t); osc.stop(t + 0.75);
  }

  _synthKnocksFallback() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    [0, 0.4, 0.84].forEach((off) => {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135, t + off); osc.frequency.exponentialRampToValueAtTime(34, t + off + 0.14);
      g.gain.setValueAtTime(0.45, t + off); g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.18);
      osc.connect(g); this._connectOut(g, 0.55); osc.start(t + off); osc.stop(t + off + 0.2);
    });
  }
}
