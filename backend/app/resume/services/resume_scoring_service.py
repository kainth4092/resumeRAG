import re

TECH_KEYWORDS_LIST = [
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "golang", "rust", "php", "html", "css", 
    "sql", "nosql", "react", "angular", "vue", "node", "express", "django", "flask", "fastapi", "spring", "docker", 
    "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "agile", "scrum", "machine learning", "deep learning", 
    "ai", "nlp", "data science", "devops", "cloud", "linux", "graphql", "rest", "api", "microservices", "terraform", 
    "jenkins", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "firebase", "sqlite", "oracle", "sass", 
    "webpack", "babel", "tailwind", "bootstrap", "jquery", "redux", "next.js", "nuxt.js", "gatsby", "svelte", 
    "pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn", "spark", "hadoop", "tableau", "powerbi", 
    "jira", "confluence", "figma", "trello", "heroku", "netlify", "vercel", "digitalocean", "cloudflare", "nginx", 
    "apache", "bash", "shell", "powershell", "testing", "jest", "cypress", "selenium", "mocha", "chai", "junit", 
    "pytest", "unit testing", "integration testing", "system architecture", "backend", "frontend", "full stack", 
    "mobile", "ios", "android", "swift", "kotlin", "flutter", "react native", "xamarin", "dart", "objective-c", 
    "webassembly", "seo", "ui/ux", "product management", "project management", "scrum master", "saas", "paas", 
    "iaas", "security", "cybersecurity", "cryptography", "blockchain", "solidity", "ethereum", "bitcoin", 
    "smart contracts", "web3", "networks", "tcp/ip", "dns", "http", "sockets", "restful", "grpc", "soap"
]

# Alias map: maps common variant names to their canonical keyword.
# If a resume says "postgres" it should match "postgresql" from the JD and vice versa.
KEYWORD_ALIASES = {
    "postgres": "postgresql",
    "mongo": "mongodb",
    "k8s": "kubernetes",
    "node.js": "node",
    "nodejs": "node",
    "express.js": "express",
    "expressjs": "express",
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "vuejs": "vue",
    "angular.js": "angular",
    "angularjs": "angular",
    "nextjs": "next.js",
    "nuxtjs": "nuxt.js",
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "tailwindcss": "tailwind",
    "tailwind css": "tailwind",
    "spring boot": "spring",
    "springboot": "spring",
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "html5": "html",
    "css3": "css",
    "rest api": "rest",
    "restful api": "restful",
    "rest apis": "rest",
    "restful apis": "restful",
    "graphql api": "graphql",
    "full-stack": "full stack",
    "fullstack": "full stack",
    "ml": "machine learning",
    "dl": "deep learning",
    "ci": "ci/cd",
    "cd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "power bi": "powerbi",
    "scikit learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "react-native": "react native",
}

# Build reverse map: canonical -> set of aliases (including itself)
_CANONICAL_TO_ALIASES = {}
for alias, canonical in KEYWORD_ALIASES.items():
    _CANONICAL_TO_ALIASES.setdefault(canonical, set()).add(alias)
for kw in TECH_KEYWORDS_LIST:
    _CANONICAL_TO_ALIASES.setdefault(kw, set()).add(kw)


def _normalize_keyword(kw: str) -> str:
    """Normalize a keyword to its canonical form using the alias map."""
    return KEYWORD_ALIASES.get(kw, kw)


def extract_keywords(text: str) -> set[str]:
    """
    Extracts tech keywords from text deterministically.
    Returns canonical keyword forms for consistent matching.
    """
    if not text:
        return set()
    
    text_lower = text.lower()
    found = set()

    # Check all canonical keywords AND their aliases
    all_terms = list(TECH_KEYWORDS_LIST) + list(KEYWORD_ALIASES.keys())
    seen_canonical = set()

    for term in all_terms:
        canonical = _normalize_keyword(term)
        if canonical in seen_canonical:
            # Already found this canonical keyword, skip redundant checks
            if canonical in found:
                continue

        # Special chars need substring match
        special_chars = ["c++", "c#", "next.js", "nuxt.js", "ci/cd", "ui/ux"]
        if term in special_chars:
            if term in text_lower:
                found.add(canonical)
                seen_canonical.add(canonical)
        else:
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text_lower):
                found.add(canonical)
                seen_canonical.add(canonical)

    return found

def get_text_from_canonical_resume(resume: dict) -> str:
    """
    Concatenates resume fields for searching keywords.
    Handles both canonical schema (contact/bullets) and generator schema (personal_info/description).
    """
    parts = []
    # Contact (canonical) or personal_info (generator)
    contact = resume.get("contact", resume.get("personal_info", {}))
    if isinstance(contact, dict):
        for field in ["name", "email", "phone", "location", "linkedin", "github", "portfolio"]:
            parts.append(str(contact.get(field, "")))
    
    # Headline / Summary
    parts.append(str(resume.get("headline", "")))
    summary = resume.get("summary", "")
    if isinstance(summary, dict):
        summary = summary.get("text", "")
    parts.append(str(summary))
    
    # Skills
    for s in resume.get("skills", []):
        parts.append(str(s) if not isinstance(s, dict) else str(s.get("name", "")))
    
    # Experience - handle both "bullets" and "description" keys
    for exp in resume.get("experience", []):
        if isinstance(exp, dict):
            parts.append(str(exp.get("company", "")))
            parts.append(str(exp.get("role", "")))
            parts.append(str(exp.get("location", "")))
            bullets = exp.get("bullets", exp.get("description", []))
            if isinstance(bullets, list):
                parts.extend(str(b) for b in bullets)
            elif isinstance(bullets, str):
                parts.append(bullets)
        
    # Projects - handle both structured and flat description
    for proj in resume.get("projects", []):
        if isinstance(proj, dict):
            parts.append(str(proj.get("title", proj.get("name", ""))))
            desc = proj.get("description", proj.get("desc", ""))
            if isinstance(desc, list):
                parts.extend(str(d) for d in desc)
            else:
                parts.append(str(desc))
            tech = proj.get("technologies", proj.get("tech", []))
            if isinstance(tech, list):
                parts.extend(str(t) for t in tech)
            elif isinstance(tech, str):
                parts.append(tech)
        
    # Education
    for edu in resume.get("education", []):
        if isinstance(edu, dict):
            parts.append(str(edu.get("institution", edu.get("school", ""))))
            parts.append(str(edu.get("degree", "")))
            parts.append(str(edu.get("location", "")))

    # Extras
    for f in ["certifications", "achievements", "languages", "publications", "volunteer_experience"]:
        vals = resume.get(f, [])
        if isinstance(vals, list):
            parts.extend(str(v) for v in vals)
        
    return "\n".join(parts)

def calculate_scores(resume: dict, job_description: str | None = None) -> dict:
    """
    Calculate deterministic numeric scores for a canonical resume.
    """
    # 1. Section Completeness (Weight: 100 max)
    # Core: contact (15), headline (10), summary (15), skills (20), experience (25), education (15)
    # Optional: projects, certifications, etc. (up to 10 bonus, capped at 100)
    completeness = 0
    contact = resume.get("contact", {})
    if contact.get("name") and contact.get("email") and contact.get("phone"):
        completeness += 15
    elif contact.get("name"):
        completeness += 5
        
    if resume.get("headline"):
        completeness += 10
    if resume.get("summary"):
        completeness += 15
    if resume.get("skills"):
        completeness += 20
    if resume.get("experience"):
        completeness += 25
    if resume.get("education"):
        completeness += 15
        
    # Extra bonus
    if resume.get("projects"):
        completeness += 5
    if resume.get("certifications") or resume.get("achievements") or resume.get("languages"):
        completeness += 5
    section_completeness = min(100, completeness)

    # 2. Skills Coverage (Weight: 100 max)
    skills = resume.get("skills", [])
    num_skills = len(skills)
    if num_skills == 0:
        skills_coverage = 0
    elif num_skills <= 3:
        skills_coverage = 50
    elif num_skills <= 7:
        skills_coverage = 75
    elif num_skills <= 12:
        skills_coverage = 90
    else:
        skills_coverage = 100

    # 3. Experience Quality (Weight: 100 max)
    # Base = 50. Add points for experiences, metrics, action verbs.
    exp_list = resume.get("experience", [])
    exp_quality = 50
    if exp_list:
        exp_quality += min(30, len(exp_list) * 10)
        
        # Regex for metrics (numbers followed by %, k, million, etc.)
        metric_pat = re.compile(r'\b\d+%\b|\b\d+\s*k\b|\$\d+|\b\d+\s*million\b|\bpercent\b', re.IGNORECASE)
        strong_verb_pat = re.compile(r'^(led|developed|created|optimized|managed|built|designed|implemented|coordinated|directed|supervised|headed|executed|spearheaded|formulated)', re.IGNORECASE)
        
        has_metrics = False
        has_strong_verbs = False
        for exp in exp_list:
            bullets = exp.get("bullets", exp.get("description", []))
            if isinstance(bullets, str):
                bullets = [bullets]
            for bullet in (bullets or []):
                bullet_str = str(bullet)
                if metric_pat.search(bullet_str):
                    has_metrics = True
                if strong_verb_pat.search(bullet_str.strip()):
                    has_strong_verbs = True
                    
        if has_metrics:
            exp_quality += 10
        if has_strong_verbs:
            exp_quality += 10
    else:
        exp_quality = 0
    experience_quality = min(100, exp_quality)

    # 4. Projects Quality (Weight: 100 max)
    proj_list = resume.get("projects", [])
    proj_quality = 50
    if proj_list:
        proj_quality += min(30, len(proj_list) * 15)
        # Check URLs
        has_url = any(
            p.get("github_url") or p.get("github") or p.get("live_url") or p.get("live") or p.get("url")
            for p in proj_list
        )
        if has_url:
            proj_quality += 15
        if any(p.get("technologies") or p.get("tech") for p in proj_list):
            proj_quality += 5
    else:
        proj_quality = 0
    projects_quality = min(100, proj_quality)

    # 5. Education Quality (Weight: 100 max)
    edu_list = resume.get("education", [])
    if not edu_list:
        education_quality = 50
    else:
        has_complete = any(edu.get("institution") and edu.get("degree") for edu in edu_list)
        if has_complete:
            education_quality = 100
        else:
            education_quality = 85

    # 6. Formatting Score (Weight: 100 max)
    # Deduct for long bullet points or missing critical contact/headline details
    formatting = 100
    if not contact.get("email") or not contact.get("phone"):
        formatting -= 10
    if not resume.get("headline"):
        formatting -= 10
        
    long_bullets = 0
    short_bullets = 0
    for exp in exp_list:
        bullets = exp.get("bullets", exp.get("description", []))
        if isinstance(bullets, str):
            bullets = [bullets]
        if not bullets or len(bullets) < 2:
            formatting -= 5
        for bullet in bullets:
            length = len(bullet)
            if length > 250:
                long_bullets += 1
            elif length < 20:
                short_bullets += 1
                
    formatting -= min(15, long_bullets * 5)
    formatting -= min(10, short_bullets * 3)
    formatting_score = max(50, formatting)

    # 7. Readability Score (Weight: 100 max)
    # Evaluate summary length and bullet counts
    readability = 100
    summary_len = len(resume.get("summary", ""))
    if summary_len > 500:
        readability -= 15
    elif summary_len < 50:
        readability -= 10
        
    bullet_count = sum(
        len(exp.get("bullets", exp.get("description", [])) or [])
        for exp in exp_list
    )
    if bullet_count > 25:
        readability -= 15
    elif bullet_count < 3:
        readability -= 10
        
    readability_score = max(50, readability)

    # 8. Grammar & Writing Score (Weight: 100 max)
    # Base: 95. Small penalties for formatting/readability issues
    grammar_writing = max(60, min(100, 95 - (100 - readability_score) // 5))

    # 9. Recruiter Readiness
    recruiter_readiness = int(
        0.35 * experience_quality + 
        0.25 * projects_quality + 
        0.15 * education_quality + 
        0.25 * section_completeness
    )

    # 10. Keyword Optimization & ATS Score with Job Description
    # If job description is provided, calculate intersection
    matched_keywords = []
    missing_keywords = []
    
    if job_description:
        jd_kws = extract_keywords(job_description)
        resume_text = get_text_from_canonical_resume(resume)
        resume_kws = extract_keywords(resume_text)
        
        # Add actual skills list from resume to resume keywords,
        # normalizing through alias map for consistent matching
        for s in skills:
            s_lower = s.lower() if isinstance(s, str) else str(s).lower()
            canonical = _normalize_keyword(s_lower)
            resume_kws.add(canonical)
            
        matched = jd_kws.intersection(resume_kws)
        missing = jd_kws.difference(resume_kws)
        
        # Sort for determinism
        matched_keywords = sorted(list(matched))
        missing_keywords = sorted(list(missing))
        
        if jd_kws:
            keyword_optimization = int((len(matched) / len(jd_kws)) * 100)
        else:
            keyword_optimization = 80
    else:
        # Without JD, keyword optimization depends on skills list and contact details
        keyword_optimization = int(0.6 * skills_coverage + 0.4 * section_completeness)

    # 11. Resume Health Score
    resume_health_score = int(
        0.20 * section_completeness +
        0.20 * experience_quality +
        0.15 * skills_coverage +
        0.15 * projects_quality +
        0.10 * readability_score +
        0.10 * formatting_score +
        0.10 * grammar_writing
    )

    # 12. Overall ATS Score
    if job_description:
        ats_score = int(0.50 * keyword_optimization + 0.50 * resume_health_score)
    else:
        ats_score = resume_health_score

    return {
        "ats_score": ats_score,
        "resume_health_score": resume_health_score,
        "formatting_score": formatting_score,
        "readability_score": readability_score,
        "skills_coverage": skills_coverage,
        "experience_quality": experience_quality,
        "projects_quality": projects_quality,
        "education_quality": education_quality,
        "keyword_optimization": keyword_optimization,
        "grammar_writing": grammar_writing,
        "section_completeness": section_completeness,
        "recruiter_readiness": recruiter_readiness,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords
    }
