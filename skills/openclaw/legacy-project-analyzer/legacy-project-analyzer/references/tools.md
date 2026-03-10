# Legacy Project Analyzer — Tools Reference

## Tools by Command

### 1. scan_project

| Tool | Usage | Example |
|------|-------|---------|
| `Bash` | List directories, count files | `ls -la {path}` |
| `Glob` | Find files by extension | `**/*.js`, `**/*.kt`, `**/*.json` |
| `Grep` | Find entry points | `pattern: "main\|entry\|Application"` |
| `Write` | Save scan_map.md | Output to `{project}/document/analysis/scan_map.md` |
| `Agent(Explore, haiku)` | Delegated scanning | Fast parallel file discovery |

**Exclude patterns for Glob**:
```
node_modules/**
.git/**
build/**
dist/**
out/**
**/*.min.js
**/*.map
```

### 2. analyze_config

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read scan_map.md for file list | `{project}/document/analysis/scan_map.md` |
| `Glob` | Find config files | `**/res/**/*.json`, `**/*.properties` |
| `Read` | Read each config file | Extract schema from JSON/properties |
| `Grep` | Find constants in source | `pattern: "const\|CONFIG\|GAME_CONST\|enum"` |
| `Write` | Save gdd_config.md | Output to analysis directory |
| `Agent(Explore, haiku)` | Delegated config scanning | Fast pattern extraction |

### 3. analyze_core

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read scan_map.md | Reference for file locations |
| `Grep` | Find game rules | `pattern: "rules\|win\|score\|board\|tile"` |
| `Grep` | Find state machines | `pattern: "state\|phase\|TURN\|ROUND\|transition"` |
| `Grep` | Find events | `pattern: "emit\|dispatch\|addEventListener\|on\\("` |
| `Grep` | Find actions | `pattern: "action\|command\|handler\|execute"` |
| `Read` | Deep-read key files | Entry points, rule files, event buses |
| `Write` | Save gdd_core.md | Output to analysis directory |
| `Agent(Explore, sonnet)` | Delegated logic analysis | Deep understanding needed |

### 4. analyze_network

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read scan_map.md | Reference for file locations |
| `Grep` | Find routes | `pattern: "route\|get\\(\|post\\(\|endpoint\|path"` |
| `Grep` | Find WebSocket | `pattern: "socket\|ws\|onMessage\|webSocket"` |
| `Grep` | Find packets | `pattern: "packet\|opcode\|serialize\|MSerializer"` |
| `Read` | Read handler files | Extract request/response schemas |
| `Write` | Save gdd_network.md | Output to analysis directory |
| `Agent(Explore, sonnet)` | Delegated network analysis | Protocol understanding needed |

### 5. analyze_client

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read scan_map.md | Reference for file locations |
| `Grep` | Find scenes | `pattern: "Scene\|Layer\|extends cc\\."` |
| `Grep` | Find UI components | `pattern: "Widget\|Button\|Label\|Popup"` |
| `Grep` | Find modules | `pattern: "module\|register\|gv\\.\|fr\\."` |
| `Grep` | Find globals | `pattern: "window\\.\|global\|singleton"` |
| `Read` | Read module files | Deep analysis of architecture |
| `Write` | Save gdd_client.md | Output to analysis directory |
| `Agent(Explore, sonnet)` | Delegated client analysis | Architecture understanding |

### 6. analyze_server

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read scan_map.md | Reference for file locations |
| `Grep` | Find entry point | `pattern: "fun main\|Application\|embeddedServer"` |
| `Grep` | Find modules | `pattern: "install\|routing\|module"` |
| `Grep` | Find database | `pattern: "Table\|Entity\|Column\|exposed\|query"` |
| `Grep` | Find commands | `pattern: "CommandHandler\|handleCommand\|cmd"` |
| `Glob` | Find deploy configs | `**/configByMode/**`, `**/server.properties` |
| `Read` | Read config files | Environment comparison |
| `Write` | Save gdd_server.md | Output to analysis directory |
| `Agent(Explore, sonnet)` | Delegated server analysis | Architecture understanding |

### 7. synthesize_gdd

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read ALL analysis files | All `gdd_*.md` + `scan_map.md` |
| `Read` | Read GDD template | `templates/GDD_Final.md` |
| `Grep` | Cross-reference verification | Verify claims across analyses |
| `Write` | Save GDD_Final.md | Final synthesized document |
| `Agent(general-purpose, sonnet)` | Delegated synthesis | Complex merging + gap resolution |

### 8. full_analysis

| Tool | Usage | Example |
|------|-------|---------|
| `Bash` | Create output directory | `mkdir -p {project}/document/analysis` |
| `Agent(Explore, haiku)` | Phase 1: scan | Background scan |
| `Agent(Explore, haiku)` | Phase 2a: config | Background, parallel |
| `Agent(Explore, sonnet)` | Phase 2b: core | Background, parallel |
| `Agent(Explore, sonnet)` | Phase 2c: network | Background, parallel |
| `Agent(Explore, sonnet)` | Phase 3: specialize | Client or server |
| `Agent(general-purpose, sonnet)` | Phase 4: synthesize | Merge all results |

### 9. validate_result

| Tool | Usage | Example |
|------|-------|---------|
| `Read` | Read the analysis file to validate | Last written output |
| `Glob` | Verify file paths exist | Check every mentioned path |
| `Grep` | Verify names exist in code | Check module/class/function names |
| `Read` | Spot-check: read random file | Verify description matches |
| `Bash` | Count verification | `find . -name "*.js" | wc -l` |

---

## Agent Dispatch Patterns

### Haiku Agent (fast scan)
```
Agent(
  subagent_type: "Explore",
  model: "haiku",
  description: "Scan {target}",
  prompt: "{scan prompt from prompts.md}"
)
```
Use for: `scan_project`, `analyze_config`

### Sonnet Agent (deep analysis)
```
Agent(
  subagent_type: "Explore",
  model: "sonnet",
  description: "Analyze {target}",
  prompt: "{analysis prompt from prompts.md}"
)
```
Use for: `analyze_core`, `analyze_network`, `analyze_client`, `analyze_server`

### Sonnet General Agent (synthesis)
```
Agent(
  subagent_type: "general-purpose",
  model: "sonnet",
  description: "Synthesize GDD",
  prompt: "{synthesis prompt from prompts.md}"
)
```
Use for: `synthesize_gdd`

### Background Agent (parallel)
```
Agent(
  ...,
  run_in_background: true
)
```
Use for: Phase 2 parallel analyses in `full_analysis`

---

## Output Directory Setup

```bash
mkdir -p "{project}/document/analysis"
```

All outputs are written to `{project}/document/analysis/`:
- `scan_map.md`
- `gdd_config.md`
- `gdd_core.md`
- `gdd_network.md`
- `gdd_client.md`
- `gdd_server.md`
- `GDD_Final.md`
- `analysis_log.md`
