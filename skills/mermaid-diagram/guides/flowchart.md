# Flowchart Guide

Use for: processes, business logic, algorithms, loops, decision trees, game flows.

---

## Node Shapes

```
[Text]       rectangle     — action, step
{Text}       diamond       — decision / condition
([Text])     stadium       — start / end / terminal
[[Text]]     subroutine    — sub-process (calls another flow)
[(Text)]     cylinder      — database / storage
((Text))     circle        — event / junction
>Text]       flag          — annotation / note inline
```

## Edge Types

```
A --> B               solid arrow (default)
A --- B               solid line, no arrow
A -.-> B              dashed arrow (optional / async path)
A ==> B               thick arrow (critical / main path)
A -->|label| B        labelled edge
A -.->|loop| B        dashed labelled (loop back)
A -- "long label" --> B   quoted label for spaces/special chars
```

## Multi-line Labels

```
A["`Line 1<br>Line 2`"]          ← backticks required with <br>
A{"`Condition?<br>detail`"}
A(["`**Bold Title**<br>subtitle`"])
```

---

## Layout Direction

| Code | Use when |
|------|----------|
| `flowchart TD` | Most flows — top-down, reads naturally |
| `flowchart LR` | Pipelines, architectures, wide data flows |
| `flowchart TB` | Alias for TD |
| `flowchart BT` | Rarely — bottom-up escalation flows |

---

## Subgraphs (Swimlanes / Clusters)

```
flowchart TD
    subgraph SG1 ["🎮 Game Layer"]
        direction TD
        A --> B
    end

    subgraph SG2 ["⚙️ Engine Layer"]
        direction TD
        C --> D
    end

    SG1 --> SG2
```

**Rules:**
- One blank line before and after `subgraph` / `end`
- `direction` inside subgraph overrides parent
- Style subgraph bg via `style SG1 fill:#0d2b44,stroke:#4a90d9,color:#fff`

---

## Full Template

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#1e3a5f', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#0d2137', 'lineColor': '#4a90d9', 'background': '#0a1f33', 'nodeBorder': '#4a90d9', 'clusterBkg': '#0d2b44', 'edgeLabelBackground': '#0d2b44', 'fontFamily': 'Segoe UI, Arial, sans-serif', 'fontSize': '14px' } }}%%
flowchart TD
    %% ─── [Diagram Title] ──────────────────────────────────────
    %% Purpose: one-line description of what this flow shows

    %% ─── INPUT ─────────────────────────────────────────────────
    START(["`**Entry**<br>trigger description`"])

    %% ─── MAIN LOGIC ────────────────────────────────────────────
    D1{"`Condition?<br>context`"}
    N1["`Action A<br>detail`"]
    N2["`Action B<br>detail`"]

    %% ─── EXIT ──────────────────────────────────────────────────
    END(["`**Done**<br>result`"])

    %% ─── EDGES ─────────────────────────────────────────────────
    START --> D1
    D1    -->|Yes| N1
    D1    -->|No|  N2
    N1    --> END
    N2    --> END

    %% ─── STYLES ────────────────────────────────────────────────
    style START fill:#1565c0,stroke:#90caf9,stroke-width:2px,color:#fff
    style END   fill:#2e7d32,stroke:#a5d6a7,stroke-width:2px,color:#fff
    style D1    fill:#e65100,stroke:#ffcc80,stroke-width:2px,color:#fff
```

---

## Patterns

### Loop / Cascading

```
    N  --> O
    O  -.->|loop| SCAN_START

    style O fill:#0277bd,stroke:#81d4fa,stroke-width:2px,color:#fff
```

### Parallel Paths (merge)

```
    GATE --> PATH_A & PATH_B
    PATH_A --> MERGE
    PATH_B --> MERGE
```

### Error Branch

```
    ACTION -->|ok| NEXT
    ACTION -->|error| ERR(["`**Error**<br>description`"])

    style ERR fill:#b71c1c,stroke:#ef9a9a,stroke-width:2px,color:#fff
```

### Swimlane (subgraph per actor)

```
flowchart LR
    subgraph USER ["👤 User"]
        U1["`Submit form`"]
    end
    subgraph SERVER ["🖥 Server"]
        S1["`Validate`"]
        S2["`Save to DB`"]
    end
    subgraph DB ["🗄 Database"]
        D1[("`users table`")]
    end

    U1 --> S1 --> S2 --> D1
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `\n` in label | Replace with `<br>` |
| `<br>` without backticks | Wrap: `` [`"text<br>line2`"] `` |
| `style` declared before `subgraph end` | Move all `style` lines after last edge |
| Node IDs with spaces | Use camelCase or snake_case: `myNode`, `my_node` |
| Diamond label too long | Split: `` {"`Short?<br>long condition`"} `` |
| Forgetting `color:` in style | Always: `fill:#...,stroke:#...,color:#fff` |
| Reserved words as node IDs | Avoid: `end`, `style`, `graph`, `subgraph` — use `END`, `STYLE` |
