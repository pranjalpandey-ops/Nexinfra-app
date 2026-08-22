import React, { useState } from "react";
import {
  Sparkles,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Building,
  Clock,
  Layers,
  ArrowRight,
  Activity,
  Sliders,
  Maximize2
} from "lucide-react";

export default function AutoAIVerificationSubpage({
  incidents = [],
  onSelectIncident,
  selectedIncident,
  onAdvanceStatus,
  actionLoading
}) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  const verifiedList = incidents.filter(
    (i) =>
      i.status === "AI Verified" ||
      i.status === "Verified" ||
      i.status === "Forwarded to Municipal Officer" ||
      i.status === "Pending Officer Assignment" ||
      i.status === "In Progress" ||
      i.aiVerified
  );

  const filtered = verifiedList.filter((item) => {
    if (activeCategoryFilter !== "ALL" && item.category !== activeCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 font-mono-tech text-xs">
      
      {/* Subpage Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0C101A] border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white font-heading">
              Auto AI Neural Verification & Triage Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
              YOLOv9-CivicNet (32 FPS)
            </span>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Autonomous deep learning inference queue verifying surface defect geometries, bounding boxes, damage dimensioning, and municipal SLA assignments.
          </p>
        </div>

        {/* Global AI Confidence Slider */}
        <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 flex items-center gap-3 shrink-0">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Auto-Approval Threshold:</span>
              <strong className="text-cyan-400">{confidenceThreshold}%</strong>
            </div>
            <input
              type="range"
              min="70"
              max="98"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
              className="w-36 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* AI Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Inference Accuracy</span>
          <div className="text-base font-extrabold text-emerald-400">96.8% Mean Average</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Latency</span>
          <div className="text-base font-extrabold text-cyan-300">142ms per Frame</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Verified Queue</span>
          <div className="text-base font-extrabold text-white">{verifiedList.length} Tickets</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">False Positive Rejection</span>
          <div className="text-base font-extrabold text-teal-400">99.4% Robust</div>
        </div>
      </div>

      {/* Verified Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>No tickets currently in the AI Verified stage.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isCardActive = selectedIncident?.id === item.id;
            const confidencePercent = (item.aiConfidence ? item.aiConfidence * 100 : 96.4).toFixed(1);
            const isForwarded = item.status === "Forwarded to Municipal Officer" || item.status === "Pending Officer Assignment";
            const isInProgress = item.status === "In Progress" || item.status === "Dispatched";
            const isResolved = item.status === "Resolved" || item.status === "Closed";

            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className={`p-4 rounded-2xl border bg-[#0C101A] space-y-3 transition cursor-pointer relative ${
                  isCardActive
                    ? "border-cyan-400 cyan-glow-sm bg-[#0E1524]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-xs">{item.id}</span>

                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>AI CONFIDENCE: {confidencePercent}%</span>
                  </span>
                </div>

                {/* Photo with Bounding Box Overlay */}
                {item.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-32 border border-slate-800 group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* SVG Bounding Box Preview */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <rect
                        x="20%"
                        y="25%"
                        width="60%"
                        height="50%"
                        fill="rgba(0, 240, 255, 0.12)"
                        stroke="#00F0FF"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <circle cx="20%" cy="25%" r="3" fill="#00F0FF" />
                      <circle cx="80%" cy="25%" r="3" fill="#00F0FF" />
                      <circle cx="20%" cy="75%" r="3" fill="#00F0FF" />
                      <circle cx="80%" cy="75%" r="3" fill="#00F0FF" />
                    </svg>

                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 text-[10px] text-cyan-300 font-bold border border-cyan-500/60">
                      NEURAL BOUNDING ACTIVE
                    </span>
                  </div>
                )}

                {/* Defect Title & Assigned Dept */}
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm font-sans line-clamp-1">
                    {item.title || item.category}
                  </h4>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{item.assignedDepartment || "Municipal Public Works Department"}</span>
                  </div>
                </div>

                {/* Estimated Geometry & SLA */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/80">
                  <div className="p-2 rounded-lg bg-[#070A10] border border-slate-800">
                    <span className="text-slate-400 block">SEVERITY LEVEL</span>
                    <strong className={item.priority === "P1" ? "text-red-400" : "text-amber-400"}>
                      {item.problemLevel ? `LEVEL ${item.problemLevel} HAZARD` : item.priority === "P1" ? "LEVEL 4 HAZARD" : "LEVEL 3 HAZARD"}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#070A10] border border-slate-800">
                    <span className="text-slate-400 block">SLA TARGET</span>
                    <strong className="text-cyan-300">{item.slaHours || 4} Hours</strong>
                  </div>
                </div>

                {/* Action Button: Forward to Municipal Officer vs In-Progress State */}
                <div className="pt-1">
                  {isInProgress ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/50 border border-emerald-500 text-emerald-300 font-extrabold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>⚡ In Progress (Field Team Deployed)</span>
                    </div>
                  ) : isForwarded ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500 text-amber-300 font-extrabold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>⏳ Sent to Municipal Officer (Pending Team Allotment)</span>
                    </div>
                  ) : isResolved ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-extrabold text-[11px] uppercase flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      <span>✓ Resolved & Closed</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdvanceStatus(item, "Forwarded to Municipal Officer");
                      }}
                      disabled={actionLoading === item.id}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                    >
                      <Building className="w-4 h-4" />
                      <span>Send to Municipal Officer 🏛️ ›</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
