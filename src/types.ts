export type BroadcastViewMode =
  | 'solo'      // Anchor solo (Studio A)
  | 'split'     // 2-Box (Host + Guest or Debate)
  | 'triple'    // 3-Box (Host + 2 Panelists)
  | 'quad'      // 4-Box (Matrix grid)
  | 'hero'      // 1 Large Hero Speaker + Bottom participant ribbon
  | 'matrix'    // 6-Box Full newsroom grid
  | 'pip';      // Picture-in-Picture

export type TransitionEffect =
  | 'stinger'   // TV channel metallic/red stinger wipe
  | 'dissolve'  // Smooth crossfade
  | 'push'      // Slide/push camera
  | 'zoom'      // Matrix 3D scale
  | 'glitch';   // Signal sync scanline wipe

export type ChyronStyle = 'network' | 'breaking' | 'finance' | 'election' | 'minimal';

export type LiveFeedSourceType = 'webcam' | 'screenshare' | 'motion_canvas' | 'video_loop' | 'custom_url';

export type ExamFeedPreset =
  | 'test_pod_matrix'      // Interactive pod matrix (P01-P24)
  | 'centre_floor_plan'    // Test centre architectural floor plan & environment
  | 'secure_browser_grid'  // Lockdown engine & bandwidth diagnostics
  | 'operations_mcr'       // 24/7 FETS TCA dispatch & inter-branch command
  // Backward compatibility aliases
  | 'satellite_orbit'
  | 'capitol_skyline'
  | 'trading_floor'
  | 'newsroom_hq'
  | 'geneva_summit';

export interface Participant {
  id: string;
  name: string;
  role: string;
  designation?: string;
  organization?: string;
  location: string;
  isAnchor: boolean;
  isRemotePeer?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 to 100
  streamType: LiveFeedSourceType;
  signalQuality: '1080p60' | '4K UHD' | 'WAN 720p' | 'FIBRE 1080p' | 'LIVE 60FPS';
  latencyMs: number;
  cameraLabel: string; // e.g., "CAM 1 • GLOBAL MCR", "TCA 2 • CALICUT LAB A"
  windowTicker: string; // Dedicated subtle ticker for this participant window
  videoPreset?: ExamFeedPreset;
  customVideoUrl?: string;
  themeColor: string;
  speechTopic?: string;
}

export interface NewsHeadline {
  id: string;
  headline: string;
  subStrap: string;
  urgency: 'BREAKING' | 'DEVELOPING' | 'SPECIAL REPORT' | 'EXCLUSIVE' | 'ANALYSIS';
  category: 'WORLD' | 'FINANCE' | 'TECH' | 'POLITICS' | 'CLIMATE';
  timestamp: string;
}

export interface FactCheckResult {
  verdict: 'VERIFIED' | 'MOSTLY TRUE' | 'CONTEXT NEEDED' | 'MISLEADING' | 'UNSUBSTANTIATED';
  confidence: string;
  summary: string;
  keySources: string[];
  anchorFollowUp: string;
}

export interface TeleprompterScript {
  title: string;
  content: string;
  speed: number; // 1 to 5
}

export type MeetingMode = 
  | 'all_hands'     // 24/7 Main Broadcast Studio (All-Hands Newsroom Grid)
  | 'one_on_one'    // 1-on-1 Direct Intercom / Desk Meeting
  | 'task_group';   // Temporary / Task-wise Breakout Meeting

export type GuestPurpose = 
  | 'job_interview'     // Candidate Job Interview (TCA / Proctor / Operations)
  | 'coaching_class'    // Candidate Coaching & Training Student
  | 'vendor_support'    // Pearson VUE, Prometric, PSI, ITTS Support Lead
  | 'external_speaker'; // Guest Speaker, Auditor, or External Examiner

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  centre: 'CALICUT' | 'COCHIN' | 'GLOBAL MCR';
  status: 'online' | 'in_meeting' | 'in_task' | 'available' | 'offline';
  isMicActive?: boolean;
  isCamActive?: boolean;
  currentRoomId?: string;
  activeMeetingPartnerId?: string;
  dutyRole?: string;
}

export interface TaskRoom {
  id: string;
  title: string;
  category: 'systems_rma' | 'prometric_admissions' | 'celpip_audio' | 'shift_handover' | 'coaching_class' | 'job_interview' | 'custom_task';
  description: string;
  activeParticipantIds: string[];
  createdAt: string;
  isTemporary?: boolean;
  roomCode: string;
}

export interface GuestUplink {
  id: string;
  guestName: string;
  purpose: GuestPurpose;
  roleTitle: string;
  targetRoomId: string;
  inviteUrl: string;
  createdAt: string;
  isPatchedLive: boolean;
}

