from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg://", 1
)


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def migrate_user_identity_column():
    if not inspect(engine).has_table("users"):
        return

    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "email" in columns and "username" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users RENAME COLUMN email TO username"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()