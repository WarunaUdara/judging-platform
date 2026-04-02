---
name: agentic-development-principles
description: Framework for effective AI collaboration defining task decomposition, context management, abstraction selection, and automation philosophy
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: ai-collaboration
---

## What I do

Provide guidelines for effective AI agent collaboration following six core principles.

## Six Core Principles

### 1. Divide and Conquer
- Break complex tasks into small, independently verifiable steps
- Each step should be validate-able on its own
- Example: "Build login page" → 1. UI component, 2. API endpoint, 3. Auth logic, 4. Tests

### 2. Context is like Milk
- Keep context fresh and single-purpose
- Use HANDOFF.md when conversations get long
- Mix of multiple topics reduces performance by up to 39%

### 3. Choose Right Abstraction Level
- **Vibe Coding** (high-level): Prototyping, rapid iteration
- **Deep Dive** (line-by-line): Bug fixes, security, production code
- Production: 70% Deep Dive, 30% Vibe Coding
- Prototype: 80% Vibe Coding, 20% Deep Dive

### 4. Automation of Automation
- Automate tasks repeated 3+ times
- Level up: manual → terminal → voice → scripts → skills → hooks
- Priority: High (daily), Medium (weekly), Low (monthly)

### 5. Plan vs Execute Balance
- **Plan mode** (70-90%): Complex tasks, first-time work, large refactors
- **Execute mode** (10-30%): Simple, well-validated, sandbox environments
- Always use plan mode for irreversible work

### 6. Verify and Reflect
- Write test code
- Visual review via diff
- Draft PR / code review
- Self-verification checklist

## HANDOFF.md Template

```markdown
# HANDOFF.md

## Completed work
- ✅ Task 1 completed
- ✅ Task 2 completed

## Current status
- Working on [current task]

## Next tasks
- Next task 1
- Next task 2

## Tried but failed
- What failed and why

## Cautions
- Watch for X conflicts
```

## Best Practices

DO:
- Focus on one clear goal per conversation
- Regularly clean up context
- Plan before complex work
- Verify all outputs
- Automate repetitive work

DON'T:
- Handle multiple unrelated tasks in one conversation
- Keep working with bloated context
- Auto-run dangerous commands carelessly
- Use AI output without verification
- Repeat work without automating

## Verification Checklist

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] No security vulnerabilities
- [ ] Tests sufficient
- [ ] No performance issues