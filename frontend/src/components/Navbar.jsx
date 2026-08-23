import React, { useState, useEffect } from 'react';
import { Radio, Sparkles, MapPin, Settings, ShieldCheck, UserCheck, Sun, Moon, Bell, ShieldAlert, Building, LogOut } from 'lucide-react';
import { subscribeToLiveAlerts } from '../services/alertService';
import Logo from './Logo';

export default function Navbar({
  activePage,
  setActivePage,
  isAuth,
  user,
  onOpenSettings,
  onOpenAlerts,
  onLogout,
  theme,
  setTheme
}) {
  const isOfficerContext = user?.role === 'officer' || activePage === 'municipal-dashboard';
  const isAdminContext = user?.role === 'admin' && !isOfficerContext;
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
          
          {/* MUNICIPAL OFFICER NAVIGATION TABS (DEDICATED INDEPENDENT MODULES) */}
          {isOfficerContext && (
            <>
              <button
                onClick={() => setActivePage('officer-map')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'officer-map' || activePage === 'municipal-dashboard'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                🗺️ Live Team Map
              </button>

              <button
                onClick={() => setActivePage('teams-laid-to-work')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'teams-laid-to-work'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                ⚡ Teams Laid to Work
              </button>

              <button
                onClick={() => setActivePage('task-allotment')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'task-allotment'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                📋 Task Allotment
              </button>

              <button
                onClick={() => setActivePage('team-details')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'team-details'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                👥 Team Rosters
              </button>

              <button
                onClick={() => setActivePage('add-member')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'add-member'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                ➕ Add Member
              </button>

              <button
                onClick={() => setActivePage('maintenance')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'maintenance'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                📄 Incident Logs
              </button>

              <button
                onClick={() => setActivePage('cctv')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-mono text-xs flex items-center gap-1 ${
                  activePage === 'cctv'
                    ? 'text-amber-300 bg-amber-950/60 border-b-2 border-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                📹 CCTV Monitor
              </button>
            </>
          )}

          {/* ADMIN & CITIZEN NAVIGATION TABS */}
          {!isOfficerContext && (
            <>
              {isAuth && (
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={`px-3.5 py-2 rounded transition-colors cursor-pointer ${
                    activePage === 'dashboard'
                      ? 'text-cyan-400 bg-cyan-950/40 border-b-2 border-cyan-400 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Dashboard
                </button>
              )}

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
                {isAdminContext ? "Incident Inspector" : "Track Incident"}
              </button>
            </>
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
                isOfficerContext
                  ? "bg-amber-950 border border-amber-500/60 text-amber-300"
                  : isAdminContext
                  ? "bg-cyan-950 border border-cyan-500/60 text-cyan-300"
                  : "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
              }`}>
                {isOfficerContext ? (
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                ) : isAdminContext ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{isOfficerContext ? "OFFICER" : isAdminContext ? "ADMIN" : "CITIZEN"}</span>
              </span>

              {/* Universal Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/50 hover:bg-red-900/60 text-red-300 font-bold text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
                title="Logout of Account"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
