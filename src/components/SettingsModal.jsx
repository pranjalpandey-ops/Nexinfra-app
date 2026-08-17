import React from 'react';
import {
  X,
  Settings,
  Smartphone,
  Monitor,
  Zap,
  Eye,
  Check,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  UserPlus
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  theme,
  setTheme,
  user,
  onOpenApprovalModal
}) {
  if (!isOpen) return null;

  const isAdmin = user?.role === "admin";
  const isPendingAdmin = user?.role === "pending_admin";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full cyan-glow-lg relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              Platform Settings
            </h3>
            <p className="text-xs text-cyan-400 font-mono-tech uppercase">
              Preferences & Access Identity
            </p>
          </div>
        </div>

        {/* User Role Card */}
        {user && (
          <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono-tech uppercase font-bold">
                Active Clearance Status
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isAdmin
                  ? "bg-cyan-950 border border-cyan-500/50 text-cyan-300"
                  : isPendingAdmin
                  ? "bg-amber-950 border border-amber-500/50 text-amber-300"
                  : "bg-emerald-950 border border-emerald-500/50 text-emerald-300"
              }`}>
                {isAdmin ? (
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                ) : isPendingAdmin ? (
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                ) : (
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                )}
                <span>
                  {isAdmin
                    ? "ADMIN"
                    : isPendingAdmin
                    ? "PENDING ADMIN"
                    : "PUBLIC CITIZEN"}
                </span>
              </span>
            </div>

            <div className="text-sm font-bold text-white font-sans">
              {user.name || "Operator Chief"}
            </div>
            <div className="text-xs text-slate-400 font-mono-tech truncate">
              {user.email}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono-tech pt-1 border-t border-slate-800">
              Clearance: {user.clearance || (isAdmin ? "Level 3 Executive Command Authority" : "Public Citizen Level 1")}
            </div>

            {/* Admin Personnel Management Trigger */}
            {isAdmin && onOpenApprovalModal && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onClose();
                    onOpenApprovalModal();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-950/60 border border-cyan-500/60 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs font-mono-tech flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Review Admin Clearance Requests</span>
                </button>
              </div>
            )}

            {isPendingAdmin && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-300 font-mono-tech">
                ⏳ Your Admin application is pending review by a Predefined Administrator.
              </div>
            )}
          </div>
        )}

        {/* Theme Selection */}
        <div className="space-y-3 font-mono-tech text-xs">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            Appearance Mode
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Light Mode */}
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-bold text-sm">Light</span>
              {theme === 'light' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-bold text-sm">Dark</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Device View Mode Selection Section */}
        <div className="space-y-3 font-mono-tech text-xs">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            Display Responsive Mode
          </label>

          <div className="space-y-2">
            <button
              onClick={() => setViewMode('auto')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'auto'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">⚡ Auto (Default)</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Automatically adapts layout to screen width
                  </div>
                </div>
              </div>
              {viewMode === 'auto' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={() => setViewMode('phone')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'phone'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">📱 Phone View Mode</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Simulates citizen mobile app frame
                  </div>
                </div>
              </div>
              {viewMode === 'phone' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={() => setViewMode('desktop')}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 cyan-glow-sm'
                  : 'border-slate-800 bg-[#070A10] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold text-sm text-white">💻 Desktop Console Mode</div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Expanded operations layout
                  </div>
                </div>
              </div>
              {viewMode === 'desktop' && <Check className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Accessibility Info Badge */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3 text-cyan-300 text-xs font-mono-tech">
          <Eye className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-snug font-sans">
            Role authorization & Theme preferences active across platform.
          </p>
        </div>

        {/* Close Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs tracking-wider uppercase cyan-glow-sm cursor-pointer"
          >
            SAVE PREFERENCES & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
