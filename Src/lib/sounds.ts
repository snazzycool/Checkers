// Sound Manager using Web Audio API
// Generates all sounds programmatically - no external files needed!
// Enhanced with better sounds and ambient music

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicEnabled: boolean = false;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicGains: GainNode[] = [];
  private isMusicPlaying: boolean = false;
  private musicInterval: NodeJS.Timeout | null = null;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.audioContext.destination);
      
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  // Click sound - crisp, satisfying tick
  playClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.sfxGain!);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.06);
  }

  // Move sound - soft wooden tap
  playMove() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Create a wooden tap sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc1.frequency.value = 200;
    osc1.type = 'triangle';
    osc2.frequency.value = 400;
    osc2.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.08);
  }

  // Capture sound - dramatic impact with rumble
  playCapture() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Noise burst for impact
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);
    
    // Deep thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.value = 80;
    osc.type = 'sine';
    oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain!);
    
    // Mid punch
    const osc2 = ctx.createOscillator();
    const oscGain2 = ctx.createGain();
    osc2.frequency.value = 150;
    osc2.type = 'triangle';
    oscGain2.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc2.connect(oscGain2);
    oscGain2.connect(this.sfxGain!);
    
    noise.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.12);
  }

  // Multi-capture sound - even more dramatic
  playMultiCapture() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Two thumps in quick succession
    [0, 0.1].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 70;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
    
    // Rising tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  // King promotion - majestic fanfare
  playKing() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const notes = [
      { freq: 523.25, start: 0, duration: 0.2 },      // C5
      { freq: 659.25, start: 0.15, duration: 0.2 },   // E5
      { freq: 783.99, start: 0.3, duration: 0.2 },    // G5
      { freq: 1046.50, start: 0.45, duration: 0.4 },  // C6
    ];
    
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + note.start;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
    
    // Add shimmer
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.frequency.value = 2000;
    shimmer.type = 'sine';
    shimmerGain.gain.setValueAtTime(0.05, ctx.currentTime);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.sfxGain!);
    shimmer.start(ctx.currentTime);
    shimmer.stop(ctx.currentTime + 0.6);
  }

  // Victory sound - triumphant celebration
  playVictory() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Major chord arpeggio with extra flourish
    const melody = [
      { freq: 523.25, start: 0, duration: 0.3 },      // C5
      { freq: 659.25, start: 0.12, duration: 0.3 },   // E5
      { freq: 783.99, start: 0.24, duration: 0.3 },   // G5
      { freq: 1046.50, start: 0.36, duration: 0.4 },  // C6
      { freq: 1318.51, start: 0.48, duration: 0.4 },  // E6
      { freq: 1567.98, start: 0.6, duration: 0.5 },   // G6
    ];
    
    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + note.start;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
    
    // Final chord
    [523.25, 659.25, 783.99].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 1.5);
    });
  }

  // Defeat sound - descending melancholy
  playDefeat() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Descending notes
    const notes = [400, 350, 300, 250, 200];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      
      const startTime = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
    
    // Low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  }

  // Game start sound - alert tone
  playGameStart() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    // Rising arpeggio
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Select sound - gentle ping
  playSelect() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.frequency.value = 600;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Error/invalid move sound - buzz
  playError() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.frequency.value = 150;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Tick for timer - subtle metronome
  playTick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.frequency.value = 1000;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  }

  // Low time warning - urgent beep
  playLowTime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.frequency.value = 880;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Ambient background music generator
  // Creates a peaceful, looping ambient soundscape
  startBackgroundMusic() {
    if (this.isMuted || !this.musicEnabled || this.isMusicPlaying) return;
    const ctx = this.initContext();
    
    this.isMusicPlaying = true;
    
    // Clean up any existing music
    this.stopBackgroundMusic();
    this.isMusicPlaying = true;
    
    // Create peaceful ambient layers
    const createPad = (freq: number, detune: number = 0, volume: number = 0.03) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 1;
      
      gain.gain.value = volume;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start();
      this.musicOscillators.push(osc);
      this.musicGains.push(gain);
      
      return { osc, gain };
    };
    
    // Create chord progression: Am - F - C - G (peaceful, game-like)
    // Using subtle sine waves for a calming effect
    const chords = [
      [110, 130.81, 164.81],  // Am (A2, C3, E3)
      [87.31, 110, 130.81],   // F (F2, A2, C3)
      [65.41, 82.41, 98],     // C (C2, E2, G2)
      [98, 123.47, 146.83],   // G (G2, B2, D3)
    ];
    
    let chordIndex = 0;
    
    // Initial chord
    chords[0].forEach((freq, i) => {
      createPad(freq, i * 2, 0.025);
    });
    
    // High shimmer layer
    const createShimmer = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 440 + Math.random() * 220;
      
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 2);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
      
      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start();
      osc.stop(ctx.currentTime + 4);
    };
    
    // Change chords every 8 seconds
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying) return;
      
      chordIndex = (chordIndex + 1) % chords.length;
      
      // Fade out current oscillators
      this.musicOscillators.forEach(osc => {
        try {
          osc.stop(ctx.currentTime + 1);
        } catch (e) {}
      });
      this.musicGains.forEach(g => {
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      });
      
      this.musicOscillators = [];
      this.musicGains = [];
      
      // Start new chord
      chords[chordIndex].forEach((freq, i) => {
        createPad(freq, i * 2 + Math.random() * 5, 0.025);
      });
      
      // Add occasional shimmer
      if (Math.random() > 0.5) {
        createShimmer();
      }
    }, 8000);
    
    // Add occasional high notes
    const shimmerInterval = setInterval(() => {
      if (!this.isMusicPlaying) {
        clearInterval(shimmerInterval);
        return;
      }
      if (Math.random() > 0.7) {
        createShimmer();
      }
    }, 4000);
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    
    const ctx = this.audioContext;
    if (ctx) {
      this.musicOscillators.forEach(osc => {
        try {
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          // Already stopped
        }
      });
      this.musicGains.forEach(g => {
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      });
    }
    
    this.musicOscillators = [];
    this.musicGains = [];
    this.isMusicPlaying = false;
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    return this.isMuted;
  }

  // Set music enabled
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
    return this.musicEnabled;
  }

  // Get music enabled state
  getMusicEnabled() {
    return this.musicEnabled;
  }

  // Get mute state
  getMuteState() {
    return this.isMuted;
  }

  // Set music volume (0-1)
  setMusicVolume(volume: number) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Set SFX volume (0-1)
  setSfxVolume(volume: number) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Check if music is playing
  getMusicPlayingState() {
    return this.isMusicPlaying;
  }
}

// Create singleton instance
export const soundManager = new SoundManager();
