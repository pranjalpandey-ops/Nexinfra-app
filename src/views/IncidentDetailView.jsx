import React, { useState } from 'react';
import { ArrowLeft, Video, RefreshCw, Bot, CheckCircle2, Plane, AlertTriangle, Layers, Clock } from 'lucide-react';

export default function IncidentDetailView({ setActivePage, viewMode = 'auto' }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('Re-scan complete. Telemetry updated.');
    }, 2000);
  };

  const isPhoneFrame = viewMode === 'phone';

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans flex flex-col items-center py-8 px-4 w-full">
      
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-lg bg-[#0C101A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6' 
          : 'max-w-6xl mx-auto bg-[#0C101A]/90 border border-slate-800/90 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6'
      }`}>
        
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('citysync-map')}
              className="p-2.5 rounded-xl bg-[#070A12] border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                Incident #8842
              </h1>
              <p className="text-xs sm:text-sm font-mono-tech text-slate-300 mt-0.5 font-bold">
                Water Leakage / Flood Risk Inspection
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono-tech font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            <span>● Verified</span>
          </div>
        </div>

        <div className={`space-y-6 ${!isPhoneFrame ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 space-y-0' : ''}`}>
          
          <div className={`${!isPhoneFrame ? 'lg:col-span-6 space-y-6' : 'space-y-6'}`}>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono-tech text-xs sm:text-sm">
                <span className="font-extrabold text-white uppercase tracking-wider">Visual Evidence</span>
                <span className="text-slate-300 font-bold">🖼 3 Media Assets</span>
              </div>

              <div className="h-72 rounded-2xl bg-[#05070D] border border-slate-800 relative overflow-hidden flex items-center justify-center bg-cyber-grid-dense group">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-slate-900/60 to-transparent" />
                <svg className="w-full h-full absolute inset-0 text-cyan-400/40" viewBox="0 0 100 100">
                  <path d="M 10 40 Q 50 20 90 60" stroke="#00F0FF" strokeWidth="3" fill="none" opacity="0.6" />
                  <rect x="20" y="30" width="60" height="40" fill="#00F0FF" fillOpacity="0.15" stroke="#00F0FF" strokeWidth="1" strokeDasharray="2,2" />
                </svg>

                <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-lg bg-black/80 border border-cyan-500/40 text-xs font-mono-tech text-cyan-300 font-bold">
                  Drone Aerial Shot • 10:42 AM
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <span className="w-4 h-1.5 rounded-full bg-cyan-400" />
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                </div>
              </div>
            </div>

            <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-4 font-mono-tech text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
                <Plane className="w-5 h-5" />
                <span>Drone Asset Controls</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold flex items-center justify-center gap-2 uppercase cyan-glow-sm cursor-pointer shadow-lg active:scale-95 text-xs sm:text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : '⚡ RE-SCAN AREA'}</span>
                </button>

                <button
                  onClick={() => setActivePage('drone-fleet')}
                  className="py-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 font-extrabold flex items-center justify-center gap-2 uppercase cursor-pointer text-xs sm:text-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>📹 LIVE STREAM</span>
                </button>
              </div>
            </div>

          </div>

          <div className={`${!isPhoneFrame ? 'lg:col-span-6 space-y-6 flex flex-col justify-between' : 'space-y-6'}`}>
            
            <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-5 font-mono-tech text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">AI Assessment</h3>
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold block">Estimated Damage Area</span>
                  <span className="text-3xl font-extrabold text-white font-mono-tech">45 <span className="text-sm text-slate-400 font-normal">sqm</span></span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold block">Impact Score</span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono-tech">8.5/10</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-rose-300">
                <span className="text-slate-300 text-xs sm:text-sm font-bold">Risk Level</span>
                <span className="font-extrabold text-rose-400 text-sm sm:text-base">High Flood Potential</span>
              </div>
            </div>

            <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-5 font-mono-tech text-xs sm:text-sm">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm sm:text-base">Action Timeline</h3>

              <div className="space-y-4 relative pl-7 border-l-2 border-slate-800">
                <div className="relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-700 absolute -left-[35px] top-0.5" />
                  <div className="flex justify-between items-center text-slate-200 font-bold">
                    <span>Detected</span>
                    <span className="text-xs text-slate-400 font-normal">10:35 AM</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Anomaly flagged by CAM-42</p>
                </div>

                <div className="relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-700 absolute -left-[35px] top-0.5" />
                  <div className="flex justify-between items-center text-slate-200 font-bold">
                    <span>Drone Verified</span>
                    <span className="text-xs text-slate-400 font-normal">10:42 AM</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Aerial unit deployed and confirmed</p>
                </div>

                <div className="relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-700 absolute -left-[35px] top-0.5" />
                  <div className="flex justify-between items-center text-slate-200 font-bold">
                    <span>Work Order Created</span>
                    <span className="text-xs text-slate-400 font-normal">10:45 AM</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Automated ticket generated</p>
                </div>

                <div className="relative">
                  <span className="w-4 h-4 rounded-full bg-cyan-400 absolute -left-[36px] top-1 cyan-glow-sm" />
                  <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-400 text-cyan-300 space-y-1 cyan-glow-sm">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white text-sm sm:text-base">Team Assigned</span>
                      <span className="text-xs text-cyan-300 font-bold">10:48 AM</span>
                    </div>
                    <p className="text-xs sm:text-sm text-cyan-200 font-sans">Routed to: Water & Sanitation</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
