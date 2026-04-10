#!/usr/bin/env node
/**
 * Regression test: nested child offsets must be parent-relative, not absolute.
 *
 * Bug: psd2tscn.js used absolute bounds for all nodes.
 * Fix: child offsets = node.bounds - parent.bounds.topLeft
 *
 * Run: node tests/test_nested_offsets.js
 * Exit 0 = PASS, Exit 1 = FAIL
 */
'use strict';

const assert = require('assert');
const { generateTscn } = require('../scripts/psd2tscn.js');

// ── Minimal JSON with a nested child (Btn > SDNg) ────────────────────────────
const FIXTURE = {
  design: { width: 1368, height: 640 },
  scene_tree: [
    {
      name: 'Group1',
      godot_type: 'Control',
      image_exported: false,
      bounds: { left: 0, top: -2, right: 1368, bottom: 635 },
      opacity: 1,
      children: [
        {
          name: 'Btn01',
          godot_type: 'Control',
          image_exported: false,
          bounds: { left: 63, top: 532, right: 377, bottom: 629 },
          opacity: 1,
          children: [
            {
              name: 'SDNg',
              godot_type: 'TextureRect',
              image_exported: true,
              image: 'img_s_d_ng.png',
              bounds: { left: 63, top: 532, right: 377, bottom: 629 },
              opacity: 1,
              children: [],
            },
          ],
        },
        {
          name: 'Slot01',
          godot_type: 'Control',
          image_exported: false,
          bounds: { left: 910, top: 333, right: 1328, bottom: 420 },
          opacity: 1,
          children: [
            {
              name: 'Panel02',
              godot_type: 'TextureRect',
              image_exported: true,
              image: 'img_02_3.png',
              bounds: { left: 917, top: 341, right: 1328, bottom: 414 },
              opacity: 1,
              children: [],
            },
            {
              name: 'Panel02Copy3',
              godot_type: 'TextureRect',
              image_exported: true,
              image: 'img_02_copy_3.png',
              bounds: { left: 910, top: 333, right: 1030, bottom: 420 },
              opacity: 1,
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

const tscn = generateTscn(FIXTURE, 'test-scene', 'res://assets/high/test/');

// Parse offset values from tscn text for a given node name
function getOffsets(tscnText, nodeName) {
  const lines = tscnText.split('\n');
  let inNode = false;
  const result = {};
  for (const line of lines) {
    if (line.startsWith(`[node name="${nodeName}"`)) { inNode = true; continue; }
    if (inNode && line.startsWith('[')) { inNode = false; continue; }
    if (!inNode) continue;
    const m = line.match(/^(offset_\w+)\s*=\s*(-?[\d.]+)/);
    if (m) result[m[1]] = parseFloat(m[2]);
  }
  return result;
}

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  try {
    assert.strictEqual(actual, expected, `${label}: expected ${expected}, got ${actual}`);
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
    failed++;
  }
}

console.log('\n=== Regression: nested child offsets must be parent-relative ===\n');

// ── SDNg: child of Btn01 (abs 63,532 → 377,629) ─────────────────────────────
// SDNg same abs bounds as Btn01 → relative = (0, 0, 314, 97)
const sdng = getOffsets(tscn, 'SDNg');
console.log('SDNg offsets:', sdng);
check('SDNg offset_left',   sdng.offset_left,   0);
check('SDNg offset_top',    sdng.offset_top,     0);
check('SDNg offset_right',  sdng.offset_right,   314);   // 377-63
check('SDNg offset_bottom', sdng.offset_bottom,  97);    // 629-532

// ── Panel02: child of Slot01 (abs 910,333 → 1328,420) ───────────────────────
// Panel02 abs: 917,341 → 1328,414 → relative: (7, 8, 418, 81)
const panel02 = getOffsets(tscn, 'Panel02');
console.log('\nPanel02 offsets:', panel02);
check('Panel02 offset_left',   panel02.offset_left,   7);    // 917-910
check('Panel02 offset_top',    panel02.offset_top,    8);    // 341-333
check('Panel02 offset_right',  panel02.offset_right,  418);  // 1328-910
check('Panel02 offset_bottom', panel02.offset_bottom, 81);   // 414-333

// ── Panel02Copy3: child of Slot01 ────────────────────────────────────────────
// abs: 910,333 → 1030,420 → relative: (0, 0, 120, 87)
const p2c3 = getOffsets(tscn, 'Panel02Copy3');
console.log('\nPanel02Copy3 offsets:', p2c3);
check('Panel02Copy3 offset_left',   p2c3.offset_left,   0);
check('Panel02Copy3 offset_top',    p2c3.offset_top,    0);
check('Panel02Copy3 offset_right',  p2c3.offset_right,  120);  // 1030-910
check('Panel02Copy3 offset_bottom', p2c3.offset_bottom, 87);   // 420-333

// ── Btn01: direct child of Group1 (parent top=-2) ────────────────────────────
// Btn01 abs: 63,532 → 377,629. Group1 top=-2 → relative_top = 532-(-2) = 534
const btn01 = getOffsets(tscn, 'Btn01');
console.log('\nBtn01 offsets:', btn01);
check('Btn01 offset_left',   btn01.offset_left,   63);
check('Btn01 offset_top',    btn01.offset_top,    534);  // 532-(-2)
check('Btn01 offset_right',  btn01.offset_right,  377);
check('Btn01 offset_bottom', btn01.offset_bottom, 631);  // 629-(-2)

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error('FAIL — nested child offsets are wrong (absolute instead of parent-relative)');
  process.exit(1);
} else {
  console.log('PASS — all nested child offsets are correct');
  process.exit(0);
}
