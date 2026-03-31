---
name: workflow-docs-updater
description: "Tự động hóa cập nhật docs khi workflow thay đổi. Dùng khi: thêm phase/rule/agent mới, sửa pipeline flow, thêm trigger type, bump version, patch AGENTS.md. Đảm bảo README.md, docs/ARCHITECTURE.md, docs/CHANGELOG.md, agents/*/AGENTS.md, agents/*/HEARTBEAT.md nhất quán sau mỗi thay đổi workflow."
version: "2.0"
updated: "2026-03-31"
---

# Workflow Docs Updater Skill

Tự động cập nhật và đồng bộ tất cả tài liệu pipeline khi có thay đổi workflow.

## Khi Nào Dùng

- Thêm phase/step mới vào pipeline
- Thêm mandatory rule mới
- Thêm/xóa agent
- Thêm trigger type mới
- Thay đổi gate logic
- **Patch AGENTS.md workflow steps** (thêm/sửa/xóa steps)
- **Integrate nội dung từ REFERENCE.md vào AGENTS.md** (fix "dead documentation" pattern)
- Bất kỳ thay đổi nào ảnh hưởng đến workflow của ≥2 agents

## Trigger Keywords

- "cập nhật workflow", "update workflow", "thêm rule", "thêm phase"
- "workflow docs", "update docs", "sync docs"
- "pipeline changed", "new rule", "new agent"
- "patch AGENTS.md", "fix dead documentation", "integrate REFERENCE.md"

---

## Checklist Bắt Buộc

Thực hiện theo thứ tự:

### Bước 1 — Parse Change

```
Xác định:
  change_type: add_phase | remove_phase | add_rule | modify_rule | add_agent | add_trigger | add_gate_logic | patch_workflow | integrate_reference
  description: mô tả ngắn (1 dòng)
  version_bump: major | minor (major = pipeline restructure, minor = thêm rule/phase/patch)
  affected_agents: [list agent_id]
  breaking: true | false
  root_cause: (nếu change từ incident/audit — mô tả vấn đề gốc)
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
| `patch_workflow` | AGENTS.md của affected agents, CHANGELOG.md, ARCHITECTURE.md (latest changes + lesson learned nếu từ incident) |
| `integrate_reference` | AGENTS.md của affected agents (thêm pointers), ARCHITECTURE.md (file structure nếu REFERENCE.md mới), CHANGELOG.md |

**Luôn update:**
- `docs/CHANGELOG.md` — prepend new version entry
- `docs/ARCHITECTURE.md` — bump version + latest changes summary
- `plans/YYYY-MM-DD-<topic>.md` — lưu lịch sử kế hoạch (nếu change đủ lớn)

### Bước 3 — Load Current Docs

```
Đọc:
  - README.md (version header)
  - docs/ARCHITECTURE.md (version header + affected sections)
  - docs/CHANGELOG.md (latest version entry — prepend new entry tại đây)
  - agents/<affected_id>/AGENTS.md (cho mỗi agent affected)
  - agents/<affected_id>/REFERENCE.md (nếu change liên quan — kiểm tra content cần integrate)
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
3. Update affected section (pipeline flow / mandatory rules / trigger types / file structure / etc.)
4. Thêm row vào "Bài Học Đã Học" table (nếu change từ incident/audit)
> **Lưu ý**: Changelog chi tiết đã tách sang `docs/CHANGELOG.md`. ARCHITECTURE.md chỉ giữ summary ngắn của version mới nhất + link đến CHANGELOG.md.

**CHANGELOG.md:**
1. Prepend new version entry (sau header, trước entry cũ nhất)
2. Format: `## v<version> (<date>) — R<number>: <title>`
3. Mỗi bullet: `- ✅ **<feature>**: <mô tả chi tiết>`
4. Bao gồm root cause nếu change từ incident
5. List ALL affected agents với severity (HIGH/MEDIUM/LOW)

**README.md:**
1. Bump version header
2. Update pipeline diagram nếu add_phase
3. Update agent table nếu add_agent
4. Update Mandatory Rules nếu add_rule

**AGENTS.md của affected agents:**
1. Thêm/sửa section liên quan đến change
2. Đảm bảo trigger types, output paths, dependencies khớp ARCHITECTURE.md
3. **Nếu integrate_reference**: thêm explicit pointer tại đúng workflow step
   - Format: `# → Xem REFERENCE.md Section "<tên section>" cho <mục đích>`
   - KHÔNG copy content — chỉ pointer + tóm tắt 1 dòng

**HEARTBEAT.md (nếu cần):**
1. Thêm bước mới nếu change yêu cầu heartbeat check thêm

**plans/<date>-<topic>.md (nếu change đủ lớn — ≥3 agents affected):**
1. Tạo plan file lưu lịch sử: bối cảnh, root cause, scope, giải pháp, lesson learned
2. Format: xem ví dụ tại `plans/2026-03-31-reference-md-integration-fix.md`

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

CHECK 7: REFERENCE.md ↔ AGENTS.md alignment (NEW v2.0)
  → Mọi actionable content trong REFERENCE.md có pointer trong AGENTS.md?
  → Không có "dead documentation" — content chỉ tồn tại trong REFERENCE.md mà AGENTS.md không reference?
```

Nếu check FAIL → fix ngay trước khi commit.

### Bước 7 — Commit

```bash
git add README.md docs/ARCHITECTURE.md docs/CHANGELOG.md agents/*/AGENTS.md agents/*/HEARTBEAT.md plans/*.md
git commit -m "docs(workflow): v<version> — <one-line description>

Changes:
- README.md: <what changed>
- ARCHITECTURE.md: <what changed>
- CHANGELOG.md: <what changed>
- agents/<id>/AGENTS.md: <what changed> (nếu có)
- plans/<file>: <what changed> (nếu có)

Reason: <root cause / lesson learned>"
```

**Lưu ý:** Commit KHÔNG push (Human sẽ push khi ready).

### Bước 8 — Report

Báo cáo cho human:
```
✅ Workflow docs updated to v<version>
Files changed: <N>
  - README.md ✅
  - docs/ARCHITECTURE.md ✅
  - docs/CHANGELOG.md ✅
  - agents/<id>/AGENTS.md ✅ (nếu có)
  - plans/<file>.md ✅ (nếu có)
Consistency checks: ALL PASS (hoặc list FAIL nếu có)
Commit: <hash> — <message>
```

---

## REFERENCE.md ↔ AGENTS.md Integration Pattern (v2.0)

### Vấn đề: "Dead Documentation"

```
Triệu chứng: REFERENCE.md docs đầy đủ, content chất lượng, nhưng agents không dùng
Root cause:  AGENTS.md (instruction file) không có pointer đến REFERENCE.md (knowledge source)
             Agent chỉ follow AGENTS.md step-by-step
             → nếu step không nói "đọc REFERENCE.md" thì agent KHÔNG đọc
Ảnh hưởng:   100% hit rate — mọi agent có REFERENCE.md đều bị
```

### Nguyên tắc fix

1. **REFERENCE.md = WHERE** to find knowledge (paths, checklists, tool docs, examples)
2. **AGENTS.md = WHEN** to use that knowledge (workflow step + condition)
3. **Mọi actionable REFERENCE.md content PHẢI có pointer trong AGENTS.md**
4. **Pointer format**: tại đúng workflow step, thêm comment/instruction dẫn đến REFERENCE.md section cụ thể
5. **KHÔNG copy content** — chỉ pointer. REFERENCE.md là single source of truth.

### Kiểm tra khi thêm nội dung vào REFERENCE.md

Mỗi khi human hoặc agent thêm content vào REFERENCE.md, kiểm tra:

```
□ Content này actionable? (checklists, tool commands, paths, procedures)
  → YES: PHẢI thêm pointer trong AGENTS.md tại step phù hợp
  → NO (pure reference/background): Không cần pointer

□ Pointer đã thêm vào đúng step?
  → Checklist → Self-eval / Verify step
  → Tool commands → Pre-validate / Execute step
  → Design docs → Read inputs step
  → Knowledge packs → Before coding step
```

### Fallback pattern cho tools (MCP, etc.)

```
# Trước khi [action] — kiểm tra [tool] available
[tool] status
# Nếu RUNNING → dùng [tool commands from REFERENCE.md]
# Nếu không → fallback [existing method] (không block)
```

---

## Ví Dụ Sử Dụng

### Ví dụ 1: Thêm rule mới

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

### Ví dụ 2: Integrate REFERENCE.md vào AGENTS.md (v2.0)

**Input:**
```
Workflow change: REFERENCE.md Integration Fix
Type: integrate_reference
Description: Patch 5 agents — MCP tools, server checklists, design docs, knowledge packs
Root cause: agent_leader report godot-mcp gap → audit → "dead documentation" pattern ở 5/5 agents
Affected agents: agent_playtest, agent_dev_godot, agent_qc2, agent_dev_bz, agent_qc1
Version bump: minor (v3.13 → v3.14)
Breaking: false
```

**Output:**
```
agents/agent_playtest/AGENTS.md: Step 6a — 3 paths (MCP/headless/BLOCKED)
agents/agent_dev_godot/AGENTS.md: Step 4c + Step 5b-pre (MCP verify)
agents/agent_qc2/AGENTS.md: Part A2-pre + Part B-pre (MCP static analysis)
agents/agent_dev_bz/AGENTS.md: Step 4a (checklist) + Step 4b (knowledge) + Step 8b (KB update)
agents/agent_qc1/AGENTS.md: Part A Step 3b (design docs) + Part 0 Step 2b (visual specs)
ARCHITECTURE.md: v3.14 + file structure update + lesson learned
CHANGELOG.md: v3.14 R36 full detail
plans/2026-03-31-reference-md-integration-fix.md: history + root cause + patches
```

---

## Notes

- Skill này là **documentation skill**, không phải code skill
- Không bao giờ sửa code hoặc logic agents — chỉ sửa docs
- Nếu change quá lớn (restructure toàn bộ pipeline) → invoke `brainstorming` skill trước
- Lưu spec của mỗi lần change tại `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- **Plan files** tại `plans/YYYY-MM-DD-<topic>.md` — lưu lịch sử decisions, root cause, lesson learned
- **Lesson Learned PHẢI ghi** vào ARCHITECTURE.md "Bài Học Đã Học" table khi change từ incident/audit

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-03-25 | Initial skill — 8 bước cơ bản |
| v2.0 | 2026-03-31 | Thêm: `patch_workflow` + `integrate_reference` change types, CHECK 7 (REFERENCE↔AGENTS alignment), "Dead Documentation" pattern + fix guide, plans/ history tracking, CHANGELOG.md explicit step, root_cause trong parse, fallback pattern cho tools |
