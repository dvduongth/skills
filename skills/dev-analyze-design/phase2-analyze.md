# Phase 2 — Analyze (Detail)

> Full instructions for Phase 2 of dev-analyze-design. Read this file before writing analysis-report.md.

## Output

Write to: `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_<run>/analysis-report.md`

## Required Sections (all 9 must be present)

### 1) Tech Stack Summary
- Engine / framework
- Language
- Platform constraints (from REQ specs)
- Key libraries / dependencies (if known)
- Tech-requirements source: `global` / `feature-specific` / `newly created`

### 2) Project Structure
- Client folder tree
- Server folder tree
- Shared types / contracts location

### 3) Module Breakdown

For each module:
- **Module name** + scope tag: `[CLIENT]` / `[SERVER]` / `[SHARED]`
- **Responsibility** (1–2 sentences, single responsibility only)
- **Maps to ACs**: [AC-xxx-01, ...]
- **Key interfaces** (public API surface — names + signatures with full types, no bodies)
- **Data structures** (REQUIRED — list every non-trivial data structure used internally):
  - Use precise generic types: `Map<sessionId: string, timer: NodeJS.Timer>`, `ElementType[]` (FIFO), `Set<tileId: number>`
  - Do NOT use bare `object`, `any`, or untyped `Array`
  - Document cardinality: `1:N`, `keyed by X`, `ordered / unordered`
  - Example: `queue: ElementType[] — FIFO, max 8 elements; timers: Map<string, NodeJS.Timer> — keyed by sessionId`
- **Test surface** (list of behaviors/functions to test — derived from ACs and responsibility)
- **Dependencies** (other modules this depends on)
- **Diagram cluster** (which HIGH-level group this module belongs to — drives Phase 3 DETAIL files):
  e.g., `battle`, `inventory`, `ui`, `network`

**Divide & Conquer check:** if any module has >3 responsibilities → split before continuing.

**Cluster planning note:** After listing all modules, summarize:
```
Clusters identified: battle (3 modules), inventory (2 modules), network (1 module)
→ Phase 3 DETAIL files: class-battle.md, class-inventory.md, class-network.md
```

### 4) File Map

Table listing every file that will be created:

| File | Module | Scope | Public API signatures |
|------|--------|-------|----------------------|
| `server/src/battle/BattleManager.ts` | BattleManager | SERVER | `processTurn(action: PlayerAction): TurnResult` · `validateAction(action: PlayerAction): ValidationResult` |
| `client/src/queue/ActionQueue.ts` | ActionQueue | CLIENT | `enqueue(action: Action): void` · `dequeue(): Action\|null` · `playNext(): Promise<void>` |

This table drives Group 0 (Skeleton) in `dev-tasks`.

### 5) Dependency Graph
- Text-based module → module graph
- Critical path (longest dependency chain)
- Flag any circular dependencies — must be resolved before Phase 3

### 6) Architectural Decisions

For each decision:
- **Decision**, **Rationale**, **Alternatives considered**, **Status**: `[EXISTING]` or `[NEW]`

### 7) Integration Analysis *(only if existing diagrams found)*
- Compatibility summary
- Additions proposed
- Conflicts (if any)

### 8) Risk Areas
- Technical risks derived from specs (complexity, ambiguity, performance, spam/validation edge cases)
- Each risk: description + suggested mitigation

### 9) Open Questions
- Questions needing user input before diagrams can proceed
- Each: what + why it matters + options if known

## Existing Architecture Handling

- Mark preserved decisions as `[EXISTING]`, new ones as `[NEW]`
- If conflict with existing decisions → create a **Conflicts** section with options (keep / replace / hybrid) and use `AskUserQuestion` before proceeding

## notes.md Content for Phase 2

Record in the run's `notes.md`:
- Key architectural decisions made (not deferred)
- Tech-requirements status (found / created)
- Checkpoint outcome (proceeded / stopped)
- Open questions still unresolved
