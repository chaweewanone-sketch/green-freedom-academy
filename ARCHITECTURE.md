# Green Freedom Academy — Architecture

Concise reference for how lessons, questions, and learning activities are structured in GFA_Main.

---

## Overview

```
Lesson Registry  →  /lesson/[slug]                    →  ClassroomCompanion
Question Engine  →  Question[]                         →  Millionaire Engine
Activity List    →  /lesson/[slug]/activity/[activity] →  Activity page
```

Both lesson and activity layers use **data-driven registries**. UI components stay generic; new content is added by registering data, not by copying page files.

---

## Folder Structure

```
types/
  lesson.ts              # LessonData, LessonStep, LessonSummary
  activity.ts            # Activity, ActivityStatus
  question.ts            # Question, QuestionChoice, Difficulty

lib/
  lessons/
    registry.ts          # Lesson catalog (single source of truth)
    present-simple.ts    # Lesson content
    past-simple.ts       # Lesson content
    index.ts             # Public barrel
  questions/
    buildQuestions.ts    # Question Engine (deterministic, no AI)
    index.ts             # Public barrel
  activities/
    index.ts             # Activity list + getActivityPath()

components/
  classroom-companion/   # Lesson delivery UI
  activities/
    ActivityGrid.tsx     # Maps activities → cards
    ActivityCard.tsx     # Single activity card + routing link
  millionaire/
    MillionaireGame.tsx  # Game engine — consumes Question[] only

app/
  lesson/
    [slug]/
      page.tsx           # Lesson page
      activity/
        [activity]/
          page.tsx       # Activity page
```

---

## Lesson Architecture

| Piece | Role |
|-------|------|
| `LessonData` | Model: `slug`, `title`, `steps[]` |
| `lib/lessons/*.ts` | One file per lesson — exports a `LessonData` constant |
| `lib/lessons/registry.ts` | Registers all lessons; exposes lookup helpers |
| `@/lib/lessons` | Public API — pages import from here only |
| `ClassroomCompanion` | Renders any `LessonData`; no slug or routing logic |

### Data flow (lesson)

1. Request `/lesson/{slug}`
2. `getLessonBySlug(slug)` → `LessonData | null`
3. If null → `notFound()`
4. Pass `LessonData` to `ClassroomCompanion`

### How to add a lesson

1. Create `lib/lessons/my-lesson.ts` exporting `LessonData` with a unique `slug`.
2. Register it in `lib/lessons/registry.ts`:
   ```ts
   [myLesson.slug]: myLesson,
   ```
3. Done — `/lesson/my-lesson` works via dynamic routing. Teacher dashboard lists it automatically.

Do **not** create a new folder under `app/lesson/`.

---

## Question Engine

| Piece | Role |
|-------|------|
| `Question` | Model: `id`, `prompt`, `choices[]`, `correctChoiceId`, `explanation`, `difficulty` |
| `buildQuestionsFromLesson()` | Generates `Question[]` from `LessonData.steps` |
| `@/lib/questions` | Public API for question generation |

### Pipeline

```
LessonData
  → buildQuestionsFromLesson()
  → Question[]
  → MillionaireGame
```

### v1 rules (deterministic — no AI)

- One `Question` per `LessonStep`
- Prompt uses the step title; correct choice uses the step formula
- Four choices with stable unique ids; placeholder distractors allowed
- `explanation` = step description
- Difficulty: first = `easy`, last = `hard`, middle = `medium`

### Reuse by future activities

Any activity that needs quiz-style content can import `@/lib/questions` and consume `Question[]`. Game components should **not** import `LessonData` or generate questions themselves — the activity page builds questions and passes them as props.

---

## Activity Architecture

| Piece | Role |
|-------|------|
| `Activity` | Model: `id`, `title`, `description`, `icon`, `status` |
| `lib/activities/index.ts` | Activity list + `getLearningActivities()` + `getActivityPath()` |
| `ActivityGrid` | Receives `lessonSlug` + `activities[]` |
| `ActivityCard` | Links to activity route when `status === "available"` |
| `MillionaireGame` | Receives `Question[]`, `lessonTitle`, `lessonPath` |

### Status values

| Status | UI | Navigation |
|--------|-----|------------|
| `available` | Green badge | `/lesson/{slug}/activity/{id}` |
| `coming-soon` | Gray badge | Disabled — no link |

### Data flow (millionaire activity)

1. Request `/lesson/{slug}/activity/millionaire`
2. `getLessonBySlug(slug)` → if null, `notFound()`
3. `getLearningActivities().find(id)` → if null, `notFound()`
4. `buildQuestionsFromLesson(lesson)` → `Question[]`
5. Pass `Question[]` into `MillionaireGame`

Activities are **lesson-agnostic** — the same activity works with any registered lesson via the URL.

### How to add an activity

1. Add one object to the `activities[]` array in `lib/activities/index.ts`.
2. Wire the activity page for `activityId === "my-game"`.
3. Reuse `Question[]` from the Question Engine when the activity is quiz-based.

---

## Key Conventions

- **Public APIs:** `@/lib/lessons`, `@/lib/questions`, and `@/lib/activities` — consumers never import content files directly.
- **Separation:** Question generation lives in `lib/questions`; game UI lives in `components/millionaire`.
- **Next.js 15:** Page `params` and `searchParams` are `Promise` — always `await` them.
- **404 guards:** Unknown lesson slug or activity id → `notFound()`.
- **Thai UI:** Labels and teacher copy in Thai; English for grammar examples and activity titles.

---

## Related Docs

- `docs/03-ARCHITECTURE.md` — Playbook architecture (may lag behind code)
- `docs/02-ROADMAP.md` — Delivery phases
