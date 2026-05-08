from pathlib import Path
from dotenv import load_dotenv

try:
    from pydantic import BaseSettings
except ImportError:  # Pydantic v2+ compatibility
    from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    APP_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    JWT_ENABLED: bool = False
    JWT_SECRET: str = ""
    DEPARTAMENTO: str = "Caldas"
    SQLSERVER_CONN: str
    POSTGRES_CONN: str
    MODEL_DIR: str = "./models"
    MODEL_BROTES_PATH: str = "./models/brotes/brotes_model.pkl"
    MODEL_DEMANDA_PATH: str = "./models/demanda/demanda_model.pkl"
    MODEL_ANOMALIAS_PATH: str = "./models/anomalias/anomalia_model.pkl"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

    @property
    def ENV(self) -> str:
        return self.APP_ENV

settings = Settings()
