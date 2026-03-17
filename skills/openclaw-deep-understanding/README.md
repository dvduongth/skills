# OpenClaw Deep Understanding Skill

Skill phân tích sâu codebase OpenClaw, tài liệu hóa architecture và trả lời câu hỏi kỹ thuật.

## 🚀 Quick Start

```bash
# Phân tích overview nhanh
"phân tích openclaw architecture"

# Phân tích chi tiết theo modules
"Phân tích OpenClaw agents và channels, lưu báo cáo vào report.md"

# Câu hỏi cụ thể
"OpenClaw gateway routing logic hoạt động thế nào?"
```

## 📋 Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ | - | Câu hỏi bằng tiếng Việt về OpenClaw |
| `contextPath` | string | ❌ | `OPENCLAW_PATH` env or `D:\PROJECT\CCN2\openclaw` | Đường dẫn đến codebase |
| `outputPath` | string | ❌ | - | Lưu báo cáo Markdown (cần approval) |
| `depth` | "overview" \| "module" \| "file" | ❌ | "module" | Mức độ phân tích |
| `generateDiagrams` | boolean | ❌ | `true` | Tạo Mermaid diagrams |

## 🔍 Depth Modes

### `overview` (10-30s)
- package.json analysis
- LOC count
- Module counts
- High-level architecture diagram

### `module` (1-3 phút) *(default)*
- Per-module breakdown
- Exports/imports
- Purpose inference
- Dependency graphs
- Modules: gateway, agents, channels, providers, plugins, memory, browser, cron, hooks, etc.

### `file` (3-10 phút)
- Tất cả files trong src/
- File-level metadata
- Test detection
- Export/import analysis
- Dùng cho full audit

## 📊 Output

1. **Chat Response** (tiếng Việt):
   - Câu trả lời trực tiếp
   - Relevant modules
   - Key insights
   - Preview báo cáo (nếu có)

2. **Report File** (nếu `outputPath` được approve):
   - Markdown với:
     - Table of contents
     - Architecture diagram (Mermaid)
     - Modules breakdown table
     - Detailed analysis cho mỗi module
     - Exports và dependencies
     - File listings

3. **Memory Update** (cần approval):
   - Insights về modules
   - Export listings
   - LOC numbers
   - Tự động merge vào MEMORY.md sau approval

## ⚙️ Configuration

### Environment Variables
```bash
export OPENCLAW_PATH="/path/to/openclaw/repo"
```

### OpenClaw Config (future)
```json
{
  "skills": {
    "openclaw-deep-understanding": {
      "contextPath": "/path/to/openclaw",
      "maxFilesPerModule": 20
    }
  }
}
```

## 🎯 Examples

### Example 1: Quick Overview
```
User: "OpenClarchitecture là gì?"
Skill: overview depth
→ Answer với version, LOC, modules count, high-level diagram
```

### Example 2: Module Analysis
```
User: "Phân tích OpenClaw agents và providers"
→ Tìm modules liên quan
→ Chi tiết exports, imports, purpose
→ Dependency diagram
→ Memory insights prepared
```

### Example 3: Generate Full Report
```
User: "Tạo báo cáo đầy đủ về OpenClaw, lưu vào docs/openclaw-analysis.md"
Parameters:
  depth: "module"
  outputPath: "docs/openclaw-analysis.md"
  generateDiagrams: true

Result:
✅ Báo cáo 5000+ lines với:
  - Architecture diagrams
  - 30+ modules breakdown
  - Detailed file analysis
  - Memory insights (approval)
```

## ✅ Quality Assurance

- ⚠️ **Windows only**: Requires PowerShell for file enumeration; Linux/Mac not yet supported
- ✅ **Read-only**: Không bao giờ sửa source code
- ✅ **Approval workflow**: Writes require approval
- ✅ **Accurate diagrams**: Từ thực tế imports/exports
- ✅ **Proper errors**: Validation, graceful degradation
- ✅ **Performance**: Parallel reads, streaming previews
- ✅ **Vietnamese output**: Tất cả responses tiếng Việt

## 🧪 Testing

```bash
cd skills/openclaw-deep-understanding
node --test tests/skill.test.ts
```

Tests cover:
- Export extraction
- Import parsing
- Normalization
- Formatting
- Purpose inference

## 🐛 Known Limitations

1. **Large codebases**: >20k files có thể chậm, dùng `maxFilesPerModule` limit
2. **Dynamic imports**: `import()` dynamic không được phát hiện
3. **JSDoc parsing**: Chỉ first-line comments, không multi-line block
4. **Circular dependencies**: Được detect nhưng không highlight trong diagram (future)

## 📈 Future Work

- [ ] AST parsing với TypeScript compiler API
- [ ] Security pattern detection
- [ ] Performance hotspot identification
- [ ] Comparison với best practices
- [ ] HTML export với interactive diagrams
- [ ] CI/CD integration

## 📝 License

Same as OpenClaw (MIT) — phần skill này là analysis tool cho OpenClaw.

## 🙏 Credits

Skill developed for CCN2 project by Cốm Đào (2026-03-16/17).

---

**Trigger phrases**:
- "phân tích openclaw"
- "openclaw architecture"
- "openclaw deep dive"
- "generate docs openclaw"
- "openclaw best practices"
- "research openclaw"
- "analyze openclaw"