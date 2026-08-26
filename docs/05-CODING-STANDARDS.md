# Green Freedom Academy — Coding Standards

**Playbook version:** 1.0  
**Languages:** TypeScript, TSX, CSS  
**Framework:** Next.js 15 App Router

For Cursor AI behavior, see [06-CURSOR-GUIDE.md](./06-CURSOR-GUIDE.md).

---

## Core Rules

1. **Preserve existing working functionality** — Do not remove or break demo flows without explicit request.
2. **Prefer reusable React components** — Extract repeated UI when a third use appears.
3. **Maintainable over clever** — Readable code wins over compression.
4. **Avoid `any`** — Use proper types or `unknown` with narrowing.
5. **Functional components only** — No class components.
6. **Explain major refactoring before implementing** — Document rationale; get approval for large structural changes.
7. **Validation before completion** — Run `npm run build` (and fix TypeScript errors) before marking work done.

---

## TypeScript

- **Strict mode:** Enabled in `tsconfig.json` (`"strict": true`).
- **Path alias:** `@/*` maps to project root — use `@/components/...`, `@/lib/...`.
- **Prefer explicit types** for props, API responses, and database rows (when Supabase ships).
- **Shared types:** Place in `types/` or `lib/types.ts` when multiple files need them (directory does not exist yet).

```typescript
// Preferred: typed props
type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};
```

---

## React / Next.js

### Server vs Client Components

- Default to **Server Components** (no `"use client"`) unless you need:
  - `useState`, `useEffect`, or other hooks
  - Browser APIs (`localStorage`, `window`)
  - Event handlers on interactive elements
- Add `"use client"` as the **first line** of the file when required.

### File naming

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` in route folder | `app/student/page.tsx` |
| Components | PascalCase | `BrandHeader.tsx` |
| Utilities | kebab-case or camelCase file | `supabase-browser.ts` |

### Component structure

```tsx
// 1. "use client" (if needed)
// 2. imports
// 3. types
// 4. component
// 5. export

export function MyComponent() {
  return <section className="panel">...</section>;
}
```

**Current codebase note:** Several pages use minified single-line formatting. **New and edited code should use multi-line, readable formatting** unless matching a tightly scoped one-line pattern in the same file.

---

## Styling

- **Global CSS only** today — `app/globals.css`.
- Use existing CSS classes from [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) before adding new ones.
- New tokens go in `:root` — do not hardcode `#176b4d` when `var(--g)` exists.
- Inline `style={{ width: "35%" }}` is acceptable for dynamic values (progress bars); prefer CSS classes for static layout.

**Do not introduce Tailwind or CSS Modules** without an approved architecture decision.

---

## UI Copy

- **Default language:** Thai for user-facing strings.
- **English:** Lesson examples, grammar labels, and technical identifiers.
- Keep teacher-facing copy professional and concise; student copy friendly and encouraging.

Example tone (student dashboard, current):

> สวัสดี นักเรียน GFA 🌱 — วันนี้เรียนต่ออีกนิด แล้วเก็บ XP เพิ่มกันค่ะ

---

## Data and State

### Current (demo)

- Hardcoded arrays in page files are acceptable for demo data.
- `localStorage` keys:
  - `gfa-demo-role` — demo login role
  - `gfa.learningHistory.v1` — persisted learning events (`LocalStorageLearningHistoryRepository` only; do not scatter this key)
- Activity engines and analytics must not call `localStorage` — persist through `recordActivityCompletion()` / `LearningHistoryRepository`
- `/dashboard` must not auto-seed sample history; it reads the repository through `loadDashboardHistory()` / `loadDashboardLearningState()`
- Next-best-action copy comes from `buildLearningRecommendation(summary, events?)` — do not read `localStorage` in the recommendation engine. When events are provided, reuse `resolveActiveLesson` and lesson-scoped summaries; do not pick the lesson from `latestLesson`
- Current-stage copy comes from `buildLearningJourney(summary, events?)` — keep journey and recommendation as separate engines. When events are provided, the active lesson comes from `resolveActiveLesson`, not `latestLesson`
- `latestActivity` / `latestLesson` = what the learner did most recently. Active curriculum lesson = first incomplete lesson in curriculum order. Do not treat these as the same value
- Curriculum order comes from `getCurriculumLessons()` / `getNextCurriculumLesson()` — do not invent a second lesson-content registry
- Lesson COMPLETE is defined only by `isLessonComplete()` / `evaluateLessonJourney()` — do not add a second completion policy
- Journey CTAs must use `getLessonPath()`, `getActivityPath()`, or `getDashboardPath()` from `lib/routes.ts` — do not scatter hardcoded lesson/activity URLs
- The journey engine, lesson evaluator, and active-lesson resolver must not import `localStorage` or `LearningHistoryRepository`

### Planned (Supabase)

- Database access through `lib/` clients — not directly in components.
- Server Components fetch data; Client Components receive props or use hooks.
- Never expose Supabase service role key to the client.

---

## Imports

Order (recommended):

1. React / Next.js
2. Third-party libraries
3. `@/` project imports
4. Relative imports

Use `@/` alias for cross-folder imports:

```tsx
import { BrandHeader } from "@/components/BrandHeader";
```

---

## Error Handling

- Handle missing Supabase env vars gracefully (pattern already in `createClient()` returning `null`).
- Show user-friendly Thai messages for auth and network errors when auth ships.
- Do not swallow errors silently.

---

## Git and Scope

- **Small, focused changes** — One concern per commit when possible.
- **Do not modify unrelated files** during feature work.
- **Do not commit** `.env.local` or secrets.

---

## Validation Checklist (Required)

Before completing any code change:

```bash
npm run build
```

Fix all TypeScript and build errors. If adding scripts later (lint, test), run those too — see [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md).

---

## Anti-Patterns

| Avoid | Prefer |
|-------|--------|
| Deleting working demo routes | Extend or feature-flag |
| Claiming Supabase features work without wiring | Mark as PLANNED in docs |
| Giant monolithic page files | Extract components at natural boundaries |
| `any` types | Proper interfaces |
| New styling systems without discussion | Extend `globals.css` tokens |
| Unformatted one-line TSX for new code | Readable multi-line layout |

---

## Related Documents

- [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) — UI classes and tokens
- [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) — System structure
- [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) — Day-to-day process
- [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) — Pre-release checks
