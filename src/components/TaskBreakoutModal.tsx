import React, { useState } from 'react';
import {
  Layers,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X,
  Laptop,
  GraduationCap,
  Briefcase,
  Headphones,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TaskRoom, StaffMember } from '../types';

interface TaskBreakoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskRooms: TaskRoom[];
  activeRoomId: string;
  staffList: StaffMember[];
  currentUserId: string;
  onSelectTaskRoom: (room: TaskRoom) => void;
  onCreateTaskRoom: (newRoom: Omit<TaskRoom, 'id' | 'createdAt' | 'activeParticipantIds'>) => void;
  onReturnToMainStudio: () => void;
}

export const TaskBreakoutModal: React.FC<TaskBreakoutModalProps> = ({
  isOpen,
  onClose,
  taskRooms,
  activeRoomId,
  staffList,
  currentUserId,
  onSelectTaskRoom,
  onCreateTaskRoom,
  onReturnToMainStudio,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TaskRoom['category']>('custom_task');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTaskRoom({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Temporary purpose task meeting.',
      category: newCategory,
      isTemporary: true,
      roomCode: `TASK-${Math.floor(100 + Math.random() * 900)}`,
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreatingNew(false);
  };

  const getCategoryIcon = (category: TaskRoom['category']) => {
    switch (category) {
      case 'systems_rma':
        return <Laptop className="w-4 h-4 text-emerald-400" />;
      case 'prometric_admissions':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'celpip_audio':
        return <Headphones className="w-4 h-4 text-cyan-400" />;
      case 'coaching_class':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case 'job_interview':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      default:
        return <Layers className="w-4 h-4 text-teal-400" />;
    }
  };

  const isMainStudioActive = activeRoomId === 'main-studio';

  return (
    <div
      id="task-breakout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#040a08]/85 backdrop-blur-xl animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#081714] border border-[#214e43] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1b3f37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D084]/20 border border-[#00D084]/40 flex items-center justify-center text-[#00D084]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fets-title font-black text-white text-lg tracking-wider uppercase">
                  TASK BREAKOUT ROOMS
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/30">
                  {taskRooms.length} ACTIVE DESKS
                </span>
              </div>
              <p className="text-xs text-[#659185] font-sans-ui">
                Temporary task-wise group meetings & departmental war-rooms
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

        {/* Studio Return Banner */}
        <div className="px-6 py-3 bg-[#0c221d] border-b border-[#1b433a] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-tech text-[#7ce2ca]">CURRENT ACTIVE DESK:</span>
            <span className="font-fets-title font-bold text-white uppercase">
              {isMainStudioActive ? '🔴 24/7 ALL-HANDS MAIN STUDIO' : taskRooms.find((r) => r.id === activeRoomId)?.title || activeRoomId}
            </span>
          </div>
          {!isMainStudioActive && (
            <button
              onClick={() => {
                onReturnToMainStudio();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-fets-title font-bold bg-[#00D084] text-[#081412] hover:bg-[#00e692] shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETURN TO MAIN STUDIO</span>
            </button>
          )}
        </div>

        {/* Room List or Create Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {!isCreatingNew ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-tech font-bold text-[#7ce2ca] tracking-wider uppercase">
                  AVAILABLE BREAKOUT PODS
                </span>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-fets-title font-bold bg-[#14382f] border border-[#265e51] text-[#00D084] hover:bg-[#1b463b] hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>SPIN UP NEW TASK DESK</span>
                </button>
              </div>

              {taskRooms.map((room) => {
                const isActive = room.id === activeRoomId;
                const membersInRoom = staffList.filter((s) => room.activeParticipantIds.includes(s.id));

                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#0f2e26] border-[#00D084] shadow-[0_0_20px_rgba(0,208,132,0.15)]'
                        : 'bg-[#0a1c18]/90 hover:bg-[#0e2721] border-[#1e463d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-[#14352e] border border-[#25564b] mt-0.5">
                          {getCategoryIcon(room.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-fets-title font-bold text-white text-sm sm:text-base">
                              {room.title}
                            </h3>
                            <span className="text-[10px] font-tech font-bold px-1.5 py-0.5 rounded bg-[#102a24] text-[#7ce2ca] border border-[#205145]">
                              {room.roomCode}
                            </span>
                            {room.isTemporary && (
                              <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                AD-HOC
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-sans-ui mt-1 leading-relaxed">
                            {room.description}
                          </p>

                          {/* Members in Room */}
                          <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[10px] font-tech text-[#659185]">STAFF IN ROOM:</span>
                            {membersInRoom.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                {membersInRoom.map((m) => (
                                  <span
                                    key={m.id}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-fets-title bg-[#13332a] text-[#00D084] border border-[#235b4c]"
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] font-sans-ui text-slate-500 italic">
                                Ready to join
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => {
                          onSelectTaskRoom(room);
                          onClose();
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-fets-title font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#00D084] text-[#081412]'
                            : 'bg-[#153a31] border border-[#2b6557] text-white hover:bg-[#00D084] hover:text-[#081412]'
                        }`}
                      >
                        <span>{isActive ? 'CURRENT DESK' : 'JOIN DESK'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* Create Temporary Task Desk Form */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-fets-title font-bold text-white text-sm tracking-wider uppercase">
                  SPIN UP TEMPORARY TASK MEETING
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                  TASK / PURPOSE TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pearson VUE RMA Batch 08:30 Sync, or Audio Glitch Desk"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D084]"
                />
              </div>

              <div>
                <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                  CATEGORY
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D084]"
                >
                  <option value="custom_task">General Task / Operations</option>
                  <option value="systems_rma">IT Systems & Pearson VUE RMA</option>
                  <option value="prometric_admissions">Prometric CMA Admissions</option>
                  <option value="celpip_audio">CELPIP Audio & Biometrics</option>
                  <option value="shift_handover">Shift Handover & Case Debrief</option>
                  <option value="coaching_class">Candidate Coaching Class</option>
                  <option value="job_interview">Job Interview / Recruitment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                  DESCRIPTION / AGENDA
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific focus for this task breakout meeting..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#0c201b] border border-[#224f44] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D084]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs font-fets-title text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-fets-title font-bold bg-[#00D084] text-[#081412] hover:bg-[#00e692] shadow-sm transition-all cursor-pointer"
                >
                  LAUNCH TASK DESK NOW
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05110e] border-t border-[#1b3d36] flex items-center justify-between text-xs font-tech text-[#659185]">
          <span>FETS 24/7 TCA COLLABORATION NETWORK</span>
          <span className="text-[#00D084] font-bold">24x7 DESK SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
};
