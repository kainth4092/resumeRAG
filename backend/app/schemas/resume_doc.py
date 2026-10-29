import re
from typing import Any
from pydantic import BaseModel, Field, field_validator


class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""

    @field_validator("name", "email", "phone", "location", "linkedin", "github", "portfolio", mode="before")
    @classmethod
    def clean_str(cls, v: Any) -> str:
        return str(v).strip() if v is not None else ""


class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    location: str = ""
    start: str | None = None  # YYYY-MM | YYYY | null
    end: str | None = None
    current: bool = False
    bullets: list[str] = Field(default_factory=list)

    @field_validator("company", "role", "location", mode="before")
    @classmethod
    def clean_str(cls, v: Any) -> str:
        return str(v).strip() if v is not None else ""

    @field_validator("start", "end", mode="before")
    @classmethod
    def clean_date(cls, v: Any) -> str | None:
        if v is None:
            return None
        s = str(v).strip()
        if not s or s.lower() in ("null", "none", "present", "current"):
            return None
        return s

    @field_validator("bullets", mode="before")
    @classmethod
    def clean_bullets(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            lines = [re.sub(r"^[•\-*▪◦\d+\.\s]+", "", line).strip() for line in v.splitlines()]
            return [line for line in lines if line]
        if isinstance(v, list):
            res = []
            for item in v:
                cleaned = re.sub(r"^[•\-*▪◦\d+\.\s]+", "", str(item)).strip()
                if cleaned:
                    res.append(cleaned)
            return res
        return []


class ProjectItem(BaseModel):
    title: str = ""
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    github_url: str = ""
    live_url: str = ""

    @field_validator("title", "github_url", "live_url", mode="before")
    @classmethod
    def clean_str(cls, v: Any) -> str:
        return str(v).strip() if v is not None else ""

    @field_validator("bullets", mode="before")
    @classmethod
    def clean_bullets(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            lines = [re.sub(r"^[•\-*▪◦\d+\.\s]+", "", line).strip() for line in v.splitlines()]
            return [line for line in lines if line]
        if isinstance(v, list):
            res = []
            for item in v:
                cleaned = re.sub(r"^[•\-*▪◦\d+\.\s]+", "", str(item)).strip()
                if cleaned:
                    res.append(cleaned)
            return res
        return []

    @field_validator("technologies", mode="before")
    @classmethod
    def clean_tech(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            parts = re.split(r"[,|;/•·]", v)
            return [p.strip() for p in parts if p.strip()]
        if isinstance(v, list):
            return [str(p).strip() for p in v if str(p).strip()]
        return []


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    start: str | None = None
    end: str | None = None
    grade: str = ""

    @field_validator("institution", "degree", "grade", mode="before")
    @classmethod
    def clean_str(cls, v: Any) -> str:
        return str(v).strip() if v is not None else ""

    @field_validator("start", "end", mode="before")
    @classmethod
    def clean_date(cls, v: Any) -> str | None:
        if v is None:
            return None
        s = str(v).strip()
        if not s or s.lower() in ("null", "none"):
            return None
        return s


class ResumeDoc(BaseModel):
    schema_version: int = 1
    contact: ContactInfo = Field(default_factory=ContactInfo)
    headline: str = ""
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)

    @field_validator("headline", "summary", mode="before")
    @classmethod
    def clean_text(cls, v: Any) -> str:
        return str(v).strip() if v is not None else ""

    @field_validator("skills", "certifications", "achievements", "languages", mode="before")
    @classmethod
    def clean_str_list(cls, v: Any) -> list[str]:
        if not v:
            return []
        if isinstance(v, str):
            parts = re.split(r"[,|;\n•·]", v)
            items = [p.strip() for p in parts if p.strip()]
        elif isinstance(v, list):
            items = []
            for item in v:
                if isinstance(item, dict):
                    name = item.get("name") or item.get("title") or item.get("skill") or ""
                    if name:
                        items.append(str(name).strip())
                else:
                    s = str(item).strip()
                    if s:
                        items.append(s)
        else:
            items = []
        # Deduplicate while preserving order (case-insensitive deduplication)
        seen = set()
        deduped = []
        for it in items:
            key = it.lower()
            if key not in seen:
                seen.add(key)
                deduped.append(it)
        return deduped


def to_resume_doc(data: Any) -> ResumeDoc:
    """
    Universal boundary adapter: converts any incoming resume dictionary (legacy,
    generator personal_info shape, editor shape, or already-valid ResumeDoc)
    into a strict ResumeDoc v1 instance.
    """
    if isinstance(data, ResumeDoc):
        return data

    if not isinstance(data, dict):
        return ResumeDoc()

    # Unwrap nested "resume" if present
    r = data.get("resume") if isinstance(data.get("resume"), dict) else data

    # 1. Contact Info
    raw_contact = (
        r.get("contact")
        or r.get("personal_info")
        or r.get("personal")
        or {}
    )
    if not isinstance(raw_contact, dict):
        raw_contact = {}

    contact = ContactInfo(
        name=raw_contact.get("name") or raw_contact.get("full_name") or r.get("name") or "",
        email=raw_contact.get("email") or r.get("email") or "",
        phone=raw_contact.get("phone") or raw_contact.get("phone_number") or r.get("phone") or "",
        location=raw_contact.get("location") or raw_contact.get("address") or r.get("location") or "",
        linkedin=raw_contact.get("linkedin") or raw_contact.get("linkedin_url") or "",
        github=raw_contact.get("github") or raw_contact.get("github_url") or "",
        portfolio=raw_contact.get("portfolio") or raw_contact.get("portfolio_url") or raw_contact.get("website") or "",
    )

    # 2. Headline & Summary
    headline = r.get("headline") or raw_contact.get("title") or r.get("title") or r.get("role") or ""
    summary_raw = r.get("summary")
    if isinstance(summary_raw, dict):
        summary = summary_raw.get("text") or summary_raw.get("summary") or ""
    else:
        summary = str(summary_raw or "")

    # 3. Skills
    skills_raw = r.get("skills") or []
    skills = []
    if isinstance(skills_raw, list):
        for s in skills_raw:
            if isinstance(s, dict):
                val = s.get("name") or s.get("skill") or s.get("title") or ""
                if val:
                    skills.append(str(val))
            elif isinstance(s, str) and s.strip():
                skills.append(s.strip())
    elif isinstance(skills_raw, str):
        skills = [p.strip() for p in re.split(r"[,|;\n]", skills_raw) if p.strip()]

    # 4. Experience
    exp_list = r.get("experience") or r.get("work_experience") or []
    experience = []
    if isinstance(exp_list, list):
        for e in exp_list:
            if not isinstance(e, dict):
                continue
            # Bullets can be under 'bullets' or 'description'
            bullets = e.get("bullets") or e.get("description") or []
            if isinstance(bullets, str):
                bullets = [b.strip() for b in bullets.splitlines() if b.strip()]
            elif not isinstance(bullets, list):
                bullets = [str(bullets)] if bullets else []

            # Determine start / end dates
            start = e.get("start") or e.get("start_date") or e.get("startYear") or e.get("start_year")
            end = e.get("end") or e.get("end_date") or e.get("endYear") or e.get("end_year")
            is_current = bool(
                e.get("current")
                or e.get("currently_working")
                or str(end).strip().lower() in ("present", "current", "now")
            )
            if is_current:
                end = None

            # Handle duration string if start/end absent (e.g. "2020 - 2022")
            if not start and not end and e.get("duration"):
                dur_str = str(e["duration"])
                parts = re.split(r"[–—-]", dur_str)
                if len(parts) >= 2:
                    start = parts[0].strip()
                    end_val = parts[1].strip()
                    if end_val.lower() in ("present", "current", "now"):
                        is_current = True
                        end = None
                    else:
                        end = end_val
                elif len(parts) == 1 and parts[0].strip():
                    start = parts[0].strip()

            experience.append(
                ExperienceItem(
                    company=e.get("company") or e.get("employer") or e.get("organization") or "",
                    role=e.get("role") or e.get("title") or e.get("position") or "",
                    location=e.get("location") or "",
                    start=str(start) if start else None,
                    end=str(end) if end else None,
                    current=is_current,
                    bullets=bullets,
                )
            )

    # 5. Projects
    proj_list = r.get("projects") or r.get("user_projects") or []
    projects = []
    if isinstance(proj_list, list):
        for p in proj_list:
            if not isinstance(p, dict):
                continue
            title = p.get("title") or p.get("name") or p.get("project_name") or ""
            bullets = p.get("bullets") or p.get("description") or p.get("desc") or []
            if isinstance(bullets, str):
                bullets = [b.strip() for b in bullets.splitlines() if b.strip()]
            elif not isinstance(bullets, list):
                bullets = [str(bullets)] if bullets else []

            tech = p.get("technologies") or p.get("tech") or p.get("skills") or []
            if isinstance(tech, str):
                tech = [t.strip() for t in re.split(r"[,|;/•·]", tech) if t.strip()]

            projects.append(
                ProjectItem(
                    title=title,
                    bullets=bullets,
                    technologies=tech,
                    github_url=p.get("github_url") or p.get("github") or p.get("url") or "",
                    live_url=p.get("live_url") or p.get("live") or p.get("demo") or "",
                )
            )

    # 6. Education
    edu_list = r.get("education") or r.get("user_education") or []
    education = []
    if isinstance(edu_list, list):
        for ed in edu_list:
            if not isinstance(ed, dict):
                continue
            start = ed.get("start") or ed.get("start_date") or ed.get("start_year") or ed.get("startYear")
            end = ed.get("end") or ed.get("end_date") or ed.get("end_year") or ed.get("endYear")
            education.append(
                EducationItem(
                    institution=ed.get("institution") or ed.get("school") or ed.get("university") or ed.get("college") or "",
                    degree=ed.get("degree") or ed.get("major") or ed.get("field_of_study") or "",
                    start=str(start) if start else None,
                    end=str(end) if end else None,
                    grade=ed.get("grade") or ed.get("gpa") or ed.get("cgpa") or "",
                )
            )

    # 7. Other sections
    certifications = r.get("certifications") or []
    achievements = r.get("achievements") or r.get("awards") or []
    languages = r.get("languages") or []

    return ResumeDoc(
        schema_version=1,
        contact=contact,
        headline=headline,
        summary=summary,
        skills=skills,
        experience=experience,
        projects=projects,
        education=education,
        certifications=certifications,
        achievements=achievements,
        languages=languages,
    )


def resume_doc_to_text(doc: ResumeDoc) -> str:
    """Converts a ResumeDoc into clear, structured plain text suitable for LLM context or text parsing."""
    lines = []
    if doc.contact.name:
        lines.append(f"NAME: {doc.contact.name}")
    contact_parts = [
        doc.contact.email,
        doc.contact.phone,
        doc.contact.location,
        doc.contact.linkedin,
        doc.contact.github,
        doc.contact.portfolio,
    ]
    contact_str = " | ".join([p for p in contact_parts if p])
    if contact_str:
        lines.append(f"CONTACT: {contact_str}")

    if doc.headline:
        lines.append(f"\nHEADLINE: {doc.headline}")
    if doc.summary:
        lines.append(f"\nSUMMARY:\n{doc.summary}")
    if doc.skills:
        lines.append(f"\nSKILLS: {', '.join(doc.skills)}")

    if doc.experience:
        lines.append("\nEXPERIENCE:")
        for idx, exp in enumerate(doc.experience, start=1):
            date_range = exp.start or ""
            if exp.current:
                date_range = f"{date_range} - Present".strip(" -")
            elif exp.end:
                date_range = f"{date_range} - {exp.end}".strip(" -")

            header = f"{idx}. {exp.role} at {exp.company}"
            if exp.location:
                header += f" ({exp.location})"
            if date_range:
                header += f" [{date_range}]"
            lines.append(header)
            for b in exp.bullets:
                lines.append(f"  • {b}")

    if doc.projects:
        lines.append("\nPROJECTS:")
        for idx, proj in enumerate(doc.projects, start=1):
            header = f"{idx}. {proj.title}"
            if proj.technologies:
                header += f" (Tech: {', '.join(proj.technologies)})"
            lines.append(header)
            if proj.github_url or proj.live_url:
                links = [link for link in (proj.github_url, proj.live_url) if link]
                lines.append(f"   Links: {' | '.join(links)}")
            for b in proj.bullets:
                lines.append(f"  • {b}")

    if doc.education:
        lines.append("\nEDUCATION:")
        for idx, edu in enumerate(doc.education, start=1):
            date_range = edu.start or ""
            if edu.end:
                date_range = f"{date_range} - {edu.end}".strip(" -")
            line = f"{idx}. {edu.degree} from {edu.institution}"
            if date_range:
                line += f" [{date_range}]"
            if edu.grade:
                line += f" (Grade: {edu.grade})"
            lines.append(line)

    if doc.certifications:
        lines.append(f"\nCERTIFICATIONS: {', '.join(doc.certifications)}")
    if doc.achievements:
        lines.append(f"\nACHIEVEMENTS: {', '.join(doc.achievements)}")
    if doc.languages:
        lines.append(f"\nLANGUAGES: {', '.join(doc.languages)}")

    return "\n".join(lines)
