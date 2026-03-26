---
name: git-nexus-deep-understanding
description: Hiểu sâu bất kỳ codebase nào đã được GitNexus index — architecture, execution flows, symbol relationships, blast radius. Dùng khi hỏi về codebase architecture, symbol context, impact analysis, hoặc index status.
---

# git-nexus-deep-understanding

**Purpose**: Phân tích sâu codebase đã được GitNexus index — trả lời câu hỏi về architecture, execution flows, symbol relationships, và blast radius — không cần đọc file thủ công.

**Version**: v1.0.0 (2026-03-26)
**Spec**: `agent-teams/docs/superpowers/specs/2026-03-26-git-nexus-deep-understanding-design.md`

---

## Triggers

Invoke skill này khi user/agent hỏi về codebase đã được GitNexus index:

**Nhóm 1 — Architecture:**
`"giải thích codebase"`, `"architecture của X"`, `"how does X work"`, `"phân tích hệ thống"`, `"module nào liên quan"`, `"execution flow"`, `"gitnexus deep"`, `"git-nexus-deep-understanding"`

**Nhóm 2 — Symbol Deep Dive:**
`"function X làm gì"`, `"ai gọi X"`, `"X phụ thuộc vào gì"`, `"context của symbol X"`, `"caller của X"`, `"callees của X"`

**Nhóm 3 — Impact / Change:**
`"nếu sửa X thì hỏng gì"`, `"blast radius"`, `"what breaks if"`, `"impact analysis"`, `"detect changes"`, `"affected processes"`

**Nhóm 4 — Setup / Status:**
`"gitnexus index chưa"`, `"index có stale không"`, `"repo nào đã index"`, `"gitnexus status"`, `"index fresh không"`

---

## Input

```
query        (required) — câu hỏi của user hoặc task của agent
depth        (optional) — "overview" | "deep" | "symbol" | auto-detect từ query
target       (optional) — symbol name khi depth=symbol
repo         (optional) — tên repo cụ thể; default: auto-detect từ registry
outputPath   (optional) — lưu file; nếu rỗng → chat only
repoPath     (optional) — path tới repo; default: D:\PROJECT\CCN2
```

---

## Bước 1 — Xác Định Depth và Target

Phân tích `query` để chọn depth (nếu user không chỉ định):

```
Query chứa symbol/function/class cụ thể + "làm gì"/"caller"/"gọi ai"/"context"/"phụ thuộc"?
  → depth=symbol, target=tên symbol đó

Query hỏi "nếu sửa X"/"blast radius"/"what breaks"/"impact"/"hỏng gì"?
  → depth=symbol (impact focus), target=X

Query hỏi "architecture"/"execution flow"/"module"/"hệ thống"/"codebase"/"clusters"/"phân tích"?
  → depth=deep

Query hỏi "status"/"index"/"stale"/"repo nào"/"tổng quan nhanh"/"overview"/"fresh"?
  → depth=overview
```

**Xác định repo:**
```
Nếu repo chỉ định → dùng repo đó
Nếu không → READ gitnexus://repos lấy danh sách, chọn repo phù hợp nhất với query
CCN2 defaults: serverccn2 (Kotlin/Ktor) | clientccn2 (JavaScript/Cocos2d-x)
```

**Validate:**
- Nếu không tìm thấy repo nào: `"GitNexus chưa có repo nào được index. Chạy: npx gitnexus analyze [path]"`
- Nếu symbol target không rõ ràng: hỏi user clarify trước khi tiếp tục

---

## Bước 2 — Đọc Data Theo Depth

### depth=overview (~2-3 reads, ~5s)

```
Step 1: READ gitnexus://repos
        → Lấy danh sách repos đã index, xác định repo target

Step 2: READ gitnexus://repo/{name}/context
        → Stats: nodes/edges/communities/processes + lastCommit + staleness info

Step 3: READ gitnexus://repo/{name}/clusters
        → Functional areas overview
        → SKIP nếu communities=0 (từ Step 2 context)
```

### depth=deep (~6-10 calls, ~30s)

```
Step 1: READ gitnexus://repos → chọn repo
Step 2: READ gitnexus://repo/{name}/context → stats + stale check
Step 3: READ gitnexus://repo/{name}/clusters → functional areas
Step 4: READ gitnexus://repo/{name}/processes → execution flows list
Step 5: query({query: query, repo: name, limit: 5})
        → Response có: processes[], process_symbols[], definitions[]
        → Chọn "top symbol":
          - Ưu tiên: processes[0].entry_point nếu có
          - Fallback: definitions[0].name (highest relevance)
Step 6: [Nếu top symbol xác định được] context({name: topSymbol, repo: name})
        → SKIP nếu query() không trả về symbol nào
```

### depth=symbol (~4-5 calls, ~15s)

```
Step 1: READ gitnexus://repos → xác nhận repo
Step 2: context({name: target, repo: name}) → callers, callees, processes
Step 3: impact({target: target, direction: "upstream", repo: name}) → blast radius
Step 4: [Optional] detect_changes({scope: "staged"})
        → Chỉ chạy nếu query hỏi về staged changes hoặc "trước khi commit"
```

---

## Bước 3 — Build Response

### depth=overview — Format chuẩn:

```markdown
# 🔍 GitNexus Overview — {repo_name}

## Index Status
| Field | Value |
|-------|-------|
| Nodes | {nodes} |
| Edges | {edges} |
| Communities | {communities} |
| Processes | {processes} |
| Last indexed | {lastCommit} |
| Status | ✅ Fresh / ⚠️ Stale (HEAD: {head}, indexed: {index}) |

## Functional Areas
{clusters list với mô tả ngắn — hoặc "Chưa có clusters (communities=0)"}

```mermaid
mindmap
  root(({repo_name}))
    {cluster1}
    {cluster2}
    ...
```
[Bỏ qua Mermaid nếu communities=0]
```

### depth=deep — Format chuẩn:

```markdown
# 🏗️ Architecture Deep Dive — {repo_name}

{⚠️ Index stale: HEAD={HEAD_hash}, indexed={index_hash} — kết quả có thể không cập nhật}
[Dòng này CHỈ hiện nếu stale — bỏ qua nếu fresh]

## Overview
{1-2 đoạn mô tả codebase purpose + stack}

## Architecture Diagram
```mermaid
flowchart TD
  {clusters + relationships dựa trên clusters resource}
```

## Main Execution Flows
{top 3 processes từ processes resource — dùng flowchart hoặc sequenceDiagram}

## Key Symbols
| Symbol | Cluster | Role | Callers |
|--------|---------|------|---------|
| {từ context tool} | ... | ... | ... |
```

### depth=symbol — Format chuẩn:

```markdown
# 🔬 Symbol Analysis — {target}

## Identity
| Field | Value |
|-------|-------|
| File | {file path} |
| Type | {function/class/method} |
| Cluster | {community name} |
| Lines | {start}-{end} |

## Call Graph
```mermaid
flowchart LR
  {caller1} --> [{target}]
  {caller2} --> [{target}]
  [{target}] --> {callee1}
  [{target}] --> {callee2}
```

## Blast Radius
| Depth | Symbols | Risk |
|-------|---------|------|
| d=1 direct | {count} | HIGH (>5) / MED (2-5) / LOW (0-1) |
| d=2 transitive | {count} | ... |

## Affected Processes
{list processes chứa symbol này — từ context tool}

## Detect Changes (nếu applicable)
{kết quả detect_changes nếu đã chạy}
```

---

## Bước 4 — Output

```
depth=overview:
  → Chat only (không tạo file)
  → outputPath chỉ định → ghi vào path đó

depth=deep:
  → outputPath chỉ định → ghi vào path đó
  → Không chỉ định → chat only

depth=symbol:
  → Chat only (không tạo file)
  → outputPath chỉ định → ghi vào path đó
```

---

## Bước 5 — Memory Check (Selective + Approval)

So sánh data với memory hiện tại:

**Check:**
1. Repo mới được index chưa có trong MEMORY.md?
2. Stats thay đổi đáng kể (nodes tăng >20%)?
3. Communities/processes count thay đổi lớn?

**Nếu có thay đổi:**
```
📝 Phát hiện thông tin mới về {repo}:
- [mô tả cụ thể thay đổi]

Cập nhật MEMORY.md không? (y/n)
```

**Nếu không có thay đổi** → skip hoàn toàn.
**Architecture tĩnh** → không ghi.

---

## Graceful Degradation

| Tình huống | Xử lý |
|-----------|-------|
| GitNexus chưa install | `"GitNexus chưa được cài. Chạy: npm install -g gitnexus"` |
| Repo chưa index | `"Repo chưa được index. Chạy: npx gitnexus analyze [path]"` |
| Index stale | Warning + tiếp tục với data cũ |
| Symbol không tìm thấy | `"Không tìm thấy '{target}'. Thử: query({query: '{target}'}) để tìm gần đúng."` |
| Tool timeout | Ghi chú "(timeout)", trả kết quả partial |
| communities=0 | Bỏ qua Mermaid mindmap, ghi "(chưa có clusters)" |
| File thiếu/lỗi | Ghi chú "(dữ liệu không có)" và tiếp tục |

---

## Constraints

- ✅ **Read-only**: Không sửa bất kỳ source file nào
- ✅ **Vietnamese output**: 100% tiếng Việt trong response
- ✅ **No hallucination**: Chỉ dùng data từ GitNexus MCP tools/resources
- ✅ **Mermaid required**: overview → mindmap (nếu clusters có), deep → flowchart + processes, symbol → call graph + impact
- ✅ **Graceful degradation**: Missing data → ghi chú, tiếp tục
- ✅ **Approval required**: Memory write luôn hỏi trước
- ✅ **No analysis execution**: Không chạy `npx gitnexus analyze`
- ⚠️ **cypher prerequisite**: Nếu dùng `cypher` tool sau này, BẮT BUỘC đọc `gitnexus://repo/{name}/schema` trước. Hiện tại `cypher` nằm ngoài scope.

---

## Reference Files

Đọc khi cần:
- **Tool specs**: `references/tool-specs.md` — params đầy đủ cho 7 MCP tools + 7 resources
- **CCN2 mapping**: `references/ccn2-mapping.md` — per-agent guidance cho Forge/Pixel/Verita
- **Output templates**: `references/output-templates.md` — Mermaid templates + phrasing guide

---

## Examples

### Quick status check
```
User: "gitnexus index serverccn2 còn fresh không?"
→ depth=overview, repo=serverccn2
→ READ gitnexus://repos + READ gitnexus://repo/serverccn2/context
→ Chat: "Index ✅ Fresh — 1247 nodes, 89 processes, indexed 2h ago"
```

### Architecture deep dive
```
User: "Giải thích architecture của serverccn2"
→ depth=deep, repo=serverccn2
→ READ clusters + processes + query("main game loop") + context(topSymbol)
→ Chat: flowchart architecture + top 3 execution flows + key symbols
```

### Agent pre-edit impact check
```
Agent: "Nếu tôi sửa GameRoom thì hỏng gì?"
→ depth=symbol, target=GameRoom, repo=serverccn2
→ context(GameRoom) + impact(GameRoom, upstream)
→ Chat: "⚠️ HIGH RISK: 12 direct callers, 3 processes affected" + call graph mermaid
```

### Symbol deep dive
```
User: "CombatEngine là gì, ai gọi nó?"
→ depth=symbol, target=CombatEngine, repo=serverccn2
→ context(CombatEngine) + impact(CombatEngine)
→ Chat: call graph mermaid + callers list + affected processes
```

---

*Skill created: 2026-03-26*
*Spec: agent-teams/docs/superpowers/specs/2026-03-26-git-nexus-deep-understanding-design.md*
