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
- Deterministic learning journey v1 (`buildLearningJourney`) for Present Simple: Learn → Practice → Play → Review → Complete, with a required `nextAction` route on the dashboard CTA
- Deterministic multi-lesson curriculum order from the existing lesson registry (Present Simple → Past Simple), with per-lesson journey stages and a next-lesson CTA after COMPLETE
- Deterministic active-lesson resolver (`resolveActiveLesson`) so Journey follows curriculum completion order, not latest activity timestamp
- Curriculum-aware recommendation (`buildLearningRecommendation(summary, events?)`) so next-best-action uses the active curriculum lesson, not latest activity
- Curriculum progress overview (`buildCurriculumProgress`) on the student dashboard: complete / active / locked lessons and an unweighted overall percent
- Resume Learning (`buildResumeLearning`) — one primary return-and-continue CTA projected from curriculum-aware Recommendation
- Student Learning Home (`buildStudentLearningHome`) — action-oriented `/student` composition of Resume, active lesson, curriculum totals, and latest activity
- Activity result return actions (`ActivityResultActions`) — `กลับหน้าหลักนักเรียน`, `เริ่มใหม่`, `กลับไปบทเรียน` after Quiz / Millionaire / Flash Cards
- Lesson Entry (`buildLessonEntry`) — progress-aware `/lesson/[slug]` card for active, complete, and out-of-order lessons
- Deterministic quiz correct-answer placement so Present/Past banks are not A-only
- End-to-end student journey verification (`lib/history/studentJourneyIntegrationVerification.ts`) for new-student, Learn, Quiz, Millionaire, lesson completion, returning-student, out-of-order, hydration, and cross-surface consistency
- Learn completion persistence (`recordLearnCompletion`) — one unscored `learn` event per lesson; last-slide `เข้าใจแล้ว ✓` writes through the history repository
- Learn → Short Practice continuity — a persisted Learn event advances Journey / Recommendation / Resume to Quiz (`ทำ Quiz`); flash-only history stays FALLBACK_LEARN
- Short Practice Quiz default length is 10 questions per attempt; 10-question answer placement is near-balanced (3/3/2/2); historical 20-question percentage events remain readable
- Present Simple Learn examples are distinct per slide (base verb, -s/-es, don't/doesn't) instead of one reused pair

### Changed
- `/dashboard` history flow is client-loaded so events survive browser refresh
- `/dashboard` no longer auto-seeds sample learning events; it shows only real completions or the empty state
- Completed student activities write learning history through `StudentActivityPlayer` without changing scoring rules
- Student dashboard shows one next-step CTA from v1 recommendation policy thresholds scoped to the active curriculum lesson
- Student dashboard shows a current-stage journey card with a primary Next.js Link CTA to the next real lesson, Quiz, Millionaire, Flash Cards, next curriculum lesson, or dashboard route
- Student dashboard shows a curriculum progress section (ความก้าวหน้าหลักสูตร) with per-lesson status and overall percent
- Student dashboard shows a compact Resume Learning card as a secondary continue CTA; Student Home owns the primary resume action
- `/student` is the learner home (action-first) instead of a hardcoded XP demo; `/dashboard` remains analytics-first
- `BrandHeader` includes ผลการเรียน → `/dashboard` and นักเรียน → `/student`
- Lesson back link for students goes to Student Home (`หน้าหลักนักเรียน`) instead of the English “Dashboard” label
- Empty dashboard hides the overall curriculum percent so 0 completed / 2 lessons is not mixed with the initial 10% average
- Student lesson pages show a compact history-aware progress card; teacher `from=teacher` context hides it
- Last-slide Learn completion survives refresh; the companion restores completed slides from history after mount

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
