# GitHub Publishing & Hosting Guide

This guide gives you the exact terminal commands to publish your **Hold the Rest** codebase to **GitHub** and make it accessible online for free.

---

## 🛠️ Step 1: Create a GitHub Repository

1. Go to [GitHub.com/new](https://github.com/new).
2. Set Repository Name: `holdtherest`
3. Description: *Serene daily planner, visual focus timer & selective household sharing app.*
4. Select **Public**.
5. Do NOT check "Add a README" (we already have files).
6. Click **Create repository**.

---

## 🚀 Step 2: Push Your Local Code to GitHub

Open terminal / command prompt in this directory (`c:\Users\shubh\OneDrive\Documents\Task`) and run:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit - Hold the Rest web app with interactive demo & Google Auth gate"

# 4. Set main branch
git branch -M main

# 5. Link your remote GitHub repository (replace YOUR_GITHUB_USERNAME with your real GitHub username)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/holdtherest.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🌐 Step 3: Publish Online via GitHub Pages (Free)

### Method A: Automated GitHub Pages Deployment

1. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add these two scripts to your `package.json` under `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Run the deploy command:
   ```bash
   npm run deploy
   ```

4. Your application will be live at:
   `https://YOUR_GITHUB_USERNAME.github.io/holdtherest/`

---

## ⚡ Method B: 1-Click Publishing via Vercel (Linked to GitHub)

If you prefer custom domains and automatic continuous deployment on every git push:

1. Go to [Vercel.com](https://vercel.com) and log in with your **GitHub** account.
2. Click **"Import Project"** -> Select your `holdtherest` repository.
3. Click **Deploy**.
4. Your site will instantly be live at your configured production URL.
