import React, { useState, useEffect } from "react";
import {
  Filter,
  Plus,
  ArrowUpRight,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Search,
  Clock,
  MapPin,
  Building,
  Plane,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import { subscribeToComplaints } from "../services/getComplaints";
import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { getLocalCivicIssues } from "../services/civicDb";

export default function MaintenanceView({ onOpenWorkOrderModal, onOpenDispatchModal }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Digital Work Orders State
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WRK-001",
      dept: "Sanitation Logistics",
      desc: "Sewer main blockage clearance & biohazard wash, Sector 18",
      priority: "HIGH",
      status: "ACTIVE EN ROUTE",
      statusBg: "bg-indigo-950 text-indigo-300 border-indigo-500/40"
    },
    {
      id: "WRK-002",
      dept: "Road Works & Asphalt",
      desc: "Pothole cavity cold-mix asphalt filling, Ring Road Expressway",
      priority: "CRITICAL",
      status: "DISPATCHED",
      statusBg: "bg-rose-950 text-rose-300 border-rose-500/50"
    },
    {
      id: "WRK-003",
      dept: "Hydro Grid Unit",
      desc: "300mm pipeline sleeve clamp replacement, Sector 18 Gate 3",
      priority: "CRITICAL",
      status: "ACTIVE REPAIR",
      statusBg: "bg-cyan-950 text-cyan-300 border-cyan-500/50"
    }
  ]);

  useEffect(() => {
    // 1. Initial baseline local issues
    const local = getLocalCivicIssues();
    setIncidents(local);
    if (local.length > 0) setSelectedIncident(local[0]);

    // 2. Real-time Firestore database listener
    const unsubscribe = subscribeToComplaints((firestoreList) => {
      if (Array.isArray(firestoreList) && firestoreList.length > 0) {
        const merged = [
          ...firestoreList,
          ...local.filter((l) => !firestoreList.some((f) => f.id === l.id))
        ];
        setIncidents(merged);
        if (!selectedIncident && merged.length > 0) {
          setSelectedIncident(merged[0]);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleAdvanceStatus = async (incident, targetStatus) => {
    setActionLoading(incident.id);
    const result = await updateComplaintStatus(incident.id, targetStatus);
    if (result.success) {
      const updated = incidents.map((i) =>
        i.id === incident.id ? { ...i, status: targetStatus } : i
      );
      setIncidents(updated);
      if (selectedIncident && selectedIncident.id === incident.id) {
        setSelectedIncident({ ...selectedIncident, status: targetStatus });
      }
    } else {
      alert(`Update note: ${result.error}`);
    }
    setActionLoading(null);
  };

  // Filtered List
  const filteredIncidents = incidents.filter((item) => {
    if (filterSeverity !== "ALL") {
      if (filterSeverity === "HIGH" && item.priority !== "P1" && item.priority !== "High") return false;
      if (filterSeverity === "MEDIUM" && item.priority !== "P2" && item.priority !== "Medium") return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (item.title || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q) ||
        (item.ward || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pipeline Stages
  const pipelineStages = {
    SUBMITTED: filteredIncidents.filter((i) => !i.status || i.status === "Reported" || i.status === "Submitted"),
    AI_VERIFIED: filteredIncidents.filter((i) => i.status === "AI Verified" || i.status === "Verified"),
    IN_PROGRESS: filteredIncidents.filter((i) => i.status === "In Progress" || i.status === "Dispatched"),
    RESOLVED: filteredIncidents.filter((i) => i.status === "Resolved" || i.status === "Closed"),
  };

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-2.5">
            <span>Incident Pipelines & Maintenance Logs</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-mono-tech uppercase">
              Live Firestore DB
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono-tech mt-1">
            Real-Time Defect Ingestion • Automated Work Orders • Tactical Fleet Dispatch
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs & tickets..."
              className="bg-[#0E131F] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={() => setFilterSeverity(filterSeverity === "ALL" ? "HIGH" : "ALL")}
            className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
              filterSeverity !== "ALL"
                ? "bg-red-950 border-red-500 text-red-300"
                : "bg-[#0E131F] border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>P1 Critical Only</span>
          </button>

          <button
            onClick={onOpenWorkOrderModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold flex items-center gap-1.5 transition-all cyan-glow-sm uppercase cursor-pointer shadow-lg active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ WORK ORDER</span>
          </button>
        </div>
      </div>

      {/* Grid: 4-Column Live Kanban Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kanban Board */}
        <div className="lg:col-span-8 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono-tech text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>LIVE INCIDENT PIPELINE STAGES</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYNCING FIRESTORE ({incidents.length} TOTAL)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 font-mono-tech text-xs">
            
            {/* 1. SUBMITTED */}
            <div className="space-y-3 bg-[#070A10]/60 p-2.5 rounded-xl border border-slate-800/60">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>SUBMITTED</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {pipelineStages.SUBMITTED.length}
                </span>
              </div>
              
              <div className="space-y-2.5">
                {pipelineStages.SUBMITTED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncident(item)}
                    className={`bg-[#0B0F19] border p-3 rounded-xl space-y-2 transition cursor-pointer ${
                      selectedIncident?.id === item.id
                        ? "border-cyan-400 bg-cyan-950/30 cyan-glow-sm"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-cyan-400 font-bold">{item.id}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        item.priority === "P1" || item.priority === "High" ? "bg-red-950 text-red-300" : "bg-yellow-950 text-yellow-300"
                      }`}>
                        {item.priority || "P2"}
                      </span>
                    </div>

                    <div className="font-bold text-white text-xs font-sans line-clamp-2">
                      {item.title || item.category}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {item.ward || item.address}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(item, "AI Verified");
                      }}
                      className="w-full py-1.5 rounded bg-cyan-950/70 border border-cyan-500/60 hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-bold uppercase transition"
                    >
                      Verify AI ›
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. AI VERIFIED */}
            <div className="space-y-3 bg-[#070A10]/60 p-2.5 rounded-xl border border-slate-800/60">
              <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>AI VERIFIED</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
                  {pipelineStages.AI_VERIFIED.length}
                </span>
              </div>
              
              <div className="space-y-2.5">
                {pipelineStages.AI_VERIFIED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncident(item)}
                    className={`bg-[#0B0F19] border p-3 rounded-xl space-y-2 transition cursor-pointer ${
                      selectedIncident?.id === item.id
                        ? "border-cyan-400 bg-cyan-950/30 cyan-glow-sm"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-cyan-400 font-bold">{item.id}</span>
                      <span className="text-emerald-400 font-bold">96.4% AI</span>
                    </div>

                    <div className="font-bold text-white text-xs font-sans line-clamp-2">
                      {item.title || item.category}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {item.ward || item.address}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(item, "In Progress");
                      }}
                      className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold uppercase transition"
                    >
                      Dispatch Team ›
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. IN PROGRESS */}
            <div className="space-y-3 bg-[#070A10]/60 p-2.5 rounded-xl border border-slate-800/60">
              <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>IN PROGRESS</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 font-bold">
                  {pipelineStages.IN_PROGRESS.length}
                </span>
              </div>
              
              <div className="space-y-2.5">
                {pipelineStages.IN_PROGRESS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncident(item)}
                    className={`bg-[#0B0F19] border p-3 rounded-xl space-y-2 transition cursor-pointer ${
                      selectedIncident?.id === item.id
                        ? "border-cyan-400 bg-cyan-950/30 cyan-glow-sm"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-cyan-400 font-bold">{item.id}</span>
                      <span className="text-amber-400 font-bold">Active Crew</span>
                    </div>

                    <div className="font-bold text-white text-xs font-sans line-clamp-2">
                      {item.title || item.category}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {item.ward || item.address}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(item, "Resolved");
                      }}
                      className="w-full py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold uppercase transition"
                    >
                      Mark Resolved ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. RESOLVED */}
            <div className="space-y-3 bg-[#070A10]/60 p-2.5 rounded-xl border border-slate-800/60">
              <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>RESOLVED</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
                  {pipelineStages.RESOLVED.length}
                </span>
              </div>
              
              <div className="space-y-2.5">
                {pipelineStages.RESOLVED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncident(item)}
                    className={`bg-[#0B0F19] border p-3 rounded-xl space-y-2 transition cursor-pointer opacity-80 hover:opacity-100 ${
                      selectedIncident?.id === item.id
                        ? "border-emerald-400 bg-emerald-950/20"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-400 font-bold">{item.id}</span>
                      <span className="text-emerald-400 font-bold">Verified</span>
                    </div>

                    <div className="font-bold text-white text-xs font-sans line-clamp-2">
                      {item.title || item.category}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {item.ward || item.address}
                    </div>

                    <div className="text-[10px] text-emerald-400 font-bold text-center pt-1 border-t border-slate-800">
                      ✓ SLA Fulfilled
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Selected Incident Live Inspector Drawer */}
        <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-5 space-y-4 font-mono-tech text-xs">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-white uppercase">Incident Telemetry & SLA</span>
            {selectedIncident && (
              <span className="text-cyan-400 font-bold">{selectedIncident.id}</span>
            )}
          </div>

          {selectedIncident ? (
            <div className="space-y-4">
              {/* Photo Preview */}
              {selectedIncident.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 h-40 group shadow-md">
                  <img
                    src={selectedIncident.imageUrl}
                    alt="Defect"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-cyan-300 font-bold border border-cyan-500/60">
                    AI BOUNDING: {(selectedIncident.aiConfidence ? selectedIncident.aiConfidence * 100 : 96.4).toFixed(1)}%
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-bold text-white text-base font-sans">
                  {selectedIncident.title || selectedIncident.category}
                </h3>
                <p className="text-slate-400 text-xs font-sans">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#070A10] border border-slate-800">
                  <div className="text-[10px] text-slate-400">PRIORITY TIER</div>
                  <div className="font-extrabold text-red-400 text-xs pt-0.5">
                    {selectedIncident.priorityLabel || selectedIncident.priority || "P1 - Critical"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070A10] border border-slate-800">
                  <div className="text-[10px] text-slate-400">TARGET SLA</div>
                  <div className="font-extrabold text-cyan-300 text-xs pt-0.5">
                    {selectedIncident.slaHours || 4} Hours Max
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#070A10] border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400">ASSIGNED UNIT</div>
                <div className="text-white font-bold text-xs">
                  {selectedIncident.assignedDepartment || "Road Maintenance & Pavement Division"}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onOpenWorkOrderModal}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase cursor-pointer transition shadow-md"
                >
                  Generate Digital Work Order
                </button>

                <button
                  onClick={() => handleAdvanceStatus(selectedIncident, "In Progress")}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase cursor-pointer transition"
                >
                  ⚡ Fast-Track Pipeline Stage
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Select an incident card from the pipeline to view live telemetry.
            </div>
          )}

        </div>

      </div>

      {/* Digital Work Orders Log Table */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-5 space-y-4 font-mono-tech text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>ACTIVE MUNICIPAL WORK ORDERS & REMEDIATION LOGS</span>
          </div>
          <span className="text-slate-400">{workOrders.length} Logged Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="pb-2.5">ORDER ID</th>
                <th className="pb-2.5">DEPARTMENT UNIT</th>
                <th className="pb-2.5">TASK SCOPE</th>
                <th className="pb-2.5">SEVERITY</th>
                <th className="pb-2.5">DISPATCH STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-bold text-cyan-400">{wo.id}</td>
                  <td className="py-3 text-slate-200 font-bold">{wo.dept}</td>
                  <td className="py-3 text-slate-300 font-sans">{wo.desc}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                      {wo.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${wo.statusBg}`}>
                      {wo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
