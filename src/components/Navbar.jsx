import React, { useState, useEffect } from 'react';
import { Radio, Sparkles, MapPin, Settings, ShieldCheck, UserCheck, Sun, Moon, Bell, ShieldAlert } from 'lucide-react';
import { subscribeToLiveAlerts } from '../services/alertService';
import Logo from './Logo';

export default function Navbar({
  activePage,
  setActivePage,
  isAuth,
  user,
  onOpenSettings,
  onOpenAlerts,
  theme,
  setTheme
}) {
  const isAdmin = user?.role === 'admin';
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveAlerts((data) => {
      setAlerts(data);
    });
    return unsubscribe;
  }, []);

  const unreadCriticalCount = alerts.filter(
    (a) => (a.level === 'CRITICAL' || a.priority === 'P1') && !a.acknowledged
  ).length;

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#07090E]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Custom Theme Emblem */}
        <div 
          onClick={() => setActivePage('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Logo size="md" theme={theme} className="group-hover:scale-105 transition-transform" />

          <div>
            <span
              className="text-2xl font-bold tracking-[0.02em] text-white group-hover:text-cyan-400 transition-all duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              NEX<span className="text-cyan-400">infra</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="hidden md:flex items-center space-x-1 font-mono-tech text-sm tracking-wider">
          <button
            onClick={() => setActivePage('landing')}
            className={`px-3.5 py-2 rounded transition-colors cursor-pointer ${
              activePage === 'landing'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Platform
          </button>
          
          <button
            onClick={() => setActivePage('dashboard')}
            className={`px-3.5 py-2 rounded transition-colors cursor-pointer ${
              activePage === 'dashboard'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {isAdmin ? "Console Dashboard" : "Citizen Dashboard"}
          </button>

          <button
            onClick={() => setActivePage('report-issue')}
            className={`px-3.5 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3.5 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3.5 py-2 rounded transition-colors cursor-pointer ${
              activePage === 'incident-detail'
                ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {isAdmin ? "Incident Inspector" : "Track Incident"}
          </button>

          {isAdmin && (
            <button
              onClick={() => setActivePage('maintenance')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer ${
                activePage === 'maintenance'
                  ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Incident Logs
            </button>
          )}
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center space-x-3 font-mono-tech text-xs">
          
          {/* Live Incident Alert Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 transition-all cursor-pointer shadow-sm"
            title="Live Incident & Emergency Alert Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCriticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-black text-[9px] font-extrabold flex items-center justify-center animate-bounce shadow-md">
                {unreadCriticalCount}
              </span>
            )}
          </button>

          {/* Quick Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Settings & Display Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          {!isAuth ? (
            <>
              <button
                onClick={() => setActivePage('login')}
                className={`px-4 py-2 rounded transition-all uppercase tracking-wider text-xs font-bold cursor-pointer ${
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-cyan-950 border border-cyan-500/60 text-cyan-300"
                  : "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isAdmin ? "ADMIN" : "CITIZEN"}</span>
              </span>

              <button
                onClick={() => setActivePage('dashboard')}
                className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/60 transition-all uppercase font-mono-tech text-xs font-bold cursor-pointer"
              >
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Console</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
