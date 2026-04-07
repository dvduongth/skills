---
name: create-gdd
description: Quy trình 7 bước tạo GDD → dev-specs → dev-plan cho bất kỳ module CCN2 nào. Dùng khi cần tạo tài liệu thiết kế mới từ concepts folder, từ code hiện có, hoặc từ PM requirements. Bao gồm template prompts copy-paste cho từng step và worktree merge policy.
type: workflow
---

# create-gdd — GDD Pipeline Skill

**Version**: v1.2 (2026-04-06)
**Phạm vi**: Tạo GDD + dev-specs + dev-plan cho một module CCN2 từ đầu đến cuối.

---

## ⚠️ TOP RULES — ĐỌC TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ

### Rule #1: /using-git-nexus cho mọi codebase navigation
**KHÔNG** dùng `grep`, `find`, `ls -r`, `Glob(**/**)` để scan bừa phứa.
Mỗi agent PHẢI đọc skill `/using-git-nexus` trước khi bắt đầu research codebase:
- Path: `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`
- Áp dụng cho: tất cả steps có đọc code (Step 1 ingest, Step 4 resolve gaps, Step 6 dev-specs, Step 7 dev-plan)
- Mục đích: hiểu codebase đúng cách qua git history/structure, không scan random

### Rule #2: Text only — KHÔNG phân tích ảnh
Skip .png, .jpg, .csd, .psd, .pptx, .xlsx hoàn toàn. Chỉ đọc .md, .txt, .json, .gd, .kt.

### Rule #3: Worktree merge sau mỗi step
commit → `git merge --no-ff` vào `dev/godot` → cleanup branch + worktree.

---

## Tổng quan

7-step pipeline tạo tài liệu game từ concepts thô đến dev-plan khả thi:

```
[concepts/ + code]
    ↓ Step 1 (agent_gd) — Ingest
    ↓ Step 2 (agent_gd) — Draft GDD
    ↓ Step 3 (agent_qc1) — Validate v1
    ↓ Step 4 (agent_gd + agent_dev_bz) — Resolve gaps
    ↓ Step 5 (agent_qc1) — QC sign-off → APPROVED
    ↓ Step 6 (agent_dev) — Dev Specs
    ↓ Step 7 (agent_dev) — Dev Plan
[specs/<module>/ + docs/dev/<module>/]
```

---

## Paths Reference

| Loại | Pattern |
|------|---------|
| Concepts input | `shared/concepts/<module>/` |
| Module source (Godot client) | `shared/godot-client/client-ai-godot/modules/<module>/` |
| Module source (server) | `shared/godot-client/server/src/` hoặc `shared/godot-client/server/res/` |
| GDD output | `shared/concepts/<module>/gdd-<module>.md` |
| Dev Specs output | `specs/<module>/dev-specs-<module>.md` |
| Dev Plan output | `docs/dev/<module>/dev-plan-<module>.md` |
| Agent-teams root | `D:\PROJECT\CCN2\agent-teams\` |
| Skills path | `D:\PROJECT\CCN2\agent-teams\.claude\skills\` |

> **QUAN TRỌNG**: Không đọc file ảnh (`.png`, `.jpg`, `.svg`, `.xcf`, `.psd`, `.docx`, `.xlsx`). **Text only.**

---

## Worktree Merge Policy

Mỗi step quan trọng (kết thúc output file) cần commit + merge:

```bash
# Sau khi hoàn thành output file
git add <output-file>
git commit -m "feat(<module>): <step description>"

# Merge vào dev/godot (no fast-forward)
git checkout dev/godot
git merge --no-ff <worktree-branch> -m "Merge <worktree>: <description>"

# Cleanup worktree nếu dùng worktree riêng
git worktree remove <path>
```

**Checkpoint bắt buộc:**
- Sau Step 2: commit GDD draft
- Sau Step 3: commit GDD + Validation Report
- Sau Step 5: commit GDD APPROVED version
- Sau Step 6: commit dev-specs
- Sau Step 7: commit dev-plan

---

## Step 1 — Ingest Concepts (agent_gd)

**Agent**: `agent_gd` (Game Designer)
**Input**: `shared/concepts/<module>/` + `shared/godot-client/client-ai-godot/modules/<module>/`
**Output**: Structured notes (internal, không cần file)

### Template Prompt

```
**BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:** Đọc `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`

Nhiệm vụ: Ingest concepts cho module <MODULE>.

1. List tất cả TEXT files trong `shared/concepts/<module>/`:
   - Bỏ qua: *.png, *.jpg, *.svg, *.docx, *.xlsx, *.xcf, *.psd
   - Đọc: *.md, *.txt, *.json, *.yaml, *.csv

2. List GDScript files trong `shared/godot-client/client-ai-godot/modules/<module>/`:
   - Tìm patterns: signal definitions, enum, class data, func names

3. Từ tất cả sources trên, extract và ghi lại:
   - Screen names / scene names
   - Signal names (emit + connect)
   - Data models (variables, enums, dicts)
   - Server CMDs (command IDs + tên)
   - Game mechanics keywords
   - Economy: currencies + amounts cụ thể

Ghi kết quả extract ra notes. Không tạo file. Bước này chỉ thu thập.
```

---

## Step 2 — Draft GDD (agent_gd)

**Agent**: `agent_gd`
**Input**: Notes từ Step 1 + `shared/config/` JSON files liên quan
**Output**: `shared/concepts/<module>/gdd-<module>.md` — version 1.0

### GDD Structure (bắt buộc đầy đủ 9 sections)

```markdown
# GDD — <Module Name> (CCN2)

**Version:** 1.0
**Date:** <YYYY-MM-DD>
**Status:** DRAFT
**Sources:** `<paths đã ingest>`

---

## 1. Overview
### Concept
### Theme
### Target (người chơi nào dùng feature này)

## 2. Core Mechanics
(luật chơi, flow chính, states, transitions)

## 3. Screens & Flow
(screen names, navigation flow, modal/popup)

## 4. Data Models
(enums, structs, server data shapes)

## 5. Economy
(currencies, costs, rewards — số liệu cụ thể từ config)

## 6. UI/UX Notes
(layout hints, error states)

## 7. Animation & Transition Specs (BẮT BUỘC)
- Screen transitions: enter/exit (loại animation + duration ms)
- Overlay animations: show/hide states
- Error feedback: shake, flash, color change
- Button press states & feedback
- Loading/waiting indicators (spinner, progress)
- Feature-specific: pull result reveal, reward pop, unlock sequence, v.v.
> Rule: Nếu chưa có design spec → ghi "TBD — designer specify trước khi dev implement"
> Rule: Nếu có code thực tế (Tween/AnimationPlayer) → extract từ code luôn

## 8. API Reference
(CMD IDs, request/response shapes, events)

## 9. Known Gaps
(những gì còn mơ hồ, cần PM confirm, cần server investigation)
```

### Template Prompt

```
Nhiệm vụ: Viết GDD draft v1.0 cho module <MODULE>.

Sources đã ingest ở Step 1: [liệt kê]
Config files liên quan: `shared/config/abilities.json`, `shared/config/balance.json`,
hoặc server JSON: `shared/godot-client/server/res/<Module>*.json`

Yêu cầu:
- Viết bằng tiếng Việt
- Dùng số liệu thực từ JSON config, không đoán mò
- Phần "Known Gaps" phải thành thật — liệt kê tất cả chỗ chưa rõ
- Output file: `shared/concepts/<module>/gdd-<module>.md`

Sections bắt buộc (checklist trước khi submit):
- [ ] §1 Overview
- [ ] §2 Core Mechanics
- [ ] §3 Screens & Flow
- [ ] §4 Data Models
- [ ] §5 Economy
- [ ] §6 UI/UX Notes
- [ ] §7 Animation & Transition Specs (xem code thực tế nếu có, nếu không → TBD)
- [ ] §8 API Reference
- [ ] §9 Known Gaps

Sau khi viết xong: đọc lại file để verify. Max 1 retry.
```

---

## Step 3 — Validate v1 (agent_qc1)

**Agent**: `agent_qc1` (BlackboxQC)
**Input**: GDD v1.0 + JSON config files
**Output**: Append `## Validation Report` vào GDD, update version → 1.1

### Validation Checklist

- [ ] Cross-check tất cả số liệu với JSON config (currencies, rates, IDs, limits)
- [ ] Kiểm tra CMD IDs có tồn tại không (so với server events)
- [ ] Section "Economy" đủ costs + rewards cụ thể chưa
- [ ] Screen names khớp với Godot scene names chưa
- [ ] Known Gaps có thiếu gap nào không
- [ ] Signal names theo đúng naming convention chưa

### Template Prompt

```
Nhiệm vụ: Validate GDD v1.0 của module <MODULE>.

GDD file: `shared/concepts/<module>/gdd-<module>.md`
Config để cross-check: [liệt kê JSON files]

Quy trình:
1. Đọc GDD v1.0 toàn bộ
2. Đọc từng config JSON liên quan
3. Cross-check: mọi con số, ID, tên trong GDD phải khớp config
4. Ghi lại tất cả sai lệch (SAI SỐ, THIẾU, MÂU THUẪN)

Sau khi xong:
- Append section vào GDD: `## Validation Report (v1.1 — <date>)`
- Ghi: PASS/FAIL cho từng item
- List: issues cần fix
- Ghi: items cần PM decision (không phải lỗi, nhưng ambiguous)
- Update header: Version → 1.1, Status → VALIDATION_COMPLETE

KHÔNG sửa content GDD. Chỉ append Validation Report.
```

---

## Step 4 — Resolve Open Items

**Agent**: `agent_dev_bz` (server investigation) + `agent_gd` (update GDD)
**Input**: GDD v1.1 + Validation Report
**Output**: GDD v1.2 với Open Items resolved, Known Gaps updated

### 4a — Server Investigation (agent_dev_bz)

```
**BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:** Đọc `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`

Nhiệm vụ: Investigate server-side gaps cho module <MODULE>.

Từ Validation Report trong `shared/concepts/<module>/gdd-<module>.md`:
[paste danh sách gaps cần server investigation]

Cần tìm:
- CMD handlers: tìm trong `shared/godot-client/server/src/`
- Business logic: đọc xử lý server-side
- Config validation: confirm config values được parse đúng không

Output: list findings dạng:
- GAP_ID: <tên gap>
  - Tìm thấy: <file:line>
  - Kết quả: <đã rõ / vẫn cần PM>
  - Nếu rõ: số liệu/behavior cụ thể
```

### 4b — Update GDD (agent_gd)

```
**BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:** Đọc `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`

Nhiệm vụ: Update GDD v1.1 → v1.2 cho module <MODULE>.

File: `shared/concepts/<module>/gdd-<module>.md`
Server findings: [paste từ 4a]
PM decisions: [paste decisions nếu có]

Yêu cầu:
1. Với mỗi gap đã resolved:
   - Update section liên quan với số liệu/behavior đúng
   - Xóa khỏi "Known Gaps"

2. Với gaps vẫn cần PM:
   - Giữ trong "Known Gaps"
   - Đổi label thành "Pre-launch Blocker" hoặc "Post-launch Future"

3. Categories cho Known Gaps:
   - 🔴 Pre-launch Blocker — phải giải quyết trước ship
   - 🟡 Post-launch Future — có thể ship mà không có feature này

4. Update header: Version → 1.2, Status → GAPS_RESOLVED
5. Post-write verify: đọc lại file.
```

---

## Step 5 — QC Final Sign-off (agent_qc1)

**Agent**: `agent_qc1`
**Input**: GDD v1.2
**Output**: GDD v1.3 với verdict APPROVED (hoặc list blocking issues)

### Template Prompt

```
Nhiệm vụ: Final QC sign-off cho GDD module <MODULE>.

File: `shared/concepts/<module>/gdd-<module>.md`

Verify checklist:
1. Tất cả issues từ Validation Report đã được fix chưa?
2. Không còn "Unknown" hoặc "TBD" nào không có label Pre-launch/Post-launch?
3. Tất cả CMD IDs có đủ request + response shape chưa?
4. Section Economy: mọi action đều có cost/reward cụ thể chưa?
5. GDD đủ để agent_dev viết dev-specs không (không cần hỏi thêm)?

Kết quả:
- Nếu PASS toàn bộ:
  - Append: `## QC Sign-off — APPROVED (<date>)`
  - Ghi: "GDD v1.3 APPROVED for /dev-specs"
  - Update header: Version → 1.3, Status → APPROVED for /dev-specs

- Nếu FAIL:
  - List blocking issues cụ thể
  - KHÔNG update status
  - Return về agent_gd để fix
```

---

## Step 6 — Dev Specs (agent_dev)

**Agent**: `agent_dev` (Tech Lead)
**Input**: GDD v1.3 APPROVED
**Output**: `specs/<module>/dev-specs-<module>.md`

### Dev-Specs Structure

```markdown
# Dev Specs — <Module> (CCN2)

**GDD Source:** `shared/concepts/<module>/gdd-<module>.md` v1.3
**Version:** 1.0
**Date:** <YYYY-MM-DD>

---

## 1. Functional Requirements
(numbered list, each req testable)

## 2. Technical Design — Client (Godot)
### Scene Structure
### Key Signals
### State Machine / Flow
### Data Bindings
### Animation Specs
Trích từ GDD §7 Animation & Transition Specs:
- Nếu có spec → list animation name, type (Tween/AnimPlayer), duration, easing
- Nếu TBD → flag: "⚠️ Animation spec needed from designer before this scene can be implemented"

## 3. Technical Design — Server
### New CMDs (nếu có)
### Business Logic Changes
### Config Changes

## 4. Protocol
### Request/Response schemas (JSON)
### Error codes

## 5. Data Models
### Client-side structs/dicts
### Server-side data shapes

## 6. Edge Cases & Error Handling
(list từng case + expected behavior)

## 7. Out of Scope
(explicit list những gì KHÔNG implement ở iteration này)
```

### Template Prompt

```
**BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:** Đọc `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`

Nhiệm vụ: Viết dev-specs cho module <MODULE>.

Input: `shared/concepts/<module>/gdd-<module>.md` (v1.3 APPROVED)

Yêu cầu:
- Viết bằng tiếng Việt
- Mỗi requirement phải testable (pass/fail được)
- Technical design phải dựa trên architecture CCN2 hiện tại:
  - Client: `shared/godot-client/CLAUDE.md` (coding conventions)
  - Server: `shared/godot-client/server/DEVELOPMENT_GUIDE.md`
- Đọc existing module code trước khi design (tránh duplicate)
- Phần "Out of Scope" phải explicit
- Animation specs: trích từ GDD §7 Animation & Transition Specs; nếu TBD thì flag là "animation spec needed before impl"

Output: `specs/<module>/dev-specs-<module>.md`
Post-write verify: đọc lại file.
```

---

## Step 7 — Dev Plan (agent_dev)

**Agent**: `agent_dev`
**Input**: dev-specs v1.0
**Output**: `docs/dev/<module>/dev-plan-<module>.md`

### Dev-Plan Structure

```markdown
# Dev Plan — <Module> (CCN2)

**Specs Source:** `specs/<module>/dev-specs-<module>.md`
**Version:** 1.0
**Date:** <YYYY-MM-DD>

---

## Tasks — agent_dev_bz (Server)

| # | Task | Complexity | Done Criteria |
|---|------|-----------|---------------|
| B1 | ... | S/M/L | ... |

## Tasks — agent_dev_godot (Godot Client)

| # | Task | Complexity | Done Criteria |
|---|------|-----------|---------------|
| G1 | ... | S/M/L | ... |

## Task Order & Dependencies

(diagram hoặc list: task nào phải xong trước task nào)

## Integration Checklist

- [ ] Server CMD handler hoạt động (test với curl/postman)
- [ ] Client gửi đúng CMD + nhận đúng response
- [ ] UI render đúng theo GDD
- [ ] Edge cases đã test
- [ ] Không regression feature cũ

## Complexity Legend
- S: < 2h
- M: 2–8h
- L: > 8h (cần break nhỏ hơn)
```

### Template Prompt

```
**BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:** Đọc `agents/agent_dev_godot/skills/using-git-nexus/SKILL.md`

Nhiệm vụ: Viết dev-plan cho module <MODULE>.

Input: `specs/<module>/dev-specs-<module>.md`

Yêu cầu:
- Task breakdown theo agent (agent_dev_bz vs agent_dev_godot)
- Complexity estimate: S (<2h), M (2-8h), L (>8h — cần split)
- Done criteria cho mỗi task phải verifiable (không phải "implement X")
- Dependencies explicit (task nào phải xong trước task nào)
- Integration checklist cuối phải cover happy path + error cases

Output: `docs/dev/<module>/dev-plan-<module>.md`
Post-write verify: đọc lại file.
```

---

## Quick Start Checklist

Khi bắt đầu pipeline cho `<module>`:

```
[ ] 1. Xác định module name và paths:
       - concepts: shared/concepts/<module>/
       - source: shared/godot-client/client-ai-godot/modules/<module>/
       - server: shared/godot-client/server/res/<Module>*.json

[ ] 2. Tạo worktree mới (nếu chưa có):
       git worktree add .claude/worktrees/<branch> -b claude/<branch>

[ ] 3. Step 1–2 (agent_gd): ingest → draft GDD
       Commit: feat(<module>): GDD draft v1.0

[ ] 4. Step 3 (agent_qc1): validate
       Commit: qc(<module>): GDD validation report v1.1

[ ] 5. Step 4 (agent_dev_bz + agent_gd): resolve gaps
       Commit: fix(<module>): GDD gaps resolved v1.2

[ ] 6. Step 5 (agent_qc1): sign-off
       Commit: qc(<module>): GDD v1.3 QC1 final sign-off — APPROVED for /dev-specs

[ ] 7. Merge vào dev/godot (--no-ff):
       git checkout dev/godot
       git merge --no-ff claude/<branch> -m "Merge claude/<branch>: GDD <module> v1.3 APPROVED"

[ ] 8. Step 6 (agent_dev): dev-specs
       Commit: feat(<module>): dev-specs v1.0

[ ] 9. Step 7 (agent_dev): dev-plan
       Commit: feat(<module>): dev-plan v1.0 from dev-specs

[ ] 10. Final merge vào dev/godot (--no-ff):
        git merge --no-ff claude/<branch> -m "Merge claude/<branch>: dev-specs + dev-plan <module>"
```

---

## Agent Role Summary

| Step | Agent | Quyền đọc | Quyền ghi | Notes |
|------|-------|-----------|-----------|-------|
| 1–2 | `agent_gd` | concepts/, modules/, server/res/ | `shared/concepts/<module>/gdd-*.md` | Dùng /using-git-nexus |
| 3 | `agent_qc1` | GDD, JSON configs | Append vào GDD (Validation Report) | — |
| 4a | `agent_dev_bz` | server/src/, server/res/ | Findings notes (internal) | Dùng /using-git-nexus |
| 4b | `agent_gd` | GDD, findings | Update GDD | Dùng /using-git-nexus |
| 5 | `agent_qc1` | GDD v1.2 | Append sign-off vào GDD | — |
| 6 | `agent_dev` | GDD APPROVED, conventions | `specs/<module>/dev-specs-*.md` | Dùng /using-git-nexus |
| 7 | `agent_dev` | dev-specs | `docs/dev/<module>/dev-plan-*.md` | Dùng /using-git-nexus |

---

## Lưu ý quan trọng

1. **Text only**: Không đọc `.png`, `.jpg`, `.svg`, `.docx`, `.xlsx` — skip silently.
2. **Số liệu từ config**: Không bao giờ đoán mò. Nếu không tìm được trong JSON → ghi vào Known Gaps.
3. **Vietnamese output**: GDD, dev-specs, dev-plan đều viết bằng tiếng Việt.
4. **Post-write verify**: Sau mỗi lần write file → đọc lại → verify. Max 1 retry.
5. **Worktree merge --no-ff**: Bắt buộc `--no-ff` để preserve merge commit trong git history.
6. **agent_qc1 KHÔNG đọc source code**: Chỉ đọc GDD và JSON configs.
