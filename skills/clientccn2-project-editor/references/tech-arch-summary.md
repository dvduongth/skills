# Technical Architecture Summary — Quick Reference

> Full source: `clientccn2/document/TechnicalArchitectureDocument.md` (16 sections, 768 lines)
> Read the full document for deep architecture work; this summary covers key lookup tables.

---

## Command ID Ranges (Network Protocol)

| Range | Module | Examples |
|-------|--------|---------|
| 1000-1099 | User/Profile | Login, profile update |
| 1100-1199 | Matching | Find game, cancel match |
| 1200-1399 | Game Room | Dice, move, cards, end game |

### Key Game Commands

| CMD ID | Name | Direction | Purpose |
|--------|------|-----------|---------|
| 1204 | PLAYER_TAKE_TURN | S→C | Designate active player |
| 1205 | ROLL_DICE | C→S→C | Roll dice, receive result |
| 1206 | GET_PATHS_CAN_MOVE | S→C | Valid destinations per token |
| 1207 | MOVE | C→S→C | Select token + destination |
| 1209 | SYNC_BOARD_DATA | S→C | Full board state sync |
| 1240 | USE_CARD | C→S→C | Play a skill card |
| 1290-1292 | CAST_ON_* | S→C | Apply effects to player/token/tile |
| 1300-1306 | Round Events | S→C | Round event activations |
| 1350 | END_GAME | S→C | Game result |
| 1360-1362 | Passive Skills | S→C | Passive ability triggers |

---

## Action Type Categories (30+)

| Category | Actions |
|----------|---------|
| **Movement** | ActionTokenMove, ActionTeleport, ActionBackward |
| **Economy** | ActionGainDiamond, ActionSubDiamond, ActionStealDiamond, ActionClaimDiamond, ActionDropDiamond, ActionMoveDiamond, ActionBuffDiamond |
| **Status** | ActionFreeze, ActionJail, ActionBreakJail |
| **Combat** | ActionKickAss, ActionSwapToken |
| **Cards** | ActionUseCard, ActionDrawCard, ActionRemoveCard |
| **Cast-On** | ActionCastOnFreeze, ActionCastOnJail, ActionCastOnRaiseTile |
| **Round Events** | ActionActiveRoundEvent |
| **Passives** | ActionBonusDiamond, ActionKeepDiamond, ActionExtraTurn |

### BaseAction Lifecycle

```
action()      → Execute (calls doAction)
doAction()    → Override in subclass (actual business logic)
doneAction()  → Signal completion (with delay for animations)
destroy()     → Cleanup
```

### ActionQueue API

```
queueAction(action)              → Add to tail, start processing
queueNestedAction(action)        → Insert at head (interrupt/high priority)
addActionToPool(action, phase)   → Defer to specific TriggerPhase
queueActionFromPool(phase)       → Dequeue all actions for a phase
```

---

## Event Categories (59 documented events, 15 categories)

| Category | Count | Examples |
|----------|-------|---------|
| Network | 5 | CONNECTED, DISCONNECTED, RECONNECTED |
| Game State | 7 | START_GAME, END_GAME, NEXT_TURN |
| Dice | 3 | RESULT_ROLL_DICE |
| Movement | 8 | TOKEN_MOVE, TELEPORT, MOVE_COMPLETE |
| Kicking | 2 | KICK_TOKEN |
| Economy | 10 | ADD_DIAMOND, TILE_UPDATE, BUFF_TILE |
| Ladder & Gate | 6 | UPDATE_LADDER_POINT, OPEN_GATE |
| Skills & Passives | 12 | SKILL_ACTIVE, USE_CARD, DRAW_CARD |
| Status Effects | 3 | TOKEN_FREEZE, TOKEN_JAIL |
| Round Events | 1 | ACTIVE_ROUND_EVENT |
| Action Queue | 5 | QUEUE_ACTION, COMPLETE_ACTION |
| UI | 18 | SELECTED_TOKEN, CLICK_TILE, CHAT |
| Scene | 6 | SCENE_ON_CHANGE, SCENE_ON_ENTER |
| Session | 5 | LOGIN_SUCCESS, LOGIN_FAIL |
| System | 5 | JSB_ON_PAUSE, LANGUAGE_CHANGED |

---

## Client Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                 PRESENTATION LAYER               │
│  SceneMgr → Scenes (Login, Lobby, Game, etc.)   │
│  GuiMgr → Popups, Dialogs, HUD components       │
│  Layer system (0-11 z-order layers)              │
├─────────────────────────────────────────────────┤
│                  MODULE LAYER                    │
│  ModuleMgr → 20+ BaseModule instances            │
│  Each module: command handlers + event dispatch  │
├─────────────────────────────────────────────────┤
│                   GAME LOGIC                     │
│  Game → Board, Players, ActionQueue              │
│  Actions, Skills, Passives, Round Events         │
├─────────────────────────────────────────────────┤
│                EVENT SYSTEM                      │
│  EventBus (new) + SignalMgr (legacy migration)  │
│  59+ documented events across 15 categories      │
├─────────────────────────────────────────────────┤
│                 FRAMEWORK LAYER                  │
│  Connector (network), ResourcesMgr (assets)     │
│  ServicesMgr (HTTP), AppContext (state store)    │
│  Platform plugins (Facebook, Google, Apple, IAP) │
├─────────────────────────────────────────────────┤
│               COCOS2D-X ENGINE                   │
│  cc.director, cc.view, cc.Sprite, cc.Node       │
└─────────────────────────────────────────────────┘
```

---

## Data Flow

### Server → Client (State Sync)

```
Server Packet (Binary)
    ↓
Connector.onListener() — receive raw buffer
    ↓
BaseModule.onListener(cmd, buf) — route to module
    ↓
PACKET_DECODER[cmd].extract(buf) — deserialize to JS object
    ↓
Module handler — update domain objects (Game, Board, Player, Token)
    ↓
EventBus.emit(EventKey.XXX, data) — notify UI subscribers
    ↓
UI components update (animations, labels, positions)
```

### Client → Server (Commands)

```
User Input (tap token, play card)
    ↓
UI handler — validate locally, prepare data
    ↓
Module.send(CMD.MOVE, { tokenId, steps })
    ↓
PACKET_ENCODER[cmd].zip(packet, data) — serialize
    ↓
Connector.sendPacket() — send to server
    ↓
Server validates → responds with result
```

### Reconnection Flow

1. Client detects disconnection → `NETWORK_DISCONNECTED` event
2. Automatic reconnect attempt
3. Server sends `SYNC_BOARD_DATA` — full board state
4. Client calls `Game.syncData(room, isReconnect=true)` — hydrate all objects
5. `Token.syncActionsCastOn()`, `Tile.syncActionsCastOn()` — restore status effects

---

## Core Domain Objects

| Object | Client File | Server File | Key Properties |
|--------|-------------|-------------|---------------|
| Game | `modules/game/logic/Game.js` | `room/logic/Room.kt` | board, players[], currentPlayerPos, curTurn, actionQueue, roundEvents |
| Board | `modules/game/logic/board/Board.js` | `room/logic/Board.kt` | tiles{}, tokens{}, tile graph (next/prev) |
| Tile | `modules/game/logic/board/Tile.js` | `room/bean/` | id, type, level, diamond, diamondFell, actionsCastOn |
| Token | `modules/game/logic/board/Token.js` | `room/bean/` | id, color, diamond, currentTile, actionsCastOn |
| Player | `modules/game/logic/Player.js` | `room/logic/Room.kt` | uId, color, DIAMOND (ladderPoint), deck, character, diceMode, consumables |
| Dice | `modules/game/logic/board/Dice.js` | Room actor states | mode (SINGLE/DOUBLE), values[] |
| Deck | `modules/game/logic/board/Deck.js` | — | hand[], pool[], discard[], sideDeck |

---

## Module Registry (20+ modules)

| Module | Property | Purpose |
|--------|----------|---------|
| LoginModule | `moduleMgr.loginModule` | Authentication |
| UserModule | `moduleMgr.userModule` | Player profile & inventory |
| **GameModule** | `moduleMgr.gameModule` | **Core game logic** |
| MatchingModule | `moduleMgr.matchingModule` | Matchmaking |
| ShopModule | `moduleMgr.shopModule` | Shop & gacha |
| QuestModule | `moduleMgr.questModule` | Quest management |
| LeagueModule | `moduleMgr.leagueModule` | League/ranking |
| BattlePassModule | `moduleMgr.battlePassModule` | Season pass |
| MailModule | `moduleMgr.mailModule` | In-game mail |
| TutorialModule | `moduleMgr.tutorialModule` | Tutorial/onboarding |
| ConsumableModule | `moduleMgr.consumableModule` | Consumable items |
| ChatModule | `moduleMgr.chatModule` | In-game chat |
| +8 others | ... | daily_reward, level, skill_tool, offer, pm, hot_news, etc. |

---

## Server Game Room State Machine

```
PrepareStartState → SetUpState → TakeTurnState → RollDiceState
                                       ↑               │
                                       │               ↓
                                  EndTurnState ← MoveState → AffectedByTilesState
                                       │
                                       ↓
                                  EndGameState
```

---

## Known Technical Debt (from Tech Doc §15)

### High Priority
| Issue | Impact |
|-------|--------|
| Dual event bus (SignalMgr + EventBus) | Confusion, inconsistent patterns |
| Low test coverage (10 test files for 20+ modules) | Risk of regressions |

### Medium Priority
| Issue | Impact |
|-------|--------|
| Global singletons (gv.*) | Hard to test, tight coupling |
| Mixed ES5/ES6 | Inconsistent code style |
| **Player.isOpenGate() uses 300 DIAMOND** | **GDD says 600 — must verify and fix** |

### Architecture Decision Records
- **ADR-001**: Server-Authoritative Design (Active)
- **ADR-002**: EventBus Migration Phase 1 (In Progress)
- **ADR-003**: KSP Code Generation for MSerializer (Active)
- **ADR-004**: Action Queue Pattern with phase deferral (Active)
