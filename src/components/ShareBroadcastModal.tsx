import React, { useState } from 'react';
import { Share2, Copy, Check, X, QrCode, Radio, Users, Smartphone, Monitor } from 'lucide-react';

interface ShareBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const ShareBroadcastModal: React.FC<ShareBroadcastModalProps> = ({
  isOpen,
  onClose,
  roomId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?room=${encodeURIComponent(roomId)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FETS NEWS • 24/7 TCA Live Operational Broadcast Invitation',
          text: `Join the 24/7 TCA live collaboration desk on FETS NEWS Studio. Enter your name and designation, verify your pod/bureau, and connect live!`,
          url: shareUrl,
        });
      } catch (err) {
        console.warn('Native share error:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b101e] border border-red-600/40 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.25)] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-red-950 border border-red-800 text-red-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-broadcast font-bold text-white tracking-wider uppercase">
                INVITE TCAS & TEST DELIVERY PROCTORS
              </h3>
              <p className="text-[11px] font-tech text-slate-400">
                Share this link for staff across Calicut, Cochin & partner branches to connect live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Instructions Box */}
          <div className="p-3 bg-red-950/25 border border-red-900/50 rounded-lg flex items-start gap-3">
            <Radio className="w-4 h-4 text-red-400 mt-0.5 shrink-0 animate-pulse" />
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-white font-tech font-bold uppercase block mb-0.5">
                REAL-TIME MULTI-DEVICE BROADCAST
              </strong>
              Anyone opening this link on their smartphone (iOS Safari / Android Chrome) or desktop computer will be prompted for their <strong>Name</strong> and <strong>Designation</strong>, and can immediately turn on their camera to appear live in the broadcast matrix!
            </div>
          </div>

          {/* Share Link Input */}
          <div>
            <label className="text-xs font-tech text-slate-400 block mb-1 uppercase tracking-wider font-semibold">
              LIVE BROADCAST ROOM LINK:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-emerald-300 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded text-xs font-tech font-bold tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-red-600 hover:bg-red-500 text-white border-red-400'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Device Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-tech text-slate-300">
            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-bold text-white uppercase">Mobile Ready</div>
                <div className="text-[10px] text-slate-400">Front / Rear camera uplink</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-bold text-white uppercase">Desktop & Laptop</div>
                <div className="text-[10px] text-slate-400">HD Webcams & Screen Share</div>
              </div>
            </div>
          </div>

          {/* Mobile Native Share Button */}
          {typeof navigator !== 'undefined' && (navigator as any).share && (
            <div>
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-tech font-bold tracking-wider flex items-center justify-center gap-2 border border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5 text-red-400" />
                <span>SHARE VIA WHATSAPP, MESSAGES, OR EMAIL</span>
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center pt-1 border-t border-slate-800 text-[10px] font-tech text-slate-500 flex items-center justify-center gap-2">
            <span>STUDIO ROOM ID: <strong className="text-slate-300">{roomId}</strong></span>
            <span>•</span>
            <span>NETWORK: <strong className="text-red-400">FETS NEWS LIVE</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
