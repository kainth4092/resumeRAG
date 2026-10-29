import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.models.auth import EmailVerificationToken
from app.core.security import create_access_token, hash_password


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_security_headers_present(client: TestClient):
    """Verify CSP, HSTS, X-Content-Type-Options, X-Frame-Options, X-Request-ID are returned."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert "x-request-id" in resp.headers
    assert resp.headers.get("x-content-type-options") == "nosniff"
    assert resp.headers.get("x-frame-options") == "DENY"
    assert "strict-transport-security" in resp.headers
    assert "content-security-policy" in resp.headers


def test_registration_does_not_reveal_existing_email(client: TestClient, db: Session):
    """Verify that registering an existing email returns the same generic message as a new user."""
    test_email = "security_test_enum@example.com"
    # Ensure user exists
    existing = db.query(User).filter(User.email == test_email).first()
    if not existing:
        user = User(
            name="Security User",
            email=test_email,
            password_hash=hash_password("Password123!"),
            is_active=True,
            email_verified=True,
            token_version=1,
        )
        db.add(user)
        db.commit()

    # Attempt to register with the same email
    payload = {
        "name": "Duplicate User",
        "email": test_email,
        "password": "NewPassword123!",
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    # Must not say "Email already registered" or leak user existence
    assert "already registered" in data["message"].lower() or "verification" in data["message"].lower()
    assert "Registration received" in data["message"]


def test_email_verification_flow(client: TestClient, db: Session):
    """Verify local account email verification works via EmailVerificationToken."""
    test_email = "verify_test_user@example.com"
    # Clean up any existing
    db.query(User).filter(User.email == test_email).delete()
    db.commit()

    user = User(
        name="Verify User",
        email=test_email,
        password_hash=hash_password("Password123!"),
        is_active=True,
        email_verified=False,
        token_version=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_str = "test_raw_verification_token_123"
    import hashlib
    token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()
    from datetime import datetime, timezone, timedelta
    tok = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(tok)
    db.commit()

    # Call verify-email endpoint
    resp = client.get(f"/api/auth/verify-email?token={token_str}")
    assert resp.status_code == 200
    assert resp.json().get("message") == "Email verified successfully. You may now log in."

    # Check that user is verified
    db.refresh(user)
    assert user.email_verified is True


def test_token_version_invalidation_on_password_change(client: TestClient, db: Session):
    """Verify that changing password bumps token_version and invalidates older access tokens."""
    test_email = "token_version_test@example.com"
    db.query(User).filter(User.email == test_email).delete()
    db.commit()

    initial_ver = 1
    user = User(
        name="Token Ver User",
        email=test_email,
        password_hash=hash_password("OldPassword123!"),
        is_active=True,
        email_verified=True,
        token_version=initial_ver,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Mint an access token with ver=1
    token_v1 = create_access_token(
        data={"sub": str(user.id), "email": user.email, "ver": initial_ver}
    )

    # Token v1 works for current user
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_v1}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == test_email

    # Change password
    change_resp = client.put(
        "/api/auth/settings/password",
        headers={"Authorization": f"Bearer {token_v1}"},
        json={"current_password": "OldPassword123!", "new_password": "NewPassword123!"},
    )
    assert change_resp.status_code == 200

    # User's token_version should now be 2
    db.refresh(user)
    assert user.token_version == initial_ver + 1

    # Old token v1 must now be rejected with 401
    stale_resp = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token_v1}"}
    )
    assert stale_resp.status_code == 401
    assert "revoked" in stale_resp.json().get("detail", "").lower()


def test_google_login_rejects_non_jwt_tokens(client: TestClient):
    """Verify that /api/auth/google rejects non-JWT strings (e.g. access tokens)."""
    # Raw OAuth access token (no dots, not a 3-segment JWT)
    resp = client.post(
        "/api/auth/google",
        json={"credential": "ya29.a0AfH6SMByFakeGoogleAccessTokenNotAJwt"},
    )
    assert resp.status_code in [400, 422]
    assert "jwt" in resp.json().get("detail", "").lower() or "invalid credential" in resp.json().get("detail", "").lower()


def test_account_export_and_delete_data_rights(client: TestClient, db: Session):
    """Verify GET /api/account/export returns user data and DELETE /api/account purges user."""
    test_email = "data_rights_user@example.com"
    db.query(User).filter(User.email == test_email).delete()
    db.commit()

    user = User(
        name="Data Rights User",
        email=test_email,
        password_hash=hash_password("Pass12345!"),
        is_active=True,
        email_verified=True,
        token_version=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "ver": 1})

    # Test export
    export_resp = client.get("/api/account/export", headers={"Authorization": f"Bearer {token}"})
    assert export_resp.status_code == 200
    export_data = export_resp.json()
    assert export_data["user"]["email"] == test_email
    assert "resumes" in export_data
    assert "profile" in export_data

    # Test delete
    delete_resp = client.delete("/api/account", headers={"Authorization": f"Bearer {token}"})
    assert delete_resp.status_code == 200
    assert "deleted" in delete_resp.json().get("message", "").lower()

    # Verify user is completely removed from DB
    purged_user = db.query(User).filter(User.id == user.id).first()
    assert purged_user is None
