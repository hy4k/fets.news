import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Tv,
  X,
} from 'lucide-react';

interface BroadcastAccreditationModalProps {
  isOpen: boolean;
  onComplete: (data: {
    name: string;
    designation: string;
    location: string;
    cameraEnabled: boolean;
    micEnabled: boolean;
    stream: MediaStream | null;
  }) => void;
  onClose?: () => void;
  initialName?: string;
  initialDesignation?: string;
  initialLocation?: string;
  isJoiningViaLink?: boolean;
}

const STAFF_PRESETS = [
  { name: 'Mithun', designation: 'Super Admin & Operations Director', location: 'GLOBAL MCR • CALICUT COMMAND' },
  { name: 'Anshitha K', designation: 'Lead Test Centre Administrator', location: 'CALICUT CENTRE • COMMAND DESK' },
  { name: 'Naima MM', designation: 'Lead Proctor & CMA Specialist', location: 'COCHIN CENTRE • PROCTOR HUB' },
  { name: 'Bindu Rajan', designation: 'Senior TCA & Proctor', location: 'CALICUT CENTRE • LAB A' },
  { name: 'Lazeem', designation: 'IT Systems & Infrastructure Lead', location: 'CALICUT CENTRE • SYSTEMS DESK' },
  { name: 'Shimna', designation: 'Prometric CMA Delivery Proctor', location: 'COCHIN CENTRE • LAB 1' },
  { name: 'Aysha', designation: 'Operations & Admissions Specialist', location: 'CALICUT CENTRE • ADMISSIONS' },
  { name: 'Nimmy M', designation: 'Test Centre Administrator & Facilities', location: 'COCHIN CENTRE • LAB 2' },
];

const DESIGNATION_PRESETS = [
  'Super Admin & Operations Director',
  'Lead Test Centre Administrator (TCA)',
  'Senior Test Delivery Proctor',
  'IT Systems & Infrastructure Lead',
  'Prometric CMA Operations Lead',
  'Pearson VUE Systems Specialist',
  'Shift Handover Coordinator',
];

const LOCATION_PRESETS = [
  'CALICUT CENTRE • COMMAND DESK',
  'COCHIN CENTRE • PROCTOR HUB',
  'GLOBAL MCR • CENTRAL OPS',
  'CALICUT LAB A • PODS 01-25',
  'COCHIN LAB 1 • CMA PODS',
];

export const BroadcastAccreditationModal: React.FC<BroadcastAccreditationModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialName = '',
  initialDesignation = 'Super Admin & Operations Director',
  initialLocation = 'GLOBAL MCR • CALICUT COMMAND',
  isJoiningViaLink = false,
}) => {
  const [name, setName] = useState(initialName || (isJoiningViaLink ? '' : 'Mithun'));
  const [designation, setDesignation] = useState(initialDesignation);
  const [location, setLocation] = useState(initialLocation);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize preview media when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setPreviewStream(stream);
        setCameraError(null);

        // Attach to preview video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup preview audio meter
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const pcmData = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!isMounted) return;
            analyser.getByteFrequencyData(pcmData);
            let sum = 0;
            for (let i = 0; i < pcmData.length; i++) {
              sum += pcmData[i];
            }
            const average = sum / pcmData.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch (_) {}
      } catch (err: any) {
        console.warn('Camera preview unavailable:', err);
        setCameraError('Camera access not detected or permission denied. You can still join on air!');
        setCameraEnabled(false);
      }
    }

    startPreview();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [isOpen]);

  // Keep video track in sync with toggle
  useEffect(() => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
    }
  }, [cameraEnabled, previewStream]);

  // Keep audio track in sync with toggle
  useEffect(() => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach((track) => {
        track.enabled = micEnabled;
      });
    }
  }, [micEnabled, previewStream]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onComplete({
      name: name.trim(),
      designation: designation.trim() || 'Broadcaster',
      location: location.trim() || 'STUDIO A',
      cameraEnabled,
      micEnabled,
      stream: previewStream,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl liquid-glass-elevated border border-[#26574a] rounded-3xl shadow-[0_0_50px_rgba(0,208,132,0.15)] overflow-hidden my-auto">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#00D084] via-[#FFC72C] to-[#00D084]" />

        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1b4338] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#00D084] text-[#061e15] text-xs font-fets-title font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,208,132,0.4)]">
              <Tv className="w-3.5 h-3.5" />
              <span>FETS NEWS</span>
            </div>
            <div>
              <h2 className="text-sm font-fets-title font-bold tracking-wider text-white uppercase">
                {isJoiningViaLink ? 'GUEST ACCREDITATION • LIVE UPLINK' : 'STUDIO BROADCAST ACCREDITATION'}
              </h2>
              <p className="text-[11px] font-tech text-[#689487]">
                Register on-air credentials for live camera window & lower-third graphics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#00D084] text-[10px] font-tech font-bold tracking-widest px-2.5 py-1 bg-[#091f19] border border-[#1f4a3e] rounded-full">
              <Radio className="w-3 h-3 animate-pulse text-[#00D084]" />
              <span>STUDIO READY</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#659487] hover:text-white p-1 rounded-full hover:bg-[#13322b] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Preview Monitor Box */}
          <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 aspect-video max-h-48 sm:max-h-56 mx-auto flex items-center justify-center">
            {cameraEnabled && previewStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <VideoOff className="w-8 h-8 text-slate-600 mb-1.5" />
                <span className="text-xs font-tech text-slate-400 font-bold">CAMERA OFF / STANDBY FEED</span>
                <span className="text-[10px] font-sans text-slate-500 max-w-xs mt-0.5">
                  Your animated radar feed will be displayed until you turn on your camera.
                </span>
              </div>
            )}

            {/* In-Preview Lower-Third Live Simulation */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-sm border-l-4 border-red-600 px-2.5 py-1 text-left shadow-lg">
              <div className="text-xs font-broadcast font-black tracking-wider text-white truncate">
                {name.trim() || 'YOUR NAME HERE'}
              </div>
              <div className="text-[10px] font-tech text-amber-400 tracking-wide truncate">
                {designation.trim() || 'DESIGNATION'} • {location.trim() || 'LOCATION'}
              </div>
            </div>

            {/* Quick Preview Camera & Mic Overlay Buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-all ${
                  cameraEnabled
                    ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
                title="Toggle Live Camera"
              >
                {cameraEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-[10px] font-tech font-bold">{cameraEnabled ? 'CAM ON' : 'CAM OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-all ${
                  micEnabled
                    ? 'bg-blue-600/90 text-white border-blue-400'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
                title="Toggle Microphone"
              >
                {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-[10px] font-tech font-bold">{micEnabled ? 'MIC ON' : 'MIC OFF'}</span>
              </button>
            </div>

            {/* Audio Level Gauge */}
            {micEnabled && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400">MIC</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="text-[11px] font-tech text-amber-400 bg-amber-950/40 border border-amber-900/60 p-2 rounded">
              ⚠️ {cameraError}
            </div>
          )}

          {/* 1-Click FETS Staff Profile Presets */}
          <div>
            <label className="text-xs font-tech text-[#00D084] block mb-1 uppercase tracking-wider font-bold">
              SELECT FETS STAFF PROFILE (OR ENTER CUSTOM):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {STAFF_PRESETS.map((staff) => {
                const isSelected = name === staff.name;
                return (
                  <button
                    key={staff.name}
                    type="button"
                    onClick={() => {
                      setName(staff.name);
                      setDesignation(staff.designation);
                      setLocation(staff.location);
                    }}
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFC72C]/20 border-[#FFC72C] text-[#FFC72C] font-bold shadow-[0_0_8px_rgba(255,199,44,0.3)]'
                        : 'bg-[#102a24] border-[#1f4a3e] text-slate-300 hover:text-white hover:border-[#357262]'
                    }`}
                  >
                    <div className="text-xs font-fets-title font-bold truncate">{staff.name}</div>
                    <div className="text-[9px] font-tech text-[#8fb8ac] truncate">{staff.designation}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Full Name Field */}
          <div>
            <label className="text-xs font-tech text-slate-300 block mb-1 uppercase tracking-wider font-semibold">
              FULL NAME <span className="text-[#FFC72C]">*</span> (Displayed in lower-third chyron):
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mithun, Anshitha K, Naima MM"
              className="w-full bg-[#0a1e19] border border-[#1f4a3e] focus:border-[#00D084] focus:ring-1 focus:ring-[#00D084] rounded-lg px-3 py-2 text-white font-sans text-sm outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Designation / Role Field */}
          <div>
            <label className="text-xs font-tech text-slate-300 block mb-1 uppercase tracking-wider font-semibold">
              DESIGNATION / ON-AIR ROLE <span className="text-red-400">*</span>:
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Lead News Anchor, Senior Correspondent"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded px-3 py-2 text-white font-sans text-sm outline-none transition-all placeholder:text-slate-600"
            />

            {/* Fast Presets for Designation */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {DESIGNATION_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDesignation(preset)}
                  className={`text-[10px] font-tech px-2 py-0.5 rounded border transition-colors ${
                    designation === preset
                      ? 'bg-red-950 border-red-500 text-red-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Bureau / Location Field */}
          <div>
            <label className="text-xs font-tech text-slate-300 block mb-1 uppercase tracking-wider font-semibold">
              BUREAU / BROADCAST LOCATION:
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. STUDIO A • NEW YORK or LONDON BUREAU"
                className="w-full pl-8 bg-slate-900/90 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded px-3 py-2 text-white font-sans text-sm outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Fast Presets for Location */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {LOCATION_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLocation(preset)}
                  className={`text-[10px] font-tech px-2 py-0.5 rounded border transition-colors ${
                    location === preset
                      ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-broadcast font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.6)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>ENTER FETS NEWS STUDIO • GO LIVE ON AIR</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
