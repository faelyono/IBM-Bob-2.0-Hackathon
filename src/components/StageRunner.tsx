import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Shield,
  Box,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Wand2,
  Key,
  Download,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ReleaseReport, AgentResult } from '../types/report';

interface StageRunnerProps {
  report: ReleaseReport;
  activeStage: number;
  onStageChange: (stage: number) => void;
  isFixApplied: boolean;
  onToggleFix: () => void;
  onOpenAgentModal?: (agent: AgentResult) => void;
  onOpenPrGuide?: () => void;
}

export const StageRunner: React.FC<StageRunnerProps> = ({
  report,
  activeStage,
  onStageChange,
  isFixApplied,
  onToggleFix,
  onOpenAgentModal,
  onOpenPrGuide,
}) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedAttestation, setCopiedAttestation] = useState(false);

  // Target score based on state
  const targetScore = isFixApplied ? 98 : report.readiness_score;

  // Animated score counter state
  const [displayScore, setDisplayScore] = useState<number>(targetScore);
  const [isScoreAnimating, setIsScoreAnimating] = useState<boolean>(false);

  // Animated subscores
  const targetSchemaScore = isFixApplied ? 98 : report.score_breakdown.schema_safety;
  const targetRollbackScore = isFixApplied ? 98 : report.score_breakdown.rollback_proof;

  const [displaySchema, setDisplaySchema] = useState<number>(targetSchemaScore);
  const [displaySecret, setDisplaySecret] = useState<number>(report.score_breakdown.secret_hygiene);
  const [displayDep, setDisplayDep] = useState<number>(report.score_breakdown.dependency_lock);
  const [displayRollback, setDisplayRollback] = useState<number>(targetRollbackScore);

  // Animate score counter smoothly up to targetScore on fix change or recompute
  useEffect(() => {
    setIsScoreAnimating(true);
    let startTimestamp: number | null = null;
    const duration = 800; // 0.8s responsive counter

    const startVal = displayScore;
    const endVal = targetScore;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo formula
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayScore(current);

      setDisplaySchema(Math.round(targetSchemaScore * ease));
      setDisplaySecret(Math.round(report.score_breakdown.secret_hygiene * ease));
      setDisplayDep(Math.round(report.score_breakdown.dependency_lock * ease));
      setDisplayRollback(Math.round(targetRollbackScore * ease));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsScoreAnimating(false);
      }
    };

    requestAnimationFrame(step);
  }, [targetScore, isFixApplied]);

  // Circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const scoreColor =
    displayScore >= 90 ? '#10b981' : displayScore >= 70 ? '#f59e0b' : '#ef4d23';

  const stages = [
    {
      num: 1,
      title: 'Pipeline Swarm',
      sub: '4 Autonomous Agents',
    },
    {
      num: 2,
      title: 'Readiness Gauge',
      sub: `Telemetry ${displayScore}/100`,
    },
    {
      num: 3,
      title: 'Rollback Proof Diff',
      sub: isFixApplied ? 'AST Guard Active' : 'AST Fix Studio',
    },
    {
      num: 4,
      title: 'Cryptographic Seal',
      sub: isFixApplied || report.status === 'PASS' ? 'Attestation Verified' : 'Attestation Proof',
    },
  ];

  const handleCopySha = () => {
    navigator.clipboard.writeText(report.attestation.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleCopyAttestation = () => {
    const data = JSON.stringify(report.attestation, null, 2);
    navigator.clipboard.writeText(data);
    setCopiedAttestation(true);
    setTimeout(() => setCopiedAttestation(false), 2000);
  };

  const handleDownloadManifest = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bobify-pr-${report.meta.pr_number}-attestation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRecompute = () => {
    setDisplayScore(0);
    setDisplaySchema(0);
    setDisplaySecret(0);
    setDisplayDep(0);
    setDisplayRollback(0);
    setIsScoreAnimating(true);
  };

  // Safe navigation helper
  const goToStage = (target: number) => {
    const next = Math.max(1, Math.min(4, target));
    onStageChange(next);
  };

  return (
    <section id="invariants" className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8 font-inter">
      {/* Container Panel */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden">
        {/* Stage Runner Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 bg-[#f5f2ee]/50 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#ef4d23]">
                STAGE RUNNER • Verified Invariant Protocol 2.4
              </span>
              {onOpenPrGuide && (
                <button
                  onClick={onOpenPrGuide}
                  className="inline-flex items-center gap-1 rounded-full bg-white border border-neutral-200/80 px-2 py-0.5 font-mono text-[10px] text-neutral-600 hover:text-[#ef4d23] hover:border-[#ef4d23] transition-colors cursor-pointer shadow-2xs"
                >
                  <HelpCircle className="h-3 w-3 text-[#ef4d23]" />
                  <span>What do different PRs do?</span>
                </button>
              )}
            </div>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Release <span className="font-serif italic font-normal text-neutral-900">Verification</span> Sandbox
            </h2>
          </div>

          {/* Stepper Controls: Previous & Next Stage */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToStage(activeStage - 1)}
              disabled={activeStage <= 1}
              title={activeStage <= 1 ? 'Already at first stage' : `Go to Stage ${activeStage - 1}`}
              className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-xs font-semibold text-neutral-600 px-2">
              Stage <strong className="text-neutral-900">{activeStage}</strong> of 4
            </span>

            <button
              onClick={() => goToStage(activeStage + 1)}
              disabled={activeStage >= 4}
              title={activeStage >= 4 ? 'Already at final stage' : `Go to Stage ${activeStage + 1}`}
              className="flex items-center gap-1 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <span>Next Stage</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Stage Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200/80 divide-x divide-neutral-100 bg-[#f5f2ee]/30">
          {stages.map((st) => {
            const isActive = activeStage === st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => goToStage(st.num)}
                className={`flex items-center gap-3 p-4 text-left transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-xs'
                    : 'hover:bg-white/60 text-neutral-600'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#ef4d23]" />
                )}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    isActive
                      ? 'bg-[#ef4d23] text-white shadow-xs'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {st.num}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isActive ? 'text-neutral-900 font-bold' : 'text-neutral-600'
                    }`}
                  >
                    {st.title}
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400 truncate">
                    {st.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          {/* ======================================================== */}
          {/* STAGE 1: Pipeline Swarm (4 Autonomous Agents) */}
          {/* ======================================================== */}
          {activeStage === 1 && (
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Agent 1: AST Tree Parser */}
                <div
                  onClick={() => onOpenAgentModal?.(report.agents.ast_parser)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#f5f2ee]/40 p-4 transition-all hover:bg-white hover:border-[#ef4d23] hover:shadow-xs cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#ef4d23] border border-orange-100">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-neutral-900">
                      AST Tree Parser
                    </h4>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      {report.agents.ast_parser.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-neutral-200/60 pt-2 font-mono text-[11px] text-neutral-600">
                    <div>{report.agents.ast_parser.metric_label}</div>
                    <div className="text-neutral-400">{report.agents.ast_parser.metric_sub}</div>
                  </div>
                </div>

                {/* Agent 2: Config & Secret Enforcer */}
                <div
                  onClick={() => onOpenAgentModal?.(report.agents.config_enforcer)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#f5f2ee]/40 p-4 transition-all hover:bg-white hover:border-[#ef4d23] hover:shadow-xs cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Shield className="h-4 w-4" />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-neutral-900">
                      Config & Secret Enforcer
                    </h4>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      {report.agents.config_enforcer.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-neutral-200/60 pt-2 font-mono text-[11px] text-neutral-600">
                    <div>{report.agents.config_enforcer.metric_label}</div>
                    <div className="text-neutral-400">{report.agents.config_enforcer.metric_sub}</div>
                  </div>
                </div>

                {/* Agent 3: Dependency Auditor */}
                <div
                  onClick={() => onOpenAgentModal?.(report.agents.dependency_auditor)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#f5f2ee]/40 p-4 transition-all hover:bg-white hover:border-[#ef4d23] hover:shadow-xs cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                        <Box className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border ${
                          report.agents.dependency_auditor.status === 'WARNING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {report.agents.dependency_auditor.status === 'WARNING' ? 'Warning' : 'Active'}
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-neutral-900">
                      Dependency Auditor
                    </h4>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      {report.agents.dependency_auditor.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-neutral-200/60 pt-2 font-mono text-[11px] text-neutral-600">
                    <div>{report.agents.dependency_auditor.metric_label}</div>
                    <div className="text-neutral-400">{report.agents.dependency_auditor.metric_sub}</div>
                  </div>
                </div>

                {/* Agent 4: Rollback Replay Sandbox */}
                <div
                  onClick={() => onOpenAgentModal?.(report.agents.rollback_prover)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-xs cursor-pointer ${
                    isFixApplied || report.agents.rollback_prover.status === 'PASS'
                      ? 'border-emerald-200 bg-emerald-50/30 hover:bg-white hover:border-emerald-400'
                      : 'border-[#ef4d23]/30 bg-[#ef4d23]/10 hover:bg-white hover:border-[#ef4d23]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                          isFixApplied || report.agents.rollback_prover.status === 'PASS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-orange-50 text-[#ef4d23] border-orange-100'
                        }`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border ${
                          isFixApplied || report.agents.rollback_prover.status === 'PASS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#ef4d23]/15 text-[#ef4d23] border-[#ef4d23]/30'
                        }`}
                      >
                        {isFixApplied || report.agents.rollback_prover.status === 'PASS' ? 'Active' : 'Warning'}
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-neutral-900">
                      Rollback Replay Sandbox
                    </h4>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      {isFixApplied
                        ? 'Simulates reverse down migrations with synthetic transaction snapshot view.'
                        : report.agents.rollback_prover.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-neutral-200/60 pt-2 font-mono text-[11px]">
                    <div
                      className={
                        isFixApplied || report.agents.rollback_prover.status === 'PASS'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-[#ef4d23] font-semibold'
                      }
                    >
                      {isFixApplied
                        ? '0 rollback violations (Guard Active)'
                        : report.agents.rollback_prover.metric_label}
                    </div>
                    <div className="text-neutral-400">
                      {isFixApplied ? '100% byte equivalence verified' : report.agents.rollback_prover.metric_sub}
                    </div>
                  </div>
                </div>
              </div>

              {/* Swarm Consensus Banner */}
              <div
                className={`mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  isFixApplied || report.status === 'PASS'
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                    : 'border-amber-200 bg-amber-50/60 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                      isFixApplied || report.status === 'PASS'
                        ? 'border-emerald-300 bg-white text-emerald-600'
                        : 'border-amber-300 bg-white text-amber-600'
                    }`}
                  >
                    {isFixApplied || report.status === 'PASS' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <p className="font-mono text-xs sm:text-sm font-medium">
                    {isFixApplied
                      ? 'Swarm consensus: 4 of 4 agents verified 100% invariant compliance. Gate is clear to promote.'
                      : report.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => goToStage(3)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isFixApplied || report.status === 'PASS'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-[#0b0f1a] text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span>{isFixApplied ? 'View Rollback Diff (Stage 3)' : 'Inspect Rollback Violation (Stage 3)'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Stage 1 Footer Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200/60 pt-4 text-xs">
                <span className="font-mono text-neutral-500">
                  Stage 1: 4 parallel autonomous agents deployed.
                </span>
                <button
                  onClick={() => goToStage(2)}
                  className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <span>Proceed to Readiness Gauge (Stage 2)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 2: Overall Release Readiness Score Gauge (Animated) */}
          {/* ======================================================== */}
          {activeStage === 2 && (
            <div>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Radial Score Gauge Card with Smooth Animated Fill */}
                <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-[#f5f2ee]/50 p-6 shadow-xs w-full lg:w-80 shrink-0 relative overflow-hidden">
                  {isScoreAnimating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px] text-[#ef4d23]">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Computing...</span>
                    </div>
                  )}

                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Readiness Score
                  </span>

                  <div className="relative mt-4 flex items-center justify-center">
                    <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 130 130">
                      {/* Background Track */}
                      <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#e5e5e5"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Animated Fill Circle */}
                      <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke={scoreColor}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-5xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                        {displayScore}
                      </span>
                      <span className="font-mono text-xs font-semibold text-neutral-400">/ 100</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center w-full">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-xs font-bold border transition-colors ${
                        displayScore >= 90
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#ef4d23]/10 text-[#ef4d23] border-[#ef4d23]/30'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          displayScore >= 90 ? 'bg-emerald-500' : 'bg-[#ef4d23]'
                        }`}
                      />
                      <span>{displayScore >= 90 ? 'VERIFIED READY' : 'GATE BLOCKED'}</span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Minimum threshold for production gate: <span className="font-mono font-semibold">90/100</span>
                    </p>

                    <button
                      onClick={handleRecompute}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-mono text-[11px] text-neutral-600 hover:bg-neutral-50 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 text-[#ef4d23]" />
                      <span>Re-evaluate Gauge</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Score Telemetry Matrix */}
                <div className="flex-1 w-full space-y-4">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      Telemetry Invariant Breakdown
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Weighted evaluation across 4 deterministic analysis dimensions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Schema Safety */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-neutral-700">Schema Migration Safety</span>
                        <span className="font-mono text-[#ef4d23] tabular-nums font-bold">
                          {displaySchema} / 100
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-[#ef4d23] transition-all duration-300"
                          style={{
                            width: `${displaySchema}%`,
                          }}
                        />
                      </div>
                      <span className="mt-1.5 block font-mono text-[10px] text-neutral-400">
                        {isFixApplied ? 'Safe non-destructive view backfill' : 'Flagged: DROP TABLE without snapshot'}
                      </span>
                    </div>

                    {/* Secret & KMS Hygiene */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-neutral-700">Secret & KMS Hygiene</span>
                        <span className="font-mono text-emerald-600 tabular-nums font-bold">
                          {displaySecret} / 100
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${displaySecret}%` }}
                        />
                      </div>
                      <span className="mt-1.5 block font-mono text-[10px] text-neutral-400">
                        Zero high-entropy plaintext credentials
                      </span>
                    </div>

                    {/* Dependency Lock */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-neutral-700">Dependency Drift & CVEs</span>
                        <span className="font-mono text-emerald-600 tabular-nums font-bold">
                          {displayDep} / 100
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${displayDep}%` }}
                        />
                      </div>
                      <span className="mt-1.5 block font-mono text-[10px] text-neutral-400">
                        Transitive lock integrity verified
                      </span>
                    </div>

                    {/* Rollback Reversibility */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-neutral-700">Rollback Reversibility</span>
                        <span className="font-mono text-amber-600 tabular-nums font-bold">
                          {displayRollback} / 100
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{
                            width: `${displayRollback}%`,
                          }}
                        />
                      </div>
                      <span className="mt-1.5 block font-mono text-[10px] text-neutral-400">
                        {isFixApplied ? '100% byte equivalence replay passed' : 'Down-migration fails byte equivalence'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 2 Footer Navigation: Previous & Next */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200/60 pt-4 text-xs">
                <button
                  onClick={() => goToStage(1)}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 font-semibold text-neutral-700 shadow-xs cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous: Pipeline Swarm (Stage 1)</span>
                </button>

                <button
                  onClick={() => goToStage(3)}
                  className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <span>Proceed to Rollback Proof Diff (Stage 3)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 3: Before/After Rollback Proof Panel (AST Fix Studio) */}
          {/* ======================================================== */}
          {activeStage === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#ef4d23]" />
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {report.rollback_diff.file}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    AST Invariant Replay comparing unsafe raw script vs. non-destructive synthetic guard.
                  </p>
                </div>

                {/* Interactive Fix Studio Toggle Button */}
                <button
                  onClick={onToggleFix}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    isFixApplied
                      ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-[#0b0f1a] hover:bg-neutral-800 text-white'
                  }`}
                >
                  <Wand2 className="h-3.5 w-3.5 text-[#ef4d23]" />
                  <span>
                    {isFixApplied
                      ? 'Revert to Original (Test Blocker)'
                      : 'Apply Synthetic Rollback Guard (Auto-Fix)'}
                  </span>
                </button>
              </div>

              {/* Side-by-side Code Diff Viewer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Unsafe Raw Down-Migration */}
                <div className="flex flex-col rounded-2xl border border-red-200 bg-red-50/20 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-red-200 bg-red-50/60 px-4 py-2.5 text-xs">
                    <span className="font-mono font-bold text-red-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Original Unverified Rollback
                    </span>
                    <span className="font-mono text-[11px] text-red-600">
                      -3 lines (Destructive)
                    </span>
                  </div>

                  <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto bg-[#fff8f8] text-red-950 flex-1">
                    <pre className="whitespace-pre-wrap">{report.rollback_diff.unsafe_code}</pre>
                  </div>

                  <div className="border-t border-red-200 bg-red-50/40 p-3 text-[11px] text-red-700">
                    <strong>Hazard Analysis:</strong> Executing <code>DROP TABLE</code> causes permanent data loss
                    if release rollback is triggered while transactions are pending.
                  </div>
                </div>

                {/* Column 2: Synthesized Non-Destructive Guard */}
                <div
                  className={`flex flex-col rounded-2xl border overflow-hidden transition-all ${
                    isFixApplied
                      ? 'border-emerald-300 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 bg-[#f5f2ee]/30'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b px-4 py-2.5 text-xs ${
                      isFixApplied
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-neutral-200 bg-neutral-100/60 text-neutral-700 font-medium'
                    }`}
                  >
                    <span className="font-mono flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isFixApplied ? 'bg-emerald-500' : 'bg-[#ef4d23]'
                        }`}
                      />
                      Synthesized Safe Rollback (Invariant Guard)
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 font-bold">
                      +8 lines (Zero-Loss)
                    </span>
                  </div>

                  <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto bg-[#f8fffa] text-emerald-950 flex-1">
                    <pre className="whitespace-pre-wrap">{report.rollback_diff.safe_code}</pre>
                  </div>

                  <div className="border-t border-emerald-200 bg-emerald-50/40 p-3 text-[11px] text-emerald-800">
                    <strong>Zero-Loss Proof:</strong> Renames table to cold partition and binds an atomic backward-compatible
                    view. Reversion restores 100% byte equivalence.
                  </div>
                </div>
              </div>

              {/* Stage 3 Footer Navigation: Previous & Next */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200/60 pt-4 text-xs">
                <button
                  onClick={() => goToStage(2)}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 font-semibold text-neutral-700 shadow-xs cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous: Readiness Gauge (Stage 2)</span>
                </button>

                <button
                  onClick={() => goToStage(4)}
                  className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <span>Proceed to Cryptographic Seal (Stage 4)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 4: Cryptographic Seal & Attestation Proof */}
          {/* ======================================================== */}
          {activeStage === 4 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-neutral-200 bg-[#f5f2ee]/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                        isFixApplied || report.status === 'PASS'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-amber-300 bg-amber-50 text-amber-600'
                      }`}
                    >
                      <Key className="h-5 w-5 text-[#ef4d23]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">
                        Cryptographic Release Attestation Seal
                      </h3>
                      <p className="font-mono text-xs text-neutral-500">
                        Hardware Security Module: {report.attestation.hsm_authority}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-mono text-xs font-bold border ${
                      isFixApplied || report.status === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[#ef4d23]/10 text-[#ef4d23] border-[#ef4d23]/30'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isFixApplied || report.status === 'PASS' ? 'bg-emerald-500' : 'bg-[#ef4d23]'
                      }`}
                    />
                    <span>
                      {isFixApplied || report.status === 'PASS'
                        ? 'ATTESTATION SIGNED (INVARIANTS 13/13)'
                        : report.attestation.gate_status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Seal ID:</span>
                    <span className="font-bold text-neutral-800">{report.attestation.seal_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Timestamp:</span>
                    <span className="text-neutral-800">{report.attestation.signed_at}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-neutral-400 block text-[11px]">SHA-256 Digest:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-white border border-neutral-200 rounded-full px-3 py-1 text-neutral-700 select-all truncate block flex-1 font-mono">
                        {report.attestation.sha256}
                      </code>
                      <button
                        onClick={handleCopySha}
                        className="flex items-center gap-1 shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 hover:bg-neutral-50 cursor-pointer shadow-xs"
                      >
                        {copiedSha ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedSha ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCopyAttestation}
                    className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 shadow-xs cursor-pointer"
                  >
                    {copiedAttestation ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Signed Attestation JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadManifest}
                    className="flex items-center gap-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white px-5 py-2 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#ef4d23]" />
                    <span>Download Release Manifest (.json)</span>
                  </button>
                </div>
              </div>

              {/* Stage 4 Footer Navigation: Previous */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200/60 pt-4 text-xs">
                <button
                  onClick={() => goToStage(3)}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 font-semibold text-neutral-700 shadow-xs cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous: Rollback Proof Diff (Stage 3)</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Invariant Protocol Complete</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
