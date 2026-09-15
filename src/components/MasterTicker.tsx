import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, Globe, Flame, Edit3, Check } from 'lucide-react';

interface MasterTickerProps {
  isBreaking: boolean;
  breakingHeadline: string;
  tickers: string[];
  onUpdateBreakingHeadline?: (newHeadline: string) => void;
}

export const MasterTicker: React.FC<MasterTickerProps> = ({
  isBreaking,
  breakingHeadline,
  tickers,
  onUpdateBreakingHeadline,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(breakingHeadline);

  const handleSave = () => {
    if (onUpdateBreakingHeadline && editedText.trim()) {
      onUpdateBreakingHeadline(editedText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      id="master-broadcast-ticker"
      className="relative z-30 w-full liquid-glass-elevated border-t border-[#235247] shadow-2xl flex flex-col sm:flex-row items-stretch select-none"
    >
      {/* 1. Left Breaking News Badge / Lead Urgency Strap */}
      <div className="flex items-center shrink-0">
        <div
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-white font-fets-title font-black tracking-wider uppercase text-xs sm:text-sm ${
            isBreaking
              ? 'bg-gradient-to-r from-[#FF5A36] to-red-700 animate-pulse shadow-[0_0_15px_rgba(255,90,54,0.7)]'
              : 'bg-gradient-to-r from-[#143a31] to-[#0c241f] text-[#FFC72C] border-r border-[#26554a]'
          }`}
        >
          {isBreaking ? (
            <Flame className="w-4 h-4 text-amber-200 animate-bounce" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#FFC72C]" />
          )}
          <span>{isBreaking ? 'BREAKING NEWS' : 'NEWSWATCH'}</span>
        </div>

        {/* FETS Operations & Test Pods Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 bg-[#091b17]/90 border-r border-[#1a3f36] font-tech text-[11px] text-slate-300">
          <div className="flex items-center gap-1 text-[#00D084] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>CALICUT: 45/45 PODS</span>
          </div>
          <span className="text-[#2c5b50]">|</span>
          <div className="flex items-center gap-1 text-[#00D084] font-semibold">
            <span>COCHIN: 38/38 PODS</span>
          </div>
          <span className="text-[#2c5b50]">|</span>
          <div className="flex items-center gap-1 text-[#FFC72C] font-semibold">
            <span>RMA: 08:30 SYNCED</span>
          </div>
          <span className="text-[#2c5b50]">|</span>
          <div className="flex items-center gap-1 text-[#38bdf8] font-semibold">
            <span>CMA SEATS: 32 LIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Main Scrolling Headline Stream */}
      <div className="flex-1 overflow-hidden relative flex items-center bg-[#071612]/90 py-1.5 px-3">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full px-2">
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 bg-[#0a1e18] text-white font-fets-title text-sm px-3 py-1 rounded-lg border border-[#00D084] focus:outline-none"
              placeholder="Enter breaking news headline..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <button
              onClick={handleSave}
              className="bg-[#00D084] hover:bg-[#00b370] text-[#061e15] px-3 py-1 rounded-lg text-xs font-fets-title font-black flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>APPLY</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center w-full overflow-hidden">
            {/* Primary Headline Anchor */}
            <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-[#1e463c] mr-3">
              <span className="text-[#FFC72C] font-fets-title font-bold text-xs sm:text-sm tracking-wide uppercase">
                {isBreaking ? 'DEVELOPING:' : 'TOP STORY:'}
              </span>
              <span className="text-white font-fets-title font-bold text-xs sm:text-sm tracking-wide uppercase truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
                {breakingHeadline}
              </span>
              <button
                onClick={() => {
                  setEditedText(breakingHeadline);
                  setIsEditing(true);
                }}
                className="text-[#598478] hover:text-[#00D084] p-0.5 rounded ml-1 cursor-pointer"
                title="Edit breaking news ticker"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            {/* Continuous Marquee for Secondary Ticker Headlines */}
            <div className="relative overflow-hidden w-full whitespace-nowrap">
              <div className="animate-ticker-marquee text-slate-300 font-tech text-[11px] sm:text-xs">
                {tickers.map((item, idx) => (
                  <span key={idx} className="mr-8 inline-flex items-center gap-1.5">
                    <span className="text-[#00D084] font-bold">•</span>
                    <span>{item}</span>
                  </span>
                ))}
                {/* Loop items for uninterrupted marquee */}
                {tickers.map((item, idx) => (
                  <span key={`dup-${idx}`} className="mr-8 inline-flex items-center gap-1.5">
                    <span className="text-[#00D084] font-bold">•</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Status Pill */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#091b17]/80 text-[#00D084] font-tech text-[10px] uppercase tracking-wider border-l border-[#1e463c] shrink-0">
        <Globe className="w-3 h-3 text-[#00D084]" />
        <span>NEWS WIRE SYNC</span>
      </div>
    </div>
  );
};
