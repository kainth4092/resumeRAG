

def get_ats_prompt(resume_text: str, job_description: str) -> str:
    return f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to compare the candidate's uploaded resume with the Job Description and evaluate how well the resume matches the role.

    #########################
    INPUT
    #########################
    Resume:
    {resume_text}
    ----------------------------------------

    Job Description:
    {job_description}

    #########################
    INSTRUCTIONS
    #########################
    Analyze only the information present in the uploaded resume.
    Never invent:
    - Skills
    - Experience
    - Companies
    - Projects
    - Certifications
    - Education
    Use the Job Description to identify:
    1. Skills already present
    2. Skills missing
    3. ATS weaknesses
    4. Resume strengths
    5. Improvement opportunities

    #########################
    SCORING
    #########################
    ATS Score should consider:
    - Skills Match
    - Experience Relevance
    - Projects
    - Keywords
    - Resume Structure
    - Technical Stack Alignment
    Return a score between 0 and 100.

    #########################
    KEYWORDS
    #########################
    matched_keywords
    - Maximum 10
    - Only keywords actually found in the resume.
    missing_keywords
    - Maximum 10
    - Important keywords from the Job Description that are missing.

    #########################
    SUGGESTIONS
    #########################
    Return EXACTLY 5 suggestions.
    Suggestions must be actionable.
    Examples:
    - Add measurable achievements.
    - Include FastAPI experience.
    - Improve project descriptions.
    - Add missing cloud technologies.
    - Strengthen summary using JD keywords.

    #########################
    HEATMAP
    #########################
    Score every section between 0 and 100.

    #########################
    OUTPUT
    #########################
    Return ONLY valid JSON.
    No markdown.
    No explanation.
    No code block.
    JSON Schema:
    {{
      "ats_score": 0,
      "matched_keywords": [],
      "missing_keywords": [],
      "suggestions": [],
      "heatmap": {{
        "contact_info": 0,
        "summary": 0,
        "skills": 0,
        "experience": 0,
        "projects": 0,
        "education": 0
      }}
    }}
    """


def get_resume_prompt(resume_text: str, job_description: str, schema_str: str) -> str:
    return f"""
    You are an expert ATS Resume Writer and Senior Technical Recruiter.
    Your task is to optimize the uploaded resume according to the Job Description.
    IMPORTANT RULES
    - Never invent companies.
    - Never invent work experience.
    - Never invent degrees.
    - Never invent certifications.
    - Never invent skills.
    - Never invent GitHub or portfolio links.
    - Preserve all factual information.
    - Improve wording only.
    - Improve ATS score.
    - Improve grammar.
    - Improve formatting.
    - Rewrite experience using strong action verbs.
    - Reorder skills according to the Job Description.
    - Improve project descriptions.
    - Improve the professional summary.
    - Keep education truthful.
    - If projects already exist, improve them.
    - If projects do NOT exist, generate at most TWO realistic projects ONLY if enough skills are available.
    - Return ONLY valid JSON.
    - Do NOT return markdown.
    - Do NOT explain anything.
    
    Uploaded Resume
    {resume_text}
    
    ------------------------------------------------
    Job Description
    
    {job_description}
    
    ------------------------------------------------
    ##############################
    STRICT OUTPUT ORDER (MANDATORY)
    ##############################
    The response MUST follow this exact order.
    Do NOT change the order.
    Do NOT skip any section.
    Do NOT rename any key.
    Do NOT move sections.
    The order MUST ALWAYS be:
    1. personal_info
    2. headline
    3. summary
    4. skills
    5. experience
    6. projects
    7. education
    8. certifications
    9. awards
    10. languages
    11. hobbies
    Return ONLY valid JSON.
    Return EXACTLY this schema:

    {schema_str}

    If any section has no information, return an empty array [] or an empty string "".
    Do NOT place Education before Experience.
    Do NOT place Projects before Experience.
    Do NOT move Skills below Projects.
    Do NOT create additional sections.

    Fill EVERY section using the uploaded resume.   
    If a section has no data, return an empty array [] or an empty string "".
    The headline must contain ONLY the professional job title (example: "Frontend Developer", "Backend Developer", "Full Stack Software Engineer").
    Do NOT include technologies in the headline.
    """


def get_general_answer_prompt(
    question: str, skill: str, category: str, experience_level: str
) -> str:
    if category.lower() in ("behavioral", "hr", "behavioural"):
        return f"""
        You are a Senior Technical Interviewer.
        Your task is to generate a structured, professional, and interview-ready behavioral answer using the STAR method (Situation, Task, Action, Result) for the following question:

        Question: {question}
        Skill/Aspect: {skill}
        Category: {category}
        Target Experience Level: {experience_level}

        Rules:
        - Max 150-250 words.
        - Frame the response from a first-person perspective, demonstrating soft skills, conflict resolution, or leadership.
        - Return ONLY the text of the sample answer. Do not wrap in JSON, markdown code blocks, or include any extra commentary.
        """
    else:
        return f"""
        You are a Senior Technical Interviewer.
        Your task is to generate a comprehensive, interview-ready answer for the following question:

        Question: {question}
        Skill/Technology: {skill}
        Category: {category}
        Target Experience Level: {experience_level}

        INSTRUCTIONS:
        - Provide a clear, professional, and technical explanation.
        - Keep the answer concise yet complete (typically 150-250 words).
        - Fully explain any concepts, terms, or technologies involved.
        - Return ONLY the text of the sample answer. Do not wrap in JSON, markdown code blocks, or include any extra commentary.
        """


def get_resume_health_prompt(resume_text: str) -> str:
    return f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to perform a comprehensive health audit of the candidate's resume and generate an ATS health report.
    This analysis does NOT compare against any specific job description, but evaluates overall professional resume quality, ATS-friendliness, structure, and readability.

    #########################
    INPUT
    #########################
    Resume:
    {resume_text}

    #########################
    INSTRUCTIONS
    #########################
    Evaluate the resume structure, wording, formatting, grammar, and completeness.
    Ensure to detect missing sections specifically checking for the presence of:
    - Projects
    - Certifications
    - Achievements
    - Portfolio
    - GitHub
    - LinkedIn
    - Languages
    - Volunteer Experience
    - Publications

    #########################
    OUTPUT SCHEMA
    #########################
    Return ONLY valid JSON with the following structure:
    {{
      "ats_score": 0,               
      "resume_health_score": 0,    
      "formatting_score": 0,    
      "readability_score": 0,    
      "skills_coverage": 0,    
      "experience_quality": 0,    
      "projects_quality": 0,    
      "education_quality": 0,    
      "keyword_optimization": 0,   
      "grammar_writing": 0,        
      "section_completeness": 0,   
      "recruiter_readiness": 0,     
      
      "suggestions": {{
        "quick_fixes": [],          
        "medium_improvements": [],   
        "high_impact_improvements": [] 
      }},
      "missing_sections": [],       
      "strengths": [],              
      "weaknesses": []             
    }}
    """


def get_improve_section_prompt(
    resume_text: str, section_name: str, section_content: str = None
) -> str:
    return f"""
    You are an expert ATS Resume Writer and Senior Technical Recruiter.
    Your task is to write a highly optimized, professional, and ATS-friendly version of a specific section in the candidate's resume.
    
    #########################
    INPUT
    #########################
    Full Resume Context:
    {resume_text}
    
    Target Section to Improve:
    {section_name}
    
    Current Section Content (if any):
    {section_content or "Not provided. Please extract/generate from the resume context."}
    
    #########################
    INSTRUCTIONS
    #########################
    - Improve vocabulary, impact, and ATS keywords.
    - Use strong action verbs and professional phrasing.
    - Keep it factual and truthful to the original context. Do not invent new jobs or degrees.
    - If improving summary, write a compelling 3-4 sentence professional summary.
    - If improving experience/projects, write bullet points with measurable impact where possible.
    - Return ONLY the improved plain text of the section. Do not wrap in JSON, markdown code blocks, or include any extra commentary.
    """


def get_interview_questions_prompt(
    resume_text: str,
    job_description: str,
    target_count: int,
    fresher_tech: int,
    fresher_proj: int,
    exp_tech: int,
    exp_exp: int,
    exp_proj: int,
    schema_str: str,
) -> str:
    return f"""
    You are a Senior Software Engineering Interviewer at Google, Microsoft, Amazon and Atlassian.
    Your task is to generate highly personalized interview questions based on BOTH the candidate's Resume and the target Job Description.

    ## Candidate Resume
    {resume_text}

    ## Job Description
    {job_description}
    ---

    STEP 1 - Candidate Analysis
    Analyze the resume.
    Determine whether the candidate is:

    * FRESHER
    * EXPERIENCED

    Treat only full-time professional work as experience.
    Internships, freelance work, college projects and personal projects do NOT count as professional experience.

    ---
    STEP 2 - Skill Extraction
    Extract all technical skills from the Resume.
    Extract all technical skills from the Job Description.
    Find all matching skills.
    Examples

    Resume

    React
    Python
    FastAPI
    PostgreSQL
    Docker
    Git

    JD

    React
    Python
    Docker
    AWS
    Git

    Matched Skills
    React
    Python
    Docker
    Git

    If very few matching skills exist, use remaining Resume skills.
    Never generate questions for technologies that do not exist in the Resume.
    ---
    QUESTION DISTRIBUTION

    For FRESHER
    Generate EXACTLY
    {fresher_tech} Technical Questions
    {fresher_proj} Project Questions
    Total = {target_count} Questions

    For EXPERIENCED
    Generate EXACTLY
    {exp_tech} Technical Questions
    {exp_exp} Experience Questions
    {exp_proj} Project Questions
    Total = {target_count} Questions

    ---

    TECHNICAL QUESTION STRATEGY
    Generate questions evenly across ALL matched skills.
    Never focus on only one technology (e.g. React). You MUST generate questions for a variety of matched skills (e.g. Python, FastAPI, PostgreSQL, Docker, Git, etc.).
    Every matched skill must have at least TWO interview questions.
    For each technical question, you MUST populate the 'tech_skill' field with the exact name of the technology or skill the question is testing (e.g., "React", "Python", "FastAPI", "PostgreSQL", "Docker", "Git", etc.).
    Question progression

    Level 1
    Definition

    Example
    What is React?
    What is Python?
    What is FastAPI?
    What is Docker?
    What is PostgreSQL?

    Level 2

    Concepts
    React Hooks
    State vs Props
    OOP
    REST API
    SQL Joins
    Normalization
    Dependency Injection
    JWT Authentication

    Level 3

    Practical
    How would you optimize React?
    How does FastAPI validate requests?
    Explain JWT implementation.
    Explain PostgreSQL indexing.

    Level 4

    Scenario Based
    How would you improve application performance?
    How would you secure a REST API?
    How would you design database relationships?
    Distribute questions evenly.

    Example

    React → 5 Questions
    Python → 5 Questions
    FastAPI → 5 Questions
    PostgreSQL → 5 Questions
    Docker → 5 Questions
    Git → 5 Questions

    Do NOT generate 20 React questions while ignoring Python or FastAPI. Make sure you cover all matched skills.

    ---

    PROJECT QUESTIONS

    Generate ONLY from projects present in the Resume.
    Never invent projects.
    Questions should cover
    Architecture
    Authentication
    Database
    Challenges
    Libraries
    Deployment
    Project Decisions

    ---

    EXPERIENCE QUESTIONS
    Generate ONLY if professional experience exists.
    Questions should come from
    Responsibilities
    Production Bugs
    Optimization
    Architecture
    Deployment
    Team Collaboration

    ---

    STRICT RULES
    Never invent technologies.
    Never invent companies.
    Never invent projects.
    Never invent work experience.
    Never generate duplicate questions.
    Questions must feel like they were written after carefully reading the Resume.

    ---

    OUTPUT
    Return ONLY JSON.
    {schema_str}
    """


def get_question_details_prompt(
    resume_text: str, job_description: str, question: str, schema_str: str
) -> str:
    return f"""
    You are a Senior Software Engineering Interviewer at Google.
    Your task is to generate a detailed interview explanation for ONE interview question.

    ########################################
    CANDIDATE RESUME
    ########################################
    {resume_text}

    ########################################
    JOB DESCRIPTION
    ########################################
    {job_description}

    ########################################
    INTERVIEW QUESTION
    ########################################
    {question}

    ########################################
    YOUR TASK
    ########################################
    Generate:

    1. AI Tip
    2. Sample Interview Answer
    3. Key Points
    4. Common Mistakes
    5. Follow-up Questions

    The answer must be personalized according to the candidate's resume and the target Job Description.

    ########################################
    RULES
    ########################################
    - Never invent companies.
    - Never invent projects.
    - Never invent experience.
    - Fully answer the question asked, explaining any technologies, concepts, or frameworks mentioned in the question itself.
    - Keep the sample answer interview-ready.
    - Keep the answer concise (150-250 words).
    - Key points should be short bullet points.
    - Common mistakes should be realistic.
    - Follow-up questions should naturally continue the interview.
    - Return ONLY valid JSON.
    - No markdown.
    - No explanation.
    - No code block.

    ########################################
    OUTPUT JSON
    ########################################
    Return EXACTLY this structure:

    {schema_str}
    """


def get_sample_answer_prompt(
    resume_text: str, job_description: str, question: str
) -> str:
    return f"""
    You are a Senior Software Engineering Interviewer at Google.
    Your task is to generate a personalized sample interview answer for ONE interview question.

    ########################################
    CANDIDATE RESUME
    ########################################
    {resume_text}

    ########################################
    JOB DESCRIPTION
    ########################################
    {job_description}

    ########################################
    INTERVIEW QUESTION
    ########################################
    {question}

    ########################################
    YOUR TASK
    ########################################
    Generate a personalized Sample Interview Answer according to the candidate's resume and the target Job Description.

    ########################################
    RULES
    ########################################
    - Never invent companies.
    - Never invent projects.
    - Never invent experience.
    - Fully answer the question asked, explaining any technologies, concepts, or frameworks mentioned in the question itself.
    - Keep the sample answer interview-ready.
    - Keep the answer concise (150-250 words).
    - Return ONLY valid JSON.
    - Do NOT return markdown.
    - Do NOT explain anything.
    - Return ONLY valid JSON.
    - No markdown.
    - No explanation.
    - No code block.

    ########################################
    OUTPUT JSON
    ########################################
    Return EXACTLY this structure:

    {{
      "answer": {{
        "sample_answer": "your sample answer text here"
      }}
    }}
    """


def get_mcq_prompt(question: str, answer: str, skill: str) -> str:
    return f"""
    You are a Senior Software Engineering Interviewer designing a moderate-difficulty Multiple Choice Question (MCQ) for a FAANG/MAANG-style online assessment.
    
    Convert the following technical interview question and descriptive answer into a highly professional, balanced MCQ.
    
    Technical Question: {question}
    Descriptive Answer: {answer}
    Skill: {skill}
    
    Design Guidelines:
    1. **Moderate Difficulty**: The question should assess practical/conceptual understanding suitable for 0-3 years of experience. Focus on trade-offs, behaviors, or realistic scenarios.
    2. **Plausible Distractors (Believable, Same Domain)**:
       - The incorrect options must be technically valid concepts within the {skill} domain.
       - They should look highly believable and represent common misconceptions or alternative approaches.
       - Never mix unrelated technologies or skills (e.g., if the skill is {skill}, do not reference other domains like SQL, Docker, or React unless comparing).
    3. **Balanced Length and Formatting**:
       - All four options must have a similar level of detail, tone, and sentence structure.
       - Keep all options comparable in length (around 10-18 words, within 3-4 words of each other).
       - The correct option must NOT stand out as significantly longer or more detailed.
    4. **Correctness Rules**:
       - Exactly 4 options.
       - Only one option must be unambiguously correct.
       - No "All of the above" or "None of the above".
       - No repeated wording across options (e.g. starting every option with "It is used to...").
    5. **Distractor Explanations**:
       - For each incorrect option, provide a concise explanation (1-2 sentences) of why it is incorrect or what it actually does/refers to in reality.
    
    Return ONLY a valid JSON object matching the schema below. Do not wrap in markdown code blocks, and do not include extra text.
    
    JSON Schema:
    {{
      "option_a": "Statement for option A",
      "option_b": "Statement for option B",
      "option_c": "Statement for option C",
      "option_d": "Statement for option D",
      "correct_option": "A | B | C | D",
      "short_explanation": "Short explanation of the correct answer.",
      "distractor_explanations": {{
        "A": "Explanation of why option A is incorrect (empty string if A is correct).",
        "B": "Explanation of why option B is incorrect (empty string if B is correct).",
        "C": "Explanation of why option C is incorrect (empty string if C is correct).",
        "D": "Explanation of why option D is incorrect (empty string if D is correct)."
      }}
    }}
    """
