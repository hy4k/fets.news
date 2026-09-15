import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Video,
  Radio,
  MapPin,
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  ArrowRight,
  Tv,
} from 'lucide-react';
import { StaffMember } from '../types';

interface ActiveStaffRosterProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  currentUserId: string;
  active1on1PartnerId?: string;
  onStart1on1: (targetStaff: StaffMember) => void;
  onEnd1on1?: () => void;
  onFocusStaffFeed: (staffName: string) => void;
  onAddStaffToStudio: (staff: StaffMember) => void;
}

export const ActiveStaffRoster: React.FC<ActiveStaffRosterProps> = ({
  isOpen,
  onClose,
  staffList,
  currentUserId,
  active1on1PartnerId,
  onStart1on1,
  onEnd1on1,
  onFocusStaffFeed,
  onAddStaffToStudio,
}) => {
  const [filterCentre, setFilterCentre] = useState<'ALL' | 'CALICUT' | 'COCHIN' | 'GLOBAL MCR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStaff = staffList.filter((staff) => {
    const matchesCentre = filterCentre === 'ALL' || staff.centre === filterCentre;
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.dutyRole && staff.dutyRole.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCentre && matchesSearch;
  });

  const activeIn1on1 = staffList.find((s) => s.id === active1on1PartnerId);

  return (
    <div
      id="staff-roster-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#081412]/95 backdrop-blur-2xl border-l border-[#245248] shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#1b3d36] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00D084]/20 border border-[#00D084]/40 flex items-center justify-center text-[#00D084]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fets-title font-black text-white text-base tracking-wider uppercase">
                24x7 STAFF REACHABILITY
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-tech font-bold bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-[#659185] font-sans-ui">
              All logged-in staff are on-air & instantly reachable via 1-click intercom
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15342d] transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Active 1-on-1 Banner if engaged */}
      {activeIn1on1 && (
        <div className="px-4 py-3 bg-[#0d2a23] border-b border-[#00D084]/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00D084] animate-ping" />
            <span className="font-tech text-white font-bold">1-ON-1 ACTIVE:</span>
            <span className="text-[#FFC72C] font-semibold">{activeIn1on1.name}</span>
          </div>
          {onEnd1on1 && (
            <button
              onClick={onEnd1on1}
              className="px-2.5 py-1 rounded-md text-[11px] font-fets-title font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            >
              RETURN TO STUDIO
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-[#1b3d36] flex flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff, designation, or duty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1f1b] border border-[#20493f] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D084]"
          />
        </div>

        {/* Centre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-fets-title font-bold">
          {(['ALL', 'CALICUT', 'COCHIN', 'GLOBAL MCR'] as const).map((centre) => (
            <button
              key={centre}
              onClick={() => setFilterCentre(centre)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                filterCentre === centre
                  ? 'bg-[#00D084] text-[#081412] shadow-[0_0_8px_rgba(0,208,132,0.3)]'
                  : 'bg-[#0d221e] text-slate-400 hover:text-white border border-[#1b3e36]'
              }`}
            >
              {centre}
            </button>
          ))}
        </div>
      </div>

      {/* Staff List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredStaff.map((staff) => {
          const isCurrentUser = staff.id === currentUserId || staff.name.toLowerCase() === currentUserId.toLowerCase();
          const isThisIn1on1 = active1on1PartnerId === staff.id;

          return (
            <div
              key={staff.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isThisIn1on1
                  ? 'bg-[#0e2c24] border-[#00D084] shadow-[0_0_15px_rgba(0,208,132,0.15)]'
                  : isCurrentUser
                  ? 'bg-[#0e241f]/70 border-[#2b6557]'
                  : 'bg-[#0a1b17]/80 hover:bg-[#0f2822] border-[#1d433b]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {/* Avatar / Badge */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3d36] to-[#0c1f1b] border border-[#2b6557] flex items-center justify-center text-white font-fets-title font-extrabold text-sm shadow-sm">
                      {staff.name.charAt(0)}
                    </div>
                    {/* Real-time Presence Dot */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#081412] flex items-center justify-center ${
                        isThisIn1on1
                          ? 'bg-[#FFC72C] animate-pulse'
                          : staff.status === 'online'
                          ? 'bg-[#00D084]'
                          : 'bg-amber-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-fets-title font-black text-white text-sm tracking-wide">
                        {staff.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/40">
                          YOU
                        </span>
                      )}
                      <span className="text-[9px] font-tech font-bold px-1.5 py-0.2 rounded bg-[#0d2721] text-[#7ce2ca] border border-[#235347]">
                        {staff.centre}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#7ce2ca] font-sans-ui leading-snug">
                      {staff.role}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-tech">
                      <span className="flex items-center gap-1 text-[#659185]">
                        <MapPin className="w-3 h-3 text-[#FFC72C]" />
                        {staff.location.split('•')[0]}
                      </span>
                      {staff.dutyRole && (
                        <>
                          <span className="text-[#20493f]">•</span>
                          <span className="text-amber-200/80">{staff.dutyRole}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side presence state */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[9px] font-tech font-bold px-2 py-0.5 rounded-full ${
                      isThisIn1on1
                        ? 'bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/40'
                        : staff.status === 'online'
                        ? 'bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isThisIn1on1 ? 'IN 1-ON-1' : 'REACHABLE 24/7'}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    {staff.isCamActive && <Video className="w-3 h-3 text-[#00D084]" />}
                    {staff.isMicActive ? (
                      <Mic className="w-3 h-3 text-[#00D084]" />
                    ) : (
                      <MicOff className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for this staff member */}
              {!isCurrentUser && (
                <div className="mt-3 pt-2.5 border-t border-[#193d35] flex items-center justify-between gap-2">
                  {/* Call 1-on-1 Button */}
                  <button
                    onClick={() => onStart1on1(staff)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-fets-title font-bold tracking-wide transition-all cursor-pointer ${
                      isThisIn1on1
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white'
                        : 'bg-[#00D084] text-[#081412] hover:bg-[#00e692] shadow-sm'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isThisIn1on1 ? 'END 1-ON-1' : 'CALL 1-ON-1 DESK'}</span>
                  </button>

                  {/* Focus Program Camera */}
                  <button
                    onClick={() => onFocusStaffFeed(staff.name)}
                    className="p-1.5 rounded-xl bg-[#122c26] border border-[#275d50] text-[#7ce2ca] hover:text-white hover:bg-[#1a3e35] transition-all cursor-pointer"
                    title="Focus Camera Feed in Studio"
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>

                  {/* Add to Active Studio */}
                  <button
                    onClick={() => onAddStaffToStudio(staff)}
                    className="p-1.5 rounded-xl bg-[#122c26] border border-[#275d50] text-[#FFC72C] hover:text-white hover:bg-[#1a3e35] transition-all cursor-pointer"
                    title="Patch into On-Air Studio Grid"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-[#06110f] border-t border-[#1b3d36] text-[11px] text-[#659185] flex items-center justify-between font-tech">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00D084] animate-ping" />
          <span>CENTRAL SIGNAL: 8/8 STAFF CONNECTED</span>
        </span>
        <span className="text-[#FFC72C] font-bold">CALICUT & COCHIN MCR</span>
      </div>
    </div>
  );
};
