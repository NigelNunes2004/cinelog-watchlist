from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class WatchStatus(str, enum.Enum):
    unwatched = "unwatched"
    watching = "watching"
    watched = "watched"

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genre = Column(String, nullable=False)
    release_year = Column(Integer, nullable=False)
    poster_url = Column(String, nullable=True)
    status = Column(Enum(WatchStatus), default=WatchStatus.unwatched)
    rating = Column(Float, nullable=True)
    review = Column(Text, nullable=True)
    favourite_quote = Column(String, nullable=True)
    rewatch_count = Column(Integer, default=0)
    is_top_ten = Column(Boolean, default=False)
    top_ten_rank = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
