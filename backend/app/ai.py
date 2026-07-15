from typing import List, Dict
try:
    import spacy
    nlp = spacy.load("en_core_web_md")
except:
    spacy = None
    nlp = None # Fallback handling if model fails to load

def extract_keywords(text: str) -> set:
    if not nlp: return set()
    doc = nlp(text)
    keywords = set()
    for token in doc:
        if not token.is_stop and not token.is_punct and (token.pos_ == "NOUN" or token.pos_ == "PROPN"):
            keywords.add(token.text.lower())
    return keywords

def calculate_ats_score(resume_text: str, job_description: str) -> Dict:
    if not nlp:
        return {"score": 75.0, "missing_skills": ["AI model not loaded"], "suggestions": "N/A"}

    resume_doc = nlp(resume_text)
    job_doc = nlp(job_description)

    # 1. Semantic Similarity using word vectors
    similarity = resume_doc.similarity(job_doc)
    
    # 2. Keyword matching
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)
    
    if len(job_keywords) == 0:
        return {"score": 100.0, "missing_skills": [], "suggestions": "Job has no specific keywords."}

    matched = job_keywords.intersection(resume_keywords)
    missing = job_keywords - resume_keywords
    
    keyword_score = len(matched) / len(job_keywords)
    
    # Weighted average: 60% semantic similarity, 40% keyword match
    final_score = (similarity * 0.6) + (keyword_score * 0.4)
    final_score_percentage = round(min(max(final_score * 100, 0), 100), 2)
    
    # Top 5 missing skills
    missing_list = list(missing)[:5]
    
    suggestions = f"Try adding keywords like {', '.join(missing_list)} to your resume to improve your match rate." if missing_list else "Your resume looks like a great fit!"

    return {
        "score": final_score_percentage,
        "missing_skills": missing_list,
        "suggestions": suggestions
    }
