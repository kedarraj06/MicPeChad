import os
import uuid
import logging
from fastapi import APIRouter, HTTPException, Request
from app.config import settings
from app.schemas import TTSRequest, TTSResponse, VoiceListResponse, VoiceInfo
from app.tts_engine import TTSService

# Configure logger
logger = logging.getLogger("MicPeChad.routes.audio")

# Create API router
router = APIRouter()

@router.get("/voices", response_model=VoiceListResponse)
async def get_voices():
    """Retrieves all unified voice style presets available in MicPeChad."""
    try:
        voices_data = TTSService.get_available_voices()
        voices = [VoiceInfo(**voice) for voice in voices_data]
        return VoiceListResponse(success=True, voices=voices)
    except Exception as e:
        logger.error(f"Error fetching voices: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching voice profiles.")

@router.post("/generate-audio", response_model=TTSResponse)
async def generate_audio(payload: TTSRequest, request: Request):
    """
    Synthesizes custom text to speech using a voice style.
    Handles cache file creations and maps return urls.
    """
    text = payload.text.strip()
    voice_id = payload.voice_id
    
    # 1. Enforce length constraints
    if len(text) > settings.MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400, 
            detail=f"Text input exceeds maximum limit of {settings.MAX_TEXT_LENGTH} characters."
        )

    # 2. Ensure target cache directory exists
    audio_dir = settings.GENERATED_AUDIO_DIR
    try:
        os.makedirs(audio_dir, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to create audio cache directory {audio_dir}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize backend storage.")

    # 3. Create unique file paths
    file_id = uuid.uuid4().hex
    
    # We first generate the file as a wav or mp3 depending on what the active engines support.
    # edge-tts generates .mp3 natively; pyttsx3 & Coqui TTS generate .wav natively.
    # We will initialize the output path with a neutral wave file, and let the synthesis service modify or write it.
    output_filename = f"speech_{file_id}.wav"
    temp_output_path = os.path.join(audio_dir, output_filename)
    
    logger.info(f"Initiating speech synthesis for {len(text)} characters.")
    
    # 4. Invoke Synthesis Service
    synthesis_result = TTSService.synthesize(text, voice_id, temp_output_path)
    
    if not synthesis_result["success"]:
        logger.error(f"Synthesis failed: {synthesis_result['error']}")
        return TTSResponse(
            success=False,
            audio_url=None,
            voice_used=voice_id,
            engine_used=synthesis_result["engine"],
            generation_duration_seconds=synthesis_result["duration"],
            error=synthesis_result["error"]
        )

    # 5. Check if output file was generated with a different format (e.g. edge-tts writes mp3 directly)
    # If the file path generated was changed or is named differently, we adapt.
    actual_filename = output_filename
    actual_file_path = temp_output_path

    # If the engine generated an MP3 directly (e.g. edge-tts), it might have saved it as the requested path but with raw mp3 headers,
    # or it might have renamed it. Let's inspect the files.
    if synthesis_result["engine"] == "edge-tts":
        # edge-tts writes mp3 directly. We rename the file to have a proper .mp3 extension for browser support
        mp3_filename = f"speech_{file_id}.mp3"
        mp3_path = os.path.join(audio_dir, mp3_filename)
        try:
            if os.path.exists(temp_output_path):
                os.rename(temp_output_path, mp3_path)
                actual_filename = mp3_filename
                actual_file_path = mp3_path
        except Exception as rename_err:
            logger.warning(f"Failed to rename edge-tts wav temp file to mp3: {str(rename_err)}")

    # 6. Optional high-quality Pydub MP3 transcoding if system FFmpeg is available
    # We try converting local .wav outputs (from pyttsx3 or Coqui) to .mp3 to save bandwidth and improve playback speed,
    # but fall back gracefully to the original .wav if FFmpeg isn't configured.
    if synthesis_result["engine"] in ["coqui", "pyttsx3"]:
        try:
            from pydub import AudioSegment
            mp3_filename = f"speech_{file_id}.mp3"
            mp3_path = os.path.join(audio_dir, mp3_filename)
            
            logger.info("Transcoding raw WAV output to compressed MP3...")
            sound = AudioSegment.from_wav(actual_file_path)
            sound.export(mp3_path, format="mp3")
            
            # Remove raw wav cache to save disk space
            if os.path.exists(actual_file_path):
                os.remove(actual_file_path)
                
            actual_filename = mp3_filename
            actual_file_path = mp3_path
            logger.info("Transcoding finished successfully.")
        except Exception as transcode_err:
            logger.warning(
                f"Pydub WAV-to-MP3 transcoding skipped. System FFmpeg might not be installed or on PATH. "
                f"Serving raw WAV file directly. Detail: {str(transcode_err)}"
            )

    # 7. Formulate static downloadable URL
    base_url = str(request.base_url)
    # FastAPI serves static content via the mounted path /audio
    audio_url = f"{base_url}audio/{actual_filename}"
    
    logger.info(f"Speech synthesis completed successfully. File: {actual_filename} ({synthesis_result['engine']})")
    
    return TTSResponse(
        success=True,
        audio_url=audio_url,
        voice_used=voice_id,
        engine_used=synthesis_result["engine"],
        generation_duration_seconds=synthesis_result["duration"],
        error=None
    )
