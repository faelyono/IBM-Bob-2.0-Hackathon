import React, { useState, useEffect, useRef } from 'react';
import { ReleaseReport } from '../types/report';
import { Terminal, Shield, CheckCircle2, RotateCcw, ArrowRight, Sparkles, Cpu, GitBranch, Database, Key } from 'lucide-react';
import { BlurredButterfly } from './BlurredButterfly';

interface ScanningScreenProps {
  repoInput: string;
  report: ReleaseReport;
  onScanComplete: () => void;
  onCancel: () => void;
}

export const ScanningScreen: React.FC<ScanningScreenProps> = ({
  repoInput,
  report,
  onScanComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState<number>(10);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const repoName = report.meta.repo;
  const shortName = repoName.split('/').pop() || 'repo';
  const prNumber = report.meta.pr_number;

  const steps = [
    { label: 'Git AST Ingestion', desc: `Parsing ${repoName} syntax trees on ${report.meta.branch}`, icon: GitBranch },
    { label: 'Vault & Secrets Audit', desc: `Scanning ${report.agents.config_enforcer.metric_label} against HSM schema`, icon: Key },
    { label: 'Dependency Pin Lock', desc: `Checking ${report.agents.dependency_auditor.metric_label} for ${shortName}`, icon: Cpu },
    { label: 'Ephemeral DB Replay', desc: `Testing ${report.rollback_diff.file} reversibility`, icon: Database },
    { label: 'Consensus & Attestation', desc: `Computing Swarm Gate verdict for ${repoName}`, icon: Shield },
  ];

  // Animate 3D Scanner radar in canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.035;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Concentric rings
      [40, 80, 120, 155].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === 3 ? 'rgba(239, 77, 35, 0.35)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = i === 3 ? 1.5 : 1;
        if (i % 2 === 1) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Rotating Radar Sweep in warm orange/amber
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 155, angle, angle + 0.65);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 155);
      sweepGrad.addColorStop(0, 'rgba(239, 77, 35, 0.45)');
      sweepGrad.addColorStop(1, 'rgba(253, 224, 71, 0.01)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sweeping beam line
      const bx = cx + Math.cos(angle + 0.65) * 155;
      const by = cy + Math.sin(angle + 0.65) * 155;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = '#ef4d23';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Blinking satellite node targets
      const targets = [
        { a: 0.8, d: 90, color: '#10b981' },
        { a: 2.3, d: 130, color: '#10b981' },
        { a: 3.9, d: 110, color: '#ef4d23' },
        { a: 5.2, d: 140, color: report.status === 'BLOCKED' ? '#ef4444' : '#10b981' },
      ];

      targets.forEach((t) => {
        const tx = cx + Math.cos(t.a) * t.d;
        const ty = cy + Math.sin(t.a) * t.d;

        // Halo
        ctx.beginPath();
        ctx.arc(tx, ty, 6 + Math.sin(angle * 4 + t.a) * 2, 0, Math.PI * 2);
        ctx.fillStyle = t.color + '44';
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
      });

      // Central core
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4d23';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [report]);

  // Step-by-step progress simulation (~2.8s total)
  useEffect(() => {
    const rawLogs = [
      `[00:00.12] Connecting to target: ${repoName} (PR #${prNumber})`,
      `[00:00.35] Ingested commit ${report.meta.commit} (${report.meta.branch}) -> ${report.meta.target_branch}`,
      `[00:00.72] AST Tree Parser: ${report.agents.ast_parser.metric_label} mapped across ${shortName}`,
      `[00:01.10] Auditing secrets: ${report.agents.config_enforcer.metric_label} checked against Vault HSM schema`,
      `[00:01.55] Dependency Auditor: ${report.agents.dependency_auditor.metric_label} verified against advisory feed`,
      `[00:02.10] Ephemeral DB Sandbox initialized. Replaying ${report.rollback_diff.file}...`,
      report.status === 'BLOCKED'
        ? `[00:02.60] WARNING: Flagged hazard in ${report.rollback_diff.file}: ${report.agents.rollback_prover.findings[0]}`
        : `[00:02.60] Replay verified: 100% byte-for-byte equivalence confirmed for ${repoName}.`,
      `[00:02.85] Swarm consensus for ${repoName}: Score ${report.readiness_score}/100. Gate verdict compiled.`,
    ];

    let currentProgress = 10;
    let logIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 15;
      setProgress((prev) => Math.min(100, currentProgress));

      if (logIndex < rawLogs.length) {
        setLogs((prev) => [...prev, rawLogs[logIndex]]);
        logIndex += 1;
      }

      const stepIdx = Math.min(steps.length - 1, Math.floor((currentProgress / 100) * steps.length));
      setActiveStepIndex(stepIdx);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onScanComplete();
        }, 500);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#ededed] text-[#131b2e] flex flex-col items-center justify-center p-3 sm:p-6 font-inter relative overflow-hidden">
      {/* Blurred Butterflies focused on the scanning hub */}
      <BlurredButterfly
        className="-top-12 -left-12 z-0"
        size={340}
        blur={28}
        opacity={0.32}
        variant="orange"
      />
      <BlurredButterfly
        className="-bottom-16 -right-16 z-0"
        size={300}
        blur={26}
        opacity={0.24}
        variant="amber"
      />

      <div className="relative z-10 w-full max-w-4xl rounded-3xl border border-neutral-200/80 bg-[#f5f2ee] p-6 sm:p-8 shadow-xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef4d23] text-white shadow-sm ring-2 ring-[#ef4d23]/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#ef4d23] tracking-wider uppercase">
                  ACTIVE INVARIANT SWEEP
                </span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {report.meta.is_external_repo && (
                  <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 font-mono text-[10px] font-bold">
                    External Target
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate max-w-md">
                Analyzing {repoName} #{prNumber}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 font-mono text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onScanComplete}
              className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-4 py-1.5 font-mono text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
            >
              <span>Skip to Results</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Central Graphics: Radar Sweep + Progress Matrix */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Radar Canvas (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <BlurredButterfly
              className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              size={220}
              blur={18}
              opacity={0.25}
              variant="orange"
            />
            <div className="relative z-10 h-[220px] w-[220px] sm:h-[240px] sm:w-[240px] flex items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm">
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="block"
              />
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-neutral-900 tabular-nums">
                  {progress}%
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Verified
                </span>
              </div>
            </div>
            <span className="mt-3 font-mono text-xs text-neutral-600 z-10">
              Target: <strong className="text-neutral-900">{repoName}</strong>
            </span>
          </div>

          {/* Stepper Checklist (7 cols) */}
          <div className="md:col-span-7 space-y-3 relative z-10">
            {steps.map((st, i) => {
              const isPast = i < activeStepIndex;
              const isCurrent = i === activeStepIndex;
              const Icon = st.icon;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3.5 rounded-xl border p-3 transition-all ${
                    isCurrent
                      ? 'border-[#ef4d23] bg-white ring-2 ring-[#ef4d23]/20 shadow-xs'
                      : isPast
                      ? 'border-emerald-200 bg-white'
                      : 'border-neutral-200/60 bg-white/60 opacity-60'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                      isPast
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#ef4d23] text-white animate-pulse'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-900 truncate">
                        {st.label}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {isPast ? 'COMPLETED' : isCurrent ? 'RUNNING' : 'PENDING'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500 truncate">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Output Drawer */}
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-[#0b0f1a] text-[#f8fafc] overflow-hidden shadow-xs relative z-10">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#070a12] px-4 py-2 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-[#ef4d23]" />
              <span className="text-white font-semibold">LIVE INVARIANT STREAM: {repoName}</span>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Cluster: us-east-prod-gate
            </span>
          </div>

          <div className="p-4 font-mono text-xs leading-relaxed max-h-36 overflow-y-auto space-y-1 text-emerald-400">
            {logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
