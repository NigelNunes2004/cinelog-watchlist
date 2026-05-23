from fastapi import APIRouter, Query, HTTPException, Depends
from dotenv import load_dotenv
import requests
import os

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

import models
from deps import get_current_user

router = APIRouter(prefix="/search", tags=["search"])

GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western"
}


@router.get("")
def search_movies(
    q: str = Query(..., min_length=1),
    _current_user: models.User = Depends(get_current_user),
):
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")

    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/search/movie",
            params={
                "api_key": TMDB_API_KEY,
                "query": q,
                "language": "en-US",
                "page": 1,
                "include_adult": False
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        results = []
        for movie in data.get("results", [])[:8]:
            genre_ids = movie.get("genre_ids", [])
            genre = GENRE_MAP.get(genre_ids[0], "Drama") if genre_ids else "Drama"

            release_year = None
            release_date = movie.get("release_date", "")
            if release_date and len(release_date) >= 4:
                try:
                    release_year = int(release_date[:4])
                except ValueError:
                    release_year = None

            poster_path = movie.get("poster_path")
            results.append({
                "tmdb_id": movie.get("id"),
                "title": movie.get("title", ""),
                "genre": genre,
                "release_year": release_year,
                "poster_url": f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else None,
                "overview": movie.get("overview", "")
            })

        return {"results": results}

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="TMDB request timed out")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"TMDB API error: {str(e)}")
