---
name: design-evaluate
description: "(Evaluator) Score a feature Design Doc's mechanics quality across 6 dimensions: feedback loop, pacing, progression, replayability, extensibility, emotional arc; writes a scored evaluation report under docs/runs/<feature_id>/..."
disable-model-invocation: true
argument-hint: "<feature_id> [--design_doc canonical|<path>]"
---

# Design Evaluate Skill

## Intent Layer

### Role
- Owner role: Evaluator
- Primary agent: Design Evaluator Agent
- Inputs: canonical design doc
- Handoff: scored report → designer uses it to iterate on mechanics

### Goal
Produce a scored mechanics evaluation for a feature Design Doc, then automatically remediate weak Pacing and Emotional Arc dimensions:

**Phase 1 — Score:**
- 6 dimensions scored 1–5 with cited evidence
- 30-item checklist (pass/fail per item)
- Dimension relationship analysis
- Overall verdict with actionable recommendations

**Phase 2 — Remediation (conditional):**
- Triggered automatically when Pacing < 3 OR Emotional Arc < 3
- Auto-derives pacing phases and emotional arc from existing doc mechanics
- Prompts designer to review and correct the draft
- Merges confirmed content back into §2 Player motivation profile and §4 Mechanics & Rules of the design doc
- Re-scores to verify improvement

### Use when
Use after `design-validate` returns PASS for any game mechanic feature.

### Constraints / Requirements
You are a **mechanics evaluator**. Your job is to assess the *quality* of the game design — not its structural completeness (that is `design-validate`'s job). You evaluate whether the mechanics are well-designed, balanced, and likely to produce good player experiences.

Do not validate structure, AC format, or section presence. Focus exclusively on mechanics quality as defined by the rubric.

### Anti-patterns

### Quality standard

### Output format
Output language: Vietnamese

### Invocation parameters
- **feature_id** (required)
- **design_doc** (optional): `canonical` (default) or explicit path
  - canonical path: `docs/design-docs/<feature_id>/design-doc.md`

---

## Knowledge Layer

### Required reading
- If `memory/patterns.md` exists: read active patterns relevant to mechanics evaluation. Calibrate scoring accordingly. (Do NOT fail if missing)
- If `memory/mistakes.md` exists: read active mistakes relevant to evaluation. Watch for known recurring issues. (Do NOT fail if missing)
- Design doc (canonical or provided) — read §1 Context & Goal first, then remaining sections.
- Rubric reference: `templates/mechanics-evaluation-rubric.md`

### Domain knowledge

#### Section number resolution

Section numbers differ by doc mode:

| Content | Section |
|---------|---------|
| Context & Goal | §1 |
| Users / Player motivation profile | §2 |
| Defines / Glossary | §3 |
| Mechanics & Rules (core loop, feedback loop, progression, pacing) | §4 |
| Data Model & Contracts | §3 [OPTIONAL] |
| Config & Balancing | §7 |
| Metrics | §9 |

#### Context extract fields

Fields to extract from §1 and §2 during Step 0, used for calibrating evaluation:

| Field | Source | Used for |
|-------|--------|----------|
| `game_mode` | §1 Game at a glance | Determines if RE-6 (multiplayer downtime) applies |
| `player_count` | §1 Game at a glance | Multiplayer vs solo calibration |
| `session_length_target` | §1 Game at a glance | PA-4, PA-6 calibration |
| `platform` | §1 Game at a glance | PA-6 TA fit check |
| `design_pillars` | §1 Design pillars | Lens for all dimensions — do not penalize intentional pillar trade-offs |
| `non_negotiables` | §1 Non-negotiable decisions | Exclude from improvement suggestions |
| `ta_frustration_tolerance` | §2 Player motivation profile | EM-4, EM-6 calibration |
| `ta_session_behavior` | §2 Player motivation profile | PA-6 calibration |

### Related skills / prior steps
- Prior: `design-validate` (PASS required)
- Next: designer iteration on mechanics

### Key constraints
**Pre-flight is BLOCKING:** `validate_structure.py` must pass (exit 0) before mechanics evaluation begins. Mechanics evaluation requires a structurally valid doc.

---

## Execution Layer

### Pre-flight (BLOCKING — stop if FAIL)

Run before reading the design doc:

1. `python tools/validate_structure.py <feature_id>`
   - Exit code 1 (FAIL): report structural issues and stop.
   - Exit code 0 (PASS): continue.
2. `python tools/scaffold_run.py <feature_id> evaluate`
   Creates the run folder + `input.md`. Note the printed path.

### Step 0: Context extract (before any scoring)

Read §1 "Game at a glance", §1 "Design pillars", §1 "Non-negotiable decisions", and §2 "Player motivation profile". Extract and hold in working context all fields from the **Context extract fields** table (see Knowledge Layer).

If §1 session parameters are missing (§1 "Game at a glance" table not present or empty): note `evaluation_confidence = low` in output. Proceed but flag all session-parameter-dependent scores as uncertain.

Walk CX checklist items (CX-1 through CX-5) — these are informational, not pass/fail gates.

### Step 1: Pre-check gate

Verify before scoring:
- [ ] §4 Mechanics & Rules is non-empty (has content beyond template placeholders)
- [ ] §2 Player motivation profile has at least motivation type filled

If either fails: write a short report noting the doc is not ready for mechanics evaluation. Set verdict to `WEAK` with score 0 and stop.

### Step 2: Scenario Trace

Trace 3 archetype scenarios qua rules thực tế của doc.
Scenario definitions và output format: xem rubric § Simulation Layer.

Với mỗi scenario:
1. Derive game-specific parameters từ config doc
   (session length, max rounds/turns, power resource values,
   defensive resource values, escalation thresholds)
2. Trace ít nhất 1 chuỗi quyết định player qua rules —
   không đọc intent, đọc rule outcomes
3. Ghi lại:
   - Decisions player phải làm tại mỗi decision point
   - Outcomes thực tế (không phải outcomes "intended")
   - Dynamics nổi lên không được mô tả trong doc

Evidence từ trace được cite trực tiếp trong Step 5 (scoring).
Không tạo file riêng — trace notes tồn tại trong working context.

### Step 3: Anti-Aesthetic Check

Sau khi trace xong 3 scenarios, kiểm tra 4 anti-aesthetics
theo catalog trong rubric § Anti-Aesthetic Catalog.

Với mỗi anti-aesthetic được phát hiện:
1. Xác định dimension(s) bị ảnh hưởng
2. Note score cap áp dụng (theo rubric)
3. Ghi lại evidence cụ thể từ trace (round/turn number,
   resource values, mechanic name)

Score caps từ Step 3 được áp dụng trong Step 5.
Nếu không có anti-aesthetic nào: ghi "No anti-aesthetics
detected" và tiếp tục Step 4.

### Step 4: Walk the checklist

For each of the 30 checklist items (see rubric):
1. Locate the relevant section in the design doc
2. Determine pass/fail based on whether the item's criteria is met
3. Note the specific evidence (quote or describe what was found/missing)

### Step 5: Score each dimension

**Apply score caps first:** Check anti-aesthetic caps noted in Step 3 before
assigning any score. Simulation evidence from Step 2 is preferred over
doc-reading evidence at Score 4–5 — if both conflict, simulation evidence
takes precedence.

For each of the 6 dimensions:
1. Review the checklist results for that dimension (5 items each)
2. Read the rubric criteria for scores 1–5
3. Assign a score based on the **highest level where ALL criteria are met**
4. Record 1–3 pieces of evidence (with section references)
5. Write 1–2 improvement suggestions if score < 5

**Scoring rule:** A dimension scores N only if it fully satisfies the criteria for N. Partial satisfaction of level N means the score is N-1.

### Step 6: Analyze dimension relationships

Evaluate the 5 key pairs defined in the rubric:
1. Feedback Loop ↔ Pacing
2. Progression ↔ Replayability
3. Extensibility ↔ Feedback Loop
4. Emotional Arc ↔ Pacing
5. Progression ↔ Emotional Arc

For each pair, determine the relationship type (reinforcing / tension / independent / undermining) and explain based on doc evidence.

### Step 7: Compute summary and verdict

- Total score = sum of 6 dimension scores
- Normalized score = total / 30
- Apply verdict thresholds:
  - `EXCELLENT`: normalized ≥ 0.85 AND no dimension below 3
  - `GOOD`: normalized ≥ 0.65 AND no dimension below 2
  - `NEEDS_WORK`: normalized ≥ 0.45 OR any dimension below 2
  - `WEAK`: normalized < 0.45
- Identify top 1–3 risks and 1–3 recommended actions

### Step 8: Write outputs

Write all 4 output files following the schemas defined in the rubric reference doc.

### Step 9: Remediation — Auto-derive Pacing & Emotional Arc (conditional)

**Trigger:** Pacing score < 3 OR Emotional Arc score < 3

If triggered, perform the following sub-steps:

#### 7.1 Auto-derive from existing doc sections (no designer input)

Read and extract the following generic sources (resolve section numbers using the **Section number resolution** table in the Knowledge Layer):

| Source | What to extract | Maps to |
|--------|----------------|---------|
| Config table (§7 Config & Balancing, both modes) | Parameter tiers/thresholds that affect intensity (e.g., multiplier levels, difficulty tiers) | Pacing phase intensity levels |
| Config session length / maxRound (§7 Config & Balancing or §1 Context & Goal) | Round count + time target | Pacing phase round ranges |
| Rules involving penalty/loss (§4 Mechanics & Rules table) | Penalty trigger + recovery mechanic | Tension source + frustration recovery |
| Rules involving reward/bonus (§4 Mechanics & Rules table) | Reward trigger + multiplier or bonus action | Relief/delight moment |
| Progression design — pacing beats field (§4 Mechanics & Rules) | Any pacing information stated | Pacing driver |
| Scenarios or early game hook (§2 Player motivation profile / §4 Mechanics & Rules) | Scenario sequence or early hook description | Implied emotional beats |

Synthesize into two draft blocks:

**Pacing phases draft** (for §4 Mechanics & Rules → Progression design → Pacing phases table):
```
| Phase | Rounds | Time (approx) | Intensity | Active mechanics | Rest moment |
```
- Phase 1 "Opening": low-stakes mechanics active, low intensity (lowest config tier)
- Phase 2 "Mid game": rising stakes, increasing intensity (mid config tier)
- Phase 3 "Late game": peak tension, climax mechanics active (highest config tier)

**Emotional arc draft** (for §2 Player motivation profile → Emotional arc):
```
| Phase | Dominant emotion | Tension source | Relief source |
```
- Map penalty mechanics → tension, recovery mechanics → relief, reward/bonus mechanics → delight
- Name emotional beats based on scenario or hook descriptions found in the doc

Mark all auto-derived values as UNCONFIRMED where designer intent cannot be determined from the doc.

#### 7.2 Write pacing-arc-draft.md

Write to run folder: `pacing-arc-draft.md`

Structure:
```markdown
# Pacing & Emotional Arc Draft — <feature_id>
> AUTO-DERIVED — requires designer review before merge

## How to review
- [ ] Confirm or adjust phase round boundaries
- [ ] Confirm or rename emotional beat labels
- [ ] Add any intent the auto-derivation cannot know (see "Designer input required" below)
- [ ] When ready: reply "confirm" or edit this file directly, then say "merge"

## Designer input required (cannot be auto-derived)
- First-win moment: Which specific mechanic/action gives the player their first identifiable win, and in which turn?
- Drama peak: Which round/phase is intended as the climax of the game?
- Signature delight: What is the one moment that defines this game's feel?

## Draft: Pacing Phases (→ will merge into §4 Mechanics & Rules)
<pacing phases table>

- Pacing driver: <derived mechanic>
- Early game hook: <best guess from scenarios — mark as UNCONFIRMED>

## Draft: Emotional Arc (→ will merge into §2 Player motivation profile)
<emotional arc table>

- First-win moment: UNCONFIRMED — designer must fill
- Frustration recovery path: <derived from penalty mechanism + recovery path>
- Surprise/delight moments: <derived from reward chaining + bonus action mechanics>
```

#### 7.3 Prompt designer for review

After writing `pacing-arc-draft.md`, pause and ask the designer:

> "Pacing ({score}/5) and/or Emotional Arc ({score}/5) scored below 3.
> I've auto-derived a draft at `{run_folder}/pacing-arc-draft.md`.
> Please review the draft, fill in the 3 designer-only fields, and confirm.
> Reply 'confirm' when ready to merge, or edit the draft first."

**Wait for designer confirmation before proceeding to 7.4.**

#### 7.4 Merge confirmed content into design doc

After designer confirms:
1. Update §4 "Progression design" — fill in `Pacing phases` table + pacing driver + early game hook
2. Write `pacing-arc-merged.md` to run folder: brief diff summary of what changed

#### 7.5 Re-score

Re-run Phase 1 (Steps 1–8) on the updated design doc.
- Write result to `rescore.json` in the same run folder
- If Pacing ≥ 3 AND Emotional Arc ≥ 3: append PASS status to `notes.md`
- If either still < 3: append remaining failing checklist items to `notes.md`, stop and report

### Expected output

#### Output location (MUST follow)
Create: `docs/runs/<feature_id>/<YYYYMMDD_HHMM>_evaluate/`

**Phase 1 files:**
- `input.md`
- `mechanics-evaluation.json`
- `mechanics-evaluation.md`
- `notes.md`

**Phase 2 files (if triggered):**
- `pacing-arc-draft.md` — auto-derived draft for designer review
- `pacing-arc-merged.md` — diff summary after merge into design doc
- `rescore.json` — re-score result after merge

#### `input.md` content requirements
- feature_id
- design doc path used
- evaluation rubric version: "v1"
- date

#### `mechanics-evaluation.json` content requirements
Follow the JSON schema defined in `templates/mechanics-evaluation-rubric.md` exactly.

#### `mechanics-evaluation.md` content requirements
Follow the human-readable report structure defined in `templates/mechanics-evaluation-rubric.md`:
- Summary (verdict, score, strongest/weakest)
- Dimension scores with evidence and suggestions
- Dimension relationships
- Top risks and recommended actions

#### `notes.md` content requirements
- Recommended next action:
  - If EXCELLENT/GOOD: proceed with implementation or prototype
  - If NEEDS_WORK and remediation ran: note which dimensions improved + remaining gaps
  - If NEEDS_WORK and remediation NOT triggered: list specific dimensions to improve
  - If WEAK: recommend revisiting core mechanics design before proceeding
- Remediation status (if Phase 2 ran):
  - Pre-remediation scores for Pacing and Emotional Arc
  - Post-remediation scores
  - Whether re-score passed (both ≥ 3) or still needs designer input
- Confidence level and any caveats about the evaluation

---

## Verification Layer

### 4C Checklist

- **Correctness:** Every score cites at least one piece of evidence from a specific doc section; improvement suggestions are actionable (not "make it better" but "add a secondary loop that...").

- **Completeness:** All 6 dimensions scored; 30-item checklist walked; dimension relationships analyzed for all 5 pairs; verdict computed with thresholds applied.

- **Context-fit:** Scores not inflated — when uncertain, score lower; context extract fields loaded before scoring; session-parameter-dependent scores flagged as uncertain if §1 game at a glance is absent.

- **Consequence:** Do not penalize for sections outside scope (e.g., visual design, engineering handoff); do not penalize intentional pillar trade-offs; non-negotiable decisions excluded from improvement suggestions.

---