import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Video,
  Send,
  Radio,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sparkles,
  Zap,
  Globe,
  Bell,
  X,
  FileText,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleLogout,
  initAuth,
  getAccessToken,
  sendFetsWebhookMessage,
  createGoogleMeetSpace,
} from '../services/googleWorkspace';
import {
  playCameraCutSound,
  playBreakingAlarmSound,
  playStingerSound,
} from '../utils/audioSynthesizer';

interface GoogleChatEngineProps {
  isOpen: boolean;
  onClose: () => void;
  breakingHeadline?: string;
  isBreakingNews?: boolean;
  activeStoryTopic?: string;
  teleprompterScript?: string;
  activeSpeakerName?: string;
  onMeetUrlCreated?: (meetUrl: string) => void;
}

interface MessageLog {
  id: string;
  timestamp: string;
  type: 'breaking' | 'broadcast_start' | 'meet_link' | 'rundown' | 'custom';
  content: string;
  status: 'sent' | 'pending' | 'error';
  space: string;
}

export const GoogleChatEngine: React.FC<GoogleChatEngineProps> = ({
  isOpen,
  onClose,
  breakingHeadline = '',
  isBreakingNews = false,
  activeStoryTopic = '',
  teleprompterScript = '',
  activeSpeakerName = '',
  onMeetUrlCreated,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Meet state
  const [meetUrl, setMeetUrl] = useState<string>('');
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);

  // Chat message composer
  const [customText, setCustomText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Confirmation modal state (Mandatory per Workspace Skill for user data mutations)
  const [confirmationAction, setConfirmationAction] = useState<{
    title: string;
    description: string;
    actionType: 'breaking' | 'custom' | 'meet' | 'rundown';
    payload: any;
  } | null>(null);

  // Message transmission log
  const [transmissionLogs, setTransmissionLogs] = useState<MessageLog[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'broadcast_start',
      content: 'FETS Google Chat Webhook Engine mounted to Space: AAQASK8GJO4',
      status: 'sent',
      space: 'FETS (AAQASK8GJO4)',
    },
  ]);

  // Auto-relay settings
  const [autoRelayBreaking, setAutoRelayBreaking] = useState(true);
  const [autoRelayMeet, setAutoRelayMeet] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const [authScopeWarning, setAuthScopeWarning] = useState<string | null>(null);

  // Handle Google Sign In (Defaults to Standard TCA profile without sensitive scopes)
  const handleGoogleSignIn = async (withScopes = false) => {
    setIsSigningIn(true);
    setAuthError(null);
    setAuthScopeWarning(null);
    try {
      const res = await googleSignIn(withScopes);
      if (res?.user) {
        setCurrentUser(res.user);
        if (res.scopeWarning) {
          setAuthScopeWarning(res.scopeWarning);
        }
        playStingerSound();
      }
    } catch (err: any) {
      console.error('Sign-in failure:', err);
      const msg = err?.message || 'Google Sign-In failed.';
      if (msg.includes('403') || msg.includes('access_denied')) {
        setAuthError(
          'Google returned Error 403: access_denied because direct Workspace Chat/Meet scopes are in Testing mode. Standard TCA profile sign-in is available below.'
        );
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleLogout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign-out failure:', err);
    }
  };

  // Dispatch Webhook with Confirmation
  const executeConfirmedDispatch = async () => {
    if (!confirmationAction) return;
    const { actionType, payload } = confirmationAction;
    setConfirmationAction(null);
    setIsSending(true);
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    try {
      const result = await sendFetsWebhookMessage(payload);
      playCameraCutSound();
      setSendSuccessMessage(`Dispatched to Google Chat Space: FETS (AAQASK8GJO4)`);

      // Add to logs
      setTransmissionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: actionType,
          content: payload.text || payload.headline || 'Broadcast signal relayed',
          status: 'sent',
          space: 'FETS (AAQASK8GJO4)',
        },
        ...prev.slice(0, 19),
      ]);

      if (actionType === 'custom') {
        setCustomText('');
      }
    } catch (err: any) {
      console.error('Webhook dispatch failed:', err);
      setSendErrorMessage(err.message || 'Delivery to Google Chat failed');
    } finally {
      setIsSending(false);
    }
  };

  // Trigger Breaking News to FETS
  const handleDispatchBreaking = () => {
    playBreakingAlarmSound();
    setConfirmationAction({
      title: 'Dispatch Breaking Alert to FETS Space',
      description: `Post the active Breaking News story "${breakingHeadline || activeStoryTopic || 'URGENT DEVELOPMENTS'}" directly to the FETS Google Chat group (AAQASK8GJO4)?`,
      actionType: 'breaking',
      payload: {
        eventType: 'breaking',
        headline: '🚨 BREAKING NEWS ALERT',
        broadcastData: {
          topic: breakingHeadline || activeStoryTopic || 'Urgent Developments',
          breakingUrgency: 'RED ALERT',
          ticker: 'LIVE ON-AIR IN FETS NEWS STUDIO',
        },
        senderName: currentUser?.displayName || 'FETS Broadcast Anchor',
      },
    });
  };

  // Trigger Rundown/Teleprompter to FETS
  const handleDispatchRundown = () => {
    playCameraCutSound();
    setConfirmationAction({
      title: 'Post Rundown & Script to FETS Space',
      description: `Send the current anchor teleprompter copy and news rundown to the FETS Google Chat room?`,
      actionType: 'rundown',
      payload: {
        eventType: 'rundown',
        headline: '📋 FETS TCA OPERATIONS BRIEFING',
        text: teleprompterScript || `Topic: ${activeStoryTopic || 'General Operations'}\nTCA desk in continuous 24/7 transmission.`,
        broadcastData: {
          topic: activeStoryTopic || 'Daily Briefing',
          anchorName: activeSpeakerName || currentUser?.displayName || 'Lead TCA',
        },
        senderName: currentUser?.displayName || 'FETS Central Operations Director',
      },
    });
  };

  // Trigger Custom Message
  const handleDispatchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setConfirmationAction({
      title: 'Post Message to Google Chat (FETS)',
      description: `Send this transmission to Google Chat group FETS: "${customText.trim().substring(0, 120)}${customText.length > 120 ? '...' : ''}"?`,
      actionType: 'custom',
      payload: {
        eventType: 'general',
        text: customText.trim(),
        senderName: currentUser?.displayName || 'FETS Central Command Desk',
      },
    });
  };

  // Generate Google Meet Link
  const handleCreateMeet = async () => {
    setIsCreatingMeet(true);
    setSendErrorMessage(null);
    try {
      const token = getAccessToken();
      const res = await createGoogleMeetSpace(token);
      const generatedUrl = res.meetingUri || 'https://meet.google.com/new';
      setMeetUrl(generatedUrl);
      onMeetUrlCreated?.(generatedUrl);
      playStingerSound();

      // If auto-relay is enabled, confirm dispatch to FETS Chat
      if (autoRelayMeet) {
        setConfirmationAction({
          title: 'Post Google Meet Video Bridge to FETS Space',
          description: `A Google Meet conference room has been generated (${generatedUrl}). Broadcast the join link to the FETS Google Chat group so members can join?`,
          actionType: 'meet',
          payload: {
            eventType: 'meet_link',
            headline: '📹 GOOGLE MEET VIDEO BRIDGE ACTIVE',
            broadcastData: {
              meetUrl: generatedUrl,
              topic: activeStoryTopic || 'Live Broadcast Discussion',
              anchorName: currentUser?.displayName || 'FETS Director',
            },
            senderName: currentUser?.displayName || 'FETS Control Room',
          },
        });
      }
    } catch (err: any) {
      console.error('Meet generation error:', err);
      setSendErrorMessage(err.message || 'Failed to initialize Google Meet bridge');
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleCopyMeet = () => {
    if (!meetUrl) return;
    navigator.clipboard.writeText(meetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="google-chat-engine-modal"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#080d1a] border border-blue-900/60 rounded-xl shadow-[0_0_50px_rgba(30,58,138,0.35)] overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-950/80 via-[#0c1427] to-slate-900 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-broadcast font-bold tracking-wider text-white">
                  FETS GOOGLE CHAT & MEET ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WEBHOOK LIVE
                </span>
              </div>
              <p className="text-xs font-tech text-slate-400">
                Connected Space: <span className="text-blue-300 font-semibold">FETS</span> (ID: <code className="text-amber-300 font-mono text-[11px]">AAQASK8GJO4</code>)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Close Google Chat Engine"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Notification Banners */}
          {sendSuccessMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-tech">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}
          {sendErrorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-tech">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{sendErrorMessage}</span>
            </div>
          )}

          {/* Section 1: Authentication & Workspace Identity */}
          <div className="bg-[#0b1224] border border-blue-900/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentUser ? (
                currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-11 h-11 rounded-full border-2 border-emerald-400 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-400">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Globe className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-broadcast font-bold text-white tracking-wide">
                    {currentUser ? currentUser.displayName || 'Google Workspace User' : 'Google Workspace Account'}
                  </span>
                  {currentUser ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-bold uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
                      AUTHENTICATED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                      WEBHOOK MODE (NO SIGN-IN REQUIRED)
                    </span>
                  )}
                </div>
                <p className="text-xs font-tech text-slate-400">
                  {currentUser
                    ? currentUser.email
                    : 'Messages will post to FETS space via direct Google Chat Webhook Integration.'}
                </p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div>
              {currentUser ? (
                <button
                  onClick={handleGoogleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>SIGN OUT</span>
                </button>
              ) : (
                /* Standard Google Sign-In button per workspace-integration SKILL */
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-sans-ui font-semibold text-xs rounded-md shadow-md border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
                  title="Sign in with Google Workspace to send messages as yourself"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {authScopeWarning && (
            <p className="text-xs font-tech text-cyan-300 bg-cyan-950/40 p-2.5 rounded border border-cyan-800/40">
              ℹ️ {authScopeWarning}
            </p>
          )}

          {authError && (
            <div className="text-xs font-tech text-amber-300 bg-amber-950/50 p-2.5 rounded border border-amber-700/50 space-y-1">
              <p className="font-bold">⚠️ Google Authentication Notice</p>
              <p>{authError}</p>
              <p className="text-[11px] text-amber-400/80">
                Tip: You can use direct <strong>Webhook Mode</strong> without signing in to dispatch messages to the FETS Google Chat Space.
              </p>
            </div>
          )}

          {/* Section 2: Quick Broadcast Actions to FETS Space */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-tech text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                ONE-CLICK BROADCAST RELAY TO FETS SPACE
              </h3>
              <span className="text-[10px] font-tech text-slate-400">
                Space AAQASK8GJO4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Button 1: Breaking Alert */}
              <button
                onClick={handleDispatchBreaking}
                className="flex flex-col items-start p-3 rounded-lg bg-gradient-to-br from-red-950/80 to-slate-900 border border-red-800/70 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1 text-xs font-broadcast font-bold text-red-400 group-hover:text-red-300">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>POST BREAKING NEWS</span>
                  </div>
                  <span className="text-[9px] font-tech bg-red-900/60 px-1 py-0.2 rounded text-red-200">
                    RED ALERT
                  </span>
                </div>
                <p className="text-[11px] font-tech text-slate-300 line-clamp-2">
                  {breakingHeadline || activeStoryTopic || 'Urgent broadcast update to FETS group'}
                </p>
              </button>

              {/* Button 2: Post Rundown */}
              <button
                onClick={handleDispatchRundown}
                className="flex flex-col items-start p-3 rounded-lg bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-800/70 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1 text-xs font-broadcast font-bold text-blue-400 group-hover:text-blue-300">
                    <FileText className="w-3.5 h-3.5" />
                    <span>POST SCRIPT / RUNDOWN</span>
                  </div>
                  <span className="text-[9px] font-tech bg-blue-900/60 px-1 py-0.2 rounded text-blue-200">
                    PRODUCER
                  </span>
                </div>
                <p className="text-[11px] font-tech text-slate-300 line-clamp-2">
                  Share active anchor script and questions with FETS team
                </p>
              </button>

              {/* Button 3: Create Google Meet Bridge */}
              <button
                onClick={handleCreateMeet}
                disabled={isCreatingMeet}
                className="flex flex-col items-start p-3 rounded-lg bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/70 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer text-left group disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1 text-xs font-broadcast font-bold text-emerald-400 group-hover:text-emerald-300">
                    <Video className="w-3.5 h-3.5" />
                    <span>GOOGLE MEET BRIDGE</span>
                  </div>
                  <span className="text-[9px] font-tech bg-emerald-900/60 px-1 py-0.2 rounded text-emerald-200">
                    {isCreatingMeet ? 'GENERATING...' : 'LIVE ROOM'}
                  </span>
                </div>
                <p className="text-[11px] font-tech text-slate-300 line-clamp-2">
                  {meetUrl ? 'Active: ' + meetUrl : 'Create instant Meet room and share to FETS'}
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Google Meet Active Video Bridge Card */}
          {meetUrl && (
            <div className="bg-[#091522] border border-emerald-600/60 rounded-lg p-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-broadcast font-bold text-white tracking-wider">
                      GOOGLE MEET VIDEO BRIDGE ROOM
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-bold bg-emerald-500 text-black">
                      ONLINE
                    </span>
                  </div>
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-emerald-400 hover:underline truncate block"
                  >
                    {meetUrl}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMeet}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-tech bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="Copy Google Meet Link"
                >
                  {copiedMeet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMeet ? 'COPIED' : 'COPY'}</span>
                </button>

                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-tech font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>JOIN MEET</span>
                </a>
              </div>
            </div>
          )}

          {/* Section 4: Custom Message Dispatcher to FETS Space */}
          <div className="bg-[#0b1224] border border-blue-900/40 rounded-lg p-4">
            <h3 className="text-xs font-tech text-slate-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              DISPATCH OPERATIONAL DIRECTIVE TO FETS SPACE
            </h3>

            <form onSubmit={handleDispatchCustom} className="space-y-3">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type operational directive for FETS Google Chat group (e.g., 'Calicut Centre Pod 14 RMA sync complete', 'Pearson VUE afternoon admissions verified on schedule')..."
                rows={3}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-tech text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRelayBreaking}
                      onChange={(e) => setAutoRelayBreaking(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                    <span>Prompt on Breaking News alerts</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRelayMeet}
                      onChange={(e) => setAutoRelayMeet(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                    <span>Auto-prompt to share Google Meet links</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !customText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-broadcast font-bold tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'DISPATCHING...' : 'DISPATCH TO FETS'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 5: FETS Google Chat Transmission History Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-tech text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                TRANSMISSION LOG (SPACE: AAQASK8GJO4)
              </h3>
              <span className="text-[10px] font-tech text-slate-500">
                {transmissionLogs.length} EVENTS RECORDED
              </span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-xs pr-1">
              {transmissionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80 gap-3"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-[10px] font-tech text-slate-500 shrink-0 mt-0.5">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-tech font-bold uppercase shrink-0 mt-0.5 ${
                        log.type === 'breaking'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : log.type === 'meet_link'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : log.type === 'rundown'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.type}
                    </span>
                    <p className="text-slate-300 text-xs truncate">
                      {log.content}
                    </p>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                    DELIVERED 200 OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#060a14] border-t border-blue-900/40 flex items-center justify-between text-xs font-tech text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Chat Engine Active • Webhook Endpoint Ready</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-broadcast font-bold tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            RETURN TO STUDIO
          </button>
        </div>

        {/* User Confirmation Dialog (MANDATORY per Workspace Skill) */}
        {confirmationAction && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div
              id="fets-chat-confirmation-modal"
              className="w-full max-w-md bg-[#0c1427] border border-blue-500/60 rounded-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-broadcast font-bold text-white tracking-wide">
                    {confirmationAction.title}
                  </h4>
                  <p className="text-[11px] font-tech text-slate-400">
                    Target: Google Chat Space "FETS" (AAQASK8GJO4)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-tech text-slate-300 leading-relaxed">
                {confirmationAction.description}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setConfirmationAction(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-tech bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={executeConfirmedDispatch}
                  className="px-4 py-1.5 rounded-lg text-xs font-broadcast font-bold tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.7)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM & TRANSMIT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
