import React from 'react';
import { X, Settings, Smartphone, Monitor, Zap, Eye, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, viewMode, setViewMode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full cyan-glow-lg relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              Platform Settings
            </h3>
            <p className="text-xs text-cyan-400 font-mono-tech uppercase">
              System Preferences & View Configuration
            </p>
          </div>
        </div>

        {/* Device View Mode Selection Section */}
        <div className="space-y-3 font-mono-tech text-xs">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            Display Responsive Mode
          </label>

          <div className="space-y-2">
            
            {/* Auto Mode Option (Default) */}
            <button
              onClick={() => setViewMode('auto')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'auto'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">⚡ Auto (Default)</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Automatically adapts layout to screen size
                  </div>
                </div>
              </div>
              {viewMode === 'auto' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Phone View Option */}
            <button
              onClick={() => setViewMode('phone')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'phone'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">📱 Phone Mobile App Mode</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Forces simulated mobile phone container layout
                  </div>
                </div>
              </div>
              {viewMode === 'phone' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Desktop View Option */}
            <button
              onClick={() => setViewMode('desktop')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">💻 Desktop Dashboard Mode</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Forces wide widescreen dashboard container layout
                  </div>
                </div>
              </div>
              {viewMode === 'desktop' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>

          </div>
        </div>

        {/* Accessibility & Font Size Info Badge */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3 text-cyan-300 text-xs font-mono-tech">
          <Eye className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-snug font-sans">
            High-contrast accessible font sizes active across all platform pages.
          </p>
        </div>

        {/* Close Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#00F0FF] hover:bg-cyan-300 text-black font-bold text-xs tracking-wider uppercase cyan-glow-sm cursor-pointer"
          >
            SAVE PREFERENCES & CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
