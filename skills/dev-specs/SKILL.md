---
name: dev-specs
description: "(Tech Lead) Promote validated Design Doc into feature-scoped specs (requirements/use-cases/acceptance-criteria) and record promotion run artifacts."
disable-model-invocation: true
argument-hint: "<feature_id> [--design_doc canonical|<path>] [--validate_run latest|<folder>] [--ingest_run latest|<folder>]"
---

# Dev Specs Skill

## Intent Layer

| Field | Content |
|-------|---------|
| **Role** | Tech Lead |
| **Goal** | Promote validated design artifacts into feature-scoped canonical specs: requirements, use-cases, and acceptance-criteria |
| **Use when** | Design doc exists and `/design_validate` has passed (validation-report present), or user explicitly skips validation |
| **Constraints** | IDs must be assigned using `next_id.py` tool — never hardcoded; every AC must use Given/When/Then format; unverified statements must remain as Assumptions or Open Questions, never promoted as facts; spec files must live under `specs/<feature_id>/` only |
| **Anti-patterns** | Writing ACs that are not testable; promoting assumptions as requirements; hardcoding REQ/UC/AC numbers; creating spec files outside `specs/<feature_id>/`; skipping run artifact saves |
| **Quality standard** | A Coder can implement and a Tester can write test cases using only the spec files — without reading the design doc |
| **Output format** | `specs/<feature_id>/requirements.md` + `use-cases.md` + `acceptance-criteria.md` + (optional) `data-contracts.md` + `observability.md` if explicitly present in design doc + run artifacts under `docs/runs/<feature_id>/<run_path>/` |

---

## Knowledge Layer

**Required reads (before execution):**
- `docs/design-docs/<feature_id>/design-doc.md` — primary input (required)
- `docs/runs/<feature_id>/<validate_run>/validation-report.md` — flags open issues (optional, default: latest)
- `docs/runs/<feature_id>/<ingest_run>/ingest-summary.md` — raw source context (optional, default: latest)

**Prerequisites:**
- `/design_validate` must have passed (validation-report exists), or user explicitly skips
- `python tools/scaffold_run.py` and `python tools/next_id.py` must be available

**Related skills:**
- Predecessor: `design-validate` (step 3)
- Successor: `dev-analyze-design` (step 5)

**Key constraints (from CLAUDE.md):**
- Every AC must map to ≥1 test case — traceability is non-negotiable
- No scope drift: only promote what is present in the design doc
- Use `python tools/mkdir.py` if directories need creating — never bash `mkdir`

---

## Execution Layer

1. **Scaffold run:**
   ```
   python tools/scaffold_run.py <feature_id> dev_specs
   ```
   Note the printed run path — used for all artifact writes in step 7.

2. **Get next IDs:**
   ```
   python tools/next_id.py REQ <feature_id>   → starting REQ number
   python tools/next_id.py UC  <feature_id>   → starting UC number
   python tools/next_id.py AC  <feature_id>   → starting AC number
   ```
   Use these as the first IDs when writing specs below.

3. **Read inputs** — see Knowledge Layer. Skip missing optional files silently.

4. **Write `specs/<feature_id>/requirements.md`**
   - ID format: `REQ-<feature_id>-01`, `REQ-<feature_id>-02`, …
   - Each requirement traces back to a section in the design doc
   - One requirement per distinct need — no bundling

5. **Write `specs/<feature_id>/use-cases.md`**
   - ID format: `UC-<feature_id>-01`, `UC-<feature_id>-02`, …
   - Each UC references ≥1 REQ ID

6. **Write `specs/<feature_id>/acceptance-criteria.md`**
   - ID format: `AC-<feature_id>-01`, `AC-<feature_id>-02`, …
   - Every AC: Given / When / Then format, fully testable
   - Each AC links to its parent UC
   - Unverified statements → `> **Assumption:** ...` or `> **Open Question:** ...` block, never promoted as AC

6b. **If design doc includes data contracts or observability specs:**
   - Write `specs/<feature_id>/data-contracts.md` — DTOs, API contracts, event schemas
   - Write `specs/<feature_id>/observability.md` — metrics, logging requirements, alerts
   - Only create these files if explicitly present in the design doc

7. **Save run artifacts** to `docs/runs/<feature_id>/<run_path>/`:
   - `input.md` — feature_id, paths read, validate/ingest run references
   - `output.md` — summary of changes + pasted new spec sections
   - `notes.md` — open questions, deferred items, next recommended step
   - `diffs.patch` — optional but recommended

## Completion Criteria

- `specs/<feature_id>/` contains all three core spec files
- AC list is complete enough to write test cases without reading the design doc
- Every AC is in Given/When/Then format and testable
- No assumption or open question is promoted as a fact
- Optional spec files (data-contracts, observability) created only when design doc includes them
- Run artifacts saved to correct path
