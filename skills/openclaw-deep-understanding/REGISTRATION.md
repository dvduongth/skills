# OpenClaw Deep Understanding Skill — Registration (Merged)

**Skill ID**: `openclaw-deep-understanding`
**Version**: 3.0 (Merged)
**Author**: Cốm Đào
**Created**: 2026-03-16
**Merged**: 2026-03-18

## Activation

Khi người dùng hỏi về OpenClaw architecture, best practices, hoặc muốn generate documentation, skill này sẽ:

1. **Progress tracking** — Emit real-time progress updates
2. **Tra cứu memory** trước (memory_search)
3. **Đọc codebase** OpenClaw tại `D:\PROJECT\CCN2\openclaw`
4. **Phân tích theo depth** yêu cầu (overview/module/file)
5. **Trả lời câu hỏi** bằng tiếng Việt với diagrams (Mermaid)
6. **Tạo báo cáo markdown** nếu được chỉ định outputPath
7. **Request approval** cho memory update
8. **Update memory** với insights mới (nếu approved)

## Tools Used

- `read` — đọc source files
- `exec` — PowerShell commands, file enumeration
- `memory_search` + `memory_get` — tra cứu existing insights
- `write` — ghi report (cần approval)
- `memory_update` — append insights to MEMORY.md
- `emitProgress` — progress tracking (từ CCN2)
- `requestApproval` — approval workflow (từ CCN2)

## Configuration

Skill đọc config từ:
- `contextPath`: default `D:\PROJECT\CCN2\openclaw`
- Có thể override qua input param

## Merged Features

### Base (OpenClaw Version):
- ✅ Simple & clean (444 lines)
- ✅ Global tools injection
- ✅ Comprehensive tests
- ✅ PowerShell integration
- ✅ Memory caching
- ✅ Export/import parsing

### Added (CCN2 Version):
- ⭐ Progress tracking (emitProgress)
- ⭐ Approval workflow (requestApproval)
- ⭐ TypeScript interfaces
- ⭐ Structured memory update
- ⭐ Enhanced error handling
- ⭐ Better insights extraction

## Examples

```json
{
  "query": "OpenClaw gateway routing logic hoạt động thế nào?",
  "depth": "module",
  "outputPath": null
}
```

```json
{
  "query": "Phân tích toàn bộ OpenClaw architecture",
  "depth": "module",
  "outputPath": "openclaw-analysis.md",
  "generateDiagrams": true
}
```

```json
{
  "query": "Các best practices trong OpenClaw?",
  "depth": "overview"
}
```

## Quality Metrics

- **Code size**: ~650 lines (optimized from 1069)
- **Test coverage**: Yes (ported from OpenClaw)
- **Type safety**: Yes (TypeScript interfaces)
- **Progress tracking**: Yes (emitProgress)
- **Approval workflow**: Yes (requestApproval)
- **Memory management**: Yes (structured insights)
- **Documentation**: Yes (comprehensive)

---

*Registration file for skill management - Merged Version*