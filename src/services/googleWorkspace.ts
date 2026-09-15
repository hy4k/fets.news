import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Workspace Scopes configured for Google Chat & Google Meet
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/meetings.space.created',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory ONLY (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

// Sign in with Google (triggered by user interaction)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Workspace Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface ChatWebhookMessagePayload {
  text?: string;
  headline?: string;
  subtitle?: string;
  eventType?: 'breaking' | 'broadcast_start' | 'meet_link' | 'rundown' | 'speaker_change' | 'general';
  broadcastData?: {
    topic?: string;
    anchorName?: string;
    breakingUrgency?: string;
    meetUrl?: string;
    activeSpeaker?: string;
    ticker?: string;
  };
  senderName?: string;
  webhookUrl?: string;
}

// Dispatch to FETS Google Chat incoming webhook through server proxy
export const sendFetsWebhookMessage = async (payload: ChatWebhookMessagePayload) => {
  const res = await fetch('/api/chat/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Webhook delivery failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
};

// Create a Google Meet space (via server proxy with user token or instant room)
export const createGoogleMeetSpace = async (token?: string | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch('/api/meet/create-space', {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Meet room creation failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
};

// List user's Google Chat spaces
export const listGoogleChatSpaces = async (token: string) => {
  const res = await fetch('/api/chat/spaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to list spaces' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
};

// Send message to a Google Chat space as the authenticated user
export const sendGoogleChatMessage = async (
  token: string,
  spaceName: string,
  text: string
) => {
  const res = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spaceName, text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
};
