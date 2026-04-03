---
name: mermaid-diagram
description: Use when creating or editing Mermaid diagrams for designers or developers — flowcharts, sequence, state, class, ER, deployment diagrams. Apply when diagram needs theme, highlights, node spacing, readable labels, UML compatibility, or inline notes/comments.
---

# Mermaid Diagram — Router

## Core Rules (always apply)

- **`\n` does NOT work** in node labels — always use `<br>`
- **Backtick wrap** required when label contains `<br>`: `` [`"text<br>line2`"] ``
- **Every `style` / `classDef`** MUST include `color:` (WCAG AA contrast)
- **Validate** before finalizing: paste into https://mermaid.live
- **File extension:** save diagram files as `.md`, not `.mmd`

---

## Intent → Guide (load the matching guide)

| User intent / keywords | Load guide |
|------------------------|------------|
| flow, process, logic, business rule, loop | `guides/flowchart.md` |
| API, request/response, call sequence, interaction | `guides/sequence.md` |
| class, object, UML, domain model, interface | `guides/class-diagram.md` |
| state machine, status, transition, lifecycle | `guides/state-diagram.md` |
| infra, deploy, cloud, network, server, k8s | `guides/deployment.md` |
| icon, symbol, emoji, semantic marker | `guides/unicode-symbols.md` |
| convert code to diagram, read source code | `guides/code-to-diagram.md` |
| parse error, broken diagram, fix mermaid | `troubleshooting.md` |
| extract / validate diagrams from .md files | `scripts/extract_mermaid.py` |
| export diagrams to PNG or SVG | `scripts/mermaid_to_image.py` |

---

## Theme Block (copy into every diagram)

```
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor':       '#1e3a5f',
    'primaryTextColor':   '#ffffff',
    'primaryBorderColor': '#0d2137',
    'lineColor':          '#4a90d9',
    'secondaryColor':     '#2e5f8a',
    'tertiaryColor':      '#0a1f33',
    'background':         '#0a1f33',
    'nodeBorder':         '#4a90d9',
    'clusterBkg':         '#0d2b44',
    'titleColor':         '#e8f4fd',
    'edgeLabelBackground':'#0d2b44',
    'fontFamily':         'Segoe UI, Arial, sans-serif',
    'fontSize':           '14px'
  }
}}%%
```

---

## High-Contrast Palette (WCAG AA)

| State | Fill | Stroke | Text |
|-------|------|--------|------|
| Start / trigger | `#1565c0` | `#90caf9` | `#fff` |
| End / success | `#2e7d32` | `#a5d6a7` | `#fff` |
| Critical decision | `#e65100` | `#ffcc80` | `#fff` |
| Error / failure | `#b71c1c` | `#ef9a9a` | `#fff` |
| Important action | `#4a148c` | `#ce93d8` | `#fff` |
| Warning | `#f57f17` | `#ffe082` | `#000` |
| Info / loop | `#0277bd` | `#81d4fa` | `#fff` |
| Normal (default) | theme default | — | theme default |

**Rule:** light fill → dark text (`#000`); dark fill → light text (`#fff`).

---

## Section Comments Pattern

```
%% ─── SECTION NAME ────────────────────────────────────────────
%% One-line explanation of what this section does
```

Use before every logical group of nodes. First comment = diagram title.

---

## Checklist Before Finalizing

- [ ] `%%{init}` theme block present
- [ ] All `\n` replaced with `<br>`
- [ ] `<br>` labels wrapped in backticks
- [ ] Every `style`/`classDef` has `color:`
- [ ] Start, end, critical nodes highlighted
- [ ] Section `%% ───` comments present
- [ ] Labels ≤ 6 words per line
- [ ] All `style` lines at bottom (after edges)
- [ ] Rendered without parse errors at mermaid.live
