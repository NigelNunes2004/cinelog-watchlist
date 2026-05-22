from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
def get_stats(db: Session = Depends(get_db)):
    total_movies = db.query(models.Movie).count()

    total_watched = db.query(models.Movie).filter(
        models.Movie.status == models.WatchStatus.watched
    ).count()

    avg_rating = db.query(func.avg(models.Movie.rating)).scalar()

    top_rewatch = (
        db.query(models.Movie)
        .filter(models.Movie.rewatch_count > 0)
        .order_by(models.Movie.rewatch_count.desc())
        .first()
    )

    genre_breakdown = (
        db.query(models.Movie.genre, func.count(models.Movie.id))
        .group_by(models.Movie.genre)
        .all()
    )

    rating_distribution = (
        db.query(
            func.floor(models.Movie.rating).label("rating_bucket"),
            func.count(models.Movie.id).label("count")
        )
        .filter(models.Movie.rating != None)
        .group_by(func.floor(models.Movie.rating))
        .order_by(func.floor(models.Movie.rating))
        .all()
    )

    return {
        "total_movies": total_movies,
        "total_watched": total_watched,
        "average_rating": round(float(avg_rating), 1) if avg_rating else None,
        "most_rewatched": top_rewatch.title if top_rewatch else None,
        "genre_breakdown": [
            {"genre": genre, "count": count}
            for genre, count in genre_breakdown
        ],
        "rating_distribution": [
            {"rating": int(bucket), "count": count}
            for bucket, count in rating_distribution
        ]
    }
