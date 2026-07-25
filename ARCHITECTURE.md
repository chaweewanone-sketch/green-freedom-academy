# Green Freedom Academy — Architecture

Concise reference for how lessons, assessments, and learning activities are structured in GFA_Main.

---

## Overview

```
Lesson Registry      →  /lesson/[slug]                    →  ClassroomCompanion
Question Bank        →  Assessment Service                 →  AssessmentSession
Activity List        →  /lesson/[slug]/activity/[activity] →  Activity UI
```

**Separation of concerns:**

| Layer | Owns |
|-------|------|
| Question Bank | Content — `Question[]` per lesson |
| Assessment Service | Policy — filtering, selection, defaults, session metadata |
| Activity UI | Interaction — render `AssessmentSession`, track score/state |
| Analytics Engine | Aggregation — normalize activity results into `LearningSummary` |

---

## Folder Structure

```
types/
  lesson.ts
  question.ts
  question-bank.ts
  assessment.ts          # AssessmentSession, AssessmentOptions
  assessment-result.ts   # Correctness-based result (Quiz)
  recall.ts              # Self-rated recall result (Flash Cards)
  analytics.ts           # LearningEvent, LearningSummary

lib/
  lessons/               # Lesson Registry
  question-bank/         # Question content (50+ questions per lesson)
  questions/             # resolveQuestionsForLesson + selectRandomQuestions (internal helpers)
  assessment/            # PUBLIC assessment API
    createAssessmentSession.ts
    activityDefaults.ts
    index.ts
  analytics/             # Pure aggregation — normalize results → LearningSummary
    aggregate.ts
    summary.ts
    index.ts
  activities/

components/
  millionaire/           # Consumes AssessmentSession only
  quiz/
  flash-cards/           # Active recall — consumes AssessmentSession only
  dashboard/             # StudentDashboard — consumes LearningSummary only
```

---

## Assessment Pipeline

```
LessonData
  → createAssessmentSession(lesson, activity, options?)
  → AssessmentSession
  → MillionaireGame (or Quiz, Flash Cards, etc.)
```

### AssessmentSession

| Field | Purpose |
|-------|---------|
| `lessonSlug` | Source lesson |
| `activity` | millionaire \| quiz \| flash-cards \| matching \| final-test |
| `questions` | Selected, immutable question set for this session |
| `totalAvailable` | Count after filters, before selection |
| `selectedCount` | Questions in session |
| `createdAt` | `Date.now()` — future learning history |
| `sessionId` | Lightweight unique id — future analytics |

### Activity defaults (centralized)

| Activity | Default count | Randomize |
|----------|---------------|-----------|
| millionaire | 10 | true |
| quiz | 20 | true |
| flash-cards | 20 | true |
| matching | 8 | true |
| final-test | 40 | true |

Activities never hardcode these values.

### Filtering (AND between groups)

- `difficulties[]` — question must match one listed difficulty
- `tags[]` — question must match at least one tag
- `grammarPoints[]` — question must match one grammar point
- Empty filter groups are ignored
- Zero matches → empty session (no throw)

### Fallback

If no Question Bank exists for a lesson:

```
LessonData → buildQuestionsFromLesson() → Question[]
```

### Session immutability

- Session is frozen at creation
- **Restart** replays the same session
- **Browser refresh** creates a new session (route re-renders)

---

## Public APIs

| Import | Use |
|--------|-----|
| `@/lib/lessons` | Lesson lookup |
| `@/lib/assessment` | **Only** public entry for activities |
| `@/lib/analytics` | Normalize results and build `LearningSummary` |
| `@/lib/question-bank` | Internal to assessment engine (do not import from activities) |
| `@/lib/questions` | Internal helpers (do not import from activities) |

Future activities import **only** `@/lib/assessment`.

---

## Millionaire flow

1. Activity route: `createAssessmentSession(lesson, "millionaire")`
2. Pass frozen `AssessmentSession` to `MillionaireGame`
3. Game plays `session.questions` — no selection logic in UI

---

## Quiz flow

1. Activity route: `createAssessmentSession(lesson, "quiz")`
2. Pass frozen `AssessmentSession` to `QuizGame`
3. Multiple-choice with correctness scoring → `AssessmentResult` (not persisted)

---

## Flash Cards flow (active recall)

```
Lesson → Assessment Service → AssessmentSession → FlashCardsGame → FlashCardResult
```

| Aspect | Behavior |
|--------|----------|
| Recall model | Answer hidden until **Reveal Answer** |
| Self-rating | Easy / Medium / Hard after reveal |
| Scoring | No automatic correctness score |
| Policy | Assessment Service owns count, randomization, filtering |
| Interaction | FlashCardsGame owns reveal, rating, navigation, summary |
| Restart | Replays same frozen session and order; clears ratings |
| Refresh | Route creates new session (may differ if randomized) |
| Persistence | `FlashCardResult` built at completion — not persisted yet |

### Result types

| Type | Activity | Measures |
|------|----------|----------|
| `AssessmentResult` | Quiz, Millionaire | Correct vs incorrect answers |
| `FlashCardResult` | Flash Cards | Self-rated recall (Easy / Medium / Hard) |

Future analytics may normalize both types; that is outside current scope.

---

## Analytics flow

```
Activity UI → Activity Result → Learning Event → Analytics Engine → Learning Summary
```

| Step | Responsibility |
|------|----------------|
| Activity Result | `AssessmentResult` or `FlashCardResult` from completed session |
| Normalization | `normalizeAssessmentResult()` / `normalizeFlashCardResult()` |
| Aggregation | `buildLearningSummary(events)` — pure function, no side effects |
| Output | `LearningSummary` — counts, averages, flash rating totals, latest activity |

**Design rules:**

- Analytics does not depend on any specific activity UI
- Pure functions only — no React, no state, no persistence
- Sample data lives in `lib/analytics/sample-data.ts` (not exported from public API)
- No charts or backend in v1

### Public API

```typescript
import {
  buildLearningSummary,
  normalizeAssessmentResult,
  normalizeFlashCardResult,
} from "@/lib/analytics";
```

---

## Student Dashboard flow

```
Activity → Learning Event → Analytics Engine → LearningSummary → StudentDashboard
```

| Layer | Responsibility |
|-------|----------------|
| Analytics Engine | Normalize and aggregate — `buildLearningSummary()` |
| Student Dashboard | Presentation only — renders `LearningSummary` cards |
| `/dashboard` | Demo page — builds summary from `sample-data.ts` (no persistence) |

**Rules:**

- Dashboard must not calculate analytics inside React
- Dashboard imports `LearningSummary` only — not activity results or sessions
- Empty summary shows a friendly empty state
- No charts, auth, or persistence in v1

---

## Key Conventions

- **Next.js 15:** `await params` and `await searchParams`
- **404:** Unknown lesson or activity → `notFound()`
- **Deterministic content:** Question Bank is seeded data — no AI in v1

---

## Related Docs

- `docs/03-ARCHITECTURE.md` — Playbook (may lag behind code)
- `docs/02-ROADMAP.md` — Delivery phases
