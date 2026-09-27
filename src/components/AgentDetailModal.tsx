import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Terminal } from 'lucide-react';
import { AgentResult } from '../types/report';

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentResult | null;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  isOpen,
  onClose,
  agent,
}) => {
  if (!isOpen || !agent) return null;

  const isWarning = agent.status === 'WARNING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in font-inter">
      <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-[#f5f2ee]/70">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                isWarning
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-600'
              }`}
            >
              {isWarning ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {agent.name}
              </h3>
              <p className="font-mono text-xs text-neutral-500">
                Execution Latency: {agent.latency_ms}ms · Risk: {agent.risk}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Agent Purpose & Invariant
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {agent.description}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-[#f5f2ee]/60 p-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Deterministic Verification Findings
            </h4>
            <ul className="mt-2.5 space-y-2 text-xs font-mono text-neutral-700">
              {agent.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`h-1.5 w-1.5 mt-1 rounded-full shrink-0 ${
                      isWarning && i === 0 ? 'bg-[#ef4d23]' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 border-t border-neutral-100 pt-3">
            <span>Metric: {agent.metric_label}</span>
            <span>{agent.metric_sub}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-200 px-6 py-3 bg-[#f5f2ee]/50">
          <button
            onClick={onClose}
            className="rounded-full bg-[#0b0f1a] px-5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
