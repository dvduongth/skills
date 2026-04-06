---
name: csd2tscn
description: "Convert Cocos Studio published JSON (.json / layer_setting.json) to Godot 4 .tscn scenes. Use when asked to convert CSD JSON to Godot, preview Cocos UI in Godot, or run csd2tscn. Keywords: csd2tscn, convert cocos, cocos to godot, layer_setting, zcsd, preview cocos ui."
---

# CSD → Godot Converter (csd2tscn)

**Version**: v1.1.0
**Script**: `scripts/csd2tscn.js`
**Updated**: 2026-04-03

Converts Cocos Studio published JSON files to Godot 4 `.tscn` scenes for layout preview / reference.

---

## 1. CLI Reference

```
node scripts/csd2tscn.js <input.json> <output.tscn>
node scripts/csd2tscn.js --batch [--copy] [--assets-dir <path>] <json_dir> <out_dir>
```

| Flag | Description |
|------|-------------|
| `--batch` | Convert every `.json` file in `<json_dir>` recursively |
| `--copy` | Auto-copy image/font assets from the Cocos project into `<assets_root>` |
| `--assets-dir <path>` | Override the shared assets destination (default: `<godot_root>/assets/`) |

**Asset destination** (when `--copy` is active):

- Default: first `project.godot` found by walking up from `<out_dir>`, then `<godot_root>/assets/`
- Override: `--assets-dir D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/assets`

**Nested scenes** (two-pass): A pre-pass scans all JSON files for `ProjectNodeObjectData` references and converts referenced sub-scenes **before** their parents. This runs unconditionally — `--copy` only controls asset file copying, not sub-scene conversion.

---

## 2. Paths Reference

| Role | Example path |
|------|-------------|
| Script | `shared/godot-client/client-ai-godot/.claude/skills/csd2tscn/scripts/csd2tscn.js` |
| Cocos JSON source | `D:/PROJECT/CCN2/clientccn2/res/zcsd/` |
| Output preview dir | `D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/` |
| Shared assets root | `D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/assets/` |
| Godot root (auto-detected) | `D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/` |

The script auto-detects the Godot root by walking up from `<out_dir>` until it finds `project.godot`.

---

## 3. Supported CSD Node Types

| CSD `ctype` | Godot node | Notes |
|-------------|-----------|-------|
| `SpriteObjectData` | `TextureRect` | Own scale emitted as Godot `scale` property |
| `ImageViewObjectData` | `TextureRect` or `NinePatchRect` | NinePatch when `Scale9Width > 0 && Scale9OriginX > 0` |
| `TextObjectData` | `Label` | Font size scaled by node + accumulated parent scale |
| `ButtonObjectData` | `Button` (flat) or `TextureButton` | TextureButton when texture assets present |
| `LoadingBarObjectData` | `TextureProgressBar` | |
| `TextFieldObjectData` | `LineEdit` | |
| `CheckBoxObjectData` | `CheckBox` | |
| `ProjectNodeObjectData` | Instance of nested `.tscn` | Falls back to `Control` if sub-scene missing |
| *(anything else)* | `Control` | Position-only container |

---

## 4. Workflow

### Step 1: Convert CSD JSON → .tscn (with assets)

```bash
# From the skill directory:
node scripts/csd2tscn.js --batch --copy \
  "D:/PROJECT/CCN2/clientccn2/res/zcsd/setting" \
  "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/setting"
```

`--copy` automatically copies all referenced images and fonts to `client-ai-godot/assets/`.
No manual `cp` is needed.

### Step 2: Verify in Godot Editor

```
mcp__godot-mcp__editor_reload_project()
mcp__godot-mcp__scene_open("res://previews/setting/<file>.tscn")
mcp__godot-mcp__scene_get_tree(max_depth=3)
```

### Step 3: Convert without asset copy (layout-only)

```bash
node scripts/csd2tscn.js --batch \
  "D:/PROJECT/CCN2/clientccn2/res/zcsd/setting" \
  "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/setting"
```

Assets won't be copied; textures will appear as pink placeholders in Godot.

---

## 5. Worked Example — scene_lobby.json

**Goal**: Convert lobby scene from `clientccn2/res/ui/lobby` to `previews/lobby/` with shared assets.

```bash
# From the worktree root:
node shared/godot-client/client-ai-godot/.claude/skills/csd2tscn/scripts/csd2tscn.js \
  --batch --copy \
  "D:/PROJECT/CCN2/clientccn2/res/zcsd/lobby" \
  "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews/lobby"
```

Expected output:
```
   Godot root: D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot
   CSD proj root: D:/PROJECT/CCN2/clientccn2/res
   Assets root:   D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/assets

🔍 Scanning for nested scenes...
   Found N nested scene(s)
   🔄 Converting nested: zcsd/features/lobby/...json

✓  scene_lobby.json                    → .../previews/lobby/scene_lobby.tscn
📦 Copying M asset(s)...
   ✓ high/img_lobby_bg.png → assets/high/img_lobby_bg.png
   ...
✅ Copied M/M asset(s)
```

If `clientccn2/res/zcsd/lobby/` doesn't exist, use the full `zcsd/` batch and filter later:
```bash
node scripts/csd2tscn.js --batch --copy \
  "D:/PROJECT/CCN2/clientccn2/res/zcsd" \
  "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews"
```

---

## 6. Known Limitations

| Limitation | Detail |
|-----------|--------|
| `zcsd/` prefix hardcoded | Sub-scene path normalization strips `zcsd/` prefix unconditionally. If your CSD project uses a different folder name, sub-scene references will break. |
| UID warnings are non-fatal | Godot logs "UID not recognized" for generated UIDs. The scene structure is correct; UIDs are random Base62 strings per-run and become stale if the file is regenerated. |
| Sub-scene asset gaps | `collectNestedAssets` resolves paths relative to the nested JSON's source directory. Assets whose `FileData.Path` is relative to the CSD project root (e.g. `high/plus.png`) may not be found if the nested JSON lives deep in a subfolder. Re-run with `--copy` from a higher batch root to capture these. |
| Single-file mode context | Single-file mode walks up the directory tree looking for a folder named `ui/`. If your input isn't inside a `ui/` subtree, it falls back to the file's own directory, which may cause incorrect asset path resolution. |
| No SpriteFrame / atlas support | Spritesheet `.plist` references are queued for copy but not parsed — atlas frames are not split into sub-textures. |
| `ButtonObjectData` pressed state | Only `NormalFileData` and `PressedFileData` are copied. `DisabledFileData` and `SelectedFileData` are ignored. |

---

## 7. Troubleshooting

### Missing textures in Godot (pink rectangles)
- Rerun with `--copy` flag, or manually copy from `clientccn2/res/` to `client-ai-godot/assets/`
- Reload Godot project after copying: `mcp__godot-mcp__editor_reload_project()`

### UID not recognized (Godot warning)
- Non-fatal. UIDs are randomly generated; they become stale on regeneration.
- Scene structure is unaffected — all nodes and textures load correctly.

### Nested scenes show as empty `Control` nodes
- This means the sub-scene `.json` source could not be found during the pre-pass.
- Check that the `FileData.Path` value (e.g. `zcsd/features/shop/...`) resolves under `<proj_root>/res/`.
- The pre-pass runs unconditionally — `--copy` is not required for sub-scene conversion.

### "Could not find project.godot" warning
- The script couldn't auto-detect the Godot root from `<out_dir>`.
- Sub-scene `res://` paths will be broken. Fix: ensure `<out_dir>` is inside the Godot project directory, or use `--assets-dir` to manually specify the assets destination.

### Assets land in wrong directory
- Use `--assets-dir <path>` to override the default `<godot_root>/assets/` destination.

---

## 8. Advanced: Custom Assets Dir

```bash
node scripts/csd2tscn.js \
  --batch --copy \
  --assets-dir "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/assets" \
  "D:/PROJECT/CCN2/clientccn2/res/zcsd" \
  "D:/PROJECT/CCN2/agent-teams/shared/godot-client/client-ai-godot/previews"
```

Use this when the Godot root auto-detection fails, or when you want assets in a non-default location.
