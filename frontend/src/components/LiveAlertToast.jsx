import React from "react";
import { X, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export default function LiveAlertToast({
  alert,
  onInspect,
  onDismiss,
  onClose,
  onViewIncident
}) {
  if (!alert) return null;

  const isCritical = alert.level === "CRITICAL" || alert.priority === "P1" || alert.severity === "Critical";

  const handleDismiss = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof onDismiss === "function") onDismiss();
    if (typeof onClose === "function") onClose();
  };

  const handleInspect = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof onInspect === "function") {
      onInspect(alert);
    } else if (typeof onViewIncident === "function") {
      onViewIncident(alert);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-bounce-in font-sans">
      <div className={`live-toast-card p-4 rounded-2xl border backdrop-blur-xl shadow-2xl space-y-2.5 font-mono-tech text-xs transition-all ${
        isCritical
          ? "bg-[#0B0F19]/95 border-red-500 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.4)]"
          : "bg-[#0B0F19]/95 border-cyan-500 text-cyan-100 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? "bg-red-500 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>LIVE INCIDENT ALERT</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Alert"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm font-sans toast-title line-clamp-1">
            {alert.title || "[CCTV VERIFIED] Civic Defect"}
          </h4>
          <p className="text-xs text-slate-300 font-sans line-clamp-2 toast-desc">
            {alert.message || alert.description || "Real-time verified defect detected by surveillance intelligence."}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] toast-footer">
          <span className="text-slate-400 truncate max-w-[170px]">
            📍 {alert.location || alert.ward || alert.address || "Central District - Ward 4"}
          </span>

          <button
            type="button"
            onClick={handleInspect}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition shadow-red-600/40"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
