from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Optional, List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/", response_model=List[schemas.MovieResponse])
def get_movies(
    genre: Optional[str] = Query(None),
    status: Optional[schemas.WatchStatus] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at", enum=["title", "rating", "release_year", "created_at"]),
    order: Optional[str] = Query("desc", enum=["asc", "desc"]),
    db: Session = Depends(get_db)
):
    query = db.query(models.Movie)

    if genre:
        query = query.filter(models.Movie.genre.ilike(f"%{genre}%"))
    if status:
        query = query.filter(models.Movie.status == status)
    if search:
        query = query.filter(models.Movie.title.ilike(f"%{search}%"))

    sort_column = getattr(models.Movie, sort_by, models.Movie.created_at)
    if order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    return query.all()


@router.get("/{movie_id}", response_model=schemas.MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.post("/", response_model=schemas.MovieResponse, status_code=201)
def create_movie(movie: schemas.MovieCreate, db: Session = Depends(get_db)):
    db_movie = models.Movie(**movie.model_dump())
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie


@router.patch("/{movie_id}", response_model=schemas.MovieResponse)
def update_movie(movie_id: int, updates: schemas.MovieUpdate, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(movie, key, value)

    db.commit()
    db.refresh(movie)
    return movie


@router.delete("/{movie_id}", status_code=204)
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    db.delete(movie)
    db.commit()
