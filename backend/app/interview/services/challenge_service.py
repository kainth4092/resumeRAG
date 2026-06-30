import random
from sqlalchemy.orm import Session
from sqlalchemy import or_, String
from app.models.interview_bank import InterviewQuestionBank


class ChallengeService:
    @staticmethod
    def _prioritize_and_shuffle(questions, target_companies):
        priority = []
        normal = []
        companies_lower = [c.lower() for c in target_companies]

        for q in questions:
            is_priority = False
            company_str = (q.company or "").lower()
            tags_str = str(q.tags or "").lower()
            for comp in companies_lower:
                if comp in company_str or comp in tags_str:
                    is_priority = True
                    break
            if is_priority:
                priority.append(q)
            else:
                normal.append(q)

        random.shuffle(priority)
        random.shuffle(normal)
        return priority + normal

    @staticmethod
    def _ensure_mcq_data(db: Session, q):
        # If already populated with concise options, return
        if q.option_a and q.option_b and q.option_c and q.option_d and q.correct_option:
            return

        try:
            from app.services.llm_service import client, extract_json

            prompt = f"""
            You are a Senior Software Engineering Interviewer designing a moderate-difficulty Multiple Choice Question (MCQ) for a FAANG/MAANG-style online assessment.
            
            Convert the following technical interview question and descriptive answer into a highly professional, balanced MCQ.
            
            Technical Question: {q.question}
            Descriptive Answer: {q.answer}
            Skill: {q.skill}
            
            Design Guidelines:
            1. **Moderate Difficulty**: The question should assess practical/conceptual understanding suitable for 0-3 years of experience. Focus on trade-offs, behaviors, or realistic scenarios.
            2. **Plausible Distractors (Believable, Same Domain)**:
               - The incorrect options must be technically valid concepts within the {q.skill} domain.
               - They should look highly believable and represent common misconceptions or alternative approaches.
               - Never mix unrelated technologies or skills (e.g., if the skill is {q.skill}, do not reference other domains like SQL, Docker, or React unless comparing).
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

            # Call client with a timeout / try exactly once to avoid blocking the user
            response = client.chat.completions.create(
                model="google/gemma-4-31b-it:free",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Senior Software Engineering Interviewer. Always return valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,
                timeout=5.0,
            )
            raw = response.choices[0].message.content
            if not raw:
                raise Exception("LLM did not return any content")

            parsed = extract_json(raw)
            q.option_a = parsed.get("option_a").strip()
            q.option_b = parsed.get("option_b").strip()
            q.option_c = parsed.get("option_c").strip()
            q.option_d = parsed.get("option_d").strip()
            q.correct_option = parsed.get("correct_option").strip().upper()
            q.short_explanation = parsed.get("short_explanation").strip()
            q.distractor_explanations = parsed.get("distractor_explanations")
            db.commit()
        except Exception as e:
            # Rollback transaction on failure
            db.rollback()
            # Generate high-quality local fallback options derived from the original descriptive answer
            ans_clean = q.answer.strip()
            # Split by double newline first to separate paragraphs, then replace single newlines with spaces
            paragraphs = [p.strip().replace("\n", " ") for p in ans_clean.split("\n\n") if p.strip()]
            first_paragraph = paragraphs[0] if paragraphs else ans_clean.replace("\n", " ")
            
            # Clean up extra spaces
            first_paragraph = " ".join(first_paragraph.split())
            
            if len(first_paragraph) <= 150:
                correct_statement = first_paragraph
            else:
                import re
                sentences = re.split(r'[.!?](?=\s|$)', first_paragraph)
                first_sentence = sentences[0].strip()
                if first_sentence:
                    correct_statement = first_sentence + "."
                else:
                    correct_statement = first_paragraph[:150].strip() + "."

            # Define high-quality technical distractors per skill
            skill_distractors = {
                "react": [
                    {"text": "It forces a synchronous re-render of all children components immediately.", "explanation": "React batches state updates and executes rendering asynchronously; it does not force immediate synchronous renders of the entire child tree."},
                    {"text": "It compiles the components directly into web assembly for faster execution.", "explanation": "React compiles components into standard browser-compatible JavaScript/HTML/CSS, not WebAssembly."},
                    {"text": "It bypasses the virtual DOM to write directly to the user interface.", "explanation": "React relies on the Virtual DOM to reconcile state changes before modifying the actual DOM."},
                    {"text": "It stores component state in the local storage of the browser automatically.", "explanation": "React state is stored in memory and reset on reload; local storage persistence requires explicit custom hooks."},
                    {"text": "It prevents any props from being passed down to child components.", "explanation": "React components naturally support passing props downward as part of unidirectional data flow."}
                ],
                "javascript": [
                    {"text": "It converts all synchronous operations into separate operating system threads.", "explanation": "JavaScript is single-threaded and executes synchronous code on the main call stack, not on separate threads."},
                    {"text": "It automatically garbage collects all variables when they go out of block scope.", "explanation": "JavaScript garbage collection is based on reachability and references, not strictly on immediate block exit."},
                    {"text": "It compiles JS code to machine instructions before sending it to the client.", "explanation": "JavaScript is sent as plain source code to the client and compiled/interpreted by the browser's engine."},
                    {"text": "It allows direct manipulation of physical RAM addresses for efficiency.", "explanation": "JavaScript operates in a sandboxed runtime environment and does not allow raw physical memory addressing."},
                    {"text": "It halts execution of the main thread until all network promises resolve.", "explanation": "JavaScript's event loop handles promises asynchronously without blocking the execution of the main thread."}
                ],
                "html": [
                    {"text": "It compiles layout structures into optimized CSS selectors automatically.", "explanation": "HTML defines structure and semantics; it has no mechanism to compile CSS selectors."},
                    {"text": "It executes client-side database queries directly from tag attributes.", "explanation": "HTML is a markup language and cannot query databases directly; JavaScript or backend APIs are required."},
                    {"text": "It establishes secure cryptographic tunnels between client and host.", "explanation": "Secure cryptographic tunnels are handled by the transport protocol (HTTPS/TLS), not by HTML elements."},
                    {"text": "It defines the styling and presentation layer of the web application.", "explanation": "Styling and presentation are handled by CSS, whereas HTML is restricted to semantic markup."},
                    {"text": "It stores persistent key-value session state inside the DOM elements.", "explanation": "Persistent session state is stored in cookies or web storage API, not directly in HTML elements."}
                ],
                "css": [
                    {"text": "It parses JavaScript functions to dynamically render vector graphics.", "explanation": "CSS cannot execute or parse JavaScript; vector graphics rendering is handled by SVG or Canvas."},
                    {"text": "It processes server-side templates before they are sent to the user browser.", "explanation": "CSS is a client-side styling language processed entirely by the user's browser, not the server."},
                    {"text": "It handles client-side state management and database connections.", "explanation": "CSS has no capabilities for state management or network communication; JavaScript must be used instead."},
                    {"text": "It executes HTTP requests to fetch page assets asynchronously.", "explanation": "Asset loading is initiated by HTML parser or JavaScript, not directly executed by CSS logic."},
                    {"text": "It compiles semantic HTML layout structures into machine-readable XML.", "explanation": "CSS applies visual styles to existing document trees; it does not compile HTML into XML."}
                ],
                "python": [
                    {"text": "It compiles all module functions into native C++ classes at runtime.", "explanation": "Python executes code via an interpreter or bytecode compiler, not by translating modules to C++."},
                    {"text": "It automatically manages asynchronous task threads using the hardware scheduler.", "explanation": "Python handles concurrency via user-space event loops or the OS thread scheduler, not hardware levels."},
                    {"text": "It bypasses the Global Interpreter Lock (GIL) for all CPU-bound operations.", "explanation": "Python's GIL restricts execution to a single thread in CPython, requiring multiprocessing to bypass."},
                    {"text": "It executes static type analysis and rejects code with type mismatches.", "explanation": "Python is dynamically typed and executes code regardless of type annotations; type checkers are external tools."},
                    {"text": "It stores all global variables in the browser session storage.", "explanation": "Python is a backend/general language; it does not store variables in the browser storage."}
                ],
                "fastapi": [
                    {"text": "It uses Django's template engine to render HTML views server-side.", "explanation": "FastAPI is a lightweight API framework; it does not include or rely on Django's template engine."},
                    {"text": "It forces all endpoint requests to execute in a single synchronous process.", "explanation": "FastAPI natively supports asynchronous concurrency using async/await and standard python thread pools."},
                    {"text": "It compiles Python decorators to native Node.js event loops.", "explanation": "FastAPI runs on Uvicorn/ASGI Python event loops, and is unrelated to Node.js."},
                    {"text": "It manages client-side routing and state hydration automatically.", "explanation": "FastAPI is a backend API framework and does not handle client-side router hydration."},
                    {"text": "It prevents asynchronous database calls to maintain thread safety.", "explanation": "FastAPI fully supports and encourages async database clients and async route operations."}
                ],
                "flask": [
                    {"text": "It provides built-in client-side state management and component rendering.", "explanation": "Flask is a backend micro-framework and does not render interactive client-side components."},
                    {"text": "It compiles Python scripts directly to browser-executable JavaScript.", "explanation": "Flask serves files to the client; it does not translate or compile Python into JavaScript."},
                    {"text": "It automatically scales the database connection pool across multiple machines.", "explanation": "Flask does not manage distributed database clusters; database pooling is managed by SQLAlchemy."},
                    {"text": "It is an asynchronous-first framework that requires ASGI servers.", "explanation": "Flask is historically synchronous (WSGI-based), though it has added limited async support recently."},
                    {"text": "It implements strict static type checking for all route parameters.", "explanation": "Flask processes route parameters dynamically at runtime and does not perform static compile-time typing."}
                ],
                "typescript": [
                    {"text": "It executes type checking at runtime inside the browser environment.", "explanation": "TypeScript types are completely erased during compilation; no runtime type checking exists in the browser."},
                    {"text": "It compiles the codebase into highly optimized binary executables.", "explanation": "TypeScript compiles down to standard JavaScript source files, not binary executables."},
                    {"text": "It allows developers to bypass the JavaScript execution engine completely.", "explanation": "TypeScript runs on standard JavaScript engines (V8, JavaScriptCore) after compilation to JS."},
                    {"text": "It registers global event listeners to check variable mutations.", "explanation": "TypeScript is a static analysis tool and does not register runtime variable mutation watchers."},
                    {"text": "It forces the browser to run in a strict sandboxed memory space.", "explanation": "TypeScript compilation has no effect on the browser's native security sandboxing or memory allocation."}
                ],
                "docker": [
                    {"text": "It compiles the host operating system kernel into a virtual hardware image.", "explanation": "Docker containers share the host operating system kernel instead of compiling a virtual kernel."},
                    {"text": "It runs applications in a remote cloud environment rather than locally.", "explanation": "Docker runs containers locally on the host machine using native OS namespaces and cgroups."},
                    {"text": "It replaces the physical CPU scheduler with a virtual container process.", "explanation": "Docker relies on the host OS kernel scheduler to allocate CPU time to container processes."},
                    {"text": "It establishes a secure hardware sandbox using virtual machines.", "explanation": "Docker uses operating system level virtualization (cgroups and namespaces), not hardware virtual machines."},
                    {"text": "It automatically deploys frontend source code changes to the live CDN.", "explanation": "Docker containerizes applications; it has no built-in CDN deployment functionality."}
                ],
                "postgresql": [
                    {"text": "It caches all table indexes in the browser's indexedDB storage.", "explanation": "PostgreSQL is a server-side database; it caches indexes in its own shared buffers, not the browser."},
                    {"text": "It executes Javascript functions directly on the client side CPU.", "explanation": "PostgreSQL queries are executed on the database server, not on the client's CPU."},
                    {"text": "It stores all relational table rows in unstructured plain text files.", "explanation": "PostgreSQL stores data in structured binary page files, using specific layout schemas for data pages."},
                    {"text": "It restricts all queries to single-table scans without JOIN support.", "explanation": "PostgreSQL is a relational database with robust, optimized support for complex multi-table JOINs."},
                    {"text": "It converts all SQL queries into MongoDB document requests.", "explanation": "PostgreSQL natively compiles and executes SQL queries using its own relational engine."}
                ],
                "git": [
                    {"text": "It hosts the web application on a distributed cloud CDN automatically.", "explanation": "Git is a version control system and does not compile or host web applications on a CDN."},
                    {"text": "It translates code files into browser-compatible JavaScript syntax.", "explanation": "Git tracks file changes; it does not modify or compile file contents or syntax."},
                    {"text": "It monitors user activity and keystrokes in real-time.", "explanation": "Git only records changes when explicit commands like commit are run; it has no keystroke monitoring."},
                    {"text": "It compiles development branches into optimized production bundles.", "explanation": "Git manages code branches and history; it does not build or bundle production assets."},
                    {"text": "It runs automated unit tests on the user's local machine before saving.", "explanation": "Git does not run tests automatically unless pre-commit hooks are explicitly configured."}
                ]
            }

            general_distractors = [
                {"text": "It optimizes runtime performance by allocating additional physical CPU cores.", "explanation": "Software logic cannot allocate physical CPU cores; core allocation is managed by the OS kernel and hardware."},
                {"text": "It compiles the source code modules into dynamic shared library files.", "explanation": "Web applications compile to web assets or run interpreted, not as dynamic shared libraries."},
                {"text": "It schedules execution blocks using a custom queue scheduler.", "explanation": "Task scheduling is managed by event loops or operating systems, not by individual code features."},
                {"text": "It handles asynchronous event propagation across the app layers.", "explanation": "This feature manages static structure or data, and does not handle runtime event propagation."},
                {"text": "It registers event listeners to track resource mutations dynamically.", "explanation": "This feature has no mechanism to watch or listen for external resource mutations."}
            ]

            skill_key = (q.skill or "").strip().lower()
            distractors = skill_distractors.get(skill_key, general_distractors)

            # Pick 3 random distractors
            chosen = random.sample(distractors, min(3, len(distractors)))
            while len(chosen) < 3:
                chosen.append(random.choice(general_distractors))

            # Randomize correct option position
            correct_idx = random.randint(0, 3)
            options = [""] * 4
            options[correct_idx] = correct_statement
            
            letters = ["A", "B", "C", "D"]
            dist_exps = {}
            dist_exps[letters[correct_idx]] = ""

            distractor_idx = 0
            for i in range(4):
                if i != correct_idx:
                    options[i] = chosen[distractor_idx]["text"]
                    dist_exps[letters[i]] = chosen[distractor_idx]["explanation"]
                    distractor_idx += 1

            q.option_a = options[0]
            q.option_b = options[1]
            q.option_c = options[2]
            q.option_d = options[3]
            q.correct_option = letters[correct_idx]
            q.short_explanation = f"Explanation fallback: {q.answer}"
            q.distractor_explanations = dist_exps
            try:
                db.commit()
            except Exception:
                db.rollback()

    @staticmethod
    def get_challenge_questions(db: Session):
        target_companies = [
            "FAANG",
            "MAANG",
            "Amazon",
            "Google",
            "Meta",
            "Microsoft",
            "Apple",
            "Netflix",
            "Uber",
            "Atlassian",
        ]

        # Fetch all technical questions
        base_query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category == "Technical"
        )
        all_qs = base_query.all()

        # Group by skill
        grouped = {}
        for q in all_qs:
            skill = q.skill or "General"
            grouped.setdefault(skill, []).append(q)

        # Shuffle questions for each skill with company prioritization
        for skill in grouped:
            grouped[skill] = ChallengeService._prioritize_and_shuffle(
                grouped[skill], target_companies
            )

        skills = list(grouped.keys())
        random.shuffle(skills)

        target = 20
        selected_qs = None

        # Try N from 10 down to 7 (to get 20 questions with 2-3 questions per represented skill)
        for N in range(min(10, len(skills)), 6, -1):
            candidate_skills = skills[:N]
            x = target - 2 * N
            if 0 <= x <= N:
                qs = []
                success = True
                for i, skill in enumerate(candidate_skills):
                    count = 3 if i < x else 2
                    if len(grouped[skill]) >= count:
                        qs.extend(grouped[skill][:count])
                    else:
                        success = False
                        break
                if success:
                    selected_qs = qs
                    break

        # Fallback if balanced selection logic fails
        if not selected_qs:
            random.shuffle(all_qs)
            selected_qs = all_qs[:20]

        # Ensure selected questions have MCQ data populated (lazy generation)
        for q in selected_qs:
            ChallengeService._ensure_mcq_data(db, q)

        response_questions = []
        for q in selected_qs:
            response_questions.append(
                {
                    "id": q.id,
                    "question": q.question,
                    "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                    "correct_option": q.correct_option,
                    "explanation": q.short_explanation,
                    "distractor_explanations": q.distractor_explanations,
                    "skill": q.skill,
                    "category": q.category,
                    "experience_level": q.experience_level,
                    "company": q.company,
                    "tags": q.tags,
                }
            )

        return response_questions

    @staticmethod
    def submit_challenge(payload: dict):
        answers = payload.get("answers", [])
        time_taken_seconds = payload.get("time_taken", 0)

        correct = 0
        wrong = 0
        skipped = 0
        wrong_skills = []

        for ans in answers:
            sel = ans.get("selected_option")
            corr = ans.get("correct_option")
            skill = ans.get("skill", "General")

            if not sel:
                skipped += 1
            elif sel == corr:
                correct += 1
            else:
                wrong += 1
                wrong_skills.append(skill)

        total_attempted = correct + wrong
        accuracy = (correct / total_attempted * 100) if total_attempted > 0 else 0.0

        # Map skill to relevant revision topics
        skill_topic_map = {
            "react": "React Hooks",
            "sql": "SQL JOIN",
            "postgresql": "SQL JOIN",
            "javascript": "Closures",
            "python": "Async Await",
            "fastapi": "Async Await",
            "html": "Semantic HTML",
            "css": "CSS Flexbox & Grid",
            "dbms": "Database Normalization",
            "oop": "OOP Principles",
        }

        topics_to_revise = []
        for s in wrong_skills:
            topic = skill_topic_map.get(s.strip().lower(), f"{s} Fundamentals")
            if topic not in topics_to_revise:
                topics_to_revise.append(topic)

        minutes = time_taken_seconds // 60
        seconds = time_taken_seconds % 60
        time_taken_str = f"{minutes:02d}:{seconds:02d}"

        return {
            "score": correct,
            "accuracy": round(accuracy, 1),
            "correct": correct,
            "wrong": wrong,
            "skipped": skipped,
            "time_taken": time_taken_str,
            "topics_to_revise": topics_to_revise,
        }
