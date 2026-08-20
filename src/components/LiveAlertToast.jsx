import React, { useState, useEffect } from "react";
import { AlertTriangle, X, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export default function LiveAlertToast({ alert, onInspect, onDismiss }) {
  if (!alert) return null;

  const isCritical = alert.level === "CRITICAL" || alert.priority === "P1";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in">
      <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl space-y-2.5 font-mono-tech text-xs transition-all ${
        isCritical
          ? "bg-[#0B0F19]/95 border-red-500 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.35)] dark:bg-[#0B0F19]/95"
          : "bg-[#0B0F19]/95 border-cyan-500 text-cyan-100 cyan-glow-sm dark:bg-[#0B0F19]/95"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? "bg-red-500 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>LIVE INCIDENT ALERT</span>
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm font-sans">
            {alert.title}
          </h4>
          <p className="text-xs text-slate-300 font-sans line-clamp-2">
            {alert.message || alert.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400">
            📍 {alert.location || alert.ward || "Central Sector"}
          </span>

          <button
            onClick={() => onInspect(alert)}
            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-md"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
