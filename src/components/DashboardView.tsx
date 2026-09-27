import React, { useState } from 'react';
import { ReleaseReport, AgentResult } from '../types/report';
import { WorkflowPipeline } from './WorkflowPipeline';
import { HolographicGate } from './HolographicGate';
import { StageRunner } from './StageRunner';
import { BlurredButterfly } from './BlurredButterfly';
import {
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Wand2,
  Compass,
  FileCode2,
  Key,
  Layers,
  GitBranch,
  HelpCircle,
  ChevronDown,
  GitPullRequest,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Star,
  Code,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  report: ReleaseReport;
  onBackToPortal: () => void;
  isFixApplied: boolean;
  onToggleFix: () => void;
  onRunSweep: () => void;
  isVerifying: boolean;
  onOpenRawJson: () => void;
  onOpenAgentModal: (agent: AgentResult) => void;
  onChangeRepo?: (repoInput: string) => void;
  onOpenPrGuide?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  report,
  onBackToPortal,
  isFixApplied,
  onToggleFix,
  onRunSweep,
  isVerifying,
  onOpenRawJson,
  onOpenAgentModal,
  onChangeRepo,
  onOpenPrGuide,
}) => {
  // 3 Primary, clean, non-duplicated tabs:
  // 1: Workflow Pipeline & Real-Time Logs
  // 2: 3D Holographic Gate Radar
  // 3: Release Verification Sandbox (Stages 1-4)
  const [activeTab, setActiveTab] = useState<'workflow' | 'gate3d' | 'stages'>('workflow');
  const [stageRunnerTab, setStageRunnerTab] = useState<number>(2);
  const [isEditingRepo, setIsEditingRepo] = useState<boolean>(false);
  const [newRepoInput, setNewRepoInput] = useState<string>(`${report.meta.repo} #${report.meta.pr_number}`);
  const [isQuickPrMenuOpen, setIsQuickPrMenuOpen] = useState<boolean>(false);
  const [customPrOnCurrentRepo, setCustomPrOnCurrentRepo] = useState<string>('');

  // Synchronized stage jump helper: switches to 'stages' view and sets the active sub-stage
  const handleJumpToStage = (newStage: number) => {
    const stage = Math.max(1, Math.min(4, newStage));
    setStageRunnerTab(stage);
    setActiveTab('stages');
  };

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoInput.trim()) return;
    setIsEditingRepo(false);
    onChangeRepo?.(newRepoInput.trim());
  };

  const handleQuickSwitch = (inputStr: string) => {
    setIsQuickPrMenuOpen(false);
    setIsEditingRepo(false);
    setNewRepoInput(inputStr);
    onChangeRepo?.(inputStr);
  };

  const handleSwitchPrOnSameRepo = (prNum: string | number) => {
    const query = `${report.meta.repo} #pr-${prNum}`;
    setIsQuickPrMenuOpen(false);
    setNewRepoInput(query);
    onChangeRepo?.(query);
  };

  const effectiveScore = isFixApplied ? 98 : report.readiness_score;
  const isBlocked = !isFixApplied && report.status === 'BLOCKED';
  const isExternal = report.meta.is_external_repo;

  return (
    <div className="min-h-screen pb-20 relative font-inter bg-[#ededed] text-[#131b2e] overflow-hidden">
      {/* Blurred Butterflies focused on the user's view area */}
      <BlurredButterfly
        className="top-14 right-6 sm:right-28 z-0"
        size={340}
        blur={28}
        opacity={0.26}
        variant="orange"
      />
      <BlurredButterfly
        className="top-[380px] -left-14 z-0"
        size={290}
        blur={26}
        opacity={0.22}
        variant="amber"
        animateSlow
      />
      <BlurredButterfly
        className="bottom-20 right-8 z-0"
        size={260}
        blur={24}
        opacity={0.20}
        variant="orange"
      />

      {/* ======================================================== */}
      {/* UNIFIED STICKY CONTROL HEADER */}
      {/* ======================================================== */}
      <div className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 shadow-xs sticky top-16 z-30">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Back button & Repo Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-neutral-500" />
              <span>Back to Portal</span>
            </button>

            {/* Repo Switcher Dropdown */}
            <div className="relative">
              {!isEditingRepo ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsQuickPrMenuOpen(!isQuickPrMenuOpen)}
                    title="Click to switch repo or pull request"
                    className="group flex items-center gap-1.5 hover:bg-neutral-100 rounded-full px-3 py-1 transition-colors cursor-pointer border border-neutral-200/80 bg-white shadow-2xs"
                  >
                    <GitPullRequest className="h-3.5 w-3.5 text-[#ef4d23]" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-900 truncate max-w-[180px] sm:max-w-xs group-hover:text-[#ef4d23]">
                      {report.meta.repo}
                    </span>
                    <span className="rounded-full bg-[#f5f2ee] px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-700 border border-neutral-200/60">
                      #{report.meta.pr_number}
                    </span>
                    <ChevronDown className="h-3 w-3 text-neutral-400 group-hover:text-neutral-700" />
                  </button>

                  <button
                    onClick={() => setIsEditingRepo(true)}
                    className="text-[11px] font-mono text-[#ef4d23] hover:underline px-1 cursor-pointer font-semibold"
                    title="Type any custom repo or PR"
                  >
                    Switch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveRepo} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newRepoInput}
                    onChange={(e) => setNewRepoInput(e.target.value)}
                    placeholder="e.g. facebook/react #28100"
                    className="rounded-full border border-[#ef4d23] bg-white px-3 py-1 font-mono text-xs text-neutral-900 focus:outline-none ring-2 ring-[#ef4d23]/20"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#ef4d23] px-3 py-1 font-mono text-xs font-semibold text-white hover:bg-[#d83f17] cursor-pointer"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingRepo(false)}
                    className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              )}

              {/* Quick Switch Dropdown Menu */}
              {isQuickPrMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-88 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 font-inter">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2 px-1 text-xs">
                    <span className="font-mono font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                      Repository & PR Selector
                    </span>
                    <button
                      onClick={() => setIsQuickPrMenuOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600 font-mono text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-2 space-y-3 text-xs">
                    {/* SECTION 1: Test any PR on current repository */}
                    <div className="bg-[#f5f2ee]/70 p-2.5 rounded-xl border border-neutral-200/60">
                      <div className="text-[11px] font-semibold text-neutral-700">
                        Test another PR on {report.meta.repo.split('/')[1] || report.meta.repo}:
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="font-mono text-neutral-400 text-xs">#</span>
                        <input
                          type="number"
                          placeholder="e.g. 143 or 99"
                          value={customPrOnCurrentRepo}
                          onChange={(e) => setCustomPrOnCurrentRepo(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customPrOnCurrentRepo) {
                              handleSwitchPrOnSameRepo(customPrOnCurrentRepo);
                            }
                          }}
                          className="w-full rounded bg-white border border-neutral-300 px-2 py-1 font-mono text-xs text-neutral-900 focus:outline-none focus:border-[#ef4d23]"
                        />
                        <button
                          onClick={() => {
                            if (customPrOnCurrentRepo) {
                              handleSwitchPrOnSameRepo(customPrOnCurrentRepo);
                            }
                          }}
                          className="rounded bg-[#0b0f1a] hover:bg-neutral-800 text-white px-2.5 py-1 font-mono text-xs font-semibold cursor-pointer"
                        >
                          Run #{customPrOnCurrentRepo || '?'}
                        </button>
                      </div>
                    </div>

                    {/* SECTION 2: Preset Hackathon Demo PRs */}
                    <div>
                      <div className="px-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        Preset Demo PRs (faelyono/IBM-Bob-2.0-Hackathon)
                      </div>

                      <div className="mt-1 space-y-1">
                        <button
                          onClick={() => handleQuickSwitch('faelyono/IBM-Bob-2.0-Hackathon #pr-142')}
                          className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left cursor-pointer border border-transparent hover:border-neutral-200"
                        >
                          <div>
                            <div className="font-mono font-semibold text-neutral-900">PR #142 (Settlement Engine)</div>
                            <div className="text-[11px] text-neutral-500">Schema Rollback Hazard (Score: 78/100)</div>
                          </div>
                          <span className="rounded-full bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                            BLOCKED
                          </span>
                        </button>

                        <button
                          onClick={() => handleQuickSwitch('faelyono/IBM-Bob-2.0-Hackathon #pr-138')}
                          className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left cursor-pointer border border-transparent hover:border-neutral-200"
                        >
                          <div>
                            <div className="font-mono font-semibold text-neutral-900">PR #138 (Auth Vault Keys)</div>
                            <div className="text-[11px] text-neutral-500">KMS Key Rotation (Score: 99/100)</div>
                          </div>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                            PASS
                          </span>
                        </button>

                        <button
                          onClick={() => handleQuickSwitch('faelyono/IBM-Bob-2.0-Hackathon #pr-145')}
                          className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left cursor-pointer border border-transparent hover:border-neutral-200"
                        >
                          <div>
                            <div className="font-mono font-semibold text-neutral-900">PR #145 (Kafka Concurrency)</div>
                            <div className="text-[11px] text-neutral-500">Transitive Dependency Drift (Score: 84/100)</div>
                          </div>
                          <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 font-mono text-[9px] font-bold">
                            WARNING
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 3: Popular External Repositories */}
                    <div className="pt-2 border-t border-neutral-100">
                      <div className="px-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        Switch to Other Public Repositories
                      </div>

                      <div className="mt-1 space-y-1">
                        <button
                          onClick={() => handleQuickSwitch('shadcn-ui/ui #pr-182')}
                          className="flex w-full items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 text-left font-mono text-[11px] text-neutral-700 cursor-pointer"
                        >
                          <span>shadcn-ui/ui #182</span>
                          <span className="text-[10px] text-neutral-400">UI Design</span>
                        </button>

                        <button
                          onClick={() => handleQuickSwitch('vercel/next.js #pr-58201')}
                          className="flex w-full items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 text-left font-mono text-[11px] text-neutral-700 cursor-pointer"
                        >
                          <span>vercel/next.js #58201</span>
                          <span className="text-[10px] text-neutral-400">SSR Cache</span>
                        </button>

                        <button
                          onClick={() => handleQuickSwitch('facebook/react #pr-28100')}
                          className="flex w-full items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 text-left font-mono text-[11px] text-neutral-700 cursor-pointer"
                        >
                          <span>facebook/react #28100</span>
                          <span className="text-[10px] text-neutral-400">Fiber AST</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsQuickPrMenuOpen(false);
                        onOpenPrGuide?.();
                      }}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ef4d23] hover:underline cursor-pointer font-semibold"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>PR & Invariant Guide</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickPrMenuOpen(false);
                        setIsEditingRepo(true);
                      }}
                      className="font-mono text-[11px] text-neutral-600 hover:text-neutral-900 cursor-pointer underline"
                    >
                      Type custom repo...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Verdict Tag */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                isBlocked
                  ? 'border-[#ef4d23]/30 bg-[#ef4d23]/10 text-[#ef4d23]'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBlocked ? 'bg-[#ef4d23] animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span>{isBlocked ? 'DEPLOYMENT HALTED' : 'VERIFIED READY'}</span>
            </span>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            {onOpenPrGuide && (
              <button
                onClick={onOpenPrGuide}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-[#ef4d23]" />
                <span className="hidden sm:inline">PR Guide</span>
              </button>
            )}

            {isBlocked && (
              <button
                onClick={onToggleFix}
                className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Wand2 className="h-3.5 w-3.5 text-[#ef4d23]" />
                <span>Auto-Fix Guard</span>
              </button>
            )}

            {isFixApplied && (
              <button
                onClick={onToggleFix}
                className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span>Revert to Raw State</span>
              </button>
            )}

            <button
              onClick={onRunSweep}
              disabled={isVerifying}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 font-mono text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#ef4d23] ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Sweeping...' : 'Re-run Sweep'}</span>
            </button>
          </div>
        </div>

        {/* Compact Metadata Sub-strip (Integrated, non-bloated) */}
        <div className="mx-auto max-w-7xl pt-2 mt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-700">
              <GitBranch className="h-3 w-3 text-neutral-400" />
              <span>{report.meta.branch}</span>
              <span className="text-neutral-400">➔</span>
              <span>{report.meta.target_branch}</span>
            </span>

            <span>
              Commit: <code className="text-neutral-800 font-semibold">{report.meta.commit}</code>
            </span>

            {report.meta.repo_language && (
              <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded border border-neutral-200/50">
                {report.meta.repo_language}
              </span>
            )}

            {report.meta.repo_stars && (
              <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span>{report.meta.repo_stars.toLocaleString()}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 hidden sm:inline">Invariant Target:</span>
            <span className="text-neutral-800 font-semibold truncate max-w-[220px]">
              {isExternal ? report.meta.repo : 'IBM Bob Benchmark'}
            </span>
            {report.meta.repo_url && (
              <a
                href={report.meta.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ef4d23] hover:underline flex items-center gap-0.5 ml-1"
              >
                <span>GitHub</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3 CLEAN MAIN VIEW TABS (NO DOUBLED MENUS) */}
      {/* ======================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-200 text-xs font-mono">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-[#0b0f1a] text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Layers className={`h-3.5 w-3.5 ${activeTab === 'workflow' ? 'text-[#ef4d23]' : ''}`} />
            <span>01. Workflow Pipeline & Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('gate3d')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gate3d'
                ? 'bg-[#0b0f1a] text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Compass className={`h-3.5 w-3.5 ${activeTab === 'gate3d' ? 'text-[#ef4d23]' : ''}`} />
            <span>02. 3D Gate Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-[#0b0f1a] text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${activeTab === 'stages' ? 'text-[#ef4d23]' : ''}`} />
            <span>03. Verification Sandbox (Stage {stageRunnerTab}/4 · {effectiveScore}/100)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT (CLEAN, SINGLE PRESENTATION PER TAB) */}
      {/* ======================================================== */}
      <div className="relative z-10 mt-4">
        {/* TAB 1: WORKFLOW PIPELINE & TERMINAL LOGS (NO DUPLICATED 3D RADAR BELOW) */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <WorkflowPipeline
              report={report}
              isRunning={isVerifying}
              onRunPipeline={onRunSweep}
              isFixApplied={isFixApplied}
              onInspectStep={(stepId) => {
                if (stepId === 'ingest' || stepId === 'agents') {
                  handleJumpToStage(1);
                } else if (stepId === 'sandbox') {
                  handleJumpToStage(3);
                } else if (stepId === 'gate') {
                  handleJumpToStage(2);
                } else if (stepId === 'seal') {
                  handleJumpToStage(4);
                }
              }}
            />

            {/* Quick Action Navigation Strip (Replaces the duplicate 3D gate) */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ef4d23]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Explore Full Invariant Suite
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                    View the spatial orbital matrix in 3D or inspect byte-for-byte rollback diffs and cryptographic attestation proofs in the verification sandbox.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('gate3d')}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-4 py-2 font-mono text-xs font-semibold text-neutral-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#ef4d23]" />
                    <span>Launch 3D Gate Radar →</span>
                  </button>

                  <button
                    onClick={() => handleJumpToStage(3)}
                    className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-4 py-2 font-mono text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileCode2 className="h-3.5 w-3.5 text-[#ef4d23]" />
                    <span>Open Rollback Diff Studio →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL 3D HOLOGRAPHIC GATE & SATELLITES */}
        {activeTab === 'gate3d' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-[#f5f2ee] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-semibold text-[#ef4d23] uppercase tracking-wider">
                  FLIGHT-DECK 3D VISUALIZATION
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1">
                  Interactive Invariant Gate Matrix for {report.meta.repo}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Rotate pitch and yaw with mouse drag, scroll to zoom in/out, or click any satellite node to inspect its verification agent.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-neutral-600">Gate State:</span>
                <span
                  className={`font-bold px-3 py-1 rounded-full border ${
                    isBlocked
                      ? 'bg-[#ef4d23]/10 text-[#ef4d23] border-[#ef4d23]/30'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isBlocked ? '1 HAZARD ACTIVE' : 'ALL INVARIANTS PASS'}
                </span>
              </div>
            </div>

            <HolographicGate
              report={report}
              isFixApplied={isFixApplied}
              onSelectCheckpoint={(id) => {
                if (id === 'rollback') {
                  handleJumpToStage(3);
                } else if (id === 'seal') {
                  handleJumpToStage(4);
                } else {
                  handleJumpToStage(1);
                }
              }}
            />
          </div>
        )}

        {/* TAB 3: UNIFIED INVARIANT STAGE RUNNER (STAGES 1 - 4) */}
        {activeTab === 'stages' && (
          <div className="space-y-6">
            <StageRunner
              report={report}
              activeStage={stageRunnerTab}
              onStageChange={(newStage) => setStageRunnerTab(newStage)}
              isFixApplied={isFixApplied}
              onToggleFix={onToggleFix}
              onOpenAgentModal={onOpenAgentModal}
              onOpenPrGuide={onOpenPrGuide}
            />
          </div>
        )}
      </div>
    </div>
  );
};
