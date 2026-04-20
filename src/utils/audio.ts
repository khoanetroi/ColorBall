export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;

  private init() {
    if (!this.ctx) {
      const audioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!audioContextCtor) {
        return;
      }

      this.ctx = new audioContextCtor();
    }

    if (!this.ctx) {
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playError() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playMerge() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playLevelComplete() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx!.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.15);
      osc.stop(this.ctx!.currentTime + i * 0.15 + 0.5);
    });
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;
    const notes = [392, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.2 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.2);
      osc.stop(this.ctx!.currentTime + i * 0.2 + 0.6);
    });
  }

  /** Play background music from file (put your music at public/bgm.mp3) */
  private bgmAudio: HTMLAudioElement | null = null;

  playBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0; // start silent, fade in
    }

    this.bgmAudio.currentTime = 0;
    
    const playPromise = this.bgmAudio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Browser blocked autoplay — will retry on next user gesture
        this.isBgmPlaying = false;
      });
    }

    // Fade in over 2 seconds
    let vol = 0;
    const fadeIn = setInterval(() => {
      if (!this.bgmAudio || !this.isBgmPlaying) {
        clearInterval(fadeIn);
        return;
      }
      vol = Math.min(vol + 0.005, 0.1); // target volume: 0.1 (very gentle)
      this.bgmAudio.volume = vol;
      if (vol >= 0.1) clearInterval(fadeIn);
    }, 40);
  }

  /** Stop the background music with fade-out */
  stopBGM() {
    if (!this.isBgmPlaying || !this.bgmAudio) return;
    this.isBgmPlaying = false;

    const audio = this.bgmAudio;
    // Fade out over 1 second
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume = Math.max(0, audio.volume - 0.02);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOut);
      }
    }, 40);
  }

  get bgmPlaying() {
    return this.isBgmPlaying;
  }
}

export const sfx = new AudioEngine();

