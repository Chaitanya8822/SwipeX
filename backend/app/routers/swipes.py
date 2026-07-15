from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter(
    prefix="/swipes",
    tags=["Swipes"],
)

@router.post("/", response_model=schemas.SwipeAction)
def record_swipe(swipe: schemas.SwipeActionCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_job = db.query(models.Job).filter(models.Job.id == swipe.job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_swipe = models.SwipeAction(
        user_id=current_user.id,
        job_id=swipe.job_id,
        is_right_swipe=swipe.is_right_swipe
    )
    db.add(new_swipe)
    db.commit()
    db.refresh(new_swipe)
    return new_swipe

@router.post("/recruiter")
def record_recruiter_swipe(job_id: int, candidate_id: int, is_right_swipe: bool, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "recruiter" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    # If the recruiter swiped right, generate a Match!
    # Because the candidate already swiped right to get in this pile
    if is_right_swipe:
        existing_match = db.query(models.Match).filter(models.Match.job_id == job_id, models.Match.user_id == candidate_id).first()
        if not existing_match:
            new_match = models.Match(job_id=job_id, user_id=candidate_id)
            db.add(new_match)
            db.commit()
            return {"status": "matched"}
    
    return {"status": "swiped"}
