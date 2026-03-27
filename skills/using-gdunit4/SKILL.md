---
name: using-gdunit4
description: Automate GdUnit4 test/debug workflow cho CCN2 Godot project — viết tests, chạy tests, debug failures, và follow TDD cycle với GdUnit4 v6.1.3 trên Godot 4.2.
type: skill
version: 1.0.0
created: 2026-03-27
author: William Đào
triggers:
  - gdunit4
  - viết test godot
  - chạy test godot
  - debug test godot
  - tdd godot
  - test coverage godot
  - unit test godot
  - integration test godot
---

# using-gdunit4

**Mục tiêu:** Tự động hóa toàn bộ quy trình GdUnit4 — từ viết test đến debug — cho CCN2 Godot project.

**Phiên bản:** GdUnit4 v6.1.3 | Godot 4.2
**Project path:** `D:/PROJECT/CCN2/agent-teams/shared/playtest/godot/`
**Tests path:** `res://tests/` (`tests/unit/`, `tests/integration/`, `tests/mock/`)

---

## Triggers

Invoke skill này khi user yêu cầu bất kỳ việc gì liên quan đến testing Godot:

| Keyword | Depth |
|---------|-------|
| "viết test cho `<class>`" | write |
| "chạy test", "run test" | run |
| "debug test", "test fail" | debug |
| "tdd cycle", "red-green-refactor" | tdd |
| "coverage report", "code coverage" | coverage |
| "setup gdunit4", "cài gdunit4" | setup |
| "fix flaky test" | flaky |
| "mock `<class>`" | mock |

---

## Setup Nhanh (nếu chưa có)

```bash
# 1. Mở Godot Editor
cd D:/PROJECT/CCN2/agent-teams/shared/playtest/godot
start-editor.bat

# 2. Enable plugin: Project → Project Settings → Plugins → gdUnit4 ✓ → Restart

# 3. Verify: F12 → GdUnit4 panel xuất hiện
# 4. Run verification: mở tests/unit/test_gdunit4_setup.gd → F6 → 9/9 PASS
```

**Cấu trúc thư mục test:**
```
tests/
├── unit/           # test_<feature>.gd — logic đơn lẻ
├── integration/    # test_<flow>.gd — luồng client-server
├── mock/           # mock_<purpose>.gd — mock data helpers
└── reports/        # HTML coverage reports
```

---

## Workflow Chính

### 1. Viết Test Mới

**Template chuẩn:**
```gdscript
extends GdUnitTestSuite

# Declare constants thay vì magic numbers
const LADDER_KC_REWARD = 100
const SAFE_ZONES = [1, 11, 21, 31]

# Setup/Teardown
func before_test() -> void:
    _system = MyClass.new()   # fresh instance mỗi test

func after_test() -> void:
    if is_instance_valid(_system):
        _system.free()
        _system = null

# Test naming: test_<what>_<condition>_<expected>
func test_landing_on_ladder_awards_100_kc() -> void:
    # ARRANGE
    var player = PlayerState.new()
    player.kc = 0

    # ACT
    _system.player_lands_on(player, tile_id=5)  # tile 5 = ladder

    # ASSERT
    assert_int(player.kc).is_equal(LADDER_KC_REWARD)
```

**Quy tắc naming:**
- File: `test_<class_or_feature>.gd`
- Function: `test_<what>_<condition>_<expected>()`
- Mock: `mock_<purpose>.gd`

### 2. Chạy Tests

| Action | Method |
|--------|--------|
| Run file hiện tại | `F6` |
| Run ALL tests | `Shift+F6` |
| Toggle GdUnit4 panel | `F12` |
| Re-run last test | `Ctrl+F6` |
| Debug: Step Over | `F10` |
| Debug: Step Into | `F11` |
| Debug: Step Out | `Shift+F11` |
| Stop debugging | `Ctrl+F2` |
| CLI (headless) | `godot -s res://addons/gdunit4/cmd/GdUnitCmd.gd -testdir=res://tests/` |

### 3. TDD Cycle (Red → Green → Refactor)

```
Bước 1: Write failing test (RED)
  → Run F6 → test FAIL → expected

Bước 2: Write minimal code (GREEN)
  → Chỉ code đủ để test pass
  → Run F6 → test PASS

Bước 3: Refactor (REFACTOR)
  → Clean up code
  → Run Shift+F6 → ALL tests still PASS

Bước 4: Repeat cho feature tiếp theo
```

**TDD cycle timing:** ~6-12 phút mỗi cycle — commit sau mỗi GREEN.

---

## Assertions Cheat Sheet

```gdscript
# Integer
assert_int(kc).is_equal(100)
assert_int(tile).is_between(1, 40)
assert_int(damage).is_greater(0)

# String
assert_str(player_id).is_equal("P1")
assert_str(error).contains("invalid")
assert_str(phase).is_not_empty()

# Bool
assert_bool(is_safe_zone).is_true()
assert_bool(game_over).is_false()

# Array
assert_array(tokens).has_size(2)
assert_array(safe_zones).contains_exactly([1, 11, 21, 31])

# Dictionary
assert_dict(state).contains_key("kc")
assert_dict(state).contains_key_value("kc", 300)

# Float
assert_float(ratio).is_equal_approx(0.75, 0.01)

# Null
assert_that(obj).is_not_null()
assert_null(empty_value)
```

---

## Debug Failures

### Khi test fail — Checklist 10 bước:
```
□ 1. Đọc assertion message (Expected X, got Y)
□ 2. Thêm print() debug: print("Debug: value = ", value)
□ 3. Thêm breakpoint → F6 debug mode → F10/F11 step
□ 4. Check method name (case-sensitive!)
□ 5. Check object not null trước khi access
□ 6. Check async operations có await không
□ 7. Check signal connections
□ 8. Check timeout values (tăng nếu cần)
□ 9. Enable verbose: GdUnit4 Settings → Verbose Logging
□ 10. Xem GdUnit4 Output Panel chi tiết
```

### 10 Lỗi Thường Gặp + Fix Nhanh:

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| "Plugin not loaded" | Plugin bị disable | Project Settings → Plugins → Enable gdUnit4 → Restart |
| "Test function not found" | Thiếu prefix `test_` | Đổi tên function thành `test_xxx()` |
| "Class not found" | Thiếu `.new()` | `var obj = preload("...").new()` |
| "Assertion failed" | Logic bug | Thêm print() + breakpoint để debug |
| "Timeout exceeded" | Infinite loop / async | `await wait_timeout(10.0)` + check async |
| "Null reference" | Object chưa khởi tạo | `assert_not_null(obj)` trước khi dùng |
| "Scene not found" | Path sai | `assert_true(FileAccess.file_exists(path))` |
| "Signal not emitted" | Signal không được emit | `var waiter = await_signal(obj, "signal", 2.0)` |
| "Method not found" | Typo / private method | Print `obj.get_method_list()` để verify |
| "Memory leak" | Object chưa free | `obj.queue_free()` trong `after_test()` |

### Debug Mode Setup:
```gdscript
func test_with_debug():
    breakpoint  # Dừng ở đây trong debug mode
    var result = my_function()
    assert_eq(result, expected)

# Shortcuts trong debug mode:
# F10 = Step Over
# F11 = Step Into
# Ctrl+F2 = Stop debugging
```

---

## Fix Flaky Tests

**Nguyên tắc FIRST:**
- **F**ast: < 100ms mỗi test — không sleep, không network
- **I**solated: không phụ thuộc test khác — fresh state trong `before_test()`
- **R**epeatable: deterministic — dùng seed cố định cho random
- **S**elf-validating: pass/fail rõ ràng — không cần human check log
- **T**imely: viết trước code (TDD)

**Fix patterns:**

```gdscript
# ❌ Flaky: Timer-based wait
await get_tree().create_timer(0.5).timeout

# ✅ Stable: Signal-based wait
await wait_for_condition(func(): return animation_finished, timeout=2.0)

# ❌ Flaky: Non-deterministic random
var rng = RandomNumberGenerator.new()
rng.randomize()

# ✅ Stable: Seeded random
var rng = RandomNumberGenerator.new()
rng.seed = 12345

# ❌ Flaky: Global state pollution
GameState.instance().current_player = "P1"

# ✅ Stable: Dependency injection
var mock_state = MockGameState.new()
game._state = mock_state
```

---

## Mocking

```gdscript
# Tạo fake TCP client cho tests
var fake_tcp = {
    "connected": false,
    "messages": []
}

# Stub một method
stub(NetworkService, "send").on_call("test").return(true)

# Spy: track calls
spy_on(ServiceClass, "request")
perform_action()
assert_call_count(ServiceClass, "request").is(1)

# Mock tốt nhất khi:
# - NetworkManager / WebSocketClient
# - RandomNumberGenerator (cần determinism)
# - FileSystem access
# - External services

# Dùng real objects khi:
# - Pure game logic (BoardLogic, KCCalculator)
# - Data classes (PlayerState, TileData)
# - Math utilities
```

---

## Code Coverage

```bash
# Enable coverage: Project → GdUnit4 → Settings → Generate Coverage Report ✓
# Chạy tests từ GdUnit4 panel (không phải F6)
# Xem: res://coverage/index.html

# CLI với coverage
godot -s res://addons/gdunit4/cmd/GdUnitCmd.gd -coverage=html -testdir=res://tests/
```

**Targets cho CCN2:**
| Module | Target |
|--------|--------|
| Game logic (board, KC, combat) | 90%+ |
| Network layer | 75%+ |
| UI logic | 60%+ |
| Config loaders | 70%+ |

---

## CCN2-Specific Guidelines

### Test theo GDD (không phải code)
```gdscript
# Đọc document/GameDesignDocument.md trước khi viết test
# Win condition: 600 KC AND on Ladder tile
func test_win_requires_600_kc_and_ladder_tile() -> void:
    assert_bool(WinChecker.check(kc=599, on_ladder=true)).is_false()
    assert_bool(WinChecker.check(kc=600, on_ladder=false)).is_false()
    assert_bool(WinChecker.check(kc=600, on_ladder=true)).is_true()

# Safe zones: [1, 11, 21, 31] — test chính xác từ GDD
func test_safe_zones_prevent_kicking() -> void:
    for tile in [1, 11, 21, 31]:
        assert_bool(board.is_safe_zone(tile)).is_true()
```

### Server-authoritative → Client tests chỉ test:
- Rendering / UI state
- Message parsing (format, structure)
- Client state sau khi nhận message
- Reconnection logic

### Không test trong client:
- Game logic validation (server làm)
- Real Ktor server trong unit tests

---

## Ví Dụ CCN2 Thực Tế

```gdscript
# tests/unit/test_board_logic.gd
class_name TestBoardLogic
extends GdUnitTestSuite

## Tests cho BoardLogic — 40 tiles, safe zones, ladder tiles
## CCN2 Rules: safe=[1,11,21,31], ladders=[5,10,15,20,25,30,35,40]
## Ref: document/GameDesignDocument.md

var _board: BoardLogic

func before_test() -> void:
    _board = BoardLogic.new()
    _board.initialize(tile_count=40)

func after_test() -> void:
    _board.free()

# --- SAFE ZONE TESTS ---
func test_tile_1_is_safe_zone() -> void:
    assert_bool(_board.is_safe_zone(1)).is_true()

func test_tile_11_is_safe_zone() -> void:
    assert_bool(_board.is_safe_zone(11)).is_true()

func test_tile_3_is_not_safe_zone() -> void:
    assert_bool(_board.is_safe_zone(3)).is_false()

# --- LADDER TILE TESTS ---
func test_ladder_tile_5_awards_kc() -> void:
    var reward = _board.get_kc_reward(5)
    assert_int(reward).is_equal(100)

# --- MOVEMENT TESTS ---
func test_movement_wraps_after_tile_40() -> void:
    var result = _board.calculate_new_tile(current=39, roll=3)
    assert_int(result).is_equal(2)  # 39+3=42 → wrap to tile 2
```

---

## Guides Đầy Đủ (16 files tại `agent-teams/shared/playtest/godot/`)

| Guide | Nội dung |
|-------|---------|
| `QUICKSTART_GDUNIT4.md` | 3-bước bắt đầu ngay |
| `GDUNIT4_USAGE_GUIDE.md` | Hướng dẫn chi tiết đầy đủ |
| `GDUNIT4_TDD_WORKFLOW.md` | TDD cycle + examples |
| `GDUNIT4_DEBUG_TROUBLESHOOTING.md` | 10 lỗi + debug techniques |
| `GDUNIT4_BEST_PRACTICES.md` | FIRST principles + CCN2 guidelines |
| `GDUNIT4_ADVANCED_TESTING_GUIDE.md` | Scene testing, signals, async |
| `GDUNIT4_CI_CD_INTEGRATION.md` | GitHub Actions integration |
| `GDUNIT4_COVERAGE_ANALYSIS.md` | Coverage strategy |
| `GDUNIT4_MOCK_DATA_GUIDE.md` | Mock & spy patterns |
| `GDUNIT4_PERFORMANCE_TESTING.md` | Benchmarks |
| `GDUNIT4_SCENE_TESTING.md` | Scene + input simulation |
| `GDUNIT4_GAME_LOGIC_TESTING.md` | Board game logic testing |
| `GDUNIT4_INTEGRATION_TESTING.md` | Integration test patterns |
| `GDUNIT4_INSTALLATION_GUIDE.md` | Cài đặt chi tiết |
| `GDUNIT4_INSTALLATION_COMPLETE.md` | Post-install verification |
| `GDUNIT4_SETUP_SUMMARY.md` | Tổng kết setup |

---

*Skill created: 2026-03-27 | GdUnit4 v6.1.3 | CCN2 Godot 4.2*
*Guides source: `agent-teams/shared/playtest/godot/GDUNIT4_*.md` (16 files)*
