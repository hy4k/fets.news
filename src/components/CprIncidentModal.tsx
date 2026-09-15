import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  Send,
  X,
  Radio,
  Tv,
  CheckCircle2,
  Cpu,
  User,
  Package,
  Briefcase,
  Shield,
} from 'lucide-react';
import { playBreakingAlarmSound, playStingerSound, playCameraCutSound } from '../utils/audioSynthesizer';

interface CprIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBreakingActive: boolean;
  onTriggerBreakingAlert: (headline: string, category: string, urgency: 'BREAKING' | 'DEVELOPING') => void;
  staffName?: string;
  bureau?: string;
}

const CPR_PRESETS = [
  {
    category: 'Candidate',
    title: 'Biometric ID verification retry resolved on Pod 14',
    urgency: 'DEVELOPING' as const,
  },
  {
    category: 'Technical',
    title: 'Pearson VUE exam asset re-download completed; candidate resumed',
    urgency: 'DEVELOPING' as const,
  },
  {
    category: 'Technical',
    title: 'URGENT: Router failover to backup optical fiber link initiated',
    urgency: 'BREAKING' as const,
  },
  {
    category: 'Vendor',
    title: 'Prometric CMA US cloud server intake delay acknowledged by vendor',
    urgency: 'BREAKING' as const,
  },
  {
    category: 'Facility',
    title: 'Testing Lab climate control normalized to 21°C following sensor check',
    urgency: 'DEVELOPING' as const,
  },
];

export const CprIncidentModal: React.FC<CprIncidentModalProps> = ({
  isOpen,
  onClose,
  isBreakingActive,
  onTriggerBreakingAlert,
  staffName = 'Mithun',
  bureau = 'Calicut',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'Candidate' | 'Technical' | 'Facility' | 'Vendor' | 'Security'
  >('Technical');
  const [selectedBranch, setSelectedBranch] = useState<'Calicut' | 'Cochin'>(
    bureau.includes('Cochin') ? 'Cochin' : 'Calicut'
  );
  const [podNumber, setPodNumber] = useState<string>('Pod 12');
  const [customHeadline, setCustomHeadline] = useState<string>(
    'PEARSON VUE RMA RETRY INITIATED ON POD 12 • CANDIDATE SESSION SECURED'
  );
  const [urgency, setUrgency] = useState<'BREAKING' | 'DEVELOPING'>('BREAKING');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof CPR_PRESETS[0]) => {
    playCameraCutSound();
    setSelectedCategory(preset.category as any);
    setUrgency(preset.urgency);
    setCustomHeadline(`${selectedBranch.toUpperCase()}: ${preset.title.toUpperCase()}`);
  };

  const handleSubmit = () => {
    if (urgency === 'BREAKING') {
      playBreakingAlarmSound();
    } else {
      playStingerSound();
    }
    const finalHeadline = customHeadline.trim()
      ? customHeadline.trim()
      : `${selectedBranch.toUpperCase()} ${selectedCategory.toUpperCase()} INCIDENT ON ${podNumber.toUpperCase()}`;
    onTriggerBreakingAlert(finalHeadline, selectedCategory, urgency);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a1815] border border-red-800/60 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar with Alert Stinger */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-red-950 via-[#180907] to-[#0a1815] border-b border-red-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-fets-title font-black text-base shadow-[0_0_15px_rgba(220,38,38,0.7)] animate-pulse">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fets-title font-black text-white text-base tracking-wide uppercase">
                  CPR INCIDENT MANAGER & BREAKING ALERT DESK
                </h2>
                <span className="text-[10px] font-tech font-bold px-1.5 py-0.2 rounded bg-red-600/30 text-red-400 border border-red-500/50 uppercase">
                  ON AIR OVERRIDE
                </span>
              </div>
              <p className="text-xs text-red-200/80 font-sans-ui">
                Broadcast priority Candidate Problem Reports (CPRs) & operational incidents live to all screens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Centre & Pod Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#140e0d] border border-red-900/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech text-red-300 font-semibold uppercase">CENTRE:</span>
              {(['Calicut', 'Cochin'] as const).map((branch) => (
                <button
                  key={branch}
                  onClick={() => {
                    playCameraCutSound();
                    setSelectedBranch(branch);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-fets-title font-bold transition-all cursor-pointer ${
                    selectedBranch === branch
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)]'
                      : 'bg-[#231513] text-slate-300 hover:text-white border border-red-950'
                  }`}
                >
                  {branch.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-tech text-red-300 font-semibold uppercase">POD:</span>
              <input
                type="text"
                value={podNumber}
                onChange={(e) => setPodNumber(e.target.value)}
                placeholder="Pod 07"
                className="w-24 bg-[#231513] text-white text-xs font-fets-title px-2.5 py-1 rounded-lg border border-red-900/60 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-tech text-red-300 font-semibold uppercase">URGENCY:</span>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="bg-[#231513] text-white text-xs font-fets-title px-2 py-1 rounded-lg border border-red-900/60 focus:outline-none"
              >
                <option value="BREAKING">BREAKING (RED ALERT)</option>
                <option value="DEVELOPING">DEVELOPING (YELLOW)</option>
              </select>
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-tech text-slate-300 font-semibold uppercase">
              INCIDENT CATEGORY (FETS SPEC):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'Candidate', icon: User, label: 'Candidate' },
                  { id: 'Technical', icon: Cpu, label: 'Technical' },
                  { id: 'Facility', icon: Package, label: 'Facility' },
                  { id: 'Vendor', icon: Briefcase, label: 'Vendor' },
                  { id: 'Security', icon: Shield, label: 'Security' },
                ] as const
              ).map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playCameraCutSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-fets-title transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-900/50 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'bg-[#150f0e] border-[#291715] text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-tech text-[#8fa8a1] font-semibold uppercase">
              QUICK OPERATIONAL PRESETS:
            </span>
            <div className="space-y-1.5">
              {CPR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-[#120b0a] hover:bg-[#1a0f0d] border border-[#2a1412] hover:border-red-900/80 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] font-tech text-red-400 shrink-0 uppercase font-bold">
                    {p.urgency}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Headline Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-tech text-red-300 font-semibold uppercase">
              LIVE BROADCAST LOWER-THIRD HEADLINE:
            </label>
            <textarea
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              rows={2}
              className="w-full bg-[#140b09] border border-red-900/60 rounded-xl p-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-red-500 font-fets-title"
              placeholder="Enter on-air breaking incident headline..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#0f0706] border-t border-red-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-fets-title cursor-pointer transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-fets-title font-black tracking-wider uppercase transition-all shadow-[0_0_18px_rgba(220,38,38,0.7)] cursor-pointer"
          >
            <Flame className="w-4 h-4 animate-bounce" />
            <span>TRIGGER ON-AIR BREAKING ALERT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
