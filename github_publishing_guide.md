# GitHub Pages Publishing Guide

Hold the Rest is already connected to:

- Repository: `Shubham-Vijayvargiya/holdtherest`
- Branch: `main`
- Live site: `https://shubham-vijayvargiya.github.io/holdtherest/`
- Workflow: `.github/workflows/deploy.yml`

## Normal release

Before publishing:

```bash
npm ci
npm run check
git status
```

Commit and push the intended files:

```bash
git add <files>
git commit -m "Describe the release"
git push origin main
```

The workflow then:

1. checks out the repository
2. installs the locked dependencies on Node.js 22
3. runs the Vitest suite
4. builds the Vite project
5. uploads `dist`
6. deploys the artifact to GitHub Pages

In GitHub → Settings → Pages, **Source** must be set to **GitHub Actions**.

## Verify a release

Open GitHub → Actions → “Deploy website to GitHub Pages.” Both the build and deploy jobs must be green. Then open the live site and refresh once.

Because browsers and service workers cache static files, use a normal reload first. If an old version remains, close all application tabs and reopen the site; use a hard refresh only if needed.

## Vite

Vite is the development and production-build tool for this React project. `npm run dev` starts the local server. `npm run build` compiles optimized static files into `dist`, which is the folder GitHub Pages publishes.

The `base: './'` setting in `vite.config.js` keeps asset URLs compatible with the `/holdtherest/` repository path.

## Environment and secrets

The deployed browser receives only the Supabase URL and public publishable key. Never put a Supabase service-role key or Google OAuth client secret in the workflow or any `VITE_` variable.

Database migrations are not run by the Pages workflow. Apply new numbered files in `supabase/migrations/` through the Supabase SQL Editor before deploying code that depends on them.
