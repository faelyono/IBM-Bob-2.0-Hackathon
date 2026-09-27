import React from 'react';
import { ArrowRight, Github, Play } from 'lucide-react';

interface CtaBannerProps {
  onRunDemo: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onRunDemo }) => {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 font-inter">
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0f1a] p-8 sm:p-12 text-white shadow-xl border border-neutral-800">
        {/* Ambient Orange & Amber Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#ef4d23]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-[#f59e0b]/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-grid-subtle" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#ef4d23]">
              DEPLOY WITH CERTAINTY • DON'T JUST SHIP IT, BOBIFY IT
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Install <span className="text-[#ef4d23]">BOBIFY</span> in your{' '}
              <span className="font-serif italic font-normal text-white">
                pipeline
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-300">
              Turn risky deployments into bulletproof releases. Bring deterministic invariant gates to GitHub Actions, GitLab CI, or ArgoCD in less than 3 minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/faelyono/IBM-Bob-2.0-Hackathon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:bg-neutral-100 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <button
              onClick={onRunDemo}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current text-[#ef4d23]" />
              <span>Test Interactive Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
