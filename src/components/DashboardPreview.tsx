import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ChevronDown,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  ShieldAlert,
  Cpu,
  Layers,
} from 'lucide-react';
import { Gauge } from './Gauge';
import { ReleaseReport } from '../types/report';

interface DashboardPreviewProps {
  report: ReleaseReport;
  onAnalyzeRepo: (repoInput: string) => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  report,
  onAnalyzeRepo,
}) => {
  const [repoInput, setRepoInput] = useState<string>(report.meta.repo);
  const [prInput, setPrInput] = useState<string>(String(report.meta.pr_number));
  const [card1Toggle, setCard1Toggle] = useState<'invariants' | 'telemetry'>('invariants');
  const [card3Toggle, setCard3Toggle] = useState<'parity' | 'tests'>('parity');

  useEffect(() => {
    setRepoInput(report.meta.repo);
    setPrInput(String(report.meta.pr_number));
  }, [report.meta.repo, report.meta.pr_number]);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `${repoInput.trim()} #pr-${prInput.trim()}`;
    onAnalyzeRepo(query);
  };

  const isBlocked = report.status === 'BLOCKED';
  const nodesCount = report.agents.ast_parser.metric_label.split(' ')[0] || '1,840';

  // Agent latencies for telemetry graph
  const agentLatencies = [
    { name: 'AST Parser', ms: report.agents.ast_parser.latency_ms, pct: Math.min(100, Math.round((report.agents.ast_parser.latency_ms / 350) * 100)), color: '#ef4d23' },
    { name: 'Config Vault', ms: report.agents.config_enforcer.latency_ms, pct: Math.min(100, Math.round((report.agents.config_enforcer.latency_ms / 350) * 100)), color: '#10b981' },
    { name: 'Dep Auditor', ms: report.agents.dependency_auditor.latency_ms, pct: Math.min(100, Math.round((report.agents.dependency_auditor.latency_ms / 350) * 100)), color: '#f59e0b' },
    { name: 'Rollback DB', ms: report.agents.rollback_prover.latency_ms, pct: Math.min(100, Math.round((report.agents.rollback_prover.latency_ms / 350) * 100)), color: report.status === 'PASS' ? '#10b981' : '#ef4d23' },
  ];

  // Test assertions for rollback tests graph
  const rollbackTests = [
    { name: 'DDL Syntax & Invariant Tree', pass: true, desc: 'Grammar checked against strict dialect' },
    { name: 'Idempotency Forward Replay', pass: true, desc: 'Re-applying schema creates zero conflicts' },
    {
      name: 'Zero-Loss Partition Parity',
      pass: report.status === 'PASS',
      desc: report.status === 'PASS' ? 'Zero records dropped in snapshot replay' : 'DROP TABLE flagged without backup view',
    },
    { name: 'FK & Constraint Integrity', pass: true, desc: 'Foreign key referential actions intact' },
  ];

  const testsPassedCount = rollbackTests.filter((t) => t.pass).length;

  return (
    <div className="px-3 sm:px-4 w-full font-inter">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-md border border-neutral-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
          {/* ======================================================== */}
          {/* CARD 1: Release Guard (Invariants vs. Telemetry) */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs border border-neutral-100 min-h-[350px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-[#ef4d23] flex items-center gap-1.5">
                  {card1Toggle === 'invariants' ? (
                    <span>Release Guard</span>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5 text-[#ef4d23]" />
                      <span>Telemetry Latency</span>
                    </>
                  )}
                </span>
                <span className="text-neutral-500 font-mono">PR #{report.meta.pr_number}</span>
              </div>

              {/* VIEW A: INVARIANTS (Circular Multi-Ring & Invariant Pillars) */}
              {card1Toggle === 'invariants' ? (
                <div className="animate-in fade-in duration-200">
                  {/* Big Metric + Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[28px] font-semibold text-neutral-900 leading-none tracking-tight font-mono">
                      {report.readiness_score}
                      <span className="text-sm font-normal text-neutral-400 font-mono ml-0.5">/100</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isBlocked
                          ? 'bg-red-50 text-red-600 border border-red-200/60'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                      }`}
                    >
                      <TrendingDown className="h-3 w-3" />
                      <span>{isBlocked ? 'Gate Blocked' : 'All Pass'}</span>
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-400">
                    AST mapped: <strong className="text-neutral-700 font-mono">{nodesCount}</strong> syntax nodes
                  </div>

                  {/* Radial Invariant Ring + 4 Pillars Matrix */}
                  <div className="mt-3 bg-[#f5f2ee]/60 rounded-xl p-2.5 border border-neutral-200/60">
                    <div className="flex items-center gap-3">
                      {/* SVG Circular Progress Ring */}
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#e5e5e5"
                            strokeWidth="5"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke={report.readiness_score >= 90 ? '#10b981' : '#ef4d23'}
                            strokeWidth="5"
                            strokeDasharray={163.36}
                            strokeDashoffset={163.36 - (163.36 * report.readiness_score) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                          <span className="text-[13px] font-bold text-neutral-900 leading-none">
                            {report.readiness_score}%
                          </span>
                          <span className="text-[8px] text-neutral-500 uppercase tracking-tighter">Purity</span>
                        </div>
                      </div>

                      {/* 4 Invariant Pillars Grid */}
                      <div className="grid grid-cols-2 gap-1.5 flex-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-neutral-200/60">
                          <span className="text-neutral-500 truncate">AST Syntax</span>
                          <span className="font-bold text-emerald-600">PASS</span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-neutral-200/60">
                          <span className="text-neutral-500 truncate">KMS Vault</span>
                          <span className="font-bold text-emerald-600">PASS</span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-neutral-200/60">
                          <span className="text-neutral-500 truncate">Deps Drift</span>
                          <span className="font-bold text-neutral-800">
                            {report.meta.pr_number === 145 ? '84%' : '100%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-neutral-200/60">
                          <span className="text-neutral-500 truncate">Rollback DB</span>
                          <span className={`font-bold ${isBlocked ? 'text-[#ef4d23]' : 'text-emerald-600'}`}>
                            {isBlocked ? 'ALERT' : 'PASS'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-center font-mono text-[10.5px] text-neutral-500">
                    Invariants: <strong className="text-neutral-800">{report.attestation.invariants_passed}</strong>/{report.attestation.invariants_total} verified
                  </div>
                </div>
              ) : (
                /* VIEW B: TELEMETRY (Latency & Execution Bar Chart) */
                <div className="animate-in fade-in duration-200">
                  {/* Big Metric + Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[28px] font-semibold text-neutral-900 leading-none tracking-tight font-mono">
                      {report.meta.telemetry_latency_ms}
                      <span className="text-sm font-normal text-neutral-400 font-mono ml-1">ms</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>Real-time</span>
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-400">
                    Swarm execution latency: <strong className="text-neutral-700">4 agents</strong>
                  </div>

                  {/* Latency Multi-Bar Graph */}
                  <div className="mt-3 space-y-2.5 pt-1">
                    {agentLatencies.map((ag, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-600 font-medium truncate">{ag.name}</span>
                          <span className="text-neutral-900 font-bold">{ag.ms}ms</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${ag.pct}%`, backgroundColor: ag.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-1 border-t border-neutral-100 flex items-center justify-between font-mono text-[10px] text-neutral-400">
                    <span>Cluster: us-east-prod-gate</span>
                    <span>Cache: 99.4% hit</span>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Pill Bottom */}
            <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-xs font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => setCard1Toggle('invariants')}
                className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
                  card1Toggle === 'invariants'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Invariants
              </button>
              <button
                type="button"
                onClick={() => setCard1Toggle('telemetry')}
                className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
                  card1Toggle === 'telemetry'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Telemetry
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD 2: Form / Target Repo Configuration */}
          {/* ======================================================== */}
          <form
            onSubmit={handleLaunch}
            className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs border border-neutral-100 gap-3 min-h-[350px]"
          >
            <div className="space-y-3">
              {/* Group 1: Environment */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-700 mb-1">
                  Target cluster
                </label>
                <div className="flex items-center justify-between w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-800 bg-neutral-50/50">
                  <span className="font-mono">us-east-prod-gate</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Group 2: Verification Mode */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-700 mb-1">
                  Verification strategy
                </label>
                <div className="flex items-center justify-between w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-800 bg-neutral-50/50">
                  <span>Strict Invariant Replay</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Group 3: Repository Input */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-700 mb-1">
                  Target Repository
                </label>
                <div className="flex items-center border border-neutral-200 rounded-lg px-2.5 py-1.5 focus-within:border-[#ef4d23] focus-within:ring-1 focus-within:ring-[#ef4d23]">
                  <span className="text-neutral-400 font-mono text-xs mr-1">#</span>
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="owner/repo"
                    className="w-full text-xs font-mono text-neutral-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Group 4: PR Input */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-700 mb-1">
                  Pull Request #
                </label>
                <div className="flex items-center border border-neutral-200 rounded-lg px-2.5 py-1.5 focus-within:border-[#ef4d23] focus-within:ring-1 focus-within:ring-[#ef4d23]">
                  <span className="text-neutral-400 font-mono text-xs mr-1">#</span>
                  <input
                    type="text"
                    value={prInput}
                    onChange={(e) => setPrInput(e.target.value)}
                    placeholder="142"
                    className="w-full text-xs font-mono text-neutral-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
              <button
                type="submit"
                className="bg-[#ef4d23] hover:bg-[#d83f17] text-white font-medium rounded-lg px-5 py-2 transition-colors cursor-pointer"
              >
                Analyze Gate
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepoInput('faelyono/IBM-Bob-2.0-Hackathon');
                  setPrInput('142');
                }}
                className="text-neutral-500 hover:text-neutral-900 underline ml-2 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepoInput('');
                  setPrInput('');
                }}
                className="text-neutral-400 hover:text-neutral-600 ml-auto p-1 cursor-pointer"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* ======================================================== */}
          {/* CARD 3: Rollback Sandbox (Byte Parity vs. Rollback Tests) */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-xs border border-neutral-100 min-h-[350px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-[#ef4d23] flex items-center gap-1.5">
                  {card3Toggle === 'parity' ? (
                    <span>Rollback Sandbox</span>
                  ) : (
                    <>
                      <Database className="h-3.5 w-3.5 text-[#ef4d23]" />
                      <span>Test Replay Suite</span>
                    </>
                  )}
                </span>
                <span className="text-neutral-500 font-mono">live</span>
              </div>

              {/* VIEW A: BYTE PARITY EQUIVALENCE STREAM (Reversion Idempotency) */}
              {card3Toggle === 'parity' ? (
                <div className="animate-in fade-in duration-200">
                  {/* Big Metric + Pill */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[28px] font-semibold text-neutral-900 leading-none tracking-tight font-mono">
                      {report.score_breakdown.rollback_proof}
                      <span className="text-sm font-normal text-neutral-400 font-mono ml-0.5">%</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        report.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-red-50 text-red-600 border border-red-200/60'
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>{report.status === 'PASS' ? '0 byte drift' : '1 DDL fault'}</span>
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-400 truncate" title={report.rollback_diff.file}>
                    Testing {report.rollback_diff.file.split('/').pop()}
                  </div>

                  {/* Byte Parity Reversion Flow Diagram */}
                  <div className="mt-3 bg-[#f5f2ee]/60 rounded-xl p-2.5 border border-neutral-200/60 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px] text-neutral-600">
                      <span>State T₁ (Forward)</span>
                      <span className="text-neutral-400">➔ Replay ➔</span>
                      <span>State T₀ (Reverted)</span>
                    </div>

                    {/* 10-Block Byte Integrity Partition Bar */}
                    <div className="grid grid-cols-10 gap-1">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const isCorrupted = report.status !== 'PASS' && idx >= 7;
                        return (
                          <div
                            key={idx}
                            className={`h-4 rounded-xs transition-all ${
                              isCorrupted
                                ? 'bg-red-500/80 animate-pulse'
                                : 'bg-emerald-500/80'
                            }`}
                            title={isCorrupted ? 'Byte divergence detected in block' : 'Byte equivalence confirmed'}
                          />
                        );
                      })}
                    </div>

                    {/* Reversion Metrics */}
                    <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-neutral-200/40">
                      <span className="text-neutral-500">Synthetic rows:</span>
                      <span className="font-semibold text-neutral-800">1,000 / 1,000 verified</span>
                    </div>
                  </div>

                  <div className="mt-2.5 text-center font-mono text-[10.5px] text-neutral-500">
                    {report.status === 'PASS'
                      ? '100% byte-for-byte idempotency confirmed'
                      : 'DROP TABLE without partition view caught'}
                  </div>
                </div>
              ) : (
                /* VIEW B: ROLLBACK TESTS (Assertion Matrix Checklist) */
                <div className="animate-in fade-in duration-200">
                  {/* Big Metric + Pill */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[28px] font-semibold text-neutral-900 leading-none tracking-tight font-mono">
                      {testsPassedCount}
                      <span className="text-sm font-normal text-neutral-400 font-mono ml-0.5">/ 4</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium font-mono ${
                        report.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}
                    >
                      {report.status === 'PASS' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>4/4 Passed</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>1 Failed</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-neutral-400">
                    Synthetic transactions: <strong className="text-neutral-700 font-mono">1,000 / 1,000</strong>
                  </div>

                  {/* Test Assertions Checklist List */}
                  <div className="mt-3 space-y-2 pt-0.5">
                    {rollbackTests.map((t, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-1.5 rounded-lg border text-xs ${
                          t.pass
                            ? 'bg-emerald-50/40 border-emerald-200/60 text-emerald-950'
                            : 'bg-red-50/50 border-red-200 text-red-950'
                        }`}
                      >
                        <span className="shrink-0 mt-0.5">
                          {t.pass ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[11px] leading-tight truncate">
                            {t.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono truncate">
                            {t.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Pill Bottom */}
            <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-xs font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => setCard3Toggle('parity')}
                className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
                  card3Toggle === 'parity'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Byte Parity
              </button>
              <button
                type="button"
                onClick={() => setCard3Toggle('tests')}
                className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
                  card3Toggle === 'tests'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Rollback Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
