# ClientCCN2 Project Editor — Validation Framework

## Overview

Every skill command MUST be validated after execution. This framework defines **what to check**, **how to check**, and **what severity level** each failure represents.

Validation is NOT optional — it runs automatically after each command to ensure correctness before the result is trusted or saved to memory.

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Result is wrong or dangerous — cannot be trusted | Fix immediately, re-run command |
| **WARNING** | Result may be incomplete or slightly off | Flag to user, investigate |
| **INFO** | Minor observation, no action needed | Log for awareness |

---

## Validation by Command

### 1. `scan_client` — Scan Validation

**Goal:** Ensure scan output accurately reflects the current codebase state.

#### Automated Checks

```bash
# Module count: reported vs actual
ls -d clientccn2/src/modules/*/ | wc -l
# Expected: matches scan output module count

# Action type count: reported vs actual (action/ + passive/ + round_event/)
find clientccn2/src/modules/game/logic/action/ -name "Action*.js" ! -name "ActionQueue.js" ! -name "ActionType.js" | wc -l
# Expected: matches scan output action count (spec=28 in action/, plus 9 passive, 7 round_event)

# Event key count: reported vs actual
grep -cE "^\s+[A-Z_]+:" clientccn2/src/events/EventKeys.js
# Expected: matches scan output (45+)

# Config file count
ls clientccn2/res/config/*.json | wc -l
# Expected: matches scan output (43+)

# Legacy vs new ratio
echo "Legacy signalMgr:" && grep -r "gv\.signalMgr" clientccn2/src/ --include="*.js" -l | wc -l
echo "New bus:" && grep -r "gv\.bus" clientccn2/src/ --include="*.js" -l | wc -l
# Expected: ratio matches scan output
```

#### GDD Constants Spot-Check

```bash
# Board tile count must be 44 (GDD §2.1)
grep -r "mainTrack" clientccn2/src/modules/game/logic/board/Board.js | head -3
grep "44" clientccn2/res/config/Board.json | head -3

# Win DIAMOND threshold must be 600 (GDD §4.1)
grep -r "600\|pointOpenGate\|isOpenGate" clientccn2/src/modules/game/logic/Player.js | head -5

# GDD file readable (path must be correct)
[ -f "clientccn2/document/GameDesignDocument.md" ] && echo "GDD FOUND" || echo "GDD NOT FOUND — check path"
```

#### Manual Spot-Checks (pick 3 random items)

- [ ] Pick a random module from scan output → verify it exists at stated path
- [ ] Pick a random action from catalog → verify class name and file match
- [ ] Pick a random event key → verify it exists in EventKeys.js

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Module count mismatch >2 | **CRITICAL** |
| Module count mismatch <=2 | **WARNING** |
| Action count mismatch | **CRITICAL** |
| Event key count mismatch >3 | **WARNING** |
| Legacy ratio off by >10% | **WARNING** |
| Config count mismatch >5 | **WARNING** |
| File path doesn't exist | **CRITICAL** |

---

### 2. `generate_client_tech_doc` — Documentation Validation

**Goal:** Ensure documentation accurately describes the codebase.

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| All 12 sections present | Count section headers in output | **CRITICAL** |
| Boot flow matches `main.js` | Read `main.js`, compare with documented flow | **CRITICAL** |
| File paths cited exist | Glob/Read each cited path (sample 5) | **CRITICAL** |
| Code examples are valid | Check for JSB violations in examples | **WARNING** |
| Architecture labels correct | Verify `[LEGACY]`/`[NEW]` badges match actual code | **WARNING** |
| GDD references accurate | Cross-read GDD sections mentioned | **WARNING** |

#### Required Sections Checklist

```
[ ] 1. Boot Flow (BootGraph + dependency sort)
[ ] 2. Dual Architecture (legacy vs new)
[ ] 3. Domain Model (Game, Board, Token, Player, Tile, Deck)
[ ] 4. Action Queue Pipeline (phases, interrupts, nested actions)
[ ] 5. Event System (EventBus vs SignalMgr vs ClientEventHub)
[ ] 6. Module System (BaseModule + ModuleMgr)
[ ] 7. Scene System (NavigationCoordinator + SceneFactory)
[ ] 8. UI Architecture (BaseScene, BaseGUI, GameHUD, Layer Z-order)
[ ] 9. Network Protocol (Connector + MSerializer)
[ ] 10. Config System (ConfigManager + loaders)
[ ] 11. Asset Pipeline (resource tiers, RefCountedLoader)
[ ] 12. Testing (Jest + cc-mock + setup.js)
```

---

### 3. `edit_client_idea` — Impact Analysis Validation

**Goal:** Ensure the impact analysis is complete and accurate.

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| All 8 impact areas analyzed | Count sections in output | **CRITICAL** |
| Architecture decision stated | Verify `[LEGACY]`/`[NEW]` label present | **CRITICAL** |
| JSB compatibility addressed | Look for `[JSB]` badge | **WARNING** |
| Affected files list provided | Verify paths exist in codebase | **WARNING** |
| Scope estimate (S/M/L) present | Check output | **INFO** |
| GDD cross-reference done | Verify GDD sections cited | **WARNING** |

#### Required Impact Areas

```
[ ] 1. Architecture fit (legacy or new?)
[ ] 2. Action system (new ActionQueue actions?)
[ ] 3. Event system (new EventKeys?)
[ ] 4. UI components (scenes, HUD, popups?)
[ ] 5. Config (new JSON configs?)
[ ] 6. Network (new packet handlers?)
[ ] 7. Cross-project (server changes?)
[ ] 8. JSB compatibility
```

---

### 4. `manage_actions` — Action Validation

**Goal:** Ensure new/modified actions integrate correctly.

#### Automated Checks

```bash
# New action file exists
[ -f "clientccn2/src/modules/game/logic/action/Action{Name}.js" ] && echo "PASS" || echo "FAIL"

# Action registered in ActionType.js
grep "ACTION_{NAME}" clientccn2/src/modules/game/logic/ActionType.js

# Action extends BaseAction
grep "BaseAction.extend" clientccn2/src/modules/game/logic/action/Action{Name}.js

# Has action() method
grep "action:\s*function" clientccn2/src/modules/game/logic/action/Action{Name}.js

# Has doneAction() call
grep "doneAction" clientccn2/src/modules/game/logic/action/Action{Name}.js

# Uses gv.bus.emit (not signalMgr)
grep "gv\.bus\.emit" clientccn2/src/modules/game/logic/action/Action{Name}.js
# Should find at least one
grep "gv\.signalMgr" clientccn2/src/modules/game/logic/action/Action{Name}.js
# Should find NONE

# JSB check
grep -E '`[^`]*\$\{' clientccn2/src/modules/game/logic/action/Action{Name}.js
# Should find NONE

# Test exists
[ -f "clientccn2/tests/modules/game/logic/action/Action{Name}.test.js" ] && echo "PASS" || echo "FAIL"
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| File doesn't exist | **CRITICAL** |
| Not extending BaseAction | **CRITICAL** |
| Missing `action()` method | **CRITICAL** |
| Missing `doneAction()` call | **CRITICAL** |
| Not registered in ActionType.js | **CRITICAL** |
| Uses signalMgr instead of bus | **WARNING** |
| JSB violation found | **CRITICAL** |
| No test file | **WARNING** |

---

### 5. `manage_events` — Event Validation

**Goal:** Ensure event additions/audits are correct.

#### For New Event

```bash
# Key exists in EventKeys.js
grep "NEW_KEY_NAME" clientccn2/src/events/EventKeys.js

# At least one emitter exists
grep -r "gv\.bus\.emit(EventKeys\.NEW_KEY_NAME" clientccn2/src/ --include="*.js"

# At least one listener exists
grep -r "gv\.bus\.on(EventKeys\.NEW_KEY_NAME" clientccn2/src/ --include="*.js"
```

#### For Event Audit

| Check | How | Severity |
|-------|-----|----------|
| Orphan events found? | emitter exists but no listener | **WARNING** |
| Dead listeners found? | listener exists but no emitter | **WARNING** |
| Legacy migration candidates listed? | signalMgr patterns found | **INFO** |
| All EventKeys accounted for? | count emitters vs keys | **WARNING** |

---

### 6. `manage_modules` — Module Validation

**Goal:** Ensure new module follows correct architecture and is properly wired.

#### Automated Checks

```bash
# Module file exists
[ -f "clientccn2/src/modules/{name}/{Name}Module.js" ] && echo "PASS" || echo "FAIL"

# API file exists
[ -f "clientccn2/src/modules/{name}/{Name}API.js" ] && echo "PASS" || echo "FAIL"

# Uses new BaseModule (not BaseModule.extend)
grep "BaseModule.extend" clientccn2/src/modules/{name}/{Name}Module.js
# Should find NONE for new modules

# Registered in BootSetup or ModuleMgr
grep "{Name}" clientccn2/src/framework/core/CoreServices.js || grep "{Name}" clientccn2/main.js

# Uses gv.bus for events
grep "gv\.bus" clientccn2/src/modules/{name}/{Name}Module.js

# JSB check on all module files
grep -rE '`[^`]*\$\{' clientccn2/src/modules/{name}/ --include="*.js"
# Should find NONE

# Lint check
npm run lint -- clientccn2/src/modules/{name}/
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Module file missing | **CRITICAL** |
| Uses legacy BaseModule.extend | **CRITICAL** (for new modules) |
| Not registered in boot system | **CRITICAL** |
| Uses signalMgr in new code | **WARNING** |
| JSB violation | **CRITICAL** |
| Lint errors | **WARNING** |
| No tests | **WARNING** |

---

### 7. `manage_configs` — Config Validation

**Goal:** Ensure config loader and JSON are consistent.

#### Automated Checks

```bash
# Config loader exists
[ -f "clientccn2/src/modules/config/{Name}Config.js" ] && echo "PASS" || echo "FAIL"

# JSON file exists
[ -f "clientccn2/res/config/{Name}.json" ] && echo "PASS" || echo "FAIL"

# JSON is valid
node -e "JSON.parse(require('fs').readFileSync('clientccn2/res/config/{Name}.json'))"

# Registered in ConfigManager
grep "{Name}" clientccn2/src/modules/config/ConfigManager.js

# Loader extends BaseConfig
grep "BaseConfig.extend" clientccn2/src/modules/config/{Name}Config.js
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| JSON file missing | **CRITICAL** |
| JSON parse error | **CRITICAL** |
| Loader file missing | **CRITICAL** |
| Not registered in ConfigManager | **CRITICAL** |
| Not extending BaseConfig | **WARNING** |

---

### 8. `check_client_consistency` — Consistency Validation

**Goal:** Ensure the consistency matrix itself is correct.

#### Meta-Validation (validating the validator)

| Check | How | Severity |
|-------|-----|----------|
| All key rules checked | Verify minimum 10 rules in matrix | **WARNING** |
| GDD values match actual GDD text | Re-read GDD, compare | **CRITICAL** |
| Config values match actual JSON | Re-read JSON, compare | **CRITICAL** |
| Code values match actual source | Re-read source, compare | **CRITICAL** |
| Status labels accurate | Re-verify each OK/MISMATCH | **CRITICAL** |

#### Required Rules in Matrix

```
[ ] Board tiles count (40)
[ ] Win KC threshold (600)
[ ] Safe zones (1, 11, 21, 31)
[ ] KC tiles (5, 10, 15, 20, 25, 30, 35, 40)
[ ] Dice modes (SINGLE/DOUBLE)
[ ] Token count per player (2)
[ ] Max players (4)
[ ] Card hand limits (3 init, 5 max)
[ ] Player.isOpenGate() threshold
[ ] Tile types match GDD
```

---

### 9. `generate_client_code` — Code Generation Validation

**Goal:** Ensure generated code is production-ready.

#### Automated Checks (MANDATORY)

```bash
# 1. Lint passes
npm run lint 2>&1 | tail -5

# 2. Tests pass
npm test 2>&1 | tail -10

# 3. JSB compatibility (no template literals in generated files)
grep -rE '`[^`]*\$\{' clientccn2/src/path/to/new/files/ --include="*.js"
# Must find NOTHING

# 4. No const in loop initializers
grep -E 'for\s*\(\s*const\s' clientccn2/src/path/to/new/files/ --include="*.js" -r
# Must find NOTHING

# 5. No ES6 imports
grep -E '^\s*import\s' clientccn2/src/path/to/new/files/ --include="*.js" -r
# Must find NOTHING

# 6. No arrow functions in extend blocks
grep -E '\w+:\s*\(' clientccn2/src/path/to/new/files/ --include="*.js" -r
# Inspect for arrow functions in .extend({}) — should use function()

# 7. Globals updated if needed
npm run lint:global 2>&1 | tail -5
```

#### Pattern Consistency Check

| Aspect | Verify Against |
|--------|---------------|
| New action | Compare with `ActionGainDiamond.js` structure |
| New module | Compare with newest module in `src/modules/` |
| New config | Compare with `BoardConfig.js` structure |
| New scene | Compare with `BaseScene` subclass in `src/scenes/` |
| New UI node | Compare with similar node in `modules/game/ui/` |

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Lint errors | **CRITICAL** |
| Test failures | **CRITICAL** |
| JSB violation | **CRITICAL** |
| const in loop | **CRITICAL** |
| ES6 import | **CRITICAL** |
| Pattern mismatch | **WARNING** |
| Missing tests | **WARNING** |
| Globals not updated | **WARNING** |

---

### 10. `refactor_client` — Refactoring Validation

**Goal:** Ensure refactoring doesn't break existing functionality.

#### Automated Checks (MANDATORY)

```bash
# 1. Pre-refactor test snapshot (should be captured BEFORE changes)
npm test 2>&1 > /tmp/test_before.log

# 2. Post-refactor tests (MUST pass)
npm test 2>&1 > /tmp/test_after.log

# 3. Compare test results
diff /tmp/test_before.log /tmp/test_after.log
# No new failures allowed

# 4. Lint passes
npm run lint

# 5. Legacy pattern reduction
echo "Before:" && grep -rc "gv\.signalMgr" clientccn2/src/ --include="*.js" | awk -F: '{s+=$2}END{print s}'
echo "After:" && grep -rc "gv\.signalMgr" clientccn2/src/ --include="*.js" | awk -F: '{s+=$2}END{print s}'
# After should be <= Before

# 6. New architecture usage increased
grep -rc "gv\.bus" clientccn2/src/ --include="*.js" | awk -F: '{s+=$2}END{print s}'
# Should be >= Before
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| New test failures | **CRITICAL** — rollback |
| Lint errors | **CRITICAL** |
| Legacy count increased | **CRITICAL** |
| New arch count decreased | **WARNING** |
| CLAUDE.md not updated | **INFO** |

---

### 11. `manage_ui` — UI Validation

**Goal:** Ensure UI components integrate correctly.

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| File in correct directory | Verify path under `modules/game/ui/` or `scenes/` | **CRITICAL** |
| Extends correct base | `BaseScene` for new, `BaseGUI` for legacy only | **CRITICAL** |
| Z-order correct | Compare with `gv.LAYERS` constants | **WARNING** |
| Uses hasEventBus mixin | Grep for `hasEventBus` in new UI code | **WARNING** |
| Event cleanup on exit | Check `onExit`/`cleanup` for `gv.bus.off` | **WARNING** |
| Registered in SceneFactory | If scene, check `SceneFactory.js` | **CRITICAL** |
| JSB compatible | No template literals | **CRITICAL** |

---

## Validation Execution Protocol

### When to Run

```
AFTER every skill command → Run validation for that command type
BEFORE saving to memory → Validate scan/analysis results
BEFORE presenting to user → Validate documentation
BEFORE marking task complete → Validate code/refactor
```

### Validation Result Format

```
## Validation Report — {command_name}
**Timestamp:** {date}
**Command:** {command with args}

### Automated Checks
| # | Check | Result | Severity |
|---|-------|--------|----------|
| 1 | {check_name} | PASS/FAIL | CRITICAL/WARNING/INFO |
| 2 | ... | ... | ... |

### Spot-Checks (manual)
- [x] {item checked} — OK
- [ ] {item not checked}

### Summary
- **CRITICAL failures:** {count}
- **WARNING failures:** {count}
- **Overall:** PASS / FAIL

### Action Required
{if FAIL: what needs to be fixed}
```

### Decision Rules

| Scenario | Action |
|----------|--------|
| All PASS | Proceed, save to memory |
| WARNING only | Proceed with caveats noted |
| Any CRITICAL | Stop, fix, re-validate |
| Multiple CRITICAL | Re-run entire command from scratch |

---

## Quick Validation Commands

Copy-paste ready bash commands for common validations:

```bash
# === FULL VALIDATION SUITE ===

# 1. Lint check
cd clientccn2 && npm run lint 2>&1 | tail -5

# 2. Test suite
cd clientccn2 && npm test 2>&1 | tail -10

# 3. JSB compatibility scan (entire src/)
grep -rE '`[^`]*\$\{' clientccn2/src/ --include="*.js" | head -20

# 4. Const-in-loop scan
grep -rE 'for\s*\(\s*const\s' clientccn2/src/ --include="*.js" | head -20

# 5. ES6 import scan
grep -rE '^\s*import\s' clientccn2/src/ --include="*.js" | head -20

# 6. Legacy vs new ratio
echo "signalMgr files:" && grep -rl "gv\.signalMgr" clientccn2/src/ --include="*.js" | wc -l
echo "bus files:" && grep -rl "gv\.bus" clientccn2/src/ --include="*.js" | wc -l

# 7. Codebase stats
echo "Total JS files:" && find clientccn2/src/ -name "*.js" | wc -l
echo "Test files:" && find clientccn2/tests/ -name "*.test.js" | wc -l
echo "Config JSONs:" && ls clientccn2/res/config/*.json | wc -l
```
