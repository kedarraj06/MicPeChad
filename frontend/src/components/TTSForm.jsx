import React from 'react';
import { Sparkles, MessageSquare, User, AudioLines, Flame } from 'lucide-react';

export default function TTSForm({
  text,
  setText,
  selectedVoice,
  setSelectedVoice,
  voices,
  onGenerate,
  loading,
  charLimit = 500
}) {
  const charCount = text.length;
  const isNearLimit = charCount > charLimit * 0.8;
  const isAtLimit = charCount >= charLimit;

  // Icon selector based on voice type
  const getVoiceIcon = (voiceId) => {
    switch (voiceId) {
      case 'male_deep':
        return <User className="w-4 h-4 text-cyber-cyan" />;
      case 'female_soft':
        return <User className="w-4 h-4 text-cyber-rose" />;
      case 'podcast':
        return <AudioLines className="w-4 h-4 text-cyber-blue" />;
      case 'storytelling':
        return <MessageSquare className="w-4 h-4 text-cyber-emerald" />;
      case 'motivational':
        return <Flame className="w-4 h-4 text-cyber-purple" />;
      default:
        return <User className="w-4 h-4 text-cyber-muted" />;
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (val.length <= charLimit) {
      setText(val);
    }
  };

  return (
    <div className="w-full bg-cyber-card border border-cyber-border rounded-2xl p-6 backdrop-blur-glass shadow-glass transition-all duration-300 hover:border-cyber-border/20">
      
      {/* SECTION 1: Text Input Area */}
      <div className="mb-6 relative">
        <label className="block text-sm font-bold text-cyber-text tracking-wide uppercase mb-2 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-cyber-blue" />
            <span>Enter Speech Script</span>
          </span>
          <span className="text-[10px] tracking-wider text-cyber-muted italic font-normal">
            Supports English
          </span>
        </label>
        
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Type or paste your text script here... The AI engine will synthesize it immediately offline."
          disabled={loading}
          rows={6}
          className="w-full bg-cyber-bg/50 border border-cyber-border/60 rounded-xl p-4 text-cyber-text placeholder-cyber-muted/60 focus:outline-none focus:border-cyber-blue/80 focus:ring-1 focus:ring-cyber-blue/40 resize-none transition-all duration-300"
        />

        {/* Floating Character Counter */}
        <div className="absolute bottom-3 right-4 flex items-center space-x-1.5 bg-cyber-bg/90 border border-cyber-border/50 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <span className={`text-[10px] font-bold tracking-wider ${
            isAtLimit ? 'text-cyber-rose' : isNearLimit ? 'text-yellow-400' : 'text-cyber-cyan'
          }`}>
            {charCount}
          </span>
          <span className="text-[9px] font-medium text-cyber-muted">/</span>
          <span className="text-[10px] font-medium text-cyber-muted">
            {charLimit}
          </span>
        </div>
      </div>

      {/* SECTION 2: Voice Style Selector */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-cyber-text tracking-wide uppercase mb-3 flex items-center space-x-2">
          <AudioLines className="w-4 h-4 text-cyber-purple" />
          <span>Select Voice Profile</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {voices.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => setSelectedVoice(voice.id)}
                disabled={loading}
                className={`relative flex items-start text-left p-4 rounded-xl border bg-cyber-bg/30 transition-all duration-300 ${
                  isSelected 
                    ? 'border-cyber-purple shadow-purple-glow bg-cyber-purple/5 translate-y-[-1px]' 
                    : 'border-cyber-border/60 hover:border-cyber-border hover:bg-cyber-bg/60'
                }`}
              >
                {/* Active Glowing Dot */}
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-purple opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-purple"></span>
                  </span>
                )}
                
                <div className={`p-2.5 rounded-lg mr-3 ${
                  isSelected ? 'bg-cyber-purple/10 text-cyber-purple' : 'bg-cyber-card text-cyber-muted'
                }`}>
                  {getVoiceIcon(voice.id)}
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-cyber-text leading-tight mb-0.5">
                    {voice.name}
                  </h4>
                  <p className="text-[10px] text-cyber-muted leading-snug">
                    {voice.description}
                  </p>
                  
                  {/* Speaker Meta Badge */}
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      voice.gender === 'Male' 
                        ? 'bg-cyber-blue/15 text-cyber-blue' 
                        : 'bg-cyber-rose/15 text-cyber-rose'
                    }`}>
                      {voice.gender}
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cyber-card text-cyber-muted border border-cyber-border/40 uppercase">
                      Studio HQ
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Generate Trigger Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || !text.trim()}
        className={`w-full relative overflow-hidden py-4 px-6 rounded-xl font-bold tracking-wider text-sm uppercase transition-all duration-300 flex items-center justify-center space-x-2 ${
          loading 
            ? 'bg-cyber-card text-cyber-muted border border-cyber-border cursor-not-allowed' 
            : !text.trim()
              ? 'bg-cyber-card/40 text-cyber-muted/50 border border-cyber-border/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-cyan hover:opacity-95 shadow-blue-glow hover:shadow-cyan-glow text-white transform active:scale-[0.99] hover:translate-y-[-1px]'
        }`}
      >
        {loading ? (
          <>
            {/* Spinning Loading Wheel */}
            <svg className="animate-spin h-5 w-5 text-cyber-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="animate-pulse tracking-widest text-[13px]">
              Synthesizing Speech...
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Generate Speech Audio</span>
          </>
        )}
      </button>

    </div>
  );
}
