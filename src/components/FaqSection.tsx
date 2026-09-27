import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What does the 3D telemetry matrix represent?',
      a: 'The holographic gate serves as a visual projection of your active deployment boundary. The central rotating core represents the cryptographic state commitment, while the four orbiting checkpoint satellites represent our specialized verification agents (Schema Migration, Config Vault, Dependency Drift, and Rollback Replay). Laser lines between nodes indicate invariant telemetry pulses; any red anomaly pinpoints an unverified deployment hazard in real time.',
    },
    {
      q: 'How does BOBIFY test reverse migrations without touching production?',
      a: 'The Rollback Replay Sandbox spins up an ephemeral, lightweight in-memory schema clone initialized with synthetic production-like row distributions. It applies the pull request forward migrations (DDL/DML), seeds test transactions, and executes the reverse down-migration. It compares database schemas and data snapshots byte-for-byte to mathematically prove zero data loss.',
    },
    {
      q: 'Is this connected to bob_sessions/report.json?',
      a: 'Yes. The application dynamically reads live telemetry from `bob_sessions/report.json` generated during the Bob agent orchestration workflow. If the session file is loading or absent, a robust deterministic fallback keeps the telemetry operational without runtime crashes or layout shifts. You can also view and edit the raw JSON directly in the UI.',
    },
    {
      q: 'Can I export cryptographic proof certificates?',
      a: 'Yes. Every passing gate generates an immutable attestation signed by the IBM Cloud HSM enclave using ECDSA-P256 with a SHA-256 digest. You can download the complete signed release manifest (.json) or copy the attestation digest to embed inside your CI/CD pipeline (e.g. GitHub Actions, ArgoCD, or Vercel Deploy hooks).',
    },
  ];

  return (
    <section id="docs" className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8 text-center font-inter">
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#ef4d23]">
        SPECIFICATIONS & FAQ
      </span>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
        Invariant <span className="font-serif italic font-normal text-neutral-900">Verification</span> Explained
      </h2>

      <div className="mt-8 space-y-3 text-left">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs transition-colors hover:border-neutral-300"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#ef4d23]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-neutral-100 px-5 pt-3 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
