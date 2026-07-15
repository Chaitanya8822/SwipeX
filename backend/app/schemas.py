from pydantic import BaseModel, EmailStr
from .models import RoleEnum

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: RoleEnum = RoleEnum.job_seeker

class User(UserBase):
    id: int
    is_active: bool
    role: RoleEnum

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    salary_range: str
    description: str
    tags: str
    is_startup: bool = False

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    recruiter_id: int

    class Config:
        from_attributes = True

class SwipeActionCreate(BaseModel):
    job_id: int
    is_right_swipe: bool

class SwipeAction(SwipeActionCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

from typing import List

class ResumeAnalysisResult(BaseModel):
    score: float
    missing_skills: List[str]
    suggestions: str

class MatchBase(BaseModel):
    job_id: int
    user_id: int

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: int
    job: Job

    class Config:
        from_attributes = True
