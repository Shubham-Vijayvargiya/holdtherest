# Hold the Rest

A calm, privacy-conscious task planner built around one visible focus at a time.

## Features

- Fast task capture with three priority tiers
- Persisted focus mode with accurate timestamp-based timers
- Parking lot for distracting thoughts
- Explicit partner sharing with owner-only privacy and delete controls
- Focus-session analytics
- Required Google authentication through Supabase
- Cloud-backed profiles, tasks, members, comments, and focus history
- Up to three sharing-circle members with per-task access
- Formatted task notes and a chronological task audit trail
- Light and dark themes

## Local development

```bash
npm install
npm run dev
```

Run the complete quality gate with:

```bash
npm run check
```

## Configure Google authentication

1. Create a Supabase project.
2. Run the numbered files in `supabase/migrations/` in order in the SQL editor.
3. Enable the Google provider under Authentication → Providers.
4. Copy `.env.example` to `.env.local` and provide the project URL and public anonymous key.
5. Add the local and production URLs to Supabase's redirect URL allowlist.

The anonymous key is safe to expose in a browser only when row-level security remains enabled. Never place a Supabase service-role key in a `VITE_` variable.

## Current cloud scope

The application requires Supabase Google authentication and has no local sign-in fallback. Profiles, sharing-circle members, tasks, formatted notes, comments, focus intervals, activity history, and parked thoughts are stored in Supabase. The application does not use browser storage for task data.

## Security model

- Private cloud tasks are scoped to the authenticated user ID by database policy.
- Shared tasks are visible only to their owner and explicitly selected recipient emails.
- Only owners can delete tasks or change sharing.
- Supabase policies derive identity from the authenticated JWT rather than client-provided user IDs.
- Supabase encrypts hosted project data at rest, and its HTTP APIs enforce TLS in transit.
- No Gmail, Calendar, Drive, contacts, or Google password access is requested.
