# CSD to Godot Converter — CCN2 Cocos Studio Preview Skill

**Version**: v1.0.0
**Created**: 2026-04-03
**Purpose**: Convert Cocos Studio JSON files to Godot 4 .tscn for preview/reference

---

## Triggers

Invoke skill này khi:
- Cần convert CSD JSON → Godot .tscn
- Parse Cocos Studio layer_setting.json hoặc các file JSON trong zcsd/
- Tạo preview cho UI từ Cocos assets

**Keywords**: "csd2tscn", "convert cocos", "layer_setting", "cocos to godot", "preview cocos ui"

---

## 1. Paths Configuration

| Component | Path                                                                                         |
|-----------|----------------------------------------------------------------------------------------------|
| **Script** | `scripts\csd2tscn.js`                                                                        |
| **Cocos JSON** | `cocos_json_dir`, eg: `D:\PROJECT\CCN2\clientccn2\res\zcsd\`                                       |
| **Output Preview** | `output_dir`, eg: `D:\PROJECT\CCN2\agent-teams\shared\godot-client\client-ai-godot\previews\` |
| **Assets Source** | search from `cocos_json_dir` res, eg: `D:\PROJECT\CCN2\clientccn2\res\`                            |
| **Assets Dest** | search from `output_dir`, eg: `D:\PROJECT\CCN2\agent-teams\shared\godot-client\client-ai-godot\assets\`        |

---

## 2. Workflow

### Step 1: Convert CSD JSON → .tscn

```bash
node scripts/csd2tscn.js --batch --copy "<cocos_json_dir>" "<output_dir>"
```

**Ví dụ** - Convert layer_setting.json:
```bash
node scripts/csd2tscn.js --batch --copy "D:/PROJECT/CCN2/clientccn2/res/zcsd/setting" "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/setting"
```

### Step 2: Copy Assets (nếu chưa có)
**Ví dụ** - Copy Assets còn thiếu của layer_setting
```bash
# Tạo thư mục assets
mkdir -p assets/high assets/fonts assets/draft_arts assets/Default

# Copy assets từ Cocos project
cp -rn "D:/PROJECT/CCN2/clientccn2/res/high/"* "assets/high/"
cp -rn "D:/PROJECT/CCN2/clientccn2/res/fonts/"* "assets/fonts/"
cp -rn "D:/PROJECT/CCN2/clientccn2/res/draft_arts/"* "assets/draft_arts/"
cp -rn "D:/PROJECT/CCN2/clientccn2/res/Default/"* "assets/Default/"
```

### Step 3: Move to Target Folder (tùy chọn)

```bash
# Move output .tscn sang folder khác (giữ same hierarchy)
mv previews/<file>.tscn previews/<target_folder>/
```

### Step 4: Verify in Godot Editor

```bash
# Reload project để import assets mới
mcp__godot-mcp__editor_reload_project()

# Open scene
mcp__godot-mcp__scene_open("path/to/file.tscn")

# Check tree
mcp__godot-mcp__scene_get_tree(max_depth=3)
```

---

## 3. Supported CSD Node Types

| CSD Type | Godot Node |
|----------|------------|
| `SpriteObjectData` | TextureRect |
| `ImageViewObjectData` | TextureRect / NinePatchRect |
| `TextObjectData` | Label |
| `ButtonObjectData` | Button / TextureButton |
| `LoadingBarObjectData` | TextureProgressBar |
| `TextFieldObjectData` | LineEdit |
| `CheckBoxObjectData` | CheckBox |
| `ProjectNodeObjectData` | Instance scene (nested) |

---

## 4. Features

- ✅ Batch convert entire folder
- ✅ Auto-copy assets (images, fonts)
- ✅ Handle nested CSD scenes (ProjectNodeObjectData)
- ✅ Convert layout properties (offset_left, offset_top, etc.)
- ✅ Support NinePatchRect cho Scale9 sprites
- ✅ Convert font và theme override properties

---

## 5. Usage Examples

### Convert single file:
```bash
node scripts/csd2tscn.js "path/to/file.json" "output/file.tscn"
```

### Convert entire zcsd folder:
**Ví dụ** dựa vào "<cocos_json_dir>" "<output_dir>" rồi có convert này
```bash
node scripts/csd2tscn.js --batch --copy "D:/PROJECT/CCN2/clientccn2/res/zcsd" "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews"
```

### Convert specific subfolder:
**Ví dụ** convert setting
```bash
node scripts/csd2tscn.js --batch --copy "D:/PROJECT/CCN2/clientccn2/res/zcsd/setting" "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/setting"
```

---

## 6. Troubleshooting

### Lỗi missing assets
- Chạy Step 2 để copy assets
- Reload Godot project sau khi copy

### Lỗi UID not recognized
- Đây là warning, không ảnh hưởng đến scene structure
- Scene vẫn hiển thị đúng trong editor

### Nested scene không load
- Đảm bảo dùng `--copy` flag để auto-convert nested scenes
- Hoặc convert nested scene trước rồi mới convert parent
