# Green Freedom Academy — Vision

**Playbook version:** 1.0  
**Document status:** Foundation  
**Last aligned with repository:** v1.0.0 (demo UI)

---

## Mission

Green Freedom Academy (GFA) is an AI-powered educational platform that helps teachers create high-quality lessons, worksheets, games, assessments, and teaching materials **quickly**.

**The goal is not to build software for its own sake.**

**The goal is to save teachers time.**

Technology should reduce workload, not add complexity. Every feature must answer: *Does this make a teacher's day easier?*

---

## Primary Users

| User | Priority | Need |
|------|----------|------|
| **Teachers** | First | Create materials, monitor class progress, spend less time on prep |
| **Students (P.6 English)** | Second | Clear, engaging learning: Learn → Short Practice → Game |
| **Admins** | Future | Platform configuration and content oversight |

GFA follows **teacher-first design**. Student experience is important, but teacher workflows drive product decisions.

---

## Curriculum Focus

- **Primary subject:** English
- **Primary grade:** Primary 6 (P.6 / ป.6)
- **Default UI language:** Thai (ภาษาไทย)
- **Learning loop:** **Learn → Short Practice → Game**

Content and UX should feel appropriate for Thai P.6 classrooms: readable Thai labels, simple navigation, and age-suitable English activities.

---

## Product Principles

1. **Teacher-first design** — Build for the person preparing and delivering lessons.
2. **Technology serves teachers** — Fewer steps, not more screens.
3. **Thai is the default UI language** — English appears where pedagogically appropriate.
4. **P.6 English is the primary focus** — Scope content and difficulty accordingly.
5. **Learn → Short Practice → Game** — The core student journey on every lesson unit.
6. **Preserve working functionality** — Do not break demo or shipped flows without explicit approval.
7. **Reusable components and maintainable TypeScript** — Prefer clarity over cleverness.
8. **Responsive by default** — Desktop, tablet, and mobile where appropriate.
9. **Explain major refactoring before implementing** — Get alignment before large structural changes.
10. **Validation before completion** — Every code change must pass build/type checks before it is considered done.

---

## Intended Product Flow (North Star)

This is the **target architecture** for GFA. Most stages are **PLANNED** or **FUTURE** — see [02-ROADMAP.md](./02-ROADMAP.md) for status.

```
AI Teaching Brain
    ↓
Lesson Generator
    ↓
Classroom Companion
    ↓
Worksheet Generator
    ↓
Game Generator
    ↓
Assessment Generator
    ↓
Teacher Studio / Student Experience
```

| Stage | Purpose |
|-------|---------|
| **AI Teaching Brain** | Shared intelligence: curriculum context, P.6 English standards, teacher preferences |
| **Lesson Generator** | Structured lesson content for classroom delivery |
| **Classroom Companion** | Live class support: pacing, prompts, student visibility |
| **Worksheet Generator** | Printable or digital practice sheets from lesson content |
| **Game Generator** | Gamified reinforcement (e.g. Millionaire-style activities) |
| **Assessment Generator** | Quizzes and progress checks aligned to lessons |
| **Teacher Studio / Student Experience** | Where teachers manage classes and students learn |

---

## What Exists Today (CURRENT)

The repository ships a **demo-ready web UI**, not a full production platform.

| Area | Status |
|------|--------|
| Landing page, navigation, branding | ✅ Working |
| Demo login (role picker, no real auth) | ✅ Working |
| Student dashboard (static demo data) | ✅ Working |
| Teacher dashboard (static demo data) | ✅ Working |
| One interactive lesson: Present Simple | ✅ Working (client-side state only) |
| Responsive CSS layout | ✅ Working |
| PWA manifest shell | ✅ Partial (no icons configured) |
| Supabase schema file | ✅ Defined, not wired to app |
| Real authentication | ❌ Not implemented |
| Cloud save / persistence | ❌ Not implemented |
| AI generators | ❌ Not implemented |

See [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) for technical detail.

---

## Success Metrics (Aspirational)

These guide future phases; they are **not yet measured** in the codebase.

- Teachers can prepare a P.6 English lesson unit in under 15 minutes with AI assistance.
- Students complete Learn → Practice → Game without teacher intervention for navigation.
- Teacher dashboard reflects **real** student progress, not demo placeholders.
- Platform works on teacher laptops, classroom tablets, and student phones.

---

## Related Documents

- [02-ROADMAP.md](./02-ROADMAP.md) — Phased delivery plan
- [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) — System design
- [04-DESIGN-SYSTEM.md](./04-DESIGN-SYSTEM.md) — UI tokens and patterns
