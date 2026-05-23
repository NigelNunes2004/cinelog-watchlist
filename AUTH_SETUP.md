# Auth setup — what to do after pulling this update

CineLog now has **per-user accounts** with JWT login, signup, and **20-day refresh tokens**.

---

## Step 1 — Run the database migration (Neon)

1. Open [Neon Console](https://console.neon.tech) → your **MovieWatchlist** project  
2. Go to **SQL Editor**  
3. Copy and paste the entire contents of:

   `cinelog/backend/migrations/001_auth.sql`

4. Click **Run**

This creates `users` and `refresh_tokens` tables and adds `user_id` to `movies`.  
**Note:** Any existing movies without an owner are deleted during migration.

---

## Step 2 — Update Render environment variables

Render → **cinelog-api** → **Environment** → add or update:

| Key | Value | Required |
|-----|--------|----------|
| `JWT_SECRET` | A long random string (e.g. run `openssl rand -hex 32` in terminal) | **Yes** |
| `JWT_REFRESH_EXPIRE_DAYS` | `20` | Optional (default is 20) |
| `JWT_ACCESS_EXPIRE_MINUTES` | `30` | Optional (default is 30) |
| `DATABASE_URL` | Your Neon connection string | Already set |
| `TMDB_API_KEY` | Your TMDB key | Already set |
| `FRONTEND_URL` | `https://cinelog-watchlist.vercel.app` | Already set |

**Important:** `JWT_SECRET` must be set in production. Never commit it to Git.

Save → wait for Render to redeploy.

---

## Step 3 — Push code and redeploy frontend (Vercel)

```bash
git add .
git commit -m "feat: add user auth with JWT and 20-day refresh tokens"
git push origin main
```

- **Render** auto-redeploys the backend from `main`  
- **Vercel** auto-redeploys the frontend from `main`

Wait for both deploys to finish.

---

## Step 4 — Test locally (optional)

### Backend

```bash
cd cinelog/backend
source venv/bin/activate
pip install -r requirements.txt
```

Add to `cinelog/backend/.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=local-dev-secret-change-me
TMDB_API_KEY=your_key
FRONTEND_URL=http://localhost:8080
```

```bash
uvicorn main:app --reload
```

Open http://localhost:8000/docs → try **POST /auth/signup** and **POST /auth/login**.

### Frontend

```bash
cd cinelog/frontend
npm install
npm run dev
```

Open http://localhost:8080/auth → create an account → you should land on the watchlist.

---

## Step 5 — Test on production

1. Open **https://cinelog-watchlist.vercel.app/auth**  
2. **Create account** with email + password (min 8 chars)  
3. Add a movie — only your account sees it  
4. Sign out → sign in again — session should restore (refresh token, up to 20 days)  
5. Create a **second account** in toast email — confirm watchlists are separate  

---

## How auth works

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access token | 30 minutes (default) | Sent on every API request (`Authorization: Bearer …`) |
| Refresh token | **20 days** | Stored in DB + browser; auto-refreshes access token when it expires |

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/signup` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public (needs refresh token body) |
| POST | `/auth/logout` | Public (revokes refresh token) |
| GET | `/auth/me` | Bearer token |
| All `/movies`, `/topten`, `/stats`, `/search` | | Bearer token required |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 401 on every request | Log out and log in again; check `JWT_SECRET` is set on Render |
| CORS error | `FRONTEND_URL` must be `https://cinelog-watchlist.vercel.app` (with `https://`) |
| 500 on signup | Run `001_auth.sql` in Neon; check Render logs |
| "Email already registered" | Use a different email or log in |
| Movies from before auth gone | Expected — old rows had no `user_id` and were removed by migration |

---

## Security reminder

- Rotate `JWT_SECRET` if it was ever exposed  
- Never commit `.env` files  
- Each user's movies are isolated by `user_id` in the database  
