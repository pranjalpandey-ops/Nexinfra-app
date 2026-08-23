import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Video,
  RefreshCw,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ThumbsUp,
  Building,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Trash2,
  MessageSquareHeart,
  Star,
  BellRing,
  Timer,
  Check,
  Radio,
  FileCheck
} from "lucide-react";

import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { deleteComplaint } from "../services/deleteComplaint";
import { upvoteIssue, getLocalCivicIssues } from "../services/civicDb";
import DisasterBroadcastModal from "../components/DisasterBroadcastModal";
import CitizenFeedbackModal from "../components/CitizenFeedbackModal";
import DeleteIncidentModal from "../components/DeleteIncidentModal";
import OfficerOverrideModal from "../components/OfficerOverrideModal";
import CitizenEscalationModal from "../components/CitizenEscalationModal";

// Helper to calculate reported time, elapsed duration, and SLA delays for citizens
function calculateCitizenTimeMetrics(complaint) {
  let reportedDate = null;
  if (complaint.createdAt) {
    if (complaint.createdAt.seconds) {
      reportedDate = new Date(complaint.createdAt.seconds * 1000);
    } else {
      reportedDate = new Date(complaint.createdAt);
    }
  } else {
    // Default fallback: 4.5 hours ago
    reportedDate = new Date(Date.now() - 4.5 * 3600 * 1000);
  }

  const now = Date.now();
  const elapsedMs = Math.max(0, now - reportedDate.getTime());
  const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
  const elapsedHours = Math.floor(elapsedMins / 60);
  const remainingMins = elapsedMins % 60;

  const formattedElapsed =
    elapsedHours >= 24
      ? `${Math.floor(elapsedHours / 24)}d ${elapsedHours % 24}h passed`
      : elapsedHours > 0
      ? `${elapsedHours}h ${remainingMins}m passed`
      : `${elapsedMins}m passed`;

  const formattedReportedAt = reportedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const slaHours = complaint.slaHours || 4;
  const slaTotalMins = slaHours * 60;
  const isOverdue = elapsedMins > slaTotalMins && complaint.status !== "Resolved" && complaint.status !== "Closed";
  const delayMins = isOverdue ? elapsedMins - slaTotalMins : 0;
  const delayHours = Math.floor(delayMins / 60);
  const delayRemainingMins = delayMins % 60;
  
  const formattedDelay =
    delayHours >= 24
      ? `${Math.floor(delayHours / 24)}d ${delayHours % 24}h`
      : delayHours > 0
      ? `${delayHours}h ${delayRemainingMins}m`
      : `${delayMins}m`;

  return {
    reportedDate,
    formattedReportedAt,
    formattedElapsed,
    elapsedMins,
    slaHours,
    isOverdue,
    formattedDelay
  };
}

export default function IncidentDetailView({
  setActivePage,
  viewMode = "auto",
  user,
}) {
  const isAdmin = user?.role === "admin";
  const isOfficer = user?.role === "officer";
  const isPrivileged = isAdmin || isOfficer;

  const [isScanning, setIsScanning] = useState(false);
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [officerOverrideTarget, setOfficerOverrideTarget] = useState(null);

  const [complaint, setComplaint] = useState({
    id: "CIVIC-892A",
    title: "Critical Pothole & Road Cave-in",
    category: "Road Damage / Pothole",
    description: "Deep structural road crater exceeding 15cm depth near school crosswalk causing severe vehicle damage and traffic bottleneck.",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    status: "AI Verified",
    address: "Intersection Sector 62 & Ring Road Expressway",
    ward: "Central District - Ward 4",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    createdBy: "citizen.demo@nexinfra.org",
    createdAt: null,
    latitude: 28.6139,
    longitude: 77.2090,
    aiVerified: true,
    aiConfidence: 0.964,
    defectTags: ["Structural Pothole", "Asphalt Rupture", "Tire Hazard"],
    boundingBoxes: [
      { label: "Pothole Breach (0.96)", x: 22, y: 30, w: 56, h: 48, severity: "Critical" }
    ],
    estimatedDimensions: "1.9m x 1.3m (Depth: 16cm)",
    assignedDepartment: "Municipal Public Works Department",
    slaHours: 12,
    upvotes: 24,
    reportCount: 5,
  });

  const timeMetrics = calculateCitizenTimeMetrics(complaint);

  useEffect(() => {
    const saved = localStorage.getItem("selectedComplaint");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setComplaint((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleUpvote = () => {
    const updated = upvoteIssue(complaint.id, user?.email || "citizen.demo@nexinfra.org");
    const current = updated.find((i) => i.id === complaint.id);
    if (current) {
      setComplaint(current);
      localStorage.setItem("selectedComplaint", JSON.stringify(current));
    }
  };

  const handleRescan = () => {
    if (!isAdmin) {
      alert("Drone re-scan is reserved for Tactical Administrators.");
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("AI Drone Re-Scan Completed: Telemetry & Spatial Mesh updated with 98.2% confidence.");
    }, 2000);
  };

  const changeStatus = async (newStatus) => {
    if (!isAdmin && !isOfficer) {
      alert("Only Command Administrators & Municipal Officers can change incident resolution states.");
      return;
    }
    if (!complaint.id) return;

    const isCurrentInProgress = (complaint.status || "").toLowerCase() === "in progress";
    if (isCurrentInProgress && !isOfficer && isAdmin && newStatus !== "In Progress") {
      setOfficerOverrideTarget({ incident: complaint, targetStatus: newStatus });
      return;
    }

    const result = await updateComplaintStatus(complaint.id, newStatus);

    if (result.success) {
      const updated = {
        ...complaint,
        status: newStatus,
      };

      setComplaint(updated);
      localStorage.setItem("selectedComplaint", JSON.stringify(updated));
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
  };

  const handleConfirmOfficerOverride = async ({ incidentId, targetStatus }) => {
    const result = await updateComplaintStatus(incidentId, targetStatus);
    if (result.success) {
      const updated = {
        ...complaint,
        status: targetStatus,
      };
      setComplaint(updated);
      localStorage.setItem("selectedComplaint", JSON.stringify(updated));
    }
    setOfficerOverrideTarget(null);
  };

  const isPhoneFrame = viewMode === "phone";

  const normalizeStepIndex = (statusStr) => {
    const s = (statusStr || "").toLowerCase();
    if (s === "submitted" || s === "reported" || s === "new") return 0;
    if (s.includes("ai") || s.includes("verified")) return 1;
    if (s.includes("progress") || s.includes("dispatched") || s.includes("work")) return 2;
    if (s.includes("resolved") || s.includes("closed")) return 3;
    return 0;
  };

  const stepKeys = ["Reported", "AI Verified", "In Progress", "Resolved"];
  const currentStepIndex = normalizeStepIndex(complaint.status);

  const statusSteps = [
    {
      step: "01",
      title: "Reported",
      desc: timeMetrics.formattedReportedAt,
      timing: timeMetrics.formattedElapsed,
      badge: "LOGGED"
    },
    {
      step: "02",
      title: "AI Verified",
      desc: complaint.aiVerified ? "Autonomous Vision Triage" : "Pending AI Inspection",
      timing: complaint.aiVerified ? "Verified in 1m 45s" : "In AI Queue",
      badge: `${(complaint.aiConfidence ? complaint.aiConfidence * 100 : 96.4).toFixed(1)}% Conf.`
    },
    {
      step: "03",
      title: "In Progress",
      desc: complaint.assignedDepartment || "Ground Engineering Unit",
      timing: `SLA Target: ${timeMetrics.slaHours}.0h`,
      badge: currentStepIndex === 2 ? "ON WORK" : currentStepIndex > 2 ? "COMPLETED" : "STANDBY"
    },
    {
      step: "04",
      title: "Resolved",
      desc: currentStepIndex === 3 ? "Restored & Audit Passed" : "Pending Quality Signoff",
      timing: currentStepIndex === 3 ? "Completed" : timeMetrics.isOverdue ? "Overdue" : "Pending",
      badge: currentStepIndex === 3 ? "RESOLVED" : "PENDING"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#070A10] text-slate-100 flex justify-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans pb-24">
      
      {/* Outer Cohesive Dark Container - Dynamically extends to contain all content */}
      <div
        className={`w-full h-fit ${
          isPhoneFrame
            ? "max-w-md bg-[#0B0F19] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6"
            : "max-w-5xl bg-[#0B0F19] border border-slate-800/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_0_60px_rgba(0,0,0,0.7)] space-y-7"
        }`}
      >
        
        {/* 1. Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <button
            onClick={() => setActivePage("citysync-map")}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-mono-tech text-xs uppercase cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to City Radar Map</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono-tech uppercase flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                  : isOfficer
                  ? "bg-amber-950 border border-amber-500 text-amber-300"
                  : "bg-emerald-950 border border-emerald-500 text-emerald-300"
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : isOfficer ? <Building className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{isAdmin ? "Executive Inspector" : isOfficer ? "Municipal Officer Desk" : "Citizen Tracking View"}</span>
            </span>
          </div>
        </div>

        {/* 2. Header Title & Top Badges */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/60 text-xs font-mono-tech font-bold">
                  {complaint.id || "CIVIC-TICKET"}
                </span>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-bold font-mono-tech ${
                    complaint.priority === "P1" || complaint.priority === "High"
                      ? "bg-red-950 text-red-300 border border-red-800"
                      : complaint.priority === "P2" || complaint.priority === "Medium"
                      ? "bg-orange-950 text-orange-300 border border-orange-800"
                      : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                  }`}
                >
                  {complaint.priorityLabel || complaint.priority || "P1 - Critical"}
                </span>

                {complaint.aiVerified && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono-tech text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Verified ({(complaint.aiConfidence ? complaint.aiConfidence * 100 : 96.4).toFixed(1)}%)</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-heading tracking-tight">
                {complaint.title || complaint.category}
              </h1>
            </div>

            {/* Top Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleUpvote}
                className="px-4 py-2.5 rounded-xl bg-[#070A10] border border-cyan-500/50 hover:bg-cyan-950/60 text-cyan-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition font-mono-tech shadow-md"
              >
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>Upvote ({complaint.upvotes || 0})</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsDisasterModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] font-mono-tech active:scale-95 transition"
                >
                  <Flame className="w-4 h-4 animate-pulse" />
                  <span>🚨 Level 5 Warning</span>
                </button>
              )}

              {isPrivileged && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/70 border border-rose-500/70 hover:bg-rose-900/80 text-rose-300 font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-md font-mono-tech active:scale-95 transition"
                  title="Delete incident log and notify citizen"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete this log</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 font-bold text-xs uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50 font-mono-tech"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Scanning..." : "AI Drone Re-Scan"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono-tech pt-1">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{complaint.address || "Street Coordinates Recorded"}</span>
            </span>
            {complaint.ward && (
              <span className="text-cyan-300 font-bold">
                [{complaint.ward}]
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Target SLA: <strong className="text-cyan-300">{complaint.slaHours || 4} Hours</strong></span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Dept: {complaint.assignedDepartment || "Road Maintenance"}</span>
            </span>
          </div>
        </div>

        {/* 3. Citizen Real-Time Reported Time & SLA Overdue Card */}
        {!isPrivileged && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#070A10] border border-slate-800/90 shadow-xl space-y-4 font-mono-tech">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Incident Tracking & Time Metrics
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                timeMetrics.isOverdue
                  ? "bg-red-950/80 border border-red-500 text-red-300"
                  : "bg-emerald-950/80 border border-emerald-500 text-emerald-300"
              }`}>
                {timeMetrics.isOverdue ? `⚠️ OVERDUE BY ${timeMetrics.formattedDelay.toUpperCase()}` : "✅ WITHIN SLA WINDOW"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Time Reported</span>
                <div className="text-white font-bold text-sm">{timeMetrics.formattedReportedAt}</div>
                <div className="text-[10px] text-slate-400">Timestamp logged in civic grid</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Time Elapsed Since Report</span>
                <div className="text-amber-400 font-bold text-sm">{timeMetrics.formattedElapsed}</div>
                <div className="text-[10px] text-slate-400">Live duration counter</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Remediation SLA Target</span>
                <div className="text-cyan-400 font-bold text-sm">{timeMetrics.slaHours}.0 Hours Maximum</div>
                <div className="text-[10px] text-slate-400 truncate">{complaint.assignedDepartment || "Municipal Division"}</div>
              </div>
            </div>

            {/* Excessive Delay Notice & Escalation Action Row */}
            {timeMetrics.isOverdue && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-amber-300 font-bold text-sm">Resolution Taking Too Much Time?</div>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      This defect has exceeded standard turnaround SLA by {timeMetrics.formattedDelay}. You can report an escalation directly to municipal engineering heads.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEscalationModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition shrink-0"
                >
                  <BellRing className="w-3.5 h-3.5 text-black" />
                  <span>Report / Escalate Delay</span>
                </button>
              </div>
            )}

            {complaint.isEscalated && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>🚨 Priority Escalation Active: Municipal Zonal Officer & Chief Engineer notified for urgent intervention.</span>
              </div>
            )}
          </div>
        )}

        {/* 4. Resolution Workflow Timeline & Stage Timings */}
        <div className="bg-[#070A10] border border-slate-800/90 rounded-2xl p-5 sm:p-6 font-mono-tech shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resolution Workflow Timeline & Stage Timings</span>
            </h3>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-500/50 px-2.5 py-0.5 rounded">
              Current Stage: {stepKeys[currentStepIndex]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusSteps.map((stepObj, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={stepObj.step}
                  className={`p-4 rounded-xl border flex flex-col justify-between min-h-[148px] gap-3 transition ${
                    isCurrent
                      ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : isPastOrCurrent
                      ? "bg-emerald-950/30 border-emerald-600/50 text-emerald-400"
                      : "bg-[#0B0F19] border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">STEP {stepObj.step}</span>
                      {isPastOrCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </div>
                    <span className="font-bold text-sm text-white block">{stepObj.title}</span>
                    <span className="text-[11px] text-slate-400 block line-clamp-1 leading-snug">
                      {stepObj.desc}
                    </span>
                  </div>

                  {/* Stage Timing & Badge Footer */}
                  <div className="pt-2.5 border-t border-slate-800/90 flex items-center justify-between text-[11px] mt-auto">
                    <span className={isCurrent ? "text-amber-300 font-bold" : "text-slate-400"}>
                      {stepObj.timing}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#070A10] border border-slate-800 text-slate-300 text-[10px] font-bold">
                      {stepObj.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Lower Content & Telemetry Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono-tech text-xs">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Defect Description */}
            <div className="bg-[#070A10] border border-slate-800/90 rounded-2xl p-6 space-y-3 font-sans shadow-lg">
              <h3 className="font-bold text-white text-base font-heading">Defect Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {complaint.description || "No detailed description supplied."}
              </p>
            </div>

            {/* Neural Geometric Telemetry */}
            {complaint.estimatedDimensions && (
              <div className="bg-[#070A10] border border-cyan-500/30 rounded-2xl p-5 space-y-2 shadow-lg font-mono-tech">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>AI Structural Dimensions & Geometry</span>
                </div>
                <div className="text-slate-200 text-xs">
                  {complaint.estimatedDimensions}
                </div>
              </div>
            )}

            {/* Admin Override Controls */}
            {isAdmin ? (
              <div className="bg-[#070A10] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-lg font-mono-tech">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase">
                    Admin Workflow Override
                  </h3>
                  <span className="text-xs text-cyan-400 font-bold">EXECUTIVE AUTHORITY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stepKeys.map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => changeStatus(statusOption)}
                      className={`py-2.5 px-3 rounded-lg border font-bold transition cursor-pointer ${
                        complaint.status === statusOption
                          ? "bg-cyan-400 text-black border-cyan-400 font-extrabold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>

                {complaint.status === "Resolved" && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to PERMANENTLY DELETE resolved ticket ${complaint.id}?`)) {
                          await deleteComplaint(complaint.id);
                          alert(`Ticket ${complaint.id} successfully deleted from records.`);
                          setActivePage("dashboard");
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>🗑️ Delete Resolved Problem Record</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Citizen Ground Resolution Feedback Card */}
                <div className="bg-[#070A10] border border-amber-500/40 rounded-2xl p-5 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-mono-tech">
                      <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                      <span>Citizen Ground Verification</span>
                    </div>
                    {complaint.feedbackScore && (
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/50">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{complaint.feedbackScore} / 5.0</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {complaint.status === "Resolved"
                      ? "Have you inspected this location? Rate the repair quality and confirm if the road or service is fully restored."
                      : "Provide a real-time status update from the ground to assist municipal dispatch teams."}
                  </p>

                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition font-mono-tech"
                  >
                    <MessageSquareHeart className="w-4 h-4 text-black" />
                    <span>Submit Ground Status Feedback</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800/80 text-[11px] text-slate-400 font-mono-tech">
                  ℹ Citizen Notice: Updates made by the municipal repair unit will synchronize with this timeline in real-time.
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#070A10] border border-slate-800/90 rounded-2xl p-5 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono-tech">Optical Site Visual Telemetry</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 text-[10px] font-bold font-mono-tech">
                  AI Bounding Active
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />

                {/* AI Detection Bounding Box Overlay */}
                <div
                  className="absolute border-2 border-cyan-400 bg-cyan-400/10 pointer-events-none rounded"
                  style={{
                    left: "20%",
                    top: "22%",
                    width: "58%",
                    height: "50%",
                    boxShadow: "0 0 15px rgba(0,240,255,0.4)"
                  }}
                >
                  <div className="absolute -top-7 left-0 bg-cyan-950/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500 flex items-center gap-1 whitespace-nowrap">
                    <span>[AI DETECTION]: {complaint.category} ({(complaint.aiConfidence ? complaint.aiConfidence * 100 : 96.4).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Neural Tags */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-mono-tech">Neural Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(complaint.defectTags || ["Pothole Defect", "Asphalt Breach"]).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[10px] font-mono-tech"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Citizen Ground Resolution Feedback Rating Modal */}
      {isFeedbackModalOpen && (
        <CitizenFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          incident={complaint}
          user={user}
          onFeedbackSubmitted={(updated) => {
            setComplaint(updated);
            localStorage.setItem("selectedComplaint", JSON.stringify(updated));
          }}
        />
      )}

      {/* Disaster Early Warning Broadcast Modal */}
      <DisasterBroadcastModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        initialIncident={complaint}
        user={user}
      />

      {/* Delete / Dismiss Incident Log Modal with Citizen Resolution Broadcast */}
      {isDeleteModalOpen && (
        <DeleteIncidentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          incident={complaint}
          user={user}
          onDeleted={() => {
            setActivePage("citysync-map");
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

      {/* Citizen Delay Escalation Modal */}
      {isEscalationModalOpen && (
        <CitizenEscalationModal
          isOpen={isEscalationModalOpen}
          onClose={() => setIsEscalationModalOpen(false)}
          incident={complaint}
          user={user}
          elapsedFormatted={timeMetrics.formattedElapsed}
          onEscalated={(data) => {
            setComplaint((prev) => ({ ...prev, isEscalated: true, escalationData: data }));
          }}
        />
      )}

    </div>
  );
}
