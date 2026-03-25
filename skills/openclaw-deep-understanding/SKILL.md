# OpenClaw Deep Understanding Skill - Merged Version

**Purpose**: Phân tích sâu codebase OpenClaw để trả lời câu hỏi architecture, generate documentation, suggest best practices, và hỗ trợ nghiên cứu phát triển dự án tương tự.

**Triggers**:
- "phân tích openclaw"
- "openclaw architecture"
- "openclaw deep dive"
- "generate docs openclaw"
- "openclaw best practices"
- "research openclaw"
- "analyze openclaw"

**Implementation**: `src/skill.ts` (merged version v3.0)

---

## Input Schema

```typescript
interface OpenClawDeepUnderstandingInput {
  /** Câu hỏi bằng tiếng Việt (required) */
  query: string;
  /** Đường dẫn đến codebase OpenClaw (optional, default từ config) */
  contextPath?: string;
  /** Nơi lưu báo cáo markdown (optional, nếu rỗng chỉ trả lời chat) */
  outputPath?: string;
  /** Mức độ phân tích: "overview" | "module" | "file" (default: "module") */
  depth?: "overview" | "module" | "file";
  /** Tạo Mermaid diagrams không? (default: true) */
  generateDiagrams?: boolean;
}
```

---

## Output

- **Chat response**: Câu trả lời tiếng Việt dựa trên phân tích codebase + memory
- **Report file** (nếu `outputPath`): Markdown với:
  - Architecture overview + diagrams
  - Modules breakdown
  - Key files & their roles
  - Best practices observed
  - Anti-patterns / risks
  - Code snippets & references
- **Memory update**: Ghi nhận insights mới vào MEMORY.md (cần approval)

---

## Features (Merged)

### ✅ Từ OpenClaw Version (Base):
- Đơn giản, clean architecture
- Global tools injection (no imports needed)
- PowerShell integration (Windows-native)
- Comprehensive tests
- Memory caching
- Export/import parsing
- LOC calculation
- Report generation

### ⭐ Từ CCN2 Version (Added):
- Progress tracking (`emitProgress`)
- Approval workflow (`requestApproval`)
- TypeScript interfaces
- Structured memory update
- Enhanced error handling
- Better insights extraction

### 📊 Depth Modes

#### `overview` (10-30s)
- package.json analysis
- LOC count
- Module counts
- High-level architecture diagram

#### `module` (1-3 phút) *(default)*
- Per-module breakdown
- Exports/imports
- Purpose inference
- Dependency graphs
- Modules: gateway, agents, channels, providers, plugins, memory, browser, cron, hooks, etc.

#### `file` (3-10 phút)
- Tất cả files trong src/
- File-level metadata
- Test detection
- Export/import analysis
- Dùng cho full audit

---

## Examples

### Example 1: Quick Architecture Question
```
User: "OpenClaw gateway routing logic hoạt động thế nào?"
Skill:
1. Progress tracking: "Bắt đầu phân tích..."
2. Search memory for existing insights
3. Read src/gateway/server-lanes.ts, src/gateway/server-methods.ts, src/routing/
4. Analyze code, build answer
5. Return: "Gateway routing sử dụng lane system để isolate sessions..."
```

### Example 2: Generate Full Report
```
User: "Phân tích toàn bộ OpenClaw architecture, lưu vào openclaw-analysis.md"
Parameters:
  depth: "module"
  outputPath: "openclaw-analysis.md"
  generateDiagrams: true
→ Tạo báo cáo đầy đủ với Mermaid diagrams
→ Request approval cho memory update
→ Update memory với insights mới
```

### Example 3: Module Analysis
```
User: "Phân tích OpenClaw agents và providers"
Parameters:
  depth: "module"
  generateDiagrams: true

Result:
✅ Progress tracking cho từng bước
✅ Tìm modules liên quan
✅ Chi tiết exports, imports, purpose
✅ Dependency diagram
✅ Memory insights với approval workflow
```

---

## Configuration

### Default Path
```
D:\PROJECT\CCN2\openclaw
```

### Environment Variables
```bash
export OPENCLAW_PATH="/path/to/openclaw/repo"
```

---

## Quality Assurance

- ✅ **Read-only**: Không bao giờ sửa source code
- ✅ **Approval workflow**: Writes require approval
- ✅ **Accurate diagrams**: Từ thực tế imports/exports
- ✅ **Proper errors**: Validation, graceful degradation
- ✅ **Performance**: Parallel reads, streaming previews
- ✅ **Vietnamese output**: Tất cả responses tiếng Việt
- ✅ **Progress tracking**: Real-time progress updates
- ✅ **Test coverage**: Unit tests cho helpers

---

## Testing

```bash
node --test tests/skill.test.ts
```

Tests cover:
- Export extraction
- Import parsing
- Purpose inference
- Diagram generation
- Memory update preparation

---

## Known Limitations

1. **Windows only**: Requires PowerShell for file enumeration
2. **Large codebases**: >20k files có thể chậm
3. **Dynamic imports**: `import()` dynamic không được phát hiện
4. **JSDoc parsing**: Chỉ first-line comments, không multi-line block

---

## Future Work

- [ ] AST parsing với TypeScript compiler API
- [ ] Security pattern detection
- [ ] Performance hotspot identification
- [ ] Comparison với best practices
- [ ] Cross-platform support (Linux/Mac)

---

*Skill merged: 2026-03-18 by William Đào 👌*
*Based on: OpenClaw version (444 lines) + CCN2 features*