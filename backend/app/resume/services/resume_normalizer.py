import hashlib
import json
import re

CANONICAL_SCHEMA_KEYS = {
    "contact": [
        "name",
        "email",
        "phone",
        "location",
        "linkedin",
        "github",
        "portfolio",
    ],
    "headline": "",
    "summary": "",
    "skills": [],
    "experience": [],
    "projects": [],
    "education": [],
    "certifications": [],
    "achievements": [],
    "languages": [],
    "publications": [],
    "volunteer_experience": [],
}


def clean_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple spaces and trim
    text = re.sub(r"[ \t]+", " ", text)
    # Remove duplicate blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def normalize_bullet_char(bullet: str) -> str:
    if not bullet:
        return ""
    # Remove common bullet prefix characters: •, -, *, ▪, ◦, etc.
    bullet = clean_text(bullet)
    bullet = re.sub(r"^[•\-*▪◦\d+\.\s]+", "", bullet)
    return bullet.strip()


def coerce_to_canonical(raw_data: dict) -> dict:
    """
    Coerce a raw, unstructured or semi-structured dictionary to the canonical resume representation.
    """
    if not isinstance(raw_data, dict):
        raw_data = {}

    canonical = {
        "contact": {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
        },
        "headline": "",
        "summary": "",
        "skills": [],
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
        "achievements": [],
        "languages": [],
        "publications": [],
        "volunteer_experience": [],
    }

    # Extract Contact Info
    raw_contact = {}
    for contact_key in ["contact", "personal_info", "personal"]:
        if contact_key in raw_data and isinstance(raw_data[contact_key], dict):
            raw_contact = raw_data[contact_key]
            break

    # If contact is flat in raw_data, fall back
    c_name = (
        raw_contact.get("name")
        or raw_contact.get("full_name")
        or raw_contact.get("fullName")
        or raw_data.get("full_name")
        or raw_data.get("name")
        or ""
    )
    c_email = raw_contact.get("email") or raw_data.get("email") or ""
    c_phone = (
        raw_contact.get("phone")
        or raw_contact.get("phone_number")
        or raw_data.get("phone")
        or ""
    )
    c_loc = (
        raw_contact.get("location")
        or raw_contact.get("city")
        or raw_contact.get("address")
        or raw_data.get("location")
        or ""
    )
    c_li = (
        raw_contact.get("linkedin")
        or raw_contact.get("linkedin_url")
        or raw_data.get("linkedin_url")
        or ""
    )
    c_gh = (
        raw_contact.get("github")
        or raw_contact.get("github_url")
        or raw_data.get("github_url")
        or ""
    )
    c_port = (
        raw_contact.get("portfolio")
        or raw_contact.get("portfolio_url")
        or raw_contact.get("website")
        or raw_contact.get("website_url")
        or raw_data.get("portfolio_url")
        or ""
    )

    canonical["contact"]["name"] = str(c_name)
    canonical["contact"]["email"] = str(c_email)
    canonical["contact"]["phone"] = str(c_phone)
    canonical["contact"]["location"] = str(c_loc)
    canonical["contact"]["linkedin"] = str(c_li)
    canonical["contact"]["github"] = str(c_gh)
    canonical["contact"]["portfolio"] = str(c_port)

    # Headline and Summary
    canonical["headline"] = str(
        raw_data.get("headline")
        or raw_contact.get("title")
        or raw_data.get("title")
        or ""
    )

    raw_summary = raw_data.get("summary") or ""
    if isinstance(raw_summary, dict):
        raw_summary = raw_summary.get("text") or raw_summary.get("summary") or ""
    canonical["summary"] = str(raw_summary)

    # Skills
    raw_skills = raw_data.get("skills") or []
    if isinstance(raw_skills, list):
        for s in raw_skills:
            if isinstance(s, dict):
                s_name = s.get("name") or s.get("skill") or ""
                canonical["skills"].append(str(s_name))

            elif s:
                canonical["skills"].append(str(s))
    elif isinstance(raw_skills, str):
        canonical["skills"] = [
            item.strip() for item in raw_skills.split(",") if item.strip()
        ]

    # Experience
    raw_exp = raw_data.get("experience") or raw_data.get("experiences") or []
    if isinstance(raw_exp, list):
        for exp in raw_exp:
            if not isinstance(exp, dict):
                continue

            # Combine duration or month/year
            start_date = exp.get("start_date") or ""
            if not start_date:
                s_month = exp.get("start_month") or exp.get("startMonth") or ""
                s_year = exp.get("start_year") or exp.get("startYear") or ""
                if s_month or s_year:
                    start_date = f"{s_month} {s_year}".strip()

            end_date = exp.get("end_date") or exp.get("duration") or ""
            if not end_date:
                e_month = exp.get("end_month") or exp.get("endMonth") or ""
                e_year = exp.get("end_year") or exp.get("endYear") or ""
                if e_month or e_year:
                    end_date = f"{e_month} {e_year}".strip()
                elif exp.get("currently_working") or exp.get("current"):
                    end_date = "Present"

            # Bullets/description
            bullets = []
            desc = exp.get("bullets") or exp.get("description") or []
            if isinstance(desc, list):
                bullets = [str(b) for b in desc if b]
            elif isinstance(desc, str):
                bullets = [item.strip() for item in desc.split("\n") if item.strip()]

            canonical["experience"].append(
                {
                    "company": str(
                        exp.get("company")
                        or exp.get("company_name")
                        or exp.get("employer")
                        or ""
                    ),
                    "role": str(
                        exp.get("role")
                        or exp.get("title")
                        or exp.get("job_title")
                        or ""
                    ),
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                    "currently_working": bool(
                        exp.get("currently_working") or exp.get("current") or False
                    ),
                    "location": str(exp.get("location") or ""),
                    "bullets": bullets,
                }
            )

    # Projects
    raw_proj = raw_data.get("projects") or raw_data.get("user_projects") or []
    if isinstance(raw_proj, list):
        for proj in raw_proj:
            if not isinstance(proj, dict):
                continue

            tech = (
                proj.get("technologies")
                or proj.get("tech")
                or proj.get("tech_stack")
                or []
            )
            if isinstance(tech, str):
                tech = [t.strip() for t in tech.split(",") if t.strip()]
            elif isinstance(tech, list):
                tech = [str(t) for t in tech if t]

            desc = proj.get("description") or proj.get("desc") or ""
            if isinstance(desc, list):
                desc = "\n".join([str(d) for d in desc])

            canonical["projects"].append(
                {
                    "title": str(proj.get("title") or proj.get("name") or ""),
                    "description": str(desc),
                    "technologies": tech,
                    "github_url": str(
                        proj.get("github_url") or proj.get("github") or ""
                    ),
                    "live_url": str(
                        proj.get("live_url")
                        or proj.get("live")
                        or proj.get("url")
                        or ""
                    ),
                }
            )

    # Education
    raw_edu = raw_data.get("education") or raw_data.get("education_history") or []
    if isinstance(raw_edu, list):
        for edu in raw_edu:
            if not isinstance(edu, dict):
                continue

            start_date = (
                edu.get("start_date")
                or edu.get("start_year")
                or edu.get("startYear")
                or ""
            )
            end_date = (
                edu.get("end_date") or edu.get("end_year") or edu.get("endYear") or ""
            )

            canonical["education"].append(
                {
                    "institution": str(
                        edu.get("institution")
                        or edu.get("school")
                        or edu.get("university")
                        or ""
                    ),
                    "degree": str(edu.get("degree") or edu.get("major") or ""),
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                    "location": str(edu.get("location") or ""),
                }
            )

    # Extra lists
    for field in [
        "certifications",
        "achievements",
        "languages",
        "publications",
        "volunteer_experience",
    ]:
        val = raw_data.get(field) or []
        if isinstance(val, list):
            canonical[field] = [str(v) for v in val if v]
        elif isinstance(val, str):
            canonical[field] = [item.strip() for item in val.split(",") if item.strip()]

    return canonical


def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def normalize_url(url: str) -> str:
    if not url:
        return ""
    url = url.lower().strip()
    url = re.sub(r"^https?://(www\.)?", "", url)
    url = re.sub(r"^www\.", "", url)
    return url.rstrip("/")


def normalize_resume(resume: dict) -> dict:
    """
    Applies standard normalization rules to a canonical resume object.
    """
    # First coerce to ensure structure
    resume = coerce_to_canonical(resume)

    # Normalize Contact
    # Preserve original casing for name and location (display fields)
    resume["contact"]["name"] = clean_text(resume["contact"]["name"])
    resume["contact"]["email"] = clean_text(resume["contact"]["email"]).lower()
    resume["contact"]["phone"] = normalize_phone(resume["contact"]["phone"])
    resume["contact"]["location"] = clean_text(resume["contact"]["location"])
    resume["contact"]["linkedin"] = normalize_url(resume["contact"]["linkedin"])
    resume["contact"]["github"] = normalize_url(resume["contact"]["github"])
    resume["contact"]["portfolio"] = normalize_url(resume["contact"]["portfolio"])

    # Normalize headline and summary
    resume["headline"] = clean_text(resume["headline"])
    resume["summary"] = clean_text(resume["summary"])

    # Normalize Skills - preserve original casing for display, dedup case-insensitively
    skills_cleaned = []
    seen_skills = set()
    for skill in resume["skills"]:
        cleaned = clean_text(skill)
        if cleaned:
            dedup_key = cleaned.lower()
            if dedup_key not in seen_skills:
                seen_skills.add(dedup_key)
                skills_cleaned.append(cleaned)

    # Sort skills alphabetically (case-insensitive)
    resume["skills"] = sorted(skills_cleaned, key=lambda s: s.lower())

    # Normalize Experience
    for exp in resume["experience"]:
        exp["company"] = clean_text(exp["company"])
        exp["role"] = clean_text(exp["role"])
        exp["start_date"] = clean_text(exp["start_date"])
        exp["end_date"] = clean_text(exp["end_date"])
        exp["location"] = clean_text(exp["location"])

        # Normalize bullets: deduplicate, clean spacing, normalize prefix char
        bullets_cleaned = []
        seen_bullets = set()
        for b in exp["bullets"]:
            cleaned = clean_text(b)
            cleaned = normalize_bullet_char(cleaned)
            if cleaned:
                if cleaned not in seen_bullets:
                    seen_bullets.add(cleaned)
                    bullets_cleaned.append(cleaned)
        exp["bullets"] = bullets_cleaned

    # Normalize Projects
    for proj in resume["projects"]:
        proj["title"] = clean_text(proj["title"])
        proj["description"] = clean_text(proj["description"])
        proj["github_url"] = normalize_url(proj["github_url"])
        proj["live_url"] = normalize_url(proj["live_url"])

        # Technologies: trim, lowercase-dedup, sort alphabetically
        tech_cleaned = []
        seen_tech = set()
        for t in proj["technologies"]:
            cleaned = clean_text(t).lower()
            if cleaned:
                if cleaned not in seen_tech:
                    seen_tech.add(cleaned)
                    tech_cleaned.append(cleaned)
        proj["technologies"] = sorted(tech_cleaned)

    # Normalize Education
    for edu in resume["education"]:
        edu["institution"] = clean_text(edu["institution"])
        edu["degree"] = clean_text(edu["degree"])
        edu["start_date"] = clean_text(edu["start_date"])
        edu["end_date"] = clean_text(edu["end_date"])
        edu["location"] = clean_text(edu["location"])

    # Extra lists: clean, sort alphabetically
    for field in [
        "certifications",
        "achievements",
        "languages",
        "publications",
        "volunteer_experience",
    ]:
        items_cleaned = []
        seen_items = set()
        for item in resume[field]:
            cleaned = clean_text(item)
            if cleaned:
                key = cleaned.lower()
                if key not in seen_items:
                    seen_items.add(key)
                    items_cleaned.append(cleaned)
        resume[field] = sorted(items_cleaned)

    return resume


def get_canonical_hash(resume: dict) -> str:
    """
    Serializes a normalized canonical resume dict into a stable, deterministic JSON and hashes it.
    """
    def make_hashable(val):
        if isinstance(val, dict):
            return {k: make_hashable(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [make_hashable(v) for v in val]
        elif isinstance(val, str):
            return val.lower().strip()
        return val

    hashable_resume = make_hashable(resume)
    serialized = json.dumps(
        hashable_resume, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def canonical_resume_to_text(resume: dict) -> str:
    """
    Serializes a canonical resume object to identical plain text format.
    """
    lines = []
    contact = resume.get("contact", {})
    lines.append(f"Name: {contact.get('name', '').strip()}")
    lines.append(f"Email: {contact.get('email', '').strip()}")
    lines.append(f"Phone: {contact.get('phone', '').strip()}")
    lines.append(f"Location: {contact.get('location', '').strip()}")
    lines.append(f"LinkedIn: {contact.get('linkedin', '').strip()}")
    lines.append(f"GitHub: {contact.get('github', '').strip()}")
    lines.append(f"Portfolio: {contact.get('portfolio', '').strip()}")
    lines.append(f"Headline: {resume.get('headline', '').strip()}")
    lines.append(f"Summary: {resume.get('summary', '').strip()}")
    lines.append("")

    skills = resume.get("skills", [])
    if skills:
        lines.append("Skills:")
        lines.append(", ".join(skills))
        lines.append("")

    experience = resume.get("experience", [])
    if experience:
        lines.append("Experience:")
        for exp in experience:
            lines.append(f"Company: {exp.get('company', '').strip()}")
            lines.append(f"Role: {exp.get('role', '').strip()}")
            lines.append(f"Location: {exp.get('location', '').strip()}")
            lines.append(
                f"Duration: {exp.get('start_date', '').strip()} - {exp.get('end_date', '').strip()}"
                + (" (Present)" if exp.get("currently_working") else "")
            )
            bullets = exp.get("bullets", [])
            if bullets:
                lines.append("Description:")
                for bullet in bullets:
                    lines.append(f"- {bullet.strip()}")
            lines.append("")

    projects = resume.get("projects", [])
    if projects:
        lines.append("Projects:")
        for proj in projects:
            lines.append(f"Title: {proj.get('title', '').strip()}")
            tech = proj.get("technologies", [])
            if tech:
                lines.append(f"Technologies: {', '.join(tech)}")
            lines.append(f"Description: {proj.get('description', '').strip()}")
            if proj.get("github_url"):
                lines.append(f"GitHub: {proj.get('github_url', '').strip()}")
            if proj.get("live_url"):
                lines.append(f"Live: {proj.get('live_url', '').strip()}")
            lines.append("")

    education = resume.get("education", [])
    if education:
        lines.append("Education:")
        for edu in education:
            lines.append(f"Institution: {edu.get('institution', '').strip()}")
            lines.append(f"Degree: {edu.get('degree', '').strip()}")
            lines.append(f"Location: {edu.get('location', '').strip()}")
            lines.append(
                f"Duration: {edu.get('start_date', '').strip()} - {edu.get('end_date', '').strip()}"
            )
            lines.append("")

    for extra_field in [
        "certifications",
        "achievements",
        "languages",
        "publications",
        "volunteer_experience",
    ]:
        items = resume.get(extra_field, [])
        if items:
            lines.append(f"{extra_field.replace('_', ' ').title()}:")
            for item in items:
                lines.append(f"- {item.strip()}")
            lines.append("")

    text = "\n".join(lines)
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    return text.strip()
