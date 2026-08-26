# Green Freedom Academy — Development Workflow

**Playbook version:** 1.0

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| Package manager | npm (default) |
| Editor | VS Code / Cursor recommended |

---

## Initial Setup

```bash
# Clone or open project folder
cd green-freedom-academy-v1

# Install dependencies
npm install

# Optional: Supabase (PLANNED — not required for demo)
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Note:** The demo runs without `.env.local`. Supabase env vars are only needed when Phase 1 integration is implemented.

---

## Daily Development

```bash
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000
```

### Key routes to verify manually

| URL | Purpose |
|-----|---------|
| `/` | Landing page |
| `/login` | Demo login |
| `/student` | Student dashboard |
| `/dashboard` | Real history, resume CTA, curriculum progress, journey stage, and next-step guidance |
| `/teacher` | Teacher dashboard |
| `/lesson/present-simple` | Interactive lesson (first curriculum lesson) |
| `/lesson/past-simple` | Interactive lesson (next / currently final curriculum lesson) |
| `/lesson/present-simple/activity/quiz` | Quiz — completion writes learning history |
| `/lesson/present-simple/activity/millionaire` | Millionaire Challenge — completion writes learning history |
| `/lesson/present-simple/activity/flash-cards` | Flash Cards — completion writes learning history |

History / completion / journey / active-lesson / recommendation / curriculum-progress / resume-learning verification (no test runner yet):

```bash
npx tsx lib/history/runVerification.ts
```

---

## Validation (Required)

Every code change must pass before completion:

```bash
npm run build
```

This runs Next.js production build and TypeScript checking.

**Not yet in repository:**

- `npm run lint` — ESLint not configured
- `npm test` — No test runner configured

When these are added, they become mandatory in this workflow.

---

## Environment Variables

| Variable | Required for demo | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |

File: `.env.local` (gitignored) — template in `.env.example`.

---

## Supabase Setup (When Implementing Phase 1)

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run SQL from `supabase/schema.sql` in the Supabase SQL editor.
3. Copy project URL and anon key to `.env.local`.
4. Wire `lib/supabase-browser.ts` and add server client + middleware.
5. Extend RLS policies for `courses`, `lessons`, `classrooms`.
6. Update [02-ROADMAP.md](./02-ROADMAP.md) and [10-CHANGELOG.md](./10-CHANGELOG.md).

---

## Branching and Commits (Recommended)

No git workflow is enforced in the repository. Suggested practice:

| Branch | Purpose |
|--------|---------|
| `main` | Deployable demo / production |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Playbook-only changes |

**Commit messages:** Clear, present tense — e.g. `Add student progress save to Supabase`.

---

## Working with Cursor

1. Ensure `.cursor/rules/gfa.mdc` is active (`alwaysApply: true`).
2. Reference Playbook docs for context-heavy tasks.
3. Use [07-PROMPT-LIBRARY.md](./07-PROMPT-LIBRARY.md) for consistent agent instructions.
4. Agents must run `npm run build` after code changes.

See [06-CURSOR-GUIDE.md](./06-CURSOR-GUIDE.md).

---

## Documentation Workflow

When shipping a feature:

1. Update status in [02-ROADMAP.md](./02-ROADMAP.md).
2. Update [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) if routes or data flow change.
3. Update [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) if new UI patterns added.
4. Add entry to [10-CHANGELOG.md](./10-CHANGELOG.md).
5. Run [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) before deploy.

---

## Deployment (Vercel)

Documented in `README.md`:

1. Push repository to GitHub.
2. Import project in Vercel.
3. Deploy — Next.js detected automatically.
4. Add environment variables in Vercel dashboard when Supabase is connected.

**Post-deploy smoke test:**

- Landing page loads
- Demo login redirects correctly
- Student and teacher dashboards render
- Present Simple lesson navigates between slides

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Build fails | TypeScript errors in terminal output; fix strict mode issues |
| Blank Supabase behavior | Expected — client unused until Phase 1 |
| Progress not saved | Lesson slides are still in-memory. Quiz, millionaire, and flash-cards persist locally after completion. |
| Styles missing | `app/layout.tsx` imports `./globals.css` |
| Port in use | Run `npm run dev -- -p 3001` |

---

## Related Documents

- [05-CODING-STANDARDS.md](./05-CODING-STANDARDS.md) — Code rules
- [09-RELEASE-CHECKLIST.md](./09-RELEASE-CHECKLIST.md) — Pre-release
- [06-CURSOR-GUIDE.md](./06-CURSOR-GUIDE.md) — AI agent guide
- [README.md](../README.md) — Quick start (Thai)
