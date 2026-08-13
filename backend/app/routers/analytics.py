from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database, auth

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    metrics = {}
    
    if current_user.role == models.RoleEnum.job_seeker:
        # Applications = right swipes
        total_applications = db.query(models.SwipeAction).filter(
            models.SwipeAction.user_id == current_user.id,
            models.SwipeAction.is_right_swipe == True
        ).count()
        
        # Passes = left swipes
        total_passes = db.query(models.SwipeAction).filter(
            models.SwipeAction.user_id == current_user.id,
            models.SwipeAction.is_right_swipe == False
        ).count()
        
        # Matches
        total_matches = db.query(models.Match).filter(
            models.Match.user_id == current_user.id
        ).count()
        
        metrics = {
            "total_applications": total_applications,
            "total_passes": total_passes,
            "total_matches": total_matches,
            "profile_views": total_applications * 3 + 12 # Mock metric for engagement
        }
        
    elif current_user.role == models.RoleEnum.recruiter:
        # Total active jobs posted by this recruiter
        active_jobs = db.query(models.Job).filter(
            models.Job.recruiter_id == current_user.id
        ).all()
        job_ids = [job.id for job in active_jobs]
        total_jobs = len(active_jobs)
        
        # Total pipeline applicants (job seekers who swiped right on recruiter's jobs)
        total_applicants = db.query(models.SwipeAction).filter(
            models.SwipeAction.job_id.in_(job_ids) if job_ids else False,
            models.SwipeAction.is_right_swipe == True
        ).count()
        
        # Total successful matches (where recruiter swiped right back)
        total_matches = db.query(models.Match).filter(
            models.Match.job_id.in_(job_ids) if job_ids else False
        ).count()
        
        metrics = {
            "total_jobs": total_jobs,
            "total_applicants": total_applicants,
            "total_matches": total_matches,
            "pipeline_conversion_rate": round((total_matches / total_applicants * 100), 1) if total_applicants > 0 else 0
        }
    
    return metrics
