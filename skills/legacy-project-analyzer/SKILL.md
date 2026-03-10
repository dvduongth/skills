---
name: legacy-project-analyzer
description: >
  Autonomous legacy project analyzer that orchestrates sub-agents to reverse-engineer
  codebases and generate comprehensive Game Design Documents (GDDs).
  Use this skill whenever the user wants to: analyze an unfamiliar codebase,
  reverse-engineer a legacy project, generate a GDD from source code,
  map project structure and architecture, extract config schemas,
  audit event systems and network APIs, or understand how a codebase works.
  Triggers: "analyze project", "reverse engineer", "scan codebase",
  "generate GDD from code", "understand this project", "map architecture",
  "what does this project do", "legacy analysis", "project audit".
  Every command auto-validates output before presenting results.
  Read-only analysis — never modifies source code.
---

# Legacy Project Analyzer

Autonomous project analysis skill that breaks down complex legacy codebases into
structured, understandable documentation. Orchestrates parallel sub-agents with
model-appropriate routing (haiku for fast scans, sonnet for deep analysis) to
maximize speed and accuracy. All analysis is read-only — no source code is modified.

## Scope

### Target Projects
- **Cocos2d-x JS** game clients (clientccn2 pattern)
- **Kotlin/Ktor** game servers (serverccn2 pattern)
- **Node.js** services and tools
- **HTML5 Canvas** demos and prototypes
- **Any structured codebase** with identifiable modules

### Analysis Coverage
| Area | What it covers |
|------|---------------|
| **Structure** | Directory tree, file counts, module boundaries |
| **Config** | JSON configs, properties files, constants, enums |
| **Core Logic** | Game rules, state machines, algorithms, flow control |
| **Events** | Event systems, message buses, signal handlers |
| **Network** | API endpoints, WebSocket handlers, packet definitions |
| **Client** | UI layers, scenes, components, rendering pipeline |
| **Server** | Persistence, ORM, authentication, session management |

### Exclusions
- No source code modification (read-only)
- No binary/image asset processing
- No external network calls or API testing
- No credential or secret extraction

## Output Structure

All outputs go to `{project}/document/analysis/` directory:

| File | Content |
|------|---------|
| `scan_map.md` | Project structure tree + file inventory |
| `gdd_config.md` | Config schemas, constants, enums |
| `gdd_core.md` | Core logic, game rules, state machines |
| `gdd_network.md` | API endpoints, packet definitions, protocols |
| `gdd_client.md` | Client architecture, UI layers, scenes |
| `gdd_server.md` | Server architecture, persistence, modules |
| `GDD_Final.md` | Synthesized Game Design Document |
| `analysis_log.md` | Execution log with timestamps |

## Model Routing

Sub-agents are dispatched with optimal model selection:

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| Surface scan, file listing | `haiku` | Fast, cheap, sufficient for tree walking |
| Config extraction | `haiku` | Pattern matching, no deep reasoning needed |
| Core logic analysis | `sonnet` | Needs understanding of algorithms and flow |
| Event system audit | `sonnet` | Complex relationship mapping |
| Network/API analysis | `sonnet` | Protocol understanding, contract extraction |
| Synthesis (final GDD) | `sonnet` | Merging multiple sources, gap resolution |

## Templates

Pre-built output templates in `templates/` directory:
- `GDD_Final.md` — Final GDD structure (7 sections)
- `gdd_client.md` — Client analysis template
- `gdd_server.md` — Server analysis template
- `gdd_config.md` — Config schema template
- `gdd_core.md` — Core flow template
- `gdd_network.md` — Network API template

---

## Commands

### 1. `scan_project`

**Purpose:** Discover project structure, file inventory, and module boundaries.

Steps:
1. Accept project root path from user (default: current workspace)
2. Launch `haiku` Explore agent to:
   - Run `ls` / `Glob` on project root (exclude: `node_modules`, `.git`, `build`, `dist`, `out`)
   - Count files by extension (`.js`, `.kt`, `.json`, `.properties`, etc.)
   - Identify top-level modules and entry points
3. Build directory tree map with annotations
4. Identify key files: entry points, configs, test files, docs
5. Save output to `{project}/document/analysis/scan_map.md`
6. Log execution to `analysis_log.md`
7. Present summary to user (file count, module count, key findings)

### 2. `analyze_config`

**Purpose:** Extract all configuration schemas, constants, and data definitions.

Steps:
1. Read `scan_map.md` to identify config files
2. Launch `haiku` agent to scan:
   - JSON config files (`*.json` in `res/`, `config/`, `configByMode/`)
   - Properties files (`*.properties`)
   - Constants/enums in source code (search for `const`, `enum`, `CONFIG`, `GAME_CONST`)
   - Environment-specific configs
3. For each config file:
   - Extract schema (keys, types, sample values)
   - Note relationships to other configs
   - Flag sensitive values (passwords, tokens) — DO NOT include values
4. Build config dependency graph
5. Save output to `{project}/document/analysis/gdd_config.md`
6. Present summary: config count, schema overview, cross-references

### 3. `analyze_core`

**Purpose:** Deep analysis of core game logic, state machines, and algorithms.

Steps:
1. Read `scan_map.md` to identify core logic files
2. Launch `sonnet` agent to analyze:
   - Game rules and win conditions
   - State machines and transitions
   - Event flow (EventBus, signals, callbacks)
   - Action queue system (if present)
   - Turn/round management
   - Player management and scoring
3. Build flow diagrams (text-based)
4. Map event chains: trigger → handler → side effects
5. Identify design patterns used (Observer, Command, State, Strategy, etc.)
6. Save output to `{project}/document/analysis/gdd_core.md`
7. Present summary: rule count, event types, state machine diagram

### 4. `analyze_network`

**Purpose:** Map all network interfaces, API endpoints, and packet definitions.

Steps:
1. Read `scan_map.md` to identify network-related files
2. Launch `sonnet` agent to analyze:
   - HTTP endpoints (routes, handlers, middleware)
   - WebSocket message types (packet IDs, serialization)
   - API contracts (request/response schemas)
   - Authentication flow
   - Error handling patterns
3. Build endpoint inventory table: method, path, handler, auth required
4. Map packet definitions: ID, direction (C→S / S→C), payload schema
5. Identify cross-project contracts (client ↔ server)
6. Save output to `{project}/document/analysis/gdd_network.md`
7. Present summary: endpoint count, packet types, auth mechanism

### 5. `analyze_client`

**Purpose:** Client-specific analysis for Cocos2d-x JS or HTML5 projects.

Steps:
1. Read `scan_map.md` to identify client-specific files
2. Launch `sonnet` agent to analyze:
   - Scene hierarchy and transitions
   - UI layer architecture (HUD, popups, menus)
   - Asset loading pipeline
   - Global namespaces and singletons
   - Module system (legacy vs new architecture)
   - JSB compatibility patterns
3. Map scene graph: Scene → Layer → Component → Widget
4. Inventory global namespaces (e.g., `gv`, `fr`, `cc`)
5. List all module registrations
6. Save output to `{project}/document/analysis/gdd_client.md`
7. Present summary: scene count, module count, architecture style

### 6. `analyze_server`

**Purpose:** Server-specific analysis for Kotlin/Ktor or JVM projects.

Steps:
1. Read `scan_map.md` to identify server-specific files
2. Launch `sonnet` agent to analyze:
   - Entry point and application setup
   - Module/plugin architecture
   - Database schema (ORM models, tables, migrations)
   - Command handler registry
   - Session management
   - Deploy configuration (environments, modes)
3. Map module dependency graph
4. Extract database schema (tables, columns, relationships)
5. List all command handlers with their triggers
6. Save output to `{project}/document/analysis/gdd_server.md`
7. Present summary: module count, table count, command count

### 7. `synthesize_gdd`

**Purpose:** Merge all analysis outputs into a single comprehensive GDD.

Prerequisites: At least `scan_project` + one `analyze_*` command must be completed.

Steps:
1. Read all available analysis files from `{project}/document/analysis/`
2. Read GDD template from `templates/GDD_Final.md`
3. Launch `sonnet` agent to:
   - Merge all sections into unified structure
   - Resolve contradictions between analyses
   - Fill gaps with cross-referenced data
   - Add executive summary
   - Generate consistency matrix (design ↔ code)
4. Format into 7-section GDD structure:
   1. Project Overview
   2. Architecture Overview
   3. Module Details (Client/Server/Config/Core/Network)
   4. Game Rules & Constants
   5. Cross-Project Dependencies
   6. Implementation Plan
   7. Quality Assurance
5. Save output to `{project}/document/analysis/GDD_Final.md`
6. Present summary with key findings and recommendations

### 8. `full_analysis`

**Purpose:** Run complete analysis pipeline from scan to GDD synthesis.

This is the one-command automation that chains all steps:

Steps:
1. Create output directory: `{project}/document/analysis/`
2. Run `scan_project` → wait for completion
3. Launch parallel agents (where independent):
   - `analyze_config` (haiku, background)
   - `analyze_core` (sonnet, background)
   - `analyze_network` (sonnet, background)
4. Detect project type from scan results:
   - If client project → also run `analyze_client`
   - If server project → also run `analyze_server`
5. Wait for all agents to complete
6. Run `synthesize_gdd` to merge all outputs
7. Run `validate_result` on final GDD
8. Present executive summary with:
   - Total analysis time
   - Files analyzed
   - Key findings (top 5)
   - Recommendations

### 9. `validate_result`

**Purpose:** Validate any command output before trusting it.

Steps:
1. Identify which command just completed
2. Run automated checks:
   - **File existence**: All referenced files exist in the project
   - **Count accuracy**: File/module/endpoint counts match actual
   - **Schema validity**: Config schemas match actual file contents
   - **Cross-reference**: Internal references are consistent
3. Run spot-checks (3 random items):
   - Pick 3 random claims from the analysis
   - Verify each against actual source code using Grep/Read
   - Record pass/fail for each
4. Classify findings:
   - **CRITICAL**: Analysis claims something that doesn't exist, or misses major components
   - **WARNING**: Minor inaccuracies, counts off by small margin
   - **INFO**: Stylistic differences, naming conventions
5. Generate Validation Report:
   ```
   | Check | Status | Details |
   |-------|--------|---------|
   | File count | PASS | 586 files (actual: 586) |
   | Module count | WARNING | Claimed 12, found 15 |
   | Entry point | PASS | MainKt confirmed |
   ```
6. Decision rules:
   - All PASS → Save to memory, proceed
   - WARNING only → Proceed with caveats noted
   - Any CRITICAL → Stop, fix the specific issue, re-validate
   - Multiple CRITICAL → Re-run the entire command
7. On FAIL: Specify what needs fixing and which command to re-run

---

## Workflow Rules

1. **Read-only always**: Never modify source code. All outputs go to `document/analysis/`.
2. **Scan before analyze**: Always run `scan_project` first to build the file map.
3. **User approval at gates**: Present findings before writing files. Wait for user confirmation.
4. **Model-appropriate routing**: Use `haiku` for fast scans, `sonnet` for deep analysis. Never use `opus` unless user explicitly requests.
5. **Parallel where possible**: Independent analyses (config, core, network) run concurrently.
6. **Template-driven output**: Use templates from `templates/` as starting structure.
7. **Cross-project awareness**: Flag dependencies between sub-projects (e.g., MSerializer.js, ItemGroup.json).
8. **Validate every output**: Run `validate_result` after each analysis command automatically.
9. **Save to memory**: After each completed command, save key findings to auto-memory.
10. **Log everything**: Every command execution is timestamped in `analysis_log.md`.

---

## Response Format

All command responses follow this structure:

```markdown
## [Command Name] — [Project Name]

**Status**: Completed / In Progress / Failed
**Duration**: Xs
**Files Analyzed**: N

### Summary
[2-3 sentence executive summary]

### Key Findings
| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | ... | INFO/WARNING/CRITICAL | ... |

### Output Files
- `document/analysis/xxx.md` — [description]

### Next Steps
- [Recommended next command in pipeline]
```

---

## Quick Decision Guide

| User Request | Command(s) |
|---|---|
| "Analyze this project" | `full_analysis` |
| "What does this codebase do?" | `scan_project` → `analyze_core` |
| "Scan the project structure" | `scan_project` |
| "What configs are there?" | `scan_project` → `analyze_config` |
| "How does the networking work?" | `scan_project` → `analyze_network` |
| "Analyze the client" | `scan_project` → `analyze_client` |
| "Analyze the server" | `scan_project` → `analyze_server` |
| "Generate a GDD" | `full_analysis` |
| "Merge results into GDD" | `synthesize_gdd` |
| "Check if analysis is correct" | `validate_result` |
| "Reverse engineer this project" | `full_analysis` |
| "Map the event system" | `scan_project` → `analyze_core` |
| "What APIs does this have?" | `scan_project` → `analyze_network` |
