import React from 'react';
import { Shield, Radio, Activity, Sparkles, MapPin, Settings } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, isAuth, user, onOpenSettings }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#07090E]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 cyan-glow-sm group-hover:scale-105 transition-transform font-bold text-xl font-mono-tech">
            N
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-wide text-white font-heading group-hover:text-cyan-400 transition-colors">
              Nexinfra
            </span>
            <span className="text-xs text-cyan-400/90 block font-mono-tech -mt-0.5 tracking-widest uppercase">
              AI Command & CitySync Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Clean labels without technical #8842 ID numbers) */}
        <nav className="hidden md:flex items-center space-x-1 font-mono-tech text-sm tracking-wider">
          <button
            onClick={() => setActivePage('landing')}
            className={`px-3.5 py-2 rounded transition-colors ${
              activePage === 'landing'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Platform
          </button>
          
          <button
            onClick={() => setActivePage('dashboard')}
            className={`px-3.5 py-2 rounded transition-colors ${
              activePage === 'dashboard'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Solutions
          </button>

          <button
            onClick={() => setActivePage('report-issue')}
            className={`px-3.5 py-2 rounded transition-colors flex items-center gap-1.5 ${
              activePage === 'report-issue'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Report Issue</span>
          </button>

          <button
            onClick={() => setActivePage('citysync-map')}
            className={`px-3.5 py-2 rounded transition-colors flex items-center gap-1.5 ${
              activePage === 'citysync-map'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>CitySync Map</span>
          </button>

          <button
            onClick={() => setActivePage('incident-detail')}
            className={`px-3.5 py-2 rounded transition-colors ${
              activePage === 'incident-detail'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Incident Inspector
          </button>

          <button
            onClick={() => setActivePage('maintenance')}
            className={`px-3.5 py-2 rounded transition-colors ${
              activePage === 'maintenance'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Incident Logs
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 font-mono-tech text-xs">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Settings & Display Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActivePage('login')}
            className={`px-4 py-2 rounded transition-all uppercase tracking-wider text-xs font-bold ${
              activePage === 'login'
                ? 'text-cyan-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            LOGIN
          </button>

          <button
            onClick={() => setActivePage('signup')}
            className="px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold tracking-wider transition-all cyan-glow-sm hover:cyan-glow-lg uppercase text-xs cursor-pointer active:scale-95"
          >
            SIGN UP
          </button>

          <button
            onClick={() => setActivePage('dashboard')}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/60 transition-all uppercase font-mono-tech text-xs font-bold cursor-pointer"
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Console</span>
          </button>
        </div>

      </div>
    </header>
  );
}
