---
name: zps-studio-ui
description: >
  ZPS Studio design system — use this skill whenever you need to create UI/UX for ZingPlay or ZPS Studio.
  Automatically selects the correct ruleset: Web/App UI (desktop launcher, sidebar, card, dark theme) or Game UI
  (mobile splash screen, loading screen, HUD, game icon). Trigger when the user mentions: ZingPlay,
  ZPS, game launcher, splash screen, loading screen, home screen, game detail, settings panel,
  mobile game UI, dashboard, analytics, KPI, revenue report, or any component within the ZingPlay ecosystem.
  Even if the user doesn't say "ZPS" explicitly, trigger when creating gaming platform UI, game launcher,
  or studio dashboard with Vietnamese labels.
---

# ZPS Studio UI — Design System Router

Read this file first. Then read the appropriate reference file based on the request context (see Routing Logic at the bottom).

---

## Brand Identity

ZingPlay / ZPS Studio is a gaming platform for adults who enjoy board games and card games. The visual identity is **playful but structured** — friendly and dynamic like a gaming brand, but trustworthy and organized like a professional tool. Think of it as the middle ground between a casual mobile game and enterprise SaaS.

### Color Tokens

```
/* Brand Core */
--zps-brand-red:       #E8341A   /* Fox logo, wordmark */
--zps-brand-orange:    #F5A623   /* Accent warm, game highlights */
--zps-brand-gradient:  linear-gradient(135deg, #E8341A 0%, #F5A623 100%)

/* Background System */
--zps-bg-dark:         #13151F   /* Main background desktop */
--zps-bg-surface:      #252836   /* Cards, panels */
--zps-bg-elevated:     #2E3148   /* Hover states, elevated cards */
--zps-bg-light:        #F0F0F2   /* Mobile splash, light mode */

/* Warm Light Mode — inspired by fox fur */
--zps-bg-warm-page:    #FFF8F5
--zps-bg-warm-surface: #FFFFFF
--zps-bg-warm-elevated:#FFF0EB
--zps-text-warm:       #2D1B14
--zps-text-warm-sub:   #8B6E60

/* Accent Colors */
--zps-accent-green:    #00D68F   /* CTA primary "Choi Ngay" */
--zps-accent-purple:   #7C4DFF   /* Secondary accent, badges */
--zps-accent-blue:     #4A90D9   /* Info, tertiary accent */

/* Text */
--zps-text-primary:    #FFFFFF   /* On dark */
--zps-text-secondary:  #8A8FA8   /* Subtext, metadata */
--zps-text-dark:       #1A1A2E   /* On light background */

/* Semantic */
--zps-success:         #00D68F
--zps-warning:         #F5A623
--zps-danger:          #E8341A
```

### Typography

Primary font: **Inter** or **Be Vietnam Pro** — rounded, friendly.

#### Desktop Scale

```
Display:    36px / line-height 1.1 / weight 800  — KPI hero numbers
H1:         28px / line-height 1.2 / weight 800  — Page title
H2:         22px / line-height 1.3 / weight 700  — Section title
H3:         18px / line-height 1.4 / weight 700  — Card title
H4:         15px / line-height 1.4 / weight 600  — Subsection
Body:       14px / line-height 1.5 / weight 400  — Paragraph text
Body-sm:    13px / line-height 1.5 / weight 400  — Secondary text
Caption:    11px / line-height 1.4 / weight 500  — Labels, metadata
Overline:   10px / line-height 1.2 / weight 700 / letter-spacing 0.08em / uppercase
```

#### Mobile Scale

```
Display:    32px / weight 800   — Score, reward number
H1:         24px / weight 800   — Screen title
H2:         20px / weight 700   — Section title
Body:       16px / weight 400   — Touch-friendly body text
Body-sm:    14px / weight 400   — Subtext
Caption:    12px / weight 500   — Labels
```

### Shape Language

- Border radius: `8px` (small), `12px` (card), `16px` (panel), `24px` (modal), `9999px` (pill)
- Shadow dark: `0 4px 16px rgba(0,0,0,0.3)` — faint shadows disappear on dark backgrounds
- Shadow light: `0 4px 16px rgba(45,27,20,0.08)` — warm tint, pure black looks cold on warm light mode
- No hard edges (0px radius) except separator lines

### Chromatic Surfaces & Shadows

Use tinted gradient surfaces instead of flat backgrounds — they add depth without clutter. Opacity 0.02–0.12.

```
--surface-red:    linear-gradient(135deg, rgba(232,52,26,0.12), rgba(232,52,26,0.03))
--surface-purple: linear-gradient(135deg, rgba(124,77,255,0.12), rgba(124,77,255,0.03))
--surface-blue:   linear-gradient(135deg, rgba(74,144,217,0.12), rgba(74,144,217,0.03))
--surface-green:  linear-gradient(135deg, rgba(0,214,143,0.12), rgba(0,214,143,0.03))
```

Shadows inherit tint from the surface — pure black shadows on colored surfaces look disconnected:
```
red:    0 8px 24px rgba(232,52,26,0.14)
purple: 0 8px 24px rgba(124,77,255,0.14)
blue:   0 8px 24px rgba(74,144,217,0.14)
green:  0 8px 24px rgba(0,214,143,0.14)
```

---

## Logo Assets

This skill ships with 4 files in `assets/`:

| File | Use when | Size |
|------|----------|------|
| `favicon-32x32.png` | Web favicon (`<link rel="icon">`) | 32x32px |
| `fox_small.png` | Icon-only: app icon, sidebar header, mobile header, loading | 32–64px |
| `logo_small.png` | Stacked (fox + vertical wordmark): splash, login, about | 80–160px |
| `logo_ngang_small.png` | Horizontal (fox + wordmark): header bar, top nav | 120–200px |

### Favicon

Use `assets/favicon-32x32.png` for web favicon — not `fox_small.png` (wrong format/size).
- **Next.js App Router**: copy to `src/app/favicon.ico` or set in metadata `icons: { icon: "/favicon-32x32.png" }`
- **HTML**: `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`
- **Artifact**: convert to base64 data URL

### Logo Usage

The logo is the fox mascot — it can't be approximated with CSS or text. A gradient box with "ZP" looks cheap and off-brand.

1. Use an `<img>` tag pointing to the actual file in `assets/`
2. In artifacts (no filesystem): read the file and embed as base64 data URL — `base64 -w0 assets/fox_small.png`
3. On light backgrounds: add `drop-shadow(0 2px 8px rgba(0,0,0,0.1))` for contrast
4. Clear space around logo >= 50% of logo height
5. Never stretch, rotate, recolor, or crop the logo
6. Splash screen: `logo_small.png`, centered, ~35% of screen width
7. Desktop sidebar: `fox_small.png` (40px, radius 10px) + gradient text "ZPS Studio"
8. Mobile header: `fox_small.png` (32px, radius 8px) + gradient text title

---

## Icon System

ZPS uses **filled/flat icons** — not outline/stroke. The filled style matches the brand's playful, solid personality. Outline icons (Lucide, Feather) look too thin and enterprise-y.

### Sidebar & Navigation Icons — Filled SVG

Use `fill` attribute with multiple layers at different opacities for depth:

```jsx
// Dashboard — 4-square grid
<svg viewBox="0 0 24 24" fill="none">
  <rect x="3" y="3" width="8" height="8" rx="2" fill={color}/>
  <rect x="13" y="3" width="8" height="8" rx="2" fill={color} opacity="0.6"/>
  <rect x="3" y="13" width="8" height="8" rx="2" fill={color} opacity="0.6"/>
  <rect x="13" y="13" width="8" height="8" rx="2" fill={color}/>
</svg>
```

Inactive: `text-secondary` color. Active: `white` or brand color.

### KPI Card Icons — Dual-Tone Line SVG

KPI cards sit on vibrant gradients, so icons use white strokes instead of fills. Emoji (💰 👥) looks unprofessional on gradient cards.

```jsx
// Revenue — wallet dual-tone
<svg viewBox="0 0 32 32" fill="none">
  <rect x="4" y="7" width="24" height="18" rx="3" stroke="rgba(255,255,255,0.45)" strokeWidth="2"/>
  <path d="M4 12h24" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
  <circle cx="16" cy="20" r="3" stroke="white" strokeWidth="2"/>
</svg>
```

Characteristics: primary stroke white (0.9–1.0), accent `rgba(255,255,255, 0.3–0.5)`, light fills `rgba(255,255,255, 0.2–0.4)`, strokeWidth 1.5–2px, strokeLinecap round, size 28–36px.

---

## KPI Cards — Vibrant Gradient

KPI cards use bold, vibrant gradients — not light chromatic surfaces. Light surfaces (opacity 0.02–0.12) blend into the background and become unreadable, especially in light mode.

### Gradient Palette
```
red (Revenue):   linear-gradient(135deg, #E8341A 0%, #F5A623 100%)
purple (Users):  linear-gradient(135deg, #7C4DFF 0%, #B47AFF 50%, #E8341A 100%)
blue (Activity): linear-gradient(135deg, #4A90D9 0%, #7C4DFF 100%)
green (Metrics): linear-gradient(135deg, #00D68F 0%, #4A90D9 100%)
```

### Card Specs
```
Border-radius:   16px
Shadow:          0 8px 28px rgba(color, 0.35)
Shadow hover:    0 12px 36px rgba(color, 0.5)
Hover:           scale(1.04) translateY(-2px), ease-bounce 0.25s
Overflow:        hidden (for decorative circles)
```

### Text — Always White
Text on KPI cards stays white regardless of theme, because the gradient background is always vivid:
```
Icon:            Dual-tone line SVG, 28–36px
Label:           11px, weight 600, rgba(255,255,255,0.75), uppercase, letter-spacing 0.08em
Number:          36px desktop / 28px mobile, weight 800, #FFFFFF, light text-shadow
Trend badge:     12px, weight 700, pill rgba(255,255,255,0.2), text rgba(255,255,255,0.9)
Trend arrows:    text characters (not SVG icon)
```

### Decorative Circles
```
Large:  absolute, top -20, right -20, ~90px, rgba(255,255,255,0.12)
Small:  absolute, top 15, right 15, ~45px, rgba(255,255,255,0.08)
```

---

## Charts

### Preferred Chart Types
1. **Line / Area** — default for time-series (revenue, users over time). Line charts show trends clearly; bar charts make time-series look choppy.
2. **Donut** — for distribution, ratios
3. **Bar** — for category comparisons only
4. **Stacked bar** — for multi-series comparisons

### Line / Area Specs
```
Line: smooth cubic bezier, stroke 2.5–3px primary / 2px secondary
Dots: radius 4px, fill color, stroke bg-surface 2px
Glow: feGaussianBlur stdDeviation 3 on primary line
Area: gradient from line color → transparent (dark: 0.35→0.02, light: 0.18→0.02)
Multi-line: max 3 lines, primary bold+glow+dots, secondary thinner no glow (0.7 opacity)
```

### Palette (in order): `#E8341A`, `#F5A623`, `#7C4DFF`, `#4A90D9`, `#00D68F`

### Styling
```
Grid:       dark rgba(255,255,255,0.06), light rgba(139,110,96,0.08)
Axis:       Caption size, text-secondary, Inter
Tooltip:    bg-elevated, radius 8px, shadow, padding 8px 12px
Legend:     inline top-right, color line 10px + Caption label
Container:  bg-surface, radius 12px, padding 24px, border 1px
Height:     240–320px desktop, 200px mobile
```

---

## Motion & Transitions

### Easing
```
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1)  — Entrance, playful
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1)        — Standard
--ease-snap:    cubic-bezier(0, 0, 0.2, 1)           — Button press
```

### Duration
```
100ms Instant   — Button press, toggle
200ms Fast      — Hover, tooltip
300ms Standard  — Card, panel, tab
400ms Moderate  — Modal, page transition
600ms Slow      — Chart animation
```

### Desktop: subtle, professional
- Hover: scale 1.02–1.03, shadow up, 200ms ease-smooth
- Card entrance: fade + translateY 8px, 300ms, stagger 50ms
- Modal: backdrop fade 200ms, card scale 0.95→1.0, 300ms ease-bounce

### Mobile Game: bold, energetic
- Entrance: scale 0.8→1.0 bounce, 400ms
- Button: scale 0.95, 100ms ease-snap
- Reward popup: scale 0.5→1.1→1.0, 500ms ease-bounce

Respect `prefers-reduced-motion: reduce`.

---

## Component States

Every interactive component needs complete states — missing hover/disabled states make the UI feel broken.

### Buttons
```
Default:   Background by type (CTA green, secondary surface, outline border)
Hover:     Lighten 10%, shadow up, cursor pointer
Active:    Darken 5%, scale 0.97, shadow down
Focus:     Ring 2px offset 2px, brand-orange
Disabled:  Opacity 0.4, cursor not-allowed
Loading:   Text hidden, spinner centered, maintain width
```

### Cards
```
Default:   bg-surface, standard shadow
Hover:     Scale 1.03, chromatic shadow up, subtle border
Active:    Scale 0.98
Selected:  Border 2px accent, check icon top-right
Disabled:  Opacity 0.5, light grayscale
```

### Inputs
```
Default:   Border 1px rgba(255,255,255,0.1), bg-elevated
Focus:     Border 2px brand-orange, glow 0 0 0 3px rgba(245,166,35,0.2)
Error:     Border 2px danger-red, red helper text
Success:   Border 2px success-green, check icon
Disabled:  Darker bg, text opacity 0.4
```

### Empty States
Never leave blank — show: large icon (48–64px), headline ("Chua co du lieu"), guidance text, optional CTA, chromatic surface background.

### Loading
Prefer skeleton screens over spinners. Shimmer: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)`. Never show a blank screen.

---

## Responsive

```
Mobile:   < 640px    — Single column, bottom nav 68px
Tablet:   640–1024px — 2 columns, sidebar collapses to 64px rail
Desktop:  1024–1440px — Full layout, sidebar 260px
Wide:     > 1440px   — Max-width container, centered
```

Mobile touch targets: 48px minimum. Mobile game screens (splash, HUD) are always fullscreen portrait — see `references/game-ui.md`.

---

## Output Rules

1. Use React + Tailwind unless otherwise requested
2. Inline color tokens as Tailwind arbitrary values `[#E8341A]` or CSS variables
3. Explain layout visually — "panel anchors left, 64px icon-only" — not code syntax
4. Components should be standalone (no external state dependency unless required)
5. Dark theme default for desktop, light for mobile game
6. Logo: embed base64 from real `assets/` file, never use placeholder
7. Icons: filled/flat SVG, never outline/stroke
8. Charts: line/area for time-series, never bar chart for trends
9. Sidebar: grouped sections, active item uses brand gradient
10. Theme toggle: sidebar includes dark/light toggle with filled Sun/Moon icon (`next-themes`)
11. States: every interactive element needs hover + active + disabled
12. Loading: skeleton screen, never blank
13. Empty: illustration + text + optional CTA

---

## Routing Logic — Which reference to read next?

### Read `references/web-app-ui.md` when:
Desktop launcher, sidebar, game library, home screen, game detail, settings, dashboard, analytics, report, revenue, KPI.

### Read `references/game-ui.md` when:
Mobile screen, splash screen, loading screen, HUD, score, reward popup, onboarding, game icon.

### Read BOTH when:
Cross-platform consistency, design tokens docs, component library, or platform unclear.
