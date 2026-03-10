# Legacy-Project-Analyzer

## Overview
This skill automates legacy project analysis by orchestrating specialized sub-agents to generate comprehensive Game Design Documents (GDDs). It serves as an autonomous project manager that:
- Breaks down complex analysis into micro-tasks
- Assigns tasks to optimal AI models (cost/performance balance)
- Monitors execution with safety checks
- Synthesizes results into structured GDD format

## Scope
- **Target Projects**: Cocos2d-x JS game clients, Kotlin/Ktor servers, Node.js services
- **Analysis Coverage**:
  - Project structure mapping
  - Config/data schema extraction
  - Core game logic analysis
  - Network/API interface review
  - Event system auditing
- **Exclusions**:
  - Direct code modification
  - External network calls
  - Binary asset processing

## Inputs & Outputs
All outputs go to `{project}/document/analysis/` directory
| Type | Input | Output | Path |
|------|-------|--------|------|
| **Input** | Project root path | GDD Final | /{project}/docs/GDD_Final.md |
| **Input** | Project root path | Summary Report | /{project}/temp/gdd_summary.md |
| **Input** | Project root path | Log File | /{project}/logs/legacy_analyzer.log |
| **Input** | Project root path | Scan Map | /{project}/temp/scan_map.md |
| **Input** | Project root path | Config Schema | /{project}/temp/gdd_config.md |
| **Input** | Project root path | Core Analysis | /{project}/temp/gdd_core.md |
| **Input** | Project root path | Network Analysis | /{project}/temp/gdd_network.md |

## Modules
### 1. Surface Scan
```markdown
- Purpose: Discover project structure
- Tools: `read`, `exec ls`
- Exclusions: node_modules, .git, build directories
- Output: Project directory tree map
- Prompt: 
  "Read the directory tree of the project root. Exclude node_modules, .git, build. Produce a Markdown map with top-level folders and key files. Output to /{project}/temp/scan_map.md. Limit to 5 steps."
```

### 2. Master Plan & Micro-tasking
```markdown
- Purpose: Break analysis into atomic tasks
- Tools: `write`, `memory_search`
- Process:
  1. Read all project files
  2. Identify key areas (config, logic, networking)
  3. Generate task tree with dependencies
- Output: Task tree structure
```

### 3. Sub-agent orchestration
```markdown
- Purpose: Assign tasks to optimal models
- Tools: `sessions_spawn` with model routing
- Model Routing:
  - **Fast (Gemini-2.5-flash)**: Surface scanning
  - **Balanced (Claude-3.7-sonnet)**: Config analysis
  - **Premium (GPT-4o)**: Logic & event analysis
- Command:
  openclaw skill run Legacy-Project-Analyzer /path/to/project
```

### 4. Synthesis
```markdown
- Purpose: Merge analysis results into GDD
- Tools: `write`, `memory_search`
- Process:
  1. Parse all temporary outputs
  2. Resolve architectural gaps
  3. Format into GDD structure
- Output: Structured GDD document
```

### 5. Logging & Auditing
```markdown
- Purpose: Track execution
- Tools: `write`
- Format:
  [2026-03-10 09:24] Task 1: Surface Scan started
  [2026-03-10 09:25] Task 1: Completed (5 steps)
```

### 6. Safety & Sandboxing
```markdown
- Purpose: Prevent accidental writes
- Tools: `exec` with `sandbox=inherit`
- Rules:
  - No write access to project root
  - All outputs go to `/{project}/temp/`
  - Sensitive data filtered (no secrets)
```

## Task Structure
| Task ID | Task Name | Model | Output Path | Step Limit | Timeout |
|---------|-----------|-------|-------------|------------|---------|
| 1 | Surface Scan | Gemini-2.5-flash | /{project}/temp/scan_map.md | 5 | 90s |
| 2 | Config/Data Schemas | Claude-3.7-sonnet | /{project}/temp/gdd_config.md | 5 | 120s |
| 3 | Core Logic & Event Flow | GPT-4o | /{project}/temp/gdd_core.md | 5 | 180s |
| 4 | Networking & API | GPT-4o | /{project}/temp/gdd_network.md | 3 | 150s |
| 5 | Synthesis | GPT-4o | /{project}/docs/GDD_Final.md | 5 | 240s |

## Execution Workflow
1. **Trigger**: User runs `openclaw skill run Legacy-Project-Analyzer /path/to/project`
2. **Initialization**: 
   - Create output directories (`/{project}/docs`, `/{project}/temp`, `/{project}/logs`)
   - Generate task tree
3. **Sub-agent Launch**:
   - Spawn 3-4 concurrent agents with model-specific prompts
   - Monitor agent progress via `sessions_list`
4. **Validation**:
   - Run `validate_result` after each task
   - Check for critical failures (JSB compat, lint errors)
5. **Finalization**:
   - Merge outputs into GDD
   - Generate summary report
   - Update MEMORY.md with key findings

## Implementation Checklist
- [ ] Create `SKILL.md` with all sections
- [ ] Implement task tree generation logic
- [ ] Add error handling for stuck agents
- [ ] Set up timeout enforcement
- [ ] Create test project for validation
- [ ] Add documentation to `/{project}/docs/`
- [ ] Integrate with OpenClaw's cron system

## Example Usage
```bash
# Analyze clientccn2 project
openclaw skill run Legacy-Project-Analyzer /clientccn2

# Check status
openclaw skill status Legacy-Project-Analyzer

# View results
cat /{project}/docs/GDD_Final.md
```

## Final Output Format
```markdown
# Legacy Project Analysis Report

## Project Overview
- Project: clientccn2
- Analysis Time: 2026-03-10 09:24:32 UTC

## Key Findings
- 12 modules identified
- 4 major event systems
- 3 network APIs

## Game Rules
| Rule | Value | Status |
|------|-------|--------|
| Main track tiles | 44 | ✅ |
| Win DIAMOND | 600 | ⚠️ |

## Conclusion
The project is 92% consistent with GDD v2.0. Recommend refactoring action queue system.
```

## Next Steps
1. Deploy this skill via `openclaw skill install`
2. Test with sample project structure
3. Add error handling for agent failures
4. Create a comprehensive test suite
5. Document all workflow transitions