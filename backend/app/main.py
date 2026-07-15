from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import auth, jobs, swipes, resume, matches

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SwipeX API", description="Intelligent Job Discovery Platform API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3005", # SwipeX Specific Port
    "http://127.0.0.1:3005",
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

@app.get("/")
def read_root():
    return {"message": "Welcome to SwipeX API"}
