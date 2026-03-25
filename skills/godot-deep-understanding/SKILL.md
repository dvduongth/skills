---
name: godot-deep-understanding
description: Phân tích sâu codebase Godot Engine để trả lời câu hỏi architecture, generate documentation, và hiểu kiến trúc engine. Hỗ trợ multiple depths (overview/module/file) với Mermaid diagrams. Dùng khi cần research Godot internals, understand module purposes, hoặc generate tech docs về Godot.
compatible-tools:
  - read
  - exec
  - memory_search
  - memory_get
  - write (with approval)
---

# Godot Deep Understanding Skill

**Purpose:** Phân tích sâu codebase Godot Engine (C++) để trả lời câu hỏi architecture, generate markdown reports với Mermaid diagrams, và lưu insights vào memory.

**Triggers:**
- "phân tích godot"
- "godot architecture"
- "godot deep dive"
- "generate docs godot"
- "godot best practices"
- "research godot"
- "analyze godot"
- "understand godot"
- "godot internals"

**Implementation:** `src/skill.ts` (TypeScript, cross-platform)

---

## Input Schema

```typescript
interface GodotDeepUnderstandingInput {
  /** Câu hỏi bằng tiếng Việt (required) */
  query: string;
  /** Đường dẫn đến codebase Godot (optional, default từ env hoặc config) */
  contextPath?: string;
  /** Nơi lưu báo cáo markdown (optional, nếu rỗng chỉ trả lời chat) */
  outputPath?: string;
  /** Mức độ phân tích: "overview" | "module" | "file" (default: "module") */
  depth?: "overview" | "module" | "file";
  /** Tạo Mermaid diagrams không? (default: true) */
  generateDiagrams?: boolean;
  /** Giới hạn files per module (module depth only, default: 10) */
  maxFilesPerModule?: number;
}
```

---

## Output

- **Chat response**: Câu trả lời tiếng Việt dựa trên phân tích codebase + memory insights
- **Report file** (nếu `outputPath`): Markdown đầy đủ với:
  - Architecture overview + diagrams
  - Module breakdown (purpose, key files, exports)
  - Dependency graphs
  - Code snippets & references
  - Best practices & anti-patterns
  - Recommendations
- **Memory update** (cần approval): Ghi nhận insights về các module đã phân tích

---

## Features

### ✅ Core Capabilities
- **Cross-platform**: Node.js fs/promises (không PowerShell)
- **Three depth modes**: overview (fast), module (balanced), file (deep)
- **Mermaid diagrams**: Architecture + dependency graphs
- **Memory integration**: Reuse previous insights, tránh re-scan
- **Approval workflow**: Writes require user approval
- **Progress tracking**: Real-time updates với `emitProgress`
- **Error handling**: Graceful degradation, skip unparsable files
- **Vietnamese output**: Tất cả responses tiếng Việt

### 📊 Depth Modes

#### `overview` (10-30s)
- Top-level directory structure
- Total files, LOC count
- Language distribution (.cpp, .h, etc.)
- High-level architecture diagram
- No file content reading

#### `module` (1-3 phút) **← DEFAULT**
- Group files by inferred module (core, scene, servers, rendering, physics, audio, etc.)
- Top N files per module (default 10) được đọc chi tiết
- Exports/imports extraction
- Purpose inference cho mỗi module
- Module-level dependency graph
- Suitable cho most queries

#### `file` (3-10 phút)
- Tất cả files được đọc (có thể rất lớn với Godot!)
- File-level metadata (size, LOC, exports, imports)
- Test detection (file/test patterns)
- Comprehensive but slow
- Dùng cho full audit hoặc specific file questions

---

## How It Works

### Step-by-Step Pipeline

```mermaid
flowchart TD
  A[Start: User Query] --> B[Validate Input]
  B --> C[Resolve Godot Path<br/>env.GODOT_PATH or default]
  C --> D[Search Memory<br/>existing insights]
  D --> E{Depth Mode?}
  E -->|overview| F[Scan Directories Only]
  E -->|module| G[Scan + Read Top Files]
  E -->|file| H[Read All Files<br/>(streamed)]

  F --> I[Analyze Structure]
  G --> I
  H --> I

  I --> J[Extract Exports/Imports<br/>(regex C++ parsing)]
  J --> K[Infer Module Purposes]
  K --> L[Generate Diagrams<br/>(Mermaid)]

  L --> M[Build Chat Response<br/>(Vietnamese + memory)]
  M --> N{outputPath?}
  N -->|yes| O[Generate Full Report<br/>Request Approval]
  N -->|no| P[Return Response]

  O --> Q[Prepare Memory Update<br/>(structured insights)]
  Q --> P
```

### Analysis Process

1. **Input Validation**
   - `query` required
   - `depth` must be valid enum
   - `contextPath` exists (or find from env)

2. **Memory Search**
   - Search existing insights about Godot modules
   - Reuse previous analysis nếu có
   - Append new findings

3. **File Scanning**
   - Recursive through `core/`, `scene/`, `servers/`, etc.
   - Filter extensions: `.cpp`, `.h`, `.hpp`, `.c`
   - Exclude: `build/`, `bin/`, `.git/`, `platform/*/build/`
   - Build file list (with sizes, paths)

4. **Content Analysis** (chỉ với `module` và `file` depths)
   - Read files (stream-based, batch 20 concurrent)
   - Extract exports: `class`, `struct`, `enum class`, namespaces
   - Extract imports: `#include "local.h"` (ignore system `<>`)
   - Normalize includes to project-relative paths
   - Calculate LOC per file
   - Infer module from file path (e.g., `core/object/object.h` → module "core/object")

5. **Module Aggregation** (module depth)
   - Group files by module
   - Aggregate exports, imports, LOC
   - Select top N files (by size/LOC) for detailed view
   - Infer module purpose from class names + includes

6. **Diagram Generation**
   - Architecture diagram: major modules + relationships
   - Dependency graph: imports between modules
   - Mermaid syntax, Vietnamese labels

7. **Response Building**
   - Answer query based on analysis + memory
   - Key findings bullet points
   - Mention specific files/classes với paths
   - Offer to save full report

8. **Report Generation** (if `outputPath`)
   - Markdown với đầy đủ sections
   - Tables cho modules, files
   - Code snippets cho important classes
   - Diagrams nhúng
   - Request approval trước khi write

9. **Memory Update** (after approval)
   - Structured insights per module
   - Class purposes, patterns observed
   - Auto-append to MEMORY.md under "Godot Analysis Insights"

---

## Examples

### Example 1: Quick Architecture Question

**User:**
```
"Godot engine architecture hoạt động thế nào? Tóm tắt cho tôi."
```

**Skill execution:**
- `depth: "overview"`
- Scan top-level directories only
- Generate architecture diagram
- Return: "Godot sử dụng layered architecture với 4 main layers: Core (Object, Node, Resource), Scene (scene tree, nodes), Servers (singleton services), Rendering (Vulkan-based). Diagram shows..."

---

### Example 2: Module Analysis

**User:**
```
"Phân tích module rendering trong Godot, bao gồm các class chính."
```

**Skill execution:**
- `depth: "module"`
- Focus on `rendering/` directory
- Read top 10 files in rendering modules
- Extract exports: `RenderingDevice`, `Mesh`, `Texture`, `Shader`
- Generate dependency graph
- Return: "Rendering module gồm 3 sub-modules: RenderingDevice (Vulkan abstraction), Mesh/Texture management, Shader system. Các class chính..."

---

### Example 3: Full Report Generation

**User:**
```
"Phân tích toàn bộ Godot engine, lưu báo cáo vào D:\research\godot-analysis.md"
```

**Skill execution:**
- `depth: "module"` (default)
- `outputPath: "D:\research\godot-analysis.md"`
- Scan all modules, read top files each
- Generate comprehensive report với diagrams
- Request approval để write file
- After approval: write file + prepare memory update
- Return: "Báo cáo đã lưu vào D:\research\godot-analysis.md với 15 modules, 5 diagrams, và 120+ classes được documented."

---

### Example 4: Specific File Query

**User:**
```
"Class Node trong Godot có những method nào? File ở đâu?"
```

**Skill execution:**
- `depth: "file"` (cần đọc chi tiết)
- Find `Node.h` / `Node.cpp`
- Extract all method signatures
- Return: "Node class định nghĩa trong `scene/main/node.h` với 80+ methods: `_ready()`, `_process()`, `add_child()`, `get_parent()`,..."

---

## Configuration

### Default Paths

The skill tries to locate Godot source code in this order:

1. `contextPath` từ input
2. Environment variable `GODOT_PATH`
3. Common locations:
   - `~/godot` (Linux/Mac)
   - `~/projects/godot` 
   - `D:\PROJECT\CCN2\godot` (CCN2 workspace)
   - `C:\godot`

If not found, skill sẽ trả lời với hướng dẫn set `GODOT_PATH`.

### Environment Variables

```bash
# Set Godot source path
export GODOT_PATH="/path/to/godot/source"

# On Windows (PowerShell)
$env:GODOT_PATH = "D:\PROJECT\CCN2\godot"
```

### Skill Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | **required** | Câu hỏi bằng tiếng Việt |
| `contextPath` | string | auto-detect | Đường dẫn đến Godot source |
| `outputPath` | string | none | Nơi lưu báo cáo (neu NULL chỉ chat) |
| `depth` | enum | `"module"` | Độ sâu phân tích |
| `generateDiagrams` | boolean | `true` | Tạo Mermaid diagrams |
| `maxFilesPerModule` | number | `10` | Giới hạn files đọc mỗi module (module depth) |

---

## C++ Parsing Heuristics

Since Godot is C++ (not JS/TS), parsing uses regex heuristics:

### Class Detection
```regex
class\s+(\w+)\s*(?::\s*(public|protected|private)\s+(\w+))?\s*\{
```
- Captures: class name, inheritance (parent class)
- Handles: `class Node : public Object`, `class RefCounted`

### Struct/Enum Detection
```regex
(?:struct|enum\s+class)\s+(\w+)
```

### Include Detection
```regex
#include\s+[<"]([^>"]+)[>"]
```
- Project includes: `#include "core/object/object.h"`
- System includes: `<iostream>` (ignored from dependency graph)

### Namespace Detection
```regex
namespace\s+(\w+)\s*\{
```

### Purpose Inference Heuristics
- File path contains `core/` → "Core system: Object, reference counting"
- File path contains `scene/` → "Scene tree, node hierarchy"
- Class names include `Server` → "Singleton service"
- Includes `servers/` headers → "Server implementation"
- Includes `drivers/` headers → "Platform-specific driver"

---

## Quality Assurance

- ✅ **Read-only**: Không bao giờ sửa source code Godot
- ✅ **Approval workflow**: File writes cần approval
- ✅ **Accurate diagrams**: Từ thực tế imports/exports (không hardcode)
- ✅ **Proper errors**: Validation fail → clear message, graceful exit
- ✅ **Performance**: Parallel reads (20 concurrent), streaming
- ✅ **Vietnamese output**: Tất cả responses tiếng Việt
- ✅ **Progress tracking**: `emitProgress` cho user feedback
- ✅ **Test coverage**: Unit tests cho helpers (extractExports, imports, infer)
- ✅ **Memory integration**: Reuse insights, avoid re-scan

---

## Testing

### Unit Tests

```bash
node --test tests/skill.test.ts
```

**Test coverage:**
- `extractExports`: Classes, structs, enums, namespaces, inheritance
- `extractImports`: Local vs system includes, normalize paths
- `inferModulePurpose`: Đoán module từ file path + class names
- `formatBytes`: Human-readable sizes
- `generateMermaidArchitecture`: Valid Mermaid syntax
- `generateMermaidDependencies`: Dependency graph correctness
- `validateInput`: Required fields, depth enum, path exists

### Integration Tests

Create `GODOT_TEST_SOURCE` environment variable pointing to small C++ sample:

```bash
export GODOT_TEST_SOURCE="./test-fixtures/godot-mini"
node src/skill.ts --test
```

---

## Known Limitations

1. **Regex-based parsing**: Không đ100% accurate, có thể miss:
   - Complex template declarations
   - Macro-generated code
   - Conditional compilation (`#ifdef`)
   - Dynamic includes (computed paths)

2. **Large codebases**: Godot ~500k lines, >5000 files
   - `file` depth có thể chậm (5-10 phút)
   - Memory usage cao nếu đọc tất cả
   - Khuyến nghị: dùng `module` depth cho most queries

3. **No AST**: Không resolve typedefs, using declarations, macro expansions
   - Purpose inference dựa trên heuristics (path + simple patterns)
   - Có thể classify sai một số files

4. **Godot-specific**: Mặc định optimized cho Godot structure
   - Có thể dùng cho C++ project khác nhưng module inference less accurate
   - Cần customize `inferModulePurpose` cho other codebases

5. **Cross-platform path**: Windows paths (\) vs Unix (/) — dùng `path` module normalize

---

## Future Work

- [ ] AST parsing với clang/libclang (chính xác 100%)
- [ ] Cache parsed results (avoid re-reading unchanged files)
- [ ] Incremental analysis (only changed files)
- [ ] More Godot-specific module descriptions (từ docs)
- [ ] Class relationship diagram (inheritance hierarchy)
- [ ] Export to HTML với interactive diagrams
- [ ] Support cho GDScript analysis (if needed)

---

## Troubleshooting

### "Godot path not found"
**Fix:** Set `GODOT_PATH` environment variable:
```bash
export GODOT_PATH="/path/to/godot"
```

### "Parsing errors in some files"
**Cause:** Complex C++ macros/templates
**Fix:** Those files skipped automatically. Check logs for which files failed.

### "Out of memory on file depth"
**Cause:** Codebase quá lớn, đọc tất cả cùng lúc
**Fix:** Use `module` depth instead, or increase Node memory limit

### "Diagrams not generating"
**Cause:** No modules detected (empty codebase or wrong path)
**Fix:** Verify `contextPath` points to src/ directory với .cpp/.h files

---

## References

### Source Code Structure (Godot-specific)
- `core/` — Object, Node, Resource, math types
- `scene/` — Scene tree, 2D/3D nodes, UI controls
- `servers/` — Server singletons (display, physics, audio, rendering, input)
- `drivers/` — Platform-specific drivers (graphics, audio, input)
- `rendering/` — Rendering pipeline, devices, renderers
- `physics/` — Physics engines (2D custom, 3D Bullet)
- `platforms/` — OS abstractions (Windows, Linux, macOS, Android, iOS, Web)

### Design Patterns in Godot
- **Server pattern**: `Server::get_singleton()` access
- **Object lifecycle**: `Object::free()` vs `Reference::unref()`
- **Class registration**: `GDCLASS(MyClass, Parent)` + `ClassDB::register_class()`
- **Notifications**: `_notification(int what)` for lifecycle events
- **Resource serialization**: `.tres` (text) và `.res` (binary)

---

*Skill created: 2026-03-25 by Cốm Đào AI Assistant*  
*Based on: openclaw-deep-understanding v2.1, repo-local-analysis*  
*Status: Ready for implementation*