import sys
import os
import json

# Add parent directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import SessionLocal
from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.resume.services.resume_normalizer import normalize_resume, get_canonical_hash
from app.resume.services.resume_analysis_service import parse_resume_text_to_json
from app.resume.services.resume_scoring_service import calculate_scores

def backfill():
    db = SessionLocal()
    try:
        resumes = db.query(Resume).all()
        print(f"Found {len(resumes)} resumes to process.")
        
        backfilled_count = 0
        error_count = 0
        
        for resume in resumes:
            print(f"\nProcessing Resume ID: {resume.id} ('{resume.title}')")
            try:
                # 1. Parse or load resume_json
                if resume.resume_json:
                    try:
                        raw_json = json.loads(resume.resume_json)
                    except json.JSONDecodeError:
                        raw_json = None
                else:
                    raw_json = None
                
                if not raw_json and resume.parsed_text:
                    print(f"  No valid resume_json found. Parsing raw text using LLM parser...")
                    raw_json = parse_resume_text_to_json(resume.parsed_text)
                
                if not raw_json:
                    # Fallback to an empty canonical structure if parsing fails/text is empty
                    raw_json = {}
                
                # 2. Normalize and compute hash
                normalized = normalize_resume(raw_json)
                canonical_hash = get_canonical_hash(normalized)
                
                # 3. Calculate scores
                scores = calculate_scores(normalized)
                
                # 4. Populate Resume fields
                resume.resume_json = json.dumps(normalized)
                resume.canonical_hash = canonical_hash
                resume.ats_score = scores["ats_score"]
                resume.scoring_version = "v1"
                resume.prompt_version = "v1"
                
                # 5. Check for and update associated health analysis report
                health_report = (
                    db.query(ResumeHealthAnalysis)
                    .filter(ResumeHealthAnalysis.resume_id == resume.id)
                    .first()
                )
                if health_report:
                    print(f"  Found health report ID: {health_report.id}. Syncing scores...")
                    health_report.ats_score = scores["ats_score"]
                    health_report.resume_health_score = scores["resume_health_score"]
                    health_report.formatting_score = scores["formatting_score"]
                    health_report.readability_score = scores["readability_score"]
                    health_report.skills_coverage = scores["skills_coverage"]
                    health_report.experience_quality = scores["experience_quality"]
                    health_report.projects_quality = scores["projects_quality"]
                    health_report.education_quality = scores["education_quality"]
                    health_report.keyword_optimization = scores["keyword_optimization"]
                    health_report.grammar_writing = scores["grammar_writing"]
                    health_report.section_completeness = scores["section_completeness"]
                    health_report.recruiter_readiness = scores["recruiter_readiness"]
                    health_report.canonical_hash = canonical_hash
                    health_report.scoring_version = "v1"
                    health_report.prompt_version = "v1"
                else:
                    print(f"  No existing health report found.")
                
                backfilled_count += 1
                
            except Exception as e:
                print(f"  Error processing resume {resume.id}: {e}")
                error_count += 1
        
        db.commit()
        print(f"\n--- Backfill Summary ---")
        print(f"Successfully processed and updated: {backfilled_count} resumes")
        print(f"Errors encountered: {error_count}")
        
    except Exception as e:
        db.rollback()
        print(f"Fatal error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    backfill()
