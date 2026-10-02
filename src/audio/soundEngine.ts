import { SfxPatch } from '../types/engine';

export type SfxPatchKey =
  | 'jump'
  | 'spindash'
  | 'spindashRelease'
  | 'ring'
  | 'ringLoss'
  | 'spring'
  | 'pop'
  | 'lavaBurn'
  | 'bossHit'
  | 'superTransform';

export const DEFAULT_SFX_PATCHES: Record<SfxPatchKey, SfxPatch> = {
  jump: {
    name: 'Jump Whoosh',
    category: 'character',
    wave: 'square',
    baseFreq: 185,
    endFreq: 640,
    durationMs: 175,
    attackMs: 8,
    pitchCurve: 'exponential',
    fmDepth: 18,
    fmRate: 14,
    noiseMix: 0.0,
    volume: 0.16,
  },
  spindash: {
    name: 'Spin Dash Rev',
    category: 'character',
    wave: 'sawtooth',
    baseFreq: 240,
    endFreq: 760,
    durationMs: 120,
    attackMs: 5,
    pitchCurve: 'linear',
    fmDepth: 65,
    fmRate: 28,
    noiseMix: 0.08,
    volume: 0.16,
  },
  spindashRelease: {
    name: 'Spin Dash Zoom',
    category: 'character',
    wave: 'sawtooth',
    baseFreq: 680,
    endFreq: 110,
    durationMs: 230,
    attackMs: 6,
    pitchCurve: 'exponential',
    fmDepth: 110,
    fmRate: 36,
    noiseMix: 0.18,
    volume: 0.2,
  },
  ring: {
    name: 'Golden Ring Chime',
    category: 'world',
    wave: 'square',
    baseFreq: 987.77, // B5
    endFreq: 1318.51, // E6
    durationMs: 240,
    attackMs: 4,
    pitchCurve: 'arp_step',
    fmDepth: 12,
    fmRate: 8,
    noiseMix: 0.0,
    volume: 0.15,
  },
  ringLoss: {
    name: 'Ring Scatter Cascade',
    category: 'world',
    wave: 'square',
    baseFreq: 1174.66,
    endFreq: 440,
    durationMs: 360,
    attackMs: 5,
    pitchCurve: 'vibrato',
    fmDepth: 45,
    fmRate: 22,
    noiseMix: 0.04,
    volume: 0.15,
  },
  spring: {
    name: 'Spring Boing',
    category: 'world',
    wave: 'triangle',
    baseFreq: 210,
    endFreq: 920,
    durationMs: 270,
    attackMs: 6,
    pitchCurve: 'vibrato',
    fmDepth: 85,
    fmRate: 24,
    noiseMix: 0.0,
    volume: 0.22,
  },
  pop: {
    name: 'Badnik / Monitor Pop',
    category: 'combat',
    wave: 'sawtooth',
    baseFreq: 340,
    endFreq: 55,
    durationMs: 190,
    attackMs: 4,
    pitchCurve: 'exponential',
    fmDepth: 140,
    fmRate: 42,
    noiseMix: 0.45,
    volume: 0.22,
  },
  lavaBurn: {
    name: 'Marble Lava Sizzle',
    category: 'world',
    wave: 'sawtooth',
    baseFreq: 420,
    endFreq: 95,
    durationMs: 260,
    attackMs: 5,
    pitchCurve: 'vibrato',
    fmDepth: 180,
    fmRate: 55,
    noiseMix: 0.65,
    volume: 0.22,
  },
  bossHit: {
    name: 'Eggman Armor Clang',
    category: 'combat',
    wave: 'square',
    baseFreq: 520,
    endFreq: 85,
    durationMs: 220,
    attackMs: 3,
    pitchCurve: 'exponential',
    fmDepth: 220,
    fmRate: 64,
    noiseMix: 0.52,
    volume: 0.25,
  },
  superTransform: {
    name: 'Super Chaos Flash',
    category: 'character',
    wave: 'sawtooth',
    baseFreq: 330,
    endFreq: 1320,
    durationMs: 480,
    attackMs: 12,
    pitchCurve: 'arp_step',
    fmDepth: 95,
    fmRate: 32,
    noiseMix: 0.12,
    volume: 0.24,
  },
};

const AUDIO_STORAGE_KEYS = {
  SFX_PATCHES: 'sonic_velocity_sfx_patches_v11',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted: boolean = false;
  private ringPanLeft: boolean = true;

  private patches: Record<SfxPatchKey, SfxPatch> = (() => {
    try {
      const saved = localStorage.getItem(AUDIO_STORAGE_KEYS.SFX_PATCHES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...JSON.parse(JSON.stringify(DEFAULT_SFX_PATCHES)),
            ...parsed,
          };
        }
      }
    } catch {
      // Fallback to defaults
    }
    return JSON.parse(JSON.stringify(DEFAULT_SFX_PATCHES));
  })();

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.9;

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.75;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // Pre-build 1-second white noise buffer for 16-bit PSG percussion & explosions
        const sampleRate = this.ctx.sampleRate;
        this.noiseBuffer = this.ctx.createBuffer(1, sampleRate, sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < sampleRate; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private getDestination(): AudioNode | null {
    const ctx = this.getContext();
    if (!ctx) return null;
    return this.masterGain || ctx.destination;
  }

  public getAnalyser(): AnalyserNode | null {
    this.getContext();
    return this.analyser;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private savePatchesToStorage() {
    try {
      localStorage.setItem(
        AUDIO_STORAGE_KEYS.SFX_PATCHES,
        JSON.stringify(this.patches)
      );
    } catch {
      // Ignore quota errors
    }
  }

  public getPatches(): Record<SfxPatchKey, SfxPatch> {
    return this.patches;
  }

  public setAllPatches(next: Record<SfxPatchKey, SfxPatch>) {
    this.patches = {
      ...JSON.parse(JSON.stringify(DEFAULT_SFX_PATCHES)),
      ...JSON.parse(JSON.stringify(next)),
    };
    this.savePatchesToStorage();
  }

  public updatePatch(key: SfxPatchKey, patch: SfxPatch) {
    this.patches[key] = { ...patch };
    this.savePatchesToStorage();
  }

  public resetPatches() {
    this.patches = JSON.parse(JSON.stringify(DEFAULT_SFX_PATCHES));
    this.savePatchesToStorage();
  }

  public playPatch(key: SfxPatchKey, pitchMultiplier: number = 1.0) {
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const p = this.patches[key];
    const now = ctx.currentTime;
    const dur = Math.max(0.04, p.durationMs / 1000);
    const atk = Math.min(dur * 0.5, Math.max(0.002, p.attackMs / 1000));

    const startF = Math.max(24, p.baseFreq * pitchMultiplier);
    const endF = Math.max(24, p.endFreq * pitchMultiplier);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = p.wave;

    // Apply Pitch Curve
    osc.frequency.setValueAtTime(startF, now);
    if (p.pitchCurve === 'linear') {
      osc.frequency.linearRampToValueAtTime(endF, now + dur);
    } else if (p.pitchCurve === 'exponential') {
      osc.frequency.exponentialRampToValueAtTime(endF, now + dur);
    } else if (p.pitchCurve === 'arp_step') {
      const midF = (startF + endF) * 0.5;
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.setValueAtTime(midF, now + dur * 0.33);
      osc.frequency.setValueAtTime(endF, now + dur * 0.66);
    } else if (p.pitchCurve === 'vibrato') {
      const steps = 8;
      for (let i = 1; i <= steps; i++) {
        const t = (i / steps) * dur;
        const base = startF + (endF - startF) * (i / steps);
        const vib = i % 2 === 0 ? 1.12 : 0.89;
        osc.frequency.linearRampToValueAtTime(Math.max(24, base * vib), now + t);
      }
    }

    // Apply FM Operator Modulation if fmDepth > 0
    if (p.fmDepth > 0) {
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();
      modOsc.type = 'sine';
      modOsc.frequency.setValueAtTime(Math.max(1, p.fmRate), now);
      modGain.gain.setValueAtTime(p.fmDepth, now);
      modOsc.connect(modGain);
      modGain.connect(osc.frequency);
      modOsc.start(now);
      modOsc.stop(now + dur + 0.01);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.volume, now + atk);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur + 0.01);

    // Optional White-Noise Layer for Explosions, Lava Sizzle & Pops
    if (p.noiseMix > 0.02 && this.noiseBuffer) {
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = this.noiseBuffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(p.volume * p.noiseMix, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      nSrc.connect(nGain);
      nGain.connect(dest);
      nSrc.start(now);
      nSrc.stop(now + dur + 0.01);
    }
  }

  public playJump() {
    this.playPatch('jump');
  }

  public playSpinDashRev(revLevel: number = 1) {
    const mult = 1 + Math.min(revLevel, 8) * 0.09;
    this.playPatch('spindash', mult);
  }

  public playSpinDashRelease() {
    this.playPatch('spindashRelease');
  }

  public playRing() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.ringPanLeft = !this.ringPanLeft;
    this.playPatch('ring');
  }

  public playRingLoss() {
    this.playPatch('ringLoss');
  }

  public playSpring(highPower: boolean = false) {
    this.playPatch('spring', highPower ? 1.22 : 1.0);
  }

  public playPop() {
    this.playPatch('pop');
  }

  public playLavaBurn() {
    this.playPatch('lavaBurn');
  }

  public playBossHit() {
    this.playPatch('bossHit');
  }

  public playSuperTransform() {
    this.playPatch('superTransform');
  }

  private playTone(
    freq: number,
    wave: OscillatorType = 'square',
    durationMs: number = 140,
    volume: number = 0.14
  ) {
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.03, durationMs / 1000);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  public playShieldGet() {
    const ctx = this.getContext();
    if (!ctx) return;
    [392.0, 493.88, 587.33, 783.99].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 110, 0.14);
      }, i * 45);
    });
  }

  public playCheckpoint() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 110, 0.13);
      }, i * 50);
    });
  }

  public playGoalPost() {
    [523.25, 587.33, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 160, 0.15);
      }, i * 65);
    });
  }
}

export const soundFX = new SoundEngine();
