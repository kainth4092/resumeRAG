import logging
import re
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


CANONICAL_EMPTY = {
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


SECTION_ALIASES = {
    "summary": {
        "SUMMARY",
        "PROFESSIONAL SUMMARY",
        "PROFILE",
        "CAREER OBJECTIVE",
        "OBJECTIVE",
        "ABOUT ME",
    },
    "skills": {
        "SKILLS",
        "TECHNICAL SKILLS",
        "CORE SKILLS",
        "CORE TECHNICAL SKILLS",
        "TECHNOLOGIES",
        "TECH STACK",
        "TECHNICAL EXPERTISE",
        "SKILLS & TECHNOLOGIES",
    },
    "experience": {
        "EXPERIENCE",
        "WORK EXPERIENCE",
        "PROFESSIONAL EXPERIENCE",
        "EMPLOYMENT HISTORY",
        "WORK HISTORY",
    },
    "projects": {
        "PROJECTS",
        "KEY PROJECTS",
        "PERSONAL PROJECTS",
        "ACADEMIC PROJECTS",
        "SELECTED PROJECTS",
    },
    "education": {
        "EDUCATION",
        "ACADEMIC BACKGROUND",
        "ACADEMIC QUALIFICATIONS",
        "EDUCATIONAL QUALIFICATIONS",
    },
    "certifications": {
        "CERTIFICATIONS",
        "CERTIFICATES",
        "COURSES",
        "LICENSES & CERTIFICATIONS",
    },
    "achievements": {
        "ACHIEVEMENTS",
        "AWARDS",
        "HONORS & AWARDS",
    },
    "languages": {
        "LANGUAGES",
    },
    "publications": {
        "PUBLICATIONS",
    },
    "volunteer_experience": {
        "VOLUNTEER EXPERIENCE",
        "VOLUNTEERING",
    },
}


PROJECT_TECH_PREFIX = re.compile(
    r"^(?:tech\s*stack|technologies|technology|tools)\s*:\s*(.+)$",
    re.IGNORECASE,
)

BULLET_PREFIX = re.compile(r"^\s*[•●▪◦○■►➢✓✔*-]\s*")

DATE_RANGE_PATTERN = re.compile(
    r"(?P<start>"
    r"(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
    r"|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    r"[a-z]*\.?\s+\d{4}"
    r"|\d{4}"
    r")"
    r"\s*(?:-|–|—|to)\s*"
    r"(?P<end>"
    r"(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
    r"|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    r"[a-z]*\.?\s+\d{4}"
    r"|\d{4}"
    r"|Present|Current"
    r")",
    re.IGNORECASE,
)


def empty_canonical() -> dict:
    return {
        "contact": dict(CANONICAL_EMPTY["contact"]),
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


def normalize_spaces(value: str) -> str:
    if not value:
        return ""

    value = value.replace("\u00a0", " ")
    value = re.sub(r"[ \t]+", " ", value)
    return value.strip()


def clean_line(value: str) -> str:
    value = normalize_spaces(value)
    value = re.sub(r"^[#*_]+", "", value)
    value = re.sub(r"[#*_]+$", "", value)
    return value.strip()


def remove_bullet(value: str) -> str:
    return BULLET_PREFIX.sub("", value).strip()


def is_bullet(value: str) -> bool:
    return bool(BULLET_PREFIX.match(value or ""))


def dedupe(values: List[str]) -> List[str]:
    output = []
    seen = set()

    for value in values:
        value = normalize_spaces(value)

        if not value:
            continue

        key = value.casefold()

        if key not in seen:
            seen.add(key)
            output.append(value)

    return output


def normalize_section_heading(line: str) -> str:
    cleaned = clean_line(line)
    cleaned = cleaned.rstrip(":").strip()
    return cleaned.upper()


def get_section_name(line: str):
    heading = normalize_section_heading(line)

    if len(heading.split()) > 5:
        return None

    for section_name, aliases in SECTION_ALIASES.items():
        if heading in aliases:
            return section_name

    return None


def segment_resume(
    resume_text: str,
) -> Tuple[List[str], Dict[str, List[str]]]:

    header_lines = []
    sections = {}
    current_section = None

    for raw_line in resume_text.splitlines():
        line = clean_line(raw_line)

        if not line:
            continue

        section_name = get_section_name(line)

        if section_name:
            current_section = section_name
            sections.setdefault(section_name, [])
            continue

        if current_section is None:
            header_lines.append(line)
        else:
            sections.setdefault(current_section, []).append(line)

    return header_lines, sections


def extract_email(text: str) -> str:
    match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text,
    )

    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    patterns = [
        r"\+91[\s-]?\d{5}[\s-]?\d{5}",
        r"\+91[\s-]?\d{10}",
        r"(?<!\d)\d{10}(?!\d)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            return normalize_spaces(match.group(0))

    return ""


def extract_urls(text: str) -> Tuple[str, str, str]:
    linkedin = ""
    github = ""
    portfolio = ""

    patterns = [
        r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_.-]+/?",
        r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_.-]+/?",
        r"(?:https?://)?(?:www\.)?[A-Za-z0-9.-]+\."
        r"(?:com|app|dev|io|me|net|org)(?:/[^\s|,]*)?",
    ]

    urls = []

    for pattern in patterns:
        urls.extend(
            re.findall(
                pattern,
                text,
                flags=re.IGNORECASE,
            )
        )

    for url in dedupe(urls):
        cleaned = url.rstrip(".,;|)")

        lowered = cleaned.lower()

        if "linkedin.com/in/" in lowered:
            linkedin = linkedin or cleaned

        elif "github.com/" in lowered:
            github = github or cleaned

        elif "@" not in cleaned:
            portfolio = portfolio or cleaned

    return linkedin, github, portfolio


def extract_name(header_lines: List[str]) -> str:
    ignored_words = {
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "developer",
        "engineer",
        "analyst",
        "manager",
        "professional",
    }

    for line in header_lines[:6]:
        cleaned = clean_line(line)

        lowered = cleaned.lower()

        if not cleaned:
            continue

        if "@" in cleaned:
            continue

        if re.search(r"\d", cleaned):
            continue

        if any(
            item in lowered
            for item in [
                "linkedin",
                "github",
                "portfolio",
                "http",
                ".com",
                ".app",
                ".dev",
            ]
        ):
            continue

        words = cleaned.split()

        if not 2 <= len(words) <= 4:
            continue

        if any(word.lower() in ignored_words for word in words):
            continue

        if all(word[0].isupper() for word in words if word):
            return cleaned

    return ""


def extract_location(
    header_lines: List[str],
    name: str,
) -> str:

    for line in header_lines[:8]:
        cleaned = clean_line(line)

        if cleaned == name:
            continue

        if (
            "@" in cleaned
            or "linkedin" in cleaned.lower()
            or "github" in cleaned.lower()
            or "portfolio" in cleaned.lower()
            or re.search(r"\d{7,}", cleaned)
        ):
            continue

        if re.search(
            r"\b[A-Za-z .'-]+,\s*[A-Za-z .'-]+" r"(?:,\s*[A-Za-z .'-]+)?\b",
            cleaned,
        ):
            return cleaned

    return ""


def extract_headline(
    header_lines: List[str],
    name: str,
    location: str,
) -> str:

    role_keywords = (
        "developer",
        "engineer",
        "analyst",
        "designer",
        "manager",
        "architect",
        "consultant",
        "specialist",
        "scientist",
        "administrator",
        "intern",
        "lead",
    )

    for line in header_lines[:10]:
        cleaned = clean_line(line)

        if cleaned in {name, location}:
            continue

        lowered = cleaned.lower()

        if any(keyword in lowered for keyword in role_keywords):
            if (
                "@" not in cleaned
                and not re.search(r"\d{5,}", cleaned)
                and len(cleaned.split()) <= 8
            ):
                return cleaned

    return ""


def parse_summary(lines: List[str]) -> str:
    output = []

    for line in lines:
        cleaned = remove_bullet(line)

        if cleaned:
            output.append(cleaned)

    return normalize_spaces(" ".join(output))


def split_skills(value: str) -> List[str]:
    return [
        normalize_spaces(skill)
        for skill in re.split(
            r"\s*(?:,|\||;|•|▪|◦)\s*",
            value,
        )
        if normalize_spaces(skill)
    ]


def parse_skills(lines: List[str]) -> List[str]:
    skills = []

    for raw_line in lines:
        line = remove_bullet(raw_line)

        if not line:
            continue

        category_match = re.match(
            r"^[A-Za-z][A-Za-z /&()+.-]{1,40}" r"(?:\s*:\s*|\s+-\s+)" r"(.+)$",
            line,
        )

        if category_match:
            line = category_match.group(1)

        for skill in split_skills(line):
            if len(skill) > 60:
                continue

            if len(skill.split()) > 7:
                continue

            skills.append(skill)

    return dedupe(skills)


def parse_experience(lines: List[str]) -> List[dict]:
    if not lines:
        return []

    entries = []
    index = 0

    while index < len(lines):
        role_line = clean_line(lines[index])

        if not role_line or is_bullet(lines[index]):
            index += 1
            continue

        company_line = ""

        if index + 1 < len(lines):
            next_line = clean_line(lines[index + 1])

            if not is_bullet(lines[index + 1]) and (
                DATE_RANGE_PATTERN.search(next_line) or "|" in next_line
            ):
                company_line = next_line

        if not company_line:
            index += 1
            continue

        date_match = DATE_RANGE_PATTERN.search(company_line)

        start_date = ""
        end_date = ""
        currently_working = False

        if date_match:
            start_date = date_match.group("start")
            end_date = date_match.group("end")

            currently_working = end_date.lower() in {"present", "current"}

        company_location = company_line.split("|")[0].strip()

        company = company_location
        location = ""

        comma_parts = [
            part.strip() for part in company_location.split(",") if part.strip()
        ]

        if len(comma_parts) >= 2:
            company = comma_parts[0]
            location = ", ".join(comma_parts[1:])

        bullets = []

        index += 2

        while index < len(lines):
            current = clean_line(lines[index])

            if (
                not is_bullet(lines[index])
                and index + 1 < len(lines)
                and (
                    DATE_RANGE_PATTERN.search(clean_line(lines[index + 1]))
                    or "|" in clean_line(lines[index + 1])
                )
            ):
                break

            cleaned = remove_bullet(current)

            if cleaned:
                if not is_bullet(lines[index]) and bullets:
                    bullets[-1] = normalize_spaces(bullets[-1] + " " + cleaned)
                else:
                    bullets.append(cleaned)

            index += 1

        entries.append(
            {
                "company": company,
                "role": role_line,
                "start_date": start_date,
                "end_date": end_date,
                "currently_working": currently_working,
                "location": location,
                "bullets": bullets,
            }
        )

    return entries


def is_project_title(line: str) -> bool:
    cleaned = clean_line(line)

    if not cleaned:
        return False

    if is_bullet(line):
        return False

    if PROJECT_TECH_PREFIX.match(cleaned):
        return False

    lowered = cleaned.lower()

    sentence_starters = (
        "built ",
        "developed ",
        "designed ",
        "implemented ",
        "integrated ",
        "optimized ",
        "constructed ",
        "created ",
        "established ",
        "engineered ",
        "configured ",
        "experimented ",
        "explored ",
        "delivered ",
        "architected ",
        "successfully ",
        "applying ",
        "improving ",
        "tracking ",
        "listing ",
        "users",
        "orders",
        "maintainable",
        "scalable",
        "token verification",
    )

    if lowered.startswith(sentence_starters):
        return False

    if cleaned.endswith("."):
        return False

    if len(cleaned) > 130:
        return False

    return True


PROJECT_TITLE_HINTS = (
    "system",
    "application",
    "app",
    "project",
    "platform",
    "website",
    "dashboard",
    "exploration",
    "tool",
    "portal",
    "management",
    "predictor",
    "prediction",
    "gpt",
)


PROJECT_DESCRIPTION_STARTERS = (
    "architected",
    "built",
    "building",
    "constructed",
    "crafted",
    "created",
    "configured",
    "delivered",
    "designed",
    "developed",
    "developing",
    "engineered",
    "established",
    "experimented",
    "explored",
    "implemented",
    "improved",
    "improving",
    "integrated",
    "modeled",
    "optimized",
    "provided",
    "successfully",
    "tracking",
    "applying",
    "and ",
    "using ",
    "users",
    "orders",
    "listings",
    "maintainable",
    "scalable",
    "secure ",
    "token ",
    "profiles",
)


def is_real_project_title(
    line: str,
    next_line: str = "",
) -> bool:
    """
    Detect an actual project heading.

    Important:
    PDF extraction may remove bullet symbols, so a normal sentence
    must never be treated as a project title only because it does
    not start with a bullet.
    """
    cleaned = normalize_spaces(remove_bullet(line))

    if not cleaned:
        return False

    lowered = cleaned.lower()

    # Tech Stack is metadata, never a project.
    if PROJECT_TECH_PREFIX.match(cleaned):
        return False

    # Description/action sentences are never project titles.
    if lowered.startswith(PROJECT_DESCRIPTION_STARTERS):
        return False

    # A sentence ending with punctuation is normally description.
    if cleaned.endswith((".", ",", ";", ":")):
        return False

    # Project titles should not be extremely long.
    if len(cleaned) > 120:
        return False

    if len(cleaned.split()) > 16:
        return False

    # Strong signal:
    # In this resume every actual project title is immediately
    # followed by "Tech Stack:".
    if next_line and PROJECT_TECH_PREFIX.match(
        normalize_spaces(remove_bullet(next_line))
    ):
        return True

    # Fallback for resumes where Tech Stack is not present.
    has_project_keyword = any(keyword in lowered for keyword in PROJECT_TITLE_HINTS)

    # Avoid accepting long descriptive lines merely because they
    # contain words such as application or project.
    return has_project_keyword and len(cleaned.split()) <= 12


def parse_projects(
    lines: List[str],
) -> List[dict]:
    """
    Parse projects by using actual project boundaries.

    Project boundary:
        project title
        Tech Stack: ...
        one or more description bullets

    Wrapped PDF description lines are joined to the current
    project instead of becoming separate project records.
    """

    projects = []
    current_project = None

    index = 0

    while index < len(lines):
        raw_line = lines[index]

        line = normalize_spaces(remove_bullet(raw_line))

        if not line:
            index += 1
            continue

        next_line = ""

        if index + 1 < len(lines):
            next_line = normalize_spaces(remove_bullet(lines[index + 1]))

        # ---------------------------------
        # Actual new project title
        # ---------------------------------
        if is_real_project_title(
            line,
            next_line,
        ):
            if current_project:
                current_project["description"] = normalize_spaces(
                    " ".join(
                        current_project.pop(
                            "_description_parts",
                            [],
                        )
                    )
                )

                projects.append(current_project)

            current_project = {
                "title": line,
                "description": "",
                "technologies": [],
                "github_url": "",
                "live_url": "",
                "_description_parts": [],
            }

            index += 1
            continue

        # Ignore anything before first valid project.
        if current_project is None:
            index += 1
            continue

        # ---------------------------------
        # Technology line
        # ---------------------------------
        tech_match = PROJECT_TECH_PREFIX.match(line)

        if tech_match:
            current_project["technologies"] = dedupe(split_skills(tech_match.group(1)))

            index += 1
            continue

        # ---------------------------------
        # GitHub and live links
        # ---------------------------------
        github_match = re.search(
            r"(?:https?://)?" r"(?:www\.)?" r"github\.com/" r"[^\s|,]+",
            line,
            re.IGNORECASE,
        )

        if github_match:
            current_project["github_url"] = github_match.group(0)

        live_match = re.search(
            r"(?:https?://)?"
            r"(?:www\.)?"
            r"[A-Za-z0-9.-]+"
            r"\.(?:app|dev|io|com)"
            r"(?:/[^\s|,]*)?",
            line,
            re.IGNORECASE,
        )

        if live_match and "github.com" not in live_match.group(0).lower():
            current_project["live_url"] = live_match.group(0)

        # ---------------------------------
        # Description
        # ---------------------------------
        description_text = line

        if github_match:
            description_text = description_text.replace(
                github_match.group(0),
                "",
            )

        if live_match:
            description_text = description_text.replace(
                live_match.group(0),
                "",
            )

        description_text = normalize_spaces(description_text)

        if description_text:
            current_project["_description_parts"].append(description_text)

        index += 1

    # Save final project
    if current_project:
        current_project["description"] = normalize_spaces(
            " ".join(
                current_project.pop(
                    "_description_parts",
                    [],
                )
            )
        )

        projects.append(current_project)

    # Final validation
    valid_projects = []

    seen_titles = set()

    for project in projects:
        title = normalize_spaces(
            project.get(
                "title",
                "",
            )
        )

        if not title:
            continue

        title_key = title.casefold()

        if title_key in seen_titles:
            continue

        seen_titles.add(title_key)

        project["title"] = title

        valid_projects.append(project)

    logger.info(
        "[LOCAL_RESUME_PARSER] " "Parsed %s valid projects: %s",
        len(valid_projects),
        [project["title"] for project in valid_projects],
    )

    return valid_projects


def parse_education_line(line: str) -> dict:
    cleaned = normalize_spaces(line)

    parts = [
        normalize_spaces(part) for part in cleaned.split("|") if normalize_spaces(part)
    ]

    if not parts:
        return {}

    first_part = parts[0]

    degree = first_part
    institution = ""

    degree_institution = re.match(
        r"^(.*?)\s+-\s+(.+)$",
        first_part,
    )

    if degree_institution:
        degree = degree_institution.group(1).strip()
        institution = degree_institution.group(2).strip()

    start_date = ""
    end_date = ""

    date_match = DATE_RANGE_PATTERN.search(cleaned)

    if date_match:
        start_date = date_match.group("start")
        end_date = date_match.group("end")

    remaining_parts = []

    for part in parts[1:]:
        if DATE_RANGE_PATTERN.search(part):
            continue

        if re.search(
            r"\b(?:CGPA|GPA|SGPA|Percentage)" r"\s*:",
            part,
            re.IGNORECASE,
        ):
            continue

        if re.fullmatch(
            r"\d+(?:\.\d+)?%",
            part,
        ):
            continue

        remaining_parts.append(part)

    if remaining_parts:
        institution_parts = []

        if institution:
            institution_parts.append(institution)

        institution_parts.extend(remaining_parts)

        institution = " | ".join(dedupe(institution_parts))

    return {
        "institution": institution,
        "degree": degree,
        "start_date": start_date,
        "end_date": end_date,
        "location": "",
    }


def parse_education(lines: List[str]) -> List[dict]:
    logical_entries = []

    current = ""

    for raw_line in lines:
        line = clean_line(raw_line)

        if not line:
            continue

        starts_new = bool(
            re.match(
                r"^(?:Master|Bachelor|Doctor|"
                r"B\.?Tech|M\.?Tech|BCA|MCA|"
                r"B\.?E\.?|M\.?E\.?|"
                r"10th|12th|Diploma|Ph\.?D)",
                line,
                re.IGNORECASE,
            )
        )

        if starts_new:
            if current:
                logical_entries.append(normalize_spaces(current))

            current = line

        elif current:
            current = normalize_spaces(current + " " + line)

    if current:
        logical_entries.append(normalize_spaces(current))

    education = []

    for entry in logical_entries:
        parsed = parse_education_line(entry)

        if parsed.get("degree") or parsed.get("institution"):
            education.append(parsed)

    return education


def parse_simple_list(
    lines: List[str],
) -> List[str]:

    return dedupe([remove_bullet(line) for line in lines if remove_bullet(line)])


def parse_resume_text_locally(
    resume_text: str,
) -> dict:

    logger.info("[LOCAL_RESUME_PARSER] Parsing started")

    result = empty_canonical()

    if not resume_text:
        logger.warning("[LOCAL_RESUME_PARSER] Empty resume text")
        return result

    header_lines, sections = segment_resume(resume_text)

    email = extract_email(resume_text)

    phone = extract_phone(resume_text)

    linkedin, github, portfolio = extract_urls(resume_text)

    name = extract_name(header_lines)

    location = extract_location(
        header_lines,
        name,
    )

    headline = extract_headline(
        header_lines,
        name,
        location,
    )

    result["contact"] = {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
    }

    result["headline"] = headline

    result["summary"] = parse_summary(
        sections.get(
            "summary",
            [],
        )
    )

    result["skills"] = parse_skills(
        sections.get(
            "skills",
            [],
        )
    )

    result["experience"] = parse_experience(
        sections.get(
            "experience",
            [],
        )
    )

    result["projects"] = parse_projects(
        sections.get(
            "projects",
            [],
        )
    )

    result["education"] = parse_education(
        sections.get(
            "education",
            [],
        )
    )

    result["certifications"] = parse_simple_list(
        sections.get(
            "certifications",
            [],
        )
    )

    result["achievements"] = parse_simple_list(
        sections.get(
            "achievements",
            [],
        )
    )

    result["languages"] = parse_simple_list(
        sections.get(
            "languages",
            [],
        )
    )

    result["publications"] = parse_simple_list(
        sections.get(
            "publications",
            [],
        )
    )

    result["volunteer_experience"] = parse_simple_list(
        sections.get(
            "volunteer_experience",
            [],
        )
    )

    logger.info(
        "[LOCAL_RESUME_PARSER] Parsing completed: "
        "skills=%s experience=%s projects=%s "
        "education=%s",
        len(result["skills"]),
        len(result["experience"]),
        len(result["projects"]),
        len(result["education"]),
    )

    return result
