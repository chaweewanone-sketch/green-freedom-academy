# Green Freedom Academy — Cursor Guide

**Playbook version:** 1.0  
**Audience:** Developers and AI coding agents using Cursor

---

## Purpose

This guide explains how to work effectively on Green Freedom Academy using Cursor, the project rule (`.cursor/rules/gfa.mdc`), and the Playbook in `docs/`.

---

## Project Rule

**File:** `.cursor/rules/gfa.mdc`  
**Scope:** `alwaysApply: true` — active in every Cursor session for this project.

The rule provides:

- Mission and teacher-first principles
- Tech stack summary
- Non-negotiable coding constraints
- Pointer to `docs/` for detailed standards

**Always read relevant Playbook docs before substantial work.**

---

## Playbook Index

| Doc | When to read |
|-----|--------------|
| [01-VISION.md](./01-VISION.md) | Understanding mission, users, principles |
| [02-ROADMAP.md](./02-ROADMAP.md) | What is CURRENT vs PLANNED vs FUTURE |
| [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) | Routes, data flow, Supabase schema |
| [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) | CSS tokens, classes, responsive rules |
| [05-CODING-STANDARDS.md](./05-CODING-STANDARDS.md) | TypeScript, React, validation |
| [06-CURSOR-GUIDE.md](./06-CURSOR-GUIDE.md) | This file |
| [07-PROMPT-LIBRARY.md](./07-PROMPT-LIBRARY.md) | Copy-paste prompts for common tasks |
| [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) | Local dev, branches, validation |
| [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) | Pre-deploy verification |
| [10-CHANGELOG.md](./10-CHANGELOG.md) | Version history |

---

## Before You Code

1. **Inspect the repository** — Confirm what actually exists; do not assume Supabase or AI features work.
2. **Check roadmap status** — [02-ROADMAP.md](./02-ROADMAP.md) defines CURRENT vs PLANNED.
3. **Read affected architecture** — Routes, components, and data flow in [03-ARCHITECTURE.md](./03-ARCHITECTURE.md).
4. **Match the design system** — Reuse classes from [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md).
5. **Scope the task** — Prefer minimal diffs; preserve demo functionality.

---

## Agent Behavior Rules

### Do

- Use English for filenames, code identifiers, and technical docs.
- Use Thai for user-facing UI copy (unless English is pedagogically required).
- Run `npm run build` before marking work complete.
- Distinguish clearly between implemented and planned features in responses.
- Extract reusable components when patterns repeat.
- Propose refactoring rationale **before** large structural changes.

### Do not

- Invent completed features (auth, persistence, AI generators, worksheets, assessments).
- Delete or break working demo pages without explicit approval.
- Modify `app/`, `components/`, `lib/`, `public/`, or `supabase/` when the task is **documentation only**.
- Introduce new dependencies without stating why.
- Skip build validation.

---

## Typical Task Flow

```
1. User describes goal
2. Agent reads gfa.mdc + relevant docs/
3. Agent inspects affected files in repo
4. Agent states plan (especially for refactoring)
5. Agent implements minimal change
6. Agent runs npm run build
7. Agent updates CHANGELOG / docs if behavior changed
8. Agent summarizes what changed and what remains PLANNED
```

---

## Key Repository Facts (Quick Reference)

| Topic | Truth in repo today |
|-------|---------------------|
| Auth | Demo only — `localStorage` role, no Supabase Auth |
| Supabase client | `lib/supabase-browser.ts` exists but is **unused** |
| Database | `supabase/schema.sql` only — not connected |
| Lessons | One hardcoded lesson: `/lesson/present-simple` |
| Practice / Game | UI placeholders only ("ยังล็อก") |
| Components | `BrandHeader` only |
| Tests / Lint | Not configured |
| PWA icons | Empty in manifest |

---

## File-Specific Guidance

| Area | Guidance |
|------|----------|
| `app/**/*.tsx` | App Router pages; prefer Server Components unless interactivity needed |
| `components/` | Shared UI; PascalCase filenames |
| `lib/` | Clients, utilities, shared non-UI logic |
| `app/globals.css` | All styling; extend tokens before adding one-off colors |
| `supabase/schema.sql` | Schema changes require doc updates and RLS review |
| `docs/` | Playbook; keep in sync when shipping features |

---

## When to Update Documentation

Update Playbook docs when:

- A PLANNED feature moves to CURRENT
- Routes, env vars, or schema change
- Design tokens or major UI patterns change
- Release version bumps

Always update [10-CHANGELOG.md](./10-CHANGELOG.md) for user-visible or architectural changes.

---

## Prompts

Use [07-PROMPT-LIBRARY.md](./07-PROMPT-LIBRARY.md) for ready-made prompts covering analysis, planning, bugs, refactoring, review, build verification, and doc updates.

---

## Related Documents

- `.cursor/rules/gfa.mdc` — Auto-applied Cursor rule
- [05-CODING-STANDARDS.md](./05-CODING-STANDARDS.md) — Code conventions
- [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) — Dev setup
