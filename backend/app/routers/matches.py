from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter(
    prefix="/matches",
    tags=["Matches"],
)

@router.get("/", response_model=List[schemas.Match])
def get_matches(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value == "recruiter":
        # Get matches for jobs posted by this recruiter
        jobs = db.query(models.Job).filter(models.Job.recruiter_id == current_user.id).all()
        job_ids = [job.id for job in jobs]
        matches = db.query(models.Match).filter(models.Match.job_id.in_(job_ids)).all()
        return matches
    else:
        # Get matches for this job seeker
        matches = db.query(models.Match).filter(models.Match.user_id == current_user.id).all()
        return matches
