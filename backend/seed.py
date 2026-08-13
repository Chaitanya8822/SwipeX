import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app.models import Job, User, RoleEnum, Base
from app.auth import get_password_hash

# Drop all tables and recreate to apply schema changes
Base.metadata.drop_all(bind=engine)
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
    jobs_data = [
        Job(
            title='Machine Learning Engineer',
            company='DataSphere',
            location='San Francisco, CA',
            salary_range='$150k - $200k',
            description='Work on cutting-edge AI models for personalized recommendations. Experience with PyTorch and Transformers is required. Strong understanding of deep learning algorithms and NLP.',
            tags='Python, PyTorch, AI, NLP',
            is_startup=False,
            job_type='Full-time',
            experience_level='Senior',
            is_remote=False,
            recruiter_id=recruiter.id
        ),
        Job(
            title='Frontend React Developer',
            company='TechNova',
            location='Remote',
            salary_range='$100k - $130k',
            description='Join our remote team to build amazing user interfaces. React, Tailwind CSS experience required.',
            tags='React, Tailwind, Frontend',
            is_startup=True,
            job_type='Full-time',
            experience_level='Mid',
            is_remote=True,
            recruiter_id=recruiter.id
        ),
        Job(
            title='Software Engineering Intern',
            company='StartupX',
            location='New York, NY',
            salary_range='$30/hr',
            description='Summer internship for fresh graduates. Learn full-stack development with a fast-paced team.',
            tags='Python, React, Learning',
            is_startup=True,
            job_type='Internship',
            experience_level='Fresher',
            is_remote=False,
            recruiter_id=recruiter.id
        )
    ]
    db.bulk_save_objects(jobs_data)
    db.commit()
    print("Database seeded with mock recruiter and jobs!")
else:
    print("Jobs already exist in database.")
db.close()
