import React from 'react';
import { Volume2, ShieldCheck, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-glass sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Glowing Logo Section */}
        <div className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-blue to-cyber-purple p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-blue-glow">
            <div className="w-full h-full rounded-[10px] bg-cyber-bg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-cyber-cyan group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyber-text to-cyber-cyan bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Mic<span className="text-cyber-purple group-hover:text-cyber-cyan transition-colors duration-300">Pe</span>Chad
            </h1>
            <p className="text-[10px] text-cyber-muted tracking-wider uppercase font-medium">
              AI Speech Synthesizer
            </p>
          </div>
        </div>

        {/* Live Diagnostics Badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-card border border-cyber-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-emerald"></span>
            </span>
            <span className="text-[11px] font-semibold text-cyber-emerald tracking-wide uppercase">
              Offline-First Safe
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-wide uppercase">
              v1.0.0
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
