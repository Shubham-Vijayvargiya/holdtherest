# Supabase Database, Google Authentication, and Security Guide

This application uses Supabase PostgreSQL for all user data and Supabase Auth for Google sign-in. There is no local demo account and no browser-local task database.

## Production project

- Supabase URL: `https://gevgamvtpfeootiarayn.supabase.co`
- Site URL: `https://shubham-vijayvargiya.github.io/holdtherest/`
- Google OAuth callback: `https://gevgamvtpfeootiarayn.supabase.co/auth/v1/callback`

The publishable browser key is configured by the deployment workflow. Never commit or expose the Google client secret or a Supabase service-role key.

## Apply database migrations

Open Supabase Dashboard → SQL Editor, create a new query, and run each file in order:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_product_upgrade.sql
supabase/migrations/003_fix_task_insert_policy.sql
supabase/migrations/004_usability_reliability.sql
```

Migration 004 adds:

- task due dates, optional reminder flags, and soft deletion
- persistent cross-device focus timer state
- pending/active sharing-circle member status
- automatic activation when an invited email signs in
- realtime publication for task, sharing, comment, focus, activity, member, and parking changes
- the new activity event types used by scheduling and undo

After migrations, run `supabase/tests/security_audit.sql`. Every returned table should report `rls_enabled = true`, and the anonymous table-grant result should be empty.

## Google authentication

### Google Cloud

Create a Web application OAuth client. Configure:

- Authorized JavaScript origin: `https://shubham-vijayvargiya.github.io`
- Authorized redirect URI: `https://gevgamvtpfeootiarayn.supabase.co/auth/v1/callback`

The client secret is entered only in Supabase.

### Supabase

Under Authentication → Sign In / Providers → Google:

1. Enable Google.
2. Enter the Google client ID.
3. Enter the Google client secret.
4. Keep nonce checks enabled.
5. Save.

Under Authentication → URL Configuration:

- Site URL: `https://shubham-vijayvargiya.github.io/holdtherest/`
- Redirect URL: `https://shubham-vijayvargiya.github.io/holdtherest/`
- For development, also allow `http://localhost:3000/`.

## Data isolation model

Row Level Security is enabled on every application table.

- Profiles, members, parking items, and active focus state are scoped to `auth.uid()`.
- Task owners may create and manage their tasks.
- A recipient may read a task only when its exact authenticated email appears in `task_shares`.
- Comments, activity, and focus intervals call `can_access_task(task_id)`.
- Only owners manage recipients or delete tasks.
- Soft-deleted tasks are excluded from normal access and can be restored by their owner.
- Anonymous table access is revoked.

Never “fix” an RLS error by adding a policy with `USING (true)` or `WITH CHECK (true)`. That would allow users to cross account boundaries. Diagnose the owner ID, authenticated session, and existing policy instead.

## What “encrypted” means

Supabase-hosted data is encrypted at rest and network requests use TLS. RLS prevents one authenticated user from querying another user's private rows. This application does not claim end-to-end encryption: authorized infrastructure administrators may retain database-level access.

The service worker caches only the public application shell and same-origin static assets. It does not cache authentication responses, Supabase API responses, tasks, comments, members, or focus history.

## Sharing behavior

An owner can add at most three member email addresses. A member remains pending until a profile with that email exists. Sharing a task creates a row for each selected recipient. Removing a member removes that recipient's task shares through the database relationship.

Email matching is case-insensitive. A shared recipient can view and work with the task, its comments, and focus history, but cannot change recipients or delete the owner's task.

## Troubleshooting

### “new row violates row-level security policy for table tasks”

1. Confirm the user is signed in and has a valid Supabase session.
2. Confirm migrations 001 through 004 ran successfully.
3. Confirm `003_fix_task_insert_policy.sql` created the insert policy that requires `auth.uid() = user_id`.
4. Run `supabase/tests/security_audit.sql`.
5. Sign out and sign back in to refresh the session.

Do not create permissive policies.

### Google redirects to an error

Confirm the Google redirect URI is the Supabase callback, while the Supabase Site URL and Redirect URL point to GitHub Pages. These are intentionally different.

### Realtime changes do not appear

Confirm migration 004 completed and the protected tables appear in the `supabase_realtime` publication. The app falls back to a refresh on reconnection.
