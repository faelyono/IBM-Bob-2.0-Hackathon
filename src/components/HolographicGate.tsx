import React, { useRef, useEffect, useState } from 'react';
import { ReleaseReport } from '../types/report';
import { Eye, RotateCcw, ZoomIn, ZoomOut, Compass, Sparkles, Layers } from 'lucide-react';

interface HolographicGateProps {
  report: ReleaseReport;
  onSelectCheckpoint?: (checkpointId: string) => void;
  isFixApplied?: boolean;
}

interface SatelliteNode {
  id: string;
  name: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  angle: number;
  distance: number;
  height: number;
  details: string;
  metric: string;
}

export const HolographicGate: React.FC<HolographicGateProps> = ({
  report,
  onSelectCheckpoint,
  isFixApplied = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Camera & Controls state
  const [yaw, setYaw] = useState<number>(0.35);
  const [pitch, setPitch] = useState<number>(0.52);
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeCameraPreset, setActiveCameraPreset] = useState<'iso' | 'flight' | 'top'>('iso');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<SatelliteNode | null>(null);

  // Dynamic satellite data
  const rollbackStatus = isFixApplied || report.agents.rollback_prover.status === 'PASS' ? 'PASS' : 'WARNING';

  const satellites: SatelliteNode[] = [
    {
      id: 'schema',
      name: 'SCHEMA',
      status: report.agents.ast_parser.status,
      angle: 0.15,
      distance: 220,
      height: 30,
      details: 'AST Syntax Verification',
      metric: '1,840 nodes verified · 0 errors',
    },
    {
      id: 'config',
      name: 'CONFIG',
      status: report.agents.config_enforcer.status,
      angle: 1.55,
      distance: 200,
      height: 45,
      details: 'Vault HSM Secrets & KMS Rotation',
      metric: '34/34 Keys Verified · 100% Compliant',
    },
    {
      id: 'dependency',
      name: 'DEPENDENCY',
      status: report.agents.dependency_auditor.status,
      angle: 3.14,
      distance: 210,
      height: 25,
      details: 'Transitive Pin Locks & Vulnerabilities',
      metric: '0 CVEs · Byte-for-byte SHA256 deterministic',
    },
    {
      id: 'rollback',
      name: 'ROLLBACK',
      status: rollbackStatus,
      angle: 4.65,
      distance: 230,
      height: 40,
      details: rollbackStatus === 'PASS'
        ? 'Synthetic Invariant Guard Verified'
        : 'Parity Violation: DROP TABLE without backup',
      metric: rollbackStatus === 'PASS' ? '100% Byte Equivalence' : '1 DDL Hazard Flagged',
    },
  ];

  // Camera presets
  const applyPreset = (preset: 'iso' | 'flight' | 'top') => {
    setActiveCameraPreset(preset);
    if (preset === 'iso') {
      setYaw(0.35);
      setPitch(0.52);
      setZoom(1.0);
    } else if (preset === 'flight') {
      setYaw(0.05);
      setPitch(0.22);
      setZoom(1.15);
    } else if (preset === 'top') {
      setYaw(0);
      setPitch(1.35);
      setZoom(0.9);
    }
  };

  // Mouse handlers for 3D rotation & pitch
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setYaw((prev) => prev + dx * 0.006);
    setPitch((prev) => Math.max(0.1, Math.min(1.45, prev + dy * 0.004)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.65, Math.min(1.8, prev - e.deltaY * 0.001)));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let shockwaveRadius = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle field
    const particles = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 140,
      y: Math.random() * 180 - 90,
      z: (Math.random() - 0.5) * 60,
      vy: 0.5 + Math.random() * 1.2,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    const render = () => {
      time += 0.016;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.56;

      // Auto-rotation delta if enabled and user is not actively dragging
      const currentYaw = yaw + (autoRotate && !isDragging ? Math.sin(time * 0.35) * 0.08 : 0);
      const currentPitch = pitch;
      const currentScale = zoom;

      // 3D Projection Engine
      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(currentYaw);
        const sinY = Math.sin(currentYaw);
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;

        const cosP = Math.cos(currentPitch);
        const sinP = Math.sin(currentPitch);
        const py = y * cosP - rz * sinP;
        const pz = y * sinP + rz * cosP;

        return {
          x: cx + rx * currentScale,
          y: cy + py * currentScale,
          depth: pz,
        };
      };

      ctx.save();

      // 1. Draw Engineered Floor Grid & Concentric Cybernetic Rings
      [70, 140, 210, 270, 330].forEach((r, idx) => {
        ctx.beginPath();
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const pt = project(Math.cos(theta) * r, 0, Math.sin(theta) * r);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle =
          idx === 2
            ? isFixApplied
              ? 'rgba(16, 185, 129, 0.45)'
              : 'rgba(0, 210, 255, 0.45)'
            : 'rgba(2, 132, 199, 0.14)';
        ctx.lineWidth = idx === 2 ? 1.5 : 1;
        if (idx === 2) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });

      // Radial laser grid lines
      ctx.setLineDash([2, 4]);
      for (let k = 0; k < 16; k++) {
        const theta = (k / 16) * Math.PI * 2;
        const p1 = project(Math.cos(theta) * 50, 0, Math.sin(theta) * 50);
        const p2 = project(Math.cos(theta) * 320, 0, Math.sin(theta) * 320);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.12)';
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Shockwave animation when fix is applied
      if (isFixApplied) {
        shockwaveRadius = (shockwaveRadius + 2.5) % 320;
        ctx.beginPath();
        for (let i = 0; i <= 36; i++) {
          const theta = (i / 36) * Math.PI * 2;
          const pt = project(Math.cos(theta) * shockwaveRadius, 0, Math.sin(theta) * shockwaveRadius);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - shockwaveRadius / 320)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 2. Holographic Gate Arch
      const pLeft = -75;
      const pRight = 75;
      const gateH = 155;
      const pW = 16;
      const pD = 16;

      const drawPillar = (baseX: number) => {
        const b1 = project(baseX - pW / 2, 0, -pD / 2);
        const b2 = project(baseX + pW / 2, 0, -pD / 2);
        const b3 = project(baseX + pW / 2, 0, pD / 2);
        const b4 = project(baseX - pW / 2, 0, pD / 2);

        const t1 = project(baseX - pW / 2, -gateH, -pD / 2);
        const t2 = project(baseX + pW / 2, -gateH, -pD / 2);
        const t3 = project(baseX + pW / 2, -gateH, pD / 2);
        const t4 = project(baseX - pW / 2, -gateH, pD / 2);

        ctx.fillStyle = isFixApplied ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 200, 235, 0.35)';
        ctx.strokeStyle = isFixApplied ? '#10b981' : '#00d2ff';
        ctx.lineWidth = 1.5;

        [
          [b1, b2, t2, t1],
          [b2, b3, t3, t2],
          [b3, b4, t4, t3],
          [b4, b1, t1, t4],
        ].forEach((poly) => {
          ctx.beginPath();
          ctx.moveTo(poly[0].x, poly[0].y);
          poly.forEach((pt) => ctx.lineTo(pt.x, pt.y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      };

      drawPillar(pLeft);
      drawPillar(pRight);

      // Top Lintel
      const lintelY = -gateH;
      const lt1 = project(pLeft - pW / 2 - 10, lintelY - 14, -pD / 2 - 4);
      const lt2 = project(pRight + pW / 2 + 10, lintelY - 14, -pD / 2 - 4);
      const lt3 = project(pRight + pW / 2 + 10, lintelY - 14, pD / 2 + 4);
      const lt4 = project(pLeft - pW / 2 - 10, lintelY - 14, pD / 2 + 4);

      const lb1 = project(pLeft - pW / 2 - 10, lintelY, -pD / 2 - 4);
      const lb2 = project(pRight + pW / 2 + 10, lintelY, -pD / 2 - 4);
      const lb3 = project(pRight + pW / 2 + 10, lintelY, pD / 2 + 4);
      const lb4 = project(pLeft - pW / 2 - 10, lintelY, pD / 2 + 4);

      ctx.fillStyle = isFixApplied ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 215, 255, 0.5)';
      ctx.strokeStyle = isFixApplied ? '#34d399' : '#38bdf8';
      ctx.lineWidth = 2;

      [
        [lb1, lb2, lt2, lt1],
        [lb2, lb3, lt3, lt2],
        [lb3, lb4, lt4, lt3],
        [lb4, lb1, lt1, lt4],
        [lt1, lt2, lt3, lt4],
      ].forEach((poly) => {
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        poly.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // 3. Holographic Scanning Laser Plane (Sweeping through the gate)
      const scanY = -gateH * (0.2 + (Math.sin(time * 2) * 0.5 + 0.5) * 0.6);
      const sLeft = project(pLeft + pW / 2, scanY, 0);
      const sRight = project(pRight - pW / 2, scanY, 0);

      const scanGrad = ctx.createLinearGradient(sLeft.x, sLeft.y, sRight.x, sRight.y);
      if (isFixApplied) {
        scanGrad.addColorStop(0, '#10b981');
        scanGrad.addColorStop(0.5, '#6ee7b7');
        scanGrad.addColorStop(1, '#10b981');
      } else {
        scanGrad.addColorStop(0, '#0284c7');
        scanGrad.addColorStop(0.5, '#38bdf8');
        scanGrad.addColorStop(1, '#0284c7');
      }
      ctx.beginPath();
      ctx.moveTo(sLeft.x, sLeft.y);
      ctx.lineTo(sRight.x, sRight.y);
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // 4. Central Rotating Cryptographic Tesseract / Diamond Core
      const coreY = -gateH * 0.5 + Math.sin(time * 1.5) * 8;
      const coreRadius = 26;
      const ctRot = time * 1.3;

      const coreVertices = [
        { x: 0, y: -coreRadius * 1.3, z: 0 },
        { x: 0, y: coreRadius * 1.3, z: 0 },
        { x: Math.cos(ctRot) * coreRadius, y: 0, z: Math.sin(ctRot) * coreRadius },
        { x: Math.cos(ctRot + Math.PI / 2) * coreRadius, y: 0, z: Math.sin(ctRot + Math.PI / 2) * coreRadius },
        { x: Math.cos(ctRot + Math.PI) * coreRadius, y: 0, z: Math.sin(ctRot + Math.PI) * coreRadius },
        { x: Math.cos(ctRot + (3 * Math.PI) / 2) * coreRadius, y: 0, z: Math.sin(ctRot + (3 * Math.PI) / 2) * coreRadius },
      ];

      const projCore = coreVertices.map((v) => project(v.x, coreY + v.y, v.z));
      ctx.strokeStyle = isFixApplied ? 'rgba(52, 211, 153, 0.9)' : 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 1.5;

      const edges = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 3], [3, 4], [4, 5], [5, 2],
      ];
      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(projCore[u].x, projCore[u].y);
        ctx.lineTo(projCore[v].x, projCore[v].y);
        ctx.stroke();
      });

      const centerCorePt = project(0, coreY, 0);
      const radGlow = ctx.createRadialGradient(centerCorePt.x, centerCorePt.y, 2, centerCorePt.x, centerCorePt.y, 24);
      radGlow.addColorStop(0, isFixApplied ? 'rgba(16, 185, 129, 0.9)' : 'rgba(56, 189, 248, 0.9)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(centerCorePt.x, centerCorePt.y, 24, 0, Math.PI * 2);
      ctx.fill();

      // 5. Particles rising
      particles.forEach((p) => {
        p.y -= p.vy;
        if (p.y < -gateH) {
          p.y = 0;
          p.x = (Math.random() - 0.5) * 120;
          p.z = (Math.random() - 0.5) * 40;
        }
        const pt = project(p.x, p.y, p.z);
        ctx.fillStyle = isFixApplied
          ? `rgba(110, 231, 183, ${p.alpha})`
          : `rgba(186, 230, 253, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Orbiting Satellites with clickable distance tracking
      satellites.forEach((sat) => {
        const curA = sat.angle + (autoRotate ? time * 0.15 : 0);
        const sx = Math.cos(curA) * sat.distance;
        const sz = Math.sin(curA) * sat.distance;
        const sy = -sat.height + Math.sin(time * 2 + sat.angle) * 8;

        const satPt = project(sx, sy, sz);

        // Ground shadow
        const groundPt = project(sx, 0, sz);
        ctx.beginPath();
        ctx.ellipse(groundPt.x, groundPt.y, 10, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
        ctx.fill();

        // Stroboscopic vertical guide line
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(groundPt.x, groundPt.y);
        ctx.lineTo(satPt.x, satPt.y);
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.3)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Laser link from gate core to satellite
        ctx.beginPath();
        ctx.moveTo(centerCorePt.x, centerCorePt.y);
        ctx.lineTo(satPt.x, satPt.y);
        const linkGrad = ctx.createLinearGradient(centerCorePt.x, centerCorePt.y, satPt.x, satPt.y);
        if (sat.status === 'WARNING') {
          linkGrad.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
          linkGrad.addColorStop(1, 'rgba(239, 68, 68, 0.7)');
        } else {
          linkGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          linkGrad.addColorStop(1, 'rgba(16, 185, 129, 0.7)');
        }
        ctx.strokeStyle = linkGrad;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Orb
        const isWarning = sat.status === 'WARNING';
        const nodeColor = isWarning ? '#ef4444' : '#10b981';
        const haloColor = isWarning ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)';

        const pulse = 10 + Math.sin(time * 3 + sat.angle) * 3.5;
        ctx.beginPath();
        ctx.arc(satPt.x, satPt.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = haloColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(satPt.x, satPt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = '700 10.5px "JetBrains Mono", monospace';
        ctx.fillStyle = isWarning ? '#b91c1c' : '#047857';
        ctx.textAlign = 'center';
        ctx.fillText(sat.name, satPt.x, satPt.y - 15);

        const verdict = isWarning ? 'PARITY VIOLATION' : 'VERIFIED';
        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = isWarning ? '#dc2626' : '#059669';
        ctx.fillText(verdict, satPt.x, satPt.y + 20);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [yaw, pitch, zoom, autoRotate, isDragging, report, isFixApplied]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-200/90 bg-[#f5f2ee]/40 shadow-xs transition-all font-inter"
    >
      {/* Top Telemetry Header Bar & Camera Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px] font-medium text-neutral-700">
          <span className="font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#ef4d23] ring-2 ring-[#ef4d23]/20" />
            3D HOLOGRAPHIC GATE & SATELLITES
          </span>
          <div className="hidden lg:flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              SCHEMA PASS
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              CONFIG VAULT
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              DEP SERVER
            </span>
            <span className={`flex items-center gap-1 font-semibold ${isFixApplied ? 'text-emerald-700' : 'text-[#ef4d23]'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isFixApplied ? 'bg-emerald-500' : 'bg-[#ef4d23] animate-pulse'}`} />
              {isFixApplied ? 'ROLLBACK REPAIRED' : 'ROLLBACK PARITY VIOLATION'}
            </span>
          </div>
        </div>

        {/* View Camera Mode Presets & Interactive Toggles */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center rounded-full border border-neutral-200 bg-[#f5f2ee] p-0.5 text-[11px]">
            <button
              onClick={() => applyPreset('iso')}
              className={`rounded-full px-2.5 py-0.5 transition-colors cursor-pointer ${
                activeCameraPreset === 'iso' ? 'bg-[#0b0f1a] font-bold text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => applyPreset('flight')}
              className={`rounded-full px-2.5 py-0.5 transition-colors cursor-pointer ${
                activeCameraPreset === 'flight' ? 'bg-[#0b0f1a] font-bold text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Flight
            </button>
            <button
              onClick={() => applyPreset('top')}
              className={`rounded-full px-2.5 py-0.5 transition-colors cursor-pointer ${
                activeCameraPreset === 'top' ? 'bg-[#0b0f1a] font-bold text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Overhead
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Orbit"
            className={`flex h-7 items-center gap-1 rounded-full border px-2.5 text-[10px] cursor-pointer shadow-xs ${
              autoRotate ? 'border-[#ef4d23]/40 bg-orange-50 text-[#ef4d23]' : 'border-neutral-200 bg-white text-neutral-600'
            }`}
          >
            <RotateCcw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>Auto</span>
          </button>
        </div>
      </div>

      {/* Main Interactive 3D Canvas */}
      <div
        className="relative h-[380px] sm:h-[420px] w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        title="Click and drag to rotate pitch & yaw • Scroll wheel to zoom"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Floating Quick Checkpoint Drawer Bar */}
        <div className="absolute bottom-3 left-3 right-3 hidden sm:flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {satellites.map((sat) => {
              const isWarning = sat.status === 'WARNING';
              return (
                <button
                  key={sat.id}
                  onClick={() => onSelectCheckpoint?.(sat.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isWarning
                      ? 'border-[#ef4d23]/40 bg-[#fff5f2]/95 text-[#ef4d23] font-bold'
                      : 'border-neutral-200 bg-white/95 text-neutral-800'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isWarning ? 'bg-[#ef4d23] animate-pulse' : 'bg-emerald-500'}`} />
                  <span>{sat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-full border border-neutral-200/80 bg-white/90 px-3 py-1 text-[10px] font-mono text-neutral-500 backdrop-blur-sm pointer-events-auto shadow-xs">
            Zoom: {Math.round(zoom * 100)}% · Drag / Scroll to Inspect
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Readout Overlays */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-neutral-200/80 bg-white/90 px-4 py-2.5 text-[11px] font-mono text-neutral-600 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>AST depth: 9 levels | 4,112 tokens verified</span>
          <span className="hidden sm:inline text-neutral-300">·</span>
          <span className={isFixApplied ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
            {isFixApplied 
              ? 'Cluster sandbox replay: 0 faults, 0 hazards (Synthesized)' 
              : 'Cluster sandbox replay: 0 faults, 1 DDL hazard flagged'}
          </span>
        </div>
        <div className="text-neutral-400 text-[10px] whitespace-nowrap">
          Hover checkpoint satellite to inspect AST proofs
        </div>
      </div>
    </div>
  );
};
