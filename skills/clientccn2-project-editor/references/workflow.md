# ClientCCN2 Project Editor — Workflow

## Overview

This skill manages the clientccn2 project through a **design-first, document-driven** workflow.
All changes follow: **Analyze → Document → Approve → Implement → Verify**.
New code ALWAYS uses the new architecture (EventBus, ServiceContainer, BaseScene).

---

## Workflow Phases

### Phase 1: Scan & Understand

```
scan_client
```

Claude will:
- Read `clientccn2/CLAUDE.md` for constraints (no template literals, no ES6 modules, etc.)
- Inventory 25+ modules in `src/modules/`
- Catalog 28 action types in `game/logic/action/`
- Map 45+ events in `EventKeys.js`
- Assess legacy vs new architecture migration status
- Inventory 43+ config JSONs in `res/config/`

**Output:** Structured summary saved to memory.

### Phase 2: Design & Document

```
edit_client_idea "<idea description>"
generate_client_tech_doc
```

Claude will:
- Analyze feature impact on actions, events, modules, UI
- Check JSB compatibility constraints
- Decide: legacy extension or new architecture
- Cross-reference with GDD
- Draft technical documentation

**Output:**
- Feature impact analysis with `[LEGACY]`/`[NEW]`/`[JSB]` badges
- Updated tech documentation

### Phase 3: Implement

```
generate_client_code
manage_actions      # For new game effects
manage_events       # For new events
manage_modules      # For new modules
manage_ui           # For new UI components
manage_configs      # For new config loaders
```

Each follows the pattern:
1. Read existing code for patterns
2. Generate code following conventions
3. JSB compatibility check
4. Run `npm run lint:global` if new globals added
5. Create Jest tests

**Output:** Implementation files with test coverage.

### Phase 4: Verify & Validate

```
validate_result               # Auto-runs after every command
check_client_consistency      # GDD ↔ Code ↔ Config matrix
npm test                      # Test suite
npm run lint                  # Lint check
```

Claude will:
- **Auto-validate** the preceding command's output (see `references/validation.md`)
- Run automated checks: lint, JSB compat, test suite
- Run spot-checks: 3 random items from output verified against actual codebase
- Build GDD ↔ Code ↔ Config consistency matrix
- Verify cross-project sync (MSerializer.js, ItemGroup.json)
- Generate **Validation Report** with severity-classified results

**Decision rules:**
- All PASS → proceed, save to memory
- WARNING only → proceed with caveats noted to user
- Any CRITICAL → stop, fix, re-validate before proceeding
- Multiple CRITICAL → re-run entire command from scratch

**Output:** Validation report + consistency report + test results.

### Phase 5: Migrate (ongoing)

```
refactor_client
```

Legacy → new architecture migration:
- `gv.signalMgr` → `gv.bus`
- `BaseModule.extend({})` → new `BaseModule` with DI
- `BaseGUI` → `BaseScene`
- `gv.*` globals → `AppContext`/`ServiceContainer`

---

## Pipeline Examples

### New Game Effect (e.g., new card action)
```
edit_client_idea → manage_actions → generate_client_code → validate_result → check_client_consistency
```

### New Module (e.g., achievement system)
```
edit_client_idea → manage_modules (create) → manage_events (add keys) → generate_client_code → validate_result
```

### New UI Component
```
manage_ui → generate_client_code → validate_result → npm run lint:global
```

### Event System Audit
```
scan_client → validate_result → manage_events (audit) → validate_result → refactor_client (if needed)
```

### Legacy Migration
```
scan_client → validate_result → refactor_client → validate_result
```

### Config Sync with Server
```
manage_configs (audit) → validate_result → check_client_consistency → validate_result
```

> **Note:** `validate_result` runs automatically after each command.
> In pipelines above it's shown explicitly for clarity, but in practice
> it triggers without user intervention.

---

## Key Files Modified by This Skill

| Action | Files |
|--------|-------|
| New action | `game/logic/action/Action{Name}.js`, `ActionType.js`, `EventKeys.js` |
| New module | `modules/{name}/Module.js`, `modules/{name}/API.js`, `BootSetup.js` |
| New scene | `scenes/{Name}.js` or `modules/{name}/Scene{Name}.js`, `SceneFactory.js` |
| New UI element | `modules/game/ui/{area}/Node{Name}.js`, `GameHUD.js` |
| New config | `modules/config/{Name}Config.js`, `ConfigManager.js`, `res/config/{Name}.json` |
| New event | `events/EventKeys.js` |
| New test | `tests/{mirror-src-path}/{Name}.test.js` |
| Global file added | Run `npm run lint:global` to regenerate ESLint globals |

---

## Cross-Project Dependencies

Client changes that require server coordination:
1. **Packet changes** → Server must update packet class → Run `./gradlew run` → regenerates `MSerializer.js`
2. **Config changes** → May need server `res/*.json` sync
3. **Game rule changes** → Server validates all logic — both must agree
4. **ItemGroup** → Run `./gradlew generateItemGroup` → regenerates `res/config/ItemGroup.json`

---

## Architecture Decision Tree

When adding new code, follow this decision tree:

```
Is this new code?
├── YES → Use new architecture:
│   ├── Events: gv.bus (EventBus)
│   ├── DI: ServiceContainer
│   ├── State: AppContext
│   ├── Module: new BaseModule with transport injection
│   ├── Scene: BaseScene (cc.Layer)
│   └── Boot: Register in BootSetup.js with deps
└── NO (modifying existing) →
    ├── Is it legacy code?
    │   ├── YES → Minimal changes, keep legacy patterns
    │   │   └── Consider: is migration worth it now?
    │   └── NO → Continue with new patterns
    └── Is this a good migration opportunity?
        ├── YES → Migrate to new architecture
        └── NO → Keep as-is, note for future
```
