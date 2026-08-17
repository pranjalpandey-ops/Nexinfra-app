import React, { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Filter,
  Flame,
  Clock,
  ThumbsUp,
  Building,
  CheckCircle2,
  Layers,
  Activity,
  MapPin,
  Maximize2
} from "lucide-react";

import LeafletMap from "../components/LeafletMap";
import { getLocalCivicIssues, upvoteIssue } from "../services/civicDb";
import { subscribeToComplaints } from "../services/getComplaints";

export default function CitySyncMapView({ setActivePage, viewMode = "auto", user }) {
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const isPhoneFrame = viewMode === "phone";

  useEffect(() => {
    // 1. Load comprehensive local civic dataset
    const localData = getLocalCivicIssues();
    setIssues(localData);
    if (localData.length > 0) {
      setSelectedIssue(localData[0]);
    }

    // 2. Synchronize with Firestore real-time listener if available
    const unsubscribe = subscribeToComplaints((firestoreData) => {
      if (Array.isArray(firestoreData) && firestoreData.length > 0) {
        // Merge firestore with local seed
        const merged = [...firestoreData, ...localData.filter(l => !firestoreData.some(f => f.id === l.id))];
        setIssues(merged);
      }
    });

    return unsubscribe;
  }, []);

  const handleUpvote = (issueId, e) => {
    if (e) e.stopPropagation();
    const updated = upvoteIssue(issueId, user?.email || "citizen.demo@nexinfra.org");
    setIssues(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      const found = updated.find((i) => i.id === issueId);
      if (found) setSelectedIssue(found);
    }
  };

  // Filter Logic
  const filteredIssues = issues.filter((item) => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.title || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.address || "").toLowerCase().includes(q) ||
      (item.ward || "").toLowerCase().includes(q) ||
      (item.id || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Category
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;

    // Ward
    if (selectedWard !== "ALL" && item.ward !== selectedWard) return false;

    // Priority
    if (selectedPriority !== "ALL" && item.priority !== selectedPriority) return false;

    // Status
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;

    return true;
  });

  const activeIssue =
    selectedIssue && filteredIssues.some((i) => i.id === selectedIssue.id)
      ? selectedIssue
      : filteredIssues[0] || null;

  // Compute Live Metrics for HUD
  const totalCount = issues.length;
  const criticalCount = issues.filter((i) => i.priority === "P1" || i.priority === "High").length;
  const inProgressCount = issues.filter((i) => i.status === "In Progress" || i.status === "AI Verified").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved").length;

  const mapCenter =
    activeIssue && activeIssue.latitude && activeIssue.longitude
      ? [activeIssue.latitude, activeIssue.longitude]
      : [28.6139, 77.2090];

  const mapMarkers = filteredIssues
    .filter((issue) => issue.latitude && issue.longitude)
    .map((issue) => {
      const isCritical = issue.priority === "P1" || issue.priority === "High";
      const isResolved = issue.status === "Resolved";
      const pinColor = isResolved ? "#10B981" : isCritical ? "#EF4444" : issue.priority === "P2" ? "#F97316" : "#FACC15";

      return {
        position: [issue.latitude, issue.longitude],
        color: pinColor,
        data: issue,
        popup: `
          <div style="font-family:'JetBrains Mono',monospace; min-width:200px; color:#0F172A; font-size:12px;">
            <div style="font-weight:800; font-size:13px; margin-bottom:4px;">${issue.title}</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="color:#0284C7; font-weight:bold;">${issue.id}</span>
              <span style="font-weight:bold; color:${pinColor};">${issue.priorityLabel || issue.priority}</span>
            </div>
            <div style="font-size:11px; color:#475569; margin-bottom:6px;">📍 ${issue.address || ""}</div>
            <div style="font-size:11px; color:#047857; font-weight:bold;">Status: ${issue.status} • SLA: ${issue.slaHours || 4}h</div>
          </div>
        `,
      };
    });

  const openIncidentDetails = (issue) => {
    const target = issue || activeIssue;
    if (!target) return;
    localStorage.setItem("selectedComplaint", JSON.stringify(target));
    setActivePage("incident-detail");
  };

  const categories = [
    "ALL",
    "Road Damage / Pothole",
    "Water / Drainage Burst",
    "Solid Waste Overflow",
    "Electrical & Streetlight",
    "Structural Anomaly / Bridge Crack",
  ];

  const wards = [
    "ALL",
    "Central District - Ward 4",
    "Sector 18 Ward - Zone A",
    "North Green Corridor - Ward 2",
    "Cyber Hub - Ward 12",
    "East Ring - Ward 8",
  ];

  return (
    <div className="h-screen w-screen bg-[#07090E] text-slate-100 flex justify-center overflow-y-auto">
      <div
        className={`w-full min-h-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden min-h-[780px]"
            : "w-full h-full bg-[#0D121D] flex flex-col min-h-0"
        }`}
      >
        {/* Top Control Bar */}
        <div className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#090D16]/90 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-extrabold text-white font-heading flex items-center gap-2.5">
              <span>CitySync AI Civic Issue & Problem Radar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-[11px] font-mono-tech uppercase">
                {isAdmin ? "Admin Telemetry" : "Citizen GIS"}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono-tech">
              Spatial Defect Triaging • SLA Monitoring • Grievance Clustering
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono-tech text-xs w-full sm:w-auto justify-between sm:justify-end">
            {/* Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
                showHeatmap
                  ? "bg-amber-950/80 border-amber-400 text-amber-300 shadow-md cyan-glow-sm"
                  : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Flame className={`w-4 h-4 ${showHeatmap ? "text-amber-400 animate-pulse" : ""}`} />
              <span>{showHeatmap ? "Grievance Heatmap ON" : "Heatmap Overlay"}</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
                showFilterPanel
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-300"
                  : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Filters</span>
            </button>

            {/* Report New Issue Button */}
            <button
              onClick={() => setActivePage("report-issue")}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-cyan-200 text-black rounded-xl font-extrabold text-xs uppercase cyan-glow-sm flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ REPORT DEFECT</span>
            </button>
          </div>
        </div>

        {/* Live HUD Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 border-b border-slate-800/80 bg-[#070A10]/95 font-mono-tech text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">Total Tracked:</span>
            <strong className="text-cyan-300 font-bold">{totalCount}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-400">P1 Critical Hazards:</span>
            <strong className="text-red-400 font-bold">{criticalCount}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-400">In Remediation:</span>
            <strong className="text-amber-300 font-bold">{inProgressCount}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Citizen Resolved:</span>
            <strong className="text-emerald-400 font-bold">{resolvedCount}</strong>
          </div>
        </div>

        {/* Search & Collapsible Multi-Filter Panel */}
        <div className="px-6 py-3 space-y-3 bg-[#0B0F19]">
          <div className="flex items-center gap-2 bg-[#070A12] border border-slate-800 rounded-xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by defect type, keyword, street address, ward, or Ticket ID..."
              className="bg-transparent flex-1 outline-none text-white placeholder:text-slate-500 text-xs sm:text-sm font-mono-tech"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Expanded Filter Panel */}
          {showFilterPanel && (
            <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
              {/* Category */}
              <div>
                <label className="block mb-1 text-slate-400 font-bold">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#0E131F] border border-slate-800 rounded-lg p-2 text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Ward / Zone */}
              <div>
                <label className="block mb-1 text-slate-400 font-bold">Ward / Zone</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full bg-[#0E131F] border border-slate-800 rounded-lg p-2 text-white"
                >
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block mb-1 text-slate-400 font-bold">Priority Tier</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-[#0E131F] border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="P1">P1 - Critical Hazard</option>
                  <option value="P2">P2 - High Priority</option>
                  <option value="P3">P3 - Medium/Low</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1 text-slate-400 font-bold">Workflow Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#0E131F] border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="AI Verified">AI Verified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[440px] border-y border-slate-800 bg-[#090D17] mx-0">
          <div className="absolute inset-0 z-0">
            <LeafletMap
              center={mapCenter}
              zoom={13}
              markers={mapMarkers}
              showHeatmap={showHeatmap}
              onMarkerClick={(item) => {
                setSelectedIssue(item);
              }}
            />
          </div>

          {/* Floating Map Legend & Overlay */}
          <div className="absolute top-4 right-4 z-[400] bg-[#070A12]/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 font-mono-tech shadow-2xl">
            <div className="text-slate-300 font-bold mb-1 border-b border-slate-800 pb-1">
              GIS Severity Pins
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span>🔴 P1: Critical Safety Hazard</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>🟠 P2: High Priority</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span>🟡 P3: Medium Priority</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>🟢 Resolved / Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Drawer: Selected Defect Inspector Card */}
        {activeIssue && (
          <div className="p-4 sm:p-5 bg-[#090D16] border-t border-slate-800 font-mono-tech text-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-4 flex-1">
                {activeIssue.imageUrl && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0 shadow-lg">
                    <img
                      src={activeIssue.imageUrl}
                      alt="Defect Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-cyan-300 font-bold border border-cyan-500/60">
                      AI BOX
                    </span>
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
                      {activeIssue.id}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        activeIssue.priority === "P1"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : activeIssue.priority === "P2"
                          ? "bg-orange-950 text-orange-300 border border-orange-800"
                          : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                      }`}
                    >
                      {activeIssue.priorityLabel || activeIssue.priority}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      {activeIssue.status}
                    </span>

                    {activeIssue.aiVerified && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>AI Verified ({(activeIssue.aiConfidence * 100).toFixed(1)}%)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-base font-sans hover:text-cyan-300 transition">
                    {activeIssue.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeIssue.address}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{activeIssue.ward}</span>
                    <span>•</span>
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>SLA: {activeIssue.slaHours || 4}h target</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Upvote & Inspect Actions */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                {/* Citizen Upvote Button */}
                <button
                  onClick={(e) => handleUpvote(activeIssue.id, e)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-cyan-950/60 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="Confirm and upvote this civic issue"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upvote ({activeIssue.upvotes || 0})</span>
                </button>

                {/* Inspect Details */}
                <button
                  onClick={() => openIncidentDetails(activeIssue)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs uppercase flex items-center gap-2 cyan-glow-sm cursor-pointer shadow-lg active:scale-95 transition"
                >
                  <span>{isAdmin ? "Inspect & Remediate" : "Track Incident"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
