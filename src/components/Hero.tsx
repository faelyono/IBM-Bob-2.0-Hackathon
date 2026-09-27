import React, { useState, useEffect } from 'react';
import { GitPullRequest, ArrowRight, Sparkles, Terminal, HelpCircle } from 'lucide-react';
import { ReleaseReport } from '../types/report';

interface HeroProps {
  currentReportKey: string;
  onSelectSample: (key: string) => void;
  onAnalyzeCustomPr: (prString: string) => void;
  isAnalyzing: boolean;
  report: ReleaseReport;
  onOpenPrGuide?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentReportKey,
  onSelectSample,
  onAnalyzeCustomPr,
  isAnalyzing,
  report,
  onOpenPrGuide,
}) => {
  const [prInput, setPrInput] = useState<string>(
    `${report.meta.repo} #pr-${report.meta.pr_number}`
  );

  useEffect(() => {
    setPrInput(`${report.meta.repo} #pr-${report.meta.pr_number}`);
  }, [report.meta.repo, report.meta.pr_number]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prInput.trim()) return;
    onAnalyzeCustomPr(prInput.trim());
  };

  return (
    <section className="relative pt-10 pb-6 text-center">
      {/* Top Tagline Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[11px] font-semibold text-slate-800">
          IBM BOB 2.0 HACKATHON
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-600">UNIVERSAL INVARIANT GATE</span>
        <span className="text-slate-300">|</span>
        <span className="font-mono text-[11px] font-bold text-[#006194]">
          Target: {report.meta.repo.split('/').pop()} #{report.meta.pr_number}
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl text-balance">
        Read any deployment as a{' '}
        <span className="bg-gradient-to-r from-[#006194] via-[#0284c7] to-[#4f46e5] bg-clip-text text-transparent italic font-serif">
          verified gate.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
        <strong className="font-semibold text-slate-900">BOBIFY</strong> turns
        pull requests, database migrations, and config manifests from <em>any repository</em> into an interactive safety
        landscape. Every release is proven safe before touching production.
      </p>

      {/* Analysis Bar */}
      <div className="mx-auto mt-8 max-w-2xl px-4">
        <form
          onSubmit={handleSubmit}
          className="group flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-md ring-1 ring-slate-100 transition-all focus-within:border-[#0284c7] focus-within:ring-2 focus-within:ring-[#0284c7]/20"
        >
          <div className="flex w-full items-center gap-2.5 px-3 py-1">
            <GitPullRequest className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-[#006194]" />
            <input
              type="text"
              value={prInput}
              onChange={(e) => setPrInput(e.target.value)}
              placeholder="Enter any repo e.g. facebook/react #28100 or myorg/billing #42"
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <span className="hidden sm:inline-flex shrink-0 items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">
              Any Repo
            </span>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-[#006194] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#004b73] active:scale-[0.98] disabled:opacity-70 whitespace-nowrap cursor-pointer"
          >
            {isAnalyzing ? (
              <span className="font-mono">Analyzing...</span>
            ) : (
              <>
                <span>Analyze Gate</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-500">
          <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400">
            DEMO PRESETS:
          </span>

          <button
            type="button"
            onClick={() => {
              onSelectSample('pr-142');
              setPrInput('faelyono/IBM-Bob-2.0-Hackathon #pr-142');
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition-all cursor-pointer ${
              currentReportKey === 'pr-142' && report.meta.repo.includes('faelyono')
                ? 'border-amber-400 bg-amber-50 font-semibold text-amber-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Hackathon PR #142 (Hazard)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSample('pr-138');
              setPrInput('faelyono/IBM-Bob-2.0-Hackathon #pr-138');
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition-all cursor-pointer ${
              currentReportKey === 'pr-138' && report.meta.repo.includes('faelyono')
                ? 'border-emerald-400 bg-emerald-50 font-semibold text-emerald-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Hackathon PR #138 (Pass)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSample('pr-145');
              setPrInput('faelyono/IBM-Bob-2.0-Hackathon #pr-145');
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition-all cursor-pointer ${
              currentReportKey === 'pr-145' && report.meta.repo.includes('faelyono')
                ? 'border-sky-400 bg-sky-50 font-semibold text-sky-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7]" />
            <span>Hackathon PR #145 (Drift)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrInput('facebook/react #pr-28100');
              onAnalyzeCustomPr('facebook/react #pr-28100');
            }}
            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 px-3 py-1 font-mono text-[11px] text-blue-900 transition-all cursor-pointer"
          >
            <span>facebook/react</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrInput('vercel/next.js #pr-58201');
              onAnalyzeCustomPr('vercel/next.js #pr-58201');
            }}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1 font-mono text-[11px] text-neutral-800 transition-all cursor-pointer"
          >
            <span>vercel/next.js</span>
          </button>
        </div>

        {onOpenPrGuide && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onOpenPrGuide}
              className="inline-flex items-center gap-1 text-xs text-[#006194] hover:underline font-mono cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>How does analyzing any repository work? & What do different PRs test?</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
