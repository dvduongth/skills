---
name: speckit
description: |
  Spec-Driven Development (SDD) toolkit — pipeline từ feature description
  đến structured spec, technical plan, và actionable tasks.
  Triggers: "speckit", "specify", "write spec", "feature spec", "plan feature",
  "clarify requirements", "generate tasks", "analyze consistency",
  "quality checklist", "implement feature", "constitution", "SDD"
compatible-tools:
  - legacy-project-analyzer
tags:
  - specification, planning, requirements, implementation, quality
---

# speckit — Spec-Driven Development Toolkit

## Overview

Spec-Driven Development (SDD) transforms chaotic feature ideas into structured, implementable specifications through a 9-step pipeline. Think of it as "unit tests for English" — each artifact is validated and feeds into the next.

**Core Innovation:**
1. **Constitution Governance** — Project principles that never change
2. **Specification Templates** — Structured specs with mandatory sections
3. **Pipeline Validation** — Each step validates the previous + enforces prerequisites

**Workflow Chain:**
```
constitution → specify → clarify → plan → tasks → analyze → checklist → implement → taskstoissues
```

## Storage Convention

- **Root**: `specs/` at project root (git-ignored)
- **Constitution**: `specs/constitution.md` (shared across all features)
- **Per-feature**: `specs/NNN-feature-name/`
  - `spec.md` — Feature specification
  - `plan.md` — Implementation plan
  - `research.md` — External research notes
  - `data-model.md` — Data structures
  - `contracts/` — API contracts, interfaces
- **Checklists**: `specs/checklists/{domain}.md`

## 9 Commands

### 1. constitution — Establish Project Constitution

**Purpose**: Define immutable project principles that guide all decisions.

**Input**: User's core principles, values, constraints
**Output**: `specs/constitution.md`
**Prerequisites**: None
**Steps**:
1. Collect principles (max 20)
2. Structure as governance rules
3. Create validation clauses
4. Generate initial constitution.md

**Next**: Use `specify` to create first feature spec

---

### 2. specify — Create Structured Feature Specification

**Purpose**: Transform feature description into comprehensive, testable specification.

**Input**: Feature description from user
**Output**: `specs/NNN-feature-name/spec.md` + quality checklist
**Prerequisites**: Constitution (recommended)
**Steps**:
1. Analyze feature description
2. Apply spec-template.md
3. Identify ambiguous sections (MARK AS NEEDS CLARIFICATION)
4. Generate quality checklist
5. Auto-number feature (001, 002, ...)
6. Save to specs/

**Next**: Use `clarify` to resolve marked sections

---

### 3. clarify — Resolve Ambiguous Specification Sections

**Purpose**: Iteratively refine spec by answering NEEDS CLARIFICATION markers.

**Input**: `specs/NNN-feature/spec.md` with marked sections
**Output**: Updated `spec.md` (removed markers)
**Prerequisites**: `specify`
**Steps**:
1. Read spec.md
2. Collect all NEEDS CLARIFICATION markers
3. Ask max 5 questions per iteration
4. Update spec.md with answers
5. Check for remaining markers
6. Repeat until clear

**Next**: Use `plan` to create implementation roadmap

---

### 4. plan — Generate Technical Implementation Plan

**Purpose**: Create detailed plan from spec, including architecture, data models, and research needs.

**Input**: `spec.md` + `constitution.md`
**Output**: `plan.md` + `research.md` + `data-model.md` + `contracts/`
**Prerequisites**: `specify` (clarify recommended)
**Steps**:
1. Read spec.md + constitution.md
2. Create plan.md (phases, milestones, architecture)
3. Identify research needs → research.md
4. Design data structures → data-model.md
5. Create API contracts → contracts/*.md
6. Validate against constitution

**Next**: Use `tasks` to break into actionable items

---

### 5. tasks — Generate Actionable Task Breakdown

**Purpose**: Convert plan into concrete, testable tasks grouped by user stories.

**Input**: `plan.md` + `spec.md`
**Output**: `tasks.md` (phased, story-grouped)
**Prerequisites**: `plan`
**Steps**:
1. Read plan.md + spec.md
2. Break into user stories (US001, US002, ...)
3. Create testable tasks per story
4. Add prerequisites/dependencies
5. Mark as [P] priority if needed
6. Format: `- [ ] T### [P?] [US?] description`

**Next**: Use `analyze` to validate consistency

---

### 6. analyze — Cross-Artifact Consistency Analysis

**Purpose**: Read-only analysis of all SDD artifacts for consistency and gaps.

**Input**: `spec.md` + `plan.md` + `tasks.md` + `constitution.md`
**Output**: Console report (READ-ONLY, no file changes)
**Prerequisites**: `tasks`
**Steps**:
1. Load all 4 artifacts
2. Check spec ↔ plan alignment
3. Verify plan ↔ tasks coverage
4. Validate against constitution
5. Generate console report
6. No file modifications

**Next**: Use `checklist` for domain quality checks, or `implement` to code

---

### 7. checklist — Generate Domain-Specific Quality Checklist

**Purpose**: Create quality checklist based on domain (frontend, backend, database, etc.).

**Input**: Feature context + domain type
**Output**: `specs/checklists/{domain}.md`
**Prerequisites**: `specify` (anytime)
**Steps**:
1. Identify domain (frontend, backend, mobile, db, devops, security)
2. Load domain template
3. Customize to feature
4. Add domain-specific checks
5. Save to checklists/

**Next**: Use with `implement` for quality gates

---

### 8. implement — Execute Implementation from Tasks

**Purpose**: Generate source code based on tasks.md and plan.md.

**Input**: `tasks.md` + `plan.md` + related artifacts
**Output**: Source code files + marked tasks as [DONE]
**Prerequisites**: `tasks` (analyze recommended)
**Steps**:
1. Read tasks.md + plan.md
2. Identify unmarked tasks
3. Generate code for each task
4. Create/update source files
5. Mark tasks as [DONE] in tasks.md
6. Update artifacts (plan.md, spec.md) if needed

**Next**: Use `taskstoissues` to track in GitHub

---

### 9. taskstoissues — Convert Tasks to GitHub Issues

**Purpose**: Create GitHub Issues from completed tasks.md.

**Input**: `tasks.md`
**Output**: GitHub Issues via `gh` CLI
**Prerequisites**: `tasks` + GitHub remote
**Steps**:
1. Read tasks.md
2. Parse all tasks
3. Create issue per task
4. Include description, labels, project info
5. Use `gh` CLI to create issues

**Next**: Track progress in GitHub

---

## Quick Decision Guide

| User Request | Command |
|--------------|---------|
| "Establish project principles" | constitution |
| "Turn this idea into a spec" | specify |
| "Unclear parts need clarification" | clarify |
| "Create implementation roadmap" | plan |
| "Break into tasks" | tasks |
| "Check consistency" | analyze |
| "Quality checklist for domain" | checklist |
| "Generate code from tasks" | implement |
| "Create GitHub issues" | taskstoissues |
| "Full pipeline from scratch" | constitution → specify → clarify → plan → tasks |

## Workflow Rules

1. **Constitution Supreme** — All decisions must align with constitution.md
2. **Max 5 Questions** — Per clarification iteration to avoid scope creep
3. **Sequential Pipeline** — Each step requires previous output as input
4. **Numbering System** — Features (001+), Tasks (T001+), User Stories (US001+)
5. **Git-Ignore** — All `specs/` files are git-ignored by default
6. **Template Enforcement** — Always use provided templates
7. **No PowerShell** — All scripts use Bash commands
8. **Read-Only Analyze** — `analyze` never modifies files
9. **Quality Gates** — Checklist required before `implement`
10. **Graceful Failure** — Handle non-git repos and missing remotes

## Response Format

All commands follow this pattern:
```
[COMMAND] ✓ Generated artifact
Input: ...
Output: ...
Next: [RECOMMENDED_COMMAND]

[CONCISE_SUMMARY]
```

## Validation

After each command, call: `validate_result artifact_path`
- **Severity**: CRITICAL (blocks pipeline), WARNING (should fix), INFO (FYI)
- **Automated checks**: File exists, proper structure, template compliance
- **Spot checks**: 3 random items manually validated
- **Action**: Fix CRITICAL, review WARNING, acknowledge INFO