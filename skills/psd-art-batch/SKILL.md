---
name: psd-art-batch
description: Batch-convert PSD-style JSON art exports (*_scene.json + images/) into Godot 4 .tscn preview scenes. Use when porting UI art from D:\PROJECT\CCN2\ART\ into client-ai-godot/previews/.
---

# psd-art-batch — PSD Art to Godot Preview

Convert one or more `*_scene.json` + `images/` folders (PSD-to-Godot exporter format) into Godot 4 `.tscn` scene files for layout preview.

**Script:** `.claude/skills/psd-art-batch/scripts/psd2tscn.js`  
**Output:** `shared/godot-client/client-ai-godot/previews/<module>/Preview<Name>.tscn`  
**Assets:** `shared/godot-client/client-ai-godot/assets/ui/images/<slug>/`

---

## Quick Reference

```bash
# Single file
node .claude/skills/psd-art-batch/scripts/psd2tscn.js \
  "D:/PROJECT/CCN2/ART/<Folder>/<Folder>/<Name>_scene.json" \
  "shared/godot-client/client-ai-godot/previews/<module>/Preview<Name>.tscn"

# Batch + copy assets (most common)
node .claude/skills/psd-art-batch/scripts/psd2tscn.js --batch --copy \
  "D:/PROJECT/CCN2/ART/<Folder>/<Folder>" \
  "shared/godot-client/client-ai-godot/previews/<module>"
```

---

## 8-Step Workflow

### Step 1: SCAN
List all `*_scene.json` files in source folder. Show user and confirm before proceeding.

```bash
node psd2tscn.js --batch --dry-run "<src>" "<dst>"
```

### Step 2: PLAN
For each JSON, state:
- Output `.tscn` path
- Assets destination
- Slug derived from folder name

Print mapping table:
```
Source JSON                     →  Output .tscn                              Assets dir
UI_NhanVat_V2_0_scene.json  →  previews/character/PreviewGuicharTab1.tscn  assets/ui/images/guichar-tab1/
```

### Step 3: DRY RUN
```bash
node psd2tscn.js --batch --copy --dry-run "<src>" "<dst>"
```
Verify plan, check for path conflicts.

### Step 4: EXECUTE
```bash
node psd2tscn.js --batch --copy "<src>" "<dst>"
```

### Step 5: VERIFY OUTPUT
Check output files exist:
```bash
ls "shared/godot-client/client-ai-godot/previews/<module>/"
ls "shared/godot-client/client-ai-godot/assets/ui/images/<slug>/"
```
Spot-check ext_resource paths in .tscn match copied asset files.

### Step 6: VISUAL CHECK *(optional — only if Godot editor is open)*
Detect Godot: call `mcp__godot-mcp__editor_get_output_log`. If it returns data, editor is open.

If open:
1. `mcp__godot-mcp__scene_open` — open the .tscn
2. `mcp__godot-mcp__editor_get_screenshot` — capture
3. Compare with `*_preview.png` in source folder

If not open: skip, note in report.

### Step 7: GENERATE HANDOFF
Create `art-handoff.md` in the output folder:

```markdown
# Art Handoff — <ModuleName>

## Converted Scenes
- [x] Preview<Name>.tscn

## TODO Items

### TODO[z-art-anim] — Nodes needing animation
- `Preview<Name> > <NodePath>` — <description>

### TODO[z-art-fx] — Nodes needing visual effects
- `Preview<Name> > <NodePath>` — <description>

### TODO[z-art-interactive] — Nodes needing interaction
- (none in this scene)
```

Identify TODO nodes by checking for `AnimatedSprite2D` godot_type in source JSON (→ animation needed) and `Button` type (→ interaction needed).

### Step 8: REPORT
Print summary:
```
✓ N scenes converted
✓ M assets copied  
⚠ K warnings
→ J TODO items (see art-handoff.md)
```

---

## Node Type Mapping Reference

| Source `godot_type` | Output Godot type | Notes |
|---|---|---|
| `Sprite2D` | `TextureRect` | Static preview only |
| `AnimatedSprite2D` | `TextureRect` | First frame only — mark TODO[z-art-anim] |
| `TextureRect` | `TextureRect` | Direct |
| `Button` | `TextureRect` | Visual only — mark TODO[z-art-interactive] |
| `Panel` | `TextureRect` | Visual only |
| `ScrollContainer` | `TextureRect` | Flattened |
| `Label` (exported=false) | `Label` | Text node |
| `Label` (exported=true) | `TextureRect` | Image-baked text |
| `Node2D` (container) | `Control` | Group |
| *(fallback)* | `Control` | Any unrecognized type |

---

## Edge Cases Handled by Script

| Case | Behavior |
|---|---|
| `image_exported=false` | Control container, no texture |
| `opacity=0` | `visible = false` |
| `opacity` 0–1 | `modulate = Color(1,1,1,<opacity>)` |
| Missing `design` block | Scale 1.0, log warning |
| Image file missing on disk | Null texture, log error, continue |
| Duplicate image names | Prefix slug, log warning |

---

## Related Skills

- `z-art-preview` — single-scene interactive Godot MCP approach (use for complex manual work)
- `csd2tscn` — CocosStudio JSON format (different input format)
