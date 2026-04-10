---
name: port-legacy
description: "Orchestrator: Port module từ clientccn2/serverccn2 → Godot 4.6 với full pipeline (GDD → specs → plan → implement → verify)"
argument-hint: "<module> [--tier=console|proto] [--restart]"
---

# port-legacy — Full Pipeline Orchestrator

**Owner**: agent_dev (Tech Lead)
**Phase**: orchestrator (manages phases 1-6)
**Purpose**: Coordinate full porting pipeline from legacy CCN2 codebase to Godot 4.6 with 3-tier architecture.

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module` | string | yes | Module name: "login", "lobby", "shop", etc. |

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--tier=console\|proto` | auto | Override tier (can only go DOWN from auto-detected) |
| `--restart` | false | Ignore existing artifacts, start pipeline fresh |

**Tier Override Rules:**
- Auto-detect determines max available tier based on assets
- `--tier` can only override DOWN (e.g., if auto=full, can use `--tier=proto` or `--tier=console`)
- Cannot override UP (if no assets exist, cannot force `--tier=full`)

---

## Pipeline Phases

### Phase 0: Prerequisites Check

**MUST pass before any other phase:**

```bash
# Check clientccn2 git-nexus index
cat D:\PROJECT\CCN2\clientccn2\.gitnexus\meta.json

# Check serverccn2 git-nexus index  
cat D:\PROJECT\CCN2\serverccn2\.gitnexus\meta.json
```

**If either missing → FAIL FAST:**

```
PREREQUISITES FAILED

Missing git-nexus index for <repo>. Run:
  cd D:\PROJECT\CCN2\<repo>
  npx gitnexus analyze

Then re-run: /port-legacy <module>
```

**Do NOT proceed** if prerequisites fail. User must fix before continuing.

### Phase 1: State Detection (Auto-resume)

Check existing artifacts to determine where to resume:

```
Artifact Paths:
- GDD:    docs/design-docs/<module>/design-doc.md
- Specs:  specs/<module>/requirements.md (+ use-cases.md, acceptance-criteria.md)
- Plan:   plans/<module>/tasks.md
- Mapping: shared/knowledge/port-mappings/<module>-mapping.md
- Impl:   shared/godot-client/client-ai-godot/modules/<module>/
```

**State Detection Logic:**

| Check | Condition | Result |
|-------|-----------|--------|
| Implementation exists + has 3-tier scenes | `modules/<module>/scenes/*.tscn` with Console/Proto/Full | STATE_COMPLETE → Report done |
| Plan exists | `plans/<module>/tasks.md` | STATE_PLAN_OK → Gate 2 → Phase 5 |
| Specs exist | `specs/<module>/requirements.md` | STATE_SPECS_OK → Phase 4 |
| GDD exists + APPROVED | Frontmatter `status: APPROVED` | STATE_GDD_OK → Phase 3 |
| GDD exists + DRAFT | Frontmatter `status: DRAFT` | STATE_GDD_DRAFT → Gate 1 |
| Nothing exists | No artifacts found | STATE_FRESH → Phase 2 |

**If `--restart` flag:** Skip state detection, treat as STATE_FRESH.

### Phase 2: GDD Extraction

**Invoke:** `/port-gdd <module>`

This invokes the standalone port-gdd skill which:
1. Queries clientccn2 via git-nexus (screens, UI, packets)
2. Queries serverccn2 via git-nexus (handlers, logic)
3. Detects assets in studioccn2
4. Generates GDD at `docs/design-docs/<module>/design-doc.md`

**Output:** GDD with status=DRAFT

### Gate 1: User Review GDD

**STOP and ask user:**

```
GATE 1: GDD Ready for Review

File: docs/design-docs/<module>/design-doc.md

Summary:
- Screens: <N> screens identified
- Packets: <N> CMDs mapped  
- Tier available: <full|proto|console>
- Status: DRAFT

Action required: Review GDD và approve để tiếp tục.
→ [Approve] để continue
→ [Request Changes] để edit GDD
```

**On Approve:** Update GDD frontmatter `status: APPROVED`, proceed to Phase 3.
**On Request Changes:** Wait for user to edit, then re-present gate.

### Phase 3: Dev Specs

**Invoke:** `/dev-specs <module>`

Input: `docs/design-docs/<module>/design-doc.md`
Output:
- `specs/<module>/requirements.md`
- `specs/<module>/use-cases.md`
- `specs/<module>/acceptance-criteria.md`

### Phase 4: Dev Plan

**Invoke:** `/dev-plan <module>`

Input: `specs/<module>/` (all 3 files)
Output: `plans/<module>/tasks.md`

### Phase 4.5: Port Analyzer (Mapping)

**Invoke:** `/port-analyzer <module>`

Input: GDD + legacy source code
Output: `shared/knowledge/port-mappings/<module>-mapping.md`

**Critical:** port-implementer requires this mapping file. Do NOT skip.

### Gate 2: User Review Plan

**STOP and ask user:**

```
GATE 2: Implementation Plan Ready

Files:
- Specs: specs/<module>/ (requirements.md, use-cases.md, acceptance-criteria.md)
- Plan: plans/<module>/tasks.md
- Mapping: shared/knowledge/port-mappings/<module>-mapping.md

Summary:
- Tasks: <N> tasks in plan
- Estimated tier: <full|proto|console>
- Mapping: <N> files mapped

Action required: Review plan và approve để implement.
→ [Approve] để start implementation
→ [Request Changes] để edit plan
```

**On Approve:** Proceed to Phase 5.
**On Request Changes:** Wait for user to edit, then re-present gate.

### Phase 5: Implementation

**Invoke:** `/port-implementer`

Pass parameters:
- `mapping_path`: `shared/knowledge/port-mappings/<module>-mapping.md`
- `target_module`: `<module>`

port-implementer follows 3-tier architecture:
1. **Console tier**: State machine + packets + tests
2. **Proto tier**: Components + UI wiring + proto scenes
3. **Full tier**: Production art + assets + final scenes

**Tier determination:**
- If `--tier` flag specified: stop at that tier
- Else: use `tier_available` from GDD metadata

### Phase 6: Verification & Completion

**BOTH must pass before reporting DONE:**

#### 6.1 Client Verification (godot-mcp)

```
mcp__godot-mcp__editor_get_errors()
→ Must return empty array

mcp__godot-mcp__script_validate({path: "res://modules/<module>/"})
→ All scripts must pass

mcp__godot-mcp__scene_open(<scene_path>)
→ No parse errors for each .tscn
```

#### 6.2 Server Verification (gradle)

```bash
cd D:\PROJECT\CCN2\serverccn2
./gradlew compileKotlin
→ Exit code 0 required
```

**Note:** Server verification only needed if server files were modified (packets, handlers).

#### 6.3 Done Criteria

| Check | Required | Action if Fail |
|-------|----------|----------------|
| Client errors = 0 | YES | Fix errors, retry |
| Client scripts valid | YES | Fix scripts, retry |
| Server compile pass | If server changes | Fix server code, retry |

**If ALL pass:**

```
PORT COMPLETE: <module>

Client verification:
✓ 0 editor errors
✓ All scripts valid
✓ All scenes load

Server verification:
✓ Kotlin compile pass (or N/A if no server changes)

Artifacts:
- GDD: docs/design-docs/<module>/design-doc.md
- Specs: specs/<module>/
- Plan: plans/<module>/tasks.md
- Mapping: shared/knowledge/port-mappings/<module>-mapping.md
- Implementation: shared/godot-client/client-ai-godot/modules/<module>/

Tier: <console|proto|full>
```

**If ANY fail:** Report errors, do NOT mark as done.

---

## Error Handling

| Error | Action |
|-------|--------|
| Missing git-nexus index | Phase 0: Fail fast, guide user to run `npx gitnexus analyze` |
| /port-gdd fails | Stop pipeline, report which step failed, preserve any partial GDD |
| /dev-specs fails | Stop at Phase 3, report error, GDD remains valid |
| /dev-plan fails | Stop at Phase 4, report error, specs remain valid |
| /port-analyzer fails | Stop at Phase 4.5, report error, plan remains valid |
| /port-implementer fails | Stop at Phase 5, report which tier failed, partial impl preserved |
| Gate rejected | Stop gracefully, report what artifacts are ready |
| Verification fails | Report specific errors, do NOT mark done |

**On any failure:**
1. Report which phase failed
2. Preserve all completed artifacts
3. User can re-run `/port-legacy <module>` to resume from detected state

---

## Example Usage

```bash
# Full pipeline (recommended)
/port-legacy login

# Stop at Proto tier (skip Full tier assets)
/port-legacy lobby --tier=proto

# Console tier only (state machine + packets)
/port-legacy shop --tier=console

# Force restart (ignore existing artifacts)
/port-legacy login --restart

# Standalone GDD only (no orchestration)
/port-gdd login
```

---

## Skills Invoked

| Phase | Skill | Purpose |
|-------|-------|---------|
| 2 | `/port-gdd` | Reverse-engineer GDD from legacy code |
| 3 | `/dev-specs` | Generate requirements, use-cases, ACs |
| 4 | `/dev-plan` | Generate task breakdown |
| 4.5 | `/port-analyzer` | Generate mapping document |
| 5 | `/port-implementer` | Implement 3-tier Godot module |

---

*Skill created: 2026-04-10*
*Owner: agent_dev (Tech Lead)*
