# speckit — Spec-Driven Development Toolkit

## Tổng Quan

speckit là một skill Claude Code chuyển đổi ý tưởng feature hỗn độn thành specifications có cấu trúc, technical plans, và actionable tasks thông qua pipeline 9 bước.

## Cấu Trúc

```
.claude/skills/speckit/
├── SKILL.md                              # Main skill (~257 lines)
├── README.md                             # This file
├── COMPLETION.md                         # Completion report
├── references/
│   ├── concepts.md                       # SDD philosophy (~73 lines)
│   └── commands/                         # 9 command references
│       ├── constitution.md               # Governance: Create constitution
│       ├── specify.md                    # Governance: Feature spec
│       ├── clarify.md                    # Governance: Resolve ambiguities
│       ├── plan.md                       # Planning: Technical roadmap
│       ├── tasks.md                      # Planning: Task breakdown
│       ├── analyze.md                    # Quality: Consistency analysis
│       ├── checklist.md                  # Quality: Domain checklists
│       ├── implement.md                  # Execution: Generate code
│       └── taskstoissues.md              # Execution: GitHub integration
└── templates/                            # 5 templates
    ├── constitution-template.md
    ├── spec-template.md
    ├── plan-template.md
    ├── tasks-template.md
    └── checklist-template.md
```

## Pipeline 9 Commands

```
constitution → specify → clarify → plan → tasks → analyze → checklist → implement → taskstoissues
```

### 1. **constitution** — Establish Project Constitution
Input: User principles  
Output: `specs/constitution.md`  
Prerequisites: None

### 2. **specify** — Create Structured Feature Specification  
Input: Feature description  
Output: `specs/[###]-feature-name/spec.md` + quality checklist  
Prerequisites: Constitution (recommended)

### 3. **clarify** — Resolve Ambiguous Sections
Input: `spec.md` with [NEEDS CLARIFICATION] markers  
Output: Updated `spec.md` (all markers resolved)  
Prerequisites: `specify`

### 4. **plan** — Generate Technical Implementation Plan
Input: `spec.md` + `constitution.md`  
Output: `plan.md` + `research.md` + `data-model.md` + `contracts/`  
Prerequisites: `specify` (clarify recommended)

### 5. **tasks** — Generate Actionable Task Breakdown
Input: `plan.md` + `spec.md`  
Output: `tasks.md` (phased, story-grouped)  
Prerequisites: `plan`

### 6. **analyze** — Cross-Artifact Consistency Analysis
Input: All SDD artifacts  
Output: Console analysis report (READ-ONLY)  
Prerequisites: `tasks`

### 7. **checklist** — Generate Domain-Specific Quality Checklist
Input: Feature context + domain type  
Output: `specs/checklists/{domain}.md`  
Prerequisites: `specify` (anytime)

### 8. **implement** — Execute Implementation from Tasks
Input: `tasks.md` + `plan.md`  
Output: Source code + marked tasks as [DONE]  
Prerequisites: `tasks` (analyze recommended)

### 9. **taskstoissues** — Convert Tasks to GitHub Issues
Input: `tasks.md`  
Output: GitHub Issues via `gh` CLI  
Prerequisites: `tasks` + GitHub remote

## Usage Example

```bash
# Full pipeline từ đầu
speckit constitution
speckit specify "I want to add user authentication"
speckit clarify
speckit plan
speckit tasks
speckit analyze
speckit checklist  # e.g., "security checklist for auth feature"
speckit implement
speckit taskstoissues
```

## Storage Convention

- **Root**: `specs/` at project root (git-ignored)
- **Constitution**: `specs/constitution.md` (shared across all features)
- **Per-feature**: `specs/[###]-feature-name/`
  - `spec.md` — Feature specification
  - `plan.md` — Implementation plan
  - `research.md` — External research notes
  - `data-model.md` — Data structures
  - `contracts/` — API contracts, interfaces
  - `tasks.md` — Task breakdown
- **Checklists**: `specs/checklists/{domain}.md`

## Key Innovations

### 1. Constitution Governance
Principles bất biến cho project — tất cả quyết định phải align với constitution.

### 2. Specification Templates  
Structured specs với mandatory sections — không phải free-form docs.

### 3. "Unit Tests for English"
Quality checklists validate requirement quality, NOT implementation:
- ✅ Test completeness, clarity, consistency, measurability
- ❌ NOT for verification/testing của code

## Adaptations từ SPECIFY_DEMO

| Original | Adapted | Reason |
|----------|---------|--------|
| PowerShell scripts | Bash commands | Claude Code native |
| `.specify/` | `specs/` | Simpler, visible |
| `.kilocode/workflows/` | `.claude/skills/speckit/` | Claude Code format |
| 18+ agents | Claude Code only | Simplified |

## Validation Results

✅ **ALL CHECKS PASSED**
- SKILL.md: 257 lines, 9 commands
- Templates: 5 files
- Command references: 9 files
- Concepts: 1 file
- YAML frontmatter: Complete
- Phase completion: All 6 phases ✅

## Documentation

- **SKILL.md**: Main skill definition with triggers and 9 commands
- **references/concepts.md**: SDD philosophy và core principles
- **references/commands/**: Detailed workflow cho mỗi command
- **templates/**: Document templates
- **COMPLETION.md**: Full completion report
- **README.md**: This file

---

**Status**: ✅ COMPLETED (2026-03-11)  
**Total Files**: 17 (16 skill files + 1 completion report)  
**Ready for use**: Yes
