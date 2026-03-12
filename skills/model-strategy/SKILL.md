---
name: model-strategy
description: Use when choosing LLM model for task based on complexity - deep analysis uses opus/sonnet, simple tasks use haiku
---

# Model Strategy

## Overview

Automatically select optimal Claude model based on task complexity to balance performance and cost. Use higher reasoning models for complex tasks, faster models for simple tasks.

## When to Use

**Apply this strategy BEFORE starting any task involving:**
- Code analysis or architecture review
- Writing or refactoring
- Technical research or exploration
- Complex problem-solving

**Match task type to model:**
- **Deep Analysis**: Complex reasoning, architecture patterns, system design
- **Assembly/Format/Search**: Simple file operations, formatting, basic search
- **Extreme Complexity**: Formal verification, consensus algorithms, advanced optimization

## Core Strategy

### Complexity-Based Model Selection

| Task Type | Model | Use When |
|-----------|-------|----------|
| **Extreme Complexity** | `opus-4-6` | Formal verification, distributed consensus, Byzantine fault tolerance, proof systems |
| **Deep Analysis** | `sonnet-4-6` | Architecture review, system design, complex code analysis, multi-service coordination |
| **Assembly/Format/Search** | `haiku-4-5` | File search, formatting, simple operations, list generation, basic transformations |

### Decision Tree

```
Is task extremely complex?
├─ YES → Use opus-4-6
└─ NO → Is it deep analysis/architecture/system design?
    ├─ YES → Use sonnet-4-6
    └─ NO → Use haiku-4-5 (assembly, format, search)
```

## Examples

### ✅ Correct Application

**Task**: Analyze microservices architecture with 15 services
```
Decision: Deep analysis → sonnet-4-6
Reasoning: Requires architectural pattern recognition, service interaction analysis
```

**Task**: Search 100 files and format list
```
Decision: Simple search/format → haiku-4-5
Reasoning: Basic file operations, no complex reasoning needed
```

**Task**: Design distributed consensus algorithm
```
Decision: Extreme complexity → opus-4-6
Reasoning: Formal verification, Byzantine failures, 1000+ node optimization
```

## Quick Reference

```bash
# Decision workflow:
# 1. Can you solve this in 5 minutes with simple commands? → haiku-4-5
# 2. Does this require architectural thinking? → sonnet-4-6
# 3. Does this require formal proofs or consensus protocols? → opus-4-6
```

**Common Patterns:**
- Code formatting, file search → haiku-4-5
- Refactoring, pattern analysis → sonnet-4-6
- Algorithm design, formal verification → opus-4-6

## Common Mistakes

❌ **Using opus-4-6 for simple tasks**
- Wastes resources on basic operations
- haiku-4-5 is faster and cheaper for simple tasks

❌ **Using haiku-4-5 for complex analysis**
- May miss architectural patterns
- sonnet-4-6 designed for deep analysis

❌ **Not stating model choice upfront**
- Makes reasoning unclear
- Add model decision to your opening statement

## Implementation

Always state your model choice when starting a task:

```
I'll use [model] because [task type].
```

Example:
```
I'll use sonnet-4-6 because this requires deep analysis of the
microservices architecture pattern.
```