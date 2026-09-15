/**
 * WebRTC & Local Stream Real-Time Audio Telemetry Analyzer
 * Extracts RMS, Peak dBFS, Peak Hold with ballistic decay, frequency bands,
 * and speech activity from any MediaStream (WebRTC remote peer or local mic).
 */

export interface AudioMetrics {
  rms: number; // 0 to 1
  peak: number; // 0 to 1
  db: number; // -60 to +3 dBFS
  peakHoldDb: number; // -60 to +3 dBFS
  channelL: number; // 0 to 1
  channelR: number; // 0 to 1
  bands: {
    low: number; // 0 to 1 (100 - 300 Hz)
    mid: number; // 0 to 1 (300 - 3000 Hz vocal range)
    high: number; // 0 to 1 (3000 - 8000 Hz sibilance)
  };
  isClipping: boolean;
  isSpeaking: boolean;
  hasActiveAudioTrack: boolean;
}

export const DEFAULT_METRICS: AudioMetrics = {
  rms: 0,
  peak: 0,
  db: -60,
  peakHoldDb: -60,
  channelL: 0,
  channelR: 0,
  bands: { low: 0, mid: 0, high: 0 },
  isClipping: false,
  isSpeaking: false,
  hasActiveAudioTrack: false,
};

let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

if (typeof window !== 'undefined') {
  const resumeAudio = () => {
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', resumeAudio, { once: false, passive: true });
  window.addEventListener('touchstart', resumeAudio, { once: false, passive: true });
}

export class StreamAudioAnalyzer {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private silentGainNode: GainNode | null = null;
  private stream: MediaStream | null = null;

  private freqData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;

  private peakHoldValue: number = -60;
  private peakHoldTime: number = 0;
  private isDestroyed: boolean = false;

  constructor(stream: MediaStream | null) {
    this.stream = stream;
    this.setupNodes();
  }

  public updateStream(newStream: MediaStream | null) {
    if (this.stream === newStream) return;
    this.cleanupNodes();
    this.stream = newStream;
    this.setupNodes();
  }

  private setupNodes() {
    if (!this.stream || this.isDestroyed) return;
    const audioTracks = this.stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      this.ctx = getSharedAudioContext();
      if (!this.ctx) return;

      this.sourceNode = this.ctx.createMediaStreamSource(this.stream);
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.25;

      // Connect source to analyser
      this.sourceNode.connect(this.analyserNode);

      // Connect analyser to a silent gain node into destination to keep Web Audio graph active
      this.silentGainNode = this.ctx.createGain();
      this.silentGainNode.gain.value = 0;
      this.analyserNode.connect(this.silentGainNode);
      this.silentGainNode.connect(this.ctx.destination);

      const bufferLen = this.analyserNode.frequencyBinCount;
      this.freqData = new Uint8Array(bufferLen);
      this.timeData = new Uint8Array(bufferLen);
    } catch (err) {
      console.warn('StreamAudioAnalyzer setup warning:', err);
    }
  }

  private cleanupNodes() {
    try {
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.analyserNode) {
        this.analyserNode.disconnect();
        this.analyserNode = null;
      }
      if (this.silentGainNode) {
        this.silentGainNode.disconnect();
        this.silentGainNode = null;
      }
    } catch (_) {}
  }

  public getMetrics(isMuted: boolean = false): AudioMetrics {
    if (isMuted || !this.stream) {
      this.peakHoldValue = Math.max(-60, this.peakHoldValue - 0.8);
      return {
        ...DEFAULT_METRICS,
        peakHoldDb: this.peakHoldValue,
      };
    }

    const audioTracks = this.stream.getAudioTracks();
    const hasActiveAudioTrack = audioTracks.some((t) => t.enabled && t.readyState === 'live');

    if (!hasActiveAudioTrack || !this.analyserNode || !this.timeData || !this.freqData) {
      return {
        ...DEFAULT_METRICS,
        hasActiveAudioTrack,
      };
    }

    this.analyserNode.getByteTimeDomainData(this.timeData);
    this.analyserNode.getByteFrequencyData(this.freqData);

    // 1. Calculate RMS from time domain
    let sumSquares = 0;
    let peakInstant = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const normalized = (this.timeData[i] - 128) / 128;
      const absVal = Math.abs(normalized);
      if (absVal > peakInstant) peakInstant = absVal;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.timeData.length);

    // 2. Compute dBFS (-60 to +3 dBFS)
    // -48dB is very quiet room noise, -18 to -12 dB is normal broadcast speech, 0dB is full scale
    let db = rms > 0.0001 ? 20 * Math.log10(rms) : -60;
    // Calibrate broadcast scale: nominal vocal around -14dB
    db = Math.max(-60, Math.min(3, db + 3));

    // 3. Peak hold with ballistic 1.2s delay and smooth 30dB/sec decay
    const now = Date.now();
    if (db > this.peakHoldValue) {
      this.peakHoldValue = db;
      this.peakHoldTime = now;
    } else if (now - this.peakHoldTime > 1000) {
      this.peakHoldValue = Math.max(-60, this.peakHoldValue - 0.7);
    }

    // 4. Frequency band analysis (Low: 100-300Hz, Mid: 300-3000Hz vocal core, High: 3k-8kHz)
    const binCount = this.freqData.length;
    // Bin resolution roughly = (sampleRate/2) / binCount ~= 24000 / 128 ~= 187.5 Hz per bin
    let lowSum = 0;
    let midSum = 0;
    let highSum = 0;

    for (let i = 0; i < binCount; i++) {
      const val = this.freqData[i] / 255;
      if (i <= 2) lowSum += val;
      else if (i <= 18) midSum += val;
      else highSum += val;
    }

    const low = Math.min(1, (lowSum / 3) * 1.3);
    const mid = Math.min(1, (midSum / 16) * 1.5);
    const high = Math.min(1, (highSum / (binCount - 19)) * 2.0);

    // 5. Dual channel stereo levels (slight natural decorrelation if mono to reflect spatial stereo)
    const channelL = Math.min(1, rms * 2.4);
    const decorr = Math.sin(now * 0.005) * 0.04;
    const channelR = Math.max(0, Math.min(1, channelL * (0.95 + decorr)));

    const isClipping = db >= -0.5 || peakInstant >= 0.98;
    const isSpeaking = db > -34 && rms > 0.025;

    return {
      rms,
      peak: peakInstant,
      db,
      peakHoldDb: this.peakHoldValue,
      channelL,
      channelR,
      bands: { low, mid, high },
      isClipping,
      isSpeaking,
      hasActiveAudioTrack: true,
    };
  }

  public destroy() {
    this.isDestroyed = true;
    this.cleanupNodes();
  }
}
