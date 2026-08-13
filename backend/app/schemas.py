from pydantic import BaseModel, EmailStr
from datetime import datetime
from .models import RoleEnum

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: RoleEnum = RoleEnum.job_seeker
    full_name: str | None = None
    company_name: str | None = None
    mobile_number: str | None = None

class User(UserBase):
    id: int
    is_active: bool
    role: RoleEnum
    full_name: str | None = None
    bio: str | None = None
    company_name: str | None = None
    skills: str | None = None
    mobile_number: str | None = None
    portfolio_url: str | None = None
    profile_picture_url: str | None = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    company_name: str | None = None
    skills: str | None = None
    mobile_number: str | None = None
    portfolio_url: str | None = None
    profile_picture_url: str | None = None

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
    job_type: str | None = None
    experience_level: str | None = None
    is_remote: bool = False

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    recruiter_id: int
    posted_at: datetime

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
    formatting_score: float
    readability_score: float
    missing_skills: List[str]
    matching_skills: List[str]
    suggestions: List[str]
    strong_points: List[str]

class MatchBase(BaseModel):
    job_id: int
    user_id: int

class MatchCreate(MatchBase):
    pass

class Match(BaseModel):
    id: int
    job_id: int
    user_id: int
    job: Job
    user: User | None = None

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    content: str
    match_id: int

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
