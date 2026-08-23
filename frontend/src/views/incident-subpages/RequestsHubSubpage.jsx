import React, { useState } from "react";

// Helper function to format detected time & elapsed duration
function formatDetectedTiming(isoDate) {
  if (!isoDate) return { exactTime: "Just now", elapsed: "Just now", isRecent: true };
  try {
    const d = new Date(isoDate);
    const exactTime = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    let elapsed = "Just now";
    if (diffMins < 1) elapsed = "Just now";
    else if (diffMins < 60) elapsed = `${diffMins}m ago`;
    else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) elapsed = `${diffHours}h ${diffMins % 60}m ago`;
      else elapsed = `${Math.floor(diffHours / 24)}d ago`;
    }
    return { exactTime, elapsed, isRecent: diffMins < 120 };
  } catch (e) {
    return { exactTime: "Just now", elapsed: "Just now", isRecent: true };
  }
}

import {
  Inbox,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Send,
  Eye,
  CheckSquare,
  Square,
  ShieldAlert
} from "lucide-react";

export default function RequestsHubSubpage({
  incidents = [],
  onSelectIncident,
  selectedIncident,
  onAdvanceStatus,
  onOpenAITriage,
  actionLoading
}) {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);

  const submittedList = incidents.filter(
    (i) => !i.status || i.status === "Reported" || i.status === "Submitted"
  );

  const filtered = submittedList.filter((item) => {
    if (filterPriority !== "ALL" && item.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q) ||
        (item.ward || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAITriage = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one ticket to run bulk AI verification.");
      return;
    }
    for (const id of selectedIds) {
      const target = incidents.find((i) => i.id === id);
      if (target) {
        await onAdvanceStatus(target, "AI Verified");
      }
    }
    setSelectedIds([]);
    alert(`⚡ Bulk AI Verification Completed for ${selectedIds.length} tickets!`);
  };

  return (
    <div className="space-y-5 font-mono-tech text-xs">
      
      {/* Subpage Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Requests & Defect Ingestion Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
              {submittedList.length} Incoming Tickets
            </span>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Ingestion portal receiving raw citizen reports, CCTV defect triggers, and IoT infrastructure sensor alerts.
          </p>
        </div>

        {/* Batch Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleBulkAITriage}
            disabled={selectedIds.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 text-black font-extrabold uppercase flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bulk AI Verify ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-bold cursor-pointer"
          >
            {selectedIds.length === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>Select All ({filtered.length})</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticket ID, defect, ward..."
            className="bg-[#070A10] border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-600 text-xs w-48 sm:w-64 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPriority("ALL")}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterPriority === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterPriority("P1")}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterPriority === "P1" ? "bg-red-950 text-red-300 border border-red-500" : "text-slate-400"
            }`}
          >
            P1 Critical
          </button>
          <button
            onClick={() => setFilterPriority("P2")}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterPriority === "P2" ? "bg-orange-950 text-orange-300 border border-orange-500" : "text-slate-400"
            }`}
          >
            P2 High
          </button>
        </div>
      </div>

      {/* Requests Stream Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>No submitted requests waiting in raw ingestion queue.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isCardActive = selectedIncident?.id === item.id;
            const isCritical = item.priority === "P1" || item.priority === "High";

            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className={`p-4 rounded-2xl border bg-[#0C101A] space-y-3 transition cursor-pointer relative ${
                  isCardActive
                    ? "border-cyan-400 cyan-glow-sm bg-[#0E1524]"
                    : isSelected
                    ? "border-cyan-500/70 bg-[#090E18]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleSelectOne(item.id, e)}
                      className="cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <span className="font-extrabold text-cyan-400 text-xs">{item.id}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isCritical
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : "bg-orange-950 text-orange-300 border border-orange-800"
                    }`}
                  >
                    {item.priorityLabel || item.priority || "P2 - High"}
                  </span>
                </div>

                {/* Photo Preview if available */}
                {item.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-bold border border-amber-500/60">
                      PENDING AI SCAN
                    </div>
                  </div>
                )}

                {/* Defect Title & Description */}
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm font-sans line-clamp-1">
                    {item.title || item.category}
                  </h4>
                  <p className="text-slate-400 text-xs font-sans line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Location & Time */}
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.address || item.ward}</span>
                  </div>
                  
                  {/* Reported / Detected Timing Badge */}
                  <div className="flex items-center justify-between text-[10px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                    <div className="flex items-center gap-1 text-cyan-300 font-bold">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{formatDetectedTiming(item.createdAt).exactTime}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-extrabold text-[9px]">
                      {formatDetectedTiming(item.createdAt).elapsed}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[10px]">
                    Reported by: {item.createdBy || "Resident Citizen"}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdvanceStatus(item, "AI Verified");
                    }}
                    disabled={actionLoading === item.id}
                    className="flex-1 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Triage ›</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
