# Deployment and Security Guide

This guide is now split into focused, maintained documents:

- [README.md](README.md) — product features, development, shortcuts, architecture, and limitations
- [github_publishing_guide.md](github_publishing_guide.md) — GitHub Actions and Pages deployment
- [cloud_database_guide.md](cloud_database_guide.md) — Google OAuth, Supabase migrations, RLS, and security verification
- [CHANGELOG.md](CHANGELOG.md) — completed product improvements

The production stack is React + Vite, Supabase Auth/PostgreSQL/Realtime, GitHub Actions, and GitHub Pages.

Security essentials:

- never expose the Google client secret or Supabase service-role key
- keep Row Level Security enabled on every user-data table
- never use unrestricted `USING (true)` or `WITH CHECK (true)` policies
- apply numbered migrations before deploying dependent frontend code
- run `supabase/tests/security_audit.sql` after policy changes
- run `npm run check` before every release
