---
name: plan-verification
description: Use after writing-plans to verify plan assumptions before execution handoff. Required gate - blocks if assumptions fail.
---

# Plan Verification

## Overview

Verify plan assumptions are true before execution handoff. This prevents "claim done but code doesn't exist" bugs where plans contain false assumptions about existing code, paths, or dependencies.

**Core principle:** Evidence before execution, always.

**Trigger point:**

    writing-plans → [plan-verification] ─┬─ PASS → executing-plans
                          ↑              │
                     YOU ARE HERE        └─ FAIL → Fix / Override / Abort

## The Gate (Iron Rule)

    NO EXECUTION HANDOFF WITHOUT VERIFICATION PASS

If you haven't verified each assumption in the plan, you cannot proceed to execution.

## Input: Assumptions to Verify Section

Plans MUST include this section:

```markdown
## Assumptions to Verify

### Code Existence
- [ ] `functionName` exists in `path/to/file.ext`

### File Paths
- [ ] Directory exists: `path/to/directory/`

### Dependencies
- [ ] `ModuleName` has `expectedExport` in `path/to/module`

### Already Done
- [ ] Phase N artifacts exist at `path/to/artifacts/`
```

If a plan lacks this section, add it before proceeding.

## Auto-Scan Patterns

After parsing the explicit section, scan plan text for implicit assumptions:

| Category | Pattern | Example |
|----------|---------|---------|
| File paths | Backtick paths with `src/`, `shared/`, `.kt`, `.gd`, `.md` | `shared/server/Module.kt` |
| Existence claims | "đã có", "already has", "exists in", "implemented in" | "Server đã có handler X" |
| Done claims | "complete", "đã done", "finished", "Phase N done" | "Phase 1 complete" |
| Dependencies | "requires", "depends on", "needs X ready" | "requires UserModule" |

**Filtering rules:**
- Skip paths inside "Create:" or "to create" context (these are targets, not assumptions)
- Skip example/template paths in code blocks showing format
- Skip paths already in explicit section (no duplicates)

**Present findings:** "Auto-scan found N additional items. Confirm each?"

## Verification Process

For each item in the checklist, determine result:
- ✅ **PASS**: Evidence found, assumption is true
- ❌ **FAIL**: Not found, assumption is false
- ⚠️ **UNCERTAIN**: Ambiguous result, needs human clarification

### Code Existence

1. Grep for function/class name in target file
2. PASS if match found, FAIL if no matches, UNCERTAIN if multiple partial matches
3. Record evidence: grep output or "0 matches"

### File Paths

1. Glob or ls the target path
2. PASS if exists, FAIL if not found, UNCERTAIN if path exists but is empty or has unexpected structure
3. Record evidence: file listing or "path not found"

### Dependencies

1. Grep for expected export/constant in target
2. PASS if found, FAIL if not found, UNCERTAIN if found but different signature
3. Record evidence: line number where found or "not found"

### Already Done

1. Check artifact files exist at specified paths
2. PASS if all exist, FAIL if any missing, UNCERTAIN if files exist but appear incomplete or modified
3. Record evidence: list of found/missing files

## Verification Report

After verifying all items, generate report:

```markdown
## Plan Verification Report

**Plan:** `<plan file path>`
**Status:** ✅ PASSED | ❌ FAILED (N/M passed) | ⚠️ NEEDS REVIEW

### Results

| # | Type | Item | Status | Evidence |
|---|------|------|--------|----------|
| 1 | Code existence | `funcName` in file.kt | ✅ PASS | Found at line 42 |
| 2 | File path | `path/to/dir/` | ❌ FAIL | Directory not found |
| 3 | Dependency | `SomeModule` export | ⚠️ UNCERTAIN | Found but signature differs |

### Failed Items (if any)

1. **Item description**
   - Expected: [what was expected]
   - Searched: [command/method used]
   - Result: [what was found]

### Uncertain Items (if any)

1. **Item description**
   - Expected: [what was expected]
   - Found: [what was actually found]
   - Question: [what needs clarification]
```

## Failure Handling

### Default: BLOCK

When any item FAILs or is UNCERTAIN:
1. Display verification report
2. Block handoff to executing-plans
3. Present options

### User Options

```
❌ VERIFICATION FAILED (N items)

Options:
  [F] Fix plan — correct assumptions, re-verify
  [O] Override — proceed with explicit reason (logged)
  [A] Abort — cancel handoff

Choice: _
```

For UNCERTAIN items, user must either:
- Clarify and re-verify (treat as PASS or FAIL)
- Override with reason

### Override Protocol

If user chooses Override:

1. Prompt for reason for EACH failed/uncertain item
2. Log overrides to plan document (append section)
3. Proceed with warning banner

**Override logging format (append to plan):**

```markdown
---

## Verification Overrides

**Date:** YYYY-MM-DD
**Approved by:** user

| Item | Override Reason |
|------|-----------------|
| `item description` | reason provided |

> ⚠️ This plan proceeded with unverified assumptions.
```

## Re-verification

If plan is edited after verification, status resets to UNVERIFIED:

**Triggers re-verification:**
- Changes to "Assumptions to Verify" section
- Changes to file paths referenced in tasks
- Adding/removing/modifying tasks

**Does NOT trigger re-verification:**
- Typo fixes in prose
- Comment additions
- Formatting changes

When re-verifying:
- Must re-run verification before handoff
- Previous overrides preserved but re-evaluated against current plan state

## Checklist

Before handoff to executing-plans:

- [ ] Plan has "Assumptions to Verify" section (add if missing)
- [ ] All explicit items verified
- [ ] Auto-scan run, candidates reviewed
- [ ] All items PASS or explicitly OVERRIDDEN with reason
- [ ] No UNCERTAIN items remain unresolved
- [ ] Verification report generated

## Integration

**Called by:** `writing-plans` (required after Plan Review Loop, before handoff)
**Calls:** `executing-plans` or `subagent-driven-development` (after pass)

**Related skills:**
- `verification-before-completion` — POST-implementation verification (different scope)
- `writing-plans` — creates plans, invokes this skill
- `executing-plans` — executes verified plans
