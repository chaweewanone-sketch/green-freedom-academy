# Green Freedom Academy — Roadmap

**Playbook version:** 1.0  
**Status legend:** CURRENT · IN PROGRESS · PLANNED · FUTURE

This roadmap reflects the **actual repository state** as of v1.0.0. Items are not marked complete unless implemented in code.

---

## Status Overview

```
CURRENT          Demo UI, one lesson, static dashboards, schema file
IN PROGRESS      (none tracked in repository)
PLANNED          Supabase auth, persistence, Practice & Game engines
FUTURE           AI generators, Teacher Studio, Classroom Companion
```

---

## Phase 0 — Foundation (CURRENT ✅)

**Goal:** Runnable demo that demonstrates the product vision to teachers and stakeholders.

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 15 App Router setup | CURRENT | `app/` routes |
| Landing page (`/`) | CURRENT | Marketing hero, feature grid |
| Demo login (`/login`) | CURRENT | Role tabs; stores `gfa-demo-role` in `localStorage`; no credential check |
| Student dashboard (`/student`) | CURRENT | Hardcoded XP (120), progress (35%), locked stages |
| Teacher dashboard (`/teacher`) | CURRENT | Hardcoded stats and student table |
| Present Simple lesson (`/lesson/present-simple`) | CURRENT | 4 slides, client-side progress; lost on refresh |
| `BrandHeader` component | CURRENT | Shared nav across main pages |
| Global CSS design system | CURRENT | `app/globals.css` |
| PWA manifest | CURRENT (partial) | `public/manifest.webmanifest`; `icons: []` |
| Supabase browser client stub | CURRENT (unused) | `lib/supabase-browser.ts` — not imported anywhere |
| Database schema SQL | CURRENT (file only) | `supabase/schema.sql` — not applied by app |
| README local dev + Vercel deploy | CURRENT | Thai instructions |
| Learning history repository | CURRENT | Memory + browser `localStorage` (`gfa.learningHistory.v1`); no Supabase writes |
| Activity completion recording | CURRENT | Completed quiz, millionaire, and flash-cards save `LearningEvent`s through the history repository |
| Student dashboard history | CURRENT | `/dashboard` reads real persisted events only; no automatic sample seeding |
| Learning path recommendation | CURRENT | Deterministic v1 rules on `LearningSummary` (not AI/LLM); dashboard CTA only |
| Learning journey / progression | CURRENT | Deterministic Present Simple path Learn → Practice → Play → Review → Complete |

**Known gaps in Phase 0:**

- Demo role in `localStorage` is written but never read for route guards.
- Practice and Game links show "ยังล็อก" (locked) — no routes or logic exist.
- Teacher "สร้างห้องเรียน" button has no handler.
- Coming-soon activities (matching, monopoly, spin-wheel, sentence-builder) have no completion recording yet.

---

## Phase 1 — Backend Integration (PLANNED)

**Goal:** Real users, real data, secure access.

| Feature | Status | Notes |
|---------|--------|-------|
| Supabase project setup | PLANNED | Documented in README |
| Environment variables (`.env.local`) | PLANNED | Template in `.env.example` |
| Supabase Auth (email/password or OAuth) | PLANNED | Replace demo login |
| Profile creation on signup | PLANNED | `profiles` table exists in schema |
| Server-side Supabase client | PLANNED | Not in repo yet |
| Auth middleware / route protection | PLANNED | `/student`, `/teacher` currently open |
| Row Level Security completion | PLANNED | Only `profiles` and `student_progress` have policies today |
| Student progress persistence | PLANNED | Completed quiz / millionaire / flash-cards persist in the browser today; `student_progress` table still unused |
| Classroom create / join | PLANNED | `classrooms` table defined; UI button only |

**Exit criteria:** Teacher and student log in with real accounts; lesson completion saves to Supabase; dashboards read live data.

---

## Phase 2 — Learning Engines (PLANNED)

**Goal:** Complete the **Learn → Short Practice → Game** loop for P.6 English.

| Feature | Status | Notes |
|---------|--------|-------|
| Lesson content from database | PLANNED | `lessons.content` JSONB in schema |
| Generic lesson viewer component | PLANNED | Replace hardcoded slide arrays |
| Short Practice engine | PLANNED | UI placeholder on student dashboard |
| Millionaire / Game engine | PLANNED | UI placeholder on student dashboard |
| XP and badge system | PLANNED | Demo values only today |
| Course catalog (`courses` table) | PLANNED | Schema only |

**Exit criteria:** One full P.6 English unit runs Learn → Practice → Game with progress saved per student.

---

## Phase 3 — Teacher Studio (PLANNED → FUTURE)

**Goal:** Teachers manage content and classes without developer help.

| Feature | Status | Notes |
|---------|--------|-------|
| Teacher Studio UI | FUTURE | Beyond current demo dashboard |
| Class roster management | PLANNED | Depends on Phase 1 classrooms |
| Per-student progress reports | PLANNED | Schema supports; UI shows demo rows |
| Content publishing workflow | PLANNED | `courses.published` flag in schema |
| Worksheet preview / export | FUTURE | Not in codebase |

---

## Phase 4 — AI Generators (FUTURE)

**Goal:** AI-assisted creation aligned to the north-star flow.

| Feature | Status | Notes |
|---------|--------|-------|
| AI Teaching Brain | FUTURE | Shared context layer — not started |
| Lesson Generator | FUTURE | |
| Classroom Companion | FUTURE | |
| Worksheet Generator | FUTURE | |
| Game Generator | FUTURE | |
| Assessment Generator | FUTURE | |

**Important:** Do not document or demo these as complete until implementation exists in the repository.

---

## Phase 5 — Production Hardening (FUTURE)

| Feature | Status |
|---------|--------|
| ESLint / Prettier | FUTURE |
| Automated tests (unit, E2E) | FUTURE |
| CI pipeline | FUTURE |
| Error monitoring | FUTURE |
| PWA icons and offline support | FUTURE |
| Admin role tooling | FUTURE |

---

## Recommended Build Order

1. **Phase 1** — Auth + persistence (unblocks everything else)
2. **Phase 2** — Practice and Game engines (delivers student value)
3. **Phase 3** — Teacher Studio (delivers teacher value at scale)
4. **Phase 4** — AI generators (multiplier on teacher time savings)
5. **Phase 5** — Hardening (quality and operations)

---

## Dependencies

```mermaid
flowchart TD
    P0[Phase 0: Demo UI] --> P1[Phase 1: Supabase Auth + Data]
    P1 --> P2[Phase 2: Learn Practice Game]
    P1 --> P3[Phase 3: Teacher Studio]
    P2 --> P4[Phase 4: AI Generators]
    P3 --> P4
    P2 --> P5[Phase 5: Production Hardening]
```

---

## Related Documents

- [01-VISION.md](./01-VISION.md) — Mission and principles
- [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) — Technical architecture
- [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) — Pre-release validation
- [10-CHANGELOG.md](./10-CHANGELOG.md) — Version history
