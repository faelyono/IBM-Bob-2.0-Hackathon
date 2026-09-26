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

Spawn with this description:

```
You are the Rollback Agent for a Release Readiness Check.

Changed files in this release: {changed_files}

Your task:
1. Run: git log --oneline -5  — identify the last known safe commit (the one before current changes).
2. Check if a rollback script exists at target-app/scripts/rollback.sh or a similar path.
3. Determine whether a git rollback would be SAFE (no irreversible data migrations in changed files).
4. Return ONLY a JSON object in this exact format:
{
  "agent": "rollback",
  "rollbackSafe": true,
  "lastSafeCommit": "<commit hash>",
  "rollbackCommand": "bash target-app/scripts/rollback.sh  OR  git revert HEAD  OR  MANUAL INTERVENTION REQUIRED",
  "reason": "<why it is or is not safe>"
}
Set rollbackSafe to false if there are irreversible database migrations in the changed files.
```

Wait for all four subagents to return their JSON results before continuing.

---

## Step 3 — Aggregate Results & Calculate Risk Score

Once all four subagents have returned their results, display a consolidated table:

| Agent | Risk Level | Key Finding |
|---|---|---|
| 🔍 Schema/Migration | `{schema.riskLevel}` | `{schema.findings[0].change}` |
| ⚙️ Config/Env | `{config.riskLevel}` | `{config.findings[0].variable}` |
| 📦 Dependency | `{dependency.riskLevel}` | `{dependency.findings[0].package}` |
| 🔄 Rollback | Safe: `{rollback.rollbackSafe}` | `{rollback.reason}` |

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

If the user approved the rollback in Step 4, execute the rollback command provided by the Rollback
Agent using `execute_command`. Show the command output to the user.

After execution, run:

```bash
git log --oneline -3
```

Confirm the rollback succeeded by showing the new HEAD commit.

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
