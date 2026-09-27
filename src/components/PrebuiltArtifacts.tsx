import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, FileCode2, Lock, Box } from 'lucide-react';
import { PrebuiltArtifact } from '../types/report';

interface PrebuiltArtifactsProps {
  artifacts: PrebuiltArtifact[];
  onSelectArtifact: (artifact: PrebuiltArtifact) => void;
  isFixApplied?: boolean;
}

export const PrebuiltArtifacts: React.FC<PrebuiltArtifactsProps> = ({
  artifacts,
  onSelectArtifact,
  isFixApplied = false,
}) => {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8 font-inter">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-neutral-200/80 pb-4">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#ef4d23]">
            FAST PREVIEW ENGINE
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Prebuilt Artifacts — <span className="font-serif italic font-normal text-neutral-900">Zero</span> analysis latency
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-neutral-500">
          Explore instant deterministic audits executed against standard enterprise release hazards.
        </p>
      </div>

      {/* 3 Interactive Artifact Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {artifacts.map((artifact, index) => {
          // Dynamic override if fix is applied on the schema migration blocker
          const isSchemaCard = artifact.file.includes('revert.sql');
          const isDanger = !isFixApplied && artifact.badge_type === 'danger';
          const isFixed = isFixApplied && isSchemaCard;

          const badgeText = isFixed ? 'HAZARD MITIGATED' : artifact.badge;
          const metricText = isFixed ? '0 Blockers (Patched)' : artifact.metric;

          return (
            <div
              key={index}
              className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isDanger
                  ? 'border-[#ef4d23]/30 hover:border-[#ef4d23] ring-1 ring-[#ef4d23]/10'
                  : isFixed
                  ? 'border-emerald-200 hover:border-emerald-300 ring-1 ring-emerald-50'
                  : 'border-neutral-200 hover:border-[#ef4d23]/40'
              }`}
            >
              <div>
                {/* Card Top Metadata: Badge & Target File */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase ${
                      isDanger
                        ? 'bg-[#ef4d23]/10 text-[#ef4d23] border border-[#ef4d23]/30'
                        : isFixed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : artifact.badge_type === 'safe'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : artifact.badge_type === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-orange-50 text-[#ef4d23] border border-orange-200'
                    }`}
                  >
                    {isDanger && <span className="h-1.5 w-1.5 rounded-full bg-[#ef4d23] animate-pulse" />}
                    {isFixed && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {badgeText}
                  </span>

                  <span className="font-mono text-xs text-neutral-400 truncate max-w-[150px]" title={artifact.file}>
                    {artifact.file}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3.5 text-lg font-bold text-neutral-900 group-hover:text-[#ef4d23] transition-colors">
                  {artifact.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {isFixed
                    ? 'Synthetic Invariant Guard generated: Non-destructive cold partition partition table view established. Zero data loss verified.'
                    : artifact.description}
                </p>
              </div>

              {/* Card Footer: Metric & Action */}
              <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                <span
                  className={`font-mono font-semibold flex items-center gap-1.5 ${
                    isDanger
                      ? 'text-[#ef4d23]'
                      : isFixed
                      ? 'text-emerald-600'
                      : 'text-neutral-700'
                  }`}
                >
                  {isDanger && <AlertTriangle className="h-3.5 w-3.5 text-[#ef4d23]" />}
                  {isFixed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  {metricText}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectArtifact(artifact)}
                  className="inline-flex items-center gap-1 font-semibold text-[#ef4d23] transition-colors hover:text-[#d83f17] group-hover:underline focus:outline-none cursor-pointer"
                >
                  <span>{artifact.action}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
