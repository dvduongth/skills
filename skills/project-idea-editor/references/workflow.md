# Project Idea Editor — Workflow

## Overview

This skill manages the game project through a **design-first, document-driven** workflow.
All changes follow: **Analyze → Document → Approve → Implement → Verify & Validate**.
Cross-project awareness is critical — changes often span both client and server.

---

## Workflow Phases

### Phase 1: Scan & Understand

```
scan_project
```

Claude will:
- Read project conventions (`CLAUDE.md`)
- Analyze both client and server source structures
- Inventory modules, actions, events, configs on both sides
- Identify design patterns and architecture
- Detect inconsistencies and gaps

**Output:** Structured summary saved to memory.

### Phase 2: Design & Document

```
edit_idea "<idea description>"
generate_tech_doc
update_gdd
```

Claude will:
- Analyze feature impact on game balance, tech feasibility, UX
- Cross-reference with GDD for rule consistency
- Evaluate cross-project impact (client + server)
- Draft/update technical documentation and GDD

**Output:**
- Feature impact analysis
- Updated `documents/TechnicalArchitectureDocument.md` (if architecture changes)
- Updated `documents/GameDesignDocument.md` (if game rules change)

### Phase 3: Implement

```
generate_code_from_design
```

Prerequisites: Feature documented in GDD/Tech Doc.

Claude will:
- Follow client patterns (BaseAction, BaseModule, EventBus, JSB compat)
- Follow server patterns (Module, Actor model, GameCfg, Exposed ORM)
- Generate code on both sides if needed
- Create tests (Jest for client, Kotlin for server)

**Output:** Implementation files with test coverage.

### Phase 4: Verify & Validate

```
validate_result               # Auto-runs after every command
check_design_consistency      # GDD ↔ Tech Doc ↔ Client ↔ Server matrix
```

Claude will:
- **Auto-validate** the preceding command's output (see `references/validation.md`)
- Run automated checks: lint/build, JSB compat, tests (both client + server)
- Run spot-checks: 3 random items from output verified against actual codebase
- Build GDD ↔ Tech Doc ↔ Client ↔ Server consistency matrix
- Verify cross-project sync (MSerializer.js, ItemGroup.json)
- Generate **Validation Report** with severity-classified results

**Decision rules:**
- All PASS → proceed, save to memory
- WARNING only → proceed with caveats noted to user
- Any CRITICAL → stop, fix, re-validate before proceeding
- Multiple CRITICAL → re-run entire command from scratch

**Output:** Validation report + consistency matrix.

### Phase 5: Refactor (ongoing)

```
refactor_codebase
```

Behavior-preserving refactoring with design consistency verification.

---

## Pipeline Examples

### New Game Feature (e.g., new card effect)
```
edit_idea → update_gdd → generate_code_from_design → validate_result → check_design_consistency
```

### Architecture Change
```
scan_project → validate_result → edit_idea → generate_tech_doc → generate_code_from_design → validate_result
```

### GDD Update Only
```
edit_idea → update_gdd → validate_result → check_design_consistency → validate_result
```

### Design Consistency Audit
```
scan_project → validate_result → check_design_consistency → validate_result
```

### Codebase Refactoring
```
scan_project → validate_result → refactor_codebase → validate_result → check_design_consistency
```

> **Note:** `validate_result` runs automatically after each command.
> In pipelines above it's shown explicitly for clarity, but in practice
> it triggers without user intervention.

---

## Key Files Modified by This Skill

| Action | Files |
|--------|-------|
| GDD update | `documents/GameDesignDocument.md` |
| Tech doc | `documents/TechnicalArchitectureDocument.md` |
| Client action | `clientccn2/src/modules/game/logic/action/Action{Name}.js`, `ActionType.js`, `EventKeys.js` |
| Client module | `clientccn2/src/modules/{name}/`, `BootSetup.js` |
| Server module | `serverccn2/src/main/kotlin/org/ccn2/modules/{name}/`, `CCN2ModuleInitializer.kt` |
| Server ability | `serverccn2/src/main/kotlin/org/ccn2/abilities/` |
| Server config | `serverccn2/src/main/kotlin/org/ccn2/config/`, `GameCfg.kt`, `res/{Name}.json` |
| Cross-project | `MSerializer.js` (auto-generated), `ItemGroup.json` (auto-generated) |

---

## Cross-Project Dependencies

Changes that trigger cross-project updates:
1. **Packet changes** → Server `./gradlew run` → regenerates `clientccn2/src/common/MSerializer.js`
2. **ItemGroup changes** → `./gradlew generateItemGroup` → regenerates `clientccn2/res/config/ItemGroup.json`
3. **Config JSON changes** → May need manual sync between `serverccn2/res/` and `clientccn2/res/config/`
4. **Game rule changes** → Both client and server must agree on validation
