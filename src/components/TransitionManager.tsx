import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BroadcastViewMode, TransitionEffect, Participant } from '../types';
import { ParticipantFeed } from './ParticipantFeed';

interface TransitionManagerProps {
  viewMode: BroadcastViewMode;
  transitionEffect: TransitionEffect;
  participants: Participant[];
  activeSpeakerId: string;
  isBreakingNews: boolean;
  userMediaStream: MediaStream | null;
  screenShareStream?: MediaStream | null;
  peerRemoteStreams?: Map<string, MediaStream>;
  localUserId?: string;
  onOpenFeedSelector?: (participant: Participant) => void;
  onActivateWebcam?: (participantId: string) => void;
  onActivateScreenShare?: (participantId: string) => void;
  onToggleMute: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onSelectSpeaker: (id: string) => void;
  onSpeechActivity?: (participantId: string, isSpeaking: boolean, level: number) => void;
}

export const TransitionManager: React.FC<TransitionManagerProps> = ({
  viewMode,
  transitionEffect,
  participants,
  activeSpeakerId,
  isBreakingNews,
  userMediaStream,
  screenShareStream,
  peerRemoteStreams,
  localUserId,
  onOpenFeedSelector,
  onActivateWebcam,
  onActivateScreenShare,
  onToggleMute,
  onToggleVideo,
  onSelectSpeaker,
  onSpeechActivity,
}) => {
  const [isStingerAnimating, setIsStingerAnimating] = useState(false);

  // Trigger stinger animation effect on view mode change if transitionEffect is 'stinger'
  useEffect(() => {
    if (transitionEffect === 'stinger') {
      setIsStingerAnimating(true);
      const timer = setTimeout(() => {
        setIsStingerAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [viewMode, transitionEffect]);

  // Order participants so active speaker or anchor is prioritized
  const anchor = participants.find((p) => p.isAnchor) || participants[0];
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) || anchor;
  const nonAnchorGuests = participants.filter((p) => p.id !== anchor.id);

  // Set of participant IDs that are currently on-air in the program output feed
  const onAirParticipantIds = useMemo(() => {
    const ids = new Set<string>();
    switch (viewMode) {
      case 'solo': {
        const solo = activeSpeaker || anchor;
        if (solo) ids.add(solo.id);
        break;
      }
      case 'split': {
        if (anchor) ids.add(anchor.id);
        const guest = nonAnchorGuests[0] || participants[1] || anchor;
        if (guest) ids.add(guest.id);
        break;
      }
      case 'triple': {
        if (anchor) ids.add(anchor.id);
        const guest1 = nonAnchorGuests[0] || participants[1];
        const guest2 = nonAnchorGuests[1] || participants[2] || anchor;
        if (guest1) ids.add(guest1.id);
        if (guest2) ids.add(guest2.id);
        break;
      }
      case 'quad': {
        participants.slice(0, 4).forEach((p) => ids.add(p.id));
        break;
      }
      case 'hero': {
        // Hero active speaker and strip participants are all in the program view
        participants.forEach((p) => ids.add(p.id));
        break;
      }
      case 'matrix':
      default: {
        participants.forEach((p) => ids.add(p.id));
        break;
      }
    }
    return ids;
  }, [viewMode, activeSpeaker, anchor, nonAnchorGuests, participants]);

  // Determine layout variants for framer-motion based on transitionEffect
  const getMotionVariants = () => {
    switch (transitionEffect) {
      case 'push':
        return {
          initial: { opacity: 0, x: 120 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -120 },
          transition: { duration: 0.35, ease: 'easeInOut' },
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.88 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.1 },
          transition: { duration: 0.4, ease: 'easeOut' },
        };
      case 'glitch':
        return {
          initial: { opacity: 0.2, filter: 'hue-rotate(90deg) contrast(180%)' },
          animate: { opacity: 1, filter: 'hue-rotate(0deg) contrast(100%)' },
          exit: { opacity: 0, filter: 'hue-rotate(-90deg) contrast(200%)' },
          transition: { duration: 0.25 },
        };
      case 'dissolve':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.35 },
        };
    }
  };

  const variants = getMotionVariants();

  const renderFeed = (p: Participant, isFeatured = false, compact = false) => {
    const isLocalUser = p.id === localUserId || (p.isAnchor && !p.isRemotePeer);
    const remoteStream = peerRemoteStreams?.get(p.id);
    const isActiveSpeaker = p.id === activeSpeakerId || p.isSpeaking;
    const isOnAir = onAirParticipantIds.has(p.id);

    return (
      <ParticipantFeed
        key={p.id}
        participant={p}
        isBreakingNews={isBreakingNews}
        userMediaStream={userMediaStream}
        screenShareStream={screenShareStream}
        remoteStream={remoteStream}
        isLocalUser={isLocalUser}
        isActiveSpeaker={isActiveSpeaker}
        isOnAir={isOnAir}
        onOpenFeedSelector={onOpenFeedSelector}
        onActivateWebcam={onActivateWebcam}
        onActivateScreenShare={onActivateScreenShare}
        onToggleMute={onToggleMute}
        onToggleVideo={onToggleVideo}
        onSelectSpeaker={onSelectSpeaker}
        onSpeechActivity={onSpeechActivity}
        isFeatured={isFeatured}
        compact={compact}
      />
    );
  };

  // Render feeds according to broadcast view mode
  const renderLayout = () => {
    switch (viewMode) {
      case 'solo': {
        // Full screen Anchor or Active Speaker
        const soloParticipant = activeSpeaker || anchor;
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 min-h-0">
            {renderFeed(soloParticipant, true, false)}
          </div>
        );
      }

      case 'split': {
        // 2-Box: Anchor on left + Key Guest on right (or stacked on mobile)
        const guest = nonAnchorGuests[0] || participants[1] || anchor;
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2.5 min-h-0">
            <div className="h-full min-h-0 overflow-hidden">{renderFeed(anchor, false, false)}</div>
            <div className="h-full min-h-0 overflow-hidden">{renderFeed(guest, false, false)}</div>
          </div>
        );
      }

      case 'triple': {
        // 3-Box: Anchor large on top/left, 2 panelists
        const guest1 = nonAnchorGuests[0] || participants[1];
        const guest2 = nonAnchorGuests[1] || participants[2] || anchor;
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2.5 min-h-0">
            <div className="h-full min-h-0 overflow-hidden">{renderFeed(anchor, false, false)}</div>
            {guest1 && (
              <div className="h-full min-h-0 overflow-hidden">{renderFeed(guest1, false, false)}</div>
            )}
            {guest2 && (
              <div className="h-full min-h-0 overflow-hidden">{renderFeed(guest2, false, false)}</div>
            )}
          </div>
        );
      }

      case 'quad': {
        // 4-Box Matrix (2x2 grid)
        const quadList = participants.slice(0, 4);
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2.5 min-h-0">
            {quadList.map((p) => (
              <div key={p.id} className="h-full min-h-0 overflow-hidden">
                {renderFeed(p, false, true)}
              </div>
            ))}
          </div>
        );
      }

      case 'hero': {
        // Hero active speaker + bottom participant ribbon
        const ribbonParticipants = participants.filter((p) => p.id !== activeSpeaker.id);
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2.5 min-h-0">
            {/* Top Large Hero Feed */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderFeed(activeSpeaker, true, false)}
            </div>

            {/* Bottom Participant Ribbon */}
            <div className="h-24 sm:h-32 shrink-0 grid grid-flow-col auto-cols-[160px] sm:auto-cols-[220px] gap-2 overflow-x-auto pb-1">
              {ribbonParticipants.map((p) => (
                <div key={p.id} className="h-full min-h-0 overflow-hidden">
                  {renderFeed(p, false, true)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'matrix':
      default: {
        // 6-Box Full Newsroom Grid
        return (
          <div className="w-full h-full p-1.5 sm:p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-1.5 sm:gap-2.5 min-h-0">
            {participants.map((p) => (
              <div key={p.id} className="h-full min-h-0 overflow-hidden">
                {renderFeed(p, false, true)}
              </div>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060911] flex items-center justify-center">
      {/* Real-time Transition Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${activeSpeakerId}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          {renderLayout()}
        </motion.div>
      </AnimatePresence>

      {/* Broadcast Stinger Wipe Overlay */}
      <AnimatePresence>
        {isStingerAnimating && (
          <motion.div
            initial={{ x: '100%', skewX: -20 }}
            animate={{ x: '-150%', skewX: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            {/* Multi-layered broadcast wipe ribbon */}
            <div className="w-[120%] h-full bg-gradient-to-r from-red-800 via-red-600 to-amber-500 shadow-[0_0_60px_rgba(239,68,68,0.9)] flex items-center justify-center border-y-4 border-amber-300 transform">
              <div className="flex items-center gap-4 text-white font-broadcast font-black tracking-widest text-3xl sm:text-5xl uppercase drop-shadow-2xl">
                <span className="text-amber-300">FETS NEWS</span>
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>TRANSITION</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
