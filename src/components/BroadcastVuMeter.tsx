import React, { useState, useEffect, useRef } from 'react';
import { StreamAudioAnalyzer, AudioMetrics, DEFAULT_METRICS } from '../utils/webRtcAudioAnalyzer';

interface BroadcastVuMeterProps {
  stream?: MediaStream | null;
  isMuted?: boolean;
  isSpeaking?: boolean;
  participantName?: string;
  isRemotePeer?: boolean;
  compact?: boolean;
  onSpeechDetected?: (isSpeaking: boolean, level: number) => void;
}

const TOTAL_SEGMENTS = 20;

// dB scale benchmarks mapped to segment index (0 = bottom -48dB, 19 = top +3dB)
const DB_SCALE = [
  { label: '+3', segment: 19, color: 'text-red-400' },
  { label: ' 0', segment: 17, color: 'text-red-500' },
  { label: '-6', segment: 14, color: 'text-amber-400' },
  { label: '-12', segment: 11, color: 'text-amber-300' },
  { label: '-18', segment: 8, color: 'text-emerald-400' },
  { label: '-24', segment: 5, color: 'text-emerald-500' },
  { label: '-36', segment: 2, color: 'text-emerald-600' },
  { label: '-48', segment: 0, color: 'text-slate-500' },
];

export const BroadcastVuMeter: React.FC<BroadcastVuMeterProps> = ({
  stream,
  isMuted = false,
  isSpeaking = false,
  participantName = 'PEER',
  isRemotePeer = false,
  compact = false,
  onSpeechDetected,
}) => {
  const [metrics, setMetrics] = useState<AudioMetrics>(DEFAULT_METRICS);
  const [clipFlash, setClipFlash] = useState<boolean>(false);

  const analyzerRef = useRef<StreamAudioAnalyzer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastSpeechStateRef = useRef<boolean>(false);
  const simulatedPhaseRef = useRef<number>(Math.random() * 100);

  // Initialize and update analyzer instance when stream changes
  useEffect(() => {
    if (!analyzerRef.current) {
      analyzerRef.current = new StreamAudioAnalyzer(stream || null);
    } else {
      analyzerRef.current.updateStream(stream || null);
    }

    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.destroy();
        analyzerRef.current = null;
      }
    };
  }, [stream]);

  // 60FPS Audio Telemetry Loop
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;

      if (analyzerRef.current && stream && !isMuted) {
        const raw = analyzerRef.current.getMetrics(isMuted);

        if (raw.hasActiveAudioTrack) {
          // Real WebRTC audio stream data
          setMetrics(raw);

          if (raw.isClipping) {
            setClipFlash(true);
            setTimeout(() => setClipFlash(false), 200);
          }

          // Trigger speech activity callback if state changed
          if (raw.isSpeaking !== lastSpeechStateRef.current) {
            lastSpeechStateRef.current = raw.isSpeaking;
            onSpeechDetected?.(raw.isSpeaking, Math.round(raw.rms * 100));
          }
        } else {
          // Stream has no audio track, or simulated standby
          handleSimulatedOrSilent(isSpeaking, isMuted);
        }
      } else {
        handleSimulatedOrSilent(isSpeaking, isMuted);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    const handleSimulatedOrSilent = (speaking: boolean, muted: boolean) => {
      if (muted) {
        setMetrics((prev) => ({
          ...DEFAULT_METRICS,
          peakHoldDb: Math.max(-60, prev.peakHoldDb - 1.2),
        }));
        return;
      }

      if (speaking) {
        simulatedPhaseRef.current += 0.12;
        const p = simulatedPhaseRef.current;
        // Natural human vocal cadence simulation
        const cadence = (Math.sin(p) * 0.5 + Math.sin(p * 2.3) * 0.3 + Math.cos(p * 0.7) * 0.2 + 1) / 2;
        const simDb = -28 + cadence * 22; // -28dB to -6dB
        const simRms = cadence * 0.45;
        const simL = Math.min(1, simRms * 2.2);
        const simR = Math.min(1, simL * (0.92 + Math.sin(p * 0.5) * 0.08));

        setMetrics((prev) => {
          const hold = Math.max(simDb, prev.peakHoldDb - 0.5);
          return {
            rms: simRms,
            peak: simRms * 1.3,
            db: simDb,
            peakHoldDb: hold,
            channelL: simL,
            channelR: simR,
            bands: {
              low: 0.3 + cadence * 0.4,
              mid: 0.4 + cadence * 0.5,
              high: 0.2 + cadence * 0.3,
            },
            isClipping: simDb > -1,
            isSpeaking: true,
            hasActiveAudioTrack: false,
          };
        });
      } else {
        // Ambient room noise floor (-52dB to -46dB)
        simulatedPhaseRef.current += 0.02;
        const noise = Math.sin(simulatedPhaseRef.current) * 2;
        setMetrics((prev) => ({
          ...DEFAULT_METRICS,
          db: -50 + noise,
          peakHoldDb: Math.max(-50, prev.peakHoldDb - 0.8),
          channelL: 0.02,
          channelR: 0.02,
        }));
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stream, isMuted, isSpeaking, onSpeechDetected]);

  // Convert dBFS (-48dB to +3dB) to 0..TOTAL_SEGMENTS index
  const dbToSegments = (db: number) => {
    if (db <= -48) return 0;
    if (db >= 3) return TOTAL_SEGMENTS;
    // Map -48..+3 (51 dB range) to 0..20
    const ratio = (db - (-48)) / 51;
    return Math.round(ratio * TOTAL_SEGMENTS);
  };

  const currentSegmentsL = dbToSegments(metrics.db);
  const currentSegmentsR = dbToSegments(metrics.db - 0.8);
  const peakHoldSegment = dbToSegments(metrics.peakHoldDb);

  const getSegmentColorClass = (index: number, isLit: boolean) => {
    if (!isLit) {
      if (index >= 17) return 'bg-red-950/30';
      if (index >= 12) return 'bg-amber-950/30';
      return 'bg-emerald-950/30';
    }

    // Lit colors
    if (index >= 17) {
      return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]';
    }
    if (index >= 12) {
      return 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.8)]';
    }
    return 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.7)]';
  };

  const isRealStream = metrics.hasActiveAudioTrack;

  return (
    <div className="relative select-none pointer-events-auto">
      {/* Main Broadcast VU Meter Console Card */}
      <div
        id={`vu-meter-${participantName.toLowerCase().replace(/\s+/g, '-')}`}
        className={`bg-black/90 border border-slate-800/90 rounded-md backdrop-blur-md shadow-2xl transition-all ${
          compact ? 'p-1' : 'p-1.5'
        }`}
      >
        {/* Top Header: Clip LED + Digital dB Readout */}
        <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-1">
            {/* OVER / CLIP LED */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
                metrics.isClipping || clipFlash
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping'
                  : 'bg-red-950 border border-red-800/50'
              }`}
              title="OVERLOAD / CLIPPING DETECTOR"
            />
            <span className="font-tech text-[8px] font-bold tracking-tight text-slate-400">
              {isMuted ? 'MUT' : 'VU'}
            </span>
          </div>

          {/* Numeric dB Readout */}
          <div
            className={`font-tech text-[9px] font-bold tabular-nums tracking-tighter ${
              metrics.isClipping
                ? 'text-red-400 animate-pulse'
                : metrics.db > -12
                ? 'text-amber-300'
                : metrics.db > -36
                ? 'text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            {isMuted
              ? 'MUTE'
              : metrics.db <= -58
              ? '-INF'
              : `${metrics.db > 0 ? '+' : ''}${metrics.db.toFixed(0)}dB`}
          </div>
        </div>

        {/* Dual Channel LED Ladder (CH1 / CH2 or L / R) */}
        <div className="flex items-stretch gap-1.5">
          {/* Scale Markings (Desktop/Full mode) */}
          {!compact && (
            <div className="flex flex-col-reverse justify-between text-[7px] font-tech text-slate-500 select-none pr-0.5 leading-none">
              {DB_SCALE.map((s) => (
                <span key={s.label} className={s.color}>
                  {s.label}
                </span>
              ))}
            </div>
          )}

          {/* Channel L Bar */}
          <div className="flex flex-col-reverse gap-[1.5px] w-2 sm:w-2.5 h-24 sm:h-28 bg-[#040711] p-[1.5px] rounded-sm border border-slate-900">
            {[...Array(TOTAL_SEGMENTS)].map((_, i) => {
              const isLit = !isMuted && i <= currentSegmentsL;
              const isPeakHold = !isMuted && i === peakHoldSegment && peakHoldSegment > 0;
              return (
                <div
                  key={`L-${i}`}
                  className={`w-full flex-1 rounded-[0.5px] transition-all duration-75 ${
                    isPeakHold
                      ? 'bg-white shadow-[0_0_6px_#ffffff]'
                      : getSegmentColorClass(i, isLit)
                  }`}
                />
              );
            })}
          </div>

          {/* Channel R Bar */}
          <div className="flex flex-col-reverse gap-[1.5px] w-2 sm:w-2.5 h-24 sm:h-28 bg-[#040711] p-[1.5px] rounded-sm border border-slate-900">
            {[...Array(TOTAL_SEGMENTS)].map((_, i) => {
              const isLit = !isMuted && i <= currentSegmentsR;
              const isPeakHold = !isMuted && i === peakHoldSegment && peakHoldSegment > 0;
              return (
                <div
                  key={`R-${i}`}
                  className={`w-full flex-1 rounded-[0.5px] transition-all duration-75 ${
                    isPeakHold
                      ? 'bg-white shadow-[0_0_6px_#ffffff]'
                      : getSegmentColorClass(i, isLit)
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Channel Labels (L / R) */}
        <div className="flex items-center justify-between text-[7px] font-tech font-bold text-slate-500 mt-1 pt-0.5 border-t border-slate-900">
          <span>L</span>
          <span className="text-[6px] text-slate-600">CH</span>
          <span>R</span>
        </div>

        {/* Real-time Audio Indicator Pill */}
        <div className="mt-1 flex items-center justify-center">
          <div
            className={`flex items-center gap-1 px-1 py-0.5 rounded text-[7px] font-tech font-bold uppercase tracking-wider ${
              isMuted
                ? 'bg-red-950/80 text-red-400 border border-red-900/60'
                : isRealStream
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800'
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                isMuted
                  ? 'bg-red-500'
                  : isRealStream
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span>{isMuted ? 'MUTE' : isRealStream ? 'MIC LIVE' : 'STBY'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
