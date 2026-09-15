import React, { useState } from 'react';
import {
  Video,
  Monitor,
  Radio,
  Globe,
  Sliders,
  X,
  Check,
  Play,
  TrendingUp,
  Building,
  Layers,
  Link2,
} from 'lucide-react';
import { Participant, LiveFeedSourceType } from '../types';

interface FeedSourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  videoDevices: MediaDeviceInfo[];
  onSelectFeedSource: (
    participantId: string,
    sourceType: LiveFeedSourceType,
    options?: {
      deviceId?: string;
      preset?: 'satellite_orbit' | 'capitol_skyline' | 'trading_floor' | 'newsroom_hq';
      customVideoUrl?: string;
    }
  ) => void;
  onActivateScreenShareForParticipant: (participantId: string) => void;
  onActivateWebcamForParticipant: (participantId: string, deviceId?: string) => void;
}

export const FeedSourceSelectorModal: React.FC<FeedSourceSelectorModalProps> = ({
  isOpen,
  onClose,
  participant,
  videoDevices,
  onSelectFeedSource,
  onActivateScreenShareForParticipant,
  onActivateWebcamForParticipant,
}) => {
  const [selectedType, setSelectedType] = useState<LiveFeedSourceType>(
    participant?.streamType || 'motion_canvas'
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    videoDevices[0]?.deviceId || ''
  );
  const [selectedPreset, setSelectedPreset] = useState<
    'satellite_orbit' | 'capitol_skyline' | 'trading_floor' | 'newsroom_hq'
  >(participant?.videoPreset || 'satellite_orbit');
  const [customUrl, setCustomUrl] = useState<string>(participant?.customVideoUrl || '');

  if (!isOpen || !participant) return null;

  const handleApply = () => {
    if (selectedType === 'webcam') {
      onActivateWebcamForParticipant(participant.id, selectedDeviceId);
    } else if (selectedType === 'screenshare') {
      onActivateScreenShareForParticipant(participant.id);
    } else {
      onSelectFeedSource(participant.id, selectedType, {
        preset: selectedPreset,
        customVideoUrl: customUrl.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <div
      id="feed-source-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="w-full max-w-lg bg-[#090e1c] border-2 border-red-500/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/70 to-slate-900 border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <div>
              <h3 className="font-broadcast font-bold text-white text-base tracking-wider uppercase">
                CONFIGURE LIVE FEED INPUT
              </h3>
              <p className="text-[11px] font-tech text-slate-400">
                {participant.cameraLabel} • {participant.name} ({participant.location})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Feed Type Grid */}
          <div>
            <label className="text-xs font-tech text-slate-400 block mb-2 uppercase">
              SELECT LIVE INPUT SIGNAL SOURCE:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Webcam */}
              <button
                type="button"
                onClick={() => setSelectedType('webcam')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedType === 'webcam'
                    ? 'bg-red-950/80 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-red-400" />
                  <span className="font-broadcast font-bold text-xs">LIVE CAMERA (WEBCAM)</span>
                </div>
                <p className="text-[10px] font-tech text-slate-400">
                  Real-time video capture from host or remote webcam.
                </p>
              </button>

              {/* Option 2: Screen Share */}
              <button
                type="button"
                onClick={() => setSelectedType('screenshare')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedType === 'screenshare'
                    ? 'bg-blue-950/80 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span className="font-broadcast font-bold text-xs">LIVE SCREEN SHARE</span>
                </div>
                <p className="text-[10px] font-tech text-slate-400">
                  Broadcast live window, browser tab, or breaking news desk screen.
                </p>
              </button>

              {/* Option 3: Broadcast Motion Canvas */}
              <button
                type="button"
                onClick={() => setSelectedType('motion_canvas')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedType === 'motion_canvas'
                    ? 'bg-amber-950/80 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span className="font-broadcast font-bold text-xs">LIVE MOTION RADAR</span>
                </div>
                <p className="text-[10px] font-tech text-slate-400">
                  60 FPS real-time animated broadcast radar, audio waves & motion graphics.
                </p>
              </button>

              {/* Option 4: Video Loop / Stream URL */}
              <button
                type="button"
                onClick={() => setSelectedType('custom_url')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedType === 'custom_url'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-broadcast font-bold text-xs">CUSTOM STREAM URL</span>
                </div>
                <p className="text-[10px] font-tech text-slate-400">
                  Live MP4 / WebM video stream or breaking feed URL.
                </p>
              </button>
            </div>
          </div>

          {/* Sub-options for Webcam */}
          {selectedType === 'webcam' && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
              <label className="text-[11px] font-tech text-slate-400 block uppercase">
                DETECTED CAMERA HARDWARE:
              </label>
              {videoDevices.length > 0 ? (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-xs font-sans-ui focus:outline-none"
                >
                  {videoDevices.map((dev, i) => (
                    <option key={dev.deviceId || i} value={dev.deviceId}>
                      {dev.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-300">
                  Ready to link system camera. Click Apply to prompt camera access.
                </p>
              )}
            </div>
          )}

          {/* Sub-options for Screen Share */}
          {selectedType === 'screenshare' && (
            <div className="p-3 bg-blue-950/40 rounded border border-blue-900/50 space-y-1">
              <span className="text-xs font-broadcast font-bold text-blue-300">
                DESK SCREEN BROADCAST
              </span>
              <p className="text-xs text-slate-300">
                Clicking apply will open the system window picker. You can choose to share your
                entire screen, a news dashboard tab, or an application window with high-definition 60fps.
              </p>
            </div>
          )}

          {/* Sub-options for Motion Canvas */}
          {selectedType === 'motion_canvas' && (
            <div className="space-y-2">
              <label className="text-[11px] font-tech text-slate-400 block uppercase">
                SELECT STUDIO VISUAL THEME:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPreset('satellite_orbit')}
                  className={`p-2 rounded border text-xs text-left ${
                    selectedPreset === 'satellite_orbit'
                      ? 'bg-blue-900/60 border-blue-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400 mb-1" />
                  <div className="font-bold text-[11px]">SATELLITE ORBIT</div>
                  <div className="text-[9px] text-slate-400">3D Globe & Coordinates</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPreset('capitol_skyline')}
                  className={`p-2 rounded border text-xs text-left ${
                    selectedPreset === 'capitol_skyline'
                      ? 'bg-red-900/60 border-red-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-red-400 mb-1" />
                  <div className="font-bold text-[11px]">CAPITOL TOWER</div>
                  <div className="text-[9px] text-slate-400">Night Beacon & Radar</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPreset('trading_floor')}
                  className={`p-2 rounded border text-xs text-left ${
                    selectedPreset === 'trading_floor'
                      ? 'bg-emerald-900/60 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                  <div className="font-bold text-[11px]">FINANCIAL DESK</div>
                  <div className="text-[9px] text-slate-400">Live Candlestick Ticks</div>
                </button>
              </div>
            </div>
          )}

          {/* Sub-options for Custom URL */}
          {selectedType === 'custom_url' && (
            <div className="space-y-2">
              <label className="text-[11px] font-tech text-slate-400 block uppercase">
                ENTER LIVE STREAM OR VIDEO URL (.MP4 / .WEBM):
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-xs font-sans-ui focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setCustomUrl(
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
                    )
                  }
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[10px] font-tech"
                >
                  LOAD HD BROADCAST TEST STREAM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-broadcast text-slate-400 hover:text-white"
          >
            CANCEL
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-broadcast font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>SWITCH FEED SIGNAL TO AIR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
