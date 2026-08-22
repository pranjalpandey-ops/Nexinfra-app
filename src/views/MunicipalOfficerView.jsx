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
  Award
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
import { subscribeToComplaints } from "../services/getComplaints";

export default function MunicipalOfficerView({
  user,
  setActivePage,
  onSelectIncident
}) {
  const [teams, setTeams] = useState(getMunicipalTeams());
  const [incidents, setIncidents] = useState(getLocalCivicIssues());
  const [activeTab, setActiveTab] = useState("occupied"); // "occupied" | "allotment" | "teams"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");
  
  // Allotment Modal State
  const [selectedTaskToAllot, setSelectedTaskToAllot] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [allottedHours, setAllottedHours] = useState(4);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  
  // New Team Modal State
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDept, setNewTeamDept] = useState("Road Works & Asphalt Pavement Division");
  const [newTeamWard, setNewTeamWard] = useState("Central District - Ward 4 (Civic Centre)");
  const [newTeamLeader, setNewTeamLeader] = useState("");
  const [newTeamPhone, setNewTeamPhone] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState("");

  // Live timer tick every 15 seconds to recalculate late metrics in real time
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshData = () => {
      setTeams(getMunicipalTeams());
      setIncidents(getLocalCivicIssues());
    };

    // 1. Listen for local state events
    window.addEventListener("municipal_teams_updated", refreshData);
    window.addEventListener("civic_issue_updated", refreshData);
    window.addEventListener("nexinfra_incident_created", refreshData);
    window.addEventListener("storage", refreshData);

    // 2. Real-time Firestore complaints subscription
    const unsubscribeFirestore = subscribeToComplaints((firestoreComplaints) => {
      if (Array.isArray(firestoreComplaints) && firestoreComplaints.length > 0) {
        const local = getLocalCivicIssues();
        const merged = [
          ...firestoreComplaints,
          ...local.filter((l) => !firestoreComplaints.some((f) => f.id === l.id))
        ];
        setIncidents(merged);
      }
    });

    return () => {
      window.removeEventListener("municipal_teams_updated", refreshData);
      window.removeEventListener("civic_issue_updated", refreshData);
      window.removeEventListener("nexinfra_incident_created", refreshData);
      window.removeEventListener("storage", refreshData);
      if (typeof unsubscribeFirestore === "function") unsubscribeFirestore();
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
    
    // Auto-match closest relevant available team based on department / category
    const categoryLower = (task?.category || "").toLowerCase();
    const matchedTeam = availableTeams.find((t) => {
      const deptLower = (t.department || "").toLowerCase();
      if (categoryLower.includes("road") || categoryLower.includes("pothole")) return deptLower.includes("road");
      if (categoryLower.includes("water") || categoryLower.includes("drain")) return deptLower.includes("hydro");
      if (categoryLower.includes("waste") || categoryLower.includes("garbage")) return deptLower.includes("waste");
      if (categoryLower.includes("electric") || categoryLower.includes("light")) return deptLower.includes("power");
      if (categoryLower.includes("bridge") || categoryLower.includes("crack")) return deptLower.includes("struct");
      if (categoryLower.includes("tree") || categoryLower.includes("park")) return deptLower.includes("forest");
      return false;
    });

    if (matchedTeam) {
      setSelectedTeamId(matchedTeam.id);
    } else if (availableTeams.length > 0) {
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
      await updateComplaintStatus(selectedTaskToAllot.id, "In Progress");
      setTeams(getMunicipalTeams());
      setIsAllotModalOpen(false);
      setSelectedTaskToAllot(null);
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
    if (!confirm(`Are you sure you want to COMPLETE & RESOLVE job for task #${taskId} and release ${team.name}?`)) {
      return;
    }

    if (taskId) {
      await updateComplaintStatus(taskId, "Resolved");
    }
    completeJobAndReleaseTeam(team.id);
    setTeams(getMunicipalTeams());
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
        { name: "Field Technician 1", role: "Equipment Specialist" },
        { name: "Field Technician 2", role: "Safety Marshall" }
      );
    }

    createMunicipalTeam({
      name: newTeamName,
      department: newTeamDept,
      ward: newTeamWard,
      leader: newTeamLeader,
      leaderPhone: newTeamPhone || "+91 98112-00000",
      members: memberList,
      equipment: ["Specialized Maintenance Van #01", "Hydraulic & Hand Remediation Tools"]
    });

    setTeams(getMunicipalTeams());
    setIsNewTeamModalOpen(false);
    setNewTeamName("");
    setNewTeamLeader("");
    setNewTeamPhone("");
    setNewTeamMembers("");
  };

  // Filter pending tasks
  const filteredTasks = pendingTasks.filter((task) => {
    if (selectedDeptFilter !== "All") {
      const cat = (task.category || "").toLowerCase();
      if (selectedDeptFilter === "Roads" && !cat.includes("road") && !cat.includes("pothole")) return false;
      if (selectedDeptFilter === "Hydro" && !cat.includes("water") && !cat.includes("drain")) return false;
      if (selectedDeptFilter === "Waste" && !cat.includes("waste") && !cat.includes("garbage")) return false;
      if (selectedDeptFilter === "Power" && !cat.includes("electric") && !cat.includes("light")) return false;
      if (selectedDeptFilter === "Bridges" && !cat.includes("bridge") && !cat.includes("crack")) return false;
      if (selectedDeptFilter === "Forestry" && !cat.includes("tree") && !cat.includes("park")) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (task.id || "").toLowerCase().includes(q) ||
        (task.title || "").toLowerCase().includes(q) ||
        (task.category || "").toLowerCase().includes(q) ||
        (task.locationName || "").toLowerCase().includes(q) ||
        (task.ward || "").toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 font-mono-tech text-xs pb-16">
      
      {/* 🏛️ Modern Officer Command Hero Header */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0C121E] via-[#0E1726] to-[#0A101A] border border-amber-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-400/80 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Building className="w-6 h-6" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-white tracking-wide font-heading">
                    Municipal Field Officer Command
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase">
                    🏛️ ZONAL DISPATCH DESK
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  Manage field response crews, assign duration SLAs, and monitor live delays
                </p>
              </div>
            </div>

            {/* Officer Meta Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] text-slate-200">
              <span className="px-3 py-1.5 rounded-xl bg-[#070A10]/90 border border-slate-700/80 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Officer: <strong className="text-white">{user?.name || "Er. Rajesh Mehra"}</strong></span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-[#070A10]/90 border border-slate-700/80 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Dept: <strong className="text-white">{user?.department || "Road Works & Infrastructure"}</strong></span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-[#070A10]/90 border border-slate-700/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zone: <strong className="text-white">{user?.ward || "Central District - Ward 4"}</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 text-black font-extrabold uppercase text-xs flex items-center gap-2 cursor-pointer transition shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Crew</span>
            </button>

            <button
              onClick={() => {
                setTeams(getMunicipalTeams());
                setIncidents(getLocalCivicIssues());
              }}
              title="Refresh live team telemetries"
              className="p-3 rounded-xl bg-[#070A10] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 📊 High-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Occupied Crews */}
        <div 
          onClick={() => setActiveTab("occupied")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "occupied"
              ? "bg-[#14110C] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              : "bg-[#0B0F19] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Occupied at Job</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-sans">{occupiedTeams.length}</span>
            <span className="text-[10px] text-slate-400">active crews</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/90 flex items-center gap-1 font-bold">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>Remediating On-Site</span>
          </div>
        </div>

        {/* Ready Available Teams */}
        <div 
          onClick={() => setActiveTab("teams")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "teams"
              ? "bg-[#0B1510] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-[#0B0F19] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300 font-sans">{availableTeams.length}</span>
            <span className="text-[10px] text-slate-400">standby units</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400/90 flex items-center gap-1 font-bold">
            <Check className="w-3 h-3" />
            <span>Ready for Immediate Allotment</span>
          </div>
        </div>

        {/* Overdue / Late Delay Tracker */}
        <div 
          onClick={() => setActiveTab("occupied")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            lateTeamsCount > 0
              ? "bg-[#180B0B] border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse"
              : "bg-[#0B0F19] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">SLA Overdue / Late</span>
            <AlertTriangle className={`w-4 h-4 ${lateTeamsCount > 0 ? "text-red-400" : "text-slate-500"}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-sans ${lateTeamsCount > 0 ? "text-red-400" : "text-slate-300"}`}>
              {lateTeamsCount}
            </span>
            <span className="text-[10px] text-slate-400">delayed jobs</span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 font-bold">
            {lateTeamsCount > 0 ? (
              <span className="text-red-400">🚨 Immediate Remediation Required</span>
            ) : (
              <span className="text-emerald-400">✓ All Teams On Schedule</span>
            )}
          </div>
        </div>

        {/* Pending Task Queue */}
        <div 
          onClick={() => setActiveTab("allotment")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "allotment"
              ? "bg-[#0B1220] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              : "bg-[#0B0F19] border-slate-800/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Task Queue</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300 font-sans">{pendingTasks.length}</span>
            <span className="text-[10px] text-slate-400">unallotted tasks</span>
          </div>
          <div className="mt-2 text-[10px] text-cyan-400/90 flex items-center gap-1 font-bold">
            <ArrowRight className="w-3 h-3" />
            <span>Click to Allot Crew</span>
          </div>
        </div>

      </div>

      {/* 🧭 Main Interactive Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        <button
          onClick={() => setActiveTab("occupied")}
          className={`p-4 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "occupied"
              ? "bg-gradient-to-r from-[#17120C] to-[#0E121A] border-amber-400 text-amber-300 shadow-lg"
              : "bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeTab === "occupied" ? "bg-amber-950/80 text-amber-400" : "bg-slate-900 text-slate-400"}`}>
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs uppercase tracking-wider">1. Occupied Crews & Live Late Tracker</div>
              <div className="text-[10px] text-slate-400 font-sans">Live countdown timers & delay monitor</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500 font-extrabold text-amber-300 text-xs">
            {occupiedTeams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("allotment")}
          className={`p-4 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "allotment"
              ? "bg-gradient-to-r from-[#0B1526] to-[#0E121A] border-cyan-400 text-cyan-300 shadow-lg"
              : "bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeTab === "allotment" ? "bg-cyan-950/80 text-cyan-400" : "bg-slate-900 text-slate-400"}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs uppercase tracking-wider">2. Task Queue & Quick Allotment</div>
              <div className="text-[10px] text-slate-400 font-sans">Assign available crews to reported defects</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500 font-extrabold text-cyan-300 text-xs">
            {pendingTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("teams")}
          className={`p-4 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "teams"
              ? "bg-gradient-to-r from-[#0B1914] to-[#0E121A] border-emerald-400 text-emerald-300 shadow-lg"
              : "bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeTab === "teams" ? "bg-emerald-950/80 text-emerald-400" : "bg-slate-900 text-slate-400"}`}>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs uppercase tracking-wider">3. Teams Directory & Rosters</div>
              <div className="text-[10px] text-slate-400 font-sans">Crew leads, phone numbers & machinery</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500 font-extrabold text-emerald-300 text-xs">
            {teams.length}
          </span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OCCUPIED CREWS & LIVE OVERDUE / LATE TRACKER                      */}
      {/* ========================================================================= */}
      {activeTab === "occupied" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#0B0F19] border border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white uppercase">
                Active Crews Remediating In Field ({occupiedTeams.length})
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              ⏱️ Real-time duration timer & delay penalty calculator active
            </span>
          </div>

          {occupiedTeams.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#0B0F19] border border-slate-800/80 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">All Municipal Field Teams are Ready on Standby</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active jobs currently in remediation. Open the <strong>Task Queue & Team Allotment</strong> tab to dispatch a team to reported civic defects.
              </p>
              <button
                onClick={() => setActiveTab("allotment")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Go to Task Queue →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {occupiedTeams.map((team) => {
                const job = team.activeJob;
                const metrics = calculateJobTimeMetrics(job);

                // Progress Percentage
                const pct = Math.min(100, Math.round((metrics.elapsedMinutes / metrics.allottedMinutes) * 100));

                return (
                  <div
                    key={team.id}
                    className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-5 ${
                      metrics.isLate
                        ? "bg-gradient-to-br from-[#1C0D0D] via-[#150A0A] to-[#0E0E12] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.25)]"
                        : "bg-gradient-to-br from-[#12100E] via-[#0E1119] to-[#0A0D14] border-amber-500/60 shadow-xl"
                    }`}
                  >
                    {/* Top Team Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-base font-sans">
                              {team.name}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/70 text-amber-300 text-[10px] font-bold">
                              {team.department}
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-1 font-sans">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Job Site: <strong className="text-white">{job.locationName || team.ward}</strong></span>
                          </div>
                        </div>

                        {/* Late / On-Schedule Status Tag */}
                        <div>
                          {metrics.isLate ? (
                            <div className="px-3 py-1.5 rounded-xl bg-red-950 border border-red-500 text-red-300 font-extrabold text-xs flex items-center gap-1.5 animate-pulse shadow-md">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span>🚨 {metrics.lateFormatted} OVERDUE</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shadow-md">
                              <Clock className="w-4 h-4 text-emerald-400" />
                              <span>🟢 {metrics.remainingFormatted} Left</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Active Task Info Card */}
                      <div className="p-3.5 rounded-2xl bg-[#070A10]/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Assigned Defect Task:</span>
                          <span className="font-extrabold text-cyan-400">#{job.taskId}</span>
                        </div>
                        <p className="text-xs text-white font-sans font-semibold line-clamp-1">
                          {job.taskTitle || "Infrastructure Remediation Work Order"}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span>Dispatched: <strong>{new Date(job.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                          <span>Duration Limit: <strong className="text-amber-300">{job.allottedHours} Hours</strong></span>
                        </div>
                      </div>

                      {/* Visual Time Elapsed Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Elapsed Time: <strong className="text-white">{metrics.elapsedFormatted}</strong></span>
                          <span className={`font-bold ${metrics.isLate ? "text-red-400" : "text-amber-300"}`}>
                            {pct}% of SLA Duration
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              metrics.isLate
                                ? "bg-gradient-to-r from-amber-500 to-red-500"
                                : pct > 75
                                ? "bg-amber-400"
                                : "bg-gradient-to-r from-emerald-400 to-cyan-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Allotted Crew Members & Contact */}
                      <div className="pt-1">
                        <div className="text-[11px] text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Allotted Field Crew ({team.members?.length || 3})</span>
                          </span>
                          <a
                            href={`tel:${team.leaderPhone || "+919811200000"}`}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call {team.leader} ({team.leaderPhone || "+91 98112-XXXXX"})</span>
                          </a>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {team.members?.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg bg-[#070A10] border border-slate-800 text-[10px] text-slate-300"
                            >
                              <strong>{m.name}</strong> • <span className="text-slate-400">{m.role}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stage Advancer & Action Controls */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Current Stage:</span>
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/80 text-cyan-300 font-bold text-xs">
                          {job.status || "Dispatched"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status !== "Quality Inspection" && (
                          <button
                            onClick={() => handleAdvanceJobStatus(team.id, job.status)}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Advance Stage</span>
                            <ChevronRight className="w-4 h-4 text-cyan-400" />
                          </button>
                        )}

                        <button
                          onClick={() => handleCompleteJob(team)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Job Completed ✓</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TASK QUEUE & QUICK ALLOTMENT                                       */}
      {/* ========================================================================= */}
      {activeTab === "allotment" && (
        <div className="space-y-4">
          
          {/* Search & Department Filters */}
          <div className="p-4 rounded-3xl bg-[#0B0F19] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search defects by title, ID, category, or location..."
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["All", "Roads", "Hydro", "Waste", "Power", "Bridges", "Forestry"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                      selectedDeptFilter === dept
                        ? "bg-cyan-400 text-black shadow-md font-extrabold"
                        : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#0B0F19] border border-slate-800/80 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-cyan-400" />
              <h4 className="text-base font-bold text-white">No Pending Defect Tasks Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All reported civic complaints in this filter have been allotted or resolved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const isAllotted = occupiedTeams.some((t) => t.activeJob?.taskId === task.id);

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-gradient-to-br from-[#0C111C] via-[#0B0F19] to-[#070A10] border border-slate-800 hover:border-cyan-500/60 transition-all shadow-xl flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3">
                      
                      {/* Image Preview if available */}
                      {task.imageUrl && (
                        <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-800/80 relative">
                          <img
                            src={task.imageUrl}
                            alt={task.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-500/50">
                            Level {task.hazardLevel || task.problemLevel || 3} Defect
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                            {task.category || "Infrastructure Defect"}
                          </span>
                          <span className="text-slate-400 font-mono-tech">#{task.id}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white font-sans mt-2 group-hover:text-cyan-300 transition-colors">
                          {task.title || "Civic Complaint"}
                        </h4>

                        <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                          {task.description || "Public reported defect requiring municipal field engineering remediation."}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#070A10] border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{task.locationName || task.location || "Central Delhi Zone"}</span>
                        </div>
                        {task.ward && (
                          <div className="text-[10px] text-amber-300 font-bold">
                            Ward: {task.ward}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Allot Button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {isAllotted ? (
                        <div className="w-full py-2.5 rounded-xl bg-amber-950/70 border border-amber-500/70 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span>Crew Dispatched & Working</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAllotModal(task)}
                          disabled={availableTeams.length === 0}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{availableTeams.length > 0 ? "⚡ Allot Municipal Team" : "No Teams Available"}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL TEAMS DIRECTORY & ROSTERS                                     */}
      {/* ========================================================================= */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B0F19] border border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white uppercase">
                Municipal Field Teams Directory ({teams.length})
              </span>
            </div>
            
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const isOccupied = team.status === "occupied";

              return (
                <div
                  key={team.id}
                  className={`p-5 rounded-3xl border bg-[#0B0F19] space-y-4 transition shadow-xl ${
                    isOccupied
                      ? "border-amber-500/60 bg-gradient-to-br from-[#12100E] to-[#0B0F19]"
                      : "border-emerald-500/40 bg-gradient-to-br from-[#0B1510] to-[#0B0F19]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-white text-base font-sans">{team.name}</h4>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">{team.department}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        isOccupied
                          ? "bg-amber-950 border border-amber-500 text-amber-300"
                          : "bg-emerald-950 border border-emerald-500 text-emerald-300"
                      }`}
                    >
                      {isOccupied ? "Occupied at Site" : "Available Ready"}
                    </span>
                  </div>

                  {/* Ward & Leader Contact */}
                  <div className="p-3 rounded-2xl bg-[#070A10] border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Zone: <strong>{team.ward}</strong></span>
                    </div>

                    <div className="flex items-center justify-between text-cyan-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Lead: <strong>{team.leader}</strong></span>
                      </span>
                      <a
                        href={`tel:${team.leaderPhone || "+919811200000"}`}
                        className="hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{team.leaderPhone || "+91 98112-XXXXX"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Members Roster */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Crew Technicians ({team.members?.length || 0})
                    </span>
                    <div className="space-y-1">
                      {team.members?.map((m, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#070A10]/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between"
                        >
                          <span className="font-bold text-white">{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  {team.equipment && team.equipment.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Assigned Machinery & Gear
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.equipment.map((eq, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] border border-slate-800"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ALLOT AVAILABLE CREW WITH DURATION PRESETS                       */}
      {/* ========================================================================= */}
      {isAllotModalOpen && selectedTaskToAllot && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative">
            
            <button
              onClick={() => setIsAllotModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Allot Municipal Field Team
                </h3>
                <p className="text-xs text-cyan-400">
                  Assign available crew & set allocated SLA time limit
                </p>
              </div>
            </div>

            {/* Task Snapshot */}
            <div className="p-4 rounded-2xl bg-[#070A10] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-cyan-400">Task #{selectedTaskToAllot.id}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold text-[10px]">
                  {selectedTaskToAllot.category}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm font-sans">{selectedTaskToAllot.title}</h4>
              <p className="text-xs text-slate-400 font-sans">{selectedTaskToAllot.locationName || selectedTaskToAllot.location}</p>
            </div>

            {/* Available Team Picker */}
            <div className="space-y-2">
              <label className="block text-slate-200 font-bold text-xs uppercase tracking-wider">
                Select Ready Response Crew:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-[#070A10] border border-cyan-500/60 rounded-xl p-3.5 text-white text-xs focus:outline-none"
              >
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department} • Lead: {t.leader})
                  </option>
                ))}
              </select>
            </div>

            {/* Allotted Time Duration with Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs uppercase tracking-wider">
                  Allotted Time Limit:
                </label>
                <span className="px-3 py-1 rounded-xl bg-amber-950 border border-amber-500 text-amber-300 font-extrabold text-xs">
                  ⏱️ {allottedHours} Hours Maximum
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 8, 12].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setAllottedHours(hrs)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      allottedHours === hrs
                        ? "bg-amber-400 text-black font-extrabold shadow-md"
                        : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {hrs}h {hrs === 2 ? "(Rapid)" : hrs === 4 ? "(Standard)" : hrs === 8 ? "(Full Day)" : "(Major)"}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={allottedHours}
                onChange={(e) => setAllottedHours(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                If remediation exceeds {allottedHours} hours, the crew will automatically trigger an Overdue Delay escalation flag on the officer dashboard.
              </p>
            </div>

            {/* Confirm Dispatch Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleConfirmAllotment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95"
              >
                <Truck className="w-5 h-5" />
                <span>Dispatch Crew & Start Duration Timer</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTER NEW MUNICIPAL RESPONSE TEAM                             */}
      {/* ========================================================================= */}
      {isNewTeamModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsNewTeamModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Register Field Response Team
                </h3>
                <p className="text-xs text-emerald-400">
                  Add specialized crew roster for municipal maintenance
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-slate-200 font-bold">Team Name / Unit Code</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Unit Zeta - Rapid Pavement Crew"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-200 font-bold">Department</label>
                  <select
                    value={newTeamDept}
                    onChange={(e) => setNewTeamDept(e.target.value)}
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs"
                  >
                    <option value="Road Works & Asphalt Pavement Division">Road Works & Asphalt</option>
                    <option value="Municipal Hydro & Water Supply Grid">Hydro & Drainage</option>
                    <option value="Sanitation & Solid Waste Logistics Unit">Solid Waste & Sanitation</option>
                    <option value="Municipal Power & Street Lighting Grid">Power & Streetlights</option>
                    <option value="Structural Engineering & Bridge Safety Division">Structural & Bridges</option>
                    <option value="Urban Forestry & Public Parks Department">Urban Forestry & Parks</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-200 font-bold">Assigned Ward</label>
                  <input
                    type="text"
                    required
                    value={newTeamWard}
                    onChange={(e) => setNewTeamWard(e.target.value)}
                    placeholder="e.g. Central District - Ward 4"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-200 font-bold">Crew Leader Name</label>
                  <input
                    type="text"
                    required
                    value={newTeamLeader}
                    onChange={(e) => setNewTeamLeader(e.target.value)}
                    placeholder="e.g. Inspector Ramesh Kumar"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-200 font-bold">Direct Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newTeamPhone}
                    onChange={(e) => setNewTeamPhone(e.target.value)}
                    placeholder="+91 98112-XXXXX"
                    className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-200 font-bold">Crew Members (One name per line)</label>
                <textarea
                  rows="3"
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                  placeholder="Sunil Verma&#10;Amit Saxena&#10;Kavita Devi"
                  className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95"
                >
                  Save & Register Response Team
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
