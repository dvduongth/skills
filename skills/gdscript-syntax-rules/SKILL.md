---
name: gdscript-syntax-rules
description: Enforcement checklist cho GDScript 4. Bắt buộc chạy TRƯỚC khi viết .gd và TRƯỚC khi mark done. Trigger khi: viết GDScript, parse error, import failure, hoặc sau khi tạo file .gd.
---

# GDScript 4 — Syntax Rules & Enforcement Checklist

## Khi nào dùng skill này
- Trước khi viết BẤT KỲ file .gd nào
- Sau khi viết, trước khi claim "done"
- Khi gặp parse error hoặc import/class_name failure
- Khi convert code từ GDScript 3 / JavaScript / C# sang GDScript 4

---

## Phần 1: GDScript 3 → 4 Breaking Changes

Đây là nguồn gốc của 90% parse errors từ LLMs. Ghi nhớ và kiểm tra mọi file.

### extends
❌ KHÔNG BAO GIỜ dùng:
`extends preload("res://path/to/file.gd")`

✅ LUÔN dùng:
`extends ClassName`  ← nếu parent có `class_name ClassName`
`extends "res://path/to/file.gd"` ← string literal (nếu không có class_name)

### Signal emit
❌ `emit_signal("signal_name", arg1, arg2)`
✅ `signal_name.emit(arg1, arg2)`

### Signal connect
❌ `.connect("signal_name", self, "_method_name")`
✅ `signal_name.connect(_method_name)`
✅ `signal_name.connect(func(args): ...)`  ← lambda

### setget (đã bị xóa hoàn toàn)
❌ `var x setget _set_x, _get_x`
✅ `var x: T: get: return _x   set(v): _x = v`

### Annotations (thêm @ prefix)
❌ `onready var`, `export var`, `tool`
✅ `@onready var`, `@export var`, `@tool`

### yield (đã bị xóa)
❌ `yield(get_tree(), "idle_frame")`
✅ `await get_tree().process_frame`

---

## Phần 2: Luật static func

`static func` KHÔNG có `self` → không thể truy cập:
- Instance variables hoặc `@onready` vars
- Instance methods (kể cả `tr()`, `get_node()`, `add_child()`)
- Signals

### Checklist static func
- [ ] Không gọi `tr()` — dùng string literal hoặc nhận string qua param
- [ ] Không access bất kỳ `@onready` var nào
- [ ] Không gọi instance method không có prefix `self.`
- [ ] Không emit signal từ static context
- [ ] Tất cả data cần thiết phải được truyền qua parameters

❌ Sai:
```gdscript
static func build_label(text: String) -> Label:
    var lb := Label.new()
    lb.text = tr(text)  # tr() là instance method!
    return lb
```

✅ Đúng:
```gdscript
static func build_label(translated_text: String) -> Label:
    var lb := Label.new()
    lb.text = translated_text
    return lb
```

---

## Phần 3: Checklist validate @onready paths

Sau khi viết xong script, bắt buộc cross-check từng `@onready` với file .tscn:

### Bước thực hiện
1. Đọc file .tscn tương ứng bằng Read tool
2. Với mỗi `@onready var _x: Type = $Path/To/Node`:
   - [ ] Node tên chính xác có trong .tscn tree không?
   - [ ] Parent path đúng không (không lệch cấp)?
   - [ ] Type annotation khớp node type trong .tscn?
3. Nếu sai → sửa path trong script, KHÔNG sửa .tscn

### Lỗi thường gặp
- Tên node có khoảng trắng: `$Panel Button` sai → `$"Panel Button"` hoặc đổi tên node
- Path bị lệch cấp: `$bg/btn_close` vs `$btn_close` — đọc .tscn để confirm
- Typo: `$panelBgSetting` vs `$panel_bg_setting` — Godot node names case-sensitive

---

## Phần 4: Multi-File Validation Protocol

Khi feature có nhiều file .gd (main + helpers + wiring):

### Bắt buộc validate TẤT CẢ files, không chỉ entry point
- [ ] Mọi file .gd mới tạo đều được Read lại và check syntax
- [ ] Mọi file helper (UIBuilder, SignalWiring, etc.) đều được cross-check @onready paths với .tscn CỦA CHÚNG
- [ ] extends chain đúng cho mọi file trong hierarchy
- [ ] class_name được khai báo nếu file khác cần extend/reference

### Thứ tự validate
1. Console tier script (không có @onready, chỉ logic + signals)
2. Helper files (UIBuilder, SignalWiring)
3. Proto/Full tier scripts
4. .tscn files (script_path trỏ đúng file)

### Nếu godot-mcp available
- Dùng `script_validate` trên từng file .gd
- Nếu `script_validate` trả về stale errors (timestamp cũ) → bỏ qua, dùng manual scan
- Dùng `editor_get_errors` SAU KHI project reload, không ngay sau khi save

### Nếu godot-mcp unavailable
- Manual scan từng file bằng Read tool
- Grep `extends preload` — nếu có → fix ngay
- Grep `emit_signal\(` — nếu có → fix ngay
- Report BLOCKED cho agent_leader, KHÔNG mark done

---

## Phần 5: Project-specific CCN2 (client-ai-godot)

### Naming (theo NAMING_CONVENTION.md)
- Variables: `snake_case`, prefix theo domain (`_lbl_`, `_btn_`, `_img_`)
- Private: prefix `_` (e.g. `_btn_close`)
- Class names: `PascalCase` với domain prefix: `SceneLobbyFull`, `LayerSettingConsole`

### Bắt buộc có trong mọi Full tier _ready()
```gdscript
func _ready() -> void:
    ShowcaseOverlay.attach_if_standalone(self)
    # ... rest of _ready
```

### Type annotations bắt buộc
```gdscript
# ❌ Sai
@onready var btn_close = $bg/btn_close
var count = 0

# ✅ Đúng
@onready var _btn_close: TextureButton = $bg/btn_close
var _count: int = 0
```

### Giới hạn độ dài
- Max 300 lines/file
- Nếu vượt 300 lines → tách sang UIBuilder hoặc SignalWiring class

### Signals phải khai báo trước khi dùng
```gdscript
# Ở đầu class, sau class_name/extends
signal login_completed
signal close_requested(data: Dictionary)
```
