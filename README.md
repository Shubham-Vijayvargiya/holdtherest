# Hold the Rest

A calm, privacy-conscious task planner built around one visible focus at a time.

## Features

- Fast task capture with three priority tiers
- Persisted focus mode with accurate timestamp-based timers
- Parking lot for distracting thoughts
- Explicit partner sharing with owner-only privacy and delete controls
- Focus-session analytics
- Optional Google authentication through Supabase
- Local, clearly labelled demo mode when cloud credentials are absent

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
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Enable the Google provider under Authentication → Providers.
4. Copy `.env.example` to `.env.local` and provide the project URL and public anonymous key.
5. Add the local and production URLs to Supabase's redirect URL allowlist.

The anonymous key is safe to expose in a browser only when row-level security remains enabled. Never place a Supabase service-role key in a `VITE_` variable.

## Current cloud scope

Configured builds use Supabase Google authentication. The included schema and cloud data service enforce owner/recipient reads and owner-only writes. The browser demo storage remains the active task repository in this release; connect `cloudDb` to the application state before treating cross-device synchronization as complete.

## Security model

- Private local tasks are visible only to the selected demo identity in the browser UI.
- Shared tasks are visible only to their owner and explicit recipient.
- Only owners can delete tasks or change sharing.
- Supabase policies derive identity from the authenticated JWT rather than client-provided user IDs.
- No Gmail, Calendar, Drive, contacts, or Google password access is requested.
