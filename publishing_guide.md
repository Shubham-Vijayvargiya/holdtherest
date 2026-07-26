# Publishing & Security Deployment Guide

This guide explains how to **publish your MindDump & Focus web application online** so both you and your wife can access it from any browser, phone, or laptop, secure it with real **Google OAuth 2.0 Authentication**, and enforce **Row Level Security (RLS) / End-to-End Data Encryption**.

---

## 🌐 Option 1: 1-Click Free Online Publishing (Vercel / Netlify)

### Step 1: Push Code to GitHub
1. Create a free repository on [GitHub.com](https://github.com).
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MindDump & Focus"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mind-dump-focus.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel (Free Hosting)
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **"Add New Project"** -> Select `mind-dump-focus`.
3. Keep default settings (Vite build output: `dist`).
4. Click **Deploy**.
5. Within 60 seconds, your app will be live at `https://mind-dump-focus.vercel.app`!

---

## 🔐 Option 2: Setting Up Production Google Sign-In (Google OAuth 2.0)

To use your real Google Accounts (`@gmail.com`) for sign-in on your live site:

### Step 1: Create Google OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **MindDump Focus**.
3. In the left menu, go to **APIs & Services** -> **OAuth consent screen**:
   - User Type: **External** -> Click Create.
   - App Name: **MindDump & Focus**
   - User Support Email: Your Gmail.
   - Save and continue.
4. Go to **APIs & Services** -> **Credentials**:
   - Click **Create Credentials** -> **OAuth Client ID**.
   - Application Type: **Web application**.
   - Name: **MindDump Web Client**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://mind-dump-focus.vercel.app` (your Vercel live URL)
   - **Authorized redirect URIs**:
     - `https://mind-dump-focus.vercel.app`
5. Copy your **Client ID**.

---

## 🛡️ Option 3: End-to-End Encryption & Database Security (Firebase / Supabase RLS)

To ensure that neither database admins nor external users can read private tasks:

### Supabase Row-Level Security (RLS) Policy Example
If using Supabase Postgres:
```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Rule 1: Users can ONLY select their own private tasks OR shared tasks
CREATE POLICY "Users access own or shared tasks" ON tasks
FOR SELECT USING (
  auth.uid() = user_id OR is_shared = true
);

-- Rule 2: Users can ONLY insert/update/delete their own tasks
CREATE POLICY "Users manage own tasks" ON tasks
FOR ALL USING (
  auth.uid() = user_id
);
```

### Firebase Cloud Firestore Security Rules Example
If using Firebase:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow read if owner OR explicitly shared
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.isShared == true);
      
      // Allow write ONLY if owner
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 💡 Summary of Built-in Security Features Already Active:
1. **Mandatory Login Gate**: Users cannot see tasks, brain dumps, or navigation without authenticating.
2. **Per-User Encryption Key**: Client-side AES-GCM encryption isolates task payloads per authenticated Google UID.
3. **Selective Shared Key**: Shared tasks use a household sync key so common items are readable by both partners, while private tasks remain encrypted.
4. **Log Out Engine**: Clears authentication tokens and locks the screen.
