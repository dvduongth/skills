#!/usr/bin/env node
/**
 * psd2tscn.js — Convert PSD-style JSON art export to Godot 4 .tscn
 *
 * Usage:
 *   node psd2tscn.js <source_json> <output_tscn>
 *   node psd2tscn.js --batch <source_dir> <output_dir>
 *   node psd2tscn.js --batch --copy <source_dir> <output_dir>
 *
 * Flags:
 *   --copy              Copy images to assets/ (default: OFF)
 *   --no-copy           Explicit skip (default)
 *   --assets-dir <path> Override assets destination
 *   --dry-run           Print plan, no files written
 *   --verbose           Log each node
 *   --help              Print usage
 *
 * Exit codes: 0=success, 1=input error, 2=conversion error
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs(argv) {
  const args = { batch: false, copy: false, dryRun: false, verbose: false, assetsDir: null, src: null, dst: null };
  let i = 0;
  while (i < argv.length) {
    switch (argv[i]) {
      case '--batch':    args.batch   = true;           break;
      case '--copy':     args.copy    = true;            break;
      case '--no-copy':  args.copy    = false;           break;
      case '--dry-run':  args.dryRun  = true;            break;
      case '--verbose':  args.verbose = true;            break;
      case '--help':     printHelp(); process.exit(0);   break;
      case '--assets-dir':     args.assetsDir    = argv[++i]; break;
      case '--assets-res-path': args.assetsResPath = argv[++i]; break;
      default:
        if (!argv[i].startsWith('--')) {
          if (!args.src) args.src = argv[i];
          else           args.dst = argv[i];
        }
    }
    i++;
  }
  return args;
}

function printHelp() {
  console.log(`
psd2tscn.js — Convert PSD-style JSON → Godot 4 .tscn

Usage:
  node psd2tscn.js <source_json> <output_tscn>
  node psd2tscn.js --batch [--copy] <source_dir> <output_dir>

Flags:
  --copy              Copy images to assets/ dir (default: OFF)
  --no-copy           Explicit: skip asset copy
  --assets-dir <path> Override assets destination
  --dry-run           Print plan only, no files written
  --verbose           Log each node processed
  --help              Print this help

Exit codes: 0=success, 1=input error, 2=conversion error
`.trim());
}

// ── Utilities ────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/_/g, '-');
}

function toPascalCase(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// Node types that are purely containers (no texture even if godot_type suggests one)
const CONTAINER_TYPES = new Set(['Node2D', 'Control', 'CanvasLayer', 'Node']);

function mapNodeType(node) {
  const { godot_type, image_exported } = node;
  if (!godot_type) return 'Control';
  if (CONTAINER_TYPES.has(godot_type)) return 'Control';
  if (godot_type === 'Label' && !image_exported) return 'Label';
  // All visual types with exported images → TextureRect (static preview)
  // Covers: Sprite2D, AnimatedSprite2D, TextureRect, Button, Panel, ScrollContainer, etc.
  if (image_exported === true) return 'TextureRect';
  // Has children but no image → container
  if (node.children && node.children.length > 0) return 'Control';
  return 'Control'; // fallback
}

// Bounds in scene JSON are already in game-space coordinates (design.width × design.height).
// scale_x/scale_y in the JSON describes the PSD→game conversion done by the exporter,
// not a transform we need to re-apply here.
function calcOffsets(node) {
  const b = node.bounds;
  return {
    left:   Math.round(b.left   * 100) / 100,
    top:    Math.round(b.top    * 100) / 100,
    right:  Math.round(b.right  * 100) / 100,
    bottom: Math.round(b.bottom * 100) / 100,
  };
}

// ── Resource Registry ─────────────────────────────────────────────────────────

function createRegistry() {
  let nextId = 1;
  const map = new Map();
  return {
    getOrAdd(resPath) {
      if (!resPath) return null;
      if (map.has(resPath)) return map.get(resPath);
      const id = String(nextId++);
      map.set(resPath, id);
      return id;
    },
    entries() { return [...map.entries()]; },
    size() { return map.size; }
  };
}

function randomUid() {
  return 'uid://' + crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

// ── .tscn Generator ───────────────────────────────────────────────────────────

function generateTscn(json, slug, assetsResPath) {
  if (!json.design) console.warn(`Warning: missing "design" block in JSON, using scale 1.0`);
  const design = json.design || {};
  const w = design.width  || 1368;
  const h = design.height || 640;

  const reg = createRegistry();
  const nodeLines = [];
  const rootName = 'Preview' + toPascalCase(slug);

  function scanResources(nodes) {
    nodes.forEach(n => {
      if (n.image_exported === true && n.image) reg.getOrAdd(assetsResPath + n.image);
      if (n.children && n.children.length) scanResources(n.children);
    });
  }
  scanResources(json.scene_tree);

  function walkNodes(nodes, parentPath) {
    const seenNames = new Set();
    nodes.forEach(n => {
      let nodeName = n.name;
      if (seenNames.has(nodeName)) {
        let suffix = 1;
        while (seenNames.has(`${nodeName}_${suffix}`)) suffix++;
        console.warn(`Warning: duplicate node name "${nodeName}" under "${parentPath}", renamed to "${nodeName}_${suffix}"`);
        nodeName = `${nodeName}_${suffix}`;
      }
      seenNames.add(nodeName);

      const godotType = mapNodeType(n);
      const offsets   = calcOffsets(n);

      nodeLines.push('');
      nodeLines.push(`[node name="${nodeName}" type="${godotType}" parent="${parentPath}"]`);
      nodeLines.push(`offset_left = ${offsets.left}`);
      nodeLines.push(`offset_top = ${offsets.top}`);
      nodeLines.push(`offset_right = ${offsets.right}`);
      nodeLines.push(`offset_bottom = ${offsets.bottom}`);

      if (n.opacity === 0 || n.visible === false) {
        nodeLines.push('visible = false');
      } else if (typeof n.opacity === 'number' && n.opacity < 1) {
        nodeLines.push(`modulate = Color(1, 1, 1, ${n.opacity})`);
      }

      if (n.image_exported === true && n.image) {
        const resPath = assetsResPath + n.image;
        const id = reg.getOrAdd(resPath);
        nodeLines.push(`texture = ExtResource("${id}")`);
      }

      if (godotType === 'Label' && n.text) {
        const content = typeof n.text === 'object' ? (n.text.content || '') : String(n.text);
        if (content) {
          nodeLines.push(`text = "${content.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
        }
      }

      if (n.children && n.children.length) {
        const childPath = parentPath === '.' ? nodeName : parentPath + '/' + nodeName;
        walkNodes(n.children, childPath);
      }
    });
  }

  nodeLines.push('');
  nodeLines.push(`[node name="${rootName}" type="Control"]`);
  nodeLines.push(`size = Vector2(${w}, ${h})`);

  walkNodes(json.scene_tree, '.');

  const resources = reg.entries();
  const loadSteps = resources.length + 1;
  const header = [`[gd_scene load_steps=${loadSteps} format=3]`, ''];
  resources.forEach(([resPath, id]) => {
    header.push(`[ext_resource type="Texture2D" uid="${randomUid()}" path="${resPath}" id="${id}"]`);
  });

  return [...header, ...nodeLines, ''].join('\n');
}

// ── Asset Copy ────────────────────────────────────────────────────────────────

function copyAssets(imagesDir, destDir, dryRun, verbose) {
  if (!fs.existsSync(imagesDir)) {
    console.warn(`  Warning: images dir not found: ${imagesDir}`);
    return 0;
  }
  const files = fs.readdirSync(imagesDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  let copied = 0;
  files.forEach(file => {
    const src = path.join(imagesDir, file);
    if (!fs.existsSync(src)) {
      console.warn(`  Warning: image file not found, skipping: ${src}`);
      return;
    }
    const dst = path.join(destDir, file);
    if (verbose) console.log(`  copy: ${src} → ${dst}`);
    if (!dryRun) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dst);
    }
    copied++;
  });
  return copied;
}

// ── Single File Conversion ────────────────────────────────────────────────────

function convertFile(jsonPath, outTscn, args) {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Source JSON not found: ${jsonPath}`);
  }

  let json;
  try {
    json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${jsonPath}\n${e.message}`);
  }

  if (!json.scene_tree) {
    throw new Error(`Invalid format: missing scene_tree in ${jsonPath}`);
  }

  const srcDir     = path.dirname(jsonPath);
  const slug       = slugify(path.basename(srcDir));
  const moduleName = slugify(path.basename(path.dirname(srcDir)));
  // Allow override via --assets-res-path; fallback to convention-based path
  const assetsResPath = args.assetsResPath || `res://assets/high/${moduleName}/${slug}/`;

  if (args.verbose) console.log(`  Converting: ${path.basename(jsonPath)} → ${slug}`);

  const tscnContent = generateTscn(json, slug, assetsResPath);

  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(outTscn), { recursive: true });
    fs.writeFileSync(outTscn, tscnContent, 'utf8');
  }
  if (args.verbose || args.dryRun) {
    console.log(`  ${args.dryRun ? '[dry-run] would write' : 'wrote'}: ${outTscn}`);
  }

  let assetsCopied = 0;
  if (args.copy) {
    const imagesDir = path.join(srcDir, 'images');
    let assetsDestDir;
    if (args.assetsDir) {
      // Use assetsDir as-is — caller specifies the exact destination folder
      assetsDestDir = args.assetsDir;
    } else {
      const parts = outTscn.split(/[/\\]/);
      const previewsIdx = parts.findIndex(p => p === 'previews');
      if (previewsIdx < 0) {
        console.warn('  Warning: cannot auto-detect godot root from output path, use --assets-dir');
        assetsDestDir = path.join(path.dirname(outTscn), '..', '..', 'assets', 'ui', 'images', slug);
      } else {
        const godotRoot = parts.slice(0, previewsIdx).join(path.sep);
        assetsDestDir = path.join(godotRoot, 'assets', 'ui', 'images', slug);
      }
    }
    assetsCopied = copyAssets(imagesDir, assetsDestDir, args.dryRun, args.verbose);
  }

  return { tscnPath: outTscn, assetsCopied, slug };
}

function scanBatch(srcDir) {
  const results = [];
  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('_scene.json')) results.push(full);
    });
  }
  walk(srcDir);
  return results;
}

async function runBatch(args) {
  const jsonFiles = scanBatch(args.src);
  if (jsonFiles.length === 0) {
    console.warn('No *_scene.json files found in:', args.src);
    return;
  }

  console.log(`Found ${jsonFiles.length} scene(s):`);
  jsonFiles.forEach((f, i) => console.log(`  ${i+1}. ${path.relative(args.src, f)}`));
  if (args.dryRun) console.log('\n[dry-run mode — no files written]\n');

  let totalAssets = 0, errors = 0;

  for (const jsonPath of jsonFiles) {
    const slug     = slugify(path.basename(path.dirname(jsonPath)));
    const tscnName = 'Preview' + toPascalCase(slug) + '.tscn';
    const outTscn  = path.join(args.dst, tscnName);

    try {
      const result = convertFile(jsonPath, outTscn, args);
      totalAssets += result.assetsCopied;
      console.log(`  ✓ ${path.basename(jsonPath)} → ${path.relative(args.dst, outTscn)}`);
    } catch (e) {
      console.error(`  ✗ ${path.basename(jsonPath)}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${jsonFiles.length - errors} converted, ${totalAssets} assets copied, ${errors} errors`);
  if (errors > 0) process.exit(2);
}

module.exports = { parseArgs, slugify, toPascalCase, mapNodeType, calcOffsets, generateTscn, scanBatch };

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.src || !args.dst) { console.error('Error: src and dst required'); process.exit(1); }
  main(args).catch(e => { console.error('Error:', e.message); process.exit(2); });
}

async function main(args) {
  if (args.batch) {
    await runBatch(args);
  } else {
    const result = convertFile(args.src, args.dst, args);
    console.log(`✓ Converted: ${path.basename(result.tscnPath)} (${result.assetsCopied} assets copied)`);
  }
}
