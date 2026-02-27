# Tracler — Postgres Migration & Deployment Guide

---

## WHAT YOU'RE DOING

Replacing the local SQLite database with a free cloud Postgres database (Supabase),
so your team's data is permanent and accessible from anywhere.

---

## STEP 1 — SET UP SUPABASE (Free Cloud Database)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
   - Pick any name (e.g. "tracler")
   - Set a strong database password — SAVE IT SOMEWHERE
   - Choose the region closest to your team
3. Wait ~2 minutes for it to provision
4. Once ready, go to:
   Settings → Database → scroll to "Connection string" → select "URI"
5. Copy the connection string. It looks like:
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
6. Replace [YOUR-PASSWORD] with the password you set in step 2

   ✅ SAVE THIS URI — you'll need it in Step 3 and Step 5

---

## STEP 2 — REPLACE YOUR LOCAL FILES

Replace these two files in your project with the ones provided:

  server/server.js      ← replace with the new server.js
  server/package.json   ← replace with the new package.json

---

## STEP 3 — UPDATE DEPENDENCIES (Command Prompt)

Open Command Prompt inside your project root folder, then run:

  cd server
  npm uninstall better-sqlite3
  npm install
  cd ..

This removes SQLite and installs the Postgres driver (pg).

---

## STEP 4 — TEST LOCALLY (Command Prompt)

Still in Command Prompt, run:

  cd server
  set DATABASE_URL=postgresql://postgres:YOURPASSWORD@db.xxxx.supabase.co:5432/postgres
  node server.js

You should see:
  ✅ Database tables ready
  Tracler server running on :3001

If you see an error, copy and paste it — I'll fix it immediately.

Press Ctrl+C to stop when done testing.

---

## STEP 5 — PUSH TO GITHUB (Command Prompt)

From your project root:

  git add .
  git commit -m "migrate to postgres - permanent database"
  git push

---

## STEP 6 — HOSTING OPTIONS (Pick One)

=======================================================
OPTION A — Render (what you're already using) ✅
=======================================================
- Go to your backend service on Render
- Click Environment → Add Environment Variable:
    Key:   DATABASE_URL
    Value: (your Supabase URI from Step 1)
- Render will auto-redeploy

For the frontend (if separate):
- It stays exactly the same — no changes needed

=======================================================
OPTION B — Railway (EASIEST all-in-one) ⭐ RECOMMENDED
=======================================================
Railway is simpler than Render and has a generous free tier.

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. It will detect your Node.js backend automatically
5. Add environment variable:
    DATABASE_URL = (your Supabase URI)
6. It gives you a public URL instantly

Frontend: Deploy client folder separately, or use Vercel (see Option C)

=======================================================
OPTION C — Vercel (Frontend) + Railway (Backend) 🏆 BEST COMBO
=======================================================
This is the cleanest free setup for a React + Node app:

BACKEND on Railway:
  - Follow Option B above for the server folder

FRONTEND on Vercel:
  1. Go to https://vercel.com and sign in with GitHub
  2. Import your repo
  3. Set the root directory to: client
  4. Add environment variable:
      VITE_API_URL = https://your-railway-backend-url.up.railway.app
  5. Deploy

Note: You'll need to update your frontend API calls to use VITE_API_URL
      instead of hardcoded localhost:3001

=======================================================
OPTION D — Fly.io (Backend) + Vercel (Frontend)
=======================================================
Good alternative if Railway is full. Free tier available.
More complex setup — use Railway instead unless you have a reason.

---

## QUICK COMPARISON TABLE

| Platform  | What it hosts  | Free tier  | Ease       |
|-----------|----------------|------------|------------|
| Render    | Backend        | Yes (slow) | Medium     |
| Railway   | Backend        | Yes        | Easy ⭐    |
| Vercel    | Frontend       | Yes        | Easiest ⭐ |
| Supabase  | Database       | Yes        | Easy ⭐    |
| Fly.io    | Backend        | Yes        | Hard       |

RECOMMENDED STACK FOR YOUR TEAM:
  Database  → Supabase (free Postgres)
  Backend   → Railway  (free Node.js hosting)
  Frontend  → Vercel   (free React hosting)

---

## IF ANYTHING GOES WRONG

Send me:
- The error message from Command Prompt, OR
- The error logs from Render/Railway

I'll fix it fast.
