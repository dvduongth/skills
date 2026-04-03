# port-analyzer

**Owner**: agent_dev (Tech Lead)
**Phase**: 1-analyze (runs before port-implementer)
**Purpose**: Analyze a source module from clientccn2 (Cocos2d-x JS) and produce a self-contained mapping document for porting to Godot 4.6.1.

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_name` | string | yes | Module name, e.g. "login", "lobby", "shop" |
| `source_paths` | array | yes | JS source paths: `clientccn2/src/modules/{module}/` |
| `asset_paths` | array | no | CocosStudio paths: `studioccn2/cocosstudio/high/{module}/`, `studioccn2/cocosstudio/draft_arts/{module}/` |
| `target_path` | string | yes | Target module path: `client-ai-godot/modules/{module}/` |

---

## Workflow

### Step 1 — Index Source

```
- Run GitNexus analyze on source_paths if not already indexed
- Run GitNexus analyze on target (client-ai-godot) to know existing infrastructure
- Query: gitnexus_query({query: "{module_name} module"}) on clientccn2 index
```

### Step 2 — Inventory Source Files

For each JS file in `source_paths`:
- File path, LOC count
- Primary responsibility (UI, logic, packets, config)
- Key classes/functions
- Dependencies (imports, requires)

### Step 3 — Identify Reusable Infrastructure

**CRITICAL**: Check what already exists in godot-client before proposing new code.

Existing autoloads (DO NOT recreate):
```
NetworkService    — TCP connection, handshake, login, packet dispatch
SessionStore      — Session key persistence
SceneManager      — Scene transitions (ScenePaths registry)
LobbyService      — Lobby state, user info
ToastService      — Toast notifications
PopupService      — Confirm/alert dialogs
Log               — Structured logging (Log.p())
AppConfig         — App configuration
ReconnectService  — Auto-reconnect logic
```

Existing packet infrastructure (DO NOT recreate):
```
PacketBuffer      — Binary serialization (put_string, put_int, get_unsigned_short, etc.)
SendPacket        — Base class for outgoing packets (override build())
RecvPacket        — Base class for incoming packets (override parse())
CmdDefine         — Command ID constants
ErrorCode         — Error code constants
```

**Verify**: Read actual autoload source files to confirm signal names and method signatures. Design docs may be outdated.

### Step 4 — Map Architecture

Determine tier structure based on source complexity:

| Source LOC | Tier Count | Structure |
|-----------|-----------|-----------|
| < 200 | 1 tier | Console only |
| 200-600 | 2 tiers | Console + Proto |
| > 600 | 3 tiers | Console + Proto + Full |

Console tier: state machine + network logic + signals (no art)
Proto tier: extends Console, adds UI panels + component wiring (placeholder art, code-built)
Full tier: extends Proto, overrides `_build_proto_ui()` with production art

**Full tier details** (learned from login port):
- Overrides `_build_proto_ui()` — replaces ColorRect with NinePatchRect, Button with TextureButton
- May override `_wire_component_signals()` if wiring changes (e.g. direct icon handling vs component)
- Layout constants from `previews/{module}/` CocosStudio reference (design resolution, positions)
- Asset paths: `assets/high/{module}/` (production PNGs), `assets/fonts/` (game fonts)
- Has `_load_texture()` / `_load_font()` helpers with graceful fallback
- Code-built UI (all nodes in override method, no sub-scenes needed)
- `ScenePaths.{MODULE}` points to Full tier; Proto kept as `ScenePaths.{MODULE}_PROTO`

### Step 5 — Map Components

For each UI component in source:

| Source Component | Godot Component | Type | Signals | Reuse/New |
|-----------------|----------------|------|---------|-----------|
| (JS class) | (GDScript class) | Control/Panel | (signal list) | new/reuse |

### Step 6 — Map Assets

List CocosStudio assets needed from `asset_paths`:

| Source Asset | Target Path | Type | Notes |
|-------------|------------|------|-------|
| studioccn2/cocosstudio/high/{module}/bg.png | assets/{module}/bg/ | Background | Copy directly |
| (sprite sheet .plist) | (individual PNGs) | Sprite sheet | Needs extraction |

### Step 7 — Map Packets

For each network packet in source:

| Packet | CmdDefine | Direction | Handled By | Action |
|--------|----------|-----------|------------|--------|
| HAND_SHAKE | CmdDefine.HAND_SHAKE | send | NetworkService (internal) | Reference only |
| USER_LOGIN | CmdDefine.LOGIN | send | NetworkService (internal) | Reference only |
| GET_USER_INFO | CmdDefine.GET_USER_INFO | send | NetworkService | Use existing |
| (new packet) | CmdDefine.XXX | recv | New class needed | Create RecvPacket |

**KEY**: NetworkService may handle some packets internally (handshake, login). Always verify before creating packet classes.

### Step 8 — Identify Gotchas

Based on login port lessons:

1. **NetworkService internals**: Check what NetworkService handles automatically vs what needs explicit packet sending
2. **API mismatch**: Actual code uses `build() -> PackedByteArray` and `PacketBuffer.put_string()`, NOT `_write(buf)` and `buf.write_string()` as some docs say
3. **Signal names**: Verify actual autoload signal names by reading source (e.g., `login_success` not `on_login_success`)
4. **PopupService API**: Returns Control with meta "result", not callbacks
5. **Existing module code**: godot-client may already have a skeleton for this module — analyze it before proposing structure

### Step 9 — Output Mapping Document

Write to: `shared/knowledge/port-mappings/{module}-mapping.md`

---

## Output Format

```markdown
# Port Mapping — {module_name}

> Generated: {date}
> Source: clientccn2/src/modules/{module}/
> Target: client-ai-godot/modules/{module}/

## Source Inventory
| File | LOC | Responsibility |
|------|-----|---------------|

## Architecture Decision
- Tier count: {1/2/3} — Rationale: {why}
- Target structure: (directory tree)

## Reuse Inventory
### Reused (NO modification)
- (list of existing autoloads/services used)

### New (to create)
- (list of new files with responsibilities)

## File Mapping
| Source (JS) | Target (GDScript) | Notes |
|------------|-------------------|-------|

## Component Mapping
| Source Component | Target Component | Signals | Notes |
|-----------------|-----------------|---------|-------|

## Asset Mapping
| Source | Target | Type |
|--------|--------|------|

## Packet Mapping
| Packet | Direction | Handler | Action |
|--------|-----------|---------|--------|

## Gotchas
- (module-specific issues to watch for)

## Recommended Task Breakdown
### Phase A — Foundation
### Phase B — Components
### Phase C — Integration
### Phase D — Polish
```

---

## Constraints

- **READ-ONLY** on source files — never modify clientccn2 or studioccn2
- **Must verify APIs** — read actual autoload source before documenting signal names/method signatures
- **Must check existing godot-client code** — module may already have partial implementation
- **Output is sole input for port-implementer** — must be self-contained, no external references needed
- **No JS patterns** — map to Godot-native patterns (signals, scenes, state machines)

---

## Lessons from Login Port Pilot (2026-04-01)

| # | Lesson | Impact |
|---|--------|--------|
| L1 | NetworkService handles handshake+login internally | Packet classes were reference-only, not functional |
| L2 | Actual API differs from design docs | Always read source, not docs |
| L3 | Additive porting > rewrite | Reuse existing infrastructure aggressively |
| L4 | Pipeline workflow catches issues early | dev-specs -> dev-plan -> orchestrator |
| L5 | CSD converter can run parallel | Don't gate implementation on asset conversion |

---

*Skill created: 2026-04-01 — from login port pilot*
*Owner: agent_dev (Tech Lead)*
