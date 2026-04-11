# Phase 0 — Resolve Output Targets (Detail)

> Full instructions for Phase 0 of dev-analyze-design. Read this file BEFORE Phase 1.
> This phase ensures scope and output paths are resolved from config, never inferred from code.

## Hard Rule

> **Agent MUST NEVER infer scope from existing code in the repo.**
> Scope comes from exactly 2 sources:
> 1. `docs/dev/project-paths.md` config file
> 2. User flag `--client-only` / `--server-only`
>
> If neither source is available → **escalate to user. Do NOT guess.**

## Step 1: Check for Already-Resolved Targets

Check if the run's `input.md` already contains a `## Resolved Targets` block.

- **YES** (e.g., invoked from `feature_pipeline` which already resolved) → **skip Phase 0 entirely**, use existing resolved targets, proceed to Phase 1.
- **NO** → continue to Step 2.

## Step 2: Read Config

Read `docs/dev/project-paths.md`.

- **FOUND** → parse the Output Targets table and Default Scope section. Continue to Step 3.
- **NOT FOUND or MISSING required sections** → continue to Step 4 (Escalation).

## Step 3: Determine Scope

1. Check if user passed `--client-only` or `--server-only` flag:
   - `--client-only` → scope = `client`
   - `--server-only` → scope = `server`
   - No flag → use Default Scope from config (typically `fullstack`)

2. Write the Resolved Targets block to the run's `input.md`:

```
## Resolved Targets (from Phase 0)
- scope: <resolved scope>
- output_targets:
  - client: <client path from config>
  - server: <server path from config>
- legacy_refs:
  - <each legacy path from config> (reference only)
- resolved_from: docs/dev/project-paths.md
```

3. Proceed to Phase 1.

## Step 4: Escalation (Config Missing)

If `docs/dev/project-paths.md` does not exist or is missing required sections:

1. Scan the project for likely output target candidates:
   - Look for directories matching `shared/godot-client/*/` pattern
   - Look for `project.godot`, `build.gradle`, or similar project markers

2. Present findings to user via `AskUserQuestion`:
   ```
   ⚠️ Cannot resolve output targets — docs/dev/project-paths.md not found or incomplete.
   
   Candidates found:
   - <list candidate paths with descriptions>
   
   Please confirm:
   1. Client output path: <best candidate or "?">
   2. Server output path: <best candidate or "?">
   3. Default scope: fullstack / client-only / server-only
   
   Or provide the correct paths.
   ```

3. On user confirmation:
   - Write `docs/dev/project-paths.md` using confirmed values
   - Write Resolved Targets block to `input.md`
   - Proceed to Phase 1

4. On user rejection or no clear answer → **STOP. Do not proceed.**
