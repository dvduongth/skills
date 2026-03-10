# Legacy Project Analyzer — Workflow Reference

## Pipeline Overview

```
Phase 1: SCAN        → scan_project (haiku)
Phase 2: ANALYZE     → analyze_config + analyze_core + analyze_network (parallel)
Phase 3: SPECIALIZE  → analyze_client / analyze_server (based on project type)
Phase 4: SYNTHESIZE  → synthesize_gdd (sonnet)
Phase 5: VALIDATE    → validate_result (automated + spot-checks)
```

## Phase 1: Surface Scan

**Goal**: Build complete project map before any deep analysis.

**Agent Config**:
- Model: `haiku` (fast, cost-effective)
- Type: `Explore`
- Max turns: 15

**Steps**:
1. Run `Bash: ls -la {project}/` to identify top-level structure
2. Run `Glob: **/*.{js,kt,json,properties}` to inventory source files
3. Exclude: `node_modules/`, `.git/`, `build/`, `dist/`, `out/`, `*.min.js`
4. Count files by extension
5. Identify entry points:
   - JS: look for `main.js`, `index.js`, `app.js`, `project.json`
   - Kotlin: look for `MainKt`, `Application.kt`, `build.gradle.kts`
   - Node: look for `package.json`, `server.js`
6. Identify config directories: `res/`, `config/`, `configByMode/`
7. Identify test directories: `test/`, `tests/`, `__tests__/`, `src/test/`
8. Write `scan_map.md` with annotated tree

**Output Structure**:
```markdown
# Project Scan: {project_name}
## Statistics
- Total files: N
- Source files: N (by extension breakdown)
- Config files: N
- Test files: N

## Directory Tree
{annotated tree}

## Entry Points
- Main: {path}
- Config: {path}

## Module Boundaries
| Module | Path | File Count | Type |
|--------|------|------------|------|

## Key Files
| File | Purpose | Notes |
|------|---------|-------|
```

## Phase 2: Parallel Analysis

Three independent analyses run concurrently:

### 2a. Config Analysis (haiku)

**Input**: `scan_map.md` → config file list
**Agent Config**: `haiku`, `Explore`, max 20 turns

**Target Files**:
- `*.json` in config directories
- `*.properties` files
- Constants files (search: `const`, `CONFIG`, `GAME_CONST`, `object.*{`)
- Enum definitions

**Output**: `gdd_config.md`
```markdown
# Config & Data Schemas

## Config Files Inventory
| File | Keys | Type | Environment-Specific |
|------|------|------|---------------------|

## Constants & Enums
| Name | Location | Values | Used By |
|------|----------|--------|---------|

## Config Dependencies
{graph showing which configs reference each other}

## Environment Matrix
| Key | local | dev | qc | live |
|-----|-------|-----|-----|------|
```

### 2b. Core Logic Analysis (sonnet)

**Input**: `scan_map.md` → source file list
**Agent Config**: `sonnet`, `Explore`, max 25 turns

**Target Files**:
- Game rule files (search: `rules`, `game`, `logic`, `engine`)
- State machine files (search: `state`, `phase`, `turn`, `round`)
- Event system files (search: `event`, `signal`, `bus`, `emit`, `dispatch`)
- Action/command handlers (search: `action`, `command`, `handler`)

**Output**: `gdd_core.md`
```markdown
# Core Logic Analysis

## Game Rules
| Rule | Value | Source File | Line |
|------|-------|-------------|------|

## State Machine
| State | Transitions | Trigger | Handler |
|-------|-------------|---------|---------|

## Event System
| Event Name | Emitter | Listeners | Payload |
|------------|---------|-----------|---------|

## Design Patterns
| Pattern | Where | Implementation |
|---------|-------|----------------|
```

### 2c. Network Analysis (sonnet)

**Input**: `scan_map.md` → network file list
**Agent Config**: `sonnet`, `Explore`, max 20 turns

**Target Files**:
- Route definitions (search: `route`, `endpoint`, `path`, `get(`, `post(`)
- WebSocket handlers (search: `socket`, `ws`, `websocket`, `onMessage`)
- Packet/message definitions (search: `packet`, `message`, `cmd`, `opcode`)
- Serialization (search: `serialize`, `deserialize`, `MSerializer`)

**Output**: `gdd_network.md`
```markdown
# Network & API Analysis

## HTTP Endpoints
| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|

## WebSocket Messages
| ID/OpCode | Direction | Name | Payload Schema |
|-----------|-----------|------|----------------|

## Serialization
| Format | Library | Schema Location |
|--------|---------|-----------------|
```

## Phase 3: Specialized Analysis

Based on project type detected in Phase 1:

### 3a. Client Analysis (if Cocos2d-x / HTML5 detected)

**Agent Config**: `sonnet`, `Explore`, max 25 turns

**Target Files**:
- Scene files (search: `Scene`, `Layer`, `extends cc.`)
- UI components (search: `Widget`, `Button`, `Label`, `Sprite`)
- Module registrations (search: `module`, `register`, `gv.`)
- Asset loading (search: `load`, `resource`, `spriteFrame`)

### 3b. Server Analysis (if Kotlin/Ktor detected)

**Agent Config**: `sonnet`, `Explore`, max 25 turns

**Target Files**:
- Application setup (search: `install`, `routing`, `module`)
- Database models (search: `Table`, `Entity`, `Column`, `exposed`)
- Command handlers (search: `CommandHandler`, `handleCommand`, `cmd`)
- Deploy configs (search: `configByMode`, `server.properties`)

## Phase 4: Synthesis

**Input**: All `gdd_*.md` files + `scan_map.md`
**Agent Config**: `sonnet`, `general-purpose`, max 15 turns

**Process**:
1. Read all analysis files
2. Read template: `templates/GDD_Final.md`
3. Cross-reference findings between analyses
4. Identify gaps (mentioned in one analysis but missing in another)
5. Resolve contradictions (e.g., config says X, code does Y)
6. Build unified GDD with 7 sections
7. Add consistency matrix
8. Write `GDD_Final.md`

## Phase 5: Validation

**Input**: Any completed analysis file
**Agent Config**: main thread (no sub-agent needed)

**Automated Checks**:
| Check | Tool | Pass Criteria |
|-------|------|--------------|
| File paths exist | `Glob` | All referenced paths found |
| Counts match | `Bash: find \| wc -l` | Within 5% margin |
| Entry points exist | `Read` | File exists and contains expected patterns |
| Config keys exist | `Grep` | Key found in actual config file |
| Module names exist | `Grep` | Module name found in source |

**Spot-Checks** (3 random items):
1. Pick random file from analysis → verify it exists and matches description
2. Pick random config key → verify value matches what analysis claims
3. Pick random event/endpoint → verify handler exists

---

## Pipeline Examples

### Full Analysis Pipeline
```
User: "Analyze clientccn2"

1. scan_project(clientccn2/)
   → haiku Explore agent, 15 turns
   → output: document/analysis/scan_map.md

2. [PARALLEL]
   analyze_config(clientccn2/) → haiku, background
   analyze_core(clientccn2/)   → sonnet, background
   analyze_network(clientccn2/) → sonnet, background

3. analyze_client(clientccn2/) → sonnet (detected: Cocos2d-x JS)

4. synthesize_gdd(clientccn2/) → sonnet
   → reads all gdd_*.md + scan_map.md
   → output: document/analysis/GDD_Final.md

5. validate_result → automated + 3 spot-checks
```

### Quick Config Audit
```
User: "What configs does serverccn2 have?"

1. scan_project(serverccn2/)
2. analyze_config(serverccn2/)
3. validate_result
```

### Cross-Project Analysis
```
User: "Analyze both client and server"

1. [PARALLEL]
   scan_project(clientccn2/) → haiku
   scan_project(serverccn2/) → haiku

2. [PARALLEL]
   analyze_client(clientccn2/) → sonnet
   analyze_server(serverccn2/) → sonnet
   analyze_network(clientccn2/) → sonnet
   analyze_network(serverccn2/) → sonnet

3. synthesize_gdd → sonnet (cross-project merge)
4. validate_result
```

---

## Cross-Project Dependencies

When analyzing CCN2 sub-projects, watch for:

| Dependency | From | To | Trigger |
|-----------|------|-----|---------|
| `MSerializer.js` | serverccn2 KSP | clientccn2/src/common/ | Server packet changes |
| `ItemGroup.json` | serverccn2 generator | clientccn2/res/config/ | Item config changes |
| Studio exports | studioccn2/ | clientccn2/res/ | UI asset changes |
| DEMO assets | clientccn2/res/ | DEMO/ | via `../` relative paths |

## Error Recovery

| Error | Recovery |
|-------|----------|
| Agent timeout | Re-launch with higher max_turns |
| Empty analysis | Check scan_map.md for correct file paths, re-scan |
| Missing files | Verify project path, check for gitignore exclusions |
| Count mismatch | Re-count with explicit Glob, update analysis |
| Contradictions | Flag to user, present both versions, ask for decision |
