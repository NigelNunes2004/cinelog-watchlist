from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
import os
from routers import movies, topten, stats, search

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CineLog API", version="1.0.0", redirect_slashes=False)

_cors_origins = [
    "http://localhost:5173",
    "http://localhost:8080",
]
if _frontend_url := os.getenv("FRONTEND_URL"):
    _cors_origins.append(_frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(topten.router)
app.include_router(stats.router)
app.include_router(search.router)

@app.get("/")
def root():
    return {"message": "CineLog API is running"}
