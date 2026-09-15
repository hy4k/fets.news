import React from 'react';
import {
  Maximize2,
  Columns,
  Grid,
  Layout,
  Layers,
  Sparkles,
  Flame,
  Volume2,
  FileText,
  UserPlus,
  Video,
  Mic,
  Camera,
  RotateCcw,
  Zap,
  Radio,
  Sliders,
  X,
  Monitor,
  MessageSquare,
} from 'lucide-react';
import { BroadcastViewMode, TransitionEffect, Participant } from '../types';
import {
  playStingerSound,
  playBreakingAlarmSound,
  playCameraCutSound,
  playTeletypeSound,
} from '../utils/audioSynthesizer';

interface DirectorSwitcherProps {
  viewMode: BroadcastViewMode;
  onSelectViewMode: (mode: BroadcastViewMode) => void;
  transitionEffect: TransitionEffect;
  onSelectTransitionEffect: (effect: TransitionEffect) => void;
  isBreakingNews: boolean;
  onToggleBreakingNews: () => void;
  autoDirector: boolean;
  onToggleAutoDirector: () => void;
  onOpenTeleprompter: () => void;
  onOpenAiProducer?: () => void;
  onOpenStaffRoster?: () => void;
  onOpenTaskRooms?: () => void;
  onOpenAddGuest: () => void;
  onClose: () => void;
  isHostWebcamActive: boolean;
  onToggleHostWebcam: () => void;
  isHostMicMuted: boolean;
  onToggleHostMic: () => void;
  isScreenShareActive?: boolean;
  onToggleScreenShare?: () => void;
  participants?: Participant[];
  activeSpeakerId?: string;
  onSelectSpeaker?: (id: string) => void;
  onOpenGoogleChat?: () => void;
}

export const DirectorSwitcher: React.FC<DirectorSwitcherProps> = ({
  viewMode,
  onSelectViewMode,
  transitionEffect,
  onSelectTransitionEffect,
  isBreakingNews,
  onToggleBreakingNews,
  autoDirector,
  onToggleAutoDirector,
  onOpenTeleprompter,
  onOpenAiProducer,
  onOpenStaffRoster,
  onOpenTaskRooms,
  onOpenAddGuest,
  onClose,
  isHostWebcamActive,
  onToggleHostWebcam,
  isHostMicMuted,
  onToggleHostMic,
  isScreenShareActive = false,
  onToggleScreenShare,
  participants = [],
  activeSpeakerId = '',
  onSelectSpeaker,
  onOpenGoogleChat,
}) => {
  const layouts: { mode: BroadcastViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'solo', label: 'ANCHOR SOLO', icon: <Maximize2 className="w-4 h-4" /> },
    { mode: 'split', label: '2-BOX SPLIT', icon: <Columns className="w-4 h-4" /> },
    { mode: 'triple', label: '3-BOX PANEL', icon: <Layout className="w-4 h-4" /> },
    { mode: 'quad', label: '4-BOX QUAD', icon: <Grid className="w-4 h-4" /> },
    { mode: 'hero', label: 'HERO + STRIP', icon: <Layers className="w-4 h-4" /> },
    { mode: 'matrix', label: '6-BOX MATRIX', icon: <Grid className="w-4 h-4" /> },
  ];

  const transitions: { effect: TransitionEffect; label: string }[] = [
    { effect: 'stinger', label: 'STINGER WIPE' },
    { effect: 'dissolve', label: 'DISSOLVE' },
    { effect: 'push', label: 'CAMERA PUSH' },
    { effect: 'zoom', label: 'MATRIX ZOOM' },
    { effect: 'glitch', label: 'SAT GLITCH' },
  ];

  // Set of participant IDs that are currently on-air in program feed
  const onAirParticipantIds = React.useMemo(() => {
    const ids = new Set<string>();
    const anchor = participants.find((p) => p.isAnchor) || participants[0];
    const active = participants.find((p) => p.id === activeSpeakerId) || anchor;
    const nonAnchorGuests = participants.filter((p) => p.id !== anchor?.id);

    switch (viewMode) {
      case 'solo': {
        const solo = active || anchor;
        if (solo) ids.add(solo.id);
        break;
      }
      case 'split': {
        if (anchor) ids.add(anchor.id);
        const guest = nonAnchorGuests[0] || participants[1] || anchor;
        if (guest) ids.add(guest.id);
        break;
      }
      case 'triple': {
        if (anchor) ids.add(anchor.id);
        const guest1 = nonAnchorGuests[0] || participants[1];
        const guest2 = nonAnchorGuests[1] || participants[2] || anchor;
        if (guest1) ids.add(guest1.id);
        if (guest2) ids.add(guest2.id);
        break;
      }
      case 'quad': {
        participants.slice(0, 4).forEach((p) => ids.add(p.id));
        break;
      }
      case 'hero':
      case 'matrix':
      default: {
        participants.forEach((p) => ids.add(p.id));
        break;
      }
    }
    return ids;
  }, [viewMode, participants, activeSpeakerId]);

  return (
    <aside
      id="director-switcher-panel"
      className="w-full sm:w-80 lg:w-96 liquid-glass-elevated border-l border-[#204a3f] shadow-2xl flex flex-col justify-between overflow-y-auto z-40 p-4 select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#204a3f]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFC72C] animate-ping" />
            <h2 className="font-fets-title font-black text-lg text-white tracking-wider uppercase">
              VISION MIXER / DIRECTOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#659487] hover:text-white p-1 rounded-full hover:bg-[#13322b] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Camera View Modes */}
        <div className="mt-4">
          <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider block mb-2">
            BROADCAST CAMERA COMPOSITION
          </label>
          <div className="grid grid-cols-2 gap-2">
            {layouts.map((item) => (
              <button
                key={item.mode}
                onClick={() => {
                  playCameraCutSound();
                  onSelectViewMode(item.mode);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-fets-title font-bold tracking-wider transition-all border cursor-pointer ${
                  viewMode === item.mode
                    ? 'bg-[#FFC72C] text-[#081412] border-[#FFC72C] shadow-[0_0_12px_rgba(255,199,44,0.5)]'
                    : 'bg-[#0d221e]/90 text-slate-200 border-[#235247] hover:border-[#387e6f] hover:bg-[#13322b]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Transition Effects */}
        <div className="mt-5">
          <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider block mb-2">
            REAL-TIME TRANSITION EFFECT
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {transitions.map((t) => (
              <button
                key={t.effect}
                onClick={() => {
                  playCameraCutSound();
                  onSelectTransitionEffect(t.effect);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-tech font-semibold tracking-wider text-center transition-all border cursor-pointer ${
                  transitionEffect === t.effect
                    ? 'bg-[#00D084] text-[#061e15] border-[#00D084] font-bold shadow-[0_0_10px_rgba(0,208,132,0.5)]'
                    : 'bg-[#0a1e19] text-slate-300 border-[#1f4a3f] hover:bg-[#123129]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Studio Participants & Camera Tally Monitor */}
        {participants.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider">
                STUDIO FEEDS & TALLY (CLICK TO CUT)
              </label>
              <span className="text-[10px] font-tech text-red-400 font-semibold">
                RED = ACTIVE / ON-AIR
              </span>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
              {participants.map((p) => {
                const isSpeaker = p.id === activeSpeakerId || p.isSpeaking;
                const isOnAir = onAirParticipantIds.has(p.id);
                const shouldPulseRed = isSpeaker || isOnAir;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playCameraCutSound();
                      onSelectSpeaker?.(p.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none bg-[#091b17]/90 ${
                      shouldPulseRed
                        ? isSpeaker && p.isSpeaking
                          ? 'border-2 border-red-500 animate-pulse-border-red-active bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : 'border-2 border-red-500 animate-pulse-border-red bg-red-950/25 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                        : 'border border-[#1f483d] hover:border-[#357c6b] hover:bg-[#102d26]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center shrink-0">
                        {shouldPulseRed ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full h-2 w-2 bg-[#2d5f53]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-fets-title font-bold text-white tracking-wider truncate">
                            {p.name}
                          </span>
                          <span className="text-[9px] font-tech text-[#FFC72C] bg-[#071612] px-1.5 py-0.2 rounded-full border border-[#275549] shrink-0">
                            {p.cameraLabel.split('•')[0]?.trim() || p.cameraLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-tech text-[#689487] truncate block">
                          {p.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {shouldPulseRed ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-tech font-bold uppercase tracking-wider bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                          {isSpeaker ? 'ACTIVE' : 'ON-AIR'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-tech text-[#4e796e] bg-[#071612] border border-[#1b443a]">
                          STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Director Automation & Breaking Alerts */}
        <div className="mt-5 space-y-2">
          <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider block">
            MASTER CONTROLS
          </label>

          {/* Breaking News Toggle */}
          <button
            onClick={() => {
              playBreakingAlarmSound();
              onToggleBreakingNews();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-fets-title font-black tracking-wider text-sm transition-all border cursor-pointer ${
              isBreakingNews
                ? 'bg-gradient-to-r from-[#FF5A36] to-red-700 text-white border-[#FF5A36] shadow-[0_0_20px_rgba(255,90,54,0.8)] animate-pulse'
                : 'bg-[#181112] text-[#ff8e7b] border-[#552721] hover:bg-[#251515]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FFC72C]" />
              <span>BREAKING NEWS MODE</span>
            </div>
            <span className="text-xs font-tech">{isBreakingNews ? 'ON AIR [HOT]' : 'STANDBY'}</span>
          </button>

          {/* Auto Director Toggle */}
          <button
            onClick={() => {
              playCameraCutSound();
              onToggleAutoDirector();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-fets-title font-bold tracking-wider transition-all border cursor-pointer ${
              autoDirector
                ? 'bg-[#00D084] text-[#061e15] border-[#00D084] shadow-[0_0_12px_rgba(0,208,132,0.5)]'
                : 'bg-[#0a1e19] text-slate-300 border-[#1f4a3f] hover:bg-[#123129]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>AUTO-DIRECTOR (ACTIVE SPEAKER)</span>
            </div>
            <span className="text-[10px] font-tech">{autoDirector ? 'ACTIVE' : 'MANUAL'}</span>
          </button>
        </div>

        {/* 4. Studio Sound Effects Pads */}
        <div className="mt-5">
          <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider block mb-2">
            BROADCAST SOUND FX PADS
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={playStingerSound}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c241e] hover:bg-[#13352c] text-[#FFC72C] border border-[#235347] text-xs font-tech font-bold cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>NEWS STINGER</span>
            </button>
            <button
              onClick={playBreakingAlarmSound}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c241e] hover:bg-[#13352c] text-[#FF5A36] border border-[#235347] text-xs font-tech font-bold cursor-pointer transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>BREAKING WHOOSH</span>
            </button>
            <button
              onClick={playTeletypeSound}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c241e] hover:bg-[#13352c] text-[#00D084] border border-[#235347] text-xs font-tech font-bold cursor-pointer transition-colors"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>TELETYPE CLICKS</span>
            </button>
            <button
              onClick={playCameraCutSound}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c241e] hover:bg-[#13352c] text-slate-300 border border-[#235347] text-xs font-tech font-bold cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>SWITCHER CUT</span>
            </button>
          </div>
        </div>

        {/* 5. Production Tools: Teleprompter, Add Guest & AI Producer */}
        <div className="mt-5 space-y-2">
          <label className="text-[11px] font-tech text-[#659487] font-bold uppercase tracking-wider block">
            STUDIO PRODUCTION TOOLS
          </label>

          {onOpenGoogleChat && (
            <button
              onClick={onOpenGoogleChat}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#112d26] hover:bg-[#163a31] text-[#7ce2ca] border border-[#2a685b] text-xs font-fets-title font-bold tracking-wider shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00D084]" />
                <span>FETS GOOGLE CHAT & MEET</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
            </button>
          )}

          {onOpenStaffRoster && (
            <button
              onClick={onOpenStaffRoster}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#122c24] hover:bg-[#18392f] text-[#00D084] border border-[#23584a] text-xs font-fets-title font-bold tracking-wider cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00D084] animate-pulse" />
                <span>24/7 STAFF ROSTER & 1-ON-1 INTERCOM</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40">
                8 LIVE
              </span>
            </button>
          )}

          {onOpenTaskRooms && (
            <button
              onClick={onOpenTaskRooms}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c231e] hover:bg-[#12332c] text-[#7ce2ca] border border-[#1f4e42] text-xs font-fets-title font-bold tracking-wider cursor-pointer transition-all"
            >
              <Layers className="w-4 h-4 text-[#7ce2ca]" />
              <span>TASK BREAKOUT MEETING ROOMS</span>
            </button>
          )}

          <button
            onClick={onOpenAddGuest}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1b2512] hover:bg-[#253319] text-[#FFC72C] border border-[#48591f] text-xs font-fets-title font-bold tracking-wider cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#FFC72C]" />
            <span>BRING OUTSIDE GUEST (INTERVIEW / COACHING)</span>
          </button>

          <button
            onClick={onOpenTeleprompter}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c231e] hover:bg-[#12332c] text-[#9bd9cb] border border-[#1f4e42] text-xs font-fets-title font-bold tracking-wider cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4 text-[#00D084]" />
            <span>ANCHOR TELEPROMPTER DESK</span>
          </button>
        </div>
      </div>

      {/* Anchor / Host Camera Hardware Dock at bottom */}
      <div className="mt-6 pt-3 border-t border-[#1f4a3f]">
        <label className="text-[10px] font-tech text-[#4e796e] uppercase tracking-wider block mb-1.5">
          ANCHOR PHYSICAL HARDWARE
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHostWebcam}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-tech font-bold border transition-colors cursor-pointer ${
              isHostWebcamActive
                ? 'bg-[#00D084]/20 text-[#00D084] border-[#00D084]'
                : 'bg-[#0a1e19] text-slate-400 border-[#1f4a3f] hover:bg-[#123129]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isHostWebcamActive ? 'WEBCAM ON' : 'ENABLE CAM'}</span>
          </button>

          <button
            onClick={onToggleHostMic}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-tech font-bold border transition-colors cursor-pointer ${
              !isHostMicMuted
                ? 'bg-[#00D084]/20 text-[#00D084] border-[#00D084]'
                : 'bg-red-950/80 text-red-300 border-red-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isHostMicMuted ? 'MIC MUTED' : 'MIC LIVE'}</span>
          </button>
        </div>

        {onToggleScreenShare && (
          <div className="mt-2">
            <button
              onClick={onToggleScreenShare}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-tech font-bold border transition-colors cursor-pointer ${
                isScreenShareActive
                  ? 'bg-[#00D084] text-[#061e15] border-[#00D084] font-bold shadow-[0_0_10px_rgba(0,208,132,0.4)]'
                  : 'bg-[#0a1e19] text-slate-400 border-[#1f4a3f] hover:bg-[#123129]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isScreenShareActive ? 'SCREEN SHARE ON AIR' : 'START DESK SCREEN SHARE'}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
