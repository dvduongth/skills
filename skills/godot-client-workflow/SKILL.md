# Godot Client Workflow — CCN2 Development Automation Skill

**Version**: v1.0.0
**Created**: 2026-04-01
**Purpose**: Hướng dẫn quy trình phát triển tự động hóa cho CCN2 Godot Client (Godot 4.6.1)

---

## Triggers

Invoke skill này khi:
- Bắt đầu feature mới trong godot-client
- Cần hiểu convention code, 3-tier structure, module layout
- Setup môi trường development (editor, MCP, plugins)
- Agent pipeline cần reference workflow chuẩn

**Keywords**: "godot-client workflow", "3-tier", "module structure", "convention", "setup godot", "dev workflow", "scene hierarchy"

---

## 1. Environment Setup

### 1.1 Paths

| Component | Path |
|-----------|------|
| **Godot project** | `D:\PROJECT\CCN2\agent-teams\shared\godot-client\client-ai-godot\` |
| **Godot editor** | `D:\PROJECT\CCN2\agent-teams\shared\godot-client\editor\Godot_v4.6.1-stable_win64.exe` |
| **Console binary** | `D:\PROJECT\CCN2\agent-teams\shared\godot-client\editor\Godot_v4.6.1-stable_win64_console.exe` |
| **Server** | `D:\PROJECT\CCN2\agent-teams\shared\godot-client\server\` |
| **MCP setup** | `D:\PROJECT\CCN2\godot-mcp\` |
| **Constitution** | `D:\PROJECT\CCN2\agent-teams\shared\godot-client\CLAUDE.md` |

### 1.2 Editor Commands (from `client-ai-godot/`)

```bash
# Open editor
../editor/Godot_v4.6.1-stable_win64.exe -e

# Import project (first time)
../editor/Godot_v4.6.1-stable_win64_console.exe --import --headless

# Run client
../editor/Godot_v4.6.1-stable_win64.exe

# Headless mode
../editor/Godot_v4.6.1-stable_win64_console.exe --headless

# GUT tests
../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd

# Specific test
../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd -gtest=res://tests/<file>.gd
```

### 1.3 MCP Setup (Godot MCP)

**Source**: `D:\PROJECT\CCN2\godot-mcp\`

```powershell
# Install (Windows PowerShell)
irm https://gitlab.zingplay.com/gd/godot-mcp/-/raw/main/install.ps1 | iex

# Verify
godot-mcp status
```

**Config** — thêm vào `.mcp.json` (trong godot-client root hoặc Claude config):
```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "godot-mcp-connector"
    }
  }
}
```

**Plugin**: Đã có sẵn tại `client/addons/godot-mcp/` — chỉ cần enable trong Project Settings → Plugins.

### 1.4 Plugins Available

| Plugin | Path | Purpose |
|--------|------|---------|
| **GUT** | `client/addons/gut/` | Unit testing framework |
| **godot-mcp** | `client/addons/godot-mcp/` | MCP integration (Claude ↔ Godot Editor) |

---

## 2. Architecture — Module-Based Structure

### 2.1 Project Layout

```
shared/godot-client/
├── client/                           # Godot 4.6 project
│   ├── project.godot                 # Config: 1136x640, GL Compatibility
│   ├── autoloads/                    # 13 autoloads (5 domains)
│   │   ├── core/                     # Log, AppConfig, SceneManager, AnimStyle, LocaleService, ToastService, PopupService, DebugInspector
│   │   ├── network/                  # NetworkService, ReconnectService
│   │   ├── lobby/                    # LobbyService
│   │   ├── table/                    # GameService, GameLog
│   │   └── cheat/                    # ThumbCheat
│   ├── modules/                      # Feature modules (YOUR WRITE ZONE)
│   │   ├── loading/                  # Scene loading, initialization
│   │   ├── login/                    # User authentication
│   │   ├── lobby/                    # Matchmaking, room selection
│   │   ├── table/                    # Main game table
│   │   │   ├── scenes/console/       # Logic-only scenes
│   │   │   ├── scenes/proto/         # Layout prototypes
│   │   │   ├── scenes/full/          # Production scenes
│   │   │   └── scripts/              # Feature scripts
│   │   └── core/debug/              # ShowcaseOverlay, debug tools
│   ├── tests/                        # GUT test files
│   ├── assets/                       # Art, textures, fonts, audio
│   └── addons/                       # Plugins (gut, godot-mcp)
├── editor/                           # Bundled Godot 4.6.1 editor
├── server/                           # Backend (Docker Compose)
├── CLAUDE.md                         # Constitution — ALWAYS/NEVER rules
├── AGENTS.md                         # Agent coordination
└── COMPARISON_REPORT.md              # vs playtest analysis
```

### 2.2 Autoloads (13 services — USE, never modify)

| Domain | Autoload | Access |
|--------|----------|--------|
| **Core** | `Log` | `Log.info("msg")`, `Log.warn("msg")`, `Log.error("msg")` |
| **Core** | `AppConfig` | App configuration |
| **Core** | `SceneManager` | `SceneManager.goto("scene_name")` — ONLY place calling `change_scene_to_file()` |
| **Core** | `AnimStyle` | `AnimStyle.CARD_ENTER_DURATION` — centralized animation constants |
| **Core** | `LocaleService` | I18N — `tr("KEY")` |
| **Core** | `ToastService` | Toast notifications |
| **Core** | `PopupService` | Modal/dialog management |
| **Core** | `DebugInspector` | Runtime inspection |
| **Network** | `NetworkService` | Main transport layer — typed packet subscription |
| **Network** | `ReconnectService` | Auto-reconnection |
| **Lobby** | `LobbyService` | Lobby state, matchmaking |
| **Table** | `GameService` | Main game state management |
| **Table** | `GameLog` | Game event logging |

---

## 3. 3-Tier Scene Hierarchy (Core Concept)

### 3.1 Overview

```
Console (Tier 1)  →  Prototype (Tier 2)  →  Full (Tier 3)
Logic only            Layout + shapes         Art + animations
No visuals            ColorRect + Labels      Sprites + Spine + VFX
Headless testable     Screenshot testable     Full visual verification
```

### 3.2 Rules

| Tier | Folder | Content | Testing |
|------|--------|---------|---------|
| **Console** | `scenes/console/` | Pure logic — signals, state machine, game rules | Headless GUT tests |
| **Proto** | `scenes/proto/` | Composed of Console + adds layout (ColorRect, Labels, basic shapes) | Screenshot comparison |
| **Full** | `scenes/full/` | Composed of Proto + replaces shapes with real art, animations, VFX | Full visual verification + Rule 6 |

### 3.3 When to Use Each Tier

```
NEW FEATURE? → Always start with Console (logic first)
                ↓ logic works?
              → Add Proto (layout validation)
                ↓ layout works?
              → Add Full (art + polish)
```

**LogicCore = Source of Truth**: `{Module}LogicCore.gd` (extends Node) chứa state machine, signals, network handlers. **Không có inheritance giữa tiers** — Console/Proto/Full đều standalone.

### 3.4 Scene Composition Pattern (3-Tier Composition)

```gdscript
# {Module}LogicCore.gd — SOURCE OF TRUTH (extends Node, shared by all tiers)
class_name {Module}LogicCore
extends Node
signal state_changed(old: int, new: int)
signal action_completed(result: Dictionary)
# ... logic, network, state machine — NO UI references

# Scene{Module}Console.tscn — Tier 1 (debug, standalone)
# script: scene_{module}_console.gd (extends Control — NOT LogicCore)
# Creates LogicCore directly: logic_core = {Module}LogicCore.new(); add_child(logic_core)
# Wires signals → debug Labels

# Scene{Module}Proto.tscn — Tier 2 (placeholder art, standalone)
# script: scene_{module}_proto.gd (extends Control — NOT Console)
# @onready var logic_core: {Module}LogicCore = $LogicCore
# _ready(): logic_core.setup() → _build_ui() → {Module}ProtoSignalWiring.connect_all(self)
# UI built in code: ColorRect + Label

# Scene{Module}Full.tscn — Tier 3 (production art, standalone)
# script: scene_{module}_full.gd (extends Control — NOT Proto)
# @onready var logic_core: {Module}LogicCore = $LogicCore
# @onready refs from .tscn (TextureButton, art assets)
# _ready(): logic_core.setup() → _init_ui() → {Module}FullSignalWiring.connect_all(self)
```

> Canonical reference implementation: `modules/login/` — xem `login_logic_core.gd`, `scene_login_proto.gd`, `scene_login_full.gd`.

---

## 4. Code Conventions (Source: godot-client CLAUDE.md + rules/)

### 4.1 Naming Conventions

| Type | Rule | Example |
|------|------|---------|
| Scene file | `PascalCase.tscn` | `PlayerCharacter.tscn` |
| Script file | `snake_case.gd` | `player_character.gd` |
| class_name | Domain prefix + PascalCase | `ChrPlayer`, `UIHud`, `EnmBoss` |
| Test file | `snake_case.test.gd` | `player_character.test.gd` |
| Showcase file | `snake_case.showcase.gd` | `player_character.showcase.gd` |

### 4.2 Domain Prefixes

| Domain | Prefix | Example |
|--------|--------|---------|
| Character/Player | `Chr` | `ChrPlayer` |
| Enemy | `Enm` | `EnmPatrol`, `EnmBoss` |
| UI/Screen/Widget | `UI` | `UIHud`, `UIMainMenu` |
| Item/Pickup | `Itm` | `ItmWeapon`, `ItmCoin` |
| Effect/VFX | `Vfx` | `VfxExplosion` |
| Data/Resource | `Dat` | `DatPlayerStats` |
| State | `St` | `StPlayerIdle` |
| Autoload | *(no prefix)* | `GameManager`, `Log` |

### 4.3 Script Structure (Fixed Order)

```gdscript
class_name ChrPlayer
extends CharacterBody2D

# 1. Signals
signal health_changed(new_value: int)

# 2. Enums
enum State { IDLE, RUNNING, JUMPING }

# 3. Constants
const MAX_SPEED: float = 400.0

# 4. @export variables
@export var move_speed: float = 200.0

# 5. @onready variables
@onready var sprite: Sprite2D = $Sprite2D

# 6. Regular variables
var current_health: int = 100
var _attack_cooldown: float = 0.0  # private: _underscore prefix

# 7. Lifecycle methods
func _ready() -> void:
    ShowcaseOverlay.attach_if_standalone(self)

func _process(delta: float) -> void:
    pass

# 8. Public methods
func take_damage(amount: int) -> void:
    pass

# 9. Private methods
func _update_animation_state() -> void:
    pass

# 10. Signal handlers
func _on_HitboxArea_body_entered(body: Node) -> void:
    pass
```

### 4.4 Critical Rules

| Rule | Detail |
|------|--------|
| **Max 300 lines** | Per .gd file. Split: extract to `{base}_{domain}.gd` or sub-scene |
| **Type safety** | ALL vars/params/returns must have explicit types |
| **AnimStyle** | NEVER hardcode duration/easing — use `AnimStyle.CONSTANT` |
| **Signal-first** | Children emit up, never call parent methods |
| **@onready** | For ALL node refs. No `get_node()` in `_ready()` |
| **No magic numbers** | Use `const` with descriptive names |
| **No hardcode paths** | Use `@export var scene: PackedScene` instead of `load("res://...")` |
| **ShowcaseOverlay** | ALL scene components MUST call `ShowcaseOverlay.attach_if_standalone(self)` |
| **I18N** | Use `tr("KEY")` for all user-visible strings |

---

## 5. ShowcaseOverlay Pattern (Component Testing)

### 5.1 How It Works

```
F6 on any scene → ShowcaseOverlay auto-attaches → test buttons appear
Embed in parent scene → nothing happens (zero production cost)
```

### 5.2 Implementation

```gdscript
# production script: card_slot.gd
class_name UICardSlot
extends Control

func _ready() -> void:
    # ... normal logic ...
    ShowcaseOverlay.attach_if_standalone(self)  # ALWAYS last line of _ready()
```

```gdscript
# showcase file: card_slot.showcase.gd (same directory)
class_name UICardSlotShowcase
extends UICardSlot

func _test_empty() -> void:
    # shows empty slot state
    pass

func _test_with_card() -> void:
    # shows slot with card
    pass

func _test_selected() -> void:
    # shows selected state
    pass
```

### 5.3 Rules

- `.showcase.gd` MUST NOT declare `@onready` vars (inherits from production)
- `.showcase.gd` MUST `extends` production class directly
- Every `_test_*` function = one button in overlay
- Export filter: `**/*.showcase.gd` excluded from builds

---

## 6. Testing (GUT Framework)

### 6.1 Test Location

```
client/tests/
├── <module>/           # Tests organized by module
│   ├── *.test.gd       # Unit tests
│   └── ...
└── ...
```

### 6.2 Test Commands

```bash
# All tests
../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd

# Specific test file
../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd -gtest=res://tests/<file>.gd

# Specific test method
../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd -gtest=res://tests/<file>.gd -gunit_test_name=test_method_name
```

### 6.3 Test-First Workflow (TDD)

```
1. RED   — Write failing test
2. GREEN — Minimal code to pass
3. REFACTOR — Clean up, keep tests green
```

---

## 7. godot-client Internal Pipeline (7 agents)

godot-client has its own internal pipeline (`.claude/agents/`):

```
Orchestrator → Analyzer → Planner → Implementer → Reviewer → Tester → Finalizer
```

### Integration with agent-teams (9 agents)

| agent-teams Agent | godot-client Phase | Relationship |
|-------------------|-------------------|--------------|
| agent_dev_godot | Implementer | Writes code to `client/modules/` |
| agent_qc2 | Reviewer | Code review + quality gate |
| agent_playtest | Tester | Smoke test + visual verification |
| agent_qc1 | Planner (indirect) | Test cases feed into Tester |

> **Rule**: Orchestrator is the sole entry point for code changes within godot-client. agent_dev_godot should coordinate with Orchestrator when making changes.

---

## 8. Feature Development Workflow (Step-by-Step)

### 8.1 New Feature (Full Flow)

```
Step 1: Read GDD + TECH_DESIGN_SPEC
  └── shared/concepts/GDD_Overview_v2_ElementalHunter.md

Step 2: Read godot-client CLAUDE.md (conventions)
  └── shared/godot-client/CLAUDE.md

Step 3: Create module folder
  └── client/modules/<feature>/
      ├── scenes/console/   ← Start here (logic first)
      ├── scenes/proto/
      ├── scenes/full/
      └── scripts/

Step 4: TDD — Write Console tier
  ├── Write test: tests/<feature>/scene_<name>_console.test.gd
  ├── Run test (RED): ../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd
  ├── Implement: modules/<feature>/scenes/console/ + scripts/
  └── Run test (GREEN)

Step 5: Add Proto tier
  ├── Compose Console scene
  ├── Add ColorRect + Label layout
  ├── Add .showcase.gd for visual testing
  └── F6 to test standalone

Step 6: Add Full tier
  ├── Compose Proto scene
  ├── Replace shapes with art
  ├── Add AnimStyle animations
  ├── Add I18N strings
  └── Visual verification (MCP screenshot or headless)

Step 7: Self-review
  ├── Check: max 300 lines per script?
  ├── Check: all types explicit?
  ├── Check: ShowcaseOverlay attached?
  ├── Check: signals (not parent calls)?
  ├── GitNexus: gitnexus_detect_changes()
  └── Run all tests: GREEN

Step 8: Submit for QC
  └── STATUS_UPDATE → agent_leader
```

### 8.2 Bug Fix Flow

```
Step 1: Read bug report
Step 2: gitnexus_impact(target) — check blast radius
Step 3: Write failing test (reproduces bug)
Step 4: Fix code (minimal change)
Step 5: Run tests (all GREEN)
Step 6: gitnexus_detect_changes() — verify scope
Step 7: Submit fix
```

---

## 9. Server Integration

### 9.1 Docker Compose (from `shared/godot-client/server/`)

```bash
docker-compose up -d
# Ports:
#   1101 — WebSocket
#   1102 — HTTP
#   8081 — Admin
#   11211 — Memcached
```

### 9.2 Network Protocol

- **Transport**: WebSocket (typed packet subscription via NetworkService autoload)
- **Pattern**: Subscribe to packet type → handler receives typed data
- **Recording**: NetworkRecorder for offline replay testing

---

## 10. Legacy Migration Notes

> `shared/playtest/` is **DEPRECATED** — reference only, will be removed.

### What changed (playtest → godot-client)

| Aspect | playtest (OLD) | godot-client (NEW) |
|--------|---------------|-------------------|
| Engine | Godot 4.2 | Godot 4.6.1 |
| Structure | Flat `src/` | Module-based `modules/` |
| Scenes | Single-tier | 3-tier (Console/Proto/Full) |
| Testing | GdUnit4 | GUT |
| Autoloads | 8 unorganized | 13 organized (5 domains) |
| Naming | EH-prefix | Domain prefix (Chr, UI, Enm, etc.) |
| Debug | print() | Log service + DebugInspector + ShowcaseOverlay |
| Animation | Hardcoded | AnimStyle constants |
| I18N | None | Full (VI + EN) |
| GitNexus | 862 symbols | 13,561 symbols |
| MCP | godot-mcp | godot-mcp (same addon) |

### For agents referencing legacy paths

| Old Path | New Path |
|----------|----------|
| `shared/playtest/godot/src/` | `shared/godot-client/client-ai-godot/modules/` |
| `shared/playtest/godot/tests/` | `shared/godot-client/client-ai-godot/tests/` |
| `shared/playtest/server/` | `shared/godot-client/server/` |
| `shared/playtest/godot/CONVENTIONS.md` | `shared/godot-client/CLAUDE.md` |
| `Editor_Godot/godot...exe` | `../editor/Godot_v4.6.1-stable_win64.exe` |

---

*Skill created: 2026-04-01 — CCN2 Godot Client Development Workflow v1.0.0*
