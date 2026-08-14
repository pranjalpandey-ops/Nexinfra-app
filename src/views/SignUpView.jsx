import React, { useState } from 'react';
import { Shield, Cpu, Zap, Activity, User, Mail, Building, Lock, Check, ChevronDown, ArrowRight } from 'lucide-react';

export default function SignUpView({ setActivePage, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    clearance: '',
    agreed: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      alert('Please acknowledge the Terms of Service and Data Privacy Protocol.');
      return;
    }
    onLoginSuccess({
      name: formData.fullName || 'Operator Standard',
      email: formData.email || 'operator@nexinfra.gov',
      clearance: formData.clearance || 'Level 2 Supervisor'
    });
    setActivePage('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 bg-cyber-grid flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
        
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6">
          
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
              NexInfra Console
            </h1>
            <p className="text-cyan-400 font-mono-tech text-xs sm:text-sm tracking-widest uppercase font-bold">
              KINETIC INFRASTRUCTURE INTELLIGENCE
            </p>
          </div>

          <p className="text-slate-300 text-base leading-relaxed font-sans">
            Deploy active oversight across municipal grids. Establish secure connection to authorize
            real-time telemetry and predictive diagnostics.
          </p>

          <div className="space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 cyan-glow-sm">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-sans">
                  Real-time AI monitoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Continuous stream analysis of critical infrastructure nodes with sub-second latency.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-sans">
                  Automated workflows
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Trigger pre-configured response protocols instantly when sensor thresholds are breached.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-sans">
                  Predictive insights
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Forecast component degradation before systemic failure using historical machine learning models.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-mono-tech text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>SYSTEM SECURE</span>
            </div>
            <span>V. 4.2.11</span>
          </div>

        </div>

        {/* Right Column Form */}
        <div className="lg:col-span-6">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            
            <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 w-full" />

            <div className="p-8 sm:p-10 space-y-6">
              
              <div>
                <h2 className="text-3xl font-bold text-white font-heading">
                  Initialize Credentials
                </h2>
                <p className="text-slate-300 text-sm mt-1 font-sans">
                  Enter operator details to provision your command access.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 font-mono-tech text-xs sm:text-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-slate-200 font-bold">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Operator Designation"
                        className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-200 font-bold">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="node@organization.gov"
                        className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-200 font-bold">Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Municipal Authority / Corporate Entity"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-200 font-bold">Industry Role</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <select
                      required
                      value={formData.clearance}
                      onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-9 py-3 text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer text-xs sm:text-sm font-sans"
                    >
                      <option value="" disabled>Select Security Clearance</option>
                      <option value="Level 1 - Tactical Field Operator">Level 1 - Tactical Field Operator</option>
                      <option value="Level 2 - Regional Grid Supervisor">Level 2 - Regional Grid Supervisor</option>
                      <option value="Level 3 - Executive Command Authority">Level 3 - Executive Command Authority</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2 flex items-start gap-3 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreed}
                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                    className="mt-0.5 rounded border-slate-800 text-cyan-400 focus:ring-cyan-400 bg-[#070A10] cursor-pointer"
                  />
                  <label htmlFor="terms" className="cursor-pointer leading-relaxed">
                    I acknowledge the{' '}
                    <span className="text-cyan-400 font-bold underline hover:text-cyan-300">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-cyan-400 font-bold underline hover:text-cyan-300">
                      Data Privacy Protocol
                    </span>.
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer shadow-xl active:scale-95"
                  >
                    <span>🚀 CREATE ACCOUNT & INITIALIZE</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center pt-2 text-slate-400 text-xs font-mono-tech">
                  Already authenticated?{' '}
                  <button
                    type="button"
                    onClick={() => setActivePage('login')}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Establish Link
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>

      </div>

      <footer className="text-center text-slate-400 text-xs font-mono-tech uppercase pt-8">
        © 2024 KINETIC INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
      </footer>

    </div>
  );
}
