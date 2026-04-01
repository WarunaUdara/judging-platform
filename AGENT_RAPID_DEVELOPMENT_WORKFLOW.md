Here is the **unified rapid application development Markdown skill** tailored for  **CryptX Judging Platform** project and many local OpenCode CLI agents.

```markdown
# Rapid Application Development Workflow for CryptX Judging Platform

**Project**: CryptX Judging Platform  
**Type**: Next.js 16 + TypeScript + Firebase (Backend complete, Frontend in progress)  
**Goal**: Fast, high-quality frontend development with maximum commit velocity, clean version control, self-improvement, and safe agent behavior.

This document is the **single source of truth** for all agents (human or autonomous).  
Follow it strictly for every contribution.

---

## Core Principles (Must Follow)

1. **Small Modular Changes** — One logical, focused change per commit.
2. **Frequent Pushes** — Push after every meaningful small change.
3. **Self-Improvement** — Use agentic evaluation loops on every major output (UI components, pages, forms, logic).
4. **Governance & Safety** — Never perform dangerous operations. All actions must pass governance checks.
5. **High Commit Count** — Maximize commits through atomic, well-named changes.
6. **Quality First** — Use reflection + evaluator-optimizer patterns before finalizing code.

---

## 1. Git Workflow (Atomic & High-Frequency)

**Branching**: Simple GitHub Flow (optimized for speed)

- Always start from `main`
- Branch name: `feature/<short-kebab-description>` (e.g. `feature/admin-dashboard-layout`, `feature/scoring-form-validation`)
- Never push directly to `main`
- Keep branches short-lived (ideally merge same day)

**Commit Rules** (Conventional Commits – enforced for high commit count)

```text
<type>[optional scope]: <short description>

[optional body]

[optional footer]
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`

**Best Practice for Max Commits**:
- After every small logical piece (e.g. "add sidebar nav", "implement criteria weight validator", "add loading spinner", "fix type error in scoring form") → commit immediately.
- Commit **early and often** — even 5–10 lines of meaningful change deserves its own commit.

**Exact Steps Every Agent Must Follow**:

1. Sync
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create branch for this small change
   ```bash
   git checkout -b feature/<short-description>
   ```

3. Make **one small modular change**

4. Stage & Commit (repeat as needed for multiple tiny steps)
   ```bash
   git add <specific files>
   git commit -m "feat: add scoring form criterion cards"
   ```

5. Push immediately
   ```bash
   git push -u origin feature/<short-description>
   ```

6. When the small task is complete → create PR (or ask human to merge)

**Never** squash PRs — keep rich atomic history for high commit count.

---

## 2. Agentic Evaluation Patterns (Self-Improvement Loop)

Before finalizing any significant piece of code (especially UI components, forms, pages, or complex logic), run an **iterative refinement loop**.

### Recommended Pattern: Evaluator-Optimizer + Code-Specific Reflection

Use this combined approach:

1. **Generate** initial code for the task.
2. **Evaluate** using a clear rubric (accuracy, clarity, completeness, adherence to project structure, Tailwind best practices, TypeScript strictness, accessibility, responsiveness).
3. **Critique** and identify failures.
4. **Refine** the code.
5. **Repeat** up to 3–4 iterations or until score ≥ 0.85.
6. **Final Check**: Run mental or actual tests (form validation, real-time updates, role-based access).

**Rubric Example** (use in evaluation prompt):
- Accuracy (weight 0.4): Matches requirements and existing patterns
- Type Safety (0.2): No `any`, proper use of existing types
- UI/UX (0.2): Clean Tailwind, responsive, good loading states
- Code Quality (0.15): Readable, follows project conventions
- Integration (0.05): Works with existing API routes and hooks

**Code-Specific Loop** (especially useful for React components):
- Generate component
- Generate corresponding tests/stories (if applicable)
- Simulate edge cases (empty states, loading, permission errors)
- Fix until all cases pass

Always log the iteration history briefly in comments for debugging.

---

## 3. Agent Governance & Safety Rules

All agents must respect these hard boundaries:

**Allowed Actions**:
- Reading project files
- Creating/editing frontend files (`app/`, `components/`, `lib/`)
- Running `bun dev`, `bun build`, type checking (`bun tsc --noEmit`)
- Committing & pushing small modular changes
- Creating branches and PR descriptions

**Strictly Forbidden** (will be blocked):
- Running `git push --force`
- Deleting branches or files without explicit need
- Modifying `.env*`, Firebase rules, or backend API routes (backend is production-ready)
- Running shell commands that modify infrastructure (`firebase deploy`, `vercel deploy` unless explicitly requested)
- Accessing or leaking any credentials
- Making changes outside the frontend development scope

**Intent Classification**:
Before any tool use, check for dangerous patterns (data exfiltration, destructive git commands, secret handling). If detected → abort and report.

**Trust Scoring**:
- Start at neutral trust.
- Successful small, correct commits → increase trust.
- Errors, large messy changes, or governance violations → decrease trust.
- Sensitive operations (e.g. major refactors) require higher trust.

**Audit Trail**:
Every major action (file creation, significant edit, commit) should be mentally noted or logged in commit messages.

---

## 4. Development Priorities (Current Focus)

**Phase 1 (Immediate)** – Authentication & Layouts
- Login page with Google + Email
- Role-based redirects
- Protected layouts: `/admin/layout.tsx` and `/judge/layout.tsx`

**Phase 2** – Admin Panel
- Dashboard
- Competitions management (list + create)
- Criteria editor with weight validation (sum to 100%)
- Teams list + import modal
- Evaluators invite system
- Real-time leaderboard

**Phase 3** – Evaluator Panel
- Dashboard with assigned teams
- Scoring form (criterion cards + live preview + draft save)
- Leaderboard view

**General Rules for All Changes**:
- Use existing types from `lib/types.ts`
- Reuse `useLeaderboard` hook for real-time updates
- Follow Tailwind + shadcn/ui style (clean, modern, responsive)
- Add proper loading states and error handling
- Use React Hook Form + Zod where forms are involved
- Keep components modular and reusable

---

## 5. Daily/Per-Task Workflow for Agents

1. Read this document + current project status (`BUILD_SUMMARY.md` or similar).
2. Pick one small modular task from the pending frontend list.
3. Sync `main` → create feature branch.
4. Generate initial code.
5. Run **Agentic Evaluation Loop** (Evaluator-Optimizer + Reflection) until quality is high.
6. Make multiple small commits during implementation.
7. Push after every meaningful chunk.
8. When task is complete → push final changes and notify human for PR review/merge.
9. Delete branch after merge and start next task.

---

## Quick Reference Checklist (Copy for Every Task)

- [ ] Synced with latest `main`
- [ ] Working on a properly named `feature/` branch
- [ ] Changes are small and modular
- [ ] Used agentic evaluation (reflection + scoring)
- [ ] Code passes type check and follows project conventions
- [ ] Multiple small commits created
- [ ] Pushed to remote
- [ ] No governance violations

---

**Remember**:
- **Speed through small steps + frequent commits**
- **Quality through self-critique loops**
- **Safety through governance**

All three agents should treat this document as their operating manual.

**Let’s build the CryptX Judging Platform frontend rapidly and cleanly.**

---
