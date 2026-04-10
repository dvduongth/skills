# Superpowers - Reference Links

## Official Resources

| Link | Description |
|------|-------------|
| [GitHub Repository](https://github.com/obra/superpowers) | Main repository |
| [GitHub Sponsors](https://github.com/sponsors/obra) | Sponsor Jesse Vincent |
| [Claude Marketplace](https://claude.ai/plugins/superpowers) | Official plugin |
| [Release Notes](https://github.com/obra/superpowers/blob/main/RELEASE-NOTES.md) | Version history |

## Installation by Platform

### Claude Code
```bash
/plugin install superpowers@claude-plugins-official
```

### Cursor
```
/add-plugin superpowers
```

### Codex
Fetch and follow instructions from:
https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md

### OpenCode
Fetch and follow instructions from:
https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md

### Gemini CLI
```bash
gemini extensions install https://github.com/obra/superpowers
gemini extensions update superpowers
```

## Related Skills Documentation

- [brainstorming](../brainstorming/SKILL.md) - Socratic design refinement
- [systematic-debugging](../systematic-debugging/SKILL.md) - 4-phase root cause
- [test-driven-development](../test-driven-development/SKILL.md) - RED-GREEN-REFACTOR
- [writing-plans](../writing-plans/SKILL.md) - Implementation plans
- [using-git-worktrees](../using-git-worktrees/SKILL.md) - Isolated workspaces
- [subagent-driven-development](../subagent-driven-development/SKILL.md) - Autonomous iteration
- [verification-before-completion](../verification-before-completion/SKILL.md) - Evidence-based claims
- [writing-skills](../writing-skills/SKILL.md) - Create new skills

## Testing Documentation

- [docs/testing.md](https://github.com/obra/superpowers/blob/main/docs/testing.md) - Testing methodology

## Platform Guides

- [docs/README.codex.md](https://github.com/obra/superpowers/blob/main/docs/README.codex.md) - Codex installation
- [docs/README.opencode.md](https://github.com/obra/superpowers/blob/main/docs/README.opencode.md) - OpenCode installation
- [GEMINI.md](https://github.com/obra/superpowers/blob/main/GEMINI.md) - Gemini CLI instructions

## Directory Structure

```
skills/                      # 14 core skills
  brainstorming/
  dispatching-parallel-agents/
  executing-plans/
  finishing-a-development-branch/
  receiving-code-review/
  requesting-code-review/
  subagent-driven-development/
  systematic-debugging/
  test-driven-development/
  using-git-worktrees/
  using-superpowers/
  verification-before-completion/
  writing-plans/
  writing-skills/

docs/                        # Comprehensive documentation
  superpowers/               # Platform-specific docs
  testing.md                 # Testing methodology

tests/                       # 7 test categories
  brainstorm-server/
  claude-code/
  explicit-skill-requests/
  opencode/
  skill-triggering/
  subagent-driven-dev/

hooks/                       # Hook system
  hooks.json                 # Hook definitions
  run-hook.cmd               # Cross-platform hook runner
  session-start              # Session initialization

.plugins/                    # Platform configs
  .claude-plugin/
  .cursor-plugin/
  .codex/
  .opencode/
  gemini-extension.json
```

## Quality Checklist

- ✅ All major directories documented (skills, docs, hooks, tests)
- ✅ Technology stack accurate (14 skills, 5 platforms, hooks system)
- ✅ Architecture clearly explained (skills pattern, subagent framework)
- ✅ Setup instructions clear (6 platform installation methods)
- ✅ Key files identified (SKILL.md files, hook configs, plugin configs)
- ✅ Dependency relationships mapped (platforms, internal modules)
- ✅ Recommendations specific (for users, contributors, integrators)

## Quick Start

1. Read `skills/using-superpowers/SKILL.md` - understand the skills system
2. Read `README.md` - grasp the basic workflow
3. Practice `skills/brainstorming/` - experience the design refinement process
4. Study `skills/writing-skills/` - learn to create your own skills
5. Explore `skills/` - find relevant ones for your work
