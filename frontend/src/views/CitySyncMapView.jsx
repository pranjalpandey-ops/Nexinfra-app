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
  Maximize2,
  Minimize2,
  Radio,
  Plane,
  ShieldAlert,
  Send,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  RefreshCw,
  Volume2,
  MessageSquareHeart,
  Camera,
  Trash2
} from "lucide-react";

import LeafletMap from "../components/LeafletMap";
import DisasterBroadcastModal from "../components/DisasterBroadcastModal";
import CitizenFeedbackModal from "../components/CitizenFeedbackModal";
import DeleteIncidentModal from "../components/DeleteIncidentModal";
import OfficerOverrideModal from "../components/OfficerOverrideModal";
import { getLocalCivicIssues, upvoteIssue, updateCivicIssueStatus } from "../services/civicDb";
import { subscribeToComplaints } from "../services/getComplaints";

export const mockDroneStations = [
  {
    id: "UAV-HUB-01",
    type: "DRONE_STATION",
    title: "Autonomous Drone Station Alpha",
    name: "Sector 62 Autonomous UAV Base",
    code: "UAV HUB ALPHA",
    category: "Autonomous Drone Hangar",
    ward: "Central District - Ward 4",
    address: "SkyPort Hub Alpha, Sector 62 Expressway",
    latitude: 28.6180,
    longitude: 77.2250,
    dronesAvailable: 4,
    dronesPatrolling: 2,
    hangarCapacity: 6,
    batteryStatus: "98% Grid Charged",
    status: "OPERATIONAL",
    rangeKm: "15.0 km",
    launchPad: "Pad A-1 & A-2 Active",
    assignedUnit: "Alpha SkyRecon Wing",
    slaHours: 0,
    upvotes: 0,
    description: "Automated rapid-deployment UAV launch hangar with AI thermal reconnaissance cameras and fast-swap charging pad."
  },
  {
    id: "UAV-HUB-02",
    type: "DRONE_STATION",
    title: "Cyber Hub Autonomous UAV Station",
    name: "Cyber Hub Tactical UAV Hangar",
    code: "UAV HUB BRAVO",
    category: "Autonomous Drone Hangar",
    ward: "Cyber Hub - Ward 12",
    address: "SkyPort Hangar Bravo, Cyber City Radial Corridor",
    latitude: 28.6100,
    longitude: 77.2020,
    dronesAvailable: 3,
    dronesPatrolling: 1,
    hangarCapacity: 5,
    batteryStatus: "100% Full",
    status: "OPERATIONAL",
    rangeKm: "15.0 km",
    launchPad: "Pad B-1 Standby",
    assignedUnit: "Bravo Grid Overwatch",
    slaHours: 0,
    upvotes: 0,
    description: "High-altitude surveillance and traffic bottleneck scanning station equipped with autonomous return-to-base docking."
  },
  {
    id: "UAV-HUB-03",
    type: "DRONE_STATION",
    title: "North Green Corridor Rapid Drone Dock",
    name: "North Greenway UAV Patrol Base",
    code: "UAV HUB CHARLIE",
    category: "Autonomous Drone Hangar",
    ward: "North Green Corridor - Ward 2",
    address: "Greenway Base Pad C, North Logistics Junction",
    latitude: 28.6320,
    longitude: 77.2180,
    dronesAvailable: 5,
    dronesPatrolling: 2,
    hangarCapacity: 8,
    batteryStatus: "94% Solar Charged",
    status: "OPERATIONAL",
    rangeKm: "15.0 km",
    launchPad: "Pad C-1 & C-2 Active",
    assignedUnit: "Charlie Tactical Fleet",
    slaHours: 0,
    upvotes: 0,
    description: "Solar-assisted perimeter drone docking bay providing 24/7 autonomous municipal surveillance and disaster reconnaissance."
  }
];

export default function CitySyncMapView({ setActivePage, viewMode = "auto", user }) {
  const isAdmin = user?.role === "admin";
  const isOfficer = user?.role === "officer";
  const isPrivileged = isAdmin || isOfficer;
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filter & Layer States
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showUavTrails, setShowUavTrails] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [tileMode, setTileMode] = useState("dark"); // dark | light | satellite
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [officerOverrideTarget, setOfficerOverrideTarget] = useState(null);

  // Panel View Controls
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

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
        const merged = [...firestoreData, ...localData.filter((l) => !firestoreData.some((f) => f.id === l.id))];
        setIssues(merged);
      }
    });

    return unsubscribe;
  }, []);

  const handleUpvote = (issueId, e) => {
    if (e) e.stopPropagation();
    const updated = upvoteIssue(issueId, user?.email || "operator.console@nexinfra.org");
    setIssues(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      const found = updated.find((i) => i.id === issueId);
      if (found) setSelectedIssue(found);
    }
  };

  const handleStatusUpdate = (issueId, newStatus, e) => {
    if (e) e.stopPropagation();
    const issue = issues.find((i) => i.id === issueId) || selectedIssue;
    const isCurrentInProgress = (issue?.status || "").toLowerCase() === "in progress";

    // Admin requires Municipal Officer Permission to override active In Progress tasks
    if (isCurrentInProgress && !isOfficer && isAdmin && newStatus !== "In Progress") {
      setOfficerOverrideTarget({ incident: issue, targetStatus: newStatus });
      return;
    }

    const updated = updateCivicIssueStatus(issueId, newStatus);
    setIssues(updated);
    if (selectedIssue && selectedIssue.id === issueId) {
      const found = updated.find((i) => i.id === issueId);
      if (found) setSelectedIssue(found);
    }
  };

  const handleConfirmOfficerOverride = ({ incidentId, targetStatus }) => {
    const updated = updateCivicIssueStatus(incidentId, targetStatus);
    setIssues(updated);
    if (selectedIssue && selectedIssue.id === incidentId) {
      const found = updated.find((i) => i.id === incidentId);
      if (found) setSelectedIssue(found);
    }
    setOfficerOverrideTarget(null);
  };

  // Filter Logic
  const filteredIssues = issues.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.title || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.address || "").toLowerCase().includes(q) ||
      (item.ward || "").toLowerCase().includes(q) ||
      (item.id || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    if (selectedWard !== "ALL" && item.ward !== selectedWard) return false;
    if (selectedPriority !== "ALL" && item.priority !== selectedPriority) return false;
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
      : [28.6139, 77.209];

  // Tile URL mapping
  const tileUrls = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  const mapMarkers = [
    ...filteredIssues
      .filter((issue) => issue.latitude && issue.longitude)
      .map((issue) => {
        const isCritical = issue.priority === "P1" || issue.priority === "High";
        const isResolved = issue.status === "Resolved";
        const pinColor = isResolved ? "#10B981" : isCritical ? "#EF4444" : issue.priority === "P2" ? "#F97316" : "#FACC15";

        return {
          position: [issue.latitude, issue.longitude],
          color: pinColor,
          data: issue,
        };
      }),
    ...(isPrivileged
      ? mockDroneStations.map((st) => ({
          position: [st.latitude, st.longitude],
          color: "#00F0FF",
          data: st,
        }))
      : []),
  ];

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
    <div className="h-[calc(100vh-4rem)] w-screen bg-[#07090E] text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* 1. Top Command Center Telemetry & Control Bar */}
      <header className="border-b border-slate-800 bg-[#090D16]/95 px-4 sm:px-6 py-3 shrink-0 backdrop-blur-md z-20">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
          
          {/* Title & Live Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-400 cyan-glow-sm shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-tight">
                  CitySync Command Console & AI GIS Radar
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-mono-tech font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE 42ms</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics & Command Controls */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono-tech text-xs w-full xl:w-auto justify-between xl:justify-end">
            
            {/* Tile Layer Selector */}
            <div className="flex items-center bg-[#070A10] border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setTileMode("dark")}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  tileMode === "dark" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60" : "text-slate-400 hover:text-white"
                }`}
              >
                Dark GIS
              </button>
              <button
                onClick={() => setTileMode("satellite")}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  tileMode === "satellite" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60" : "text-slate-400 hover:text-white"
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setTileMode("light")}
                className={`px-2.5 py-1 rounded-lg transition font-bold ${
                  tileMode === "light" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60" : "text-slate-400 hover:text-white"
                }`}
              >
                Light
              </button>
            </div>

            {/* Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
                showHeatmap
                  ? "bg-amber-950/80 border-amber-400 text-amber-300 cyan-glow-sm shadow-md"
                  : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Toggle Cluster Heatmap Intensity"
            >
              <Flame className={`w-3.5 h-3.5 ${showHeatmap ? "text-amber-400 animate-pulse" : ""}`} />
              <span>{showHeatmap ? "Heatmap ON" : "Heatmap"}</span>
            </button>

            {/* UAV Drone Recon Loop Toggle - Only for Admin & Officers */}
            {isPrivileged && (
              <button
                onClick={() => setShowUavTrails(!showUavTrails)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
                  showUavTrails
                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 cyan-glow-sm shadow-md"
                    : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
                }`}
                title="Toggle UAV Drone Recon Trails"
              >
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                <span>UAV Patrols</span>
              </button>
            )}

            {/* Level 5 Early Warning Broadcast Trigger - Only for Admin & Officers */}
            {isPrivileged && (
              <button
                onClick={() => setIsDisasterModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/90 border border-red-500 text-red-300 hover:bg-red-900 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                <span>🚨 LEVEL 5 WARNING</span>
              </button>
            )}

            {/* Track Issue Button - Only for Citizens */}
            {!isPrivileged && (
              <button
                onClick={() => {
                  if (activeIssue) {
                    openIncidentDetails(activeIssue);
                  } else {
                    setActivePage("incident-detail");
                  }
                }}
                className="px-3.5 py-1.5 bg-[#070A10] border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
                title="Track Incident by Ticket ID"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Track Issue</span>
              </button>
            )}

            {/* Report Defect Button */}
            <button
              onClick={() => setActivePage("report-issue")}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-cyan-200 text-black rounded-xl font-extrabold text-xs uppercase cyan-glow-sm flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ REPORT DEFECT</span>
            </button>
          </div>

        </div>

        {/* Real-time KPI Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 font-mono-tech text-xs">
          <div className="flex items-center gap-2 bg-[#070A10] px-3 py-1 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">Total Tracked:</span>
            <strong className="text-cyan-300 font-bold">{totalCount}</strong>
          </div>

          <div className="flex items-center gap-2 bg-[#070A10] px-3 py-1 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400">P1 Critical:</span>
            <strong className="text-red-400 font-bold">{criticalCount}</strong>
          </div>

          <div className="flex items-center gap-2 bg-[#070A10] px-3 py-1 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">In Remediation:</span>
            <strong className="text-amber-300 font-bold">{inProgressCount}</strong>
          </div>

          <div className="flex items-center gap-2 bg-[#070A10] px-3 py-1 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Citizen Resolved:</span>
            <strong className="text-emerald-400 font-bold">{resolvedCount}</strong>
          </div>
        </div>
      </header>

      {/* 2. Main 3-Column Tactical Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COLUMN: Live Incident Queue & Triage List */}
        <div
          className={`h-full border-r border-slate-800 bg-[#090D16] flex flex-col shrink-0 transition-all duration-300 z-10 ${
            isLeftPanelOpen ? "w-80 sm:w-96" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          {/* Search & Quick Category Filters */}
          <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-[#070A10]">
            <div className="flex items-center gap-2 bg-[#0E131F] border border-slate-800 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, defect, ward, address..."
                className="bg-transparent flex-1 outline-none text-white placeholder:text-slate-500 text-xs font-mono-tech"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Priority Filter Pills */}
            <div className="flex items-center gap-1.5 font-mono-tech text-[11px] overflow-x-auto pb-1">
              {["ALL", "P1", "P2", "P3"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    selectedPriority === p
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500"
                      : "bg-[#0E131F] text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {p === "ALL" ? "All Tiers" : p}
                </button>
              ))}
              
              <button
                onClick={() => setSelectedStatus(selectedStatus === "Resolved" ? "ALL" : "Resolved")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                  selectedStatus === "Resolved"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500"
                    : "bg-[#0E131F] text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Incident Queue Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono-tech text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>ACTIVE QUEUE ({filteredIssues.length})</span>
              <span>AUTO-SORTED BY SLA</span>
            </div>

            {filteredIssues.map((issue) => {
              const isSelected = activeIssue?.id === issue.id;
              const isCritical = issue.priority === "P1" || issue.priority === "High";

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-400 cyan-glow-sm shadow-md"
                      : "bg-[#0B0F19] border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{issue.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : issue.priority === "P2"
                          ? "bg-orange-950 text-orange-300 border border-orange-800"
                          : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                      }`}
                    >
                      {issue.priorityLabel || issue.priority}
                    </span>
                  </div>

                  <h4 className="text-white font-sans font-bold text-xs line-clamp-1">
                    {issue.title}
                  </h4>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{issue.ward || issue.address}</span>
                    </span>
                    <span className="text-cyan-300 font-bold">
                      SLA: {issue.slaHours || 4}h
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredIssues.length === 0 && (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <AlertTriangle className="w-6 h-6 mx-auto text-slate-600" />
                <p>No incidents match current filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Left Panel Collapse Toggle Button */}
        <button
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          className="absolute top-4 left-4 z-[450] p-2 rounded-xl bg-[#090D16]/90 border border-slate-700 text-slate-300 hover:text-cyan-400 backdrop-blur-md shadow-lg cursor-pointer"
          title={isLeftPanelOpen ? "Collapse Incident Queue" : "Expand Incident Queue"}
        >
          {isLeftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* CENTER COLUMN: Tactical Interactive Leaflet Map */}
        <div className="flex-1 h-full relative bg-[#070A12] min-w-0">
          <LeafletMap
            center={mapCenter}
            zoom={14}
            markers={mapMarkers}
            showHeatmap={showHeatmap}
            tileUrl={tileUrls[tileMode] || tileUrls.dark}
            onMarkerClick={(item) => {
              setSelectedIssue(item);
            }}
          />

          {/* Floating Map Legend */}
          <div className="absolute top-4 right-4 z-[400] bg-[#070A12]/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 font-mono-tech shadow-2xl hidden md:block">
            <div className="text-slate-300 font-bold mb-1 border-b border-slate-800 pb-1">
              GIS Severity Pins
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>🔴 P1: Critical Safety Hazard</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>🟠 P2: High Priority</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>🟡 P3: Medium/Low</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>🟢 Resolved / Citizen Confirmed</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tactical Incident Telemetry HUD & Action Panel */}
        {activeIssue && (
          <div
            className={`h-full border-l border-slate-800 bg-[#090D16] flex flex-col shrink-0 transition-all duration-300 z-10 ${
              isRightPanelOpen ? "w-80 sm:w-96" : "w-0 overflow-hidden border-l-0"
            }`}
          >
            {/* Header Inspector Title */}
            <div className="p-4 border-b border-slate-800 bg-[#070A10] flex items-center justify-between font-mono-tech text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-bold text-white uppercase">Incident Telemetry HUD</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
                {activeIssue.id}
              </span>
            </div>

            {/* Scrollable Telemetry Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono-tech text-xs">
              
              {/* Defect Image Preview with YOLOv9 Overlay */}
              {activeIssue.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/50 shadow-xl bg-black">
                  <img
                    src={activeIssue.imageUrl}
                    alt="Defect Telemetry"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 border border-cyan-400 text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>YOLOv9-CivicNet: 96.8%</span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-slate-300">
                    <span>GPS: {activeIssue.latitude?.toFixed(4)}, {activeIssue.longitude?.toFixed(4)}</span>
                    <span className="text-cyan-400 font-bold">Inference: 142ms</span>
                  </div>
                </div>
              )}

              {/* Title & Classification */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeIssue.priority === "P1"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : activeIssue.priority === "P2"
                        ? "bg-orange-950 text-orange-300 border border-orange-800"
                        : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                    }`}
                  >
                    {activeIssue.priorityLabel || activeIssue.priority}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                    Status: {activeIssue.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-sans leading-snug">
                  {activeIssue.title}
                </h3>
              </div>

              {/* SLA Real-Time Clock & Progress */}
              <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA Target Clock</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {activeIssue.slaHours ? `${activeIssue.slaHours}h Max` : "4h Target"}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[65%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Elapsed: 1h 15m</span>
                  <span className="text-cyan-300 font-bold">65% SLA Window Remaining</span>
                </div>
              </div>

              {/* Location & Ward Info */}
              <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">{activeIssue.address || "Main Infrastructure Corridor"}</div>
                    <div className="text-[11px] text-slate-400">{activeIssue.ward || "Ward Zone 4"}</div>
                  </div>
                </div>
              </div>

              {/* Quick Action Commands */}
              <div className="space-y-2 pt-1">
                {isPrivileged && (
                  <>
                    <div className="text-[11px] text-slate-400 uppercase font-bold">Field Dispatch & Workflow</div>

                    <button
                      onClick={(e) => handleStatusUpdate(activeIssue.id, "In Progress", e)}
                      className="w-full py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 hover:bg-cyan-900 text-cyan-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Plane className="w-3.5 h-3.5 text-cyan-400" />
                      <span>🚀 Dispatch UAV</span>
                    </button>

                    <button
                      onClick={(e) => handleStatusUpdate(activeIssue.id, "Resolved", e)}
                      className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 hover:bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✅ Mark Defect Resolved</span>
                    </button>

                    {/* Delete / Dismiss Incident Log with Reason & Citizen Notification */}
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-rose-950/70 border border-rose-500/70 hover:bg-rose-900/80 text-rose-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs shadow-md active:scale-95"
                      title="Permanently close / delete incident log and dispatch resolution notice to citizen"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>🗑️ Delete this log</span>
                    </button>

                    <button
                      onClick={() => setIsDisasterModalOpen(true)}
                      className="w-full py-2 rounded-xl bg-red-950/80 border border-red-500/80 hover:bg-red-900 text-red-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>🚨 Level 5 Warning Broadcast</span>
                    </button>

                    {/* Nearby CCTV Optical Feed Redirect */}
                    <button
                      onClick={() => {
                        localStorage.setItem("cctvTargetWard", activeIssue?.ward || "Sector 62");
                        setActivePage("cctv");
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/80 hover:bg-indigo-900 text-indigo-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs shadow-md active:scale-95"
                      title="Inspect live optical CCTV camera feeds covering this zone"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>📹 Check Nearby CCTV</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => openIncidentDetails(activeIssue)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold uppercase cyan-glow-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Full Incident Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Citizen Actions: Feedback and Upvote */}
              <div className="pt-2 space-y-2">
                {/* Citizen Ground Resolution & Status Feedback */}
                {!isPrivileged && (
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-amber-950/70 border border-amber-500/80 hover:bg-amber-900/70 text-amber-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs shadow-sm"
                  >
                    <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                    <span>
                      {activeIssue.status === "Resolved"
                        ? "⭐ Rate Resolution & Verify Work"
                        : "💬 Submit Ground Status Feedback"}
                    </span>
                  </button>
                )}

                {/* Citizen Upvote Button - Only for Citizens */}
                {!isPrivileged && (
                  <button
                    onClick={(e) => handleUpvote(activeIssue.id, e)}
                    className="w-full py-2 rounded-xl bg-[#0E131F] border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Citizen Upvote & Verification ({activeIssue.upvotes || 0})</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Citizen Community Feedback Modal */}
      {isFeedbackModalOpen && (
        <CitizenFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          incident={activeIssue}
          user={user}
          onFeedbackSubmitted={(updated) => {
            setSelectedIssue(updated);
            setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          }}
        />
      )}

      {/* Level 5 Early Warning Command Center Modal */}
      <DisasterBroadcastModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        initialIncident={activeIssue}
        user={user}
      />

      {/* Delete / Dismiss Incident Log Modal with Citizen Resolution Broadcast */}
      {isDeleteModalOpen && (
        <DeleteIncidentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          incident={activeIssue}
          user={user}
          onDeleted={(deletedId) => {
            const remaining = issues.filter((i) => i.id !== deletedId);
            setIssues(remaining);
            setSelectedIssue(remaining[0] || null);
          }}
        />
      )}

      {/* Municipal Officer Override Permission Modal for In Progress tasks */}
      {officerOverrideTarget && (
        <OfficerOverrideModal
          isOpen={Boolean(officerOverrideTarget)}
          onClose={() => setOfficerOverrideTarget(null)}
          incident={officerOverrideTarget.incident}
          targetStatus={officerOverrideTarget.targetStatus}
          onConfirmOverride={handleConfirmOfficerOverride}
        />
      )}

    </div>
  );
}
