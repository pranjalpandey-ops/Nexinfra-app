import React, { useState } from 'react';
import { Search, Bell, Radio, User, AlertTriangle, CheckCircle2, Plane, Activity, ShieldCheck, ChevronRight, FileText } from 'lucide-react';

export default function DashboardView({ setActivePage, onOpenDispatchModal }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      {/* Top Header Navigation Bar inside Dashboard */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        
        {/* Search Parameter Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parameters, incident ID..."
            className="w-full bg-[#0E131F] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono-tech text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Status Indicators & Profile */}
        <div className="flex items-center space-x-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 font-mono-tech text-xs sm:text-sm font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Healthy</span>
          </div>

          <button 
            onClick={() => alert('Broadcasting live sensor telemetry link...')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Broadcast Live Link"
          >
            <Radio className="w-5 h-5" />
          </button>

          <button 
            onClick={() => alert('3 Active alerts pending review.')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors relative cursor-pointer"
            title="System Alerts"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2" />
          </button>

          <div 
            onClick={() => setActivePage('signup')}
            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 cursor-pointer hover:border-cyan-400 transition-colors font-bold text-sm"
          >
            <User className="w-5 h-5" />
          </div>

        </div>

      </div>

      {/* Top 4 Metrics Grid (Increased text sizes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Regional Integrity Score */}
        <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono-tech uppercase font-bold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Integrity Score</span>
            </div>
            <div className="text-4xl font-extrabold text-emerald-400 font-mono-tech">
              92.4%
            </div>
            <div className="text-xs sm:text-sm text-emerald-400 font-mono-tech font-bold">
              Nominal Operation
            </div>
          </div>

          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-800" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" strokeDasharray="163" strokeDashoffset="13" className="text-emerald-400" strokeLinecap="round" fill="transparent" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Active Drones */}
        <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono-tech uppercase font-bold">
            <Plane className="w-4 h-4 text-cyan-400" />
            <span>Active Drones</span>
          </div>
          <div className="text-4xl font-extrabold text-white font-mono-tech">
            14
          </div>
          <div className="text-xs sm:text-sm text-slate-300 font-mono-tech">
            Sector 4, 7, 9
          </div>
        </div>

        {/* Metric 3: Resolved (24h) */}
        <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono-tech uppercase font-bold">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Resolved (24h)</span>
          </div>
          <div className="text-4xl font-extrabold text-white font-mono-tech">
            87
          </div>
          <div className="text-xs sm:text-sm text-emerald-400 font-mono-tech font-bold">
            ↗ +12% Efficiency
          </div>
        </div>

        {/* Metric 4: Predicted Failures */}
        <div className="bg-[#0C101A] border-2 border-cyan-500/60 rounded-2xl p-6 space-y-1 cyan-glow-sm relative">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-400 font-mono-tech uppercase font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Predicted Failures</span>
          </div>
          <div className="text-4xl font-extrabold text-white font-mono-tech">
            3
          </div>
          <div className="text-xs sm:text-sm text-cyan-400 font-mono-tech font-bold">
            Action Required
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Real-Time AI Detection Feed */}
        <div className="lg:col-span-8 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono-tech">
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Real-Time AI Detection Feed</span>
            </div>

            <button 
              onClick={() => setActivePage('maintenance')}
              className="text-xs sm:text-sm font-mono-tech text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              View All Logs →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1 */}
            <div 
              onClick={() => setActivePage('incident-detail')}
              className="bg-[#070A10] border border-slate-800 rounded-xl p-4 space-y-3 hover:border-rose-500/60 transition-all cursor-pointer shadow-lg group"
            >
              <div className="h-36 rounded-lg bg-gradient-to-br from-red-950 via-amber-950 to-slate-900 relative overflow-hidden flex items-center justify-center border border-rose-900/40">
                <div className="absolute inset-0 bg-cyber-grid-dense opacity-40" />
                <svg className="w-full h-full absolute inset-0 text-red-500 opacity-80" viewBox="0 0 100 100">
                  <path d="M 20 20 L 45 50 L 55 45 L 80 80" stroke="#FF2A5F" strokeWidth="2" fill="none" strokeDasharray="2,2" />
                  <circle cx="45" cy="50" r="8" stroke="#FF2A5F" strokeWidth="1" fill="#FF2A5F" fillOpacity="0.3" />
                </svg>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-rose-600 text-white font-mono-tech text-xs font-extrabold">
                  CRITICAL
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-mono-tech group-hover:text-cyan-400 transition-colors">
                  Fracture Detected
                </h4>
                <p className="text-xs text-slate-300 font-mono-tech mt-1">
                  Hwy 401, KM 32
                </p>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  ⏱ 2m ago
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => setActivePage('incident-detail')}
              className="bg-[#070A10] border border-slate-800 rounded-xl p-4 space-y-3 hover:border-amber-500/60 transition-all cursor-pointer shadow-lg group"
            >
              <div className="h-36 rounded-lg bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950 relative overflow-hidden flex items-center justify-center border border-amber-900/40">
                <div className="absolute inset-0 bg-cyber-grid-dense opacity-40" />
                <svg className="w-full h-full absolute inset-0 text-amber-400 opacity-80" viewBox="0 0 100 100">
                  <rect x="30" y="30" width="40" height="40" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" fill="#F59E0B" fillOpacity="0.15" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#F59E0B" strokeWidth="1" strokeDasharray="1 2" />
                </svg>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-600 text-white font-mono-tech text-xs font-extrabold">
                  MODERATE
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-mono-tech group-hover:text-amber-400 transition-colors">
                  Surface Degradation
                </h4>
                <p className="text-xs text-slate-300 font-mono-tech mt-1">
                  Main & 5th Ave
                </p>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  ⏱ 14m ago
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => setActivePage('incident-detail')}
              className="bg-[#070A10] border border-slate-800 rounded-xl p-4 space-y-3 hover:border-cyan-500/60 transition-all cursor-pointer shadow-lg group"
            >
              <div className="h-36 rounded-lg bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 relative overflow-hidden flex items-center justify-center border border-cyan-900/40">
                <div className="absolute inset-0 bg-cyber-grid-dense opacity-40" />
                <svg className="w-full h-full absolute inset-0 text-cyan-400 opacity-80" viewBox="0 0 100 100">
                  <line x1="50" y1="10" x2="50" y2="90" stroke="#00F0FF" strokeWidth="3" />
                  <circle cx="50" cy="50" r="14" stroke="#00F0FF" strokeWidth="1.5" fill="#00F0FF" fillOpacity="0.2" />
                </svg>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-cyan-800 text-cyan-100 font-mono-tech text-xs font-extrabold">
                  LOW
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-mono-tech group-hover:text-cyan-400 transition-colors">
                  Stress Anomaly
                </h4>
                <p className="text-xs text-slate-300 font-mono-tech mt-1">
                  Bridge Pillar B4
                </p>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  ⏱ 1h ago
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Section: Active Incidents Bar Breakdown */}
        <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <h3 className="text-sm font-bold font-mono-tech text-white uppercase tracking-wider flex items-center gap-2">
              <span>Active Incidents Summary</span>
            </h3>

            <div className="space-y-4 font-mono-tech text-xs sm:text-sm">
              
              <div className="space-y-2">
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Critical Severity</span>
                  <span>12</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[25%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Moderate Severity</span>
                  <span>45</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[65%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-cyan-400 font-bold">
                  <span>Low Severity</span>
                  <span>28</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[40%]" />
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={() => {
              alert('Full Incident & Predictive Report generated. Opening PDF export...');
            }}
            className="w-full py-3.5 rounded-xl border border-cyan-500/60 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-mono-tech text-xs sm:text-sm tracking-wider font-extrabold transition-all uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>📊 GENERATE FULL REPORT</span>
          </button>

        </div>

      </div>

    </div>
  );
}
