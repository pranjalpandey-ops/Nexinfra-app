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
  Clock,
  MapPin,
  Plane,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  FileText,
  Radio
} from "lucide-react";

export default function InProgressSubpage({
  incidents = [],
  onSelectIncident,
  selectedIncident,
  onAdvanceStatus,
  onOpenWorkOrderModal,
  onOpenDispatchModal,
  actionLoading
}) {
  const inProgressList = incidents.filter(
    (i) => i.status === "In Progress" || i.status === "Dispatched"
  );

  const workOrders = [
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
  ];

  return (
    <div className="space-y-6 font-mono-tech text-xs">
      
      {/* Subpage Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0C101A] border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white font-heading">
              In-Progress Field Operations & Dispatch Hub
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-bold">
              {inProgressList.length} Active Deployments
            </span>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Live monitoring of municipal response crews, tactical UAV reconnaissance flights, and strict SLA deadline fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenDispatchModal}
            className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <Plane className="w-4 h-4" />
            <span>Dispatch Tactical UAV</span>
          </button>

          <button
            onClick={onOpenWorkOrderModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-black font-extrabold uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Work Order</span>
          </button>
        </div>
      </div>

      {/* Active Incidents Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inProgressList.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>No active repairs currently in progress. All dispatches up to date.</p>
          </div>
        ) : (
          inProgressList.map((item) => {
            const isCardActive = selectedIncident?.id === item.id;
            const isCritical = item.priority === "P1" || item.priority === "High";

            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className={`p-4 rounded-2xl border bg-[#0C101A] space-y-3 transition cursor-pointer relative ${
                  isCardActive
                    ? "border-amber-400 cyan-glow-sm bg-[#12100E]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-xs">{item.id}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 font-extrabold text-[10px] uppercase">
                    ACTIVE FIELD WORK
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm font-sans line-clamp-1">
                    {item.title || item.category}
                  </h4>
                  <p className="text-slate-400 text-xs font-sans line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Location & Assigned Dept */}
                <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 truncate text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.address || item.ward}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span className="truncate">{item.assignedDepartment || "Road Works Unit"}</span>
                  </div>
                </div>

                {/* SLA Clock Timer Box */}
                <div className="p-2.5 rounded-xl bg-[#070A10] border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    <span>Target SLA: {item.slaHours || 4}h</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    ✓ ON SCHEDULE
                  </span>
                </div>

                {/* Actions: Mark Resolved */}
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdvanceStatus(item, "Resolved");
                    }}
                    disabled={actionLoading === item.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Mark Resolved ✓</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Active Work Orders Log */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>FIELD WORK ORDERS & CONTRACTOR LOGS</span>
          </div>
          <span className="text-slate-400">{workOrders.length} Logged Orders</span>
        </div>

        <div className="overflow-x-auto sm:overflow-visible">
          <table className="min-w-full text-left responsive-table table-fixed">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="pb-2.5 align-middle whitespace-nowrap">ORDER ID</th>
                <th className="pb-2.5 align-middle">DEPARTMENT UNIT</th>
                <th className="pb-2.5 align-middle">TASK SCOPE</th>
                <th className="pb-2.5 align-middle whitespace-nowrap">SEVERITY</th>
                <th className="pb-2.5 align-middle">DISPATCH STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-bold text-cyan-400 align-middle" data-label="Order ID">{wo.id}</td>
                  <td className="py-3 text-slate-200 font-bold align-middle" data-label="Department">{wo.dept}</td>
                  <td className="py-3 text-slate-300 font-sans align-middle" data-label="Task">{wo.desc}</td>
                  <td className="py-3 align-middle" data-label="Severity">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                      {wo.priority}
                    </span>
                  </td>
                  <td className="py-3 align-middle" data-label="Status">
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
