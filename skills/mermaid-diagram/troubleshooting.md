# Mermaid Troubleshooting Guide

Top errors encountered when writing Mermaid diagrams, with exact fixes.

---

## Parse Errors (Diagram won't render)

### Error: `\n` in node label

**Symptom:** Diagram breaks after a node with `\n` in its label.

**Cause:** `\n` is not a valid line break in Mermaid node labels.

**Fix:** Replace `\n` with `<br>` AND wrap label in backticks:
```
❌ A["`Action\ndetail`"]
✅ A["`Action<br>detail`"]
```

---

### Error: `<br>` not rendering (shows as literal text)

**Symptom:** `<br>` appears as text in the rendered node.

**Cause:** Label not wrapped in backticks.

**Fix:** Backtick-wrap the label:
```
❌ A["text<br>line2"]
✅ A["`text<br>line2`"]
```

---

### Error: Reserved word as node ID

**Symptom:** Parse error at specific node.

**Common reserved words:** `end`, `style`, `graph`, `subgraph`, `flowchart`, `classDef`, `class`, `direction`, `click`, `callback`

**Fix:** Rename the node ID:
```
❌ end([End])
✅ END([End])
✅ DONE([End])
```

---

### Error: Special characters in label break parsing

**Symptom:** Labels with `()`, `[]`, `{}`, `"`, `'`, `:`, `#` cause parse errors.

**Fix:** Wrap with backticks, or use HTML entities:
```
❌ A[Check if x > 0]
✅ A["`Check if x &gt; 0`"]
✅ A["`Check if x > 0`"]     ← backticks usually fix it
```

Common escapes: `&gt;` `&lt;` `&amp;` `&quot;`

---

### Error: `style` before `subgraph end`

**Symptom:** Styles not applying or parse error in subgraph.

**Fix:** Move all `style` declarations to after the last `end` keyword:
```
❌
subgraph SG
    A --> B
    style A fill:#...    ← inside subgraph = problem
end

✅
subgraph SG
    A --> B
end
style A fill:#...        ← after all subgraphs
```

---

### Error: Missing `end` in subgraph

**Symptom:** Everything after subgraph fails to parse.

**Fix:** Every `subgraph` must have a matching `end`:
```
subgraph MyGroup ["Title"]
    A --> B
end          ← required
```

---

### Error: Arrow syntax wrong in sequenceDiagram

**Symptom:** Sequence diagram arrows cause parse error.

**Valid arrow types:**
```
->>     solid arrow
-->>    dashed arrow
-x      X head (failure)
-)      open arrow (fire-and-forget)
->>+    activate
-->>-   deactivate
```

**Invalid:**
```
❌ ->    (single dash not valid)
❌ -->   (double dash + single > not valid in sequence)
```

---

### Error: `classDef` applied with wrong syntax

**Symptom:** Style not applied to class node.

**Fix:** Use `:::` (three colons) to apply a `classDef`:
```
❌ class Foo:myStyle
✅ class Foo:::myStyle
```

---

### Error: Missing colon in stateDiagram transition

**Symptom:** Transition label not showing or parse error.

**Fix:** Transition label requires ` : ` (space colon space):
```
❌ StateA --> StateB trigger
✅ StateA --> StateB : trigger
```

---

### Error: Diagram renders but low contrast / unreadable

**Symptom:** Text invisible or hard to read on node background.

**Cause:** Missing `color:` in `style` or `classDef`.

**Fix — check rule:**
- Dark fill (`#1565c0`, `#4a148c`, `#2e7d32`) → `color:#fff`
- Light fill (`#fff`, `#f5f5f5`, `#ffe082`) → `color:#000`

```
❌ style A fill:#1565c0,stroke:#90caf9
✅ style A fill:#1565c0,stroke:#90caf9,color:#fff
```

**Quick audit:** search for `style` or `classDef` lines missing `color:`:
```
grep "style\|classDef" file.md | grep -v "color:"
```
Any results = contrast issue.

---

### Error: `%%{init}` not applying theme

**Symptom:** Theme block present but styles ignored.

**Common causes:**

1. Syntax error in the init block (mismatched quotes, trailing comma):
```
❌ 'fontSize': '14px',   ← trailing comma before closing }
✅ 'fontSize': '14px'
```

2. Single-line init block with inner quotes conflicting:
```
❌ %%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1e3a5f"}}}%%
✅ Use the multi-line format with single quotes
```

3. Wrong placement — init block must be the very first line:
```
❌
# Title
%%{init: ...}%%
flowchart TD

✅
%%{init: ...}%%
flowchart TD
```

---

### Error: Subgraph direction ignored

**Symptom:** Nodes inside subgraph don't follow the specified direction.

**Fix:** Declare `direction` as the very first line inside the subgraph:
```
subgraph SG ["Title"]
    direction LR      ← must be first line
    A --> B
end
```

---

### Error: Long edge label overflows / overlaps

**Symptom:** Edge label text overlaps nodes or is unreadable.

**Fix:** Keep edge labels ≤ 4 words. Move detail to a node comment or Note:
```
❌ A -->|This is a very long description of what happens| B
✅ A -->|validate & save| B
   %% Validation: checks schema, then persists to DB
```

---

### Error: Diagram too tall/wide, nodes overlap

**Symptom:** Nodes stack or overlap when many nodes in a single flow.

**Fixes:**
1. Switch direction: `TD` → `LR` (or vice versa)
2. Split into subgraphs to group related nodes
3. Break into 2–3 separate diagrams (overview + detail)
4. Reduce node count — merge steps that always happen together

---

## Quick Diagnostic Checklist

When a diagram won't render, check in order:

1. `\n` in labels → replace with `<br>` + backticks
2. Reserved word as node ID → rename
3. Missing `end` after `subgraph`
4. `style` inside `subgraph` → move after `end`
5. `%%{init}` not first line → move to top
6. Trailing comma in init JSON → remove
7. Paste into https://mermaid.live for exact error line
