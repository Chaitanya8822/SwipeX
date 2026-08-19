from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)

@router.get("/", response_model=List[schemas.Job])
def get_jobs(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    is_startup: Optional[bool] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    is_remote: Optional[bool] = None,
    location: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    query = db.query(models.Job)
    
    if search:
        query = query.filter(models.Job.title.ilike(f"%{search}%") | models.Job.company.ilike(f"%{search}%"))
        
    if is_startup is not None:
        query = query.filter(models.Job.is_startup == is_startup)
        
    if job_type is not None:
        query = query.filter(models.Job.job_type == job_type)
        
    if experience_level is not None:
        query = query.filter(models.Job.experience_level == experience_level)
        
    if is_remote is not None:
        query = query.filter(models.Job.is_remote == is_remote)
        
    if location is not None:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
        
    if current_user:
        # Exclude jobs the user has already swiped on
        swiped_job_ids = db.query(models.SwipeAction.job_id).filter(models.SwipeAction.user_id == current_user.id)
        query = query.filter(models.Job.id.notin_(swiped_job_ids))
        
    jobs = query.offset(skip).limit(limit).all()
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

@router.get("/recommended", response_model=List[schemas.Job])
def get_recommended_jobs(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    is_startup: Optional[bool] = None,
    location: Optional[str] = None,
    is_remote: Optional[bool] = None,
    job_type: Optional[str] = None,
    salary_range: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role.value != "job_seeker" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only job seekers get recommendations")
        
    # Build user preference profile based on past right swipes
    right_swipes = db.query(models.SwipeAction).filter(
        models.SwipeAction.user_id == current_user.id,
        models.SwipeAction.is_right_swipe == True
    ).all()
    
    preference_tags = {}
    for swipe in right_swipes:
        job = db.query(models.Job).filter(models.Job.id == swipe.job_id).first()
        if job and job.tags:
            tags = [t.strip().lower() for t in job.tags.split(",")]
            for tag in tags:
                preference_tags[tag] = preference_tags.get(tag, 0) + 1
                
    # Fetch unseen jobs
    query = db.query(models.Job)
    if search:
        query = query.filter(models.Job.title.ilike(f"%{search}%") | models.Job.company.ilike(f"%{search}%"))
    if is_startup is not None:
        query = query.filter(models.Job.is_startup == is_startup)
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    if is_remote is not None:
        query = query.filter(models.Job.is_remote == is_remote)
    if job_type:
        query = query.filter(models.Job.job_type == job_type)
    if salary_range:
        query = query.filter(models.Job.salary_range.ilike(f"%{salary_range}%"))
        
    all_swipes = db.query(models.SwipeAction.job_id).filter(models.SwipeAction.user_id == current_user.id).all()
    swiped_job_ids = [s[0] for s in all_swipes]
    if swiped_job_ids:
        query = query.filter(models.Job.id.notin_(swiped_job_ids))
        
    unseen_jobs = query.all()
    
    # Score unseen jobs and calculate competition level
    for job in unseen_jobs:
        score = 0
        if job.tags:
            job_tags = [t.strip().lower() for t in job.tags.split(",")]
            for tag in job_tags:
                if tag in preference_tags:
                    score += preference_tags[tag]
        setattr(job, "recommendation_score", score)

        # Calculate competition level based on right swipes
        right_swipe_count = db.query(models.SwipeAction).filter(
            models.SwipeAction.job_id == job.id,
            models.SwipeAction.is_right_swipe == True
        ).count()
        
        if right_swipe_count > 15:
            setattr(job, "competition_level", "High")
        elif right_swipe_count >= 5:
            setattr(job, "competition_level", "Medium")
        else:
            setattr(job, "competition_level", "Low")
        
    # Sort by recommendation score descending
    unseen_jobs.sort(key=lambda j: getattr(j, "recommendation_score", 0), reverse=True)
    
    return unseen_jobs[skip:skip+limit]

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

@router.get("/companies/")
def get_companies(db: Session = Depends(database.get_db)):
    """Returns a list of unique companies with their active job counts and startup status"""
    from sqlalchemy import func
    
    # Query to aggregate jobs by company
    results = db.query(
        models.Job.company,
        models.Job.is_startup,
        func.count(models.Job.id).label('job_count')
    ).group_by(models.Job.company, models.Job.is_startup).all()
    
    companies = []
    for row in results:
        companies.append({
            "name": row[0],
            "is_startup": row[1],
            "active_jobs": row[2]
        })
        
    return companies

@router.post("/{job_id}/save")
def toggle_save_job(job_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "job_seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can save jobs")
        
    existing_save = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()
    
    if existing_save:
        db.delete(existing_save)
        db.commit()
        return {"status": "removed"}
    else:
        new_save = models.SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_save)
        db.commit()
        return {"status": "saved"}

@router.get("/saved", response_model=List[schemas.SavedJob])
def get_saved_jobs(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "job_seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can view saved jobs")
        
    saved_jobs = db.query(models.SavedJob).filter(models.SavedJob.user_id == current_user.id).order_by(models.SavedJob.saved_at.desc()).all()
    return saved_jobs

@router.get("/applied", response_model=List[schemas.AppliedJob])
def get_applied_jobs(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role.value != "job_seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can view applied jobs")
        
    swipes = db.query(models.SwipeAction).filter(
        models.SwipeAction.user_id == current_user.id,
        models.SwipeAction.is_right_swipe == True
    ).all()
    
    applied_jobs = []
    for swipe in swipes:
        job = swipe.job
        # check if match exists
        match = db.query(models.Match).filter(
            models.Match.user_id == current_user.id,
            models.Match.job_id == job.id
        ).first()
        status = "Matched" if match else "Applied"
        applied_jobs.append({"job": job, "status": status})
        
    return applied_jobs
