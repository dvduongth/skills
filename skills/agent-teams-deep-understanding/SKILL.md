# agent-teams-deep-understanding

**Purpose**: Hiểu sâu hệ thống 9-agent CCN2 — trả lời câu hỏi về kiến trúc pipeline, trạng thái live (tickets/health), và từng agent cụ thể. Không cần đọc file thủ công.

**Version**: v1.2 (2026-04-01) — Migration: shared/playtest/ → shared/godot-client/
**Spec**: `agent-teams/docs/superpowers/specs/2026-03-25-agent-teams-deep-understanding-design.md`

---

## Triggers

Invoke skill này khi user hỏi về bất kỳ điều gì liên quan đến hệ thống agent-teams:

**Nhóm 1 — Architecture:**
"agent-teams", "pipeline flow", "9 agents", "dispatch protocol", "pipeline hoạt động", "hệ thống agent", "kiến trúc agent", "tổng quan agent", "agent teams là gì"

**Nhóm 2 — Live State:**
"ticket đang ở đâu", "pipeline healthy", "ai đang chạy", "ticket-[số] status", "pipeline bị stuck", "health check", "pipeline health", "ticket [số] artifact"

**Nhóm 3 — Onboard:**
"giải thích hệ thống", "agent_leader là ai", "team agents làm gì", "tổng quan agent-teams", "onboard", "overview agent", "agent_[tên] là gì", "agent_[tên] làm gì"

---

## Input

```
query      (required) — câu hỏi của user
depth      (optional) — "overview" | "agent" | "ticket" | auto-detect từ query
target     (optional) — agent_id hoặc ticket_id khi depth=agent/ticket
outputPath (optional) — nơi lưu report; nếu rỗng → auto theo depth
repoPath   (optional) — default: D:\PROJECT\CCN2\agent-teams
```

---

## Workflow

### Bước 1 — Xác định depth và target

Phân tích `query` để chọn depth:

```
Có "ticket-YYYYMMDD-NNN" trong query?
  → depth=ticket, target=ticket_id tìm được

Có "agent_[tên]" trong query?
  → depth=agent, target=agent_id tìm được

Có keyword nhóm 2 nhưng không có ticket_id cụ thể?
  → depth=overview (focus vào health + active tickets)

Còn lại (architecture/onboard/general)?
  → depth=overview
```

Validate agent_id nếu depth=agent:
```
Valid IDs: agent_leader, agent_gd, agent_dev, agent_dev_bz,
           agent_dev_godot, agent_dev_admin, agent_qc1, agent_qc2, agent_playtest
```
→ Nếu invalid: "Agent '[x]' không tồn tại. Các agent hợp lệ: [list]"

### Bước 2 — Đọc files theo depth

#### depth=overview (~12 reads)

Đọc song song:
1. `docs/ARCHITECTURE.md` — lấy pipeline diagram + rules
2. `README.md` — lấy Mandatory Rules v3.11.0 (6 rules)
3. `agents/agent_leader/SOUL.md`
4. `agents/agent_gd/SOUL.md`
5. `agents/agent_dev/SOUL.md`
6. `agents/agent_dev_bz/SOUL.md`
7. `agents/agent_dev_godot/SOUL.md`
8. `agents/agent_dev_admin/SOUL.md`
9. `agents/agent_qc1/SOUL.md`
10. `agents/agent_qc2/SOUL.md`
11. `agents/agent_playtest/SOUL.md`
12. `.state/ticket-tracker.json`
13. `.state/pipeline-health.json`
14. `shared/knowledge/INDEX.md`

#### depth=agent (~7 reads)

Đọc song song:
1. `agents/<target>/SOUL.md`
2. `agents/<target>/AGENTS.md`
3. `agents/<target>/REFERENCE.md` (nếu tồn tại — human-editable hướng dẫn thực thi)
4. `.state/ticket-tracker.json` (filter theo target agent)
5. `agents/<target>/memory/` — list files, đọc 1-2 file mới nhất

#### depth=ticket (~8 reads)

1. `.state/ticket-tracker.json` — tìm entry với ticket_id = target
2. Scan `tickets/*/` để tìm `ticket-<target>.md` (thử các requester folder)
3. Đọc ticket file tìm được
4. List `shared/tickets/<target>/` nếu tồn tại — lấy artifacts
5. `shared/knowledge/INDEX.md` — tìm retro liên quan ticket

**Graceful degradation**: File không tồn tại → ghi chú "(file chưa có)" và tiếp tục.

### Bước 3 — Build response

#### depth=overview — Format chuẩn:

```markdown
# 🤖 Agent-Teams Overview — YYYYMMDD

## Pipeline Architecture (v3.11.0)
[Mermaid diagram — extract từ ARCHITECTURE.md hoặc render lại]

## 9 Agents
| Agent | ID | Vai trò | REFERENCE.md | Tagline |
|-------|----|---------|-------------|---------|
| 👑 PM | agent_leader | Project Manager | — | "I don't build. I make sure the right people build the right things." |
| 🎨 GD | agent_gd | Game Designer | — | "You're not a chatbot. You're a game designer with taste." |
| 👷 TechLead | agent_dev | Tech Lead | — | "You're not a code monkey. You're an engineer who gives a damn." |
| 🖥️ Server | agent_dev_bz | Server Dev (bitzero-kotlin) | — | Correctness first, actor integrity |
| 💻 Client | agent_dev_godot | Client Dev (Godot 4.6.1 / GDScript) | YES | Module-based, 3-tier scenes, signal-driven |
| 🛠️ Admin | agent_dev_admin | Admin Dev (optional) | — | Same standards, smaller scope |
| 🔍 BlackboxQC | agent_qc1 | QC1 — GDD Validation + test cases | YES | "You don't need to see the code. You see what the player sees." |
| 🔬 WhiteboxQC | agent_qc2 | QC2 — Code review + unit test | YES | "You're not a rubber stamp. You're the last line of defense." |
| 🎮 Playtester | agent_playtest | Smoke test + balance + fun | YES | "I play to find where the design breaks." |

> **REFERENCE.md**: Human-editable file chứa paths, checklists, hướng dẫn thực thi. Agents có REFERENCE.md PHẢI đọc nó khi bắt đầu task. Human có thể thêm hướng dẫn bất kỳ lúc nào.

## Mandatory Rules (v3.11.0)
[Extract 6 rules từ README.md/ARCHITECTURE.md — bao gồm Rule 6: Mandatory Visual Verification Gate]

### Rule 6 Highlight (v3.11.0)
agent_playtest PHẢI chạy Godot runtime + capture screenshot trước khi report PASS.
Full flow bắt buộc: `scene_loading.tscn → scene_login.tscn → SceneLobby → SceneTable` — KHÔNG test isolated.
Visual check FAIL = smoke FAIL. Godot không available → report BLOCKED (không SKIP/PASS).

### Development Environment (v1.2 — 2026-04-01)
- **Godot project**: `shared/godot-client/client/` (replaces legacy `shared/playtest/godot/`)
- **Engine**: Godot 4.6.1 (bundled at `shared/godot-client/editor/Godot_v4.6.1-stable_win64.exe`)
- **Test framework**: GUT (`addons/gut/`)
- **Architecture**: Module-based (`client/modules/`), 3-tier scenes (Console → Proto → Full)
- **Autoloads**: 13 organized (core/network/lobby/table/cheat)
- **MCP**: godot-mcp addon + `D:\PROJECT\CCN2\godot-mcp\` setup guide
- **Legacy**: `shared/playtest/` deprecated — reference only, will be removed

## Active Tickets
[Parse ticket-tracker.json — hiển thị tickets có status != done/failed/cancelled]
→ Nếu không có: "Không có ticket đang chạy."

## Pipeline Health
[Parse pipeline-health.json]
→ Format: "**[overall]** — [passed]/[total] checks PASS | Last run: [last_run]"
→ Hiển thị chi tiết checks nếu có FAIL

## Recent Retrospectives (3 mới nhất)
[Parse INDEX.md — lấy 3 row cuối bảng]
→ Nếu không có: "Chưa có retrospective nào."
```

#### depth=agent — Format chuẩn:

```markdown
## 🤖 [Agent Name] — [agent_id]

### Identity
[SOUL.md content — role, personality, core values, tagline]

### Workflow
[AGENTS.md — tóm tắt: startup sequence + các phases chính + output chính]
(Giới hạn ~20 dòng — đủ để hiểu flow, không dump toàn bộ file)

### Active Tickets
[Tickets trong tracker có agent này liên quan — hoặc "Không có ticket active."]

### Recent Memory
[1-2 memory file gần nhất — nếu có]
(Nếu không có memory file: "Chưa có memory gần đây.")
```

#### depth=ticket — Format chuẩn:

```markdown
## 🎫 Ticket [ticket_id]

### Trạng thái
| Field | Value |
|-------|-------|
| Status | [từ tracker] |
| Requester | [từ tracker/ticket file] |
| Priority | [từ ticket file] |
| Last updated | [từ tracker] |

### Tiến độ Pipeline
[Bảng tiến độ từ ticket file — giữ nguyên format]

### Artifacts
[Danh sách files trong shared/tickets/<id>/ nếu tồn tại]
→ Nếu không có: "Chưa có artifacts."

### Lịch sử xử lý
[Bảng Lịch sử từ ticket file — 5 entries mới nhất]

### Retrospective
[Nếu có retro liên quan: path + tóm tắt 1 dòng]
→ Nếu không có: "Chưa có retrospective."
```

### Bước 4 — Output

```
depth=overview:
  outputPath chỉ định → ghi vào path đó
  không chỉ định      → ghi vào <repoPath>/shared/knowledge/snapshots/overview-YYYYMMDD.md
  → Báo user: "Report đã lưu tại: [path]"

depth=agent:
  outputPath chỉ định → ghi vào path đó
  không chỉ định      → chat only (không tạo file)

depth=ticket:
  outputPath chỉ định → ghi vào path đó
  không chỉ định      → ghi vào <repoPath>/shared/knowledge/snapshots/ticket-<id>-YYYYMMDD.md
  → Báo user: "Report đã lưu tại: [path]"
```

**Tạo thư mục** nếu chưa tồn tại: `shared/knowledge/snapshots/`

### Bước 5 — Memory check (Selective + Approval)

So sánh data đọc được với memory hiện tại (`MEMORY.md`):

**Kiểm tra:**
1. Tickets active mới (chưa có trong memory)?
2. Tickets vừa done/failed mà memory chưa biết?
3. Retro mới trong INDEX.md chưa có trong memory?
4. Pipeline health thay đổi từ HEALTHY → khác (hoặc ngược lại)?

**Nếu có thay đổi:**
```
📝 Phát hiện thông tin mới từ agent-teams:
- [mô tả cụ thể từng thay đổi]

Cập nhật MEMORY.md không? (y/n)
```

**Nếu user chọn y:** Ghi vào section phù hợp trong MEMORY.md.
**Nếu không có thay đổi:** Skip hoàn toàn (không hỏi).
**Kiến trúc tĩnh:** Không ghi dù user có hỏi về architecture.

---

## Constraints

- ✅ **Read-only**: Không sửa bất kỳ file agent-teams nào (chỉ write report + memory với approval)
- ✅ **Vietnamese output**: 100% tiếng Việt trong response
- ✅ **Graceful degradation**: File thiếu → ghi chú, tiếp tục
- ✅ **No hallucination**: Chỉ report data đọc được, không suy diễn
- ✅ **Mermaid diagrams**: Extract từ ARCHITECTURE.md nếu có, không tự render lại nếu không chắc
- ✅ **Approval required**: Memory write luôn hỏi trước

---

## Examples

### Quick health check
```
User: "pipeline healthy không?"
→ depth=overview (trigger nhóm 2, không có ticket_id)
→ Focus pipeline-health.json + active tickets
→ Chat: "Pipeline HEALTHY — 7/7 checks PASS (last run: 2026-03-22)..."
→ Không tạo report file (câu hỏi ngắn)
```
> **Note**: Với câu hỏi health check đơn giản — chỉ cần đọc pipeline-health.json + tracker,
> không cần đọc đủ 12 files. Dùng judgment: nếu query chỉ hỏi 1 aspect cụ thể → chỉ đọc files liên quan.

### Full overview
```
User: "Cho tôi nắm toàn bộ hệ thống agent-teams"
→ depth=overview
→ Đọc ~14 files
→ Tạo: shared/knowledge/snapshots/overview-20260325.md
→ Hiển thị full: diagram + agents + rules + tickets + health + retros
```

### Agent deep dive
```
User: "agent_gd là ai và workflow thế nào?"
→ depth=agent, target=agent_gd
→ Đọc: SOUL + AGENTS + tracker (filter) + memory gần nhất
→ Chat only: explain Designia identity + workflow phases
```

### Ticket status
```
User: "ticket-20260324-001 đang ở bước nào?"
→ depth=ticket, target=ticket-20260324-001
→ Đọc: tracker + ticket file + artifacts + retro
→ Tạo: shared/knowledge/snapshots/ticket-20260324-001-20260325.md
```

---

## Configuration

**Default repo path**: `D:\PROJECT\CCN2\agent-teams`

Override bằng `repoPath` parameter hoặc biến môi trường:
```bash
AGENT_TEAMS_PATH=D:\PROJECT\CCN2\agent-teams
```

**Godot client path**: `shared/godot-client/client/` (Godot 4.6.1, module-based)
**Godot editor path**: `shared/godot-client/editor/Godot_v4.6.1-stable_win64.exe`
**MCP setup guide**: `D:\PROJECT\CCN2\godot-mcp\`
**Legacy (deprecated)**: `shared/playtest/` — reference only, will be removed

---

## Cross-Agent Collaboration Context

Khi trả lời về bất kỳ agent nào, nên include context về agents liên quan:

| Khi hỏi về | Cũng nên mention |
|------------|-----------------|
| agent_dev_godot | agent_qc2 (code review), agent_playtest (runtime verify) |
| agent_qc1 | agent_gd (GDD source), agent_playtest (test execution) |
| agent_qc2 | agent_dev_godot (code author), REFERENCE.md (checklists) |
| agent_playtest | agent_qc1 (test cases), REFERENCE.md (visual checklist, Godot binary paths) |
| agent_dev | agent_dev_bz + agent_dev_godot (workers), agent_qc2 (review) |

**Lesson learned (tickets 012-014):** Agents report PASS via static analysis but game UI completely broken. Rule 6 now requires runtime Godot screenshots. REFERENCE.md files guide QC/playtest agents on what to check.

---

*Skill created: 2026-03-25 by William Đào*
*Updated: 2026-03-29 — v1.1: Rule 6, REFERENCE.md, cross-agent context, repo path fix*
*Updated: 2026-04-01 — v1.2: Migration shared/playtest/ → shared/godot-client/, Godot 4.6.1, GUT, module-based*
*Spec: agent-teams/docs/superpowers/specs/2026-03-25-agent-teams-deep-understanding-design.md*
