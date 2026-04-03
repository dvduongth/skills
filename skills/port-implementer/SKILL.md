# port-implementer

**Owner**: agent_dev_godot (Client Dev)
**Phase**: 3-implement
**Purpose**: Implement a ported module in Godot 4.6.1 GDScript based on a mapping document produced by port-analyzer.

---

## Key Constraint

**NEVER read source JS files.** The mapping document is the sole source of truth. This ensures:
- Clean architectural translation (not line-by-line port)
- Godot-native patterns (signals, scenes, GDScript idioms)
- No accidental JS patterns leaking into GDScript

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mapping_path` | string | yes | Path to mapping doc: `shared/knowledge/port-mappings/{module}-mapping.md` |
| `ticket_id` | string | no | Ticket reference for tracking |
| `target_module` | string | yes | Module name: "login", "lobby", "shop" |

---

## Workflow

### Phase A — Foundation (Console Tier)

1. **Create packet classes** (only for items marked "new" in mapping doc):
   - `extends SendPacket` — override `build() -> PackedByteArray`
   - `extends RecvPacket` — override `parse(cmd: int, error_code: int, buf: PacketBuffer)`
   - Reference-only packets: document with comments, implement minimal build/parse
   - Follow pattern from `modules/lobby/packets/user_info_recv.gd`

2. **Write console tests (TDD)**:
   - Test state machine transitions (happy path + error paths)
   - Test packet serialization/deserialization
   - Test timeout behavior
   - Test session persistence
   - Framework: GUT (`extends GutTest`)

3. **Implement console tier**:
   - `class_name Scene{Module}Console extends Control`
   - Enum State { IDLE, CONNECTING, ... DONE, ERROR }
   - Signals: state_changed, login_requested, etc.
   - Subscribe to NetworkService signals (connected, disconnected, login_success, login_failed)
   - State machine `_set_state()` with signal emission
   - Timeout via `get_tree().create_timer(TIMEOUT)`
   - Session: `SessionStore.load_session()` / `SessionStore.save_session()`
   - `_exit_tree()`: disconnect all signals
   - **Max 300 LOC**

4. **Create console scene** (.tscn):
   - Root Control with full-rect anchors
   - Minimal Labels for state display (debug)
   - Attach console script

5. **Verify**: Run GUT headless on console tests

### Phase B — Components

6. **Write panel tests (TDD)**:
   - Test each component independently
   - Test signal emissions, validation, visibility rules

7. **Implement components** (each as independent scene + script):
   - `class_name {ComponentName} extends Control`
   - Build UI in `_build_ui()` (code-built) OR use .tscn with `@onready` (scene-defined)
   - Signal-first: emit signals, never call parent methods
   - Each component gets: `.tscn` (minimal root) + `.gd` (logic + UI builder)
   - **Max 300 LOC each**

   Common component patterns:
   | Type | Pattern | Example |
   |------|---------|---------|
   | Button panel | VBoxContainer + N Buttons | SocialLoginPanel |
   | Form panel | VBoxContainer + LineEdits + Buttons | LoginZmPanel |
   | Overlay | ColorRect bg + Labels | TryingOverlay |
   | Info panel | Labels + data binding | UserInfoPanel |

8. **Verify**: Run GUT headless on panel tests

### Phase C — Proto Tier + Integration

9. **Implement proto tier**:
   - `class_name Scene{Module}Proto extends Scene{Module}Console`
   - Build UI with component instances in `_build_proto_ui()`
   - Wire component signals to Console's public API
   - Panel switching with fade transitions (Tween)
   - Show/hide overlay based on `state_changed` signal
   - Keyboard shortcuts (ESC = back navigation)
   - Version label from `ProjectSettings.get_setting("application/config/version")`
   - **Max 300 LOC**

10. **Create proto scene** (.tscn):
    - Root Control with proto script
    - Console debug labels (hidden by default)

11. **Update ScenePaths**:
    - Modify `SceneManager.ScenePaths.{MODULE}` constant ONLY
    - Point to new Proto scene path
    - DO NOT modify any other SceneManager code

12. **Delete old skeleton** (if exists):
    - Grep for references first
    - Only delete after verifying no code references remain
    - Keep .uid files (Godot manages these)

13. **Integration verify**: Manual or GUT test of full flow

### Phase D — Full Tier + Assets

14. **Implement Full tier**:
    - `class_name Scene{Module}Full extends Scene{Module}Proto`
    - Override `_build_proto_ui()` with production art:
      - NinePatchRect background (with patch margins from reference)
      - TextureButton for icon buttons (with `texture_normal`, `ignore_texture_size`)
      - Proper fonts via `_load_font()` helper
      - Layout constants from `previews/{module}/` CocosStudio reference
    - Override `_wire_component_signals()` if wiring differs from Proto
    - Add `_load_texture(path) -> Texture2D` and `_load_font(path) -> Font` helpers:
      - Check `ResourceLoader.exists(path)` first
      - Return null with `push_warning()` if missing (graceful fallback)
    - Platform visibility rules (e.g. Apple button on iOS only, Zing in debug only)
    - **Max 300 LOC**

15. **Create Full scene** (.tscn):
    - Root Control with full script
    - Same debug labels as Proto (hidden)
    - Separate uid from Proto

16. **Copy assets** from studioccn2 as listed in mapping doc:
    - Create `assets/{module}/` and `assets/high/{module}/` directory structure
    - Copy PNGs to appropriate subdirs (bg/, icons/, buttons/)
    - Copy fonts to `assets/fonts/` if not already present
    - No need to update .import files (Godot auto-generates)

17. **Update ScenePaths**:
    - `ScenePaths.{MODULE}` → Full tier path
    - `ScenePaths.{MODULE}_PROTO` → Proto tier path (fallback)

18. **Verify all ACs**: Walk through acceptance criteria, mark PASS/FAIL

---

## Code Rules

These rules are mandatory — violations will be caught by P4 Reviewer.

### Type Safety
```gdscript
# ALWAYS explicit types
var health: int = 100
func take_damage(amount: int) -> void: pass
```

### Signal-First
```gdscript
# Component emits signal, parent connects
signal login_requested(session_key: String, provider: int)
# NEVER: parent.start_login(key) from component
```

### Structured Logging
```gdscript
Log.p("[ClassName] message: %s" % value)
# NEVER: print("debug")
```

### No Magic Numbers
```gdscript
const LOGIN_TIMEOUT: float = 10.0
# NEVER: create_timer(10.0) without const
```

### Node References
```gdscript
@onready var _lb_state: Label = $LbState
# NEVER: get_node("LbState") in _process()
```

### Naming
```
Files:      snake_case.gd / PascalCase.tscn
class_name: Domain prefix (UI*, Scene*, etc.)
Constants:  SCREAMING_SNAKE_CASE
Variables:  snake_case (_private)
Signals:    past_tense_verb or noun_verb
Nodes:      PascalCase in scene tree
```

---

## Pipeline Integration

```
port-analyzer (P1) → mapping doc
         ↓
  /dev-specs (P2) → specs/{feature}/
         ↓
  /dev-plan (P2) → plans/{feature}/tasks.md
         ↓
  orchestrator (P3-P6):
    P3: port-implementer ← THIS SKILL
    P4: code-quality-review (threshold: 95/100)
    P5: GUT test run
    P6: docs-sync + lesson-extract
```

---

## Output

After completion, the module directory should look like:
```
modules/{module}/
├── scenes/
│   ├── Scene{Module}Console.tscn
│   ├── Scene{Module}Proto.tscn
│   └── Scene{Module}Full.tscn
├── scripts/
│   ├── console/scene_{module}_console.gd
│   ├── proto/scene_{module}_proto.gd
│   └── full/scene_{module}_full.gd
├── components/
│   ├── {Component}.tscn + {component}.gd  (one per UI component)
├── packets/
│   └── {packet_name}.gd  (one per new packet)
└── tests/
    ├── test_{module}_console.gd
    ├── test_{module}_panels.gd
    └── test_{module}_packets.gd
```

Plus:
- `SceneManager.ScenePaths.{MODULE}` → Full tier (production entry point)
- `SceneManager.ScenePaths.{MODULE}_PROTO` → Proto tier (dev fallback)
- Assets in `assets/{module}/` and `assets/high/{module}/`
- Old skeleton deleted (if existed)

---

## Lessons from Login Port Pilot (2026-04-01)

| # | Lesson | How to Apply |
|---|--------|-------------|
| L1 | Check autoload APIs before coding | Read actual source, not design docs |
| L2 | PopupService.show_confirm returns Control with meta "result" | Use tree_exiting + get_meta("result") pattern |
| L3 | NetworkService handles some packets internally | Packet classes may be reference-only |
| L4 | Code-built UI works well for dynamic components | Use _build_ui() for variable-count buttons |
| L5 | Scene-defined UI works well for static layouts | Use @onready for fixed-structure forms |
| L6 | Signal contracts bridge at proto tier | Components: 2 params, Console: 1 param — Proto extracts |
| L7 | GUT time-simulation hard for _process() timers | Prefer Timer nodes for testability |
| L8 | Always grep for references before deleting files | Prevents broken scene references |
| L9 | Full tier overrides `_build_proto_ui()` completely | All Proto UI replaced — no super call, build everything from scratch |
| L10 | Full tier may bypass component classes | Direct TextureButton wiring instead of SocialLoginPanel component |
| L11 | `_load_texture()` / `_load_font()` with ResourceLoader.exists() | Graceful fallback when assets missing — no crash |
| L12 | ScenePaths: Full=default, Proto=fallback | `LOGIN` → Full, `LOGIN_PROTO` → Proto |

---

*Skill created: 2026-04-01 — from login port pilot*
*Owner: agent_dev_godot (Client Dev)*
