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

def extract_keywords(text: str) -> set[str]:
    """
    Extracts tech keywords from text deterministically.
    """
    if not text:
        return set()
    
    text_lower = text.lower()
    found = set()
    for kw in TECH_KEYWORDS_LIST:
        # Match word boundaries. Be careful with special characters in keywords like c++, c#, next.js, etc.
        # We can escape the keyword and check if it's in the text.
        pattern = r'\b' + re.escape(kw) + r'\b'
        if kw in ["c++", "c#", "next.js", "nuxt.js", "gatsby", "ci/cd", "ui/ux"]:
            # For special symbols, check substring/custom word boundaries
            if kw in text_lower:
                found.add(kw)
        else:
            if re.search(pattern, text_lower):
                found.add(kw)
    return found

def get_text_from_canonical_resume(resume: dict) -> str:
    """
    Concatenates resume fields for searching keywords.
    """
    parts = []
    # Contact
    contact = resume.get("contact", {})
    parts.append(contact.get("name", ""))
    parts.append(contact.get("email", ""))
    parts.append(contact.get("phone", ""))
    parts.append(contact.get("location", ""))
    parts.append(contact.get("linkedin", ""))
    parts.append(contact.get("github", ""))
    parts.append(contact.get("portfolio", ""))
    
    # Headline / Summary
    parts.append(resume.get("headline", ""))
    parts.append(resume.get("summary", ""))
    
    # Skills
    parts.extend(resume.get("skills", []))
    
    # Experience
    for exp in resume.get("experience", []):
        parts.append(exp.get("company", ""))
        parts.append(exp.get("role", ""))
        parts.append(exp.get("location", ""))
        parts.extend(exp.get("bullets", []))
        
    # Projects
    for proj in resume.get("projects", []):
        parts.append(proj.get("title", ""))
        parts.append(proj.get("description", ""))
        parts.extend(proj.get("technologies", []))
        
    # Education
    for edu in resume.get("education", []):
        parts.append(edu.get("institution", ""))
        parts.append(edu.get("degree", ""))
        parts.append(edu.get("location", ""))

    # Extras
    for f in ["certifications", "achievements", "languages", "publications", "volunteer_experience"]:
        parts.extend(resume.get(f, []))
        
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
            for bullet in exp.get("bullets", []):
                if metric_pat.search(bullet):
                    has_metrics = True
                if strong_verb_pat.search(bullet.strip()):
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
        has_url = any(p.get("github_url") or p.get("live_url") for p in proj_list)
        if has_url:
            proj_quality += 15
        if any(p.get("technologies") for p in proj_list):
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
        bullets = exp.get("bullets", [])
        if len(bullets) < 2:
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
        
    bullet_count = sum(len(exp.get("bullets", [])) for exp in exp_list)
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
        
        # Add actual skills list from resume to resume keywords
        for s in skills:
            resume_kws.add(s.lower())
            
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
