---
name: dev-tasks
description: "(Tech Lead) Break architecture into granular implementation tasks mapped to ACs. Requires user-confirmed analyze + design results before generating."
disable-model-invocation: true
argument-hint: "<feature_id>"
---

# Dev Tasks Skill

## Role boundary (CRITICAL)

This skill is **Task decomposition only**. Your job is to read confirmed architecture artifacts and break them into implementable tasks — NOT to analyze architecture (that is `dev-analyze`'s job), NOT to implement code (that is `dev-implement`'s job).

## Role/Owner

- Owner role: Tech Lead / Planner
- Primary agent: Task Planner
- Depends on: confirmed `dev-analyze` outputs (analysis-report + diagrams)
- Handoff: outputs → `dev-implement` (future), `dev-unittest` (future)

## Goal

Produce a comprehensive task breakdown (`tasks.md`) where every task maps to ≥1 AC, with milestones, dependencies, and implementation order.

## When to use

Use this after the user has **confirmed** the results of `/dev_analyze` (which covers both analysis and diagrams). Do NOT run this before user confirmation — the `dev-plan` orchestrator handles the confirmation gate.

## Inputs

- **feature_id** (required): `NNN-slug`

## Pre-flight (run before reasoning)

1. `python tools/scaffold_run.py <feature_id> dev_tasks`
   Creates the run folder + `input.md`. Note the printed path.
2. `python tools/mkdir.py plans/<feature_id>`
   Ensure plans folder exists.
3. `python tools/next_id.py TASK <feature_id>` → note next TASK number.

## Required reads

- Latest `docs/runs/<feature_id>/<latest>_dev_analyze/analysis-report.md` (includes File Map)
- `docs/dev/<feature_id>/INDEX.md` (diagram index — for understanding module/class structure)
- `specs/<feature_id>/acceptance-criteria.md`
- `specs/<feature_id>/requirements.md`
- `docs/design-docs/<feature_id>/design-doc.md`

### Diagram reads (use INDEX.md to find relevant diagrams)

Read diagrams from `docs/dev/<feature_id>/` that are relevant to task decomposition — especially class diagrams and sequence diagrams. Do NOT read all diagrams blindly; use INDEX.md keywords to select relevant ones.

### Optional reads

- `templates/task-template.md` (if exists — for task format reference)

### Memory reads (if available — do NOT fail if missing)

- If `memory/patterns.md` exists, read active patterns relevant to task planning.
- If `memory/mistakes.md` exists, read active mistakes relevant to task decomposition. Avoid repeating them.

## Output locations (MUST follow)

### Canonical output

- `plans/<feature_id>/tasks.md` — full task list with AC mappings

### Run artifacts (append-only)

- `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_dev_tasks/`
  - `input.md` (auto-created by scaffold)
  - `output.md` — task list summary + AC coverage matrix
  - `notes.md`

## Task format (MUST follow for each task)

```markdown
### TASK-<feature_id>-NNN: <title>

- **Maps to AC:** [AC-xxx-xx, AC-xxx-xx, ...]
- **Type:** code | test | design | config
- **Dependencies:** [TASK-xxx-xx, ...] or "none"
- **Module:** <module name from analysis-report>
- **Files (expected):** <file paths based on project structure from analysis>
- **DoD:** <definition of done — specific, testable, 1-3 sentences>
```

## `tasks.md` structure (MUST follow)

### 1) Overview

- Feature name, total tasks, total ACs covered
- Link to analysis-report and INDEX.md

### 2) Milestones

Group tasks into milestones by dependency layer:

- **M0: Skeleton** — create ALL files from File Map with empty stubs (no implementation body). DoD: project compiles, all imports resolve.
- **M1: Foundation** — data models, configs, shared types (no game logic, no UI)
- **M2: Core Logic** — game mechanics, pure logic per component cluster (no UI/rendering); TDD: tests written before implementation
- **M3: UI/Rendering** — visual components, screens, animations; one task per component cluster
- **M4: Integration & Polish** — wiring logic to UI, E2E testing, spam/validation edge cases

**M0 rule (CRITICAL):** M0 must be a single task group that creates ALL skeleton files at once. The skeleton includes: files, empty class/function stubs, and imports — but NO logic bodies whatsoever. This ensures the codebase compiles from day 1 and every subsequent task is a pure implementation step.

**Component cluster rule (M2–M3):** group related modules into a cluster (e.g., `ActionQueue + ActionPlayer` = one cluster). Each cluster = one task group, implemented in dependency order from analysis-report.

Milestone boundaries should align with natural review gates.

### 3) Task List

Tasks listed under their milestone, in dependency order.

### 4) Dependency Graph

Text-based graph showing task → task dependencies. Flag critical path.

### 5) AC Coverage Matrix

Table format:

| AC ID | Task(s) | Status |
|-------|---------|--------|
| AC-xxx-01 | TASK-xxx-001, TASK-xxx-005 | Covered |
| AC-xxx-02 | TASK-xxx-003 | Covered |
| ... | ... | ... |

**CRITICAL:** Every AC must appear in this matrix with ≥1 task. If any AC is uncovered, create a task for it before completing.

### 6) Implementation Order

Ordered list of tasks respecting dependencies. This is the recommended execution sequence.

## Task granularity guidelines

- Each task should be completable in a single focused session
- A task should touch ≤3 files (prefer fewer)
- If a task maps to >5 ACs, consider splitting it
- If a task has >3 dependencies, consider if intermediate tasks are needed
- Pure logic tasks (no UI) should be separate from UI tasks — enables TDD

## `output.md` content requirements

- Total tasks generated
- Milestones with task counts
- AC coverage: X/Y ACs covered (must be Y/Y)
- Critical path summary
- Any ACs that were hard to decompose (with notes)

## `notes.md` content requirements

- Task generation approach and assumptions
- Any ACs that required interpretation (with reasoning)
- Recommended next step: `/dev_unittest <feature_id>` or `/dev_implement <feature_id>`

## Completion criteria

- `plans/<feature_id>/tasks.md` is complete with all 6 sections
- AC Coverage = 100% (every AC has ≥1 task)
- No circular dependencies
- Tasks are granular enough to implement independently
- Critical path is identified
- Run artifacts saved under correct path
