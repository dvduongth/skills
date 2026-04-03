---
name: reflect
description: "Self-reflect after a workflow step: read the latest run artifacts for a feature, extract actionable learnings, update memory/mistakes.md, memory/patterns.md, and memory/quality-trends.md directly. No insight files."
argument-hint: "<feature_id> [--step ingest|doc|validate|evaluate|promote]"
---

# Reflect Skill

## Role boundary
You are a **reflective analyst**. Your job is to review what just happened in a workflow step and extract actionable learnings. You do NOT re-do the step, fix issues, or modify design docs. You only observe, analyze, and record.

## Goal
After any workflow step completes, capture structured insights into persistent memory so future sessions benefit from accumulated experience.

## Inputs
- **feature_id** (required): The feature whose latest run to reflect on.
- **--step** (optional): Specific step to reflect on (ingest, doc, validate, evaluate, promote). If omitted, auto-detect the most recent run folder.

## Process

### Step 1 — Locate run artifacts

1. List folders under `docs/runs/<feature_id>/` sorted by timestamp (newest first).
2. If `--step` is provided, find the latest folder matching `*_<step>/`. Otherwise use the newest folder.
3. If no run folder found → report "No run artifacts found for <feature_id>" and stop.

### Step 2 — Read run outputs

Read all available files in the run folder. Key files to look for:
- `notes.md` — workflow notes, decisions, blockers
- `input.md` — what was fed into the step
- `output.md` — raw output
- `mechanics-evaluation.md` / `mechanics-evaluation.json` — evaluation results
- `validation-report.md` — validation results
- `ingest-summary.md` — ingest findings
- Any other `.md` or `.json` files present

### Step 3 — Read existing memory (context)

Read these files if they exist (do NOT fail if missing):
- `memory/patterns.md` — known recurring patterns
- `memory/mistakes.md` — known common mistakes
- `memory/quality-trends.md` — historical scores

This context helps you identify whether current observations are recurring or new.

### Step 4 — Classify findings

For each finding from the run, classify it into one of:

| Finding type | Action |
|---|---|
| New repeatable mistake (wrong flag, wrong path, silent guess) | Add to `mistakes.md` |
| Same mistake seen in a different feature/skill | Update `Also seen in` in `mistakes.md` + if ≥2 → promote to `patterns.md` |
| Mistake already fixed and won't recur | Set `Status: resolved` in `mistakes.md` |
| Score data from `mechanics-evaluation.json` | Add row to `quality-trends.md` |
| User correction or workflow preference | Add to `preferences.md` |
| Nothing new / session was clean | Write nothing |

**Do NOT create insight files. Memory = only what's needed before doing the same task again.**

### Step 5 — Update mistakes registry

If new mistakes found:
1. Check `memory/mistakes.md` for existing entry (same symptom/root cause).
2. If exists: update `Also seen in` list.
3. If new: append entry using format:

```markdown
## MST-NNN: <mistake summary>
- First seen: YYYY-MM-DD, feature/skill: <id>
- Also seen in: []
- Symptom: <what went wrong>
- Root cause: <why>
- Fix: <what to do instead>
- Status: active | resolved
```

Keep each entry ≤6 lines. No narrative, no "what went well".

### Step 6 — Promote to patterns (if applicable)

1. Scan `mistakes.md` for entries where `Also seen in` has ≥1 entry (= 2 independent observations).
2. If a matching pattern doesn't exist in `patterns.md` yet → create it.
3. If it exists → update `Last observed` and `Observed in`.

Pattern entry format:
```markdown
## PAT-NNN: <pattern name>
- Observed in: [feature_id_1, feature_id_2]
- Last observed: YYYY-MM-DD
- Root cause: <analysis>
- Recommended fix: <specific file + change>
- Status: active
```

### Step 7 — Update quality trends (if evaluation data available)

If the run folder contains `mechanics-evaluation.json`:
1. Read `memory/quality-trends.md`.
2. Add a new row to the Dimension Scores table.
3. Update Observations if trends are visible.

## Output

Summarize to the user (plain text, no file dump):
- What was updated (mistakes / patterns / trends / preferences / nothing)
- Any new mistakes added (MST-NNN: title)
- Any patterns promoted (PAT-NNN: title)
- Top 1-2 action items for next session

## Important rules

- **Do NOT modify any files outside of `memory/`**. This skill is read-only on everything except memory files.
- **Do NOT re-run or redo the workflow step**. Only observe and record.
- **Be honest in reflection** — do not inflate "what went well" or downplay issues.
- **Be specific** — vague insights like "could be better" are useless. Cite specific artifacts, scores, sections.
- **Require evidence** — only create patterns with ≥2 independent observations from different features.
