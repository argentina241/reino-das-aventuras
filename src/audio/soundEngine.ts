/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: number = 0;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Sound will initialize on first user interaction to comply with autoplay policy
    const saved = localStorage.getItem('reino_audio_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('reino_audio_muted', String(muted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // ---- SOUND EFFECTS ----

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playBlockHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [330, 392, 494, 659, 784];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  public playShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.31);
  }

  public playCheckpoint() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.21);
    });
  }

  public playBossRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.5);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.51);
  }

  public playBossHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playStageClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.2 }, // C6
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.50, d: 0.4 }, // C6
    ];

    let delay = 0;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.02);
      delay += note.d + 0.03;
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [
      { f: 440, d: 0.18 },
      { f: 415.3, d: 0.18 },
      { f: 392, d: 0.18 },
      { f: 349.2, d: 0.45 },
    ];

    let delay = 0;
    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.02);
      delay += note.d + 0.04;
    });
  }

  // ---- PROCEDURAL BACKGROUND MUSIC ----

  public startMusic(levelId: number) {
    if (this.currentTrack === levelId && this.musicInterval !== null) {
      return;
    }
    this.stopMusic();
    this.currentTrack = levelId;
    this.musicStep = 0;

    // Track scales & rhythms based on theme
    const tempos = [180, 160, 140]; // ms per 16th beat
    const tempo = tempos[Math.min(levelId - 1, tempos.length - 1)] || 170;

    this.musicInterval = window.setInterval(() => {
      this.tickMusicStep();
    }, tempo);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private tickMusicStep() {
    if (this.isMuted || !this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const step = this.musicStep % 32;
    this.musicStep++;

    if (this.currentTrack === 1) {
      // Grassland Melody: C major pentatonic (C, D, E, G, A)
      const bassNotes = [130.81, 130.81, 164.81, 196.00]; // C3, E3, G3
      const leadNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      
      // Bass line on quarters
      if (step % 4 === 0) {
        const bassFreq = bassNotes[(step / 4) % bassNotes.length];
        this.playSynthNote(bassFreq, 'triangle', 0.16, 0.15, t);
      }

      // Arpeggio melody
      const leadPattern = [0, -1, 2, 4, 3, -1, 5, 2, 1, 2, 3, 0, 4, -1, 5, 3];
      const noteIdx = leadPattern[step % leadPattern.length];
      if (noteIdx >= 0) {
        this.playSynthNote(leadNotes[noteIdx % leadNotes.length], 'sine', 0.12, 0.10, t);
      }
    } else if (this.currentTrack === 2) {
      // Crystal Cave: E minor / Dorian crystalline ambient (E, G, A, B, D)
      const caveNotes = [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 493.88];
      
      if (step % 8 === 0) {
        // Deep pulsing drone bass
        this.playSynthNote(82.41, 'sine', 0.45, 0.22, t);
      }

      const crystalPattern = [0, -1, 3, -1, 5, -1, 7, 4, -1, 2, -1, 6, -1, 5, -1, 3];
      const p = crystalPattern[step % crystalPattern.length];
      if (p >= 0) {
        this.playSynthNote(caveNotes[p % caveNotes.length], 'sine', 0.28, 0.12, t);
      }
    } else {
      // Volcano Fortress: D minor dramatic drive (D, F, G, Ab, A, C)
      const bass = [73.42, 73.42, 87.31, 110.00]; // D2, F2, A2
      if (step % 2 === 0) {
        const b = bass[(step / 2) % bass.length];
        this.playSynthNote(b, 'sawtooth', 0.12, 0.18, t);
      }

      const dramaticNotes = [293.66, 311.13, 349.23, 392.00, 440.00, 587.33];
      if (step % 4 === 1 || step % 4 === 3) {
        const lead = dramaticNotes[(step * 3) % dramaticNotes.length];
        this.playSynthNote(lead, 'triangle', 0.15, 0.14, t);
      }
    }
  }

  private playSynthNote(freq: number, type: OscillatorType, duration: number, gainVal: number, startTime: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    } catch {
      // Ignore transient audio graph errors
    }
  }
}

export const sound = new SoundEngine();
