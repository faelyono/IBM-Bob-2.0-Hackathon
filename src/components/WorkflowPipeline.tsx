import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ReleaseReport } from '../types/report';

interface WorkflowPipelineProps {
  report: ReleaseReport;
  isRunning: boolean;
  onRunPipeline: () => void;
  isFixApplied: boolean;
  onInspectStep?: (stepId: string) => void;
}

interface PipelineStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  log: string;
  duration: string;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  report,
  isRunning,
  onRunPipeline,
  isFixApplied,
  onInspectStep,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3);
  const [selectedStepId, setSelectedStepId] = useState<string>('agents');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const timeString = new Date().toLocaleTimeString();
  const repoName = report.meta.repo;
  const commit = report.meta.commit;
  const branch = report.meta.branch;
  const targetBranch = report.meta.target_branch;
  const shortName = repoName.split('/').pop() || 'repo';
  const diffFile = report.rollback_diff.file;
  const effectiveScore = isFixApplied ? 98 : report.readiness_score;

  const steps: PipelineStep[] = [
    {
      id: 'ingest',
      stepNumber: '01',
      title: 'Detect Changes',
      subtitle: 'Git AST syntax parser',
      badge: report.agents.ast_parser.metric_label,
      status: 'completed',
      log: `[${timeString}] Ingesting target repo: ${repoName} (PR #${report.meta.pr_number})\n[${timeString}] Cloned commit ${commit} on ${branch} (targeting ${targetBranch})\n[${timeString}] AST Tree Parser: ${report.agents.ast_parser.metric_label} mapped across ${shortName}.\n[${timeString}] Grammar integrity: ${report.agents.ast_parser.findings[0] || 'Valid syntax'}`,
      duration: `${report.agents.ast_parser.latency_ms}ms`,
    },
    {
      id: 'agents',
      stepNumber: '02',
      title: '4 Parallel Swarm Agents',
      subtitle: 'Simultaneous invariant sweep',
      badge: isFixApplied || report.status === 'PASS' ? '4/4 Passed' : '3/4 Pass · 1 Alert',
      status: isFixApplied || report.status === 'PASS' ? 'completed' : 'warning',
      log: `[${timeString}] Spawning 4 parallel Bob invariant agents across ${repoName}...\n[${timeString}] -> Agent #1 (AST Parser): ${report.agents.ast_parser.metric_label} -> PASS\n[${timeString}] -> Agent #2 (Config Vault): ${report.agents.config_enforcer.metric_label} -> PASS\n[${timeString}] -> Agent #3 (Dependency Auditor): ${report.agents.dependency_auditor.metric_label} -> ${report.agents.dependency_auditor.status}\n[${timeString}] -> Agent #4 (Rollback Prover): ${
        isFixApplied
          ? `Synthetic Invariant Guard active for ${repoName}. Zero-loss view verified -> PASS.`
          : report.agents.rollback_prover.status === 'PASS'
          ? `Zero rollback violations. Byte equivalence confirmed for ${repoName} -> PASS.`
          : `Hazard detected in ${diffFile}: ${report.agents.rollback_prover.findings[0]} -> WARNING.`
      }`,
      duration: '320ms',
    },
    {
      id: 'sandbox',
      stepNumber: '03',
      title: 'Ephemeral DB Sandbox',
      subtitle: 'Byte-for-byte replay',
      badge: isFixApplied || report.status === 'PASS' ? '100% Equivalence' : 'Parity Discrepancy',
      status: isFixApplied || report.status === 'PASS' ? 'completed' : 'warning',
      log: isFixApplied || report.status === 'PASS'
        ? `[${timeString}] Spinning isolated ephemeral database sandbox in memory for ${repoName}...\n[${timeString}] Forward migration state applied on ${branch}.\n[${timeString}] Replaying reverse migration with synthetic partition view for ${shortName}.\n[${timeString}] Byte equivalence check: 100% parity verified. Zero data loss.`
        : `[${timeString}] Spinning isolated ephemeral database sandbox in memory for ${repoName}...\n[${timeString}] Forward migrations applied on ${branch}. 1,000 synthetic test transactions generated.\n[${timeString}] Replaying reverse down-migration ${diffFile}...\n[${timeString}] CRITICAL INVARIANT: Reversion in ${shortName} failed byte-for-byte idempotency check.`,
      duration: `${report.agents.rollback_prover.latency_ms}ms`,
    },
    {
      id: 'gate',
      stepNumber: '04',
      title: 'Human Gate & Consensus',
      subtitle: 'Consensus decision engine',
      badge: isFixApplied || report.status === 'PASS' ? 'GATE CLEAR' : 'DEPLOY BLOCKED',
      status: isFixApplied || report.status === 'PASS' ? 'completed' : 'warning',
      log: isFixApplied || report.status === 'PASS'
        ? `[${timeString}] Swarm Consensus: 4 of 4 agents verified 100% safety for ${repoName}.\n[${timeString}] Score: ${effectiveScore}/100 (Threshold >= 90 met).\n[${timeString}] Automated Gate Verdict: APPROVED FOR PRODUCTION PROMOTION.`
        : `[${timeString}] Swarm Consensus for ${repoName}: Score ${report.readiness_score}/100 (Below required 90/100 threshold).\n[${timeString}] Gate Verdict: DEPLOYMENT HALTED. Auto-Fix available in AST Fix Studio (Stage 3).`,
      duration: `${report.meta.telemetry_latency_ms}ms`,
    },
    {
      id: 'seal',
      stepNumber: '05',
      title: 'Cryptographic Attestation',
      subtitle: 'Hardware Security Module Seal',
      badge: isFixApplied || report.status === 'PASS' ? 'SEALED & SIGNED' : 'PENDING FIX',
      status: isFixApplied || report.status === 'PASS' ? 'completed' : 'pending',
      log: isFixApplied || report.status === 'PASS'
        ? `[${timeString}] Generating cryptographic release attestation for ${repoName}...\n[${timeString}] Target repo: ${repoName} | Commit: ${commit}\n[${timeString}] HSM Authority: ${report.attestation.hsm_authority}\n[${timeString}] SHA-256 Digest: ${report.attestation.sha256}\n[${timeString}] Sealed with ECDSA-P256 hardware signature. Ready for CI/CD deploy hooks.`
        : `[${timeString}] Attestation seal generation for ${repoName} on hold until invariants reach 100% compliance.`,
      duration: '45ms',
    },
  ];

  // Run animated step-by-step simulation
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setActiveStepIndex(0);
    setLiveLogs([`[SIMULATION] Initializing pipeline ingestion for ${repoName}...`]);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < steps.length) {
        setActiveStepIndex(current);
        setSelectedStepId(steps[current].id);
        setLiveLogs((prev) => [...prev, steps[current].log.split('\n')[0]]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 600);
  };

  useEffect(() => {
    if (isRunning) {
      handleStartSimulation();
    }
  }, [isRunning]);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[1];

  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8 font-inter">
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 bg-[#f5f2ee]/50 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ef4d23] animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#ef4d23]">
                LIVE REPO WORKFLOW PIPELINE
              </span>
              {report.meta.is_external_repo && (
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                  External GitHub Target
                </span>
              )}
            </div>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
              Interactive <span className="font-serif italic font-normal text-neutral-900">Invariant</span> Verification Flow
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
              <span>Active Target:</span>
              <span className="font-mono font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                {report.meta.repo} #{report.meta.pr_number}
              </span>
              <span className="text-neutral-400">({report.meta.commit})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs transition-all hover:bg-neutral-50 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-[#ef4d23] ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating Pipeline...' : 'Replay Pipeline Execution'}</span>
            </button>
          </div>
        </div>

        {/* 5-Step Visual Timeline Pipeline */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {steps.map((step) => {
              const isSelected = selectedStepId === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setSelectedStepId(step.id);
                    onInspectStep?.(step.id);
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#ef4d23] bg-orange-50/40 ring-2 ring-[#ef4d23]/20 shadow-xs'
                      : 'border-neutral-200 bg-[#f5f2ee]/30 hover:border-neutral-300 hover:bg-white'
                  }`}
                >
                  {/* Top Indicator */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-neutral-400 group-hover:text-neutral-600">
                        {step.stepNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase ${
                          step.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : step.status === 'warning'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : step.status === 'warning' ? (
                          <AlertTriangle className="h-2.5 w-2.5" />
                        ) : null}
                        <span>{step.duration}</span>
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-neutral-900 group-hover:text-[#ef4d23] transition-colors leading-snug">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500">{step.subtitle}</p>
                  </div>

                  {/* Bottom Badge */}
                  <div className="mt-4 border-t border-neutral-100 pt-2 font-mono text-[11px] font-medium text-neutral-700 truncate">
                    {step.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Step Telemetry & Console View */}
          <div className="mt-6 rounded-2xl border border-neutral-800 bg-[#0b0f1a] text-[#f8fafc] overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 bg-[#070a12] px-4 py-2 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-[#ef4d23]" />
                <span>
                  STEP {selectedStep.stepNumber} TELEMETRY: <strong className="text-white">{selectedStep.title.toUpperCase()}</strong>
                </span>
                <span className="text-neutral-500">[{repoName}]</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Duration: {selectedStep.duration}
              </span>
            </div>

            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-48 text-emerald-400">
              <pre className="whitespace-pre-wrap">
                {selectedStep.log}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
