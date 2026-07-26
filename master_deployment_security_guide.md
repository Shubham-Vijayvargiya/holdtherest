# Master Deployment, Google Auth & Encrypted Database Guide

This comprehensive guide gives you step-by-step instructions for:
1. **Publishing your app to GitHub & hosting online for free**
2. **Connecting production Google Authentication**
3. **Storing user data in an encrypted Cloud Database (Supabase PostgreSQL)**

---

## 📌 PART 1: Publishing to GitHub & Hosting Online

### Step 1.1: Create a GitHub Repository
1. Go to [GitHub.com/new](https://github.com/new) and log in.
2. Enter Repository Name: `mind-dump-focus`
3. Description: *Serene daily planner, visual focus timer & selective household sharing web app.*
4. Select **Public**.
5. Do **NOT** check "Add a README" (your project already has files).
6. Click **Create repository**.

### Step 1.2: Push Local Code to GitHub
Open VS Code Terminal or Command Prompt in `c:\Users\shubh\OneDrive\Documents\Task` and run:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all project files
git add .

# 3. Commit your code
git commit -m "Initial release - MindDump & Focus web application"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repo (replace YOUR_GITHUB_USERNAME with your real username)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mind-dump-focus.git

# 6. Push code to GitHub
git push -u origin main
```

### Step 1.3: Host Online for Free via Vercel (1-Click Hosting)
1. Go to [Vercel.com](https://vercel.com) and click **Sign Up with GitHub**.
2. Click **"Add New Project"** -> Select `mind-dump-focus`.
3. Keep default settings (Vite build framework output: `dist`).
4. Click **Deploy**.
5. In 45 seconds, your app will be live at `https://mind-dump-focus.vercel.app`!

---

## 🔑 PART 2: Connecting Production Google Authentication

To allow real users to sign in with their `@gmail.com` accounts:

### Step 2.1: Create Google OAuth 2.0 Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a Project** -> **New Project** -> Name it `MindDump Focus`.
3. Left Menu -> **APIs & Services** -> **OAuth consent screen**:
   - User Type: **External** -> Click **Create**.
   - App Name: `MindDump & Focus`
   - User Support Email: *Your Gmail*
   - Click **Save and Continue**.
4. Left Menu -> **APIs & Services** -> **Credentials**:
   - Click **Create Credentials** -> **OAuth Client ID**.
   - Application Type: **Web application**.
   - Name: `MindDump Production Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://mind-dump-focus.vercel.app` (your Vercel site URL)
   - **Authorized redirect URIs**:
     - `https://mind-dump-focus.vercel.app`
5. Copy your **Client ID** and **Client Secret**.

---

## 🗄️ PART 3: Storing Data in an Encrypted Cloud Database

To ensure data persists across all devices (phone, laptop, spouse's device) and is **never lost when browser history is cleared**, use **Supabase (Free PostgreSQL)**.

### Step 3.1: Create Free Supabase Project
1. Go to [Supabase.com](https://supabase.com) and sign up for a free account.
2. Click **New Project** -> Name it `mind-dump-focus` -> Set a database password.

### Step 3.2: Create Encrypted Database Table & Security Rules (RLS)
Go to the **SQL Editor** tab in Supabase and paste this script:

```sql
-- 1. Create Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title_encrypted TEXT NOT NULL,  -- Encrypted AES-GCM cipher text
  notes_encrypted TEXT,          -- Encrypted AES-GCM cipher text
  category TEXT DEFAULT 'must_do',
  status TEXT DEFAULT 'backlog',
  is_shared BOOLEAN DEFAULT false,
  total_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row-Level Security (RLS) so User A CANNOT see User B's private tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. Security Rule: Users can ONLY select/modify their own private tasks OR shared items
CREATE POLICY "Private isolation & household sharing rule" ON tasks
FOR ALL USING (
  user_id = auth.uid()::text OR is_shared = true
);
```

### Step 3.3: Client-Side AES-GCM 256-bit Encryption
Before sending data to the cloud database, the app encrypts the payload on the user's device using `crypto.subtle`:

```javascript
// Web Crypto API 256-bit AES-GCM Client Encryption
async function encryptTaskText(plainText, userSecret) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(userSecret), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("minddump_salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plainText));
  
  // Return Base64 encoded payload safe for cloud database
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode.apply(null, combined));
}
```

---

## 🎯 Final Data Architecture Summary

```
[ User Phone / Laptop ]
       │
       ▼ (Client-Side AES-GCM 256-bit Encryption)
[ Encrypted Payload ]
       │
       ▼ (Google OAuth Token)
[ Vercel Hosted App: https://mind-dump-focus.vercel.app ]
       │
       ▼ (Row-Level Security Filter: RLS)
[ Supabase Free Postgres Database ]
       ├── User A (Shubh Encrypted Private Tasks)
       ├── User B (Wife Encrypted Private Tasks)
       └── Shared Household Hub Items (Accessible to Both)
```
