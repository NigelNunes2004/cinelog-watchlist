from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import movies, topten, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CineLog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(topten.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "CineLog API is running"}
