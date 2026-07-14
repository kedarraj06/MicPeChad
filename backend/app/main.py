import os
import time
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import settings
from app.logging_config import setup_logging
from app.routes.audio import router as audio_router

# Configure logger
logger = logging.getLogger("MicPeChad.app")

def delete_expired_audio_files():
    """Deletes cache audio files that exceed the retention window."""
    audio_dir = settings.GENERATED_AUDIO_DIR
    if not os.path.exists(audio_dir):
        return
    
    now = time.time()
    retention_seconds = settings.AUDIO_RETENTION_HOURS * 3600
    cleaned_count = 0
    
    logger.info(f"Scanning '{audio_dir}' for expired files older than {settings.AUDIO_RETENTION_HOURS} hour(s)...")
    
    try:
        for filename in os.listdir(audio_dir):
            if filename.startswith("speech_"):
                file_path = os.path.join(audio_dir, filename)
                if os.path.isfile(file_path):
                    # Check modified timestamp
                    file_mtime = os.path.getmtime(file_path)
                    if now - file_mtime > retention_seconds:
                        os.remove(file_path)
                        logger.info(f"Deleted expired cache audio file: {filename}")
                        cleaned_count += 1
        if cleaned_count > 0:
            logger.info(f"Cleanup finished. Removed {cleaned_count} expired files.")
        else:
            logger.info("Cleanup completed. No expired files found.")
    except Exception as e:
        logger.error(f"Error during audio files cleanup routine: {str(e)}")

async def audio_cleanup_scheduler():
    """Background task runner for periodic cache purge."""
    while True:
        try:
            # Sleep for the configured interval
            await asyncio.sleep(settings.AUDIO_CLEANUP_INTERVAL_MINUTES * 60)
            delete_expired_audio_files()
        except asyncio.CancelledError:
            logger.info("Audio cleanup scheduler task cancelled.")
            break
        except Exception as e:
            logger.error(f"Audio cleanup scheduler encountered an unexpected error: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown lifecycles."""
    # 1. Setup logging system
    setup_logging()
    logger.info("Initializing MicPeChad Backend Server...")

    # 2. Ensure generated audio directory exists
    os.makedirs(settings.GENERATED_AUDIO_DIR, exist_ok=True)

    # 3. Run initial cleanup of leftovers from previous sessions on startup
    delete_expired_audio_files()

    # 4. Start background cleanup scheduler
    cleanup_task = asyncio.create_task(audio_cleanup_scheduler())
    
    yield
    
    # 5. Shutdown and clean tasks
    logger.info("Shutting down backend server. Stopping background cleanup tasks...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    logger.info("Shutdown completed successfully.")

# Initialize FastAPI App
app = FastAPI(
    title="MicPeChad AI Text-to-Speech API",
    description="Backend API for high-performance offline-first TTS synthesis",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception occurred: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "detail": "A critical server error occurred. Please try again later."}
    )

# Include routes with the /api prefix
app.include_router(audio_router, prefix="/api")

# Ensure static directories exist prior to mounting
os.makedirs(settings.GENERATED_AUDIO_DIR, exist_ok=True)

# Mount Static Files Directory for Audio Access
app.mount("/audio", StaticFiles(directory=settings.GENERATED_AUDIO_DIR), name="audio")

if __name__ == "__main__":
    import uvicorn
    # Start development server directly
    logger.info(f"Starting server on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True
    )
