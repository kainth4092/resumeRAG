import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def run():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Checking if is_active column exists...")
        conn.execute(text("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;"))
        conn.commit()
        print("Successfully added is_active column if it didn't exist.")

if __name__ == "__main__":
    run()
