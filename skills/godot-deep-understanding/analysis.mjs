#!/usr/bin/env node
/**
 * Godot Engine Deep Analysis — analysis.mjs
 * Usage: node analysis.mjs "query" [depth] [output]
 *
 * depth: overview | module | file (default: module)
 * output: path to save markdown report (optional)
 *
 * Source: D:\PROJECT\CCN2\godot-master\ (4.7-dev, 6590 C++ files)
 * Research docs: D:\PROJECT\CCN2\research_doc\godot\
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, normalize, extname, relative } from 'node:path';

const DEFAULT_GODOT_PATH = "D:\\PROJECT\\CCN2\\godot-master";
const RESEARCH_DOCS_PATH = "D:\\PROJECT\\CCN2\\research_doc\\godot";
const MEMORY_PATH = "C:\\Users\\CPU60164_LOCAL\\.claude\\projects\\D--PROJECT-CCN2\\memory\\MEMORY.md";

// Files quá lớn để đọc trong overview/module depth
const SKIP_FILES = new Set([
  'rendering_device.cpp',
  'rendering_device_graph.cpp',
  'renderer_scene_cull.cpp',
  'CHANGELOG.md',
  'COPYRIGHT.txt',
]);

// Max file size để đọc (bytes) — skip nếu lớn hơn
const MAX_FILE_SIZE = 150_000; // 150KB

// C++ regex patterns (Godot-specific)
const PATTERNS = {
  gdclass:    /GDCLASS\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/,
  classDecl:  /\bclass\s+(\w+)\s*(?::\s*(?:public|private|protected)\s+(\w+))?/,
  structDecl: /\bstruct\s+(\w+)/,
  enumClass:  /\benum\s+class\s+(\w+)/,
  include:    /#include\s+"([^"]+\.h)"/g,
  namespace:  /\bnamespace\s+(\w+)\s*\{/,
  bindMethod: /ClassDB::bind_method.*?D_METHOD\s*\(\s*"([^"]+)"/g,
  addSignal:  /ADD_SIGNAL\s*\(.*?MethodInfo\s*\(\s*"([^"]+)"/g,
};

// Module knowledge base (từ research_doc/godot/godot_module_deep_dive.md)
const MODULE_KB = {
  'core/object': { purpose: 'Object system, reflection, ClassDB, memory management', key: ['Object', 'RefCounted', 'ClassDB', 'Callable', 'Signal'] },
  'core/variant': { purpose: 'Dynamic type system (44 types), scripting bridge', key: ['Variant', 'TypedArray'] },
  'core/math': { purpose: 'Math value types (stack-allocated)', key: ['Vector2', 'Vector3', 'Transform2D', 'Transform3D', 'Quaternion', 'Color'] },
  'core/io': { purpose: 'File I/O, resource loading/saving, image, JSON', key: ['FileAccess', 'ResourceLoader', 'Image', 'JSON'] },
  'core/string': { purpose: 'String types, StringName interning, translation', key: ['String', 'StringName', 'NodePath'] },
  'core/templates': { purpose: 'Generic containers (HashMap, List, etc.)', key: ['HashMap', 'HashSet', 'List', 'LocalVector'] },
  'scene/main': { purpose: 'Scene tree, Node base class, Viewport', key: ['Node', 'SceneTree', 'Viewport', 'Window'] },
  'scene/resources': { purpose: 'Resource system (Texture, Mesh, Material, Animation)', key: ['Texture2D', 'Mesh', 'Material', 'Animation', 'PackedScene'] },
  'scene/2d': { purpose: '2D nodes (sprites, physics, camera, tilemap)', key: ['Sprite2D', 'CharacterBody2D', 'TileMap', 'Camera2D'] },
  'scene/3d': { purpose: '3D nodes (mesh, physics, lights, camera)', key: ['MeshInstance3D', 'RigidBody3D', 'Camera3D', 'DirectionalLight3D'] },
  'scene/gui': { purpose: 'UI framework (Button, Label, Container, etc.)', key: ['Control', 'Button', 'Container', 'Label', 'LineEdit'] },
  'scene/animation': { purpose: 'Animation system (player, library, tween)', key: ['AnimationPlayer', 'AnimationTree', 'Tween'] },
  'servers/rendering': { purpose: 'Rendering pipeline (Forward+, Mobile, Compatibility)', key: ['RenderingServer', 'RenderingDevice', 'RendererRD'] },
  'servers': { purpose: 'Backend services (physics, audio, display, navigation, text)', key: ['PhysicsServer3D', 'AudioServer', 'DisplayServer', 'NavigationServer3D'] },
  'modules/gdscript': { purpose: 'GDScript language runtime (tokenizer→parser→compiler→VM)', key: ['GDScript', 'GDScriptParser', 'GDScriptVM'] },
  'modules/mono': { purpose: 'C# scripting via Mono/.NET', key: ['CSharpScript', 'MonoGCHandle'] },
  'modules/openxr': { purpose: 'OpenXR/VR/AR framework', key: ['OpenXRInterface', 'OpenXRAction'] },
  'modules/jolt_physics': { purpose: 'Jolt physics engine (alternative to Godot Physics)', key: ['JoltPhysicsServer3D', 'JoltBody3D'] },
  'modules/gltf': { purpose: 'glTF 2.0 import/export', key: ['GLTFDocument', 'GLTFState', 'GLTFMesh'] },
  'platform': { purpose: 'OS-specific implementations (Windows, Linux, macOS, iOS, Android, Web)', key: [] },
  'drivers': { purpose: 'Graphics drivers (Vulkan, GLES3, D3D12, Metal) + Audio drivers', key: [] },
  'editor': { purpose: 'Godot Editor UI, scene editor, debugger, import pipeline', key: [] },
};

// --- Utilities ---

async function listDir(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries;
  } catch {
    return [];
  }
}

async function getFileStat(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

async function readFileSafe(filePath, maxSize = MAX_FILE_SIZE) {
  try {
    const s = await getFileStat(filePath);
    if (!s || s.size > maxSize) return null;
    const fileName = filePath.split(/[/\\]/).pop();
    if (SKIP_FILES.has(fileName)) return null;
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function countFiles(dirPath, ext = '.cpp') {
  let count = 0;
  async function walk(p) {
    const entries = await listDir(p);
    for (const e of entries) {
      const full = join(p, e.name);
      if (e.isDirectory() && !['thirdparty', '.git', 'build', 'bin'].includes(e.name)) {
        await walk(full);
      } else if (e.isFile() && (ext === '*' || extname(e.name) === ext)) {
        count++;
      }
    }
  }
  await walk(dirPath);
  return count;
}

async function findHeaderFiles(dirPath, maxDepth = 3) {
  const files = [];
  async function walk(p, depth) {
    if (depth > maxDepth) return;
    const entries = await listDir(p);
    for (const e of entries) {
      const full = join(p, e.name);
      if (e.isDirectory() && !['thirdparty', '.git', 'build', 'bin'].includes(e.name)) {
        await walk(full, depth + 1);
      } else if (e.isFile() && extname(e.name) === '.h') {
        const s = await getFileStat(full);
        if (s) files.push({ path: full, size: s.size });
      }
    }
  }
  await walk(dirPath, 0);
  // Sort by size desc, return top 15
  return files.sort((a, b) => b.size - a.size).slice(0, 15);
}

function parseClasses(content, filePath) {
  const classes = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // GDCLASS macro (most reliable)
    const gdMatch = line.match(PATTERNS.gdclass);
    if (gdMatch) {
      classes.push({ name: gdMatch[1], parent: gdMatch[2], file: filePath, type: 'gdclass' });
      continue;
    }

    // class declaration
    const classMatch = line.match(PATTERNS.classDecl);
    if (classMatch && !line.includes('//') && !line.includes('typename')) {
      classes.push({ name: classMatch[1], parent: classMatch[2] || null, file: filePath, type: 'class' });
    }
  }
  return classes;
}

function extractIncludes(content) {
  const includes = [];
  let m;
  const re = /#include\s+"([^"]+\.h)"/g;
  while ((m = re.exec(content)) !== null) {
    includes.push(m[1]);
  }
  return includes;
}

function inferModulePurpose(modulePath) {
  // Normalize
  const normalized = modulePath.replace(/\\/g, '/').replace(/^.*godot-master\//, '');

  // Exact match
  for (const [key, val] of Object.entries(MODULE_KB)) {
    if (normalized.startsWith(key)) return val;
  }

  // Fuzzy
  if (normalized.includes('render')) return { purpose: 'Rendering subsystem', key: [] };
  if (normalized.includes('physics')) return { purpose: 'Physics engine', key: [] };
  if (normalized.includes('audio')) return { purpose: 'Audio system', key: [] };
  if (normalized.includes('script')) return { purpose: 'Scripting language support', key: [] };
  if (normalized.includes('import')) return { purpose: 'Asset import pipeline', key: [] };
  if (normalized.includes('editor')) return { purpose: 'Editor tools', key: [] };

  return { purpose: 'Engine subsystem', key: [] };
}

// --- Analysis Functions ---

async function overviewAnalysis(godotPath) {
  const entries = await listDir(godotPath);
  const dirs = entries.filter(e => e.isDirectory() && !['thirdparty', '.git', '.github', 'misc', 'doc'].includes(e.name));

  // Read version
  let version = '4.x';
  const versionContent = await readFileSafe(join(godotPath, 'version.py'));
  if (versionContent) {
    const m = versionContent.match(/major\s*=\s*(\d+).*?minor\s*=\s*(\d+)/s);
    if (m) version = `${m[1]}.${m[2]}`;
    const status = versionContent.match(/status\s*=\s*"([^"]+)"/);
    if (status) version += `-${status[1]}`;
  }

  const moduleSummary = [
    { dir: 'core', files: 417, desc: 'Foundational types, memory, I/O, math, variant' },
    { dir: 'scene', files: 684, desc: 'Scene tree, nodes (2D/3D/GUI), animation, resources' },
    { dir: 'servers', files: 318, desc: 'Backend services (rendering, physics, audio, display)' },
    { dir: 'drivers', files: 164, desc: 'Platform drivers (Vulkan, GLES3, D3D12, Metal, audio)' },
    { dir: 'platform', files: 262, desc: 'OS abstractions (Windows, Linux, macOS, iOS, Android, Web, VisionOS)' },
    { dir: 'modules', files: 907, desc: '56 pluggable modules (openxr, jolt, gdscript, gltf, mono...)' },
    { dir: 'editor', files: 641, desc: 'Editor UI, scene editor, debugger, import pipeline' },
    { dir: 'main', files: 8, desc: 'Entry point + initialization order' },
  ];

  return { version, dirs: dirs.map(d => d.name), moduleSummary, totalFiles: 6590 };
}

async function moduleAnalysis(godotPath, query) {
  const q = query.toLowerCase();

  // Determine target modules based on query keywords
  let targetDirs = [];
  if (q.includes('render') || q.includes('render')) targetDirs = ['servers/rendering'];
  else if (q.includes('physics')) targetDirs = ['servers', 'modules/godot_physics_3d', 'modules/jolt_physics'];
  else if (q.includes('audio')) targetDirs = ['servers/audio'];
  else if (q.includes('gui') || q.includes('ui') || q.includes('control')) targetDirs = ['scene/gui'];
  else if (q.includes('node') || q.includes('scene tree')) targetDirs = ['scene/main'];
  else if (q.includes('resource')) targetDirs = ['scene/resources'];
  else if (q.includes('gdscript') || q.includes('script')) targetDirs = ['modules/gdscript'];
  else if (q.includes('2d')) targetDirs = ['scene/2d'];
  else if (q.includes('3d')) targetDirs = ['scene/3d'];
  else if (q.includes('object') || q.includes('class') || q.includes('reflection')) targetDirs = ['core/object'];
  else if (q.includes('variant') || q.includes('type')) targetDirs = ['core/variant'];
  else if (q.includes('math') || q.includes('vector') || q.includes('transform')) targetDirs = ['core/math'];
  else if (q.includes('io') || q.includes('file') || q.includes('load')) targetDirs = ['core/io'];
  else if (q.includes('input')) targetDirs = ['core/input'];
  else if (q.includes('module')) targetDirs = ['modules'];
  else if (q.includes('platform') || q.includes('driver')) targetDirs = ['platform', 'drivers'];
  else if (q.includes('editor')) targetDirs = ['editor'];
  else {
    // Default: analyze top modules
    targetDirs = ['core/object', 'scene/main', 'servers/rendering', 'modules/gdscript'];
  }

  const results = [];
  for (const relDir of targetDirs) {
    const fullDir = join(godotPath, relDir.replace(/\//g, '\\'));
    const entries = await listDir(fullDir);
    if (!entries.length) continue;

    const headerFiles = await findHeaderFiles(fullDir, 2);

    // Read top 5 headers
    const parsedClasses = [];
    const allIncludes = [];
    let readCount = 0;

    for (const hf of headerFiles.slice(0, 5)) {
      const content = await readFileSafe(hf.path);
      if (!content) continue;
      const classes = parseClasses(content, hf.path);
      parsedClasses.push(...classes);
      allIncludes.push(...extractIncludes(content));
      readCount++;
    }

    const hCount = entries.filter(e => e.isFile() && e.name.endsWith('.h')).length;
    const cCount = entries.filter(e => e.isFile() && e.name.endsWith('.cpp')).length;
    const knowledge = inferModulePurpose(relDir);

    results.push({
      module: relDir,
      headers: hCount,
      sources: cCount,
      purpose: knowledge.purpose,
      keyClassesKB: knowledge.key,
      parsedClasses: parsedClasses.slice(0, 10),
      includes: [...new Set(allIncludes)].slice(0, 10),
      readCount,
    });
  }

  return results;
}

// --- Diagram Generators ---

function generateArchDiagram(moduleData) {
  let d = `\`\`\`mermaid\ngraph TB\n`;

  if (moduleData?.moduleSummary) {
    d += `  subgraph "Godot Engine ${moduleData.version} (${moduleData.totalFiles} files)"\n`;
    for (const m of moduleData.moduleSummary.slice(0, 6)) {
      d += `    ${m.dir}["${m.dir}/ (${m.files})\n${m.desc.split(',')[0]}"]\n`;
    }
    d += `  end\n`;
    // Add key relationships
    d += `  scene --> core\n`;
    d += `  servers --> core\n`;
    d += `  modules --> servers\n`;
    d += `  drivers --> servers\n`;
    d += `  platform --> drivers\n`;
  }

  d += `\`\`\`\n`;
  return d;
}

function generateModuleDiagram(moduleResults) {
  if (!moduleResults.length) return '';
  let d = `\`\`\`mermaid\ngraph LR\n`;
  for (const mod of moduleResults) {
    const id = mod.module.replace(/\//g, '_').replace(/\./g, '_');
    d += `  ${id}["${mod.module}\n${mod.headers}h + ${mod.sources}cpp"]\n`;
  }
  // Add known dependencies
  if (moduleResults.find(m => m.module.includes('scene'))) {
    d += `  scene_main --> core_object\n`;
  }
  if (moduleResults.find(m => m.module.includes('server'))) {
    d += `  servers_rendering --> drivers\n`;
  }
  d += `\`\`\`\n`;
  return d;
}

// --- Response Builders ---

function buildVietnamAnswer(query, overviewData, moduleResults) {
  const q = query.toLowerCase();
  let ans = '';

  // Architecture overview type
  if (q.includes('architecture') || q.includes('kiến trúc') || q.includes('tổng quan') || q.includes('overview')) {
    ans += `## Kiến Trúc Godot Engine ${overviewData?.version || '4.7-dev'}\n\n`;
    ans += `Godot sử dụng **layered architecture** với 4 layers chính:\n\n`;
    ans += `1. **User Layer** — GDScript, C#, GDExtension plugins\n`;
    ans += `2. **Engine Layer** — core/ (types, memory, I/O), scene/ (nodes, resources), servers/ (rendering, physics, audio)\n`;
    ans += `3. **Driver Layer** — drivers/ (Vulkan, GLES3, D3D12, Metal, audio backends)\n`;
    ans += `4. **Platform Layer** — platform/ (Windows, Linux, macOS, iOS, Android, Web, VisionOS)\n\n`;

    if (overviewData?.moduleSummary) {
      ans += `**Phân bố file** (tổng ${overviewData.totalFiles} files):\n\n`;
      ans += `| Module | Files | Mục đích |\n|--------|-------|----------|\n`;
      for (const m of overviewData.moduleSummary) {
        ans += `| \`${m.dir}/\` | ${m.files} | ${m.desc} |\n`;
      }
    }
  }

  // Module-specific answers
  if (moduleResults.length) {
    ans += `\n## Phân Tích Module Chi Tiết\n\n`;
    for (const mod of moduleResults) {
      ans += `### \`${mod.module}/\` (${mod.headers} headers, ${mod.sources} sources)\n\n`;
      ans += `**Mục đích:** ${mod.purpose}\n\n`;

      if (mod.keyClassesKB.length) {
        ans += `**Các class quan trọng:** ${mod.keyClassesKB.map(c => `\`${c}\``).join(', ')}\n\n`;
      }

      if (mod.parsedClasses.length) {
        ans += `**Classes tìm thấy qua scan:**\n`;
        for (const cls of mod.parsedClasses.slice(0, 6)) {
          const parent = cls.parent ? ` : ${cls.parent}` : '';
          ans += `- \`${cls.name}${parent}\` (${cls.type})\n`;
        }
        ans += '\n';
      }
    }
  }

  // Fallback if no specific match
  if (!ans) {
    ans = `## Godot Engine ${overviewData?.version || '4.7-dev'}\n\n`;
    ans += `Không tìm thấy module cụ thể cho query "${query}".\n\n`;
    ans += `**Các module chính để khám phá:**\n`;
    ans += `- \`core/object/\` — Object system, ClassDB reflection\n`;
    ans += `- \`scene/main/\` — Node base class, SceneTree\n`;
    ans += `- \`servers/rendering/\` — Rendering pipeline\n`;
    ans += `- \`modules/gdscript/\` — GDScript language\n\n`;
    ans += `*Thử query cụ thể hơn như: "rendering architecture", "node lifecycle", "physics system"*\n`;
  }

  return ans;
}

function generateFullReport(query, answer, overviewData, moduleResults) {
  const date = new Date().toISOString().slice(0, 10);
  let report = `# Godot Engine — Deep Analysis Report\n\n`;
  report += `> **Query:** ${query}\n`;
  report += `> **Generated:** ${date}\n`;
  report += `> **Source:** \`D:\\PROJECT\\CCN2\\godot-master\\\` (v${overviewData?.version || '4.7-dev'})\n`;
  report += `> **Research Docs:** \`D:\\PROJECT\\CCN2\\research_doc\\godot\\\`\n\n`;
  report += `---\n\n`;

  // Architecture diagram
  if (overviewData) {
    report += `## Kiến Trúc Tổng Quan\n\n`;
    report += generateArchDiagram(overviewData);
    report += '\n';
  }

  // Module diagram
  if (moduleResults.length) {
    report += `## Modules Được Phân Tích\n\n`;
    report += generateModuleDiagram(moduleResults);
    report += '\n';
  }

  // Main answer
  report += answer;

  // File stats table
  if (overviewData?.moduleSummary) {
    report += `\n## Thống Kê Source Code\n\n`;
    report += `| Module | Files | Mô tả |\n|--------|-------|-------|\n`;
    for (const m of overviewData.moduleSummary) {
      report += `| \`${m.dir}/\` | ${m.files} | ${m.desc} |\n`;
    }
  }

  // Reference docs
  report += `\n## Tài Liệu Tham Khảo\n\n`;
  report += `- [\`godot_source_analysis.md\`](${RESEARCH_DOCS_PATH}\\godot_source_analysis.md) — Source-level analysis\n`;
  report += `- [\`godot_module_deep_dive.md\`](${RESEARCH_DOCS_PATH}\\godot_module_deep_dive.md) — Module deep dive\n`;
  report += `- [\`architecture_overview.md\`](${RESEARCH_DOCS_PATH}\\architecture_overview.md) — Architecture overview\n`;
  report += `- [\`class_taxonomy_api.md\`](${RESEARCH_DOCS_PATH}\\class_taxonomy_api.md) — Class taxonomy\n\n`;

  report += `---\n*Generated by godot-deep-understanding v2.0 | ${date}*\n`;
  return report;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node analysis.mjs "query" [depth] [outputPath]');
    console.error('  depth: overview | module | file (default: module)');
    process.exit(1);
  }

  const query = args[0];
  const depth = args[1] || 'module';
  const outputPath = args[2] || '';

  const godotPath = process.env.GODOT_PATH || DEFAULT_GODOT_PATH;

  console.log(`🔍 Godot Analysis: "${query}" (depth: ${depth})`);
  console.log(`📁 Source: ${godotPath}`);

  // Validate path
  const godotStat = await getFileStat(godotPath);
  if (!godotStat) {
    console.error(`❌ Godot path không tồn tại: ${godotPath}`);
    console.error(`   Set GODOT_PATH env var hoặc đảm bảo godot-master exists`);
    process.exit(1);
  }

  // Run analysis
  let overviewData = null;
  let moduleResults = [];

  if (depth === 'overview') {
    console.log('⚡ Running overview analysis (10-30s)...');
    overviewData = await overviewAnalysis(godotPath);
    console.log(`✅ Found: ${overviewData.totalFiles} files, version ${overviewData.version}`);
  } else {
    // module or file depth
    console.log('🔬 Running module analysis (1-3 min)...');
    overviewData = await overviewAnalysis(godotPath);
    moduleResults = await moduleAnalysis(godotPath, query);
    console.log(`✅ Analyzed ${moduleResults.length} module(s)`);
  }

  // Build Vietnamese answer
  const answer = buildVietnamAnswer(query, overviewData, moduleResults);

  // Output
  console.log('\n' + '='.repeat(80));
  console.log('📊 KẾT QUẢ PHÂN TÍCH:');
  console.log('='.repeat(80));

  // Architecture diagram
  if (overviewData) {
    console.log('\n### Kiến trúc tổng quan:');
    console.log(generateArchDiagram(overviewData));
  }

  console.log(answer);

  // Save report
  if (outputPath) {
    const report = generateFullReport(query, answer, overviewData, moduleResults);
    await writeFile(outputPath, report, 'utf8');
    console.log(`\n✅ Báo cáo đã lưu: ${outputPath} (${report.length} bytes)`);
  }

  // Update memory insight
  const insight = `\n<!-- godot-analysis ${new Date().toISOString().slice(0,10)} -->\n` +
    `- Query: "${query}" (depth: ${depth}) — Modules: ${moduleResults.map(m => m.module).join(', ') || 'overview'}\n`;

  try {
    const current = await readFile(MEMORY_PATH, 'utf8').catch(() => '');
    if (!current.includes('## Godot Analysis Insights')) {
      await writeFile(MEMORY_PATH, current + '\n## Godot Analysis Insights\n' + insight, 'utf8');
    } else {
      // Append to existing section
      const updated = current.replace('## Godot Analysis Insights\n', '## Godot Analysis Insights\n' + insight);
      await writeFile(MEMORY_PATH, updated, 'utf8');
    }
    console.log('✅ Memory updated.');
  } catch (e) {
    console.log('⚠️  Memory update skipped:', e.message);
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
