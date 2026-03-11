# Superpowers - Workflow Framework cho AI Coding Agents

## Overview

**Superpowers** là một complete software development workflow framework cho coding agents, được xây dựng trên hệ thống các "skills" có thể compose và những instructions ban đầu để đảm bảo agent sử dụng chúng đúng cách.

### Core Philosophy

- **Test-Driven Development** - Viết tests trước, luôn luôn
- **Systematic over ad-hoc** - Process hơn là guess
- **Complexity reduction** - Simplicity là primary goal
- **Evidence over claims** - Verify trước khi declare success

### Status

**Active** - Version 5.0.1 (released 2026-03-10)
- Active community contributions
- Official Claude Code marketplace plugin
- Creator: Jesse Vincent (jesse@fsck.com)

---

## When to Use

Invoke skill này **TRƯỚC mỗi conversation** hoặc khi user muốn:

| Trigger | Response |
|---------|----------|
| Bắt đầu session mới | Giới thiệu 14 skills và cách use |
| User hỏi "how do I do X" | Find appropriate skill |
| User muốn create new skill | Guide via writing-skills |
| User đang coding without process | Remind of brainstorming → planning → implementation |

**The Rule:**
```
Invoke relevant skills BEFORE any response or action
Even 1% chance → invoke skill to check
```

---

## 14 Skills Library

### Process Skills (HOW - Priority 1)

| Skill | Purpose |
|-------|---------|
| **brainstorming** | Socratic design refinement - extracts specs from conversation |
| **systematic-debugging** | 4-phase root cause process (Root Cause → Pattern → Hypothesis → Implementation) |
| **test-driven-development** | RED-GREEN-REFACTOR cycle - no production code without failing test |
| **writing-plans** | Break work into bite-sized tasks (2-5 min each) |
| **using-git-worktrees** | Creates isolated workspace on new branch |
| **subagent-driven-development** | Fast iteration với two-stage review (spec compliance → code quality) |
| **executing-plans** | Batch execution với checkpoints |
| **dispatching-parallel-agents** | Concurrent subagent workflows |
| **requesting-code-review** | Pre-review checklist |
| **receiving-code-review** | Responding to feedback |
| **finishing-a-development-branch** | Merge/PR decision workflow |

### Implementation Skills (WHAT - Priority 2)

| Skill | Purpose |
|-------|---------|
| **verification-before-completion** | Ensure fixes actually work - evidence before assertions |
| **using-superpowers** | Introduction to skills system (this skill) |
| **writing-skills** | Create new skills following best practices (TDD for docs) |

---

## Standard Workflow

```
brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch
```

### Alternative Workflow
```
brainstorming → writing-plans → executing-plans → finishing-a-development-branch
```

### Debug Flow
```
systematic-debugging → (if bug fix) → test-driven-development
```

### Git Worktrees
```
using-git-worktrees → (any development work) → finishing-a-development-branch
```

### Code Review
```
requesting-code-review → receiving-code-review
```

### Parallel Work
```
dispatching-parallel-agents (for independent issues)
```

---

## Skill Discovery

### When User Asks "How do I do X"

Use `find-skills` skill để discover appropriate skill:
- "how do I debug this" → systematic-debugging
- "how do I plan this feature" → brainstorming + writing-plans
- "how do I create a skill" → writing-skills

### Skill Priority Order

1. **Process skills first** (brainstorming, debugging) - determine HOW
2. **Implementation skills second** (frontend-design, mcp-builder) - guide execution

---

## Platform Support

Superpowers hỗ trợ 5 platforms:

| Platform | Installation |
|----------|--------------|
| Claude Code | `/plugin install superpowers@claude-plugins-official` |
| Cursor | `/add-plugin superpowers` |
| Codex | Install from `.codex/INSTALL.md` |
| OpenCode | Install from `.opencode/INSTALL.md` |
| Gemini CLI | `gemini extensions install https://github.com/obra/superpowers` |

---

## Core Patterns

### 1. Skills Pattern
Each skill is a self-contained documentation unit với:
- YAML frontmatter (name, description)
- Structured content (Overview, When to Use, Workflow)
- Checklists và process flows
- Platform-specific adaptations

### 2. Hook Pattern
Session lifecycle hooks cho automation:
- SessionStart - initialization
- SessionResume - restore context
- SessionClear - cleanup
- SessionCompact - reduce context

### 3. Subagent Pattern
Two-stage review process:
- **Stage 1**: Spec compliance check
- **Stage 2**: Code quality review

### 4. TDD for Documentation
- Write test scenarios (pressure tests với subagents)
- Watch baseline behavior (agent violates rule)
- Write skill (documentation)
- Verify compliance (agent follows skill)
- Refactor (close loopholes)

---

## Repository Structure

```
superpowers/
├── skills/                      # 14 core skills
│   ├── brainstorming/
│   ├── dispatching-parallel-agents/
│   ├── executing-plans/
│   ├── finishing-a-development-branch/
│   ├── receiving-code-review/
│   ├── requesting-code-review/
│   ├── subagent-driven-development/
│   ├── systematic-debugging/
│   ├── test-driven-development/
│   ├── using-git-worktrees/
│   ├── using-superpowers/
│   ├── verification-before-completion/
│   ├── writing-plans/
│   └── writing-skills/
├── docs/                        # Comprehensive documentation
│   ├── superpowers/             # Platform-specific docs
│   ├── testing.md               # Testing methodology
│   └── README.codex.md          # Codex installation guide
├── tests/                       # 7 test categories
├── hooks/                       # Hook system
├── .claude-plugin/              # Claude Code plugin config
├── .cursor-plugin/              # Cursor plugin config
├── .codex/                      # Codex platform support
├── .opencode/                   # OpenCode platform support
└── README.md                    # Main documentation
```

---

## Key Files

| File | Purpose |
|------|---------|
| `skills/using-superpowers/SKILL.md` | Skills system introduction |
| `skills/writing-skills/SKILL.md` | Create new skills (TDD for docs) |
| `skills/brainstorming/SKILL.md` | Design refinement |
| `skills/test-driven-development/SKILL.md` | RED-GREEN-REFACTOR |
| `docs/testing.md` | Testing methodology |
| `README.md` | Main project documentation |

---

## Verification

Ask for something that should trigger a skill:
- "help me plan this feature" → brainstorming
- "let's debug this issue" → systematic-debugging
- "create a new skill" → writing-skills

Agent should automatically invoke relevant superpowers skill.

---

## References

- **Repository**: https://github.com/obra/superpowers
- **GitHub**: https://github.com/obra
- **Sponsor**: https://github.com/sponsors/obra
- **License**: MIT

---

## Summary

**Superpowers** transforms chaotic coding agent interactions into disciplined, reproducible workflows.

**Key Differentiators:**
1. Process over ad-hoc action
2. Skills system với mandatory invocation
3. TDD applied to documentation
4. Subagent autonomous workflows
5. Visual brainstorming companion

**Maturity**: Production-ready (v5.0.1) với active maintenance, comprehensive testing, and official marketplace presence.
