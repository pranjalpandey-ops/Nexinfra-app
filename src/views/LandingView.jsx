import React, { useState } from 'react';
import { Activity, BarChart2, Plane, Cpu, ShieldCheck, Zap, Radio, ChevronRight, X, ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingView({ setActivePage }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState(true);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 bg-cyber-grid relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10 w-full">
        
        {/* Hero Header Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          {/* Main Title Banner */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none font-heading">
            <span className="block text-white">Detect Today.</span>
            <span className="block text-white mt-2">Predict Tomorrow.</span>
            <span className="block text-[#00F0FF] text-cyan-glow mt-2">
              Protect Everyone.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto font-sans font-normal">
            The Intelligence Layer for Physical Infrastructure. <strong className="text-cyan-400 font-bold">Nexinfra</strong> unifies continuous
            AI monitoring, autonomous drone networks, and predictive analytics into a
            single command center for municipal authorities.
          </p>

          {/* Hero CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={() => setActivePage('signup')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold font-mono-tech text-sm tracking-wider transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              <span>🚀 INITIALIZE COMMAND ACCESS</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowArchModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-cyan-500/50 bg-slate-900/90 hover:bg-cyan-950/60 text-cyan-300 font-bold font-mono-tech text-sm tracking-wider transition-all hover:border-cyan-400 uppercase cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>INSPECT PLATFORM ARCHITECTURE</span>
            </button>
          </div>
        </div>

        {/* Stats Metric Cards Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto font-mono-tech">
          <div className="bg-[#0D121F]/90 border-2 border-slate-800 p-6 rounded-xl text-center backdrop-blur hover:border-cyan-500/50 transition-all cyan-glow-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              99.9%
            </div>
            <div className="text-sm text-slate-300 font-bold mt-1.5 tracking-wider">
              Uptime
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border-2 border-slate-800 p-6 rounded-xl text-center backdrop-blur hover:border-cyan-500/50 transition-all cyan-glow-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              &lt;2ms
            </div>
            <div className="text-sm text-slate-300 font-bold mt-1.5 tracking-wider">
              Latency
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border-2 border-slate-800 p-6 rounded-xl text-center backdrop-blur hover:border-cyan-500/50 transition-all cyan-glow-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              10k+
            </div>
            <div className="text-sm text-slate-300 font-bold mt-1.5 tracking-wider">
              Sensors
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border-2 border-slate-800 p-6 rounded-xl text-center backdrop-blur hover:border-cyan-500/50 transition-all cyan-glow-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00F0FF]">
              24/7
            </div>
            <div className="text-sm text-slate-300 font-bold mt-1.5 tracking-wider">
              Monitoring
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mt-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Core Capabilities
          </h2>
        </div>

        {/* Core Capabilities Cards Grid */}
        <div className="mt-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Capability 1 */}
            <div className="bg-[#0D121F]/90 border border-slate-800 border-t-4 border-t-amber-500 p-8 rounded-2xl backdrop-blur space-y-4 hover:border-slate-700 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide font-sans">
                Continuous AI Monitoring
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                Ingest real-time telemetry from thousands of endpoints. Our neural networks
                detect anomalies across stress sensors, flow meters, and structural monitors
                before human operators notice a deviation.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="bg-[#0D121F]/90 border border-slate-800 border-t-4 border-t-cyan-400 p-8 rounded-2xl backdrop-blur space-y-4 hover:border-slate-700 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide font-sans">
                Predictive Analytics
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                Forecast failure modes using historical machine learning data and real-time digital twin simulations.
              </p>
            </div>

          </div>

          {/* Capability 3 */}
          <div className="bg-[#0D121F]/90 border border-slate-800 border-t-4 border-t-rose-500 p-8 rounded-2xl backdrop-blur space-y-5 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-wide font-sans">
              Autonomous Drone Loop
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-4xl font-sans">
              When anomalies are detected, Nexinfra automatically dispatches rapid-response UAVs
              to the precise coordinates. High-resolution LiDAR and thermal imaging are streamed
              directly back to the command center in real-time.
            </p>

            <div className="pt-2">
              <button 
                onClick={() => setActiveTelemetry(!activeTelemetry)}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-900 border border-cyan-500/50 text-[#00F0FF] font-mono-tech text-xs font-bold hover:bg-cyan-950/60 transition-colors cursor-pointer"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${activeTelemetry ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                <span>● Live Telemetry Link Active</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Platform Architecture Spec Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl p-8 max-w-3xl w-full cyan-glow-lg relative space-y-6">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2.5 text-cyan-400 font-mono-tech text-xs tracking-wider">
              <Cpu className="w-5 h-5" />
              <span>NEXINFRA PLATFORM ARCHITECTURE v4.2</span>
            </div>

            <h3 className="text-2xl font-bold text-white font-heading">
              Edge-to-Cloud Neural Mesh Specification
            </h3>

            <div className="bg-black/80 border border-slate-800 p-5 rounded-xl text-xs font-mono-tech text-cyan-300 space-y-2 max-h-72 overflow-y-auto">
              <p>[00:00:01] INGEST LAYER: 10,482 Telemetry Endpoints online (LoRaWAN + 5G NR)</p>
              <p>[00:00:02] INFERENCE: Edge TPU array processing FFT vibration spectrograms at 1000Hz</p>
              <p>[00:00:03] SYNAPSE: Temporal Convolutional Network (TCN) detecting micro-fractures</p>
              <p>[00:00:04] UAV DISPATCH: MAVLink protocol auto-routing quadrotor UAV-09 to Grid B4</p>
              <p>[00:00:05] DIGITAL TWIN: Real-time FEA mesh update broadcast via WebSocket API</p>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => {
                  setShowArchModal(false);
                  setActivePage('dashboard');
                }}
                className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-mono-tech text-xs tracking-wider uppercase cyan-glow-sm cursor-pointer"
              >
                ⚡ OPEN COMMAND CENTER CONSOLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070B] text-slate-300 py-14 px-4 sm:px-6 lg:px-8 font-mono-tech text-xs relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="text-white font-extrabold text-2xl tracking-wider font-heading">
              Nexinfra
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm uppercase">
              © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>COMMAND GRID ACTIVE</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-wider uppercase text-xs">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">About</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Careers</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-wider uppercase text-xs">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">API</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-wider uppercase text-xs">Legal & Social</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Terms</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Twitter</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">LinkedIn</li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
