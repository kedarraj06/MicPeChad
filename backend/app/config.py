import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    HOST: str = Field(default="0.0.0.0", description="FastAPI host address")
    PORT: int = Field(default=8000, description="FastAPI port")
    CORS_ORIGINS: str = Field(default="http://localhost:5173", description="Comma-separated CORS allowed origins")
    GENERATED_AUDIO_DIR: str = Field(default="app/generated_audio", description="Directory to save generated audio files")
    MAX_TEXT_LENGTH: int = Field(default=500, description="Max length of text characters allowed for generation")
    AUDIO_CLEANUP_INTERVAL_MINUTES: int = Field(default=15, description="Interval in minutes to clean up old audio files")
    AUDIO_RETENTION_HOURS: int = Field(default=1, description="Retention duration for generated files in hours")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parses the CORS_ORIGINS string into a list of origins."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

# Global configuration instance
settings = Settings()
