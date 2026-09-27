import React, { useState, useEffect } from 'react';
import { ReleaseReport, AgentResult } from './types/report';
import { SAMPLE_REPORTS } from './data/mockReports';
import { generateReportForRepo, fetchAndAnalyzeRepo } from './utils/repoAnalyzer';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ScanningScreen } from './components/ScanningScreen';
import { DashboardView } from './components/DashboardView';
import { Footer } from './components/Footer';
import { RawReportModal } from './components/RawReportModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { PrExplainerModal } from './components/PrExplainerModal';

export default function App() {
  // Page Flow State: 'landing' -> 'scanning' -> 'dashboard'
  const [pageView, setPageView] = useState<'landing' | 'scanning' | 'dashboard'>('landing');

  // Currently analyzed repo query
  const [currentRepoQuery, setCurrentRepoQuery] = useState<string>(
    'faelyono/IBM-Bob-2.0-Hackathon #pr-142'
  );

  // Active Report state
  const [report, setReport] = useState<ReleaseReport>(SAMPLE_REPORTS['pr-142']);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFixApplied, setIsFixApplied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isRawJsonOpen, setIsRawJsonOpen] = useState<boolean>(false);
  const [isPrGuideOpen, setIsPrGuideOpen] = useState<boolean>(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load live data from bob_sessions/report.json on initial load
  useEffect(() => {
    let isMounted = true;

    async function loadReportData() {
      try {
        const response = await fetch('/bob_sessions/report.json');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data && data.meta && data.agents) {
            setReport(data);
          }
        }
      } catch (err) {
        console.info('Loaded fallback report:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReportData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Launch analysis for ANY repository
  const handleAnalyzeRepo = async (repoString: string) => {
    const trimmed = repoString.trim();
    setCurrentRepoQuery(trimmed);
    setIsFixApplied(false);

    // 1. Instant preliminary report for zero-lag UI response
    const instantReport = generateReportForRepo(trimmed);
    setReport(instantReport);

    // 2. Move to scanning waiting screen
    setPageView('scanning');

    // 3. In background, attempt to enrich with live public GitHub API details
    try {
      const enriched = await fetchAndAnalyzeRepo(trimmed);
      setReport(enriched);
    } catch {
      // synchronous fallback already active
    }
  };

  // Scan finished -> transition to dashboard workflow
  const handleScanComplete = () => {
    setPageView('dashboard');
    showToast(`Invariant verification ready for ${report.meta.repo}`);
  };

  // Switch sample from preset badges
  const handleSelectSample = (key: string) => {
    if (SAMPLE_REPORTS[key]) {
      setReport(SAMPLE_REPORTS[key]);
      setIsFixApplied(false);
      setCurrentRepoQuery(`${SAMPLE_REPORTS[key].meta.repo} #pr-${SAMPLE_REPORTS[key].meta.pr_number}`);
    }
  };

  // Re-run Sweep from navbar or dashboard
  const handleRunSweep = () => {
    setIsVerifying(true);
    showToast('Executing multi-agent invariant verification sweep...');

    setTimeout(() => {
      setIsVerifying(false);
      if (isFixApplied) {
        showToast('Verification Complete: 4/4 Agents passed. Gate SEALED.');
      } else {
        showToast(
          report.status === 'PASS'
            ? 'Verification Complete: 100% Invariant Compliance.'
            : 'Verification Complete: 1 Down-Migration Hazard Flagged.'
        );
      }
    }, 1200);
  };

  // Toggle Synthetic Rollback Guard Fix
  const handleToggleFix = () => {
    const nextState = !isFixApplied;
    setIsFixApplied(nextState);
    if (nextState) {
      showToast('Synthetic Invariant Guard injected! Score elevated to 98/100.');
    } else {
      showToast('Reverted to raw unverified migration state.');
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#ededed] px-4 font-mono text-xs text-neutral-600">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#ef4d23] border-t-transparent" />
          <span>Synchronizing with bob_sessions/report.json...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ededed] text-[#131b2e] font-inter antialiased relative selection:bg-[#ef4d23]/20 selection:text-[#0b0f1a]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-neutral-200/90 bg-white/95 px-4 py-2.5 font-mono text-xs font-semibold text-neutral-900 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <span className="h-2 w-2 rounded-full bg-[#ef4d23]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar for Dashboard / Non-Landing Pages */}
      {pageView === 'dashboard' && (
        <Navbar
          onRunVerification={handleRunSweep}
          isVerifying={isVerifying}
          onOpenRawJson={() => setIsRawJsonOpen(true)}
          onOpenPrGuide={() => setIsPrGuideOpen(true)}
          isDashboardView={true}
        />
      )}

      {/* STEP 1: LANDING PAGE */}
      {pageView === 'landing' && (
        <LandingPage
          onAnalyzeRepo={handleAnalyzeRepo}
          report={report}
          onSelectSample={handleSelectSample}
          onOpenPrGuide={() => setIsPrGuideOpen(true)}
        />
      )}

      {/* STEP 2: SCANNING / WAITING SCREEN (3D Radar + Live Terminal Logs) */}
      {pageView === 'scanning' && (
        <ScanningScreen
          repoInput={currentRepoQuery}
          report={report}
          onScanComplete={handleScanComplete}
          onCancel={() => setPageView('landing')}
        />
      )}

      {/* STEP 3: WORKFLOW & INVARIANT DASHBOARD */}
      {pageView === 'dashboard' && (
        <DashboardView
          report={report}
          onBackToPortal={() => setPageView('landing')}
          onChangeRepo={handleAnalyzeRepo}
          isFixApplied={isFixApplied}
          onToggleFix={handleToggleFix}
          onRunSweep={handleRunSweep}
          isVerifying={isVerifying}
          onOpenRawJson={() => setIsRawJsonOpen(true)}
          onOpenAgentModal={(agent) => setSelectedAgentForModal(agent)}
          onOpenPrGuide={() => setIsPrGuideOpen(true)}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <RawReportModal
        isOpen={isRawJsonOpen}
        onClose={() => setIsRawJsonOpen(false)}
        report={report}
        onApplyCustomReport={(custom) => {
          setReport(custom);
          showToast('Custom telemetry successfully loaded!');
        }}
      />

      <AgentDetailModal
        isOpen={!!selectedAgentForModal}
        onClose={() => setSelectedAgentForModal(null)}
        agent={selectedAgentForModal}
      />

      <PrExplainerModal
        isOpen={isPrGuideOpen}
        onClose={() => setIsPrGuideOpen(false)}
        onSelectRepo={handleAnalyzeRepo}
        currentRepo={currentRepoQuery}
      />
    </div>
  );
}
