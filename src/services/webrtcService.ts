import { Participant } from '../types';

export interface PeerUser {
  id: string;
  name: string;
  designation: string;
  location: string;
  role?: string;
  isAnchor?: boolean;
  hasCamera: boolean;
  hasMic: boolean;
  joinedAt: number;
}

type StreamCallback = (peerId: string, stream: MediaStream) => void;
type PeerCallback = (peer: PeerUser) => void;
type PeerLeftCallback = (peerId: string) => void;
type StatusCallback = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
type DirectorActionCallback = (action: string, payload: any) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private ws: WebSocket | null = null;
  private roomId: string = 'fets-news';
  private localUser: PeerUser | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();

  // Callbacks
  private onRemoteStreamCb: StreamCallback | null = null;
  private onPeerJoinedCb: PeerCallback | null = null;
  private onPeerLeftCb: PeerLeftCallback | null = null;
  private onPeerUpdatedCb: PeerCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private onDirectorActionCb: DirectorActionCallback | null = null;

  private reconnectTimeout: any = null;
  private isIntentionalClose: boolean = false;

  constructor() {}

  public init(
    roomId: string,
    user: PeerUser,
    callbacks: {
      onRemoteStream?: StreamCallback;
      onPeerJoined?: PeerCallback;
      onPeerLeft?: PeerLeftCallback;
      onPeerUpdated?: PeerCallback;
      onStatus?: StatusCallback;
      onDirectorAction?: DirectorActionCallback;
    }
  ) {
    this.roomId = roomId;
    this.localUser = user;
    this.isIntentionalClose = false;

    if (callbacks.onRemoteStream) this.onRemoteStreamCb = callbacks.onRemoteStream;
    if (callbacks.onPeerJoined) this.onPeerJoinedCb = callbacks.onPeerJoined;
    if (callbacks.onPeerLeft) this.onPeerLeftCb = callbacks.onPeerLeft;
    if (callbacks.onPeerUpdated) this.onPeerUpdatedCb = callbacks.onPeerUpdated;
    if (callbacks.onStatus) this.onStatusCb = callbacks.onStatus;
    if (callbacks.onDirectorAction) this.onDirectorActionCb = callbacks.onDirectorAction;

    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
    }

    this.onStatusCb?.('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.onStatusCb?.('connected');
        if (this.localUser) {
          this.send({
            type: 'join',
            roomId: this.roomId,
            user: this.localUser,
          });
        }
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          await this.handleMessage(msg);
        } catch (err) {
          console.warn('Failed to parse WS message:', err);
        }
      };

      this.ws.onclose = () => {
        this.onStatusCb?.('disconnected');
        if (!this.isIntentionalClose) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            this.connectWebSocket();
          }, 3000);
        }
      };

      this.ws.onerror = () => {
        this.onStatusCb?.('error');
      };
    } catch (err) {
      console.warn('WebSocket setup error:', err);
      this.onStatusCb?.('error');
    }
  }

  private async handleMessage(msg: any) {
    switch (msg.type) {
      case 'room_joined': {
        // List of existing peers in room
        const existingPeers: PeerUser[] = msg.peers || [];
        for (const peer of existingPeers) {
          if (peer.id !== this.localUser?.id) {
            this.onPeerJoinedCb?.(peer);
            // Initiate connection with existing peer
            await this.createPeerConnection(peer.id, true);
          }
        }
        break;
      }

      case 'peer_joined': {
        const peer: PeerUser = msg.peer;
        if (peer.id !== this.localUser?.id) {
          this.onPeerJoinedCb?.(peer);
          // Existing peer creates connection (wait for offer or prepare)
          await this.createPeerConnection(peer.id, false);
        }
        break;
      }

      case 'peer_updated': {
        const peer: PeerUser = msg.peer;
        this.onPeerUpdatedCb?.(peer);
        break;
      }

      case 'peer_left': {
        const peerId: string = msg.peerId;
        this.closePeerConnection(peerId);
        this.onPeerLeftCb?.(peerId);
        break;
      }

      case 'signal': {
        const { senderId, signal } = msg;
        await this.handleSignal(senderId, signal);
        break;
      }

      case 'director_action': {
        this.onDirectorActionCb?.(msg.action, msg.payload);
        break;
      }
    }
  }

  private async createPeerConnection(peerId: string, isInitiator: boolean): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);

    // Attach local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.localUser) {
        this.send({
          type: 'signal',
          roomId: this.roomId,
          targetId: peerId,
          senderId: this.localUser.id,
          signal: {
            type: 'candidate',
            candidate: event.candidate,
          },
        });
      }
    };

    // Incoming remote track
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStreamCb?.(peerId, event.streams[0]);
      }
    };

    // If initiator, create and send offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        if (this.localUser) {
          this.send({
            type: 'signal',
            roomId: this.roomId,
            targetId: peerId,
            senderId: this.localUser.id,
            signal: {
              type: 'offer',
              sdp: offer,
            },
          });
        }
      } catch (err) {
        console.warn('Error creating WebRTC offer:', err);
      }
    }

    return pc;
  }

  private async handleSignal(senderId: string, signal: any) {
    let pc = this.peerConnections.get(senderId);
    if (!pc) {
      pc = await this.createPeerConnection(senderId, false);
    }

    try {
      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Flush any queued candidates
        const queued = this.pendingCandidates.get(senderId) || [];
        for (const cand of queued) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        this.pendingCandidates.delete(senderId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (this.localUser) {
          this.send({
            type: 'signal',
            roomId: this.roomId,
            targetId: senderId,
            senderId: this.localUser.id,
            signal: {
              type: 'answer',
              sdp: answer,
            },
          });
        }
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Flush queued candidates
        const queued = this.pendingCandidates.get(senderId) || [];
        for (const cand of queued) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        this.pendingCandidates.delete(senderId);
      } else if (signal.type === 'candidate' && signal.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          // Queue candidate until remote description is set
          const list = this.pendingCandidates.get(senderId) || [];
          list.push(signal.candidate);
          this.pendingCandidates.set(senderId, list);
        }
      }
    } catch (err) {
      console.warn('Error processing WebRTC signal:', err);
    }
  }

  public updateLocalStream(newStream: MediaStream | null) {
    this.localStream = newStream;

    // Update all peer connections with the new tracks
    for (const [_, pc] of this.peerConnections.entries()) {
      const senders = pc.getSenders();
      if (newStream) {
        const videoTrack = newStream.getVideoTracks()[0];
        const audioTrack = newStream.getAudioTracks()[0];

        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack).catch((err) => console.warn(err));
        } else if (videoTrack && !videoSender) {
          pc.addTrack(videoTrack, newStream);
        }

        const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack).catch((err) => console.warn(err));
        } else if (audioTrack && !audioSender) {
          pc.addTrack(audioTrack, newStream);
        }
      } else {
        // Stream stopped
        senders.forEach((s) => {
          if (s.track) {
            s.track.stop();
          }
        });
      }
    }

    if (this.localUser) {
      this.localUser.hasCamera = !!newStream && newStream.getVideoTracks().length > 0;
      this.localUser.hasMic = !!newStream && newStream.getAudioTracks().length > 0;
      this.send({
        type: 'user_updated',
        roomId: this.roomId,
        user: this.localUser,
      });
    }
  }

  public updateLocalUserInfo(updates: Partial<PeerUser>) {
    if (!this.localUser) return;
    this.localUser = { ...this.localUser, ...updates };
    this.send({
      type: 'user_updated',
      roomId: this.roomId,
      user: this.localUser,
    });
  }

  public sendDirectorAction(action: string, payload: any) {
    this.send({
      type: 'director_action',
      roomId: this.roomId,
      action,
      payload,
    });
  }

  private closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      try {
        pc.close();
      } catch (_) {}
      this.peerConnections.delete(peerId);
    }
    this.pendingCandidates.delete(peerId);
  }

  private send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public destroy() {
    this.isIntentionalClose = true;
    clearTimeout(this.reconnectTimeout);

    for (const [peerId] of this.peerConnections.entries()) {
      this.closePeerConnection(peerId);
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
  }
}

export const webrtcService = new WebRTCService();
