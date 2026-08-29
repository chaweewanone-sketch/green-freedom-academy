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
│   └── BrandHeader.tsx     # Shared header and navigation
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
2. Slide index and completed slides live in React state.
3. Progress bar derived from completed slide count.
4. Marking the **last** slide complete (`เข้าใจแล้ว ✓`) writes one Learn `LearningEvent` through `recordLearnCompletion()` (no scores). After refresh, the companion restores completed slides from that event.
5. **Gap:** Per-slide progress is not stored independently; nothing persists to Supabase.

### Teacher dashboard

1. Static arrays render stats and student table rows.
2. "สร้างห้องเรียน" button renders but performs no action.

### Learning history persistence

```
ClassroomCompanion (last slide + เข้าใจแล้ว ✓)
  → recordLearnCompletion()
  → LearningEvent { activity: "learn", lessonSlug, completedAt }  // no score
  → LearningHistoryRepository
```

Idempotency: **one Learn event per lesson**. Repeating the completion action, revisit, or refresh returns the stored event and does not inflate analytics. Quiz / Millionaire retries remain separate attempt events.

After a real Learn event (and no Quiz / Millionaire yet), Journey and Recommendation advance that lesson to Short Practice: stage PRACTICE, CTA `ทำ Quiz`, href `/lesson/[slug]/activity/quiz`. Flash-only history still uses LEARN (`FALLBACK_LEARN`) / flash override and does not count as Learn-complete-to-Quiz.

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
- Activity result screens: `กลับหน้าหลักนักเรียน` · `เริ่มใหม่` · `กลับไปบทเรียน`.
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
| `recordLearnCompletion()` | Shared Learn-phase recorder in `lib/history/recordLearnCompletion.ts`. Writes one unscored `learn` event per lesson through the existing repository. Repeats are no-ops. ClassroomCompanion does not touch `localStorage`. |
| `StudentActivityPlayer` | Client boundary that wires `onComplete` for implemented activities. Engines stay reusable and do not import the repository. |
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
| `buildResumeLearning()` | One primary “return and continue” action. Reuses `buildLearningRecommendation` href/lesson and `resolveActiveLesson`. Does not score activities. |
| `buildStudentLearningHome()` | View-model composition for `/student`. Reuses Resume, Journey, and Curriculum Progress. No `localStorage`, no repository, no new learning policy. |
| `buildLessonEntry()` | View-model composition for `/lesson/[slug]`. Reuses curriculum status, per-lesson `evaluateLessonJourney`, and Resume for complete lessons. LOCKED is display-only. |
| Student journey verification | Domain-layer end-to-end checks (`lib/history/studentJourneyIntegrationVerification.ts`) that the Home → Learn → Quiz → Millionaire → Review/Complete → Dashboard → next lesson surfaces stay aligned. |

**Browser boundary:** `/student`, `/dashboard`, and `/lesson/[slug]` stay Server Components for routing. `StudentLearningHomeView`, `DashboardHistoryView`, and `LessonEntryView` are Client Components that read the repository after mount, so SSR/build never touches `localStorage`. Missing, unreadable, or malformed storage fails safe (empty history) and does not rewrite stored data on read.

**No automatic sample seeding:** `/student` and `/dashboard` read whatever the repository already has. Fresh storage shows a clear start CTA on Student Home (`เริ่มการเรียนรู้`) and the genuine empty analytics state on `/dashboard`. Sample helpers in `lib/analytics/sample-data.ts` remain for tests and explicit fixtures only.

**Current persistence:** browser `localStorage` via `LocalStorageLearningHistoryRepository`. Backend/Supabase persistence is deferred.

**Supported persisted activities:** quiz, millionaire, flash-cards, learn.

**Learn completion v1:** Last-slide `เข้าใจแล้ว ✓` in student companion context records Learn through `recordLearnCompletion`. Teacher `from=teacher` does not write student history. After mount, a stored Learn event restores completed slides. Learn-only history for the active lesson advances to Short Practice (`ทำ Quiz`). Flash-only history remains LEARN / flash override.

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
