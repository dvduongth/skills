# Progress Tracker — WAVE_PROGRESS.md Format Specification

Specification đầy đủ cho format file WAVE_PROGRESS.md và status icons.

---

## Status Icons

| Icon | Nghĩa | Khi dùng |
|------|-------|----------|
| ⬜ | Chưa bắt đầu | Task chưa được dispatch |
| 🔄 | Đang chạy | Task đã dispatch, đang xử lý |
| ✅ | Hoàn thành | Task hoàn thành thành công |
| 🟢 | Milestone đạt | Milestone hoặc phase lớn hoàn thành |
| ⚠️ | Cần chú ý | Có vấn đề cần review |
| ❌ | Thất bại | Task thất bại, cần retry |

---

## WAVE_PROGRESS.md Format

```markdown
# {PROJECT_NAME} Analysis — Wave Progress Tracker

**Project**: {Project Description}
**Start Date**: {YYYY-MM-DD}
**Target Completion**: {YYYY-MM-DD}

---

## Wave {N}: {Wave Theme}
- **Subagent**: Agent-Wave{N} ({agent_id})
- **Documents**: {doc_range} ({doc_names})
- **Status**: {icon} {STATUS}
- **Output**: `{output_filename}` ({lines} lines)
- **Quality**: {stars} {score}/5 — {description}
- **Actual Tokens**: ~{N}k
- **Completion**: {YYYY-MM-DD HH:MM}

## Wave {N+1}: {Wave Theme}
...

---

## Review Phase
- **Status**: {icon} {STATUS} ({timestamp})
- **Task**: {description}
- **Output**: {output}

---

## Synthesis Phase
- **Status**: {icon} {STATUS} ({timestamp})
- **Output**: `{report_filename}` ({word_count}+ words)
- **Contents**: {description}
- **Quality**: {stars}

---

## Completed Milestones
- {icon} {YYYY-MM-DD HH:MM} — {Milestone description}
- {icon} {YYYY-MM-DD HH:MM} — {Milestone description}
...
```

---

## Wave Status Update Format

Khi update một wave từ 🔄 → ✅:

```markdown
## Wave {N}: {Theme}
- **Subagent**: Agent-Wave{N} ({agent_id})
- **Documents**: {doc_range} ({doc_names})
- **Status**: ✅ COMPLETE
- **Output**: `wave{N}_summary.md` ({lines} lines)
- **Quality**: ⭐⭐⭐⭐ {score}/5 — {quality_description}
- **Actual Tokens**: ~{N}k
- **Completion**: {YYYY-MM-DD HH:MM}
```

---

## Milestone Log Format

Thêm vào cuối section "Completed Milestones" sau mỗi bước:

```
- ✅ {YYYY-MM-DD HH:MM} — {Action completed}
  - Wave {N} ({agent_id}): {theme} → ✅ COMPLETE {HH:MM} ({details})
```

---

## Quality Rating Scale

| Stars | Score | Description |
|-------|-------|-------------|
| ⭐ | 1/5 | Rất kém — thiếu nhiều nội dung quan trọng |
| ⭐⭐ | 2/5 | Kém — có nội dung nhưng thiếu depth |
| ⭐⭐⭐ | 3/5 | Trung bình — đủ dùng, có thể cải thiện |
| ⭐⭐⭐⭐ | 4/5 | Tốt — đầy đủ, có giá trị |
| ⭐⭐⭐⭐⭐ | 5/5 | Xuất sắc — vượt kỳ vọng |

---

## Final Summary Block Format

Khi project complete, thêm block này:

```markdown
- ✅ {YYYY-MM-DD HH:MM} — **PROJECT COMPLETE** — All {N} waves + review + synthesis finished
  - **Deliverables**: {N} wave summaries + {N} master reports + tracking files
  - **Total findings**: {N}+ consolidated
  - **Patterns identified**: {N} production patterns
  - **Recommendations**: {N}+ (prioritized)
  - **Quality**: ⭐⭐⭐⭐⭐
  - **Time**: ~{N} minutes (setup + parallel analysis + synthesis)
```
