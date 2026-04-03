# Layout Detail — [Feature Name]

> This file is a **companion to design-doc.md §6 Visual Design**.
> It documents every screen's layout, elements, states, interactions, and assets in detail.
> Linked from design-doc.md → §6 Visual Design System Alignment.

- **Feature:** [Tên feature]
- **Game:** [Game name]
- **Version:** 1.0
- **Last Updated:** [YYYY-MM-DD]
- **Depends on:** design-doc.md §5 Game Flow (screen IDs), §5 Step Detail (step IDs)

---

## Hướng dẫn đọc doc này

Mỗi section mô tả 1 screen từ Screens List trong design-doc §5. Format chuẩn cho mỗi screen:

- **Layout:** Vị trí và thành phần UI (ASCII sketch)
- **Elements:** Chi tiết từng element
- **States:** Default / Loading / Empty / Error — bắt buộc đủ 4
- **Interactions:** Gestures, animations, transitions
- **Assets:** List tên assets cần có

---

## SCREEN-01: [Tên màn hình]

**Type:** Full Screen / Popup / Bottom Sheet / Toast
**Orientation:** Portrait / Landscape
**Entry from:** [SCREEN-XX / Entry point]
**Exit to:** [SCREEN-XX / Exit point]

### Layout Sketch (ASCII)

```
┌─────────────────────────────┐
│  [Header / Navigation Bar]  │
│  ─────────────────────────  │
│                             │
│     [Main Content Area]     │
│                             │
│  [Element A]  [Element B]   │
│                             │
│  ─────────────────────────  │
│       [CTA Button]          │
└─────────────────────────────┘
```

### Elements

| ID  | Element | Type | Position | Content | Notes |
|-----|---------|------|----------|---------|-------|
| E01 | [Tên] | Text / Button / Image / Icon / Input | [Top/Center/Bottom, Left/Center/Right] | [Content/Label] | [Reuse from: / New asset] |
| E02 | | | | | |

### States

#### Default State

- [Mô tả màn hình khi hiển thị bình thường]
- Dữ liệu hiển thị: [...]
- Interactive elements: [...]

#### Loading State

- Trigger: [Khi nào loading xuất hiện]
- UI: Skeleton loader / Spinner tại [vị trí]
- Interactive: Tất cả buttons disabled
- Timeout: [X] giây → show error nếu không load xong

#### Empty State

- Condition: [Khi nào empty state xuất hiện]
- UI: [Illustration + message + CTA]
- Message: "[Text cụ thể]"
- CTA: "[Button label]" → [Action]

#### Error State

- Condition: [Khi nào error xuất hiện]
- UI: [Error icon + message + retry]
- Message: "[Error message cụ thể theo loại lỗi]"
- CTA: "[Thử lại]" → [retry logic] / "[Đóng]" → [exit]

### Interactions & Animations

| Interaction | Trigger | Animation | Duration | Sound |
|-------------|---------|-----------|----------|-------|
| Enter screen | Navigate from [X] | Slide up / Fade in | 300ms | [SFX name / none] |
| Tap [Button] | User tap | Scale 0.95 → 1.0 | 100ms | [SFX name / none] |
| Exit screen | [Action] | Slide down / Fade out | 250ms | none |
| [Reward anim] | Reward received | [Describe animation] | [X]ms | [SFX name] |

### Assets Required

| Asset ID | Type | Name/Description | Size | Reuse? |
|---------|------|-----------------|------|--------|
| A01 | Image/Sprite | [Tên file] | [WxH px] | Reuse: [component] / New |
| A02 | Icon | [Tên] | 24x24 / 48x48 | |
| A03 | Sound | [SFX name] | — | |
| A04 | Animation | [Spine/Lottie name] | — | |

---

## SCREEN-02: [Tên màn hình]

**Type:** [...]

### Layout Sketch (ASCII)

```
[Vẽ layout tương tự SCREEN-01]
```

### Elements

[Tương tự SCREEN-01]

### States

[Default / Loading / Empty / Error — BẮT BUỘC đủ 4]

### Interactions & Animations

[Tương tự SCREEN-01]

### Assets Required

[Tương tự SCREEN-01]

---

## ERROR DIALOGS

### ERR-DIALOG-01: Network Error

```
┌─────────────────────────┐
│  ⚠  Lỗi kết nối         │
│                          │
│  Không thể kết nối.      │
│  Kiểm tra internet và    │
│  thử lại.                │
│                          │
│  [Thử lại]  [Đóng]      │
└─────────────────────────┘
```

| Element | Content |
|---------|---------|
| Icon | Warning icon (⚠ or custom) |
| Title | "Lỗi kết nối" |
| Body | "Không thể kết nối. Kiểm tra internet và thử lại." |
| Primary CTA | "Thử lại" → retry last action |
| Secondary CTA | "Đóng" → dismiss, return to previous screen |

---

## Component Reuse Notes

> List các components đang reuse từ hệ thống hiện có — dev không cần implement mới.

| Component | Reused from | Notes |
|-----------|------------|-------|
| Chip display | `ChipBalanceWidget` | Hiển thị balance real-time |
| Buy chips dialog | `IAPChipStore` | Standard IAP flow |
| Lobby nav bar | `LobbyNavigation` | Giữ nguyên, không thay đổi |
| [Component] | [Source] | [Notes] |
