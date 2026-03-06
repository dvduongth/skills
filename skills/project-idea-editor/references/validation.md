# Project Idea Editor — Validation Framework

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

### 1. `scan_project` — Scan Validation

**Goal:** Ensure scan output accurately reflects the current cross-project state.

#### Automated Checks

```bash
# Client module count
ls -d clientccn2/src/modules/*/ | wc -l
# Expected: matches scan output (20+)

# Client action type count
find clientccn2/src/modules/game/logic/action/ -name "Action*.js" ! -name "ActionQueue.js" ! -name "ActionType.js" | wc -l
# Expected: matches scan output (28+)

# Client event key count
grep -cE "^\s+[A-Z_]+:" clientccn2/src/events/EventKeys.js
# Expected: matches scan output (45+)

# Client config file count
ls clientccn2/res/config/*.json | wc -l
# Expected: matches scan output (43+)

# Server module count
grep -c "registerModule\|Module(" serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt
# Expected: matches scan output (15)

# Server Kotlin file count
find serverccn2/src/main/kotlin/ -name "*.kt" | wc -l
# Expected: matches scan output (~798)

# Server resource JSON count
ls serverccn2/res/*.json | wc -l
# Expected: matches scan output (30+)

# Sub-project directories exist
for dir in clientccn2 serverccn2 studioccn2 admintool DEMO; do
  [ -d "$dir" ] && echo "PASS: $dir" || echo "FAIL: $dir"
done
```

#### Manual Spot-Checks (pick 3 random items)

- [ ] Pick a random client module → verify it exists at stated path
- [ ] Pick a random server module → verify it exists in CCN2ModuleInitializer.kt
- [ ] Pick a random design pattern → verify it matches actual codebase usage

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Sub-project dir missing | **CRITICAL** |
| Client module count mismatch >3 | **WARNING** |
| Server module count mismatch >2 | **CRITICAL** |
| Design pattern claim doesn't match code | **WARNING** |
| File path doesn't exist | **CRITICAL** |

---

### 2. `generate_tech_doc` — Documentation Validation

**Goal:** Ensure TechnicalArchitectureDocument.md accurately describes the codebase.

#### Required Sections Checklist (16 sections)

```
[ ] 1. System Overview
[ ] 2. Client Architecture
[ ] 3. Server Architecture
[ ] 4. Communication Protocol
[ ] 5. Game Logic
[ ] 6. Event System
[ ] 7. Module System
[ ] 8. Action Queue
[ ] 9. Card/Ability System
[ ] 10. Config System
[ ] 11. UI Architecture
[ ] 12. Data Flow
[ ] 13. Testing
[ ] 14. Cross-Project Dependencies
[ ] 15. Tech Debt
[ ] 16. Architecture Decision Records
```

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| All 16 sections present | Count section headers | **CRITICAL** |
| File paths cited exist | Glob/Read sample 5 paths | **CRITICAL** |
| Code examples match actual source | Read referenced files | **WARNING** |
| Architecture patterns match codebase | Verify pattern claims | **WARNING** |
| GDD references accurate | Cross-read cited sections | **WARNING** |
| Client + server both covered | Check for both sections | **CRITICAL** |

---

### 3. `edit_idea` — Impact Analysis Validation

**Goal:** Ensure the impact analysis is complete and cross-project aware.

#### Required Impact Areas

```
[ ] 1. Game balance (KC economy, diamond flow, card power)
[ ] 2. Technical feasibility (client-server sync, ActionQueue, events)
[ ] 3. Existing patterns (BaseModule, ActionQueue, EventBus, Actor model)
[ ] 4. Cross-project impact (client + server + config + MSerializer)
[ ] 5. Player experience (fun factor, complexity, learning curve)
```

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| All 5 impact areas analyzed | Count sections | **CRITICAL** |
| Both client AND server impact assessed | Check for both sub-sections | **CRITICAL** |
| Affected files list spans both projects | Verify paths | **WARNING** |
| GDD cross-reference done | Verify sections cited | **WARNING** |
| Scope estimate (S/M/L) present | Check output | **INFO** |

---

### 4. `update_gdd` — GDD Update Validation

**Goal:** Ensure GDD updates are consistent with existing structure and content.

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| Correct section targeted (§1-§17) | Verify section number | **CRITICAL** |
| GDD formatting preserved | Tables use pipe delimiters, code blocks intact | **CRITICAL** |
| No contradictions with other sections | Cross-read related sections | **CRITICAL** |
| Downstream impacts flagged | Tech Doc + Code changes noted | **WARNING** |
| Diff presented to user | Verify before/after shown | **WARNING** |
| Section numbering intact | No broken references | **WARNING** |

#### GDD Structure Verification

```
[ ] Section number matches GDD structure (§1-§17)
[ ] Tables use pipe-delimited format
[ ] Constants use code blocks
[ ] Cross-references to other sections are valid
[ ] New content doesn't contradict existing rules
```

---

### 5. `check_design_consistency` — Consistency Validation

**Goal:** Ensure the consistency matrix itself is correct.

#### Required Rules in Matrix

```
[ ] Win point threshold (point)
[ ] Economy values (tax rate)
[ ] Game mechanics (value) 
```

#### Meta-Validation

| Check | How | Severity |
|-------|-----|----------|
| Minimum 10 rules in matrix | Count rows | **WARNING** |
| GDD column matches actual GDD text | Re-read GDD | **CRITICAL** |
| Client Code column matches actual | Re-read source | **CRITICAL** |
| Server Code column matches actual | Re-read source | **CRITICAL** |
| Tech Doc column matches actual | Re-read Tech Doc | **WARNING** |
| Status labels accurate | Re-verify each OK/MISMATCH | **CRITICAL** |
| Matrix covers BOTH client AND server | Check columns | **CRITICAL** |

---

### 6. `generate_code_from_design` — Code Generation Validation

**Goal:** Ensure generated code is production-ready on both client and server.

#### Client Code Checks

```bash
# Lint passes
cd clientccn2 && npm run lint 2>&1 | tail -5

# Tests pass
cd clientccn2 && npm test 2>&1 | tail -10

# JSB compatibility (no template literals)
grep -rE '`[^`]*\$\{' clientccn2/src/path/to/new/ --include="*.js"
# Must find NOTHING

# No const in loop
grep -rE 'for\s*\(\s*const\s' clientccn2/src/path/to/new/ --include="*.js"
# Must find NOTHING

# No ES6 imports
grep -rE '^\s*import\s' clientccn2/src/path/to/new/ --include="*.js"
# Must find NOTHING
```

#### Server Code Checks

```bash
# Build compiles
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -10

# Tests pass
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# Module registered (if new module)
grep "{ModuleName}" serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt

# Config registered (if new config)
grep "{ConfigName}" serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt
```

#### Cross-Project Checks

```bash
# MSerializer.js sync needed?
# If packets changed, remind user to run: ./gradlew run

# ItemGroup.json sync needed?
# If items changed, remind user to run: ./gradlew generateItemGroup
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Client lint errors | **CRITICAL** |
| Client JSB violation | **CRITICAL** |
| Server build fails | **CRITICAL** |
| Test failures (either side) | **CRITICAL** |
| Registration missing | **CRITICAL** |
| Cross-project sync not flagged | **WARNING** |
| Missing tests | **WARNING** |
| Pattern mismatch | **WARNING** |

---

### 7. `refactor_codebase` — Refactoring Validation

**Goal:** Ensure refactoring doesn't break existing functionality on either side.

#### Automated Checks (MANDATORY)

```bash
# Client checks (if client code changed)
cd clientccn2 && npm run lint 2>&1 | tail -5
cd clientccn2 && npm test 2>&1 | tail -10

# Server checks (if server code changed)
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -10
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# Design consistency
# Run check_design_consistency mentally or actually
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Build/lint fails | **CRITICAL** — rollback |
| New test failures | **CRITICAL** — rollback |
| Consistency mismatch introduced | **CRITICAL** |
| Tech doc not updated | **WARNING** |
| Both client+server not tested | **WARNING** |

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

```bash
# === CROSS-PROJECT FULL VALIDATION SUITE ===

# 1. Client lint
cd clientccn2 && npm run lint 2>&1 | tail -5

# 2. Client tests
cd clientccn2 && npm test 2>&1 | tail -10

# 3. Client JSB scan
grep -rE '`[^`]*\$\{' clientccn2/src/ --include="*.js" | head -20

# 4. Server build
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -5

# 5. Server tests
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# 6. Codebase stats
echo "Client JS files:" && find clientccn2/src/ -name "*.js" | wc -l
echo "Server Kt files:" && find serverccn2/src/main/kotlin/ -name "*.kt" | wc -l
echo "Client configs:" && ls clientccn2/res/config/*.json | wc -l
echo "Server resources:" && ls serverccn2/res/*.json | wc -l

# 7. Cross-project sync check
echo "MSerializer.js last modified:" && stat -c '%Y %n' clientccn2/src/common/MSerializer.js
echo "ItemGroup.json last modified:" && stat -c '%Y %n' clientccn2/res/config/ItemGroup.json
```
