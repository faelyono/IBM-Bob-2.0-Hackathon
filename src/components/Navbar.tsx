import React from 'react';
import { Code, Play, RefreshCw, HelpCircle, BookOpen } from 'lucide-react';

interface NavbarProps {
  onRunVerification: () => void;
  isVerifying: boolean;
  onOpenRawJson: () => void;
  onOpenPrGuide?: () => void;
  clusterStatus?: string;
  isDashboardView?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRunVerification,
  isVerifying,
  onOpenRawJson,
  onOpenPrGuide,
  clusterStatus = 'OPERATIONAL',
  isDashboardView = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md transition-all font-inter">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Zone: 8-petal orange logo + clean wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="group flex items-center gap-2.5 transition-colors"
            title="BOBIFY | Turn Risky Deployments into Bulletproof Releases"
          >
            {/* Orange #ef4d23 8-petal flower SVG logo */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105"
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 16 + 10 * Math.cos(rad);
                const cy = 16 + 10 * Math.sin(rad);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill="#ef4d23"
                  />
                );
              })}
              <circle cx="16" cy="16" r={3.5} fill="#ef4d23" />
            </svg>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 group-hover:text-[#ef4d23] transition-colors">
                BOBIFY
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-500 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 rounded-full">
                Invariant Gate
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <a
            href="#invariants"
            className="transition-colors hover:text-[#ef4d23]"
          >
            Invariants
          </a>
          {onOpenPrGuide && (
            <button
              onClick={onOpenPrGuide}
              className="flex items-center gap-1.5 font-semibold text-[#ef4d23] hover:text-[#d83f17] transition-colors cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>PR & Repo Guide</span>
            </button>
          )}
          <a
            href="#docs"
            className="transition-colors hover:text-[#ef4d23]"
          >
            Docs & Specs
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PR Guide Quick Trigger (Shown only when not in dashboard to avoid duplication) */}
          {onOpenPrGuide && !isDashboardView && (
            <button
              onClick={onOpenPrGuide}
              title="Open Pull Request and Repository Analysis Guide"
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#ef4d23]" />
              <span className="hidden sm:inline">PR Guide</span>
            </button>
          )}

          {/* Raw JSON / AST Code Viewer */}
          <button
            onClick={onOpenRawJson}
            title="Inspect Raw AST & Report Telemetry JSON"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/30 cursor-pointer shadow-xs"
          >
            <Code className="h-4 w-4" />
          </button>

          {/* Run Gate Verification Action Button (Shown only when not in dashboard to avoid duplication) */}
          {!isDashboardView && (
            <button
              onClick={onRunVerification}
              disabled={isVerifying}
              className="relative flex items-center gap-2 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#ef4d23]/30 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#ef4d23]" />
                  <span className="font-mono">Verifying Invariants...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current text-[#ef4d23]" />
                  <span>Run Sweep</span>
                </>
              )}
            </button>
          )}

          {/* User Profile / Node Indicator */}
          <div
            className="flex h-9 items-center gap-1.5 px-3 rounded-full border border-neutral-200 bg-[#f5f2ee] text-neutral-700 shadow-xs"
            title="Active Cluster Node: us-east-prod-gate"
          >
            <span className="font-mono text-xs font-bold text-neutral-800">IBM</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
