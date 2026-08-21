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
  Plus
} from "lucide-react";

import {
  getMunicipalTeams,
  saveMunicipalTeams,
  allotTeamToTask,
  updateTeamJobStatus,
  completeJobAndReleaseTeam,
  createMunicipalTeam,
  calculateJobTimeMetrics
} from "../services/municipalTeamService";

import { getLocalCivicIssues, updateCivicIssueStatus } from "../services/civicDb";
import { updateComplaintStatus } from "../services/updateComplaintStatus";

export default function MunicipalOfficerView({
  user,
  setActivePage,
  onSelectIncident
}) {
  const [teams, setTeams] = useState(getMunicipalTeams());
  const [incidents, setIncidents] = useState(getLocalCivicIssues());
  const [activeTab, setActiveTab] = useState("occupied"); // "occupied" | "allotment" | "teams"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskToAllot, setSelectedTaskToAllot] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [allottedHours, setAllottedHours] = useState(4);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDept, setNewTeamDept] = useState("Road Works & Asphalt Pavement Division");
  const [newTeamWard, setNewTeamWard] = useState("Central District - Ward 4 (Civic Centre)");
  const [newTeamLeader, setNewTeamLeader] = useState("");
  const [newTeamPhone, setNewTeamPhone] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState("");

  // Live timer tick every 30 seconds to recalculate late times
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshData = () => {
      setTeams(getMunicipalTeams());
      setIncidents(getLocalCivicIssues());
    };

    window.addEventListener("municipal_teams_updated", refreshData);
    window.addEventListener("civic_issue_updated", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("municipal_teams_updated", refreshData);
      window.removeEventListener("civic_issue_updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const occupiedTeams = teams.filter((t) => t.status === "occupied" && t.activeJob);
  const availableTeams = teams.filter((t) => t.status === "available");

  // Pending tasks ready for dispatch
  const pendingTasks = incidents.filter(
    (i) => i.status === "Submitted" || i.status === "AI Verified" || i.status === "Verified" || i.status === "In Progress"
  );

  const lateTeamsCount = occupiedTeams.filter((t) => {
    const metrics = calculateJobTimeMetrics(t.activeJob);
    return metrics.isLate;
  }).length;

  const handleOpenAllotModal = (task) => {
    setSelectedTaskToAllot(task);
    if (availableTeams.length > 0) {
      setSelectedTeamId(availableTeams[0].id);
    }
    setAllottedHours(task?.slaHours || 4);
    setIsAllotModalOpen(true);
  };

  const handleConfirmAllotment = async () => {
    if (!selectedTeamId || !selectedTaskToAllot) {
      alert("Please choose an available team for allotment.");
      return;
    }

    const res = allotTeamToTask(selectedTeamId, selectedTaskToAllot, allottedHours);
    if (res.success) {
      // Update complaint status to In Progress
      await updateComplaintStatus(selectedTaskToAllot.id, "In Progress");
      setTeams(getMunicipalTeams());
      setIsAllotModalOpen(false);
      setSelectedTaskToAllot(null);
      alert(`✅ Team successfully allotted to task ${selectedTaskToAllot.id}!`);
      setActiveTab("occupied");
    }
  };

  const handleAdvanceJobStatus = (teamId, currentStatus) => {
    let nextStatus = "On-Site Remediating";
    if (currentStatus === "Dispatched to Site" || currentStatus === "Dispatched & Loading") {
      nextStatus = "On-Site Remediating";
    } else if (currentStatus === "On-Site Remediating") {
      nextStatus = "Quality Inspection";
    }

    updateTeamJobStatus(teamId, nextStatus);
    setTeams(getMunicipalTeams());
  };

  const handleCompleteJob = async (team) => {
    const taskId = team.activeJob?.taskId;
    if (!confirm(`Are you sure you want to COMPLETE & RESOLVE job for task ${taskId} and release ${team.name}?`)) {
      return;
    }

    if (taskId) {
      await updateComplaintStatus(taskId, "Resolved");
    }
    completeJobAndReleaseTeam(team.id);
    setTeams(getMunicipalTeams());
    alert(`✅ Job completed! ${team.name} is now AVAILABLE for new assignments.`);
  };

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamLeader.trim()) {
      alert("Please provide Team Name and Leader Name.");
      return;
    }

    const memberList = newTeamMembers
      .split("\n")
      .filter((m) => m.trim())
      .map((name, idx) => ({
        name: name.trim(),
        role: idx === 0 ? "Lead Technician" : "Field Specialist"
      }));

    if (memberList.length === 0) {
      memberList.push(
        { name: newTeamLeader, role: "Crew Lead" },
        { name: "Support Technician 1", role: "Equipment Specialist" },
        { name: "Support Technician 2", role: "Safety Marshall" }
      );
    }

    createMunicipalTeam({
      name: newTeamName,
      department: newTeamDept,
      ward: newTeamWard,
      leader: newTeamLeader,
      leaderPhone: newTeamPhone || "+91 98000-00000",
      members: memberList,
      equipment: ["Specialized Mobile Maintenance Van #01", "Heavy Hand Tools & Safety Gear"]
    });

    setTeams(getMunicipalTeams());
    setIsNewTeamModalOpen(false);
    setNewTeamName("");
    setNewTeamLeader("");
    setNewTeamPhone("");
    setNewTeamMembers("");
    alert("✅ New Municipal Field Team registered successfully!");
  };

  return (
    <div className="space-y-6 font-mono-tech text-xs pb-16">
      
      {/* Officer Command Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-cyan-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-400 cyan-glow-sm">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white font-heading">
                    Municipal Field Officer Operations Command
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-[10px]">
                    OFFICER PORTAL
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Zonal team allocation, live job tracking, SLA late penalty monitoring, and on-site remediation
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Officer: <strong>{user?.name || "Zonal Officer"}</strong></span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Dept: <strong>{user?.department || "Road Works & Infrastructure"}</strong></span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Zone: <strong>{user?.ward || "Central District - Ward 4"}</strong></span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/60 hover:bg-cyan-950 text-cyan-300 font-bold uppercase flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Register Response Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Occupied at Job</span>
          <div className="text-xl font-extrabold text-amber-400 flex items-center gap-1.5">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>{occupiedTeams.length} Active Crews</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Available Ready</span>
          <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{availableTeams.length} Ready Units</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">SLA Overdue / Late</span>
          <div className={`text-xl font-extrabold flex items-center gap-1.5 ${lateTeamsCount > 0 ? "text-red-400 animate-pulse" : "text-slate-200"}`}>
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>{lateTeamsCount} Delayed Jobs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C101A] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Field Personnel</span>
          <div className="text-xl font-extrabold text-cyan-300 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>{teams.reduce((acc, t) => acc + (t.members?.length || 4), 0)} Technicians</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab("occupied")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "occupied"
              ? "bg-[#12100E] border-amber-400 text-amber-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-xs uppercase">1. Occupied Teams & Live Late Tracker</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 font-extrabold text-amber-300 text-[10px]">
            {occupiedTeams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("allotment")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "allotment"
              ? "bg-[#0E1524] border-cyan-400 text-cyan-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs uppercase">2. Task Queue & Team Allotment</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 font-extrabold text-cyan-300 text-[10px]">
            {pendingTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("teams")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "teams"
              ? "bg-[#0E1814] border-emerald-400 text-emerald-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase">3. All Teams & Member Rosters</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 font-extrabold text-emerald-300 text-[10px]">
            {teams.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OCCUPIED TEAMS AT JOB WITH LATE DURATION MONITOR   */}
      {/* ========================================================= */}
      {activeTab === "occupied" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Occupied Teams Currently At Job Sites</span>
            </h3>
            <span className="text-slate-400 text-xs">
              Live updates every 30 seconds • Automatic late delay calculation
            </span>
          </div>

          {occupiedTeams.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0C101A] border border-slate-800 text-center space-y-2 text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="text-sm text-slate-300 font-bold">All Municipal Field Teams are Currently Available</p>
              <p className="text-xs">Select a task in the Task Queue tab to allot and dispatch an available crew.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {occupiedTeams.map((team) => {
                const job = team.activeJob;
                const metrics = calculateJobTimeMetrics(job);

                return (
                  <div
                    key={team.id}
                    className={`p-5 rounded-2xl border bg-[#0C101A] space-y-4 transition relative ${
                      metrics.isLate
                        ? "border-red-500/80 bg-[#160D0D] shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        : "border-amber-500/50 bg-[#0E1218]"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-400 text-xs">{team.id}</span>
                          <h4 className="font-bold text-white text-sm font-sans">{team.name}</h4>
                        </div>
                        <p className="text-slate-400 text-[11px] font-sans mt-0.5">{team.department}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg border font-extrabold text-[10px] uppercase flex items-center gap-1.5 ${
                        metrics.isLate
                          ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                          : "bg-amber-950 border-amber-500 text-amber-300"
                      }`}>
                        <Radio className="w-3 h-3" />
                        <span>{job.status || "On-Site Remediating"}</span>
                      </span>
                    </div>

                    {/* Active Job Details */}
                    <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Assigned Task ID: <strong className="text-cyan-300">{job.taskId}</strong></span>
                        <span className="text-amber-300 font-bold">{job.category}</span>
                      </div>
                      <h5 className="font-bold text-white text-xs font-sans">{job.taskTitle}</h5>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{job.address || job.ward}</span>
                      </div>
                    </div>

                    {/* Time Duration vs Elapsed & Late Penalty Strip */}
                    <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300 font-bold">Time Duration Tracking</span>
                        </div>

                        {metrics.isLate ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-extrabold text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span>🚨 {metrics.formattedLate} LATE / OVERDUE</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-[10px]">
                            🟢 {metrics.formattedRemaining} REMAINING
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">ALLOTTED</span>
                          <strong className="text-white text-xs">{job.allottedHours || 4}h 00m</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">ELAPSED</span>
                          <strong className="text-cyan-300 text-xs">{metrics.formattedElapsed}</strong>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block">DELAY PENALTY</span>
                          <strong className={metrics.isLate ? "text-red-400 text-xs" : "text-emerald-400 text-xs"}>
                            {metrics.isLate ? `-${metrics.lateMinutes}m Overdue` : "Zero Delay (Clean)"}
                          </strong>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            metrics.isLate ? "bg-red-500" : "bg-cyan-400"
                          }`}
                          style={{ width: `${Math.min(100, metrics.percentageElapsed)}%` }}
                        />
                      </div>
                    </div>

                    {/* Allotted Team Members Roster */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Allotted Crew ({team.members?.length || 4} Members)</span>
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Leader: {team.leaderPhone}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {team.members?.map((m, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-slate-900/90 border border-slate-800 text-[10px]">
                            <strong className="text-white block truncate">{m.name}</strong>
                            <span className="text-slate-400 text-[9px] truncate block">{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAdvanceJobStatus(team.id, job.status)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Update Stage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCompleteJob(team)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Job Completed ✓</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TASK QUEUE & TEAM ALLOTMENT                        */}
      {/* ========================================================= */}
      {activeTab === "allotment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Municipal Ingestion Queue Ready For Allotment</span>
            </h3>
            <span className="text-slate-400 text-xs">
              {availableTeams.length} Available Crew(s) Ready for Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-slate-800 bg-[#0C101A] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-xs">{task.id}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[10px]">
                    {task.priority || "P1"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm font-sans line-clamp-1">
                    {task.title || task.defectName || task.category}
                  </h4>
                  <p className="text-slate-400 text-xs font-sans line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{task.address || task.location || task.ward}</span>
                </div>

                <div className="p-2 rounded-lg bg-[#070A10] border border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Target SLA: {task.slaHours || 4}h</span>
                  <span className="text-cyan-300 font-bold">{task.category}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAllotModal(task)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-md"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Allot Municipal Team</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ALL FIELD TEAMS DIRECTORY & ROSTERS                */}
      {/* ========================================================= */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Municipal Response Units & Member Rosters</span>
            </h3>
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-xs hover:bg-cyan-900 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl border border-slate-800 bg-[#0C101A] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-xs">{team.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                    team.status === "occupied"
                      ? "bg-amber-950 border-amber-500 text-amber-300"
                      : "bg-emerald-950 border-emerald-500 text-emerald-300"
                  }`}>
                    {team.status === "occupied" ? "🟠 OCCUPIED AT JOB" : "🟢 AVAILABLE"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm font-sans">{team.name}</h4>
                  <p className="text-slate-400 text-[11px] font-sans">{team.department}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#070A10] border border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leader:</span>
                    <strong className="text-white">{team.leader}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-emerald-400">{team.leaderPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Ward:</span>
                    <span className="text-cyan-300 truncate max-w-[160px]">{team.ward}</span>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Allotted Members ({team.members?.length || 4})
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {team.members?.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] p-1 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-200 font-bold truncate">{m.name}</span>
                        <span className="text-slate-400 text-[9px] truncate">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment Tag */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Assigned Heavy Machinery
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {team.equipment?.map((eq, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px]">
                        🔧 {eq}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: TEAM ALLOTMENT MODAL                             */}
      {/* ========================================================= */}
      {isAllotModalOpen && selectedTaskToAllot && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl max-w-xl w-full p-6 space-y-5 cyan-glow-lg relative">
            <button
              onClick={() => setIsAllotModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Allot Municipal Response Team
                </h3>
                <p className="text-xs text-slate-400">
                  Select available crew, set allotted time duration, and dispatch
                </p>
              </div>
            </div>

            {/* Task Snapshot */}
            <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold block">TARGET INCIDENT</span>
              <h4 className="text-sm font-bold text-white font-sans">{selectedTaskToAllot.title || selectedTaskToAllot.category}</h4>
              <p className="text-xs text-slate-300">{selectedTaskToAllot.address || selectedTaskToAllot.ward}</p>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold">
                Choose Available Response Team:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-400 text-xs"
              >
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} — {team.leader} ({team.department})
                  </option>
                ))}
                {availableTeams.length === 0 && (
                  <option value="" disabled>No teams currently available</option>
                )}
              </select>
            </div>

            {/* Allotted Time Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Allotted Time Duration:</span>
                <strong className="text-cyan-400">{allottedHours} Hours</strong>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={allottedHours}
                onChange={(e) => setAllottedHours(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 block">
                Late delays will be computed automatically against this {allottedHours}h allotment window.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAllotment}
                disabled={availableTeams.length === 0}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Allotment & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REGISTER NEW MUNICIPAL TEAM MODAL                */}
      {/* ========================================================= */}
      {isNewTeamModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 cyan-glow-lg relative">
            <button
              onClick={() => setIsNewTeamModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Register New Municipal Response Team
                </h3>
                <p className="text-xs text-slate-400">
                  Add specialized crew, team leader, and member personnel roster
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300 font-bold">Team Name / Unit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Eta - South Zone Pavement Quick Repair"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300 font-bold">Department</label>
                  <select
                    value={newTeamDept}
                    onChange={(e) => setNewTeamDept(e.target.value)}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Road Works & Asphalt Pavement Division">Road Works</option>
                    <option value="Municipal Hydro & Water Supply Grid">Hydro Supply</option>
                    <option value="Sanitation & Solid Waste Logistics Unit">Solid Waste</option>
                    <option value="Municipal Power & Street Lighting Grid">Electrical & Power</option>
                    <option value="Structural Engineering & Bridge Safety Division">Structural & Bridges</option>
                    <option value="Urban Forestry & Public Parks Department">Urban Forestry</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-300 font-bold">Assigned Ward</label>
                  <input
                    type="text"
                    value={newTeamWard}
                    onChange={(e) => setNewTeamWard(e.target.value)}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300 font-bold">Team Leader Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Naresh Pal"
                    value={newTeamLeader}
                    onChange={(e) => setNewTeamLeader(e.target.value)}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-300 font-bold">Leader Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000-00000"
                    value={newTeamPhone}
                    onChange={(e) => setNewTeamPhone(e.target.value)}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-300 font-bold">
                  Allotted Members Roster (One name per line)
                </label>
                <textarea
                  rows="3"
                  placeholder="Naresh Pal (Crew Chief)&#10;Amit Kumar (Operator)&#10;Gopal Das (Tech)"
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold uppercase"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
