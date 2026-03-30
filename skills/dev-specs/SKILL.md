---
name: dev-specs
description: "(Tech Lead) Promote validated Design Doc into feature-scoped specs (requirements/use-cases/acceptance-criteria) and record promotion run artifacts."
disable-model-invocation: true
argument-hint: "<feature_id> [--design_doc canonical|<path>] [--validate_run latest|<folder>] [--ingest_run latest|<folder>]"
---

# Dev Specs Skill

## Role/Owner
- Owner role: Tech Lead
- Handoff: produces canonical `specs/<feature_id>/` specs for Coder + Tester

## Goal
Turn validated design artifacts into feature-scoped canonical specs:
- `specs/<feature_id>/requirements.md`
- `specs/<feature_id>/use-cases.md`
- `specs/<feature_id>/acceptance-criteria.md`
(and optionally `specs/<feature_id>/data-contracts.md`, `specs/<feature_id>/observability.md` if explicitly present in design doc)

## Inputs
- feature_id (required)
- design_doc (default: canonical)
- validate_run (optional, default: latest)
- ingest_run (optional, default: latest)

## Pre-flight (run before reasoning)

1. `python tools/scaffold_run.py <feature_id> dev_specs`
   Creates the run folder + `input.md`. Note the printed path.
2. `python tools/next_id.py REQ <feature_id>` → note next REQ number
3. `python tools/next_id.py UC <feature_id>` → note next UC number
4. `python tools/next_id.py AC <feature_id>` → note next AC number

Use these as the starting IDs when assigning REQ/UC/AC in the promoted specs.

## Reads
- `docs/design-docs/<feature_id>/design-doc.md` (default)
- `docs/runs/<feature_id>/<validate_run>/validation-report.md` (if provided)
- `docs/runs/<feature_id>/<ingest_run>/ingest-summary.md` (if provided)

### Memory reads (if available — do NOT fail if missing)
- If `memory/patterns.md` exists, read active patterns relevant to promotion. Apply learnings proactively.
- If `memory/mistakes.md` exists, read active mistakes relevant to promotion. Avoid repeating them.

## Writes (canonical)
- Create or overwrite feature-scoped spec files in:
  - `specs/<feature_id>/requirements.md`
  - `specs/<feature_id>/use-cases.md`
  - `specs/<feature_id>/acceptance-criteria.md`

## Writes (run log)
- `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_dev_specs/`
  - `input.md`
  - `output.md` (summary of changes + pasted new spec sections)
  - `notes.md`
  - `diffs.patch` (optional but recommended)

## Promotion rules
- Each feature writes to its own `specs/<feature_id>/` folder — safe to overwrite, no conflict with other features.
- IDs:
  - REQ: `REQ-<feature_id>-01..`
  - UC:  `UC-<feature_id>-01..`
  - AC:  `AC-<feature_id>-01..`
- Every AC must be testable (Given/When/Then).
- Any unverified statement must remain as Assumption or Open Question (do NOT promote as Fact).

## Completion criteria
- `specs/<feature_id>/` contains all three spec files
- AC list complete enough to write test cases
- Run artifacts saved
