import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { GuestPurpose } from '../types';

interface GuestReceptionLobbyProps {
  guestName: string;
  guestPurpose: GuestPurpose | string;
  guestRole: string;
  onJoinAsGuest: (data: { name: string; stream: MediaStream | null }) => void;
  onSwitchToStaffLogin: () => void;
}

export const GuestReceptionLobby: React.FC<GuestReceptionLobbyProps> = ({
  guestName,
  guestPurpose,
  guestRole,
  onJoinAsGuest,
  onSwitchToStaffLogin,
}) => {
  const [name, setName] = useState(guestName || '');
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive || micActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: cameraActive ? { width: 1280, height: 720 } : false,
          audio: micActive,
        })
        .then((s) => {
          stream = s;
          setLocalStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => console.warn('Guest media access failed:', err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive, micActive]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinAsGuest({
      name: name.trim() || 'External Guest',
      stream: localStream,
    });
  };

  const isInterview = guestPurpose === 'job_interview' || guestPurpose.includes('interview');
  const isCoaching = guestPurpose === 'coaching_class' || guestPurpose.includes('coaching');

  return (
    <div
      id="guest-reception-lobby"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#040a08]/90 backdrop-blur-2xl animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#081815] border border-[#235347] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Top Brand Banner */}
        <div className="p-5 sm:p-6 border-b border-[#1b3d36] bg-gradient-to-r from-[#0b1f1a] to-[#081714] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC72C] text-[#081412] font-fets-title font-black text-xl flex items-center justify-center shadow-lg">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fets-title font-black text-white text-base tracking-wider uppercase">
                  FETS LIVE NETWORK
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/40">
                  GUEST UPLINK
                </span>
              </div>
              <p className="text-xs text-[#659185] font-sans-ui">
                Welcome to your interactive broadcast session
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToStaffLogin}
            className="text-[11px] font-tech text-[#7ce2ca] hover:text-white underline"
          >
            Staff Login
          </button>
        </div>

        {/* Invitation Purpose Card */}
        <div className="px-6 py-4 bg-[#0c241f] border-b border-[#1b3e36] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#14392f] text-emerald-400">
            {isInterview ? (
              <Briefcase className="w-5 h-5 text-[#00D084]" />
            ) : isCoaching ? (
              <GraduationCap className="w-5 h-5 text-purple-400" />
            ) : (
              <Radio className="w-5 h-5 text-[#FFC72C]" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-tech text-[#659185] uppercase tracking-wider block">
              YOU ARE CONNECTING FOR:
            </span>
            <span className="font-fets-title font-bold text-white text-sm uppercase">
              {isInterview
                ? 'JOB INTERVIEW & ASSESSMENT DESK'
                : isCoaching
                ? 'CANDIDATE COACHING & TRAINING LAB'
                : 'FETS INTERACTIVE BROADCAST SESSION'}
            </span>
            {guestRole && (
              <span className="text-xs text-[#7ce2ca] block mt-0.5 font-sans-ui">
                Role: {guestRole}
              </span>
            )}
          </div>
        </div>

        {/* Camera Preview Box */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#05110e] border border-[#1b3f36] shadow-inner mb-4 flex items-center justify-center">
            {cameraActive && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <VideoOff className="w-8 h-8" />
                <span className="text-xs font-tech">CAMERA DISABLED</span>
              </div>
            )}

            {/* Quick toggles overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-tech bg-black/70 text-white backdrop-blur-md flex items-center gap-1.5 pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-[#00D084] animate-ping" />
                <span>CAMERA & MIC READY</span>
              </span>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    cameraActive
                      ? 'bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40 hover:bg-[#00D084]/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                  title="Toggle Camera"
                >
                  {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMicActive(!micActive)}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    micActive
                      ? 'bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40 hover:bg-[#00D084]/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                  title="Toggle Mic"
                >
                  {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Name Confirmation Form */}
          <form onSubmit={handleJoin} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-tech font-bold text-[#7ce2ca] mb-1">
                CONFIRM YOUR NAME (FOR BROADCAST LOWER-THIRD)
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0c221d] border border-[#224f44] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D084]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-fets-title font-bold text-sm tracking-wider uppercase bg-[#00D084] text-[#081412] hover:bg-[#00e692] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ENTER BROADCAST MEETING DESK NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#05110e] border-t border-[#1b3d36] flex items-center justify-between text-xs font-tech text-[#659185]">
          <span>FETS 24x7 SECURE UPLINK</span>
          <span className="text-[#00D084]">NO ACCOUNT REQUIRED</span>
        </div>
      </div>
    </div>
  );
};
