import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TTSForm from './components/TTSForm';
import AudioPlayer from './components/AudioPlayer';
import Toast from './components/Toast';
import { ttsApi } from './services/api';
import { Cpu, Zap, CloudOff, FileAudio } from 'lucide-react';

// Safe fallback voice styles if API is booting up or offline
const DEFAULT_VOICES = [
  { id: 'male_deep', name: 'Male Deep Voice', gender: 'Male', description: 'Rich, resonant, and low-pitched male voice.' },
  { id: 'female_soft', name: 'Female Soft Voice', gender: 'Female', description: 'Gentle, calm, and soothing female voice.' },
  { id: 'podcast', name: 'Podcast Voice', gender: 'Male', description: 'Clear, professional, conversational broadcast tone.' },
  { id: 'storytelling', name: 'Storytelling Voice', gender: 'Female', description: 'Expressive and engaging narrator voice.' },
  { id: 'motivational', name: 'Motivational Voice', gender: 'Male', description: 'Energetic, inspiring, and powerful delivery.' }
];

export default function App() {
  const [text, setText] = useState(
    "Welcome to MicPeChad, the ultimate AI speech synthesizer. Experience premium, low-latency text-to-speech built with robust offline fallback pipelines."
  );
  const [selectedVoice, setSelectedVoice] = useState('male_deep');
  const [voices, setVoices] = useState(DEFAULT_VOICES);
  const [loading, setLoading] = useState(false);
  
  // Results & Notification states
  const [audioResult, setAudioResult] = useState(null);
  const [toast, setToast] = useState(null);

  // Load voices from API on mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await ttsApi.getVoices();
        if (response && response.success && response.voices.length > 0) {
          setVoices(response.voices);
          // Auto select first voice if not default
          if (!response.voices.find(v => v.id === selectedVoice)) {
            setSelectedVoice(response.voices[0].id);
          }
        }
      } catch (err) {
        console.warn("Backend voices API currently offline. Using offline default voice list.", err);
        // Toast is not shown on load for initial offline state to avoid annoying the user
      }
    };
    fetchVoices();
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      triggerToast("Please enter a valid text script.", "error");
      return;
    }
    
    setLoading(true);
    setAudioResult(null); // Clear previous player instance

    try {
      const response = await ttsApi.generateAudio(text, selectedVoice);
      
      if (response && response.success) {
        setAudioResult({
          audioUrl: response.audio_url,
          engineUsed: response.engine_used,
          generationTime: response.generation_duration_seconds
        });
        
        // Custom warning alert if it fell back to pyttsx3 or edge-tts
        if (response.engine_used !== 'coqui') {
          triggerToast(
            `Speech generated successfully using '${response.engine_used}' offline fallback!`,
            'info'
          );
        } else {
          triggerToast("Speech synthesized successfully with primary Coqui engine!", "success");
        }
      } else {
        triggerToast(response.error || "Failed to generate speech. Please try another preset.", "error");
      }
    } catch (err) {
      console.error(err);
      // Detailed user diagnostic toast
      const errorMsg = err.response?.data?.detail || 
                       "Server connection refused. Make sure the Python FastAPI backend is running on port 8000.";
      triggerToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      {/* Dynamic Background Mesh elements */}
      <div className="absolute top-[25%] left-[-10%] w-[35%] h-[35%] bg-radial-gradient bg-cyber-blue/5 rounded-full filter blur-[120px] pointer-events-none z-[-8]" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-radial-gradient bg-cyber-cyan/5 rounded-full filter blur-[120px] pointer-events-none z-[-8]" />

      <Header />

      {/* Main Panel Content */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        
        {/* Intro Hero Badge and Architecture Dashboard */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase flex items-center justify-center space-x-2">
            <Cpu className="w-5 h-5 text-cyber-blue animate-pulse" />
            <span>AI Neural Voice Console</span>
          </h2>
          <p className="text-xs sm:text-sm text-cyber-muted max-w-xl mx-auto mt-2 leading-relaxed">
            Generate offline natural voice overs from raw text using custom speaker styles. Select a profile and hit synthesize.
          </p>

          {/* Dynamic Specs Board */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-cyber-card/40 border border-cyber-border/40 p-3 rounded-xl backdrop-blur-sm flex items-center space-x-3">
              <Zap className="w-5 h-5 text-cyber-blue flex-shrink-0" />
              <div className="text-left">
                <span className="block text-[8px] font-bold text-cyber-muted uppercase tracking-wider">Latency</span>
                <span className="text-[11px] font-bold text-white uppercase">~1.2s Realtime</span>
              </div>
            </div>

            <div className="bg-cyber-card/40 border border-cyber-border/40 p-3 rounded-xl backdrop-blur-sm flex items-center space-x-3">
              <CloudOff className="w-5 h-5 text-cyber-purple flex-shrink-0" />
              <div className="text-left">
                <span className="block text-[8px] font-bold text-cyber-muted uppercase tracking-wider">Synthesis</span>
                <span className="text-[11px] font-bold text-white uppercase">100% Offline-First</span>
              </div>
            </div>

            <div className="bg-cyber-card/40 border border-cyber-border/40 p-3 rounded-xl backdrop-blur-sm flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
              <div className="text-left">
                <span className="block text-[8px] font-bold text-cyber-muted uppercase tracking-wider">Backend</span>
                <span className="text-[11px] font-bold text-white uppercase">Python FastAPI</span>
              </div>
            </div>

            <div className="bg-cyber-card/40 border border-cyber-border/40 p-3 rounded-xl backdrop-blur-sm flex items-center space-x-3">
              <FileAudio className="w-5 h-5 text-cyber-rose flex-shrink-0" />
              <div className="text-left">
                <span className="block text-[8px] font-bold text-cyber-muted uppercase tracking-wider">Format</span>
                <span className="text-[11px] font-bold text-white uppercase">MP3 / WAV Stereo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Interactive Columns */}
        <div className="space-y-6">
          {/* Main TTS Input Form Card */}
          <TTSForm
            text={text}
            setText={setText}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            voices={voices}
            onGenerate={handleGenerate}
            loading={loading}
            charLimit={500}
          />

          {/* Conditional Custom Waveform Player Card */}
          {audioResult && (
            <AudioPlayer
              audioUrl={audioResult.audioUrl}
              engineUsed={audioResult.engineUsed}
              generationTime={audioResult.generationTime}
            />
          )}
        </div>

      </main>

      {/* Floating Glassmorphic Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="w-full py-6 bg-cyber-bg border-t border-cyber-border/20 text-center z-10 relative">
        <p className="text-[10px] text-cyber-muted tracking-widest uppercase">
          MicPeChad Synthesis Studio • Built with React & Python FastAPI
        </p>
      </footer>
    </div>
  );
}
