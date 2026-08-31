import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Building,
  Key,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileCheck,
  Lock
} from "lucide-react";

export default function OfficerOverrideModal({
  isOpen,
  onClose,
  incident,
  targetStatus,
  onConfirmOverride
}) {
  if (!isOpen || !incident) return null;

  const [selectedOfficer, setSelectedOfficer] = useState("Officer Rajesh Verma (Ward 4 Field Lead)");
  const [officerPin, setOfficerPin] = useState("");
  const [justification, setJustification] = useState("Ground verification completed by on-site crew");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const municipalOfficers = [
    {
      name: "Officer Rajesh Verma",
      badge: "MUNI-ENG-402",
      role: "Central District & Pavement Field Supervisor",
      ward: "Central District - Ward 4"
    },
    {
      name: "Chief Insp. Sunita Rao",
      badge: "MUNI-HYD-718",
      role: "Hydro & Subsurface Pipeline Lead",
      ward: "Sector 18 Ward - Zone A"
    },
    {
      name: "Officer Amit Sharma",
      badge: "MUNI-SAN-912",
      role: "Cyber Hub Sanitation & Logistics Chief",
      ward: "Cyber Hub - Ward 12"
    },
    {
      name: "Inspector Vikram Patil",
      badge: "MUNI-TAC-105",
      role: "Rapid Emergency Response Commander",
      ward: "City-Wide Tactical Unit"
    }
  ];

  const handleVerifyAndOverride = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!officerPin.trim()) {
      setErrorMsg("Please enter the Municipal Officer's 4-digit Authorization Passcode / PIN.");
      return;
    }

    setIsSuccess(true);

    setTimeout(() => {
      onConfirmOverride({
        incidentId: incident.id,
        targetStatus,
        officer: selectedOfficer,
        justification: justification || "Authorized override by Municipal Officer"
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#0B0F19] border border-amber-500/60 rounded-2xl p-6 sm:p-7 max-w-full sm:max-w-lg mx-4 w-full shadow-[0_0_35px_rgba(245,158,11,0.25)] relative space-y-5 animate-hero-entrance max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              Officer Authorization Required
            </h3>
            <p className="text-xs text-amber-400 uppercase tracking-wider">
              Dual Permission Protocol for "In Progress" Tasks
            </p>
          </div>
        </div>

        {/* Policy Alert Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Active Field Workflow in Progress</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Incident <strong className="text-amber-300">{incident.id}</strong> is actively assigned to municipal ground units. Admin workflow override to <strong>"{targetStatus}"</strong> requires authorization from the on-duty Municipal Field Officer.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              Officer Permission Verified!
            </h4>
            <p className="text-xs text-emerald-300">
              Workflow stage successfully overridden to "{targetStatus}".
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerifyAndOverride} className="space-y-4 text-xs">
            
            {/* Select On-Duty Municipal Officer */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Authorizing Municipal Officer:</span>
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-[#070A10] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400"
              >
                {municipalOfficers.map((off, idx) => (
                  <option key={idx} value={`${off.name} (${off.badge})`}>
                    {off.name} • {off.badge} ({off.ward})
                  </option>
                ))}
              </select>
            </div>

            {/* Officer PIN / Passcode */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Officer Security PIN / Authorization Passcode:</span>
              </label>
              <input
                type="password"
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
                placeholder="Enter 4-digit Officer Passcode (e.g. 1234 or OFFICER)"
                className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500 font-sans">
                💡 Demo Helper: Enter any 4-digit code (e.g., <strong>1234</strong> or <strong>OFFICER</strong>).
              </p>
            </div>

            {/* Justification Note */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Override Protocol Reason / Log Note:</span>
              </label>
              <input
                type="text"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="e.g. Inspection verified asphalt cured ahead of schedule..."
                className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/80 text-red-300 text-[11px] font-bold">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Verify & Override Workflow</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
