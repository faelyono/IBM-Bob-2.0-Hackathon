import React from 'react';
import { GitBranch, Key, Database, RotateCcw, Clock, ShieldCheck, Zap, Award } from 'lucide-react';

export const AgentArchitecture: React.FC = () => {
  const agents = [
    {
      num: '01 AGENT',
      icon: GitBranch,
      iconColor: 'text-[#ef4d23] bg-orange-50 border-orange-100',
      title: 'AST Tree Ingester',
      description:
        'Extracts high-level syntax graphs from source pull requests, tracking every mutating database handle, network socket, and interface mutation.',
      footerIcon: Clock,
      footerText: '<180ms parse latency',
    },
    {
      num: '02 AGENT',
      icon: Key,
      iconColor: 'text-neutral-800 bg-neutral-100 border-neutral-200',
      title: 'Config & Secrets Enforcer',
      description:
        'Guarantees zero plain-text leaks, verifies secret expiration policies, and performs real-time drift detection across Kubernetes config maps.',
      footerIcon: ShieldCheck,
      footerText: 'HSM / KMS validation',
    },
    {
      num: '03 AGENT',
      icon: Database,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      title: 'Ephemeral Sandbox DB Replay',
      description:
        'Spins up a lightweight isolated clone of production storage to replay forward DDL and DML scripts under real concurrency workloads.',
      footerIcon: Zap,
      footerText: 'Zero state pollution',
    },
    {
      num: '04 AGENT',
      icon: RotateCcw,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      title: 'Autonomous Rollback Prover',
      description:
        'Mathematically proves that the reverse migration script restores database state to 100% byte equivalence, eliminating catastrophic deploy traps.',
      footerIcon: Award,
      footerText: 'Deterministic proofs',
    },
  ];

  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 text-center font-inter">
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#ef4d23]">
        MULTI-AGENT VERIFICATION ARCHITECTURE
      </span>
      <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
        Four Specialized <span className="font-serif italic font-normal text-neutral-900">Agents</span>. Zero Production Surprises.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-neutral-600 leading-relaxed">
        Release decisions shouldn't depend on intuition. Bob agents execute deterministic
        invariant checks simultaneously before code is stamped safe.
      </p>

      {/* 4 Cards Grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const FooterIcon = agent.footerIcon;
          return (
            <div
              key={index}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-[#ef4d23]/40 hover:shadow-md"
            >
              <div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${agent.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="mt-4 block font-mono text-[11px] font-semibold text-neutral-400">
                  {agent.num}
                </span>

                <h3 className="mt-1 text-lg font-bold text-neutral-900">
                  {agent.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 border-t border-neutral-100 pt-3 font-mono text-xs text-neutral-500">
                <FooterIcon className="h-3.5 w-3.5 text-[#ef4d23]" />
                <span>{agent.footerText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
