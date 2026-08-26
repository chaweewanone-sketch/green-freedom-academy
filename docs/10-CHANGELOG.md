# Green Freedom Academy — Changelog

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).  
Versioning follows package.json (`1.0.0` at Playbook creation).

---

## [Unreleased]

### Added
- Green Freedom Playbook v1.0 in `docs/` (10 documents)
- Cursor project rule `.cursor/rules/gfa.mdc` (corrected frontmatter, docs references)
- Persistent learning history repository (`LocalStorageLearningHistoryRepository`) behind the existing `LearningHistoryRepository` contract
- `createLearningHistoryRepository()` factory: browser → localStorage, SSR/tests → memory
- Dashboard loads persisted history after mount with no automatic sample seeding
- `recordActivityCompletion()` maps completed quiz, millionaire, and flash-cards results into `LearningEvent`s and saves through the history repository
- Deterministic learning-path recommendation v1 (`buildLearningRecommendation`) from real `LearningSummary` — no AI/LLM and no backend personalization
- Deterministic learning journey v1 (`buildLearningJourney`) for Present Simple: Learn → Practice → Play → Review → Complete

### Changed
- `/dashboard` history flow is client-loaded so events survive browser refresh
- `/dashboard` no longer auto-seeds sample learning events; it shows only real completions or the empty state
- Completed student activities write learning history through `StudentActivityPlayer` without changing scoring rules
- Student dashboard shows one next-step CTA from v1 recommendation policy thresholds (not learned parameters)
- Student dashboard shows a current-stage journey card separate from the next-action recommendation

---

## [1.0.0] — Application Demo (pre-Playbook baseline)

**Status:** CURRENT demo UI — not production backend.

### Added
- Next.js 15 App Router project with React 19 and TypeScript
- Landing page (`/`) with marketing hero and feature grid
- Demo login page (`/login`) with student/teacher role tabs
- Student dashboard (`/student`) with hardcoded XP and lesson stages
- Teacher dashboard (`/teacher`) with hardcoded class stats and student table
- Present Simple interactive lesson (`/lesson/present-simple`) — 4 slides, client-side progress
- `BrandHeader` shared navigation component
- Global CSS design system (`app/globals.css`)
- PWA manifest shell (`public/manifest.webmanifest`)
- Supabase browser client stub (`lib/supabase-browser.ts`) — unused
- Database schema SQL (`supabase/schema.sql`) — profiles, courses, lessons, student_progress, classrooms
- Environment template (`.env.example`)
- README with local dev and Vercel deploy instructions (Thai)

### Known limitations
- No real Supabase authentication or persistence
- `lib/supabase-browser.ts` not imported by any page
- Practice and Game engines UI-only ("ยังล็อก")
- Teacher "สร้างห้องเรียน" button non-functional
- Demo role in `localStorage` not used for access control
- PWA manifest has no icons
- No ESLint, tests, or CI configuration

---

## Version Planning (Future)

| Version | Target |
|---------|--------|
| 1.1.0 | Supabase auth + basic persistence (Phase 1) |
| 1.2.0 | Learn → Practice → Game loop (Phase 2) |
| 2.0.0 | Teacher Studio + AI generators (Phase 3–4) |

Update this file when shipping each version.

---

## Related Documents

- [02-ROADMAP.md](./02-ROADMAP.md) — Detailed phase plan
- [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) — Pre-release checks

[Unreleased]: https://github.com/example/green-freedom-academy-v1/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/example/green-freedom-academy-v1/releases/tag/v1.0.0
