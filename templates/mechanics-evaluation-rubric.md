# Mechanics Evaluation Rubric

> Reference document for the `/design_evaluate` skill.
> Defines scoring dimensions, checklist, output schema, and verdict thresholds.

---

## Scoring Dimensions (1–5 scale)

Each dimension is scored 1–5 based on evidence found in the design doc.
Evidence must cite specific sections — opinions without doc references are not valid scores.

---

### DIM-1: Feedback Loop Quality

**Evidence source:** §4 Feedback loop table, Core loop steps

| Score | Criteria |
|-------|----------|
| 1 | No feedback loop described, or reward signal column is empty/missing |
| 2 | Loop steps listed but reward signals are vague ("player feels good") or identical for all actions |
| 3 | Distinct reward signals per action; dominant loop cadence is stated; but secondary loops are missing or disconnected from core loop |
| 4 | Core and secondary loops defined with distinct cadences; reward signals are concrete and varied (visual, numeric, progression); loop reinforcement is described |
| 5 | All of 4, plus: loop interactions mapped (how secondary loops modify core loop behavior); degradation path described (what happens when loop breaks); at least one variable-ratio reward element identified; AND simulation trace (S1/S2) confirms feedback signals are distinguishable in actual play — not only described in the feedback loop table |

---

### DIM-2: Pacing Quality

**Evidence source:** §4 Progression design (pacing beats, pacing phases), §8 Config parameters (timing knobs), §1 Game at a glance (session length target, TA session behavior)

| Score | Criteria |
|-------|----------|
| 1 | No pacing information; no mention of intensity variation |
| 2 | Pacing beats field filled but only describes linear escalation ("it gets harder") |
| 3 | At least 2 distinct phases identified (e.g., early hook + mid ramp); rest moments mentioned but not specified |
| 4 | 3+ pacing phases with timing/turn-count estimates; rest moments explicitly placed; config parameters exist to tune pacing (e.g., turn timer, difficulty ramp rate) |
| 5 | All of 4, plus: pacing connected to emotional arc (§2); tension-release pattern is explicit; session length target stated with pacing calibrated to TA session behavior and platform (§1); AND S3 trace confirms tension-release pattern is present in endgame play — not only stated in pacing beats field |

---

### DIM-3: Progression Quality

**Evidence source:** §4 Progression design fields

| Score | Criteria |
|-------|----------|
| 1 | No progression type identified; no early/mid/late game structure |
| 2 | Progression type named but only one type; early game hook is generic ("tutorial") |
| 3 | At least 2 progression types identified; early hook gives a specific first win; mid ramp described; late game/end state exists but is thin |
| 4 | Multiple progression types with distinct pacing; meaningful choices field has 2+ concrete examples; challenge increase mechanism specified with config knobs; AND no Snowball anti-aesthetic confirmed (AA-1) |
| 5 | All of 4, plus: progression types interact (e.g., skill progression unlocks content progression); mastery curve described; regression/setback mechanics exist to create tension; progression does not plateau before end state; AND S1→S2→S3 trace shows progression trajectory without Snowball confirmed at any point (AA-1) |

---

### DIM-4: Replayability

**Evidence source:** §4 Rules, Win/Lose conditions; §8 Config parameters; §3 Glossary/concept lifecycle

| Score | Criteria |
|-------|----------|
| 1 | Single fixed path through the game; no variation between sessions |
| 2 | Some randomization exists (dice, shuffle) but player choices do not meaningfully alter outcomes |
| 3 | At least 2 sources of variation (randomization + player choice); multiple win conditions or paths; config parameters allow different session profiles |
| 4 | All of 3, plus: meaningful strategic choices where optimal play varies by game state; emergent interactions between mechanics (documented in rules or edge cases) |
| 5 | All of 4, plus: meta-progression between sessions or selectable rulesets; asymmetric starting conditions; design explicitly addresses "what brings the player back" |

---

### DIM-5: Extensibility

**Evidence source:** §3 Glossary/relationships; §6 Information Architecture; §8 Config parameters; §14 Open Questions

| Score | Criteria |
|-------|----------|
| 1 | Mechanics are hardcoded with no config; adding a new element would require rewriting core rules |
| 2 | Config parameters exist but concepts are tightly coupled (adding a new tile type breaks rules) |
| 3 | Concepts defined with clear relationships; config parameters cover core tuning knobs; at least one dimension of extension is obvious (new items, characters, maps) |
| 4 | All of 3, plus: concept lifecycle documented (how new entities are created/removed); rules use generic patterns (e.g., "when token lands on elemental tile" not "when token lands on fire tile"); config range/options suggest room for expansion |
| 5 | All of 4, plus: extension points explicitly called out in the doc; modular architecture visible (new mechanics can plug in without changing core loop); design anticipates at least one future expansion direction |

---

### DIM-6: Emotional Arc

**Evidence source:** §2 Player motivation profile + Emotional arc intended + Emotional arc phases + TA frustration tolerance; §4 Feedback loop reward signals; §4 Progression design pacing beats; §1 Design pillars

| Score | Criteria |
|-------|----------|
| 1 | No emotional arc described; no player motivation profile |
| 2 | Motivation type named but emotional arc field is generic ("fun") or empty |
| 3 | Emotional arc has at least 2 named beats (e.g., "curiosity → mastery"); player motivation profile filled; reward schedule type identified |
| 4 | Emotional arc maps to game phases (early = curiosity, mid = challenge, late = satisfaction); frustration/failure recovery path described and calibrated to TA frustration tolerance (§2); reward schedule matches motivation type |
| 5 | All of 4, plus: emotional beats connected to specific mechanics (which mechanic creates tension, which provides relief); multiple motivation types served or trade-offs acknowledged; surprise/delight moments designed in; emotional arc consistent with design pillars (§1); AND S1/S2/S3 trace confirms emotional beats occur at timing consistent with pacing phases — not only stated as narrative intent in §2 |

---

## Evaluation Checklist (30 items)

Walk through sequentially. Each item maps to a dimension and specifies where to look.

### Context pre-load (evaluator must extract before scoring any dimension)

Read §1 and extract. If §1 "Game at a glance" is missing, note evaluation confidence = LOW.

- [ ] CX-1: Game mode identified (PvP / PvE / PvP+Bot / Co-op / Solo) — affects RE-6 and multiplayer checklist items
- [ ] CX-2: Session length target noted (minutes) — calibrates PA-4, PA-6 scoring
- [ ] CX-3: Player count range noted — determines whether multiplayer items apply
- [ ] CX-4: Design pillars read — use as calibration lens; do not penalize intentional pillar trade-offs
- [ ] CX-5: Non-negotiable decisions read — exclude these from improvement suggestions

### Pre-check (gate — stop if any fails)

- [ ] Design doc passes structural validation (`validate_structure.py`)
- [ ] §4 Mechanics & Rules is non-empty
- [ ] §2 Player motivation profile is filled

### Feedback Loop (FL)

- [ ] FL-1: Core loop has 3+ steps with distinct actions
- [ ] FL-2: Feedback loop table has a reward signal for every player action
- [ ] FL-3: Dominant loop cadence is stated (time or turn count)
- [ ] FL-4: At least one secondary loop is described
- [ ] FL-5: Secondary loop reinforces (not contradicts) core loop
- [ ] FL-6: Negative feedback / rubber band stance is explicit (present, absent, or absent by design — any is valid; silence is not)

### Pacing (PA)

- [ ] PA-1: Early game hook is described (first 2 minutes or first N turns) — may appear in §2 scenarios or §4 pacing phases
- [ ] PA-2: Mid game ramp mechanism is specified
- [ ] PA-3: At least one rest moment is identified between intensity peaks
- [ ] PA-4: Session length target exists (explicit or inferable from config) — also check §8 config for derivable pacing evidence
- [ ] PA-5: Config parameters exist that affect pacing (timer, ramp rate, etc.)
- [ ] PA-6: Session length target is consistent with TA session behavior and platform (§1 + §2)

### Progression (PR)

- [ ] PR-1: At least one progression type is named
- [ ] PR-2: Early game hook gives player an identifiable first win
- [ ] PR-3: Challenge increase is specified (not just "it gets harder")
- [ ] PR-4: Late game / end state is defined
- [ ] PR-5: At least one meaningful choice documented with concrete example

### Replayability (RE)

- [ ] RE-1: At least one source of randomization exists
- [ ] RE-2: Player choices meaningfully affect outcomes (not cosmetic)
- [ ] RE-3: Multiple win paths or strategies are possible
- [ ] RE-4: Config parameters allow different session profiles
- [ ] RE-5: Reason for replay is identifiable (mastery, discovery, variety)
- [ ] RE-6: Player downtime between turns is addressed (multiplayer only — skip if solo/async) — e.g., spectator feedback, background mechanics, or turn timer keeps disengaged players active

### Extensibility (EX)

- [ ] EX-1: Concepts defined in glossary with relationships
- [ ] EX-2: Rules use generalizable patterns (not hardcoded per-element)
- [ ] EX-3: Config parameters have ranges, not just single values
- [ ] EX-4: At least one obvious extension point exists
- [ ] EX-5: Adding a new element/mechanic would not break core loop

### Emotional Arc (EM)

- [ ] EM-1: Player motivation profile filled (type + reward schedule)
- [ ] EM-2: Emotional arc field has 2+ named beats
- [ ] EM-3: Emotional arc maps to game phases
- [ ] EM-4: Failure/frustration recovery path exists
- [ ] EM-5: At least one surprise/delight mechanic is identifiable
- [ ] EM-6: Frustration recovery strength is calibrated to TA frustration tolerance (§2) — e.g., casual TA needs softer punishment than competitive TA

---

## Simulation Layer

Evaluator phải trace 3 archetype scenarios trước khi chấm điểm (Step 2 trong SKILL.md).
Derive game-specific parameters từ doc's own config — không từ rubric.

### 3 Archetype Scenarios

**S1 — Early game trace**
- Scope: Rounds/turns 1 → floor(session_length × 0.25)
- Starting state: cả 2 players ở initial state theo doc
- Derive: số resource ban đầu, starting power state, first available actions
- Trace:
  (1) First meaningful decision — có bao nhiêu real options?
  (2) First resource collection/action — feedback signal rõ không?
  (3) Decision trước khi có bất kỳ power resource nào
- Observe: decision richness early-game; feedback loop clarity;
  xem early hook trong doc có xảy ra thực tế không

**S2 — Mid inflection trace**
- Scope: Round/turn đầu tiên power escalation event plausible
  → Round/turn floor(session_length × 0.6)
- Derive: "power escalation event" từ progression design field
  (combo, level-up, unlock, threshold, milestone — bất kỳ event nào
  tạo ra step-change trong player power)
- Starting state: 1 player đã đạt first escalation event, 1 chưa
- Trace:
  (1) First escalation event → power gap giữa 2 players là bao nhiêu?
  (2) Offensive action với escalated power — bao nhiêu %
      opponent's defensive resource bị ảnh hưởng?
  (3) Nếu có tiered escalation (milestone 2, 3…): peak tier —
      bao nhiêu % per single offensive action?
- Observe: power snowball rate; tipping point timing;
  decisions của trailing player có meaningful không

**S3 — Late endgame trace**
- Scope: Round/turn floor(session_length × 0.8) → session end
- Starting state: Leading player defensive resource = 70% max;
  Trailing player defensive resource = 40% max
- Trace:
  (1) Trailing player — liệt kê tất cả action types available
      (offensive, defensive, resource-building, high-variance);
      action nào có thể flip resource gap?
  (2) Leading player optimal play là gì?
  (3) Last-mover / tie-break rule (nếu có) — ảnh hưởng thế nào
      đến decisions ở penultimate round/turn?
- Observe: comeback possibility; temporal asymmetry;
  whether endgame feels decided or contested

---

## Anti-Aesthetic Catalog

Kiểm tra sau S1→S2→S3 (Step 3 trong SKILL.md). Mỗi anti-aesthetic được confirm
tạo score cap cho dimension liên quan.

**Cap rule:** Ngay cả khi toàn bộ checklist pass và rubric criteria của Score N
được đáp ứng — nếu anti-aesthetic được confirm → dimension score không vượt quá cap.

Evidence của anti-aesthetic được cite trong `evidence[]` array của dimension liên quan,
với `supports_score: false`.

---

**AA-1: Snowball**

Symptom: Một player có thể đạt offensive output đủ để xóa >50% opponent's defensive
resource trong 1 single action trước Round/turn floor(session_length × 0.6).

Check (từ S2 trace):
- Tính max offensive output plausible tại S2 inflection point
  dùng doc's own config values
- So sánh với opponent's defensive resource (HP, lives, shields…)
- Confirm nếu: single action > 50% defensive resource
  VÀ không có comeback mechanic nào trong doc

Affected dimension: DIM-3 Progression | Score cap: 3

---

**AA-2: Forgone Conclusion**

Symptom: Trailing player ở S3 không có mechanical path để flip outcome —
mọi available action dẫn đến cùng kết quả.

Check (từ S3 trace):
- Liệt kê tất cả action types available cho trailing player trong late game
- Với mỗi loại: outcome có thể flip resource gap không?
- Exception: nếu có high-variance mechanic (critical hit, chain reaction,
  lucky event…) có xác suất flip → NOT confirmed
- Confirm nếu: không có action nào có thể flip gap

Affected dimension: DIM-4 Replayability | Score cap: 3

---

**AA-3: Unscaffolded Discovery**

Symptom: High-value mechanic interaction tồn tại nhưng không được communicated
qua bất kỳ feedback signal nào — player phải discover independently.

Check (từ S1/S2 trace):
- Identify mechanic interactions có value cao nhưng non-obvious
  (ví dụ: reward selection ảnh hưởng chain trigger, item crafting
  ảnh hưởng skill synergy, tile placement ảnh hưởng adjacency bonus)
- Kiểm tra feedback loop table: có signal nào surface interaction không?
- Kiểm tra §UX: có hint/tooltip/animation communicate interaction không?
- Confirm nếu: high-value interaction + không có signal nào

Affected dimension: DIM-1 Feedback Loop | Score cap: 4
Note: cap 4 (không phải 3) — unscaffolded discovery là gap nhưng không
phải design failure; chỉ ngăn Score 5.

---

**AA-4: Orphaned Mechanic**

Symptom: State, field, hoặc mechanic được định nghĩa trong doc nhưng không có
rule nào SET nó, HOẶC không có rule nào USE nó.

Check (từ glossary + rules):
- Với mỗi state/field trong glossary: tìm rule SET nó và rule READ/USE nó
- "Unborn mechanic": SET rule missing
- "Dead-end mechanic": USE rule missing
- Cả 2 đều là orphaned

Affected dimension: DIM-5 Extensibility | Score cap: 3

---

## Dimension Relationships

After scoring all dimensions, analyze interactions between pairs.

**Relationship types:**

| Type | Meaning |
|------|---------|
| `reinforcing` | Dimensions strengthen each other (e.g., fast feedback loop aligns with session pacing) |
| `tension` | Dimensions pull in opposing directions (e.g., deep progression vs high replayability) |
| `independent` | No meaningful interaction |
| `undermining` | One dimension actively weakens another (e.g., rigid rules reduce extensibility) |

**Key pairs to evaluate:**

1. Feedback Loop ↔ Pacing — Does loop cadence align with pacing phases?
2. Progression ↔ Replayability — Does progression depth support or reduce replay motivation?
3. Extensibility ↔ Feedback Loop — Can new elements plug into the feedback loop?
4. Emotional Arc ↔ Pacing — Do emotional beats align with intensity curve?
5. Progression ↔ Emotional Arc — Does progression trajectory support the intended emotional journey?

---

## Output Schema: `mechanics-evaluation.json`

```json
{
  "evaluation_version": "v1",
  "feature_id": "<NNN-slug>",
  "design_doc_path": "<path to evaluated doc>",
  "design_doc_version": "<version from doc header>",
  "evaluated_at": "<ISO 8601 timestamp>",

  "dimensions": [
    {
      "id": "<feedback_loop|pacing|progression|replayability|extensibility|emotional_arc>",
      "label": "<human-readable label>",
      "score": "<1-5>",
      "max_score": 5,
      "evidence": [
        {
          "section": "<§N section name>",
          "finding": "<what was found or missing>",
          "supports_score": "<true if positive evidence, false if gap>"
        }
      ],
      "checklist": {
        "<XX-N>": "<true|false>"
      },
      "improvement_suggestions": ["<actionable suggestion>"]
    }
  ],

  "summary": {
    "total_score": "<sum of all dimension scores>",
    "max_possible": 30,
    "normalized_score": "<total_score / 30, 2 decimals>",
    "dimensions_above_3": "<count>",
    "dimensions_below_3": "<count>",
    "weakest_dimension": "<id of lowest-scored dimension>",
    "strongest_dimension": "<id of highest-scored dimension>"
  },

  "dimension_relationships": [
    {
      "pair": ["<dim_id_1>", "<dim_id_2>"],
      "relationship": "<reinforcing|tension|independent|undermining>",
      "explanation": "<why this relationship exists based on doc evidence>"
    }
  ],

  "overall_assessment": {
    "verdict": "<EXCELLENT|GOOD|NEEDS_WORK|WEAK>",
    "confidence": "<high|medium|low>",
    "top_risks": ["<1-3 key risks>"],
    "recommended_actions": ["<1-3 actionable next steps>"]
  },

  "checklist_summary": {
    "total_items": 42,
    "cx_items": 5,
    "precheck_items": 3,
    "scored_items": 34,
    "passed": "<count of scored items that passed>",
    "failed": "<count of scored items that failed>",
    "pass_rate": "<passed/34, 2 decimals — CX and pre-check items excluded from denominator>"
  }
}
```

---

## Verdict Thresholds

| Verdict | Condition |
|---------|-----------|
| `EXCELLENT` | normalized_score ≥ 0.85 AND no dimension below 3 |
| `GOOD` | normalized_score ≥ 0.65 AND no dimension below 2 |
| `NEEDS_WORK` | normalized_score ≥ 0.45 OR any dimension below 2 |
| `WEAK` | normalized_score < 0.45 |

---

## Human-Readable Report: `mechanics-evaluation.md`

Structure for the markdown report:

```
# Mechanics Evaluation — <feature_id>

## Summary
- Verdict: <VERDICT>
- Score: <total>/<max> (<normalized>)
- Strongest: <dimension> (<score>)
- Weakest: <dimension> (<score>)

## Dimension Scores

### <Dimension Label> — <score>/5
**Evidence:**
- [+] <positive finding from §N>
- [-] <gap or weakness from §N>

**Checklist:** <passed>/<total> items passed
**Suggestions:**
- <actionable improvement>

(repeat for all 6 dimensions)

## Dimension Relationships
- <dim_1> ↔ <dim_2>: <relationship> — <explanation>

## Top Risks
1. <risk>

## Recommended Actions
1. <action>
```
