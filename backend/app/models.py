from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
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

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", backref="matches")
    job = relationship("Job", backref="matches")
