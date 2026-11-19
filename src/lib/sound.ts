type MusicRoom = 'home' | 'history' | 'words' | 'game' | 'future';

type SfxName = 'click' | 'open' | 'jump' | 'collect' | 'hurt' | 'check' | 'win' | 'secret';

/** Short UI/game sound effects only. Background synthesized music has been removed. */
class SoundBus {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private sfxOn = false;

  // Kept for compatibility with existing navigation and music controls.
  setRoom(_room: MusicRoom) {}
  setMusic(_on: boolean) {}
  beginCinematic() {}
  attachVisibility(_musicEnabled: () => boolean) {}

  async unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    this.sfxGain = ctx.createGain();
    this.sfxGain.connect(master);
    this.ctx = ctx;
    return ctx;
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
  }

  play(name: SfxName) {
    if (!this.sfxOn) return;
    const ctx = this.ensure();
    if (!ctx || ctx.state !== 'running' || !this.sfxGain) return;
    const now = ctx.currentTime;
    if (name === 'collect') this.chime(now, [523.25, 659.25, 783.99], 0.09);
    else if (name === 'win') this.chime(now, [392, 523.25, 659.25, 783.99], 0.13);
    else if (name === 'secret') this.chime(now, [392, 494, 587.33, 783.99], 0.12);
    else if (name === 'jump') this.blip(now, 190, 0.06);
    else if (name === 'hurt') this.blip(now, 98, 0.14, 'triangle');
    else if (name === 'open') this.blip(now, 260, 0.18);
    else if (name === 'check') this.chime(now, [494, 659.25], 0.08);
    else this.blip(now, 620, 0.04);
  }

  private blip(time: number, freq: number, dur: number, type: OscillatorType = 'sine') {
    this.tone(time, freq, dur, type, 0.16);
  }

  private chime(time: number, freqs: number[], step: number) {
    freqs.forEach((freq, index) => this.tone(time + index * step, freq, step * 1.15, 'sine', 0.14));
  }

  private tone(time: number, freq: number, dur: number, type: OscillatorType, volume: number) {
    const ctx = this.ctx;
    const output = this.sfxGain;
    if (!ctx || !output) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    if (type !== 'sine') osc.frequency.exponentialRampToValueAtTime(Math.max(48, freq * 0.7), time + dur);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(output);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

}

export const sound = new SoundBus();
