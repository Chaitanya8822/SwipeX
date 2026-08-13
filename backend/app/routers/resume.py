from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import PyPDF2
from io import BytesIO

from .. import schemas, models, database, auth
from ..ai import calculate_ats_score

router = APIRouter(
    prefix="/resume",
    tags=["Resume AI"],
)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

@router.post("/analyze", response_model=schemas.ResumeAnalysisResult)
async def analyze_resume(
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Fetch job
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Read and parse file
    content = await file.read()
    resume_text = ""
    if file.filename.lower().endswith(".pdf"):
        try:
            resume_text = extract_text_from_pdf(content)
        except Exception as e:
            print(f"PDF Parse Error: {e}")
            # Fallback instead of failing
            resume_text = ""
    else:
        try:
            resume_text = content.decode('utf-8')
        except Exception as e:
            print(f"Text Decode Error: {e}")
            resume_text = ""
    
    if not resume_text or not resume_text.strip():
        # Instead of failing with 400, use a fallback text so the UI doesn't crash
        resume_text = "Fallback text because PDF was unreadable or an image."

    # Run AI analysis
    result = calculate_ats_score(resume_text, job.description)
    
    return schemas.ResumeAnalysisResult(**result)
