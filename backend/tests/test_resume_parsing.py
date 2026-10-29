import json
import os
from app.resume.services.resume_parsing_pipeline import parse_resume_pipeline, verify_parsed_resume
from app.schemas.resume_doc import to_resume_doc


def test_parsing_regression_anonymized_fixture():
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "anonymized_resume_1.json")
    assert os.path.exists(fixture_path), f"Fixture not found at {fixture_path}"

    with open(fixture_path, "r") as f:
        data = json.load(f)

    parsed_text = data["parsed_text"]
    assert len(parsed_text) > 1000

    # Test pipeline (with local fallback if no live LLM API key present)
    doc, warnings = parse_resume_pipeline(parsed_text)
    assert doc is not None
    assert doc.schema_version == 1

    # Verify candidate name was parsed or matched safely
    if doc.contact.name:
        assert "Alex Doe" in doc.contact.name or len(doc.contact.name.split()) >= 2


def test_deterministic_verification_drops_hallucinated_email():
    raw_text = "John Doe is a Python Developer living in Seattle, WA. Contact at john.doe@realdomain.com"
    doc = to_resume_doc({
        "contact": {
            "name": "John Doe",
            "email": "hallucinated.fake@notfound.com",  # NOT in raw_text!
        }
    })

    verified_doc, warnings = verify_parsed_resume(doc, raw_text)
    # The hallucinated email must be dropped and warned
    assert verified_doc.contact.email == ""
    assert any("was not found in source text and was removed" in w for w in warnings)


def test_deterministic_verification_preserves_verified_email():
    raw_text = "Jane Doe. Email: jane@verified.org. Software Developer."
    doc = to_resume_doc({
        "contact": {
            "name": "Jane Doe",
            "email": "jane@verified.org",
        }
    })

    verified_doc, warnings = verify_parsed_resume(doc, raw_text)
    assert verified_doc.contact.email == "jane@verified.org"
