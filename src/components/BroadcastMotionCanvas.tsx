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
  preset = 'satellite_orbit',
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

    // Simulated market points for trading preset
    const marketPoints: number[] = Array.from({ length: 40 }, () => 100 + Math.random() * 50);

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark studio background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 32;
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

      // Visualizations based on preset
      if (preset === 'trading_floor') {
        // --- 1. FINANCIAL DESK / MARKET FLOOR VISUALIZER ---
        const activeColor = isSpeaking ? '#ef4444' : '#10b981';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;

        if (frameCount % 6 === 0) {
          marketPoints.shift();
          const last = marketPoints[marketPoints.length - 1];
          const delta = (Math.random() - 0.48) * 8;
          marketPoints.push(Math.max(40, Math.min(height - 60, last + delta)));
        }

        // Draw candlestick / line chart
        ctx.beginPath();
        const step = width / (marketPoints.length - 1);
        marketPoints.forEach((val, idx) => {
          const x = idx * step;
          const y = height / 2 + (val - 120) * 0.8;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Candlestick bars
        ctx.fillStyle = isSpeaking ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
        marketPoints.forEach((val, idx) => {
          if (idx % 2 === 0) {
            const x = idx * step - 3;
            const y = height / 2 + (val - 120) * 0.8;
            const barHeight = Math.sin(frameCount * 0.05 + idx) * 16 + 10;
            ctx.fillRect(x, y, 6, barHeight);
          }
        });

        // Market ticker data in canvas
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('NIKKEI 225: 39,240.50 (+1.4%)', 20, height - 30);
        ctx.fillText('TOPIX: 2,780.12 • S&P FUT: 5,640.25 • JPY/USD: 154.20', 20, height - 16);
      } else if (preset === 'capitol_skyline') {
        // --- 2. CAPITOL HILL NIGHT FEED & MICROWAVE TOWER ---
        // Horizon silhouette
        ctx.fillStyle = '#0a1024';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height - 80);
        ctx.lineTo(width * 0.35, height - 80);
        // Capitol dome silhouette
        ctx.arc(width * 0.45, height - 80, 24, Math.PI, 0, false);
        ctx.lineTo(width * 0.55, height - 80);
        ctx.lineTo(width, height - 90);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Pulsing microwave tower beacon
        const beaconX = width * 0.8;
        const beaconY = height * 0.35;
        const pulseSize = (Math.sin(frameCount * 0.1) + 1) * 8 + 4;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sweeping radar beam from tower
        const beamAngle = frameCount * 0.03;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath();
        ctx.moveTo(beaconX, beaconY);
        ctx.lineTo(beaconX + Math.cos(beamAngle) * 90, beaconY + Math.sin(beamAngle) * 90);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText('WASHINGTON D.C. BUREAU • MICROWAVE UPLINK 02', 20, height - 20);
      } else {
        // --- 3. SATELLITE ORBIT 3D WIREFRAME GLOBE (Default / Diplomatic) ---
        const centerX = width / 2;
        const centerY = height / 2 - 10;
        const radius = Math.min(width, height) * 0.28;

        // Draw Globe outline
        ctx.strokeStyle = isSpeaking ? '#f87171' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating longitude ellipses
        const rot = frameCount * 0.02;
        for (let i = 0; i < 4; i++) {
          const angle = rot + (i * Math.PI) / 4;
          const ellipseWidth = Math.abs(Math.sin(angle)) * radius;
          ctx.strokeStyle = isSpeaking ? 'rgba(239,68,68,0.25)' : 'rgba(56,189,248,0.25)';
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, ellipseWidth, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Latitude lines
        [-0.5, 0, 0.5].forEach((lat) => {
          const latY = centerY + lat * radius * 0.9;
          const latRadius = Math.sqrt(Math.max(0, radius * radius - Math.pow(latY - centerY, 2)));
          ctx.strokeStyle = 'rgba(56,189,248,0.2)';
          ctx.beginPath();
          ctx.ellipse(centerX, latY, latRadius, latRadius * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Orbiting Satellite
        const orbitAngle = frameCount * 0.04;
        const satX = centerX + Math.cos(orbitAngle) * (radius * 1.35);
        const satY = centerY + Math.sin(orbitAngle) * (radius * 0.5);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(satX, satY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Satellite laser uplink to center
        ctx.strokeStyle = isSpeaking ? 'rgba(248, 113, 113, 0.6)' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- COMMON BROADCAST TELEMETRY OVERLAY ---
      // Live Audio Waveform at bottom
      const waveY = height - 44;
      ctx.strokeStyle = isSpeaking ? '#ef4444' : '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveSamples = 30;
      const waveStep = (width - 40) / waveSamples;
      for (let i = 0; i < waveSamples; i++) {
        const x = 20 + i * waveStep;
        const amp = isSpeaking ? (audioLevel / 100) * 22 : 3;
        const y = waveY + Math.sin(frameCount * 0.2 + i * 0.5) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Dynamic Timecode (SMPTE HH:MM:SS:FF)
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      const ff = String(frameCount % 30).padStart(2, '0');
      const timecode = `${hh}:${mm}:${ss}:${ff}`;

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`TC: ${timecode} UTC`, 20, 24);

      // Broadcast status
      ctx.fillStyle = isSpeaking ? '#f87171' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(
        `LIVE STUDIO • ${participant.location}`,
        20,
        38
      );

      // Radar sweep effect line
      const sweepY = (frameCount * 1.5) % height;
      const grad = ctx.createLinearGradient(0, sweepY - 10, 0, sweepY + 10);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 10, width, 20);

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
