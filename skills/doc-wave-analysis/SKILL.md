---
name: doc-wave-analysis
description: Tự động hóa phân tích tài liệu theo wave-based parallel subagents với Top Rules enforcement. Use when user wants to: analyze multiple research documents in parallel, review and synthesize technical documentation, perform wave-based analysis with progress tracking, or enforce token budget and Vietnamese output rules across subagents. Triggers include: "phân tích tài liệu", "wave analysis", "doc review", "research synthesis", "parallel document analysis", "phân tích song song".
---

# Doc Wave Analysis

Skill tự động hóa quy trình phân tích tài liệu kỹ thuật theo waves song song, với enforcement đầy đủ của Top Rules. Được rút ra từ thực tiễn phân tích OpenClaw (19 docs, 4 waves, 87.6k tokens, 94% consistency).

## Top Rules — Bắt Buộc Mọi Lúc

```
RULE 0 — Language   : Suy nghĩ English → OUTPUT 100% Tiếng Việt
RULE 1 — Model      : /model-strategy cho TỪNG subagent (nêu lý do rõ)
RULE 2 — Compact    : Sau khi ghi nhớ → /compact NGAY (không skip)
RULE 3 — Token      : Mỗi execution ≤ 30,000 tokens (hard limit)
RULE 4 — Plan       : Thực thi ĐÚNG plan, không tự ý thay đổi
RULE 5 — Tracking   : Cập nhật WAVE_PROGRESS.md SAU MỖI bước hoàn thành
RULE 6 — No Scan    : Chỉ đọc tài liệu đã chuẩn bị — không re-scan/re-clone
RULE 7 — Parallel   : Waves độc lập → dispatch TẤT CẢ cùng lúc
```

---

## Khi Nào Dùng Skill Này

✅ **Dùng khi**:
- Phân tích N tài liệu nghiên cứu đã chuẩn bị sẵn trong một thư mục
- Review và tổng hợp tài liệu kỹ thuật thành báo cáo hoàn chỉnh
- Cần theo dõi tiến độ rõ ràng + output 100% Tiếng Việt
- Số lượng docs ≥ 5 (đủ lợi ích từ parallel waves)

❌ **Không dùng khi**:
- Cần quét/clone repo từ đầu → dùng `repo-local-analysis`
- Chỉ 1-3 docs → phân tích trực tiếp, không cần wave workflow

---

## Workflow Tổng Quan

```
[User cung cấp: source_dir + output_dir + mục tiêu]
         ↓
  start_analysis          ← Setup + trackers
         ↓
   plan_waves             ← Phân chia docs + ước tính tokens
         ↓
  dispatch_waves          ← Parallel subagents (model-strategy enforced)
         ↓
 monitor_progress         ← Auto-update khi nhận notifications
         ↓
review_consistency        ← Cross-check + consistency score
         ↓
 synthesize_report        ← Master report (100% Tiếng Việt)
         ↓
  validate_result         ← Quality check + ✅ PROJECT COMPLETE
```

---

## Command 1: start_analysis

**Mục đích**: Khởi động phân tích — kiểm tra đầu vào, tạo tracking files, load Top Rules vào context.

**Đầu vào bắt buộc từ user**:
- `source_dir`: Thư mục chứa tài liệu nguồn
- `output_dir`: Thư mục lưu kết quả (sẽ tạo `review/` bên trong)
- `goal`: Mục tiêu phân tích (1-2 câu)

**Thực hiện từng bước**:

1. **Xác nhận đầu vào** (Rule 4):
   ```bash
   ls "{source_dir}"
   # Liệt kê tất cả files, đếm số lượng
   ```

2. **Tạo thư mục output**:
   ```bash
   mkdir -p "{output_dir}/review"
   ```

3. **Bootstrap tracking files** từ templates trong skill này:
   - Copy nội dung `templates/WAVE_PROGRESS.md` → `{output_dir}/review/WAVE_PROGRESS.md`
   - Copy nội dung `templates/FINDINGS.csv` → `{output_dir}/review/FINDINGS.csv`
   - Điền: project name, source_dir, output_dir, ngày bắt đầu

4. **Tạo PLAN.md**:
   ```markdown
   # Analysis Plan — {project_name}
   **Nguồn**: {source_dir}
   **Output**: {output_dir}/review/
   **Tài liệu**: {N} files
   **Mục tiêu**: {goal}
   **Ngày**: {YYYY-MM-DD}
   ```

5. **Ghi nhớ vào memory** (Rule 2 — để dùng sau /compact):
   - source_dir, output_dir, file list, goals, project name

6. **Báo cáo cho user** (Rule 0 — Tiếng Việt):
   ```
   ✅ Đã khởi động phân tích "{project_name}":
   - {N} tài liệu đã xác nhận
   - Tracking: {output_dir}/review/WAVE_PROGRESS.md
   → Tiếp theo: plan_waves
   ```

**Token estimate**: ~5,000 tokens

---

## Command 2: plan_waves

**Mục đích**: Phân chia N tài liệu thành waves cân bằng, ước tính token budget, lên lịch dispatch.

**Nguyên tắc phân chia** (Rule 3):
- Mỗi wave: tối đa 5 docs, ước tính ≤ 25,000 tokens
- Nhóm docs theo chủ đề (dựa vào tên file, số thứ tự)
- Docs nhỏ (CSV, data) → gộp vào 1 wave riêng

**Thực hiện**:

1. **Đọc danh sách files** (Rule 6 — chỉ từ source_dir đã setup, không scan thêm)

2. **Phân wave** với logic:
   ```
   N ≤ 5 docs  → 1 wave
   N ≤ 10 docs → 2 waves (~5 docs/wave)
   N ≤ 15 docs → 3 waves (~5 docs/wave)
   N ≤ 20 docs → 4 waves (~5 docs/wave)
   N > 20 docs → 5+ waves (giới hạn 4-5 docs/wave)
   ```

3. **Đặt tên wave theo chủ đề** (nếu tên file có gợi ý):
   ```
   Wave 1: Foundation & Architecture (docs 01-05)
   Wave 2: Integration & Features (docs 06-10)
   Wave 3: Advanced Topics (docs 11-15)
   Wave 4: Data & Supporting (docs 16-19)
   ```

4. **Cập nhật WAVE_PROGRESS.md** (Rule 5):
   ```markdown
   ## Wave 1: {Theme}
   - Documents: {list}
   - Status: 🟡 Ready for dispatch
   - Estimated Tokens: ~{N}k
   - Output: wave1_summary.md
   ```

5. **Báo cáo plan cho user** + hỏi xác nhận trước khi dispatch

**Token estimate**: ~8,000 tokens

---

## Command 3: dispatch_waves

**Mục đích**: Dispatch TẤT CẢ waves song song dưới dạng background subagents với model-strategy enforcement.

**⚠️ QUAN TRỌNG**: Gọi TẤT CẢ Agent tools trong MỘT message duy nhất (Rule 7 — parallel).

**Thực hiện**:

1. **Chọn model** cho mỗi wave (Rule 1 — bắt buộc tuyên bố):
   - Document/architecture analysis → **sonnet-4-6** (Deep Analysis)
   - Data files (CSV, spreadsheets) → **haiku-4-5** (Assembly/Format)
   - Tuyên bố rõ trong comment: _"Wave 1 dùng sonnet-4-6 vì đây là deep analysis architecture docs"_

2. **Chuẩn bị prompt** cho mỗi wave:
   - Dùng template từ `references/wave-template.md`
   - Inject: danh sách docs, output path, Top Rules tóm tắt
   - Token budget: ~25,000 tokens/wave

3. **Dispatch song song** — tất cả trong một lượt:
   ```
   Wave 1 → Agent tool (run_in_background=true)
   Wave 2 → Agent tool (run_in_background=true)
   Wave N → Agent tool (run_in_background=true)
   ```
   ❌ **KHÔNG** làm tuần tự: dispatch Wave 1, chờ xong, rồi Wave 2

4. **Cập nhật WAVE_PROGRESS.md** ngay sau khi dispatch (Rule 5):
   ```markdown
   ## Wave 1: Foundation
   - Status: 🔄 In Progress
   - Agent ID: {agent_id}
   ```

5. **Báo cáo cho user**:
   ```
   🚀 Đã dispatch {N} waves song song!
   - Wave 1 ({agent_id}): docs 01-05 (sonnet-4-6)
   - Wave 2 ({agent_id}): docs 06-10 (sonnet-4-6)
   ⏳ Đang chờ kết quả (~5-10 phút)
   ```

**Token estimate**: ~5,000 tokens (dispatch phase rất nhẹ)

---

## Command 4: monitor_progress

**Mục đích**: Cập nhật status khi nhận task-notifications từ subagents; báo cáo real-time cho user.

**Trigger**: Tự động khi nhận `<task-notification>` từ bất kỳ wave nào.

**Thực hiện khi nhận notification**:

1. **Đọc WAVE_PROGRESS.md** phiên bản mới nhất trước khi edit

2. **Cập nhật wave hoàn thành** (Rule 5):
   ```markdown
   ## Wave {N}: {Theme}
   - Status: ✅ COMPLETE
   - Completion: {timestamp}
   - Quality: ⭐⭐⭐⭐ {X}/5
   - Key findings: {N} patterns, {M} findings
   - Actual Tokens: ~{K}k
   ```

3. **Thêm vào Completed Milestones**:
   ```markdown
   - ✅ {timestamp} — Wave {N} COMPLETE ({key metrics})
   ```

4. **Báo cáo cho user** sau mỗi wave:
   ```
   ✅ Wave {N} hoàn thành! ({timestamp})
   📊 {summary of key findings}
   ⏳ Còn lại: {remaining waves}
   ```

5. **Khi TẤT CẢ waves complete**:
   - Cập nhật milestone: `🟢 ALL WAVES COMPLETE`
   - Tự gọi `review_consistency`

**Token estimate**: ~3,000 tokens mỗi notification

---

## Command 5: review_consistency

**Mục đích**: Đọc tất cả wave summaries, cross-check thuật ngữ và kiến trúc, tính consistency score.

**Trigger**: Sau khi tất cả waves hoàn thành.

**⚠️ Token Management** (Rule 3):
- Đọc tối đa 2-3 wave summaries cùng lúc
- Nếu tổng ước tính > 20,000 tokens → đọc tuần tự từng file

**Thực hiện**:

1. **Ghi nhớ context hiện tại** vào memory (Rule 2):
   - Key findings từ mỗi wave (từ notifications đã nhận)
   - Patterns đã identify
   - Architectural concepts

2. **Dùng `/compact`** sau khi ghi nhớ (Rule 2 — BẮT BUỘC trước khi đọc summaries)

3. **Đọc wave summaries** (từng cặp để quản lý tokens):
   - Đọc wave1 + wave2 → so sánh thuật ngữ
   - Đọc wave3 + wave4 → so sánh thuật ngữ

4. **Cross-check checklist**:
   ```
   ✅/⚠️ Thuật ngữ nhất quán
   ✅/⚠️ Không có mô tả kiến trúc mâu thuẫn
   ✅/⚠️ Version/release info đồng nhất
   ✅/⚠️ Component interactions align
   ✅/⚠️ Security model consistent
   ```

5. **Tính consistency score**: (số mục ✅ / tổng) × 100%
   - ≥ 90%: ✅ Excellent
   - 80-89%: ⚠️ Good (cần note issues)
   - < 80%: ❌ Needs review

6. **Cập nhật** WAVE_PROGRESS.md + CHECKLIST.md (Rule 5):
   ```markdown
   ## Review Phase
   - Status: ✅ COMPLETE
   - Consistency Score: {X}%
   - Issues found: {N}
   ```

7. **Tự động gọi** `synthesize_report` nếu score ≥ 80%

**Token estimate**: ~15,000 tokens

---

## Command 6: synthesize_report

**Mục đích**: Tổng hợp tất cả findings thành báo cáo master hoàn chỉnh, 100% Tiếng Việt.

**Model**: sonnet-4-6 (synthesis = deep analysis requiring structured writing)

**Cấu trúc báo cáo bắt buộc**:

```markdown
# {Project} — Báo Cáo Đánh Giá Kỹ Thuật Toàn Diện

> Phiên bản: {version} | Ngày: {date} | Consistency: {X}%

## Tóm Tắt Điều Hành
[2-3 đoạn tổng hợp toàn bộ]

## Phần 1: {Wave 1 Theme}
[Tổng hợp từ wave1_summary.md]

## Phần 2: {Wave 2 Theme}
...

## Đánh Giá Nhất Quán Cross-Document
[Consistency score + issues]

## Cải Tiến Được Khuyến Nghị
### PRIORITY CAO (1-2 ngày)
| # | Cải tiến | Ảnh hưởng | Tài liệu |

### PRIORITY TRUNG (2-5 ngày)
...

### PRIORITY THẤP (>5 ngày)
...

## Kết Luận & Hướng Dẫn Tiếp Theo
```

**Thực hiện**:

1. **Tổng hợp từ memory** + wave summaries (Rule 3 — ưu tiên dùng memory)
2. **Tạo báo cáo** theo cấu trúc trên → lưu `{output_dir}/review/{PROJECT}_REVIEW_REPORT.md`
3. **Cập nhật FINDINGS.csv** với consolidated findings
4. **Cập nhật WAVE_PROGRESS.md**:
   ```markdown
   ## Synthesis Phase
   - Status: ✅ COMPLETE
   - Output: {PROJECT}_REVIEW_REPORT.md
   - Contents: {N} sections, {M}+ words
   ```
5. **Tự gọi** `validate_result`

**Output**: 100% Tiếng Việt (Rule 0 — bắt buộc tuyệt đối)
**Token estimate**: ~20,000 tokens

---

## Command 7: validate_result

**Mục đích**: Kiểm tra chất lượng tất cả deliverables trước khi tuyên bố hoàn thành.

**Checklist bắt buộc**:

```bash
# 1. Verify files tồn tại
ls {output_dir}/review/
# Expected: WAVE_PROGRESS.md, FINDINGS.csv, PLAN.md,
#           wave{1..N}_summary.md, {PROJECT}_REVIEW_REPORT.md
```

**Quality checks**:

| Check | Pass Condition | Severity |
|-------|---------------|----------|
| Báo cáo master tồn tại | File có nội dung | CRITICAL |
| Tất cả waves ✅ | Không còn ⬜ hay 🔄 | CRITICAL |
| Language check | Output Tiếng Việt | CRITICAL |
| Consistency score | ≥ 80% | WARNING |
| FINDINGS.csv đầy đủ | Có entries cho mọi doc | INFO |

**Báo cáo cuối cho user**:
```
╔══════════════════════════════════════╗
║     ✅ PHÂN TÍCH HOÀN THÀNH!         ║
╠══════════════════════════════════════╣
║ Deliverables:                        ║
║  • {N} Wave Summaries                ║
║  • Báo cáo master ({lines}+ từ)      ║
║  • WAVE_PROGRESS.md ✅               ║
║  • FINDINGS.csv ({N} entries)        ║
╠══════════════════════════════════════╣
║ Chất lượng:                          ║
║  • Consistency: {X}%                 ║
║  • Tổng findings: {N}+               ║
║  • Patterns: {M}                     ║
║  • Language: ✅ 100% Tiếng Việt      ║
╠══════════════════════════════════════╣
║ Thời gian: ~{T} phút                 ║
║ Tokens dùng: ~{K}k                   ║
╚══════════════════════════════════════╝
```

**Sau khi validate**: Ghi nhớ completion vào memory + `/compact` (Rule 2)

**Token estimate**: ~5,000 tokens

---

## Quick Reference — Top Rules Tại Điểm Enforcement

| Rule | Enforcement Tại Command | Hậu Quả Nếu Skip |
|------|------------------------|-------------------|
| 0 — Tiếng Việt | synthesize_report, validate_result | Phải rewrite toàn bộ |
| 1 — Model Strategy | dispatch_waves | Chọn sai model → kém chất lượng |
| 2 — Memory+Compact | review_consistency, validate_result | Context bloat → token limit |
| 3 — Token ≤30k | plan_waves, review_consistency | Agent crash/timeout |
| 4 — Plan Adherence | Mọi command | Ad-hoc = không consistent |
| 5 — Progress Tracking | Mỗi bước hoàn thành | Mất track, không recover |
| 6 — No Scanning | start_analysis | Token waste, wrong docs |
| 7 — Parallel | dispatch_waves | 4x chậm hơn |

---

## Ví Dụ Thực Tế: OpenClaw Analysis (19 docs)

```
Input:
  source_dir = D:\research\pi-mono-research\open_claw\
  output_dir = D:\research\open_claw\
  goal = "Phân tích kiến trúc và đánh giá tài liệu OpenClaw v2026.3.11"

Execution:
  1. start_analysis  → 19 docs confirmed, tracking setup
  2. plan_waves      → 4 waves × ~5 docs/wave (~23k tokens each)
  3. dispatch_waves  → 4 agents song song (sonnet-4-6)
     ⏱ ~10 phút parallel execution
  4. monitor_progress → auto-update Wave 1✅, 2✅, 3✅, 4✅
  5. review_consistency → 94% alignment (1 minor conflict)
  6. synthesize_report → OPENCLAW_REVIEW_REPORT.md (6,000+ từ)
  7. validate_result → ✅ COMPLETE

Output:
  • 4 wave summaries (2,000+ lines tổng)
  • 1 master report (68+ findings, 13 patterns)
  • Tổng tokens: 87.6k | Thời gian: ~45 phút
```

---

## Tham Khảo Thêm

- `references/top-rules.md` — Phiên bản rút gọn để inject vào subagent prompts
- `references/wave-template.md` — Template đầy đủ cho subagent dispatch
- `references/progress-tracker.md` — Specification format WAVE_PROGRESS.md
- `templates/WAVE_PROGRESS.md` — Bootstrap template (copy vào output dir)
- `templates/FINDINGS.csv` — Bootstrap template (copy vào output dir)
