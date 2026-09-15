/**
 * Broadcast Studio Audio Synthesizer
 * Uses Web Audio API to create authentic TV news sounds without external audio dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playStingerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.2, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  master.connect(ctx.destination);

  // Broadcast chord: D4, F#4, A4, D5 fanfare
  const freqs = [293.66, 369.99, 440.0, 587.33];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
    
    // Low pass filter for warm brass/broadcast tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 1.0);

    gain.gain.setValueAtTime(0.3, now + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(now + idx * 0.04);
    osc.stop(now + 1.2);
  });
}

export function playBreakingAlarmSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.25, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  master.connect(ctx.destination);

  // Urgent two-pulse siren/stinger
  [0, 0.22, 0.44].forEach((timeOffset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now + timeOffset); // A5
    osc.frequency.exponentialRampToValueAtTime(660, now + timeOffset + 0.16);

    gain.gain.setValueAtTime(0.4, now + timeOffset);
    gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.18);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.2);
  });
}

export function playCameraCutSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

export function playTeletypeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(2200, now);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.035);
}
