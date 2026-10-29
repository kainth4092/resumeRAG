import argparse
import json
import logging
import os
import sys

# Add parent directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import SessionLocal
from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text
from app.resume.services.resume_scoring_service import calculate_scores
import hashlib

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("backfill")


def backfill(dry_run: bool = True):
    db = SessionLocal()
    mode_str = "[DRY-RUN]" if dry_run else "[LIVE UPDATE]"
    logger.info("%s Starting ResumeDoc v1 backfill...", mode_str)

    try:
        resumes = db.query(Resume).all()
        logger.info("Found %d resumes to process.", len(resumes))

        backfilled_count = 0
        error_count = 0

        for resume in resumes:
            try:
                # 1. Parse or load resume_json
                raw_data = None
                if resume.resume_json:
                    try:
                        raw_data = json.loads(resume.resume_json)
                    except json.JSONDecodeError:
                        raw_data = None

                # 2. Coerce to strict ResumeDoc v1 via boundary adapter
                doc = to_resume_doc(raw_data if isinstance(raw_data, dict) else {})

                # If doc is empty but parsed_text exists, parse from text
                if not doc.contact.name and not doc.experience and not doc.skills and resume.parsed_text:
                    from app.resume.services.resume_parsing_pipeline import parse_resume_pipeline
                    logger.info("  Resume id=%d: parsing from raw parsed_text...", resume.id)
                    doc, warnings = parse_resume_pipeline(resume.parsed_text)
                    if warnings and not dry_run:
                        resume.parse_warnings = json.dumps(warnings)

                scores = calculate_scores(doc)
                text_repr = resume_doc_to_text(doc)
                content_hash = hashlib.sha256(text_repr.encode("utf-8")).hexdigest()

                logger.info(
                    "  Resume id=%d ('%s'): contact=%s skills=%d exp=%d edu=%d score=%d",
                    resume.id,
                    resume.title,
                    doc.contact.name,
                    len(doc.skills),
                    len(doc.experience),
                    len(doc.education),
                    scores.get("ats_score", 0),
                )

                if not dry_run:
                    resume.resume_json = doc.model_dump_json()
                    resume.canonical_hash = content_hash
                    resume.content_hash = content_hash
                    resume.ats_score = scores.get("ats_score", resume.ats_score)
                    resume.skills = ",".join(doc.skills)
                    resume.scoring_version = "v1"
                    resume.prompt_version = "v1"

                    health_report = (
                        db.query(ResumeHealthAnalysis)
                        .filter(ResumeHealthAnalysis.resume_id == resume.id)
                        .first()
                    )
                    if health_report:
                        health_report.ats_score = scores.get("ats_score", 75)
                        health_report.canonical_hash = content_hash
                        health_report.scoring_version = "v1"

                backfilled_count += 1
            except Exception as e:
                logger.error("  Error processing resume id=%d: %s", resume.id, e)
                error_count += 1

        if not dry_run:
            db.commit()
            logger.info("Changes committed to database successfully.")
        else:
            logger.info("%s Dry run completed. No database changes were made.", mode_str)

        logger.info("\n--- Summary ---")
        logger.info("Processed: %d resumes", backfilled_count)
        logger.info("Errors: %d", error_count)

    except Exception as e:
        db.rollback()
        logger.exception("Fatal error during backfill: %s", e)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill existing resume_json to ResumeDoc v1")
    parser.add_argument(
        "--live",
        action="store_true",
        help="Apply changes to the database (defaults to dry-run without this flag)",
    )
    args = parser.parse_args()
    backfill(dry_run=not args.live)
