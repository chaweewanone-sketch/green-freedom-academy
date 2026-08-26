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
| `/student` | Server | None (open) | Hardcoded |
| `/teacher` | Server | None (open) | Hardcoded |
| `/dashboard` | Server page + client history view | None | Learning history repository |
| `/lesson/[slug]` | Client lesson viewer | None | In-memory lesson state |
| `/lesson/[slug]/activity/[activity]` | Server page + client player | None | Assessment session; completed quiz / millionaire / flash-cards persist via history repository |

---

## Data Flow (Current)

### Demo login

1. User selects role (student | teacher) on `/login`.
2. Form submit writes `gfa-demo-role` to `localStorage`.
3. Router redirects to `/student` or `/teacher`.
4. **Gap:** No page reads `gfa-demo-role`; routes are not protected.

### Lesson experience

1. Student opens `/lesson/present-simple` from dashboard.
2. Slide index and completed slides live in React state.
3. Progress bar derived from completed slide count.
4. **Gap:** Progress is lost on page refresh; nothing persists to Supabase.

### Teacher dashboard

1. Static arrays render stats and student table rows.
2. "สร้างห้องเรียน" button renders but performs no action.

### Learning history persistence

Completed student activities are adapted into `LearningEvent`s and saved through the repository. Analytics and the dashboard never talk to `localStorage` or a backend.

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
  → Journey Engine (`buildLearningJourney`)        // current stage
  → Recommendation Engine (`buildLearningRecommendation`) // next action
  → Student Dashboard
```

| Piece | Role |
|-------|------|
| `recordActivityCompletion()` | Shared completion recorder in `lib/history/recordActivityCompletion.ts`. Persists only completed results. Dedupes identical `sessionId` + `completedAt` callbacks/rerenders. New attempts with a new timestamp save a new event. |
| `StudentActivityPlayer` | Client boundary that wires `onComplete` for implemented activities. Engines stay reusable and do not import the repository. |
| `LearningHistoryRepository` | Contract in `types/history.ts` — `save`, `getAll`, `getByLesson`, `getByActivity`, `getLatest`, `clear` |
| `MemoryLearningHistoryRepository` | In-memory implementation; used on the server and in tests |
| `LocalStorageLearningHistoryRepository` | Browser persistence under one versioned key: `gfa.learningHistory.v1` |
| `createLearningHistoryRepository()` | Browser → localStorage repository; non-browser → memory repository |
| `loadDashboardHistory()` | Shared dashboard read path — repository → analytics summary. Does not seed sample events. |
| `buildLearningRecommendation()` | Deterministic next-best-action rules over `LearningSummary`. No `localStorage`, no LLM, no backend. Thresholds are v1 policy constants (`70` / `85` / flash review ratio `0.5`). |
| `buildLearningJourney()` | Deterministic current-stage rules over `LearningSummary`. Separate from recommendation. Flash weak retention can override COMPLETE to REVIEW. |

**Browser boundary:** `/dashboard` stays a Server Component. `DashboardHistoryView` is a Client Component that creates the repository after mount, so SSR/build never touches `localStorage`. Missing, unreadable, or malformed storage fails safe (empty history) and does not rewrite stored data on read.

**No automatic sample seeding:** `/dashboard` reads whatever the repository already has. Fresh storage shows the genuine empty state (`ยังไม่มีกิจกรรมการเรียน`). Sample helpers in `lib/analytics/sample-data.ts` remain for tests and explicit fixtures only.

**Current persistence:** browser `localStorage` via `LocalStorageLearningHistoryRepository`. Backend/Supabase persistence is deferred.

**Supported persisted activities:** quiz, millionaire, flash-cards.

**Recommendation v1:** the dashboard shows one "แนะนำขั้นต่อไป" card from `LearningSummary` (latest lesson when known, otherwise Present Simple). Rules are explicit and testable — not personalized by AI.

**Journey v1:** the dashboard shows one "เส้นทางการเรียน" card. Journey = current stage (เรียน / ฝึก / เล่น / ทบทวน / สำเร็จ). Recommendation = next best action. No backend progression, no AI/LLM, no Supabase.

**Not yet wired:** matching, monopoly, spin-wheel, sentence-builder, and lesson-slide completion.

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
