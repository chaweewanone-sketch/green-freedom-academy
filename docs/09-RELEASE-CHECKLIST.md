# Green Freedom Academy — Release Checklist

**Playbook version:** 1.0  
**Use before:** Vercel deploy, demo presentations, version tags

Mark each item **Pass / Fail / N/A**. Do not deploy with failing required items.

---

## 1. Code Quality

| # | Check | Required | Status |
|---|-------|----------|--------|
| 1.1 | `npm run build` completes with exit code 0 | ✅ | ☐ |
| 1.2 | No new TypeScript errors | ✅ | ☐ |
| 1.3 | No secrets in committed files (`.env.local`, keys) | ✅ | ☐ |
| 1.4 | ESLint passes | N/A (not configured) | ☐ |
| 1.5 | Tests pass | N/A (not configured) | ☐ |

---

## 2. Demo Functionality (CURRENT)

Verify manually on desktop and one mobile or tablet viewport.

| # | Check | Route | Required | Status |
|---|-------|-------|----------|--------|
| 2.1 | Landing page renders hero and feature grid | `/` | ✅ | ☐ |
| 2.2 | Navigation links work (นักเรียน, ครู, เข้าสู่ระบบ) | All main pages | ✅ | ☐ |
| 2.3 | Demo login — student role redirects to student dashboard | `/login` | ✅ | ☐ |
| 2.4 | Demo login — teacher role redirects to teacher dashboard | `/login` | ✅ | ☐ |
| 2.5 | Student dashboard shows stages and links to lesson | `/student` | ✅ | ☐ |
| 2.6 | Teacher dashboard shows stats and student table | `/teacher` | ✅ | ☐ |
| 2.7 | Present Simple lesson — slide nav and progress work | `/lesson/present-simple` | ✅ | ☐ |
| 2.8 | "เข้าใจแล้ว ✓" marks slides complete | `/lesson/present-simple` | ✅ | ☐ |
| 2.9 | Back link returns to student dashboard | `/lesson/present-simple` | ✅ | ☐ |

---

## 3. Responsive / PWA

| # | Check | Required | Status |
|---|-------|----------|--------|
| 3.1 | Layout acceptable at ~820px (tablet) | ✅ | ☐ |
| 3.2 | Layout acceptable at ~375px (mobile) | ✅ | ☐ |
| 3.3 | Touch targets ≥ 48px on primary buttons | ✅ | ☐ |
| 3.4 | `manifest.webmanifest` served | Optional | ☐ |
| 3.5 | PWA icons configured | N/A (empty icons) | ☐ |

---

## 4. Backend / Auth (PLANNED — N/A for demo v1.0)

Skip for current demo unless Phase 1 is shipped.

| # | Check | Required when live | Status |
|---|-------|-------------------|--------|
| 4.1 | Supabase env vars set in Vercel | Phase 1+ | ☐ |
| 4.2 | Real login replaces demo-only flow | Phase 1+ | ☐ |
| 4.3 | Route protection on `/teacher`, `/student` | Phase 1+ | ☐ |
| 4.4 | RLS policies on all tables | Phase 1+ | ☐ |
| 4.5 | Progress persists after refresh | Phase 1+ | ☐ |

---

## 5. Documentation

| # | Check | Required | Status |
|---|-------|----------|--------|
| 5.1 | [10-CHANGELOG.md](./10-CHANGELOG.md) updated for this release | ✅ | ☐ |
| 5.2 | [02-ROADMAP.md](./02-ROADMAP.md) statuses accurate | ✅ | ☐ |
| 5.3 | README still matches setup steps | ✅ | ☐ |
| 5.4 | No docs claim unbuilt features as complete | ✅ | ☐ |

---

## 6. Deployment (Vercel)

| # | Check | Required | Status |
|---|-------|----------|--------|
| 6.1 | GitHub repository connected | ✅ | ☐ |
| 6.2 | Build succeeds on Vercel | ✅ | ☐ |
| 6.3 | Production URL loads over HTTPS | ✅ | ☐ |
| 6.4 | Environment variables configured (if Supabase live) | Phase 1+ | ☐ |

---

## 7. Post-Release

| # | Action | Status |
|---|--------|--------|
| 7.1 | Tag version in git (if using tags) | ☐ |
| 7.2 | Share demo URL with stakeholders | ☐ |
| 7.3 | Log known limitations (demo auth, no persistence) | ☐ |

---

## Known Demo Limitations (v1.0 — disclose to stakeholders)

- Login is cosmetic — no real authentication.
- Student XP and teacher stats are hardcoded.
- Lesson progress resets on refresh.
- Practice and Game stages show "ยังล็อก" — not implemented.
- Supabase schema exists but is not connected to the app.
- AI generators are not started.

---

## Sign-Off Template

```
Release: v______
Date: __________
Checked by: __________
Build: Pass / Fail
Demo routes: Pass / Fail
Docs updated: Pass / Fail
Approved for deploy: Yes / No
Notes:
```

---

## Related Documents

- [08-DEVELOPMENT-WORKFLOW.md](./08-DEVELOPMENT-WORKFLOW.md) — Dev setup
- [10-CHANGELOG.md](./10-CHANGELOG.md) — Version log
- [02-ROADMAP.md](./02-ROADMAP.md) — Feature status
