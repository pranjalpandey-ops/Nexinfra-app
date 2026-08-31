import React, { useState } from "react";
import {
  AlertTriangle,
  Send,
  X,
  Clock,
  ShieldAlert,
  CheckCircle2,
  BellRing,
  Flame,
  Radio,
  FileWarning
} from "lucide-react";
import { createLiveAlert } from "../services/alertService";

export default function CitizenEscalationModal({
  isOpen,
  onClose,
  incident,
  user,
  elapsedFormatted = "4h 15m",
  onEscalated
}) {
  const [selectedReason, setSelectedReason] = useState(
    "Turnaround SLA Exceeded: Issue has been unattended beyond standard remediation window."
  );
  const [customNote, setCustomNote] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("HIGH"); // "HIGH" | "CRITICAL"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !incident) return null;

  const ESCALATION_REASONS = [
    "Turnaround SLA Exceeded: Issue has been unattended beyond standard remediation window.",
    "Public Safety Hazard: Risk of pedestrian injury or vehicular accident is escalating.",
    "Traffic & Transit Blockage: Heavy congestion and lane blockages worsening.",
    "Health & Sanitation Risk: Sewage, solid waste overflow or hazardous material exposure.",
    "Structural Damage Escalation: Crater/leak spreading and causing collateral damage."
  ];

  const handleSubmitEscalation = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const escalationData = {
      incidentId: incident.id,
      incidentTitle: incident.title,
      ward: incident.ward || "Central District",
      escalatedBy: user?.email || "citizen.demo@nexinfra.org",
      escalatedByName: user?.name || "Resident Citizen",
      reason: selectedReason,
      customNote: customNote.trim(),
      urgency: urgencyLevel,
      elapsedTime: elapsedFormatted,
      escalatedAt: new Date().toISOString()
    };

    // 1. Dispatch live alert to Municipal Officers & Command Console
    createLiveAlert({
      title: `🚨 CITIZEN ESCALATION: ${incident.id} - ${incident.title}`,
      location: incident.address || incident.ward || "Civic Ward",
      level: urgencyLevel === "CRITICAL" ? "CRITICAL" : "WARNING",
      priority: "P1",
      department: incident.assignedDepartment || "Municipal Response Grid",
      details: `Citizen ${escalationData.escalatedByName} escalated due to delay (${elapsedFormatted} elapsed). Reason: ${selectedReason} ${customNote ? `| Note: ${customNote}` : ""}`,
      actionRequired: "Immediate Dispatch / Engineering Review Required"
    });

    // 2. Save escalation record in localStorage for local persistence
    try {
      const stored = JSON.parse(localStorage.getItem("nexinfra_citizen_escalations") || "[]");
      stored.unshift(escalationData);
      localStorage.setItem("nexinfra_citizen_escalations", JSON.stringify(stored));
      
      // Update selectedComplaint with escalation flag
      const currentSelected = JSON.parse(localStorage.getItem("selectedComplaint") || "{}");
      if (currentSelected.id === incident.id) {
        currentSelected.isEscalated = true;
        currentSelected.escalationData = escalationData;
        localStorage.setItem("selectedComplaint", JSON.stringify(currentSelected));
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onEscalated) {
        onEscalated(escalationData);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech select-none animate-hero-entrance">
      <div className="bg-[#0B0F19] border border-amber-500/70 rounded-2xl p-6 sm:p-7 max-w-full sm:max-w-lg mx-4 w-full shadow-[0_0_40px_rgba(245,158,11,0.25)] relative space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-500/80 flex items-center justify-center text-amber-400 shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[11px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <span>⚠️ CITIZEN DELAY ESCALATION NOTICE</span>
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Report Excessive Resolution Delay
            </h3>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400">{incident.id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800">
              {incident.priority || "P1"} Priority
            </span>
          </div>
          <div className="text-white font-bold font-sans text-sm">{incident.title}</div>
          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Elapsed: <strong className="text-white">{elapsedFormatted}</strong></span>
            </span>
            <span className="text-red-400 font-bold">Turnaround SLA Exceeded</span>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center rounded-xl bg-emerald-950/80 border border-emerald-500 space-y-2 text-emerald-200 animate-hero-entrance">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Escalation Notice Dispatched!</h4>
            <p className="text-xs text-slate-300">
              Emergency high-priority notification transmitted directly to Zonal Municipal Officers and Engineering Response Crews.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitEscalation} className="space-y-4 text-xs">
            
            {/* Reason Selection */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase">
                Select Escalation Reason *
              </label>
              <div className="space-y-2">
                {ESCALATION_REASONS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer text-[11px] ${
                      selectedReason === reason
                        ? "bg-amber-950/60 border-amber-500 text-amber-200"
                        : "bg-[#070A10] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="escalationReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 text-amber-500 focus:ring-0"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase">
                Escalation Urgency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgencyLevel("HIGH")}
                  className={`py-2 rounded-xl font-bold uppercase border transition cursor-pointer text-xs ${
                    urgencyLevel === "HIGH"
                      ? "bg-amber-950 border-amber-500 text-amber-300"
                      : "bg-[#070A10] border-slate-800 text-slate-400"
                  }`}
                >
                  ⚠️ High Priority
                </button>
                <button
                  type="button"
                  onClick={() => setUrgencyLevel("CRITICAL")}
                  className={`py-2 rounded-xl font-bold uppercase border transition cursor-pointer text-xs ${
                    urgencyLevel === "CRITICAL"
                      ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                      : "bg-[#070A10] border-slate-800 text-slate-400"
                  }`}
                >
                  🚨 Critical / Emergency
                </button>
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase">
                Additional Citizen Observations (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Provide any additional on-ground details (e.g. water overflowing onto pedestrian sidewalk, road crater deepening)..."
                rows={2}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-black" />
                <span>{isSubmitting ? "Dispatching Notice..." : "Transmit Escalation Notice"}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
