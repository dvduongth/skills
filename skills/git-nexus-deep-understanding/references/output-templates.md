# Output Templates — git-nexus-deep-understanding

*Templates đầy đủ cho từng depth mode. Copy và điền placeholders.*

---

## depth=overview — Full Template

```markdown
# 🔍 GitNexus Overview — {repo_name}

## Index Status
| Field | Value |
|-------|-------|
| Nodes | {nodes} |
| Edges | {edges} |
| Communities | {communities} |
| Processes | {processes} |
| Embeddings | {✅ Có / ❌ Không} |
| Last indexed | {lastCommit (short hash)} |
| Status | ✅ Fresh / ⚠️ Stale (HEAD: {head_short}, indexed: {index_short}) |

## Functional Areas
{Liệt kê clusters: "**{cluster_name}** ({size} symbols) — {description}"}

Ví dụ:
- **Combat System** (47 symbols) — Xử lý tính toán damage, ability, và buff/debuff
- **Game Room** (82 symbols) — Quản lý room lifecycle và player session
- **Board Logic** (31 symbols) — Di chuyển token, tile validation, KC calculation

​```mermaid
mindmap
  root(({repo_name}))
    {cluster1_name}
      ({size1} symbols)
    {cluster2_name}
      ({size2} symbols)
    {cluster3_name}
      ({size3} symbols)
​```

[Bỏ qua block Mermaid nếu communities=0, thay bằng: "(Chưa phát hiện clusters — có thể cần re-analyze với --skills flag)"]
```

---

## depth=deep — Full Template

```markdown
# 🏗️ Architecture Deep Dive — {repo_name}

{⚠️ **Index có thể không cập nhật**: HEAD={head_short}, indexed={index_short}. Chạy `npx gitnexus analyze` để refresh.}
[REMOVE dòng trên nếu index fresh]

## Tổng Quan
{repo_name} là {mô tả ngắn gọn purpose}. Stack: {tech stack}.
{1 câu về quy mô: N nodes, M processes, P clusters.}

## Architecture Diagram

​```mermaid
flowchart TD
  subgraph Core["{cluster1_name}"]
    A[{symbol1}]
    B[{symbol2}]
  end
  subgraph Logic["{cluster2_name}"]
    C[{symbol3}]
    D[{symbol4}]
  end
  A -->|calls| C
  C -->|uses| D
  B -->|triggers| D
​```

*Diagram dựa trên {communities} clusters và top relationships từ graph.*

## Main Execution Flows

### Flow 1: {process_name_1}
​```mermaid
flowchart LR
  EP1[{entry_point}] --> S1[{symbol1}]
  S1 --> S2[{symbol2}]
  S2 --> S3[{symbol3 — leaf}]
​```

### Flow 2: {process_name_2}
{[Tương tự — top 3 processes từ processes resource]}

## Key Symbols
| Symbol | Cluster | Vai trò | Callers |
|--------|---------|---------|---------|
| {symbol1} | {cluster} | Entry point | {count} |
| {symbol2} | {cluster} | Core logic | {count} |
| {symbol3} | {cluster} | Data model | {count} |
```

---

## depth=symbol — Full Template

```markdown
# 🔬 Symbol Analysis — `{target}`

## Identity
| Field | Value |
|-------|-------|
| File | `{file_path}` |
| Type | {function \| class \| method \| interface} |
| Lines | {start}–{end} |
| Cluster | {community_name} |
| Processes | {N} processes chứa symbol này |

## Call Graph
​```mermaid
flowchart LR
  subgraph Callers
    C1["{caller1}\n{caller1_file}"]
    C2["{caller2}\n{caller2_file}"]
  end
  subgraph Target
    T["{target}"]
  end
  subgraph Callees
    E1["{callee1}"]
    E2["{callee2}"]
  end
  C1 --> T
  C2 --> T
  T --> E1
  T --> E2
​```

*{N} callers | {M} callees | {P} processes*

## Blast Radius
| Depth | Count | Risk | Symbols |
|-------|-------|------|---------|
| d=1 direct callers | {count1} | {HIGH/MED/LOW} | {names nếu ít} |
| d=2 transitive | {count2} | {risk2} | — |
| d=3 transitive | {count3} | {risk3} | — |

**Risk tổng thể**: {CRITICAL/HIGH/MEDIUM/LOW}
{Nếu HIGH/CRITICAL: "⚠️ Cần review kỹ trước khi edit — {count} symbols phụ thuộc trực tiếp"}

## Affected Processes
{Liệt kê processes chứa symbol này:}
- `{process1}` — {role: entry_point/intermediate/leaf}
- `{process2}` — {role}

## Staged Changes (nếu applicable)
{Nếu detect_changes đã chạy:}
**Changed symbols**: {list}
**Affected processes**: {list}
**Verdict**: {Đúng scope / Có unexpected changes}
```

---

## Vietnamese Phrasing Guide

### Staleness Messages
- Fresh: `"✅ Index cập nhật (indexed {N} phút/giờ trước)"`
- Stale: `"⚠️ Index có thể không cập nhật. HEAD: {x}, indexed: {y}. Chạy: npx gitnexus analyze"`

### Risk Messages
- CRITICAL: `"🔴 CRITICAL RISK: {N} direct callers — DỪNG LẠI, phân tích kỹ trước khi edit"`
- HIGH: `"🟠 HIGH RISK: {N} direct callers — review impact trước khi tiếp tục"`
- MEDIUM: `"🟡 MEDIUM RISK: {N} direct callers — cần test sau khi edit"`
- LOW: `"🟢 LOW RISK: {N} direct caller — safe to edit"`

### Not Found Messages
- Symbol: `"Không tìm thấy symbol '{target}'. Thử: query({query: '{target}'}) để tìm gần đúng."`
- Repo: `"Repo '{name}' chưa được index. Chạy: npx gitnexus analyze D:\\PROJECT\\CCN2\\{name}"`
- No repos: `"Chưa có repo nào được index. Xem references/ccn2-mapping.md để setup."`

### Memory Update Prompt
```
📝 Phát hiện thông tin mới về {repo_name}:
- {thay đổi cụ thể, ví dụ: "Nodes tăng từ 800 → 1247 (+56%)"}
- {thay đổi khác nếu có}

Cập nhật MEMORY.md không? (y/n)
```

---

## Section Bắt Buộc vs Optional

| Section | overview | deep | symbol |
|---------|----------|------|--------|
| Index Status table | ✅ required | — | — |
| Staleness warning | if stale | if stale | — |
| Functional Areas list | ✅ required | — | — |
| Mermaid mindmap | if communities>0 | — | — |
| Overview paragraphs | — | ✅ required | — |
| Architecture flowchart | — | ✅ required | — |
| Execution flows | — | ✅ required (top 3) | — |
| Key Symbols table | — | ✅ required | — |
| Identity table | — | — | ✅ required |
| Call Graph mermaid | — | — | ✅ required |
| Blast Radius table | — | — | ✅ required |
| Affected Processes | — | ✅ if available | ✅ required |
| Staged Changes | — | — | if requested |

---

*Last updated: 2026-03-26*
