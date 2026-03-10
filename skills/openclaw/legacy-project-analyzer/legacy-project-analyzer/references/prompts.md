# Legacy Project Analyzer — Prompt Templates

## 1. scan_project

```
You are a project structure analyzer. Scan the project at {project_path}.

Tasks:
1. List all top-level directories and their purposes
2. Count files by extension: .js, .kt, .json, .properties, .java, .html, .css
3. Exclude: node_modules, .git, build, dist, out, *.min.js
4. Identify entry points (main files, index files, Application classes)
5. Identify config directories (res/, config/, configByMode/)
6. Identify test directories
7. Map module boundaries (each distinct feature area)

Output format:
- Statistics table (total files, by type)
- Annotated directory tree
- Entry points list
- Module boundary table
- Key files table

Write output to: {project_path}/document/analysis/scan_map.md
```

## 2. analyze_config

```
You are a configuration schema extractor. Analyze configs in {project_path}.

Reference: Read scan_map.md first from {project_path}/document/analysis/

Tasks:
1. Find all JSON config files in res/, config/, configByMode/ directories
2. Find all .properties files
3. Search source code for constants: CONFIG, GAME_CONST, const, enum, object declarations
4. For each config file:
   - Extract top-level keys and their types
   - Note array sizes and object structures
   - Flag any sensitive values (DO NOT include actual values of passwords/tokens)
   - Note which source files reference this config
5. Build config dependency graph
6. If multiple environments exist (dev, qc, live), build environment comparison matrix

Output format:
- Config files inventory table
- Schema for each config (keys, types, sample structure)
- Constants and enums table
- Environment matrix (if applicable)
- Config dependency graph

Write output to: {project_path}/document/analysis/gdd_config.md
```

## 3. analyze_core

```
You are a game logic reverse-engineer. Analyze core logic in {project_path}.

Reference: Read scan_map.md first from {project_path}/document/analysis/

Tasks:
1. Find game rule files (search: rules, game, logic, engine, constants)
2. Extract all game constants (board size, win conditions, scoring, limits)
3. Map state machines:
   - Game states and transitions
   - Turn/round flow
   - Player states
4. Map event system:
   - Event names and their emitters
   - Event listeners/handlers
   - Event payload schemas
5. Map action/command system:
   - Action types and their handlers
   - Action queue flow
   - Priority and ordering rules
6. Identify design patterns (Observer, Command, State, Strategy, Factory, etc.)

Output format:
- Game rules table (rule, value, source file, line)
- State machine diagram (text-based)
- Event system table (event, emitter, listeners, payload)
- Action types table
- Design patterns table

Write output to: {project_path}/document/analysis/gdd_core.md
```

## 4. analyze_network

```
You are a network protocol analyst. Analyze networking in {project_path}.

Reference: Read scan_map.md first from {project_path}/document/analysis/

Tasks:
1. Find HTTP route definitions (search: route, get(, post(, endpoint, path)
2. Find WebSocket handlers (search: socket, ws, onMessage, onOpen)
3. Find packet/message definitions (search: packet, message, cmd, opcode, serialize)
4. For each endpoint:
   - HTTP method and path
   - Handler function location
   - Authentication requirement
   - Request/response schema
5. For each WebSocket message:
   - Message ID or opcode
   - Direction (client→server, server→client, bidirectional)
   - Payload schema
   - Handler function
6. Map serialization format (JSON, protobuf, custom binary)

Output format:
- HTTP endpoints table (method, path, handler, auth, description)
- WebSocket messages table (ID, direction, name, payload)
- Serialization format details
- Authentication flow diagram
- Cross-project contracts (client ↔ server message compatibility)

Write output to: {project_path}/document/analysis/gdd_network.md
```

## 5. analyze_client

```
You are a game client architecture analyst. Analyze the client at {project_path}.

Reference: Read scan_map.md first from {project_path}/document/analysis/

Tasks:
1. Map scene hierarchy:
   - All Scene classes and their purposes
   - Scene transitions (which scene leads to which)
   - Layer composition within scenes
2. Map UI architecture:
   - HUD components
   - Popup/dialog system
   - Menu structure
3. Map module system:
   - All registered modules
   - Module initialization order
   - Module dependencies
4. Map global namespaces:
   - Singletons (gv, fr, cc extensions)
   - Global state variables
   - Shared utilities
5. Identify architecture style:
   - Legacy patterns (signalMgr, fr.event)
   - New patterns (EventBus, gv.bus)
   - Migration status (% legacy vs new)
6. Check JSB compatibility patterns

Output format:
- Scene hierarchy diagram
- UI component tree
- Module registry table
- Global namespace inventory
- Architecture style analysis
- JSB compatibility notes

Write output to: {project_path}/document/analysis/gdd_client.md
```

## 6. analyze_server

```
You are a server architecture analyst. Analyze the server at {project_path}.

Reference: Read scan_map.md first from {project_path}/document/analysis/

Tasks:
1. Map application setup:
   - Entry point and bootstrap sequence
   - Plugin/module installation order
   - Configuration loading chain
2. Map module architecture:
   - All feature modules and their responsibilities
   - Module dependencies and communication patterns
   - Command handler registry
3. Map database schema:
   - All tables/entities with columns
   - Relationships (foreign keys, joins)
   - ORM patterns used (Exposed, Hibernate, etc.)
4. Map deploy infrastructure:
   - Environment configurations (dev, qc, live)
   - Key differences between environments
   - Deploy scripts and automation
5. Map game room architecture (if game server):
   - Room lifecycle
   - Player session management
   - Bot AI system
   - Turn/command processing

Output format:
- Bootstrap sequence
- Module dependency graph
- Database schema (table, columns, types, relationships)
- Command handler inventory
- Deploy environment matrix
- Game room architecture (if applicable)

Write output to: {project_path}/document/analysis/gdd_server.md
```

## 7. synthesize_gdd

```
You are a technical document synthesizer. Merge analysis results into a GDD.

Input files (read all from {project_path}/document/analysis/):
- scan_map.md
- gdd_config.md (if exists)
- gdd_core.md (if exists)
- gdd_network.md (if exists)
- gdd_client.md (if exists)
- gdd_server.md (if exists)

Tasks:
1. Read all available analysis files
2. Cross-reference findings:
   - Events mentioned in core → verify handlers in client/server
   - Config keys in config → verify usage in core logic
   - Network endpoints → verify client calls + server handlers
3. Identify gaps:
   - Components mentioned but not analyzed
   - References to missing files or modules
   - Incomplete flow chains
4. Resolve contradictions:
   - Config says X but code does Y → note both, flag discrepancy
5. Build unified GDD with sections:
   1. Project Overview (name, type, tech stack, team, status)
   2. Architecture Overview (high-level diagram, key patterns)
   3. Module Details (merged from all analyses)
   4. Game Rules & Constants (from core analysis)
   5. Cross-Project Dependencies (from scan + network)
   6. Consistency Matrix (design ↔ code alignment)
   7. Recommendations (refactoring, improvements, risks)

Write output to: {project_path}/document/analysis/GDD_Final.md
```

## 8. full_analysis

```
No dedicated prompt — this command orchestrates commands 1-7 sequentially.
See workflow.md for the complete pipeline.
```

## 9. validate_result

```
Validate the output of the last completed analysis command.

Input: The most recently written analysis file in {project_path}/document/analysis/

Validation Steps:
1. AUTOMATED CHECKS:
   a. File paths: Every file path mentioned in the analysis → Glob to verify it exists
   b. Counts: Every count claim (N files, N modules) → count with Glob/Bash
   c. Names: Every module/class/function name mentioned → Grep to verify it exists
   d. Config keys: Every config key mentioned → Read the actual config file to verify

2. SPOT-CHECKS (pick 3 random items):
   a. Random file claim: Pick a file described in analysis → Read it → verify description matches
   b. Random count claim: Pick a count → independently count → compare
   c. Random relationship claim: Pick a dependency/reference → Grep to verify the connection exists

3. SEVERITY CLASSIFICATION:
   - CRITICAL: File doesn't exist, count off by >20%, major feature missed
   - WARNING: Count off by 5-20%, minor inaccuracy in description
   - INFO: Naming convention difference, cosmetic issue

4. GENERATE REPORT:
   | Check | Type | Status | Expected | Actual | Severity |
   |-------|------|--------|----------|--------|----------|

5. DECISION:
   - All PASS → Approve, save key findings to memory
   - WARNING only → Approve with caveats noted
   - Any CRITICAL → Reject, specify fix, re-run command
   - 3+ CRITICAL → Re-run entire command from scratch
```
