from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)

@router.get("/{match_id}", response_model=List[schemas.Message])
def get_messages(match_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify the user is part of this match
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    job = db.query(models.Job).filter(models.Job.id == match.job_id).first()
    
    # Check if user is either the candidate or the recruiter
    if current_user.id != match.user_id and current_user.id != job.recruiter_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these messages")

    messages = db.query(models.Message).filter(
        models.Message.match_id == match_id
    ).order_by(models.Message.timestamp.asc()).all()
    
    return messages

@router.post("/", response_model=schemas.Message)
def send_message(message: schemas.MessageCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    match = db.query(models.Match).filter(models.Match.id == message.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    job = db.query(models.Job).filter(models.Job.id == match.job_id).first()
    
    if current_user.id != match.user_id and current_user.id != job.recruiter_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to send messages to this match")
        
    new_message = models.Message(
        match_id=message.match_id,
        sender_id=current_user.id,
        content=message.content
    )
    db.add(new_message)
    
    recipient_id = match.user_id if current_user.id == job.recruiter_id else job.recruiter_id
    notification_msg = f"New message from {current_user.full_name or 'a connection'}: '{message.content[:20]}...'"
    
    notification = models.Notification(
        user_id=recipient_id,
        message=notification_msg
    )
    db.add(notification)
    
    db.commit()
    db.refresh(new_message)
    return new_message
