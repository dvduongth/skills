---
name: dev-implement
description: "(Implementation Orchestrator) Execute tasks.md by dispatching subagents per milestone — parallel where possible, sequential where dependent. Review per milestone, escalate blockers."
disable-model-invocation: true
argument-hint: "<feature_id> [--milestone <M0|M1|...>] [--task <TASK-NNN>]"
---

# Dev Implement Skill

## Intent Layer

| Field | Content |
|-------|---------|
| **Role** | Implementation Orchestrator |
| **Goal** | Execute confirmed `tasks.md` by dispatching subagents per task, organized by milestone. Produce working code that satisfies all mapped ACs. |
| **Use when** | `plans/<feature_id>/tasks.md` exists AND user has confirmed task breakdown (FIXED GATE at STATE-6 passed) |
| **Constraints** | Do NOT modify specs, design docs, or task definitions. If a design gap is found during implementation, log it as `DESIGN_GAP` in progress.md and continue if non-blocking. Do NOT skip milestones — execute in order (M0→M1→M2...). |
| **Anti-patterns** | Implementing all tasks in a single agent context (will overflow); skipping review gates; modifying tasks.md during execution; implementing without reading relevant ACs |
| **Quality standard** | Every task must pass Orchestrator review (95/100 threshold). Every milestone must pass integration review. All mapped ACs must be covered. |
| **Output format** | Vietnamese status updates; English code comments and commit messages |

---

## Knowledge Layer

**Required reads (before execution):**
- `plans/<feature_id>/tasks.md` — the task breakdown to execute
- `specs/<feature_id>/acceptance-criteria.md` — AC mapping for each task
- `specs/<feature_id>/requirements.md` — requirement context
- `specs/<feature_id>/use-cases.md` — use case context
- `docs/design-docs/<feature_id>/design-doc.md` — design decisions

**Optional reads:**
- `docs/runs/<feature_id>/*_analyze/analysis-report.md` — architecture analysis
- `docs/dev/<feature_id>/INDEX.md` — diagram index
- `docs/runs/<feature_id>/pipeline-state.json` — verify STATE-6

---

## Execution Layer

### Pre-flight

1. `python tools/scaffold_run.py <feature_id> implement`
   Creates run folder + `input.md`. Note the path.
2. Verify `plans/<feature_id>/tasks.md` exists. If not → error: "No tasks.md found. Run /dev_tasks first."
3. Verify `specs/<feature_id>/acceptance-criteria.md` exists. If not → error: "No specs found. Run /dev_specs first."
4. If `--milestone` flag → filter to that milestone only.
5. If `--task` flag → execute that single task only (useful for retries).

### Phase 1 — Parse tasks.md

1. Extract all milestones (M0, M1, M2, ...) with their tasks.
2. For each task extract: ID, description, milestone, `depends_on` list, mapped ACs.
3. Build dependency DAG per milestone.
4. Initialize `progress.md`:
   ```markdown
   # Implementation Progress — <feature_id>
   
   ## Overall: 0/N tasks complete (0%)
   
   ### M0 <name> ⏳ (0/K)
   - [ ] TASK-001: <description> — QUEUED
   - [ ] TASK-002: <description> — QUEUED
   ...
   ```

### Phase 2 — Execute milestones (sequential)

For each milestone in order (M0 → M1 → M2 → ...):

#### Step 2a: Identify executable tasks

From the dependency DAG for this milestone:
- Tasks with NO unfinished dependencies → mark as READY
- Tasks with unfinished dependencies → mark as BLOCKED

#### Step 2b: Dispatch READY tasks

For each READY task, build a **context packet**:
```
1. Task description (from tasks.md)
2. Mapped ACs (filtered from acceptance-criteria.md)
3. Related requirements (filtered from requirements.md — match REQ IDs in ACs)
4. Related design doc sections (match keywords from task description)
5. Existing code context (if task modifies existing files — read them first)
```

**Dispatch strategy:**
- Tasks with NO shared file dependencies → spawn as parallel subagents (use `isolation: "worktree"` if available)
- Tasks that touch the same files → run sequentially

**Each subagent prompt:**
```
You are implementing a single task for feature <feature_id>.

## Task
<task description from tasks.md>

## Acceptance Criteria to satisfy
<filtered ACs>

## Requirements context
<filtered requirements>

## Design context
<relevant design doc sections>

## Existing code
<file contents if modifying existing files>

## Instructions
1. Use /orchestrator skill to implement this task
2. Follow all project conventions (CLAUDE.md)
3. Ensure all mapped ACs are testable
4. Run gitnexus_impact before modifying any existing symbol
```

#### Step 2c: Collect results

For each completed task:
- Record: status (DONE/FAIL), review score, changed files, blockers
- Update `progress.md` with result

#### Step 2d: Handle failures

| Result | Action |
|--------|--------|
| Review score ≥ 95/100 | PASS — mark task DONE |
| Review score < 95/100, retries < 3 | Re-dispatch with reviewer feedback |
| Review score < 95/100, retries ≥ 3 | Mark ESCALATED, log in progress.md, continue other tasks |
| Task discovers design gap | Log `DESIGN_GAP` in progress.md; if non-blocking continue, if blocking pause milestone |
| Subagent crash/timeout | Mark FAILED, log error, continue other tasks |

#### Step 2e: Milestone merge + integration review

After all tasks in milestone complete (or escalated):
1. If parallel worktrees were used:
   - Merge branches sequentially in dependency order
   - If merge conflict → attempt auto-resolve
   - If auto-resolve fails → pause, ask human
2. Run integration review for milestone:
   - Verify all milestone ACs pass
   - Verify no regressions from previous milestones
3. Write `milestone-M{N}-report.md`:
   ```markdown
   # Milestone M{N} Report — <feature_id>
   
   ## Tasks: K/K complete
   | Task | Status | Review Score | Files Changed |
   |------|--------|-------------|---------------|
   | TASK-001 | DONE | 97/100 | 3 files |
   
   ## AC Coverage
   | AC | Status | Verified by |
   |----|--------|------------|
   | AC-001 | PASS | TASK-001 |
   
   ## Issues
   - (none) or list of DESIGN_GAPs, escalated tasks
   ```

### Phase 3 — Finalize

After all milestones complete:

1. Write `implementation-summary.md`:
   ```markdown
   # Implementation Summary — <feature_id>
   
   ## Result: N/N tasks complete, M/M ACs covered
   
   ## Files Changed
   | File | Action | Task |
   |------|--------|------|
   | path/to/file.gd | Created | TASK-001 |
   
   ## Milestones
   | Milestone | Tasks | Status |
   |-----------|-------|--------|
   | M0 | 3/3 | ✅ |
   
   ## Blockers / Escalations
   - (list any unresolved items)
   
   ## DESIGN_GAPs Found
   - (list any design gaps discovered during implementation)
   ```

2. Update `progress.md` with final status.

3. Print summary:
   ```
   ✅ Implementation complete for <feature_id>
      Tasks: N/N complete
      ACs: M/M covered
      Files changed: X (Y new, Z modified)
      Blockers: K unresolved
      Output: docs/runs/<feature_id>/<ts>_implement/
   ```

### Post-flight

If any tasks are ESCALATED or DESIGN_GAPs are blocking:
```
⚠️ Implementation completed with issues:
   - N tasks escalated (need human review)
   - M design gaps found (may need spec updates)
   
   Review progress.md for details.
```
