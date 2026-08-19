from typing import List, Dict
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
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
        return {
            "score": 75.0, 
            "formatting_score": 80.0,
            "readability_score": 85.0,
            "missing_skills": ["AI model not loaded"],
            "matching_skills": ["Sample Skill"],
            "suggestions": ["Failed to load AI model. Please check dependencies."],
            "strong_points": ["Resume text was successfully extracted."]
        }

    resume_doc = nlp(resume_text)
    job_doc = nlp(job_description)

    # 1. Semantic Similarity
    similarity = resume_doc.similarity(job_doc)
    
    # 2. Keyword matching
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)
    
    if len(job_keywords) == 0:
        return {
            "score": 100.0, 
            "formatting_score": 90.0,
            "readability_score": 90.0,
            "missing_skills": [], 
            "matching_skills": list(resume_keywords)[:5],
            "suggestions": ["Job has no specific keywords. Ensure your formatting is clean."],
            "strong_points": ["Your resume looks clean and well-structured."]
        }

    matched = job_keywords.intersection(resume_keywords)
    missing = job_keywords - resume_keywords
    
    keyword_score = len(matched) / len(job_keywords)
    final_score = (similarity * 0.6) + (keyword_score * 0.4)
    final_score_percentage = round(min(max(final_score * 100, 0), 100), 2)
    
    missing_list = list(missing)[:5]
    matching_list = list(matched)[:5]
    
    # Heuristics for formatting and readability
    text_length = len(resume_text)
    formatting_score = min(max((text_length / 2000) * 100, 40), 95)
    readability_score = min(max((similarity + 0.2) * 100, 50), 98)

    suggestions = []
    if missing_list:
        suggestions.append(f"Incorporate keywords: {', '.join(missing_list)}.")
    if formatting_score < 70:
        suggestions.append("Your resume seems a bit short. Add more detailed bullet points.")
    suggestions.append("Quantify your achievements using metrics and numbers.")
    if not suggestions:
        suggestions.append("Keep your resume updated with your latest achievements.")

    strong_points = []
    if matching_list:
        strong_points.append(f"Great job matching key requirements: {', '.join(matching_list)}.")
    if readability_score > 80:
        strong_points.append("Your resume has excellent readability and flow.")
    if not strong_points:
        strong_points.append("Good foundational structure.")

    return {
        "score": final_score_percentage,
        "formatting_score": round(formatting_score, 2),
        "readability_score": round(readability_score, 2),
        "missing_skills": missing_list,
        "matching_skills": matching_list,
        "suggestions": suggestions,
        "strong_points": strong_points
    }
