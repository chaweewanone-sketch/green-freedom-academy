# Green Freedom Academy — Architecture

Concise reference for how lessons and learning activities are structured in GFA_Main.

---

## Overview

```
Lesson Registry  →  /lesson/[slug]           →  ClassroomCompanion
Activity List    →  /lesson/[slug]/activity/[activity]  →  Activity placeholder (future games)
```

Both layers use **data-driven registries**. UI components stay generic; new content is added by registering data, not by copying page files.

---

## Folder Structure

```
types/
  lesson.ts              # LessonData, LessonStep, LessonSummary
  activity.ts            # Activity, ActivityStatus

lib/
  lessons/
    registry.ts          # Lesson catalog (single source of truth)
    present-simple.ts    # Lesson content
    past-simple.ts       # Lesson content
    index.ts             # Public barrel
  activities/
    index.ts             # Activity list + getActivityPath()

components/
  classroom-companion/   # Lesson delivery UI
  activities/
    ActivityGrid.tsx     # Maps activities → cards
    ActivityCard.tsx     # Single activity card + routing link

app/
  lesson/
    [slug]/
      page.tsx           # Lesson page
      activity/
        [activity]/
          page.tsx       # Activity page (placeholder until games ship)
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

## Activity Architecture

| Piece | Role |
|-------|------|
| `Activity` | Model: `id`, `title`, `description`, `icon`, `status` |
| `lib/activities/index.ts` | Activity list + `getLearningActivities()` + `getActivityPath()` |
| `ActivityGrid` | Receives `lessonSlug` + `activities[]` |
| `ActivityCard` | Links to activity route when `status === "available"` |

### Status values

| Status | UI | Navigation |
|--------|-----|------------|
| `available` | Green badge | `/lesson/{slug}/activity/{id}` |
| `coming-soon` | Gray badge | Disabled — no link |

### Data flow (activity)

1. Request `/lesson/{slug}/activity/{activityId}`
2. `getLessonBySlug(slug)` → if null, `notFound()`
3. `getLearningActivities().find(id)` → if null, `notFound()`
4. Render placeholder (game engines plug in here later)

Activities are **lesson-agnostic** — the same activity works with any registered lesson via the URL.

### How to add an activity

1. Add one object to the `activities[]` array in `lib/activities/index.ts`:
   ```ts
   {
     id: "my-game",
     title: "My Game",
     description: "...",
     icon: "🎮",
     status: "available", // or "coming-soon"
   }
   ```
2. Done — cards appear on every lesson’s teaching panel. When `available`, routing works automatically.

To implement the game itself (future sprint): replace the placeholder content in `app/lesson/[slug]/activity/[activity]/page.tsx` or extract a dedicated activity component.

---

## Key Conventions

- **Public APIs:** `@/lib/lessons` and `@/lib/activities` — consumers never import content files directly.
- **Next.js 15:** Page `params` and `searchParams` are `Promise` — always `await` them.
- **404 guards:** Unknown lesson slug or activity id → `notFound()`.
- **Thai UI:** Labels and teacher copy in Thai; English for grammar examples and activity titles.

---

## Related Docs

- `docs/03-ARCHITECTURE.md` — Playbook architecture (may lag behind code)
- `docs/02-ROADMAP.md` — Delivery phases
