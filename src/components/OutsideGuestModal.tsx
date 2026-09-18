import React, { useState } from 'react';
import {
  UserPlus,
  Briefcase,
  GraduationCap,
  Headphones,
  Link,
  Copy,
  Check,
  Radio,
  Tv,
  X,
  Sparkles,
  ExternalLink,
  Shield,
  Video,
} from 'lucide-react';
import { GuestPurpose, Participant } from '../types';

interface OutsideGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatchGuestLive: (guest: Omit<Participant, 'id'>) => void;
  currentRoomId: string;
}

export const OutsideGuestModal: React.FC<OutsideGuestModalProps> = ({
  isOpen,
  onClose,
  onPatchGuestLive,
  currentRoomId,
}) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState<GuestPurpose>('job_interview');
  const [roleTitle, setRoleTitle] = useState('INTERVIEW CANDIDATE • TCA DESK');
  const [location, setLocation] = useState('LIVE REMOTE • CALICUT HUB');
  const [assignedRoom, setAssignedRoom] = useState<'interview' | 'coaching' | 'main'>('interview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handlePurposeChange = (selected: GuestPurpose) => {
    setPurpose(selected);
    if (selected === 'job_interview') {
      setRoleTitle('INTERVIEW CANDIDATE • TCA DESK');
      setLocation('LIVE REMOTE • CANDIDATE UPLINK');
      setAssignedRoom('interview');
    } else if (selected === 'coaching_class') {
      setRoleTitle('CANDIDATE • CMA US COACHING LAB');
      setLocation('STUDENT UPLINK • INTERACTIVE CLASS');
      setAssignedRoom('coaching');
    } else if (selected === 'vendor_support') {
      setRoleTitle('VENDOR SUPPORT • ESCALATIONS LEAD');
      setLocation('REMOTE VENDOR NOC • LIVE');
      setAssignedRoom('main');
    } else {
      setRoleTitle('EXTERNAL EXAMINER / AUDITOR');
      setLocation('GLOBAL AUDIT POOL');
      setAssignedRoom('main');
    }
  };

  // Generate real shareable guest link
  const generateGuestLink = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const roomParam = assignedRoom === 'interview' ? 'task-interview-room' : assignedRoom === 'coaching' ? 'task-coaching-lab' : 'main-studio';
    const cleanName = encodeURIComponent(name.trim() || 'Guest');
    const cleanPurpose = encodeURIComponent(purpose);
    return `${origin}/?room=${roomParam}&guest=true&name=${cleanName}&purpose=${cleanPurpose}&role=${encodeURIComponent(roleTitle)}`;
  };

  const handleCopyLink = () => {
    const link = generateGuestLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePatchLiveNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onPatchGuestLive({
      name: name.trim().toUpperCase(),
      role: roleTitle.trim().toUpperCase(),
      designation: `EXTERNAL GUEST • ${purpose.replace('_', ' ').toUpperCase()}`,
      organization: purpose === 'job_interview' ? 'RECRUITMENT POOL' : purpose === 'coaching_class' ? 'FETS ACADEMY' : 'VENDOR DESK',
      location: location.trim(),
      isAnchor: false,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
      audioLevel: 0,
      streamType: 'motion_canvas',
      signalQuality: 'LIVE 60FPS',
      latencyMs: 18,
      cameraLabel: `GUEST • ${purpose === 'job_interview' ? 'INTERVIEW' : 'COACHING'}`,
      windowTicker: `EXTERNAL GUEST UPLINK • ${name.trim().toUpperCase()} • VERIFIED ADMIT`,
      videoPreset: purpose === 'job_interview' ? 'centre_floor_plan' : 'test_pod_matrix',
      themeColor: purpose === 'job_interview' ? 'from-[#0b1b2b] to-[#08121f]' : 'from-[#1c0f2b] to-[#11081f]',
    });

    setName('');
    onClose();
  };

  return (
    <div
      id="outside-guest-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#040a08]/85 backdrop-blur-xl animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#081714] border border-[#214e43] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1b3f37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC72C]/20 border border-[#FFC72C]/40 flex items-center justify-center text-[#FFC72C]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fets-title font-black text-white text-lg tracking-wider uppercase">
                  OUTSIDE GUEST UPLINK
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/40">
                  INTERVIEWS & COACHING
                </span>
              </div>
              <p className="text-xs text-[#659185] font-sans-ui">
                Bring external candidates, students, or vendor specialists into the 24/7 TV meeting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#14352e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handlePatchLiveNow} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Purpose Selector */}
          <div>
            <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-2 uppercase tracking-wider">
              1. GUEST INVITATION PURPOSE *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePurposeChange('job_interview')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  purpose === 'job_interview'
                    ? 'bg-[#0f2e26] border-[#00D084] text-white shadow-[0_0_12px_rgba(0,208,132,0.2)]'
                    : 'bg-[#0b1f1a] border-[#1d433b] text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="font-fets-title font-bold text-xs uppercase">JOB INTERVIEW</span>
                </div>
                <p className="text-[10px] text-[#659185] font-sans-ui">
                  TCA, Proctor, or Operations candidate screening
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePurposeChange('coaching_class')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  purpose === 'coaching_class'
                    ? 'bg-[#0f2e26] border-[#00D084] text-white shadow-[0_0_12px_rgba(0,208,132,0.2)]'
                    : 'bg-[#0b1f1a] border-[#1d433b] text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span className="font-fets-title font-bold text-xs uppercase">COACHING CLASS</span>
                </div>
                <p className="text-[10px] text-[#659185] font-sans-ui">
                  CMA US student, CELPIP test practice, or candidate drill
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePurposeChange('vendor_support')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  purpose === 'vendor_support'
                    ? 'bg-[#0f2e26] border-[#00D084] text-white shadow-[0_0_12px_rgba(0,208,132,0.2)]'
                    : 'bg-[#0b1f1a] border-[#1d433b] text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Headphones className="w-4 h-4 text-cyan-400" />
                  <span className="font-fets-title font-bold text-xs uppercase">VENDOR SUPPORT</span>
                </div>
                <p className="text-[10px] text-[#659185] font-sans-ui">
                  Pearson VUE, Prometric, or PSI technical engineer
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePurposeChange('external_speaker')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  purpose === 'external_speaker'
                    ? 'bg-[#0f2e26] border-[#00D084] text-white shadow-[0_0_12px_rgba(0,208,132,0.2)]'
                    : 'bg-[#0b1f1a] border-[#1d433b] text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="font-fets-title font-bold text-xs uppercase">EXTERNAL SPEAKER</span>
                </div>
                <p className="text-[10px] text-[#659185] font-sans-ui">
                  External examiner, guest trainer, or industry speaker
                </p>
              </button>
            </div>
          </div>

          {/* Guest Details */}
          <div>
            <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
              2. GUEST FULL NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Rahul Menon, Dr. Deepa Nair, or Pearson Tech Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D084]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                LOWER-THIRD ROLE / TITLE
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D084]"
              />
            </div>
            <div>
              <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                LOCATION / FEED STRAP
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D084]"
              />
            </div>
          </div>

          {/* Assigned Room */}
          <div>
            <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
              3. DESTINATION DESK / MEETING ROOM
            </label>
            <select
              value={assignedRoom}
              onChange={(e) => setAssignedRoom(e.target.value as any)}
              className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D084]"
            >
              <option value="interview">Job Interview & Candidate Assessment Desk</option>
              <option value="coaching">Candidate Coaching & Training Lab</option>
              <option value="main">24/7 All-Hands Live Studio (Main Broadcast)</option>
            </select>
          </div>

          {/* Shareable Link Box */}
          <div className="p-3.5 rounded-2xl bg-[#0c221c] border border-[#214f44]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-tech text-[#7ce2ca] font-bold flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#00D084]" />
                SHAREABLE GUEST ACCESS LINK (NO LOGIN REQUIRED)
              </span>
              <span className="text-[10px] text-amber-300 font-tech">ONE-CLICK PASS</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generateGuestLink()}
                className="flex-1 bg-[#071613] border border-[#1d433b] rounded-xl px-3 py-1.5 text-[11px] text-slate-300 font-mono select-all overflow-hidden text-ellipsis"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D084] text-[#081412] text-xs font-fets-title font-bold hover:bg-[#00e692] transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY LINK</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-sans-ui mt-1.5">
              Guest can open this link on their mobile or laptop to immediately test camera/mic and appear on-air!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-fets-title text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-fets-title font-bold bg-[#FFC72C] text-[#081412] hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>PATCH GUEST LIVE ON-AIR NOW</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3.5 bg-[#05110e] border-t border-[#1b3d36] flex items-center justify-between text-xs font-tech text-[#659185]">
          <span>GUEST LOWER-THIRD CHYRON PREPARED</span>
          <span className="text-[#FFC72C] font-bold">READY FOR ON-AIR DEBUT</span>
        </div>
      </div>
    </div>
  );
};
