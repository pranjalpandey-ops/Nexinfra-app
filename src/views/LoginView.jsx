import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Building } from 'lucide-react';

export default function LoginView({ setActivePage, onLoginSuccess }) {
  const [email, setEmail] = useState('operator@nexinfra.gov');
  const [securityKey, setSecurityKey] = useState('••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      name: 'Operator Chief',
      email: email,
      clearance: 'Level 3 Executive Command'
    });
    setActivePage('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 bg-cyber-grid flex flex-col justify-between items-center py-12 px-4 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="my-auto w-full max-w-lg relative z-10">
        <div className="bg-[#0D121F]/95 border border-cyan-500/40 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md cyan-glow-sm space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
              <Shield className="w-8 h-8" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white font-heading">
                NexInfra System
              </h1>
              <p className="text-cyan-400 font-mono-tech text-xs sm:text-sm tracking-widest uppercase font-bold mt-1">
                COMMAND CENTER AUTHORIZATION
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-mono-tech text-xs sm:text-sm">
            
            <div className="space-y-2">
              <label className="block text-slate-200 font-bold">Work Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@nexinfra.gov"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-slate-200 font-bold">Security Key</label>
                <button
                  type="button"
                  onClick={() => alert('Security recovery link sent to operator email.')}
                  className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer shadow-xl active:scale-95"
              >
                <span>⚡ ACCESS COMMAND CENTER</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-widest font-bold">
                OR
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl border border-slate-800 bg-[#070A10] hover:bg-slate-800/80 text-slate-200 font-mono-tech text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Sign In with Enterprise SSO</span>
            </button>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-cyan-400/90 tracking-widest uppercase font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>SECURE CONNECTION ESTABLISHED</span>
            </div>

          </form>

        </div>
      </div>

      <footer className="text-center text-slate-400 text-xs font-mono-tech uppercase pt-6">
        © 2024 NEXINFRA INFRASTRUCTURE INTELLIGENCE. ALL SYSTEMS OPERATIONAL.
      </footer>

    </div>
  );
}
