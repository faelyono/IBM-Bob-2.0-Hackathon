export interface AgentResult {
  id: string;
  name: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  status_label: string;
  risk: 'LOW' | 'MEDIUM' | 'CRITICAL';
  metric_label: string;
  metric_sub: string;
  latency_ms: number;
  description: string;
  findings: string[];
  hazard?: string;
}

export interface PrebuiltArtifact {
  badge: string;
  badge_type: 'danger' | 'safe' | 'info' | 'warning';
  file: string;
  title: string;
  description: string;
  metric: string;
  action: string;
  target_stage: number;
}

export interface RollbackDiff {
  file: string;
  lines_removed: number;
  lines_added: number;
  unsafe_code: string;
  safe_code: string;
}

export interface Attestation {
  gate_status: string;
  seal_id: string;
  sha256: string;
  hsm_authority: string;
  signed_at: string;
  invariants_passed: number;
  invariants_total: number;
  signer_identity: string;
}

export interface ScoreBreakdown {
  schema_safety: number;
  secret_hygiene: number;
  dependency_lock: number;
  rollback_proof: number;
}

export interface ReportMeta {
  repo: string;
  pr_number: number;
  pr_title: string;
  branch: string;
  target_branch: string;
  author: string;
  commit: string;
  timestamp: string;
  cluster: string;
  telemetry_latency_ms: number;
  is_external_repo?: boolean;
  repo_language?: string;
  repo_stars?: number;
  repo_description?: string;
  repo_url?: string;
}

export interface ReleaseReport {
  meta: ReportMeta;
  readiness_score: number;
  status: 'PASS' | 'BLOCKED' | 'WARNING';
  summary: string;
  agents: {
    ast_parser: AgentResult;
    config_enforcer: AgentResult;
    dependency_auditor: AgentResult;
    rollback_prover: AgentResult;
  };
  prebuilt_artifacts: PrebuiltArtifact[];
  score_breakdown: ScoreBreakdown;
  rollback_diff: RollbackDiff;
  attestation: Attestation;
}
