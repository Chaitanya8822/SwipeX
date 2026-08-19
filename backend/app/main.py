from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from . import models
from .database import engine
from .routers import auth, jobs, swipes, resume, matches, analytics, notifications, messages

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SwipeX API", description="Intelligent Job Discovery Platform API")

# Ensure uploads directory exists before mounting to prevent Render crash
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(swipes.router)
app.include_router(resume.router)
app.include_router(matches.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SwipeX API"}
