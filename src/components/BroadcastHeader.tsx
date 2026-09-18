import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Sparkles,
  Sliders,
  Video,
  Monitor,
  Share2,
  MessageSquare,
  Radio,
  Users,
  Flame,
  FileText,
  UserPlus,
  Play,
  Activity,
  CheckCircle2,
  UserCheck,
  Globe,
  Tv,
} from 'lucide-react';
import { playCameraCutSound } from '../utils/audioSynthesizer';

interface BroadcastHeaderProps {
  isBreakingNews: boolean;
  activeStoryTopic: string;
  onToggleDirector: () => void;
  isDirectorOpen: boolean;
  onOpenAiProducer?: () => void;
  onOpenStaffRoster?: () => void;
  onOpenTaskRooms?: () => void;
  onOpenOutsideGuest?: () => void;
  onlineStaffCount?: number;
  activeMeetingMode?: 'all_hands' | 'one_on_one' | 'task_group';
  active1on1PartnerName?: string;
  activeSpeakerName?: string;
  isWebcamActive?: boolean;
  onToggleWebcam?: () => void;
  isScreenShareActive?: boolean;
  onToggleScreenShare?: () => void;
  onOpenShare?: () => void;
  onOpenAccreditation?: () => void;
  userName?: string;
  userDesignation?: string;
  onOpenGoogleChat?: () => void;
  onRaiseCase?: () => void;
  onShiftHandover?: () => void;
  onQuickAccess?: () => void;
  onHelpDesk?: () => void;
  isLiveBroadcasting?: boolean;
  onToggleLiveBroadcast?: () => void;
  selectedBureau?: string;
  onSelectBureau?: (bureau: string) => void;
  activeNavTab?: string;
  onSelectNavTab?: (tab: string) => void;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  isBreakingNews,
  activeStoryTopic,
  onToggleDirector,
  isDirectorOpen,
  onOpenStaffRoster,
  onOpenTaskRooms,
  onOpenOutsideGuest,
  onlineStaffCount = 8,
  activeMeetingMode = 'all_hands',
  active1on1PartnerName,
  activeSpeakerName,
  isWebcamActive = false,
  onToggleWebcam,
  isScreenShareActive = false,
  onToggleScreenShare,
  onOpenShare,
  onOpenAccreditation,
  userName,
  userDesignation,
  onOpenGoogleChat,
  onRaiseCase,
  onShiftHandover,
  onQuickAccess,
  onHelpDesk,
  isLiveBroadcasting = true,
  onToggleLiveBroadcast,
  selectedBureau = 'ALL CENTRES',
  onSelectBureau,
  activeNavTab = '24/7 LIVE STUDIO',
  onSelectNavTab,
}) => {
  const [internalTab, setInternalTab] = useState<string>('24/7 LIVE STUDIO');
  const [internalBureau, setInternalBureau] = useState<string>('ALL CENTRES');
  const [currentFormattedDate, setCurrentFormattedDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const currentTab = activeNavTab || internalTab;
  const currentBureau = selectedBureau || internalBureau;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      const day = now.getDate();
      const year = now.getFullYear();

      const getOrdinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      setCurrentFormattedDate(`${weekday}, ${month} ${getOrdinal(day)}, ${year}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = userName?.trim() ? userName : 'Director Desk';
  const displayRole = userDesignation?.trim() ? userDesignation : 'Command Lead';
  const userInitial = displayName.charAt(0).toUpperCase() || 'D';

  const handleTabChange = (tab: string) => {
    playCameraCutSound();
    setInternalTab(tab);
    onSelectNavTab?.(tab);
  };

  const handleBureauChange = (bureau: string) => {
    playCameraCutSound();
    setInternalBureau(bureau);
    onSelectBureau?.(bureau);
  };

  return (
    <header className="relative z-30 w-full px-3 sm:px-5 pt-2 pb-1 flex flex-col gap-1.5 select-none shrink-0">
      {/* ========================================================================= */}
      {/* 1. PRIMARY BROADCAST MASTER CONTROL BAR */}
      {/* ========================================================================= */}
      <nav
        id="fets-top-nav"
        className="w-full liquid-glass rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-xl transition-all"
      >
        {/* Left Side: Brand badge & primary studio modes */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* FETS NEWS Brand Emblem */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-[#265349]/50 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFC72C] text-[#081412] font-fets-title font-black text-base flex items-center justify-center shadow-[0_0_10px_rgba(255,199,44,0.35)]">
              F
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-fets-title font-black text-xs tracking-wider text-[#FFC72C]">FETS</span>
                <span className="font-fets-title font-bold text-xs tracking-wider text-white">NEWS</span>
              </div>
              <span className="font-tech text-[8px] text-[#00D084] font-bold tracking-wider">24/7 LIVE</span>
            </div>
          </div>

          {/* Broadcast Studio Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-3 font-fets-title font-bold text-xs tracking-wider overflow-x-auto py-0.5">
            {(['24/7 LIVE STUDIO', '1-ON-1 INTERCOM', 'TASK ROOMS', 'GUEST UPLINK'] as const).map((tab) => {
              const isActive = currentTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    handleTabChange(tab);
                    if (tab === '1-ON-1 INTERCOM') onOpenStaffRoster?.();
                    if (tab === 'TASK ROOMS') onOpenTaskRooms?.();
                    if (tab === 'GUEST UPLINK') onOpenOutsideGuest?.();
                  }}
                  className={`relative px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#123129] text-[#FFC72C] shadow-[0_0_10px_rgba(255,199,44,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-[#0c221c]'
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#FFC72C]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Bureau Selector, Telemetry & Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Real-time Broadcast Signal Telemetry Chip */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#102722]/80 border border-[#235247]/60 text-slate-300 text-[10px] font-tech">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
            <span className="text-[#00D084] font-bold">1080p60</span>
            <span className="text-[#2c5b4e]">|</span>
            <span className="text-slate-300">LOCKED</span>
          </div>

          {/* News Bureau Selector (ALL CENTRES, CALICUT, COCHIN, GLOBAL MCR) */}
          <div className="hidden lg:flex items-center p-0.5 rounded-full bg-[#0a1b17]/90 border border-[#224f44]/60 text-[11px]">
            {(['ALL CENTRES', 'CALICUT', 'COCHIN', 'GLOBAL MCR'] as const).map((bureau) => {
              const isSelected = currentBureau === bureau || (currentBureau.includes(bureau) && bureau !== 'ALL CENTRES');
              return (
                <button
                  key={bureau}
                  onClick={() => handleBureauChange(bureau)}
                  className={`px-2.5 py-0.5 rounded-full font-fets-title transition-all cursor-pointer text-[10px] ${
                    isSelected
                      ? 'liquid-pill-active'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bureau}
                </button>
              );
            })}
          </div>

          {/* 24/7 Staff Reachability Roster Button */}
          <button
            id="header-staff-roster-btn"
            onClick={onOpenStaffRoster}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-fets-title font-bold tracking-wider transition-all border bg-[#112d26] border-[#255d50] text-[#00D084] hover:text-white hover:border-[#00D084] shadow-sm cursor-pointer"
            title="24/7 Active Staff Roster & 1-on-1 Direct Intercom"
          >
            <Radio className="w-3.5 h-3.5 text-[#00D084] animate-pulse" />
            <span className="whitespace-nowrap">STAFF ({onlineStaffCount})</span>
          </button>

          {/* Outside Guest Invite Button */}
          <button
            id="outside-guest-btn"
            onClick={onOpenOutsideGuest}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-fets-title font-bold tracking-wider transition-all border bg-[#1b2512]/80 border-[#475720] text-[#FFC72C] hover:text-white hover:border-[#FFC72C] cursor-pointer shadow-sm"
            title="Bring Outside Guest (Coaching Class / Interview)"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span className="whitespace-nowrap">GUEST</span>
          </button>

          {/* Google Chat & Meet Engine Toggle */}
          {onOpenGoogleChat && (
            <button
              id="header-google-chat-btn"
              onClick={onOpenGoogleChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-fets-title font-bold tracking-wider transition-all border bg-[#102924]/90 border-[#2a6356] text-[#7ce2ca] hover:text-white hover:border-[#00D084] shadow-sm cursor-pointer"
              title="Open FETS Google Chat Space & Google Meet Bridge"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00D084]" />
              <span className="hidden md:inline">CHAT</span>
            </button>
          )}

          {/* Director Switcher Toggle */}
          <button
            id="director-toggle-btn"
            onClick={onToggleDirector}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-fets-title font-bold tracking-wider transition-all border cursor-pointer ${
              isDirectorOpen
                ? 'bg-[#FFC72C] text-[#081412] border-[#FFC72C] shadow-[0_0_10px_rgba(255,199,44,0.4)]'
                : 'bg-[#102722]/80 hover:bg-[#15342d] text-slate-200 border-[#235247]'
            }`}
            title="Director Switcher & Camera Matrix"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SWITCHER</span>
          </button>

          {/* On-Air TCA Administrator Accreditation Button */}
          <button
            onClick={onOpenAccreditation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#27584e] bg-[#0d221e]/80 hover:bg-[#14322c] text-slate-200 hover:text-white text-xs font-fets-title transition-all cursor-pointer"
            title="TCA Administrator credentials & camera input settings"
          >
            <div className="w-4 h-4 rounded-full bg-[#FFC72C] text-[#081412] font-black text-[10px] flex items-center justify-center">
              {userInitial}
            </div>
            <span className="hidden md:inline font-bold truncate max-w-[90px]">{displayName}</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. SLEEK STATUS STRIP (Active Desk Tally, Location & Shift Handover) */}
      {/* ========================================================================= */}
      <div className="w-full flex items-center justify-between gap-2 px-1 text-xs">
        {/* Left: Active Meeting State / On-Air Desk Mode */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700/60 text-white font-tech font-bold text-[10px] tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{isBreakingNews ? 'BREAKING ALERT' : 'ON AIR'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#709b8f] font-tech text-[11px] truncate">
            {activeMeetingMode === 'one_on_one' && active1on1PartnerName ? (
              <span className="text-[#00D084] font-bold flex items-center gap-1 truncate">
                <Radio className="w-3 h-3 text-[#00D084] animate-pulse" />
                <span>1-ON-1 INTERCOM: {displayName.toUpperCase()} ↔ {active1on1PartnerName.toUpperCase()}</span>
              </span>
            ) : (
              <span className="truncate text-slate-300 font-medium">
                {activeStoryTopic}
              </span>
            )}
          </div>
        </div>

        {/* Right: Date, Real Clock & Emergency/Shift Controls */}
        <div className="flex items-center gap-2 shrink-0 font-tech text-[11px] text-[#6d998e]">
          <span className="hidden sm:inline text-[#dfbf6e] font-sans-ui text-xs">
            {currentFormattedDate}
          </span>
          <span className="hidden sm:inline text-[#235246]">|</span>
          <span className="text-[#00D084] font-bold bg-[#091b17] px-2 py-0.5 rounded border border-[#1b4338]">
            {time}
          </span>

          {onShiftHandover && (
            <button
              onClick={onShiftHandover}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-fets-title font-bold bg-[#0d2520] hover:bg-[#13372f] text-[#7ce2ca] border border-[#235549] transition-all cursor-pointer"
              title="Shift Handover & Debrief"
            >
              <span>SHIFT HANDOVER</span>
            </button>
          )}

          {onRaiseCase && (
            <button
              onClick={onRaiseCase}
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-fets-title font-bold transition-all cursor-pointer border ${
                isBreakingNews
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-[#1e150f] hover:bg-[#2e1d13] text-[#FF5A36] border-[#4a2618]'
              }`}
              title="Trigger Breaking Alert / CPR"
            >
              <span>ALERT</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

