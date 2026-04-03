# Skill Template

> Use this template to author or upgrade any skill file.
> Each layer answers a specific question. All layers are required.

---

## Intent Layer

**Question answered:** *What am I trying to accomplish, and by what standard?*

| Field | Description |
| ----- | ----------- |
| **Role** | Who executes this skill (e.g., Designer, Tech Lead, QC) |
| **Goal** | What outcome this skill produces |
| **Use when** | Trigger conditions — when should this skill be invoked? |
| **Constraints / Requirements** | Rules, limits, non-negotiables that must be respected |
| **Anti-patterns** | What NOT to do — common wrong approaches |
| **Quality standard** | How to distinguish correct output from incorrect output |
| **Output format** | Language, file format, structure of the deliverable |

---

## Knowledge Layer

**Question answered:** *What must I know before doing this correctly?*

- Required reading: guides, templates, rules, reference docs
- Domain knowledge prerequisites
- Related skills or prior steps that must be completed first
- Key constraints or standards defined elsewhere (e.g., CLAUDE.md, constitution.md)

List all inputs that must be read or understood before execution begins.

---

## Execution Layer

**Question answered:** *How do I do this, step by step, in a runnable way?*

Provide numbered, concrete steps:

1. Step one — specific action, specific tool or script
2. Step two — ...
3. ...

- Reference exact scripts: `python tools/validate_structure.py <feature_id>`
- Invoke related skills explicitly: `Skill("design-validate")`
- Define expected output at each step
- Flag any user confirmation gates with `AskUserQuestion`

---

## Verification Layer

**Question answered:** *How do I know what was just produced is correct, usable, and trustworthy?*

Use the **4C Checklist**:

### Correctness — Is it right

- [ ] Logic is sound
- [ ] Facts and data are accurate
- [ ] Process was followed correctly
- [ ] Output matches required format

### Completeness — Is it all there

- [ ] All required outputs are present
- [ ] All required inputs were consumed
- [ ] No important steps were skipped

### Context-fit — Does it fit the situation

- [ ] Aligned with stated goal
- [ ] Appropriate technical depth for the audience
- [ ] Scoped correctly (not too broad, not too narrow)

### Consequence — Will it hold up in real use

- [ ] Would pass a real execution without errors
- [ ] Team members can understand and act on it without misinterpretation
- [ ] No silent assumptions that could cause downstream failures

---

## Evolution Layer

**Question answered:** *After each failure, how does the skill system get smarter?*

Every occurrence of the following is data for skill improvement:

- Execution errors
- Hallucinations or fabricated outputs
- Wrong format in output
- Missing steps that had to be added manually
- Output that required significant manual correction

### Evolution artifacts (maintained per skill)

| File | Purpose |
| ---- | ------- |
| `gotchas.md` | Sharp edges — things that trip up even experienced users |
| `failed-cases.md` | Real failures with root cause analysis |
| `edge-cases.md` | Boundary conditions and how to handle them |
| `changelog.md` | Version history of skill changes |
| `lessons-learned.md` | Insights extracted from post-mortems |
| `improvement-notes.md` | Queued improvements not yet implemented |

### Process

After any failure or correction:

1. Identify which layer broke down (Intent / Knowledge / Execution / Verification)
2. Document the failure in the appropriate artifact file
3. Update the relevant layer in the skill to prevent recurrence
4. Increment the skill version in `changelog.md`
