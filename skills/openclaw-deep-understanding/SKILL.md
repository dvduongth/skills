# openclaw-deep-understanding Skill

**Purpose**: Phân tích sâu codebase OpenClaw để trả lời câu hỏi architecture, generate documentation, và hỗ trợ nghiên cứu phát triển.

**Triggers**:
- "phân tích openclaw"
- "openclaw architecture"
- "openclaw deep dive"
- "generate docs openclaw"
- "openclaw best practices"
- "research openclaw"
- "analyze openclaw"

**Implementation**: `src/skill.ts` (v2.1 — no tool imports, cross-platform)

---

## Input Schema

```typescript
interface OpenClawDeepUnderstandingInput {
  /** Câu hỏi bằng tiếng Việt (required) */
  query: string;
  /** Đường dẫn codebase OpenClaw (optional, default: D:\PROJECT\CCN2\openclaw) */
  contextPath?: string;
  /** Output file markdown (optional) */
  outputPath?: string;
  /** Mức độ: "overview" | "module" | "file" (default: "module") */
  depth?: "overview" | "module" | "file";
  /** Tạo Mermaid diagrams? (default: true) */
  generateDiagrams?: boolean;
}
```

---

## Technical Notes

- **OpenClaw native skill**: Không import tools — tools là global functions inject bởi runtime
- **Read-only**: Không sửa source code
- **Approval**: MEMORY.md cần approval (`openclaw config approve`)
- **Report writes**: Ngay nếu có `outputPath`
- **No tests**: Skill không chạy tests (an toàn)
- **Error handling**: Partial results, tiếng Việt messages
- **Platform**: Windows only (requires PowerShell); Linux/Mac chưa hỗ trợ

---

## Output

- **Chat response**: Câu trả lời tiếng Việt từ phân tích codebase + memory
- **Report file** (nếu `outputPath`): Markdown với:
  - Architecture overview + diagrams
  - Modules breakdown (sort by LOC)
  - Key exports/imports
  - File details (nếu depth=file)
- **Memory insights**: Prepared for approval (không tự động ghi)

---

## Examples

```
"Phân tích OpenClaw gateway architecture, lưu gateway-analysis.md"
→ depth: module, output: gateway-analysis.md, diagrams: true

"OpenClaw security model là gì?"
→ depth: module, focus trên security modules

"OpenClaw overview"
→ depth: overview, high-level stats + diagram
```

---

## Quality Assurance

- ✅ **Accurate references**: File paths và LOC chính xác
- ✅ **Vietnamese**: Output toàn bộ tiếng Việt, chuyên nghiệp
- ✅ **No imports**: Sử dụng global tools, không import ../tools.mjs
- ✅ **Validation**: query required, depth enum
- ✅ **Partial results**: Tiếp tục ngay cả khi một phần lỗi
- ✅ **Approval respect**: Không tự động ghi MEMORY.md

---

*Created: 2026-03-16 | Refactored: 2026-03-17 (v2.2 — fixed critical bugs, tests, LOC accuracy)*
