---
name: dev-analyze-design
description: "(Architect) Analyze specs + tech-requirements → analysis report + Mermaid diagrams (usecase, sequence, flow, class) separated by client/server/shared. Creates tech-requirements if missing. Supersedes former dev-analyze and dev-design."
disable-model-invocation: true
argument-hint: "<feature_id> [--client-only | --server-only]"
---

# Dev Analyze Design Skill

## Intent Layer

| Field | Content |
|-------|---------|
| **Role** | Architect |
| **Goal** | Analyze specs and tech-requirements → produce `analysis-report.md` + Mermaid diagrams (HIGH + DETAIL) organized by client/server/shared |
| **Use when** | `specs/<feature_id>/` has all 3 files from `/dev_specs` |
| **Constraints** | Do NOT create implementation tasks (that belongs to `dev-tasks`); state diagrams only when trigger conditions are met; existing diagrams must never be modified silently; `mermaid-diagram` skill must be invoked before any diagram is written |
| **Anti-patterns** | Stuffing all content into a single diagram file; creating DETAIL before HIGH; bypassing the checkpoint gate; modifying existing diagrams without user approval; skipping module test surface definition |
| **Quality standard** | A Coder can implement the file skeleton from the File Map; a Tester can define test cases from the Module Breakdown test surfaces; HIGH diagrams are readable without opening any DETAIL file |
| **Output format** | `analysis-report.md` (run artifact) + Mermaid files per output tree + `INDEX.md` (feature + global) |

---

## Knowledge Layer

**Required reads (before execution):**
- `specs/<feature_id>/requirements.md`
- `specs/<feature_id>/use-cases.md`
- `specs/<feature_id>/acceptance-criteria.md`
- `docs/design-docs/<feature_id>/design-doc.md`
- `docs/dev/tech-requirements.md` (global) — create if missing; see phase1-gather.md
- `docs/dev/<feature_id>/tech-requirements.md` (feature override) — skip silently if missing

**Prerequisites:**
- `specs/<feature_id>/` must contain all 3 spec files from `/dev_specs`
- `mermaid-diagram` skill must be invoked before writing any diagram (Phase 3)

**Related skills:**
- Predecessor: `dev-specs` (step 4)
- Successor: `dev-tasks` (step 6)
- Required sub-skill: `mermaid-diagram` (Phase 3)

**Key constraints (from CLAUDE.md):**
- Every module must map to ≥1 AC — traceability is non-negotiable
- TDD: test surface defined per module before implementation begins
- Use `python tools/mkdir.py` — never bash `mkdir`

---

## Execution Layer

### Phase 1 — Gather
> Read `.claude/skills/dev-analyze-design/phase1-gather.md` for full instructions.

1. **Scaffold run:**
   ```
   python tools/scaffold_run.py <feature_id> promote
   ```
   Note the printed run path.

2. **Create output directories:**
   ```
   python tools/mkdir.py docs/dev/<feature_id> docs/dev/<feature_id>/client docs/dev/<feature_id>/server
   ```

3. **Read all required inputs and resolve tech-requirements** — follow phase1-gather.md.

---

### Phase 2 — Analyze
> Read `.claude/skills/dev-analyze-design/phase2-analyze.md` for full analysis-report structure.

4. **Write `analysis-report.md`** to the run folder — all 9 sections per phase2-analyze.md.

5. **CHECKPOINT** — Use `AskUserQuestion` to present:
   - Module count and scope breakdown (client / server / shared)
   - File Map summary (file count per scope)
   - Diagram plan: clusters identified → HIGH files planned → DETAIL files planned
     (e.g., "3 clusters (battle, inventory, network) → 6 HIGH + 5 DETAIL files")
   - Top risk areas
   - Open questions (if any)

   Ask: **"Analysis done — proceed to generate diagrams?"**
   - **Yes** → proceed to Phase 3
   - **No** → stop gracefully; report artifact path; suggest user reviews and re-runs `/dev_analyze_design` or `/dev_tasks` when ready

---

### Phase 3 — Diagram Generation
> Read `.claude/skills/dev-analyze-design/phase3-diagram-types.md` for diagram types and output structure.
> Read `.claude/skills/dev-analyze-design/phase3-diagram-standards.md` when writing each diagram file.

6. **Invoke `mermaid-diagram` skill** (Skill tool) before writing any diagram.

7. **Create diagrams** per output tree and scope flag — follow phase3-diagram-types.md.

8. **Apply standards** to every diagram file — follow phase3-diagram-standards.md.

9. **Write INDEX.md** — feature reading-order index + update global index — follow phase3-diagram-standards.md.

10. **Save run artifacts** — update `input.md` and `notes.md` with checkpoint outcome and diagram plan executed.

## Completion Criteria

- `analysis-report.md` contains all 9 sections (section 7 only if existing diagrams found)
- Every module maps to ≥1 AC and has a test surface defined
- Every module has a Data structures entry (even if: "none beyond primitive types")
- File Map is complete (every module has ≥1 file entry)
- No unresolved circular dependencies in dependency graph
- `architecture.md` created (shared, HIGH) — always required
- State diagrams created if trigger conditions met
- No single-file diagram stuffing — DETAIL files split by functional group
- All DETAIL class diagrams complete (all properties + all methods with full type signatures)
- All HIGH class diagrams show cluster nodes only — no field/method detail
- Every HIGH file has forward links to DETAIL files
- Every DETAIL file has a back-reference to its HIGH file with INDEX item number
- Feature INDEX.md created/overwritten with numbered reading order
- Global INDEX.md updated without losing other features' entries
- Run artifacts saved under correct path
- `notes.md` includes recommended next step
