# ServerCCN2 Project Editor — Validation Framework

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

### 1. `scan_server` — Scan Validation

**Goal:** Ensure scan output accurately reflects the current server codebase state.

#### Automated Checks

```bash
# Module count: reported vs actual
grep -c "registerModule\|addModule" serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt
# Expected: matches scan output (15)

# Kotlin file count
find serverccn2/src/main/kotlin/ -name "*.kt" | wc -l
# Expected: matches scan output (~798)

# Config loader count in GameCfg
grep -c "fun load\|lateinit\|by lazy" serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt
# Expected: ~40+ config sets

# Resource JSON count
ls serverccn2/res/*.json | wc -l
# Expected: matches scan output (30+)

# Deploy environment count
ls -d serverccn2/configByMode/*/config/ | wc -l
# Expected: 7 (dev, dev2, dev3, qc, qc2, qc3, live)

# Ability file count
find serverccn2/src/main/kotlin/org/ccn2/abilities/ -name "*.kt" | wc -l
# Expected: matches scan output (~129)
```

#### Manual Spot-Checks (pick 3 random items)

- [ ] Pick a random module from scan output → verify it exists in CCN2ModuleInitializer.kt
- [ ] Pick a random config loader → verify it exists in GameCfg.kt
- [ ] Pick a random resource JSON → verify file exists in res/

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Module count mismatch >2 | **CRITICAL** |
| Kotlin file count off >50 | **WARNING** |
| Resource JSON count mismatch >3 | **WARNING** |
| Environment count mismatch | **CRITICAL** |
| File path doesn't exist | **CRITICAL** |

---

### 2. `generate_server_tech_doc` — Documentation Validation

**Goal:** Ensure documentation accurately describes the server codebase.

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| Key sections present | Count section headers (min 8) | **CRITICAL** |
| Startup flow matches Main.kt | Read Main.kt, compare | **CRITICAL** |
| Module list matches actual | Cross-check CCN2ModuleInitializer.kt | **CRITICAL** |
| File paths cited exist | Glob/Read each cited path (sample 5) | **CRITICAL** |
| Code examples compile-valid | Check Kotlin syntax in examples | **WARNING** |
| GDD references accurate | Cross-read cited GDD sections | **WARNING** |

#### Required Sections Checklist

```
[ ] 1. System Overview & Startup Flow
[ ] 2. Module Architecture & Registration
[ ] 3. Game Room Actor Model
[ ] 4. Ability/Skill System
[ ] 5. Config System (GameCfg + server.properties)
[ ] 6. Database Layer (Exposed ORM)
[ ] 7. Network Protocol (bitzero + m-serialization)
[ ] 8. Deploy Pipeline (Gradle + SVN)
[ ] 9. Cross-Project Code Generation
[ ] 10. Resource File System
```

---

### 3. `edit_server_idea` — Impact Analysis Validation

**Goal:** Ensure the impact analysis is complete and accurate.

#### Required Impact Areas

```
[ ] 1. Architecture fit (Module pattern? Actor model?)
[ ] 2. Database impact (new tables? schema versioning?)
[ ] 3. Config impact (new JSON resources? GameCfg changes?)
[ ] 4. Network impact (new packets? MSerializer?)
[ ] 5. Cross-project (client changes needed?)
[ ] 6. Performance (actor concurrency? DB queries?)
[ ] 7. Security (cheat prevention? input validation?)
```

#### Checks

| Check | How | Severity |
|-------|-----|----------|
| All 7 impact areas analyzed | Count sections in output | **CRITICAL** |
| Affected files list provided | Verify paths exist in codebase | **WARNING** |
| Scope estimate (S/M/L) present | Check output | **INFO** |
| GDD cross-reference done | Verify GDD sections cited | **WARNING** |
| Existing module patterns checked | Compare suggested pattern vs actual | **WARNING** |

---

### 4. `manage_config` — Configuration Validation

**Goal:** Ensure config changes are valid and consistent across environments.

#### For Config Edit (4a)

```bash
# Properties file is valid (no syntax errors)
grep -P '^\s*[^#=\s]+\s*=' serverccn2/configByMode/{env}/config/server.properties | wc -l
# Should return expected number of properties

# dao_type is valid
grep "dao_type" serverccn2/configByMode/{env}/config/server.properties
# Must be: file, simple, delegate, or shard

# db_prefix_key is unique
for dir in serverccn2/configByMode/*/config/; do
  grep "db_prefix_key" "$dir/server.properties" 2>/dev/null
done | sort | uniq -d
# Should find NO duplicates

# No file dao_type in non-local
for dir in serverccn2/configByMode/*/config/; do
  env_name=$(echo "$dir" | grep -oP 'configByMode/\K[^/]+')
  dao=$(grep "dao_type" "$dir/server.properties" 2>/dev/null | cut -d= -f2)
  if [ "$dao" = "file" ] && [ "$env_name" != "local" ]; then
    echo "CRITICAL: $env_name uses dao_type=file"
  fi
done
```

#### For New Environment (4b)

| Check | How | Severity |
|-------|-----|----------|
| Directory created | ls configByMode/{name}/config/ | **CRITICAL** |
| server.properties exists | Read file | **CRITICAL** |
| db_prefix_key unique | Compare across all envs | **CRITICAL** |
| dao_type not file | Check value | **CRITICAL** |
| Server.json exists | Read file | **WARNING** |
| admin.json exists | Read file | **WARNING** |
| log4j2.xml exists | Read file | **WARNING** |

#### For Config Audit (4c)

| Check | How | Severity |
|-------|-----|----------|
| All 7 envs included | Count environments in report | **WARNING** |
| SPOF check done | db_shard_nodes vs db_index_node | **CRITICAL** |
| dao_type validated per env | file only in local | **CRITICAL** |
| db_prefix_key uniqueness | Compare all envs | **CRITICAL** |
| Timeout values checked | Range validation | **WARNING** |

---

### 5. `check_server_consistency` — Consistency Validation

**Goal:** Ensure the consistency matrix itself is correct.

#### Meta-Validation (validating the validator)

| Check | How | Severity |
|-------|-----|----------|
| All key rules checked | Verify minimum 10 rules in matrix | **WARNING** |
| GDD values match actual GDD text | Re-read GDD, compare | **CRITICAL** |
| Config values match actual JSON | Re-read res/*.json, compare | **CRITICAL** |
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
[ ] Card hand limits
[ ] Economy values (tax rate, kick steal percentage)
[ ] Tile types match GDD
```

---

### 6. `generate_server_code` — Code Generation Validation

**Goal:** Ensure generated code is production-ready.

#### Automated Checks (MANDATORY)

```bash
# 1. Build compiles
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -10

# 2. Tests pass
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# 3. New module registered (if applicable)
grep "{ModuleName}" serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt

# 4. New config registered in GameCfg (if applicable)
grep "{ConfigName}" serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt

# 5. New command registered in CmdDefine (if applicable)
grep "{CMD_NAME}" serverccn2/src/main/kotlin/org/ccn2/modules/CmdDefine.kt

# 6. DB versioning updated (if new table)
grep "{TableName}" serverccn2/src/main/kotlin/org/ccn2/sql/SqlVersioning.kt
```

#### Pattern Consistency Check

| Aspect | Verify Against |
|--------|---------------|
| New module | Compare with existing module structure (Module.kt + RequestHandler + EventListener) |
| New ability | Compare with existing ability in abilities/execute/ |
| New config | Compare with existing loader in config/ |
| New DB table | Compare with existing table in sql/ |
| New packet | Check KSP annotations present |

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Build fails | **CRITICAL** |
| Test failures | **CRITICAL** |
| Module not registered | **CRITICAL** |
| Config not registered in GameCfg | **CRITICAL** |
| Command not in CmdDefine | **CRITICAL** |
| DB version not updated | **WARNING** |
| Pattern mismatch | **WARNING** |
| Missing tests | **WARNING** |

---

### 7. `manage_resources` — Resource Validation

**Goal:** Ensure resource JSON files are valid and properly registered.

#### Checks

```bash
# JSON is valid
node -e "JSON.parse(require('fs').readFileSync('serverccn2/res/{Name}.json'))"

# Registered in GameCfg
grep "{Name}" serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt

# Config loader exists
find serverccn2/src/main/kotlin/org/ccn2/config/ -name "*{Name}*"
```

| Check | Failure Severity |
|-------|-----------------|
| JSON parse error | **CRITICAL** |
| Not registered in GameCfg | **CRITICAL** |
| No config loader | **WARNING** |
| Client sync needed but not flagged | **WARNING** |

---

### 8. `review_deploy` — Deploy Review Validation

**Goal:** Ensure deploy checklist is complete and accurate.

#### Required Checklist Items

```
[ ] 1. dao_type appropriate for target env
[ ] 2. db_prefix_key unique and correct
[ ] 3. DB connection settings verified
[ ] 4. No cheat module in production
[ ] 5. All tests pass
[ ] 6. MSerializer.js up to date
[ ] 7. ItemGroup.json up to date
[ ] 8. Correct Gradle deploy task identified
[ ] 9. Post-deploy health check plan
```

| Check | Failure Severity |
|-------|-----------------|
| Checklist item missing | **WARNING** |
| dao_type=file for production | **CRITICAL** |
| Cheat module enabled in prod | **CRITICAL** |
| Tests not verified | **CRITICAL** |
| No post-deploy plan | **WARNING** |

---

### 9. `refactor_server` — Refactoring Validation

**Goal:** Ensure refactoring doesn't break existing functionality.

#### Automated Checks (MANDATORY)

```bash
# 1. Build compiles after refactor
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -10

# 2. All tests pass
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# 3. Consistency check
# Run check_server_consistency mentally or actually
```

#### Severity Matrix

| Check | Failure Severity |
|-------|-----------------|
| Build fails | **CRITICAL** — rollback |
| New test failures | **CRITICAL** — rollback |
| Consistency mismatch introduced | **CRITICAL** |
| Tech doc not updated | **WARNING** |

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
# === SERVER FULL VALIDATION SUITE ===

# 1. Build check
cd serverccn2 && ./gradlew compileKotlin 2>&1 | tail -5

# 2. Test suite
cd serverccn2 && ./gradlew test 2>&1 | tail -10

# 3. Module count
grep -c "registerModule\|Module(" serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt

# 4. Kotlin file count
find serverccn2/src/main/kotlin/ -name "*.kt" | wc -l

# 5. Resource JSON count
ls serverccn2/res/*.json 2>/dev/null | wc -l

# 6. Environment count
ls -d serverccn2/configByMode/*/config/ 2>/dev/null | wc -l

# 7. Config uniqueness check (db_prefix_key)
for dir in serverccn2/configByMode/*/config/; do
  env=$(echo "$dir" | grep -oP 'configByMode/\K[^/]+')
  key=$(grep "db_prefix_key" "$dir/server.properties" 2>/dev/null | cut -d= -f2)
  echo "$env: $key"
done

# 8. dao_type check across envs
for dir in serverccn2/configByMode/*/config/; do
  env=$(echo "$dir" | grep -oP 'configByMode/\K[^/]+')
  dao=$(grep "dao_type" "$dir/server.properties" 2>/dev/null | cut -d= -f2)
  echo "$env: dao_type=$dao"
done
```
