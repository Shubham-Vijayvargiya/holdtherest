# The Desk — Product & Design Spec

A single-focus task tracker built to reduce the anxiety of juggling many open tasks at once. Grounded in the Zeigarnik effect: unfinished tasks stay mentally "loud" until they're captured somewhere the brain trusts. The app gives every stray thought a safe place to land (the tray) and holds exactly one active task in view at a time (the desk).

This spec is written for handoff to a build agent (Antigravity). A working HTML/CSS/JS prototype is attached separately (`the-desk.html`) as a reference for feel, layout, and interaction — treat it as the design source of truth for visuals, and this document as the source of truth for scope, data model, and the new account requirements.

---

## 1. Purpose

- Reduce the "I should be doing five things at once" anxiety by giving the user a single visible commitment (the desk) and a trusted overflow (the tray).
- Make capturing a stray thought nearly frictionless (under 2 seconds), since the relief comes from the act of writing it down, not from organizing it well.
- Enforce a soft WIP limit of 1: only one task can be "on the desk" at a time.

## 2. Users & Accounts

- **Authentication:** Google Sign-In (OAuth 2.0 / Google Identity Services). No email/password option needed for v1.
- **Multi-user:** Two independent users (the requester and his wife) will each have their own Google account and their own private data. This is not a shared household list — each person's desk and tray are visible only to them.
- **Data isolation:** Every task record is scoped to the signed-in user's account ID. No cross-user visibility, no shared tray, unless a future "shared list" feature is explicitly added later.
- **Session:** Standard persistent session (stay signed in across visits); sign-out option in a simple header menu.
- **Assumption to confirm with build:** if either user later wants to see the other's list (e.g., shared errands), that's an explicit v2 feature, not default behavior. Flag this rather than build it silently.

## 3. Core Features

1. **Quick capture** — a single always-visible text input. Typing a thought and pressing Enter (or tapping "File it") adds it to the tray. Never auto-promotes to the desk.
2. **The Desk (WIP = 1)** — exactly one task can have status `desk`. Pulling a new task from the tray onto the desk automatically returns the current desk task to the tray (swap, not delete).
3. **The Tray** — all other open tasks, shown as a list/grid of cards, most recent first. Each card can be: pulled to the desk, or deleted.
4. **Complete** — marking the desk task done removes it from active view and increments a "done today" count.
5. **Send back** — a task on the desk can be returned to the tray voluntarily without completing it.
6. **Optional timer** — preset time-box buttons (15 / 25 / 45 min) on the desk task; live countdown; on expiry, a gentle "time's up" state with options to extend (+10 min), mark done, or send back. Timer state should survive a page refresh (store the end timestamp, not a running clock).
7. **Done-today counter** — small stat in the footer; resets naturally at midnight based on local date, not a manual reset.
8. **Empty states** — the desk shows an inviting prompt when empty ("pull a card from the tray" vs. "nothing waiting, capture what's on your mind" if the tray is also empty), not a blank void.

## 4. User Flows

- **Sign in:** Landing page → "Sign in with Google" → redirected into the user's own Desk view.
- **Capture mid-task:** User is looking at the desk task, a new thought occurs → types it into the capture bar → presses Enter → thought visibly lands in the tray (small settle-in animation) → user's attention returns to the desk task, thought is no longer "held" mentally.
- **Start work:** Desk is empty → user opens the tray → taps a card → it becomes the desk task → optionally starts a timer.
- **Swap priorities:** Desk occupied → user taps a different tray card → old desk task returns to tray, new one takes its place.
- **Finish:** User taps "Done" → task disappears from active view → done-today count increments → desk goes empty, inviting the next pull.

## 5. Data Model

**User**
- `id` (Google account subject ID)
- `email`, `displayName`, `avatarUrl` (from Google profile)
- `createdAt`

**Task**
- `id`
- `userId` (foreign key, always scoped — every query filtered by signed-in user)
- `text` (string, ~200 char limit)
- `status`: `tray` | `desk` | `done`
- `createdAt`
- `doneAt` (nullable)
- `timerEndsAt` (nullable timestamp, not a duration — survives refresh/reload)

No shared tables between users in v1. No task-level sharing or assignment fields needed yet.

## 6. Visual Design System

The metaphor is a physical desk at night: one lamp-lit task in front of you, everything else resting as paper cards in a tray, out of the light but not out of reach.

**Palette**
| Token | Hex | Use |
|---|---|---|
| `wood-dark` | `#241f1a` | App background (base) |
| `wood-mid` | `#332a22` | Background gradient top |
| `lamp` | `#e8a94d` | Accent glow, primary buttons, eyebrow text |
| `lamp-soft` | `rgba(232,169,77,0.30)` | Glow shadow behind the desk card |
| `paper` | `#f5f0e4` | Desk (focus) card background |
| `paper-dim` | `#e6dfcd` | Tray card background |
| `paper-shadow` | `#cdc3a8` | Borders on paper elements |
| `ink` | `#2b2420` | Text on paper |
| `ink-soft` | `#6b5f4f` | Secondary text on paper |
| `sage` | `#7a9683` | Done/success actions |
| `rust` | `#b5654b` | Delete affordance, timer-expired state |

**Typography**
- Display: **Fraunces** (serif, warm) — app title, the task text on the desk card.
- Body: **Inter** — buttons, labels, UI chrome.
- Mono: **IBM Plex Mono** — eyebrow labels, timestamps, the timer countdown (gives a "stamped index card" feel).

**Signature element:** the desk card — a warm paper card lit by a soft radial glow against the dark wood background, visually distinct from the smaller, slightly rotated paper cards waiting in the tray below. The rotation and shadow on tray cards should read as loosely scattered index cards, not a rigid list.

**Motion:** tray cards fade/slide in on capture (settle-in feel); desk card fades in on promotion. Respect `prefers-reduced-motion`. No motion beyond these two moments — the app should otherwise feel still and quiet.

**Responsiveness:** single-column stack on mobile (<480px); tray grid collapses to 1–2 columns. Keyboard focus states must be visible throughout (accessibility floor).

## 7. Non-Functional Requirements

- Data persists server-side per account, not just in local browser storage, so either user can open the app from any device after signing in.
- Reasonably fast capture (no noticeable lag between pressing Enter and seeing the card land).
- No dark patterns, no notifications/nagging by default — this is meant to lower anxiety, not add to it.
- No task limit imposed on the tray; it should never feel like it's punishing someone for having a lot on their plate.

## 8. Suggested Tech Stack (flexible — Antigravity's call on implementation)

- Frontend: React or similar component framework, mobile-responsive.
- Auth: Google Identity Services / Firebase Auth (Google provider) for the simplest path to "Sign in with Google" plus per-user data scoping.
- Backend/data: Firebase/Firestore, Supabase, or any small managed Postgres — the schema above is intentionally minimal and portable.
- No offline-first requirement for v1; a simple loading state while data fetches after sign-in is sufficient.

## 9. Out of Scope for v1 (possible future ideas, not required now)

- Shared/household lists visible to both accounts.
- Weekly review view or analytics beyond the daily done count.
- Push notifications or reminders.
- Task categories, tags, or due dates — deliberately excluded to keep the capture step frictionless.

---

**Reference prototype:** `the-desk.html` (attached separately) implements the visual design and interaction model above using local browser storage instead of accounts. Antigravity should treat its look, feel, and micro-interactions as the design reference, and rebuild the data layer per Section 5–8 above so it works with real Google accounts for two independent users.
