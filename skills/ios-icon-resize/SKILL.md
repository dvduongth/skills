---
name: ios-icon-resize
description: >
  Resize a master PNG icon to multiple target sizes for iOS/Android build output.
  Use this skill whenever the user mentions updating app icons, resizing icons,
  overriding icon files, or working with clientccn2/build/live/vn/ios/icons.
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

Script tự động tìm tất cả file `{size}.png` trong target dir (kể cả subdirectory
`ios/`, `notification/`, `android/`) và resize từ ảnh gốc xuống đúng size.

## Quy tắc quan trọng

**Resize**: dùng `Image.LANCZOS` — chất lượng tốt nhất khi downscale.

**Alpha**: iOS yêu cầu icon phải là RGB (không có alpha channel), error 90717 nếu vi phạm.
Strip alpha bằng cách composite lên nền trắng — iOS tự clip góc bo nên
màu trắng ở góc transparent không hiển thị trong app.

```python
if resized.mode == "RGBA":
    bg = Image.new("RGB", resized.size, (255, 255, 255))
    bg.paste(resized, mask=resized.split()[3])
    resized = bg
```

**KHÔNG** dùng `convert("RGB")` trực tiếp — transparent pixels sẽ thành đen.
**KHÔNG** dùng GaussianBlur — ảnh hưởng chất lượng pixel ở viền.

## Kiểm tra sau khi chạy

```python
from PIL import Image
img = Image.open(".../ios/1024.png")
assert img.mode == "RGB", "alpha còn đó!"
```

## Thêm size mới

Tạo file rỗng `{size}.png` trong đúng subfolder rồi chạy lại script.

## Dependency

```
pip install Pillow
```
