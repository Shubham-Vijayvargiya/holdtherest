# How Cloud Database Persistence & Authentication Work

This guide answers your questions about **Vercel/Netlify hosting**, **Google Authentication**, and **storing data in a real Cloud Database** so your data stays safe across devices (phone, laptop, spouse's phone) even if browser cache is cleared.

---

## ❓ Question 1: Does Vercel or Netlify require Google Authentication?

**No!** Vercel and Netlify are **hosting providers**. Their only job is to serve your website's HTML, CSS, and JavaScript to visitors online. 

- You do **NOT** need to configure complex OAuth servers or Google Cloud Console just to put your site online on Vercel or Netlify.
- Vercel and Netlify give you a free URL (`https://your-app.vercel.app`) with 1-click deployment from GitHub.

---

## 🗄️ Question 2: How do I store data in a Database instead of browser cache?

To ensure data is synced across your phone, your laptop, and your wife's phone—and is **never lost when clearing browser history**—you use a **Free Managed Cloud Database**.

The two easiest free options:

### 🌟 Option A: Supabase (Recommended — Free Postgres Database + Auth)

**Supabase** gives you a free Postgres database, built-in Google & Email login, and Row-Level Security (RLS) so your private tasks cannot be seen by anyone else.

#### 5-Minute Setup Steps:
1. Go to [Supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** -> Name it `holdtherest`.
3. In the SQL Editor, run this 1-click script to create your database tables:

```sql
-- 1. Create Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'must_do',
  status TEXT DEFAULT 'backlog',
  is_shared BOOLEAN DEFAULT false,
  total_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row-Level Security (RLS) so User A CANNOT see User B's private tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 3. Security Rule: Users can ONLY see their own private tasks OR shared tasks
CREATE POLICY "Private isolation and shared household rule" ON tasks
FOR ALL USING (
  user_id = auth.uid()::text OR is_shared = true
);
```

4. Go to **Project Settings** -> **API**:
   - Copy `Project URL`
   - Copy `anon public key`
5. Set environment variables on Vercel / Netlify:
   - `VITE_SUPABASE_URL` = `your_project_url`
   - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`

---

### 🔥 Option B: Firebase (Cloud Firestore + Firebase Auth)

**Firebase** by Google is another popular option providing real-time multi-device sync:

1. Go to [console.firebase.google.com](https://console.firebase.google.com).
2. Create project `holdtherest`.
3. Turn on **Firestore Database** and **Firebase Authentication (Google Provider)**.
4. Set Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // User can read if owner OR task is marked as shared
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.isShared == true);
      
      // User can write ONLY if owner
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🔒 Summary of Data Flow:

```
[ Your Phone / Laptop ]  --->  [ Vercel / Netlify Frontend ]  --->  [ Supabase / Firebase Cloud Database ]
                                                                        │
                                                                        ├── User A (Shubh Private Tasks - Encrypted)
                                                                        ├── User B (Wife Private Tasks - Encrypted)
                                                                        └── Shared Household Hub Tasks (Both Access)
```

1. **Vercel / Netlify**: Serves the app interface online.
2. **Supabase / Firebase**: Holds all data securely in the cloud across all your devices.
3. **Row-Level Security (RLS)**: Enforces that you and your wife only see your respective private items, while sharing common items in the Shared Hub.
