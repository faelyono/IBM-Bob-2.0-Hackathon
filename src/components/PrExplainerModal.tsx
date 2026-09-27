import React, { useState } from 'react';
import {
  X,
  GitPullRequest,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  GitBranch,
  Key,
  Box,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface PrExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repoInput: string) => void;
  currentRepo?: string;
}

export const PrExplainerModal: React.FC<PrExplainerModalProps> = ({
  isOpen,
  onClose,
  onSelectRepo,
  currentRepo,
}) => {
  const [activeTab, setActiveTab] = useState<'prs' | 'anyrepo' | 'presets'>('prs');
  const [customInput, setCustomInput] = useState<string>('');

  if (!isOpen) return null;

  const samplePrs = [
    {
      pr: 'pr-142',
      input: 'faelyono/IBM-Bob-2.0-Hackathon #pr-142',
      title: 'PR #142: Settlement Engine Batch Ingestion',
      category: 'Database Migration & Rollback Invariant',
      score: 78,
      status: 'BLOCKED',
      statusColor: 'text-[#ef4d23] bg-[#ef4d23]/10 border-[#ef4d23]/30',
      badge: 'Hazard Caught (78/100)',
      whatItDoes:
        'Adds high-throughput batch ingestion and reconciliation for ledger settlements. It includes a schema migration file (v4_2_revert.sql).',
      hazardFound:
        'The Rollback Replay Sandbox caught an irreversible "DROP TABLE settlement_ledger CASCADE" in the reversion script without backup snapshot parity. Reversing this in production would cause permanent data loss of active transactions.',
      howToResolve:
        'Go to Stage 3 (Rollback Proof Diff) and click "Auto-Fix Guard". The AST engine synthesizes a non-destructive cold partition view (ALTER TABLE ... RENAME), immediately raising the score to 98/100 and unblocking production deployment.',
      highlights: ['DROP TABLE hazard flagged', 'AST Auto-Fix available', '3/4 agents passed'],
    },
    {
      pr: 'pr-138',
      input: 'faelyono/IBM-Bob-2.0-Hackathon #pr-138',
      title: 'PR #138: Auth Token Vault Rotating Symmetric Key',
      category: 'Secret Hygiene & KMS Envelope Encryption',
      score: 99,
      status: 'SEALED',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: '100% Verified (99/100)',
      whatItDoes:
        'Upgrades token vault encryption with rotating symmetric key derivation, enforcing 30-day epoch rotation and constant-time memory comparisons.',
      hazardFound:
        'Zero hazards detected. All 28 secrets pass Vault HSM strict schema policies, all dependencies are pinned with verified cryptographic signatures, and reverse migrations restore 100% byte equivalence.',
      howToResolve:
        'Gate is immediately clear to promote. View Stage 4 (Cryptographic Seal) to copy or download the hardware-signed ECDSA-P256 release manifest.',
      highlights: ['Constant-time crypto', 'Zero plaintext secrets', 'HSM P-256 seal signed'],
    },
    {
      pr: 'pr-145',
      input: 'faelyono/IBM-Bob-2.0-Hackathon #pr-145',
      title: 'PR #145: Kafka Stream Consumer Concurrency Scaling',
      category: 'Transitive Dependency Lock Drift',
      score: 84,
      status: 'WARNING',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
      badge: 'Advisory Warning (84/100)',
      whatItDoes:
        'Refactors partition rebalance event listeners to scale consumer group concurrency and handle graceful SIGTERM offset commits.',
      hazardFound:
        'The Dependency Auditor flagged an unpinned transitive patch update in kafkajs (2.2.3 -> 2.2.4) that has a known consumer commit offset race condition in upstream registries.',
      howToResolve:
        'The gate issues an advisory warning. You can enforce a strict SHA-256 package-lock pin to eliminate transitive drift and elevate the score above the 90/100 promotion threshold.',
      highlights: ['Transitive drift alert', 'Consumer offsets tested', 'Advisory mode active'],
    },
  ];

  const presets = [
    {
      name: 'facebook/react',
      pr: '#pr-28100',
      tag: 'Compiler AST & Fiber',
      desc: 'Evaluates React fiber reconciliation passes and strict AST memory bounds.',
      fullInput: 'facebook/react #pr-28100',
    },
    {
      name: 'vercel/next.js',
      pr: '#pr-58201',
      tag: 'SSR Cache & Hydration',
      desc: 'Simulates cache revalidation rollback invariants and edge middleware secret checks.',
      fullInput: 'vercel/next.js #pr-58201',
    },
    {
      name: 'shadcn-ui/ui',
      pr: '#pr-182',
      tag: 'Design System & Radix',
      desc: 'Verifies Tailwind V4 token compilation, zero unhandled exceptions, and strict SemVer locks.',
      fullInput: 'shadcn-ui/ui #pr-182',
    },
    {
      name: 'tailwindlabs/tailwindcss',
      pr: '#pr-12040',
      tag: 'Lightning CSS Engine',
      desc: 'Tests CSS AST generation and transitive binary lockfile checksum integrity.',
      fullInput: 'tailwindlabs/tailwindcss #pr-12040',
    },
    {
      name: 'docker/compose',
      pr: '#pr-11200',
      tag: 'Container Volume DDL',
      desc: 'Audits volume snapshot reversibility and ephemeral compose cluster idempotency.',
      fullInput: 'docker/compose #pr-11200',
    },
  ];

  const handleRunPreset = (inputStr: string) => {
    onSelectRepo(inputStr);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSelectRepo(customInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-neutral-200 overflow-hidden font-inter text-[#131b2e]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 bg-[#f5f2ee]/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ef4d23] text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#ef4d23] uppercase tracking-wider">
                  REPOSITORY & PULL REQUEST GUIDE
                </span>
                <span className="rounded-full bg-neutral-200/80 px-2 py-0.5 font-mono text-[10px] text-neutral-600">
                  Protocol 2.4
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                How Invariant Verification Works on Any Repo
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-neutral-200 bg-[#f5f2ee]/30 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('prs')}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'prs'
                ? 'border-[#ef4d23] text-[#ef4d23] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>1. What Each Pull Request Does</span>
          </button>

          <button
            onClick={() => setActiveTab('anyrepo')}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'anyrepo'
                ? 'border-[#ef4d23] text-[#ef4d23] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>2. Analyzing Any Custom Repository</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#ef4d23] text-[#ef4d23] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>3. Quick Presets & Switcher</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: What Each PR Does */}
          {activeTab === 'prs' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-[#f5f2ee]/40 p-4 text-xs text-neutral-600">
                <strong className="text-neutral-900">Why are there different Pull Requests?</strong>
                <p className="mt-1 leading-relaxed">
                  Different pull requests test distinct real-world release failure modes:
                  <strong> irreversible schema rollbacks</strong>, <strong>secret hygiene violations</strong>, and <strong>transitive dependency drift</strong>.
                  Select any pull request below to test how the 4 swarm agents detect invariants and how the AST Studio fixes them.
                </p>
              </div>

              <div className="space-y-4">
                {samplePrs.map((item) => (
                  <div
                    key={item.pr}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-neutral-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold border ${item.statusColor}`}>
                            {item.badge}
                          </span>
                          <span className="font-mono text-xs text-neutral-400">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-bold text-neutral-900">
                          {item.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleRunPreset(item.input)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 text-white px-4 py-1.5 font-mono text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
                      >
                        <span>Test This PR</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#ef4d23]" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-neutral-700 block">What it modifies:</span>
                        <p className="mt-1 text-neutral-600 leading-relaxed">{item.whatItDoes}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-700 block">Invariant test verdict:</span>
                        <p className="mt-1 text-neutral-600 leading-relaxed">{item.hazardFound}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-700 block">How to resolve / result:</span>
                        <p className="mt-1 text-neutral-600 leading-relaxed">{item.howToResolve}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                      {item.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[10.5px] text-neutral-600"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: How Analyzing Any Repo Works */}
          {activeTab === 'anyrepo' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-neutral-200 bg-[#f5f2ee]/50 p-5">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Yes, you can analyze ANY GitHub repository!</span>
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  <strong className="text-neutral-900 font-semibold">BOBIFY</strong> is designed as a universal invariant verification gate. You can paste any GitHub URL (e.g.{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border text-neutral-800 font-mono text-xs">https://github.com/facebook/react/pull/28100</code>),
                  shorthand (<code className="bg-white px-1.5 py-0.5 rounded border text-neutral-800 font-mono text-xs">vercel/next.js #58201</code>), or
                  just a repo name (<code className="bg-white px-1.5 py-0.5 rounded border text-neutral-800 font-mono text-xs">shadcn-ui/ui</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#ef4d23] border border-orange-100">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">1. AST Syntax Graph Ingestion</h4>
                      <span className="text-[11px] text-neutral-400">Agent 1: ast_parser</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Deconstructs source pull request changes across JavaScript, TypeScript, Go, Python, and SQL into abstract syntax tree tokens. Checks for dangling database connections and memory leak patterns.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Key className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">2. Secrets & Vault Enforcer</h4>
                      <span className="text-[11px] text-neutral-400">Agent 2: config_enforcer</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Scans Kubernetes manifests, Helm charts, and environment templates against the HSM schema. Ensures zero high-entropy plaintext keys or expired TLS certificates enter production.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                      <Box className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">3. Dependency Drift Auditor</h4>
                      <span className="text-[11px] text-neutral-400">Agent 3: dependency_auditor</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Cross-references lockfile digests against IBM Vulnerability Advisory and NVD databases to ensure byte-for-byte reproducibility and catch unpinned patch race conditions.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">4. Ephemeral DB Rollback Replay</h4>
                      <span className="text-[11px] text-neutral-400">Agent 4: rollback_prover</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Simulates reverse down migrations in an isolated memory sandbox initialized with test rows to mathematically prove zero data loss and 100% byte equivalence upon rollback.
                  </p>
                </div>
              </div>

              {/* Try entering one right now */}
              <div className="rounded-2xl border border-neutral-200 bg-[#f5f2ee] p-4">
                <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter any repo e.g. vercel/next.js #58201 or myorg/billing #42"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white px-5 py-2 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Analyze Repository Gate
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Quick Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600">
                Click any real-world open-source repository below to launch an immediate invariant verification sweep:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleRunPreset(preset.fullInput)}
                    className="group rounded-2xl border border-neutral-200 bg-[#f5f2ee]/40 p-4 transition-all hover:bg-white hover:border-[#ef4d23] hover:shadow-xs cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-neutral-900 group-hover:text-[#ef4d23]">
                          {preset.name}
                        </span>
                        <span className="rounded-full bg-neutral-200/70 px-2 py-0.5 font-mono text-[10px] text-neutral-700">
                          {preset.pr}
                        </span>
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-[#ef4d23]">
                        {preset.tag}
                      </span>
                      <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-200/60 pt-2 font-mono text-[11px] text-neutral-500">
                      <span>Launch Invariant Gate</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#ef4d23] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-[#f5f2ee]/50 px-6 py-3 font-mono text-xs text-neutral-500">
          <span>Active Invariant Gate Protocol 2.4</span>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
