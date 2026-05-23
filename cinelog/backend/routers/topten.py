from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from deps import get_current_user

router = APIRouter(prefix="/topten", tags=["topten"])


def _user_movies(db: Session, user_id: int):
    return db.query(models.Movie).filter(models.Movie.user_id == user_id)


@router.get("", response_model=List[schemas.MovieResponse])
def get_top_ten(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        _user_movies(db, current_user.id)
        .filter(models.Movie.is_top_ten == True)
        .order_by(models.Movie.top_ten_rank.asc())
        .all()
    )


@router.put("")
def update_top_ten(
    rankings: List[dict],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _user_movies(db, current_user.id).filter(models.Movie.is_top_ten == True).update(
        {"is_top_ten": False, "top_ten_rank": None}
    )
    for item in rankings:
        movie = (
            _user_movies(db, current_user.id)
            .filter(models.Movie.id == item["movie_id"])
            .first()
        )
        if movie:
            movie.is_top_ten = True
            movie.top_ten_rank = item["rank"]
    db.commit()
    return {"message": "Top 10 updated"}


@router.delete("/{movie_id}")
def remove_from_top_ten(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    movie = _user_movies(db, current_user.id).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    movie.is_top_ten = False
    movie.top_ten_rank = None
    db.commit()
    return {"message": "Removed from Top 10"}
