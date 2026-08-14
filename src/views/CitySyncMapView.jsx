import React, { useState } from 'react';
import { Search, MapPin, AlertTriangle, Droplet, Plane, LayoutDashboard, Map, Bell, FileText, ChevronRight, Layers, Compass, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CitySyncMapView({ setActivePage, viewMode = 'auto' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(true);

  const isPhoneFrame = viewMode === 'phone';

  return (
    <div className="min-h-screen bg-[#090C13] text-slate-100 font-sans flex flex-col justify-between items-center py-6 px-4 w-full">
      
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[780px] flex flex-col justify-between' 
          : 'max-w-7xl mx-auto bg-[#0D121D]/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between min-h-[780px]'
      }`}>

        <div className="border-b border-slate-800/80 pb-4 mb-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-400 cyan-glow-sm">
              <span className="font-bold text-lg font-mono-tech">❖</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-cyan-400 tracking-wide font-sans block">
                CitySync AI GIS Radar
              </span>
              <span className="text-xs text-slate-300 font-mono-tech uppercase font-bold">
                Active Tactical Telemetry Map
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono-tech text-xs sm:text-sm">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coordinates, incident ID..."
                className="bg-transparent text-white focus:outline-none placeholder:text-slate-500 w-56 text-xs sm:text-sm"
              />
            </div>

            <button
              onClick={() => setActivePage('report-issue')}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold uppercase text-xs sm:text-sm cyan-glow-sm cursor-pointer shadow-lg active:scale-95"
            >
              + REPORT ISSUE
            </button>
          </div>
        </div>

        <div className={`relative flex-1 bg-[#090D17] border border-slate-800/80 rounded-2xl overflow-hidden bg-cyber-grid-dense p-4 flex ${
          !isPhoneFrame ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]' : 'flex-col justify-between min-h-[550px]'
        }`}>
          
          <div className={`relative ${!isPhoneFrame ? 'lg:col-span-8 h-full min-h-[480px] rounded-xl overflow-hidden' : 'flex-1 h-full'}`}>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] border border-cyan-500/10 rounded-full animate-ping" />
              <div className="w-[300px] h-[300px] border border-cyan-500/20 rounded-full" />
            </div>

            <div className="absolute top-[28%] left-[25%] pointer-events-auto cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-amber-400">
                <Droplet className="w-5 h-5" />
              </div>
            </div>

            <div 
              onClick={() => setShowDetailModal(true)}
              className="absolute top-[40%] left-[52%] pointer-events-auto cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-ping" />
                <div className="w-11 h-11 rounded-2xl bg-slate-950/90 border-2 border-rose-500 flex items-center justify-center text-rose-400 cyan-glow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <svg className="w-full h-full absolute inset-0 text-cyan-400 opacity-80" viewBox="0 0 100 100">
              <path d="M 35 65 Q 45 54 52 40" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            </svg>

            <div className="absolute top-[62%] left-[35%] pointer-events-auto cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold cyan-glow-lg animate-pulse">
                <Plane className="w-5 h-5 transform -rotate-45" />
              </div>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-2 z-20 font-mono-tech">
              <button className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-cyan-400">
                <Layers className="w-5 h-5" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-cyan-400">
                <Compass className="w-5 h-5" />
              </button>
            </div>

          </div>

          {showDetailModal && (
            <div className={`${
              !isPhoneFrame 
                ? 'lg:col-span-4 bg-[#0C101A] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6 font-mono-tech text-xs sm:text-sm cyan-glow-sm flex flex-col justify-between' 
                : 'relative z-30 bg-[#0C101A]/95 backdrop-blur-md border border-rose-500/40 rounded-2xl p-4.5 shadow-2xl space-y-4 font-mono-tech text-xs sm:text-sm cyan-glow-sm'
            }`}>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-heading">
                        Critical Pothole
                      </h3>
                      <p className="text-xs sm:text-sm text-rose-400 tracking-wider font-bold">
                        ID: PTR-892A
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-b border-slate-800/80 py-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block">GPS COORDINATES</span>
                    <span className="text-cyan-400 font-extrabold text-lg">40.7128° N</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block">SEVERITY RATING</span>
                    <span className="text-rose-400 font-extrabold text-sm sm:text-base">High Impact</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#070A12] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-3">
                    <Plane className="w-6 h-6 text-cyan-400 animate-bounce" />
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold block">TACTICAL DISPATCH STATUS</span>
                      <span className="text-slate-100 font-bold text-xs sm:text-sm">
                        Drone Dispatched (ETA 2m)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    UAV-ALPHA-09 streaming 4K thermal telemetry directly to incident command console.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePage('incident-detail')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs sm:text-sm tracking-wider transition-all cyan-glow-sm uppercase cursor-pointer flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                <span>🔍 INSPECT INCIDENT #8842 FEED</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          )}

        </div>

        {isPhoneFrame && (
          <div className="bg-[#0A0D16] border-t border-slate-800/80 px-4 py-3 grid grid-cols-4 gap-1 text-center font-mono-tech text-xs text-slate-400 mt-4">
            <button onClick={() => setActivePage('dashboard')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => setActivePage('citysync-map')} className="flex flex-col items-center gap-1 py-1 rounded-lg bg-[#00F0FF] text-black font-bold">
              <Map className="w-5 h-5" />
              <span>Map</span>
            </button>
            <button onClick={() => setActivePage('maintenance')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>
            <button onClick={() => setActivePage('report-issue')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <FileText className="w-5 h-5" />
              <span>Reports</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
