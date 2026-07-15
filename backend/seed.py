import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app.models import Job, User, RoleEnum, Base
from app.auth import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Create Recruiter
recruiter = db.query(User).filter(User.email == "recruiter@datasphere.com").first()
if not recruiter:
    recruiter = User(
        email="recruiter@datasphere.com",
        hashed_password=get_password_hash("password123"),
        role=RoleEnum.recruiter
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

if db.query(Job).count() == 0:
    job = Job(
        title='Machine Learning Engineer',
        company='DataSphere',
        location='San Francisco, CA',
        salary_range='$150k - $200k',
        description='Work on cutting-edge AI models for personalized recommendations. Experience with PyTorch and Transformers is required. Strong understanding of deep learning algorithms and NLP.',
        tags='Python, PyTorch, AI, NLP',
        is_startup=False,
        recruiter_id=recruiter.id
    )
    db.add(job)
    db.commit()
    print("Database seeded with mock recruiter and job!")
else:
    print("Jobs already exist in database.")
db.close()
