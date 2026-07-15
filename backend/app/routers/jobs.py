from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)

@router.get("/", response_model=List[schemas.Job])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    # For now, just return all jobs. In future, filter out jobs the user has already swiped on.
    jobs = db.query(models.Job).offset(skip).limit(limit).all()
    return jobs

@router.post("/", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "recruiter" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to post jobs")
    
    db_job = models.Job(**job.model_dump(), recruiter_id=current_user.id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/my-jobs", response_model=List[schemas.Job])
def get_my_jobs(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "recruiter" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == current_user.id).all()
    return jobs

@router.get("/{job_id}/candidates", response_model=List[schemas.User])
def get_candidates(job_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    # Get users who swiped right on this job
    # And haven't been swiped on by the recruiter yet (optional, for MVP we can just return all right swipes)
    swipes = db.query(models.SwipeAction).filter(
        models.SwipeAction.job_id == job_id,
        models.SwipeAction.is_right_swipe == True
    ).all()
    
    candidate_ids = [swipe.user_id for swipe in swipes]
    candidates = db.query(models.User).filter(models.User.id.in_(candidate_ids)).all()
    return candidates
