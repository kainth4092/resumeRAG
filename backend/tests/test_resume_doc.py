from app.schemas.resume_doc import ResumeDoc, to_resume_doc, resume_doc_to_text


def test_resume_doc_defaults():
    doc = ResumeDoc()
    assert doc.schema_version == 1
    assert doc.contact.name == ""
    assert doc.skills == []
    assert doc.experience == []
    assert doc.education == []


def test_to_resume_doc_legacy_generator_shape():
    legacy_data = {
        "personal_info": {
            "name": "Jane Developer",
            "email": "jane@example.com",
            "phone": "555-0100",
            "location": "San Francisco, CA",
            "linkedin": "https://linkedin.com/in/janedev",
            "github": "https://github.com/janedev",
            "portfolio": "https://janedev.io",
        },
        "headline": "Full Stack Engineer",
        "summary": "Experienced engineer specializing in distributed systems.",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Senior Engineer",
                "duration": "2021 – Present",
                "description": ["Engineered microservices handling 50k RPS."],
            }
        ],
        "projects": [
            {
                "title": "Cloud Manager",
                "technologies": "Docker, Kubernetes, Go",
                "description": ["Automated container provisioning."],
                "github": "https://github.com/janedev/cloud-mgr",
            }
        ],
        "education": [
            {
                "institution": "State University",
                "degree": "B.S. in Computer Science",
                "start_year": "2015",
                "end_year": "2019",
            }
        ],
    }

    doc = to_resume_doc(legacy_data)
    assert isinstance(doc, ResumeDoc)
    assert doc.contact.name == "Jane Developer"
    assert doc.contact.portfolio == "https://janedev.io"
    assert doc.headline == "Full Stack Engineer"
    assert len(doc.experience) == 1
    assert doc.experience[0].company == "Tech Corp"
    assert doc.experience[0].current is True
    assert doc.experience[0].start == "2021"
    assert len(doc.projects) == 1
    assert "Docker" in doc.projects[0].technologies
    assert len(doc.education) == 1
    assert doc.education[0].end == "2019"


def test_to_resume_doc_editor_shape():
    editor_data = {
        "contact": {
            "name": "Alex Code",
            "email": "alex@code.io",
        },
        "work_experience": [
            {
                "employer": "Startup Ltd",
                "title": "Backend Lead",
                "startYear": "2019",
                "endYear": "2021",
                "bullets": ["Scaled database queries by 30%."],
            }
        ],
        "skills": [{"name": "Python"}, {"name": "Docker"}],
    }

    doc = to_resume_doc(editor_data)
    assert doc.contact.name == "Alex Code"
    assert len(doc.experience) == 1
    assert doc.experience[0].company == "Startup Ltd"
    assert doc.experience[0].role == "Backend Lead"
    assert doc.experience[0].start == "2019"
    assert doc.experience[0].end == "2021"
    assert doc.skills == ["Python", "Docker"]


def test_resume_doc_to_text():
    doc = to_resume_doc({
        "contact": {"name": "Bob Dev", "email": "bob@dev.com"},
        "headline": "Lead Architect",
        "skills": ["Rust", "Python"],
    })
    text = resume_doc_to_text(doc)
    assert "NAME: Bob Dev" in text
    assert "CONTACT: bob@dev.com" in text
    assert "HEADLINE: Lead Architect" in text
    assert "SKILLS: Rust, Python" in text
