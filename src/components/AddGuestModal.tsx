import React, { useState } from 'react';
import { UserPlus, X, MapPin, Globe, Check, Video, Monitor, Radio, ShieldCheck } from 'lucide-react';
import { Participant, LiveFeedSourceType, ExamFeedPreset } from '../types';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (guest: Omit<Participant, 'id'>) => void;
}

const PRESET_BUREAUS: {
  role: string;
  location: string;
  organization: string;
  ticker: string;
  themeColor: string;
  preset: ExamFeedPreset;
}[] = [
  {
    role: 'LEAD TEST CENTRE ADMINISTRATOR (TCA)',
    location: 'LIVE • CALICUT CENTRE (45 PODS)',
    organization: 'FORUM TESTING & EDUCATIONAL SERVICES',
    ticker: 'CALICUT POD COMMAND • 45/45 WORKSTATIONS OPERATIONAL • ZERO BREACHES',
    themeColor: 'from-[#06241c] to-[#041611]',
    preset: 'test_pod_matrix',
  },
  {
    role: 'SENIOR TEST PROCTOR & CMA SPECIALIST',
    location: 'LIVE • COCHIN CENTRE (38 PODS)',
    organization: 'FETS COCHIN BRANCH',
    ticker: 'PROMETRIC CMA US: 14 SEATS LIVE • CELPIP AUDIO STATIONS CALIBRATED',
    themeColor: 'from-[#0b1f2b] to-[#05121b]',
    preset: 'test_pod_matrix',
  },
  {
    role: 'SYSTEMS & RMA INFRASTRUCTURE LEAD',
    location: 'CENTRAL IT & NETWORK DESK • CALICUT',
    organization: 'FETS IT INFRASTRUCTURE',
    ticker: 'PEARSON VUE RMA SYNC: 08:30 IST OK • DUAL FIBRE ROUTERS BALANCED',
    themeColor: 'from-[#172038] to-[#0d1424]',
    preset: 'secure_browser_grid',
  },
  {
    role: 'SHIFT HANDOVER COORDINATOR & AUDITOR',
    location: 'GLOBAL MCR • CENTRAL OPERATIONS',
    organization: 'FORUM TESTING & EDUCATIONAL SERVICES',
    ticker: 'SHIFT 6-DAY ROTATION VERIFIED • INTER-BRANCH 24x7 HOTLINE CONNECTED',
    themeColor: 'from-[#231a08] to-[#140e04]',
    preset: 'operations_mcr',
  },
  {
    role: 'EXTERNAL AUDITOR / VENDOR DESK',
    location: 'PEARSON VUE / ETS REGIONAL DESK',
    organization: 'ACCREDITED TEST DELIVERY PARTNER',
    ticker: 'TEST SECURITY COMPLIANCE: 100% • DVR ARCHIVES SYNCED TO LOCAL VAULT',
    themeColor: 'from-[#1a1429] to-[#0e0a17]',
    preset: 'centre_floor_plan',
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
  const [organization, setOrganization] = useState(PRESET_BUREAUS[0].organization);
  const [windowTicker, setWindowTicker] = useState(PRESET_BUREAUS[0].ticker);
  const [feedType, setFeedType] = useState<LiveFeedSourceType>('motion_canvas');
  const [videoPreset, setVideoPreset] = useState<ExamFeedPreset>('test_pod_matrix');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_BUREAUS)[0]) => {
    setRole(preset.role);
    setLocation(preset.location);
    setOrganization(preset.organization);
    setWindowTicker(preset.ticker);
    setVideoPreset(preset.preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shortLoc = location.includes('•') ? location.split('•')[1].trim() : location;

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
      latencyMs: Math.floor(Math.random() * 20) + 10,
      cameraLabel: `TCA • ${shortLoc.toUpperCase()}`,
      windowTicker: windowTicker.trim(),
      videoPreset: videoPreset,
      themeColor: 'from-[#081814] via-[#0e2a23] to-[#061410]',
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
              placeholder="e.g. MITHUN, ANSHITHA K, NAIMA MM"
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
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold">EXAM VISUALIZER</span>
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
