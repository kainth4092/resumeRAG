import difflib
import logging
import re
from typing import Tuple

from app.schemas.resume_doc import ResumeDoc, to_resume_doc
from app.services.llm_service import llm_json

logger = logging.getLogger(__name__)


def verify_fuzzy_in_text(target: str, source_text_lower: str, threshold: float = 0.85) -> bool:
    """
    Checks if target string appears in source text either as exact substring
    or with fuzzy similarity >= threshold using a sliding window.
    """
    if not target or not target.strip():
        return True
    target_clean = " ".join(target.lower().split())
    if not target_clean:
        return True
    if target_clean in source_text_lower:
        return True

    words = target_clean.split()
    target_len = len(words)
    source_words = source_text_lower.split()
    if not source_words:
        return False

    # Check sliding window of target_len to target_len + 2 words
    for w_len in (target_len, target_len + 1):
        if w_len > len(source_words):
            continue
        for i in range(len(source_words) - w_len + 1):
            window = " ".join(source_words[i : i + w_len])
            ratio = difflib.SequenceMatcher(None, target_clean, window).ratio()
            if ratio >= threshold:
                return True

    return False


def verify_parsed_resume(doc: ResumeDoc, raw_text: str) -> Tuple[ResumeDoc, list[str]]:
    """
    Deterministic verification (Step 3):
    Emails, phones, URLs, and every company/institution/degree string must be
    found (fuzzy >= 0.85) in the source text, otherwise dropped or flagged into parse_warnings.
    """
    warnings: list[str] = []
    text_lower = raw_text.lower()
    raw_digits = re.sub(r"\D", "", raw_text)

    # 1. Contact verification
    # Email
    if doc.contact.email:
        email_clean = doc.contact.email.lower().strip()
        if email_clean not in text_lower:
            warnings.append(f"Email '{doc.contact.email}' was not found in source text and was removed.")
            doc.contact.email = ""

    # Phone
    if doc.contact.phone:
        phone_digits = re.sub(r"\D", "", doc.contact.phone)
        if len(phone_digits) >= 7 and phone_digits not in raw_digits:
            warnings.append(f"Phone '{doc.contact.phone}' was not verified against source text and was removed.")
            doc.contact.phone = ""

    # URLs
    for url_field, url_name in (
        ("linkedin", "LinkedIn URL"),
        ("github", "GitHub URL"),
        ("portfolio", "Portfolio URL"),
    ):
        val = getattr(doc.contact, url_field, "")
        if val:
            # Check either username or core part of URL in source text
            cleaned_val = re.sub(r"^https?://(www\.)?", "", val.lower()).strip("/")
            if cleaned_val and cleaned_val not in text_lower:
                # Also check domain-stripped handle
                handle = cleaned_val.split("/")[-1]
                if not handle or handle not in text_lower:
                    warnings.append(f"{url_name} '{val}' was not found in source text and was removed.")
                    setattr(doc.contact, url_field, "")

    # 2. Experience verification
    verified_exp = []
    for exp in doc.experience:
        company_ok = verify_fuzzy_in_text(exp.company, text_lower, threshold=0.85)
        role_ok = verify_fuzzy_in_text(exp.role, text_lower, threshold=0.85) if exp.role else True

        if not company_ok:
            warnings.append(f"Experience at '{exp.company}' ({exp.role}) could not be verified in source text.")
        else:
            if not role_ok and exp.role:
                warnings.append(f"Role '{exp.role}' for company '{exp.company}' had low confidence match.")
            verified_exp.append(exp)
    doc.experience = verified_exp

    # 3. Education verification
    verified_edu = []
    for edu in doc.education:
        inst_ok = verify_fuzzy_in_text(edu.institution, text_lower, threshold=0.85)
        deg_ok = verify_fuzzy_in_text(edu.degree, text_lower, threshold=0.85) if edu.degree else True

        if not inst_ok and not deg_ok:
            warnings.append(f"Education '{edu.degree}' at '{edu.institution}' could not be verified in source text.")
        else:
            verified_edu.append(edu)
    doc.education = verified_edu

    return doc, warnings


def parse_resume_pipeline(raw_text: str) -> Tuple[ResumeDoc, list[str]]:
    """
    Executes the 5-step reliable resume parsing pipeline:
    (1) Text passed in from PDF/DOCX extractors.
    (2) LLM structured extraction via llm_json(ResumeDoc, temperature 0).
    (3) Deterministic verification: emails/phones/URLs and company/institution/degree
        fuzzy match >= 0.85 in source text; unverified items dropped and recorded in parse_warnings.
    (4) Fall back to local_resume_parser if LLM fails.
    (5) Returns (ResumeDoc, warnings_list).
    """
    if not raw_text or not raw_text.strip():
        return ResumeDoc(), ["Resume text is empty."]

    clean_source = raw_text.strip()
    parse_warnings: list[str] = []

    # Step 2: LLM Structured Extraction
    system_prompt = (
        "You are an expert resume parsing engine. "
        "Extract the candidate's exact factual resume data into the provided ResumeDoc JSON schema. "
        "Do not invent facts, projects, skills, companies, dates, or contact details. "
        "Extract experience bullets and project bullets accurately as lists of strings. "
        "If dates are available, format them as YYYY-MM or YYYY. If currently working, set current=true."
    )
    user_prompt = (
        f"Parse the following resume text into a strict ResumeDoc JSON object:\n\n"
        f"--- START RESUME TEXT ---\n{clean_source}\n--- END RESUME TEXT ---"
    )

    doc: ResumeDoc | None = None
    try:
        logger.info("[RESUME_PARSER_PIPELINE] Invoking LLM structured extraction via llm_json")
        doc = llm_json(
            prompt=user_prompt,
            response_model=ResumeDoc,
            feature="resume_parser",
            system_prompt=system_prompt,
            temperature=0.0,
            timeout=45.0,
        )
    except Exception as llm_err:
        logger.warning(
            "[RESUME_PARSER_PIPELINE] LLM extraction failed: %s. Falling back to local parser.",
            llm_err,
        )
        parse_warnings.append("AI extraction unavailable; parsed using deterministic local parser fallback.")

    # Step 4: Fallback to local parser if needed
    if doc is None or (not doc.contact.name and not doc.experience and not doc.skills and not doc.education):
        try:
            from app.resume.services.local_resume_parser import parse_resume_text_locally

            logger.info("[RESUME_PARSER_PIPELINE] Running local fallback parser")
            local_dict = parse_resume_text_locally(clean_source)
            doc = to_resume_doc(local_dict)
            if not parse_warnings:
                parse_warnings.append("Parsed via local parser fallback.")
        except Exception as local_err:
            logger.error("[RESUME_PARSER_PIPELINE] Local fallback parser failed: %s", local_err)
            doc = ResumeDoc()
            parse_warnings.append("Parsing failed completely; produced empty resume document.")

    # Step 3: Deterministic verification
    doc, verification_warnings = verify_parsed_resume(doc, clean_source)
    parse_warnings.extend(verification_warnings)

    return doc, parse_warnings
