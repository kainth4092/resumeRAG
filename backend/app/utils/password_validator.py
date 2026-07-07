import re

PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])"
    r"(?=.*[A-Z])"
    r"(?=.*\d)"
    r'(?=.*[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~])'
    r".{8,}$"
)


def validate_password(password: str):
    if " " in password:
        raise ValueError("Password must not contain spaces.")

    if not PASSWORD_REGEX.match(password):
        raise ValueError(
            "Password must be at least 8 characters long and contain "
            "one uppercase letter, one lowercase letter, "
            "one number and one special character."
        )
