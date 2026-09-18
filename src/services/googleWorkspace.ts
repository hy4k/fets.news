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

// Google Workspace Scopes configured for Google Chat & Google Meet (Restricted Scopes)
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/meetings.space.created',
];

// Standard provider for general authentication (email, profile, openid) - never fails with 403 access_denied
export const standardProvider = new GoogleAuthProvider();
standardProvider.setCustomParameters({
  prompt: 'select_account',
});

// Advanced workspace provider requesting direct Google Chat & Google Meet scopes
export const workspaceProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  workspaceProvider.addScope(scope);
});
workspaceProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory ONLY (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let hasWorkspacePermissions = false;

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
      hasWorkspacePermissions = false;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export interface GoogleSignInResult {
  user: User;
  accessToken: string;
  hasWorkspaceScopes: boolean;
  scopeWarning?: string;
}

// Sign in with Google (triggered by user interaction)
// Defaults to standard authentication; can optionally request sensitive Workspace scopes
export const googleSignIn = async (
  requestWorkspaceScopes = false
): Promise<GoogleSignInResult | null> => {
  try {
    isSigningIn = true;
    
    if (requestWorkspaceScopes) {
      try {
        const result = await signInWithPopup(auth, workspaceProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken || '';
        cachedAccessToken = token;
        hasWorkspacePermissions = true;
        return { user: result.user, accessToken: token, hasWorkspaceScopes: true };
      } catch (scopeError: any) {
        const errString = `${scopeError?.code || ''} ${scopeError?.message || ''}`.toLowerCase();
        // If Google rejects sensitive scopes with 403 / access_denied / restricted app
        if (errString.includes('access_denied') || errString.includes('403') || errString.includes('unauthorized')) {
          console.warn('Workspace scopes restricted in GCP Testing mode, falling back to standard profile sign-in:', scopeError);
          // Fall back to standard sign-in so user is still authenticated
          const fallbackResult = await signInWithPopup(auth, standardProvider);
          const fallbackCred = GoogleAuthProvider.credentialFromResult(fallbackResult);
          const fallbackToken = fallbackCred?.accessToken || '';
          cachedAccessToken = fallbackToken;
          hasWorkspacePermissions = false;
          return {
            user: fallbackResult.user,
            accessToken: fallbackToken,
            hasWorkspaceScopes: false,
            scopeWarning:
              'Signed in with standard TCA Google profile. (Google Chat direct API scopes require test user registration in Google Cloud Console; Webhook relay is fully active).',
          };
        }
        throw scopeError;
      }
    }

    // Default: Standard Google Sign-in (seamless, no 403 access_denied risk)
    const result = await signInWithPopup(auth, standardProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';

    cachedAccessToken = token;
    hasWorkspacePermissions = false;
    return { user: result.user, accessToken: token, hasWorkspaceScopes: false };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const hasWorkspaceChatScopes = (): boolean => {
  return hasWorkspacePermissions;
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
