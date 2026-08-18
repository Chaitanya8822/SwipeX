from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class RoleEnum(str, enum.Enum):
    job_seeker = "job_seeker"
    recruiter = "recruiter"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.job_seeker)
    
    # Profile fields
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    company_name = Column(String, nullable=True) # for recruiters
    skills = Column(String, nullable=True) # for job seekers
    mobile_number = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String)
    salary_range = Column(String)
    description = Column(String)
    tags = Column(String) # Comma separated for now
    is_startup = Column(Boolean, default=False)
    job_type = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    is_remote = Column(Boolean, default=False)
    posted_at = Column(DateTime, default=datetime.utcnow)
    recruiter_id = Column(Integer, ForeignKey("users.id"))

    recruiter = relationship("User", backref="posted_jobs")
    
class SwipeAction(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    is_right_swipe = Column(Boolean) # True = Right (Apply), False = Left (Skip)
    
    user = relationship("User", backref="swipes")
    job = relationship("Job", backref="swipes")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="saved_jobs")
    job = relationship("Job", backref="saved_by_users")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", backref="matches")
    job = relationship("Job", backref="matches")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="notifications")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", backref="messages")
    sender = relationship("User", backref="sent_messages")
