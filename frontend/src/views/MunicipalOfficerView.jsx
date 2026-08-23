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
  Trash2,
  Send,
  UserCheck,
  HardHat,
  BadgeAlert,
  BarChart3,
  Map as MapIcon
} from "lucide-react";

import {
  getMunicipalTeams,
  saveMunicipalTeams,
  allotTeamToTask,
  updateTeamJobStatus,
  completeJobAndReleaseTeam,
  createMunicipalTeam,
  calculateJobTimeMetrics,
  addCrewMemberToTeam,
  removeCrewMemberFromTeam,
  getPendingMemberRequests,
  submitNewMemberRequest,
  approveMemberRequest
} from "../services/municipalTeamService";

import { getLocalCivicIssues, updateCivicIssueStatus } from "../services/civicDb";
import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { subscribeToComplaints } from "../services/getComplaints";
import LeafletMap from "../components/LeafletMap";


// 7 Specialized Municipal Department Centers / Depots
export const MUNICIPAL_DEPARTMENT_CENTERS = [
  {
    id: "DEPT-FIRE-01",
    code: "FIRE-HQ",
    name: "Central Fire & Emergency Disaster Station",
    category: "Fire & Smoke Hazard",
    iconEmoji: "🚒",
    color: "#DC2626",
    ward: "Industrial District - Ward 11",
    zone: "Zone 11 Emergency Command",
    position: [28.6350, 77.2180],
    inchargeName: "Capt. Rajesh Verma",
    inchargeRank: "Chief Fire Warden & Disaster Lead",
    inchargePhone: "+91 98112 00101 / 101",
    fleetSummary: "6 Water Tenders • 2 Hydraulic Ladders • 1 Foam Unit",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-ROAD-02",
    code: "ROAD-DEPOT",
    name: "Pavement & Highway Maintenance Depot",
    category: "Road Damage / Pothole",
    iconEmoji: "🛣️",
    color: "#EF4444",
    ward: "Central District - Ward 4",
    zone: "Zone 4 Arterial Highway Unit",
    position: [28.6180, 77.2250],
    inchargeName: "Er. Amit Saxena",
    inchargeRank: "Executive Engineer (Civil & Roads)",
    inchargePhone: "+91 98112 00102",
    fleetSummary: "4 Cold-Mix Asphalt Rollers • 3 Pavers • 2 Dump Trucks",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-HYDRO-03",
    code: "HYDRO-GRID",
    name: "Hydro Grid & Water Supply Headworks",
    category: "Water / Drainage Burst",
    iconEmoji: "💧",
    color: "#00F0FF",
    ward: "Sector 18 Ward - Zone A",
    zone: "Zone A Potable Feeder Hub",
    position: [28.6220, 77.2140],
    inchargeName: "Er. S. Venkat",
    inchargeRank: "Chief Hydro Superintendent",
    inchargePhone: "+91 98112 00103",
    fleetSummary: "5 De-watering Heavy Pumps • 3 High-Pressure Jetting Tankers",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-SAN-04",
    code: "SAN-YARD",
    name: "Sanitation & Solid Waste Logistics Yard",
    category: "Solid Waste Overflow",
    iconEmoji: "🗑️",
    color: "#F59E0B",
    ward: "South Green Corridor - Ward 9",
    zone: "Zone 9 Bio-Waste Logistics",
    position: [28.6060, 77.1945],
    inchargeName: "Mr. Vikram Rawat",
    inchargeRank: "Zonal Sanitation Director",
    inchargePhone: "+91 98112 00104",
    fleetSummary: "8 Hydraulic Compactors • 12 Tipper Trucks",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-ELEC-05",
    code: "GRID-CNTRL",
    name: "Power Grid & Substation Control Center",
    category: "Electrical & Streetlight",
    iconEmoji: "⚡",
    color: "#F97316",
    ward: "East Ring Ward 8",
    zone: "Zone 8 High-Tension Ring",
    position: [28.6010, 77.2280],
    inchargeName: "Er. Priya Nair",
    inchargeRank: "Grid Maintenance Head",
    inchargePhone: "+91 98112 00105",
    fleetSummary: "4 Cherry Picker Lift Cranes • 2 Mobile Transformer Vans",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-STR-06",
    code: "STRUCT-DIV",
    name: "Structural Safety & Bridge Division",
    category: "Structural Anomaly / Bridge Crack",
    iconEmoji: "🧱",
    color: "#8B5CF6",
    ward: "Cyber Hub Transit Corridor - Ward 12",
    zone: "Zone 12 Viaduct Audit Center",
    position: [28.6290, 77.2020],
    inchargeName: "Dr. K. Ramanathan",
    inchargeRank: "Chief Structural Safety Auditor",
    inchargePhone: "+91 98112 00106",
    fleetSummary: "3 Ultrasonic Flaw Detectors • 2 Scaffolding Support Units",
    coverageRadiusKm: 7.5
  },
  {
    id: "DEPT-PARK-07",
    code: "FOREST-DEPOT",
    name: "Urban Forestry & Public Parks Depot",
    category: "Public Park & Greenery Hazard",
    iconEmoji: "🌳",
    color: "#10B981",
    ward: "South Perimeter Parks - Ward 15",
    zone: "Zone 15 Greenery Maintenance",
    position: [28.6065, 77.1950],
    inchargeName: "Ms. Neha Sundaram",
    inchargeRank: "District Forest Warden",
    inchargePhone: "+91 98112 00107",
    fleetSummary: "3 Wood Chipper Cranes • 6 Hydraulic Chain Teams",
    coverageRadiusKm: 7.5
  }
];

export default function MunicipalOfficerView({
  user,
  activePage = "officer-map",
  setActivePage,
  onSelectIncident
}) {
  const [teams, setTeams] = useState(getMunicipalTeams());
  const [incidents, setIncidents] = useState(getLocalCivicIssues());
  const [memberRequests, setMemberRequests] = useState(getPendingMemberRequests());
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Team on Map
  const [selectedMapTeam, setSelectedMapTeam] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6180, 77.2180]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [rightSidebarTab, setRightSidebarTab] = useState('teams'); // 'teams' | 'defects'
  const [selectedDefect, setSelectedDefect] = useState(null);

  // Allotment Modal State
  const [selectedTaskToAllot, setSelectedTaskToAllot] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [allottedHours, setAllottedHours] = useState(4);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);

  // Add Member to Specific Team Modal State
  const [activeAddMemberTeam, setActiveAddMemberTeam] = useState(null);
  const [memberNameInput, setMemberNameInput] = useState("");
  const [memberRoleInput, setMemberRoleInput] = useState("Field Technician");
  const [memberPhoneInput, setMemberPhoneInput] = useState("");
  const [memberEmployeeId, setMemberEmployeeId] = useState("");

  // New Member Onboarding Request Form State
  const [reqName, setReqName] = useState("");
  const [reqEmpId, setReqEmpId] = useState("");
  const [reqDept, setReqDept] = useState("Road Works & Asphalt Pavement Division");
  const [reqRole, setReqRole] = useState("Pavement Repair Specialist");
  const [reqPhone, setReqPhone] = useState("");
  const [reqTeamId, setReqTeamId] = useState("TEAM-RD-01");
  const [reqWard, setReqWard] = useState("Central District - Ward 4");
  const [reqShift, setReqShift] = useState("Morning Shift (06:00 - 14:00)");
  const [reqSuccessMessage, setReqSuccessMessage] = useState("");

  // Map activePage prop to current view mode
  const currentView =
    activePage === "teams-laid-to-work"
      ? "occupied"
      : activePage === "task-allotment"
      ? "allotment"
      : activePage === "team-details"
      ? "teams"
      : activePage === "add-member"
      ? "new_member"
      : activePage === "officer-map"
      ? "map"
      : activePage === "team-analytics" || activePage === "analytics"
      ? "analytics"
      : "dashboard";

  const [dashboardStatusFilter, setDashboardStatusFilter] = useState("ALL");
  const [selectedTeamForRosterModal, setSelectedTeamForRosterModal] = useState(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30d");

  // Live timer tick every 10 seconds to recalculate late metrics in real time
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const refreshAllData = () => {
    setTeams(getMunicipalTeams());
    setIncidents(getLocalCivicIssues());
    setMemberRequests(getPendingMemberRequests());
  };

  useEffect(() => {
    window.addEventListener("municipal_teams_updated", refreshAllData);
    window.addEventListener("civic_issue_updated", refreshAllData);
    window.addEventListener("nexinfra_incident_created", refreshAllData);
    window.addEventListener("member_requests_updated", refreshAllData);
    window.addEventListener("storage", refreshAllData);

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
      window.removeEventListener("municipal_teams_updated", refreshAllData);
      window.removeEventListener("civic_issue_updated", refreshAllData);
      window.removeEventListener("nexinfra_incident_created", refreshAllData);
      window.removeEventListener("member_requests_updated", refreshAllData);
      window.removeEventListener("storage", refreshAllData);
      unsubscribeFirestore();
    };
  }, []);

  // Team Coordinate Presets for Map Placement
  const teamPositions = {
    "TEAM-RD-01": [28.6180, 77.2250],
    "TEAM-HY-02": [28.6220, 77.2140],
    "TEAM-SW-03": [28.6060, 77.1945],
    "TEAM-EL-04": [28.6010, 77.2280],
    "TEAM-ST-05": [28.6290, 77.2020],
    "TEAM-FR-06": [28.6320, 77.2180]
  };

  // 1. ALLOTTED TASK TEAMS ONLY (Active on jobs)
  const allottedTeamsMarkers = teams
    .filter((team) => team.status === "occupied" && team.activeJob)
    .map((team, idx) => {
      const coords = teamPositions[team.id] || [28.6139 + (idx * 0.006), 77.2090 + (idx * 0.005)];
      const timeMetrics = team.activeJob ? calculateJobTimeMetrics(team.activeJob) : null;

      return {
        position: coords,
        data: {
          ...team,
          type: "MUNICIPAL_TEAM",
          timeMetrics
        }
      };
    });

  // 2. 7 SPECIALIZED DEFECT DEPARTMENT CENTERS (With Incharge & 7.5km Range)
  const departmentCenterMarkers = MUNICIPAL_DEPARTMENT_CENTERS.map((center) => ({
    position: center.position,
    data: {
      ...center,
      type: "DEPARTMENT_CENTER"
    }
  }));

  // 3. SYNCHRONIZED CIVIC DEFECTS & DRONE HOTSPOTS (From Admin's Live Dataset)
  const incidentMapMarkers = incidents
    .filter((inc) => inc.latitude && inc.longitude)
    .map((inc) => ({
      position: [inc.latitude, inc.longitude],
      data: {
        ...inc,
        type: "CIVIC_DEFECT"
      }
    }));

  const allOfficerMapMarkers = [...allottedTeamsMarkers, ...departmentCenterMarkers, ...incidentMapMarkers];

  // Filter unassigned / actionable incidents for Allotment
  const unassignedIncidents = incidents.filter((inc) => {
    const isAlreadyAssigned = teams.some((t) => t.activeJob?.taskId === inc.id);
    return !isAlreadyAssigned && inc.status !== "Resolved";
  });

  const occupiedTeams = teams.filter((t) => t.status === "occupied" && t.activeJob);
  const availableTeams = teams.filter((t) => t.status === "available");

  // Summary Metrics
  const totalOccupiedCount = occupiedTeams.length;
  const totalAvailableCount = availableTeams.length;
  const lateTeamsCount = occupiedTeams.filter((t) => calculateJobTimeMetrics(t.activeJob).isLate).length;
  const totalCrewMembers = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  // Handle Complete Job and Free Team
  const handleCompleteJob = (teamId) => {
    const res = completeJobAndReleaseTeam(teamId);
    if (res.success) {
      if (res.completedTaskId) {
        updateCivicIssueStatus(res.completedTaskId, "Resolved");
        updateComplaintStatus(res.completedTaskId, "Resolved");
      }
      refreshAllData();
    }
  };

  // Handle Allotting Task to Team
  const handleConfirmAllotment = (e) => {
    e.preventDefault();
    if (!selectedTaskToAllot || !selectedTeamId) return;

    const res = allotTeamToTask(selectedTeamId, selectedTaskToAllot, allottedHours);
    if (res.success) {
      updateCivicIssueStatus(selectedTaskToAllot.id, "In Progress");
      updateComplaintStatus(selectedTaskToAllot.id, "In Progress");
      setIsAllotModalOpen(false);
      setSelectedTaskToAllot(null);
      setSelectedTeamId("");
      refreshAllData();
      setActivePage("teams-laid-to-work");
    }
  };

  // Handle Add Member to Team Inline
  const handleAddMemberToTeam = (e) => {
    e.preventDefault();
    if (!activeAddMemberTeam || !memberNameInput.trim()) return;

    addCrewMemberToTeam(activeAddMemberTeam.id, {
      name: memberNameInput.trim(),
      role: memberRoleInput,
      phone: memberPhoneInput || activeAddMemberTeam.leaderPhone,
      employeeId: memberEmployeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`
    });

    setMemberNameInput("");
    setMemberPhoneInput("");
    setMemberEmployeeId("");
    setActiveAddMemberTeam(null);
    refreshAllData();
  };

  // Handle Remove Member
  const handleRemoveMember = (teamId, memberIdx) => {
    if (window.confirm("Remove this crew member from the team?")) {
      removeCrewMemberFromTeam(teamId, memberIdx);
      refreshAllData();
    }
  };

  // Handle Submit New Member Request
  const handleSubmitMemberRequest = (e) => {
    e.preventDefault();
    if (!reqName.trim()) return;

    submitNewMemberRequest({
      name: reqName.trim(),
      employeeId: reqEmpId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: reqDept,
      role: reqRole,
      phone: reqPhone,
      targetTeamId: reqTeamId,
      ward: reqWard,
      shift: reqShift
    });

    setReqSuccessMessage(`✅ Onboarding Request for ${reqName} recorded and staged for deployment!`);
    setReqName("");
    setReqEmpId("");
    setReqPhone("");
    setTimeout(() => setReqSuccessMessage(""), 5000);
    refreshAllData();
  };

  // Handle Quick Approve Member Request
  const handleApproveMember = (reqId) => {
    approveMemberRequest(reqId);
    refreshAllData();
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      
      {/* 1. TOP MUNICIPAL COMMAND HEADER & STATS BAR (SHOWN ONLY ON DASHBOARD) */}
      {currentView === "dashboard" && (
        <div className="bg-[#0B0F19] border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-950/90 border border-amber-500/80 text-amber-300 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  MUNICIPAL OFFICER SUITE • WORKFORCE DISPATCH
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
                  OFFICER: {user?.name || "Field Officer Desk"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                Municipal Workforce & Team Allotment Console
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-sans">
                Live GIS tracking of deployed field repair crews, task duration timers, defect remediation, and ground crew member rosters.
              </p>
            </div>

            {/* Quick Module Triggers */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActivePage("officer-map")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition shadow-md ${
                  currentView === "map"
                    ? "bg-amber-500 text-black font-extrabold shadow-amber-500/30"
                    : "bg-slate-900 border border-amber-500/50 text-amber-300 hover:bg-slate-800"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Live Team GIS Map</span>
              </button>

              <button
                onClick={() => setActivePage("task-allotment")}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition ${
                  currentView === "allotment"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black"
                    : "bg-amber-950/80 border border-amber-500 text-amber-300 hover:bg-amber-900"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Allot Task to Team</span>
              </button>
            </div>
          </div>

          {/* 2. STATS KPI TELEMETRY BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono-tech">
            
            <button
              onClick={() => setActivePage("teams-laid-to-work")}
              className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 hover:border-amber-500/60 transition text-left space-y-1 cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Teams Laid to Work</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{totalOccupiedCount} Units</div>
              <div className="text-[10px] text-slate-500">Actively resolving on site</div>
            </button>

            <button
              onClick={() => setActivePage("task-allotment")}
              className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 hover:border-emerald-500/60 transition text-left space-y-1 cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teams Available</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{totalAvailableCount} Units</div>
              <div className="text-[10px] text-slate-500">Ready for instant dispatch</div>
            </button>

            <button
              onClick={() => setActivePage("teams-laid-to-work")}
              className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 hover:border-red-500/60 transition text-left space-y-1 cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Late Time Overruns</span>
              </div>
              <div className="text-2xl font-extrabold text-red-400">{lateTeamsCount} Late</div>
              <div className="text-[10px] text-slate-500">Exceeding allotted SLA</div>
            </button>

            <button
              onClick={() => setActivePage("team-details")}
              className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 hover:border-cyan-500/60 transition text-left space-y-1 cursor-pointer"
            >
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Crew Members</span>
              </div>
              <div className="text-2xl font-extrabold text-cyan-400">{totalCrewMembers} Personnel</div>
              <div className="text-[10px] text-slate-500">Across {teams.length} Specialized Units</div>
            </button>

          </div>
        </div>
      )}

      {/* 2.5 VIEW 0: MUNICIPAL INCIDENT LOGS DASHBOARD (DETAILS ONLY - NO MAP) */}
      {currentView === "dashboard" && (
        <div className="space-y-6 font-mono-tech">
          
          {/* Header & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <span>📋</span>
                <span>Municipal Incident Logs & Remediation Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Real-time defect tracking, multi-frame AI verification telemetry, SLA turnaround, and team assignment desk.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage("task-allotment")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Allot Task to Team</span>
              </button>

              <button
                onClick={() => setActivePage("officer-map")}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/50 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Switch to Live Map</span>
              </button>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F19] border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: "ALL", label: `All Logs (${incidents.length})` },
                { id: "P1", label: `🚨 Critical P1 (${incidents.filter(i => i.priority === "P1" || i.severity === "Critical").length})` },
                { id: "AI_VERIFIED", label: `🤖 AI Verified (${incidents.filter(i => i.aiVerified).length})` },
                { id: "IN_PROGRESS", label: `🚜 In Progress (${occupiedTeams.length})` },
                { id: "RESOLVED", label: `✅ Resolved (${incidents.filter(i => i.status === "Resolved" || i.status === "Closed").length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    dashboardStatusFilter === tab.id
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold"
                      : "bg-[#070A10] border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, ward, defect..."
                className="bg-[#070A10] border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </div>

          {/* Incident Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {incidents
              .filter((inc) => {
                if (dashboardStatusFilter === "P1") return inc.priority === "P1" || inc.severity === "Critical";
                if (dashboardStatusFilter === "AI_VERIFIED") return Boolean(inc.aiVerified);
                if (dashboardStatusFilter === "IN_PROGRESS") return inc.status === "In Progress" || inc.status === "Dispatched";
                if (dashboardStatusFilter === "RESOLVED") return inc.status === "Resolved" || inc.status === "Closed";
                return true;
              })
              .filter((inc) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  (inc.id || "").toLowerCase().includes(q) ||
                  (inc.title || "").toLowerCase().includes(q) ||
                  (inc.category || "").toLowerCase().includes(q) ||
                  (inc.ward || "").toLowerCase().includes(q) ||
                  (inc.address || "").toLowerCase().includes(q)
                );
              })
              .map((inc) => {
                const isCritical = inc.priority === "P1" || inc.severity === "Critical";
                const isResolved = inc.status === "Resolved" || inc.status === "Closed";
                const assignedTeam = teams.find((t) => t.activeJob?.taskId === inc.id);
                const dateDetected = inc.createdAt ? new Date(inc.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Aug 23, 2026";

                return (
                  <div
                    key={inc.id}
                    className={`bg-[#0B0F19] rounded-2xl border p-5 space-y-4 shadow-xl hover:border-amber-500/50 transition flex flex-col justify-between ${
                      isCritical ? "border-red-500/50" : "border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header: Ticket ID + Status */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 font-mono text-xs">
                          {inc.id}
                        </span>
                        <div className="flex items-center gap-2">
                          {inc.aiVerified && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/60 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>AI VERIFIED</span>
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isResolved
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500"
                              : isCritical
                              ? "bg-red-950 text-red-300 border border-red-500"
                              : "bg-amber-950 text-amber-300 border border-amber-500"
                          }`}>
                            {inc.priority || "P1"}
                          </span>
                        </div>
                      </div>

                      {/* Image Preview if available */}
                      {inc.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden h-36 border border-slate-800">
                          <img
                            src={inc.imageUrl}
                            alt={inc.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/85 text-[10px] text-cyan-300 font-bold border border-cyan-500/60 font-mono">
                            AI {(inc.aiConfidence ? (inc.aiConfidence * 100).toFixed(1) : 96.4)}%
                          </span>
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm font-sans line-clamp-1">
                          {inc.title || inc.category}
                        </h4>
                        <p className="text-xs text-slate-400 font-sans line-clamp-2">
                          {inc.description || "Civic infrastructure defect recorded in municipal database."}
                        </p>
                      </div>

                      {/* Detection Timing & Location Details */}
                      <div className="bg-[#070A10] p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] font-sans">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">🕒 Detected:</span>
                          <strong className="text-amber-300 font-mono">{dateDetected}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">📍 Ward:</span>
                          <span className="text-white truncate max-w-[160px]">{inc.ward || inc.address || "Central Ward 4"}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">🏢 Department:</span>
                          <span className="text-cyan-300 font-mono text-[10px]">{inc.assignedDepartment || "Municipal Public Works"}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">🚜 Allotted Unit:</span>
                          <span className="text-amber-400 font-bold">{assignedTeam ? assignedTeam.name : "Unallotted (Pending)"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {!assignedTeam && !isResolved ? (
                        <button
                          onClick={() => {
                            setSelectedTaskToAllot(inc);
                            setIsAllotModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Allot Team</span>
                        </button>
                      ) : isResolved ? (
                        <div className="flex-1 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-center text-xs">
                          ✓ REMEDIATED & RESOLVED
                        </div>
                      ) : (
                        <div className="flex-1 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold text-center text-xs">
                          🚜 CREW DEPLOYED ON SITE
                        </div>
                      )}

                      <button
                        onClick={() => {
                          try {
                            localStorage.setItem("selectedComplaint", JSON.stringify(inc));
                          } catch (e) {}
                          setActivePage("incident-detail");
                        }}
                        className="px-3 py-2 rounded-xl bg-[#070A10] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect</span>
                      </button>
                    </div>

                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* 2.8 VIEW: WORKFORCE, DEPARTMENT & TASK ANALYSIS */}
      {currentView === "analytics" && (
        <div className="space-y-6 font-mono-tech">
          
          {/* Top Analytics Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Municipal Workforce & Team Performance Analytics</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Data-driven workload analytics, problems solved velocity, department resolution ratios, and team member assignments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {["24h", "7d", "30d"].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setAnalyticsTimeRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                    analyticsTimeRange === range
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                      : "bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* High-Level Analytical KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 space-y-1 shadow-lg">
              <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Total Problems Solved</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-heading">
                {incidents.filter(i => i.status === "Resolved" || i.status === "Closed").length + 286}
              </div>
              <div className="text-[11px] text-emerald-400/90 font-sans flex items-center gap-1">
                <span>↑ 18.4% velocity increase</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/30 space-y-1 shadow-lg">
              <div className="text-xs text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>Active Work Deployments</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-heading">
                {occupiedTeams.length} <span className="text-sm font-normal text-slate-400 font-sans">/ {teams.length} Units</span>
              </div>
              <div className="text-[11px] text-amber-300/90 font-sans">
                {availableTeams.length} standby units ready at depots
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F19] border border-cyan-500/30 space-y-1 shadow-lg">
              <div className="text-xs text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Avg Resolution Time</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-heading">
                1.9 <span className="text-sm font-normal text-slate-400 font-sans">Hours</span>
              </div>
              <div className="text-[11px] text-cyan-300/90 font-sans">
                Standard SLA: 4.0h (52.5% faster)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F19] border border-purple-500/30 space-y-1 shadow-lg">
              <div className="text-xs text-purple-400 font-bold uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Deployed Personnel</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-heading">
                {totalCrewMembers} <span className="text-sm font-normal text-slate-400 font-sans">Crew</span>
              </div>
              <div className="text-[11px] text-purple-300/90 font-sans">
                6 Specialized Municipal Divisions
              </div>
            </div>
          </div>

          {/* Visual Analytical Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Problems Solved by Department Breakdown */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>📊</span>
                  <span>Problems Solved by Department ({analyticsTimeRange.toUpperCase()})</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  96.2% On-Time
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { name: "Sanitation & Waste Logistics", emoji: "🚮", count: 86, rate: "98.2%", color: "#10b981", percent: 94 },
                  { name: "Road & Transport Engineering", emoji: "🛣️", count: 68, rate: "95.6%", color: "#f59e0b", percent: 86 },
                  { name: "Hydro-Grid & Water Works", emoji: "💧", count: 54, rate: "94.1%", color: "#06b6d4", percent: 74 },
                  { name: "Electrical & Streetlight Grid", emoji: "⚡", count: 42, rate: "92.8%", color: "#eab308", percent: 62 },
                  { name: "Urban Forestry & Greenery", emoji: "🌳", count: 32, rate: "96.4%", color: "#22c55e", percent: 48 },
                  { name: "Structural Safety & Bridges", emoji: "🏢", count: 24, rate: "97.0%", color: "#a855f7", percent: 38 },
                ].map((dept) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span>{dept.emoji}</span>
                        <span>{dept.name}</span>
                      </span>
                      <span className="font-mono text-xs">
                        <strong className="text-white">{dept.count} Solved</strong>{" "}
                        <span className="text-emerald-400">({dept.rate} SLA)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${dept.percent}%`, backgroundColor: dept.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Resolution Velocity vs Ingestion Timeline Spline Graph */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>📈</span>
                  <span>Workload Ingestion vs Resolution Velocity</span>
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded">
                  Daily Workload Trend
                </span>
              </div>

              {/* SVG Spline Graph */}
              <div className="h-44 w-full relative pt-2">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="ingestedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Ingested Path Area */}
                  <path
                    d="M 0,90 Q 70,50 140,70 T 280,45 T 420,60 T 500,40 L 500,140 L 0,140 Z"
                    fill="url(#ingestedGrad)"
                  />
                  <path
                    d="M 0,90 Q 70,50 140,70 T 280,45 T 420,60 T 500,40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />

                  {/* Resolved Path Area */}
                  <path
                    d="M 0,110 Q 70,80 140,60 T 280,35 T 420,40 T 500,25 L 500,140 L 0,140 Z"
                    fill="url(#resolvedGrad)"
                  />
                  <path
                    d="M 0,110 Q 70,80 140,60 T 280,35 T 420,40 T 500,25"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                </svg>

                {/* Day Labels */}
                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun (Today)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/80 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-slate-300">Problems Resolved (Avg 32/day)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="text-slate-300">New Tasks Ingested (Avg 26/day)</span>
                </div>
              </div>
            </div>

          </div>

          {/* TEAM-CENTRIC ANALYTICAL CARDS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Municipal Team Work Analytics & Problem Resolution</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Detailed task allocation, work status, solved problems tally, and crew member profiles.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {teams.length} Specialized Teams Tracked
              </span>
            </div>

            {/* Teams Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {teams.map((team, idx) => {
                const isOccupied = team.status === "occupied" && team.activeJob;
                const metrics = team.activeJob ? calculateJobTimeMetrics(team.activeJob) : null;
                const solvedCount = 38 + (idx * 9) + (team.id.charCodeAt(team.id.length - 1) % 15);
                const efficiencyRate = (94.5 + ((idx * 1.3) % 4.5)).toFixed(1);

                return (
                  <div
                    key={team.id}
                    className={`bg-[#0B0F19] rounded-2xl border p-5 space-y-4 shadow-xl hover:border-amber-500/40 transition flex flex-col justify-between ${
                      isOccupied ? "border-amber-500/50" : "border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Team Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="truncate">
                          <span className="font-bold text-white font-sans text-sm block truncate">
                            {team.name}
                          </span>
                          <span className="text-[11px] text-amber-300 font-mono">
                            {team.id} • {team.department || "Municipal Division"}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          isOccupied
                            ? metrics?.isLate ? "bg-red-950 text-red-300 border border-red-500" : "bg-amber-950 text-amber-300 border border-amber-500"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-500"
                        }`}>
                          {isOccupied ? (metrics?.isLate ? `LATE +${metrics.formattedLate}` : "ON WORK") : "AVAILABLE"}
                        </span>
                      </div>

                      {/* Analytics Metrics Box */}
                      <div className="grid grid-cols-2 gap-2 bg-[#070A10] p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Problems Solved:</span>
                          <strong className="text-emerald-400 text-sm font-mono">{solvedCount} Defects</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">SLA Efficiency:</span>
                          <strong className="text-cyan-300 text-sm font-mono">{efficiencyRate}%</strong>
                        </div>
                      </div>

                      {/* Current Assigned Work / Standby Status */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Current Task:</span>
                          {isOccupied ? (
                            <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              <span>Remediating On-Site</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[11px]">
                              ✓ Standby at Depot ({team.ward})
                            </span>
                          )}
                        </div>

                        {team.activeJob ? (
                          <div className="text-white text-[11px] font-bold bg-amber-950/40 p-2 rounded-lg border border-amber-500/40 space-y-1">
                            <div className="truncate">⚠️ {team.activeJob.taskTitle || team.activeJob.category}</div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Elapsed: <strong className="text-white">{metrics?.formattedElapsed}</strong></span>
                              <span>Allotted: <strong className="text-amber-300">{team.activeJob.allottedHours}h</strong></span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Available for instant dispatch across {team.ward}.
                          </p>
                        )}
                      </div>

                      {/* Lead & Personnel Count */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pt-1">
                        <span>Lead: <strong className="text-slate-200">{team.leader}</strong></span>
                        <span className="text-cyan-400 font-mono">{team.members?.length || 4} Crew Members</span>
                      </div>

                    </div>

                    {/* Interactive Button to View Team Members */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTeamForRosterModal(team)}
                        className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 hover:text-amber-300 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Team Members ({team.members?.length || 4})</span>
                      </button>

                      {isOccupied && (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePage("officer-map");
                          }}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer transition shadow-md"
                          title="Locate team on GIS Map"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          <span>Map</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE TEAM MEMBERS MODAL POPUP */}
          {selectedTeamForRosterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono-tech">
              <div className="bg-[#0B0F19] border border-amber-500/50 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      <span>{selectedTeamForRosterModal.name} — Crew Roster</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {selectedTeamForRosterModal.department || "Municipal Division"} • Depot Ward: {selectedTeamForRosterModal.ward}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamForRosterModal(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Supervisor & Contact Banner */}
                <div className="bg-[#070A10] p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs font-sans">
                  <div className="text-slate-300">
                    Lead Supervisor: <strong className="text-amber-300">{selectedTeamForRosterModal.leader}</strong>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Direct Hotline: <strong className="text-emerald-400 font-mono">{selectedTeamForRosterModal.leaderPhone}</strong></span>
                    <span className="text-slate-500 font-mono">Status: {selectedTeamForRosterModal.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {(selectedTeamForRosterModal.members || [
                    { name: selectedTeamForRosterModal.leader, role: "Team Lead & Senior Field Engineer", employeeId: `EMP-${selectedTeamForRosterModal.id}-01`, shift: "Morning Shift (06:00 - 14:00)" },
                    { name: "Sunil Kumar", role: "Heavy Equipment Tech", employeeId: `EMP-${selectedTeamForRosterModal.id}-02`, shift: "Morning Shift (06:00 - 14:00)" },
                    { name: "Vikas Yadav", role: "Field Safety Specialist", employeeId: `EMP-${selectedTeamForRosterModal.id}-03`, shift: "Evening Shift (14:00 - 22:00)" },
                    { name: "Pooja Sharma", role: "Remediation Tech", employeeId: `EMP-${selectedTeamForRosterModal.id}-04`, shift: "Morning Shift (06:00 - 14:00)" }
                  ]).map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#070A10] border border-slate-800/80 flex items-center justify-between text-xs font-sans hover:border-slate-700 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{member.name}</span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500 font-mono font-bold">
                              LEAD
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {member.role || "Municipal Field Tech"}
                        </span>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        <span className="text-cyan-400 font-bold block">{member.employeeId || `EMP-${idx + 101}`}</span>
                        <span className="text-slate-500 text-[10px]">{member.shift || "Morning Shift"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeamForRosterModal(null);
                      setActivePage("add-member");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-sans cursor-pointer transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Member to Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTeamForRosterModal(null)}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-sans uppercase cursor-pointer transition shadow-md"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. VIEW 1: LIVE FIELD TEAMS GIS MAP */}
      {currentView === "map" && (
        <div className="space-y-4 font-mono-tech">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-amber-400" />
                <span>Live Municipal Teams GPS Radar Map</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-time geographic pinpoints of all municipal field units (🚜), active work duration timers, and defect remediation.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {/* Heatmap ON / OFF Button */}
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
                  showHeatmap
                    ? "bg-amber-950/90 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/25"
                    : "bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-white"
                }`}
                title="Toggle 7.5km Department Service Heatmap Radius"
              >
                <Flame className={`w-3.5 h-3.5 ${showHeatmap ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
                <span>Heatmap: {showHeatmap ? "ON (7.5km)" : "OFF"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            
            {/* 1. LEFT SIDE: INCIDENT LOGS & TELEMETRY PANEL */}
            <div className="xl:col-span-4 bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 max-h-[580px] overflow-y-auto order-2 xl:order-1">
              
              <div className="space-y-3">
                
                {/* 3-Tab Right Menu Navigation */}
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#070A10] border border-slate-800 p-1.5 font-mono-tech text-xs">
                  
                  {/* Tab 1: Incident Details (Active default) */}
                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("defects")}
                    className={`py-2 px-1 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] truncate ${
                      rightSidebarTab === "defects"
                        ? "bg-red-500 text-white shadow-md shadow-red-500/20 font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                    title="Civic Defect Pinpoints"
                  >
                    <span>📍</span>
                    <span className="truncate">Incidents ({incidents.length})</span>
                  </button>

                  {/* Tab 2: Teams Location */}
                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("teams")}
                    className={`py-2 px-1 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] truncate ${
                      rightSidebarTab === "teams"
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                    title="Municipal Field Units"
                  >
                    <span>🚜</span>
                    <span className="truncate">Active Teams ({occupiedTeams.length})</span>
                  </button>

                  {/* Tab 3: Department Locations */}
                  <button
                    type="button"
                    onClick={() => setRightSidebarTab("departments")}
                    className={`py-2 px-1 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] truncate ${
                      rightSidebarTab === "departments"
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                    title="Specialized Department Headquarters"
                  >
                    <span>🏢</span>
                    <span className="truncate">Depts ({MUNICIPAL_DEPARTMENT_CENTERS.length})</span>
                  </button>

                </div>

                {/* TAB 1: INCIDENT DETAILS */}
                {rightSidebarTab === "defects" && (
                  <div className="space-y-3">
                    {incidents.slice(0, 25).map((inc) => {
                      const isSelected = selectedDefect?.id === inc.id;
                      const isCritical = inc.priority === "P1" || inc.severity === "Critical";
                      const isResolved = inc.status === "Resolved" || inc.status === "Closed";

                      return (
                        <div
                          key={inc.id}
                          onClick={() => {
                            setSelectedDefect(inc);
                            setSelectedMapTeam(null);
                            setSelectedCenter(null);
                            if (inc.latitude && inc.longitude) {
                              setMapCenter([inc.latitude, inc.longitude]);
                              setMapZoom(16);
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-xs transition cursor-pointer space-y-2 ${
                            isSelected
                              ? "bg-red-950/70 border-red-400 shadow-md shadow-red-950/40"
                              : "bg-[#070A10] border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-400 font-mono text-[11px] truncate">
                              {inc.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isResolved
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : isCritical
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : "bg-amber-950 text-amber-300 border border-amber-800"
                            }`}>
                              {inc.priority || "P1"}
                            </span>
                          </div>

                          <div className="font-bold text-white text-xs line-clamp-1">
                            {inc.title || inc.category}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate">{inc.ward || inc.address || "City Sector"}</span>
                            <span className="text-cyan-400 font-bold shrink-0">
                              {inc.status || "AI Verified"}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span>SLA: {inc.slaHours || 4}h</span>
                            <span className="text-red-400 font-bold">📍 Locate Pinpoint</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 2: TEAMS LOCATION (ONLY ACTIVE ON-SITE TEAMS PLOTTED ON LIVE MAP) */}
                {rightSidebarTab === "teams" && (
                  <div className="space-y-3">
                    {teams.map((team) => {
                      const isOccupied = team.status === "occupied" && team.activeJob;
                      const metrics = team.activeJob ? calculateJobTimeMetrics(team.activeJob) : null;
                      const isSelected = selectedMapTeam?.id === team.id;

                      return (
                        <div
                          key={team.id}
                          onClick={() => {
                            if (isOccupied) {
                              setSelectedMapTeam(team);
                              setSelectedCenter(null);
                              setSelectedDefect(null);
                              const pos = teamPositions[team.id];
                              if (pos) {
                                setMapCenter(pos);
                                setMapZoom(15);
                              }
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-xs transition space-y-2 ${
                            isOccupied
                              ? isSelected
                                ? "bg-amber-950/70 border-amber-400 shadow-md shadow-amber-950/40 cursor-pointer"
                                : "bg-[#070A10] border-amber-500/50 hover:border-amber-400 cursor-pointer"
                              : "bg-[#070A10]/60 border-slate-800/80 opacity-70 cursor-default"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white font-sans truncate flex items-center gap-1.5">
                              <span>🚜</span>
                              <span>{team.name}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isOccupied
                                ? metrics?.isLate ? "bg-red-950 text-red-300 border border-red-500" : "bg-amber-950 text-amber-300 border border-amber-500"
                                : "bg-slate-900 text-slate-400 border border-slate-700"
                            }`}>
                              {isOccupied ? (metrics?.isLate ? `LATE +${metrics.formattedLate}` : "ON WORK") : "AT BASE DEPOT"}
                            </span>
                          </div>

                          {isOccupied ? (
                            <div className="space-y-1 text-[11px]">
                              <div className="text-amber-300 font-bold line-clamp-1">
                                ⚠️ Solving: {team.activeJob.taskTitle || team.activeJob.category}
                              </div>
                              <div className="text-slate-400 flex items-center justify-between">
                                <span>Elapsed: <strong className="text-white">{metrics?.formattedElapsed}</strong></span>
                                <span>Allotted: <strong className="text-amber-300">{team.activeJob.allottedHours}h</strong></span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-sans">
                              🏠 Standby at base depot ({team.ward}) • Not on Live Map
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span>Lead: {team.leader}</span>
                            {isOccupied ? (
                              <span className="text-amber-400 font-bold">📍 Pan to On-Site Unit</span>
                            ) : (
                              <span className="text-slate-500 italic">Standby at Base</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: DEPARTMENT LOCATIONS */}
                {rightSidebarTab === "departments" && (
                  <div className="space-y-3">
                    {MUNICIPAL_DEPARTMENT_CENTERS.map((dept) => {
                      const isSelected = selectedCenter?.id === dept.id;

                      return (
                        <div
                          key={dept.id}
                          onClick={() => {
                            setSelectedCenter(dept);
                            setSelectedMapTeam(null);
                            setSelectedDefect(null);
                            if (dept.position) {
                              setMapCenter(dept.position);
                              setMapZoom(15);
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-xs transition cursor-pointer space-y-2 ${
                            isSelected
                              ? "bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950/40"
                              : "bg-[#070A10] border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white font-sans truncate flex items-center gap-1.5">
                              <span>{dept.iconEmoji || "🏢"}</span>
                              <span className="truncate">{dept.name}</span>
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: `${dept.color}20`, color: dept.color, border: `1px solid ${dept.color}60` }}
                            >
                              7.5km Radius
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <div className="text-slate-300">
                              In-Charge: <strong className="text-amber-300">{dept.inchargeName}</strong> ({dept.inchargeRank})
                            </div>
                            <div className="text-slate-400 flex items-center justify-between">
                              <span>Hotline: <strong className="text-emerald-400">{dept.inchargePhone}</strong></span>
                              <span className="text-slate-500">{dept.ward}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span className="truncate">{dept.fleetSummary}</span>
                            <span className="text-cyan-400 font-bold shrink-0">📍 Locate HQ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Selected Pinpoint Summary Card */}
              {(selectedMapTeam || selectedDefect || selectedCenter) && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs font-mono-tech shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                      <span>🎯 Pinpoint Focused</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMapTeam(null);
                        setSelectedDefect(null);
                        setSelectedCenter(null);
                      }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {selectedCenter && (
                    <div className="text-[11px] text-cyan-300 space-y-0.5 font-sans">
                      <div>🏢 <strong>{selectedCenter.name}</strong></div>
                      <div className="text-slate-400">Incharge: {selectedCenter.inchargeName} ({selectedCenter.inchargePhone})</div>
                    </div>
                  )}
                  {selectedMapTeam && (
                    <div className="text-[11px] text-amber-300 space-y-0.5 font-sans">
                      <div>🚜 <strong>{selectedMapTeam.name}</strong></div>
                      <div className="text-slate-400">Leader: {selectedMapTeam.leader} ({selectedMapTeam.leaderPhone})</div>
                    </div>
                  )}
                  {selectedDefect && (
                    <div className="text-[11px] text-red-300 space-y-0.5 font-sans">
                      <div>📍 <strong>{selectedDefect.title || selectedDefect.category}</strong></div>
                      <div className="text-slate-400">{selectedDefect.ward || selectedDefect.address} • SLA: {selectedDefect.slaHours || 4}h</div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 2. RIGHT SIDE: LIVE GIS MAP VIEWPORT CONTAINER */}
            <div className="xl:col-span-8 bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[580px] relative order-1 xl:order-2">
              <LeafletMap
                center={mapCenter}
                zoom={mapZoom}
                markers={allOfficerMapMarkers}
                showHeatmap={showHeatmap}
                onMarkerClick={(data) => {
                  if (data?.type === "MUNICIPAL_TEAM") {
                    setSelectedMapTeam(data);
                    setSelectedCenter(null);
                  } else if (data?.type === "DEPARTMENT_CENTER") {
                    setSelectedCenter(data);
                    setSelectedMapTeam(null);
                  }
                }}
              />

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-[400] bg-black/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl text-[11px] space-y-1.5 shadow-2xl">
                <div className="font-bold text-white uppercase text-[10px] border-b border-slate-800 pb-1 flex justify-between items-center">
                  <span>GIS Map Legend</span>
                  <span className="text-amber-400 font-mono">7.5km Radius</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span>🚜</span>
                  <span>Allotted Task Teams (On-Site)</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <span>🏢</span>
                  <span>Defect Centers (Incharge & Fleet)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] pt-0.5">
                  <span className="w-3 h-3 rounded-full border border-cyan-400 bg-cyan-500/20" />
                  <span>7.5 km Coverage Radius Circle</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. VIEW 2: TEAMS LAID TO WORK (ACTIVE DEPLOYMENTS) */}
      {currentView === "occupied" && (
        <div className="space-y-4 font-mono-tech">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <span>Active Field Deployments & Real-Time Timers</span>
            </h2>
            <span className="text-xs text-slate-400">
              Auto-refreshed every 10s • Real-time delay calculations
            </span>
          </div>

          {occupiedTeams.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white font-heading">No Teams Currently Laid to Work</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All municipal crews are in available standby status. Go to Task Allotment to assign pending civic defects.
              </p>
              <button
                onClick={() => setActivePage("task-allotment")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase cursor-pointer"
              >
                Go to Task Allotment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {occupiedTeams.map((team) => {
                const metrics = calculateJobTimeMetrics(team.activeJob);
                const progressPct = Math.min(100, Math.round((metrics.elapsedMinutes / (metrics.allottedMinutes || 1)) * 100));

                return (
                  <div
                    key={team.id}
                    className={`p-6 rounded-2xl border bg-[#0B0F19] shadow-xl space-y-4 relative overflow-hidden ${
                      metrics.isLate
                        ? "border-red-500/80 shadow-red-950/30"
                        : "border-amber-500/60 shadow-amber-950/20"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base font-sans">{team.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-amber-300">
                            {team.id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{team.department}</div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 ${
                        metrics.isLate
                          ? "bg-red-950 border border-red-500 text-red-300 animate-pulse"
                          : "bg-amber-950 border border-amber-500 text-amber-300"
                      }`}>
                        <Timer className="w-3.5 h-3.5" />
                        <span>{metrics.isLate ? `LATE BY ${metrics.formattedLate}` : "ON TRACK"}</span>
                      </span>
                    </div>

                    {/* Active Job Details */}
                    <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">TASK: {team.activeJob.taskId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-500/50">
                          {team.activeJob.priority || "P1"} Hazard
                        </span>
                      </div>
                      <div className="text-white font-bold text-sm font-sans">{team.activeJob.taskTitle}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{team.activeJob.address || team.activeJob.ward}</span>
                      </div>
                    </div>

                    {/* Live Elapsed vs Allotted Time Bar */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Elapsed: <strong className="text-white">{metrics.formattedElapsed}</strong></span>
                        <span>Allotted SLA: <strong className="text-amber-300">{team.activeJob.allottedHours} Hours</strong></span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            metrics.isLate ? "bg-red-500" : "bg-gradient-to-r from-amber-500 to-amber-300"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Progress: {progressPct}%</span>
                        <span className={metrics.isLate ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {metrics.isLate ? `Overrun: +${metrics.formattedLate}` : `Remaining: ${metrics.formattedRemaining}`}
                        </span>
                      </div>
                    </div>

                    {/* Crew Lead & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <span>Lead: <strong>{team.leader}</strong> ({team.members?.length || 4} Crew)</span>
                      </div>

                      <button
                        onClick={() => handleCompleteJob(team.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Mark Work Completed & Release Team</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW 3: TEAM ALLOTMENT (TASK DISPATCH ENGINE) */}
      {currentView === "allotment" && (
        <div className="space-y-4 font-mono-tech">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>Task Allotment & Workforce Dispatch Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Select an unassigned civic defect and assign it to an available municipal repair unit.
              </p>
            </div>

            <div className="text-xs text-emerald-400 font-mono-tech px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50">
              {availableTeams.length} Municipal Units Available for Dispatch
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-[#070A10] flex items-center justify-between text-xs font-mono-tech text-slate-400 font-bold uppercase">
              <span>Unassigned Incident / Grievance</span>
              <span>Allotment Action</span>
            </div>

            {unassignedIncidents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-white">All Active Incidents Assigned!</p>
                <p className="text-xs">No pending civic defects currently awaiting workforce allotment.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {unassignedIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-mono-tech">
                        <span className="font-bold text-amber-400 text-xs">{incident.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
                          {incident.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/80 border border-red-500/60 text-red-300">
                          {incident.priority || "P1"} Hazard
                        </span>
                      </div>

                      <h4 className="text-white font-bold font-sans text-sm">{incident.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono-tech">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{incident.address || incident.ward}</span>
                        </span>
                        <span>SLA: <strong className="text-amber-300">{incident.slaHours || 4}h</strong></span>
                        <span>Dept: <strong className="text-slate-300">{incident.assignedDepartment || "Road Works"}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTaskToAllot(incident);
                        setSelectedTeamId(availableTeams[0]?.id || "");
                        setAllottedHours(incident.slaHours || 4);
                        setIsAllotModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-black" />
                      <span>Allot Team to Work</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. VIEW 4: TEAM DETAILS & MEMBER ROSTERS */}
      {currentView === "teams" && (
        <div className="space-y-4 font-mono-tech">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Municipal Field Teams & Member Rosters</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed roster of municipal units, equipment, assigned wards, and active member profiles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-xl space-y-4 relative"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base font-sans">{team.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-amber-300">
                        {team.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{team.department}</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                    team.status === "occupied"
                      ? "bg-amber-950 border border-amber-500 text-amber-300"
                      : "bg-emerald-950 border border-emerald-500 text-emerald-300"
                  }`}>
                    {team.status === "occupied" ? "⚡ LAID TO WORK" : "✅ AVAILABLE"}
                  </span>
                </div>

                {/* Team Info Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#070A10] border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Crew Leader</span>
                    <div className="text-white font-bold truncate">{team.leader}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{team.leaderPhone}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070A10] border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Assigned Ward</span>
                    <div className="text-amber-300 font-bold truncate">{team.ward}</div>
                    <div className="text-slate-400 text-[11px]">{team.equipment?.length || 2} Heavy Rigs</div>
                  </div>
                </div>

                {/* Members Roster List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                    <span>Crew Members ({team.members?.length || 0})</span>
                    <button
                      onClick={() => {
                        setActiveAddMemberTeam(team);
                        setMemberNameInput("");
                        setMemberRoleInput("Field Technician");
                      }}
                      className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/60 rounded-xl bg-[#070A10] border border-slate-800/80 overflow-hidden">
                    {team.members?.map((member, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/40 transition"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                            {member.name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white font-sans">{member.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono-tech">
                              {member.role || "Technician"}
                            </span>
                          </div>
                        </div>

                        {team.members.length > 2 && (
                          <button
                            onClick={() => handleRemoveMember(team.id, mIdx)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition"
                            title="Remove member from team"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment Fleet */}
                <div className="text-[11px] text-slate-400 font-sans space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] font-mono-tech">Deployed Equipment:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.equipment?.map((eq, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                        🚜 {eq}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. VIEW 5: ADD NEW MEMBER & CREW SIGNUP REQUESTS */}
      {currentView === "new_member" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono-tech">
          
          {/* Left Form: Register New Crew Member */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0B0F19] border border-amber-500/50 rounded-2xl p-6 shadow-xl space-y-5">
              
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>Register New Crew Member / Signup Request</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Onboard new municipal technicians, engineers, heavy machinery operators, and assign them to active units.
                </p>
              </div>

              {reqSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{reqSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitMemberRequest} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Rameshwar Dayal"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Employee / Badge ID</label>
                    <input
                      type="text"
                      value={reqEmpId}
                      onChange={(e) => setReqEmpId(e.target.value)}
                      placeholder="e.g. EMP-7821"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Department Division</label>
                    <select
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option>Road Works & Asphalt Pavement Division</option>
                      <option>Municipal Hydro & Water Supply Grid</option>
                      <option>Sanitation & Solid Waste Logistics Unit</option>
                      <option>Municipal Power & Street Lighting Grid</option>
                      <option>Structural Engineering & Bridge Safety Division</option>
                      <option>Urban Forestry & Public Parks Department</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Role / Specialization</label>
                    <input
                      type="text"
                      required
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value)}
                      placeholder="e.g. Compactor Operator, Leak Sonar Tech"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      placeholder="e.g. +91 98123-45678"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold uppercase">Target Assigned Unit</label>
                    <select
                      value={reqTeamId}
                      onChange={(e) => setReqTeamId(e.target.value)}
                      className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4 text-black" />
                  <span>Submit Member Onboarding & Assign to Crew</span>
                </button>

              </form>
            </div>
          </div>

          {/* Right Panel: Pending Signup & Approval Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-amber-400" />
                  <span>Crew Signup & Verification Queue</span>
                </h3>
                <span className="text-xs text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded">
                  {memberRequests.length} Pending
                </span>
              </div>

              {memberRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white">All Signup Requests Approved!</p>
                  <p>New technician submissions will appear here for officer approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-[#070A10] border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-sans text-sm">{req.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-500/60 text-amber-300">
                          {req.employeeId}
                        </span>
                      </div>

                      <div className="text-slate-400 text-[11px] space-y-0.5">
                        <div>Role: <strong className="text-slate-200">{req.role}</strong></div>
                        <div>Dept: <span className="text-slate-300">{req.department}</span></div>
                        <div>Assigned Team: <strong className="text-amber-400">{req.targetTeamId}</strong></div>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => handleApproveMember(req.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approve & Add to Roster</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: TASK ALLOTMENT MODAL */}
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
              
              {/* Select Team */}
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

              {/* Allotted Hours */}
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

      {/* MODAL 2: INLINE ADD MEMBER TO SPECIFIC TEAM MODAL */}
      {activeAddMemberTeam && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
          <div className="bg-[#0B0F19] border border-amber-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4 animate-hero-entrance">
            
            <button
              onClick={() => setActiveAddMemberTeam(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500 flex items-center justify-center text-amber-400">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Add Member to {activeAddMemberTeam.name}
                </h3>
                <p className="text-xs text-amber-400">{activeAddMemberTeam.id}</p>
              </div>
            </div>

            <form onSubmit={handleAddMemberToTeam} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold uppercase">Member Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberNameInput}
                  onChange={(e) => setMemberNameInput(e.target.value)}
                  placeholder="e.g. Sunil Gavaskar"
                  className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold uppercase">Role / Specialization</label>
                <input
                  type="text"
                  required
                  value={memberRoleInput}
                  onChange={(e) => setMemberRoleInput(e.target.value)}
                  placeholder="e.g. Heavy Roller Operator, Safety Marshall"
                  className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={memberPhoneInput}
                  onChange={(e) => setMemberPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98112-99001"
                  className="w-full bg-[#070A10] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAddMemberTeam(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Add to Crew</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
