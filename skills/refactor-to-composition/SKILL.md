# refactor-to-composition

**Owner**: agent_dev_godot (Client Dev) + agent_dev (Tech Lead review)
**Phase**: 3-implement (refactor variant)
**Purpose**: Refactor a module from inheritance-based 3-tier (Full extends Proto extends Console) to composition-based 3-tier (shared LogicCore + tier-specific SignalWiring), following legacy-client's table module pattern.

---

## When to Use

- Module has 3-tier inheritance chain where Full overrides Proto overrides Console
- Full tier duplicates/bypasses components instead of reusing them
- Logic (state machine, signals, network) is tangled with UI code in base tier
- Adding a new tier requires understanding the full inheritance chain
- Testing requires instantiating the full inheritance hierarchy

**Do NOT use** when:
- Module is single-tier (no tiers to refactor)
- Module is < 200 LOC total (overhead not worth it)
- Module has no shared logic between tiers (each tier is truly independent)

---

## Reference Architecture (from legacy-client table module)

```
{Module}LogicCore (Node — shared between all tiers)
  ├── State machine (GameState / LoginState / etc.)
  ├── Network handlers (PacketLogic)
  ├── ActionQueue (FIFO event sequencing)
  ├── EventBus signals (typed events)
  └── Readonly accessors for all shared state

SceneTableConsole (standalone Control)
  └── Creates LogicCore directly (no @onready)
  └── ConsoleBot for auto-testing
  └── Direct signal connections → logging

SceneTablePrototype (standalone Control)
  └── @onready logic_core: TableLogicCore = $TableLogicCore
  └── ProtoSignalWiring.connect_all(self) — bus→proto UI
  └── Scene-defined + code-built UI

SceneTableFull (standalone Control — does NOT extend Prototype)
  └── @onready logic_core: TableLogicCore = $TableLogicCore
  └── FullSignalWiring.connect_all(self) — bus→full UI + cutscenes
  └── Scene-defined + code-built UI (production art)
```

**Key principles:**
1. **No inheritance between tiers** — each tier is standalone `extends Control`
2. **LogicCore is a Node** — lives as child in scene tree, found via `@onready`
3. **SignalWiring helpers are RefCounted** — not Nodes, just connect signals
4. **Console creates objects directly** — no LogicCore node needed (simpler)
5. **done() callback pattern** — EventBus events carry `done: Callable`, presentation calls it when ready

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_name` | string | yes | Module to refactor: "login", "lobby", etc. |
| `module_path` | string | yes | Path: `modules/{module}/` |
| `legacy_reference` | string | no | Legacy module to study: `legacy-client/modules/{module}/` |

---

## Workflow

### Step 1 — Analyze Current Architecture

Read all tier files in the module. For each file, extract:

```markdown
| File | Class | Extends | LOC | Responsibility |
|------|-------|---------|-----|---------------|
| scene_{module}_console.gd | Scene{Module}Console | Control | N | Logic: ... |
| scene_{module}_proto.gd | Scene{Module}Proto | Scene{Module}Console | N | UI: ... |
| scene_{module}_full.gd | Scene{Module}Full | Scene{Module}Proto | N | Art: ... |
```

Then classify each method as:

| Method | Category | Tier | Move To |
|--------|----------|------|---------|
| `_set_state()` | Logic | Console | LogicCore |
| `start_login()` | Logic | Console | LogicCore |
| `_build_proto_ui()` | UI | Proto | Stay in Proto |
| `_wire_component_signals()` | Wiring | Proto | ProtoSignalWiring |
| `_on_social_icon_pressed()` | UI | Full | Stay in Full |
| `_load_texture()` | Utility | Full | Stay in Full |

**Categories:**
- **Logic**: State machine, network, session, timeout → moves to LogicCore
- **UI**: Node creation, layout, visual setup → stays in tier
- **Wiring**: Signal connections between logic and UI → moves to SignalWiring helper
- **Utility**: Asset loading, helpers → stays in tier or shared utility

### Step 2 — Design LogicCore

Create `{module}_logic_core.gd`:

```gdscript
class_name {Module}LogicCore
extends Node

# --- Internal state ---
var _state: int = State.IDLE
var _session_key: String = ""

# --- Typed signals (EventBus pattern) ---
signal state_changed(old_state: int, new_state: int)
signal login_requested(session_key: String)
signal login_completed(user_info: Dictionary)
signal login_failed(error_code: int)

# --- State enum ---
enum State {
    IDLE, CONNECTING, HANDSHAKE, LOGIN, FETCHING, DONE, ERROR
}

# --- Readonly accessors ---
var current_state: int:
    get: return _state

var session_key: String:
    get: return _session_key

# --- Setup (called by tier's _ready()) ---
func setup(notify_ready: bool = true) -> void:
    # Connect to NetworkService signals
    # Initialize state machine
    # If notify_ready: signal that module is ready

# --- Public API ---
func start_login(key: String) -> void:
    # State transition + network call

func _set_state(new_state: int) -> void:
    var old := _state
    _state = new_state
    state_changed.emit(old, new_state)
```

**Rules:**
- LogicCore MUST NOT reference any UI node
- LogicCore MUST NOT call any SceneManager navigation
- LogicCore MUST emit signals, never call tier methods directly
- LogicCore MUST be testable without scene tree (unit test with `add_child()`)

### Step 3 — Create SignalWiring Helpers

One helper per tier that needs UI wiring:

```gdscript
# proto_signal_wiring.gd
class_name {Module}ProtoSignalWiring
extends RefCounted

static func connect_all(scene: Scene{Module}Proto) -> void:
    var core: {Module}LogicCore = scene.logic_core

    core.state_changed.connect(func(old: int, new: int) -> void:
        scene._on_state_changed(old, new))

    core.login_completed.connect(func(info: Dictionary) -> void:
        scene._on_login_completed(info))

    # Component → LogicCore bridging
    scene._social_panel.login_requested.connect(func(key: String, provider: int) -> void:
        core.start_login(key))
```

```gdscript
# full_signal_wiring.gd
class_name {Module}FullSignalWiring
extends RefCounted

static func connect_all(scene: Scene{Module}Full) -> void:
    var core: {Module}LogicCore = scene.logic_core

    core.state_changed.connect(func(old: int, new: int) -> void:
        scene._on_state_changed(old, new))

    # Full tier wires buttons directly (no SocialLoginPanel)
    for i in range(scene._social_buttons.size()):
        var btn: TextureButton = scene._social_buttons[i]
        var provider: int = scene._social_providers[i]
        btn.pressed.connect(func() -> void:
            core.start_login(scene._generate_session_key(provider)))
```

**Rules:**
- SignalWiring MUST be RefCounted (not Node) — no lifecycle overhead
- SignalWiring MUST use `static func connect_all(scene)` pattern
- SignalWiring connects LogicCore signals → tier UI handler methods
- SignalWiring connects component signals → LogicCore API methods
- Console tier does NOT need a wiring helper (direct connections in _ready())

### Step 4 — Refactor Tiers

**4a. Console tier** — Extract logic, keep as standalone:

```gdscript
class_name Scene{Module}Console
extends Control

# Console creates objects directly (no LogicCore node)
var _logic_core: {Module}LogicCore

func _ready() -> void:
    _logic_core = {Module}LogicCore.new()
    add_child(_logic_core)
    _logic_core.setup()

    # Direct signal connections → debug labels
    _logic_core.state_changed.connect(func(old: int, new: int) -> void:
        _lb_state.text = "State: %s" % {Module}LogicCore.State.keys()[new])
```

**4b. Proto tier** — Standalone, uses LogicCore composition:

```gdscript
class_name Scene{Module}Proto
extends Control  # NOT extends Scene{Module}Console

@onready var logic_core: {Module}LogicCore = $LogicCore

func _ready() -> void:
    logic_core.setup()
    _build_ui()
    {Module}ProtoSignalWiring.connect_all(self)

func _build_ui() -> void:
    # Build Proto-specific UI (placeholder art)
    # Instantiate components (SocialLoginPanel, etc.)
```

**4c. Full tier** — Standalone, uses LogicCore composition:

```gdscript
class_name Scene{Module}Full
extends Control  # NOT extends Scene{Module}Proto

@onready var logic_core: {Module}LogicCore = $LogicCore

func _ready() -> void:
    logic_core.setup()
    _build_ui()
    {Module}FullSignalWiring.connect_all(self)
    ShowcaseOverlay.attach_if_standalone(self)

func _build_ui() -> void:
    # Build Full-specific UI (production art, TextureButtons, fonts)
```

**4d. Update .tscn scenes:**

Each tier's .tscn must include LogicCore as child node:

```
[node name="Scene{Module}Proto" type="Control"]
script = ExtResource("proto_script")

[node name="LogicCore" type="Node" parent="."]
script = ExtResource("logic_core_script")
```

Console tier adds LogicCore via code (not scene), so no .tscn change needed.

**4e. Update ScenePaths** — No changes needed (paths stay the same).

### Step 5 — Migrate Tests

Update GUT tests to test LogicCore independently:

```gdscript
# test_{module}_logic_core.gd
extends GutTest

var _core: {Module}LogicCore

func before_each() -> void:
    _core = {Module}LogicCore.new()
    add_child(_core)
    _core.setup(false)  # no notify_ready in tests

func after_each() -> void:
    _core.queue_free()

func test_initial_state_is_idle() -> void:
    assert_eq(_core.current_state, {Module}LogicCore.State.IDLE)

func test_start_login_changes_state() -> void:
    _core.start_login("test_key")
    assert_eq(_core.current_state, {Module}LogicCore.State.CONNECTING)
```

Existing tier tests may need updates:
- Console tests: now test Console + LogicCore (add_child pattern)
- Proto/Full tests: now test with LogicCore node in scene tree

### Step 6 — Verify

1. **GUT tests pass**: `../editor/Godot_v4.6.1-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd`
2. **Runtime verify via godot-mcp**:
   - `scene_play("res://modules/{module}/scenes/Scene{Module}Full.tscn")`
   - `game_get_screenshot()` — visual check
   - `game_find_ui_elements()` — buttons exist
   - `game_click_button()` — interaction works
3. **No regression**: ScenePaths unchanged, autoloads unchanged

---

## Output Structure

After refactor, module directory should look like:

```
modules/{module}/
├── scenes/
│   ├── Scene{Module}Console.tscn
│   ├── Scene{Module}Proto.tscn
│   └── Scene{Module}Full.tscn
├── scripts/
│   ├── {module}_logic_core.gd          ← NEW: shared logic
│   ├── console/
│   │   └── scene_{module}_console.gd   ← REFACTORED: standalone
│   ├── proto/
│   │   ├── scene_{module}_proto.gd     ← REFACTORED: standalone
│   │   └── proto_signal_wiring.gd      ← NEW: wiring helper
│   └── full/
│       ├── scene_{module}_full.gd      ← REFACTORED: standalone
│       └── full_signal_wiring.gd       ← NEW: wiring helper
├── components/                          ← UNCHANGED
├── packets/                             ← UNCHANGED
└── tests/
    ├── test_{module}_logic_core.gd     ← NEW: logic core tests
    ├── test_{module}_console.gd        ← UPDATED
    ├── test_{module}_panels.gd         ← UNCHANGED
    └── test_{module}_packets.gd        ← UNCHANGED
```

**New files**: 3 (logic_core, proto_wiring, full_wiring)
**Modified files**: 3 tiers + 3 .tscn + console test
**Unchanged files**: components, packets, panel tests

---

## Constraints

- **Max 300 LOC per file** — if LogicCore exceeds, split into LogicCore + {Module}NetworkHandler
- **No cross-tier imports** — tiers must NOT import each other
- **LogicCore must be UI-free** — no Control, no Label, no TextureRect references
- **SignalWiring must be stateless** — RefCounted with static methods only
- **Backward compatible** — ScenePaths, autoloads, component APIs unchanged
- **Components stay the same** — SocialLoginPanel, LoginZmPanel, etc. unchanged
- **Console tier can skip LogicCore node** — create objects directly for simplicity

---

## Refactor Checklist (per module)

- [ ] Step 1: Analyze — inventory all methods by category (logic/UI/wiring)
- [ ] Step 2: LogicCore created — state machine + signals + network extracted
- [ ] Step 3: SignalWiring helpers created — proto + full
- [ ] Step 4a: Console refactored — standalone + direct LogicCore
- [ ] Step 4b: Proto refactored — standalone + composition + ProtoSignalWiring
- [ ] Step 4c: Full refactored — standalone + composition + FullSignalWiring
- [ ] Step 4d: .tscn scenes updated — LogicCore node added
- [ ] Step 5: Tests migrated — LogicCore unit tests + tier tests updated
- [ ] Step 6: GUT tests pass
- [ ] Step 6: Runtime verify via godot-mcp
- [ ] All files < 300 LOC
- [ ] No cross-tier imports

---

## Lessons from Legacy-Client Analysis (2026-04-01)

| # | Lesson | How to Apply |
|---|--------|-------------|
| L1 | LogicCore is a Node, not RefCounted | Needs scene tree for Timer, signals, child nodes (ActionQueue) |
| L2 | Console creates objects directly | Simpler than @onready — Console is test-focused, no scene complexity |
| L3 | SignalWiring is RefCounted with static methods | No lifecycle needed — just connects signals and done |
| L4 | Full does NOT extend Proto | Each tier is standalone — avoids override cascade |
| L5 | done() callback in events gates ActionQueue | Presentation layer controls pacing (instant vs animated) |
| L6 | Guard nodes with get_node_or_null() | Proto nodes may not exist in subclasses |
| L7 | Login may not need full composition | Simple modules can use lightweight variant (no EventBus, no ActionQueue) |
| L8 | setup(notify_ready: bool) parameter | Console/test passes false, production passes true |

---

*Skill created: 2026-04-01 — from legacy-client table module analysis*
*Owner: agent_dev_godot (Client Dev)*
