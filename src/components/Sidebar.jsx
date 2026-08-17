import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Plane,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Camera,
  ShieldCheck,
  UserCheck,
  UserPlus
} from 'lucide-react';

import { subscribeToAdminRequests } from '../services/adminRequestService';
import Logo from './Logo';

export default function Sidebar({
  activePage,
  setActivePage,
  user,
  theme,
  onOpenDispatchModal,
  onOpenSettings,
  onOpenApprovalModal
}) {
  const isAdmin = user?.role === 'admin';
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = subscribeToAdminRequests((data) => {
        const count = data.filter((d) => d.status === 'pending').length;
        setPendingRequestsCount(count);
      });
      return unsubscribe;
    }
  }, [isAdmin]);

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-map', label: 'Live Map', icon: MapPin },
    { id: 'maintenance', label: 'Incident Logs', icon: FileText },
    { id: 'drone-fleet', label: 'Drone Fleet', icon: Plane },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'cctv', label: 'CCTV Monitor', icon: Camera },
  ];

  const publicMenuItems = [
    { id: 'dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
    { id: 'citysync-map', label: 'CitySync AI Map', icon: MapPin },
    { id: 'report-issue', label: 'Report Issue', icon: Sparkles },
    { id: 'incident-detail', label: 'Track Complaint', icon: AlertCircle },
  ];

  const citySyncItems = [
    { id: 'report-issue', label: 'Report an Issue', icon: Sparkles },
    { id: 'citysync-map', label: 'CitySync AI Map', icon: MapPin },
    { id: 'incident-detail', label: 'Incident Inspector', icon: AlertCircle },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen text-slate-300 font-mono-tech select-none overflow-y-auto">
      <div>
        {/* Top Sidebar Header with Custom Theme Logo */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <Logo size="sm" theme={theme} />
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide font-sans">Nexinfra</h2>
              <p className="text-[11px] text-cyan-400 font-mono-tech tracking-widest uppercase">
                {isAdmin ? "Admin Authority" : "Citizen Portal"}
              </p>
            </div>
          </div>

          <div className="mt-2 w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#070A10] border border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isAdmin ? "ADMIN" : "CITIZEN"}</span>
            </span>
            <span className={`font-bold ${isAdmin ? "text-cyan-400" : "text-emerald-400"}`}>
              {isAdmin ? "EXECUTIVE" : "VERIFIED"}
            </span>
          </div>
        </div>

        {/* Admin UAV Dispatch & Access Approval Queue */}
        {isAdmin && (
          <div className="p-4 space-y-2">
            <button
              onClick={onOpenDispatchModal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer active:scale-95 shadow-lg"
            >
              <Plane className="w-4 h-4" />
              <span>⚡ DISPATCH TACTICAL UAV</span>
            </button>

            {/* Admin Personnel Authorization Button */}
            <button
              onClick={onOpenApprovalModal}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-300 font-bold text-xs tracking-wider flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Approvals</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-extrabold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
            {isAdmin ? "Command Center" : "Citizen Services"}
          </div>

          {(isAdmin ? adminMenuItems : publicMenuItems).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 text-cyan-400 border-r-2 border-cyan-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CitySync AI Section for Admin */}
        {isAdmin && (
          <nav className="px-3 py-2 space-y-1 border-t border-slate-800/60 mt-2 pt-3">
            <div className="px-3 py-1.5 text-xs text-cyan-400 font-bold uppercase tracking-widest flex items-center justify-between">
              <span>NEXINFRA AI SYSTEMS</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            {citySyncItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-400 border-r-2 border-cyan-400 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Settings & Support */}
      <div className="p-4 border-t border-slate-800/60 space-y-1 text-xs text-slate-300">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 hover:text-cyan-400 transition-colors cursor-pointer font-medium text-sm"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>Profile & Settings</span>
        </button>
        
        <button 
          onClick={() => alert(`Nexinfra ${isAdmin ? "Command Support: operator@nexinfra.gov" : "Citizen Helpdesk: help@nexinfra.gov"}`)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 hover:text-slate-200 transition-colors cursor-pointer font-medium text-sm"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Support & Helpdesk</span>
        </button>
        
        <div className="pt-3 border-t border-slate-800/40 px-3 flex items-center justify-between text-xs text-slate-400 font-mono-tech">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            SYS ONLINE
          </span>
          <span>v4.2.11</span>
        </div>
      </div>
    </aside>
  );
}
