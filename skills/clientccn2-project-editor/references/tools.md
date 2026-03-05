# ClientCCN2 Project Editor — Tools Reference

## Tool Usage by Command

### scan_client
| Tool | Purpose |
|------|---------|
| **Read** | Read `CLAUDE.md`, `main.js`, `EventKeys.js`, `ActionType.js`, `ConfigManager.js` |
| **Glob** | Find all `.js` files in modules/, game/logic/, action/, etc. |
| **Grep** | Search for patterns: module registrations, action types, event emits/listeners |
| **Agent (Explore)** | Deep exploration of modules/, framework/, game/logic/ |
| **Bash** | Count files, list directories |

### edit_client_idea
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, CLAUDE.md, relevant source files |
| **Grep** | Find related implementations, event usages |
| **Agent (Explore)** | Understand affected modules and action flow |

### manage_actions
| Tool | Purpose |
|------|---------|
| **Read** | Read `BaseAction.js`, `ActionQueue.js`, `ActionType.js`, target action files |
| **Write** | Create new action files |
| **Edit** | Modify `ActionType.js`, existing actions |
| **Grep** | Find action references, event emissions |

### manage_events
| Tool | Purpose |
|------|---------|
| **Read** | Read `EventBus.js`, `EventKeys.js` |
| **Edit** | Add new keys to `EventKeys.js` |
| **Grep** | Find all `gv.bus.emit`, `gv.bus.on`, `gv.signalMgr` usages |

### manage_modules
| Tool | Purpose |
|------|---------|
| **Read** | Read `BaseModule.js`, `ModuleMgr.js`, `BootSetup.js` |
| **Write** | Create new module files |
| **Edit** | Register module in `BootSetup.js` or `ModuleMgr` |
| **Bash** | Run `npm run lint:global` after new globals |

### manage_configs
| Tool | Purpose |
|------|---------|
| **Read** | Read `ConfigManager.js`, `BaseConfig.js`, JSON files |
| **Write** | Create new config loaders, new JSON files |
| **Edit** | Register in `ConfigManager.js` |
| **Grep** | Find config references in code |

### generate_client_code
| Tool | Purpose |
|------|---------|
| **Read** | Read target files and patterns |
| **Write** | Create new source files |
| **Edit** | Modify existing files |
| **Bash** | Run `npm run lint:global`, `npm test` |

### check_client_consistency
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, config JSONs, source code |
| **Grep** | Search for constant values in code |

### refactor_client
| Tool | Purpose |
|------|---------|
| **Read** | Read legacy and new code patterns |
| **Edit** | Migrate code patterns |
| **Bash** | Run `npm run lint:global`, `npm test` |
| **Grep** | Find legacy patterns to migrate |

### manage_ui
| Tool | Purpose |
|------|---------|
| **Read** | Read existing UI components, BaseScene, BaseGUI |
| **Write** | Create new UI files |
| **Edit** | Add to GameHUD, SceneFactory |

### validate_result
| Tool | Purpose |
|------|---------|
| **Bash** | Run `npm run lint`, `npm test`, JSB grep scans, count files |
| **Grep** | Verify patterns exist: template literals, const-in-loop, ES6 imports, signalMgr vs bus |
| **Glob** | Verify file paths cited in output actually exist |
| **Read** | Spot-check: read random files to verify content matches output claims |

---

## Key File Paths Quick Reference

### Core Architecture
```
clientccn2/main.js                                          # Boot entry
clientccn2/src/framework/core/ServiceContainer.js           # DI container
clientccn2/src/framework/core/AppContext.js                 # State management
clientccn2/src/framework/core/CoreServices.js               # Boot registry
clientccn2/src/events/EventBus.js                           # gv.bus
clientccn2/src/events/EventKeys.js                          # 45+ event constants
clientccn2/src/navigation/NavigationCoordinator.js          # Scene state machine
```

### Game Logic
```
clientccn2/src/modules/game/logic/Game.js                   # Main game state
clientccn2/src/modules/game/logic/Player.js                 # Player model
clientccn2/src/modules/game/logic/board/Board.js            # Board state
clientccn2/src/modules/game/logic/board/Token.js            # Token model
clientccn2/src/modules/game/logic/board/Tile.js             # Tile model
clientccn2/src/modules/game/logic/board/Dice.js             # Dice model
clientccn2/src/modules/game/logic/board/Deck.js             # Card deck
clientccn2/src/modules/game/logic/ActionType.js             # Action type constants
clientccn2/src/modules/game/logic/action/BaseAction.js      # Action base class
clientccn2/src/modules/game/logic/action/ActionQueue.js     # Queue processor
```

### Modules
```
clientccn2/src/modules/common/BaseModule.js                 # Legacy module base
clientccn2/src/modules/common/ModuleMgr.js                  # Module registry
clientccn2/src/modules/common/BaseCmd.js                    # Base command
clientccn2/src/modules/game/GameModule.js                   # Game module
clientccn2/src/modules/game/GameConst.js                    # Game constants
clientccn2/src/modules/config/ConfigManager.js              # Config loader
clientccn2/src/modules/config/BaseConfig.js                 # Config base
```

### UI
```
clientccn2/src/framework/ui/BaseGUI.js                      # Legacy GUI base
clientccn2/src/framework/ui/BaseScene.js                    # New scene base
clientccn2/src/framework/ui/SceneMgr.js                     # Scene manager
clientccn2/src/framework/ui/SceneFactory.js                 # Scene factory
clientccn2/src/framework/ui/GuiMgr.js                       # GUI panel manager
clientccn2/src/modules/game/ui/GameHUD.js                   # Main HUD
clientccn2/src/modules/game/ui/SceneGame.js                 # Game scene
```

### Network
```
clientccn2/src/common/MSerializer.js                        # Auto-generated serializer
clientccn2/src/framework/network/Connector.js               # Connection manager
clientccn2/src/framework/network/SerializerPacket.js        # Packet handling
```

### Configs
```
clientccn2/res/config/Board.json                            # Board layout
clientccn2/res/config/Game.json                             # Game settings
clientccn2/res/config/Card.json                             # Skill cards
clientccn2/res/config/Characters.json                       # Characters
clientccn2/res/config/Item.json                             # Items
clientccn2/res/config/ItemGroup.json                        # Generated from server
clientccn2/res/config/Passive.json                          # Passives
```

### Tests
```
clientccn2/tests/setup.js                                   # Global mocks
clientccn2/tests/mocks/cc-mock.js                           # Cocos API stubs
clientccn2/tests/framework/core/ServiceContainer.test.js
clientccn2/tests/framework/core/AppContext.test.js
clientccn2/tests/events/EventBus.test.js
```

### Documents
```
document/GameDesignDocument.md                              # GDD
TechnicalArchitectureDocument.md                            # Architecture
clientccn2/CLAUDE.md                                        # Client conventions
CLAUDE.md                                                   # Root project
```

---

## npm Commands Reference

```bash
# Testing
npm test                        # All Jest tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
npm run test:debug              # Debug mode
npx jest path/to/test.js        # Single file
npx jest --testNamePattern="X"  # By test name

# Linting
npm run lint                    # ESLint check
npm run lint:fix                # Auto-fix
npm run lint:src                # Lint src/gui, src/modules, src/utils only
npm run lint:global             # Re-scan globals + lint (REQUIRED after new global files)
npm run lint:global:fix         # Re-scan + auto-fix

# Formatting
npm run format                  # Prettier write
npm run format:check            # Check only

# Resources
npm run scan-resources          # Scan used resources
```

---

## JSB Compatibility Checklist

| Rule | Bad | Good |
|------|-----|------|
| No template literals | `` `Hello ${name}` `` | `"Hello " + name` |
| No const in loops | `for (const x of arr)` | `for (let x of arr)` |
| No ES6 modules | `import X from 'y'` | `var X = globalNamespace.X` |
| No arrow in extend | `action: () => {}` | `action: function() {}` |
| String concat | `` `${a}/${b}` `` | `a + "/" + b` |

---

## Action Type Catalog

### Diamond Actions
| Action | File | Event |
|--------|------|-------|
| ActionGainDiamond | action/ActionGainDiamond.js | ADD_DIAMOND |
| ActionDropDiamond | action/ActionDropDiamond.js | SUB_DIAMOND |
| ActionStealDiamond | action/ActionStealDiamond.js | ADD_DIAMOND + SUB_DIAMOND |
| ActionClaimDiamond | action/ActionClaimDiamond.js | ADD_DIAMOND |
| ActionBuffDiamond | action/ActionBuffDiamond.js | ADD_DIAMOND |
| ActionPaidDiamond | action/ActionPaidDiamond.js | SUB_DIAMOND |

### Status Effect Actions
| Action | File | Event |
|--------|------|-------|
| ActionJail | action/ActionJail.js | — |
| ActionBreakJail | action/ActionBreakJail.js | — |
| ActionFreeze | action/ActionFreeze.js | — |
| ActionRaiseTile | action/ActionRaiseTile.js | — |
| ActionBreakRaiseTile | action/ActionBreakRaiseTile.js | — |

### Movement Actions
| Action | File | Event |
|--------|------|-------|
| ActionKickAss | action/ActionKickAss.js | TOKEN_MOVE |
| ActionFXKickAss | action/ActionFXKickAss.js | — |
| ActionTeleport | action/ActionTeleport.js | TOKEN_TELEPORT |
| ActionTokenTeleport | action/ActionTokenTeleport.js | TOKEN_TELEPORT |
| ActionSwapToken | action/ActionSwapToken.js | TOKEN_MOVE |
| ActionExtraTurn | action/ActionExtraTurn.js | — |

### Card/Skill Actions
| Action | File | Event |
|--------|------|-------|
| ActionUseCard | action/ActionUseCard.js | USE_CARD |
| ActionBuffLadderPoint | action/ActionBuffLadderPoint.js | UPDATE_LADDER_POINT |
| ActionPlayerCastOn | action/ActionPlayerCastOn.js | — |
