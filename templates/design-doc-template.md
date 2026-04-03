# Design Doc — `FEATURE_NAME`

- Feature ID: `NNN-slug`
- Type: `coregame | feature | event`
- Segments: `all_users | free_users | new_users | pay_users | segment_1..6`
- Document type: Game Design Doc | Feature Design Doc | System Design Doc
- Platform: `e.g., Browser / Desktop / Mobile / Cross-platform`
- Owner: `designer`
- Reviewers: `names/roles`
- Status: Draft | Review | Approved | Superseded
- Version: 0.1.0
- Last updated: `YYYY-MM-DD`
- Related:
  - Spec: `../spec.md` (if exists)
  - Plan: `../plan.md` (if exists)
  - Tasks: `../tasks.md` (if exists)
  - Layout: `./layout-detail.md` (game features only)

---

## 1) Context & Goal

### What are we designing?

- ...

| Parameter | Value |
| --- | --- |
| Player count | e.g., 2–4 |
| Primary mode | PvP / PvE / PvP+Bot / Co-op / Solo |
| Session length (target) | e.g., 15–30 min |
| Turn structure | Turn-based / Real-time / Async |

### Purpose of this document

- What this doc covers:
- What this doc does NOT cover:
- Primary audience: Coder | Tester | Designer | All

### Design pillars

> Read from `docs/design-docs/*-pillars.md` matching the feature Type. If no matching pillars file exists, ask the user before continuing.

- Pillar 1:
- Pillar 2:

### Dependencies

| Dependency | Type | Status |
| --- | --- | --- |
| [System/Feature] | Blocker / Nice-to-have | Ready / In-progress / Not started |

### Feature context (game features)

> Skip for non-game / system features.

| Field | Value |
| --- | --- |
| Feature type | New / Improvement |
| Primary goal | Retention / Monetization / Engagement / Social |
| Target KPI | e.g., D7 retention +5% |
| Player segment | New / Mid / Whale / All |
| Entry point | Lobby / Banner / Push Notification / Deep Link |
| Affected systems | Economy / Progression / Social / Matchmaking / None |
| Constraints | Timeline / Tech / Legal / None |

### Success metrics [OPTIONAL for coregame]

> High-level targets for the feature. Detailed ongoing measurement → §9 Metrics.

| Metric | Baseline | Target | Timeframe |
| --- | --- | --- | --- |
| [Metric 1] | [Current] | [Goal] | [When] |
| [Metric 2] | | | |

---

## 2) Users & Scenarios

### Player motivation profile

- Primary motivation type: Achiever (goals, completion) / Explorer (discovery) / Socializer (interaction) / Killer (competition)
- Reward schedule: Fixed (milestone) / Variable (loot-style) / Ratio (effort-based)
- Emotional arc intended: (e.g., curiosity → mastery, frustration → relief, tension → release)
- TA session behavior: (e.g., "mobile casual — interruptible sessions, one-hand play, short attention span")
- TA frustration tolerance: Low / Medium / High — (brief rationale, e.g., "Low: casual players quit if punished too hard")

---

## 3) Defines / Glossary

> Define every domain concept used in this doc. Readers must not need external sources to understand terms.

### Concepts

| Term | Definition | Properties | Notes |
| --- | --- | --- | --- |
| Term A | What it is | key properties | relationships, constraints |
| Term B | What it is | key properties | relationships, constraints |

### Concept lifecycle (if applicable)

- How X is created:
- How X transitions states:
- How X is destroyed / removed:

### Data Model & Contracts [OPTIONAL]

> Dùng khi feature cần mô tả cấu trúc dữ liệu chi tiết (code archaeology, API design, v.v.)

#### Core objects

| Object | Key fields | Notes |
| --- | --- | --- |
| Object A | field1, field2 | notes |

#### Field constraints

- Required fields:
- Optional fields:
- Validation rules:

#### Relationships

- A → B: (describe)
- B → C: (describe)

---

## 4) Mechanics & Rules

> Authoritative rule set. Every rule must be unambiguous and testable.

### Initial state (game/session start)

- Board / world setup:
- Player starting values:
- Default configurations applied:

### Core loop

1. Step 1 — (what happens, who acts):
2. Step 2 — (what happens, who acts):
3. Step 3 — (repeat condition):

### Feedback loop

> Map each player action to the game's response and the reward signal it produces.

| Step | Player action | Game response | Reward signal |
| --- | --- | --- | --- |
| 1 | | | |
| 2 | | | |

- Dominant loop cadence (how long does one full loop take?):
- Secondary loops (longer arcs that reinforce the core loop):
- Loop reinforcement pattern (how does the secondary loop modify core loop behavior over time?):
- Negative feedback / rubber band mechanism: (present / absent / absent by design — brief rationale)

### Progression design

- Progression type(s): Skill (player improves) / Power (character grows) / Content (areas unlock) / Story (narrative advances)
- Early game hook (first 2 min): (what gives the player an early win?)
- Mid game ramp: (how does challenge increase?)
- Late game / end state: (how does the game close out or loop back?)
- Pacing beats: (where are rest moments vs intensity peaks?)

#### Pacing phases

> Derivable from §7 Config (multiplier curve + session length). Fill manually or draft from `/design_evaluate` remediation output.

| Phase | Rounds | Time (approx) | Intensity | Active mechanics | Rest moment |
| --- | --- | --- | --- | --- | --- |
| Opening | | | Low | | |
| Mid game | | | Rising | | |
| Late game | | | Peak | | |

- Pacing driver: (which mechanic/parameter drives escalation between phases)
- Early game hook (turns 1–3): (specific mechanic + player action + feedback that gives first win)
- Meaningful choices: (decisions that feel impactful to the player)
- Replayability drivers: (what brings the player back — mastery, discovery, variety, social?)

### Rules

> **Rule writing format: WHAT + HOW / WHEN / WHY / WHO**
> Each rule must contain enough detail to implement and test without consulting any other source.
> If the source describes HOW (algorithm, direction, sequence), WHEN (exact timing), WHY (design intent), or WHO (which entity) — it must appear in the rule. Never compress to outcome-only.
>
> ❌ WRONG: `[Entity] moves to [destination]`
> ✅ RIGHT: `[Entity] moves to [destination] — direction: [reverse of movement path], measured from [reference point], applies only to [entity scope], triggers [immediately / after X]`

| Rule ID | Rule | Scope | Priority |
| --- | --- | --- | --- |
| R-01 | | Turn / Session / Global | High / Med / Low |
| R-02 | | | |

> Priority = order of resolution when rules conflict.

### Win / success conditions

- Condition A: (trigger + outcome)
- Condition B: (trigger + outcome)

### Terminal state

- What "game over" looks like in state:
- Cleanup / teardown steps:

---

## 5) UX / Interaction Design

### Entry points

- ...

### Screens list (game features)

> List all screens referenced in the flow below. Full layout detail → `layout-detail.md`.

| ID | Screen name | Type | Description |
|----|-------------|------|-------------|
| SCREEN-01 | [Name] | Full Screen / Popup / Bottom Sheet / Toast | [Brief description] |
| SCREEN-02 | | | |
| ERROR-01 | | Error Dialog | |

### User flow (logic flow)

1. Step one — (what logic fires):
2. Step two — (what logic fires):
3. Step three — (repeat / end condition):

### UI flow diagram (game features)

> Save the Mermaid diagram to `docs/design-docs/<feature_id>/flow-diagram.md` using the `mermaid-diagram` skill, then link it here.
> ASCII sketches below are drafts only — replace with the linked diagram once generated.

**Main flow:**

```
[Entry Point]
      |
      v
[SCREEN-01: Name]
  - Condition: [...]
  - Player action: [...]
      |
      |--[Action A]--> [SCREEN-02]
      |--[Action B]--> [SCREEN-03]
      v
[SUCCESS STATE]
  - Reward: [...]
  - Transition: [→ Lobby / → Screen X]
```

**Alternative flows:**

```
[SCREEN-XX]
  |
  |--[No connection]-----------> [ERROR-01: Connection lost]
  |                                   |--[Retry]--> [SCREEN-XX]
  |                                   |--[Close]--> [Exit]
  |
  |--[Insufficient resources]--> [ERROR-02: Not enough resources]
                                      |--[Get resources]--> [IAP Store]
                                      |--[Close]----------> [Exit]
```

### States & transitions (game features)

| State | Trigger in | Trigger out | Next screen |
|-------|------------|-------------|-------------|
| Idle | Enter app / Lobby | Tap entry point | Loading |
| Loading | Tap entry | Data received | Ready / Error |
| Ready | Load complete | Player action | [Action state] |
| Error | Load failed | Retry / Close | Loading / Exit |
| Success | Reward confirmed | Auto / Player tap | Exit |

### UI / animation flow

> Map each logic event to its visual/animation counterpart. Specify what the user sees at each step.

| Logic event | Animation / visual feedback | Timing | Notes |
| --- | --- | --- | --- |
| Event A triggered | visual effect shown | duration / delay | blocking or non-blocking? |
| Event B triggered | | | |

### Step detail

#### STEP-01: [Step name — e.g., Player taps "Claim Reward"]

**Screen:** SCREEN-01
**Trigger:** [Event that triggers this step]
**Pre-condition:** [What must be true before this step runs]

| State | Trigger | UI shown | Duration |
| --- | --- | --- | --- |
| Default | Enter screen | [Describe UI] | — |
| Loading | Tap button | Spinner, button disabled | Until result |
| Success | Confirmed | [Animation, sound, reward popup] | [X] sec |
| Error | Failed | [Specific error message] | Until player acts |

**Timers & counters:**

| Name | Value | Starts when | Resets when | On expire |
| --- | --- | --- | --- | --- |
| [Timer 1] | [X] sec | [Trigger] | [Condition] | [Action] |

**Edge cases:**

| # | Situation | Trigger | System response |
| --- | --- | --- | --- |
| EC-01 | Lost connection during loading | Network drop | Show "Connection lost", Retry button, preserve state |
| EC-02 | Double tap < 300ms | Double tap | Process first tap only |

---

## 6) Visual Design

> Define the visual layout for each screen listed in §5.
>
> **Game features:** Create `docs/design-docs/<feature_id>/layout-detail.md` from `templates/layout-detail-template.md`. Include per-screen: ASCII wireframe, element list, 4 states, interactions & animations, asset list. Link the file in the table below.
>
> **Non-game / system features:** Describe key UI components, states, and visual hierarchy inline, or attach mockup references.

**Layout Detail** — [layout-detail.md](./layout-detail.md) *(game features only)*

| Screen | Layout reference | Status |
| --- | --- | --- |
| SCREEN-01 | layout-detail.md §SCREEN-01 | Draft / Ready |
| SCREEN-02 | | |

---

## 7) Config

> List all tunable parameters. Every parameter must have a default value and a stated impact.

### Config parameters

| Parameter | Default | Range / Options | Impact on gameplay / behavior |
| --- | --- | --- | --- |
| PARAM_A | value | min–max | what changes when this increases/decreases |
| PARAM_B | value | enum list | |

### Balancing intent

- What the current defaults are optimized for (e.g., casual 20-min session):
- Known imbalances or areas to tune:
- Suggested first tuning levers (highest impact):

### Config source

- Where config lives in code: (file path / constant name)
- How to change it (edit file / runtime toggle / export):

---

## 8) Edge Cases & Error Handling

Format for all categories below
| # | Edge case | Expected behavior |
| --- | --- | --- |
| EC-01 | | |
| EC-02 | | |

### Empty states

- ...

### Insufficient or above-threshold values

- ...

### Network: disconnect & reconnect

- ...

### User cancel or input spam

- ...

### Validation & inline errors

- ...

### Others

- ...

### Known Bugs & Conflicts [OPTIONAL]

> Dùng khi formalizing existing system. Mỗi entry phải có ít nhất một resolution option.

| ID | Conflict / Bug | Current behavior | Option A | Option B | Recommendation |
| --- | --- | --- | --- | --- | --- |
| C-01 | | | | | |

---

## 9) Metrics

> What to measure to evaluate mechanics quality, flow smoothness, and balancing effectiveness.

### Feature success targets

| Metric | Baseline | Target | Timeframe |
| --- | --- | --- | --- |
| [Metric 1] | [Current] | [Goal] | [When] |
| [Metric 2] | | | |

### Gameplay / mechanics metrics

> Minimum instrumentation required to validate the success targets above.

| Metric | Description | Target / threshold | How to collect |
| --- | --- | --- | --- |
| M-01 | e.g., avg turns per game | e.g., 12–18 turns | simulation log |
| M-02 | | | |

### Analytics events to instrument

| Event | Trigger | Properties to log |
| --- | --- | --- |
| EVT-01 | | |
| EVT-02 | | |

---

## 10) Related Docs

| Document | Path / Link | Relationship | Notes |
| --- | --- | --- | --- |
| feature | `../<feature-id>.md` | Related feature | pending |
| event | `../<event-id>.md` | Related event | pending |
| Other doc | | | |

---

## 11) Change Log

- v0.1.0: initial draft
- v0.1.1: ...

---

## Implementation Risks [OPTIONAL]

> Dùng khi cần mô tả rủi ro implementation cho Coder (thường với existing systems).

| Risk | Impact | Mitigation |
| --- | --- | --- |
| R-01 | | |

### Performance considerations

- Known bottlenecks:
- Acceptable thresholds:

### Breaking change risk

- Changes that could affect existing behavior:
- Backward-compatibility notes:

---

## Trade-offs & Decisions [OPTIONAL]

> Extract it to a separate `decisions.md` file alongside this doc.

### Constraints

- Time:
- Technical:
- Legal / Security:
- Content:

### Options considered

- Option A:
  - Pros:
  - Cons:
- Option B:
  - Pros:
  - Cons:

### Decision

- Chosen option + rationale:

---

## Open Questions [OPTIONAL]

> Extract it to a separate `open-questions.md` file alongside this doc.

| # | Question | Priority | Owner | Default if unresolved |
| --- | --- | --- | --- | --- |
| OQ-1 | | High / Med / Low | Designer / PM / Tech | [Fallback action if no decision is made] |
| OQ-2 | | | | |

---
