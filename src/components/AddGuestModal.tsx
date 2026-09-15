import React, { useState } from 'react';
import { UserPlus, X, MapPin, Globe, Check, Video, Monitor, Radio } from 'lucide-react';
import { Participant, LiveFeedSourceType } from '../types';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Omit<Participant, 'id'>) => void;
}

const PRESET_BUREAUS = [
  {
    role: 'SENIOR DEFENSE CORRESPONDENT',
    location: 'LIVE • WASHINGTON D.C.',
    ticker: 'PENTAGON BRIEFING • STRATEGIC ACCORD REVIEW • FEED LOCKED',
    themeColor: 'from-[#1e293b] to-[#0f172a]',
    preset: 'capitol_skyline' as const,
  },
  {
    role: 'CHIEF FINANCIAL ANALYST',
    location: 'WALL STREET BUREAU • NEW YORK',
    ticker: 'MARKET CLOSE • NYSE ADVANCES 1.2% • BOND YIELDS STABLE',
    themeColor: 'from-[#064e3b] to-[#022c22]',
    preset: 'trading_floor' as const,
  },
  {
    role: 'EUROPEAN BUREAU CHIEF',
    location: 'LIVE VIA SATELLITE • GENEVA',
    ticker: 'DIPLOMATIC SUMMIT • 42 DELEGATIONS ASSEMBLE • UPLINK OPTIMAL',
    themeColor: 'from-[#1e3a8a] to-[#172554]',
    preset: 'satellite_orbit' as const,
  },
  {
    role: 'ASIA-PACIFIC TECH CORRESPONDENT',
    location: 'TOKYO BUREAU • JAPAN',
    ticker: 'SEMICONDUCTOR INITIATIVE • NIKKEI FUTURES +180 • 1080p60',
    themeColor: 'from-[#581c87] to-[#3b0764]',
    preset: 'trading_floor' as const,
  },
  {
    role: 'SPECIAL INVESTIGATIVE REPORTER',
    location: 'FIELD FEED • CAPITOL HILL',
    ticker: 'SENATE HEARINGS UNDERWAY • TESTIMONY ADVANCES • 5G STREAM',
    themeColor: 'from-[#7c2d12] to-[#451a03]',
    preset: 'capitol_skyline' as const,
  },
];

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState(PRESET_BUREAUS[0].role);
  const [location, setLocation] = useState(PRESET_BUREAUS[0].location);
  const [organization, setOrganization] = useState('GLOBAL BROADCAST POOL');
  const [windowTicker, setWindowTicker] = useState(PRESET_BUREAUS[0].ticker);
  const [feedType, setFeedType] = useState<LiveFeedSourceType>('motion_canvas');
  const [videoPreset, setVideoPreset] = useState<'satellite_orbit' | 'capitol_skyline' | 'trading_floor' | 'newsroom_hq'>('capitol_skyline');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_BUREAUS)[0]) => {
    setRole(preset.role);
    setLocation(preset.location);
    setWindowTicker(preset.ticker);
    setVideoPreset(preset.preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGuest({
      name: name.trim().toUpperCase(),
      role: role.trim().toUpperCase(),
      location: location.trim(),
      organization: organization.trim().toUpperCase(),
      isAnchor: false,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
      audioLevel: 0,
      streamType: feedType,
      signalQuality: '1080p60',
      latencyMs: Math.floor(Math.random() * 40) + 15,
      cameraLabel: `SAT • ${location.split('•')[0].trim().toUpperCase()}`,
      windowTicker: windowTicker.trim(),
      videoPreset: videoPreset,
      themeColor: 'from-[#111827] via-[#1f2937] to-[#0f172a]',
    });

    setName('');
    onClose();
  };

  return (
    <div
      id="add-guest-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="w-full max-w-md bg-[#0a0f1e] border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-broadcast font-bold text-white text-base tracking-wider uppercase">
              CONNECT REMOTE CORRESPONDENT FEED
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Presets */}
          <div>
            <label className="text-[11px] font-tech text-slate-400 block mb-1.5 uppercase">
              SELECT BUREAU PRESET:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_BUREAUS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-2 rounded text-[11px] font-tech border transition-colors ${
                    role === p.role
                      ? 'bg-blue-950 border-blue-500 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold truncate">{p.location}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1">
              SPEAKER FULL NAME:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ELENA VANCE"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-sans-ui focus:outline-none focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1">
              CHYRON TITLE / ROLE:
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-sans-ui focus:outline-none focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1">
              BROADCAST LOCATION:
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-sans-ui focus:outline-none focus:border-blue-500 uppercase"
            />
          </div>

          {/* Live Feed Input Source */}
          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1 uppercase">
              INITIAL LIVE FEED SOURCE:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFeedType('motion_canvas')}
                className={`p-2 rounded border text-left flex flex-col justify-between ${
                  feedType === 'motion_canvas'
                    ? 'bg-amber-950/80 border-amber-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 mb-1" />
                <span className="text-[11px] font-bold">AUDIO VISUALIZER</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedType('webcam')}
                className={`p-2 rounded border text-left flex flex-col justify-between ${
                  feedType === 'webcam'
                    ? 'bg-red-950/80 border-red-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-red-400 mb-1" />
                <span className="text-[11px] font-bold">LIVE WEBCAM</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedType('screenshare')}
                className={`p-2 rounded border text-left flex flex-col justify-between ${
                  feedType === 'screenshare'
                    ? 'bg-blue-950/80 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-blue-400 mb-1" />
                <span className="text-[11px] font-bold">SCREEN SHARE</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1">
              SUBTLE WINDOW TICKER OVERLAY:
            </label>
            <input
              type="text"
              value={windowTicker}
              onChange={(e) => setWindowTicker(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-sans-ui focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-broadcast font-bold tracking-wider py-2.5 rounded text-sm uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>ACTIVATE BROADCAST FEED</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
