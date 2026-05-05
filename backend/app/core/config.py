"""
EvalForge - Configuration Module
Manages all application settings via environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application settings loaded from environment variables."""

    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./evalforge.db")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # ML Models
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # CORS
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATASETS_DIR: Path = BASE_DIR.parent / "datasets"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"

    def __init__(self):
        # Create upload directory if it doesn't exist
        self.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        self.DATASETS_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
