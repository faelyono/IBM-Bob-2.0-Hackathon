import React, { useState } from 'react';
import { ChevronRight, GitPullRequest, ArrowRight, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { FloatingNavbar } from './FloatingNavbar';
import { DashboardPreview } from './DashboardPreview';
import { HolographicGate } from './HolographicGate';
import { PrebuiltArtifacts } from './PrebuiltArtifacts';
import { AgentArchitecture } from './AgentArchitecture';
import { FaqSection } from './FaqSection';
import { CtaBanner } from './CtaBanner';
import { BlurredButterfly } from './BlurredButterfly';
import { ReleaseReport } from '../types/report';

interface LandingPageProps {
  onAnalyzeRepo: (repoInput: string) => void;
  report: ReleaseReport;
  onSelectSample: (sampleKey: string) => void;
  onOpenPrGuide?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyzeRepo,
  report,
  onSelectSample,
  onOpenPrGuide,
}) => {
  const [quickInput, setQuickInput] = useState<string>('faelyono/IBM-Bob-2.0-Hackathon #pr-142');

  const handleLaunch = () => {
    onAnalyzeRepo(quickInput.trim());
  };

  const sampleBadges = [
    { label: 'PR #142 (Settlement Engine)', desc: 'Schema Hazard (Blocked)', value: 'faelyono/IBM-Bob-2.0-Hackathon #pr-142', status: 'hazard' },
    { label: 'PR #138 (Auth Vault)', desc: 'KMS Key Pass (Sealed)', value: 'faelyono/IBM-Bob-2.0-Hackathon #pr-138', status: 'safe' },
    { label: 'PR #145 (Kafka Stream)', desc: 'Transitive Drift (Warning)', value: 'faelyono/IBM-Bob-2.0-Hackathon #pr-145', status: 'warning' },
    { label: 'shadcn-ui/ui #pr-182', desc: 'Design System', value: 'shadcn-ui/ui #pr-182', status: 'safe' },
    { label: 'vercel/next.js #pr-58201', desc: 'SSR Cache', value: 'vercel/next.js #pr-58201', status: 'hazard' },
    { label: 'facebook/react #pr-28100', desc: 'Fiber AST', value: 'facebook/react #pr-28100', status: 'safe' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4 font-inter text-[#131b2e]">
      {/* ======================================================== */}
      {/* HERO CONTAINER (CLIPS EVERYTHING INSIDE) */}
      {/* ======================================================== */}
      <div className="relative w-full min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay above video */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1.5px] z-1 pointer-events-none" />

        {/* Ethereal Blurred Butterfly focused behind the hero headline */}
        <BlurredButterfly
          className="top-16 right-4 sm:right-24 z-2"
          size={340}
          blur={26}
          opacity={0.34}
          variant="orange"
        />
        <BlurredButterfly
          className="bottom-32 -left-12 z-2"
          size={240}
          blur={24}
          opacity={0.22}
          variant="amber"
        />

        {/* Foreground Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* 1. Floating Pill Navbar */}
          <FloatingNavbar
            onLaunchDemo={handleLaunch}
            onOpenPrGuide={onOpenPrGuide}
          />

          {/* 2. Hero Content (Centered) */}
          <div className="flex flex-col items-center px-4 pt-8 sm:pt-14 pb-4 sm:pb-8 text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/95 rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-neutral-800 backdrop-blur-sm border border-neutral-200/60">
              <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
              <span className="font-extrabold text-[#ef4d23] font-mono tracking-wider">BOBIFY</span>
              <span className="text-neutral-300">•</span>
              <span>Turn Risky Deployments into Bulletproof Releases</span>
            </div>

            {/* Headline with Instrument Serif */}
            <h1
              style={{
                fontSize: 'clamp(36px, 7.5vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
              className="mt-5 sm:mt-6 max-w-4xl text-neutral-900"
            >
              Don't Just Ship It.{' '}
              <br className="sm:hidden" />
              <span
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
                className="text-neutral-900"
              >
                Bobify
              </span>{' '}
              It.
            </h1>

            {/* Catchy Slogan & Subtitle */}
            <p
              style={{
                fontSize: 'clamp(14px, 3.5vw, 17px)',
              }}
              className="mt-4 sm:mt-5 text-neutral-700 max-w-2xl px-2 leading-relaxed"
            >
              <strong className="text-neutral-900 font-semibold">Zero Rollback Fear. 100% Invariant Proof.</strong>
              <span className="block mt-1 text-neutral-600 text-xs sm:text-sm">
                Analyze any repository or pull request to mathematically prove zero-loss down migrations and enforce invariant safety gates before shipping to production.
              </span>
            </p>

            {/* Universal Repo Input Search & CTA */}
            <div className="mt-6 sm:mt-8 w-full max-w-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLaunch();
                }}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full p-1.5 pl-4 shadow-md border border-neutral-200/80 focus-within:ring-2 focus-within:ring-[#ef4d23]/30 transition-all"
              >
                <GitPullRequest className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Enter any repo e.g. facebook/react #28100 or owner/repo #pr"
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-[#0b0f1a] hover:bg-neutral-800 text-white rounded-full pl-5 sm:pl-6 pr-2 py-2 sm:py-2.5 text-xs sm:text-[14px] font-medium transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <span>Verify Gate</span>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </form>

              {/* Sample Badges */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  QUICK RUN:
                </span>
                {sampleBadges.slice(0, 4).map((badge, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuickInput(badge.value);
                      onAnalyzeRepo(badge.value);
                    }}
                    title={badge.desc}
                    className="inline-flex items-center gap-1 rounded-full bg-white/80 hover:bg-white border border-neutral-200/80 px-2.5 py-0.5 font-mono text-[10.5px] text-neutral-700 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        badge.status === 'hazard'
                          ? 'bg-[#ef4d23]'
                          : badge.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{badge.label}</span>
                  </button>
                ))}
              </div>

              {/* Explanatory Guide Trigger */}
              {onOpenPrGuide && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={onOpenPrGuide}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white border border-orange-200/90 px-3.5 py-1 font-mono text-xs font-semibold text-[#ef4d23] shadow-xs hover:shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#ef4d23]" />
                    <span>What does each Pull Request do? & How does analyzing any repo work? →</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Dashboard Preview Tray (Bleeds into bottom of Hero container) */}
          <div className="mt-4 pb-2 sm:pb-0">
            <DashboardPreview
              report={report}
              onAnalyzeRepo={onAnalyzeRepo}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECONDARY FEATURES & DEEP DIVE SECTION */}
      {/* ======================================================== */}
      <div className="mt-12 sm:mt-16 max-w-7xl mx-auto space-y-16 sm:space-y-20 relative">
        {/* Soft Blurred Butterfly focused behind 3D Gate */}
        <BlurredButterfly
          className="top-12 -left-16 z-0"
          size={320}
          blur={28}
          opacity={0.24}
          variant="orange"
          animateSlow
        />
        {/* Soft Blurred Butterfly focused behind Architecture */}
        <BlurredButterfly
          className="top-[860px] -right-16 z-0"
          size={300}
          blur={26}
          opacity={0.22}
          variant="amber"
        />

        {/* Interactive Holographic Gate Canvas Section */}
        <section id="features" className="text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 font-mono text-xs text-neutral-600 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span>Interactive 3D Gate Radar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Deterministic Invariant <span className="font-serif italic font-normal text-neutral-900">Gate</span> Visualization
          </h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-2xl mx-auto">
            Observe your release boundary in 3D. Click and drag to inspect orbital checkpoints
            monitoring Schema Migrations, Vault Secrets, Dependencies, and Rollback Replays.
          </p>

          <div className="mt-6">
            <HolographicGate
              report={report}
              isFixApplied={false}
              onSelectCheckpoint={() => onAnalyzeRepo(quickInput)}
            />
          </div>
        </section>

        {/* Prebuilt Artifacts Benchmarks */}
        <PrebuiltArtifacts
          artifacts={report.prebuilt_artifacts}
          onSelectArtifact={() => onAnalyzeRepo(quickInput)}
          isFixApplied={false}
        />

        {/* 4 Agent Architecture */}
        <section id="about">
          <AgentArchitecture />
        </section>

        {/* FAQ Section */}
        <section id="pages">
          <FaqSection />
        </section>

        {/* CTA Banner */}
        <CtaBanner onRunDemo={() => onAnalyzeRepo(quickInput)} />
      </div>
    </div>
  );
};
