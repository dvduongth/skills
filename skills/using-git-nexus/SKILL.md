---
name: using-git-nexus
description: Thực thi GitNexus — chạy CLI (analyze/setup/wiki/clean/status), tuân thủ pre-edit/post-commit protocol, và rename symbol an toàn với 2-step approval. Dùng khi cần index repo, setup editor, chạy workflow đúng trước/sau khi edit, hoặc rename symbol.
---

# using-git-nexus

**Purpose**: Hướng dẫn human và AI agents **thực thi** GitNexus — CLI actions, workflow protocols, và rename an toàn.

**Version**: v1.0.0 (2026-03-26)
**Companion**: `git-nexus-deep-understanding` (skill 1 — analysis/read-only)
**Spec**: `agent-teams/docs/superpowers/specs/2026-03-26-using-git-nexus-design.md`

---

## Ranh Giới Skill 1 vs Skill 2

| Skill | Dùng khi | Mode |
|-------|----------|------|
| `git-nexus-deep-understanding` | Hiểu / phân tích / architecture / impact là gì | READ only |
| `using-git-nexus` | Làm / chạy / index / rename / workflow | EXECUTE + PROTOCOL |

---

## Triggers

**Nhóm 1 — CLI Actions:**
`"analyze"`, `"index codebase"`, `"re-index"`, `"npx gitnexus"`, `"setup gitnexus"`, `"generate wiki"`, `"generate skills"`, `"clean index"`, `"gitnexus status"`, `"using-git-nexus"`, `"gitnexus analyze"`, `"gitnexus setup"`, `"gitnexus clean"`

**Nhóm 2 — Protocol:**
`"trước khi edit"`, `"trước khi sửa"`, `"sau khi commit"`, `"safe to edit"`, `"gitnexus workflow"`, `"pre-edit check"`, `"post-commit check"`, `"gitnexus protocol"`

**Nhóm 3 — Rename:**
`"rename symbol"`, `"rename function"`, `"đổi tên"`, `"multi-file rename"`, `"gitnexus rename"`, `"rename safely"`

---

## Input

```
action       (optional) — "analyze"|"setup"|"wiki"|"clean"|"status"|"rename"|"protocol"
              auto-detect từ query nếu không chỉ định
repo         (optional) — tên repo hoặc path; default: current dir / D:\PROJECT\CCN2
target       (optional) — symbol name khi action=rename
flags        (optional) — extra flags cho CLI (e.g. "--embeddings", "--force", "--skills")
outputPath   (optional) — lưu output (chỉ dùng với wiki)
```

---

## Bước 1 — Auto-Detect Action

```
Query chứa "rename"/"đổi tên"/"multi-file rename"?
  → action=rename, target=tên symbol

Query chứa "analyze"/"index"/"re-index"/"gitnexus analyze"?
  → action=analyze

Query chứa "setup"/"configure mcp"/"cài gitnexus"?
  → action=setup

Query chứa "status"/"index fresh"/"stale không"?
  → action=status nếu cần spawn CLI để lấy data chính xác nhất (e.g. sau commit)
  → Dùng skill 1 depth=overview nếu chỉ cần quick staleness check từ meta.json

Query chứa "clean"/"xóa index"/"delete index"?
  → action=clean

Query chứa "wiki"/"generate wiki"/"generate docs"?
  → action=wiki

Query chứa "trước khi edit"/"pre-edit"/"safe to edit"/"trước khi sửa"?
  → action=protocol (pre-edit)

Query chứa "sau khi commit"/"post-commit"/"after commit"?
  → action=protocol (post-commit)
```

---

## Bước 2 — Execute Action

### action=analyze

```
Step 1: Xác định repo path
        → Từ `repo` param, hoặc current working dir, hoặc hỏi user
        → CCN2 defaults: D:\PROJECT\CCN2\serverccn2 | D:\PROJECT\CCN2\clientccn2

Step 2: Check GitNexus installed
        → Bash: npx gitnexus --version
        → Nếu lỗi: "GitNexus chưa cài. Chạy: npm install -g gitnexus"

Step 3: ⚠️ Embeddings guard
        → Đọc {repoPath}/.gitnexus/meta.json nếu tồn tại
        → Nếu meta.json có "embeddings: true" → BẮT BUỘC thêm --embeddings vào command
        → Nếu không → tùy chọn (hỏi user nếu muốn semantic search)

Step 4: ⚠️ Check concurrent analyze
        → LadybugDB single-writer: không thể chạy 2 analyze cùng lúc trên cùng repo
        → MCP server read-only — KHÔNG conflict với analyze
        → Nếu có dấu hiệu analyze đang chạy: "⚠️ Chờ analyze hiện tại hoàn thành trước."

Step 5: Bash: npx gitnexus analyze [path] [--force] [--embeddings] [--skills] [--verbose]
        → Xem references/cli-commands.md để biết flags đầy đủ

Step 6: Đọc {repoPath}/.gitnexus/meta.json → lấy stats
        → Output kết quả (xem Output Format bên dưới)
```

### action=setup

```
Step 1: Bash: npx gitnexus setup
        → Auto-detect editors: Claude Code / Cursor / Codex / OpenCode
Step 2: Báo editors đã configure + MCP config path
Step 3: Nhắc: "Restart editor để MCP server active"
Step 4: Hướng dẫn verify: READ gitnexus://repos trong editor mới restart
```

### action=status

```
Step 1: Bash: npx gitnexus status [path]
        → Parse: indexed, lastCommit, currentHead, stale, stats
Step 2: Hiển thị status summary
        → Nếu stale: "Index cần refresh. Chạy: npx gitnexus analyze"
        → Nếu not indexed: "Repo chưa được index. Chạy: npx gitnexus analyze [path]"

Note: Nếu chỉ cần quick status — dùng skill 1 depth=overview (không spawn process).
```

### action=clean

```
Step 1: Bash: npx gitnexus status → lấy index path + size
Step 2: ⛔ CONFIRMATION REQUIRED:
        "⚠️ Sắp xóa index tại {path}/.gitnexus/ ({size}MB). Xác nhận? (y/n)"
        → Nếu n: abort
Step 3: [Sau confirm y] Bash: npx gitnexus clean --force
Step 4: "✅ Index đã xóa. Chạy 'npx gitnexus analyze' để rebuild."

Nếu --all flag:
  → Bash: npx gitnexus list → danh sách tất cả repos
  → Double-confirm: "Sắp xóa index của {N} repos: [list]. Chắc chắn? (y/n)"
  → [Sau confirm] Bash: npx gitnexus clean --all --force
```

### action=wiki

```
Step 1: Check API key
        → Bash: cat ~/.gitnexus/config.json 2>/dev/null | grep apiKey
        → Nếu không có key (file không tồn tại hoặc apiKey rỗng):
          "wiki cần LLM API key. Xem references/cli-commands.md để cài đặt.
           Chạy: npx gitnexus wiki [path] --api-key YOUR_KEY --model gpt-4o"
Step 2: Bash: npx gitnexus wiki [path] --model {model} [--api-key {key}] [--concurrency 3]
Step 3: Báo kết quả: pages created, output path
```

### action=protocol (pre-edit)

```
Step 1: [Invoke: git-nexus-deep-understanding] depth=symbol, target=symbolToEdit, repo=repo
        → Skill 1 tự động gọi context() + impact() khi depth=symbol (theo SKILL.md Bước 2)
        → Lấy blast radius + risk level từ impact() result

Step 2: Evaluate risk:
        CRITICAL/HIGH → "⚠️ {risk} RISK: {N} direct callers.
                         Bạn có chắc muốn edit không? (y/n)"
                         → Nếu y: tiếp tục Step 3
                         → Nếu n: "Edit đã hủy. Index giữ nguyên." — STOP
        MEDIUM        → "🟡 MEDIUM: {N} callers — test kỹ sau khi edit"
        LOW           → "🟢 Safe to proceed"

Step 3: Nếu proceed → nhắc: "Sau khi edit xong, chạy post-commit protocol"
```

### action=protocol (post-commit)

```
Step 1: Bash: git log -1 --format="%H" → lấy HEAD hash
        [MCP tool] detect_changes({scope: "{HEAD_hash}"})
        → Verify chỉ có expected symbols thay đổi

Step 2: Check staleness:
        → Đọc .gitnexus/meta.json → compare lastCommit với git HEAD
        → Nếu stale: "Index cần refresh. Chạy: npx gitnexus analyze"

Step 3: Báo verdict:
        "✅ Scope đúng như dự kiến" hoặc "⚠️ Unexpected changes: [list]"
```

### action=rename

Xem `references/rename-workflow.md` để biết full protocol. Tóm tắt:

```
Step 1: [Invoke: git-nexus-deep-understanding] context({name: target}) → verify symbol tồn tại
        → Nếu không tìm thấy: "Dùng git-nexus-deep-understanding query('{target}') để tìm đúng tên"
        → Nếu nhiều symbols cùng tên: hiển thị danh sách (file, type, cluster) → hỏi user chọn đúng symbol

Step 2: rename({symbol_name: old, new_name: new, dry_run: true})
        → Hiển thị preview: N files, danh sách edits + line numbers

Step 3: ⛔ DỪNG — Hỏi human approval:
        "Rename '{old}' → '{new}' sẽ thay đổi {N} files. Xác nhận apply? (y/n)"
        → Nếu n: abort hoàn toàn

Step 4: [Sau confirm y]
        rename({symbol_name: old, new_name: new, dry_run: false})

Step 5: detect_changes({scope: "unstaged"}) → verify scope đúng

Step 6: "✅ Rename hoàn thành — {N} files đã update"
        → "Review changes trước khi commit"
```

---

## Bước 3 — Output Format

### analyze
```markdown
## ✅ GitNexus Analysis Complete — {repo_name}

| Metric | Value |
|--------|-------|
| Nodes | {nodes} |
| Edges | {edges} |
| Communities | {communities} |
| Processes | {processes} |
| Duration | {duration}s |
| Embeddings | ✅ Có / ❌ Không |

**Index path**: `{path}/.gitnexus/`
{⚠️ Nếu --embeddings bị thiếu mà meta cũ có embeddings: "Semantic search bị mất. Re-analyze với --embeddings."}
```

### status
```markdown
## 📊 GitNexus Status — {repo_name}

**Index**: ✅ Fresh / ⚠️ Stale / ❌ Not indexed
**Last indexed commit**: `{hash_short}`
**Current HEAD**: `{hash_short}`
{Nếu stale: "→ Chạy: `npx gitnexus analyze` để refresh"}
```

### pre-edit protocol
```markdown
## 🛡️ Pre-Edit Check — `{symbol}`

**Risk**: 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW
**Direct callers (d=1)**: {N}
**Affected processes**: {N}
**Verdict**: {Tiến hành / Cần confirmation / DỪNG LẠI}
```

### rename dry-run
```markdown
## 🔄 Rename Preview — `{old}` → `{new}`

**Files sẽ thay đổi**: {N}

| File | Lines |
|------|-------|
| `{file1}` | {line1}, {line2} |
| `{file2}` | {line3} |

⛔ **Chưa apply.** Xác nhận thực hiện rename? (y/n)
```

### clean
```markdown
## ✅ Index Đã Xóa — {repo_name}

**Path**: `{path}/.gitnexus/`
→ Rebuild: `npx gitnexus analyze {path}`
```

### rename (post-apply)
```markdown
## ✅ Rename Complete — `{old}` → `{new}`

**Files đã update**: {N}
**Scope**: ✅ Đúng như preview

→ Review: `git diff`
→ Run tests trước khi commit
```

---

## Guardrails Bắt Buộc

```
❌ NEVER rename với blind find-and-replace → luôn dùng rename MCP tool
❌ NEVER ignore HIGH/CRITICAL risk → luôn chờ human confirmation
❌ NEVER chạy 2 analyze cùng lúc trên cùng repo (LadybugDB single-writer — MCP server read-only không conflict)
❌ NEVER drop --embeddings nếu meta.json cũ có "embeddings: true"
❌ NEVER apply rename mà không có dry_run preview + human approval trước
✅ ALWAYS dry_run: true trước rename apply
✅ ALWAYS detect_changes sau mỗi rename batch
✅ ALWAYS check meta.json trước analyze để biết có cần --embeddings không
```

---

## Graceful Degradation

| Tình huống | Xử lý |
|-----------|-------|
| GitNexus không install | `"npm install -g gitnexus"` |
| Concurrent analyze (lock) | "Chờ analyze hiện tại xong trước" |
| wiki thiếu API key | Hướng dẫn `--api-key` hoặc `~/.gitnexus/config.json` |
| rename: symbol không tìm thấy | Suggest skill 1 `query` để tìm đúng tên |
| clean --all | Double-confirm với danh sách repos |
| repo không phải git | Hướng dẫn `--skip-git` flag |
| Node < 20 | "GitNexus cần Node.js >= 20. Version hiện tại: {version}" |

---

## Reference Files

- **CLI commands**: `references/cli-commands.md` — full flags + gotchas cho 5 commands
- **Rename workflow**: `references/rename-workflow.md` — 2-step protocol chi tiết

---

*Skill created: 2026-03-26*
*Spec: agent-teams/docs/superpowers/specs/2026-03-26-using-git-nexus-design.md*
