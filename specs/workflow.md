# Workflows

> This file is the **workflow index** (source-of-truth at process level).
> Execution details live in `.claude/commands/*` and `.claude/skills/*/SKILL.md`.
> Keep this file short; avoid duplicating step-by-step scripts.

## WF-01 — Ingest Sources → Design Doc (Feature-scoped)

### Purpose
Turn scattered sources into a validated Design Doc, then promote to canonical specs for implementation/testing.

### Scope
Per feature (`feature_id = NNN-slug`). Artifacts are stored per-feature to avoid merge conflicts.

### Entry points (commands)
1. `/design_ingest` → skill `design-ingest`
2. `/design_doc` → skill `design-doc`
3. `/design_validate` → skill `design-validate`
4. `/design_evaluate` → skill `design-evaluate`
5. `/design_promote` → skill `design-promote`

### Mode selection
- **`--mode new`** (default): designing a new feature from scratch — full UX/persona/prototype template
- **`--mode existing`**: formalizing an existing system (code archaeology) — streamlined template focused on system behavior, conflicts, and implementation risks

### Role responsibility matrix

| Command | Does | Does NOT |
|---|---|---|
| `design_ingest` | Discover facts, surface conflicts, list open questions | Pre-format as specs, write requirements/use-cases/ACs |
| `design_doc` | Make design decisions, document system behavior | Self-validate, run quality checklists |
| `design_validate` | Independently review for gaps, testability, conflicts | Rewrite the doc, duplicate design_doc work |
| `design_evaluate` | Score mechanics quality (6 dimensions), identify risks | Validate structure, block promotion |
| `design_promote` | Convert design-doc sections into canonical /specs | Add new content not in the design doc |

### Inputs (high-level)
- sources: docs/links/notes/raw text
- constraints: deadline/platform/policy (optional)
- feature_id: required

### Outputs (high-level)
- Run artifacts (append-only): `docs/runs/<feature_id>/<ts>_step1_<action>/...`
- Canonical design doc: `docs/design-docs/<feature_id>/design-doc.md`
- Canonical specs (promoted):
  - `/specs/requirements.md`
  - `/specs/use-cases.md`
  - `/specs/acceptance-criteria.md`

### Artifact value reference

| Artifact | Primary consumer | Keep for |
|---|---|---|
| `source-manifest.md` | Designer, auditor | Traceability — which sources drove decisions |
| `ingest-summary.md` | Designer (→ design_doc), Validator | Facts/conflicts/open questions before design |
| `notes.md` (ingest) | Designer | Next steps, blockers |
| `design-doc.md` (canonical) | Coder, Tester, Validator, Promoter | Single source of design truth |
| `input.md` (design run) | Auditor | Which ingest run + mode was used |
| `notes.md` (design run) | Coder, Validator | Key decisions + deferred questions |
| `validation-report.md` | Designer, Coder | Must-fix list before promotion |
| `mechanics-evaluation.json` | Designer | Quantitative mechanics quality scores |
| `mechanics-evaluation.md` | Designer, Coder | Human-readable evaluation with improvement suggestions |
| `/specs/*.md` (promoted) | Coder, Tester | Canonical testable requirements |

### Gates
- Promote is allowed only when validation is PASS or must-fix issues are explicitly accepted.
- Evaluation (`design_evaluate`) is advisory — it does not block promotion but its report is preserved for traceability.

### Failure handling
- If sources are insufficient: produce ingest package + open questions; do not invent facts.
- If validation FAIL: revise design doc and re-run validation.

---

## WF-02 — Analyze → Design → Tasks → Implement → Test (Feature-scoped)

### Purpose

Turn promoted specs into a working implementation with tests, verified against Acceptance Criteria.

### Scope

Per feature. Requires `specs/<feature_id>/acceptance-criteria.md` to be populated.

### Entry points (commands)

1. `/dev_plan` → skill `dev-plan` (orchestrator: auto-detects state, runs missing steps)
2. `/dev_analyze` → skill `dev-analyze` (architecture analysis)
3. `/dev_design` → skill `dev-design` (technical design diagrams)
4. `/dev_tasks` → skill `dev-tasks` (task breakdown from architecture)

### Planned (not yet implemented)

5. `/dev_unittest` → generate test cases mapped to ACs
6. `/dev_implement` → execute implementation tasks
7. `/dev_code_review` → review implementation against specs
8. `/change_propose` → propose scope changes with impact analysis
9. `/change_apply` → apply approved changes to docs + bump versions

### Pipeline flow

```
/dev_specs (WF-01 output)
    ↓
/dev_plan (orchestrator) ─── /dev_analyze → /dev_design → [user confirm] → /dev_tasks
    ↓
/dev_implement (future)
    ↓
/dev_code_review (future) → FAIL → back to /dev_implement
                           → PASS → done
```

### Role responsibility matrix

| Command | Does | Does NOT |
|---|---|---|
| `dev_analyze` | Read specs, propose architecture, module breakdown, risk analysis | Create diagrams, generate tasks, write code |
| `dev_design` | Create Mermaid diagrams (class, module, sequence, state, flow) | Re-analyze architecture, generate tasks, do UI/UX design |
| `dev_tasks` | Break architecture into granular tasks mapped to ACs | Analyze or design, implement code |
| `dev_plan` | Detect state, orchestrate child skills, gate user confirmation | Perform analysis/design/tasks itself |

### Inputs (high-level)

- Promoted `specs/<feature_id>/acceptance-criteria.md`
- Design doc (for architecture context)
- Existing architecture (if any — preserved, not overwritten)

### Outputs (high-level)

- `docs/runs/<feature_id>/<ts>_dev_analyze/analysis-report.md` — architecture analysis
- `docs/architecture/<feature_id>/architecture-overview.md` — canonical architecture doc
- `docs/assets/dev/<feature_id>_*.md` — Mermaid diagrams (class, module, sequence, state, flow)
- `plans/<feature_id>/tasks.md` — task list with AC mappings (100% coverage)
- `tests/runs/<feature_id>/` — test results (future)

### Artifact value reference

| Artifact | Primary consumer | Keep for |
|---|---|---|
| `analysis-report.md` | Designer, Coder | Architecture decisions, module breakdown, risk areas |
| `architecture-overview.md` | Coder, Tester | Canonical architecture reference |
| Mermaid diagrams | Coder, Reviewer | Visual understanding of system design |
| `tasks.md` | Coder, Tester | Implementation roadmap with AC traceability |

### Gates

- Specs must be promoted to `specs/<feature_id>/` before starting (WF-01 output)
- User must confirm architecture (analyze + design) before task generation
- Every task must map to ≥1 AC ID
- Every test case must map to ≥1 AC ID

### Existing architecture handling

- If architecture exists: integrate without breaking existing decisions
- If conflict detected: present options via AskUserQuestion, get user decision before proceeding
- Never silently override existing architecture

### Failure handling

- If ACs are ambiguous: use `/change_propose` before implementing
- If architecture conflicts: AskUserQuestion with options before proceeding
- If tests fail: diagnose root cause; do not bypass

---

## WF-03 — Self-Improvement Loop (Cross-feature)

### Purpose
Close the feedback loop between workflow outputs and future behavior. Agent learns from past runs to avoid repeating mistakes and reinforce effective patterns.

### Scope
Cross-feature. Memory files persist across features and sessions.

### Entry points (commands)
1. `/reflect` → skill `reflect` — capture insights after any workflow step

### Data flow
```
Any WF-01/WF-02 step completes
    │
    ▼
/reflect <feature_id>  ──▶  memory/insights/<feature_id>_<step>_<date>.md
                        ──▶  memory/patterns.md (if recurring)
                        ──▶  memory/mistakes.md (if applicable)
                        ──▶  memory/quality-trends.md (if evaluation data)
    │
    ▼
Next workflow step reads memory/patterns.md + memory/mistakes.md
    → applies learnings proactively
```

### Memory structure
```
memory/
  insights/           # per-step reflections (append-only)
  patterns.md         # recurring patterns (≥2 observations required)
  mistakes.md         # common mistakes & fixes
  preferences.md      # user workflow preferences
  quality-trends.md   # evaluation scores over time
```

### Integration with existing skills
All WF-01 skills (design-ingest, design-doc, design-validate, design-evaluate, design-promote) read `memory/patterns.md` and `memory/mistakes.md` at startup when available.

### Gates
- Pattern creation requires ≥2 independent observations from different features.
- All memory writes are append-only or update-in-place (never delete previous entries).

### Future extensions (not yet implemented)
- `/retro` — periodic cross-run analysis to surface trends and generate recommendations
- `/skill_optimize` — apply retro findings to improve skill SKILL.md files and templates