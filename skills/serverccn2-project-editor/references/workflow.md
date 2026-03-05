# ServerCCN2 Project Editor — Workflow

## Overview

This skill manages the serverccn2 project through a **design-first, document-driven** workflow.
All changes follow the pipeline: **Analyze → Document → Approve → Implement → Verify**.

---

## Workflow Phases

### Phase 1: Scan & Understand

```
scan_server
```

Claude will:
- Read project configuration (`CLAUDE.md`, `build.gradle.kts`)
- Analyze source structure (798 Kotlin files across 8 packages)
- Inventory all 15 modules in `CCN2ModuleInitializer`
- Compare configs across 7 deploy environments
- Catalog 30+ resource JSON files
- Identify architecture patterns and inconsistencies

**Output:** Structured summary saved to memory.

### Phase 2: Design & Document

```
edit_server_idea "<idea description>"
generate_server_tech_doc
```

Claude will:
- Analyze feature impact on modules, DB, config, network
- Cross-reference with GDD for rule consistency
- Evaluate security, performance, concurrency risks
- Draft technical documentation

**Output:**
- Feature impact analysis
- Updated `TechnicalArchitectureDocument.md` (if needed)
- Updated `document/GameDesignDocument.md` (if game rules change)

### Phase 3: Configure & Manage

```
manage_config
```

Claude will:
- Edit `server.properties` preserving format and comments
- Create new environments from templates
- Audit configs for production readiness
- Detect single-point-of-failure risks
- Validate `dao_type`, `db_prefix_key`, timeouts

**Output:**
- Config changes with diffs
- Audit report with severity levels
- New environment directories (if creating)

### Phase 4: Implement

```
generate_server_code
```

Prerequisites: Feature documented in GDD/Tech Doc.

Claude will:
- Follow Module pattern (Module.kt + RequestHandler + EventListener)
- Follow Actor model for game room logic
- Register new configs in `GameCfg.kt`
- Add DB tables via Exposed ORM
- Generate tests

**Output:** Implementation files with test coverage.

### Phase 5: Verify & Validate

```
validate_result               # Auto-runs after every command
check_server_consistency      # GDD ↔ Code ↔ Config matrix
review_deploy                 # Deploy readiness checklist
```

Claude will:
- **Auto-validate** the preceding command's output (see `references/validation.md`)
- Run automated checks: build, tests, config validation, counts
- Run spot-checks: 3 random items from output verified against actual codebase
- Build GDD ↔ Code ↔ Config consistency matrix
- Run config audit for target environment
- Generate deploy checklist
- Verify cross-project sync (MSerializer.js, ItemGroup.json)
- Generate **Validation Report** with severity-classified results

**Decision rules:**
- All PASS → proceed, save to memory
- WARNING only → proceed with caveats noted to user
- Any CRITICAL → stop, fix, re-validate before proceeding
- Multiple CRITICAL → re-run entire command from scratch

**Output:** Validation report + consistency report + deploy checklist.

---

## Pipeline Examples

### New Feature
```
edit_server_idea → update_gdd → generate_server_tech_doc → generate_server_code → validate_result → check_server_consistency
```

### New Environment
```
scan_server → validate_result → manage_config (create) → validate_result → manage_config (audit) → review_deploy
```

### Config Change
```
manage_config (edit) → validate_result → manage_config (audit) → validate_result
```

### Pre-Deploy
```
scan_server → validate_result → check_server_consistency → validate_result → manage_config (audit) → review_deploy
```

### Refactoring
```
scan_server → validate_result → refactor_server → validate_result → check_server_consistency
```

> **Note:** `validate_result` runs automatically after each command.
> In pipelines above it's shown explicitly for clarity, but in practice
> it triggers without user intervention.

---

## Key Files Modified by This Skill

| Action | Files |
|--------|-------|
| New module | `CCN2ModuleInitializer.kt`, `modules/{name}/*.kt`, `CmdDefine.kt` |
| New config | `config/{name}/*.kt`, `GameCfg.kt`, `res/{Name}.json` |
| New DB table | `sql/*.kt` or `modules/{name}/sql/*.kt`, `SqlVersioning.kt` |
| New packet | Packet class + KSP → `MSerializer.js` (auto-generated) |
| New environment | `configByMode/{name}/config/*`, `build.gradle.kts` (deploy task) |
| Config edit | `configByMode/{env}/config/server.properties` |
| GDD update | `document/GameDesignDocument.md` |
| Tech doc | `TechnicalArchitectureDocument.md` |

---

## Cross-Project Dependencies

Server changes that trigger client updates:
1. **Packet changes** → Run `./gradlew run` → regenerates `clientccn2/src/common/MSerializer.js`
2. **ItemGroup changes** → Run `./gradlew generateItemGroup` → regenerates `clientccn2/res/config/ItemGroup.json`
3. **Resource JSON changes** → May need manual sync to `clientccn2/res/config/`
4. **Game rule changes** → Client game logic must match server validation
