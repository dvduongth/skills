# GitNexus MCP — Tool & Resource Reference

*Quick reference cho skill `git-nexus-deep-understanding`.*
*Source: GitNexus v1.4.8 AGENTS.md + gitnexus-guide.md*

---

## 7 MCP Tools

### 1. `query` — Process-Grouped Hybrid Search

**Mô tả**: Tìm execution flows liên quan đến một concept. Dùng BM25 + semantic + RRF fusion.

**Input:**
```json
{
  "search_query": "string (required) — concept cần tìm",
  "repo": "string (optional) — tên repo",
  "context": "string (optional) — task context để cải thiện ranking",
  "goal": "string (optional) — mục tiêu tìm kiếm",
  "limit": "number (optional, default: 5) — max processes",
  "include_content": "boolean (optional) — include full source code"
}
```

**Output:**
```json
{
  "processes": [{ "name": "...", "entry_point": "...", "symbols": [] }],
  "process_symbols": [{ "name": "...", "file": "...", "relevance": 0.9 }],
  "definitions": [{ "name": "...", "file": "...", "type": "function|class|method" }]
}
```

**Khi dùng**: depth=deep Step 5 — tìm relevant processes/symbols cho query.

---

### 2. `context` — 360-Degree Symbol View

**Mô tả**: Xem toàn bộ context của một symbol: callers, callees, processes chứa nó.

**Input:**
```json
{
  "name": "string (required) — symbol name",
  "repo": "string (optional) — tên repo",
  "uid": "string (optional) — direct symbol UID (zero-ambiguity)",
  "file": "string (optional) — file path để disambiguate",
  "include_content": "boolean (optional) — include source code"
}
```

**Output:**
```json
{
  "symbol": { "name": "...", "type": "...", "file": "...", "lines": [1, 42] },
  "callers": [{ "name": "...", "file": "...", "line": 42 }],
  "callees": [{ "name": "...", "file": "..." }],
  "processes": [{ "name": "...", "role": "entry_point|intermediate|leaf" }],
  "cluster": { "name": "...", "description": "..." }
}
```

**Khi dùng**: depth=symbol Step 2, depth=deep Step 6.

---

### 3. `impact` — Blast Radius Analysis

**Mô tả**: Phân tích upstream/downstream dependants — "cái gì sẽ hỏng nếu thay đổi X".

**Input:**
```json
{
  "target": "string (required) — symbol name",
  "repo": "string (optional) — tên repo",
  "direction": "string (default: 'upstream') — 'upstream'|'downstream'",
  "depth": "number (default: 3) — max relationship depth",
  "include_tests": "boolean (default: false) — include test files"
}
```

**Output:**
```json
{
  "target": "string",
  "risk": "CRITICAL|HIGH|MEDIUM|LOW",
  "depth_groups": {
    "1": [{ "name": "...", "file": "...", "confidence": 0.95 }],
    "2": [],
    "3": []
  },
  "affected_processes": [{ "name": "...", "impact_type": "direct|transitive" }]
}
```

**Risk thresholds:**
- CRITICAL: d=1 callers > 20
- HIGH: d=1 callers 6-20
- MEDIUM: d=1 callers 2-5
- LOW: d=1 callers 0-1

**Khi dùng**: depth=symbol Step 3.

---

### 4. `detect_changes` — Git Diff → Affected Symbols

**Mô tả**: Map git diff sang affected symbols và processes trong graph.

**Input:**
```json
{
  "scope": "string (default: 'staged') — 'staged'|'unstaged'|'all'|'<commit-hash>'",
  "repo": "string (optional) — tên repo"
}
```

**Output:**
```json
{
  "changed_symbols": [{ "name": "...", "file": "...", "change_type": "modified|added|deleted" }],
  "affected_processes": [{ "name": "...", "confidence": 0.9 }],
  "summary": "string"
}
```

**Khi dùng**: depth=symbol Step 4 (optional) — khi query hỏi về staged changes.

---

### 5. `rename` — Multi-File Coordinated Rename

**Mô tả**: Rename symbol an toàn — dùng graph để tìm tất cả references.

> ⚠️ **NGOÀI SCOPE** của skill này. Thuộc `using-git-nexus` (skill 2).
> Luôn dùng `dry_run: true` trước khi thực sự rename.

---

### 6. `cypher` — Raw Cypher Query

**Mô tả**: Chạy Cypher query trực tiếp vào LadybugDB graph.

> ⚠️ **NGOÀI SCOPE** của skill này.
> **BẮT BUỘC**: Đọc `gitnexus://repo/{name}/schema` trước khi dùng tool này.

---

### 7. `list_repos` — Discover Indexed Repositories

**Mô tả**: Liệt kê tất cả repos đã được index trong global registry.

**Input:** (none required)

**Output:**
```json
{
  "repos": [{ "name": "...", "path": "...", "last_indexed": "..." }]
}
```

> **Note**: Dùng resource `gitnexus://repos` thay vì tool này khi chỉ cần list — resource nhanh hơn.

---

## 7 MCP Resources (READ via gitnexus://)

### `gitnexus://repos`
Danh sách tất cả repos đã index trong registry.

```json
[{ "name": "serverccn2", "path": "D:\\PROJECT\\CCN2\\serverccn2", "indexed": true }]
```

---

### `gitnexus://repo/{name}/context`
Stats tổng quan + staleness info cho repo.

```json
{
  "name": "serverccn2",
  "stats": { "nodes": 1247, "edges": 3891, "communities": 12, "processes": 89 },
  "lastCommit": "abc1234",
  "currentHead": "def5678",
  "stale": false,
  "embeddings": true
}
```

---

### `gitnexus://repo/{name}/clusters`
Functional communities (Leiden algorithm output).

```json
[{
  "id": "community_0",
  "name": "Combat System",
  "size": 47,
  "symbols": ["CombatEngine", "DamageCalculator"],
  "description": "..."
}]
```

---

### `gitnexus://repo/{name}/processes`
Execution flows traced từ entry points.

```json
[{
  "name": "handlePlayerAttack",
  "entry_point": "handlePlayerAttack",
  "depth": 5,
  "symbols": ["handlePlayerAttack", "CombatEngine.calculate", "DamageCalculator.apply"]
}]
```

---

### `gitnexus://repo/{name}/symbols`
Tất cả symbols trong repo (có thể lớn — dùng `query` tool thay vì đọc toàn bộ).

---

### `gitnexus://repo/{name}/dependencies`
External dependencies của repo.

---

### `gitnexus://repo/{name}/community/{communityId}`
Chi tiết một community cụ thể.

---

### `gitnexus://repo/{name}/schema`
> ⚠️ **BẮT BUỘC đọc trước khi dùng `cypher` tool.**
Node types, edge types, và property schema của LadybugDB graph.

---

*Last updated: 2026-03-26 | Source: GitNexus v1.4.8*
