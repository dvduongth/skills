---
name: design-validate
description: "(Tester/Reviewer) Validate a feature Design Doc for clarity, completeness, edge cases, and testability; writes a validation report under docs/runs/<feature_id>/..."
disable-model-invocation: true
argument-hint: "<feature_id> [--design_doc canonical|<path>] [--ingest_run <folder|latest>]"
---

# Design Validate Skill

## Intent Layer

### Role
- Owner role: Tester (or Reviewer)
- Primary agent: Design Validator Agent
- Inputs: canonical design doc + latest ingest summary (optional)
- Handoff: PASS → promote/spec step; FAIL → return to design-doc with must-fix list

### Goal
Produce an actionable validation report for a feature Design Doc:
- clarity
- completeness (all required sections present — see checklist)
- edge cases & states
- testability
- mapping readiness (AC/testcases)

### Use when
Use after `design-doc` has produced the canonical design doc at `docs/design-docs/<feature_id>/design-doc.md`.

### Constraints / Requirements
You are an **independent reviewer**. Treat the design doc as a black box — do not assume anything was handled correctly during `design_doc`. Do not give credit for effort; only verify results. Your review must surface issues that a first-time reader would find, not issues the author already knows about.

### Anti-patterns

### Quality standard

### Output format
Output language: Vietnamese

### Invocation parameters
- **feature_id** (required)
- **design_doc** (optional): `canonical` (default) or explicit path
  - canonical path: `docs/design-docs/<feature_id>/design-doc.md`
- **ingest_run** (optional): folder name or `latest`

---

## Knowledge Layer

### Required reading
- Design doc (canonical or provided)
- Latest ingest summary if available: `docs/runs/<feature_id>/<ingest_run>/ingest-summary.md`
- Feature manifest if exists: `docs/design-docs/<feature_id>/manifest.md` — determines which companion docs (e.g., layout-detail.md) to validate
- If manifest shows `layout-detail.md` with status `draft` or `approved`: validate `docs/design-docs/<feature_id>/layout-detail.md` using `templates/references/checklists.md` Layout Detail Checklist

### Domain knowledge

#### Optional section convention
Sections marked `[OPTIONAL]` in the template:
- If **absent**: record as `S-xx [§N Section Name — vắng mặt]` (non-blocking suggestion)
- If **present but empty**: record as `V-xx [§N Section Name — trống]` (must-fix blocking)

#### Known Bugs tracking convention
Known Bugs tracking is NOT a CV item and does NOT affect PASS/FAIL outcome.

### Related skills / prior steps
- Prior: `design-doc`
- Next: `dev-specs` (on PASS)

### Key constraints
**Pre-flight is BLOCKING:** `validate_structure.py` must pass (exit 0) before LLM validation begins. Exit code 1 = report structural issues and stop — do NOT proceed to LLM content review.

---

## Execution Layer

### Pre-flight (BLOCKING — stop if FAIL)

Run before reading the design doc:

1. `python tools/validate_structure.py <feature_id>`
   - Exit code 1 (FAIL): report the structural issues to the user and stop. Do NOT proceed to LLM validation — it would waste tokens on a structurally broken doc.
   - Exit code 0 (PASS): continue.
2. `python tools/scaffold_run.py <feature_id> validate`
   Creates the run folder + `input.md`. Note the printed path.

### Content checklist (walk before writing report)

Walk each item sequentially. Mark pass/fail with evidence.

> Items marked `(game feature)` apply only when the feature is a game mechanic.

#### Header & metadata
- [ ] CV-01: Feature ID present and follows NNN-slug format
- [ ] CV-03: Status is not blank
- [ ] CV-04: Version present

#### §1 Context & Goal
- [ ] CV-05: "What are we designing/formalizing" is non-empty and specific
- [ ] CV-06: Scope (what doc covers / does NOT cover) is stated
- [ ] CV-07 (game feature): Game at a glance table has player count, session length, platform, primary mode

#### §2 Users & Scenarios / Actors
- [ ] CV-08: Player motivation profile is filled (at least motivation type)
- [ ] CV-09: Emotional arc has at least 2 named beats

#### §3 Glossary
- [ ] CV-10: At least 3 terms defined
- [ ] CV-11: Relationships between concepts are described

#### §4 Mechanics & Rules
- [ ] CV-12: Core loop has 3+ steps
- [ ] CV-13: Feedback loop table has reward signal for every action
- [ ] CV-14: Negative feedback / rubber band stance is stated (any answer is valid; silence = fail)
- [ ] CV-15: At least one progression type named
- [ ] CV-16: Win condition AND lose/failure condition both present
- [ ] CV-17: Rules table has at least 2 rules with IDs

#### §5 UX / Interaction Design and §6 Visual Design
- [ ] CV-24: §5 UX/Interaction Design và §6 Visual Design đều có mặt trong design doc

#### §7 Config & Balancing
- [ ] CV-18: Every config parameter has a default value, range/options, AND impact description
- [ ] CV-19: Balancing intent subsection is non-empty

#### §8 Edge Cases
- [ ] CV-20: At least 2 edge cases documented with expected behavior

#### Diagrams
- [ ] CV-23: Any flow with 4+ steps has a Mermaid diagram link inline below it (or explicit note "diagram not required — N steps")

### Scanning protocol (run before writing the report)

Execute all four steps in order. Step results feed directly into the corresponding §5 sub-sections.

#### Step 1 — Enumerate all flows
- List every flow in the doc: main path(s) + all alternative paths.
- Flag any flow that does NOT have a clearly defined start point (trigger/entry condition).
- Flag any flow that does NOT have a clearly defined end point (success / failure / exit).
- Record findings in §5 "Flow coverage".

#### Step 2 — Per-step edge case scan
For every step in every flow, evaluate each of the five categories below.
Record a row in the §5 table ONLY for combinations that are MISSING or need a note.
COVERED steps with no issues may be omitted from the table.
The five categories derive from the ZPS Design Constitution (memory/constitution.md).

| Category | Question to ask |
|---|---|
| Connectivity | Can this step be interrupted by a disconnect? How does reconnect handle it? |
| Resources | Does this step require a resource (chips, materials, energy, lives)? What happens if insufficient? |
| Timeout | Does this step have a timer? What happens when it expires? What happens on action timeout (server no response)? |
| User error | What can the user do wrong here? (double-tap, back button, spam, invalid input) |
| System error | Can a server error or exception occur here? What is the UI fallback? |

Record findings in §5 "Per-step edge case scan results".

#### Step 3 — State machine coverage
For every element that has a state (UI component, game object, session, timer):
- List all states mentioned in the doc.
- Compare against the standard minimal lifecycle: Idle / Active / Loading / Error / Terminal.
- Flag any standard state that is absent from both the doc and the element's own stated taxonomy.
- Flag any transition that lacks a clear trigger condition.
Record findings in §5 "State machine coverage".

#### Step 4 — Metrics scan
Find the analytics/metrics section in the design doc by searching for a section titled "Analytics", "Metrics", or "Analytics events to instrument". Use the section title as the primary identifier (section number varies by doc).
- If no analytics/metrics section is found: record "MISSING — entire metrics section absent" in §5 Metrics coverage.
- If the section exists: record present/missing for each of the five event types: enter / progress / complete / exit / error.

**Severity guidance for metrics gaps:**
- Entire section absent → must-fix (blocking): `V-xx [Analytics — section absent]`
- Missing match/session-level entry event (e.g., `game_start`, `match_start`) → suggestion: `S-xx [Analytics — entry event missing]`
- Missing `exit` or `error` event types → suggestion: `S-xx [Analytics — exit/error event missing]`
- Missing `progress` or `complete` events when a primary KPI depends on them → must-fix (blocking): `V-xx [Analytics — progress/complete event missing]`

Record findings in §5 "Metrics coverage".

### Expected output

#### Output location (MUST follow)
Create: `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_step1_validate/`

Write: `validation-report.md`

#### `validation-report.md` structure (MUST follow)

> **IMPORTANT:** Do not begin writing this report until all four scanning protocol steps are complete. Write the report only after the scanning protocol has been fully executed.

**§1 Summary**
- Status: PASS | FAIL
- Top risks (1–3 bullets)

**§2 Must-fix issues (blocking)**
For each issue:
- ID: V-01 [§N Section Name — keyword]
- Problem:
- Why it matters:
- Suggested fix:

**§3 Suggestions (non-blocking)**
- S-01 [§N Section Name — keyword]: ...

**§4 Testability check**
- Untestable or vague statements:
- Proposed measurable rewrite:
- Edge case testability (from Step 2 scan): for each MISSING edge case identified, verify whether the doc states an expected behavior. Flag any edge case whose expected behavior is absent, marked TBD, or too vague to write a test for — label these `UNRESOLVED [§N Section — keyword]:` in this section.

**§5 Coverage check (states & edges)**

*Flow coverage:*
- All flows have a defined start point: yes / no — (list missing flows)
- All flows have a defined end point (success / failure / exit): yes / no — (list missing flows)

*Per-step edge case scan results* (MISSING or notable rows only):

| Flow | Step | Category | Covered? | Notes |
|---|---|---|---|---|
| e.g. Main flow | 2. Place bet | Resources | MISSING | No behavior defined for insufficient chips |

*State machine coverage:*
- Elements with state: (list)
- Missing states per element: (list — standard states absent from both doc and element's own taxonomy)
- Transitions with unclear trigger: (list)

*Metrics coverage (analytics events):*
- Section present: yes / no
- enter: present / missing
- progress: present / missing
- complete: present / missing
- exit: present / missing
- error: present / missing

**§6 Mapping readiness**
- AC IDs referenced? yes/no
- If no: list acceptance statements to convert into AC

**§7 Constitution compliance** (only if `memory/constitution.md` was read)
Run the **Review Checklist (Quick)** from constitution.md against the full design package:

- [ ] All screens have 4 states (Default/Loading/Empty/Error)
- [ ] All timers have specific numeric values
- [ ] All reward values have benchmark rationale
- [ ] Edge cases covered: disconnect, insufficient chips, timeout, double-tap
- [ ] API contracts mentioned (endpoint name)
- [ ] Art asset list present

For each item: PASS / FAIL. Any FAIL = must-fix blocking issue (add to §2 Must-fix list with format `V-xx [Constitution — <item name>]`).

**§8 Game sections coverage** (only if `is_game_feature` detected)
Check design-doc for presence and quality of game-specific sections:
- §5 Flow Diagram: happy path present, ≥2 error paths, ASCII readable
- §5 Screens List: all screens have ID + type + description
- §5 States & Transitions: state machine complete (Idle/Loading/Ready/Error/Success)
- §5 Step Detail: each step has 4 states, timers with numeric values, edge cases covering boundary conditions (at-cap, zero/null value, over-range, under-range, exact rule threshold values)
- §7.5 Economy: economy position stated, all reward values have rationale, safety net defined
- §7.5 Benchmark: at least one benchmark reference cited

Check layout-detail.md (if status is `draft`/`approved` in manifest):
- All screens from §5 Screens List have a section in layout-detail.md
- Each screen has ASCII sketch + element list + 4 states + interactions with ms values + assets list

---

## Verification Layer

### 4C Checklist

- **Correctness:** All CV items walked sequentially with pass/fail evidence; all V-xx and S-xx IDs include `[§N Section Name — keyword]` suffix; all four scanning protocol steps executed before writing report.

- **Completeness:** §5 contains all four sub-sections (flow coverage, per-step edge case scan, state machine coverage, metrics coverage) populated with findings from Steps 1–4.

- **Context-fit:** Report is actionable — each must-fix has a suggested fix; issues surface what a first-time reader would find.

- **Consequence:** Report does not rewrite the whole doc; surfaces issues only; report saved under the correct `docs/` path.

---
