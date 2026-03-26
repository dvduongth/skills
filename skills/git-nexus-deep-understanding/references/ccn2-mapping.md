# CCN2 Agent Teams — GitNexus Mapping

*Hướng dẫn cụ thể cho từng agent trong hệ thống 9-agent CCN2.*
*Dùng skill `git-nexus-deep-understanding` để tra cứu context trước/sau khi edit.*

---

## CCN2 Repos

| Repo Name | Path | Stack | Khi nào dùng |
|-----------|------|-------|--------------|
| `serverccn2` | `D:\PROJECT\CCN2\serverccn2` | Kotlin/Ktor 3.4.0 | Server logic, game room, abilities |
| `clientccn2` | `D:\PROJECT\CCN2\clientccn2` | JavaScript/Cocos2d-x | Client UI, game rendering |

**Multi-repo**: Pass `repo` param khi dùng tools — `repo: "serverccn2"` hoặc `repo: "clientccn2"`.

---

## Per-Agent Guidance

### 🖥️ Forge (agent_dev_server) — Kotlin/Ktor Server

**Trước khi edit bất kỳ Kotlin file nào:**
```
depth=symbol, target={ClassName hoặc functionName}, repo=serverccn2
→ impact({target, direction: "upstream"}) — check blast radius
→ Nếu risk=HIGH/CRITICAL → báo cáo trước khi tiếp tục
```

**Sau khi edit:**
```
detect_changes({scope: "staged", repo: "serverccn2"})
→ Verify chỉ có expected symbols thay đổi
```

**Common CCN2 server symbols cần extra care:**
| Symbol | Risk Level | Lý do |
|--------|-----------|-------|
| `GameRoom` | CRITICAL | Core game logic, nhiều handlers phụ thuộc |
| `CombatEngine` | HIGH | Được gọi từ nhiều ability handlers |
| `MovementValidator` | HIGH | Validate mọi di chuyển của player |
| `RNGService` | MEDIUM | Shared random state |
| `GameState` | HIGH | Serialized qua WebSocket |

---

### 💻 Pixel (agent_dev_client) — JavaScript Client

**Trước khi rename JS function/variable:**
> ⚠️ Dùng `using-git-nexus` skill (skill 2) — không phải skill này.
> Skill này chỉ cho analysis, không phải thực thi rename.

**Hiểu dependencies của một JS function:**
```
depth=symbol, target={functionName}, repo=clientccn2
→ context({name: functionName}) — callers + callees
```

**Hiểu một module trong client:**
```
depth=deep, query: "tên module hoặc feature", repo=clientccn2
→ Lấy clusters + execution flows của module đó
```

**Note về clientccn2**: File là global object literals (`var FeatureName = { ... }`), không có ES modules. Tree-sitter vẫn parse được nhưng "imports" sẽ là empty — dùng `processes` resource để hiểu execution flows thay vì import graph.

---

### 🔍 Verita / agent_qc1 — GDD Validation + QC

**Pre-commit check bắt buộc:**
```
depth=symbol, target={symbolsChanged}, repo={repo}
→ detect_changes({scope: "staged"}) — verify scope
→ impact({target, direction: "upstream"}) — check không có unexpected deps
```

**Verify implementation matches GDD:**
```
depth=deep, query: "{feature name theo GDD}", repo=serverccn2
→ Đọc processes + clusters → compare với GDD description
```

---

### 🔬 agent_qc2 — Code Review + Unit Test

**Hiểu symbol trước khi review:**
```
depth=symbol, target={symbolBeingReviewed}, repo={repo}
→ Full context: callers + callees + affected processes
→ Dùng để check test coverage đã đủ chưa
```

---

### 🎨 Designia / agent_gd — Game Designer

**Hiểu codebase trước khi thiết kế feature mới:**
```
depth=deep, query: "{domain concept từ GDD}", repo=serverccn2
→ Xem clusters + execution flows → biết code đã có gì
→ Tránh design conflict với existing implementation
```

**Quick overview trước planning session:**
```
depth=overview, repo=serverccn2
→ Stats + functional areas → biết codebase scope
```

---

### 👑 agent_leader — Project Manager

**Status check khi cần báo cáo:**
```
depth=overview, repo=serverccn2
+ depth=overview, repo=clientccn2
→ Index stats + staleness → biết codebase "health"
```

---

## Common Patterns

### Pattern 1: Pre-Edit Safety Check (Forge/Pixel)
```
1. git-nexus-deep-understanding: depth=symbol, target=X
2. Review blast radius — nếu HIGH/CRITICAL → thông báo trước
3. [Edit files]
4. git-nexus-deep-understanding: depth=symbol, target=X, detect_changes query
5. Verify scope đúng như dự kiến
```

### Pattern 2: Architecture Onboarding (agent_gd/agent_leader)
```
1. git-nexus-deep-understanding: depth=overview → nắm tổng quan
2. git-nexus-deep-understanding: depth=deep, query="[domain]" → hiểu sâu 1 area
3. git-nexus-deep-understanding: depth=symbol, target="[key class]" → symbol detail
```

### Pattern 3: Debug Root Cause (agent_qc2)
```
1. git-nexus-deep-understanding: depth=deep, query="[error symptom]"
   → Tìm processes liên quan
2. git-nexus-deep-understanding: depth=symbol, target="[suspect symbol]"
   → Xem callers → tìm source gây bug
```

---

*Last updated: 2026-03-26 | CCN2 agent-teams v3.5*
