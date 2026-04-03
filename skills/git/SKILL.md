---
name: git
description: Use when user invokes /git with a subcommand: cm, cmr, p, cp, pr, sync, branch, help.
---

# Git Workflow

## Cách dùng

```
/git <subcommand>
```

## Commands

| Lệnh | Chức năng |
|------|-----------|
| `/git cm` | sinh message → commit thẳng (không hỏi) |
| `/git cmr` | đề xuất message → chờ user approve → commit |
| `/git p` | push branch hiện tại lên remote |
| `/git cp` | sinh message → commit → push (không hỏi) |
| `/git pr` | tạo PR từ branch hiện tại → `production` |
| `/git sync` | pull latest từ remote, báo conflict nếu có |
| `/git branch` | tạo feature branch mới từ `dev` |
| `/git help` | hiển thị bảng này |

---

## /git cm

```
git status + git diff
  → sinh conventional commit message
  → git commit thẳng (show message sau khi commit xong)
```

## /git cmr

```
git status + git diff
  → đề xuất conventional commit message
  → chờ user approve/edit
  → git commit
```

## /git cp

```
git status + git diff
  → sinh conventional commit message
  → git commit → git push thẳng (không hỏi)
```

**Conventional commit format:**
```
<type>(<scope>): <description>
```

| Type | Khi nào |
|------|---------|
| `feat` | tính năng mới |
| `fix` | sửa bug |
| `art` | thay đổi assets (PNG, CSD, JSON res) |
| `refactor` | tái cấu trúc, không đổi behavior |
| `docs` | tài liệu |
| `chore` | config, build |

**Scopes:** `board` · `hud` · `map` · `api` · `ui` · `anim` · `tile` · `scene` · `config`

**Rules:**
- Không dùng `git add -A` blindly — kiểm tra staged files trước
- Commit message phải ngắn gọn, tập trung vào **change lớn/quan trọng**
- Nếu commit **nhỏ** (vài file): có thể đề cập cả change nhỏ
- Nếu commit **lớn** (nhiều file): chỉ tóm tắt change chính, bỏ qua chi tiết nhỏ (resize ảnh, tweak nhỏ, rename file...)

---

## /git-push

Push branch hiện tại. Nếu chưa có upstream → dùng `git push -u origin <branch>`.
Nếu bị reject do upstream changes → gợi ý chạy `/git-sync` trước.
Không bao giờ force push trừ khi user yêu cầu rõ ràng.

---

## /git-pr

Tạo PR từ branch hiện tại → `production`:

1. `git log production..HEAD --oneline` — xem commits sẽ vào PR
2. Sinh title (< 70 chars) và body từ commit history
3. `gh pr create --base production --head <branch> --title "..." --body "..."`
4. Trả về PR URL

**Body format:**
```markdown
## Changes
- feat: ...
- fix: ...
- art: ...
```

Nếu PR đã tồn tại → show URL cũ, không tạo mới.

---

## /git-sync

1. Nếu có uncommitted changes → hỏi có muốn `git stash` trước không
2. `git fetch origin && git pull origin <branch>`
3. Conflict → liệt kê file conflict, dừng lại, không tự resolve

---

## /git-branch

Tạo branch từ `dev`:

1. Hỏi type + mô tả ngắn (nếu chưa có trong argument)
2. Đề xuất tên: `<type>/<short-description>` (kebab-case)
3. Confirm → `git checkout dev && git pull origin dev && git checkout -b <branch>`

**Ví dụ:** `feat/board-animation`, `fix/hud-turn-indicator`, `art/board-fx-update`
