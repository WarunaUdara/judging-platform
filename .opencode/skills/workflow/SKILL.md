---
name: workflow
description: Rapid application development workflow following AGENT_RAPID_DEVELOPMENT_WORKFLOW.md - atomic commits, high-frequency pushes, self-improvement loops
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: rapid-development
---

## What I do

Follow the rapid development workflow from AGENT_RAPID_DEVELOPMENT_WORKFLOW.md:

1. **Small Modular Changes** — One logical, focused change per commit
2. **Frequent Pushes** — Push after every meaningful small change  
3. **Self-Improvement** — Use agentic evaluation loops (Evaluator-Optimizer pattern)
4. **High Commit Count** — Maximize commits through atomic, well-named changes
5. **Quality First** — Use reflection + evaluator-optimizer patterns before finalizing

## Git Workflow

- Branch from `main`: `git checkout -b feature/<short-description>`
- Commit format: `<type>[optional scope]: <short description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`
- Push immediately after commit
- Never push directly to main

## Agentic Evaluation Pattern

Before finalizing any significant code:
1. Generate initial code
2. Evaluate using rubric (accuracy 0.4, type safety 0.2, UI/UX 0.2, code quality 0.15, integration 0.05)
3. Critique and identify failures
4. Refine the code
5. Repeat up to 3-4 iterations until score >= 0.85
6. Final check with tests

## Governance Rules

- Allowed: Reading files, creating/editing frontend files, running dev/build, committing & pushing
- Forbidden: git push --force, deleting files without need, modifying .env*, accessing credentials
- Trust scoring starts neutral, increases with successful commits

## Quick Reference

- [ ] Synced with latest main
- [ ] Working on properly named feature/ branch
- [ ] Changes are small and modular
- [ ] Used agentic evaluation
- [ ] Code passes type check
- [ ] Multiple small commits
- [ ] Pushed to remote
- [ ] No governance violations