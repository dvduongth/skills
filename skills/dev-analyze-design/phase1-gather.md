# Phase 1 — Gather (Detail)

> Full instructions for Phase 1 of dev-analyze-design. Read this file at the start of Phase 1.

## Required Reads

Read all of the following before proceeding to Phase 2:

- `specs/<feature_id>/requirements.md`
- `specs/<feature_id>/use-cases.md`
- `specs/<feature_id>/acceptance-criteria.md`
- `docs/design-docs/<feature_id>/design-doc.md`

## Tech-Requirements Handling

Read in this order and merge (feature-specific overrides global):

1. `docs/dev/tech-requirements.md` — global, shared across all features
2. `docs/dev/<feature_id>/tech-requirements.md` — feature override (skip silently if not found)

**If global `docs/dev/tech-requirements.md` does NOT exist:**
- Use `AskUserQuestion` to gather: engine/framework, language, platform, client-server architecture style, anti-spam/validation policy
- Write `docs/dev/tech-requirements.md` with the gathered answers
- Always include the two mandatory principles below (add even if user does not mention them)

**If feature-specific `docs/dev/<feature_id>/tech-requirements.md` does NOT exist:**
- Skip silently. Only create it if the user explicitly requests feature-level overrides.

## Mandatory Principles (always enforce — add to tech-requirements if missing)

```markdown
## Principles (Mandatory)

### Divide & Conquer
- Each module has a single, well-defined responsibility
- Modules communicate via explicit interfaces — no hidden coupling
- If a module has >3 responsibilities, split it before proceeding

### Test-Driven Development (TDD)
- Every module must have its test surface defined before implementation begins
- Tests are written before implementation code
- Test surface = list of behaviors/functions to test, not implementation details
```

## input.md Content for Phase 1

Record in the run's `input.md`:
- `feature_id`
- `scope` (both / client / server)
- Spec paths read
- Tech-requirements source: `global` / `feature-specific` / `newly created`
- Existing diagrams found: yes / no
- Diagram plan: clusters identified, HIGH file count planned, DETAIL file count planned
  *(filled in after Phase 2 analysis — update input.md before the checkpoint)*
