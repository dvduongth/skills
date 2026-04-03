---
# template-map.yaml
# Read by: design-doc, design-validate
# Updated by: designer (Status column only — template definitions are read-only)
#
# Conditions (evaluated from ingest-summary or requirement-brief):
#   always: true         = required for every feature regardless of type
#   mode_new: true       = only when design-doc is run with --mode new (default)
#   mode_existing: true  = only when design-doc is run with --mode existing
#   is_game_feature: true  = feature has player-facing screens + game mechanics
#   has_economy: true    = feature has reward, virtual currency flow, or economy impact
#   has_rng: true        = feature has probability/random mechanics
#
# is_game_feature detection (in design-doc pre-flight):
#   1. Check requirement-brief.md "Affected systems" for: Economy, Progression, Matchmaking
#   2. Check ingest-summary.md for game mechanics vocabulary: "turn", "round", "player action",
#      "win condition", "score", "level", "session", "mechanic", "rule", "board", "quest"
#      Do NOT use specific game product names as detection signals.
#   3. If uncertain: AskUserQuestion "This looks like a game feature — populate game sections? [yes/no]"

templates:

  design-doc-new:
    path: templates/design-doc-template.md
    conditions: {mode_new: true}
    always: true
    description: "Single design doc: base 14 sections + optional game extensions (§5 game flow/steps, §7.5 economy)"

  design-doc-existing:
    path: templates/design-doc-existing-template.md
    conditions: {mode_existing: true}
    always: false
    description: "Design doc for formalizing existing systems — has Known Bugs & Conflicts section"

  layout-detail:
    path: templates/layout-detail-template.md
    conditions: {is_game_feature: true}
    always: false
    description: "Separate file: screen layout (ASCII wireframe, elements, 4 states, interactions, assets). Linked from design-doc §6."

references:
  checklists: templates/references/checklists.md
  benchmarks: templates/references/benchmarks.md
  constitution: memory/constitution.md
---

# Template Map

This file has two purposes:

**At design time** — `design-doc` and `design-validate` read the YAML block above to determine which templates apply and where reference materials live. Conditions are evaluated from the feature's ingest artifacts.

**As a status manifest** — the table below is the **per-feature design package overview**. When a design doc is complete, this table shows which documents were produced, their status, and where they live. It provides a single-glance summary of the entire design package.

---

## How Skills Use This File

**`design-doc`:**

1. Reads YAML `templates` block to detect applicable templates.
2. Sets `is_game_feature` flag → decides whether to populate game-specific sections (§5 game flow/steps, §7.5 economy).
3. After producing design-doc.md, writes to `notes.md`:
   - If `is_game_feature`: "Also create layout-detail.md using `templates/layout-detail-template.md` and link it from §6."
   - References `templates/references/benchmarks.md` when filling §7.5 reward values.

**`design-validate`:**

1. Reads YAML block to know which companion files to validate.
2. For each doc with status `draft` or `approved` in the feature's manifest: validates using checklist from `templates/references/checklists.md`.
3. If `memory/constitution.md` exists: runs Constitution Quick Check as an additional gate → adds §8 "Constitution compliance" to validation-report.md.

**Designer:**

- Updates the Status column in the feature's `docs/design-docs/<feature_id>/manifest.md` (not this file) as docs progress.
- This global template-map.md is read-only for skills and designers alike. Only update it when adding new templates to the project.

---

## Design Package Status Template

> This section is a **template** for per-feature manifest files.
> Copy to `docs/design-docs/<feature_id>/manifest.md` when starting a new feature.
> Skills and designers update the Status column there — not here.

| Doc | Template | Required when | Status | Path |
|-----|----------|---------------|--------|------|
| design-doc.md | design-doc-template.md | Always (mode=new) | — | `docs/design-docs/<id>/design-doc.md` |
| design-doc.md | design-doc-existing-template.md | mode=existing | — | `docs/design-docs/<id>/design-doc.md` |
| layout-detail.md | layout-detail-template.md | is_game_feature | — | `docs/design-docs/<id>/layout-detail.md` |

**Status values:** `—` not started · `draft` in progress · `approved` signed off · `skipped` not applicable

---

## Adding New Templates

When adding a new template to the project:

1. Add the template file to `templates/` (or a sub-folder).
2. Add an entry to the YAML block above with: `path`, `conditions`, `always`, `description`.
3. Update the Design Package Status Template table above.
4. Update the relevant skill SKILL.md files to read the new template.
