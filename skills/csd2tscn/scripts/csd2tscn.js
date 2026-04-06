#!/usr/bin/env node
/**
 * csd2tscn.js — Convert Cocos Studio published JSON to Godot 4 .tscn
 *
 * Features:
 *   - Convert CSD JSON → Godot .tscn with full node tree
 *   - Auto-copy resource files (images, fonts, spritesheets)
 *   - Handle nested CSD scenes (ProjectNodeObjectData)
 *   - Batch convert entire folder structure
 *
 * Usage:
 *   node tools/csd2tscn.js <input.json> <output.tscn>
 *   node tools/csd2tscn.js --batch <json_dir> <out_dir>
 *   node tools/csd2tscn.js --batch --copy <json_dir> <out_dir>  (with asset copy)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const ASSET_BASE = 'res://assets/';
const COPY_ASSETS = process.argv.includes('--copy');

// Shared assets root — all copied assets land here regardless of outDir.
// Defaults to _godotRoot/assets after CLI args are parsed.
// Override with: --assets-dir <path>
let _sharedAssetsRoot = '';

// ── Resource registry (per-file) ────────────────────────────────────────────
let _resId  = 1;
let _resMap = new Map(); // resPath → { id: string, type: string }

function resetRegistry() {
  _resId  = 1;
  _resMap = new Map();
}

function getResId(resPath, type = 'Texture2D') {
  if (!resPath) return null;
  if (_resMap.has(resPath)) return _resMap.get(resPath).id;
  const id = String(_resId++);
  const uid = 'uid://' + randomBase62(8);
  _resMap.set(resPath, { id, type, uid });
  return id;
}

// ── Asset copy queue ─────────────────────────────────────────────────────────
let _copyQueue = []; // { src, dst }

function queueAssetCopy(src, dst) {
  _copyQueue.push({ src, dst });
}

async function processCopyQueue() {
  if (_copyQueue.length === 0) return;

  console.log(`\n📦 Copying ${_copyQueue.length} asset(s)...`);
  let copied = 0;

  for (const { src, dst } of _copyQueue) {
    try {
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        console.log(`   ✓ ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dst)}`);
        copied++;
      }
    } catch (err) {
      console.warn(`   ⚠ Failed to copy ${src}: ${err.message}`);
    }
  }

  const total = _copyQueue.length;
  _copyQueue = [];
  if (copied > 0) {
    console.log(`✅ Copied ${copied}/${total} asset(s)\n`);
  }
}

// ── Per-batch/file context ────────────────────────────────────────────────────
// Set once per convert() call. Used by ProjectNodeObjectData resolver.
let _jsonProjRoot  = '';  // CSD project root (parent of batch jsonDir)
let _jsonBatchBase = '';  // batch input dir (the ui/ directory)
let _outDir        = '';  // batch output dir
let _godotRoot     = '';  // Godot project root (contains project.godot)

function findGodotRoot(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(dir, 'project.godot'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return '';
    dir = parent;
  }
}

// ── Path helpers ─────────────────────────────────────────────────────────────
function toResPath(cocospath) {
  if (!cocospath) return null;
  return ASSET_BASE + cocospath;
}

// ── CSD path resolution ───────────────────────────────────────────────────────
// Cocos Studio FileData.Path values are relative to the CSD project root
// We need to resolve them to actual file paths for copying

function resolveCsdAssetPath(fileData) {
  if (!fileData?.Path) return null;

  // Try to find the source file in common Cocos asset locations
  const possiblePaths = [
    // Relative to JSON file's project root
    path.join(_jsonProjRoot, fileData.Path),
    // Relative to JSON file directory
    path.join(_jsonBatchBase, '..', fileData.Path),
    // Try with common prefixes
    path.join(_jsonProjRoot, 'res', fileData.Path),
    path.join(_jsonProjRoot, 'assets', fileData.Path),
  ];

  for (const p of possiblePaths) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  // Fallback: construct path relative to project root
  return path.resolve(_jsonProjRoot, fileData.Path);
}

function getAssetType(filePath) {
  if (!filePath) return null;
  const ext = path.extname(filePath).toLowerCase();

  const textureExts = ['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tga'];
  const fontExts = ['.ttf', '.otf', '.woff', '.woff2'];
  const spriteSheetExts = ['.plist', '.xml'];

  if (textureExts.includes(ext)) return 'texture';
  if (fontExts.includes(ext)) return 'font';
  if (spriteSheetExts.includes(ext)) return 'spritesheet';

  return 'unknown';
}

// ── Color helper ─────────────────────────────────────────────────────────────
function toGodotColor(cc) {
  if (!cc || Object.keys(cc).length === 0) return null;
  const r = ((cc.R ?? 255) / 255).toFixed(3);
  const g = ((cc.G ?? 255) / 255).toFixed(3);
  const b = ((cc.B ?? 255) / 255).toFixed(3);
  const a = ((cc.A ?? 255) / 255).toFixed(3);
  return `Color(${r}, ${g}, ${b}, ${a})`;
}

// ── Coordinate conversion ────────────────────────────────────────────────────
// accumSX / accumSY: accumulated scale from all ancestors — Cocos children are positioned
// in the parent's LOCAL (pre-scale) space, but Godot uses scaled (visual) coordinates.
// Multiplying position and size by the accumulated parent scale flattens the scale
// hierarchy into each node's rect, so no explicit "scale" property is needed in Godot.
function convertRect(node, parentH, accumSX = 1, accumSY = 1) {
  // Position is in parent's LOCAL (unscaled) space — scale to visual coordinates
  const px  = (node.Position?.X ?? 0) * accumSX;
  const py  = (node.Position?.Y ?? 0) * accumSY;
  const w   = node.Size?.X        ?? 0;
  const h   = node.Size?.Y        ?? 0;
  const ax  = node.AnchorPoint?.ScaleX ?? 0;
  const ay  = node.AnchorPoint?.ScaleY ?? 0;
  const sx  = node.Scale?.ScaleX  ?? 1;
  const sy  = node.Scale?.ScaleY  ?? 1;

  // Effective size = own size × own scale × accumulated parent scale
  const ew = w * sx * accumSX;
  const eh = h * sy * accumSY;

  const cx = px - ax * ew;
  const cy = py + (1 - ay) * eh;

  const gx = cx;
  const gy = parentH - cy;

  return { x: gx, y: gy, w: ew, h: eh };
}

// Variant for nodes that emit an explicit Godot scale property instead of baking it.
// Rect size = natural size × parent accumulated scale only (own scale NOT baked).
// Position is still computed using visual (scaled) anchor placement so it lands correctly.
function convertRectNatural(node, parentH, accumSX = 1, accumSY = 1) {
  const px  = (node.Position?.X ?? 0) * accumSX;
  const py  = (node.Position?.Y ?? 0) * accumSY;
  const w   = node.Size?.X        ?? 0;
  const h   = node.Size?.Y        ?? 0;
  const ax  = node.AnchorPoint?.ScaleX ?? 0;
  const ay  = node.AnchorPoint?.ScaleY ?? 0;
  const sx  = node.Scale?.ScaleX  ?? 1;
  const sy  = node.Scale?.ScaleY  ?? 1;

  // Natural size — accumulated parent scale only, own scale emitted as property
  const nw = w * accumSX;
  const nh = h * accumSY;

  // Anchor placement uses visual (own-scaled) bounds so position matches Cocos layout
  const cx = px - ax * nw * sx;
  const cy = py + (1 - ay) * nh * sy;

  return { x: cx, y: parentH - cy, w: nw, h: nh };
}

// ── tscn node builder ────────────────────────────────────────────────────────
let _lines = [];

function emit(line) {
  _lines.push(line);
}

function emitNode(name, type, parent, props) {
  const parentAttr = parent === '.' ? 'parent="."' : `parent="${parent}"`;
  emit(`[node name="${escapeName(name)}" type="${type}" ${parentAttr}]`);
  for (const [k, v] of Object.entries(props)) {
    if (v !== null && v !== undefined) emit(`${k} = ${v}`);
  }
  emit('');
}

function emitInstanceNode(name, parent, resId, props) {
  const parentAttr = parent === '.' ? 'parent="."' : `parent="${parent}"`;
  emit(`[node name="${escapeName(name)}" ${parentAttr} instance=ExtResource("${resId}")]`);
  for (const [k, v] of Object.entries(props)) {
    if (v !== null && v !== undefined) emit(`${k} = ${v}`);
  }
  emit('');
}

function escapeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

// ── Layout base props ────────────────────────────────────────────────────────
function layoutProps(rect, node) {
  const props = {
    layout_mode:   0,
    offset_left:   fmt(rect.x),
    offset_top:    fmt(rect.y),
    offset_right:  fmt(rect.x + rect.w),
    offset_bottom: fmt(rect.y + rect.h),
  };

  const skewX = node.RotationSkewX ?? 0;
  const skewY = node.RotationSkewY ?? 0;
  if (skewX !== 0 || skewY !== 0) {
    const rx = skewX * Math.PI / 180;
    if (Math.abs(skewX - skewY) < 0.001) {
      props.rotation = fmt(-rx);
    } else {
      props['metadata/skew_x'] = fmt(skewX);
      props['metadata/skew_y'] = fmt(skewY);
    }
  }

  if (node.Alpha !== undefined && node.Alpha !== 255) {
    const a = (node.Alpha / 255).toFixed(3);
    props.modulate = `Color(1, 1, 1, ${a})`;
  }

  return props;
}

function fmt(n) { return n.toFixed(4); }

// ── Per-type converters ──────────────────────────────────────────────────────
function convertSprite(node, parent, rect) {
  const cocosPath = node.FileData?.Path;
  const texPath = toResPath(cocosPath);
  const id      = getResId(texPath, 'Texture2D');

  // Queue asset copy if enabled
  if (COPY_ASSETS && cocosPath) {
    const srcPath = resolveCsdAssetPath(node.FileData);
    const assetType = getAssetType(srcPath);
    if (srcPath && assetType === 'texture') {
      const dstPath = path.resolve(_sharedAssetsRoot, cocosPath);
      queueAssetCopy(srcPath, dstPath);
    }
  }

  const sx = node.Scale?.ScaleX ?? 1;
  const sy = node.Scale?.ScaleY ?? 1;
  const props = {
    ...layoutProps(rect, node),
    texture:      id ? `ExtResource("${id}")` : null,
    expand_mode:  1,
    stretch_mode: 0,  // STRETCH_SCALE — texture scales to fit natural rect
  };
  if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) {
    props.scale = `Vector2(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  }
  emitNode(node.Name, 'TextureRect', parent, props);
}

function convertImageView(node, parent, rect) {
  const cocosPath = node.FileData?.Path;
  const texPath   = toResPath(cocosPath);
  const id        = getResId(texPath, 'Texture2D');

  // Queue asset copy if enabled
  if (COPY_ASSETS && cocosPath) {
    const srcPath = resolveCsdAssetPath(node.FileData);
    const assetType = getAssetType(srcPath);
    if (srcPath && assetType === 'texture') {
      const dstPath = path.resolve(_sharedAssetsRoot, cocosPath);
      queueAssetCopy(srcPath, dstPath);
    }
  }

  const hasNine = (node.Scale9Width ?? 0) > 0 && (node.Scale9OriginX ?? 0) > 0;

  if (hasNine) {
    emitNode(node.Name, 'NinePatchRect', parent, {
      ...layoutProps(rect, node),
      texture:              id ? `ExtResource("${id}")` : null,
      patch_margin_left:    node.Scale9OriginX ?? 0,
      patch_margin_top:     node.Scale9OriginY ?? 0,
      patch_margin_right:   node.Scale9OriginX ?? 0,
      patch_margin_bottom:  node.Scale9OriginY ?? 0,
      draw_center:          'true',
    });
  } else {
    emitNode(node.Name, 'TextureRect', parent, {
      ...layoutProps(rect, node),
      texture:      id ? `ExtResource("${id}")` : null,
      expand_mode:  1,
      stretch_mode: 6,
    });
  }
}

function convertText(node, parent, rect, accumSX = 1) {
  const cocosFontPath = node.FontResource?.Path;
  const fontPath      = toResPath(cocosFontPath);
  const fontId        = getResId(fontPath, 'FontFile');

  // Queue font asset copy if enabled
  if (COPY_ASSETS && cocosFontPath) {
    const fontData = node.FontResource;
    const srcPath = resolveCsdAssetPath(fontData);
    const assetType = getAssetType(srcPath);
    if (srcPath && assetType === 'font') {
      const dstPath = path.resolve(_sharedAssetsRoot, cocosFontPath);
      queueAssetCopy(srcPath, dstPath);
    }
  }

  const color  = toGodotColor(node.CColor);
  const outline = toGodotColor(node.OutlineColor);

  let hAlign = 0;
  if (node.HorizontalAlignmentType === 'HT_Center') hAlign = 1;
  if (node.HorizontalAlignmentType === 'HT_Right')  hAlign = 2;

  let vAlign = 0;
  if (node.VerticalAlignmentType === 'VT_Center') vAlign = 1;
  if (node.VerticalAlignmentType === 'VT_Bottom') vAlign = 2;

  // Font size scaled by node's own scaleX and accumulated parent scale
  const nodeSX = node.Scale?.ScaleX ?? 1;
  const effectiveFontSize = Math.round((node.FontSize ?? 20) * nodeSX * accumSX);

  emitNode(node.Name, 'Label', parent, {
    ...layoutProps(rect, node),
    text:               `"${node.LabelText ?? ''}"`,
    horizontal_alignment: hAlign,
    vertical_alignment:   vAlign,
    'theme_override_fonts/font':          fontId ? `ExtResource("${fontId}")` : null,
    'theme_override_font_sizes/font_size': effectiveFontSize,
    'theme_override_colors/font_color':   color,
    'theme_override_constants/outline_size':  node.OutlineEnabled ? (node.OutlineSize ?? 1) : null,
    'theme_override_colors/font_outline_color': node.OutlineEnabled ? outline : null,
  });
}

function convertButton(node, parent, rect) {
  const normIsDefault = !node.NormalFileData?.Path || node.NormalFileData?.Type === 'Default';
  const presIsDefault = !node.PressedFileData?.Path || node.PressedFileData?.Type === 'Default';

  const normPath = normIsDefault ? null : toResPath(node.NormalFileData.Path);
  const presPath = presIsDefault ? null : toResPath(node.PressedFileData.Path);

  // Queue button asset copies if enabled
  if (COPY_ASSETS) {
    if (!normIsDefault && node.NormalFileData?.Path) {
      const srcPath = resolveCsdAssetPath(node.NormalFileData);
      const assetType = getAssetType(srcPath);
      if (srcPath && assetType === 'texture') {
        const dstPath = path.resolve(_sharedAssetsRoot, node.NormalFileData.Path);
        queueAssetCopy(srcPath, dstPath);
      }
    }
    if (!presIsDefault && node.PressedFileData?.Path && presPath !== normPath) {
      const srcPath = resolveCsdAssetPath(node.PressedFileData);
      const assetType = getAssetType(srcPath);
      if (srcPath && assetType === 'texture') {
        const dstPath = path.resolve(_sharedAssetsRoot, node.PressedFileData.Path);
        queueAssetCopy(srcPath, dstPath);
      }
    }
  }

  if (!normPath && !presPath) {
    emitNode(node.Name, 'Button', parent, {
      ...layoutProps(rect, node),
      text: '""',
      flat: 'true',
    });
    return;
  }

  const normId = getResId(normPath, 'Texture2D');
  const presId = (presPath && presPath !== normPath) ? getResId(presPath, 'Texture2D') : null;
  const stretchMode = node.Scale9Enable ? 0 : 5;

  emitNode(node.Name, 'TextureButton', parent, {
    ...layoutProps(rect, node),
    texture_normal:      normId ? `ExtResource("${normId}")` : null,
    texture_pressed:     presId ? `ExtResource("${presId}")` : null,
    ignore_texture_size: 'true',
    stretch_mode:        stretchMode,
  });
}

function convertLoadingBar(node, parent, rect) {
  const cocosPath = node.ImageFileData?.Path;
  const texPath   = toResPath(cocosPath);
  const id        = getResId(texPath, 'Texture2D');

  // Queue asset copy if enabled
  if (COPY_ASSETS && cocosPath && node.ImageFileData) {
    const srcPath = resolveCsdAssetPath(node.ImageFileData);
    const assetType = getAssetType(srcPath);
    if (srcPath && assetType === 'texture') {
      const dstPath = path.resolve(_sharedAssetsRoot, cocosPath);
      queueAssetCopy(srcPath, dstPath);
    }
  }

  emitNode(node.Name, 'TextureProgressBar', parent, {
    ...layoutProps(rect, node),
    max_value:         100,
    value:             node.ProgressInfo ?? 0,
    texture_progress:  id ? `ExtResource("${id}")` : null,
    fill_mode:         0,
  });
}

function convertTextField(node, parent, rect) {
  const cocosFontPath = node.FontResource?.Path;
  const fontPath      = toResPath(cocosFontPath);
  const fontId        = getResId(fontPath, 'FontFile');

  // Queue font asset copy if enabled
  if (COPY_ASSETS && cocosFontPath) {
    const srcPath = resolveCsdAssetPath(node.FontResource);
    const assetType = getAssetType(srcPath);
    if (srcPath && assetType === 'font') {
      const dstPath = path.resolve(_sharedAssetsRoot, cocosFontPath);
      queueAssetCopy(srcPath, dstPath);
    }
  }

  emitNode(node.Name, 'LineEdit', parent, {
    ...layoutProps(rect, node),
    placeholder_text: `"${node.PlaceHolderText ?? ''}"`,
    secret:           node.PasswordEnable ? 'true' : null,
    max_length:       node.MaxLengthText  ?? null,
    'theme_override_fonts/font':           fontId ? `ExtResource("${fontId}")` : null,
    'theme_override_font_sizes/font_size': node.FontSize ?? null,
  });
}

function convertCheckBox(node, parent, rect) {
  emitNode(node.Name, 'CheckBox', parent, {
    ...layoutProps(rect, node),
    button_pressed: node.CheckedState ? 'true' : 'false',
  });
}

function convertContainer(node, parent, rect) {
  emitNode(node.Name, 'Control', parent, layoutProps(rect, node));
}

// ── ProjectNodeObjectData — sub-scene instance ───────────────────────────────
function resolveSubSceneResPath(filePath) {
  // All CSD FileData.Path values use paths relative to the CSD project root.
  // e.g. "zcsd/features/shop/package_shop_gacha_currency_layout.json"
  //   → abs json: .../res/zcsd/features/shop/package_shop_gacha_currency_layout.json
  //   → abs tscn: _outDir/features/shop/package_shop_gacha_currency_layout.tscn
  //   → res://: res://previews/shop/features/shop/package_shop_gacha_currency_layout.tscn

  if (!filePath || !_jsonProjRoot || !_outDir || !_godotRoot) {
    return null;
  }

  // Normalize path: strip zcsd/ prefix for output
  const normalizedPath = filePath.replace(/^zcsd[\\\/]/, '').replace(/\\/g, '/');
  const relTscn = normalizedPath.replace(/\.json$/, '.tscn');
  const absTscn = path.resolve(_outDir, relTscn);
  const exists = fs.existsSync(absTscn);
  const relToGodot = path.relative(_godotRoot, absTscn).replace(/\\/g, '/');
  return 'res://' + relToGodot;
}

// Two-pass conversion: collect all nested scenes first, convert them, then parent scenes
let _pendingNestedScenes = new Map(); // filePath → { jsonPath, outPath }
let _convertedNestedScenes = new Set(); // Track already-converted nested scenes

function collectNestedSceneRefs(node, parentDir) {
  if (!node) return;

  // Check if this node is a ProjectNodeObjectData
  if (node.ctype === 'ProjectNodeObjectData' && node.FileData?.Path) {
    const filePath = node.FileData.Path;
    const key = filePath.toLowerCase();

    if (!_pendingNestedScenes.has(key)) {
      // Use same normalization as resolveSubSceneResPath: strip zcsd/ prefix.
      // This handles files that live outside _jsonBatchBase (e.g. res/zcsd/...)
      const normalizedPath = filePath.replace(/^zcsd[\\\/]/, '').replace(/\\/g, '/');
      const relTscn = normalizedPath.replace(/\.json$/, '.tscn');
      const outPath = path.resolve(_outDir, relTscn);

      // Locate actual JSON source using same search order as convertProjectNode
      const possibleJsonPaths = [
        path.resolve(_jsonProjRoot, 'res', normalizedPath),
        path.resolve(_jsonProjRoot, normalizedPath),
        path.resolve(_jsonProjRoot, filePath),
        path.resolve(parentDir, filePath),
      ];
      let nestedJsonPath = possibleJsonPaths[0]; // fallback even if not found
      for (const p of possibleJsonPaths) {
        if (fs.existsSync(p)) { nestedJsonPath = p; break; }
      }

      _pendingNestedScenes.set(key, { jsonPath: nestedJsonPath, outPath, filePath });
    }
  }

  // Recurse into children
  for (const child of (node.Children ?? [])) {
    collectNestedSceneRefs(child, parentDir);
  }
}

async function processNestedScenesFirst(jsonDir) {
  // First pass: collect all nested scene references from all JSON files
  console.log('\n🔍 Scanning for nested scenes...');

  function scanForNested(dir, relBase = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanForNested(full, relBase ? `${relBase}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.json')) {
        try {
          const json = JSON.parse(fs.readFileSync(full, 'utf8'));
          const content = json.Content?.ObjectData || json.Content?.Content?.ObjectData;
          if (content?.Children) {
            collectNestedSceneRefs(content, dir);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  scanForNested(jsonDir);

  console.log(`   Found ${_pendingNestedScenes.size} nested scene(s)`);

  // Convert nested scenes first (in dependency order)
  const sorted = Array.from(_pendingNestedScenes.values()).sort((a, b) => {
    return a.outPath.localeCompare(b.outPath);
  });

  for (const scene of sorted) {
    const key = scene.filePath.toLowerCase();
    if (_convertedNestedScenes.has(key)) continue;

    console.log(`   🔄 Converting nested: ${scene.filePath}`);
    await convertNestedScene(scene.jsonPath, path.relative(_outDir, scene.outPath));
    _convertedNestedScenes.add(key);
  }
}

// Recursive conversion for nested CSD scenes
async function convertNestedScene(jsonPath, relativeOutPath) {
  const outPath = path.resolve(_outDir, relativeOutPath);
  const absDir  = path.dirname(jsonPath);
  const jsonDir = path.dirname(jsonPath);
  const jsonProjRoot = path.dirname(jsonDir);

  // Save current context
  const savedProjRoot = _jsonProjRoot;
  const savedBatchBase = _jsonBatchBase;

  // Temporarily set context to nested scene's directory
  _jsonProjRoot  = jsonProjRoot;
  _jsonBatchBase = jsonDir;

  // Convert the nested scene
  await convert(jsonPath, outPath);

  // Restore context
  _jsonProjRoot  = savedProjRoot;
  _jsonBatchBase = savedBatchBase;

  // Also process its assets
  if (COPY_ASSETS) {
    const nestedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    collectNestedAssets(nestedJson.Content?.ObjectData || nestedJson.Content?.Content?.ObjectData, absDir);
  }
}

function collectNestedAssets(node, parentDir) {
  if (!node) return;

  // Collect FileData references
  const fileFields = ['FileData', 'NormalFileData', 'PressedFileData', 'ImageFileData', 'FontResource'];
  for (const field of fileFields) {
    const data = node[field];
    if (data?.Path) {
      const srcPath = path.resolve(parentDir, data.Path);
      const dstPath = path.resolve(_sharedAssetsRoot, data.Path);
      if (fs.existsSync(srcPath)) {
        queueAssetCopy(srcPath, dstPath);
      }
    }
  }

  // Recurse into children
  for (const child of (node.Children ?? [])) {
    collectNestedAssets(child, parentDir);
  }
}

async function convertProjectNode(node, parent, rect) {
  const filePath = node.FileData?.Path;
  const resPath  = resolveSubSceneResPath(filePath);

  if (!resPath) {
    // Can't resolve — fall back to plain container so at least position is correct
    convertContainer(node, parent, rect);
    return;
  }

  const absTscnPath = path.resolve(_godotRoot || _outDir, resPath.replace('res://', ''));
  const key = filePath.toLowerCase();

  // Check if nested scene tscn exists (already converted in first pass)
  if (fs.existsSync(absTscnPath) || _convertedNestedScenes.has(key)) {
    const id = getResId(resPath, 'PackedScene');
    emitInstanceNode(node.Name, parent, id, layoutProps(rect, node));
    return;
  }

  // Check if nested JSON source exists
  const normalizedPath = filePath.replace(/^zcsd[\\\/]/, '').replace(/\\/g, '/');
  const possibleJsonPaths = [
    path.resolve(_jsonProjRoot, 'res', normalizedPath),
    path.resolve(_jsonProjRoot, normalizedPath),
  ];

  let nestedJsonPath = null;
  for (const p of possibleJsonPaths) {
    if (fs.existsSync(p)) {
      nestedJsonPath = p;
      break;
    }
  }

  if (nestedJsonPath && COPY_ASSETS) {
    // Convert nested scene recursively
    const relTscn = normalizedPath.replace(/\.json$/, '.tscn');
    const nestedOutPath = path.resolve(_outDir, relTscn);

    console.log(`   🔄 Converting nested scene: ${filePath} → ${nestedOutPath}`);
    await convertNestedScene(nestedJsonPath, path.relative(_outDir, nestedOutPath));
    _convertedNestedScenes.add(key);

    // Now that nested scene is converted, reference it
    const id = getResId(resPath, 'PackedScene');
    emitInstanceNode(node.Name, parent, id, layoutProps(rect, node));
  } else {
    // Fallback to container if not copying assets or source doesn't exist
    convertContainer(node, parent, rect);
  }
}

// ── Recursive node processor ─────────────────────────────────────────────────
// accumSX / accumSY: product of all ancestor scales — passed down to correctly
// compute each node's visual rect in a flat (no-scale-property) Godot layout.
// SpriteObjectData is an exception: own scale is emitted as a Godot scale property
// instead of being baked into the rect, so Godot propagates it to children automatically.
function processNode(node, parentPath, parentH, accumSX = 1, accumSY = 1) {
  const name = node.Name || 'Node';
  const nodePath = parentPath === '.' ? escapeName(name) : `${parentPath}/${escapeName(name)}`;

  // Sprites emit an explicit scale property — use natural rect (own scale NOT baked).
  // All other types bake own scale into the rect as before.
  const isSprite = node.ctype === 'SpriteObjectData';
  const rect = isSprite
    ? convertRectNatural(node, parentH, accumSX, accumSY)
    : convertRect(node, parentH, accumSX, accumSY);

  switch (node.ctype) {
    case 'SpriteObjectData':       convertSprite(node, parentPath, rect);               break;
    case 'ImageViewObjectData':    convertImageView(node, parentPath, rect);            break;
    case 'TextObjectData':         convertText(node, parentPath, rect, accumSX);        break;
    case 'ButtonObjectData':       convertButton(node, parentPath, rect);               break;
    case 'LoadingBarObjectData':   convertLoadingBar(node, parentPath, rect);           break;
    case 'TextFieldObjectData':    convertTextField(node, parentPath, rect);            break;
    case 'CheckBoxObjectData':     convertCheckBox(node, parentPath, rect);             break;
    case 'ProjectNodeObjectData':  convertProjectNode(node, parentPath, rect);          break;
    default:                       convertContainer(node, parentPath, rect);            break;
  }

  // For sprites: own scale is a Godot property — Godot propagates it to children,
  // so children are in this node's LOCAL (pre-scale) space. Don't multiply into childAccum.
  // For all other nodes: own scale is baked into rect, so accumulate it for children.
  const sx = node.Scale?.ScaleX ?? 1;
  const sy = node.Scale?.ScaleY ?? 1;
  const childAccumSX = isSprite ? accumSX : accumSX * sx;
  const childAccumSY = isSprite ? accumSY : accumSY * sy;
  const childH = isSprite ? rect.h * sy : rect.h;  // visual height for Y-flip in children
  for (const child of (node.Children ?? [])) {
    processNode(child, nodePath, childH, childAccumSX, childAccumSY);
  }
}

// ── Main convert ─────────────────────────────────────────────────────────────
async function convert(jsonPath, outPath) {
  resetRegistry();
  _lines = [];
  _copyQueue = []; // Reset copy queue per file

  const json      = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const sceneName = json.Name;
  const root      = json.Content.Content.ObjectData;
  const sceneW    = root.Size?.X ?? 1368;
  const sceneH    = root.Size?.Y ?? 640;

  for (const child of (root.Children ?? [])) {
    processNode(child, '.', sceneH);
  }

  // Build ext_resource section with proper UID format
  const extLines = [];
  for (const [resPath, { id, type, uid }] of _resMap.entries()) {
    // For PackedScene (nested scenes), use UID format; for others use path format
    if (type === 'PackedScene' && uid) {
      extLines.push(`[ext_resource type="${type}" uid="${uid}" path="${resPath}" id="${id}"]`);
    } else {
      extLines.push(`[ext_resource type="${type}" path="${resPath}" id="${id}"]`);
    }
  }

  const uid       = 'uid://' + randomBase62(12);
  const loadSteps = _resMap.size + 1;

  const header = [
    `[gd_scene load_steps=${loadSteps} format=3 uid="${uid}"]`,
    '',
    extLines.join('\n'),
    '',
    `[node name="${sceneName}" type="Control"]`,
    'anchor_right = 1.0',
    'anchor_bottom = 1.0',
    '',
  ].join('\n');

  const content = header + _lines.join('\n');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`✓  ${path.basename(jsonPath).padEnd(35)} → ${outPath}`);

  // Process asset copies if enabled
  if (COPY_ASSETS) {
    await processCopyQueue();
  }
}

function randomBase62(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ── CLI ───────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);
  const args = [];
  let batchMode = false;

  // Parse args and collect non-flag arguments
  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i] === '--batch') {
      batchMode = true;
    } else if (rawArgs[i] === '--copy') {
      // handled via process.argv.includes above
    } else if (rawArgs[i] === '--assets-dir') {
      _sharedAssetsRoot = path.resolve(rawArgs[++i]);
    } else {
      args.push(rawArgs[i]);
    }
  }

  if (batchMode) {
    const jsonDir = args[0];
    const outDir  = args[1];
    if (!jsonDir || !outDir) {
      console.error('Usage: node csd2tscn.js --batch [--copy] <json_dir> <out_dir>');
      process.exit(1);
    }

    // Set context for ProjectNodeObjectData resolution
    _jsonBatchBase = path.resolve(jsonDir);
    // CSD project root: go up to find 'zcsd' or similar base folder
    let projRoot = path.resolve(jsonDir, '..');
    let loopCount = 0;
    while (projRoot && path.basename(projRoot) !== 'zcsd' && path.basename(projRoot) !== 'res') {
      const parent = path.dirname(projRoot);
      if (parent === projRoot) break;
      projRoot = parent;
      loopCount++;
      if (loopCount > 10) break;
    }
    _jsonProjRoot = projRoot;
    _outDir        = path.resolve(outDir);
    _godotRoot     = findGodotRoot(_outDir);
    if (!_godotRoot) {
      console.warn('⚠  Could not find project.godot from', outDir, '— sub-scene refs may be broken');
    } else {
      console.log('   Godot root:', _godotRoot);
      console.log('   CSD proj root:', _jsonProjRoot);
    }
    if (!_sharedAssetsRoot) {
      _sharedAssetsRoot = path.resolve(_godotRoot || _outDir, 'assets');
    }
    console.log('   Assets root:', _sharedAssetsRoot);

    // Two-pass: First convert all nested scenes, then parent scenes
    await processNestedScenesFirst(jsonDir);

    async function walkJsonDir(dir, outBase, relBase = '') {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        const rel  = relBase ? `${relBase}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walkJsonDir(full, outBase, rel);
        } else if (entry.name.endsWith('.json')) {
          const outPath = path.join(outBase, rel.replace(/\.json$/, '.tscn'));
          await convert(full, outPath);
        }
      }
    }
    await walkJsonDir(jsonDir, outDir);

  } else if (args.length === 2 && !batchMode) {
    // Single-file mode — walk up from input file to find the 'ui/' batch base
    // (all CSD FileData.Path values are relative to the parent of 'ui/')
    function findBatchContext(jsonFile) {
      let dir = path.resolve(path.dirname(jsonFile));
      while (true) {
        if (path.basename(dir) === 'ui') return { batchBase: dir, projRoot: path.dirname(dir) };
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
      // fallback: use file's dir
      return { batchBase: path.resolve(path.dirname(jsonFile)), projRoot: path.resolve(path.dirname(jsonFile), '..') };
    }
    const ctx = findBatchContext(args[0]);
    _jsonBatchBase = ctx.batchBase;
    _jsonProjRoot  = ctx.projRoot;
    // Mirror the batch-mode outDir: go up as many levels from the output file
    // as the input file is deep relative to batchBase
    const relDepth = path.relative(ctx.batchBase, path.resolve(args[0])).split(/[\\/]/).length;
    _outDir        = path.resolve(args[1], '../'.repeat(relDepth));
    _godotRoot     = findGodotRoot(path.resolve(path.dirname(args[1])));
    if (!_sharedAssetsRoot) {
      _sharedAssetsRoot = path.resolve(_godotRoot || _outDir, 'assets');
    }
    await convert(args[0], args[1]);

  } else {
    console.error('Usage:');
    console.error('  node tools/csd2tscn.js <input.json> <output.tscn>');
    console.error('  node tools/csd2tscn.js --batch [--copy] [--assets-dir <path>] <json_dir> <out_dir>');
    console.error('');
    console.error('Options:');
    console.error('  --copy              Auto-copy resource files (images, fonts, spritesheets)');
    console.error('  --assets-dir <path> Shared assets destination (default: <godot_root>/assets)');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
