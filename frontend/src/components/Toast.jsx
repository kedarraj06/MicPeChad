import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  // Dismiss automatically after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4.5 h-4.5 text-cyber-emerald animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4.5 h-4.5 text-cyber-rose animate-bounce" />;
      case 'info':
      default:
        return <Info className="w-4.5 h-4.5 text-cyber-cyan" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-cyber-emerald/30 shadow-emerald-glow bg-cyber-emerald/5';
      case 'error':
        return 'border-cyber-rose/30 shadow-rose-glow bg-cyber-rose/5';
      case 'info':
      default:
        return 'border-cyber-cyan/30 shadow-cyan-glow bg-cyber-cyan/5';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-start p-4 rounded-xl border backdrop-blur-md shadow-glass animate-slide-in max-w-[340px] w-full transition-all duration-300 ${getBorderColor()}`}>
      <div className="mr-3 mt-0.5">{getIcon()}</div>
      
      <div className="flex-grow mr-2">
        <h4 className="text-[11px] font-bold tracking-widest uppercase text-cyber-text mb-0.5">
          {type === 'success' ? 'System Notification' : type === 'error' ? 'Engine Exception' : 'Information'}
        </h4>
        <p className="text-[10.5px] leading-relaxed text-cyber-muted font-medium">
          {message}
        </p>
      </div>

      <button 
        onClick={onClose} 
        className="flex-shrink-0 p-0.5 text-cyber-muted hover:text-cyber-text transition-colors duration-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
