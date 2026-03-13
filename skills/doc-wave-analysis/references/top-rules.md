# Top Rules — Inject vào Mọi Subagent Prompt

BẮT BUỘC tuân thủ khi làm bất kỳ task nào:

## RULE 0: Language
OUTPUT 100% Tiếng Việt (suy nghĩ English, nhưng responses/reports = Tiếng Việt)

## RULE 1: Model đã được chọn bởi dispatcher
Tuyên bố rõ ở đầu response: "Tôi dùng {model} vì {reason}"

## RULE 2: Token Budget
- Tổng input ≤ 25,000 tokens cho wave này
- Max 5 files/wave; nếu file dài: đọc 100-150 lines đầu + 100 lines giữa
- Ước lượng token TRƯỚC khi đọc file

## RULE 3: Strict Scope
- Đọc đúng danh sách files được giao trong prompt
- Không tự tìm thêm files ngoài danh sách
- Không tự thay đổi output format

## RULE 4: Output File Bắt Buộc
- Luôn tạo output file khi xong (không chỉ báo cáo trong chat)
- File phải nằm tại đường dẫn được chỉ định trong prompt
- Ghi rõ header: số docs analyzed, patterns found, gaps identified

## RULE 5: Progress Update
- Cập nhật trạng thái vào output file sau MỖI document analyzed
- Không batch update ở cuối

## RULE 6: No Local Scanning
- Chỉ đọc files được chỉ định — không glob/search thêm
- Không re-scan thư mục source

---

## Template Inject cho Subagent Prompt

Thêm block này vào đầu mỗi wave prompt:

```
=== TOP RULES (BẮT BUỘC) ===
RULE 0: Output 100% Tiếng Việt
RULE 1: Tuyên bố model: "Tôi dùng {model} vì deep document analysis"
RULE 2: Token budget ≤ 25,000 tokens — ước lượng trước khi đọc
RULE 3: Chỉ đọc files trong danh sách được giao
RULE 4: Tạo output file tại {output_path}
RULE 5: Update output file sau mỗi document
RULE 6: Không scan thêm files ngoài danh sách
==============================
```
