'use strict';
const assert = require('assert');
const { mapNodeType, slugify, toPascalCase, calcOffsets } = require('./psd2tscn');

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log('  ✓', name); passed++; }
  catch(e) { console.error('  ✗', name, '\n   ', e.message); failed++; }
}

// slugify
test('slugify lowercases and hyphenates', () => {
  assert.strictEqual(slugify('GuiChar_Tab1'), 'guichar-tab1');
  assert.strictEqual(slugify('UI_NhanVat'), 'ui-nhanvat');
});

// toPascalCase
test('toPascalCase handles hyphen slug', () => {
  assert.strictEqual(toPascalCase('guichar-tab1'), 'GuicharTab1');
});

// mapNodeType
test('Sprite2D with image → TextureRect', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Sprite2D', image_exported: true }), 'TextureRect');
});
test('AnimatedSprite2D → TextureRect (static preview)', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'AnimatedSprite2D', image_exported: true }), 'TextureRect');
});
test('TextureRect → TextureRect', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'TextureRect', image_exported: true }), 'TextureRect');
});
test('Button with image → TextureRect', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Button', image_exported: true }), 'TextureRect');
});
test('Panel with image → TextureRect', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Panel', image_exported: true }), 'TextureRect');
});
test('ScrollContainer with image → TextureRect', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'ScrollContainer', image_exported: true }), 'TextureRect');
});
test('Label exported=false → Label', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Label', image_exported: false }), 'Label');
});
test('Label exported=true → TextureRect (image-based)', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Label', image_exported: true }), 'TextureRect');
});
test('Node2D with children → Control', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Node2D', image_exported: undefined, children: [{}] }), 'Control');
});
test('undefined godot_type → Control (fallback)', () => {
  assert.strictEqual(mapNodeType({ godot_type: undefined }), 'Control');
});
test('Sprite2D with image_exported=false → Control (no texture)', () => {
  assert.strictEqual(mapNodeType({ godot_type: 'Sprite2D', image_exported: false }), 'Control');
});
test('opacity=0 → mapNodeType still returns TextureRect (visibility handled separately)', () => {
  const result = mapNodeType({ godot_type: 'TextureRect', image_exported: true, opacity: 0 });
  assert.strictEqual(result, 'TextureRect');
});

// calcOffsets — from bounds (top-left system)
test('calcOffsets from bounds', () => {
  const node = { bounds: { left: 10, top: 20, right: 110, bottom: 120 } };
  const o = calcOffsets(node, { scale_x: 1, scale_y: 1 });
  assert.deepStrictEqual(o, { left: 10, top: 20, right: 110, bottom: 120 });
});
test('calcOffsets applies scale', () => {
  const node = { bounds: { left: 100, top: 50, right: 200, bottom: 150 } };
  const o = calcOffsets(node, { scale_x: 0.5, scale_y: 0.5 });
  assert.deepStrictEqual(o, { left: 50, top: 25, right: 100, bottom: 75 });
});

const { generateTscn, scanBatch } = require('./psd2tscn');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Minimal scene: 1 Sprite2D node (as child of synthetic root)
test('generateTscn produces valid .tscn header', () => {
  const json = {
    design: { width: 100, height: 50, scale_x: 1, scale_y: 1 },
    scene_tree: [{
      name: 'Bg', godot_type: 'Sprite2D', image_exported: true,
      image: 'bg.png',
      bounds: { left: 0, top: 0, right: 100, bottom: 50 },
      opacity: 1, visible: true, children: []
    }]
  };
  const tscn = generateTscn(json, 'test-scene', 'res://assets/ui/images/test-scene/');
  assert.ok(tscn.startsWith('[gd_scene'), 'must start with [gd_scene');
  assert.ok(tscn.includes('ext_resource'), 'must have ext_resource for image');
  assert.ok(tscn.includes('type="TextureRect"'), 'Sprite2D maps to TextureRect');
  assert.ok(tscn.includes('PreviewTestScene'), 'root node name is PascalCase');
  assert.ok(tscn.includes('[node name="PreviewTestScene" type="Control"]'), 'synthetic root');
  assert.ok(tscn.includes('parent="."'), 'scene_tree nodes are children of root');
});

test('generateTscn: multiple top-level nodes are all children of synthetic root', () => {
  const json = {
    design: { width: 100, height: 50, scale_x: 1, scale_y: 1 },
    scene_tree: [
      { name: 'A', godot_type: 'TextureRect', image_exported: true, image: 'a.png',
        bounds: { left: 0, top: 0, right: 10, bottom: 10 }, opacity: 1, visible: true, children: [] },
      { name: 'B', godot_type: 'TextureRect', image_exported: true, image: 'b.png',
        bounds: { left: 10, top: 0, right: 20, bottom: 10 }, opacity: 1, visible: true, children: [] },
    ]
  };
  const tscn = generateTscn(json, 'multi', 'res://assets/ui/images/multi/');
  const rootMatches = (tscn.match(/\[node name="PreviewMulti"/g) || []).length;
  assert.strictEqual(rootMatches, 1, 'only ONE root node declaration');
  const parentDotMatches = (tscn.match(/parent="\."/g) || []).length;
  assert.strictEqual(parentDotMatches, 2, 'both top-level nodes have parent="."');
});

test('generateTscn: opacity=0 node gets visible = false', () => {
  const json = {
    design: { width: 100, height: 50, scale_x: 1, scale_y: 1 },
    scene_tree: [{
      name: 'Hidden', godot_type: 'TextureRect', image_exported: true,
      image: 'img.png',
      bounds: { left: 0, top: 0, right: 10, bottom: 10 },
      opacity: 0, visible: true, children: []
    }]
  };
  const tscn = generateTscn(json, 'test', 'res://assets/ui/images/test/');
  assert.ok(tscn.includes('visible = false'), 'opacity=0 → visible=false');
});

test('generateTscn: nested children get correct parent path', () => {
  const json = {
    design: { width: 100, height: 50, scale_x: 1, scale_y: 1 },
    scene_tree: [{
      name: 'Group', godot_type: 'Node2D', image_exported: undefined,
      bounds: { left: 0, top: 0, right: 100, bottom: 50 },
      opacity: 1, visible: true,
      children: [{
        name: 'Icon', godot_type: 'TextureRect', image_exported: true,
        image: 'icon.png',
        bounds: { left: 5, top: 5, right: 20, bottom: 20 },
        opacity: 1, visible: true, children: []
      }]
    }]
  };
  const tscn = generateTscn(json, 'test', 'res://assets/ui/images/test/');
  assert.ok(tscn.includes('parent="."'), 'top-level node has parent="." (child of synthetic root)');
  assert.ok(tscn.includes('parent="Group"'), 'nested child has parent="Group"');
});

test('generateTscn: duplicate sibling names get _N suffix', () => {
  const json = {
    design: { width: 100, height: 50, scale_x: 1, scale_y: 1 },
    scene_tree: [
      { name: 'Panel', godot_type: 'TextureRect', image_exported: true, image: 'p1.png',
        bounds: { left: 0, top: 0, right: 10, bottom: 10 }, opacity: 1, visible: true, children: [] },
      { name: 'Panel', godot_type: 'TextureRect', image_exported: true, image: 'p2.png',
        bounds: { left: 0, top: 0, right: 10, bottom: 10 }, opacity: 1, visible: true, children: [] },
    ]
  };
  const tscn = generateTscn(json, 'test', 'res://assets/ui/images/test/');
  assert.ok(tscn.includes('name="Panel"'), 'first Panel keeps name');
  assert.ok(tscn.includes('name="Panel_1"'), 'duplicate Panel renamed to Panel_1');
});

test('scanBatch finds *_scene.json files recursively', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'psd2tscn-'));
  const subDir = path.join(tmpDir, 'scene1');
  fs.mkdirSync(subDir);
  fs.writeFileSync(path.join(subDir, 'foo_scene.json'), '{}');
  fs.writeFileSync(path.join(subDir, 'other.json'), '{}');
  const found = scanBatch(tmpDir);
  assert.strictEqual(found.length, 1);
  assert.ok(found[0].endsWith('foo_scene.json'));
  fs.rmSync(tmpDir, { recursive: true });
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
