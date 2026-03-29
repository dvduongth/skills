---
name: godot-scene-dev-workflow
description: Use when implementing Godot 4.2 UI scenes from CocosStudio reference assets for CCN2/Elemental Hunter — covers reference analysis, asset manifest checkpoint, TDD scene creation with GdUnit4, and coordinate conversion from CSD layout.
---

# godot-scene-dev-workflow

**Mục tiêu:** Workflow chuẩn để implement Godot scenes từ CocosStudio references — từ phân tích refs đến TDD implementation.

**Stack:** Godot 4.2 + GDScript + GdUnit4 v6.1.3
**Project:** `D:/workspace/CCN2/agent-teams/shared/playtest/godot/`
**Refs:** `D:/workspace/CCN2/agent-teams/references/`

---

## 6-Phase Pipeline

```
Phase 1: Prereq Check → Phase 2: Ref Analysis → Phase 3: Asset Manifest ⛔CHECKPOINT
→ Phase 4: Asset Copy → Phase 5: TDD Scene Implementation (per scene)
→ Phase 6: Runtime Visual Verification (Rule 6 — MANDATORY)
```

---

## Phase 1: Prerequisite Check

Verify 4 paths trước khi làm bất cứ gì. Nếu thiếu → DỪNG:

```bash
ls references/Layout_BanChoi_Update2_V3_blue_A.png
ls references/game_ui/cocostudio/high/game/newboard/
ls references/game_ui/cocostudio/ui/game/board/
ls shared/concepts/tile-grid-mapping.json
```

Đọc knowledge base:
- `shared/knowledge/lessons/godot-lessons.md` (CRITICAL + Risk Checklist)
- `shared/knowledge/godot-dev-guide.md` (EH patterns, WebSocket)

---

## Phase 2: Reference Analysis → ui-ref-analysis.md

Tạo `shared/playtest/godot/plans/ui-ref-analysis.md` với:

### ⚠️ HAI Coordinate Spaces — KHÔNG được trộn lẫn!

| Space | Source | Scale X | Scale Y | Dùng cho |
|-------|--------|---------|---------|----------|
| Layout PNG | 1368×640 px image | 1280/1368 = 0.9357 | 720/640 = 1.1250 | Zone bounds (visual estimate) |
| CocosStudio canvas | 1386×640 (từ CSD) | 1280/1386 = 0.9235 | 720/640 = 1.1250 | Tile positions (từ tile-grid-mapping.json) |

```gdscript
# Tile positions — dùng CS scale
const CS_W := 1386.0; const CS_H := 640.0
const GD_W := 1280.0; const GD_H := 720.0
const SCALE_X := GD_W / CS_W  # 0.9235
const SCALE_Y := GD_H / CS_H  # 1.1250
godot_x = screenX * SCALE_X
godot_y = screenY * SCALE_Y
```

### tile-grid-mapping.json — Critical Notes

```gdscript
# ⚠️ Field là "tileId" KHÔNG phải "id"!
var tile_id: int = int(entry.get("tileId", 0))  # ✅
# var tile_id: int = int(entry.get("id", 0))    # ❌ WRONG

# ⚠️ IDs là 1-based (1..41). Không có tile 0.
if tile_id < 1 or tile_id > 41:
    continue

# JSON structure: { "meta": {...}, "tiles": [...] }
var data = json.get_data()
if data is Dictionary and data.has("tiles"):
    return data["tiles"]
```

### res:// Path Warning

`res://` là relative đến Godot project root (`shared/playtest/godot/`).
Path `res://../../shared/concepts/tile-grid-mapping.json` có thể KHÔNG hoạt động.
→ Fallback: copy `tile-grid-mapping.json` vào `assets/tile-grid-mapping.json` và dùng `res://assets/tile-grid-mapping.json`.

---

## Phase 3: Asset Manifest ⛔ CHECKPOINT

**KHÔNG bao giờ bulk copy toàn bộ** `high/` folder (870+ files).

Tạo `shared/playtest/godot/plans/asset-manifest.md` với danh sách curated ~50-80 files.

```markdown
# Asset Copy Manifest
| src (relative to references/game_ui/cocostudio/high/game/) | dst (relative to shared/playtest/godot/assets/) |
|-------------------------------------------------------------|------------------------------------------------|
| newboard/bg_ingame.png | board/bg_ingame.png |
| newboard/tile/tile_base_1.png | board/tiles/tile_base_1.png |
...
```

**⛔ DỪNG sau khi commit manifest. Chờ human review trước khi copy.**

---

## Phase 4: Asset Copy

```bash
# Verify trước khi copy
[ -d "$SRC/newboard/" ] || { echo "ERROR: Missing $SRC — DỪNG"; exit 1; }

mkdir -p "$DST/board/tiles" "$DST/ui/hud" "$DST/player" "$DST/fonts"

# Copy theo manifest — KHÔNG dùng cp -r trên toàn folder
cp "$SRC/newboard/bg_ingame.png" "$DST/board/bg_ingame.png"
for i in $(seq 1 23); do
  cp "$SRC/newboard/tile/tile_base_$i.png" "$DST/board/tiles/tile_base_$i.png"
done
```

Spot-check sau copy:
```bash
ls "$DST/board/bg_ingame.png"
ls "$DST/board/tiles/tile_base_23.png"
ls "$DST/board/tiles/" | wc -l  # Expected: 28
```

---

## Phase 5: TDD Scene Implementation

**REQUIRED SUB-SKILL:** Dùng `using-gdunit4` cho chi tiết về GdUnit4 API.

### Prerequisite: EHTileTypes.gd TRƯỚC MỌI SCENE

```gdscript
# shared/playtest/godot/src/eh_tile_types.gd
class_name EHTileTypes

enum Type {
    EMPTY, SAFE_ZONE, START_P1, START_P2,
    FINAL_GOAL_P1, FINAL_GOAL_P2,
    ELEMENT_FIRE, ELEMENT_ICE, ELEMENT_GRASS, ELEMENT_ROCK,
    BRANCH, SPECIAL  # fallback cho tile_base_11..23
}

static func get_tile_texture_path(type: Type) -> String:
    match type:
        Type.EMPTY:         return "res://assets/board/tiles/tile_base_1.png"
        Type.SAFE_ZONE:     return "res://assets/board/tiles/tile_base_2.png"
        # ... etc
        _:                  return "res://assets/board/tiles/tile_base_1.png"
```

### TDD Cycle Per Scene (RED → GREEN → REFACTOR)

```
1. Viết test file → 2. Run → verify FAIL ("Cannot preload — not found")
3. Tạo .gd script → 4. Tạo .tscn trong Godot Editor
5. Run test → verify PASS → 6. Commit
```

### GdUnit4 Patterns

```gdscript
# Test suite template
extends GdUnitTestSuite

func test_scene_loads() -> void:
    var scene = preload("res://src/scenes/EHTile.tscn").instantiate()
    assert_that(scene).is_not_null()
    scene.free()

# Signal testing
func test_signal_emitted() -> void:
    var btn = preload("res://src/scenes/EHDiceBtn.tscn").instantiate()
    add_child(btn)
    var monitor = monitor_signals(btn)
    btn.btn.emit_signal("pressed")
    assert_signal_emitted(btn, "dice_pressed")
    btn.free()

# Value assertions
assert_int(tile.tile_id).is_equal(5)
assert_bool(overlay.visible).is_false()
assert_float(hp_bar.value).is_equal(50.0)
assert_float(position.x).is_less(640.0)  # left of center
assert_float(position.x).is_between(-50.0, 1330.0)
```

### @onready Safety Pattern

```gdscript
# LUÔN null-check @onready nodes
@onready var tile_base: Sprite2D = $TileBase

func setup(id: int, type: EHTileTypes.Type) -> void:
    tile_id = id
    if not is_instance_valid(tile_base):
        push_error("TileBase node not found")
        return
    tile_base.texture = load(EHTileTypes.get_tile_texture_path(type))
```

### Tile Variant Mapping (tile_base_1..10 confirmed)

| tile_base | EHTileTypes.Type |
|-----------|-----------------|
| 1.png | EMPTY |
| 2.png | SAFE_ZONE |
| 3.png | START_P1 |
| 4.png | START_P2 |
| 5.png | FINAL_GOAL_P1 |
| 6.png | FINAL_GOAL_P2 |
| 7.png | ELEMENT_FIRE |
| 8.png | ELEMENT_ICE |
| 9.png | ELEMENT_GRASS |
| 10.png | ELEMENT_ROCK |
| 11.png | BRANCH (verify visual) |
| 12–23.png | SPECIAL (verify visual) |

### Z-Order Stack

```
bg=0, shadow=1, tiles=2, element_overlay=3, chibi=4, highlight=5, CanvasLayer=top
```

### Sub-scene Decision

```
Reuse ≥ 2 lần → .tscn riêng
Phức tạp (>2 nodes hoặc có logic) → .tscn riêng kể cả 1 lần
Trivial 1 lần → inline trong parent
```

---

## Commit Pattern

```bash
git add shared/playtest/godot/src/eh_tile.gd
git add shared/playtest/godot/src/scenes/EHTile.tscn
git add shared/playtest/godot/tests/test_eh_tile.gd
git commit -m "feat(phase1): EHTile scene + TDD tests — tile base + element overlay"
```

---

## Red Flags — Dừng Ngay

| Situation | Action |
|-----------|--------|
| Dùng `entry.get("id", 0)` | → Fix thành `entry.get("tileId", 0)` |
| Copy toàn bộ `high/` folder | → Tạo manifest trước, đợi human approve |
| Tiến hành T4 trước khi human approve manifest | → DỪNG — T3 là hard checkpoint |
| Tạo scene trước khi viết test | → Xóa scene, viết test trước (TDD) |
| Dùng `get_node()` trực tiếp | → Dùng `@onready` |
| Scale Layout PNG làm tile positions | → Đọc lại "Hai Coordinate Spaces" |
| Mix layout scale với CS canvas scale | → Xem bảng Phase 2 |

---

## Output Artifacts

| File | Task | Purpose |
|------|------|---------|
| `plans/ui-ref-analysis.md` | T2 | Zone coords, tile grid, variant mapping |
| `plans/asset-manifest.md` | T3 | Curated asset list, checkpoint |
| `assets/board/`, `assets/ui/`, `assets/player/`, `assets/fonts/` | T4 | Copied assets |
| `src/eh_tile_types.gd` | T5 | Shared enum, PREREQUISITE |
| `src/eh_tile.gd` + `EHTile.tscn` | T6 | Phase 1 board tile |
| `src/eh_game_board.gd` + `GameBoard.tscn` | T7 | Phase 1 board root |
| `src/eh_element_slot.gd` + `EHElementSlot.tscn` | T8 | Phase 2 element slot |
| `src/eh_player_hud.gd` + `EHPlayerHUD.tscn` | T9 | Phase 2 player HUD |
| `src/eh_dice_btn.gd` + `EHDiceBtn.tscn` | T10 | Phase 2 dice button |
| `src/eh_artifact_btn.gd` + `EHArtifactBtn.tscn` | T10 | Phase 2 artifact button |
| `src/eh_chibi.gd` + `EHChibi.tscn` | T11 | Phase 3 character sprite |

---

## Phase 6: Runtime Visual Verification (Rule 6 — MANDATORY)

> **Pipeline Rule 6**: KHÔNG được report PASS chỉ bằng static analysis.
> PHẢI chạy Godot runtime và capture screenshot. Visual FAIL = smoke FAIL.
> Xem `agents/agent_playtest/REFERENCE.md` cho full checklist.

### Full Flow — KHÔNG Test Isolated

```
SceneLoading.tscn → SceneLogin.tscn (2 players) → scene_loading_login.tscn → GameBoard.tscn
```

**Tại sao?** Mở `GameBoard.tscn` trực tiếp SKIP initialization pipeline (login, session, server handshake). Bugs chỉ xuất hiện khi chạy full flow (token positions phụ thuộc server state sync).

### Godot Binary (thử theo thứ tự)
1. `GODOT_BIN` env variable
2. `Editor_Godot/godot.windows.editor.x86_64.console.exe` (portable)
3. `godot` trong PATH

### Screenshot Capture

```bash
# Chạy scene + capture screenshot
<godot_binary> --headless --path "shared/playtest/godot" -s res://tools/capture_screenshot.gd
```

```gdscript
# tools/capture_screenshot.gd
extends SceneTree
func _init():
    var viewport = get_root().get_viewport()
    await get_root().ready
    await get_tree().process_frame
    await get_tree().process_frame
    var img = viewport.get_texture().get_image()
    img.save_png("res://screenshots/board_screenshot.png")
    quit()
```

### Visual Verification Checklist (BLOCKING)

| Check | Pass Criteria |
|-------|--------------|
| Board Grid | 41 tiles visible, positions match `tile-grid-mapping.json` (±5px) |
| HUD Layout | HUDP1 + HUDP2 within viewport [0,1280]x[0,720] |
| Token Rendering | P1/P2 tokens visible at correct tiles, no missing textures |
| Viewport | No clipped elements, text readable, 1280x720 |
| Z-Order | UI > game objects > background |

### Red Flags — Visual

| Situation | Action |
|-----------|--------|
| `anchors_preset = 0` + negative offsets | Check element không bị đẩy ngoài viewport |
| HUD `offset_left < 0` | FAIL — element off-screen (RC từ ticket-014) |
| Server sends `kind`, client reads `type` | FAIL — field name mismatch (RC từ ticket-014) |
| Godot không available | Report **BLOCKED** (KHÔNG SKIP/PASS) |

---

*Skill created: 2026-03-27 — từ session godot-ui-reference-guide*
*Updated: 2026-03-29 — Phase 6: Runtime Visual Verification (Rule 6), repo path fix*
*Relates to: `using-gdunit4` (test detail), `godot-dev-guide.md` Section 12 (CocosStudio refs)*
