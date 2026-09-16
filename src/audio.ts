/**
 * Web Audio API Sound and Music Engine for Memory Rush
 * Generates all sound effects and ambient procedural synth music without external assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private currentChordIndex = 0;
  private isUnlocked = false;

  constructor() {
    this.setupUnlockListeners();
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.isUnlocked) return;
      this.initContext();
      this.isUnlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Generic tone generator with envelope
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainLevel = 0.15,
    detune = 0,
    pitchEnd?: number
  ) {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);

      if (pitchEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, pitchEnd), ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext handling error fallback
    }
  }

  playButtonClick() {
    const ctx = this.initContext();
    if (!ctx) return;
    this.playTone(800, 'sine', 0.05, 0.08, 0, 400);
  }

  playCardFlip() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Snappy tactile card swoosh / pop
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playMatchSuccess() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Harmonic bell chime: C6 -> E6 -> G6 sparkle
    const notes = [1046.5, 1318.51, 1567.98];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.35);
        } catch {}
      }, index * 60);
    });
  }

  playWrongMatch() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Muted low double thud
    try {
      this.playTone(180, 'sawtooth', 0.12, 0.09, 0, 90);
      setTimeout(() => {
        this.playTone(140, 'sawtooth', 0.15, 0.08, 0, 70);
      }, 100);
    } catch {}
  }

  playCombo(comboMultiplier: number) {
    const ctx = this.initContext();
    if (!ctx) return;

    // Base pitch goes up with combo multiplier
    const baseFreq = Math.min(1800, 523.25 * Math.pow(1.12, comboMultiplier));
    
    try {
      // Shimmering accent
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  playPowerUp() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Sparkling synth arpeggio glide
    const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.18, 0.1, 0);
      }, idx * 40);
    });
  }

  playFreeze() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Crystalline icy shimmer
    try {
      [800, 1200, 1600, 2400].forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.3, 0.08);
        }, i * 50);
      });
    } catch {}
  }

  playShuffle() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Rapid card flutter
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playCardFlip();
      }, i * 45);
    }
  }

  playLevelComplete() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Triumphant victory fanfare (Major Triad up)
    const melody = [
      { freq: 523.25, time: 0, dur: 0.18 },
      { freq: 659.25, time: 140, dur: 0.18 },
      { freq: 783.99, time: 280, dur: 0.2 },
      { freq: 1046.5, time: 420, dur: 0.5 },
    ];

    melody.forEach((item) => {
      setTimeout(() => {
        if (!this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(item.freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + item.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + item.dur);
        } catch {}
      }, item.time);
    });
  }

  playGameOver() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Gentle descending minor cadence
    const melody = [
      { freq: 440, time: 0, dur: 0.25 },
      { freq: 392, time: 220, dur: 0.25 },
      { freq: 349.23, time: 440, dur: 0.3 },
      { freq: 293.66, time: 680, dur: 0.6 },
    ];

    melody.forEach((item) => {
      setTimeout(() => {
        if (!this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(item.freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + item.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + item.dur);
        } catch {}
      }, item.time);
    });
  }

  // Procedural ambient background music synth
  startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.musicGainNode = ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(0.045, ctx.currentTime);
    this.musicGainNode.connect(ctx.destination);

    // Warm, lush synth chords in C minor / Eb major: (Cm7, Abmaj7, Ebmaj7, Bb)
    const chords = [
      [261.63, 311.13, 392.00, 466.16], // Cm7
      [207.65, 261.63, 311.13, 392.00], // Abmaj7
      [311.13, 392.00, 466.16, 587.33], // Ebmaj7
      [233.08, 293.66, 349.23, 466.16], // Bb
    ];

    const playChordStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

      const chord = chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      chord.forEach((freq) => {
        try {
          const osc = this.ctx!.createOscillator();
          const filter = this.ctx!.createBiquadFilter();
          const noteGain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.ctx!.currentTime);

          // Soft slow attack and decay
          noteGain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.035, this.ctx!.currentTime + 0.8);
          noteGain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 3.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.musicGainNode!);

          osc.start();
          osc.stop(this.ctx!.currentTime + 3.9);
        } catch {}
      });
    };

    playChordStep();
    this.musicInterval = window.setInterval(playChordStep, 4000);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGainNode && this.ctx) {
      try {
        this.musicGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {}
      this.musicGainNode = null;
    }
  }

  toggleMusic(enabled: boolean) {
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }
}

export const soundManager = new SoundEngine();
