# ZPS Web App UI — Desktop Launcher Ruleset

This file covers layout, sidebar, and component specs for ZingPlay Desktop App / Launcher, dashboard, analytics, and studio tools. Brand tokens, KPI card specs, icon system, and chart specs are defined in the router SKILL.md — refer there for those details.

---

## Layout

The desktop app uses a **sidebar + main** architecture:

```
[Sidebar 260px] | [Main View flex-1]
```

- **Sidebar**: `#1A1D2E` (dark) / `#FFFFFF` (light). Logo header + grouped nav + user avatar at bottom.
- **Main View**: Scrollable, `#13151F` (dark) / `#FFF8F5` (light). Page title + KPI + charts + tables.
- **Tablet (< 1024px)**: Sidebar collapses to 64px icon-only rail.
- **Mobile (< 640px)**: Sidebar becomes bottom nav bar 68px. Main view full width.

---

## Sidebar

### Logo Header
- `fox_small.png` (40px, radius 10px) + gradient text "ZPS Studio"
- In artifacts: embed fox logo as base64 (see Logo Usage in SKILL.md)
- Gap: 12px, padding `4px 8px`, margin-bottom 28px

### Navigation — Grouped Sections

Divide sidebar into labeled sections — a flat list of items is hard to scan in a tool with many pages:

```
TONG QUAN
  ├── Dashboard (icon: 4-square grid)
  └── Phan tich (icon: bar chart columns)

QUAN LY
  ├── Tro choi (icon: gamepad) [badge count]
  ├── Nguoi choi (icon: person+people)
  └── Doanh thu (icon: card/wallet)

HE THONG
  └── Cai dat (icon: gear)
```

### Section Title
- 11px, weight 700, text-secondary, uppercase, letter-spacing 0.1em, opacity 0.7
- Padding `8px 16px 6px`, margin-bottom 4px

### Nav Item

Padding `12px 16px`, radius 12px, icon 22px filled/flat style, label 14px weight 500.

**Active** — uses brand gradient so it's immediately obvious which page you're on (subtle backgrounds get lost):
```
background: linear-gradient(135deg, #E8341A, #F5A623)
color: white (icon + text)
box-shadow: 0 4px 16px rgba(232,52,26,0.35)
font-weight: 600
```

**Inactive**: transparent bg, text-secondary (`#8A8FA8` dark / `#8B6E60` light)

**Hover (inactive)**: bg `rgba(255,255,255,0.04)` dark / `rgba(139,110,96,0.04)` light, icon color `#F5A623` dark / `#E8341A` light, transition 0.25s ease-bounce

### Badge
- Active item: `rgba(255,255,255,0.25)` bg, white text
- Inactive item: `#E8341A` bg, white text
- 11px, weight 700, padding `2px 8px`, radius 9999px

### Theme Toggle
- Between credits badge and user section
- Filled Sun/Moon icon 22px, label "Light Mode"/"Dark Mode" 14px weight 500
- Style: same as inactive nav item
- Use `next-themes` (`useTheme` hook)
- Collapsed: icon only, tooltip for label

### User Avatar (bottom)
- Circle 38px, brand gradient bg, white initial letter
- Border 2px `#F5A623` when online
- Username 14px weight 600, email 11px text-secondary
- Border-top separator `1px solid border-color`

---

## Components

### Hero Banner
- Aspect ~16:7, full-width in main view
- Overlay: gradient transparent → `#13151F` at bottom 40%
- Badge "NEW"/"HOT": pill, brand gradient bg
- CTA "Choi Ngay": `#00D68F` bg, white text, radius 9999px, cart icon left, weight 700
- States: hover lighten 10% + green glow, active scale 0.97, disabled opacity 0.4

### Game Card
- Thumbnail 16:9 or square, bg `#252836`, radius 12px
- Shadow: `0 4px 16px rgba(0,0,0,0.3)`
- Hover: scale 1.03, shadow `0 8px 24px rgba(0,0,0,0.5)`, border `1px solid rgba(255,255,255,0.06)`
- Active: scale 0.98
- Loading: skeleton shimmer, maintains aspect ratio
- Tag overlay (top-left): pill, 10px
- Rating: yellow `#F5A623`, filled star

### Section Header
- Title H2 (22px weight 700), white
- "Show all" link: Body-sm, `#8A8FA8`, hover brand orange
- Use 24px spacing instead of divider line

### Settings Panel
- bg `#252836`, radius 16px, padding 24px
- Toggle: accent green on, gray off, 200ms
- Divider: `1px solid rgba(255,255,255,0.06)`
- Dropdown: bg `#1A1D2E`, border `1px solid rgba(255,255,255,0.1)`, open → elevated shadow

### Game Detail
- 2-column: [Thumbnail + media | Info + CTA]
- Download states: "Tai Ngay" (green) → "Dang Tai..." (progress bar, orange gradient) → "Choi Ngay" (green)
- Cancel: outline, `#8A8FA8`, hover border white
- Reviews: thumbs up/down, green/red, filled icons
- "You might interest": horizontal scroll cards, fade gradient right edge

### Logout Modal
- bg `#252836`, radius 16px
- Backdrop `rgba(0,0,0,0.6)` blur 8px
- Entrance: backdrop fade 200ms, modal scale 0.95→1.0 300ms ease-bounce
- Buttons: "Huy bo" (outline) + "Dang xuat" (filled green)

### My Games Tab
- Filter pills: "Tat ca", "Chien thuat", "Pho thong", "Truyen thong"
- Active pill: brand red bg, white text, transition 200ms
- Game row: thumbnail 60x60 radius 8px, title + type + size, action icon right
- Download progress: brand orange gradient, height 3px, radius 9999px

---

## Dashboard & Analytics

### Page Header
- Title H1 (28px weight 800)
- Subtitle Body 14px, text-secondary, margin-top 6px

### KPI Section
- Grid 4 columns desktop, 2 tablet/mobile
- Use vibrant gradient cards per SKILL.md KPI specs
- Skeleton loading: 3 shimmer blocks (number + trend + label)

### Charts
- Time-series → line/area chart (see SKILL.md chart specs)
- Layout: `[Line Chart 3fr] [Donut 2fr]` desktop, stacked on mobile, gap 16px
- Container: bg-surface, radius 12px, padding 24px, border 1px
- Height: 260px desktop, 200px mobile
- Legend: inline top-right, stacks vertically on mobile

### Data Table
- Accompanies charts — never the only content on dashboard
- Header: bg-elevated, Caption size, weight 600, uppercase, letter-spacing 0.08em
- Cell padding 14px 12px, row hover bg, border-bottom divider (no alternating rows)
- Pagination: pill buttons, brand orange active
- Color dots (10px, radius 3px) for categories

### Dashboard Page Order
1. KPI Cards (top)
2. Charts (Line + Donut side by side)
3. Data Table (full width bottom)

---

## Spacing

```
4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 48px
```

Card padding: 16–24px. Grid gap: 12–16px. Section gap: 28px.
