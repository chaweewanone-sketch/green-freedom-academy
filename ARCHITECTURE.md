# Green Freedom Academy — Architecture

Concise reference for how lessons, assessments, and learning activities are structured in GFA_Main.

---

## Overview

```
Lesson Registry     →  /lesson/[slug]                    →  ClassroomCompanion
Question Bank       →  Assessment Engine                  →  Question[]
Millionaire Engine  →  selectRandomQuestions()            →  10-question game
Activity List       →  /lesson/[slug]/activity/[activity] →  Activity page
```

Both lesson and activity layers use **data-driven registries**. UI components stay generic; new content is added by registering data, not by copying page files.

---

## Folder Structure

```
types/
  lesson.ts              # LessonData, LessonStep, LessonSummary
  activity.ts            # Activity, ActivityStatus
  question.ts            # Question, QuestionChoice, Difficulty
  question-bank.ts       # QuestionBank

lib/
  lessons/               # Lesson Registry
  question-bank/         # Question Bank (per-lesson seed data)
    present-simple.ts    # 50 questions
    past-simple.ts       # 10 sample questions
    index.ts             # getQuestionBank()
  questions/             # Assessment Engine
    resolveQuestions.ts  # Bank-first resolver + fallback
    buildQuestions.ts    # Fallback generator from LessonData
    selectQuestions.ts   # Random selection for games
    index.ts
  activities/

components/
  millionaire/           # Millionaire Engine — consumes Question[] only
```

---

## Lesson Architecture

| Piece | Role |
|-------|------|
| `LessonData` | Model: `slug`, `title`, `steps[]` |
| `lib/lessons/registry.ts` | Registers all lessons |
| `@/lib/lessons` | Public API |

### How to add a lesson

1. Create `lib/lessons/my-lesson.ts` and register in `registry.ts`.
2. Optionally create `lib/question-bank/my-lesson.ts` when ready for assessment content.
3. `/lesson/my-lesson` works automatically via dynamic routing.

---

## Assessment Engine

| Piece | Role |
|-------|------|
| `Question` | `id`, `prompt`, `choices[]`, `correctChoiceId`, `explanation`, `difficulty`, `grammarPoint`, `tags[]` |
| `QuestionBank` | `{ lessonSlug, questions[] }` — scales to 100+ questions per lesson |
| `getQuestionBank(slug)` | Returns bank or `null` |
| `resolveQuestionsForLesson()` | Bank if exists, else fallback |
| `selectRandomQuestions()` | Picks N unique questions for games |

### Pipeline

```
QuestionBank (preferred)
  → resolveQuestionsForLesson()
  → Question[]
  → MillionaireGame (selectRandomQuestions → 10 per round)
```

### Fallback strategy

If no bank exists for a lesson slug:

```
LessonData
  → buildQuestionsFromLesson()
  → Question[]
```

This keeps older or new lessons working before a bank is seeded.

### Question metadata

| Field | Purpose |
|-------|---------|
| `grammarPoint` | Grammar focus label (e.g. "Third person singular -s") |
| `tags[]` | Categories: affirmative, negative, wh-question, frequency, etc. |
| `difficulty` | `easy` \| `medium` \| `hard` |

The engine is **deterministic** — no AI generation in v1.

### How to add questions

1. Create or extend `lib/question-bank/{lesson-slug}.ts`.
2. Register the bank in `lib/question-bank/index.ts`.
3. All assessment activities consume `Question[]` via `resolveQuestionsForLesson()` — no activity-specific hardcoding.

Future activities (Quiz, Flash Cards, Matching, Final Test) reuse the same bank without modification.

---

## Activity Architecture

### Millionaire flow

1. Activity page loads lesson via registry.
2. `resolveQuestionsForLesson(lesson)` → full `Question[]` bank.
3. `MillionaireGame` receives `questionBank` + `gameQuestionCount={10}`.
4. On start/restart, `selectRandomQuestions()` picks 10 unique questions — no repeats within one game.

### Data flow (millionaire)

1. `getLessonBySlug(slug)` → if null, `notFound()`
2. `getLearningActivities().find(id)` → if null, `notFound()`
3. `resolveQuestionsForLesson(lesson)` → `Question[]`
4. Pass bank into `MillionaireGame`

---

## Key Conventions

- **Public APIs:** `@/lib/lessons`, `@/lib/question-bank`, `@/lib/questions`, `@/lib/activities`
- **Separation:** Banks store content; Assessment Engine resolves/selects; game UI only renders `Question[]`
- **No lesson logic in Millionaire:** game never imports `LessonData` or `getQuestionBank`
- **404 guards:** Unknown lesson slug or activity id → `notFound()`

---

## Related Docs

- `docs/03-ARCHITECTURE.md` — Playbook architecture (may lag behind code)
- `docs/02-ROADMAP.md` — Delivery phases
