import React, { useState } from "react";
import {
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  ShieldCheck,
  Building,
  Sparkles,
  MapPin
} from "lucide-react";
import { deleteComplaint } from "../services/deleteComplaint";
import { createLiveAlert } from "../services/alertService";

export default function DeleteIncidentModal({
  isOpen,
  onClose,
  incident,
  user,
  onDeleted
}) {
  if (!isOpen || !incident) return null;

  const [selectedReason, setSelectedReason] = useState("Defect Fully Repaired & Verified on Site");
  const [customNotes, setCustomNotes] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presetReasons = [
    {
      title: "✅ Work Completed & Defect Restored",
      desc: "Repair crew completed asphalt paving, waterline fix, or waste clearance on site."
    },
    {
      title: "🔄 Duplicate Incident Report Merged",
      desc: "Grievance already tracked under primary master incident ticket."
    },
    {
      title: "🛡️ False Alarm / No Hazard Found",
      desc: "Physical ground inspection verified infrastructure is nominal and clear."
    },
    {
      title: "🚧 Transferred to State Division",
      desc: "Forwarded to State Highway Authority or specialized utility agency."
    }
  ];

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);

    const finalReason = selectedReason === "Custom Note" ? (customNotes || "Defect resolved by municipal unit.") : selectedReason;
    const officerName = user?.name || "Municipal Desk Authority";

    // 1. Delete incident from Database and Local Storage
    await deleteComplaint(incident.id);

    // 2. Broadcast Live Resolution Notification to Citizen Alert Feed
    createLiveAlert({
      level: "INFO",
      title: `✅ Incident ${incident.id} Closed & Resolved`,
      message: `Defect "${incident.title || incident.category}" was closed by ${officerName}. Resolution: ${finalReason}. ${customNotes ? `Notes: "${customNotes}"` : ""}`,
      location: incident.ward || incident.address || "City Grid",
      incidentId: incident.id,
      source: "Municipal Command Authority"
    });

    // 3. Save Citizen Notification History
    try {
      const existingNotifs = JSON.parse(localStorage.getItem("nexinfra_citizen_resolutions") || "[]");
      const newNotif = {
        id: `RES-${Date.now()}`,
        incidentId: incident.id,
        title: incident.title || incident.category,
        reason: finalReason,
        notes: customNotes,
        resolvedBy: officerName,
        resolvedAt: new Date().toISOString(),
        address: incident.address || incident.ward
      };
      localStorage.setItem("nexinfra_citizen_resolutions", JSON.stringify([newNotif, ...existingNotifs]));
    } catch (e) {}

    setIsDeleting(false);
    setIsSuccess(true);

    if (onDeleted) {
      onDeleted(incident.id);
    }

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#0B0F19] border border-red-500/60 rounded-2xl p-6 sm:p-7 max-w-full sm:max-w-lg mx-4 w-full shadow-[0_0_35px_rgba(239,68,68,0.25)] relative space-y-5 animate-hero-entrance max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Delete / Close Incident Log
            </h3>
            <p className="text-xs text-red-400 uppercase tracking-wider">
              Dispatches Resolution Notice to Citizen
            </p>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-300">{incident.id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
              {incident.category}
            </span>
          </div>
          <div className="text-white font-bold font-sans text-sm">{incident.title}</div>
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{incident.address || incident.ward || "Sector Coordinates"}</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              Incident Log Closed & Deleted!
            </h4>
            <p className="text-xs text-emerald-300">
              Citizen resolution notice & incident log successfully dispatched to notification feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmDelete} className="space-y-4 text-xs">
            
            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span>Select Reason for Deletion / Resolution:</span>
              </label>

              <div className="space-y-2">
                {presetReasons.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedReason(r.title)}
                    className={`w-full p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                      selectedReason === r.title
                        ? "bg-red-950/70 border-red-500 text-white shadow-md shadow-red-950/50"
                        : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="font-bold text-xs">{r.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-slate-300 font-bold uppercase">
                Resolution Notice Message to Citizen (Optional):
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g., Pothole filled and sealed by Pavement Unit 4 at 10:45 AM. Surface leveled..."
                rows={3}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400 transition"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isDeleting}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Delete Log & Notify Citizen"}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
