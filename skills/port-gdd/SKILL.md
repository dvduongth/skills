---
name: port-gdd
description: "Reverse-engineer GDD (design-doc) từ clientccn2 (JS) + serverccn2 (Kotlin) source code. Output compatible với /dev-specs."
argument-hint: "<module>"
---

# port-gdd — Legacy Code to GDD Extraction

**Owner**: agent_dev (Tech Lead)
**Phase**: 1-analyze (runs before dev-specs)
**Purpose**: Analyze legacy module source and produce a design-doc compatible with dev-specs skill.

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module` | string | yes | Module name, e.g. "login", "lobby", "shop" |

## Prerequisites

**MUST check before starting:**

1. **clientccn2 git-nexus index exists:**
   ```bash
   cat D:\PROJECT\CCN2\clientccn2\.gitnexus\meta.json
   ```
   If missing → STOP and guide user:
   ```
   Missing git-nexus index for clientccn2. Run:
     cd D:\PROJECT\CCN2\clientccn2
     npx gitnexus analyze
   Then re-run: /port-gdd <module>
   ```

2. **serverccn2 git-nexus index exists:**
   ```bash
   cat D:\PROJECT\CCN2\serverccn2\.gitnexus\meta.json
   ```
   If missing → STOP and guide user (same pattern).

---

## Source Paths

| Source | Path Pattern | Content |
|--------|--------------|---------|
| Client JS | `D:\PROJECT\CCN2\clientccn2\src\modules\<module>\` | UI, screens, client logic |
| Server Kotlin | `D:\PROJECT\CCN2\serverccn2\src\main\kotlin\org\ccn2\` | CMD handlers, business logic |
| Assets | `D:\PROJECT\CCN2\studioccn2\cocosstudio\high\<module>\` | CocosStudio UI assets |
| Configs | `D:\PROJECT\CCN2\serverccn2\config\` | Game configs |

---

## Workflow

### Step 1: Query clientccn2 via git-nexus

Navigate to client repo and query for module-related code:

```bash
cd D:\PROJECT\CCN2\clientccn2
```

Then use git-nexus MCP tools:

```
gitnexus_query({query: "<module> screen scene view layer"})
gitnexus_query({query: "<module> sendPacket CMD"})
gitnexus_context({name: "<ModuleName>Layer"})
gitnexus_context({name: "<ModuleName>Scene"})
```

**Extract from client:**
- Screen classes and navigation flow
- UI components and layouts
- Client state machine (if any)
- Packet send structures (CMD IDs, parameters)
- Event handlers and callbacks

### Step 2: Query serverccn2 via git-nexus

Navigate to server repo and query for handlers:

```bash
cd D:\PROJECT\CCN2\serverccn2
```

Then use git-nexus MCP tools:

```
gitnexus_query({query: "<module> CMD handler command"})
gitnexus_context({name: "<ModuleName>Cmd"})
gitnexus_context({name: "<ModuleName>Handler"})
```

**Extract from server:**
- CMD handler classes
- Business logic and validation
- Packet recv structures (response format)
- Config values and constants
- Database interactions (if any)

### Step 3: Detect assets in studioccn2

Check if CocosStudio assets exist:

```bash
ls "D:\PROJECT\CCN2\studioccn2\cocosstudio\high\<module>\"
```

**Determine tier_available:**
| Condition | tier_available |
|-----------|----------------|
| Assets folder exists + files present | `full` |
| No assets but has UI code in client | `proto` |
| No assets and no UI code | `console` |

### Step 4: Generate GDD

Create design doc at: `docs/design-docs/<module>/design-doc.md`

**Template:**

```markdown
---
type: port-gdd
source_client: clientccn2/src/modules/<module>/
source_server: serverccn2/src/main/kotlin/org/ccn2/modules/<module>/
source_client_loc: <number>
source_server_loc: <number>
analyzed_via: git-nexus
analyzed_at: <YYYY-MM-DD HH:mm>
tier_available: full | proto | console
assets_path: studioccn2/cocosstudio/high/<module>/
assets_count: <number> files
status: DRAFT
---

# GDD — <Module Name> (CCN2 Port)

## 1. Overview

Brief description of the module's purpose and core functionality.

## 2. Core Mechanics

- Primary gameplay/feature mechanics
- State machines and transitions
- Key business rules

## 3. Screens & Flow

```
[Entry] → [Screen A] → [Screen B] → [Exit]
```

Document each screen:
- Purpose
- UI elements
- Transitions

## 4. Data Models

### Client State
- Session data
- Local cache

### Server State
- Database entities
- Config structures

## 5. Economy

- Currency/resource flows (if applicable)
- Transaction types
- Validation rules

## 6. UI/UX Notes

- Layout patterns
- Responsive behavior
- Accessibility considerations

## 7. Animation & Transition Specs

- Screen transitions (fade, slide, etc.)
- Button feedback
- Loading states

## 8. API Reference

### Client → Server (Send Packets)

| CMD | Name | Parameters | Notes |
|-----|------|------------|-------|
| 0x... | CMD_NAME | param1: type, ... | Description |

### Server → Client (Recv Packets)

| CMD | Name | Response | Notes |
|-----|------|----------|-------|
| 0x... | CMD_NAME | field1: type, ... | Description |

## 9. Known Gaps & Port Notes

### 9.1 Design Gaps
- Features unclear from code
- Missing documentation

### 9.2 Port-Specific (JS→GDScript)
- Patterns that need translation
- Cocos → Godot mappings

### 9.3 Assumptions
- Decisions made during analysis
- Inferred behavior

### 9.4 Open Questions
- [ ] Question 1
- [ ] Question 2
```

---

## Completion

After generating the GDD:

1. **Save to**: `docs/design-docs/<module>/design-doc.md`
2. **Set status**: `DRAFT` in frontmatter
3. **Report summary**:
   ```
   GDD generated: docs/design-docs/<module>/design-doc.md
   
   Summary:
   - Screens: <N> identified
   - Packets: <N> CMDs mapped
   - Tier available: <full|proto|console>
   - Status: DRAFT (pending review)
   
   Next: Review GDD and update status to APPROVED, then run /dev-specs <module>
   ```

---

## Constraints

**DO:**
- Use git-nexus for code navigation (not raw grep/find)
- Document uncertainties in Section 9
- Count LOC for metadata
- Verify packet CMD IDs match between client send and server recv

**DO NOT:**
- Make up features not found in code
- Skip any of the 9 GDD sections (mark N/A if not applicable)
- Modify any source files
- Run the skill if git-nexus indexes are missing

---

## Fallback Strategy

If git-nexus returns insufficient results:

1. **Try alternative queries:**
   ```
   gitnexus_query({query: "<module> layer view"})
   gitnexus_query({query: "<module> packet send"})
   ```

2. **Use targeted Grep** (only if git-nexus fails):
   ```bash
   # Client - find module entry points
   grep -r "class.*<Module>" D:\PROJECT\CCN2\clientccn2\src\modules\<module>\
   
   # Server - find CMD handlers  
   grep -r "CMD_<MODULE>" D:\PROJECT\CCN2\serverccn2\src\main\kotlin\
   ```

3. **Read files directly** only for specific classes identified by queries.

---

*Skill created: 2026-04-10*
*Owner: agent_dev (Tech Lead)*
