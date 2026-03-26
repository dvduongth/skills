# Rename Workflow — using-git-nexus

*Protocol 2-step an toàn cho rename symbol với human approval gate.*
*GitNexus `rename` MCP tool — không có CLI equivalent.*

---

## Tại Sao Không Dùng Find-and-Replace?

Find-and-replace chỉ match text — không hiểu:
- Scope: rename `user` trong `UserService` vs local variable `user`
- Comments vs code: sẽ rename trong comments không cần thiết
- Overloads: methods cùng tên trong classes khác nhau

GitNexus `rename` tool dùng knowledge graph để chỉ rename **đúng symbol** và **đúng references**.

---

## Full Protocol (6 Steps)

### Step 1 — Verify Symbol Tồn Tại

```
[GỌI skill 1] depth=symbol, target={oldName}
```

Verify:
- Symbol tồn tại trong graph
- Xác nhận đúng symbol (file, type, cluster)
- Nếu nhiều symbols cùng tên → dùng `uid` param để disambiguate

**Nếu không tìm thấy:**
```
"Không tìm thấy '{oldName}'. Thử:
 → skill 1 query('{oldName}') để tìm gần đúng
 → skill 1 context({uid: '...'}) nếu biết UID"
```

**Nếu vẫn không tìm thấy sau 2 lần thử → ABORT workflow. Không tiếp tục sang Step 2.**

---

### Step 2 — Dry Run Preview

```
rename({
  symbol_name: "{oldName}",
  new_name: "{newName}",
  dry_run: true
})
```

**Output format từ tool:**
```json
{
  "changes": [
    { "file": "src/game/GameRoom.kt", "line": 42, "old": "oldName", "new": "newName" },
    { "file": "src/game/GameRoom.kt", "line": 87, "old": "oldName()", "new": "newName()" },
    { "file": "src/api/Handler.kt", "line": 15, "old": "oldName", "new": "newName" }
  ],
  "total_files": 3,
  "total_changes": 3,
  "confidence": 0.97
}
```

**Hiển thị cho user:**
```markdown
## 🔄 Rename Preview — `{oldName}` → `{newName}`

**Files sẽ thay đổi**: {N}
**Confidence**: {confidence * 100}%

| File | Line | Change |
|------|------|--------|
| `{file1}` | {line} | `{old}` → `{new}` |
| `{file2}` | {line} | `{old}` → `{new}` |
```

---

### Step 3 — ⛔ Human Approval Gate

**BẮT BUỘC DỪNG** — không tự động apply.

```
⛔ Rename '{oldName}' → '{newName}' sẽ thay đổi {N} files ({confidence*100}% confidence).

Xác nhận apply? (y/n)
```

**Logic gate (binary — không có exception):**
- Response ∈ {'y', 'yes'} → tiếp tục Step 4
- Response ∈ tất cả trường hợp khác (n, no, cancel, không, im lặng) → **ABORT hoàn toàn — không tiếp tục**

---

### Step 4 — Apply Rename

```
rename({
  symbol_name: "{oldName}",
  new_name: "{newName}",
  dry_run: false
})
```

**Sau khi apply:**
```
"✅ Rename đang được apply vào {N} files..."
→ Nếu repo dùng compiled language (Kotlin/Java): verify với `./gradlew build` sau khi apply
```

---

### Step 5 — Verify Scope

```
detect_changes({scope: "unstaged"})
```

Verify:
- Chỉ có files từ dry-run preview thay đổi
- Không có unexpected files bị modify

**Nếu có unexpected changes:**
```
⚠️ Phát hiện thay đổi không mong đợi ở: [files]
→ ABORT — rollback ngay: git checkout -- <unexpected-files>
→ Báo user: danh sách files bị ảnh hưởng + yêu cầu review thủ công trước khi thử lại
```

---

### Step 6 — Báo Kết Quả

```markdown
## ✅ Rename Complete — `{oldName}` → `{newName}`

**Files đã update**: {N}
**Scope**: ✅ Đúng như preview

→ Review changes: `git diff`
→ Run tests nếu có
→ Commit khi đã verify
```

---

## Edge Cases

### Symbol Không Unique (Multiple Matches)

Nếu `rename` tool báo multiple matches:
```
"Tìm thấy {N} symbols tên '{oldName}':
 1. {file1}:{line} — {type} trong cluster {cluster}
 2. {file2}:{line} — {type} trong cluster {cluster}

Dùng uid để chọn đúng:
 → rename({uid: '{uid1}', new_name: '{newName}', dry_run: true})"
```

Lấy UID từ skill 1: `context({name: '{oldName}', file: '{file}'})` → field `symbol.uid`

---

### Confidence Thấp (<0.8)

```
"⚠️ Confidence thấp ({confidence*100}%). Graph có thể thiếu references vì:
 - Index stale → chạy 'npx gitnexus analyze' trước
 - Dynamic dispatch / reflection không trace được

 Review preview kỹ hơn trước khi confirm."
```

---

### Khi KHÔNG Nên Dùng rename Tool

| Tình huống | Dùng gì thay thế |
|-----------|-----------------|
| Rename file (không phải symbol) | `mv` / IDE rename file |
| Rename folder/package | IDE refactor hoặc manual |
| Rename trong comment/string | Manual hoặc IDE find-and-replace |
| Rename symbol trong generated code | Edit template, không phải output |

---

## Post-Rename Checklist

- [ ] `git diff` — review tất cả changes
- [ ] Run tests nếu có: `./gradlew test` (server) hoặc `npm test` (client)
- [ ] Check compiler errors: `./gradlew build` (Kotlin)
- [ ] `detect_changes({scope: "unstaged"})` — verify scope sạch
- [ ] Commit với message rõ ràng: `refactor: rename {old} to {new}`

---

*Last updated: 2026-03-26 | Source: GitNexus v1.4.8 rename tool*
