import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Radio, Mic } from 'lucide-react';
import { Participant } from '../types';

interface LowerThirdChyronProps {
  participant: Participant;
  isBreaking?: boolean;
  compact?: boolean;
}

export const LowerThirdChyron: React.FC<LowerThirdChyronProps> = ({
  participant,
  isBreaking = false,
  compact = false,
}) => {
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      id={`lower-third-${participant.id}`}
      className="absolute bottom-6 left-2 right-2 sm:bottom-8 sm:left-4 sm:right-auto z-20 pointer-events-none select-none max-w-full sm:max-w-md"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${participant.id}-${participant.name}-${participant.role}`}
          initial={{ opacity: 0, x: -24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
        >
          {/* Top Strap: Location & On-Air Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            {/* Live Location Tag */}
            <div className="flex items-center gap-1 bg-[#091b17]/95 text-slate-200 border-l-2 border-[#00D084] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-tech font-bold uppercase tracking-wider backdrop-blur-md rounded-t-lg">
              <MapPin className="w-2.5 h-2.5 text-[#00D084]" />
              <span>{participant.location}</span>
            </div>

            {/* Speaking / On Air Tally Indicator */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 bg-red-600 text-white font-fets-title font-bold tracking-wider px-2.5 py-0.5 text-[10px] sm:text-[11px] uppercase rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>SPEAKING</span>
                {/* Dynamic mini audio wave bars */}
                <div className="flex items-end gap-0.5 h-2.5 ml-0.5">
                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:0ms] h-2" />
                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:150ms] h-3" />
                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:300ms] h-1.5" />
                </div>
              </motion.div>
            )}

            {participant.isAnchor && (
              <div className="bg-[#FFC72C] text-[#081412] font-fets-title font-black tracking-wider px-2 py-0.5 text-[10px] uppercase rounded-full shadow-sm">
                HOST
              </div>
            )}
          </div>

          {/* Main Primary Bar: Speaker Name */}
          <div className="flex items-stretch overflow-hidden rounded-r-xl shadow-xl">
            {/* Accent Vertical Color Siphon */}
            <div
              className={`w-1.5 sm:w-2 shrink-0 ${
                isBreaking
                  ? 'bg-gradient-to-b from-[#FF5A36] to-[#FFC72C]'
                  : 'bg-gradient-to-b from-[#00D084] to-[#0d5945]'
              }`}
            />

            {/* Main Name Plate */}
            <div
              className={`px-3.5 py-1.5 flex items-center gap-2.5 ${
                isBreaking
                  ? 'bg-gradient-to-r from-[#50130d]/95 via-[#2d0905]/95 to-[#160403]/90 border-t border-[#FF5A36]/60'
                  : 'liquid-glass border-t border-[#00D084]/40'
              } backdrop-blur-xl`}
            >
              <h3
                className={`font-fets-title font-black uppercase tracking-wide text-white leading-none ${
                  compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
                }`}
              >
                {participant.name}
              </h3>
            </div>
          </div>

          {/* Sub-Strap: Professional Title & Designation */}
          <div className="flex items-stretch mt-[-1px] rounded-br-xl overflow-hidden shadow-lg">
            <div className="w-1.5 sm:w-2 bg-[#1f4a40] shrink-0" />
            <div className="bg-[#071714]/95 border-b border-r border-[#20493f]/60 backdrop-blur-md px-3.5 py-0.5 flex items-center justify-between gap-3 text-[10px] sm:text-xs font-sans-ui text-slate-200">
              <span className="font-bold tracking-wide uppercase text-[#FFC72C]">
                {participant.designation || participant.role}
              </span>
              {participant.organization && (
                <span className="text-[#649386] border-l border-[#1f4a40] pl-2 text-[10px]">
                  {participant.organization}
                </span>
              )}
            </div>
          </div>

          {/* Custom Story Chyron headline if assigned */}
          {participant.customHeadline && (
            <div className="mt-1 bg-gradient-to-r from-red-950/90 to-black/80 border-l-2 border-red-500 px-2.5 py-0.5 rounded-r text-[10px] sm:text-[11px] font-broadcast font-bold text-red-200 uppercase tracking-wide max-w-sm truncate">
              {participant.customHeadline}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
