import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Database,
  Server,
  Building2,
  AlertCircle,
  Clock,
  Send,
  X,
  Tv,
  Check,
  Flame,
} from 'lucide-react';
import { playStingerSound, playCameraCutSound } from '../utils/audioSynthesizer';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSignOff: (summaryText: string) => void;
  onLoadToTeleprompter: (script: string) => void;
  staffName?: string;
  staffRole?: string;
  bureau?: string;
}

interface DutyItem {
  id: string;
  category: 'admin' | 'systems' | 'cases' | 'it' | 'facilities' | 'followup';
  title: string;
  description: string;
  checked: boolean;
  metaLabel?: string;
  metaValue?: string;
}

const INITIAL_DUTIES: DutyItem[] = [
  {
    id: 'duty-1',
    category: 'admin',
    title: 'ADMIN & CALENDAR VERIFICATION',
    description: 'Daily exam schedule, candidate intake roster, and vendor delivery windows confirmed.',
    checked: true,
  },
  {
    id: 'duty-2',
    category: 'systems',
    title: 'DATA & SYSTEMS (RMA & DVR)',
    description: 'Pearson VUE RMA batch run completed, DVR surveillance active, database synced.',
    checked: true,
    metaLabel: 'RMA Time',
    metaValue: '08:30 IST',
  },
  {
    id: 'duty-3',
    category: 'cases',
    title: 'CASES & DOCUMENTATION (CPR / CELPIP)',
    description: 'Candidate Problem Reports (CPRs) logged, Service Direct tickets resolved, CELPIP logs verified.',
    checked: true,
    metaLabel: 'Pending CPRs',
    metaValue: '0 pending',
  },
  {
    id: 'duty-4',
    category: 'it',
    title: 'IT & INFRASTRUCTURE (PODS & NETWORK)',
    description: 'Workstations verified online, Admin PC operational, redundant fiber link connected.',
    checked: true,
    metaLabel: 'Active Pods',
    metaValue: '45/45 pods',
  },
  {
    id: 'duty-5',
    category: 'facilities',
    title: 'OFFICE & FACILITIES CHECK',
    description: 'Air conditioning temperature recorded, UPS battery backup operational, testing lockers secured.',
    checked: true,
    metaLabel: 'Room Temp',
    metaValue: '21°C (70°F)',
  },
  {
    id: 'duty-6',
    category: 'followup',
    title: 'SPECIAL INSTRUCTIONS & FOLLOW-UP',
    description: 'Prometric CMA afternoon candidate batch arriving at 13:30; biometric pod 3 primed.',
    checked: false,
  },
];

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSignOff,
  onLoadToTeleprompter,
  staffName = 'Mithun',
  staffRole = 'Super Admin',
  bureau = 'Calicut',
}) => {
  const [selectedBranch, setSelectedBranch] = useState<'Calicut' | 'Cochin'>(
    bureau.includes('Cochin') ? 'Cochin' : 'Calicut'
  );
  const [selectedShift, setSelectedShift] = useState<'Morning (08:00 - 14:00)' | 'Evening (14:00 - 20:00)'>(
    'Morning (08:00 - 14:00)'
  );
  const [duties, setDuties] = useState<DutyItem[]>(INITIAL_DUTIES);
  const [leadNotes, setLeadNotes] = useState(
    'All morning testing sessions delivered with zero candidate interruptions. RMA and DVR checks 100% verified. Passing control to incoming team.'
  );
  const [isSignedOff, setIsSignedOff] = useState(false);

  if (!isOpen) return null;

  const toggleDuty = (id: string) => {
    playCameraCutSound();
    setDuties((prev) =>
      prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d))
    );
  };

  const handleSignOff = () => {
    playStingerSound();
    setIsSignedOff(true);
    const completedCount = duties.filter((d) => d.checked).length;
    const summary = `SHIFT HANDOVER CONFIRMED: ${selectedBranch.toUpperCase()} ${selectedShift} signed off by ${staffName} (${staffRole}) • ${completedCount}/${duties.length} Duties Verified • All Systems Normal`;
    onBroadcastSignOff(summary);
  };

  const handleSendToPrompter = () => {
    playCameraCutSound();
    const completedCount = duties.filter((d) => d.checked).length;
    const script = `Good morning team, this is ${staffName} delivering the official ${selectedBranch} ${selectedShift} Handover Briefing.

Operational Status: ${completedCount} of ${duties.length} primary duty categories have been verified and signed off.
Our test delivery pods are running at full capacity: Pearson VUE RMA batch check completed clean, Prometric CMA candidate roster verified, and CELPIP stations calibrated.
Infrastructure, DVR security recording, and climate systems remain green at 21 degrees Celsius.

Special handover note for the incoming team: ${leadNotes}

Control is officially transferred to the incoming shift coordinator. Have a productive session, and stay locked to FETS News Live.`;

    onLoadToTeleprompter(script);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#091b17] border border-[#225246] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#0d2822] to-[#091b17] border-b border-[#1f4a3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC72C] text-[#081412] flex items-center justify-center font-fets-title font-black text-base shadow-[0_0_12px_rgba(255,199,44,0.4)]">
              <FileText className="w-4 h-4 text-[#081412]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fets-title font-bold text-white text-base tracking-wide uppercase">
                  FETS SHIFT HANDOVER & DEBRIEF DESK
                </h2>
                <span className="text-[10px] font-tech font-bold px-1.5 py-0.2 rounded bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40">
                  LIVE MCR
                </span>
              </div>
              <p className="text-xs text-[#719c90] font-sans-ui">
                6-Day Rotation Duty Sign-Off, Candidate Pod Metrics & On-Air Broadcast Log
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
          {/* Branch & Shift Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0e2722] border border-[#204e43]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech text-[#8fb8ac] font-semibold uppercase">CENTRE:</span>
              {(['Calicut', 'Cochin'] as const).map((branch) => (
                <button
                  key={branch}
                  onClick={() => {
                    playCameraCutSound();
                    setSelectedBranch(branch);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-fets-title font-bold transition-all cursor-pointer ${
                    selectedBranch === branch
                      ? 'bg-[#FFC72C] text-[#081412] shadow-[0_0_10px_rgba(255,199,44,0.4)]'
                      : 'bg-[#14372f] text-slate-300 hover:text-white border border-[#275a4e]'
                  }`}
                >
                  {branch.toUpperCase()} CENTRE
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-tech text-[#8fb8ac] font-semibold uppercase">SHIFT:</span>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as any)}
                className="bg-[#14372f] text-white text-xs font-fets-title px-2.5 py-1 rounded-lg border border-[#275a4e] focus:outline-none"
              >
                <option value="Morning (08:00 - 14:00)">Morning (08:00 - 14:00)</option>
                <option value="Evening (14:00 - 20:00)">Evening (14:00 - 20:00)</option>
              </select>
            </div>
          </div>

          {/* 6 Duty Checklist Items (from dutyData.ts) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-tech text-xs text-[#00D084] font-bold tracking-wider uppercase">
                6-CATEGORY OPERATIONAL DUTY AUDIT
              </span>
              <span className="text-[11px] font-tech text-slate-400">
                {duties.filter((d) => d.checked).length} of {duties.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {duties.map((duty) => (
                <div
                  key={duty.id}
                  onClick={() => toggleDuty(duty.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    duty.checked
                      ? 'bg-[#0f2d26] border-[#2c695b] text-white'
                      : 'bg-[#0c221e]/80 border-[#1c433a] text-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                        duty.checked
                          ? 'bg-[#00D084] text-[#051a14]'
                          : 'border border-[#346a5d] bg-transparent'
                      }`}
                    >
                      {duty.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-fets-title font-bold text-xs tracking-wide">
                          {duty.title}
                        </span>
                        {duty.metaLabel && (
                          <span className="text-[10px] font-tech font-bold px-2 py-0.2 rounded-full bg-[#183f36] text-[#7ce2ca] border border-[#276456]">
                            {duty.metaLabel}: {duty.metaValue}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7da59a] font-sans-ui mt-0.5 leading-relaxed">
                        {duty.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Handover Log & Special Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-tech text-[#8fb8ac] font-semibold uppercase">
              HANDOVER DEBRIEF NOTES & ON-AIR TRANSMISSION LOG:
            </label>
            <textarea
              value={leadNotes}
              onChange={(e) => setLeadNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#0a201a] border border-[#235649] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D084] font-sans-ui"
              placeholder="Enter special candidate notes, technical updates, or incoming shift instructions..."
            />
          </div>

          {/* Signed-off Live Banner if confirmed */}
          {isSignedOff && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/70 flex items-center gap-2.5 text-emerald-300 text-xs font-tech animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ON-AIR HANDOVER SIGNED OFF BY {staffName.toUpperCase()} ({staffRole.toUpperCase()}) • BROADCAST CONFIRMED
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#0a1e19] border-t border-[#1f4a3e] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleSendToPrompter}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12312a] hover:bg-[#1a443a] text-[#7ce2ca] hover:text-white border border-[#275b4f] text-xs font-fets-title font-bold transition-all cursor-pointer"
            title="Format into anchor debrief script and load into teleprompter"
          >
            <Tv className="w-3.5 h-3.5 text-[#00D084]" />
            <span>LOAD TO TELEPROMPTER</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-fets-title cursor-pointer transition-colors"
            >
              DISMISS
            </button>
            <button
              onClick={handleSignOff}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D084] to-[#00b070] hover:from-[#1fe59a] hover:to-[#00c980] text-[#051c16] text-xs font-fets-title font-extrabold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,208,132,0.4)] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIGN OFF ON-AIR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
