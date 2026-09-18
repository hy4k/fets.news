import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Type, FastForward, X, Check, Edit2 } from 'lucide-react';

interface TeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
  defaultScript?: string;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({
  isOpen,
  onClose,
  defaultScript = `GOOD DAY TEAM, THIS IS 24/7 FETS MCR OPERATIONS. WE ARE TRACKING LIVE TEST DELIVERY SESSIONS AND CANDIDATE ADMISSIONS ACROSS CALICUT, COCHIN, AND REGIONAL PARTNER LABS.

ALL TEST DELIVERY PODS, BIOMETRIC CHECK-IN STATIONS, AND LOCKDOWN BROWSERS ARE SYNCHRONIZED.

OUR INTER-CENTRE NETWORK IS FULLY LINKED WITH TEST CENTRE ADMINISTRATORS STANDING BY AT EACH BRANCH.

REPORTING SYSTEM HEALTH: ZERO CRITICAL INCIDENTS, SHIFT HANDOVER COMPLETE, READY FOR CANDIDATE INTAKE.`,
}) => {
  const [script, setScript] = useState(defaultScript);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1 to 5
  const [fontSize, setFontSize] = useState(28); // in px
  const [isEditing, setIsEditing] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const scrollStep = () => {
      if (isScrolling && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.7;
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    if (isScrolling) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling, scrollSpeed]);

  if (!isOpen) return null;

  return (
    <div
      id="teleprompter-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="w-full max-w-3xl bg-[#090e1c] border-2 border-indigo-500/60 rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-broadcast font-bold text-white text-base tracking-wider uppercase">
              ANCHOR TELEPROMPTER DESK
            </h3>
          </div>

          {/* Prompt controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-broadcast font-bold tracking-wider ${
                isScrolling
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isScrolling ? 'PAUSE PROMPTER' : 'SCROLL SCRIPT'}</span>
            </button>

            <button
              onClick={() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTop = 0;
                }
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Rewind to top"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-xs font-tech text-slate-300">
              <FastForward className="w-3 h-3 text-blue-400" />
              <span>{scrollSpeed}x</span>
              <button
                onClick={() => setScrollSpeed((s) => (s >= 5 ? 1 : s + 1))}
                className="text-blue-400 hover:text-blue-200 ml-1 font-bold"
              >
                +
              </button>
            </div>

            {/* Font size toggle */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-xs font-tech text-slate-300">
              <Type className="w-3 h-3 text-amber-400" />
              <span>{fontSize}px</span>
              <button
                onClick={() => setFontSize((f) => (f >= 42 ? 22 : f + 4))}
                className="text-amber-400 hover:text-amber-200 ml-1 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Edit script"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Eye-line marker bar for the anchor */}
        <div className="relative w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

        {/* Main Scrolling Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-8 sm:p-12 text-center bg-black/95 focus:outline-none"
        >
          {isEditing ? (
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-full bg-slate-900 text-white font-broadcast p-4 rounded border border-slate-700 text-xl tracking-wider uppercase focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="font-broadcast font-bold uppercase tracking-wider text-slate-100 leading-relaxed max-w-2xl mx-auto select-text"
            >
              {script.split('\n\n').map((para, i) => (
                <p key={i} className="mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {para}
                </p>
              ))}
              <div className="h-48" /> {/* Generous space at bottom for scrolling */}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-2 bg-slate-950 border-t border-slate-800 text-center font-tech text-[11px] text-[#7ce2ca]">
          FETS MCR TELEPROMPTER • SHIFT HANDOVER & EXAM SOP SCRIPT ENGINE • KEYBOARD 1-9 CONTROL
        </div>
      </div>
    </div>
  );
};
