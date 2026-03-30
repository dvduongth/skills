---
name: workflow-docs-updater
description: "Tự động hóa cập nhật docs khi workflow thay đổi. Dùng khi: thêm phase/rule/agent mới, sửa pipeline flow, thêm trigger type, bump version. Đảm bảo README.md, docs/ARCHITECTURE.md, agents/*/AGENTS.md, agents/*/HEARTBEAT.md nhất quán sau mỗi thay đổi workflow."
---

# Workflow Docs Updater Skill

Tự động cập nhật và đồng bộ tất cả tài liệu pipeline khi có thay đổi workflow.

## Khi Nào Dùng

- Thêm phase/step mới vào pipeline
- Thêm mandatory rule mới
- Thêm/xóa agent
- Thêm trigger type mới
- Thay đổi gate logic
- Bất kỳ thay đổi nào ảnh hưởng đến workflow của ≥2 agents

## Trigger Keywords

- "cập nhật workflow", "update workflow", "thêm rule", "thêm phase"
- "workflow docs", "update docs", "sync docs"
- "pipeline changed", "new rule", "new agent"

---

## Checklist Bắt Buộc

Thực hiện theo thứ tự:

### Bước 1 — Parse Change

```
Xác định:
  change_type: add_phase | remove_phase | add_rule | modify_rule | add_agent | add_trigger | add_gate_logic
  description: mô tả ngắn (1 dòng)
  version_bump: major | minor (major = pipeline restructure, minor = thêm rule/phase)
  affected_agents: [list agent_id]
  breaking: true | false
```

### Bước 2 — Identify Affected Docs

Dùng bảng này:

| Change Type | Files Cần Update |
|-------------|-----------------|
| `add_phase` | ARCHITECTURE.md (pipeline flow), CHANGELOG.md, README.md (pipeline diagram), AGENTS.md của agents liên quan |
| `add_rule` | ARCHITECTURE.md (Mandatory Rules), CHANGELOG.md, README.md (Mandatory Rules section) |
| `add_agent` | README.md (agent table), ARCHITECTURE.md (agent table + flow), CHANGELOG.md, IDENTITY.md của agent mới |
| `add_trigger` | ARCHITECTURE.md (trigger types table), CHANGELOG.md, AGENTS.md của receiving agent |
| `add_gate_logic` | ARCHITECTURE.md (Gates section), CHANGELOG.md, AGENTS.md của agent_leader |
| `modify_rule` | ARCHITECTURE.md, CHANGELOG.md, README.md, AGENTS.md của affected agents |

### Bước 3 — Load Current Docs

```
Đọc:
  - README.md (version header)
  - docs/ARCHITECTURE.md (version header + affected sections)
  - docs/CHANGELOG.md (latest version entry — prepend new entry tại đây)
  - agents/<affected_id>/AGENTS.md (cho mỗi agent affected)
  - agents/<affected_id>/HEARTBEAT.md (nếu change ảnh hưởng heartbeat)
```

### Bước 4 — Compute New Version

```
Current version: đọc từ ARCHITECTURE.md header "Phiên bản: v<X>.<Y>"
New version:
  - major bump → v<X+1>.0
  - minor bump → v<X>.<Y+1>
```

### Bước 5 — Update Docs

**ARCHITECTURE.md:**
1. Bump version header
2. Update "Latest changes" summary (3-5 bullet points ngắn gọn — CHỈ version hiện tại)
3. Update affected section (pipeline flow / mandatory rules / trigger types / etc.)
4. Thêm row vào "Bài Học Đã Học" table (nếu change từ incident)
> **Lưu ý**: Changelog chi tiết đã tách sang `docs/CHANGELOG.md`. ARCHITECTURE.md chỉ giữ summary ngắn của version mới nhất + link đến CHANGELOG.md.

**CHANGELOG.md:**
1. Prepend new version entry (sau header, trước entry cũ nhất)
2. Format: `## v<version> (<date>) — <R-number>: <title>`
3. Mỗi bullet: `- ✅ **<feature>**: <mô tả chi tiết>`

**README.md:**
1. Bump version header
2. Update pipeline diagram nếu add_phase
3. Update agent table nếu add_agent
4. Update Mandatory Rules nếu add_rule

**AGENTS.md của affected agents:**
1. Thêm/sửa section liên quan đến change
2. Đảm bảo trigger types, output paths, dependencies khớp ARCHITECTURE.md

**HEARTBEAT.md (nếu cần):**
1. Thêm bước mới nếu change yêu cầu heartbeat check thêm

### Bước 6 — Consistency Check (BẮT BUỘC)

Chạy các checks sau:

```
CHECK 1: Agent count
  → agents trong README.md table == agents trong ARCHITECTURE.md table?

CHECK 2: Pipeline steps
  → Số steps trong README diagram ~ ARCHITECTURE pipeline flow?

CHECK 3: Trigger types
  → Mọi trigger type trong AGENTS.md có trong ARCHITECTURE trigger table?

CHECK 4: Version sync
  → README.md version == ARCHITECTURE.md version?

CHECK 5: Mandatory rules numbered
  → Rules đánh số liên tục (Rule 1, 2, 3... không skip)?

CHECK 6: No broken references
  → Mọi file path được mention có tồn tại không?
```

Nếu check FAIL → fix ngay trước khi commit.

### Bước 7 — Commit

```bash
git add README.md docs/ARCHITECTURE.md docs/CHANGELOG.md agents/*/AGENTS.md agents/*/HEARTBEAT.md
git commit -m "docs(workflow): v<version> — <one-line description>

Changes:
- README.md: <what changed>
- ARCHITECTURE.md: <what changed>
- agents/<id>/AGENTS.md: <what changed> (nếu có)

Reason: <root cause / lesson learned>"
```

**Lưu ý:** Commit KHÔNG push (anh sẽ push khi ready).

### Bước 8 — Report

Báo cáo cho human:
```
✅ Workflow docs updated to v<version>
Files changed: <N>
  - README.md ✅
  - docs/ARCHITECTURE.md ✅
  - docs/CHANGELOG.md ✅
  - agents/<id>/AGENTS.md ✅ (nếu có)
Consistency checks: ALL PASS
Commit: <hash> — <message>
```

---

## Ví Dụ Sử Dụng

**Input:**
```
Workflow change: Thêm Tiered Problem Response Protocol
Type: add_rule (+ add_phase trong HEARTBEAT)
Description: Leader detect và handle agent problems theo 4 types (P1-P4) và severity (CRITICAL/HIGH/LOW)
Affected agents: agent_leader, agent_dev, agent_qc1
Version bump: minor (v3.3 → v3.4)
Breaking: false
```

**Output:**
```
ARCHITECTURE.md: thêm "Problem Response Protocol" section, update trigger types, update latest changes summary
CHANGELOG.md: prepend v3.4 entry với chi tiết đầy đủ
README.md: thêm Rule 4 trong Mandatory Rules
agents/agent_leader/AGENTS.md: thêm Part C — Problem Handling
agents/agent_leader/HEARTBEAT.md: thêm Bước 2b — Exec Log Scan
agents/agent_dev/AGENTS.md: thêm section nhận PROBLEM_ANALYSIS_REQUEST
```

---

## Notes

- Skill này là **documentation skill**, không phải code skill
- Không bao giờ sửa code hoặc logic agents — chỉ sửa docs
- Nếu change quá lớn (restructure toàn bộ pipeline) → invoke `brainstorming` skill trước
- Lưu spec của mỗi lần change tại `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
