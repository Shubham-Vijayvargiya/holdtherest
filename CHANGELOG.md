# Changelog

## 2026-07-26 — Usability, focus, sharing, and reliability upgrade

### Faster everyday use

- Added optimistic task creation, priority moves, completion, scheduling, sharing, notes, and deletion.
- Added Undo for moves, completion, and soft deletion.
- Added friendly errors with a retry action.
- Added skeleton loading and explicit online/offline status.
- Kept light/dark switching instant.

### Find and organize work

- Added title/notes search.
- Added active, today, overdue, shared, private, completed, and all filters.
- Added member filtering.
- Added recent, due date, time spent, and title sorting.
- Added desktop drag-and-drop between Must Do, Should Do, and Nice to Have.
- Preserved accessible priority selectors for keyboard and mobile use.

### Scheduling and focus

- Added optional due dates and browser reminder settings.
- Added Focus timer persistence across refreshes and devices.
- Added Focus completion sound and optional notification.
- Added 800 ms notes autosave with visible save state.
- Kept formatted notes, comments, comment history, focus intervals, and task activity together in Focus mode.

### Sharing and realtime

- Moved member management into the People section.
- Kept the sharing circle capped at three recipients.
- Added pending/active member status.
- Automatically activates a pending membership when that email creates a profile.
- Added per-task recipient selection.
- Added realtime synchronization for tasks, shares, comments, sessions, activity, members, active Focus state, and parking.

### Mobile and accessibility

- Added a compact mobile bottom navigation bar.
- Improved small-screen spacing and control layout.
- Added a skip link, semantic status announcements, visible focus rings, and reduced-motion behavior.
- Added `N`, `/`, `Space`, and `Esc` keyboard shortcuts.

### PWA and performance

- Added an installable web manifest, application icon, and service worker.
- Cached only static same-origin application assets; cloud task data is not cached.
- Lazy-loaded Focus, analytics, shared, parking, and People screens.

### Security and data model

- Added soft deletion, due dates, reminder flags, and active Focus state.
- Preserved JWT-based row-level ownership and explicit email sharing.
- Revoked anonymous table access for the new active Focus table.
- Added a read-only SQL security audit.
- Replaced obsolete documentation that suggested unrestricted RLS policies.

### Verification

- Added TaskBoard interaction tests for search, priority moves, and Focus entry.
- Added task mapper coverage for the extended cloud schema.
- The release quality gate includes ESLint, Vitest, and a production Vite build.
