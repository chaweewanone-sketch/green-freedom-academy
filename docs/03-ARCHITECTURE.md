# Green Freedom Academy — Architecture

**Playbook version:** 1.0  
**Stack:** Next.js 15 · React 19 · TypeScript 5.7 · Supabase (planned)

---

## High-Level Diagram

### Current (as implemented)

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Server      │  │ Client       │  │ Demo State      │ │
│  │ Components  │  │ Components   │  │ localStorage    │ │
│  │ (pages)     │  │ (login,      │  │ hardcoded data  │ │
│  │             │  │  lesson)     │  │                 │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
│         │                  │                             │
│         └────────┬─────────┘                             │
│                  ▼                                       │
│           app/globals.css                                │
│           components/BrandHeader.tsx                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Supabase (NOT CONNECTED)                    │
│  lib/supabase-browser.ts — defined, unused               │
│  supabase/schema.sql — schema only                       │
└─────────────────────────────────────────────────────────┘
```

### Target (north star)

```
┌──────────────┐     ┌─────────────────────────────────────┐
│ AI Teaching  │────▶│ Generators (Lesson, Worksheet,      │
│ Brain        │     │ Game, Assessment)                   │
└──────────────┘     └──────────────────┬──────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application                         │
│  Teacher Studio ◄──► Classroom Companion                 │
│  Student Experience (Learn → Practice → Game)            │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase                                    │
│  Auth · PostgreSQL · Row Level Security                  │
└─────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
green-freedom-academy-v1/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout, metadata, PWA hooks
│   ├── page.tsx            # Landing (/)
│   ├── globals.css         # Global styles and design tokens
│   ├── login/page.tsx      # Demo login (client component)
│   ├── student/page.tsx    # Student dashboard
│   ├── teacher/page.tsx    # Teacher dashboard
│   └── lesson/
│       └── present-simple/
│           └── page.tsx    # Interactive lesson (client component)
├── components/
│   ├── BrandHeader.tsx     # Shared header and navigation
│   └── student-ui/         # GFA Learning World (grounds, scene, character)
├── lib/
│   └── supabase-browser.ts # Browser Supabase client factory
├── public/
│   └── manifest.webmanifest
├── supabase/
│   └── schema.sql          # Database schema + partial RLS
├── docs/                   # Green Freedom Playbook (this folder)
├── .cursor/rules/gfa.mdc   # Cursor AI project rule
├── .env.example            # Supabase env template
├── package.json
└── tsconfig.json
```

**Not present today:** `middleware.ts`, API routes, server actions, `lib/supabase-server.ts`, tests, `next.config.js`, ESLint config.

---

## Application Routes

| Route | Component type | Auth | Data source |
|-------|----------------|------|-------------|
| `/` | Server | None | Static |
| `/login` | Client | None | Demo → `localStorage` |
| `/student` | Server page + client home view | None (open) | Learning history → Student Learning Home composition |
| `/teacher` | Server | None (open) | Hardcoded |
| `/dashboard` | Server page + client history view | None | Learning history repository (analytics detail) |
| `/lesson/[slug]` | Server page + client companion | None | Lesson registry + optional student history after mount |
| `/lesson/[slug]/activity/[activity]` | Server page + client player | None | Assessment session; completed quiz / millionaire / flash-cards persist via history repository |

---

## Data Flow (Current)

### Demo login

1. User selects role (student | teacher) on `/login`.
2. Form submit writes `gfa-demo-role` to `localStorage`.
3. Router redirects to `/student` or `/teacher`.
4. **Gap:** No page reads `gfa-demo-role`; routes are not protected.

### Lesson experience

1. Student opens `/lesson/present-simple` from Student Home or dashboard.
2. Present Simple Learn has 8 cards: usage, I/You/We/They, He/She/It + -s/-es, negatives, Yes/No + short answers, Wh-questions, frequency/time, and a structure summary. Quiz and Millionaire still draw 10 questions from the existing 50-item bank after this complete Learn.
3. Slide index and completed slides live in React state.
4. Progress bar derived from completed slide count.
5. Student Learn is sequential: Sections 1–7 use `ต่อไป →`; Section 8 `เข้าใจแล้ว ✓ ไปฝึก Quiz` writes one Learn `LearningEvent` through `recordLearnCompletion()` (no scores) and navigates to Quiz. Teacher `?from=teacher` keeps mode tabs, timer, planning, ActivityGrid, and teacher tips. `learnSaved` means current-version Learn completion. A new session still opens at Section 1 with a fresh in-session walkthrough.
6. **Gap:** Per-slide progress is not stored independently; nothing persists to Supabase.

### Teacher dashboard

1. Static arrays render stats and student table rows.
2. "สร้างห้องเรียน" button renders but performs no action.

### Learning history persistence

```
ClassroomCompanion (Section 8 + เข้าใจแล้ว ✓ ไปฝึก Quiz)
  → recordLearnCompletion()
  → LearningEvent { activity: "learn", lessonSlug, lessonContentVersion, completedAt }  // no score
  → LearningHistoryRepository
  → /lesson/[slug]/activity/quiz
```

Idempotency: **one Learn event per lessonSlug + contentVersion**. A newer curriculum version writes a new Learn row and does not erase older ones. New writes use `sessionId` `learn:${slug}:v${version}`. Historical `learn:${slug}` rows stay readable. Quiz / Millionaire retries remain separate attempt events and are not versioned.

After a **current-version** Learn event (and no Quiz / Millionaire yet), Journey and Recommendation advance that lesson to Short Practice: stage PRACTICE, CTA `ทำ Quiz`. A stale Learn-only event (legacy Present Simple v1 against current v2) stays LEARN (`เริ่มเรียน`). Flash-only history still uses LEARN (`FALLBACK_LEARN`) / flash override. Quiz / Millionaire history still drives later stages.

```
Activity UI
  → Activity Engine (quiz / millionaire / flash-cards)
  → ActivityResult (AssessmentResult | FlashCardResult)
  → recordActivityCompletion()
  → LearningEvent
  → LearningHistoryRepository
       ├── MemoryLearningHistoryRepository   (SSR / tests)
       └── LocalStorageLearningHistoryRepository (browser)
  → Analytics (`LearningSummary`)
       latestActivity / latestLesson   // descriptive only: what the learner did most recently

  Learning History
    → Per-Lesson Evaluation (`evaluateLessonJourney` / `isLessonComplete`)
    → Active Lesson Resolver (`resolveActiveLesson`)
         ├── Journey Engine (`buildLearningJourney`)           // current stage
         ├── Recommendation Engine (`buildLearningRecommendation`) // next action
         ├── Curriculum Progress (`buildCurriculumProgress`)   // overview
         └── Resume Learning (`buildResumeLearning`)           // return-and-continue CTA
              → Student Learning Home (`buildStudentLearningHome`)  // action-first composition
              → Lesson Entry (`buildLessonEntry`)                  // progress-aware lesson page
              → `/student` ResumeLearningCard (primary) + compact sections
              → `/dashboard` CurriculumProgressCard / JourneyCard / RecommendationCard + compact Resume
```

Student Home answers “ฉันควรทำอะไรตอนนี้?” Dashboard answers “ผลการเรียนและความก้าวหน้าของฉันเป็นอย่างไร?”

```
Student Home
  → Lesson (Learn completion via `recordLearnCompletion`)
  → Activity (quiz / millionaire / flash-cards)
  → Completion (`recordActivityCompletion`)
  → Persistence (`LearningHistoryRepository`)
  → Resume / Journey / Recommendation (active lesson)
  → Next Lesson
  → Curriculum complete → `/dashboard` summary
```

**Integration invariants**

- One completed attempt = one `LearningEvent` (`sessionId` + `completedAt` dedupe).
- Refresh and React rerenders do not duplicate that event. Result screens are in-memory phases on the same activity URL; a refresh returns to the intro, not a silent resave.
- Browser Back/Forward does not re-record unless the learner completes a genuine new attempt (`completedAt` changes).
- Out-of-order later-lesson events are retained but do not hijack curriculum order.
- Active lesson drives Journey, Recommendation, and Resume. Different labels are allowed; contradictory lesson targets are not.
- Direct activity URLs load without route locking. Completions store under the URL’s lesson slug.
- Dashboard remains analytics-first. Student Home remains action-first.
- Activity result screens persist first, then may show a primary CTA. Quiz and Millionaire Result classify the **current** attempt via shared score-band helpers. Quiz: weak `ทำ Quiz อีกครั้ง`, developing `ฝึก Quiz` (intro retry), strong `เล่น Millionaire`. Millionaire: weak `ฝึก Quiz อีกครั้ง`, developing `เล่น Millionaire อีกครั้ง` (intro replay), strong next lesson or `/dashboard`. Home / Journey / Resume still use historical averages. Flash Cards keep generic Result buttons. This is display guidance, not route locking.
- Lesson Entry is progress-aware presentation only. LOCKED means display, not access control.
- Student Home, Lesson Entry, Curriculum Progress, Dashboard engines, and Recommendation must agree on the active/complete lesson for the same history. Learn completion is one `LearningEvent` per lesson (`activity: "learn"`), with no score.

```
Learning History
      ↓
Lesson Progress (`evaluateLessonJourney` for the viewed slug)
      ↓
Active Lesson / Curriculum status
      ↓
Lesson Entry View Model (`buildLessonEntry`)
      ↓
Lesson Page compact card
```

```
Learning History
      ↓
Analytics
      ↓
Resume / Journey / Curriculum Progress
      ↓
Student Learning Home   (/student, action-oriented)
      ↓
Dashboard               (/dashboard, analytics detail)
```

Resume Learning is a deterministic action-oriented projection of existing Recommendation + active lesson. It is not another scoring engine, not persistence, not auth, and not AI.

| Piece | Role |
|-------|------|
| `recordActivityCompletion()` | Shared completion recorder in `lib/history/recordActivityCompletion.ts`. Persists only completed results. Dedupes identical `sessionId` + `completedAt` callbacks/rerenders. New attempts with a new timestamp save a new event. |
| `recordLearnCompletion()` | Shared Learn-phase recorder in `lib/history/recordLearnCompletion.ts`. Writes one unscored `learn` event per lesson + `contentVersion`. Repeats of the same version are no-ops. ClassroomCompanion does not touch `localStorage`. |
| `StudentActivityPlayer` | Client boundary that wires `onComplete` for implemented activities. After persist, Quiz and Millionaire receive an optional forward `nextAction` from Recommendation. Engines stay reusable and do not import the repository. Flash Cards do not receive `nextAction`. |
| `LearningHistoryRepository` | Contract in `types/history.ts` — `save`, `getAll`, `getByLesson`, `getByActivity`, `getLatest`, `clear` |
| `MemoryLearningHistoryRepository` | In-memory implementation; used on the server and in tests |
| `LocalStorageLearningHistoryRepository` | Browser persistence under one versioned key: `gfa.learningHistory.v1` |
| `createLearningHistoryRepository()` | Browser → localStorage repository; non-browser → memory repository |
| `loadDashboardHistory()` | Shared dashboard summary read path — repository → analytics summary. Does not seed sample events. |
| `loadDashboardLearningState()` | Dashboard and Student Home read path that returns the summary plus the same events, so composition stays repository-free. |
| `buildLearningRecommendation()` | Next-best-action for the **active curriculum lesson**. When events are provided, scores come from that lesson only via `buildLearningSummaryForLesson`. Strong Millionaire on a completed lesson continues to the next curriculum lesson, or `/dashboard` if final. No `localStorage`, no LLM, no backend. Thresholds stay `70` / `85` / flash review ratio `0.5`. Separate from Journey. |
| `getCurriculumLessons()` | Explicit curriculum order from the existing lesson registry: Present Simple, then Past Simple. |
| `isLessonComplete()` | Same COMPLETE policy as the Journey Engine (strong Millionaire, no weak flash override). |
| `resolveActiveLesson()` | First curriculum lesson that is not COMPLETE. If all are complete, returns the final lesson with `isCurriculumComplete`. Does not read `localStorage` or the repository. |
| `buildLearningJourney()` | Uses the active curriculum lesson when events are provided. Stage mapping stays LEARN→lesson, PRACTICE→Quiz, PLAY→Millionaire, REVIEW→Flash Cards or Quiz by `reasonCode`. All lessons complete → `/dashboard`. Separate from recommendation. |
| `buildCurriculumProgress()` | Dashboard overview: each curriculum lesson is COMPLETE, ACTIVE, or LOCKED. Overall % is the unweighted average of per-lesson `progressPercent`. LOCKED lessons contribute 0 even if out-of-order history exists. Display only — does not block routes. |
| `buildResumeLearning()` | One primary “return and continue” action. Reuses `buildLearningRecommendation` href/lesson and `resolveActiveLesson`. Does not score activities. Passes through `ทำ Quiz` and `เล่น Millionaire` labels when Recommendation already uses those CTAs. |
| `resolveForwardResultNextAction()` | Result-screen composition. Reloads persisted state via the player, then uses `buildLearningRecommendation` plus a href/activity forward-action guard. Does not duplicate scoring thresholds. Flash always returns no nextAction. |
| `buildStudentLearningHome()` | View-model composition for `/student`. Reuses Resume, Journey, and Curriculum Progress. No `localStorage`, no repository, no new learning policy. |
| `buildLessonEntry()` | View-model composition for `/lesson/[slug]`. Reuses curriculum status, per-lesson `evaluateLessonJourney`, and Resume for complete lessons. LOCKED is display-only. |
| Student journey verification | Domain-layer end-to-end checks (`lib/history/studentJourneyIntegrationVerification.ts`) that the Home → Learn → Quiz → Millionaire → Review/Complete → Dashboard → next lesson surfaces stay aligned. |

**Browser boundary:** `/student`, `/dashboard`, and `/lesson/[slug]` stay Server Components for routing. `StudentLearningHomeView`, `DashboardHistoryView`, and `LessonEntryView` are Client Components that read the repository after mount, so SSR/build never touches `localStorage`. Missing, unreadable, or malformed storage fails safe (empty history) and does not rewrite stored data on read.

**No automatic sample seeding:** `/student` and `/dashboard` read whatever the repository already has. Fresh storage shows a clear start CTA on Student Home (`เริ่มการเรียนรู้`) and the genuine empty analytics state on `/dashboard`. Sample helpers in `lib/analytics/sample-data.ts` remain for tests and explicit fixtures only.

**Current persistence:** browser `localStorage` via `LocalStorageLearningHistoryRepository`. Backend/Supabase persistence is deferred.

**Supported persisted activities:** quiz, millionaire, flash-cards, learn.

**Learn completion v1:** Section 8 `เข้าใจแล้ว ✓ ไปฝึก Quiz` in student companion context records Learn through `recordLearnCompletion` for the lesson’s current `contentVersion`, then goes to Quiz. Teacher `from=teacher` does not write student history. After mount, only a **current-version** Learn event sets `learnSaved`. Legacy unversioned Learn events are effective version 1. Present Simple current version is 2; Past Simple is 1 (so legacy Past Learn remains current). Historical vs current completion are separate lookups.

**Curriculum version policy:** `LessonData.contentVersion` is human-controlled. Do not bump for typo, punctuation, CSS, formatting, clearer equivalent wording, or equivalent example replacement. Bump when a required concept is added/removed, the learning objective changes, assessed scope changes, or the required structure expands (for example 4 → 8 sections).

**Guided Student Learn v1:** `/lesson/[slug]` hides teacher/planning tabs, the lesson timer, teacher tips, ActivityGrid, and the Lesson Entry journey CTA so the footer is the only primary path. The 8-section sidebar stays for review. `?from=teacher` keeps classroom chrome. Activity routes stay directly reachable (no route locking). Footer labels come from `buildGuidedLearnFooterState`.

**Short Practice Quiz v1:** Default Quiz attempt length is 10 questions (`ACTIVITY_DEFAULTS.quiz.questionCount`). Scoring stays percentage-based (`correct / total`). A 10-question bank slice is near-balanced A/B/C/D (3/3/2/2). Historical events store `scorePercentage` only, so older 20-question attempts remain readable without migration. Millionaire stays 10 questions; Flash Cards stay 20.

**10-stage game v1:** The Millionaire activity keeps internal id `millionaire` and the same 10-question assessment session. Student-facing play is `เกมพิชิต 10 ด่าน`: a colorful game world, a Sprint 42 pilot explorer character, a display-only 10-stage Adventure Map, game-scoped `.gfaGame*` / `.gfaStage*` layout, text+color feedback, and an explicit continue (`ไปด่านต่อไป →` / `ดูผลเกม`) instead of 700ms auto-advance. Result copy shows stars for the correct count; Sprint 41 current-attempt CTAs are unchanged. Shared `.millionaire*` CSS used by Quiz is not mutated.

**Student visual foundation v1 / Section 1 Visual Master v1:** Additive `--gfa-*` tokens live next to existing `--g` / `--m` / `--t` tokens and do not restyle teacher UI. Student Learn uses `GfaLearningWorld` (ลานเขียวอิสระ / Everyday Garden). React/CSS owns layout, type, progress, CTA, and HTML teaching text. Original local illustrations live under `public/gfa/` (`characters/`, `scenes/`, `props/`) and are consumed through `GfaArtSlot` plus section art maps. Present Simple Section 1 is the owner-approved Visual Master v1: five production WebPs, desktop ~38/62 Habit vs General Truth pair, mobile stack with all 8 path stones in one compact row, lunch as a supporting example, and frozen grammar/summary copy (`Subject + Verb 1`, no `ป้ายสวน`, `จำไว้ : Present Simple = ทำประจำ หรือ เป็นจริงเสมอ`). Missing files show labeled slots, not geometric scene drawings. Sections 2–3 are frozen owner-approved Learn compositions (`EverydayGardenPlaygroundSection2`, `EverydayGardenWorkshopSection3`): framed teaching scenes with cream HTML learning surfaces. Section 4 is a frozen Quiet Shelter composition (`EverydayGardenQuietShelterSection4`): Bai Tong pause-guide in the lead only, a framed contained shelter scene, and HTML grammar authority for `don't` / `doesn't` + Verb 1. Section 5 is a frozen Question Booth composition (`EverydayGardenQuestionBoothSection5`): Bai Tong question-guide in the lead only, a framed contained booth scene, and HTML grammar authority for Yes/No questions and short answers. Section 6 is a frozen Clue Trail composition (`EverydayGardenClueTrailSection6`): Bai Tong clue-guide in the lead only, a framed contained trail scene, and HTML grammar authority for Wh-questions (`Wh-word + do/does + Subject + Verb 1?`). Section 7 is an owner-review Clock Garden prototype (`EverydayGardenClockGardenSection7`): Bai Tong clock-guide in the lead only, a framed contained garden-clock scene, and HTML grammar authority for frequency and time (`Subject + adverb + Verb`, How often, at/on/in). ART = visual meaning + world storytelling. HTML = grammar authority. Environmental booth signage, approved Clue Trail Wh markers, and Clock Garden world labels are allowed; grammar formulas stay in HTML. Group-coach, singular-stamp, and verb-leaf files stay in `public/gfa/` but are not shown. The current workshop scene is an approved prototype-era exception with baked labels; do not regenerate it in this freeze. Section 8 stays on a readable fallback. Quiz does not consume the world yet. Millionaire keeps Sprint 42 `GameWorld` / `GameHeroCharacter` / `AdventureMap`. Contract: `public/gfa/ASSET-CONTRACT.md`.

**Recommendation v1:** `/dashboard` shows one "แนะนำขั้นต่อไป" card for the **active curriculum lesson**. Journey = current stage. Recommendation = next best action in that lesson. They stay separate. Completing Present Simple recommends `เรียนบทถัดไป` to `/lesson/past-simple`. Completing the final lesson recommends `/dashboard`. Out-of-order later-lesson history is ignored until that lesson becomes active. No AI/LLM, no Supabase.

**Journey v1:** `/dashboard` shows one "เส้นทางการเรียน" card for the **active curriculum lesson** from `resolveActiveLesson`. Completing Present Simple advances the active lesson to Past Simple at LEARN (existing Past Simple history is reused if present). Completing the final available lesson keeps COMPLETE and returns to `/dashboard`. No backend progression, no AI/LLM, no Supabase.

**Student Learning Home v1:** `/student` is the action-oriented learner entry. It composes Resume (primary CTA), active lesson + stage, compact curriculum totals, and latest activity. It does not duplicate dashboard analytics or invent a second next-action policy. Curriculum complete shows `เรียนครบหลักสูตรแล้ว` with `ดูสรุปการเรียน` — no fake continue lesson.

**Not yet wired:** matching, monopoly, spin-wheel, and sentence-builder.

**Future backend path:** add a Supabase (or API) repository that implements the same `LearningHistoryRepository` contract, then extend the factory. Do not leak storage details into analytics or activity engines.

---

## Database Schema (Defined, Not Wired)

File: `supabase/schema.sql`

| Table | Purpose |
|-------|---------|
| `profiles` | User profile linked to `auth.users`; role enum: `student`, `teacher`, `admin` |
| `courses` | Course catalog with slug, title, published flag |
| `lessons` | Lesson content as JSONB, ordered by `position` |
| `student_progress` | Per-student lesson completion, practice/game scores, XP |
| `classrooms` | Teacher-owned rooms with unique `join_code` |

### Row Level Security (partial)

| Table | RLS | Policies |
|-------|-----|----------|
| `profiles` | Enabled | Select own profile |
| `student_progress` | Enabled | Full access to own rows |
| `courses` | **Not enabled** | — |
| `lessons` | **Not enabled** | — |
| `classrooms` | **Not enabled** | — |

---

## Supabase Integration (Planned)

**Current:** `lib/supabase-browser.ts` exports `createClient()` which returns `null` if env vars are missing. **No file imports this function.**

**Planned pattern:**

| Layer | File (planned) | Responsibility |
|-------|----------------|----------------|
| Browser | `lib/supabase-browser.ts` | Client components, auth UI |
| Server | `lib/supabase-server.ts` (new) | Server components, cookies |
| Middleware | `middleware.ts` (new) | Session refresh, route guards |

Environment variables (from `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Component Architecture

### Existing reusable component

- **`BrandHeader`** — Logo, tagline, nav links (นักเรียน, ครู, เข้าสู่ระบบ)

### Inline patterns (candidates for extraction)

- Dashboard hero sections (student + teacher)
- Progress bars (student dashboard + lesson)
- Stat/feature card grids (landing + teacher)
- Lesson navigation sidebar

See [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) for UI class reference.

---

## Client vs Server Components

| File | `"use client"` | Reason |
|------|----------------|--------|
| `app/login/page.tsx` | Yes | Form state, router, localStorage |
| `components/activities/StudentActivityPlayer.tsx` | Yes | Record completed activities in the browser |
| `components/dashboard/DashboardHistoryView.tsx` | Yes | Load/save learning history in the browser |
| All other pages | No | Static/demo rendering |

---

## Deployment

Documented in `README.md`:

- **Local:** `npm install` → `npm run dev` → http://localhost:3000
- **Production:** GitHub → Vercel import → deploy
- **Requirements:** Node.js 20+

No CI/CD configuration exists in the repository.

---

## Security Notes (Current)

- Demo login accepts any submission; credentials are decorative defaults.
- Dashboard routes are publicly accessible.
- Supabase anon key is not used until integration is complete.
- When auth ships: enforce RLS on all tables, protect teacher routes, never expose service role key client-side.

---

## Related Documents

- [02-ROADMAP.md](./02-ROADMAP.md) — Delivery phases
- [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) — UI system
- [05-CODING-STANDARDS.md](./05-CODING-STANDARDS.md) — Code conventions
- [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) — Dev process
