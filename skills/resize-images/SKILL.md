---
name: ios-icon-resize
description: >
  Resize a master PNG icon to multiple target sizes for iOS/Android build output.
  Use this skill whenever the user mentions updating app icons, resizing icons,
  overriding icon files, or working with D:\PROJECT\CCN2\clientccn2\build\live\vn\ios\icons\.
  Also trigger when the user asks to apply a new icon image to the build folder.
---

# iOS Icon Resize

Resize một ảnh gốc PNG thành nhiều kích thước icon cho iOS/Android build.

## Paths (CCN2 project)

| | Path |
|---|---|
| **Source (master)** | `D:\PROJECT\CCN2\ART\Icon_CCN2_pt.png` |
| **Target dir** | `D:\PROJECT\CCN2\clientccn2\build\live\vn\ios\icons\` |
| **Script** | `shared/skills/ios-icon-resize/scripts/resize_icons.py` |

## Cách chạy

```bash
python shared/skills/ios-icon-resize/scripts/resize_icons.py \
  "D:/PROJECT/CCN2/ART/Icon_CCN2_pt.png" \
  "D:/PROJECT/CCN2/clientccn2/build/live/vn/ios/icons"
```

Script tự động tìm tất cả file `{size}.png` trong target dir (kể cả subdirectory `ios/`, `notification/`, `android/`) và resize từ ảnh gốc xuống đúng size tương ứng.

## Quy tắc quan trọng

**KHÔNG** thêm bất kỳ xử lý alpha nào (blur, flatten, fill trắng, fill đen).
Chỉ dùng `Image.resize((size, size), Image.LANCZOS)` và save thẳng.
Lý do: bất kỳ xử lý alpha nào đều làm thay đổi chất lượng ảnh so với gốc.
iOS sẽ tự clip rounded corners — không cần fill góc transparent.

## Kiểm tra nhanh

Sau khi chạy, đọc file `ios/1024.png` và so sánh với ảnh gốc để xác nhận chất lượng khớp.

## Thêm size mới

Nếu cần thêm size chưa có trong target dir, tạo file rỗng `{size}.png` trước rồi chạy lại script.
Hoặc dùng PIL trực tiếp:

```python
from PIL import Image
src = Image.open("D:/PROJECT/CCN2/ART/Icon_CCN2_pt.png")
src.resize((SIZE, SIZE), Image.LANCZOS).save("path/to/{SIZE}.png", "PNG")
```

## Dependency

```
pip install Pillow
```
