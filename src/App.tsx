import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BroadcastViewMode,
  TransitionEffect,
  Participant,
  LiveFeedSourceType,
} from './types';
import { BroadcastHeader } from './components/BroadcastHeader';
import { TransitionManager } from './components/TransitionManager';
import { MasterTicker } from './components/MasterTicker';
import { DirectorSwitcher } from './components/DirectorSwitcher';
import { Teleprompter } from './components/Teleprompter';
import { ActiveStaffRoster } from './components/ActiveStaffRoster';
import { TaskBreakoutModal } from './components/TaskBreakoutModal';
import { OutsideGuestModal } from './components/OutsideGuestModal';
import { GuestReceptionLobby } from './components/GuestReceptionLobby';
import { FETS_STAFF_MEMBERS, INITIAL_TASK_ROOMS } from './data/staffData';
import { StaffMember, TaskRoom, MeetingMode, GuestPurpose } from './types';
import { AddGuestModal } from './components/AddGuestModal';
import { FeedSourceSelectorModal } from './components/FeedSourceSelectorModal';
import { BroadcastAccreditationModal } from './components/BroadcastAccreditationModal';
import { ShareBroadcastModal } from './components/ShareBroadcastModal';
import { GoogleChatEngine } from './components/GoogleChatEngine';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { VendorUplinkModal } from './components/VendorUplinkModal';
import { CprIncidentModal } from './components/CprIncidentModal';
import { webrtcService, PeerUser } from './services/webrtcService';
import {
  playStingerSound,
  playBreakingAlarmSound,
  playCameraCutSound,
} from './utils/audioSynthesizer';
import {
  Video,
  Mic,
  MicOff,
  Sliders,
  Sparkles,
  Flame,
  FileText,
  UserPlus,
  Layout,
  Maximize2,
  Columns,
  Grid,
  Monitor,
  Share2,
  UserCheck,
  MessageSquare,
  Play,
} from 'lucide-react';

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'anchor-1',
    name: 'MITHUN',
    role: 'SUPER ADMIN & DIRECTOR',
    organization: 'FETS GLOBAL COMMAND',
    location: 'GLOBAL MCR • CALICUT COMMAND',
    isAnchor: true,
    isMuted: false,
    isVideoOff: false,
    isSpeaking: true,
    audioLevel: 75,
    streamType: 'webcam', // User can connect their real live webcam here
    signalQuality: '4K UHD',
    latencyMs: 8,
    cameraLabel: 'CAM 1 [DIRECTOR - GLOBAL MCR]',
    windowTicker: 'PROGRAM FEED 1 • GLOBAL MCR MASTER • CALICUT & COCHIN COMMAND • AUDIO STEREO 48kHz • ON AIR',
    videoPreset: 'newsroom_hq',
    themeColor: 'from-[#0b1329] via-[#1e293b] to-[#0f172a]',
    speechTopic: 'Morning shift operational briefing, candidate intake & RMA synchronization',
  },
  {
    id: 'guest-dc',
    name: 'ANSHITHA K',
    role: 'LEAD TCA & SENIOR PROCTOR',
    organization: 'CALICUT CENTRE BUREAU',
    location: 'LIVE • CALICUT CENTRE (45 PODS)',
    isAnchor: false,
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
    audioLevel: 0,
    streamType: 'motion_canvas',
    videoPreset: 'capitol_skyline',
    signalQuality: '1080p60',
    latencyMs: 14,
    cameraLabel: 'CAM 2 • CALICUT LAB A',
    windowTicker: 'CALICUT POD COMMAND • 45/45 WORKSTATIONS VERIFIED • MORNING ADMISSIONS COMMENCED',
    themeColor: 'from-[#172554] via-[#1e3a8a] to-[#0f172a]',
    speechTopic: 'Candidate check-in, biometric identity verification and Pearson VUE schedule',
  },
  {
    id: 'guest-tokyo',
    name: 'NAIMA MM',
    role: 'LEAD PROCTOR & CMA SPECIALIST',
    organization: 'COCHIN CENTRE BUREAU',
    location: 'LIVE • COCHIN CENTRE (38 PODS)',
    isAnchor: false,
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
    audioLevel: 0,
    streamType: 'motion_canvas',
    videoPreset: 'trading_floor',
    signalQuality: '1080p60',
    latencyMs: 22,
    cameraLabel: 'CAM 3 • COCHIN LAB 1',
    windowTicker: 'COCHIN HUB LOCKED • PROMETRIC CMA US: 14 OPEN SEATS • CELPIP AUDIO STATIONS CALIBRATED',
    themeColor: 'from-[#3b0764] via-[#581c87] to-[#1e1b4b]',
    speechTopic: 'Prometric CMA US exam delivery, seat availability monitoring & candidate arrivals',
  },
  {
    id: 'guest-geneva',
    name: 'LAZEEM',
    role: 'IT & RMA INFRASTRUCTURE LEAD',
    organization: 'FETS SYSTEMS & INFRASTRUCTURE',
    location: 'SYSTEMS & NETWORK DESK • CALICUT',
    isAnchor: false,
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
    audioLevel: 0,
    streamType: 'motion_canvas',
    videoPreset: 'satellite_orbit',
    signalQuality: 'LIVE 60FPS',
    latencyMs: 12,
    cameraLabel: 'CAM 4 • SERVER & RMA CONSOLE',
    windowTicker: 'PEARSON VUE RMA SYNC: 08:30 IST OK • DUAL FIBER ACTIVE • DVR 24/7 RECORDING STABLE',
    themeColor: 'from-[#064e3b] via-[#065f46] to-[#022c22]',
    speechTopic: 'Network redundancy, server health, CCTV recording verification and hardware diagnostics',
  },
];

const INITIAL_TICKERS = [
  'PROMETRIC CMA US: Live seat availability tracker active • Calicut: 18 open seats • Cochin: 14 open seats',
  'PEARSON VUE: Morning RMA sync completed at 08:30 IST across all 45 Calicut & 38 Cochin workstations',
  'SHIFT HANDOVER: Calicut Morning Shift verified & signed off by Lead TCA • 6-day duty checklist archived',
  'CELPIP PARAGON: Afternoon delivery window open • Headset audio checks & biometric stations verified',
  'IT INFRASTRUCTURE: Dual-homed fiber optic links operating at 4ms latency • Zero candidate CPR incidents reported',
  'FETS NEWS LIVE: Inter-centre MCR broadcast active across Calicut, Cochin & Global operations desks',
];

export default function App() {
  // Broadcast State
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [viewMode, setViewMode] = useState<BroadcastViewMode>('split');
  const [transitionEffect, setTransitionEffect] = useState<TransitionEffect>('stinger');
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('anchor-1');
  const [isBreakingNews, setIsBreakingNews] = useState<boolean>(false);
  const [autoDirector, setAutoDirector] = useState<boolean>(true);

  // Story & Ticker State
  const [storyTopic, setStoryTopic] = useState<string>(
    'FETS OPERATIONAL RUNDOWN: CALICUT & COCHIN MORNING SHIFT SYNCHRONIZATION'
  );
  const [breakingHeadline, setBreakingHeadline] = useState<string>(
    'ALL 83 TEST PODS OPERATIONAL ACROSS CALICUT & COCHIN CENTRES'
  );
  const [tickers, setTickers] = useState<string[]>(INITIAL_TICKERS);

  // Modals & Panels
  const [isDirectorOpen, setIsDirectorOpen] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState<boolean>(false);
  const [isGoogleChatOpen, setIsGoogleChatOpen] = useState<boolean>(false);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState<boolean>(false);
  const [isVendorUplinkOpen, setIsVendorUplinkOpen] = useState<boolean>(false);
  const [isCprIncidentOpen, setIsCprIncidentOpen] = useState<boolean>(false);
  const [activeMeetUrl, setActiveMeetUrl] = useState<string>('');
  const [teleprompterScript, setTeleprompterScript] = useState<string | undefined>(undefined);
  const [feedSelectorParticipant, setFeedSelectorParticipant] = useState<Participant | null>(null);

  // 24x7 Staff Reachability, Meeting Modes & Task Desks
  const [staffList, setStaffList] = useState<StaffMember[]>(FETS_STAFF_MEMBERS);
  const [taskRooms, setTaskRooms] = useState<TaskRoom[]>(INITIAL_TASK_ROOMS);
  const [meetingMode, setMeetingMode] = useState<MeetingMode>('all_hands');
  const [active1on1Partner, setActive1on1Partner] = useState<StaffMember | null>(null);
  const [activeTaskRoom, setActiveTaskRoom] = useState<TaskRoom | null>(null);
  const [isStaffRosterOpen, setIsStaffRosterOpen] = useState<boolean>(false);
  const [isTaskBreakoutOpen, setIsTaskBreakoutOpen] = useState<boolean>(false);
  const [isOutsideGuestOpen, setIsOutsideGuestOpen] = useState<boolean>(false);

  // Outside Guest Check-in URL parameter detection
  const [isGuestLobbyOpen, setIsGuestLobbyOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('guest') === 'true';
  });
  const guestParams = useRef(() => {
    if (typeof window === 'undefined') return { name: '', purpose: 'job_interview', role: '' };
    const p = new URLSearchParams(window.location.search);
    return {
      name: p.get('name') || '',
      purpose: (p.get('purpose') as GuestPurpose) || 'job_interview',
      role: p.get('role') || 'CANDIDATE UPLINK',
    };
  }).current();

  // Accreditation & WebRTC Multi-User State
  const [isAccreditationOpen, setIsAccreditationOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Mithun');
  const [userDesignation, setUserDesignation] = useState<string>('Super Admin & Director');
  const [userLocation, setUserLocation] = useState<string>('GLOBAL MCR • CALICUT COMMAND');
  const [peerRemoteStreams, setPeerRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [selectedBureau, setSelectedBureau] = useState<string>('ALL CENTRES');
  const [activeNavTab, setActiveNavTab] = useState<string>('24/7 LIVE STUDIO');

  // Room identification from URL query parameters
  const roomId = useRef(
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('room') || 'fets-broadcast-main'
      : 'fets-broadcast-main'
  ).current;
  const isJoiningViaLink = useRef(
    typeof window !== 'undefined' ? Boolean(new URLSearchParams(window.location.search).get('room')) : false
  ).current;
  const localUserId = useRef(
    isJoiningViaLink.current
      ? `guest-${Math.random().toString(36).substring(2, 8)}`
      : 'anchor-1'
  ).current;

  // Real User Media (Webcam / Mic / Screen Share)
  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null);
  const [isHostWebcamActive, setIsHostWebcamActive] = useState<boolean>(false);
  const [isHostMicMuted, setIsHostMicMuted] = useState<boolean>(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [isScreenShareActive, setIsScreenShareActive] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  // Enumerate hardware cameras
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const vList = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(vList);
        })
        .catch((err) => console.warn('Device enumeration failed:', err));
    }
  }, [isHostWebcamActive]);

  // Web Audio Analyser for Real Mic Activity
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Handle accreditation modal submission
  const handleAccreditationComplete = (data: {
    name: string;
    designation: string;
    location: string;
    cameraEnabled: boolean;
    micEnabled: boolean;
    stream: MediaStream | null;
  }) => {
    setUserName(data.name);
    setUserDesignation(data.designation);
    setUserLocation(data.location);
    setIsAccreditationOpen(false);

    // If stream was initialized in the accreditation modal
    if (data.cameraEnabled && data.stream) {
      setUserMediaStream(data.stream);
      setIsHostWebcamActive(true);

      // Setup audio analyzer for real speech detection
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const source = ctx.createMediaStreamSource(data.stream);
        micSourceRef.current = source;
        source.connect(analyser);
      } catch (err) {
        console.warn('Audio analyzer could not be attached:', err);
      }
    }

    const currentSlotId = localUserId.current;

    // Update participants with new accredited credentials
    setParticipants((prev) => {
      const exists = prev.some((p) => p.id === currentSlotId);
      if (exists) {
        return prev.map((p) =>
          p.id === currentSlotId
            ? {
                ...p,
                name: data.name.toUpperCase(),
                designation: data.designation.toUpperCase(),
                role: data.designation.toUpperCase(),
                location: data.location.toUpperCase(),
                streamType: data.cameraEnabled ? 'webcam' : 'motion_canvas',
                isVideoOff: !data.cameraEnabled,
                isMuted: !data.micEnabled,
                cameraLabel: `CAM 1 [${data.name.toUpperCase()}]`,
                windowTicker: `LIVE ON AIR • ${data.name.toUpperCase()} (${data.designation.toUpperCase()}) • STUDIO FEED ACTIVE`,
              }
            : p
        );
      } else {
        const newLocalParticipant: Participant = {
          id: currentSlotId,
          name: data.name.toUpperCase(),
          designation: data.designation.toUpperCase(),
          role: data.designation.toUpperCase(),
          location: data.location.toUpperCase(),
          isAnchor: !isJoiningViaLink.current,
          isRemotePeer: false,
          isMuted: !data.micEnabled,
          isVideoOff: !data.cameraEnabled,
          isSpeaking: false,
          audioLevel: 0,
          streamType: data.cameraEnabled ? 'webcam' : 'motion_canvas',
          signalQuality: '1080p60',
          latencyMs: 14,
          cameraLabel: `CAM • ${data.name.toUpperCase()}`,
          windowTicker: `LIVE ON AIR • ${data.name.toUpperCase()} (${data.designation.toUpperCase()}) • ACTIVE`,
          themeColor: 'from-[#0b1329] via-[#1e293b] to-[#0f172a]',
        };
        return [newLocalParticipant, ...prev];
      }
    });

    // Initialize WebRTC signaling service
    const peerUser: PeerUser = {
      id: currentSlotId,
      name: data.name,
      designation: data.designation,
      location: data.location,
      isAnchor: !isJoiningViaLink.current,
      hasCamera: data.cameraEnabled,
      hasMic: data.micEnabled,
      joinedAt: Date.now(),
    };

    webrtcService.init(roomId.current, peerUser, {
      onRemoteStream: (peerId, stream) => {
        setPeerRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(peerId, stream);
          return next;
        });
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === peerId ? { ...p, streamType: 'webcam', isVideoOff: false } : p
          )
        );
      },
      onPeerJoined: (peer) => {
        playCameraCutSound();
        setParticipants((prev) => {
          if (prev.some((p) => p.id === peer.id)) return prev;
          const newPeerParticipant: Participant = {
            id: peer.id,
            name: peer.name.toUpperCase(),
            designation: peer.designation.toUpperCase(),
            role: peer.designation.toUpperCase(),
            location: peer.location || 'LIVE REMOTE UPLINK',
            isAnchor: !!peer.isAnchor,
            isRemotePeer: true,
            isMuted: !peer.hasMic,
            isVideoOff: !peer.hasCamera,
            isSpeaking: false,
            audioLevel: 0,
            streamType: 'webcam',
            signalQuality: '1080p60',
            latencyMs: 34,
            cameraLabel: `REMOTE • ${peer.name.toUpperCase()}`,
            windowTicker: `LIVE FEED • ${peer.name.toUpperCase()} (${peer.designation.toUpperCase()}) • BROADCAST ON AIR`,
            themeColor: 'from-[#172554] via-[#1e3a8a] to-[#0f172a]',
          };
          return [...prev, newPeerParticipant];
        });
        // Switch view to split so new guest immediately appears
        setViewMode((curr) => (curr === 'solo' ? 'split' : curr));
      },
      onPeerLeft: (peerId) => {
        playCameraCutSound();
        setPeerRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(peerId);
          return next;
        });
        setParticipants((prev) => prev.filter((p) => p.id !== peerId));
      },
      onPeerUpdated: (peer) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === peer.id
              ? {
                  ...p,
                  name: peer.name.toUpperCase(),
                  designation: peer.designation.toUpperCase(),
                  role: peer.designation.toUpperCase(),
                  isMuted: !peer.hasMic,
                  isVideoOff: !peer.hasCamera,
                  windowTicker: `LIVE FEED • ${peer.name.toUpperCase()} (${peer.designation.toUpperCase()}) • ACTIVE`,
                }
              : p
          )
        );
      },
      onDirectorAction: (action, payload) => {
        if (action === 'view_mode' && payload?.viewMode) {
          setViewMode(payload.viewMode);
        } else if (action === 'breaking' && typeof payload?.isBreaking === 'boolean') {
          setIsBreakingNews(payload.isBreaking);
        } else if (action === 'headline' && payload?.headline) {
          setBreakingHeadline(payload.headline);
          setStoryTopic(payload.headline);
        }
      },
    });

    if (data.cameraEnabled && data.stream) {
      webrtcService.updateLocalStream(data.stream);
    }
  };

  // Request real camera and microphone
  const toggleHostWebcam = async (targetId = localUserId.current, deviceId?: string) => {
    if (isHostWebcamActive && userMediaStream) {
      userMediaStream.getTracks().forEach((track) => track.stop());
      setUserMediaStream(null);
      setIsHostWebcamActive(false);
      webrtcService.updateLocalStream(null);
      setParticipants((prev) =>
        prev.map((p) => (p.streamType === 'webcam' ? { ...p, streamType: 'motion_canvas' } : p))
      );
      return;
    }

    try {
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: 'user',
      };
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });

      setUserMediaStream(stream);
      setIsHostWebcamActive(true);
      webrtcService.updateLocalStream(stream);

      // Connect target participant to real webcam
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? { ...p, streamType: 'webcam', isVideoOff: false, signalQuality: '1080p60' }
            : p
        )
      );

      // Setup audio analyzer for real speech detection
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const source = ctx.createMediaStreamSource(stream);
        micSourceRef.current = source;
        source.connect(analyser);
      } catch (err) {
        console.warn('Audio analyzer could not be attached:', err);
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
    }
  };

  // Toggle Live Screen Share feed
  const toggleScreenShare = async (targetId?: string) => {
    if (isScreenShareActive && screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);
      setIsScreenShareActive(false);
      setParticipants((prev) =>
        prev.map((p) => (p.streamType === 'screenshare' ? { ...p, streamType: 'motion_canvas' } : p))
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 },
        audio: true,
      });

      setScreenShareStream(stream);
      setIsScreenShareActive(true);

      stream.getVideoTracks()[0].onended = () => {
        setScreenShareStream(null);
        setIsScreenShareActive(false);
        setParticipants((prev) =>
          prev.map((p) =>
            p.streamType === 'screenshare' ? { ...p, streamType: 'motion_canvas' } : p
          )
        );
      };

      const slotId = targetId || 'guest-dc';
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === slotId
            ? {
                ...p,
                streamType: 'screenshare',
                isVideoOff: false,
                signalQuality: '1080p60',
                cameraLabel: 'LIVE SCREEN • DESK FEED',
              }
            : p
        )
      );
    } catch (err) {
      console.warn('Screen share cancelled or failed:', err);
    }
  };

  // Switch feed source configuration
  const handleSelectFeedSource = (
    participantId: string,
    sourceType: LiveFeedSourceType,
    options?: {
      deviceId?: string;
      preset?: 'satellite_orbit' | 'capitol_skyline' | 'trading_floor' | 'newsroom_hq';
      customVideoUrl?: string;
    }
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            streamType: sourceType,
            videoPreset: options?.preset || p.videoPreset,
            customVideoUrl: options?.customVideoUrl,
            signalQuality: sourceType === 'webcam' ? '1080p60' : 'LIVE 60FPS',
          };
        }
        return p;
      })
    );
  };

  const handleActivateWebcamForParticipant = (participantId: string, deviceId?: string) => {
    toggleHostWebcam(participantId, deviceId);
  };

  const handleActivateScreenShareForParticipant = (participantId: string) => {
    toggleScreenShare(participantId);
  };

  const toggleHostMic = () => {
    if (userMediaStream) {
      userMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = isHostMicMuted;
      });
    }
    setIsHostMicMuted(!isHostMicMuted);
    setParticipants((prev) =>
      prev.map((p) => (p.isAnchor ? { ...p, isMuted: !isHostMicMuted } : p))
    );
  };

  // Real-time speech activity handler from WebRTC audio stream telemetry & local mic
  const handleSpeechActivity = useCallback(
    (participantId: string, isSpeaking: boolean, level: number) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, isSpeaking, audioLevel: level } : p))
      );

      // Auto-director follows speaking participant (host or remote guest)
      if (autoDirector && isSpeaking && level > 25 && activeSpeakerId !== participantId) {
        setActiveSpeakerId(participantId);
      }
    },
    [autoDirector, activeSpeakerId]
  );

  // Real-time audio meter update loop for local anchor mic
  useEffect(() => {
    let animationFrameId: number;
    const updateAudioMeters = () => {
      if (analyserRef.current && isHostWebcamActive && !isHostMicMuted) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const level = Math.min(100, Math.round(avg * 2.5));

        setParticipants((prev) =>
          prev.map((p) => {
            if (p.isAnchor) {
              const isSpeakingNow = level > 18;
              return {
                ...p,
                audioLevel: level,
                isSpeaking: isSpeakingNow,
              };
            }
            return p;
          })
        );

        // Auto-director follows user if user speaks
        if (autoDirector && level > 35 && activeSpeakerId !== 'anchor-1') {
          setActiveSpeakerId('anchor-1');
        }
      }
      animationFrameId = requestAnimationFrame(updateAudioMeters);
    };

    animationFrameId = requestAnimationFrame(updateAudioMeters);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHostWebcamActive, isHostMicMuted, autoDirector, activeSpeakerId]);

  // Simulated panel speaker cycle if user is not actively speaking
  useEffect(() => {
    if (isHostWebcamActive && !isHostMicMuted) return; // When host mic is live, host controls speech

    const interval = setInterval(() => {
      // Pick random participant to speak
      setParticipants((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const updated = prev.map((p, idx) => ({
          ...p,
          isSpeaking: idx === randomIndex,
          audioLevel: idx === randomIndex ? Math.floor(Math.random() * 50) + 40 : 0,
        }));

        if (autoDirector && prev[randomIndex]) {
          setActiveSpeakerId(prev[randomIndex].id);
        }
        return updated;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [autoDirector, isHostWebcamActive, isHostMicMuted]);

  // Participant mute toggle
  const handleToggleMute = (id: string) => {
    if (id === 'anchor-1' && userMediaStream) {
      toggleHostMic();
      return;
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  // Participant video toggle
  const handleToggleVideo = (id: string) => {
    if (id === 'anchor-1' && userMediaStream) {
      const videoTracks = userMediaStream.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !t.enabled));
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVideoOff: !p.isVideoOff } : p))
    );
  };

  // Manually select active speaker (Cuts camera view if in Solo or Hero)
  const handleSelectSpeaker = (id: string) => {
    playCameraCutSound();
    setActiveSpeakerId(id);
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        isSpeaking: p.id === id,
        audioLevel: p.id === id ? 65 : 0,
      }))
    );
  };

  // Switch camera composition
  const handleSelectViewMode = (mode: BroadcastViewMode) => {
    setViewMode(mode);
    webrtcService.sendDirectorAction('view_mode', { viewMode: mode });
  };

  // 1-on-1 Direct Desk Meeting Handler
  const handleStart1on1 = (targetStaff: StaffMember) => {
    playCameraCutSound();
    if (active1on1Partner?.id === targetStaff.id) {
      handleEnd1on1();
      return;
    }

    setActive1on1Partner(targetStaff);
    setMeetingMode('one_on_one');
    setActiveTaskRoom(null);
    setViewMode('split'); // 2-box anchor split screen
    webrtcService.sendDirectorAction('view_mode', { viewMode: 'split' });

    // Ensure target staff is present in program feeds
    setParticipants((prev) => {
      const exists = prev.some((p) => p.name.toUpperCase().includes(targetStaff.name.toUpperCase()) || p.id === targetStaff.id);
      if (exists) {
        return prev;
      }
      const newP: Participant = {
        id: targetStaff.id,
        name: targetStaff.name.toUpperCase(),
        role: targetStaff.role.toUpperCase(),
        designation: targetStaff.department,
        organization: targetStaff.centre,
        location: targetStaff.location,
        isAnchor: false,
        isMuted: false,
        isVideoOff: false,
        isSpeaking: false,
        audioLevel: 0,
        streamType: 'motion_canvas',
        signalQuality: '1080p60',
        latencyMs: 14,
        cameraLabel: `INTERCOM • ${targetStaff.name.toUpperCase()}`,
        windowTicker: `24/7 INTERCOM • ${targetStaff.name.toUpperCase()} • DIRECT DESK LINE`,
        videoPreset: 'trading_floor',
        themeColor: 'from-[#172554] via-[#1e3a8a] to-[#0f172a]',
      };
      return [...prev, newP];
    });

    const topicStr = `1-ON-1 INTERCOM: ${userName.toUpperCase()} ↔ ${targetStaff.name.toUpperCase()} • 24/7 DIRECT LINE`;
    setStoryTopic(topicStr);
    setTickers((prev) => [
      `1-ON-1 INTERCOM CONNECTED: ${userName} and ${targetStaff.name} on direct line • All 8 staff reachable 24/7`,
      ...prev,
    ]);
  };

  const handleEnd1on1 = () => {
    playCameraCutSound();
    setActive1on1Partner(null);
    setMeetingMode('all_hands');
    setViewMode('quad');
    webrtcService.sendDirectorAction('view_mode', { viewMode: 'quad' });
    setStoryTopic('FETS 24/7 ALL-HANDS LIVE STUDIO • CALICUT & COCHIN COMMAND');
    setTickers((prev) => [
      `1-ON-1 MEETING CONCLUDED: Returned to 24/7 All-Hands Studio Grid`,
      ...prev,
    ]);
  };

  // Task Breakout Meeting Handlers
  const handleSelectTaskRoom = (room: TaskRoom) => {
    playCameraCutSound();
    setActiveTaskRoom(room);
    setActive1on1Partner(null);
    setMeetingMode('task_group');
    const topicStr = `TASK DESK: ${room.title.toUpperCase()} [${room.roomCode}] • ${room.description}`;
    setStoryTopic(topicStr);
    setTickers((prev) => [
      `TASK DESK JOINED: ${room.title} • Active Duty Desk: ${room.roomCode}`,
      ...prev,
    ]);
  };

  const handleCreateTaskRoom = (newRoomData: Omit<TaskRoom, 'id' | 'createdAt' | 'activeParticipantIds'>) => {
    const newRoom: TaskRoom = {
      ...newRoomData,
      id: `task-${Date.now()}`,
      createdAt: 'Just now',
      activeParticipantIds: [localUserId.current],
    };
    setTaskRooms((prev) => [newRoom, ...prev]);
    handleSelectTaskRoom(newRoom);
  };

  const handleReturnToMainStudio = () => {
    playCameraCutSound();
    setActiveTaskRoom(null);
    setActive1on1Partner(null);
    setMeetingMode('all_hands');
    setViewMode('quad');
    webrtcService.sendDirectorAction('view_mode', { viewMode: 'quad' });
    setStoryTopic('FETS 24/7 ALL-HANDS LIVE STUDIO • CALICUT & COCHIN COMMAND');
  };

  // Outside Guest Live Patch
  const handlePatchGuestLive = (guestData: Omit<Participant, 'id'>) => {
    playCameraCutSound();
    const guestParticipant: Participant = {
      ...guestData,
      id: `ext-guest-${Date.now()}`,
    };
    setParticipants((prev) => [...prev, guestParticipant]);
    setViewMode('split');
    webrtcService.sendDirectorAction('view_mode', { viewMode: 'split' });
    setTickers((prev) => [
      `OUTSIDE GUEST ON AIR: ${guestData.name} • ${guestData.role} • VERIFIED LIVE UPLINK`,
      ...prev,
    ]);
  };

  const handleFocusStaffFeed = (staffName: string) => {
    const found = participants.find((p) => p.name.toLowerCase().includes(staffName.toLowerCase()));
    if (found) {
      handleSelectSpeaker(found.id);
    }
  };

  const handleAddStaffToStudio = (staff: StaffMember) => {
    handleStart1on1(staff);
  };

  const handleJoinAsGuest = (data: { name: string; stream: MediaStream | null }) => {
    setIsGuestLobbyOpen(false);
    if (data.name) {
      setUserName(data.name);
    }
    if (data.stream) {
      setUserMediaStream(data.stream);
      setIsHostWebcamActive(true);
      setParticipants((prev) =>
        prev.map((p) =>
          p.isAnchor
            ? {
                ...p,
                name: data.name.toUpperCase(),
                role: (guestParams.role || 'CANDIDATE UPLINK').toUpperCase(),
                streamType: 'webcam',
                cameraLabel: `CAM 1 • GUEST [${data.name.toUpperCase()}]`,
              }
            : p
        )
      );
    }
    setViewMode('split');
  };

  // Send script to teleprompter
  const handleSendToTeleprompter = (script: string) => {
    setTeleprompterScript(script);
    setIsTeleprompterOpen(true);
  };

  // Add remote guest
  const handleAddGuest = (newGuestData: Omit<Participant, 'id'>) => {
    playCameraCutSound();
    const newGuest: Participant = {
      ...newGuestData,
      id: `guest-${Date.now()}`,
    };
    setParticipants((prev) => [...prev, newGuest]);
    if (participants.length >= 4) {
      setViewMode('matrix');
      webrtcService.sendDirectorAction('view_mode', { viewMode: 'matrix' });
    }
  };

  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId);

  return (
    <div
      id="live-news-broadcast-app"
      className="flex flex-col h-screen h-[100dvh] max-h-screen w-screen overflow-hidden bg-[#081412] text-slate-100 font-sans-ui fets-bg-mesh select-none"
    >
      {/* 1. MASTER BROADCAST MASTER CONTROL ROOM (MCR) HEADER */}
      <BroadcastHeader
        isBreakingNews={isBreakingNews}
        activeStoryTopic={storyTopic}
        onToggleDirector={() => setIsDirectorOpen(!isDirectorOpen)}
        isDirectorOpen={isDirectorOpen}
        onOpenStaffRoster={() => setIsStaffRosterOpen(true)}
        onOpenTaskRooms={() => setIsTaskBreakoutOpen(true)}
        onOpenOutsideGuest={() => setIsOutsideGuestOpen(true)}
        onlineStaffCount={staffList.length}
        activeMeetingMode={meetingMode}
        active1on1PartnerName={active1on1Partner?.name}
        activeSpeakerName={activeSpeaker?.name}
        isWebcamActive={isHostWebcamActive}
        onToggleWebcam={() => toggleHostWebcam(localUserId.current)}
        isScreenShareActive={isScreenShareActive}
        onToggleScreenShare={() => toggleScreenShare()}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenAccreditation={() => setIsAccreditationOpen(true)}
        onOpenGoogleChat={() => setIsGoogleChatOpen(true)}
        onRaiseCase={() => setIsCprIncidentOpen(true)}
        onShiftHandover={() => setIsShiftHandoverOpen(true)}
        onQuickAccess={() => setIsVendorUplinkOpen(true)}
        onHelpDesk={() => setIsGoogleChatOpen(true)}
        userName={userName}
        userDesignation={userDesignation}
        selectedBureau={selectedBureau}
        onSelectBureau={(bureau: string) => {
          setSelectedBureau(bureau);
          if (bureau.includes('CALICUT')) {
            const calicutSpeaker = participants.find(
              (p) => p.location.includes('CALICUT') && p.id !== 'anchor-1'
            ) || participants.find((p) => p.location.includes('CALICUT'));
            if (calicutSpeaker) handleSelectSpeaker(calicutSpeaker.id);
            handleSelectViewMode('hero');
          } else if (bureau.includes('COCHIN')) {
            const cochinSpeaker = participants.find((p) => p.location.includes('COCHIN'));
            if (cochinSpeaker) handleSelectSpeaker(cochinSpeaker.id);
            handleSelectViewMode('hero');
          } else if (bureau.includes('GLOBAL')) {
            handleSelectSpeaker('anchor-1');
            handleSelectViewMode('solo');
          } else {
            // ALL CENTRES
            handleSelectViewMode('quad');
          }
        }}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab: string) => {
          setActiveNavTab(tab);
          if (tab === '24/7 LIVE STUDIO') {
            handleReturnToMainStudio();
          } else if (tab === '1-ON-1 INTERCOM') {
            setIsStaffRosterOpen(true);
          } else if (tab === 'TASK ROOMS') {
            setIsTaskBreakoutOpen(true);
          } else if (tab === 'GUEST UPLINK') {
            setIsOutsideGuestOpen(true);
          }
        }}
      />

      {/* 2. MAIN PROGRAM MONITOR DECK CONTAINER (Liquid Glass UI) */}
      <div className="px-2 sm:px-4 pb-2 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="liquid-glass-elevated rounded-2xl border border-[#204c40] shadow-2xl flex-1 flex flex-col overflow-hidden relative min-h-0">
          {/* Deck Header */}
          <div className="px-3 sm:px-4 py-2 border-b border-[#1b4338] bg-[#091b17]/90 flex items-center justify-between gap-3 shrink-0">
            {/* Left: Monitor Title & View Mode */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00D084] animate-pulse" />
              <h2 className="font-fets-title font-bold text-xs sm:text-sm text-white tracking-wider flex items-center gap-2 uppercase">
                PROGRAM MONITOR (PGM)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-tech font-bold bg-[#112d26] text-[#7ce2ca] border border-[#25574a] uppercase">
                {viewMode}
              </span>
            </div>

            {/* Center: Live Topic / Active Speaker Tally */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-tech text-[#6b968b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]" />
              <span className="uppercase text-[#FFC72C] font-bold">ON AIR:</span>
              <span className="text-white font-medium truncate max-w-xs">
                {activeSpeaker ? `${activeSpeaker.name} (${activeSpeaker.cameraLabel})` : storyTopic}
              </span>
            </div>

            {/* Right: Live Engine Indicator & Broadcast Triggers */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D084]/15 border border-[#00D084]/50 text-[#00D084] text-xs font-tech font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00D084] animate-ping" />
                <span className="hidden sm:inline">24/7 LIVE</span>
              </div>

              {/* Quick Camera Toggle */}
              <button
                onClick={() => toggleHostWebcam(localUserId.current)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isHostWebcamActive
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                    : 'bg-[#0e241f] text-slate-300 border-[#235347] hover:border-[#00D084]'
                }`}
                title={isHostWebcamActive ? 'Disable Camera' : 'Enable Camera'}
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Quick Screen Share Toggle */}
              <button
                onClick={() => toggleScreenShare()}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isScreenShareActive
                    ? 'bg-[#00D084] text-[#061e15] border-[#00D084] shadow-[0_0_10px_rgba(0,208,132,0.6)]'
                    : 'bg-[#0e241f] text-slate-300 border-[#235347] hover:border-[#00D084]'
                }`}
                title={isScreenShareActive ? 'Stop Screen Share' : 'Start Screen Share'}
              >
                <Monitor className="w-4 h-4" />
              </button>

              {/* Master LIVE ON AIR / START LIVE Button */}
              <button
                onClick={() => {
                  playCameraCutSound();
                  toggleHostWebcam(localUserId.current);
                }}
                className={`px-3 sm:px-4 py-1 rounded-full text-xs font-fets-title font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isHostWebcamActive
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                    : 'bg-[#00D084] hover:bg-[#00b370] text-[#061e15] shadow-[0_0_15px_rgba(0,208,132,0.5)]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isHostWebcamActive ? 'ON AIR' : 'START LIVE'}</span>
              </button>
            </div>
          </div>

          {/* Program Feed (PGM) with Real-Time Transitions */}
          <div className="relative flex-1 flex overflow-hidden min-h-0">
            <main className="relative flex-1 h-full overflow-hidden flex items-center justify-center bg-[#071512]">
              <TransitionManager
                viewMode={viewMode}
                transitionEffect={transitionEffect}
                participants={participants}
                activeSpeakerId={activeSpeakerId}
                isBreakingNews={isBreakingNews}
                userMediaStream={userMediaStream}
                screenShareStream={screenShareStream}
                peerRemoteStreams={peerRemoteStreams}
                localUserId={localUserId.current}
                onToggleMute={handleToggleMute}
                onToggleVideo={handleToggleVideo}
                onSelectSpeaker={handleSelectSpeaker}
                onSpeechActivity={handleSpeechActivity}
                onOpenFeedSelector={(participant) => setFeedSelectorParticipant(participant)}
                onActivateWebcam={handleActivateWebcamForParticipant}
                onActivateScreenShare={handleActivateScreenShareForParticipant}
              />
            </main>

            {/* Vision Mixer / Director Switcher Sidebar (Desktop & Tablet) */}
            {isDirectorOpen && (
              <DirectorSwitcher
                viewMode={viewMode}
                onSelectViewMode={handleSelectViewMode}
                transitionEffect={transitionEffect}
                onSelectTransitionEffect={setTransitionEffect}
                isBreakingNews={isBreakingNews}
                onToggleBreakingNews={() => {
                  const nextVal = !isBreakingNews;
                  setIsBreakingNews(nextVal);
                  webrtcService.sendDirectorAction('breaking', { isBreaking: nextVal });
                }}
                autoDirector={autoDirector}
                onToggleAutoDirector={() => setAutoDirector(!autoDirector)}
                onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
                onOpenStaffRoster={() => setIsStaffRosterOpen(true)}
                onOpenTaskRooms={() => setIsTaskBreakoutOpen(true)}
                onOpenAddGuest={() => setIsOutsideGuestOpen(true)}
                onClose={() => setIsDirectorOpen(false)}
                isHostWebcamActive={isHostWebcamActive}
                onToggleHostWebcam={() => toggleHostWebcam(localUserId.current)}
                isHostMicMuted={isHostMicMuted}
                onToggleHostMic={toggleHostMic}
                isScreenShareActive={isScreenShareActive}
                onToggleScreenShare={() => toggleScreenShare()}
                participants={participants}
                activeSpeakerId={activeSpeakerId}
                onSelectSpeaker={handleSelectSpeaker}
                onOpenGoogleChat={() => setIsGoogleChatOpen(true)}
              />
            )}
          </div>

          {/* MASTER BROADCAST TICKER AT BOTTOM OF DECK */}
          <MasterTicker
            isBreaking={isBreakingNews}
            breakingHeadline={breakingHeadline}
            tickers={tickers}
            onUpdateBreakingHeadline={(newText) => {
              setBreakingHeadline(newText);
              setStoryTopic(newText);
              webrtcService.sendDirectorAction('headline', { headline: newText });
            }}
          />
        </div>
      </div>

      {/* 3. MOBILE QUICK ACTION CONTROL DOCK (Responsive for mobile screens) */}
      <div
        id="mobile-quick-dock"
        className="sm:hidden liquid-glass border-t border-[#1f4a3e] p-1.5 flex items-center justify-around z-30 select-none shrink-0"
      >
        <button
          onClick={() => toggleHostWebcam(localUserId.current)}
          className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 ${
            isHostWebcamActive ? 'text-[#00D084] bg-[#00D084]/20' : 'text-slate-400'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">CAM</span>
        </button>

        <button
          onClick={toggleHostMic}
          className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 ${
            !isHostMicMuted ? 'text-[#00D084] bg-[#00D084]/20' : 'text-red-400'
          }`}
        >
          {isHostMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-[9px] font-tech font-bold">MIC</span>
        </button>

        <button
          onClick={() => setIsStaffRosterOpen(true)}
          className="p-2 rounded-xl text-xs flex flex-col items-center gap-1 text-[#00D084] bg-[#00D084]/15"
          title="24/7 Staff Roster & 1-on-1"
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">STAFF</span>
        </button>

        <button
          onClick={() => setIsTaskBreakoutOpen(true)}
          className="p-2 rounded-xl text-xs flex flex-col items-center gap-1 text-[#FFC72C] bg-[#FFC72C]/15"
          title="Task Breakout Rooms"
        >
          <Layout className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">TASKS</span>
        </button>

        <button
          onClick={() => setIsOutsideGuestOpen(true)}
          className="p-2 rounded-xl text-xs flex flex-col items-center gap-1 text-sky-400 bg-sky-950/30"
          title="Bring Outside Guest"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">GUEST</span>
        </button>

        <button
          onClick={() => setIsDirectorOpen(!isDirectorOpen)}
          className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 ${
            isDirectorOpen ? 'text-[#FFC72C] bg-[#FFC72C]/20' : 'text-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">SWITCH</span>
        </button>

        <button
          onClick={() => setIsGoogleChatOpen(true)}
          className="p-2 rounded-xl text-xs flex flex-col items-center gap-1 text-[#00D084] bg-[#00D084]/20"
          title="FETS Google Chat & Meet Engine"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px] font-tech font-bold">CHAT</span>
        </button>
      </div>

      {/* 5. MODALS & BROADCAST POPUPS */}
      {/* 5A. Accreditation Modal (Prompts for Name, Designation, and Camera) */}
      <BroadcastAccreditationModal
        isOpen={isAccreditationOpen}
        onClose={() => setIsAccreditationOpen(false)}
        onComplete={handleAccreditationComplete}
        initialName={userName}
        initialDesignation={userDesignation}
        initialLocation={userLocation}
        isJoiningViaLink={isJoiningViaLink.current}
      />

      {/* 5B. Share Broadcast Link Modal */}
      <ShareBroadcastModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId.current}
      />

      <Teleprompter
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        defaultScript={teleprompterScript}
      />

      {/* 24x7 Active Staff Roster & 1-on-1 Intercom Drawer */}
      <ActiveStaffRoster
        isOpen={isStaffRosterOpen}
        onClose={() => setIsStaffRosterOpen(false)}
        staffList={staffList}
        active1on1PartnerId={active1on1Partner?.id}
        onStart1on1={handleStart1on1}
        onEnd1on1={handleEnd1on1}
        onFocusFeed={handleFocusStaffFeed}
        onAddStaffToStudio={handleAddStaffToStudio}
      />

      {/* Task-Wise Breakout Meeting Rooms */}
      <TaskBreakoutModal
        isOpen={isTaskBreakoutOpen}
        onClose={() => setIsTaskBreakoutOpen(false)}
        rooms={taskRooms}
        activeRoomId={activeTaskRoom?.id}
        onSelectRoom={handleSelectTaskRoom}
        onCreateRoom={handleCreateTaskRoom}
        onReturnToMainStudio={handleReturnToMainStudio}
      />

      {/* Bring Outside Guest (Coaching / Job Interview Uplink) */}
      <OutsideGuestModal
        isOpen={isOutsideGuestOpen}
        onClose={() => setIsOutsideGuestOpen(false)}
        onPatchGuestLive={handlePatchGuestLive}
      />

      {/* Outside Guest Reception Lobby (When accessed via guest link) */}
      {isGuestLobbyOpen && (
        <GuestReceptionLobby
          initialName={guestParams.name}
          initialPurpose={guestParams.purpose}
          initialRole={guestParams.role}
          onJoinBroadcast={handleJoinAsGuest}
        />
      )}

      <GoogleChatEngine
        isOpen={isGoogleChatOpen}
        onClose={() => setIsGoogleChatOpen(false)}
        breakingHeadline={breakingHeadline}
        isBreakingNews={isBreakingNews}
        activeStoryTopic={storyTopic}
        teleprompterScript={teleprompterScript}
        activeSpeakerName={activeSpeaker?.name}
        onMeetUrlCreated={(url) => setActiveMeetUrl(url)}
      />

      {/* FETS TV Shift Handover & Debrief Desk */}
      <ShiftHandoverModal
        isOpen={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
        staffName={userName}
        staffRole={userDesignation}
        bureau={selectedBureau}
        onBroadcastSignOff={(summaryText) => {
          setTickers((prev) => [summaryText, ...prev]);
          setBreakingHeadline(summaryText);
          setIsBreakingNews(false);
        }}
        onLoadToTeleprompter={(script) => {
          setTeleprompterScript(script);
          setIsTeleprompterOpen(true);
        }}
      />

      {/* FETS Vendor Uplinks & Live Support Portals */}
      <VendorUplinkModal
        isOpen={isVendorUplinkOpen}
        onClose={() => setIsVendorUplinkOpen(false)}
        onSendTicker={(tickerText) => {
          setTickers((prev) => [tickerText, ...prev]);
          setBreakingHeadline(tickerText);
        }}
      />

      {/* CPR Incident Manager & Breaking News Override */}
      <CprIncidentModal
        isOpen={isCprIncidentOpen}
        onClose={() => setIsCprIncidentOpen(false)}
        isBreakingActive={isBreakingNews}
        staffName={userName}
        bureau={selectedBureau}
        onTriggerBreakingAlert={(headline, category, urgency) => {
          const isBreaking = urgency === 'BREAKING';
          setIsBreakingNews(isBreaking);
          setBreakingHeadline(headline);
          setTickers((prev) => [`${urgency}: ${headline}`, ...prev]);
          webrtcService.sendDirectorAction('breaking', { isBreaking, headline });
        }}
      />

      {feedSelectorParticipant && (
        <FeedSourceSelectorModal
          isOpen={!!feedSelectorParticipant}
          onClose={() => setFeedSelectorParticipant(null)}
          participant={feedSelectorParticipant}
          videoDevices={videoDevices}
          isWebcamActive={isHostWebcamActive}
          isScreenShareActive={isScreenShareActive}
          onSelectSource={(sourceType, options) => {
            handleSelectFeedSource(feedSelectorParticipant.id, sourceType, options);
          }}
          onActivateWebcam={(deviceId) => {
            handleActivateWebcamForParticipant(feedSelectorParticipant.id, deviceId);
          }}
          onActivateScreenShare={() => {
            handleActivateScreenShareForParticipant(feedSelectorParticipant.id);
          }}
        />
      )}
    </div>
  );
}
