from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from deps import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


def _user_movies(db: Session, user_id: int):
    return db.query(models.Movie).filter(models.Movie.user_id == user_id)


@router.get("")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    base = _user_movies(db, current_user.id)

    total_movies = base.count()

    total_watched = base.filter(
        models.Movie.status == models.WatchStatus.watched
    ).count()

    avg_rating = base.with_entities(func.avg(models.Movie.rating)).scalar()

    top_rewatch = (
        base.filter(models.Movie.rewatch_count > 0)
        .order_by(models.Movie.rewatch_count.desc())
        .first()
    )

    genre_breakdown = (
        base.with_entities(models.Movie.genre, func.count(models.Movie.id))
        .group_by(models.Movie.genre)
        .all()
    )

    rating_distribution = (
        base.with_entities(
            func.floor(models.Movie.rating).label("rating_bucket"),
            func.count(models.Movie.id).label("count"),
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
        ],
    }
