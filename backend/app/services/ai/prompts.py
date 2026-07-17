def get_ats_prompt(resume_text: str, job_description: str) -> str:
    return f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to compare the candidate's uploaded resume with the Job Description and evaluate how well the resume matches the role qualitatively.

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
    
    Do NOT compute or include any numeric scores, ATS scores, or heatmap scores, as these are calculated by a deterministic backend service.
    
    Use the Job Description to identify:
    1. ATS weaknesses
    2. Resume strengths
    3. Actionable improvement opportunities (suggestions)

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
    OUTPUT
    #########################
    Return ONLY valid JSON.
    No markdown formatting (do NOT wrap in ```json or ```).
    No explanations outside the JSON structure.
    
    JSON Schema:
    {{
      "suggestions": [],
      "strengths": [],
      "weaknesses": []
    }}
    """


def get_resume_prompt(
    resume_text: str,
    job_description: str,
    schema_str: str,
    improvement_feedback: str | None = None,
) -> str:
    return f"""
ROLE:
You are a senior ATS resume writer and technical recruiter.

PRIMARY OBJECTIVE:
Create an ATS-friendly resume that follows the supplied JSON schema while
preserving the candidate's real identity, employment history, education,
skills, certifications, links, dates, and achievements.

The uploaded resume is the source of truth for candidate facts.
The job description is used only for relevance, prioritization, terminology,
and ATS optimization.

==================================================
UPLOADED RESUME
==================================================

<RESUME>
{resume_text}
</RESUME>

==================================================
TARGET JOB DESCRIPTION
==================================================

<JOB_DESCRIPTION>
{job_description}
</JOB_DESCRIPTION>

==================================================
FACTUAL RULES
==================================================

You MUST preserve all factual candidate information.

Never invent or replace:

- Candidate name
- Email
- Phone number
- Location
- LinkedIn URL
- GitHub URL
- Portfolio URL
- Companies
- Employment
- Job titles
- Internships
- Training
- Employment dates
- Degrees
- Institutions
- Education dates
- Certifications
- Awards
- Existing technical skills
- Existing achievements
- Existing numeric metrics

A technology appearing only in the Job Description is NOT evidence that the
candidate possesses that technology.

Do not convert:

- Personal projects into employment
- Academic projects into employment
- Internships into full-time employment
- Training into full-time employment
- Job Description responsibilities into candidate experience

==================================================
EXPERIENCE RULES
==================================================

Determine the candidate's experience using:

1. Structured work-experience entries.
2. Explicit experience statements anywhere in the resume.
3. Experience statements in the professional summary.
4. Experience statements in the headline.

Examples:

"6.5+ years of experience"
"Over 4 years of software development experience"
"3 years of experience as a backend developer"

Preserve these experience claims when explicitly present.

Do not downgrade an experienced candidate to a fresher merely because dates
are incomplete.

Do not assign an experience duration when the resume contains no supporting
evidence.

==================================================
PROJECT POLICY
==================================================

CASE A — EXISTING PROJECTS:

If one or more projects are present:

- Preserve every real project.
- Keep every project as one project object.
- Improve grammar, clarity, action verbs, ATS terminology, and readability.
- Preserve the project's original purpose.
- Preserve supported technologies.
- Never split project sentences or bullet points into separate projects.
- Never merge unrelated projects.
- Never move project content into Education.
- Never move project content into Experience.
- Never add unsupported functionality.
- Never add unsupported technologies.
- Never create additional projects when genuine projects already exist.

CASE B — NO PROJECTS:

If no project exists anywhere in the resume:

You MAY generate a maximum of two realistic suggested portfolio projects.

Generated projects MUST:

- Use only skills already present in the candidate's resume.
- Match the candidate's demonstrated experience level.
- Be technically realistic.
- Avoid fake companies and clients.
- Avoid fake production usage.
- Avoid fake deployment claims.
- Avoid fake user counts.
- Avoid fake performance metrics.
- Avoid fake revenue or business impact.
- Avoid claiming that the project is completed unless supported.
- Be represented as personal or portfolio projects.

Do not generate a project when the resume does not contain enough technical
skills to support a realistic project.

==================================================
OPTIMIZATION RULES
==================================================

- Improve grammar and professional wording.
- Improve ATS readability.
- Use strong but factual action verbs.
- Prioritize resume-supported Job Description skills first.

- Reorder skills by relevance to the Job Description.
- Promote technologies already demonstrated inside projects and experience.
- Remove duplicate skills.
- Merge obvious aliases.
Examples:
Postgres ↔ PostgreSQL
JS ↔ JavaScript
Py ↔ Python
ML ↔ Machine Learning
Do not remove distinct technologies.

Never add unsupported Job Description skills.
- Preserve distinct technologies.
- Improve the professional summary.
- Keep the summary approximately 60-100 words.
- Preserve the candidate's actual experience level.
==================================================
JD COVERAGE OPTIMIZATION
==================================================
Before writing the resume:
STEP 1
Extract the Job Description into:

- Required Skills
- Preferred Skills
- Responsibilities
- Domain Keywords
- Tools
- Frameworks
- Databases
- Cloud Platforms
- Soft Skills

STEP 2
Compare every extracted keyword with the uploaded resume.
Create three internal groups:
A. Already Supported
Skills clearly supported by the resume.
B. Indirectly Supported
Skills reasonably inferred from projects or experience without inventing facts.

Example:
REST API
↓
Resume contains:
Flask APIs
→ acceptable
Docker
↓
Resume contains Docker deployment
→ acceptable
C. Unsupported
Skills with no evidence.
Never add these.

==================================================
Resume optimization priorities:
1. Rewrite the professional summary using the highest-priority supported JD keywords.
2. Rewrite experience bullets to naturally include supported JD terminology.
3. Rewrite project bullets to include supported technologies already demonstrated.
4. Improve skill ordering so the most relevant supported skills appear first.
5. Improve ATS keyword coverage naturally.
6. Never repeat keywords unnaturally.
7. Never perform keyword stuffing.
8. Never invent experience.
9. Never invent employment.
10. Never invent years of experience.
11. Maximize ATS using truthful evidence only.

- Improve existing experience descriptions.
- Improve existing project descriptions.
- Do not fabricate measurable achievements.
- Do not perform keyword stuffing.
- Do not write "improved ATS score."
==================================================
STRICT STRUCTURE
==================================================
Return the root sections in exactly this order:

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

SECTION BOUNDARY RULES:

- Education may contain only education information.
- Experience may contain only work, internship, or training information.
- Projects may contain only project information.
- Skills may contain only individual skill names.
- Never append project descriptions to Education.
- Never append skills to an institution or degree.
- Never place project technologies inside an education degree.
- Never use project bullet text as an education record.
- Never create a separate project from an individual project bullet.

==================================================
OUTPUT
==================================================

Return one valid JSON object only.

Do not return:

- Markdown
- Code fences
- Comments
- Explanations
- Text before JSON
- Text after JSON
- Trailing commas
- Additional keys

Use exactly this schema:

{schema_str}
{
f"""
==================================================
IMPROVEMENT FEEDBACK
==================================================
{improvement_feedback}
Use this feedback only if it is provided.
Improve the resume accordingly while preserving factual accuracy.
"""
if improvement_feedback
else ""
}

FINAL VALIDATION:

Before returning:

1. Verify all personal information was preserved.
2. Verify employment was not invented.
3. Verify education contains no project or skill content.
4. Verify every existing project remains one project.
5. Verify no project bullet became a separate project.
6. Verify unsupported JD skills were not added.
7. Verify generated projects exist only when the original resume had none.
8. Verify generated projects use only resume-supported skills.
9. Verify missing values use empty strings or empty arrays.
10. Verify the result is valid parseable JSON.
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


def get_interview_bank_generation_prompt(
    skill: str,
    experience_level: str,
    count: int = 8,
) -> str:
    return f"""
You are a Senior Software Engineering Interview Panel.

Generate exactly {count} UNIQUE interview questions.

Skill:
{skill}

Target Experience:
{experience_level}

Requirements:

- Cover different aspects of the skill.
- Do NOT repeat concepts.
- Mix interview styles.

Difficulty distribution:

- Easy
- Medium
- Hard

Categories should include where appropriate:

- Technical
- Scenario
- Project
- Debugging
- System Design

Return ONLY valid JSON.

Schema:

[
  {{
    "question":"...",
    "category":"Technical",
    "difficulty":"Medium"
  }}
]

Rules:

- No markdown
- No explanation
- No numbering
- No duplicate questions
- Question length between 15 and 180 characters.
- Make questions production-level.
"""


def get_resume_health_prompt(resume_text: str) -> str:
    return f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to perform a comprehensive health audit of the candidate's resume and generate an ATS health report qualitatively.
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

    Do NOT compute or include any numeric scores, ATS scores, formatting scores, readability scores, or category scores, as these are calculated by a deterministic backend service.

    #########################
    OUTPUT SCHEMA
    #########################
    Return ONLY valid JSON with the following structure. Do NOT wrap in markdown code blocks like ```json or ```. No explanations outside JSON.
    {{
      "summary": "2-3 sentence overall diagnostic review of the resume health.",
      "formatting_status": "Brief 1-3 word formatting evaluation (e.g. Standard Passed, Layout Issues)",
      "grammar_status": "Brief 1-3 word grammar evaluation (e.g. Clean, Actions Needed)",

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
ROLE:
You are a senior technical interviewer generating personalized interview
questions for one candidate.

ACTIVE RESUME:

<ACTIVE_RESUME>
{resume_text}
</ACTIVE_RESUME>

TARGET JOB DESCRIPTION:

<JOB_DESCRIPTION>
{job_description}
</JOB_DESCRIPTION>

IMPORTANT:

The ACTIVE RESUME above is the only candidate profile allowed for this
request.

Never use:

- Another user's resume
- A previously active resume
- Deleted resume data
- Stale cached resume data
- Skills from another resume
- Projects from another resume
- Experience from another resume

==================================================
STEP 1 — EXPERIENCE LEVEL
==================================================

Determine candidate experience from:

1. Structured work-experience entries.
2. Explicit experience statements anywhere in the resume.
3. Professional summary.
4. Headline.

Examples:

"6.5+ years of experience"
"Over 5 years of experience"
"3 years as a backend developer"

Do not ignore an explicit experience statement.

Classify as:

FRESHER:
No professional experience and no explicit experience-duration claim.

JUNIOR EXPERIENCED:
Some professional experience or approximately 0-2 years.

EXPERIENCED:
Approximately 2-5 years.

SENIOR:
Five or more explicitly supported years.

Internships and training are valid personalization context but must not
automatically be treated as senior full-time experience.

==================================================
STEP 2 — DIFFICULTY
==================================================

For FRESHER candidates:

- Mostly Easy questions
- Many Medium questions
- Very few Hard questions
- Focus on fundamentals, applied concepts, and projects

Preferred distribution:

Easy: 55%
Medium: 40%
Hard: 5%

For JUNIOR EXPERIENCED candidates:

Easy: 25%
Medium: 60%
Hard: 15%

For EXPERIENCED candidates:

Easy: 15%
Medium: 55%
Hard: 30%

For SENIOR candidates:

Easy: 10%
Medium: 45%
Hard: 45%

Difficulty must reflect the actual depth of the question.

Do not label a basic definition question as Hard.

Hard questions should involve:

- Architecture
- Debugging
- Performance
- Scalability
- Security
- Trade-offs
- Production incidents
- Advanced design decisions

==================================================
STEP 3 — SKILLS
==================================================

==================================================
STEP 3A — RESUME FIRST PRIORITY
==================================================

Before generating any question:

1. Extract every technical skill from the ACTIVE RESUME.

2. Compare those skills with the Job Description.

3. Split skills into:

A. Resume + Job Description (Highest Priority)

B. Resume Only (Medium Priority)

C. Job Description Only (Never ask technical questions)

Question distribution priority:

- 60% Resume + JD matched skills
- 25% Resume-only skills
- 15% Resume projects and practical discussions

Never generate a technical question whose primary technology exists only inside the Job Description.

If the Job Description mentions Kubernetes but the resume does not, do not ask Kubernetes interview questions.

If the resume contains Python, FastAPI and PostgreSQL while the JD also contains them, prioritize those first.

Extract skills from the ACTIVE RESUME.

Use the Job Description only to prioritize resume skills relevant to the role.

Never generate a technical question for a skill appearing only in the Job
Description.

Questions must cover multiple relevant resume skills.

Do not generate most questions for one technology while ignoring other
important matched skills.

Avoid generating more than TWO technical questions for the same skill unless the resume contains fewer than three technical skills.

Prefer breadth over repetition.

Do not require two questions for every skill when the requested question
count is too small.

Distribute questions proportionally across the most relevant skills.

Every technical question must include its exact primary skill in the
"tech_skill" field.

==================================================
STEP 4 — PROJECT QUESTIONS
==================================================

Project questions should reference the candidate's actual projects whenever possible.

Focus on:

- Architecture
- Authentication
- APIs
- Database Design
- Deployment
- Debugging
- Performance
- Security
- Trade-offs
- Design Decisions
- Challenges Faced
- Future Improvements

Avoid generic project questions that could apply to any project.

==================================================
STEP 4B — GAP ANALYSIS
==================================================

Compare the Job Description against the ACTIVE RESUME.

If the Job Description contains technologies missing from the resume:

DO NOT generate technical questions assuming the candidate knows them.

Instead ask learning-oriented interview questions.

Examples:

"I noticed your projects use Flask. How would you approach learning FastAPI?"

"You mainly worked with SQLite. How would you migrate your project to PostgreSQL?"

These questions should evaluate adaptability rather than unsupported knowledge.

==================================================
STEP 5 — EXPERIENCE QUESTIONS
==================================================
==================================================
QUESTION COUNT
==================================================

Generate exactly:

{target_count}

questions.

For a fresher, approximately use:

Technical: {fresher_tech}
Project: {fresher_proj}

For an experienced candidate, approximately use:

Technical: {exp_tech}
Experience: {exp_exp}
Project: {exp_proj}

Adjust only when a category has insufficient resume evidence.

Always return exactly {target_count} questions.

==================================================
STRICT RULES
==================================================

- No duplicate questions.
- No paraphrased duplicates.
- No invented companies.
- No invented projects.
- No invented employment.
- No invented technologies.
- No unsupported candidate claims.
- Every question must relate to the active resume.
- Difficulty must match candidate experience.
- Questions must be practical and interview-ready.

Prefer practical interview questions over textbook definitions.

Avoid generic questions like:

- What is Python?
- What is React?
- What is SQL?

Instead generate questions such as:

- Why did you choose FastAPI instead of Flask?
- How did you optimize your Resume-RAG project?
- Why did you use PostgreSQL?
- Explain the biggest technical challenge in your project.

Every question should sound like it came from a real interviewer reviewing this specific resume.

==================================================
OUTPUT
==================================================

Return valid JSON only.

Do not return markdown.
Do not return explanations.
Do not return code fences.
Do not add keys outside the schema.

Use exactly:

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
