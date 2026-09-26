---
name: release-readiness-check
description: Use when the user wants to run a release readiness check, check if it is safe to deploy, or validate changes before pushing to production. Runs 4 parallel subagents to detect schema, config, dependency, and rollback risks, then presents a Human Approval Gate before any rollback action.
---

# Release Readiness Check Workflow

You are the **Release Readiness Orchestrator**. When this skill is activated, execute the following
steps in order. Do not skip any step. Show your progress clearly at each step.

---

## Step 1 — Detect Changed Files

Run the following command to detect all files changed since the last commit:

```bash
git diff --name-only HEAD~1 HEAD
```

If the repo has only one commit, use:

```bash
git diff --name-only HEAD
```

Also run:

```bash
git log --oneline -5
```

Display the list of changed files and the recent commit log so the user can see what is being analysed.

---

## Step 2 — Spawn 4 Parallel Subagents

Spawn all four subagents at the same time (in the same turn) using `spawn_subagent`. Each subagent
is independent — do not wait for one before spawning the others. Pass the list of changed files from
Step 1 into each subagent's description as context.

### Subagent 1 — 🔍 Schema/Migration Agent

Spawn with this description (replace `{changed_files}` with the actual list):

```
You are the Schema/Migration Agent for a Release Readiness Check.

Changed files in this release: {changed_files}

Your task:
1. Read every changed file that relates to database schema: migrations/, models/, *.sql, sequelize model files, any JSON schema files.
2. For every change, check:
   - Were any column names RENAMED? (e.g. `email` renamed to `emailAddress` is a BREAKING change)
   - Were any columns DROPPED or made NOT NULL without a default?
   - Were any foreign keys added or removed without a migration?
   - Were any indexes removed that queries depend on?
3. Return ONLY a JSON object in this exact format:
{
  "agent": "schema",
  "riskLevel": "HIGH",
  "findings": [
    { "file": "<filename>", "change": "<what changed>", "impact": "<production impact>" }
  ],
  "recommendation": "<what to do>"
}
Use riskLevel HIGH if any column was renamed, dropped, or if a migration is missing. Use MEDIUM for additive-only changes. Use LOW or NONE if no schema files changed.
```

### Subagent 2 — ⚙️ Config/Env Agent

Spawn with this description:

```
You are the Config/Env Agent for a Release Readiness Check.

Changed files in this release: {changed_files}

Your task:
1. Read changed files related to configuration: .env.example, config/, any file that reads process.env or os.environ.
2. Check:
   - Are any NEW environment variables used in code but missing from .env.example?
   - Were any existing variable names RENAMED?
   - Were any required variables REMOVED from .env.example but still referenced in code?
   - Are any hardcoded secrets or credentials present that should be env vars?
3. Return ONLY a JSON object in this exact format:
{
  "agent": "config",
  "riskLevel": "HIGH",
  "findings": [
    { "variable": "<name>", "status": "missing|renamed|removed|hardcoded", "usedIn": "<file>" }
  ],
  "recommendation": "<what to do>"
}
Use riskLevel HIGH if a required variable is missing or renamed. MEDIUM if additive only. LOW/NONE if no config changed.
```

### Subagent 3 — 📦 Dependency Agent

Spawn with this description:

```
You are the Dependency Agent for a Release Readiness Check.

Changed files in this release: {changed_files}

Your task:
1. Read changed dependency files: package.json, package-lock.json, requirements.txt, Gemfile, go.mod, pom.xml.
2. For every changed dependency, check:
   - Was any package upgraded by a MAJOR version (e.g. 1.x → 2.x)?
   - Were any NEW packages added that are unvetted or unusual?
   - Were any SECURITY-CRITICAL packages changed (express, sequelize, jsonwebtoken, bcrypt)?
   - Were any packages REMOVED that are still imported in code?
3. Return ONLY a JSON object in this exact format:
{
  "agent": "dependency",
  "riskLevel": "HIGH",
  "findings": [
    { "package": "<name>", "from": "<old version>", "to": "<new version>", "risk": "<description>" }
  ],
  "recommendation": "<what to do>"
}
Use HIGH for major version bumps on critical packages. MEDIUM for minor/patch on critical packages. LOW/NONE if nothing security-relevant changed.
```

### Subagent 4 — 🔄 Rollback Agent

Spawn this subagent AFTER the Schema Agent returns its result (it may be spawned concurrently
with Config and Dependency agents, but it needs the schema result to identify which migration
to roll back).

Before spawning, extract the breaking migration filename from the Schema Agent result:
- Scan `schema.findings` for any finding where `change` mentions a column RENAME or DROP.
- The `file` field of that finding contains the migration filename to roll back.
- If no such finding exists (no breaking migration), set `{breaking_migration}` to "NONE".
- If multiple breaking migrations exist, pass them all as a comma-separated list.

Spawn with this description (replace ALL placeholders with actual values):

```
You are the Rollback Agent for a Release Readiness Check.

Changed files in this release: {changed_files}
Breaking migration(s) identified by the Schema Agent: {breaking_migration}

Your task is to PROVE rollback safety by executing the down-migration against a real, isolated
Neon database branch — not by generating a script, not by reverting git commits. Every step below
must be an actual executed command with its real output captured. If any step cannot be executed,
STOP and report exactly what is missing instead of simulating success.

If {breaking_migration} is "NONE", skip to Phase 5 and return:
{
  "agent": "rollback",
  "rollbackSafe": true,
  "lastSafeCommit": "<from git log --oneline -5>",
  "rollbackCommand": "No rollback needed — no breaking migrations detected",
  "reason": "Schema Agent found no column renames, drops, or irreversible changes.",
  "branchProof": null
}

---

### PHASE 0 — Preflight checks

Run each check and record the result before proceeding.

**Check A — neonctl availability**
Execute:
  neonctl --version

If the command fails (not found / non-zero exit), skip to the REST API fallback in Phase 1B.
Record: neonctl_available = true | false

**Check B — NEON_API_KEY**
Execute (PowerShell):
  if ($env:NEON_API_KEY) { "NEON_API_KEY is set" } else { "NEON_API_KEY is NOT set — STOP" }

If NEON_API_KEY is not set, also check:
  Get-Content target-app/.env -ErrorAction SilentlyContinue | Select-String "NEON_API_KEY"

If NEON_API_KEY cannot be found in the environment or in target-app/.env, STOP and return:
{
  "agent": "rollback",
  "rollbackSafe": false,
  "lastSafeCommit": null,
  "rollbackCommand": "MANUAL INTERVENTION REQUIRED",
  "reason": "BLOCKED: NEON_API_KEY is not set. Set it as an environment variable or add it to target-app/.env, then re-run.",
  "branchProof": null
}

**Check C — NEON_PROJECT_ID**
Execute (PowerShell):
  if ($env:NEON_PROJECT_ID) { "NEON_PROJECT_ID is set" } else { "NEON_PROJECT_ID is NOT set" }

Also check:
  Get-Content target-app/.env -ErrorAction SilentlyContinue | Select-String "NEON_PROJECT_ID"

If not found in either place, STOP with the same BLOCKED JSON (update reason to mention NEON_PROJECT_ID).

**Check D — DEV_DATABASE_URL**
Execute (PowerShell — MUST NOT print the value):
  $val = $env:DEV_DATABASE_URL
  if (-not $val) { $val = (Get-Content target-app/.env -ErrorAction SilentlyContinue | Select-String "^DEV_DATABASE_URL=").ToString() -replace '^DEV_DATABASE_URL=','' }
  if ($val) { "DEV_DATABASE_URL is present (value hidden)" } else { "DEV_DATABASE_URL NOT FOUND — STOP" }

If DEV_DATABASE_URL is missing, STOP with the same BLOCKED JSON.

Record all preflight results. Only continue if all three (NEON_API_KEY, NEON_PROJECT_ID,
DEV_DATABASE_URL) are available.

---

### PHASE 1 — Create an isolated Neon branch

Generate a timestamp-based branch name:
  $branchName = "rollback-test-$(Get-Date -Format 'yyyyMMddHHmmss')"

**Phase 1A — Use neonctl (if neonctl_available = true)**

Execute:
  neonctl branches create --project-id $env:NEON_PROJECT_ID --name $branchName --output json

Capture the full JSON output. Extract:
  - branch.id   → $branchId
  - branch.name → confirm it matches $branchName

Then get the connection string for the branch:
  neonctl connection-string $branchName --project-id $env:NEON_PROJECT_ID --role-name neondb_owner --database-name neondb

Capture the connection string as $BRANCH_DATABASE_URL.
MUST NOT print or log the raw connection string value — log "branch connection string captured (value hidden)" instead.

**Phase 1B — REST API fallback (if neonctl not available)**

Execute this PowerShell block (replace PROJECT_ID and BRANCH_NAME with real values):

  $headers = @{ "Authorization" = "Bearer $env:NEON_API_KEY"; "Content-Type" = "application/json" }
  $projectId = $env:NEON_PROJECT_ID
  $body = @{ branch = @{ name = $branchName }; endpoints = @(@{ type = "read_write" }) } | ConvertTo-Json -Depth 4
  $resp = Invoke-RestMethod -Uri "https://console.neon.tech/api/v2/projects/$projectId/branches" -Method POST -Headers $headers -Body $body
  $resp | ConvertTo-Json -Depth 6

Capture:
  - $branchId   = $resp.branch.id
  - $endpointId = $resp.endpoints[0].id
  - $endpointHost = $resp.endpoints[0].host

Then construct the branch connection string:
  $BRANCH_DATABASE_URL = $env:DEV_DATABASE_URL -replace 'ep-[a-z0-9-]+\.', "$endpointHost."

MUST NOT print or log the raw $BRANCH_DATABASE_URL value — log
"branch connection string constructed from endpoint host (value hidden)" instead.

Record: branch created = true, branchId = $branchId, branchName = $branchName

---

### PHASE 2 — Run the down-migration on the branch

The breaking migration(s) to roll back: {breaking_migration}

First, read the migration file(s) to confirm the down() function exists and understand what it
reverses. The file path is:
  target-app/src/database/migrations/{breaking_migration}

Extract the basename only (filename without path) for the sequelize-cli --name flag.

Execute the down-migration by running sequelize-cli against the branch connection string.
Set DEV_DATABASE_URL to the branch URL for this command only (restore it immediately after):

  $DEV_DATABASE_URL_ORIGINAL = $env:DEV_DATABASE_URL
  $env:DEV_DATABASE_URL = $BRANCH_DATABASE_URL
  cd target-app
  npx sequelize-cli db:migrate:undo --name "{migration_basename}" 2>&1
  $env:DEV_DATABASE_URL = $DEV_DATABASE_URL_ORIGINAL

Where {migration_basename} is the filename only (e.g. "20260926082116-rename-email-to-emailAddress.js").

If there are multiple breaking migrations, run db:migrate:undo for each one in reverse order
(most recent first — highest timestamp first).

Capture the full stdout/stderr output. A success exit looks like:
  "== {migration_basename}: reverting ======="
  "== {migration_basename}: reverted (Xs)"

Record: migration_down_exit_code, migration_down_output (full text)

---

### PHASE 3 — Verify the rollback against the branch

Execute a verification query against the branch using psql or the pg npm client.

**Option A — psql available**
  $env:PGPASSWORD = "<extract password from $BRANCH_DATABASE_URL>"
  psql $BRANCH_DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='Users' ORDER BY ordinal_position;" 2>&1

**Option B — psql not available (use Node.js + pg)**
Write and execute an inline Node.js script:

  node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.ROLLBACK_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  client.connect()
    .then(() => client.query(\"SELECT column_name FROM information_schema.columns WHERE table_name='Users' ORDER BY ordinal_position\"))
    .then(r => { console.log(JSON.stringify(r.rows)); client.end(); })
    .catch(e => { console.error('QUERY FAILED:', e.message); process.exit(1); });
  " 2>&1

Capture the raw output as $verificationOutput.

Evaluate:
  - PASS if the output contains "email" AND does NOT contain "emailAddress"
  - FAIL otherwise

Record: verification_output = $verificationOutput, verdict = "PASS" | "FAIL"

---

### PHASE 4 — Clean up the Neon branch

**Phase 4A — neonctl**
  neonctl branches delete $branchId --project-id $env:NEON_PROJECT_ID 2>&1

**Phase 4B — REST API fallback**
  Invoke-RestMethod -Uri "https://console.neon.tech/api/v2/projects/$projectId/branches/$branchId" -Method DELETE -Headers $headers 2>&1

Record: branch_deleted = true | false (with output)
If deletion fails, record the error and note that the branch must be deleted manually from
https://console.neon.tech — it does NOT affect the main database but should be cleaned up.

---

### PHASE 5 — Return JSON result

Also run: git log --oneline -5

Return ONLY a JSON object in this exact format:

{
  "agent": "rollback",
  "rollbackSafe": true,
  "lastSafeCommit": "<commit hash from git log --oneline -5>",
  "rollbackCommand": "npx sequelize-cli db:migrate:undo --name {migration_basename}",
  "migrationRolledBack": "{breaking_migration}",
  "reason": "<plain English summary of what was executed and what was proven>",
  "branchProof": {
    "branchName": "<the rollback-test-TIMESTAMP branch name>",
    "branchId": "<Neon branch ID>",
    "migrationDownOutput": "<full stdout/stderr from sequelize-cli undo>",
    "verificationQuery": "<the exact SELECT query run against information_schema.columns>",
    "verificationOutput": "<raw rows returned by the query>",
    "verdict": "PASS",
    "branchDeleted": true
  }
}

Set rollbackSafe to false if:
  - Any preflight check failed (BLOCKED)
  - The migration undo command exited non-zero
  - The verification query returned "emailAddress" or did not return "email"
  - The branch could not be created

Set verdict to "FAIL" and rollbackSafe to false if the column is not confirmed as "email"
after the down-migration runs.
```

Wait for all four subagents to return their JSON results before continuing.

---

Also update the SKILL.md output writer: after Step 6, write a machine-readable JSON summary
to `bob_sessions/report.json` using this exact structure (fill in real values):

```json
{
  "generatedAt": "<ISO timestamp>",
  "commit": "<HEAD commit hash>",
  "branch": "<git branch name>",
  "score": <number>,
  "status": "BLOCKED" | "SAFE",
  "agents": {
    "schema":     { "riskLevel": "<HIGH|MEDIUM|LOW|NONE>", "findings": [...] },
    "config":     { "riskLevel": "<HIGH|MEDIUM|LOW|NONE>", "findings": [...] },
    "dependency": { "riskLevel": "<HIGH|MEDIUM|LOW|NONE>", "findings": [...] },
    "rollback":   {
      "rollbackSafe": <bool>,
      "verdict": "<PASS|FAIL|N/A>",
      "migrationRolledBack": "<filename or NONE>",
      "branchName": "<branch name or null>",
      "executionMethod": "automated" | "hybrid-manual" | "blocked"
    }
  },
  "blockers": ["<plain English description of each blocking issue>"],
  "requiredFixes": ["<plain English fix description>"]
}
```

Write this file using `write_file` to `bob_sessions/report.json`. This allows the dashboard
to load live data from this file when served locally.

---

## Step 3 — Aggregate Results & Calculate Risk Score

Once all four subagents have returned their results, display a consolidated table:

| Agent | Risk Level | Key Finding |
|---|---|---|
| 🔍 Schema/Migration | `{schema.riskLevel}` | `{schema.findings[0].change}` |
| ⚙️ Config/Env | `{config.riskLevel}` | `{config.findings[0].variable}` |
| 📦 Dependency | `{dependency.riskLevel}` | `{dependency.findings[0].package}` |
| 🔄 Rollback | Safe: `{rollback.rollbackSafe}` · Verdict: `{rollback.branchProof.verdict ?? "N/A"}` | `{rollback.reason}` |

Then calculate the **Release Readiness Score**:
- Start at 100
- Subtract 40 for each HIGH risk finding
- Subtract 20 for each MEDIUM risk finding
- Subtract 5 for each LOW risk finding
- Minimum score is 0

Display: `Release Readiness Score: XX / 100`

---

## Step 4 — Human Approval Gate

**If the Release Readiness Score is below 70 OR any agent reported HIGH risk:**

Use `ask_followup_question` to stop and ask the user:

> **⚠️ High Risk Detected — Human Approval Required**
>
> One or more agents flagged a HIGH risk in this release:
> - [list the HIGH findings here]
>
> The recommended action is: **[rollback.rollbackCommand]**
>
> Do you approve executing the rollback?

Offer two choices:
- `"Yes — execute the rollback now"`
- `"No — I will handle this manually, cancel the workflow"`

If the user selects **No**, print a summary of all risks and stop. Do not execute anything.

If the score is 70 or above AND no HIGH risks, skip this gate and proceed to Step 5 directly.

---

## Step 5 — Execute Rollback (only if approved in Step 4)

If the user approved the rollback in Step 4, the Rollback Agent's `branchProof` already contains
the real execution proof from the isolated Neon branch. Take the following actions:

1. Display the full `branchProof` block to the user — including `migrationDownOutput`,
   `verificationOutput`, `verdict`, and `branchDeleted`.
2. If `branchProof.verdict` is **PASS**, proceed to execute the down-migration against the
   **main** database (DEV_DATABASE_URL). Use `rollback.migrationRolledBack` for the filename —
   do NOT hardcode it. Run this command using `execute_command`:

   ```
   cd target-app && npx sequelize-cli db:migrate:undo --name "{rollback.migrationRolledBack}"
   ```

   Show the full command output. The main database connection is already configured via
   `target-app/.env` / DEV_DATABASE_URL — do NOT override it.

3. If `branchProof.verdict` is **FAIL** or `branchProof` is null, do NOT touch the main database.
   Report the failure details and stop.

After a successful main-database undo, run:

```bash
git log --oneline -3
```

Confirm the HEAD commit and note that only the database migration was undone — no git revert was
performed unless the user explicitly requests one.

---

## Step 6 — Final Release Readiness Report

Print the final report in this format:

```
╔══════════════════════════════════════════════╗
║       RELEASE READINESS REPORT               ║
╠══════════════════════════════════════════════╣
║  Score:      XX / 100                        ║
║  Status:     ✅ SAFE TO DEPLOY  /  🚫 BLOCKED ║
╠══════════════════════════════════════════════╣
║  SCHEMA:     HIGH/MEDIUM/LOW/NONE            ║
║  CONFIG:     HIGH/MEDIUM/LOW/NONE            ║
║  DEPENDENCY: HIGH/MEDIUM/LOW/NONE            ║
║  ROLLBACK:   SAFE / UNSAFE                   ║
╠══════════════════════════════════════════════╣
║  Action Taken: [deployed / rolled back /     ║
║                 manual review required]      ║
╚══════════════════════════════════════════════╝
```
