import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Eye,
  Send
} from "lucide-react";
import { acknowledgeAlert } from "../services/alertService";

export default function AlertsDrawerModal({
  isOpen,
  onClose,
  alerts = [],
  onSelectIncident
}) {
  if (!isOpen) return null;

  const [filterLevel, setFilterLevel] = useState("ALL"); // ALL | CRITICAL | WARNING

  const handleAcknowledge = (alertId, e) => {
    e.stopPropagation();
    acknowledgeAlert(alertId);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterLevel === "ALL") return true;
    return a.level === filterLevel;
  });

  const unacknowledgedCritical = alerts.filter(
    (a) => a.level === "CRITICAL" && !a.acknowledged
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-red-500/50 rounded-2xl max-w-3xl w-full p-6 sm:p-8 cyan-glow-lg relative space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-lg">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                <span>Emergency Incident & Live Alert Center</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Real-Time Defect Ingestion • IoT Hydro/Grid Telemetry • Critical Safety SLA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6 font-mono-tech text-xs">
            <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-300 font-bold">
              {unacknowledgedCritical} Critical Active
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLevel("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterLevel === "ALL"
                  ? "bg-slate-800 text-white border border-slate-600"
                  : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Alerts ({alerts.length})
            </button>

            <button
              onClick={() => setFilterLevel("CRITICAL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterLevel === "CRITICAL"
                  ? "bg-red-950 border border-red-500 text-red-300"
                  : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Critical Hazards
            </button>

            <button
              onClick={() => setFilterLevel("WARNING")}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterLevel === "WARNING"
                  ? "bg-amber-950 border border-amber-500 text-amber-300"
                  : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              SLA Warnings
            </button>
          </div>

          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE FIREBASE SYNC</span>
          </div>
        </div>

        {/* Alerts Stream List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono-tech text-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p>No active alerts matching selected criteria. All sectors optimal.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.level === "CRITICAL";
              const isWarning = alert.level === "WARNING";

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (onSelectIncident && alert.incidentId) {
                      onSelectIncident(alert.incidentId);
                      onClose();
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer font-mono-tech text-xs space-y-2.5 ${
                    alert.acknowledged
                      ? "bg-[#070A10] border-slate-800 opacity-75 hover:opacity-100"
                      : isCritical
                      ? "bg-[#0A0E18] border-red-500/70 hover:border-red-400 shadow-lg"
                      : isWarning
                      ? "bg-[#0A0E18] border-amber-500/60 hover:border-amber-400"
                      : "bg-[#070A10] border-cyan-500/40 hover:border-cyan-400"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isCritical
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : isWarning
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        }`}
                      >
                        {alert.level}
                      </span>

                      <span className="font-bold text-white text-sm font-sans">
                        {alert.title}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs font-sans">
                    {alert.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location}</span>
                      </span>
                      <span>•</span>
                      <span>Source: {alert.source || "GIS Telemetry"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition cursor-pointer"
                        >
                          ✓ Acknowledge
                        </button>
                      )}

                      <span className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                        <span>Inspect Defect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono-tech">
          <span>Protocol: Automatic priority escalation active for unresolved P1 defects.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold uppercase cursor-pointer hover:bg-cyan-300"
          >
            Close Alert Center
          </button>
        </div>
      </div>
    </div>
  );
}
