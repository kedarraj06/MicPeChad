from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class TTSRequest(BaseModel):
    text: str = Field(
        ..., 
        description="The text to generate speech for", 
        min_length=1
    )
    voice_id: str = Field(
        ..., 
        description="The ID of the voice style to use"
    )

    @field_validator("text")
    @classmethod
    def validate_text_length(cls, v: str) -> str:
        from app.config import settings
        max_len = settings.MAX_TEXT_LENGTH
        if len(v) > max_len:
            raise ValueError(f"Text exceeds the maximum length of {max_len} characters.")
        return v

class TTSResponse(BaseModel):
    success: bool = Field(..., description="Whether synthesis succeeded")
    audio_url: Optional[str] = Field(None, description="The URL of the generated audio relative to host")
    voice_used: str = Field(..., description="The voice ID actually utilized")
    engine_used: str = Field(..., description="The synthesis engine utilized (coqui, pyttsx3, or edge-tts)")
    generation_duration_seconds: float = Field(..., description="Time taken to generate the speech")
    error: Optional[str] = Field(None, description="Error message in case of failure")

class VoiceInfo(BaseModel):
    id: str = Field(..., description="Unique voice identifier")
    name: str = Field(..., description="User-friendly name of the voice")
    gender: str = Field(..., description="Gender of the voice speaker (Male/Female/Neutral)")
    description: str = Field(..., description="Style or character profile (e.g. Podcast, Deep, Soft)")
    engine: str = Field(..., description="Engine providing this voice (coqui, pyttsx3, or edge-tts)")

class VoiceListResponse(BaseModel):
    success: bool = Field(..., description="Whether lookup succeeded")
    voices: List[VoiceInfo] = Field(..., description="List of available voice presets")
