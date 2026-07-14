# MicPeChad — AI Text-to-Speech Web Application

**MicPeChad** is a state-of-the-art, high-performance, and responsive AI Text-to-Speech (TTS) web application. Designed with a stunning space-grade futuristic dark theme and glassmorphic UI cards, the project features an **offline-first dual-engine backend synthesis architecture** for bulletproof reliability, thread-safe request serialization, and automatic cached audio retention management.

---

## 🚀 Key Engineering Pillars

1. **Dual-Engine Graceful Degradation**: 
   - **Primary Engine**: Coqui TTS (`ljspeech` neural VITS model) for offline high-fidelity local voice generation.
   - **Offline Fallback**: `pyttsx3` (System-level speech synthesizer, 100% offline, zero C++ compiler or external network dependencies).
   - **Online Backup**: `edge-tts` (Microsoft's cloud neural voice generator, providing studio-grade realistic outputs as a tertiary fallback).
2. **Concurrency & Thread Safety**: Uses Python `threading.Lock` serialization to queue CPU-bound synthesis calls safely, preventing thread contention or OS crashes under multiple parallel requests.
3. **Pydantic Contract Validation**: Uses Pydantic v2 validation models for strict API request and response validation.
4. **Cache & File Lifecycle Cleanup**: Automatically schedules background file tasks that sweep the `generated_audio/` cache folder and delete speech files older than 1 hour.
5. **Transcoding Support**: Uses `pydub` to automatically transcode raw WAV synthesizer output to compressed, fast-streaming MP3 files if system FFmpeg is present (falls back to native WAV natively playable by browsers if FFmpeg is not installed).

---

## 📂 Project Architecture

```
micpechad/
│
├── frontend/                     # React + Vite + Tailwind CSS Single-Page App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Glowing hero navigation and live-badge status
│   │   │   ├── TTSForm.jsx       # Custom text canvas, character count & voice card selectors
│   │   │   ├── AudioPlayer.jsx   # Premium HTML5 seek player with simulated bouncing sound waves
│   │   │   └── Toast.jsx         # Glassmorphic slide-in notifications
│   │   ├── services/
│   │   │   └── api.js            # Axios backend client configs
│   │   ├── App.jsx               # Centralized state integration
│   │   ├── index.css             # HSL variables, fluid canvas grid, and animations
│   │   └── main.jsx
│   ├── tailwind.config.js        # Glass-shadows, fonts, and cyber palette config
│   └── package.json
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── config.py             # Strongly typed Pydantic environment configurations
│   │   ├── logging_config.py     # Centralized structured logger
│   │   ├── schemas.py            # Pydantic serialization models
│   │   ├── tts_engine.py         # Sequential dual-engine synthesizer coordinator
│   │   ├── routes/
│   │   │   └── audio.py          # /voices and /generate-audio route handlers
│   │   └── generated_audio/      # Local output sound caches (ignored by git)
│   ├── .env                      # Local environment configurations
│   ├── requirements.txt          # Python packages
│   ├── Dockerfile                # Multi-stage audio-supported Docker image
│   └── docker-compose.yml        # Multi-container local orchestration
│
└── README.md                     # Setup and execution guide
```

---

## 🛠️ Step-by-Step Local Setup

### 1. Prerequisites
Ensure you have the following installed on your host system:
- **Node.js** (v16+)
- **Python** (v3.9 - v3.11)
- **FFmpeg** (Optional: Recommended for audio compression. Add it to your system Environment `PATH`).

---

### 2. Backend Installation & Bootup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a Python Virtual Environment:
   ```bash
   python -m venv venv
   ```
3. Activate the Virtual Environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: To install the primary Coqui TTS engine, you will need C++ compiler tools installed on your host. If you have them, run: `pip install TTS`. If you don't, the application will automatically fall back to the built-in system-offline `pyttsx3` or `edge-tts` engines, functioning 100% correctly out of the box).*
5. Run the FastAPI development server:
   ```bash
   python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend server will launch at: **`http://localhost:8000`**

---

### 3. Frontend Installation & Bootup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will compile and launch at: **`http://localhost:5173`**

---

## 🐳 Docker Deployment (One-Click Launch)

To package and run the entire application using Docker:
1. Make sure Docker Desktop is running on your system.
2. In the root directory `e:\MicPeChad`, navigate to `backend/` and execute:
   ```bash
   docker-compose up --build
   ```
This automatically compiles our multi-stage backend image, installs necessary Linux systems-level audio synthesizers (`espeak`, `libespeak-dev`, `ffmpeg`), mounts cache folders, and maps internal port `8000` directly.

---

## 🧪 Testing the Synthesis Pipeline
1. Open **`http://localhost:5173`** in your browser.
2. Check the green **"Offline-First Safe"** live badge at the top nav to confirm startup diagnostics.
3. Type custom text inside the input area.
4. Select a voice profile card (e.g. *Male Deep Voice*, *Podcast Voice*, *Motivational Voice*).
5. Click **"Generate Speech Audio"**.
6. The player card will automatically mount, refresh, and play the generated sound track.
7. Click **"Download"** to save the audio file directly as a high-fidelity MP3/WAV!
