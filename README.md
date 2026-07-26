# Hold the Rest

Hold the Rest is a calm, mobile-first task planner for capturing everything, choosing what matters, and focusing on one task at a time. It is a React/Vite application backed by Supabase and published with GitHub Pages.

Live application: [shubham-vijayvargiya.github.io/holdtherest](https://shubham-vijayvargiya.github.io/holdtherest/)

## What is implemented

- Google-only authentication through Supabase
- A first-login display name and a compact personalized header
- Fast task-name capture into Must Do, Should Do, or Nice to Have
- Drag-and-drop and accessible controls for moving tasks between priorities
- Search across task titles and notes
- Active, due today, overdue, shared, private, completed, and all-task filters
- Sorting by recent activity, due date, time spent, or title
- Optional due dates and browser reminders
- Focus mode with a persistent timer that survives refreshes and device changes
- Formatted notes, autosave status, comments, comment history, work intervals, and an activity audit trail
- Optimistic add, move, complete, schedule, share, notes, and delete interactions
- Undo for priority changes, completion, and soft deletion
- A separate People area supporting up to three sharing-circle members
- Pending/active member status and per-task recipient selection
- Realtime refresh when another signed-in device changes shared data
- Parking lot and time analytics
- Responsive desktop/mobile layouts and a mobile bottom navigation bar
- Light and dark themes with instant switching
- Keyboard shortcuts and visible keyboard focus
- Installable PWA metadata and an offline-safe static shell
- Row-level database security, Google identity isolation, and no local demo data
- Friendly retryable errors, offline status, skeleton loading, and reduced-motion support

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `N` | Focus the quick-capture field |
| `/` | Focus task search |
| `Space` | Start or pause the timer in Focus mode |
| `Esc` | Leave Focus mode |

Shortcuts do not override typing inside inputs or editors.

## Local development

Requirements: Node.js 22 and npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Set these public browser variables in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-publishable-key
```

Run the complete quality gate:

```bash
npm run check
```

This runs ESLint, Vitest, and a production Vite build.

## Database setup and upgrades

Run the numbered SQL files in `supabase/migrations/` in order:

1. `001_initial_schema.sql` — authenticated profiles, private tasks, memberships, parking, focus sessions, and baseline RLS
2. `002_product_upgrade.sql` — sharing, notes, comments, activity history, and richer focus data
3. `003_fix_task_insert_policy.sql` — owner-safe task insertion
4. `004_usability_reliability.sql` — scheduling, soft deletion, persistent focus, member status, and realtime publication

The migrations are designed to be rerunnable where practical. Never replace the policies with `USING (true)` or `WITH CHECK (true)`.

See [cloud_database_guide.md](cloud_database_guide.md) for OAuth, migration, RLS, and security verification instructions. The read-only checks in `supabase/tests/security_audit.sql` verify that protected tables have RLS and are not granted to anonymous users.

## Authentication configuration

1. In Google Cloud, create a Web OAuth client.
2. Add Supabase's callback URL as the Google authorized redirect URI:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Add the Google client ID and secret to Supabase Authentication → Sign In / Providers → Google.
4. In Supabase Authentication → URL Configuration, set the production Site URL and add the production URL plus local development URL to Redirect URLs.

The application requests only Google identity information used for authentication. It does not request Gmail, Drive, Calendar, Contacts, or Google passwords.

## Security and privacy

- Supabase Row Level Security uses the authenticated JWT user ID and verified email.
- Owners can see and change their own records; recipients see only tasks explicitly shared with their email.
- Only owners can delete tasks or change task recipients.
- Task data is stored in Supabase, not browser storage, so a second user on the same browser receives only their authorized data after sign-in.
- Supabase-hosted storage is encrypted at rest and HTTPS protects data in transit.
- The public publishable key belongs in browser code; a service-role key never does.
- The service worker caches only same-origin static application assets. It does not cache Supabase API responses or task data.

This is not client-side/end-to-end encryption: a trusted database administrator may still have infrastructure-level access. RLS is the user-isolation control.

## Reminders and offline behavior

Browser reminders require notification permission and fire while the application or installed PWA is running. The static application shell can reopen from cache, but authentication and cloud data operations require a connection. Task data is deliberately not cached by the service worker.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which installs dependencies, runs tests, builds the Vite `dist` directory, and deploys it to GitHub Pages. In repository Settings → Pages, the source must be **GitHub Actions**.

See [github_publishing_guide.md](github_publishing_guide.md) for the current release workflow and [CHANGELOG.md](CHANGELOG.md) for completed improvements.
