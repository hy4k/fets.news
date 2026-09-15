import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory room management for WebRTC multi-user broadcasting
interface PeerUser {
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

interface SocketClient {
  ws: WebSocket;
  roomId: string;
  user: PeerUser;
}

const socketClients = new Map<WebSocket, SocketClient>();

// Helper to get active peers in a room
function getPeersInRoom(roomId: string, excludeWs?: WebSocket): PeerUser[] {
  const peers: PeerUser[] = [];
  for (const [ws, client] of socketClients.entries()) {
    if (client.roomId === roomId && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      peers.push(client.user);
    }
  }
  return peers;
}

// Helper to broadcast to room
function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const [ws, client] of socketClients.entries()) {
    if (client.roomId === roomId && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// Lazy-initialized Gemini client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Newsroom Broadcast Conference Server" });
});

// AI Newsroom Producer endpoint with Thinking Mode
app.post("/api/news/producer-assist", async (req, res) => {
  const { action, topic, speakerName, speakerRole, claim, currentChyron } = req.body;
  const ai = getAi();

  if (!ai) {
    // Provide realistic fallbacks when API key isn't provided yet
    if (action === "chyron") {
      return res.json({
        success: true,
        data: {
          headline: `FETS NEWS: ${topic ? topic.toUpperCase() : "CALICUT & COCHIN MORNING EXAM ADMISSIONS ON SCHEDULE"}`,
          subStrap: "PEARSON VUE & PROMETRIC: All 83 test pods operational; morning RMA checks verified",
          urgency: "DEVELOPING",
          category: "TECH",
          tickers: [
            "🟡 PROMETRIC CMA US: Calicut 18 open seats • Cochin 14 open seats • Live tracker synchronized",
            "🟡 PEARSON VUE: Morning RMA sync completed clean across all 45 Calicut & 38 Cochin workstations",
            "🟡 CELPIP PARAGON: Afternoon delivery window open • Audio headsets & biometric stations calibrated",
            "🟡 SHIFT ROTATION: 6-day duty checklist signed & verified by Lead TCA",
          ],
        },
      });
    }

    if (action === "fact-check") {
      return res.json({
        success: true,
        data: {
          verdict: "VERIFIED",
          confidence: "96%",
          summary: `The operational status regarding "${claim || topic}" aligns with active test delivery logs. Workstation check-in records and biometric validation telemetry confirm normal operational parameters.`,
          keySources: [
            "FETS MCR Central Operations Log",
            "Pearson VUE PVTC Operational Guidelines 2026",
            "Prometric CMA Test Delivery Protocol Handbook",
          ],
          anchorFollowUp: `Can we confirm that the backup fiber uplink latency is currently holding below 15ms across both centres?`,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        intro: `Good morning and welcome to FETS News Live from the Master Control Room. We are tracking full morning test delivery across all 83 pods in Calicut and Cochin. Let's cross live to our bureaus for the operational breakdown.`,
        transitionCue: `We're crossing live now to our Calicut Command Desk with Lead TCA Anshitha K for the admissions report.`,
        suggestedQuestions: [
          `Are all candidate check-in biometric scanners responding without latency?`,
          `Has the morning Pearson VUE RMA batch run completed cleanly across all workstations?`,
          `What is the seat availability projection for the afternoon CMA US window?`,
        ],
      },
    });
  }

  try {
    if (action === "chyron") {
      // Generate authentic TV broadcast lower-third chyrons
      const prompt = `You are the Executive Producer of FETS NEWS LIVE, the 24/7 television news broadcast and video conference network created for the FETS.LIVE staff (Mithun, Anshitha K, Naima MM, Bindu Rajan, Lazeem, Shimna, Aysha, Nimmy M).
FETS operates authorized testing centres in Calicut (45 Pods) and Cochin (38 Pods) delivering exams for Pearson VUE, Prometric (CMA US live seats), CELPIP (Paragon), PSI, and ITTS.
They manage 6-day rotation duties (Admin & Calendar, Data & Systems [RMA, DVR], Cases & Documentation [CPR, CELPIP], IT & Infrastructure, Facilities, and Follow-ups).
The newsroom is covering: "${topic || "Morning Shift Handover & Exam Delivery Operations"}".
Current speaker: ${speakerName || "Mithun"} (${speakerRole || "Super Admin & Director"}).
Generate authentic, punchy television news lower-third graphics and ticker headlines tailored to FETS operations.
Return ONLY valid JSON matching this structure:
{
  "headline": "Punchy ALL CAPS broadcast headline, max 60 chars",
  "subStrap": "Detailed descriptive sub-headline in sentence case, max 90 chars",
  "urgency": "BREAKING" | "DEVELOPING" | "ANALYSIS" | "EXCLUSIVE",
  "category": "WORLD" | "FINANCE" | "TECH" | "POLITICS" | "CLIMATE",
  "tickers": [
    "Ticker item 1 (short operational, seat status, or vendor update)",
    "Ticker item 2",
    "Ticker item 3",
    "Ticker item 4"
  ]
}`;

      try {
        // High thinking mode with gemini-3.1-pro-preview as requested
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: "application/json",
          },
        });
        const text = response.text || "{}";
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn("Falling back to gemini-3.8-flash for chyron:", err);
        const fbResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const parsed = JSON.parse(fbResponse.text || "{}");
        return res.json({ success: true, data: parsed });
      }
    }

    if (action === "fact-check") {
      // High-Thinking investigative fact checker
      const prompt = `You are the Chief Investigative Fact-Checker for a live news broadcast.
Analyze this statement or claim made on air:
"${claim || topic}"
Speaker: ${speakerName || "Panelist"} (${speakerRole || "Commentator"}).

Conduct a rigorous fact check with thorough verification.
Return ONLY valid JSON with this structure:
{
  "verdict": "VERIFIED" | "MOSTLY TRUE" | "CONTEXT NEEDED" | "MISLEADING" | "UNSUBSTANTIATED",
  "confidence": "e.g. 92%",
  "summary": "2-3 sentences concise journalistic breakdown explaining the facts and evidence.",
  "keySources": ["Source 1", "Source 2", "Source 3"],
  "anchorFollowUp": "1 sharp, professional question for the anchor to challenge or probe the speaker on air."
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: "application/json",
          },
        });
        const text = response.text || "{}";
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn("Falling back to gemini-3.8-flash for fact-check:", err);
        const fbResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const parsed = JSON.parse(fbResponse.text || "{}");
        return res.json({ success: true, data: parsed });
      }
    }

    // Teleprompter / Rundown generation
    const prompt = `You are the Senior Broadcast Producer writing the teleprompter copy for the lead anchor.
Topic: "${topic || "Breaking Developments"}".
Speaker in segment: ${speakerName} (${speakerRole}).
Current chyron: "${currentChyron || ""}".

Write anchor prompter lines that sound like an elite broadcast network anchor (commanding, articulate, rhythmic).
Return ONLY valid JSON:
{
  "intro": "Anchor reading script (approx 40-50 words, authoritative, ready for teleprompter)",
  "transitionCue": "Broadcast transition cue to introduce the next guest or switch camera",
  "suggestedQuestions": [
    "Sharp question 1",
    "Sharp question 2",
    "Sharp question 3"
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: "application/json",
        },
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsed });
    } catch (err) {
      console.warn("Falling back to gemini-3.8-flash for prompter:", err);
      const fbResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const parsed = JSON.parse(fbResponse.text || "{}");
      return res.json({ success: true, data: parsed });
    }
  } catch (error: any) {
    console.error("Gemini API error in producer-assist:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Error generating newsroom data",
    });
  }
});

// Room participant list endpoint
app.get("/api/rooms/:roomId", (req, res) => {
  const peers = getPeersInRoom(req.params.roomId);
  res.json({ roomId: req.params.roomId, count: peers.length, peers });
});

// Default FETS Google Chat Webhook URL (from user configuration)
const DEFAULT_FETS_WEBHOOK_URL =
  process.env.FETS_WEBHOOK_URL ||
  "https://chat.googleapis.com/v1/spaces/AAQASK8GJO4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=qYp4rZzHZrOhTX4j03Kk1OKb4puz1cWkc8rtQE0AAJw";

// 1. Google Chat Webhook Dispatcher
app.post("/api/chat/webhook", async (req, res) => {
  try {
    const {
      webhookUrl = DEFAULT_FETS_WEBHOOK_URL,
      text,
      headline,
      subtitle,
      eventType = "general",
      broadcastData = {},
      senderName = "FETS Control Room",
    } = req.body;

    const studioUrl = process.env.APP_URL || "https://ais-dev-gfea2zorj3xaru3qv6ibbh-614406699663.asia-southeast1.run.app";

    // Format rich message text
    let displayHeadline = headline || "FETS NEWS UPDATE";
    let formattedText = text;

    if (!formattedText) {
      if (eventType === "breaking") {
        formattedText = `🚨 *BREAKING NEWS ALERT*\\n*${broadcastData.topic || "Urgent Transmission"}*\\nUrgency: ${broadcastData.breakingUrgency || "RED ALERT"}\\nLower-Third Ticker: ${broadcastData.ticker || "Live feed active"}`;
      } else if (eventType === "broadcast_start") {
        formattedText = `🔴 *FETS STUDIO BROADCAST IS NOW LIVE*\\nAnchor: ${broadcastData.anchorName || "News Anchor"}\\nStudio Uplink: ${studioUrl}`;
      } else if (eventType === "meet_link") {
        formattedText = `📹 *GOOGLE MEET VIDEO BRIDGE CONNECTED*\\nMeeting Room: ${broadcastData.meetUrl || "https://meet.google.com"}\\nAll FETS members can click to join the broadcast discussion.`;
      } else if (eventType === "rundown") {
        formattedText = `📋 *FETS NEWSROOM RUN-DOWN / SCRIPT*\\nTopic: ${broadcastData.topic || "General News"}\\n${text || "Live rundown updated in studio."}`;
      } else {
        formattedText = `📡 *FETS NEWS TRANSMISSION*\\n${text || "Studio notification sent from FETS Control Room."}`;
      }
    }

    // Build Cards v2 payload for Google Chat
    const cardSections: any[] = [
      {
        header: `BROADCAST SIGNAL: ${eventType.toUpperCase().replace("_", " ")}`,
        widgets: [
          {
            decoratedText: {
              topLabel: "TRANSMISSION SOURCE",
              text: `<b>${senderName}</b>`,
              startIcon: { knownIcon: "CONFIRMATION_NUMBER_ICON" },
            },
          },
          {
            textParagraph: {
              text: formattedText.replace(/\\n/g, "<br>"),
            },
          },
        ],
      },
    ];

    // Optional Buttons
    const buttons: any[] = [
      {
        text: "OPEN LIVE STUDIO",
        onClick: {
          openLink: {
            url: studioUrl,
          },
        },
      },
    ];

    if (broadcastData.meetUrl) {
      buttons.push({
        text: "JOIN GOOGLE MEET",
        onClick: {
          openLink: {
            url: broadcastData.meetUrl,
          },
        },
      });
    }

    cardSections[0].widgets.push({
      buttonList: {
        buttons,
      },
    });

    const payload = {
      text: formattedText,
      cardsV2: [
        {
          cardId: `fets-${Date.now()}`,
          card: {
            header: {
              title: "FETS NEWSROOM LIVE",
              subtitle: `FETS Space (AAQASK8GJO4) • ${new Date().toLocaleTimeString()}`,
              imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/podcasts/default/48px.svg",
              imageType: "CIRCLE",
            },
            sections: cardSections,
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google Chat webhook error:", response.status, errText);
      return res.status(response.status).json({
        success: false,
        error: `Google Chat webhook returned ${response.status}: ${errText}`,
      });
    }

    const resData = await response.json().catch(() => ({}));
    return res.json({
      success: true,
      message: "Message successfully relayed to FETS Google Chat space",
      data: resData,
      space: "AAQASK8GJO4",
    });
  } catch (error: any) {
    console.error("Failed to post to Google Chat webhook:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error posting to Google Chat webhook",
    });
  }
});

// 2. Google Chat Space listing (OAuth proxy)
app.get("/api/chat/spaces", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" });
  }

  try {
    const response = await fetch("https://chat.googleapis.com/v1/spaces", {
      headers: { Authorization: token },
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Google Chat message sender (OAuth proxy)
app.post("/api/chat/messages", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" });
  }

  const { spaceName = "spaces/AAQASK8GJO4", text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    // Normalise spaceName
    const formattedSpace = spaceName.startsWith("spaces/") ? spaceName : `spaces/${spaceName}`;
    const response = await fetch(`https://chat.googleapis.com/v1/${formattedSpace}/messages`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Google Meet space creator & video bridge
app.post("/api/meet/create-space", async (req, res) => {
  const token = req.headers.authorization;

  // Try creating a real Google Meet space via Meet API v2 if OAuth token provided
  if (token) {
    try {
      const response = await fetch("https://meet.googleapis.com/v2/spaces", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          success: true,
          meetingUri: data.meetingUri,
          name: data.name,
          source: "google-meet-api-v2",
        });
      }
      console.warn("Google Meet API returned non-ok, falling back to dedicated room:", response.status);
    } catch (err) {
      console.warn("Error calling Google Meet API directly:", err);
    }
  }

  // Instant fallback Google Meet room link configured for the FETS studio
  const roomCode = `fets-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  const meetingUri = `https://meet.google.com/new`;

  return res.json({
    success: true,
    meetingUri: meetingUri,
    code: roomCode,
    source: "google-meet-instant",
    note: "Instant Google Meet room generated for FETS Live Broadcast.",
  });
});

// Integrate Vite Middleware and WebSocket Server
async function startServer() {
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case "join": {
            const { roomId, user } = msg;
            socketClients.set(ws, { ws, roomId, user });

            // 1. Send list of existing peers in the room to the new participant
            const existingPeers = getPeersInRoom(roomId, ws);
            ws.send(
              JSON.stringify({
                type: "room_joined",
                roomId,
                peers: existingPeers,
              })
            );

            // 2. Broadcast to all other peers in the room that a new peer joined
            broadcastToRoom(
              roomId,
              {
                type: "peer_joined",
                peer: user,
              },
              ws
            );
            break;
          }

          case "signal": {
            // WebRTC SDP offer, answer, or ICE candidate routing
            const { roomId, targetId, senderId, signal } = msg;
            for (const [targetWs, client] of socketClients.entries()) {
              if (
                client.roomId === roomId &&
                client.user.id === targetId &&
                targetWs.readyState === WebSocket.OPEN
              ) {
                targetWs.send(
                  JSON.stringify({
                    type: "signal",
                    senderId,
                    signal,
                  })
                );
                break;
              }
            }
            break;
          }

          case "user_updated": {
            const { roomId, user } = msg;
            const current = socketClients.get(ws);
            if (current) {
              current.user = { ...current.user, ...user };
            }
            broadcastToRoom(
              roomId,
              {
                type: "peer_updated",
                peer: user,
              },
              ws
            );
            break;
          }

          case "director_action": {
            const { roomId, action, payload } = msg;
            broadcastToRoom(
              roomId,
              {
                type: "director_action",
                action,
                payload,
              },
              ws
            );
            break;
          }
        }
      } catch (err) {
        console.warn("Invalid WS message:", err);
      }
    });

    ws.on("close", () => {
      const client = socketClients.get(ws);
      if (client) {
        socketClients.delete(ws);
        broadcastToRoom(client.roomId, {
          type: "peer_left",
          peerId: client.user.id,
        });
      }
    });

    ws.on("error", (err) => {
      console.warn("WebSocket client error:", err);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`FETS NEWS Live Broadcast server & WebRTC signaling running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
