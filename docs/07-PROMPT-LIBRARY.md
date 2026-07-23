# Green Freedom Academy — Prompt Library

**Playbook version:** 1.0  
**Usage:** Copy, customize bracketed sections, paste into Cursor

Prompts assume the Green Freedom Playbook in `docs/` and rule in `.cursor/rules/gfa.mdc`.

---

## 1. Project Analysis

```
You are my senior software engineer for Green Freedom Academy.

Before writing any code:
1. Read docs/01-VISION.md, docs/02-ROADMAP.md, and docs/03-ARCHITECTURE.md.
2. Inspect the repository’s actual current state.
3. Do not invent completed features.

Explain:
- Architecture and folder structure
- Data flow (what is real vs demo)
- Reusable components
- Technical debt
- Suggested improvements

Do NOT modify any files. Analysis only.
```

---

## 2. Feature Planning

```
Plan a new feature for Green Freedom Academy: [FEATURE NAME]

Requirements:
1. Read docs/02-ROADMAP.md — classify as CURRENT, IN PROGRESS, PLANNED, or FUTURE.
2. Confirm teacher-first value: how does this save teacher time?
3. Align with Learn → Short Practice → Game if student-facing.
4. Preserve existing demo functionality.
5. List affected files, new files, and schema changes (if any).
6. Identify risks and validation steps (npm run build).

Output:
- Problem statement
- User stories (teacher + student)
- Technical approach
- Phased implementation plan
- What stays PLANNED vs what this task delivers

Do NOT implement yet unless I say "implement".
```

---

## 3. Bug Fixing

```
Fix a bug in Green Freedom Academy.

Bug: [DESCRIBE SYMPTOM]
Expected: [DESCRIBE EXPECTED BEHAVIOR]
Route/feature: [e.g. /login, /lesson/present-simple]

Steps:
1. Reproduce by reading relevant source files — do not assume Supabase is connected.
2. Identify root cause with file/line references.
3. Propose minimal fix that preserves existing working behavior.
4. Implement fix.
5. Run npm run build and report result.

If the bug relates to a PLANNED feature not yet built, say so and suggest doc/roadmap update instead of fake implementation.
```

---

## 4. Refactoring

```
Propose a refactor for Green Freedom Academy.

Target: [FILES OR AREA]
Goal: [e.g. extract ProgressBar component, multi-line formatting]

Rules:
1. Explain reasoning BEFORE changing code.
2. Preserve all working demo routes and flows.
3. Match docs/05-CODING-STANDARDS.md and docs/04-DESIGN-SYSTEM.md.
4. No new dependencies without justification.
5. Wait for my approval if this is a major structural change.

Phase 1 output: plan only.
Phase 2 (after approval): implement + npm run build.
```

---

## 5. Code Review

```
Review recent changes in Green Freedom Academy.

Focus:
- Preserves demo functionality on /, /login, /student, /teacher, /lesson/present-simple
- Teacher-first and Thai UI conventions
- TypeScript quality (no unnecessary any)
- Reuses design system classes from globals.css
- Does not falsely claim Supabase/AI features work
- Build would pass (npm run build)

Format:
1. Summary
2. Critical issues (must fix)
3. Suggestions (nice to have)
4. Documentation updates needed (if any)
```

---

## 6. Build Verification

```
Verify the Green Freedom Academy project builds cleanly.

Run:
1. npm install (if needed)
2. npm run build

Report:
- Exit code and any errors
- TypeScript issues with file paths
- Warnings worth addressing
- Whether the project is safe to deploy to Vercel

Do not fix unless I ask — report only.
```

---

## 7. Documentation Update

```
Update Green Freedom Academy Playbook documentation.

Change: [DESCRIBE WHAT CHANGED IN THE PRODUCT OR CODE]
Version: [e.g. 1.1.0]

Update only the relevant docs in docs/:
- Roadmap status (02-ROADMAP.md) if feature status changed
- Architecture (03-ARCHITECTURE.md) if routes/data changed
- Design system (04-DESIGN-SYSTEM.md) if UI tokens/classes changed
- CHANGELOG (10-CHANGELOG.md) — always for shipped changes

Rules:
- Distinguish CURRENT vs PLANNED vs FUTURE accurately
- Do not claim features exist without repository evidence
- Do not modify app/, components/, lib/, public/, supabase/ unless explicitly requested
```

---

## 8. Supabase Integration (Planned Work)

```
Plan Supabase integration for Green Freedom Academy (PLANNED — not yet in app).

Scope: [e.g. auth, student_progress save, classroom create]

Read:
- supabase/schema.sql
- lib/supabase-browser.ts
- docs/03-ARCHITECTURE.md

Deliver:
1. Gap analysis vs current demo
2. Env vars and RLS policies needed
3. Files to create (middleware, supabase-server, etc.)
4. Migration steps for existing demo flows
5. Validation checklist

Do not mark auth or persistence as complete until wired and build passes.
```

---

## 9. New Lesson Content (Planned Work)

```
Add P.6 English lesson content for Green Freedom Academy.

Topic: [e.g. Past Simple]
Format: Learn → Short Practice → Game

Current state: only /lesson/present-simple exists with hardcoded slides.

Plan:
1. Content structure (JSON or DB schema alignment with lessons.content)
2. Reusable LessonViewer component proposal
3. Thai UI copy for navigation
4. Progress persistence approach (demo vs Supabase)
5. Files to create/modify

Preserve existing Present Simple lesson unless asked to migrate it.
```

---

## 10. Teacher Dashboard Enhancement

```
Improve the teacher dashboard (/teacher) for Green Freedom Academy.

Goal: [e.g. show real progress, add classroom list]

Constraints:
- Teacher-first: reduce clicks, clear Thai labels
- Current page uses hardcoded demo data — say when real Supabase data is required
- Reuse BrandHeader, statGrid, panel, tableWrap classes
- npm run build must pass

Deliver plan first; implement only when I confirm.
```

---

## 11. Design System Extension

```
Extend the Green Freedom Academy design system.

Need: [e.g. toast notification, modal, form field error state]

Read docs/04-DESIGN-SYSTEM.md and app/globals.css first.

Rules:
- Extend :root tokens before hardcoding colors
- Match existing border-radius and shadow patterns
- Mobile/tablet/desktop responsive
- Document new classes in 04-DESIGN-SYSTEM.md after adding
```

---

## 12. Release Preparation

```
Prepare Green Freedom Academy for release [VERSION].

Run through docs/09-RELEASE-CHECKLIST.md.
Execute applicable checks.
Report pass/fail for each item.
List blockers before deploy to Vercel.
```

---

## Prompt Tips for Product Owner

- Start with **analysis** or **feature planning** before **implementation**.
- Say **"implement"** explicitly when ready to write code.
- Reference **P.6 English** and **teacher-first** in feature requests for better alignment.
- Ask agents to **update CHANGELOG** when shipping visible changes.

---

## Related Documents

- [06-CURSOR-GUIDE.md](./06-CURSOR-GUIDE.md) — How agents should behave
- [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) — Dev process
- [02-ROADMAP.md](./02-ROADMAP.md) — Feature status
