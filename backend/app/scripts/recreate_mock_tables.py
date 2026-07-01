import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import text
from app.core.database import engine, Base
import app.models


def main():
    print("Connecting to database to drop and recreate mock interview tables...")
    try:
        # We drop both tables in correct dependency order
        connection = engine.connect()
        transaction = connection.begin()

        connection.execute(text("DROP TABLE IF EXISTS mock_interview_answers CASCADE;"))
        connection.execute(
            text("DROP TABLE IF EXISTS mock_interview_sessions CASCADE;")
        )

        transaction.commit()
        connection.close()
        print("Dropped existing mock tables successfully.")

        Base.metadata.create_all(bind=engine)
        print("Recreated mock tables with correct normalized schemas successfully.")
    except Exception as e:
        print(f"Error recreating tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
