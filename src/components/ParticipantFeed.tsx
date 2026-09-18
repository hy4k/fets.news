import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Wifi,
  Radio,
  Sliders,
  Monitor,
  Volume2,
} from 'lucide-react';
import { Participant } from '../types';
import { LowerThirdChyron } from './LowerThirdChyron';
import { BroadcastMotionCanvas } from './BroadcastMotionCanvas';

interface ParticipantFeedProps {
  participant: Participant;
  isBreakingNews?: boolean;
  onToggleMute: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onSelectSpeaker?: (id: string) => void;
  userMediaStream: MediaStream | null;
  screenShareStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isLocalUser?: boolean;
  isActiveSpeaker?: boolean;
  isOnAir?: boolean;
  onOpenFeedSelector?: (participant: Participant) => void;
  onActivateWebcam?: (participantId: string) => void;
  onActivateScreenShare?: (participantId: string) => void;
  onSpeechActivity?: (participantId: string, isSpeaking: boolean, level: number) => void;
  compact?: boolean;
  isFeatured?: boolean;
}

export const ParticipantFeed: React.FC<ParticipantFeedProps> = ({
  participant,
  isBreakingNews = false,
  onToggleMute,
  onToggleVideo,
  onSelectSpeaker,
  userMediaStream,
  screenShareStream,
  remoteStream,
  isLocalUser = false,
  isActiveSpeaker = false,
  isOnAir = false,
  onOpenFeedSelector,
  onActivateWebcam,
  onActivateScreenShare,
  onSpeechActivity,
  compact = false,
  isFeatured = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const isCurrentlySpeaking = participant.isSpeaking || (participant.audioLevel > 18 && !participant.isMuted);
  const activeSpeakerState = Boolean(isActiveSpeaker || isCurrentlySpeaking);
  const onAirState = Boolean(isOnAir);
  const shouldPulseRed = activeSpeakerState || onAirState;

  // Active stream for this participant (local user gets local media; remote peers get their WebRTC remoteStream)
  const effectiveStream = isLocalUser ? userMediaStream : (remoteStream || null);

  // Attach webcam/peer stream
  useEffect(() => {
    if (participant.streamType === 'webcam' && videoRef.current) {
      if (effectiveStream && !participant.isVideoOff) {
        videoRef.current.srcObject = effectiveStream;
        videoRef.current.play().catch((err) => console.warn('Autoplay prevented:', err));
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [participant.streamType, participant.isVideoOff, effectiveStream]);

  // Attach screen share stream if this participant is using screen share
  useEffect(() => {
    if (participant.streamType === 'screenshare' && screenVideoRef.current) {
      if (screenShareStream && !participant.isVideoOff) {
        screenVideoRef.current.srcObject = screenShareStream;
        screenVideoRef.current.play().catch((err) => console.warn('Screen autoplay prevented:', err));
      } else {
        screenVideoRef.current.srcObject = null;
      }
    }
  }, [participant.streamType, participant.isVideoOff, screenShareStream]);

  const hasLiveCameraFeed = (participant.streamType === 'webcam' && effectiveStream && !participant.isVideoOff);

  return (
    <div
      id={`feed-${participant.id}`}
      onClick={() => onSelectSpeaker?.(participant.id)}
      className={`relative group flex flex-col justify-between overflow-hidden transition-all duration-300 select-none rounded-2xl h-full w-full ${
        shouldPulseRed
          ? activeSpeakerState && isCurrentlySpeaking
            ? 'border-2 border-red-500 animate-pulse-border-red-active shadow-[0_0_24px_rgba(239,68,68,0.8)]'
            : 'border-2 border-red-500 animate-pulse-border-red shadow-[0_0_18px_rgba(239,68,68,0.6)]'
          : 'liquid-glass border-[#235247]/60 hover:border-[#387e6f]'
      }`}
    >
      {/* 1. Background Video / Live Feed Rendering */}
      <div className="absolute inset-0 z-0 bg-[#081512] overflow-hidden flex items-center justify-center">
        {/* CASE A: LIVE WEBCAM (LOCAL OR PEER) */}
        {participant.streamType === 'webcam' && (
          hasLiveCameraFeed ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocalUser}
              className={`w-full h-full object-cover ${isLocalUser ? 'mirror-mode' : ''}`}
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
              <div className="p-2.5 rounded-full bg-[#122e27] border border-[#2d6e5f] mb-2 shadow-[0_0_12px_rgba(0,208,132,0.2)]">
                <Video className="w-5 h-5 text-[#00D084]" />
              </div>
              <div className="font-fets-title font-bold text-white text-xs tracking-wider uppercase mb-2">
                {isLocalUser ? 'CAMERA STANDBY' : `${participant.name.toUpperCase()} STANDBY`}
              </div>
              {isLocalUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivateWebcam?.(participant.id);
                  }}
                  className="px-3 py-1 rounded-full bg-[#00D084] hover:bg-[#00b370] text-[#061e15] font-fets-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,208,132,0.4)] transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>START CAMERA</span>
                </button>
              )}
            </div>
          )
        )}

        {/* CASE B: LIVE SCREEN SHARE */}
        {participant.streamType === 'screenshare' && (
          screenShareStream && !participant.isVideoOff ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
              <div className="p-2.5 rounded-full bg-blue-950/70 border border-blue-500/50 mb-2 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                <Monitor className="w-5 h-5 text-blue-400" />
              </div>
              <div className="font-fets-title font-bold text-white text-xs tracking-wider uppercase mb-2">
                SCREEN FEED STANDBY
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActivateScreenShare?.(participant.id);
                }}
                className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-fets-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>START SCREEN SHARE</span>
              </button>
            </div>
          )
        )}

        {/* CASE C: CUSTOM STREAM URL */}
        {participant.streamType === 'custom_url' && participant.customVideoUrl && (
          <video
            src={participant.customVideoUrl}
            autoPlay
            playsInline
            loop
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* CASE D: BROADCAST EXAM FLOOR / TEST ROOM VISUALIZER (60FPS Active Broadcast Visualizer) */}
        {participant.streamType === 'motion_canvas' && (
          <BroadcastMotionCanvas
            participant={participant}
            preset={participant.videoPreset || 'test_pod_matrix'}
            isSpeaking={participant.isSpeaking}
            audioLevel={participant.audioLevel}
          />
        )}

        {/* Authentic Broadcast CRT Scanlines & Vignette */}
        <div className="broadcast-scanlines absolute inset-0 z-10 opacity-70 pointer-events-none" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/50" />
      </div>

      {/* 2. Broadcast Framing Corner Crosshairs (+) with Active Tally illumination */}
      <div className={`absolute top-2 left-2 z-20 pointer-events-none font-tech text-[10px] select-none transition-colors ${shouldPulseRed ? 'text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'text-slate-500'}`}>
        +
      </div>
      <div className={`absolute top-2 right-2 z-20 pointer-events-none font-tech text-[10px] select-none transition-colors ${shouldPulseRed ? 'text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'text-slate-500'}`}>
        +
      </div>
      <div className={`absolute bottom-2 left-2 z-20 pointer-events-none font-tech text-[10px] select-none transition-colors ${shouldPulseRed ? 'text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'text-slate-500'}`}>
        +
      </div>
      <div className={`absolute bottom-2 right-2 z-20 pointer-events-none font-tech text-[10px] select-none transition-colors ${shouldPulseRed ? 'text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'text-slate-500'}`}>
        +
      </div>

      {/* 3. Top Broadcast Feed Header Overlay */}
      <div className="relative z-20 w-full p-2.5 flex items-center justify-between text-xs">
        {/* Left: Camera Label & Live Feed Source Selector Button & Tally Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tally / On-Air Indicator Badge */}
          {shouldPulseRed && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider backdrop-blur-md border ${
                activeSpeakerState
                  ? 'bg-red-600 text-white border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse'
                  : 'bg-red-950/90 text-red-300 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>{activeSpeakerState ? 'ACTIVE SPEAKER' : 'ON AIR • PGM'}</span>
            </div>
          )}

          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider backdrop-blur-md ${
              shouldPulseRed
                ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                : 'bg-[#081814]/90 text-slate-200 border border-[#224e43]'
            }`}
          >
            <Radio className="w-2.5 h-2.5 text-[#FFC72C]" />
            <span>{participant.cameraLabel}</span>
          </div>

          {/* Quick Feed Source Switcher Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFeedSelector?.(participant);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-tech font-semibold uppercase tracking-wider bg-[#0d221e]/90 hover:bg-[#14352f] text-[#FFC72C] border border-[#2b5e52] hover:border-[#FFC72C] transition-colors shadow-sm cursor-pointer"
            title="Configure Live Feed Signal (Camera, Screen, Stream, Exam Visualizer)"
          >
            <Sliders className="w-2.5 h-2.5 text-[#FFC72C]" />
            <span className="hidden sm:inline">INPUT:</span>
            <span className="font-bold">
              {participant.streamType === 'webcam'
                ? 'CAM'
                : participant.streamType === 'screenshare'
                ? 'SCREEN'
                : participant.streamType === 'custom_url'
                ? 'STREAM'
                : 'VISUALIZER'}
            </span>
          </button>

          <span className="hidden md:inline-block text-[10px] font-tech text-[#00D084] bg-[#071612]/80 px-2 py-0.5 rounded-full border border-[#1b443a]">
            {participant.signalQuality}
          </span>

          {/* Live Audio Status Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-tech uppercase tracking-wider backdrop-blur-md ${
              participant.isMuted
                ? 'bg-red-950/80 text-red-400 border border-red-900/60'
                : participant.isSpeaking
                ? 'bg-[#00D084]/25 text-[#00D084] border border-[#00D084] shadow-[0_0_8px_rgba(0,208,132,0.4)]'
                : 'bg-[#071612]/80 text-slate-400 border border-[#1b443a]'
            }`}
          >
            {participant.isMuted ? (
              <MicOff className="w-2.5 h-2.5 text-red-400" />
            ) : (
              <Volume2
                className={`w-2.5 h-2.5 ${
                  participant.isSpeaking ? 'text-[#00D084] animate-pulse' : 'text-slate-400'
                }`}
              />
            )}
            <span className="hidden sm:inline font-bold">
              {participant.isMuted
                ? 'MUTED'
                : participant.isRemotePeer && effectiveStream
                ? 'AUDIO ON'
                : 'AUDIO'}
            </span>
          </div>
        </div>

        {/* Right: Technical Telemetry & Quick Hardware Controls */}
        <div className="flex items-center gap-1.5">
          {/* Latency badge */}
          <div className="flex items-center gap-1 text-[10px] font-tech text-slate-400 bg-black/70 px-1.5 py-0.5 rounded border border-slate-800">
            <Wifi className="w-2.5 h-2.5 text-blue-400" />
            <span>{participant.latencyMs}ms</span>
          </div>

          {/* Quick Mic / Camera toggles */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute(participant.id);
              }}
              className={`p-1 rounded transition-colors ${
                participant.isMuted
                  ? 'bg-red-950/80 text-red-400 border border-red-700/60'
                  : 'bg-black/70 hover:bg-slate-800 text-slate-300'
              }`}
              title={participant.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {participant.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVideo(participant.id);
              }}
              className={`p-1 rounded transition-colors ${
                participant.isVideoOff
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-700/60'
                  : 'bg-black/70 hover:bg-slate-800 text-slate-300'
              }`}
              title={participant.isVideoOff ? 'Enable video' : 'Disable video'}
            >
              {participant.isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Lower Third Chyron */}
      <LowerThirdChyron participant={participant} isBreaking={isBreakingNews} compact={compact} />

      {/* 6. SUBTLE LIVE TICKER OVERLAY in every participant window */}
      <div
        id={`feed-ticker-${participant.id}`}
        className="relative z-20 w-full bg-[#061411]/95 border-t border-[#1a3d34] backdrop-blur-md overflow-hidden py-0.5 px-2 flex items-center text-[10px] font-tech text-slate-300 select-none"
      >
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#1a3d34] text-[#4d7a6e] font-bold uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
          <span>FEED-STAT</span>
        </div>

        {/* Marquee ticker text */}
        <div className="relative overflow-hidden w-full whitespace-nowrap flex-1 ml-2">
          <div className="animate-ticker-marquee text-slate-300">
            <span className="mr-8">{participant.windowTicker}</span>
            <span className="mr-8 text-[#FFC72C] font-medium">
              SIGNAL: {participant.streamType.toUpperCase()} • LATENCY {participant.latencyMs}ms
            </span>
            <span className="mr-8">{participant.windowTicker}</span>
            <span className="mr-8 text-[#00D084] font-medium">
              ACTIVE BROADCAST STREAM • 59.94 FPS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
