import React, { useState } from 'react';
import { Camera, Image, MapPin, Sparkles, Send, LayoutDashboard, Map, Bell, FileText, CheckCircle2, Smartphone, Monitor } from 'lucide-react';

export default function CitySyncReportView({ setActivePage, viewMode = 'auto' }) {
  const [mediaUploaded, setMediaUploaded] = useState(false);
  const [description, setDescription] = useState('There is a large pothole near the intersection causing traffic slowdowns.');
  const [category, setCategory] = useState('Road Damage/Pothole');
  const [priority, setPriority] = useState('Medium');
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState('Main St & 5th Ave');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActivePage('citysync-map');
    }, 2000);
  };

  const isPhoneFrame = viewMode === 'phone';

  return (
    <div className="min-h-screen bg-[#090C13] text-slate-100 font-sans flex flex-col justify-between items-center py-8 px-4 w-full">
      
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[780px] flex flex-col justify-between' 
          : 'max-w-6xl mx-auto bg-[#0D121D]/90 border border-slate-800/90 rounded-2xl p-6 lg:p-8 shadow-2xl backdrop-blur-md'
      }`}>

        <div className="border-b border-slate-800/80 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-400 cyan-glow-sm">
              <span className="font-bold text-lg font-mono-tech">❖</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-cyan-400 tracking-wide font-sans block">
                CitySync AI Portal
              </span>
              <span className="text-xs text-slate-300 font-mono-tech uppercase font-bold">
                Citizen Reporting Node
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono-tech text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isPhoneFrame ? 'Mobile App View' : 'Desktop View (Auto)'}</span>
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="py-20 text-center space-y-4 font-mono-tech text-cyan-400">
            <CheckCircle2 className="w-20 h-20 mx-auto animate-bounce text-cyan-400" />
            <h3 className="text-3xl font-bold text-white font-heading">REPORT SUBMITTED TO CITYSYNC AI</h3>
            <p className="text-base text-slate-300 max-w-md mx-auto font-sans">
              Issue cataloged as PTR-892A. AI UAV drone has been dispatched for aerial verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`space-y-6 ${!isPhoneFrame ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 space-y-0' : ''}`}>
            
            <div className={`${!isPhoneFrame ? 'lg:col-span-6 space-y-6' : 'space-y-6'}`}>
              
              <div>
                <h2 className="text-3xl font-bold text-white font-heading">
                  Report an Issue
                </h2>
                <p className="text-sm text-slate-300 mt-1 font-sans">
                  Upload visual evidence and location parameters to initiate AI dispatch protocols.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono-tech text-slate-300 font-bold tracking-wider uppercase">
                  1. MEDIA UPLOAD
                </label>

                <div className="grid grid-cols-2 gap-4 font-mono-tech text-xs sm:text-sm">
                  <div
                    onClick={() => setMediaUploaded(true)}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                      mediaUploaded ? 'border-cyan-400 bg-cyan-950/40' : 'border-slate-800 bg-[#070A12] hover:border-slate-700'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-slate-200" />
                    <span className="text-slate-200 font-sans text-xs sm:text-sm font-bold text-center">
                      {mediaUploaded ? 'Photo Attached ✓' : 'Take Photo/Video'}
                    </span>
                  </div>

                  <div
                    onClick={() => setMediaUploaded(true)}
                    className="border-2 border-dashed border-slate-800 bg-[#070A12] hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    <Image className="w-8 h-8 text-slate-200" />
                    <span className="text-slate-200 font-sans text-xs sm:text-sm font-bold text-center">
                      Upload from Gallery
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono-tech">
                  <span className="text-slate-300 font-bold tracking-wider uppercase">2. AUTOMATIC LOCATION</span>
                  <button 
                    type="button"
                    onClick={() => setLocation('Hwy 401 & KM 32')}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer text-xs"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Change Coordinates</span>
                  </button>
                </div>

                <div className="h-40 rounded-2xl bg-[#070A12] border border-slate-800 relative overflow-hidden flex items-center justify-center bg-cyber-grid-dense">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 to-slate-950/60" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-400/80 flex items-center justify-center cyan-glow-sm">
                      <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    
                    <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono-tech text-cyan-300 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className={`${!isPhoneFrame ? 'lg:col-span-6 space-y-6 flex flex-col justify-between' : 'space-y-6'}`}>
              
              <div className="space-y-3">
                <label className="block text-xs font-mono-tech text-slate-300 font-bold tracking-wider uppercase">
                  3. DESCRIPTION & CATEGORY AI
                </label>

                <div className="space-y-3">
                  <textarea
                    rows={isPhoneFrame ? 3 : 5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue... (e.g., 'There is a big hole in the road')"
                    className="w-full bg-[#070A12] border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />

                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-cyan-500/50 flex items-center gap-3 text-cyan-300 font-mono-tech text-xs sm:text-sm cyan-glow-sm">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="font-extrabold text-white">Detected Category:</span>
                    <span className="font-bold">{category}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono-tech text-slate-300 font-bold tracking-wider uppercase">
                  4. PRIORITY SELECTION
                </label>

                <div className="grid grid-cols-3 gap-3 font-mono-tech text-xs sm:text-sm">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-3.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        priority === p
                          ? 'border-amber-400 bg-amber-950/50 text-amber-300 cyan-glow-sm scale-105'
                          : 'border-slate-800 bg-[#070A12] text-slate-300 hover:text-white'
                      }`}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer shadow-xl active:scale-95"
                >
                  <Send className="w-5 h-5" />
                  <span>✨ ANALYZE & SUBMIT REPORT</span>
                </button>
              </div>

            </div>

          </form>
        )}

        {isPhoneFrame && (
          <div className="bg-[#0A0D16] border-t border-slate-800/80 px-4 py-3 grid grid-cols-4 gap-1 text-center font-mono-tech text-xs text-slate-400 mt-6">
            <button onClick={() => setActivePage('dashboard')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => setActivePage('citysync-map')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <Map className="w-5 h-5" />
              <span>Map</span>
            </button>
            <button onClick={() => setActivePage('maintenance')} className="flex flex-col items-center gap-1 hover:text-cyan-400">
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>
            <button onClick={() => setActivePage('report-issue')} className="flex flex-col items-center gap-1 py-1 rounded-lg bg-[#00F0FF] text-black font-bold">
              <FileText className="w-5 h-5" />
              <span>Reports</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
