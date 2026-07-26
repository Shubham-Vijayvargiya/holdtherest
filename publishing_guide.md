# Publishing Guide

The active publishing instructions are maintained in [github_publishing_guide.md](github_publishing_guide.md).

Hold the Rest uses GitHub Actions and GitHub Pages. It does not require the `gh-pages` npm package, a manual `dist` commit, Vercel, or Netlify.

Before pushing a release:

1. Apply any new numbered Supabase migration.
2. Run `npm run check`.
3. Push the tested commit to `main`.
4. Confirm the GitHub Pages workflow is green.
5. Smoke-test `https://shubham-vijayvargiya.github.io/holdtherest/`.

For database and OAuth configuration, see [cloud_database_guide.md](cloud_database_guide.md).
