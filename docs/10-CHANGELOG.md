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
- Activity Result forward CTA — after persist, a strong Quiz Result primary action is `เล่น Millionaire`; a completing Millionaire Result primary action is the canonical next lesson or dashboard. Weak/developing Quiz, weak/developing Millionaire, and Flash Cards keep the generic Result buttons
- Complete Present Simple Learn — 8 cards teach the assessed P.6 foundation (usage, affirmative, -s/-es, negatives, Yes/No + short answers, Wh-questions, frequency/time, summary) before Short Practice
- Guided Student Learn — sequential footer (`ต่อไป →`, then Section 8 `เข้าใจแล้ว ✓ ไปฝึก Quiz`) persists Learn only on the final action and continues to Quiz; student Learn hides teacher chrome, timer, ActivityGrid, and the Lesson Entry journey CTA
- Lesson content versioning — Learn completion is one event per lesson + `contentVersion`; legacy unversioned Learn events are version 1; stale Present Simple Learn no longer unlocks PRACTICE
- Guided Quiz Result — after persist, Quiz Result primary CTA uses the existing Recommendation: `ทำ Quiz อีกครั้ง` / `ฝึก Quiz` (same-session restart) or `เล่น Millionaire`; Home is no longer the Quiz Result primary
- Quiz same-session retry remounts a fresh attempt so Question 1 starts unanswered and Attempt 2 cannot reuse the previous Result object
- Quiz retry returns to the intro Start screen so the Result CTA click cannot also answer Question 1
- Quiz Result primary CTA follows the current attempt percentage (60 / 80 / 90), not historical Quiz average; Home / Journey / Resume still use average
- Millionaire Result primary CTA follows the current attempt: weak `ฝึก Quiz อีกครั้ง`, developing `เล่น Millionaire อีกครั้ง` (intro replay), strong next lesson / dashboard; Home / Journey / Resume still use historical average
- Present Simple Millionaire play is `เกมพิชิต 10 ด่าน`: colorful hero world, pilot explorer character, display-only 10-stage Adventure Map, explicit continue after explanation, and Result star/copy presentation; assessment 10/50, percentage, 70/85, and Result routing stay frozen; Quiz keeps shared `.millionaire*` styles
- Student visual foundation — additive `--gfa-*` tokens, `GfaLearningWorld` (ลานเขียวอิสระ), Bai Tong, and a Present Simple Section 1 Everyday Garden prototype; later Learn sections stay on a readable fallback; Quiz and Millionaire surfaces unchanged
- Asset-first Learn art slots — Section 1 consumes `GfaArtSlot` / `GFA_SECTION1_ART` under `public/gfa/` (`characters/`, `scenes/`, `props/`); educational text stays HTML; original illustrations are not shipped yet; Quiz and Millionaire surfaces unchanged
- Section 1 production composition — desktop 38/62 Learn layout with HTML title, mission, grammar, sentences, progress, and Continue; illustration slots wait on original GFA files; geometric Bai Tong is not production art
- Section 1 desktop-first composition — first-viewport Habit vs General Truth pair, reduced Present Simple identity scale, supporting Bai Tong, localized readability veil; production WebP files unchanged
- Section 1 compact balance — first viewport tightened ~15–20%; lunch art ~2× with stronger third-example sentence; Continue and production assets unchanged
- Section 1 mobile micro polish — 8 path stones stay in one compact row at phone widths; lunch support art is slightly larger on mobile only; desktop composition and production assets unchanged
- Sprint 45C Learn prototype — Present Simple Sections 2 (playground) and 3 (workshop) use section-specific composition with frozen curriculum HTML; Section 1 Visual Master stays frozen
- Sprint 45C-R1 composition rescue — Sections 2–3 use a framed teaching scene plus cream HTML surfaces; competing character overlays and the leaf cue are hidden from composition but assets stay in `public/gfa/`
- Sprint 45C-R2 — Section 3 s/es rule is a compact HTML scan block (`เติม -s` / `ch / sh / x / s` → `-es`); R1 composition otherwise unchanged. Future Sections 4–8 production art must not bake instructional grammar text.
- Sprint 45C freeze — Present Simple Sections 2–3 are owner-approved Learn compositions (playground / workshop). Art is visual meaning; HTML is grammar authority. Unused group-coach, singular-stamp, and verb-leaf files stay in `public/gfa/`.
- Sprint 46B Section 4 Quiet Shelter Learn prototype — Present Simple negatives (`don't` / `doesn't` + Verb 1) use a dedicated cream lead, framed contained shelter scene, HTML grammar beats, and two production WebPs (`bai-tong-pause-guide`, `quiet-shelter-not-doing`). Sections 1–3 stay frozen. Sections 5–8 stay on the readable fallback.
- Sprint 46B-R1 — Section 4 mission puts meaning before formula (`บอกว่า “ไม่ได้ทำ”` then `don't / doesn't + Verb 1`); duplicate formula lines are removed. Artwork and Sections 1–3 stay unchanged.
- Sprint 47B Section 5 Question Booth Learn prototype — Yes/No questions and short answers use a cream lead, contained booth scene, and HTML grammar beats. World-storytelling text in the approved booth scene is allowed; HTML stays grammar authority. Sections 1–4 stay frozen. Sections 6–8 stay on the readable fallback.
- Sprint 48B Section 6 Clue Trail Learn prototype — Wh-questions use a cream lead, contained Clue Trail scene, and HTML grammar beats. Approved Wh marker words in the scene are world storytelling; HTML stays grammar authority. Sections 1–5 stay frozen. Sections 7–8 stay on the readable fallback.
- Sprint 49B Section 7 Clock Garden Learn prototype — frequency and time use a cream lead, contained Clock Garden scene, and HTML grammar beats. CLOCK GARDEN / MORNING / EVENING / weekday signs are world storytelling; HTML stays grammar authority. Sections 1–6 stay frozen. Section 8 stays on the readable fallback.
- Sprint 50C Section 8 Clubhouse Map Learn prototype — Present Simple synthesis uses a cream lead, contained Clubhouse Map scene, and a four-frame HTML map. Journey labels in the approved scene are world storytelling; HTML stays grammar authority. No new grammar. Sections 1–7 stay frozen.

### Changed
- Section 1 student copy: grammar board no longer shows ป้ายสวน; จำไว้ : sits on the Present Simple summary line
- Section 1 Visual Master v1 — owner-approved Everyday Garden Learn (five frozen production WebPs, HTML educational text, desktop 38/62, mobile 8-stone row); Sections 2–7 are frozen Learn compositions; Section 8 is an owner-review Clubhouse Map prototype
- Sprint 45C owner-approved freeze — Present Simple Sections 2–3 use playground / workshop compositions; Section 1 Visual Master and functional freeze stay unchanged
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
- Resume Learning after a strong Quiz uses `เล่น Millionaire` instead of generic `เรียนต่อ` (href was already Millionaire)
- Shared `ActivityResultActions` can show one guided next-learning CTA when a forward Recommendation exists; Quiz Result uses `guided` layout so weak/developing restart labels come from the engine and do not duplicate `เริ่มใหม่`
- Millionaire play uses a game-scoped shell and explicit educational continue instead of a 700ms auto-advance; it no longer presents as a second Quiz screen
- Present Simple Learn is a complete 8-card curriculum; Quiz and Millionaire still use the existing 50-item bank (10 questions each) instead of shrinking Practice to the old 4-card scope
- Student `/lesson/[slug]` is a guided sequence; teacher/classroom `?from=teacher` still shows modes, timer, planning, tips, and ActivityGrid. Existing Learn history no longer jumps the learner to the last section on refresh
- `recordLearnCompletion` is idempotent per lesson version, not per slug forever; companion `learnSaved` means current-version completion only

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
