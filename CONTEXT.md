# CineLog — Project Context

## What this project is
A personal movie watchlist app called CineLog.
Frontend is already built in React (in /frontend) using mock data.
I need you to build the backend in /backend using FastAPI + PostgreSQL.
Then help me replace the mock data in the frontend with real API calls.

## Repo structure
cinelog/
├── frontend/        # React app — built, DO NOT modify unless I ask
├── backend/         # FastAPI backend — needs to be built
├── CONTEXT.md
└── .gitignore

## My stack
- Frontend: React, Axios, React Router, Recharts (already built)
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Pydantic, python-dotenv
- Database: PostgreSQL running locally

## Frontend mock data shape
Every movie object looks like this:
{
  id, title, genre, release_year, poster_url,
  status,           // "unwatched" | "watching" | "watched"
  rating,           // null or float 1.0–10.0
  review,           // string or null
  favourite_quote,  // string or null
  rewatch_count,    // integer
  is_top_ten,       // boolean
  top_ten_rank,     // null or integer 1–10
  created_at        // datetime
}

## API endpoints the frontend expects
GET    /movies                     - get all movies (query params: genre, status, sort_by, order)
GET    /movies/{id}                - get one movie
POST   /movies                     - create a movie
PATCH  /movies/{id}                - partial update
DELETE /movies/{id}                - delete

GET    /topten                     - get top 10 movies ordered by rank
PUT    /topten                     - update full top 10 rankings
DELETE /topten/{id}                - remove from top 10

GET    /stats                      - returns total_movies, total_watched,
                                     average_rating, most_rewatched,
                                     genre_breakdown, rating_distribution

## Frontend API file
All API calls in the frontend are stubbed in:
frontend/src/api/movies.js
Each function currently returns mock data.
Once the backend is running, I will ask you to replace these stubs
with real Axios calls to http://localhost:8000

## Rules — follow these strictly
1. Build backend files one at a time, in this order:
   database.py → models.py → schemas.py → routers/movies.py → routers/topten.py → routers/stats.py → main.py
2. Do not touch /frontend unless I explicitly ask
3. After all backend files are done, I will ask you to wire the frontend
4. When wiring the frontend, only modify frontend/src/api/movies.js
5. Never modify Lovable-generated UI components — layout and design stays as is
6. Always ask before installing new packages not listed in this file

## How to run
Backend:  cd backend && uvicorn main:app --reload   (port 8000)
Frontend: cd frontend && npm run dev                 (port 5173)

## Current status
- [x] Frontend built with mock data
- [ ] Backend not started
- [ ] Frontend API calls not wired to real backend