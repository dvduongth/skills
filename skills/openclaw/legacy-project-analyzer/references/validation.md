# Legacy Project Analyzer — Validation Framework

## Overview

Every command output MUST be validated before presenting to the user.
Validation has two layers: **Automated Checks** and **Spot-Checks**.

---

## Validation by Command

### 1. scan_project → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Total file count | `Bash: find {path} -type f \| wc -l` (exclude node_modules, .git) | Within 5% of claimed count |
| Extension breakdown | `Glob: **/*.{ext}` for each claimed extension | Each count within 10% |
| Entry point exists | `Read: {claimed_entry_point}` | File exists and is readable |
| Config dir exists | `Bash: ls {claimed_config_dir}` | Directory exists |
| Module boundaries | `Bash: ls {each_claimed_module_path}` | All paths exist |

**Spot-Checks** (3 random):
1. Pick random module from table → verify directory exists and has files
2. Pick random "key file" → Read it, verify purpose description matches
3. Pick random file count claim → independently count with Glob

**Severity**:
- CRITICAL: Entry point doesn't exist, major directory missing
- WARNING: File count off by >10%, module path slightly wrong
- INFO: Minor annotation inaccuracy

---

### 2. analyze_config → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Config file exists | `Glob: {each_claimed_config_file}` | File found |
| Config file count | Count Glob results | Matches claimed inventory |
| Key exists in config | `Read: {config_file}` → check for key | Key present in file |
| Constants file exists | `Read: {constants_file}` | File readable |
| Environment count | `Glob: configByMode/*/` | Matches claimed environments |

**Spot-Checks** (3 random):
1. Pick random config file → Read it → verify schema matches description
2. Pick random constant → Grep for it → verify value and location
3. Pick random environment diff → Read both configs → verify difference is real

**Severity**:
- CRITICAL: Config file doesn't exist, schema completely wrong
- WARNING: Missing keys, environment diff inaccurate
- INFO: Type description imprecise (e.g., "number" vs "integer")

---

### 3. analyze_core → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Rule source file exists | `Read: {source_file}` | File readable |
| Rule value correct | `Grep: {value}` in claimed file | Value found at/near claimed line |
| Event name exists | `Grep: {event_name}` | Found in codebase |
| Event handler exists | `Grep: {handler_function}` | Found in codebase |
| State names exist | `Grep: {state_name}` | Found in codebase |
| Action types exist | `Grep: {action_type}` | Found in codebase |

**Spot-Checks** (3 random):
1. Pick random game rule → Read source file → verify value at claimed line
2. Pick random event → Grep for emitter AND listener → verify both exist
3. Pick random state transition → Read handler → verify transition logic

**Severity**:
- CRITICAL: Game rule value wrong, event doesn't exist, state machine incorrect
- WARNING: Line number off, handler description imprecise
- INFO: Design pattern classification debatable

---

### 4. analyze_network → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Endpoint handler exists | `Grep: {handler_function}` | Found in codebase |
| Route path exists | `Grep: "{route_path}"` | Found in routing config |
| Packet ID exists | `Grep: {packet_id}` | Found in packet definitions |
| Serializer exists | `Grep: {serializer_class}` | Found in codebase |
| Endpoint count | Count unique routes | Matches claimed count |

**Spot-Checks** (3 random):
1. Pick random endpoint → Read handler → verify method and auth requirement
2. Pick random packet → Read definition → verify payload schema
3. Pick random API contract → Check client + server both reference it

**Severity**:
- CRITICAL: Endpoint doesn't exist, packet ID wrong, contract mismatch
- WARNING: Auth requirement incorrect, payload schema incomplete
- INFO: Description wording imprecise

---

### 5. analyze_client → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Scene file exists | `Glob: {scene_file}` | File found |
| Scene count | `Grep: "Scene"` + count | Matches claimed count (±2) |
| Module registration | `Grep: {module_name}` | Found in source |
| Global namespace | `Grep: {namespace}.` | Found in source |
| Architecture % | Count legacy vs new patterns | Within 5% of claimed ratio |

**Spot-Checks** (3 random):
1. Pick random scene → Read it → verify layer composition matches description
2. Pick random module → Read it → verify dependencies match
3. Pick random global → Grep usage → verify singleton description

**Severity**:
- CRITICAL: Scene doesn't exist, module missing, architecture style wrong
- WARNING: Layer composition inaccurate, dependency graph incomplete
- INFO: Naming convention difference

---

### 6. analyze_server → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| Entry point exists | `Read: {entry_point}` | File readable, contains main() |
| Module count | `Grep: "install\|module"` + count | Matches claimed count (±2) |
| Table exists | `Grep: {table_name}` | Found in ORM definitions |
| Table count | Count Table/Entity definitions | Matches claimed count |
| Command handler exists | `Grep: {handler_name}` | Found in source |
| Deploy env exists | `Glob: configByMode/{env}/` | Directory exists |

**Spot-Checks** (3 random):
1. Pick random table → Read ORM file → verify columns match description
2. Pick random command → Read handler → verify behavior description
3. Pick random deploy env → Read config → verify key differences

**Severity**:
- CRITICAL: Entry point wrong, table doesn't exist, deploy env missing
- WARNING: Column list incomplete, command description imprecise
- INFO: Deploy config minor difference

---

### 7. synthesize_gdd → validate_result

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| All sections present | Read GDD_Final.md | 7 required sections exist |
| Source analyses referenced | Check GDD cites all gdd_*.md | All available analyses included |
| No contradictions | Cross-check key values between sections | Consistent values throughout |
| Consistency matrix | Verify matrix entries | Each entry has source reference |
| Recommendations grounded | Each recommendation references evidence | Not generic/unsupported |

**Spot-Checks** (3 random):
1. Pick random Module Detail → trace back to source analysis → verify accuracy
2. Pick random Game Rule → trace to source code → verify value
3. Pick random Recommendation → verify the problem it addresses actually exists

**Severity**:
- CRITICAL: Missing section, major contradiction, fabricated recommendation
- WARNING: Incomplete section, minor inconsistency
- INFO: Formatting issue, wording improvement

---

## Decision Matrix

| Scenario | Action |
|----------|--------|
| All checks PASS | Approve output, save to memory, proceed to next command |
| Only INFO issues | Approve, note INFO items in log |
| 1-2 WARNING | Approve with caveats, note in analysis_log.md |
| 3+ WARNING | Fix warnings, re-validate affected section |
| 1 CRITICAL | Stop, fix the specific issue, re-validate |
| 2+ CRITICAL | Re-run the entire command from scratch |
| Spot-check fails | Treat as WARNING or CRITICAL based on magnitude |

---

## Validation Report Format

```markdown
## Validation Report — {command_name}

**Target**: {analysis_file}
**Timestamp**: {ISO timestamp}
**Status**: PASS / PASS_WITH_CAVEATS / FAIL

### Automated Checks
| # | Check | Expected | Actual | Status | Severity |
|---|-------|----------|--------|--------|----------|
| 1 | File count | 586 | 586 | PASS | — |
| 2 | Module count | 12 | 15 | FAIL | WARNING |

### Spot-Checks
| # | Claim | Source | Verified | Status |
|---|-------|--------|----------|--------|
| 1 | "GameScene extends cc.Scene" | src/game/GameScene.js:5 | Yes | PASS |
| 2 | "12 event types" | EventKeys.js | Found 14 | WARNING |
| 3 | "MSerializer handles packets" | src/common/MSerializer.js | Yes | PASS |

### Decision
{PASS/FAIL rationale}

### Issues to Fix (if any)
1. {Issue description} → {Fix action}
```

---

## Logging Format

All validation results are appended to `analysis_log.md`:

```
[2026-03-10 14:30] validate_result: scan_project
  Status: PASS (5/5 automated, 3/3 spot-checks)
  Duration: 12s

[2026-03-10 14:35] validate_result: analyze_config
  Status: PASS_WITH_CAVEATS (4/5 automated, 3/3 spot-checks)
  Caveats: Config count off by 2 (claimed 40, found 42)
  Duration: 18s
```
