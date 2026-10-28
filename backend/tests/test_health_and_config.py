import pytest
from app.core.config import Settings


def test_health_check_liveness(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_check_readiness(client):
    response = client.get("/ready")
    assert response.status_code in (200, 503)
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "ai_provider" in data


def test_production_jwt_secret_validation():
    # In production, JWT_SECRET < 32 must raise ValueError
    with pytest.raises(ValueError, match="JWT_SECRET must be at least 32 characters in production."):
        Settings(
            DATABASE_URL="postgresql://localhost/dummy",
            JWT_SECRET="short-secret",
            ENVIRONMENT="production",
        )

    # Valid secret in production
    valid_settings = Settings(
        DATABASE_URL="postgresql://localhost/dummy",
        JWT_SECRET="this-is-a-valid-secure-secret-32-chars-or-more",
        ENVIRONMENT="production",
    )
    assert valid_settings.JWT_SECRET == "this-is-a-valid-secure-secret-32-chars-or-more"


def test_cors_origins_isolation():
    dev_settings = Settings(
        DATABASE_URL="postgresql://localhost/dummy",
        JWT_SECRET="dummy-secret",
        ENVIRONMENT="development",
        FRONTEND_URL="https://app.custom.com",
    )
    assert "https://app.custom.com" in dev_settings.cors_origins
    assert "http://localhost:5173" in dev_settings.cors_origins

    prod_settings = Settings(
        DATABASE_URL="postgresql://localhost/dummy",
        JWT_SECRET="this-is-a-valid-secure-secret-32-chars-or-more",
        ENVIRONMENT="production",
        FRONTEND_URL="https://app.custom.com",
    )
    assert "https://app.custom.com" in prod_settings.cors_origins
    assert "http://localhost:5173" not in prod_settings.cors_origins
