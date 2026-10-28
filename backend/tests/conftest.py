import os
import pytest
from fastapi.testclient import TestClient

# Ensure test settings before importing app
os.environ["ENVIRONMENT"] = "development"
os.environ["JWT_SECRET"] = "test-secret-at-least-32-chars-long"

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
