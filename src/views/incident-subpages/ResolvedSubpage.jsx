import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  Clock,
  MapPin,
  Download,
  Calendar,
  Building,
  Award,
  Sparkles,
  FileCheck
} from "lucide-react";

export default function ResolvedSubpage({
  incidents = [],
  onSelectIncident,
  selectedIncident
}) {
  const resolvedList = incidents.filter(
    (i) => i.status === "Resolved" || i.status === "Closed"
  );

  const exportCSV = () => {
    const headers = ["Ticket ID", "Title", "Category", "Ward", "Priority", "Status", "Upvotes", "SLA Target"];
    const rows = resolvedList.map(i => [
      i.id,
      `"${i.title || i.category}"`,
      `"${i.category}"`,
      `"${i.ward || i.address}"`,
      i.priority || "P1",
      i.status || "Resolved",
      i.upvotes || 0,
      `${i.slaHours || 4}h`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexinfra_resolved_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-mono-tech text-xs">
      
      {/* Subpage Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0C101A] border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Resolved Incidents & Quality Audit Archive
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
              {resolvedList.length} Verified Solutions
            </span>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Permanent municipal audit ledger of remediated defects, citizen confirmation upvotes, and post-repair quality assurance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/60 hover:bg-emerald-950 text-emerald-300 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* SLA Quality Scorecard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">SLA Compliance Rate</span>
          <div className="text-base font-extrabold text-emerald-400">98.6% On Time</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Resolution Time</span>
          <div className="text-base font-extrabold text-cyan-300">2h 45m</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Citizen Confirmations</span>
          <div className="text-base font-extrabold text-white">100% Verified</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Municipal Cost Efficiency</span>
          <div className="text-base font-extrabold text-teal-400">+34% Optimized</div>
        </div>
      </div>

      {/* Resolved Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolvedList.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>No completed incidents in archive yet.</p>
          </div>
        ) : (
          resolvedList.map((item) => {
            const isCardActive = selectedIncident?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className={`p-4 rounded-2xl border bg-[#0C101A] space-y-3 transition cursor-pointer relative opacity-90 hover:opacity-100 ${
                  isCardActive
                    ? "border-emerald-400 cyan-glow-sm bg-[#0E1814]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-xs">{item.id}</span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-[10px] uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>REMEDIATION COMPLETE</span>
                  </span>
                </div>

                {/* Photo with Resolved Badge */}
                {item.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[30%]"
                    />
                    <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[0.5px]" />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 text-[10px] text-emerald-300 font-bold border border-emerald-500/60">
                      QUALITY INSPECTED
                    </span>
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

                {/* Location & Upvotes */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-slate-400 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.address || item.ward}</span>
                  </div>

                  <span className="text-cyan-300 font-bold flex items-center gap-1 shrink-0">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{item.upvotes || 0} Upvotes</span>
                  </span>
                </div>

                {/* SLA Fulfilled Chip */}
                <div className="p-2 rounded-lg bg-[#070A10] border border-emerald-500/30 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Target SLA: {item.slaHours || 4}h</span>
                  <span className="text-emerald-400 font-bold">✓ 100% SLA COMPLIANT</span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
