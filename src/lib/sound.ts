type SfxName = 'click' | 'open' | 'jump' | 'collect' | 'hurt' | 'check' | 'win' | 'secret';

/**
 * Original synthesized tones only. There is no recorded soundtrack in the project.
 */
class SoundBus {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxOn = false;
  private running = false;
  private timer = 0;
  private next = 0;
  private step = 0;
  private pad: OscillatorNode[] = [];
  private readonly melody = [0, 3, 5, 7, 10, 7, 5, 3, 5, 3];

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
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.9;
    this.musicGain.connect(master);
    this.ctx = ctx;
    return ctx;
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
  }

  setMusic(on: boolean) {
    if (!on) {
      this.stopMusic();
      return;
    }
    if (document.visibilityState === 'hidden') return;
    this.startMusic();
  }

  /** A soft chord on the music bus. Does not restart the loop if it is already playing. */
  beginCinematic() {
    if (document.visibilityState === 'hidden') return;
    this.startMusic();
    this.swell();
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

  private startMusic() {
    if (this.running) return;
    const ctx = this.ensure();
    if (!ctx || !this.musicGain) return;
    this.running = true;
    [146.83, 220].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = index === 0 ? 0.045 : 0.028;
      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start();
      this.pad.push(osc);
    });
    this.next = ctx.currentTime + 0.08;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 100);
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.running || !this.musicGain) return;
    while (this.next < ctx.currentTime + 0.3) {
      const semi = this.melody[this.step % this.melody.length];
      const freq = 293.66 * 2 ** (semi / 12);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, this.next);
      gain.gain.exponentialRampToValueAtTime(0.05, this.next + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.next + 0.42);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(this.next);
      osc.stop(this.next + 0.46);
      this.next += 0.5;
      this.step += 1;
    }
  }

  private swell() {
    const ctx = this.ctx;
    if (!ctx || !this.running || !this.musicGain || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.05;
    [196, 247, 294, 392].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + index * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.04, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.4);
      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(start);
      osc.stop(start + 1.45);
    });
  }

  private stopMusic() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
    this.pad.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* oscillator already stopped */
      }
    });
    this.pad = [];
    this.running = false;
  }

  attachVisibility(musicEnabled: () => boolean) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopMusic();
      else if (musicEnabled()) this.setMusic(true);
    });
  }
}

export const sound = new SoundBus();
