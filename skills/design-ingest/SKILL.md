---
name: design-ingest
description: "(Designer) Ingest sources into a structured package (manifest + summary + open questions) saved under docs/runs/<feature_id>/..."
disable-model-invocation: true
argument-hint: "<feature_id> [--sources <text-or-list>] [--constraints <text>] [--seeds] [--brief]"
---

# Design Ingest Skill

## Role/Owner

- Owner role: Designer

- Primary agent: Designer Agent (Source Ingest)

- Handoff: outputs -> design-doc

## Role boundary (CRITICAL)
This skill is **Discovery only**. Its job is to classify and surface information — NOT to pre-format it into spec or design format. Do not write requirements, use cases, or acceptance criteria here. That is the job of `design_doc`.

## Goal
Convert messy inputs (docs/links/notes/raw text) into an **Ingest Package** that gives `design_doc` everything it needs to make good decisions.

## When to use
Use this skill when:
- Starting a new feature and sources are scattered.
- Requirements are unclear and need normalization.
- You want a durable audit trail of what information was used.

## Inputs
- **feature_id** (required): `NNN-slug` (e.g., `001-login`)
- **sources** (required): list of sources OR pasted raw text
- **constraints** (optional): deadline/platform/policy/technical limitations
- **--seeds** (optional flag): only if explicitly requested, generate draft seed files
- **--brief** (optional flag): generate a `requirement-brief.md` formatted for game features (mirrors §1 Feature context + §1 Success metrics + Dependencies + Open Questions of design-doc-template.md). Derived from ingest-summary — reformatting only, no new reasoning.

## Memory reads (if available — do NOT fail if missing)
- If `memory/patterns.md` exists, read active patterns relevant to source ingestion. Apply learnings proactively.
- If `memory/mistakes.md` exists, read active mistakes relevant to ingestion. Avoid repeating them.
- If `memory/constitution.md` exists, read the **Game Context** section (platform, player segments) to understand project defaults — use when generating `requirement-brief.md`.

## Output locations (MUST follow)
Output language: Vietnamese
Create a run folder:
- `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_step1_ingest/`

Write the following files:

### 1) `source-manifest.md`
Use this table format:

| Source ID | Type | Owner | Date | Reliability | Summary |
|---|---|---|---|---|---|
| SRC-01 | doc/link/note/text | ... | YYYY-MM-DD | high/med/low | ... |

Rules:
- Assign `SRC-xx` incrementally
- Reliability is a judgment of confidence, not importance

### 2) `ingest-summary.md`
Header block (replaces separate input.md):
```
Feature ID: <NNN-slug>
Sources: <list or "see source-manifest.md">
Constraints: <if any, else "none">
Date: <YYYY-MM-DD>
```

Then use this structure:

- **Facts** (each line MUST cite a SRC id)
- **Assumptions** (explicitly labeled; no SRC needed unless derived)
- **Decisions** (explicitly labeled)
- **Conflicts / ambiguities**
- **Open questions** (actionable, with who can answer if known)
- **Signals for design_doc** — topics that `design_doc` must decide (NOT pre-decided here; e.g., "Needs decision: 4-player vs 2-player kick logic")

### 3) `notes.md`
Include:
- What’s ready
- What’s missing / blockers
- Recommended next step: usually `/design_doc <feature_id> --ingest_run latest`

### 4) `requirement-brief.md` (ONLY if `--brief` flag is passed)

Generate a lightweight game feature brief derived from `ingest-summary.md`. This is a **reformatting step** — do not introduce new reasoning or decisions.

Structure mirrors design-doc-template.md §1:

```
# Requirement Brief — [Feature Name]

**Feature:** [Name]
**Game:** [Poker / Baccarat / Slots / Tiến Lên / Phỏm]
**Designer:** [Name or TBD]
**Date:** [YYYY-MM-DD]
**Version:** 1.0
**Status:** Draft

## Feature context
| Field | Value |
|-------|-------|
| Feature type | New / Improvement |
| Type tag | coregame / feature / event |
| Segment tags | all_users / free_users / new_users / pay_users / segment_1..6 |
| Primary goal | Retention / Monetization / Engagement / Social |
| Target KPI | [from ingest-summary] |
| Player segment | New / Mid / Whale / All |
| Entry point | [from ingest-summary] |
| Affected systems | Economy / Progression / Social / Matchmaking / None |
| Constraints | [from ingest-summary constraints] |

## Feature description
[2-3 sentences. Focus on WHAT and WHY, not HOW. Derived from ingest-summary Facts.]

**Core value proposition:** [1 sentence]
**User journey:** Player [action] → [experience] → [outcome]

## Scope
### In scope
- [Item]

### Out of scope (explicitly excluded)
- [Item]

## Success metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| [from ingest] | | | |

## Dependencies
| Dependency | Type | Status |
|-----------|------|--------|
| [from ingest] | Blocker / Nice-to-have | Ready / In-progress / Not started |

## Open questions
| # | Question | Owner | Priority | Default if unresolved |
|---|---------|-------|----------|-----------------------|
| OQ-1 | [from ingest Open questions] | Designer / PM / Tech | P0 / P1 | [Fallback action] |
```

Rules:
- `Type tag` and `Segment tags` must be populated — infer from sources or mark as `UNCONFIRMED`
- All content must cite SRC-xx from source-manifest or be labeled as Assumption
- Do NOT introduce product decisions — anything not in sources must be an Assumption or left as `[TBD]`

### 5) Seeds (ONLY if `--seeds` flag is passed)
If explicitly requested, generate:
- `requirements-seeds.md`
- `use-cases-seeds.md`
- `ac-seeds.md`

Rules:
- These are NOT canonical specs. They are drafts derived from sources.
- Use IDs in seeds if possible (REQ-xx, UC-xx, AC-xx).
- **Warning:** Seeds duplicate work that `design_doc` will do. Only use when sources are very rich and the user wants a head start.

## Pre-flight (run before reasoning)

Run these before any LLM reasoning:

1. `python tools/scaffold_run.py <feature_id> ingest`
   Creates the run folder + `input.md`. Note the printed path — write all output files there.
2. `python tools/next_id.py SRC <feature_id>`
   Note the returned SRC ID; start assigning source IDs from this number.

## Quality checklist (must satisfy)
- Facts vs assumptions are clearly separated
- No invented product decisions: anything not in sources must be an assumption
- "Signals for design_doc" section lists open design topics without pre-deciding them
- Open questions are specific and actionable
- No seeds files generated unless `--seeds` flag was passed
- No `requirement-brief.md` generated unless `--brief` flag was passed
- If `--brief` was passed: `requirement-brief.md` has `Type tag` and `Segment tags` populated (or marked `UNCONFIRMED`)
- Files saved under the correct `docs/` paths

## Failure modes & handling
- If sources are insufficient:
  - Still produce the ingest package
  - Mark the package as **NEEDS_CLARIFICATION** in `notes.md`
  - List minimum questions to proceed