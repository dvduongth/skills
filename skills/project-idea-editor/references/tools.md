# Project Idea Editor — Tools Reference

## Tool Usage by Command

### scan_project
| Tool | Purpose |
|------|---------|
| **Read** | Read `CLAUDE.md`, `documents/GameDesignDocument.md`, `documents/TechnicalArchitectureDocument.md` |
| **Glob** | Find all code file (eg:`.js`) files in client, all (eg:`.kt`) files in server |
| **Grep** | Search for module registrations, event keys, action types |
| **Agent (Explore)** | Deep exploration of client modules/, server modules/ (parallelize) |
| **Bash** | Count files, list directories |

### generate_tech_doc
| Tool | Purpose |
|------|---------|
| **Read** | Deep read of core source files (Game.js, Board.js, Main.kt, GameCfg.kt, etc.) |
| **Grep** | Find patterns, count usages |
| **Agent (Explore)** | Understand architecture across client + server |
| **Write** | Create/update TechnicalArchitectureDocument.md |

### edit_idea
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, Tech Doc, relevant source files |
| **Grep** | Find related implementations, event usages |
| **Agent (Explore)** | Understand affected modules on both sides |

### update_gdd
| Tool | Purpose |
|------|---------|
| **Read** | Read full GDD |
| **Edit** | Update GDD sections |

### check_design_consistency
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, Tech Doc, config JSONs, source code |
| **Grep** | Search for constant values in client + server code |
| **Agent (Explore)** | Cross-reference values across both codebases |

### generate_code_from_design
| Tool | Purpose |
|------|---------|
| **Read** | Read target files and existing patterns |
| **Write** | Create new source files (JS or Kotlin) |
| **Edit** | Modify existing files (registrations, imports, event keys) |
| **Bash** | Run `npm run lint:global`, `npm test`, `./gradlew test`, `./gradlew run` |

### refactor_codebase
| Tool | Purpose |
|------|---------|
| **Read** | Read legacy and new code patterns |
| **Edit** | Migrate code patterns |
| **Bash** | Run lint, tests on both sides |
| **Grep** | Find legacy patterns to migrate |

### validate_result
| Tool | Purpose |
|------|---------|
| **Bash** | Run `npm run lint`, `npm test`, `./gradlew compileKotlin`, `./gradlew test`, count files |
| **Grep** | Verify patterns: JSB violations, registrations, event keys, constant values |
| **Glob** | Verify file paths cited in output actually exist |
| **Read** | Spot-check: read random files to verify content matches output claims |

---

## Key File Paths Quick Reference

### Documents
```
documents/GameDesignDocument.md                               # GDD (authoritative)
documents/TechnicalArchitectureDocument.md                         # Architecture doc
CLAUDE.md                                                # Project conventions
_$project_name/CLAUDE.md                                     # Client conventions
```

### Client Core
```
client_$project_name/main.js                                       # Boot entry
client_$project_name/src/events/EventBus.js                        # gv.bus
client_$project_name/src/events/EventKeys.js                       # event constants
client_$project_name/src/modules/game/logic/Game.js                # Main game state
client_$project_name/src/modules/game/logic/action/ActionQueue.js  # Action queue
client_$project_name/src/modules/game/logic/action/BaseAction.js   # Action base class
client_$project_name/src/modules/game/logic/ActionType.js          # Action type constants
client_$project_name/src/framework/core/ServiceContainer.js        # DI container
client_$project_name/src/common/MSerializer.js                     # Auto-generated serializer
```

### Server Core
```
server_$project_name/src/main/kotlin/org/ccn2/Main.kt              # Entry point
server_$project_name/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt  # Module registry
server_$project_name/src/main/kotlin/org/ccn2/config/GameCfg.kt    # Config singleton
server_$project_name/src/main/kotlin/org/ccn2/modules/CmdDefine.kt # Command definitions
```

### Configs
```
client_$project_name/res/config/Board.json                         # Board layout
client_$project_name/res/config/Game.json                          # Game settings
server_$project_name/res/Board.json                                # Server board config
server_$project_name/configByMode/*/config/server.properties       # Deploy environments
```

---

## Build & Test Commands

```bash
# Client
cd client_$project_name && npm test                  # Jest tests
cd client_$project_name && npm run lint              # ESLint
cd client_$project_name && npm run lint:global       # Re-scan globals + lint
cd client_$project_name && npm run format            # Prettier

# Server
cd server_$project_name && ./gradlew run             # Full build + generate + run
cd server_$project_name && ./gradlew test            # All tests
cd server_$project_name && ./gradlew compileKotlin   # Compile check only

# Cross-project
cd server_$project_name && ./gradlew copyMSerializerJs    # Regenerate MSerializer.js
cd server_$project_name && ./gradlew generateItemGroup    # Regenerate ItemGroup.json
```
