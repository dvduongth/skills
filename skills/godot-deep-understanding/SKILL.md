---
name: godot-deep-understanding
description: Phân tích sâu codebase Godot Engine C++ để trả lời câu hỏi architecture, generate markdown reports với Mermaid diagrams, lưu insights vào memory. Source: D:\PROJECT\CCN2\godot-master\ (v4.7-dev, 6590 C++ files). Dùng khi cần research Godot internals, understand module purposes, hoặc generate tech docs về Godot.
compatible-tools:
  - read
  - exec
  - memory_search
  - memory_get
  - write (with approval)
---

# Godot Deep Understanding Skill v2.0

**Purpose:** Phân tích sâu codebase Godot Engine (C++) tại `D:\PROJECT\CCN2\godot-master\` — trả lời câu hỏi architecture, generate markdown reports với Mermaid diagrams, lưu insights vào memory.

**Triggers:**
- "phân tích godot", "godot architecture", "godot deep dive"
- "generate docs godot", "godot best practices", "research godot"
- "analyze godot", "understand godot", "godot internals"
- "godot module", "godot source", "godot C++"

---

## Input Schema

```typescript
interface GodotDeepUnderstandingInput {
  query: string;                           // required — câu hỏi tiếng Việt
  contextPath?: string;                    // default: D:\PROJECT\CCN2\godot-master\
  outputPath?: string;                     // optional — save markdown report
  depth?: "overview" | "module" | "file"; // default: "module"
  generateDiagrams?: boolean;             // default: true
  maxFilesPerModule?: number;             // default: 10 (module depth only)
}
```

---

## Cách Thực Thi (Step-by-Step)

### Bước 1: Resolve source path

```javascript
const GODOT_PATH = input.contextPath
  || process.env.GODOT_PATH
  || "D:\\PROJECT\\CCN2\\godot-master";
```

### Bước 2: Search memory trước

Dùng `memory_search("godot module analysis")` — nếu đã có insights về module được hỏi, reuse để tiết kiệm token.

### Bước 3: Phân tích theo depth

**`overview` (10-30s):**
```javascript
// Chỉ scan top-level directories
const topDirs = await listDir(GODOT_PATH);
// Đọc version.py để lấy version
// Output: directory tree + file count per module
```

**`module` (1-3 phút, DEFAULT):**
```javascript
// Scan target module directories
const targetDirs = ['core', 'scene', 'servers', 'modules', 'drivers', 'platform', 'editor'];
// Với mỗi dir: đếm files + đọc top N files (.h prioritized)
// Parse: GDCLASS macros, class declarations, #include local
// Group: theo sub-directory (core/object/, core/math/, ...)
```

**`file` (3-10 phút):**
```javascript
// Đọc tất cả .cpp + .h files (warning: ~6500 files, very slow)
// Recommend: narrow scope bằng contextPath cụ thể (e.g., "core/object/")
```

### Bước 4: Extract class info

```javascript
// Patterns để parse Godot C++ source
const patterns = {
  gdclass:    /GDCLASS\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/g,
  classDecl:  /^class\s+(\w+)\s*(?::\s*(?:public|private|protected)\s+(\w+))?/m,
  structDecl: /^(?:struct|enum\s+class)\s+(\w+)/m,
  include:    /#include\s+"([^"]+\.h)"/g,
  namespace:  /^namespace\s+(\w+)\s*\{/m,
  bindMethod: /ClassDB::bind_method.*D_METHOD\s*\(\s*"([^"]+)"/g,
  addSignal:  /ADD_SIGNAL\s*\(.*?MethodInfo\s*\(\s*"([^"]+)"/g,
};
```

### Bước 5: Generate Mermaid diagrams

Tạo từ data thực (không hardcode):

```javascript
// Architecture diagram — từ module structure
`graph TB
  subgraph "core/ (${coreFiles} files)"
    Object["Object system\\nobject.h"]
    Variant["Variant type\\nvariant.h"]
    ...
  end`

// Dependency diagram — từ #include analysis
`graph LR
  ${module1} --> ${module2}
  ...`
```

### Bước 6: Build Vietnamese response

- Trả lời câu hỏi trực tiếp bằng tiếng Việt
- Cite specific file paths: `core/object/object.h:47`
- Mention class names từ thực tế scan
- Offer to save full report nếu outputPath trống

### Bước 7: Save report (nếu outputPath set)

```javascript
// Request approval trước khi write
await requestApproval(`Ghi báo cáo vào ${outputPath}?`);
await writeFile(outputPath, generateMarkdownReport(...));
```

### Bước 8: Update memory

```javascript
// Structured insights sau phân tích
const insight = {
  date: new Date().toISOString().slice(0,10),
  module: moduleName,
  purpose: inferredPurpose,
  keyClasses: [...],
  fileCount: N,
};
// Append vào memory (sau approval)
```

---

## Module Knowledge Base (từ research_doc/godot/)

> 📚 Tham khảo chi tiết: `D:\PROJECT\CCN2\research_doc\godot\`
> - `godot_source_analysis.md` — Source-level analysis, patterns, regex
> - `godot_module_deep_dive.md` — Per-module breakdown, key files

### Quick Module Reference

| Module | Path | Files | Key Classes |
|--------|------|-------|-------------|
| Object system | `core/object/` | 32 | Object, RefCounted, ClassDB, Callable |
| Variant | `core/variant/` | 37 | Variant (44 types), TypedArray |
| Math | `core/math/` | 75 | Vector2/3/4, Transform2D/3D, Quaternion |
| I/O | `core/io/` | 103 | FileAccess, ResourceLoader, Image, JSON |
| Scene tree | `scene/main/` | 34 | Node, SceneTree, Viewport, Window |
| Resources | `scene/resources/` | 214 | Texture2D, Mesh, Material, Animation |
| 2D Nodes | `scene/2d/` | 100 | Sprite2D, CharacterBody2D, TileMap |
| 3D Nodes | `scene/3d/` | 172 | MeshInstance3D, RigidBody3D, Camera3D |
| GUI | `scene/gui/` | 118 | Control, Button, Container, Label |
| Rendering | `servers/rendering/` | ~150 | RenderingDevice, RendererRD |
| Physics API | `servers/physics_*` | ~20 | PhysicsServer2D/3D |
| GDScript | `modules/gdscript/` | 62 | GDScript, GDScriptParser, GDScriptVM |
| OpenXR | `modules/openxr/` | 147 | OpenXRInterface |
| Jolt Physics | `modules/jolt_physics/` | 90 | JoltPhysicsServer3D |
| glTF | `modules/gltf/` | 64 | GLTFDocument, GLTFState |

### Files nên SKIP (quá lớn, ít insight)

```javascript
const SKIP_FILES = [
  'servers/rendering/rendering_device.cpp',        // 420KB
  'servers/rendering/rendering_device_graph.cpp',  // 158KB
  'servers/rendering/renderer_scene_cull.cpp',     // 176KB
  'CHANGELOG.md',                                  // 238KB
  'COPYRIGHT.txt',                                 // 100KB
  'thirdparty/',                                   // External deps
];
```

---

## Examples

### Example 1: Quick Architecture Question

**User:** "Godot engine architecture hoạt động thế nào?"

**Execution:**
```
depth: "overview"
→ Scan top-level dirs (không đọc files)
→ Đọc version.py
→ Generate layered architecture diagram
→ Trả lời bằng tiếng Việt với diagram
```

**Expected response:** Mô tả 4-layer architecture (Core → Scene/Servers → Drivers → Platform) với Mermaid diagram, cite file counts thực tế.

---

### Example 2: Module Analysis

**User:** "Phân tích rendering system trong Godot"

**Execution:**
```
depth: "module"
contextPath → servers/rendering/ (inferred from query)
→ List files trong servers/rendering/
→ Đọc rendering_server.h (skip rendering_device.cpp — too large)
→ Extract class names + key methods
→ Generate dependency diagram
```

---

### Example 3: Full Report

**User:** "Phân tích toàn bộ Godot, lưu báo cáo vào D:\research\godot-report.md"

**Execution:**
```
depth: "module" (default)
outputPath: "D:\research\godot-report.md"
→ Analyze all 7 main modules
→ Request approval
→ Write 15+ section report với diagrams
→ Update memory
```

---

### Example 4: Specific Class Query

**User:** "Node class trong Godot có những lifecycle methods nào?"

**Execution:**
```
depth: "file"
target: scene/main/node.h
→ Read scene/main/node.h
→ Extract: _ready, _process, _physics_process, _input, _enter_tree, _exit_tree
→ Trả lời với code examples từ thực tế
```

---

## Quality Standards

- ✅ **Read-only**: Không bao giờ modify Godot source
- ✅ **Approval workflow**: File writes cần explicit approval
- ✅ **Accurate diagrams**: Generate từ thực tế scan, không hardcode
- ✅ **Vietnamese output**: 100% tiếng Việt (Rule 0 từ CCN2 CLAUDE.md)
- ✅ **File citations**: Luôn cite `module/file.h:line` khi refer tới code
- ✅ **Skip large files**: Auto-skip files > 200KB trong overview/module depth
- ✅ **Memory reuse**: Search memory trước khi re-scan
- ✅ **Progress feedback**: Emit progress updates khi chạy lâu (module/file depth)

---

## Configuration

```bash
# Set Godot source path (nếu không dùng default)
export GODOT_PATH="D:\PROJECT\CCN2\godot-master"
```

**Default search order:**
1. `input.contextPath`
2. `process.env.GODOT_PATH`
3. `D:\PROJECT\CCN2\godot-master` (CCN2 workspace — hardcoded)
4. `D:\godot-master`
5. `~/godot`

---

## Implementation

**File:** `analysis.mjs` — executable Node.js script

```bash
# Run directly
node .claude/skills/godot-deep-understanding/analysis.mjs "query" [depth] [output]

# Examples
node analysis.mjs "godot rendering architecture" overview
node analysis.mjs "node lifecycle" module
node analysis.mjs "full analysis" module D:\research\report.md
```

**Reference:** `D:\PROJECT\CCN2\research_doc\godot\` — 4 research docs với source-level analysis

---

## Known Limitations

1. **Regex C++ parsing**: Không accurate với templates, macros, conditional compilation
2. **Large codebase**: 6590 files — `file` depth rất chậm (5-10 phút)
3. **Macro-heavy code**: `GDCLASS`, `GDVIRTUAL_*` — không parse được đầy đủ bằng regex
4. **No type resolution**: Không resolve typedefs, using declarations
5. **Windows paths**: Cần `path.normalize()` khi mix forward/back slashes

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Godot path not found" | Set `GODOT_PATH` environment variable |
| "Out of memory on file depth" | Dùng `module` depth, hoặc set `contextPath` hẹp hơn (e.g., `core/object/`) |
| "Parsing errors" | Files bị skip tự động, check logs |
| "Diagrams not generating" | Verify `contextPath` trỏ đúng vào `.cpp/.h` directory |

---

*Skill v2.0 — Updated 2026-03-30*
*Based on: openclaw-deep-understanding v3.0 pattern*
*Research source: `D:\PROJECT\CCN2\research_doc\godot\` (4 files)*
*Godot source: `D:\PROJECT\CCN2\godot-master\` (4.7-dev, 6590 files)*
