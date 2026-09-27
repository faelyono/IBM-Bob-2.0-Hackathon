import React, { useState } from 'react';
import { X, Copy, Check, Upload, RefreshCw } from 'lucide-react';
import { ReleaseReport } from '../types/report';

interface RawReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReleaseReport;
  onApplyCustomReport: (newReport: ReleaseReport) => void;
}

export const RawReportModal: React.FC<RawReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onApplyCustomReport,
}) => {
  if (!isOpen) return null;

  const [jsonText, setJsonText] = useState<string>(JSON.stringify(report, null, 2));
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.meta || !parsed.agents) {
        throw new Error('JSON is missing required report fields (meta, agents)');
      }
      onApplyCustomReport(parsed);
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in font-inter">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-[#f5f2ee]/70">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Raw AST Telemetry & report.json
            </h3>
            <p className="font-mono text-xs text-neutral-500">
              Direct live payload from bob_sessions/report.json
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* JSON Editor/Viewer */}
        <div className="p-4 flex-1 overflow-auto bg-[#0b0f1a] text-[#f8fafc]">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-96 bg-transparent font-mono text-xs leading-relaxed text-emerald-400 focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-2 text-xs font-mono text-red-600">
            Error: {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 bg-[#f5f2ee]/50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-full bg-[#0b0f1a] hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#ef4d23]" />
              <span>Apply Live Telemetry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
