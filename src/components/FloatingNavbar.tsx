import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Menu, X } from 'lucide-react';

interface FloatingNavbarProps {
  onLaunchDemo?: () => void;
  onOpenPrGuide?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onLaunchDemo, onOpenPrGuide }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 8 circles at radius 10 around (16,16) plus center circle, r=3.5
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 8;
    return {
      cx: 16 + 10 * Math.cos(angle),
      cy: 16 + 10 * Math.sin(angle),
    };
  });

  return (
    <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 w-full relative z-30">
      <div className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center justify-between">
        {/* Left: Orange #ef4d23 8-petal flower SVG + Brand Name */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 shrink-0">
          <svg
            viewBox="0 0 32 32"
            fill="#ef4d23"
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
          >
            {/* Center circle */}
            <circle cx="16" cy="16" r="3.5" />
            {/* 8 surrounding petals */}
            {petals.map((p, idx) => (
              <circle key={idx} cx={p.cx} cy={p.cy} r="3.5" />
            ))}
          </svg>
          <span className="font-extrabold text-base sm:text-lg text-neutral-900 tracking-tight flex items-center gap-1.5 hidden xs:inline-flex">
            <span>BOBIFY</span>
            <span className="text-[10px] font-mono font-medium text-[#ef4d23] bg-orange-50 border border-orange-200/60 px-1.5 py-0.2 rounded-full">v2.4</span>
          </span>
        </div>

        {/* Center: Desktop links */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-neutral-700 font-medium">
          <a
            href="#home"
            className="flex items-center gap-1.5 text-neutral-900 font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            <span>Home</span>
          </a>
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            3D Gate
          </a>
          <a href="#about" className="hover:text-neutral-900 transition-colors">
            Architecture
          </a>
          {onOpenPrGuide ? (
            <button
              type="button"
              onClick={onOpenPrGuide}
              className="flex items-center gap-1 text-[#ef4d23] hover:text-[#d83f17] transition-colors cursor-pointer font-semibold"
            >
              <span>PR & Repo Guide</span>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href="#pages"
              className="flex items-center gap-1 text-[#ef4d23] hover:text-[#d83f17] transition-colors"
            >
              <span>Invariants</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          )}
        </nav>

        {/* Right Cluster (ml-auto) */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {onOpenPrGuide && (
            <button
              type="button"
              onClick={onOpenPrGuide}
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ef4d23]" />
              <span>PR Guide</span>
            </button>
          )}

          {/* Orange #ef4d23 rounded-full button */}
          <button
            type="button"
            onClick={onLaunchDemo}
            className="bg-[#ef4d23] hover:bg-[#d83f17] text-white rounded-full pl-3.5 sm:pl-4 pr-1.5 py-1.5 text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <span className="hidden sm:inline">Launch Sandbox</span>
            <span className="sm:hidden">Sandbox</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Mobile-only Hamburger Menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-30 flex flex-col gap-2 text-sm text-neutral-700 font-medium">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center gap-2 text-neutral-900 font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span>Home</span>
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50"
            >
              3D Gate
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50"
            >
              Architecture
            </a>
            {onOpenPrGuide && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPrGuide();
                }}
                className="px-3 py-2 rounded-lg hover:bg-neutral-50 text-[#ef4d23] flex items-center justify-between text-left font-semibold cursor-pointer"
              >
                <span>PR & Invariant Guide</span>
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
