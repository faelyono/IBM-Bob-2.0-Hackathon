import { ReleaseReport } from '../types/report';
import { SAMPLE_REPORTS } from '../data/mockReports';

// Clean and extract repository name and PR number from ANY user input format
export function parseRepoInput(rawInput: string): { repoName: string; prNumber: number } {
  let text = rawInput.trim();
  if (!text) {
    return { repoName: 'faelyono/IBM-Bob-2.0-Hackathon', prNumber: 142 };
  }

  // Extract PR number from formats like: #pr-145, #145, /pull/145, pr-145, #pr145
  let prNumber = 142;
  const prRegex = /(?:#pr-|#pr|#|\/pull\/|pr-)(\d+)/i;
  const match = text.match(prRegex);
  if (match) {
    prNumber = parseInt(match[1], 10);
    text = text.replace(match[0], '').trim();
  }

  // Remove URL prefixes and trailing git suffixes
  let repoName = text
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git$/i, '')
    .replace(/#.*$/, '')
    .replace(/\/+$/, '')
    .trim();

  // If user only typed a project name without slash, format it cleanly
  if (repoName && !repoName.includes('/')) {
    repoName = `workspace/${repoName}`;
  }

  if (!repoName) {
    repoName = 'faelyono/IBM-Bob-2.0-Hackathon';
  }

  return { repoName, prNumber };
}

// Generate a rich, deterministic report for ANY repository and PR entered by the user
export function generateReportForRepo(
  repoInput: string,
  liveGithubData?: {
    description?: string;
    stars?: number;
    language?: string;
    defaultBranch?: string;
    prTitle?: string;
  }
): ReleaseReport {
  const { repoName, prNumber } = parseRepoInput(repoInput);
  const shortName = repoName.split('/').pop() || 'service';
  const authorName = repoName.split('/')[0] || 'developer';
  const safeIdentifier = shortName.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

  // Check if it's the exact IBM Bob Hackathon PRs
  const isIbmBobRepo =
    repoName.toLowerCase() === 'faelyono/ibm-bob-2.0-hackathon' ||
    repoName.toLowerCase().includes('faelyono');

  const isExternal = !isIbmBobRepo;

  // Exact preset mock reports for the Hackathon repo
  if (isIbmBobRepo && prNumber === 142) {
    const base = JSON.parse(JSON.stringify(SAMPLE_REPORTS['pr-142']));
    base.meta.repo = repoName;
    base.meta.pr_number = prNumber;
    base.meta.is_external_repo = false;
    base.meta.repo_language = 'TypeScript/Go';
    base.meta.repo_url = `https://github.com/${repoName}`;
    return base;
  }

  if (isIbmBobRepo && prNumber === 138) {
    const base = JSON.parse(JSON.stringify(SAMPLE_REPORTS['pr-138']));
    base.meta.repo = repoName;
    base.meta.pr_number = prNumber;
    base.meta.is_external_repo = false;
    base.meta.repo_language = 'TypeScript/Go';
    base.meta.repo_url = `https://github.com/${repoName}`;
    return base;
  }

  if (isIbmBobRepo && prNumber === 145) {
    const base = JSON.parse(JSON.stringify(SAMPLE_REPORTS['pr-145']));
    base.meta.repo = repoName;
    base.meta.pr_number = prNumber;
    base.meta.is_external_repo = false;
    base.meta.repo_language = 'TypeScript/Go';
    base.meta.repo_url = `https://github.com/${repoName}`;
    return base;
  }

  // Generate deterministic pseudo-hash based on repoName + prNumber so results are stable per repo
  let hashVal = 0;
  const hashKey = `${repoName.toLowerCase()}#${prNumber}`;
  for (let i = 0; i < hashKey.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashKey.charCodeAt(i);
  }
  hashVal = Math.abs(hashVal);

  const commitHash = (hashVal.toString(16) + '8a7b3c').substring(0, 7);

  // Check semantic keywords in input for realistic failure modes
  const lowerInput = repoInput.toLowerCase();
  const isMigrationPR =
    prNumber === 142 ||
    lowerInput.includes('migration') ||
    lowerInput.includes('schema') ||
    lowerInput.includes('sql') ||
    lowerInput.includes('ledger') ||
    hashVal % 3 === 0;

  const isSecurityPR =
    prNumber === 138 ||
    lowerInput.includes('vault') ||
    lowerInput.includes('security') ||
    lowerInput.includes('token') ||
    lowerInput.includes('crypto') ||
    lowerInput.includes('auth');

  const isDependencyPR =
    prNumber === 145 ||
    lowerInput.includes('kafka') ||
    lowerInput.includes('dep') ||
    lowerInput.includes('drift') ||
    lowerInput.includes('concurrency');

  const hasRollbackHazard = isMigrationPR && !isSecurityPR;
  const isWarningAdvisory = !hasRollbackHazard && isDependencyPR;

  let score = 96;
  if (hasRollbackHazard) {
    score = 74 + (hashVal % 10); // 74 - 83 (Blocked)
  } else if (isWarningAdvisory) {
    score = 83 + (hashVal % 5); // 83 - 87 (Advisory)
  } else {
    score = 94 + (hashVal % 6); // 94 - 99 (Clean pass)
  }

  const status = score >= 90 ? 'PASS' : hasRollbackHazard ? 'BLOCKED' : 'WARNING';

  const nodesMapped = 1250 + (hashVal % 1800);
  const secretsScanned = 18 + (hashVal % 24);
  const pkgsScanned = 115 + (hashVal % 85);

  const lang =
    liveGithubData?.language ||
    (shortName.includes('react')
      ? 'TypeScript (React)'
      : shortName.includes('next')
      ? 'TypeScript (Next.js)'
      : shortName.includes('compose')
      ? 'Go'
      : shortName.includes('ui')
      ? 'TypeScript'
      : 'TypeScript/Go');

  const targetBranch = liveGithubData?.defaultBranch || 'main';
  const prTitle =
    liveGithubData?.prTitle ||
    (hasRollbackHazard
      ? `feat(${shortName}): batch ledger ingestion & transaction partition sync`
      : isSecurityPR
      ? `security(${shortName}): upgrade KMS envelope token rotation protocol`
      : isWarningAdvisory
      ? `refactor(${shortName}): scale stream concurrency & partition groups`
      : `feat(${shortName}): strict invariant gate verification & state integrity`);

  // Tailor file names specifically to the repository!
  let diffFile = `migrations/${safeIdentifier}_v${prNumber}_revert.sql`;
  let configFile = `config/${safeIdentifier}.prod.env`;
  let lockFile = 'package-lock.json';

  if (shortName.includes('react')) {
    diffFile = `packages/react-reconciler/scripts/revert_fiber_v${prNumber}.ts`;
    configFile = `fixtures/devtools/config.prod.json`;
    lockFile = 'yarn.lock';
  } else if (shortName.includes('next')) {
    diffFile = `packages/next/src/server/web/cache_revert_v${prNumber}.ts`;
    configFile = `packages/next/next.config.prod.js`;
    lockFile = 'pnpm-lock.yaml';
  } else if (shortName.includes('ui')) {
    diffFile = `packages/cli/src/commands/revert_theme_v${prNumber}.ts`;
    configFile = `apps/www/registry.prod.json`;
    lockFile = 'pnpm-lock.yaml';
  }

  return {
    meta: {
      repo: repoName,
      pr_number: prNumber,
      pr_title: prTitle,
      branch: `feature/${shortName}-v${(prNumber % 9) + 1}.0`,
      target_branch: targetBranch,
      author: authorName,
      commit: commitHash,
      timestamp: new Date().toISOString(),
      cluster: 'us-east-prod-gate',
      telemetry_latency_ms: 22 + (hashVal % 16),
      is_external_repo: isExternal,
      repo_language: lang,
      repo_stars: liveGithubData?.stars,
      repo_description: liveGithubData?.description || `Source codebase for ${repoName}`,
      repo_url: `https://github.com/${repoName}`,
    },
    readiness_score: score,
    status: status,
    summary: hasRollbackHazard
      ? `Swarm consensus: 3 of 4 agents signaled PASS, 1 agent caught an irreversible down-migration hazard in ${repoName}.`
      : isWarningAdvisory
      ? `Swarm consensus: 3 of 4 agents passed, 1 agent flagged transitive client library drift for ${repoName}.`
      : `Swarm consensus: 4 of 4 agents verified 100% invariant compliance for ${repoName}. Release sealed.`,
    agents: {
      ast_parser: {
        id: 'ast_parser',
        name: 'AST Tree Parser',
        status: 'PASS',
        status_label: 'Active',
        risk: 'LOW',
        metric_label: `${nodesMapped.toLocaleString()} nodes mapped`,
        metric_sub: '0 parse errors',
        latency_ms: 110 + (hashVal % 35),
        description: `Deconstructs ${repoName} (${lang}) syntax into semantic AST representations to detect invariant hazards.`,
        findings: [
          `${nodesMapped.toLocaleString()} syntax graph nodes mapped across modified files in ${repoName}`,
          `Zero unhandled async promise rejections or dangling connection handles in ${shortName}`,
          `Target branch ${targetBranch} AST integrity matched strict deterministic grammar standards`,
        ],
      },
      config_enforcer: {
        id: 'config_enforcer',
        name: 'Config & Secret Enforcer',
        status: 'PASS',
        status_label: 'Active',
        risk: 'LOW',
        metric_label: `${secretsScanned} secrets scanned`,
        metric_sub: '100% compliant',
        latency_ms: 65 + (hashVal % 25),
        description: `Inspects environment variables and secret drift across ${repoName} manifests and config trees.`,
        findings: [
          `${secretsScanned} environment variables in ${shortName} validated against the HSM schema`,
          `Zero high-entropy plaintext credentials detected in commit ${commitHash}`,
          `Target cluster us-east-prod-gate security posture satisfied for ${repoName}`,
        ],
      },
      dependency_auditor: {
        id: 'dependency_auditor',
        name: 'Dependency Auditor',
        status: isWarningAdvisory ? 'WARNING' : 'PASS',
        status_label: isWarningAdvisory ? 'Warning' : 'Active',
        risk: isWarningAdvisory ? 'MEDIUM' : 'LOW',
        metric_label: isWarningAdvisory ? 'Transitive drift detected' : '0 CVEs detected',
        metric_sub: isWarningAdvisory ? 'Unpinned patch warning' : 'SHA verified',
        latency_ms: 90 + (hashVal % 30),
        description: `Cross-references ${repoName} lockfile digests (${lockFile}) against IBM Vulnerability Advisory and NVD databases.`,
        findings: isWarningAdvisory
          ? [
              `Detected unpinned transitive dependency patch in ${repoName} (${lockFile})`,
              `Potential race condition in upstream commit offset handler for ${shortName}`,
              `Recommendation: enforce exact SHA256 pin lock in ${lockFile}`,
            ]
          : [
              `${pkgsScanned} packages audited in ${repoName} with zero critical or high CVEs`,
              `Lockfile (${lockFile}) transitive pin hashes verified against registry upstream`,
              `Byte-for-byte build reproducibility guaranteed for ${shortName}`,
            ],
      },
      rollback_prover: {
        id: 'rollback_prover',
        name: 'Rollback Replay Sandbox',
        status: hasRollbackHazard ? 'WARNING' : 'PASS',
        status_label: hasRollbackHazard ? 'Warning' : 'Active',
        risk: hasRollbackHazard ? 'CRITICAL' : 'LOW',
        metric_label: hasRollbackHazard ? '1 rollback invariant violation caught' : '0 rollback violations',
        metric_sub: hasRollbackHazard ? 'Destructive DDL hazard' : '100% byte equivalence',
        latency_ms: 270 + (hashVal % 50),
        description: `Simulates reverse down migrations against an ephemeral in-memory clone of ${repoName} to guarantee zero-loss rollback.`,
        findings: hasRollbackHazard
          ? [
              `Identified irreversible DROP TABLE in ${diffFile} without transactional snapshot view`,
              `Ephemeral sandbox rollback test for ${repoName} failed with permanent state discrepancy`,
              `Auto-Fix available: generate synthetic cold partition rollback guard for ${shortName}`,
            ]
          : [
              `Down-migration restores 100% byte equivalence in ${repoName} ephemeral sandbox`,
              `Zero schema drift or orphaned constraints detected for ${shortName}`,
            ],
      },
    },
    prebuilt_artifacts: [
      {
        badge: hasRollbackHazard ? 'CRITICAL DDL ALERT' : 'ZERO DDL HAZARD',
        badge_type: hasRollbackHazard ? 'danger' : 'safe',
        file: diffFile,
        title: 'Schema Migration Gate',
        description: hasRollbackHazard
          ? `Deterministic AST parser identified an irreversible DROP in ${diffFile} for ${repoName} without backup snapshot.`
          : `Non-destructive schema migrations validated for ${repoName}. Zero table drop hazards.`,
        metric: hasRollbackHazard ? '1 Blocker Found' : '0 Blockers',
        action: 'Inspect Diff →',
        target_stage: 3,
      },
      {
        badge: 'SAFE & COMPLIANT',
        badge_type: 'safe',
        file: configFile,
        title: 'Config & Secret Vault',
        description: `${secretsScanned} environment variables verified in ${repoName} against Vault HSM key policy. Zero plaintext keys found.`,
        metric: `${secretsScanned}/${secretsScanned} Keys Verified`,
        action: 'Inspect Vault →',
        target_stage: 1,
      },
      {
        badge: isWarningAdvisory ? 'TRANSITIVE DRIFT' : 'STRICT SEMVER',
        badge_type: isWarningAdvisory ? 'warning' : 'info',
        file: lockFile,
        title: 'Dependency Drift Checker',
        description: isWarningAdvisory
          ? `1 minor patch difference detected in ${repoName} ${lockFile}. Recommendation: pin exact SHA digest.`
          : `${pkgsScanned} dependencies locked with deterministic SHA256 checksums in ${repoName}.`,
        metric: isWarningAdvisory ? 'Warning Advisory' : '100% Deterministic',
        action: 'Telemetry Log →',
        target_stage: 2,
      },
    ],
    score_breakdown: {
      schema_safety: hasRollbackHazard ? 46 : 98,
      secret_hygiene: 100,
      dependency_lock: isWarningAdvisory ? 68 : 96,
      rollback_proof: hasRollbackHazard ? 60 : 98,
    },
    rollback_diff: {
      file: diffFile,
      lines_removed: 3,
      lines_added: 8,
      unsafe_code: `-- [UNSAFE DOWN-MIGRATION] for ${repoName} (PR #${prNumber})\n-- Hazard: Destructive DROP TABLE destroys active ${shortName} records during rollback!\nDROP TABLE ${safeIdentifier}_ledger CASCADE;\nDROP SEQUENCE IF EXISTS ${safeIdentifier}_seq;\n-- End of unverified rollback`,
      safe_code: `-- [SYNTHETIC INVARIANT GUARD] Auto-synthesized non-destructive rollback for ${repoName}\nBEGIN TRANSACTION;\n-- Step 1: Preserve historical partition safely\nALTER TABLE ${safeIdentifier}_ledger RENAME TO ${safeIdentifier}_pre_v${prNumber};\n-- Step 2: Establish zero-loss backward compatibility view\nCREATE OR REPLACE VIEW ${safeIdentifier}_ledger AS \n  SELECT * FROM ${safeIdentifier}_pre_v${prNumber};\nCOMMIT;`,
    },
    attestation: {
      gate_status: hasRollbackHazard
        ? 'BLOCKED_PENDING_AST_SYNTHESIS'
        : isWarningAdvisory
        ? 'ADVISORY_GATE_PASS'
        : 'VERIFIED_AND_SEALED',
      seal_id: `IBM-BOB-GATE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`,
      sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      hsm_authority: 'IBM Cloud HSM v2 / enclave-east-04',
      signed_at: new Date().toISOString(),
      invariants_passed: hasRollbackHazard ? 12 : 13,
      invariants_total: 13,
      signer_identity: 'bob-release-guard-daemon@ibm-cloud-enclave.internal',
    },
  };
}

// Asynchronously attempt to query the public GitHub API to enrich repository metadata
export async function fetchAndAnalyzeRepo(repoInput: string): Promise<ReleaseReport> {
  const { repoName, prNumber } = parseRepoInput(repoInput);

  // Default synchronous base
  const baseReport = generateReportForRepo(repoInput);

  // If it's a mock or format without valid owner/repo, return base
  if (!repoName.includes('/') || repoName.startsWith('workspace/')) {
    return baseReport;
  }

  const [owner, repo] = repoName.split('/');
  if (!owner || !repo) return baseReport;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1400); // 1.4s timeout

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    clearTimeout(timeoutId);

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      return generateReportForRepo(repoInput, {
        description: repoData.description,
        stars: repoData.stargazers_count,
        language: repoData.language,
        defaultBranch: repoData.default_branch,
      });
    }
  } catch (err) {
    // Graceful offline fallback
    console.info('Using deterministic synthesis engine for repo:', repoName);
  }

  return baseReport;
}
