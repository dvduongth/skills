# GitNexus CLI Commands Reference

*Full flags + gotchas cho 5 commands trong skill `using-git-nexus`.*
*Source: GitNexus v1.4.8 CLI — `npx gitnexus --help`*

---

## `analyze` — Index Repository

```bash
npx gitnexus analyze [path]
```

**Flags:**
| Flag | Default | Mô tả |
|------|---------|-------|
| `--force` / `-f` | false | Re-index hoàn toàn dù chưa stale |
| `--embeddings` | false | Enable semantic search vectors (ONNX) |
| `--skills` | false | Generate SKILL.md per community |
| `--skip-git` | false | Index folder không có .git |
| `--verbose` / `-v` | false | Show chi tiết warnings trong quá trình index |

**Environment variables:**
```bash
GITNEXUS_NO_GITIGNORE=1  # Skip .gitignore parsing (vẫn đọc .gitnexusignore)
```

**CCN2 Examples:**
```bash
# Index server lần đầu
npx gitnexus analyze D:\PROJECT\CCN2\serverccn2

# Re-index với embeddings (quan trọng nếu đã có embeddings trước)
npx gitnexus analyze D:\PROJECT\CCN2\serverccn2 --embeddings

# Index + generate skill files cho agents
npx gitnexus analyze D:\PROJECT\CCN2\serverccn2 --skills

# Force rebuild toàn bộ
npx gitnexus analyze D:\PROJECT\CCN2\clientccn2 --force --embeddings
```

**⚠️ Gotchas:**
- **Memory**: Cần ~8GB heap cho large repos — Node tự re-spawn với `--max-old-space-size=8192`
- **Embeddings persistence**: Nếu meta.json có `"embeddings": true`, LUÔN pass `--embeddings` khi re-analyze. Nếu quên flag này, embeddings cũ sẽ bị XÓA hoàn toàn — cần re-analyze với `--embeddings` để khôi phục.
- **Single-writer**: Không chạy 2 `analyze` cùng lúc trên cùng repo (LadybugDB lock). MCP server read-only — không bị ảnh hưởng.
- **Duration**: Small repo (<500 files) ~30s, medium (~2000 files) ~2-5min, large needs patience

---

## `setup` — Configure MCP for Editors

```bash
npx gitnexus setup
```

**Không có flags.** Auto-detect và configure cho:
- Claude Code (`~/.claude/claude_desktop_config.json`)
- Cursor (`.cursor/mcp.json`)
- OpenCode (`~/.opencode/config.json`)
- Codex
- **Editors không trong list**: GitNexus không auto-configure. Thêm MCP server thủ công theo docs của editor đó.

**Verify sau setup:**
```
READ gitnexus://repos  # Trong editor đã restart
```

**Note**: Chạy một lần duy nhất per editor. Re-run an toàn nếu cần update config.

---

## `status` — Check Index Freshness

```bash
npx gitnexus status [path]
```

**Không có flags.**

**Output:**
```
Repo: serverccn2 (D:\PROJECT\CCN2\serverccn2)
Status: ✅ Fresh
Indexed commit: abc1234
Current HEAD:   abc1234
Nodes: 1247 | Edges: 3891 | Communities: 12 | Processes: 89
Embeddings: ✅
```

**Khi nào dùng**: Sau commit, hoặc khi nghi ngờ index stale. Nhanh hơn: dùng skill `git-nexus-deep-understanding` depth=overview (không spawn process).

---

## `clean` — Delete Index

```bash
npx gitnexus clean [path]
```

**Flags:**
| Flag | Mô tả |
|------|-------|
| `--force` / `-f` | Skip confirmation prompt |
| `--all` | Clean tất cả indexed repos |

**⚠️ Destructive** — luôn hỏi user trước khi chạy. Sau khi clean cần re-analyze.

**CCN2 Examples:**
```bash
# Xóa index của serverccn2
npx gitnexus clean D:\PROJECT\CCN2\serverccn2 --force

# Xóa TẤT CẢ repos (double-confirm required)
npx gitnexus clean --all --force
```

---

## `wiki` — Generate Repository Wiki

```bash
npx gitnexus wiki [path]
```

**Flags:**
| Flag | Default | Mô tả |
|------|---------|-------|
| `--force` / `-f` | false | Regenerate toàn bộ dù chưa stale |
| `--provider` | openai | LLM provider: `openai` hoặc `cursor` |
| `--model` | (auto) | Model name (e.g. `gpt-4o`, `claude-3-5-sonnet`) |
| `--base-url` | (auto) | Custom API base URL |
| `--api-key` | (saved) | LLM API key — saved to `~/.gitnexus/config.json` |
| `--concurrency` | 3 | Parallel LLM calls |
| `--gist` | false | Publish wiki as public GitHub Gist |
| `--review` | false | Pause sau grouping để review structure |
| `--verbose` / `-v` | false | Show LLM commands và responses |

**Setup API key (lần đầu):**
```bash
npx gitnexus wiki D:\PROJECT\CCN2\serverccn2 --api-key sk-... --model gpt-4o
# Key được save vào ~/.gitnexus/config.json cho lần sau
# ⚠️ Key lưu dưới dạng plaintext — KHÔNG commit ~/.gitnexus/ lên version control
```

**CCN2 Example:**
```bash
npx gitnexus wiki D:\PROJECT\CCN2\serverccn2 --model gpt-4o --concurrency 5
```

**Note**: Wiki dùng LLM API — có chi phí. `--review` flag hữu ích để kiểm tra structure trước khi generate full.

---

## Common Gotchas Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Analyze fail với heap error | Repo quá lớn | Node tự xử lý; nếu fail thêm `NODE_OPTIONS=--max-old-space-size=8192` |
| Embeddings biến mất sau re-analyze | Quên `--embeddings` flag | Luôn check meta.json trước analyze |
| MCP không thấy repo | Setup chưa chạy hoặc editor chưa restart | `npx gitnexus setup` → restart editor |
| analyze timeout | Network/disk slow | Bình thường — chờ hoàn thành |
| Windows SessionStart hook không chạy | Claude Code bug trên Windows | Known issue — không fix được từ phía user |
| tree-sitter-kotlin build fail | Thiếu python3/make/g++ | Cài build tools: `npm install --global windows-build-tools` |

---

*Last updated: 2026-03-26 | Source: GitNexus v1.4.8*
