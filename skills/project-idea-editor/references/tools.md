# Project Idea Editor — Tools Reference

## Tool Usage by Command

### scan_project
| Tool | Purpose |
|------|---------|
| **Read** | Read `CLAUDE.md`, `GameDesignDocument.md`, `TechnicalArchitectureDocument.md` |
| **Glob** | Find all `.js` files in client, all `.kt` files in server |
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
DEMO/GameDesignDocument.md                               # GDD (authoritative)
TechnicalArchitectureDocument.md                         # Architecture doc
CLAUDE.md                                                # Project conventions
clientccn2/CLAUDE.md                                     # Client conventions
```

### Client Core
```
clientccn2/main.js                                       # Boot entry
clientccn2/src/events/EventBus.js                        # gv.bus
clientccn2/src/events/EventKeys.js                       # 45+ event constants
clientccn2/src/modules/game/logic/Game.js                # Main game state
clientccn2/src/modules/game/logic/action/ActionQueue.js  # Action queue
clientccn2/src/modules/game/logic/action/BaseAction.js   # Action base class
clientccn2/src/modules/game/logic/ActionType.js          # Action type constants
clientccn2/src/framework/core/ServiceContainer.js        # DI container
clientccn2/src/common/MSerializer.js                     # Auto-generated serializer
```

### Server Core
```
serverccn2/src/main/kotlin/org/ccn2/Main.kt              # Entry point
serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt  # Module registry
serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt    # Config singleton
serverccn2/src/main/kotlin/org/ccn2/modules/CmdDefine.kt # Command definitions
```

### Configs
```
clientccn2/res/config/Board.json                         # Board layout
clientccn2/res/config/Game.json                          # Game settings
serverccn2/res/Board.json                                # Server board config
serverccn2/configByMode/*/config/server.properties       # Deploy environments
```

---

## Build & Test Commands

```bash
# Client
cd clientccn2 && npm test                  # Jest tests
cd clientccn2 && npm run lint              # ESLint
cd clientccn2 && npm run lint:global       # Re-scan globals + lint
cd clientccn2 && npm run format            # Prettier

# Server
cd serverccn2 && ./gradlew run             # Full build + generate + run
cd serverccn2 && ./gradlew test            # All tests
cd serverccn2 && ./gradlew compileKotlin   # Compile check only

# Cross-project
cd serverccn2 && ./gradlew copyMSerializerJs    # Regenerate MSerializer.js
cd serverccn2 && ./gradlew generateItemGroup    # Regenerate ItemGroup.json
```
