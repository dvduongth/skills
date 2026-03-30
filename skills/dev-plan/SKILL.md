---
name: dev-plan
description: "(Tech Lead) Smart entry-point for dev workflow: auto-detects pipeline state, runs missing steps (analyze → tasks). Requires user confirmation before generating tasks."
disable-model-invocation: true
argument-hint: "<feature_id>"
---

# Dev Plan Skill (Orchestrator)

## Role boundary (CRITICAL)

This skill is an **orchestrator only** — it detects pipeline state and delegates to child skills (`dev-analyze-design`, `dev-tasks`). It does NOT perform analysis, diagram generation, or task decomposition itself. It MUST use AskUserQuestion to confirm architecture before generating tasks.

## Role/Owner

- Owner role: Tech Lead
- Primary agent: Pipeline Orchestrator
- Depends on: promoted specs at `specs/<feature_id>/`
- Orchestrates: `dev-analyze-design` → `dev-tasks`

## Goal

Smart entry-point that auto-detects the current dev pipeline state for a feature and runs only the missing steps to produce implementation tasks.

## When to use

Use this after `/dev_specs` has promoted canonical specs for the feature. This is the recommended entry point for the dev workflow — it handles state detection and step ordering automatically.

## Inputs

- **feature_id** (required): `NNN-slug`

## Required inputs (ask if missing)

- **feature_id**: required. If not provided, ask the user.

## Phase 1 — Detect pipeline state (highest first)

Check in this order, stop at the first match:

### STATE-2 — Tasks already exist

- Check: `plans/<feature_id>/tasks.md` exists
- If yes → report:

```
Tasks already exist at plans/<feature_id>/tasks.md. Nothing to do.
To regenerate, run directly: /dev_tasks <feature_id>
```

- Stop.

### STATE-1 — Analysis + diagrams done (no tasks yet)

- Check: find the newest folder under `docs/runs/<feature_id>/` whose name ends with `_dev_analyze`; confirm `analysis-report.md` exists inside it.
- AND: `docs/dev/<feature_id>/INDEX.md` exists (diagrams were generated)
- If both found → START_STATE = 1 → Phase 2

### STATE-0 — Nothing exists (or analysis exists but diagrams missing)

- None of the above matched → START_STATE = 0 → Phase 2

## Phase 2 — Run pipeline from START_STATE

Always report the plan before starting:

```
Will run: [step1] → [step2] → ...
```

If any step fails → stop immediately, report the error, point to the run folder, suggest next action.

---

### STATE-0 (full pipeline)

```
Will run: analyze (analysis + diagrams) → [user confirm] → tasks
```

1. Invoke skill `dev-analyze-design` with feature_id
   - Note: `dev-analyze-design` has its own Phase 2 checkpoint (analysis → diagram confirmation)
2. **GATE: AskUserQuestion** — present architecture summary and ask user to confirm before proceeding to tasks (see Phase 3)
3. Invoke skill `dev-tasks` with feature_id

---

### STATE-1 (analysis + diagrams exist, start at tasks)

```
Analysis + diagrams found. Will run: [user confirm] → tasks
```

1. **GATE: AskUserQuestion** — confirm existing artifacts (see Phase 3)
2. Invoke skill `dev-tasks` with feature_id

---

## Phase 3 — User confirmation gate (CRITICAL)

After analyze is complete (or found existing), you MUST ask the user to confirm before generating tasks.

Use **AskUserQuestion** with:

- Summary of architecture (key modules, tech stack, diagram count)
- Links to key artifacts:
  - `docs/dev/<feature_id>/INDEX.md`
  - `docs/runs/<feature_id>/<latest>_dev_analyze/analysis-report.md`
  - `docs/dev/<feature_id>/` folder (diagrams)
- Question: "Architecture looks good — proceed to generate tasks?"
- Options:
  - "Yes, generate tasks" → proceed to dev-tasks
  - "No, I want to review/modify first" → stop, suggest user reviews artifacts and re-runs `/dev_plan` or `/dev_tasks` when ready

If user says no → stop gracefully. Report what was completed and where artifacts are.

## Phase 4 — Completion report

After all steps complete, print to terminal (do NOT write to file):

```
=== /dev_plan complete ===
Feature:       <feature_id>
Steps run:     <list of steps actually executed>
Steps skipped: <list of steps skipped with reason>

Outputs:
  docs/runs/<feature_id>/<ts>_dev_analyze/analysis-report.md
  docs/dev/<feature_id>/INDEX.md
  docs/dev/<feature_id>/ (diagrams)
  plans/<feature_id>/tasks.md

Next steps:
  - Review tasks at plans/<feature_id>/tasks.md
  - /dev_unittest <feature_id>    ← generate test cases (future)
  - /dev_implement <feature_id>   ← start implementation (future)
```

## Outputs (must write files)

This command writes no files directly — all outputs are written by the delegated skills per their own contracts.

## Completion criteria

- Pipeline state correctly detected
- Missing steps executed in order
- User confirmation obtained before task generation
- Completion report printed
- No steps beyond dev_tasks were triggered automatically
