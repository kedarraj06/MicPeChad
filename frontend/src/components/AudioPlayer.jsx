import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, HelpCircle, Activity, Hourglass } from 'lucide-react';

export default function AudioPlayer({ audioUrl, engineUsed, generationTime }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef(null);

  // Restart / autoplay when audio URL updates (Auto-refresh on generation!)
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Auto-play generated audio once metadata loads
      const handleCanPlay = () => {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => logger.warning("Autoplay blocked by browser policy. User must click Play.", err));
      };

      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
        }
      };
    }
  }, [audioUrl]);

  // Sync play/pause controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeekChange = (e) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  // Convert time to standard 0:00 format
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Trigger browser download dialog
  const downloadAudio = async () => {
    if (!audioUrl) return;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Determine correct extension from absolute url
      const extension = audioUrl.endsWith('.mp3') ? 'mp3' : 'wav';
      link.setAttribute('download', `micpechad_speech_${Date.now()}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up link
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: Open URL directly in new tab if blob downloading gets CORS blocked
      window.open(audioUrl, '_blank');
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="w-full bg-cyber-card border border-cyber-border rounded-2xl p-6 backdrop-blur-glass shadow-glass transition-all duration-300 mt-6 hover:border-cyber-purple/20">
      
      {/* Hidden Audio Node */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyber-border/40 pb-4 mb-4 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-cyber-text uppercase flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <span>Generated Audio Player</span>
          </h3>
          <p className="text-[10px] text-cyber-muted mt-0.5">
            File caching active. Link expires in 1 hour.
          </p>
        </div>
        
        {/* Synthesis Telemetry Logs */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-cyber-bg border border-cyber-border text-[10px] text-cyber-cyan font-bold tracking-wider uppercase">
            <Hourglass className="w-3 h-3" />
            <span>Gen: {generationTime ? `${generationTime.toFixed(2)}s` : 'N/A'}</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-cyber-bg border border-cyber-border text-[10px] text-cyber-purple font-bold tracking-wider uppercase">
            <span>Engine: {engineUsed || 'auto'}</span>
          </div>
        </div>
      </div>

      {/* Soundwave Simulation and Playback controls */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 py-2">
        
        {/* Play Pause button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-purple hover:scale-105 transition-all duration-300 flex items-center justify-center text-white shadow-blue-glow active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-white text-white" />
          ) : (
            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          )}
        </button>

        {/* Audio Waveform Scrubber Column */}
        <div className="flex-1 w-full flex flex-col space-y-2">
          
          {/* Animated SVG Soundwave */}
          <div className="h-10 w-full bg-cyber-bg/30 border border-cyber-border/40 rounded-xl px-4 flex items-center justify-between overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-around px-6 pointer-events-none opacity-20">
              {/* Pre-drawn Wave Bars */}
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[3px] bg-cyber-cyan rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? i % 5 === 0 
                        ? 'h-6 animate-soundwave-1' 
                        : i % 4 === 0 
                          ? 'h-8 animate-soundwave-2' 
                          : i % 3 === 0 
                            ? 'h-5 animate-soundwave-3' 
                            : i % 2 === 0 
                              ? 'h-7 animate-soundwave-4' 
                              : 'h-4 animate-soundwave-5'
                      : 'h-2'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-cyber-muted/80 z-10 select-none">
              Audio Waveform
            </span>
            <span className="text-[9px] font-semibold text-cyber-cyan/50 tracking-wider uppercase z-10 select-none">
              Stereo 44.1kHz
            </span>
          </div>

          {/* Time Scrubber Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-cyber-muted w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="flex-grow h-1.5 rounded-lg appearance-none cursor-pointer bg-cyber-bg/80 border border-cyber-border/60 accent-cyber-blue"
            />
            
            <span className="text-xs font-semibold text-cyber-muted w-10">
              {formatTime(duration)}
            </span>
          </div>

        </div>

        {/* Volume & Download Actions */}
        <div className="flex-shrink-0 flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start border-t border-cyber-border/20 pt-4 md:pt-0 md:border-none">
          {/* Volume Control */}
          <div className="flex items-center space-x-2 bg-cyber-bg/40 border border-cyber-border/40 px-3 py-2 rounded-xl">
            <Volume2 className="w-4 h-4 text-cyber-muted" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 rounded bg-cyber-border accent-cyber-blue cursor-pointer"
            />
          </div>

          {/* Premium Download Trigger */}
          <button
            type="button"
            onClick={downloadAudio}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 hover:border-cyber-cyan/50 rounded-xl text-cyber-cyan font-bold tracking-wider text-xs uppercase transition-all duration-300 shadow-cyan-glow hover:shadow-cyan-glow active:scale-[0.98] w-1/2 md:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

      </div>

    </div>
  );
}
