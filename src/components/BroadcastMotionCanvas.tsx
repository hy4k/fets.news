import React, { useEffect, useRef } from 'react';
import { Participant } from '../types';

interface BroadcastMotionCanvasProps {
  participant: Participant;
  preset?: string;
  isSpeaking: boolean;
  audioLevel: number;
}

export const BroadcastMotionCanvas: React.FC<BroadcastMotionCanvasProps> = ({
  participant,
  preset = 'test_pod_matrix',
  isSpeaking,
  audioLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    // Pod simulation states for test_pod_matrix
    // 0: Standby, 1: Active Exam, 2: Biometrics/Intake, 3: Exam Starting
    const podStatuses = [
      1, 1, 2, 1, 1, 1,
      1, 3, 1, 1, 1, 2,
      1, 1, 1, 1, 3, 1,
      2, 1, 1, 1, 1, 1,
    ];

    // Bandwidth diagnostic points for secure_browser_grid
    const networkPoints: number[] = Array.from({ length: 36 }, () => 100 + Math.random() * 20);

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Dark emerald/slate newsroom canvas background
      ctx.fillStyle = '#050d0b';
      ctx.fillRect(0, 0, width, height);

      // Subtle engineering grid lines
      ctx.strokeStyle = 'rgba(0, 208, 132, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 28;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Check preset mode (with backward compatibility aliases)
      const isPodMatrix = preset === 'test_pod_matrix' || preset === 'satellite_orbit';
      const isFloorPlan = preset === 'centre_floor_plan' || preset === 'capitol_skyline';
      const isLockdownEngine = preset === 'secure_browser_grid' || preset === 'trading_floor';
      const isMcrDispatch = preset === 'operations_mcr' || preset === 'newsroom_hq';

      if (isPodMatrix) {
        // --- 1. TEST POD MATRIX (EXAM ROOM DELIVERIES P01-P24) ---
        const cols = 6;
        const rows = 4;
        const startX = 36;
        const startY = 56;
        const podW = (width - 72 - (cols - 1) * 8) / cols;
        const podH = (height - 120 - (rows - 1) * 8) / rows;

        // Draw lab pods
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const px = startX + c * (podW + 8);
            const py = startY + r * (podH + 8);
            const podCode = `P${String(idx + 1).padStart(2, '0')}`;
            const status = podStatuses[idx % podStatuses.length];

            // Pod frame
            let borderColor = 'rgba(0, 208, 132, 0.4)';
            let fillColor = 'rgba(0, 208, 132, 0.08)';
            let statusText = 'EXAM';
            let statusColor = '#00D084';

            if (status === 2) {
              borderColor = 'rgba(255, 199, 44, 0.6)';
              fillColor = 'rgba(255, 199, 44, 0.12)';
              statusText = 'BIO';
              statusColor = '#FFC72C';
            } else if (status === 3) {
              borderColor = 'rgba(56, 189, 248, 0.6)';
              fillColor = 'rgba(56, 189, 248, 0.12)';
              statusText = 'SYNC';
              statusColor = '#38bdf8';
            }

            if (isSpeaking && idx === 3) {
              borderColor = '#FF5A36';
              fillColor = 'rgba(255, 90, 54, 0.2)';
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(px, py, podW, podH);

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, podW, podH);

            // Pod label & status
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(podCode, px + 4, py + 12);

            ctx.fillStyle = statusColor;
            ctx.font = '8px monospace';
            ctx.fillText(statusText, px + podW - 24, py + 12);

            // Mini progress bar in pod
            const progW = (podW - 8) * ((0.4 + (idx * 0.07)) % 1);
            ctx.fillStyle = statusColor;
            ctx.fillRect(px + 4, py + podH - 6, progW, 2);
          }
        }

        // Optical proctor scanline
        const scanY = startY + ((frameCount * 1.2) % (rows * (podH + 8)));
        ctx.strokeStyle = 'rgba(0, 208, 132, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, scanY);
        ctx.lineTo(startX + cols * (podW + 8) - 8, scanY);
        ctx.stroke();

        // Footer ticker
        ctx.fillStyle = '#78a296';
        ctx.font = '9px monospace';
        ctx.fillText('ACTIVE LAB: 24/24 WORKSTATIONS • BIOMETRICS: 100% MATCH • CPRs: ZERO', 20, height - 28);
      } else if (isFloorPlan) {
        // --- 2. CENTRE FLOOR PLAN & ENVIRONMENTAL DIAGNOSTICS ---
        const cx = width / 2;
        const cy = height / 2 - 10;

        // Test centre perimeter layout
        ctx.strokeStyle = 'rgba(0, 208, 132, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 180, cy - 80, 360, 160);

        // Sub-rooms:
        // Reception & Lockers
        ctx.fillStyle = 'rgba(15, 35, 30, 0.6)';
        ctx.fillRect(cx - 170, cy - 70, 90, 60);
        ctx.strokeStyle = 'rgba(0, 208, 132, 0.3)';
        ctx.strokeRect(cx - 170, cy - 70, 90, 60);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('RECEPTION & LOCKERS', cx - 165, cy - 40);

        // Biometrics Desk
        ctx.fillRect(cx - 170, cy + 5, 90, 65);
        ctx.strokeRect(cx - 170, cy + 5, 90, 65);
        ctx.fillStyle = '#FFC72C';
        ctx.fillText('BIOMETRIC CHECK-IN', cx - 165, cy + 35);

        // Main Testing Lab Floor
        ctx.fillStyle = 'rgba(6, 26, 21, 0.8)';
        ctx.fillRect(cx - 65, cy - 70, 235, 140);
        ctx.strokeStyle = 'rgba(0, 208, 132, 0.6)';
        ctx.strokeRect(cx - 65, cy - 70, 235, 140);
        ctx.fillStyle = '#00D084';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('TESTING LAB A • 45 POD WORKSTATIONS', cx - 55, cy - 50);

        // Proctor Viewing Window
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(cx - 65, cy - 10, 8, 50);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(cx - 65, cy - 10, 8, 50);

        // Live Environmental telemetry
        ctx.fillStyle = '#8ec3b5';
        ctx.font = '9px monospace';
        ctx.fillText('CLIMATE: 21.2°C • HUMIDITY: 48% • NOISE: 24.2 dB (SILENT) • UPS: 100%', 20, height - 28);
      } else if (isLockdownEngine) {
        // --- 3. LOCKDOWN BROWSER & BANDWIDTH DIAGNOSTICS ---
        const activeColor = isSpeaking ? '#FF5A36' : '#00D084';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;

        if (frameCount % 6 === 0) {
          networkPoints.shift();
          const last = networkPoints[networkPoints.length - 1];
          const delta = (Math.random() - 0.5) * 6;
          networkPoints.push(Math.max(60, Math.min(height - 80, last + delta)));
        }

        // Network latency / lock integrity line
        ctx.beginPath();
        const step = (width - 60) / (networkPoints.length - 1);
        networkPoints.forEach((val, idx) => {
          const x = 30 + idx * step;
          const y = height / 2 + (val - 110) * 0.7;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Lockdown heartbeat bars
        ctx.fillStyle = isSpeaking ? 'rgba(255, 90, 54, 0.3)' : 'rgba(0, 208, 132, 0.25)';
        networkPoints.forEach((val, idx) => {
          if (idx % 2 === 0) {
            const x = 30 + idx * step - 3;
            const y = height / 2 + (val - 110) * 0.7;
            const barH = Math.sin(frameCount * 0.06 + idx) * 14 + 8;
            ctx.fillRect(x, y, 5, barH);
          }
        });

        // Lockdown telemetry info
        ctx.fillStyle = '#a1d4c7';
        ctx.font = '9px monospace';
        ctx.fillText('PEARSON VUE RMA: SYNCED • SURPASS SECURE CLIENT: ACTIVE • LOSS: 0.0%', 20, height - 28);
      } else {
        // --- 4. 24/7 FETS TCA DISPATCH & INTER-CENTRE COMMAND ---
        const cx = width / 2;
        const cy = height / 2 - 10;
        const hubRadius = Math.min(width, height) * 0.25;

        // Central FETS Hub ring
        ctx.strokeStyle = isSpeaking ? '#FF5A36' : '#00D084';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 3 Branch nodes: Calicut, Cochin, Regional Lab
        const nodes = [
          { name: 'CALICUT HQ', angle: 0 },
          { name: 'COCHIN HUB', angle: (2 * Math.PI) / 3 },
          { name: 'REGIONAL ITTS', angle: (4 * Math.PI) / 3 },
        ];

        nodes.forEach((node) => {
          const nx = cx + Math.cos(node.angle + frameCount * 0.01) * hubRadius;
          const ny = cy + Math.sin(node.angle + frameCount * 0.01) * hubRadius;

          ctx.fillStyle = '#00D084';
          ctx.beginPath();
          ctx.arc(nx, ny, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 208, 132, 0.4)';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(node.name, nx - 24, ny + 14);
        });

        // Center command dot
        ctx.fillStyle = '#FFC72C';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8ec3b5';
        ctx.font = '9px monospace';
        ctx.fillText('24x7 INTER-BRANCH HOTLINE • DUTY ROTATION: NORMAL • SHIFT: VERIFIED', 20, height - 28);
      }

      // --- COMMON BROADCAST TELEMETRY & AUDIO WAVE ---
      // Live Audio Waveform at bottom
      const waveY = height - 42;
      ctx.strokeStyle = isSpeaking ? '#FF5A36' : '#00D084';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveSamples = 30;
      const waveStep = (width - 40) / waveSamples;
      for (let i = 0; i < waveSamples; i++) {
        const x = 20 + i * waveStep;
        const amp = isSpeaking ? (audioLevel / 100) * 20 : 2;
        const y = waveY + Math.sin(frameCount * 0.2 + i * 0.5) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Dynamic SMPTE Timecode (UTC & IST)
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ff = String(frameCount % 30).padStart(2, '0');
      const timecode = `${hh}:${mm}:${ss}:${ff}`;

      ctx.fillStyle = '#00D084';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`TC: ${timecode} IST • LIVE ON AIR`, 20, 22);

      // Branch / Lab location tag
      ctx.fillStyle = isSpeaking ? '#FF5A36' : '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(
        `EXAM LAB FEED • ${participant.location || 'FETS TESTING LAB'}`,
        20,
        34
      );

      // Scanline sweep effect
      const sweepY = (frameCount * 1.5) % height;
      const grad = ctx.createLinearGradient(0, sweepY - 8, 0, sweepY + 8);
      grad.addColorStop(0, 'rgba(0, 208, 132, 0)');
      grad.addColorStop(0.5, 'rgba(0, 208, 132, 0.12)');
      grad.addColorStop(1, 'rgba(0, 208, 132, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 8, width, 16);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [participant, preset, isSpeaking, audioLevel]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={480}
        height={320}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
