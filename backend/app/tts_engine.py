import os
import time
import logging
import threading
import asyncio
from typing import Dict, Any

# Configure logger
logger = logging.getLogger("MicPeChad.tts_engine")

# Thread safety lock for sequential CPU-intensive TTS generation
_tts_lock = threading.Lock()

# Global cached Coqui TTS model instance
_coqui_model = None
_coqui_init_failed = False

class TTSService:
    # Voice mapping profiles across the different engines
    VOICE_PROFILES = {
        "male_deep": {
            "name": "Male Deep Voice",
            "gender": "Male",
            "description": "Rich, resonant, and low-pitched male voice.",
            "coqui_speaker": "p226",  # VCTK male speaker id (if multi-speaker is loaded)
            "pyttsx3_gender": "male",
            "edge_voice": "en-US-GuyNeural"
        },
        "female_soft": {
            "name": "Female Soft Voice",
            "gender": "Female",
            "description": "Gentle, calm, and soothing female voice.",
            "coqui_speaker": "p225",  # VCTK female speaker id
            "pyttsx3_gender": "female",
            "edge_voice": "en-US-JennyNeural"
        },
        "podcast": {
            "name": "Podcast Voice",
            "gender": "Male",
            "description": "Clear, professional, broadcast-style conversational tone.",
            "coqui_speaker": "p232",
            "pyttsx3_gender": "male",
            "edge_voice": "en-US-ChristopherNeural"
        },
        "storytelling": {
            "name": "Storytelling Voice",
            "gender": "Female",
            "description": "Expressive and engaging narrator voice.",
            "coqui_speaker": "p250",
            "pyttsx3_gender": "female",
            "edge_voice": "en-US-MichelleNeural"
        },
        "motivational": {
            "name": "Motivational Voice",
            "gender": "Male",
            "description": "Energetic, inspiring, and powerful delivery.",
            "coqui_speaker": "p260",
            "pyttsx3_gender": "male",
            "edge_voice": "en-US-SteffanNeural"
        }
    }

    @classmethod
    def get_available_voices(cls) -> list:
        """Returns metadata of all voice styles available in the application."""
        voices = []
        for vid, profile in cls.VOICE_PROFILES.items():
            # In our system, the voice options are unified and resolved dynamically by the active engine
            voices.append({
                "id": vid,
                "name": profile["name"],
                "gender": profile["gender"],
                "description": profile["description"],
                "engine": "dynamic-resolver"
            })
        return voices

    @classmethod
    def synthesize(cls, text: str, voice_id: str, output_path: str) -> Dict[str, Any]:
        """
        Synthesizes text to speech with thread-safe queue lock and multi-engine fallback hierarchy:
        1. Coqui TTS (Primary Offline)
        2. pyttsx3 (Secondary Offline Fallback)
        3. edge-tts (Tertiary Online Fallback)
        """
        start_time = time.time()
        
        if voice_id not in cls.VOICE_PROFILES:
            logger.warning(f"Voice ID '{voice_id}' not recognized. Falling back to 'male_deep'.")
            voice_id = "male_deep"

        profile = cls.VOICE_PROFILES[voice_id]
        
        # Serialize all synthesis operations for safety
        logger.info(f"Synthesis request queued: '{text[:30]}...' using voice '{voice_id}'")
        
        with _tts_lock:
            # 1. Attempt Primary: Coqui TTS (Offline)
            coqui_success, duration = cls._try_coqui_tts(text, profile, output_path, start_time)
            if coqui_success:
                return {
                    "success": True,
                    "engine": "coqui",
                    "voice": voice_id,
                    "duration": duration,
                    "error": None
                }
            
            # 2. Attempt Offline Fallback: pyttsx3 (System-level TTS)
            pyttsx3_success, duration = cls._try_pyttsx3(text, profile, output_path, start_time)
            if pyttsx3_success:
                return {
                    "success": True,
                    "engine": "pyttsx3",
                    "voice": voice_id,
                    "duration": duration,
                    "error": None
                }

            # 3. Attempt Online Fallback: edge-tts (High quality Microsoft cloud voice)
            edge_success, duration = cls._try_edge_tts(text, profile, output_path, start_time)
            if edge_success:
                return {
                    "success": True,
                    "engine": "edge-tts",
                    "voice": voice_id,
                    "duration": duration,
                    "error": None
                }

            # If all else fails
            elapsed = time.time() - start_time
            logger.error("All text-to-speech synthesis engines failed.")
            return {
                "success": False,
                "engine": "none",
                "voice": voice_id,
                "duration": elapsed,
                "error": "All TTS synthesis engines failed to generate audio."
            }

    @classmethod
    def _try_coqui_tts(cls, text: str, profile: dict, output_path: str, start_time: float) -> tuple[bool, float]:
        """Attempts synthesis using Coqui TTS."""
        global _coqui_model, _coqui_init_failed
        
        if _coqui_init_failed:
            return False, 0.0

        try:
            # Lazy import to avoid loading heavy framework if not installed/running fallback
            from TTS.api import TTS
            
            # Initialize model if not already cached
            if _coqui_model is None:
                logger.info("Initializing primary Coqui TTS model (VITS/LJSpeech)...")
                # Using English VITS single speaker model as highly stable and fast
                _coqui_model = TTS(model_name="tts_models/en/ljspeech/vits", progress_bar=False, gpu=False)
                logger.info("Coqui TTS loaded successfully.")

            # Note: For single speaker LJSpeech, speaker name isn't passed. 
            # If using VCTK multi-speaker model, we would pass: speaker=profile["coqui_speaker"]
            _coqui_model.tts_to_file(
                text=text, 
                file_path=output_path
            )
            
            duration = time.time() - start_time
            logger.info(f"Coqui TTS successfully synthesized audio in {duration:.2f}s")
            return True, duration

        except Exception as e:
            if _coqui_model is None:
                _coqui_init_failed = True
                logger.warning(f"Coqui TTS library or model not available ({str(e)}). Switching off Coqui for this session.")
            else:
                logger.error(f"Coqui TTS synthesis failed at runtime: {str(e)}")
            return False, 0.0

    @classmethod
    def _try_pyttsx3(cls, text: str, profile: dict, output_path: str, start_time: float) -> tuple[bool, float]:
        """Attempts synthesis using local pyttsx3 (SAPI5/nsss/espeak)."""
        logger.info("Coqui TTS unavailable. Attempting pyttsx3 offline fallback...")
        try:
            import pyttsx3
            engine = pyttsx3.init()
            
            # Query and map systems voices
            voices = engine.getProperty("voices")
            target_gender = profile["pyttsx3_gender"].lower()
            selected_voice_id = None
            
            for voice in voices:
                voice_name = getattr(voice, "name", "").lower()
                voice_gender = getattr(voice, "gender", "").lower()
                # Check matching voice gender metadata
                if target_gender in voice_gender or target_gender in voice_name:
                    selected_voice_id = voice.id
                    break
            
            if not selected_voice_id and voices:
                selected_voice_id = voices[0].id
                
            if selected_voice_id:
                engine.setProperty("voice", selected_voice_id)
                
            engine.setProperty("rate", 145)  # Slightly slower for better clarity
            engine.setProperty("volume", 0.9)
            
            # Save audio
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
            # Free system resources
            del engine
            
            # Windows/SAPI5 might save as WAV directly. Let's make sure it generated something.
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                duration = time.time() - start_time
                logger.info(f"pyttsx3 successfully synthesized audio in {duration:.2f}s")
                return True, duration
            
            logger.error("pyttsx3 execution completed but audio file is missing or empty.")
            return False, 0.0
            
        except Exception as e:
            logger.error(f"pyttsx3 offline synthesis failed: {str(e)}")
            return False, 0.0

    @classmethod
    def _try_edge_tts(cls, text: str, profile: dict, output_path: str, start_time: float) -> tuple[bool, float]:
        """Attempts synthesis using online Microsoft Edge TTS API."""
        logger.info("pyttsx3 fallback failed. Attempting edge-tts online fallback...")
        try:
            import edge_tts
            
            edge_voice_name = profile["edge_voice"]
            
            # Since edge-tts is fully async, we execute it synchronously inside our locked worker thread
            async def generate_edge_audio():
                communicate = edge_tts.Communicate(text, edge_voice_name)
                await communicate.save(output_path)

            # Retrieve or create a loop for the synchronous thread execution
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
            if loop.is_running():
                # If running inside FastAPI's loop, we await it using run_coroutine_threadsafe
                future = asyncio.run_coroutine_threadsafe(generate_edge_audio(), loop)
                # Wait for the result
                future.result()
            else:
                loop.run_until_complete(generate_edge_audio())
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                duration = time.time() - start_time
                logger.info(f"edge-tts successfully synthesized audio in {duration:.2f}s")
                return True, duration
                
            logger.error("edge-tts synthesis completed but file is empty.")
            return False, 0.0
            
        except Exception as e:
            logger.error(f"edge-tts online synthesis failed: {str(e)}")
            return False, 0.0
