import React, { useState, useEffect } from "react";
import {
  Building,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  Truck,
  Wrench,
  Sparkles,
  MapPin,
  Calendar,
  Activity,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Layers,
  Search,
  Check,
  X,
  Play,
  Flame,
  Radio,
  FileCheck,
  Plus,
  ChevronRight,
  Filter,
  Eye,
  Sliders,
  Timer,
  Award,
  Send,
  Trash2,
  HardHat
} from "lucide-react";

import {
  getMunicipalTeams,
  allotTeamToTask,
  completeJobAndReleaseTeam,
  calculateJobTimeMetrics
} from "../services/municipalTeamService";

import { getLocalCivicIssues, updateCivicIssueStatus } from "../services/civicDb";
import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { subscribeToComplaints } from "../services/getComplaints";

export default function MunicipalOfficerIncidentLogs({
  user,
  setActivePage,
  onOpenWorkOrderModal
}) {
  const [teams, setTeams] = useState(getMunicipalTeams());
  const [incidents, setIncidents] = useState(getLocalCivicIssues());
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "allotted" | "pending" | "on_work" | "completed"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Allotment Modal State
  const [selectedTaskToAllot, setSelectedTaskToAllot] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [allottedHours, setAllottedHours] = useState(4);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);

  // Live timer tick every 10 seconds
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setTeams(getMunicipalTeams());
    setIncidents(getLocalCivicIssues());
  };

  useEffect(() => {
    window.addEventListener("municipal_teams_updated", refreshData);
    window.addEventListener("civic_issue_updated", refreshData);
    window.addEventListener("nexinfra_incident_created", refreshData);
    window.addEventListener("storage", refreshData);

    const unsubscribe = subscribeToComplaints((firestoreList) => {
      if (Array.isArray(firestoreList) && firestoreList.length > 0) {
        const local = getLocalCivicIssues();
        const merged = [
          ...firestoreList,
          ...local.filter((l) => !firestoreList.some((f) => f.id === l.id))
        ];
        setIncidents(merged);
      }
    });

    return () => {
      window.removeEventListener("municipal_teams_updated", refreshData);
      window.removeEventListener("civic_issue_updated", refreshData);
      window.removeEventListener("nexinfra_incident_created", refreshData);
      window.removeEventListener("storage", refreshData);
      unsubscribe();
    };
  }, []);

  // Classify Incidents into the 4 Operational Categories
  // 1. On Work / In Progress: Status is 'In Progress' or currently actively assigned to an occupied team
  const onWorkIncidents = incidents.filter((inc) => {
    const isOccupiedTeamJob = teams.some((t) => t.activeJob?.taskId === inc.id);
    return isOccupiedTeamJob || (inc.status || "").toLowerCase() === "in progress";
  });

  // 2. Completed / Resolved: Status is 'Resolved' or 'Closed'
  const completedIncidents = incidents.filter((inc) => {
    return (inc.status || "").toLowerCase() === "resolved" || (inc.status || "").toLowerCase() === "closed";
  });

  // 3. Pending Team Allotment: Unresolved incidents not yet allotted to any team (and not on work)
  const pendingAllotmentIncidents = incidents.filter((inc) => {
    const isOccupied = teams.some((t) => t.activeJob?.taskId === inc.id);
    const isResolved = (inc.status || "").toLowerCase() === "resolved" || (inc.status || "").toLowerCase() === "closed";
    const isInProgress = (inc.status || "").toLowerCase() === "in progress";
    return !isOccupied && !isResolved && !isInProgress;
  });

  // 4. Total Incidents Allotted: All incidents that have been assigned to teams (On Work + Historical/Completed Allotments)
  const allottedIncidents = incidents.filter((inc) => {
    const isCurrentlyAssigned = teams.some((t) => t.activeJob?.taskId === inc.id);
    const isInProgress = (inc.status || "").toLowerCase() === "in progress";
    const isResolved = (inc.status || "").toLowerCase() === "resolved";
    return isCurrentlyAssigned || isInProgress || (isResolved && inc.assignedDepartment);
  });

  const availableTeams = teams.filter((t) => t.status === "available");

  // Filtered List Based on Active Tab
  let currentList = [];
  if (activeFilter === "all") currentList = incidents;
  else if (activeFilter === "allotted") currentList = allottedIncidents;
  else if (activeFilter === "pending") currentList = pendingAllotmentIncidents;
  else if (activeFilter === "on_work") currentList = onWorkIncidents;
  else if (activeFilter === "completed") currentList = completedIncidents;

  // Search & Category Filtering
  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.title || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.address || "").toLowerCase().includes(q) ||
      (item.ward || "").toLowerCase().includes(q) ||
      (item.id || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    return true;
  });

  // Handle Complete Job and Release Team
  const handleCompleteJob = (teamId, taskId) => {
    if (teamId) {
      completeJobAndReleaseTeam(teamId);
    }
    if (taskId) {
      updateCivicIssueStatus(taskId, "Resolved");
      updateComplaintStatus(taskId, "Resolved");
    }
    refreshData();
  };

  // Handle Confirm Allotment
  const handleConfirmAllotment = (e) => {
    e.preventDefault();
    if (!selectedTaskToAllot || !selectedTeamId) return;

    allotTeamToTask(selectedTeamId, selectedTaskToAllot, allottedHours);
    updateCivicIssueStatus(selectedTaskToAllot.id, "In Progress");
    updateComplaintStatus(selectedTaskToAllot.id, "In Progress");
    setIsAllotModalOpen(false);
    setSelectedTaskToAllot(null);
    setSelectedTeamId("");
    refreshData();
    setActiveFilter("on_work");
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      
      {/* 1. MUNICIPAL OFFICER LOGS HEADER */}
      <div className="bg-[#0B0F19] border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-950/90 border border-amber-500/80 text-amber-300 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                OFFICER INCIDENT LOGS & WORK ORDERS
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
                OFFICER: {user?.name || "Municipal Desk Authority"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              Municipal Incident Allotment & Work Logs
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-sans">
              Operational breakdown of allotted defects, pending team assignments, active on-site repairs, and resolved jobs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWorkOrderModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition font-mono-tech"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>+ Create Work Order</span>
            </button>
          </div>
        </div>

        {/* 2. 4 OPERATIONAL KPI LOG METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono-tech">
          
          {/* Card 1: Total Incidents Allotted */}
          <button
            onClick={() => setActiveFilter("allotted")}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              activeFilter === "allotted"
                ? "bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950/50"
                : "bg-[#070A10] border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Incidents Allotted</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">TOTAL</span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{allottedIncidents.length}</div>
            <div className="text-[10px] text-slate-500">Assigned to municipal units</div>
          </button>

          {/* Card 2: Pending Team Allotment */}
          <button
            onClick={() => setActiveFilter("pending")}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              activeFilter === "pending"
                ? "bg-amber-950/70 border-amber-400 shadow-md shadow-amber-950/50"
                : "bg-[#070A10] border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Allotment</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">AWAITING</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingAllotmentIncidents.length}</div>
            <div className="text-[10px] text-slate-500">Requires team assignment</div>
          </button>

          {/* Card 3: On Work / In Progress */}
          <button
            onClick={() => setActiveFilter("on_work")}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              activeFilter === "on_work"
                ? "bg-orange-950/70 border-orange-400 shadow-md shadow-orange-950/50"
                : "bg-[#070A10] border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>On Work / Active</span>
              </span>
              <span className="text-[10px] text-orange-400 font-bold">ON SITE</span>
            </div>
            <div className="text-2xl font-extrabold text-orange-400 mt-1">{onWorkIncidents.length}</div>
            <div className="text-[10px] text-slate-500">Ground repairs under way</div>
          </button>

          {/* Card 4: Completed / Resolved */}
          <button
            onClick={() => setActiveFilter("completed")}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              activeFilter === "completed"
                ? "bg-emerald-950/70 border-emerald-400 shadow-md shadow-emerald-950/50"
                : "bg-[#070A10] border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed Jobs</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">RESOLVED</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{completedIncidents.length}</div>
            <div className="text-[10px] text-slate-500">Restored & quality verified</div>
          </button>

        </div>
      </div>

      {/* 3. FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono-tech text-xs">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-amber-950 border border-amber-500 text-amber-300 shadow-sm"
                : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Logs ({incidents.length})
          </button>

          <button
            onClick={() => setActiveFilter("allotted")}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
              activeFilter === "allotted"
                ? "bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-sm"
                : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            📋 Allotted ({allottedIncidents.length})
          </button>

          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
              activeFilter === "pending"
                ? "bg-amber-950 border border-amber-500 text-amber-300 shadow-sm"
                : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ⏳ Pending Allotment ({pendingAllotmentIncidents.length})
          </button>

          <button
            onClick={() => setActiveFilter("on_work")}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
              activeFilter === "on_work"
                ? "bg-orange-950 border border-orange-500 text-orange-300 shadow-sm"
                : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ⚡ On Work ({onWorkIncidents.length})
          </button>

          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
              activeFilter === "completed"
                ? "bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-sm"
                : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ✅ Completed ({completedIncidents.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, ward, title..."
            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>

      </div>

      {/* 4. INCIDENT LOGS LIST VIEW */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Header Row */}
        <div className="p-4 border-b border-slate-800 bg-[#070A10] flex items-center justify-between text-xs font-mono-tech text-slate-400 font-bold uppercase">
          <span>Incident Defect & Ward Location</span>
          <span>Workflow & Assigned Unit Status</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 font-mono-tech text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-sm">No Incidents Found for Selected Filter</p>
            <p className="text-slate-500">Try selecting another filter tab or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 font-mono-tech text-xs">
            {filteredList.map((inc) => {
              const assignedTeam = teams.find((t) => t.activeJob?.taskId === inc.id);
              const isOccupied = Boolean(assignedTeam);
              const isResolved = (inc.status || "").toLowerCase() === "resolved" || (inc.status || "").toLowerCase() === "closed";
              const isInProgress = (inc.status || "").toLowerCase() === "in progress" || isOccupied;
              const isPending = !isResolved && !isInProgress;

              const metrics = assignedTeam ? calculateJobTimeMetrics(assignedTeam.activeJob) : null;

              return (
                <div
                  key={inc.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-900/40 transition"
                >
                  {/* Left Details */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-amber-400">{inc.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
                        {inc.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/80 border border-red-500/60 text-red-300">
                        {inc.priority || "P1"}
                      </span>

                      {/* Status Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isResolved
                          ? "bg-emerald-950 border border-emerald-500 text-emerald-300"
                          : isInProgress
                          ? "bg-orange-950 border border-orange-500 text-orange-300 animate-pulse"
                          : "bg-amber-950 border border-amber-500 text-amber-300"
                      }`}>
                        {isResolved ? "✅ COMPLETED" : isInProgress ? "⚡ ON WORK" : "⏳ PENDING ALLOTMENT"}
                      </span>
                    </div>

                    <h4 className="text-white font-bold font-sans text-sm">{inc.title}</h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{inc.address || inc.ward}</span>
                      </span>
                      <span>Target SLA: <strong className="text-amber-300">{inc.slaHours || 4}h</strong></span>
                      <span>Division: <strong className="text-slate-300">{inc.assignedDepartment || "Municipal Division"}</strong></span>
                    </div>

                    {/* Active Assigned Team Telemetry */}
                    {assignedTeam && (
                      <div className="p-3 rounded-xl bg-[#070A10] border border-slate-800 space-y-1 mt-2 text-[11px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-bold text-amber-400">
                            🚜 Assigned Unit: {assignedTeam.name}
                          </span>
                          <span className="text-slate-400">
                            Lead: <strong>{assignedTeam.leader}</strong> ({assignedTeam.leaderPhone})
                          </span>
                        </div>
                        {metrics && (
                          <div className="flex items-center justify-between text-slate-400 pt-0.5">
                            <span>Elapsed: <strong className="text-white">{metrics.formattedElapsed}</strong> / {assignedTeam.activeJob.allottedHours}h</span>
                            <span className={metrics.isLate ? "text-red-400 font-bold" : "text-emerald-400"}>
                              {metrics.isLate ? `Late by ${metrics.formattedLate}` : `Remaining: ${metrics.formattedRemaining}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    
                    {/* If Pending Allotment: Show Allot Team Now Button */}
                    {isPending && (
                      <button
                        onClick={() => {
                          setSelectedTaskToAllot(inc);
                          setSelectedTeamId(availableTeams[0]?.id || "");
                          setAllottedHours(inc.slaHours || 4);
                          setIsAllotModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                      >
                        <Send className="w-3.5 h-3.5 text-black" />
                        <span>Allot Team Now</span>
                      </button>
                    )}

                    {/* If On Work: Show Mark Completed Button */}
                    {isInProgress && (
                      <button
                        onClick={() => handleCompleteJob(assignedTeam?.id, inc.id)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {/* If Completed: Show Quality Badge */}
                    {isResolved && (
                      <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Work Restored & Verified</span>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: TASK ALLOTMENT MODAL */}
      {isAllotModalOpen && selectedTaskToAllot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
          <div className="bg-[#0B0F19] border border-amber-500/60 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-[0_0_35px_rgba(245,158,11,0.25)] relative space-y-5 animate-hero-entrance max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setIsAllotModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Allot Municipal Crew to Task
                </h3>
                <p className="text-xs text-amber-400 uppercase tracking-wider">
                  Field Dispatch & SLA Hours Setup
                </p>
              </div>
            </div>

            {/* Task Info */}
            <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">{selectedTaskToAllot.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
                  {selectedTaskToAllot.category}
                </span>
              </div>
              <div className="text-white font-bold font-sans text-sm">{selectedTaskToAllot.title}</div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedTaskToAllot.address || selectedTaskToAllot.ward}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmAllotment} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase">
                  Select Available Municipal Unit *
                </label>
                <select
                  required
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-[#070A10] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400"
                >
                  {availableTeams.length === 0 ? (
                    <option value="">No available teams (all occupied)</option>
                  ) : (
                    availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id} • Lead: {t.leader})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase">
                  Allotted Remediation Duration (Hours) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="48"
                  step="0.5"
                  required
                  value={allottedHours}
                  onChange={(e) => setAllottedHours(Number(e.target.value))}
                  className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAllotModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={availableTeams.length === 0}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Confirm Dispatch & Lay Team to Work</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
