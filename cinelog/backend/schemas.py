from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime

class WatchStatus(str, Enum):
    unwatched = "unwatched"
    watching = "watching"
    watched = "watched"

class MovieCreate(BaseModel):
    title: str
    genre: str
    release_year: int = Field(..., ge=1888, le=2030)
    poster_url: Optional[str] = None
    status: WatchStatus = WatchStatus.unwatched
    rating: Optional[float] = Field(None, ge=1.0, le=10.0)
    review: Optional[str] = None
    favourite_quote: Optional[str] = None

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    poster_url: Optional[str] = None
    status: Optional[WatchStatus] = None
    rating: Optional[float] = Field(None, ge=1.0, le=10.0)
    review: Optional[str] = None
    favourite_quote: Optional[str] = None
    rewatch_count: Optional[int] = None
    is_top_ten: Optional[bool] = None
    top_ten_rank: Optional[int] = Field(None, ge=1, le=10)

class MovieResponse(BaseModel):
    id: int
    title: str
    genre: str
    release_year: int
    poster_url: Optional[str]
    status: WatchStatus
    rating: Optional[float]
    review: Optional[str]
    favourite_quote: Optional[str]
    rewatch_count: int
    is_top_ten: bool
    top_ten_rank: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str