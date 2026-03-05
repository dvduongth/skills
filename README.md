# danielccn2/skills

Agent skills for CCN2 multiplayer board game development. These skills provide design-first project management for the CCN2 game client, server, and cross-project workflows.

## Skills

| Skill | Description | Focus |
|-------|-------------|-------|
| [project-idea-editor](skills/project-idea-editor/) | Senior game architect for the full CCN2 repository | Cross-project (Client + Server + Demo) |
| [serverccn2-project-editor](skills/serverccn2-project-editor/) | Editor and project manager for the game server | Server (Kotlin/Ktor) |
| [clientccn2-project-editor](skills/clientccn2-project-editor/) | Editor and project manager for the game client | Client (Cocos2d-x JS) |

## Installation

Install all skills:
```bash
npx skills add danielccn2/skills
```

Install a specific skill:
```bash
npx skills add danielccn2/skills --skill project-idea-editor
npx skills add danielccn2/skills --skill serverccn2-project-editor
npx skills add danielccn2/skills --skill clientccn2-project-editor
```

## What These Skills Do

### project-idea-editor
The cross-project architect skill. Use when planning features that span client and server, updating the Game Design Document, checking consistency across the entire codebase, or generating technical documentation.

**Commands:** `scan_project`, `generate_tech_doc`, `edit_idea`, `update_gdd`, `check_design_consistency`, `generate_code_from_design`, `refactor_codebase`

### serverccn2-project-editor
Server-focused project management. Handles Kotlin/Ktor server architecture, deploy environment configuration (`configByMode/`), game resource JSON management, and production readiness audits.

**Commands:** `scan_server`, `generate_server_tech_doc`, `edit_server_idea`, `manage_config`, `check_server_consistency`, `generate_server_code`, `manage_resources`, `review_deploy`, `refactor_server`

### clientccn2-project-editor
Client-focused project management. Handles Cocos2d-x JS client architecture, ActionQueue system (28 action types), EventBus management (45+ events), dual architecture migration (legacy to new), and JSB compatibility enforcement.

**Commands:** `scan_client`, `generate_client_tech_doc`, `edit_client_idea`, `manage_actions`, `manage_events`, `manage_modules`, `manage_configs`, `check_client_consistency`, `generate_client_code`, `refactor_client`, `manage_ui`

## CCN2 Project

CCN2 is a competitive multiplayer board game (Ludo-inspired) with:
- 40-tile circular board, 2-4 players, 2 tokens each
- Server-authoritative architecture (Kotlin/Ktor backend)
- Cocos2d-x JS game client
- Win condition: reach 600 KC and land on Ladder tile

## Design-First Workflow

All three skills enforce: **GDD first, Tech Doc second, Code last**.

```
edit_idea → update_gdd → generate_tech_doc → generate_code → check_consistency
```

## License

MIT
