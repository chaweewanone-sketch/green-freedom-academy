# Green Freedom Academy — Design System

**Playbook version:** 1.0  
**Implementation:** `app/globals.css` (single global stylesheet)  
**UI language:** Thai default for labels, headings, and teacher/student copy

---

## Design Principles

1. **Clean teacher UI** — Information-dense but uncluttered; actions are obvious.
2. **Simple student UI** — Large touch targets, clear progression, minimal cognitive load.
3. **Responsive** — Desktop, tablet (iPad), and mobile breakpoints are built in.
4. **Consistent green brand** — Nature-inspired palette aligned with "Green Freedom" identity.

---

## Color Tokens

Defined in `:root` in `app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--g` | `#176b4d` | Primary green — buttons, brand mark, accents, XP box |
| `--m` | `#e7f5ed` | Mint background — secondary buttons, active nav, formula blocks |
| `--t` | `#17352a` | Primary text |
| `--muted` | `#667a72` | Secondary text, descriptions |
| `--line` | `#d8e7df` | Borders, dividers |
| `--bg` | `#f5fbf7` | Page background |

**Gradient accent:** Progress bars use `linear-gradient(90deg, var(--g), #56bd8a)`.

**Theme color (PWA):** `#176b4d` — set in `app/layout.tsx` and `manifest.webmanifest`.

---

## Typography

| Element | Style |
|---------|-------|
| Font family | `Arial, sans-serif` (system fallback) |
| Hero headings | `clamp(2.3rem, 6vw, 4.8rem)` |
| Dashboard headings | `clamp(2rem, 5vw, 3.3rem)` |
| Lesson headings | `clamp(2rem, 5vw, 3.1rem)` |
| Eyebrow labels | `.eyebrow` — uppercase, letter-spaced, primary green, ~0.78rem |

**Thai copy guidance:** Use natural Thai for UI strings. Keep English for grammar examples, lesson content, and technical filenames.

---

## Layout

| Class | Purpose |
|-------|---------|
| `.page` | Main container — `max-width: 1150px`, centered, `padding: 20px` |
| `.hero` | Landing two-column grid (1.2fr / 0.8fr) |
| `.dashboardGrid` | Student layout — main panel + 300px sidebar |
| `.lessonShell` | Lesson layout — 270px nav + content |
| `.featureGrid` / `.statGrid` | Four-column responsive grids |

---

## Components (CSS Classes)

### Navigation

| Class | Usage |
|-------|-------|
| `.brandHeader` | Top header flex row |
| `.brand` / `.brandMark` | Logo block with 🌿 mark |
| `.navLogin` | Primary-styled login link |

**React component:** `components/BrandHeader.tsx`

### Buttons

| Class | Variant |
|-------|---------|
| `.button.primary` | White text on green background |
| `.button.secondary` | Green text on mint background |
| `.button.full` | Full-width (login submit) |

Minimum height: `48px` — suitable for touch on tablets and phones.

### Cards and panels

| Class | Usage |
|-------|-------|
| `.card` | Feature cards, stat cards |
| `.panel` | Dashboard sections |
| `.authCard` | Login form container |

Shared styling: white background, `border-radius: 20px`, subtle green shadow.

### Dashboard

| Class | Usage |
|-------|-------|
| `.dashboardHero` | Title row with optional side action/XP box |
| `.xpBox` | Green XP display (student) |
| `.stage` | Lesson stage row on student dashboard |
| `.progress` | Horizontal progress bar container |

### Lesson

| Class | Usage |
|-------|-------|
| `.lessonTop` | Sticky header — back link, title, percentage |
| `.lessonNav` | Sidebar slide buttons (`.active`, `.done`) |
| `.lessonContent` | Main lesson body |
| `.formula` | Grammar rule highlight block |
| `.example` | Example sentence block |
| `.lessonActions` | Previous / Complete / Next button row |

### Forms

| Class | Usage |
|-------|-------|
| `.authWrap` | Centers login form vertically |
| `.roleTabs` | Student / Teacher toggle buttons |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `max-width: 820px` | Single-column hero, dashboard, lesson shell; 2-column stat/feature grids; horizontal lesson nav scroll |
| `max-width: 560px` | Hide nav links except login; single-column grids; stacked dashboard hero; adjusted lesson action grid |

---

## PWA / Meta

| Setting | Location | Value |
|---------|----------|-------|
| `lang` | `app/layout.tsx` | `th` |
| `themeColor` | layout + manifest | `#176b4d` |
| `manifest` | `app/layout.tsx` | `/manifest.webmanifest` |
| Icons | `manifest.webmanifest` | **Empty array** — PLANNED |

---

## Iconography

Currently **emoji-based** (🌿, 📖, 🎯, 💰, 👩‍🏫, etc.) — no icon library installed.

**Guidance for new UI:**

- Continue emoji for prototypes if consistent with existing pages.
- Consider a lightweight icon set when Teacher Studio grows.

---

## Accessibility (Guidance)

Not formally audited in v1.0. When extending:

- Maintain `48px` minimum touch targets (already on buttons).
- Ensure color contrast for `--muted` text on white backgrounds.
- Add `aria-label` on icon-only controls when introduced.
- Support keyboard navigation for lesson slide buttons.

---

## Do Not Break (CURRENT UI)

These working patterns must be preserved unless explicitly refactoring:

- Landing hero and feature grid on `/`
- Demo login flow and role tabs on `/login`
- Student dashboard layout and stage links
- Teacher stats table layout
- Present Simple lesson navigation and progress UI
- `BrandHeader` on all main pages

---

## Related Documents

- [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) — File structure
- [05-CODING-STANDARDS.md](./05-CODING-STANDARDS.md) — Component conventions
- [01-VISION.md](./01-VISION.md) — UX principles
