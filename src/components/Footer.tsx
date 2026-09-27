import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-neutral-200/80 bg-white py-8 text-xs text-neutral-500 font-inter">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 font-mono">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
          <span className="font-extrabold text-[#ef4d23]">BOBIFY</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-700">Turn Risky Deployments into Bulletproof Releases</span>
          <span className="text-neutral-300">·</span>
          <span>IBM Bob 2.0 Hackathon</span>
          <span className="text-neutral-300">·</span>
          <span>Cluster: us-east-prod-gate</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            INVARIANT GATE ENGINE: OPERATIONAL
          </span>
          <a
            href="https://github.com/faelyono/IBM-Bob-2.0-Hackathon"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-600 underline underline-offset-4 hover:text-[#ef4d23] transition-colors"
          >
            source_code
          </a>
        </div>
      </div>
    </footer>
  );
};
