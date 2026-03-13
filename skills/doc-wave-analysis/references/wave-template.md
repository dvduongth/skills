# Wave Subagent Prompt Template

Sử dụng template này khi dispatch từng wave. Thay tất cả {placeholders} trước khi gửi.

---

## Template Prompt (copy và thay placeholders)

```
=== TOP RULES (BẮT BUỘC) ===
RULE 0: Output 100% Tiếng Việt
RULE 1: Tuyên bố model: "Tôi dùng sonnet-4-6 vì deep document analysis"
RULE 2: Token budget ≤ 25,000 tokens — ước lượng trước khi đọc
RULE 3: Chỉ đọc files trong danh sách được giao dưới đây
RULE 4: Tạo output file tại {output_path}
RULE 5: Update output file sau mỗi document analyzed
RULE 6: Không scan thêm files ngoài danh sách
==============================

## Nhiệm Vụ: Phân Tích Wave {wave_number} — {wave_theme}

**Project**: {project_name}
**Wave**: {wave_number}/{total_waves}
**Theme**: {wave_theme}

### Files Cần Phân Tích

{file_list}
(Ví dụ:
- D:\research\project\01_overview.md (~500 lines, est. 2,000 tokens)
- D:\research\project\02_architecture.md (~800 lines, est. 3,200 tokens)
- D:\research\project\03_gateway.md (~600 lines, est. 2,400 tokens)
)

**Tổng ước tính**: ~{estimated_tokens} tokens input

### Output File

Tạo file: `{output_path}/wave{wave_number}_summary.md`

### Cấu Trúc Output File Bắt Buộc

```markdown
# Wave {wave_number} Analysis: {wave_theme}

**Analyzed by**: Agent-Wave{wave_number}
**Date**: {date}
**Documents**: {doc_count} files
**Model**: sonnet-4-6

---

## Tóm Tắt Wave

[2-3 câu tóm tắt tổng quan wave này phân tích gì]

---

## Phân Tích Chi Tiết

### Document 1: {filename}
**Tokens đọc**: ~{N}
**Nội dung chính**:
- [Key point 1]
- [Key point 2]
**Patterns phát hiện**: [list patterns]
**Gaps**: [list gaps nếu có]

### Document 2: {filename}
...

---

## Tổng Hợp Wave

### Patterns Chính ({N} patterns)
1. **{Pattern Name}**: [mô tả]
2. ...

### Findings Quan Trọng ({N} findings)
1. [Finding 1]
2. ...

### Gaps & Thiếu Sót
- [Gap 1]
- [Gap 2]

### Khuyến Nghị
- **CAO**: [High priority recommendations]
- **TRUNG**: [Medium priority]
- **THẤP**: [Low priority]

---

## Metrics

| Metric | Giá Trị |
|--------|---------|
| Docs analyzed | {N} |
| Patterns found | {N} |
| Findings | {N} |
| Gaps identified | {N} |
| Actual tokens used | ~{N}k |
| Quality rating | ⭐⭐⭐⭐ |
```

### Hướng Dẫn Thực Hiện

1. **Bước 1**: Tuyên bố model ("Tôi dùng sonnet-4-6...")
2. **Bước 2**: Ước lượng tokens cho từng file trước khi đọc
3. **Bước 3**: Đọc và phân tích từng file theo thứ tự
4. **Bước 4**: Sau mỗi file → cập nhật output file ngay (không batch)
5. **Bước 5**: Tổng hợp patterns + findings cross-document
6. **Bước 6**: Điền đầy đủ Metrics section
7. **Bước 7**: Hoàn thiện output file — đảm bảo 100% Tiếng Việt

**Khi hoàn thành**: Output file đã được ghi tại `{output_path}/wave{wave_number}_summary.md`
```

---

## Placeholders Reference

| Placeholder | Mô tả | Ví dụ |
|-------------|-------|-------|
| `{wave_number}` | Số wave (1, 2, 3...) | `1` |
| `{total_waves}` | Tổng số waves | `4` |
| `{wave_theme}` | Chủ đề của wave | `Foundation & Architecture` |
| `{project_name}` | Tên project | `OpenClaw` |
| `{file_list}` | Danh sách files + ước tính tokens | Xem ví dụ trên |
| `{estimated_tokens}` | Tổng ước tính tokens | `~22,000` |
| `{output_path}` | Đường dẫn output dir | `D:\PROJECT\CCN2\research_doc\open_claw\review` |
| `{doc_count}` | Số documents trong wave | `5` |
| `{date}` | Ngày thực hiện | `2026-03-13` |

---

## Token Budget Checklist (điền trước khi dispatch)

```
Wave {N} Token Estimate:
- File 1 ({name}): ~{N} tokens
- File 2 ({name}): ~{N} tokens
- File 3 ({name}): ~{N} tokens
- File 4 ({name}): ~{N} tokens
- File 5 ({name}): ~{N} tokens
- Prompt overhead: ~2,000 tokens
- Output generation: ~3,000 tokens
TOTAL ESTIMATE: ~{N} tokens
STATUS: {✅ Under 25k / ⚠️ Over 25k — cần trim}
```

Nếu TOTAL > 25,000: cắt bớt files hoặc chỉ đọc phần đầu (100-150 lines) của files dài.
